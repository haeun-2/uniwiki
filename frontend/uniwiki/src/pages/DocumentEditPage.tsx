// src/pages/DocumentEditPage.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import MDEditor, { ICommand, TextAreaTextApi, TextState } from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

const API_BASE = 'https://k13d104.p.ssafy.io/api';
const PRESIGN_API = `${API_BASE}/v1/s3/presigned-urls`;
const REFRESH_URL = `${API_BASE}/v1/auth/refresh`;

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
function setAccessToken(t: string) { try { localStorage.setItem('accessToken', t); } catch {} }
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
  const first = await fetch(input, { ...init, headers: authHeaders(init.headers || {}) });
  if (first.status !== 401) return first;
  const newTok = await refreshAccessToken();
  if (!newTok) return first;
  return fetch(input, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${newTok}` } });
}
/** ===================================================== */

/** ===================== 차단 유틸(공통) ===================== */
function looksBanned(status: number, bodyText: string): boolean {
  if (status === 403 && /USER_BANNED|banned|차단/i.test(bodyText || '')) return true;
  try {
    const j = JSON.parse(bodyText || '{}');
    const code = String(j?.code || j?.error || '').toUpperCase();
    const msg  = String(j?.message || '');
    if (code.includes('USER_BANNED')) return true;
    if (/차단/i.test(msg)) return true;
  } catch {}
  return false;
}
/** ===================================================== */

/** ===================== 레일 토글 도우미 ===================== */
// 접힘 상태 저장 키(생성/편집 공유)
const RAIL_KEY = 'uniwiki.railCollapsed';
const loadRailCollapsed = () => { try { return localStorage.getItem(RAIL_KEY) === '1'; } catch { return false; } };
const saveRailCollapsed = (v: boolean) => { try { localStorage.setItem(RAIL_KEY, v ? '1' : '0'); } catch {} };

type Snap = { grid?: string; content?: string; aside?: string };
let SNAPSHOT: Snap = {};

function getLayoutEls() {
  const grid = document.querySelector('main .grid') as HTMLElement | null;
  const content = grid?.children?.[0] as HTMLElement | null; // Outlet 래퍼
  const aside = grid?.querySelector('aside') as HTMLElement | null;
  return { grid, content, aside };
}
function takeSnapshotOnce() {
  const { grid, content, aside } = getLayoutEls();
  if (!grid || !content) return;
  if (!SNAPSHOT.grid) SNAPSHOT.grid = grid.className;
  if (!SNAPSHOT.content) SNAPSHOT.content = content.className;
  if (!SNAPSHOT.aside && aside) SNAPSHOT.aside = aside.className;
}
function collapseLayout() {
  const { grid, content, aside } = getLayoutEls();
  if (!grid || !content) return;
  takeSnapshotOnce();
  grid.classList.remove('lg:grid-cols-3');
  grid.classList.add('lg:grid-cols-1');
  content.classList.remove('lg:col-span-2');
  if (aside) {
    aside.classList.add('hidden');
    aside.classList.remove('lg:block');
  }
}
function restoreLayout() {
  const { grid, content, aside } = getLayoutEls();
  if (!grid || !content) return;
  if (SNAPSHOT.grid) grid.className = SNAPSHOT.grid;
  if (SNAPSHOT.content) content.className = SNAPSHOT.content;
  if (aside) {
    if (SNAPSHOT.aside) aside.className = SNAPSHOT.aside;
    else {
      aside.classList.remove('hidden');
      if (!aside.classList.contains('lg:block')) aside.classList.add('lg:block');
    }
  }
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

// 카테고리(라디오)
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
  const txt = await r.clone().text().catch(() => '');
  if (looksBanned(r.status, txt)) {
    throw Object.assign(new Error('E_BANNED'), { code: 403, raw: txt });
  }
  if (r.status === 401) throw Object.assign(new Error('E401'), { code: 401 });
  if (r.status === 403) throw Object.assign(new Error(`E403:${txt || ''}`), { code: 403 });
  if (!r.ok) throw new Error(txt || 'presigned URL 발급 실패');
  const j = JSON.parse(txt || '{}');
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
    } catch {}
  }
  try {
    const t = (await res.text()).trim();
    if (t) return t.replace(/^"+|"+$/g, '');
  } catch {}
  return fallbackTitle;
}

export default function DocumentEditPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { documentTitle = '문서 제목' } = useParams();
  const enc = (s: string) => encodeURIComponent(s || '');

  const [universityName, setUniversityName] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');

  const [status, setStatus] = useState<Status>('loading');
  const [apiError, setApiError] = useState<string | null>(null);

  const [value, setValue] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [agree, setAgree] = useState<boolean>(true);

  const [docId, setDocId] = useState<number | null>(null);
  const [baseVersionNumber, setBaseVersionNumber] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  // 레일 접힘 상태 (이 페이지 전용)
  const [railCollapsed, setRailCollapsed] = useState<boolean>(loadRailCollapsed());

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

  // ===== 차단 사용자 접근 차단: 마운트 즉시 검사 → 뷰로 리다이렉트 + 플래시 =====
  const safeViewHref = `/univ/${enc(universityName || '대학교')}/docs/${enc(documentTitle)}`;
  useEffect(() => {
    (async () => {
      const tok = getAccessToken();
      if (!tok) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      try {
        const r = await fetch(`${API_BASE}/v1/users/me`, {
          method: 'GET',
          headers: authHeaders({ Accept: 'application/json' }),
          credentials: 'include',
        });
        const txt = await r.clone().text().catch(() => '');
        if (r.status === 401) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }
        if (looksBanned(r.status, txt)) {
          navigate(safeViewHref, {
            replace: true,
            state: { flash: { msg: '차단된 사용자입니다.' } },
          });
          return;
        }
      } catch {
        // 네트워크 오류 시에는 이후 API에서 다시 걸러짐
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        const txt = await r.clone().text().catch(() => '');

        if (r.status === 401) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }
        // 서버가 차단을 403으로 알릴 경우: 즉시 뷰로 되돌리며 플래시
        if (looksBanned(r.status, txt)) {
          navigate(safeViewHref, {
            replace: true,
            state: { flash: { msg: '차단된 사용자입니다.' } },
          });
          return;
        }
        if (r.status === 403) {
          setStatus('error');
          setApiError(txt || '편집 권한이 없습니다.');
          return;
        }
        if (r.status === 404) {
          setStatus('notfound');
          setValue('');
          initialRef.current = { value: '', summary: '', categoryId: null };
          return;
        }
        if (!r.ok) throw new Error('문서를 불러오는 중 오류가 발생했습니다.');

        // JSON은 이미 clone했으므로 다시 파싱
        const data: DocumentDto = JSON.parse(txt || '{}');
        setValue(data.documentContent || '');
        setDocId(data.documentId);
        setBaseVersionNumber(data.versionNumber);
        setCategoryId(data.categoryId);
        setCategoryName(data.categoryName || '');
        setUniversityName(data.universityName || '');

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentTitle]);

  /* ---------- 레일 토글 적용/복원 ---------- */
  useEffect(() => {
    takeSnapshotOnce();
    if (railCollapsed) collapseLayout(); else restoreLayout();
    return () => {
      restoreLayout();
      SNAPSHOT = {};
    };
  }, [railCollapsed]);

  useEffect(() => {
    saveRailCollapsed(railCollapsed);
  }, [railCollapsed]);

  /* ---------- 붙여넣기/드롭 업로드 ---------- */
  async function handleFiles(files: FileList | null, appendAtEnd = true) {
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter(isImage);
    if (images.length === 0) return;

    const big = images.find(overLimit);
    if (big) { alert(`이미지 용량이 큽니다. 최대 ${MAX_IMAGE_MB}MB까지 허용됩니다.`); return; }

    try {
      setBusy(true);
      const urls = await Promise.all(images.map(uploadToS3ViaPresign));
      const md = urls.map((u, i) => `![image${i + 1}](${u})`).join('\n');
      setValue((prev) => (appendAtEnd ? `${prev.trimEnd()}\n\n${md}\n` : `${md}\n${prev}`));
    } catch (e: any) {
      const msg = String(e?.message || '');
      if (msg === 'E_BANNED') {
        navigate(safeViewHref, {
          replace: true,
          state: { flash: { msg: '차단된 사용자입니다.' } },
        });
        return;
      }
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
        if (file && overLimit(file)) { alert(`이미지 용량이 큽니다. 최대 ${MAX_IMAGE_MB}MB까지 허용됩니다.`); return; }
        try {
          setBusy(true);
          const url = await uploadToS3ViaPresign(file!);
          api.replaceSelection(`![${file!.name}](${url} "${file!.name}")`);
        } catch (e: any) {
          const msg = String(e?.message || '');
          if (msg === 'E_BANNED') {
            navigate(safeViewHref, {
              replace: true,
              state: { flash: { msg: '차단된 사용자입니다.' } },
            });
            return;
          }
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

  /* ---------- 저장 ---------- */
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
        baseVersionNumber: baseVersionNumber!,
        categoryId: categoryId!,
        documentContent: value,
        editMemo: summary,
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

      const txt = await res.clone().text().catch(() => '');

      if (res.status === 401) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }
      // 저장 시 차단
      if (looksBanned(res.status, txt)) {
        navigate(safeViewHref, {
          replace: true,
          state: { flash: { msg: '차단된 사용자입니다.' } },
        });
        return;
      }
      if (res.status === 403) {
        alert(txt || '편집 권한이 없습니다.');
        return;
      }
      if (!res.ok) {
        const t = txt;
        throw new Error(t || '문서 저장 실패');
      }

      const nextTitle = await getSavedTitleFromResponse(res, documentTitle);
      const univ = universityName || '대학교';

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

  // 취소/문서보기 경로
  const docHref = `/univ/${enc(universityName || '대학교')}/docs/${enc(documentTitle)}`;

  return (
    <div className="bg-white">
      {/* 상단: 브레드크럼 + 레일 토글 */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-3">
        <div className="flex items-center justify-between">
          <nav className="mb-2 text-[18px] leading-tight" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1">
              <li>
                <Link to={`/univ/${enc(universityName || '대학교')}`} className="text-[#2C80A0] hover:underline">
                  {universityName || '대학교'}
                </Link>
              </li>
            </ol>
          </nav>
          <button
            onClick={() => setRailCollapsed((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            aria-pressed={railCollapsed}
            aria-label={railCollapsed ? '우측 레일 펼치기' : '우측 레일 접기'}
            title={railCollapsed ? '우측 레일 펼치기' : '우측 레일 접기'}
          >
            {railCollapsed ? (
              <>
                <ChevronsRight size={16} />
                <span className="hidden sm:inline">펼치기</span>
              </>
            ) : (
              <>
                <ChevronsLeft size={16} />
                <span className="hidden sm:inline">접기</span>
              </>
            )}
          </button>
        </div>
      </div>

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

          {/* 카테고리(라디오) */}
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
