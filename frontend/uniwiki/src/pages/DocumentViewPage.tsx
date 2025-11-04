// src/pages/DocumentViewPage.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

import MDEditor from '@uiw/react-md-editor';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

import RecentEdit from '@/layout/RecentEdit';
import RecentDiscuss from '@/layout/RecentDiscuss';

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

export default function DocumentViewPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { documentTitle = '문서 제목' } = useParams();
  const docTitleParam = encodeURIComponent(documentTitle);

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

  const [favOn, setFavOn] = useState(false);
  const [hasTalk, setHasTalk] = useState(false); // ✅ 열린 토론 여부

  // 플래시 배너
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

  // ✅ 문서 + 열린 토론 여부 로드
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setStatus('loading');
        setApiError(null);
        setHasTalk(false);

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
          return;
        }
        if (!res.ok) throw new Error('문서를 불러오는 중 오류가 발생했습니다.');

        const data: DocumentDto = await res.json();
        setContent(data.documentContent || '*내용이 없습니다.*');
        setMeta({ universityName: data.universityName, categoryName: data.categoryName });
        setLastUpdated(data.updatedAt ? formatKST(new Date(data.updatedAt)) : '');
        setStatus('ok');

        // 🔎 열린 토론 여부 체크: content 배열이 비어있지 않으면 true
        try {
          const qs = new URLSearchParams({
            document: String(data.documentId),
            page: '0',
            size: '1', // 한 개만 확인하면 충분
          }).toString();

          const talkRes = await fetch(`${API_BASE}/v1/discussions?${qs}`, {
            headers: { Accept: 'application/json' },
            signal: controller.signal,
          });
          if (talkRes.ok) {
            const j = await talkRes.json();
            const hasOpen = Array.isArray(j?.content) && j.content.length > 0;
            setHasTalk(hasOpen);
          } else {
            setHasTalk(false);
          }
        } catch {
          setHasTalk(false);
        }
      } catch (e: any) {
        if (controller.signal.aborted) return;
        setApiError(e?.message || '문서를 불러오는 중 오류가 발생했습니다.');
        setStatus('error');
      }
    })();
    return () => controller.abort();
  }, [documentTitle]);

  // sanitize 확장
  const sanitizeSchema: any = useMemo(() => ({
    ...defaultSchema,
    attributes: {
      ...(defaultSchema as any).attributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
      a: [ ...(((defaultSchema as any).attributes?.a) || []), 'target', 'rel' ],
    },
    tagNames: [ ...((defaultSchema as any).tagNames || []), 'img' ],
  }), []);

  const uniLabel = meta?.universityName ?? '학교이름';
  const catLabel = meta?.categoryName ?? '카테고리';
  const uniHref = meta ? `/univ/${encodeURIComponent(meta.universityName)}` : '/';
  const catHref = meta ? `/category/${encodeURIComponent(meta.categoryName)}` : '#';

  const showCard = status === 'ok' || status === 'loading';

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측 */}
        <div className="lg:col-span-8">
          {flashMsg && (
            <div role="status" className="mb-4 flex items-center justify-between rounded-lg bg-[#2C80A0] px-4 py-3 text-white">
              <span className="text-[15px]">{flashMsg}</span>
              <div className="flex items-center gap-4">
                <Link to={`/docs/${docTitleParam}/edit`} className="underline hover:opacity-80">다시 편집</Link>
                <button onClick={() => setFlashMsg(null)} className="hover:opacity-80">닫기</button>
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
                  <li><Link to={uniHref} className="text-[#2C80A0] hover:underline">{uniLabel}</Link></li>
                  <li className="mx-1 text-gray-500">›</li>
                  <li><Link to={catHref} className="text-[#2C80A0] hover:underline">{catLabel}</Link></li>
                </ol>
              </nav>

              {/* 제목 */}
              <h1 className="text-[28px] leading-tight font-semibold text-gray-900 mb-2">
                {documentTitle}
              </h1>

              {/* 날짜 + 액션바 */}
              <div className="mb-5 flex items-center gap-4">
                {lastUpdated && (
                  <p className="text-[18px] text-gray-800 whitespace-nowrap">최근 수정 시각 : {lastUpdated}</p>
                )}
                <div className="ml-auto" />
                <div
                  role="tablist"
                  aria-label="문서 작업 메뉴"
                  className="grid grid-cols-4 items-stretch overflow-hidden rounded-xl border border-[#B3B3B3] bg-[#FAFAFA] w-[clamp(280px,40vw,520px)]"
                >
                  <button
                    onClick={() => setFavOn(v => !v)}
                    aria-pressed={favOn}
                    title="즐겨찾기"
                    className={`h-10 px-4 text-[18px] leading-tight flex items-center justify-center
                      ${favOn ? 'bg-[#2C80A0] text-white' : 'text-[#7F7F7F] hover:bg-white/60'}`}
                  >
                    ★
                  </button>

                  <Link
                    role="tab"
                    to={`/docs/${docTitleParam}/edit`}
                    className="h-10 px-4 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3] text-[#7F7F7F] hover:bg-white/60"
                  >
                    편집
                  </Link>

                  <Link
                    role="tab"
                    to={`/docs/${docTitleParam}/discussions`}
                    className={`h-10 px-4 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3]
                      ${hasTalk ? 'bg-[#2C80A0] text-white' : 'text-[#7F7F7F] hover:bg-white/60'}`}
                  >
                    토론
                  </Link>

                  <Link
                    role="tab"
                    to={`/docs/${docTitleParam}/history`}
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

        {/* 우측 */}
        <aside className="lg:col-span-4 space-y-6">
          <RecentEdit />
          <RecentDiscuss />
        </aside>
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
