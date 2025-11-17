// src/pages/DocumentViewPage.tsx
import { useEffect, useMemo, useState, useRef } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

import MDEditor from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { visit } from 'unist-util-visit'

import { getAccessToken, authHeaders } from '@/utils/auth';

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

type TocItem = {
  id: string;
  text: string;
  level: number;   // 1~6
  number: string;  // 1. / 2.1. / 3.4.2. 등
};

const API_BASE = 'https://k13d104.p.ssafy.io/api';

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

/** 차단 응답 여부 판별 */
function isBanned(status: number, bodyText: string) {
  const t = (bodyText || '').toLowerCase();
  return (
    status === 423 ||
    status === 451 ||
    t.includes('user_banned') ||
    t.includes('banned') ||
    t.includes('차단')
  );
}

// 단순 slug 함수(한글/영문 공통 사용)
function slugify(raw: string) {
  const base = raw
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return base || 'section';
}

// [[문서 제목]] → /univ/:univName/docs/:docTitle 로 바꾸는 remark 플러그인
function createWikiLinkPlugin(univName: string) {
  const univSeg = encodeURIComponent(univName || '대학교');

  return function wikiLinkPlugin() {
    return (tree: any) => {
      visit(tree, 'text', (node: any, index: number | null, parent: any) => {
        if (index == null || !parent) return;

        const text: string = node.value;
        const re = /\[\[([^[\]]+)\]\]/g;

        let match: RegExpExecArray | null;
        let lastIndex = 0;
        const children: any[] = [];

        while ((match = re.exec(text)) !== null) {
          const before = text.slice(lastIndex, match.index);
          if (before) {
            children.push({ type: 'text', value: before });
          }

          const title = match[1].trim();
          const href = `/univ/${univSeg}/docs/${encodeURIComponent(title)}`;

          children.push({
            type: 'link',
            url: href,
            title: null,
            children: [{ type: 'text', value: title }],
          });

          lastIndex = match.index + match[0].length;
        }

        const after = text.slice(lastIndex);
        if (children.length === 0) return; // [[ ]] 패턴이 없으면 그대로 둠
        if (after) {
          children.push({ type: 'text', value: after });
        }

        // text 노드를 link/text 노드들로 교체
        parent.children.splice(index, 1, ...children);
      });
    };
  };
}

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
  const [meta, setMeta] = useState<Pick<DocumentDto, 'universityName' | 'categoryName'> | null>(
    null,
  );

  const [docId, setDocId] = useState<number | null>(null);
  const [docUniId, setDocUniId] = useState<number | null>(null);

  const [favOn, setFavOn] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  const [hasTalk, setHasTalk] = useState(false);

  // 플래시 배너
  const [flashMsg, setFlashMsg] = useState<string | null>(() => location.state?.flash?.msg || null);
  
  const univNameSafe = meta?.universityName || '대학교';

  const wikiLinkPlugin = useMemo(
    () => createWikiLinkPlugin(univNameSafe),
    [univNameSafe],
  );

  const showFlash = (msg: string, ms = 3000) => {
    setFlashMsg(msg);
    window.clearTimeout((showFlash as any)._t);
    (showFlash as any)._t = window.setTimeout(() => setFlashMsg(null), ms);
  };
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
          const qs = new URLSearchParams({
            document: String(data.documentId),
            page: '0',
            size: '1',
          }).toString();
          const talkRes = await fetch(`${API_BASE}/v1/discussions?${qs}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          });
          if (talkRes.ok) {
            const j = await talkRes.json();
            setHasTalk(Array.isArray(j?.content) && j.content.length > 0);
          } else setHasTalk(false);
        } catch {
          setHasTalk(false);
        }

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
              setFavOn(
                Array.isArray(list) && list.some((it) => Number(it.documentId) === data.documentId),
              );
            } else setFavOn(false);
          }
        } catch {
          setFavOn(false);
        }
      } catch (e: any) {
        if (controller.signal.aborted) return;
        setApiError(e?.message || '문서를 불러오는 중 오류가 발생했습니다.');
        setStatus('error');
      }
    })();
    return () => controller.abort();
  }, [documentTitle]);

  // 즐겨찾기 토글
  const toggleFavorite = async () => {
    if (!docId || favBusy) return;

    const token = getAccessToken();
    if (!token) {
      showFlash('로그인이 필요합니다.');
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

        const text = await delRes.clone().text().catch(() => '');
        if (isBanned(delRes.status, text)) {
          showFlash('차단된 사용자입니다.');
          return;
        }

        if (!delRes.ok && delRes.status !== 204) {
          showFlash(text || '즐겨찾기 해제 실패');
          return;
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

        const text = await addRes.clone().text().catch(() => '');
        if (isBanned(addRes.status, text)) {
          showFlash('차단된 사용자입니다.');
          return;
        }

        if (!addRes.ok && addRes.status !== 201) {
          showFlash(text || '즐겨찾기 추가 실패');
          return;
        }
        setFavOn(true);
      }
    } catch (e: any) {
      showFlash(e?.message || '즐겨찾기 처리 중 오류가 발생했습니다.');
    } finally {
      setFavBusy(false);
    }
  };

  // 편집 사전 권한 체크: 로컬 universityId로만 비교
  function handleEditClick() {
    const token = getAccessToken();
    if (!token) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
      return;
    }
    const univName = meta?.universityName || '대학교';
    const base = `/univ/${enc(univName)}/docs/${docTitleParam}`;

    if (!docUniId) {
      navigate(`${base}/edit`);
      return;
    }

    const myUniId = getStoredUniId();
    if (myUniId != null && Number(myUniId) === Number(docUniId)) {
      navigate(`${base}/edit`);
    } else {
      showFlash('소속 대학생만 문서 작업을 할 수 있습니다.');
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
    [],
  );

  // 링크 정규화 (+ 대학 ID 동반 전달)
  const cateNameSafe = meta?.categoryName || '카테고리';
  const univHref = `/univ/${enc(univNameSafe)}`;
  const catePathBase = `/univ/${enc(univNameSafe)}/category/${enc(cateNameSafe)}`;
  const cateHref =
    typeof docUniId === 'number' ? `${catePathBase}?universityId=${docUniId}` : catePathBase;
  const docBase = `${univHref}/docs/${docTitleParam}`;

  const showCard = status === 'ok' || status === 'loading';

  /** ===== 목차 생성 ===== */
  const articleRef = useRef<HTMLElement | null>(null);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  useEffect(() => {
    if (status !== 'ok') {
      setTocItems([]);
      return;
    }
    const root = articleRef.current;
    if (!root) {
      setTocItems([]);
      return;
    }

    const headings = Array.from(
      root.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6'),
    );
    if (!headings.length) {
      setTocItems([]);
      return;
    }

    const slugCounts: Record<string, number> = {};
    const levelCounters = [0, 0, 0, 0, 0, 0, 0];
    const items: TocItem[] = [];

    headings.forEach((el, idx) => {
      const level = Math.min(Math.max(Number(el.tagName.slice(1)) || 1, 1), 6);
      const text = el.textContent?.trim() || `제목 ${idx + 1}`;

      let baseSlug = slugify(text);
      if (slugCounts[baseSlug] == null) slugCounts[baseSlug] = 0;
      else slugCounts[baseSlug] += 1;
      const slug = slugCounts[baseSlug] === 0 ? baseSlug : `${baseSlug}-${slugCounts[baseSlug]}`;

      el.id = slug;

      levelCounters[level] += 1;
      for (let i = level + 1; i <= 6; i += 1) levelCounters[i] = 0;
      const num = levelCounters
        .slice(1, level + 1)
        .filter((n) => n > 0)
        .join('.');

      items.push({ id: slug, text, level, number: num });
    });

    setTocItems(items);
  }, [content, status]);
  /** ===================== */

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
                <button
                  onClick={() => setFlashMsg(null)}
                  className="hover:opacity-80 cursor-pointer"
                >
                  닫기
                </button>
              </div>
            </div>
          )}

          {(status === 'notfound' || status === 'error') && apiError && (
            <div className="mb-4 rounded-lg bg-[#2C80A0] px-4 py-2 text-white">{apiError}</div>
          )}

          {showCard && (
            <section className="relative rounded-2xl border border-[#B3B3B3] bg-gray-50 p-6">
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
                    <Link
                      to={cateHref}
                      state={typeof docUniId === 'number' ? { universityId: docUniId } : undefined}
                      className="text-[#2C80A0] hover:underline"
                    >
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
              <div className="mb-6 flex items-center gap-4 min-w-0">
                {lastUpdated && status === 'ok' && (
                  <p className="text-md text-gray-800 whitespace-nowrap">
                    최근 수정 시각 : {lastUpdated}
                  </p>
                )}
                <div className="ml-auto" />
                <div
                  role="tablist"
                  aria-label="문서 작업 메뉴"
                  className="grid grid-cols-4 items-stretch overflow-hidden rounded-lg border border-[#B3B3B3] bg-gray-50 w-[clamp(220px,28vw,360px)] max-w-full"
                >
                  <button
                    onClick={toggleFavorite}
                    disabled={favBusy || !docId || status !== 'ok'}
                    aria-pressed={favOn}
                    title={favOn ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    className={`h-9 px-2 text-md leading-tight flex items-center justify-center
                      ${favOn ? 'bg-[#2C80A0] text-white' : 'text-[#7F7F7F] hover:bg:white/60'}
                      ${favBusy ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`.replace(
                      'hover:bg:white/60',
                      'hover:bg-white/60',
                    )}
                  >
                    ★
                  </button>

                  {/* 편집 */}
                  <button
                    role="tab"
                    onClick={handleEditClick}
                    className="h-9 px-2 text-md leading-tight flex items-center justify-center border-l border-[#B3B3B3] text-[#7F7F7F] hover:bg-white/60 cursor-pointer"
                  >
                    편집
                  </button>

                  <Link
                    role="tab"
                    to={`${docBase}/discussions`}
                    className={`h-9 px-2 text-md leading-tight flex items-center justify-center border-l border-[#B3B3B3]
                      ${hasTalk ? 'bg-[#2C80A0] text-white' : 'text-[#7F7F7F] hover:bg-white/60'}`}
                  >
                    토론
                  </Link>

                  <Link
                    role="tab"
                    to={`${docBase}/history`}
                    className="h-9 px-2 text-md leading-tight flex items-center justify-center border-l border-[#B3B3B3] text-[#7F7F7F] hover:bg-white/60"
                  >
                    역사
                  </Link>
                </div>
              </div>

              {/* ===== 목차 영역 (상자 없이) ===== */}
              {status === 'ok' && tocItems.length > 0 && (
                <section className="mb-8">
                  <h2 className="mb-2 text-lg font-semibold text-gray-900"></h2>
                  <ol className="space-y-1 text-sm">
                    {tocItems.map((item) => (
                      <li
                        key={item.id}
                        style={{ marginLeft: (item.level - 1) * 16 }}
                        className="leading-snug"
                      >
                        <a
                          href={`#${item.id}`}
                          className="text-[#2C80A0] hover:underline"
                        >
                          <span className="mr-1">{item.number}</span>
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {/* ==================== */}

              {/* 본문 */}
              <article
                ref={articleRef}
                data-color-mode="light"
                className="prose max-w-none"
              >
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
                    remarkPlugins={[remarkGfm, wikiLinkPlugin]}
                    rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
                    style={{
                      backgroundColor: '#F9FAFB',
                      ['--color-canvas-default' as any]: '#F9FAFB',
                      ['--color-canvas-subtle' as any]: '#F9FAFB',
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
          className="fixed bottom-6 right-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#5C5C5C] bg-white text-[#5C5C5C] shadow-sm hover:bg-gray-50 cursor-pointer"
          aria-label="문서 상단으로 이동"
          title="문서 상단으로 이동"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}
