// src/pages/DocumentViewPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

import MDEditor from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

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

type Status = 'loading' | 'ok' | 'notfound' | 'error';

const API_BASE = 'http://k13d104.p.ssafy.io/api';

/** ===== Auth utils ===== */
function decodeJwtPayload(token: string): any | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch { return null; }
}
function getAccessToken() {
  try {
    const t = localStorage.getItem('accessToken') || '';
    if (!t) return '';
    const p = decodeJwtPayload(t);
    if (p?.exp && Math.floor(Date.now()/1000) >= p.exp) {
      localStorage.removeItem('accessToken');
      return '';
    }
    return t;
  } catch { return ''; }
}
function authHeaders(extra: HeadersInit = {}) {
  const token = getAccessToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}
/** ====================== */

/** 로컬에 저장된 내 대학 ID 읽기(키 다양성 허용) */
function getStoredUniId(): number | null {
  const v =
    localStorage.getItem('myUniversityId') ??
    localStorage.getItem('universityId') ??
    localStorage.getItem('universityID');
  const n = v == null ? NaN : Number(v);
  return Number.isNaN(n) ? null : n;
}

const enc = (s: string) => encodeURIComponent(s || '');

export default function DocumentViewPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { documentTitle = '문서 제목' } = useParams();
  const docTitleParam = enc(documentTitle);

  const formatKST = (d: Date) =>
    new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);

  const [status, setStatus] = useState<Status>('loading');
  const [content, setContent] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [meta, setMeta] = useState<Pick<DocumentDto, 'universityName' | 'categoryName'> | null>(null);

  const [docId, setDocId] = useState<number | null>(null);
  const [docUniId, setDocUniId] = useState<number | null>(null);

  const [favOn, setFavOn] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  const [hasTalk, setHasTalk] = useState(false);

  // 플래시 배너 (닫기만 표시)
  const [flashMsg, setFlashMsg] = useState<string | null>(() => location.state?.flash?.msg || null);
  useEffect(() => {
    if (location.state?.flash) {
      navigate(location.pathname + location.search, { replace: true });
      const t = setTimeout(() => setFlashMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  // 상단 버튼
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // 문서 + 열린 토론 여부 + 즐겨찾기 여부 로드
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setStatus('loading');
        setApiError(null);
        setHasTalk(false);
        setFavOn(false);
        setDocId(null);
        setDocUniId(null);

        const encoded = encodeURIComponent(documentTitle);
        const res = await fetch(`${API_BASE}/v1/documents/${encoded}`, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          signal: controller.signal,
        });

        if (res.status === 404) {
          setStatus('notfound');
          setContent('');
          setMeta(null);
          setLastUpdated('');
          setApiError('해당 제목의 문서가 존재하지 않습니다.');
          return;
        }
        if (!res.ok) throw new Error('문서를 불러오는 중 오류가 발생했습니다.');

        const data: DocumentDto = await res.json();
        setContent(data.documentContent || '*내용이 없습니다.*');
        setMeta({ universityName: data.universityName, categoryName: data.categoryName });
        setLastUpdated(data.updatedAt ? formatKST(new Date(data.updatedAt)) : '');
        setDocId(data.documentId);
        setDocUniId(data.universityId);
        setStatus('ok');

        // 열린 토론 여부
        try {
          const qs = new URLSearchParams({ document: String(data.documentId), page: '0', size: '1' }).toString();
          const talkRes = await fetch(`${API_BASE}/v1/discussions?${qs}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          });
          if (talkRes.ok) {
            const j = await talkRes.json();
            setHasTalk(Array.isArray(j?.content) && j.content.length > 0);
          } else setHasTalk(false);
        } catch { setHasTalk(false); }

        // 즐겨찾기 여부
        try {
          const token = getAccessToken();
          if (!token) setFavOn(false);
          else {
            const favRes = await fetch(`${API_BASE}/v1/users/me/favorites/documents`, {
              method: 'GET',
              headers: authHeaders({ Accept: 'application/json' }),
              credentials: 'include',
              signal: controller.signal,
            });
            if (favRes.status === 401) return; // 로그인 필요
            if (favRes.ok) {
              const list: Array<{ documentId: number }> = await favRes.json();
              setFavOn(Array.isArray(list) && list.some((it) => Number(it.documentId) === data.documentId));
            } else setFavOn(false);
          }
        } catch { setFavOn(false); }
      } catch (e: any) {
        if (controller.signal.aborted) return;
        setApiError(e?.message || '문서를 불러오는 중 오류가 발생했습니다.');
        setStatus('error');
      }
    })();
    return () => controller.abort();
  }, [documentTitle]);

  // ✅ 즐겨찾기 토글 (누락 복구)
  const toggleFavorite = async () => {
    if (!docId || favBusy) return;

    const token = getAccessToken();
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }

    try {
      setFavBusy(true);

      if (favOn) {
        const delRes = await fetch(`${API_BASE}/v1/users/me/favorites/documents/${docId}`, {
          method: 'DELETE',
          headers: authHeaders({ Accept: '*/*' }),
          credentials: 'include',
        });
        if (delRes.status === 401) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }
        if (!delRes.ok && delRes.status !== 204) {
          const t = await delRes.text().catch(() => '');
          throw new Error(t || '즐겨찾기 해제 실패');
        }
        setFavOn(false);
      } else {
        const addRes = await fetch(`${API_BASE}/v1/users/me/favorites/documents/${docId}`, {
          method: 'POST',
          headers: authHeaders({ Accept: '*/*' }),
          credentials: 'include',
          body: '',
        });
        if (addRes.status === 401) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
          return;
        }
        if (!addRes.ok && addRes.status !== 201) {
          const t = await addRes.text().catch(() => '');
          throw new Error(t || '즐겨찾기 추가 실패');
        }
        setFavOn(true);
      }
    } catch (e: any) {
      alert(e?.message || '즐겨찾기 처리 중 오류가 발생했습니다.');
    } finally {
      setFavBusy(false);
    }
  };

  // === 편집 사전 권한 체크: 로컬 universityId로만 비교 ===
  function handleEditClick() {
    const token = getAccessToken();
    if (!token) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }
    const univName = meta?.universityName || '대학교';
    const base = `/univ/${enc(univName)}/docs/${docTitleParam}`;

    if (!docUniId) {
      // 문서 메타가 없으면 서버에 맡김
      navigate(`${base}/edit`);
      return;
    }

    const myUniId = getStoredUniId();
    if (myUniId != null && Number(myUniId) === Number(docUniId)) {
      navigate(`${base}/edit`);
    } else {
      setFlashMsg('소속 대학생만 문서 작업을 할 수 있습니다.');
      setTimeout(() => setFlashMsg(null), 3000);
    }
  }

  // sanitize 확장
  const sanitizeSchema: any = useMemo(
    () => ({
      ...defaultSchema,
      attributes: {
        ...(defaultSchema as any).attributes,
        img: ['src', 'alt', 'title', 'width', 'height'],
        a: [...(((defaultSchema as any).attributes?.a) || []), 'target', 'rel'],
      },
      tagNames: [...(((defaultSchema as any).tagNames) || []), 'img'],
    }),
    []
  );

  // ✅ 링크 전부 univ 하위로 정규화
  const univNameSafe = meta?.universityName || '대학교';
  const cateNameSafe = meta?.categoryName || '카테고리';
  const univHref = `/univ/${enc(univNameSafe)}`;
  const catHref  = `/univ/${enc(univNameSafe)}/category/${enc(cateNameSafe)}`;
  const docBase  = `${univHref}/docs/${docTitleParam}`;

  const showCard = status === 'ok' || status === 'loading';

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 gap-6">
        <div className="lg:col-span-8">
          {flashMsg && (
            <div
              role="status"
              className="mb-4 flex items-center justify-between rounded-lg bg-[#2C80A0] px-4 py-3 text-white"
            >
              <span className="text-[15px]">{flashMsg}</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setFlashMsg(null)} className="hover:opacity-80">
                  닫기
                </button>
              </div>
            </div>
          )}

          {(status === 'notfound' || status === 'error') && apiError && (
            <div className="mb-4 rounded-lg bg-[#2C80A0] px-4 py-2 text-white">{apiError}</div>
          )}

          {showCard && (
            <section className="relative rounded-2xl border border-[#B3B3B3] bg-[#FAFAFA] p-6">
              {/* 브레드크럼 */}
              <nav className="mb-2 text-[18px] leading-tight" aria-label="Breadcrumb">
                <ol className="flex items-center gap-1">
                  <li>
                    <Link to={univHref} className="text-[#2C80A0] hover:underline">
                      {univNameSafe}
                    </Link>
                  </li>
                  <li className="mx-1 text-gray-500">›</li>
                  <li>
                    <Link to={catHref} className="text-[#2C80A0] hover:underline">
                      {cateNameSafe}
                    </Link>
                  </li>
                </ol>
              </nav>

              {/* 제목 */}
              <h1 className="text-[28px] leading-tight font-semibold text-gray-900 mb-2">
                {documentTitle}
              </h1>

              {/* 날짜 + 액션바 */}
              <div className="mb-5 flex items-center gap-4">
                {lastUpdated && status === 'ok' && (
                  <p className="text-[18px] text-gray-800 whitespace-nowrap">
                    최근 수정 시각 : {lastUpdated}
                  </p>
                )}
                <div className="ml-auto" />
                <div
                  role="tablist"
                  aria-label="문서 작업 메뉴"
                  className="grid grid-cols-4 items-stretch overflow-hidden rounded-xl border border-[#B3B3B3] bg-[#FAFAFA] w-[clamp(280px,40vw,520px)]"
                >
                  <button
                    onClick={toggleFavorite}
                    disabled={favBusy || !docId || status !== 'ok'}
                    aria-pressed={favOn}
                    title={favOn ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    className={`h-10 px-4 text-[18px] leading-tight flex items-center justify-center
                      ${favOn ? 'bg-[#2C80A0] text-white' : 'text-[#7F7F7F] hover:bg-white/60'}
                      ${favBusy ? 'opacity-60 cursor-wait' : ''}`}
                  >
                    ★
                  </button>

                  {/* 편집: 링크 대신 권한 체크 버튼 */}
                  <button
                    role="tab"
                    onClick={handleEditClick}
                    className="h-10 px-4 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3] text-[#7F7F7F] hover:bg-white/60"
                  >
                    편집
                  </button>

                  <Link
                    role="tab"
                    to={`${docBase}/discussions`}
                    className={`h-10 px-4 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3]
                      ${hasTalk ? 'bg-[#2C80A0] text-white' : 'text-[#7F7F7F] hover:bg-white/60'}`}
                  >
                    토론
                  </Link>

                  <Link
                    role="tab"
                    to={`${docBase}/history`}
                    className="h-10 px-4 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3] text-[#7F7F7F] hover:bg-white/60"
                  >
                    역사
                  </Link>
                </div>
              </div>

              {/* 본문 */}
              <article data-color-mode="light" className="prose max-w-none">
                {status === 'loading' ? (
                  <div className="animate-pulse">
                    <div className="mb-3 h-6 w-1/3 rounded bg-gray-200" />
                    <div className="mb-2 h-4 w-full rounded bg-gray-200" />
                    <div className="mb-2 h-4 w-11/12 rounded bg-gray-200" />
                    <div className="h-4 w-10/12 rounded bg-gray-200" />
                  </div>
                ) : (
                  <MDEditor.Markdown
                    source={content}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
                    style={{
                      backgroundColor: '#FAFAFA',
                      ['--color-canvas-default' as any]: '#FAFAFA',
                      ['--color-canvas-subtle' as any]: '#FAFAFA',
                    }}
                  />
                )}
              </article>
            </section>
          )}
        </div>
      </div>

      {showTop && (
        <button
          onClick={scrollTop}
          className="fixed bottom-6 right-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#5C5C5C] bg-white text-[#5C5C5C] shadow-sm hover:bg-gray-50"
          aria-label="문서 상단으로 이동"
          title="문서 상단으로 이동"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
