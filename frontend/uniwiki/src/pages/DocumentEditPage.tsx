// src/pages/DocumentEditPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import MDEditor, { ICommand, TextAreaTextApi, TextState } from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

const API_BASE = 'http://k13d104.p.ssafy.io/api';
const PRESIGN_API = `${API_BASE}/v1/s3/presigned-urls`;
const REFRESH_URL = `${API_BASE}/v1/auth/refresh`; // 실제 경로 다르면 수정

/** ===================== Auth utils ===================== */
function decodeJwtPayload(token: string): any | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getAccessToken(): string {
  try {
    const t = localStorage.getItem('accessToken');
    if (!t) return '';
    const payload = decodeJwtPayload(t);
    if (payload && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (now >= payload.exp) {
        localStorage.removeItem('accessToken');
        return '';
      }
    }
    return t;
  } catch {
    return '';
  }
}

function setAccessToken(t: string) {
  try { localStorage.setItem('accessToken', t); } catch {}
}

function authHeaders(extra: HeadersInit = {}) {
  const token = getAccessToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

// 401 → refresh 1회 후 재시도
async function refreshAccessToken(): Promise<string | null> {
  try {
    const r = await fetch(REFRESH_URL, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) return null;
    const j = await r.json().catch(() => ({}));
    const t = j?.accessToken || j?.token;
    if (!t) return null;
    setAccessToken(t);
    return t;
  } catch {
    return null;
  }
}

async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const first = await fetch(input, {
    ...init,
    headers: authHeaders(init.headers || {}),
  });
  if (first.status !== 401) return first;

  const newTok = await refreshAccessToken();
  if (!newTok) return first;

  return fetch(input, {
    ...init,
    headers: { ...(init.headers || {}), Authorization: `Bearer ${newTok}` },
  });
}
/** ===================================================== */

type Status = 'loading' | 'ok' | 'notfound' | 'error';

type DocumentDto = {
  universityId: number;
  universityName: string;
  categoryId: number;
  categoryName: string;
  documentId: number;
  versionNumber: number;
  documentTitle: string;
  documentContent: string;
  updatedAt: string;
};

// ✅ 카테고리 하드코딩
const CATEGORY_OPTIONS = [
  { id: 1, name: '학교' },
  { id: 2, name: '학과' },
  { id: 3, name: '강의' },
  { id: 4, name: '시설' },
  { id: 5, name: '행사' },
  { id: 6, name: '기타' },
] as const;

const MAX_IMAGE_MB = 10;
const isImage = (f?: File | null) => !!f && f.type.startsWith('image/');
const overLimit = (f: File) => f.size > MAX_IMAGE_MB * 1024 * 1024;

/* ---------- S3 Presign 발급/업로드 ---------- */
async function getPresignedUrl(): Promise<string> {
  const r = await fetchWithAuth(PRESIGN_API, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });

  if (r.status === 401) throw Object.assign(new Error('E401'), { code: 401 });
  if (r.status === 403) {
    const msg = await r.text().catch(() => '');
    throw Object.assign(new Error(`E403:${msg || ''}`), { code: 403 });
  }
  if (!r.ok) throw new Error((await r.text().catch(() => '')) || 'presigned URL 발급 실패');

  const j = await r.json();
  if (!j?.presignedUrl) throw new Error('presignedUrl 없음');
  return j.presignedUrl as string;
}

async function uploadToS3ViaPresign(file: File): Promise<string> {
  const presignedUrl = await getPresignedUrl();
  const fileUrl = presignedUrl.split('?')[0];

  let put = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!put.ok) put = await fetch(presignedUrl, { method: 'PUT', body: file });
  if (!put.ok) throw new Error((await put.text().catch(() => '')) || 'S3 업로드 실패');

  return fileUrl;
}

/* ---------- 저장 응답 파싱(JSON / text / 204) ---------- */
async function getSavedTitleFromResponse(res: Response, fallbackTitle: string) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      const j: any = await res.json();
      const v = (j?.documentTitle || j?.title || '').toString().trim();
      if (v) return v;
    } catch { /* ignore */ }
  }
  try {
    const t = (await res.text()).trim();
    if (t) return t.replace(/^"+|"+$/g, '');
  } catch { /* ignore */ }
  return fallbackTitle;
}

export default function DocumentEditPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { documentTitle = '문서 제목' } = useParams();

  const enc = (s: string) => encodeURIComponent(s || '');
  const [universityName, setUniversityName] = useState<string>(''); // ✅ univ 경로에 필요
  const [categoryName, setCategoryName] = useState<string>('');     // 표시용 유지

  // 상태
  const [status, setStatus] = useState<Status>('loading');
  const [apiError, setApiError] = useState<string | null>(null);

  // 편집값
  const [value, setValue] = useState<string>('');
  const [summary, setSummary] = useState<string>(''); // editMemo
  const [agree, setAgree] = useState<boolean>(true);

  // 메타(저장에 필요)
  const [docId, setDocId] = useState<number | null>(null);
  const [baseVersionNumber, setBaseVersionNumber] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // 진행 상태
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  // 변경 여부(카테고리 포함)
  const initialRef = useRef<{ value: string; summary: string; categoryId: number | null }>({
    value: '',
    summary: '',
    categoryId: null,
  });
  const isDirty = useMemo(() => {
    const i = initialRef.current;
    return value !== i.value || summary !== i.summary || categoryId !== i.categoryId;
  }, [value, summary, categoryId]);

  const canSave =
    agree && isDirty && !busy && !saving &&
    docId !== null && baseVersionNumber !== null && categoryId !== null;

  // Ctrl/Cmd + S → 저장
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canSave, value, summary, agree, categoryId]);

  // sanitize 확장
  const sanitizeSchema: any = useMemo(
    () => ({
      ...defaultSchema,
      attributes: {
        ...(defaultSchema as any).attributes,
        a: [...(((defaultSchema as any).attributes?.a) || []), 'target', 'rel'],
        img: ['src', 'alt', 'title'],
      },
    }),
    []
  );

  /* ---------- 문서 로드 ---------- */
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setStatus('loading');
        setApiError(null);

        const encoded = encodeURIComponent(documentTitle);
        const r = await fetchWithAuth(`${API_BASE}/v1/documents/${encoded}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          signal: controller.signal,
          credentials: 'include',
        });

        if (r.status === 401) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }
        if (r.status === 403) {
          const msg = await r.text().catch(() => '');
          setStatus('error');
          setApiError(msg || '편집 권한이 없습니다.');
          return;
        }
        if (r.status === 404) {
          setStatus('notfound');
          setValue('');
          initialRef.current = { value: '', summary: '', categoryId: null };
          return;
        }
        if (!r.ok) throw new Error('문서를 불러오는 중 오류가 발생했습니다.');

        const data: DocumentDto = await r.json();
        setValue(data.documentContent || '');
        setDocId(data.documentId);
        setBaseVersionNumber(data.versionNumber);
        setCategoryId(data.categoryId);
        setCategoryName(data.categoryName || '');
        setUniversityName(data.universityName || ''); // ✅ univ 경로 사용

        initialRef.current = {
          value: data.documentContent || '',
          summary: '',
          categoryId: data.categoryId ?? null,
        };
        setStatus('ok');
      } catch (e: any) {
        if (controller.signal.aborted) return;
        setApiError(e?.message || '문서를 불러오는 중 오류가 발생했습니다.');
        setStatus('error');
      }
    })();
    return () => controller.abort();
  }, [documentTitle]);

  /* ---------- 붙여넣기/드롭 업로드 ---------- */
  async function handleFiles(files: FileList | null, appendAtEnd = true) {
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter(isImage);
    if (images.length === 0) return;

    const big = images.find(overLimit);
    if (big) {
      alert(`이미지 용량이 큽니다. 최대 ${MAX_IMAGE_MB}MB까지 허용됩니다.`);
      return;
    }

    try {
      setBusy(true);
      const urls = await Promise.all(images.map(uploadToS3ViaPresign));
      const md = urls.map((u, i) => `![image${i + 1}](${u})`).join('\n');
      setValue((prev) => (appendAtEnd ? `${prev.trimEnd()}\n\n${md}\n` : `${md}\n${prev}`));
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg.startsWith('E401')) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      if (msg.startsWith('E403')) {
        alert(msg.replace(/^E403:/, '') || '이미지 업로드 권한이 없습니다.');
        return;
      }
      alert(e?.message || '이미지 업로드 실패');
    } finally {
      setBusy(false);
    }
  }

  // 툴바 업로드 버튼
  const uploadImageCommand: ICommand = {
    name: 'uploadImage',
    keyCommand: 'uploadImage',
    buttonProps: { 'aria-label': '이미지 업로드' },
    icon: <span style={{ fontSize: 12, fontWeight: 700 }}>IMG</span>,
    execute: async (_state: TextState, api: TextAreaTextApi) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!isImage(file)) return;
        if (file && overLimit(file)) {
          alert(`이미지 용량이 큽니다. 최대 ${MAX_IMAGE_MB}MB까지 허용됩니다.`);
          return;
        }
        try {
          setBusy(true);
          const url = await uploadToS3ViaPresign(file!);
          api.replaceSelection(`![${file!.name}](${url} "${file!.name}")`);
        } catch (e: any) {
          const msg = String(e?.message || '');
          if (msg.startsWith('E401')) {
            navigate('/login', { replace: true, state: { from: location.pathname } });
            return;
          }
          if (msg.startsWith('E403')) {
            alert(msg.replace(/^E403:/, '') || '이미지 업로드 권한이 없습니다.');
            return;
          }
          alert(e?.message || '이미지 업로드 실패');
        } finally {
          setBusy(false);
        }
      };
      input.click();
    },
  };

  /* ---------- 저장: POST /v1/documents/{document_id} ---------- */
  const onSave = async () => {
    if (!canSave) return;

    const token = getAccessToken();
    if (!token) {
      alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    try {
      setSaving(true);
      const id = docId!;
      const body = {
        baseVersionNumber: baseVersionNumber!, // 충돌 방지
        categoryId: categoryId!,               // 선택한 카테고리
        documentContent: value,                // 본문(MD)
        editMemo: summary,                     // 편집 요약
      };

      const res = await fetchWithAuth(`${API_BASE}/v1/documents/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      if (res.status === 403) {
        const msg = await res.text().catch(() => '');
        alert(msg || '편집 권한이 없습니다.');
        return;
      }
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || '문서 저장 실패');
      }

      const nextTitle = await getSavedTitleFromResponse(res, documentTitle);
      const univ = universityName || '대학교'; // 안전장치

      // ✅ 저장 후: /univ/:univName/docs/:documentTitle 로 이동
      navigate(`/univ/${enc(univ)}/docs/${enc(nextTitle)}`, {
        state: { flash: { type: 'success', msg: '저장되었습니다.' } },
        replace: false,
      });
    } catch (e: any) {
      alert(e?.message || '문서 저장 실패');
    } finally {
      setSaving(false);
    }
  };

  // 현재 선택된 카테고리 이름(표시용)
  const selectedCatName =
    CATEGORY_OPTIONS.find((c) => c.id === categoryId)?.name || categoryName || '—';

  // ✅ 취소/문서보기 경로 (univ 하위)
  const docHref = `/univ/${enc(universityName || '대학교')}/docs/${enc(documentTitle)}`;

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 gap-6">
        {/* 좌측 메인 */}
        <div className="lg:col-span-8">
          <h1 className="text-[28px] leading-tight font-semibold text-gray-900">
            {documentTitle}{' '}
            <span className="text-gray-900 text-lg">
              ({baseVersionNumber != null ? `r${baseVersionNumber} 편집` : '편집'})
            </span>
          </h1>

          {(busy || saving) && (
            <div className="mt-2 text-sm text-gray-600" role="status" aria-live="polite">
              {busy ? '이미지 업로드 중…' : '저장 중…'}
            </div>
          )}

          {(status === 'notfound' || status === 'error') && apiError && (
            <div className="mt-3 rounded-lg bg-[#2C80A0] px-4 py-2 text-white">{apiError}</div>
          )}

          <div className="mt-4" data-color-mode="light">
            {status === 'loading' ? (
              <div className="animate-pulse rounded-lg border p-4">
                <div className="mb-3 h-6 w-1/3 rounded bg-gray-200" />
                <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                <div className="mb-2 h-4 w-11/12 rounded bg-gray-200" />
                <div className="h-4 w-10/12 rounded bg-gray-200" />
              </div>
            ) : (
              <MDEditor
                height={520}
                value={value}
                onChange={(v) => setValue(v || '')}
                preview="live"
                previewOptions={{
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [[rehypeSanitize, sanitizeSchema]],
                }}
                extraCommands={[uploadImageCommand]}
                textareaProps={{
                  placeholder:
                    '마크다운 작성. 이미지 파일을 붙여넣기/드래그앤드롭하거나 IMG 버튼으로 업로드하세요.',
                  onPaste: async (e) => {
                    const items = Array.from(e.clipboardData?.items || []);
                    const file = items.find((i) => i.kind === 'file')?.getAsFile();
                    if (isImage(file)) {
                      e.preventDefault();
                      await handleFiles({ 0: file!, length: 1, item: () => file! } as any, true);
                    }
                  },
                  onDrop: async (e) => {
                    if (e.dataTransfer?.files?.length) {
                      e.preventDefault();
                      await handleFiles(e.dataTransfer.files, true);
                    }
                  },
                }}
              />
            )}
          </div>

          {/* 카테고리(라디오 단일 선택) */}
          <div className="mt-6">
            <p className="mb-2 text-gray-900 font-medium">카테고리</p>
            <div className="flex flex-wrap gap-x-10 gap-y-2 text-[15px]">
              {CATEGORY_OPTIONS.map((opt) => (
                <label key={opt.id} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="doc-category"
                    checked={categoryId === opt.id}
                    onChange={() => setCategoryId(opt.id)}
                  />
                  {opt.name}
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              현재 선택: <span className="font-medium text-gray-800">{selectedCatName}</span>
            </p>
          </div>

          {/* 편집 요약 */}
          <div className="mt-4">
            <p className="mb-2 text-gray-900 font-medium">편집 내용 요약</p>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="편집 내용을 요약해서 적어주세요."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 라이선스 동의 */}
          <label className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1"
            />
            <span className="text-[14px] leading-relaxed text-gray-700">
              문서 편집을 저장하면 당신은 기여한 내용을 CC-BY-NC-SA 2.0 KR로 배포하고 기여한 문서에 대한
              라이선스 이용(저작자 표시, 비영리, 동일조건변경허락)에 동의하는 것입니다. 이 동의는 철회할 수 없습니다.
            </span>
          </label>

          {/* 액션 버튼 */}
          <div className="mt-5 flex justify-end gap-3">
            <Link
              to={docHref}
              className="inline-flex min-w-[104px] items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              onClick={onSave}
              disabled={!canSave}
              className="inline-flex min-w-[104px] items-center justify-center rounded-xl bg-[#2C80A0] px-5 py-2 font-medium text-white hover:bg-[#276E86] disabled:opacity-40 disabled:cursor-not-allowed"
              title={
                !agree
                  ? '라이선스 동의가 필요합니다.'
                  : !isDirty
                  ? '변경사항이 없습니다.'
                  : busy
                  ? '이미지 업로드가 끝난 뒤 저장할 수 있습니다.'
                  : saving
                  ? '저장 중입니다.'
                  : docId === null
                  ? '문서 식별자를 불러오지 못했습니다.'
                  : undefined
              }
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
