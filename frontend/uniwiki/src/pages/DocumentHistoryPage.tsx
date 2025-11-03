// src/pages/DocumentHistoryPage.tsx
import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronUp, ChevronRight } from "lucide-react";
import RecentEdit from "@/layout/RecentEdit";
import RecentDiscuss from "@/layout/RecentDiscuss";

type Revision = {
  id: number;
  delta: number;
  author: string;
  createdAt: string; // ISO
  summary: string;
};

// 24시간 이내 → n초/분/시간 전, 그 외 → YYYY.MM.DD
function fmtDateSmart(iso: string) {
  const t = new Date(iso).getTime();
  const diffMs = Date.now() - t;
  const DAY = 24 * 60 * 60 * 1000;

  if (diffMs < DAY) {
    const sec = Math.max(1, Math.floor(diffMs / 1000));
    if (sec < 60) return `${sec}초 전`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}분 전`;
    const hr = Math.floor(min / 60);
    return `${hr}시간 전`;
  }
  const d = new Date(t);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${dd}`;
}

export default function DocumentHistoryPage() {
  const { documentTitle = "문서 제목" } = useParams();
  const docTitleParam = encodeURIComponent(documentTitle);

  // 샘플 리비전
  const allRevisions: Revision[] = useMemo(() => {
    const base = Date.now();
    return Array.from({ length: 30 }).map((_, i) => {
      const id = 120 - i;
      const delta = i % 2 === 0 ? +30 : -20;
      const createdAt = new Date(base - i * 60_000).toISOString();
      return { id, delta, author: "김코드", createdAt, summary: `${documentTitle} 문서에 대한 수정 내용 요약` };
    });
  }, [documentTitle]);

  // 15개씩
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const maxPage = Math.max(1, Math.ceil(allRevisions.length / pageSize));
  const pageItems = useMemo(
    () => allRevisions.slice((page - 1) * pageSize, page * pageSize),
    [allRevisions, page]
  );

  // 상단 이동
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ── 버전 검색: 'r' 접두어 고정 ──────────────────────────────────────
  const [revText, setRevText] = useState<string>("r");
  const inputRef = useRef<HTMLInputElement>(null);

  const sanitizeRev = (raw: string) => {
    const suffix = raw.replace(/^r?/i, "").replace(/\D+/g, "");
    return "r" + suffix;
  };

  const onRevChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRevText(sanitizeRev(e.target.value));
  };

  const onRevKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.target as HTMLInputElement;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    // r 삭제 방지
    if ((e.key === "Backspace" && start === 1 && end === 1) || (e.key === "Delete" && start === 0 && end <= 1)) {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter") goToRevision();
  };

  const goToRevision = () => {
    const n = parseInt(revText.slice(1), 10);
    if (Number.isNaN(n)) return;
    const idx = allRevisions.findIndex((r) => r.id === n);
    if (idx === -1) return;
    const targetPage = Math.floor(idx / pageSize) + 1;
    setPage(targetPage);
    setHighlightId(allRevisions[idx].id);
    setTimeout(() => {
      document.getElementById(`rev-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
    setTimeout(() => setHighlightId(null), 1800);
  };
  // ─────────────────────────────────────────────────────────────────

  const [highlightId, setHighlightId] = useState<number | null>(null);

  // 페이저: bg #FAFAFA, border #B3B3B3, radius 10, text #7F7F7F
  const Pager = ({ className = "" }: { className?: string }) => (
    <div className={`inline-flex items-stretch overflow-hidden rounded-[10px] border border-[#B3B3B3] bg-[#FAFAFA] ${className}`}>
      <button
        type="button"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-5 py-2 text-sm font-semibold text-[#7F7F7F] hover:bg-white/40 disabled:opacity-50"
        aria-label="이전 페이지"
      >
        &lt; 이전
      </button>
      <div className="w-px bg-[#B3B3B3]" />
      <button
        type="button"
        onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
        disabled={page === maxPage}
        className="px-5 py-2 text-sm font-semibold text-[#7F7F7F] hover:bg-white/40 disabled:opacity-50"
        aria-label="다음 페이지"
      >
        다음 &gt;
      </button>
    </div>
  );

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측 본문 */}
        <div className="lg:col-span-8 space-y-4 lg:pr-10 xl:pr-12">
          {/* 브레드크럼 & 제목 */}
          <section className="p-0">
            <nav className="mb-2 text-[18px] leading-tight" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1">
                <li><Link to="/" className="text-[#2C80A0] hover:underline">서울대학교</Link></li>
                <li className="mx-1 text-gray-500">›</li>
                <li><Link to={`/category/${encodeURIComponent("학교")}`} className="text-[#2C80A0] hover:underline">학교</Link></li>
              </ol>
            </nav>
            <h1 className="text-2xl font-semibold text-gray-900">
              <Link to={`/docs/${docTitleParam}`} className="hover:underline" title="문서 보기로 이동">
                {documentTitle}
              </Link>{" "}
              <span className="text-gray-600 text-lg">(문서 역사)</span>
            </h1>
          </section>

          {/* 상단 액션바 */}
          <div className="flex flex-wrap items-center gap-3">
            <Pager />
            {/* 버전 검색 — 입력칸·버튼 스타일 통일 (요청 반영) */}
            <div className="ml-1 flex items-center gap-1">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={revText}
                onChange={onRevChange}
                onKeyDown={onRevKeyDown}
                className="h-9 w-28 rounded-md border border-[#B3B3B3] bg-white px-2 text-sm text-gray-800 leading-tight outline-none focus:border-[#2C80A0] focus:ring-2 focus:ring-[#2C80A0]"
                aria-label="버전 번호 (예: r120)"
              />
              <button
                onClick={goToRevision}
                className="h-9 px-3 rounded-md border border-[#B3B3B3] bg-[#2C80A0] hover:brightness-95 inline-flex items-center justify-center"
                title="해당 버전으로 이동"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* 히스토리 리스트 */}
          <ul className="divide-y divide-gray-200">
            {pageItems.map((rev) => (
              <li key={rev.id} id={`rev-${rev.id}`} className="relative block w-full">
                {highlightId === rev.id && (
                  <div
                    className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
                    style={{ backgroundColor: "rgba(44, 128, 160, 0.12)" }}
                  />
                )}
                <div className="relative z-10 px-2 py-3">
                  <div className="flex w-full items-center">
                    <div className="min-w-0 flex-1 text-sm">
                      <div className="flex min-w-0 items-center whitespace-nowrap">
                        <span className="mr-2 text-gray-400">•</span>
                        <span className="mr-3 text-gray-800">r{rev.id}</span>

                        <span className="mr-3 text-gray-400">|</span>
                        <span className="mr-3 text-gray-700">{fmtDateSmart(rev.createdAt)}</span>

                        <span className="mr-3 text-gray-400">|</span>
                        <Link
                          to={`/user/contributions?user=${encodeURIComponent(rev.author)}`}
                          className="mr-3 text-gray-700 hover:underline"
                          title={`${rev.author}의 문서 기여 목록`}
                        >
                          {rev.author}
                        </Link>

                        <span className="mr-3 text-gray-400">|</span>
                        <span className={`mr-3 font-semibold ${rev.delta >= 0 ? "text-rose-600" : "text-sky-600"}`}>
                          {rev.delta >= 0 ? `+${rev.delta}` : rev.delta}
                        </span>

                        <span className="ml-1 truncate text-[#B3B3B3]">({rev.summary})</span>
                      </div>
                    </div>

                    <div className="ml-4 shrink-0 text-right text-sm">
                      <Link to={`/docs/${docTitleParam}?rev=${rev.id}`} className="text-[#2C80A0] hover:underline">
                        보기
                      </Link>
                      <span className="mx-2 text-gray-400">|</span>
                      <button
                        type="button"
                        className="text-[#2C80A0] hover:underline"
                        onClick={() => alert(`r${rev.id} 버전으로 되돌리기는 서버 연동 시 적용됩니다.`)}
                      >
                        이 버전으로 되돌리기
                      </button>
                      <span className="mx-2 text-gray-400">|</span>
                      <Link to={`/docs/${docTitleParam}/discussions`} className="text-[#2C80A0] hover:underline">
                        토론
                      </Link>
                      <span className="mx-2 text-gray-400">|</span>
                      <Link to={`/docs/${docTitleParam}/history?compare=r${rev.id}-prev`} className="text-[#2C80A0] hover:underline">
                        비교
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* 하단 페이저 */}
          <div className="pt-2">
            <Pager />
          </div>
        </div>

        {/* 우측 레일 */}
        <aside className="lg:col-span-4 space-y-6">
          <RecentEdit />
          <RecentDiscuss />
        </aside>
      </div>

      {/* 상단 이동 버튼 */}
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
