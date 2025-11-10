// src/pages/DocumentHistoryPage.tsx
import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronUp, ChevronRight } from "lucide-react";

type Revision = {
  id: number;          // = versionNumber
  delta: number;       // = plusCount + minusCount
  author: string;      // = editorNickname
  createdAt: string;   // ISO (서버 기준 시각)
  summary: string;     // = editMemo
};

type VersionsApiItem = {
  createdAt: string;
  versionNumber: number;
  plusCount: number;
  minusCount: number;
  editorNickname: string;
  editMemo: string;
};
type VersionsApiResponse = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasPre: boolean;
  hasNext: boolean;
  content: VersionsApiItem[];
};

type DocumentDto = {
  documentId: number;
  documentTitle: string;
  universityId?: number;
  universityName?: string;
  categoryId?: number;
  categoryName?: string;
};

const API_BASE = "https://k13d104.p.ssafy.io/api";

// ===== 토큰 =====
function getAccessToken() {
  try { return localStorage.getItem("accessToken") || ""; } catch { return ""; }
}
function authHeaders() {
  const t = getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** timezone 표기 없으면 'Z' 추가해 UTC로 파싱(상대시간 계산용 안전 파서) */
function parseServerUtc(iso: string): Date {
  const hasTZ = /Z$|[+-]\d\d:\d\d$/.test(iso);
  return new Date(hasTZ ? iso : iso + "Z");
}

/** KST(Asia/Seoul)로 YYYY.MM.DD */
function formatYmdKST(date: Date): string {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find(p => p.type === t)?.value || "";
  return `${get("year")}.${get("month")}.${get("day")}`;
}

/** 조회 시각(nowMs) 기준 상대시간. 24h 이내면 초/분/시간 전, 그 밖엔 KST 날짜 */
function fmtDateSmart(isoUtc: string, nowMs: number) {
  const tUtc = parseServerUtc(isoUtc).getTime();
  const diffMs = nowMs - tUtc;
  const DAY = 24 * 60 * 60 * 1000;

  if (diffMs >= 0 && diffMs < DAY) {
    const sec = Math.max(1, Math.floor(diffMs / 1000));
    if (sec < 60) return `${sec}초 전`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}분 전`;
    const hr = Math.floor(min / 60);
    return `${hr}시간 전`;
  }
  return formatYmdKST(new Date(tUtc));
}

export default function DocumentHistoryPage() {
  const { documentTitle = "문서 제목" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const enc = (s: string) => encodeURIComponent(s || "");

  // ===== 서버 상태 =====
  const [docId, setDocId] = useState<number | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 브레드크럼
  const [univName, setUnivName] = useState<string | undefined>();
  const [categoryName, setCategoryName] = useState<string | undefined>();

  // 상대시간용 "조회 시각" 스냅샷
  const [loadedAtMs, setLoadedAtMs] = useState<number>(Date.now());

  // 제목 → 문서 정보
  useEffect(() => {
    let aborted = false;
    async function fetchDoc() {
      setLoading(true); setErr(null);
      try {
        const res = await fetch(
          `${API_BASE}/v1/documents/${encodeURIComponent(documentTitle)}`,
          { headers: { "Content-Type": "application/json", ...authHeaders() } }
        );
        if (!res.ok) throw new Error(`문서 조회 실패(${res.status})`);
        const data: DocumentDto = await res.json();
        if (aborted) return;
        setDocId(data.documentId);
        setUnivName(data.universityName);
        setCategoryName(data.categoryName);
      } catch (e: any) {
        if (aborted) return;
        setErr(e.message || "문서 조회 중 오류가 발생했습니다.");
        setLoading(false);
      }
    }
    fetchDoc();
    return () => { aborted = true; };
  }, [documentTitle]);

  // 버전 목록
  useEffect(() => {
    if (!docId) return;
    let aborted = false;
    async function fetchVersions() {
      try {
        const url = `${API_BASE}/v1/documents/${docId}/versions?page=0&size=200`;
        const res = await fetch(url, { headers: { ...authHeaders() } });
        if (!res.ok) throw new Error(`버전 목록 조회 실패(${res.status})`);
        const data: VersionsApiResponse = await res.json();
        if (aborted) return;

        const mapped: Revision[] = data.content
          .map((it) => ({
            id: it.versionNumber,
            delta: (it.plusCount ?? 0) + (it.minusCount ?? 0),
            author: it.editorNickname || "익명",
            createdAt: it.createdAt,
            summary: it.editMemo || "",
          }))
          .sort((a, b) => b.id - a.id);

        setRevisions(mapped);
        setLoadedAtMs(Date.now());
        setLoading(false);
      } catch (e: any) {
        if (aborted) return;
        setErr(e.message || "버전 목록 조회 중 오류가 발생했습니다.");
        setLoading(false);
      }
    }
    fetchVersions();
    return () => { aborted = true; };
  }, [docId]);

  // 최신 버전 id
  const latestId = useMemo(
    () => (revisions.length ? Math.max(...revisions.map(r => r.id)) : null),
    [revisions]
  );

  // ===== UI 상태 =====
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const maxPage = Math.max(1, Math.ceil(revisions.length / pageSize));
  const pageItems = useMemo(
    () => revisions.slice((page - 1) * pageSize, page * pageSize),
    [revisions, page]
  );

  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // 버전 검색
  const [revText, setRevText] = useState<string>("r");
  const inputRef = useRef<HTMLInputElement>(null);
  const sanitizeRev = (raw: string) => "r" + raw.replace(/^r?/i, "").replace(/\D+/g, "");
  const onRevChange = (e: React.ChangeEvent<HTMLInputElement>) => setRevText(sanitizeRev(e.target.value));
  const onRevKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.target as HTMLInputElement;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if ((e.key === "Backspace" && start === 1 && end === 1) || (e.key === "Delete" && start === 0 && end <= 1)) {
      e.preventDefault(); return;
    }
    if (e.key === "Enter") goToRevision();
  };
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const goToRevision = () => {
    const n = parseInt(revText.slice(1), 10);
    if (Number.isNaN(n)) return;
    const idx = revisions.findIndex((r) => r.id === n);
    if (idx === -1) return;
    const targetPage = Math.floor(idx / pageSize) + 1;
    setPage(targetPage);
    setHighlightId(revisions[idx].id);
    setTimeout(() => document.getElementById(`rev-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    setTimeout(() => setHighlightId(null), 1800);
  };

  // 롤백 진행/확인 상태
  const [rollbackingId, setRollbackingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // ✅ 특정 버전으로 되돌리기 (POST, 빈 바디)
  const doRollback = async (versionNumber: number) => {
    if (!docId) return;
    const token = getAccessToken();
    if (!token) {
      navigate('/login', { replace: true, state: { from: location as any }.pathname });
      return;
    }
    try {
      setRollbackingId(versionNumber);
      const url = `${API_BASE}/v1/documents/${docId}/versions/${versionNumber}/rollback`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Accept: '*/*', ...authHeaders() },
        credentials: 'include',
        body: '' // Swagger와 동일하게 빈 바디
      });

      if (res.status === 401) {
        navigate('/login', { replace: true, state: { from: location as any }.pathname });
        return;
      }
      if (res.status === 403) {
        alert('해당 학교 소속만 되돌릴 수 있습니다.');
        return;
      }
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || `되돌리기 실패(${res.status})`);
      }

      const univ = univName || "대학교";
      navigate(`/univ/${enc(univ)}/docs/${enc(documentTitle)}`, {
        replace: true,
        state: { flash: { msg: `r${versionNumber} 버전으로 되돌렸습니다.` } },
      });
    } catch (e: any) {
      alert(e?.message || '되돌리기 중 오류가 발생했습니다.');
    } finally {
      setRollbackingId(null);
      setConfirmId(null);
    }
  };

  // 페이저
  const Pager = ({ className = "" }: { className?: string }) => (
    <div className={`inline-flex items-stretch overflow-hidden rounded-[10px] border border-[#B3B3B3] bg-[#FAFAFA] ${className}`}>
      <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1} className="px-5 py-2 text-sm font-semibold text-[#7F7F7F] hover:bg-white/40 disabled:opacity-50">
        &lt; 이전
      </button>
      <div className="w-px bg-[#B3B3B3]" />
      <button type="button" onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
        disabled={page === maxPage} className="px-5 py-2 text-sm font-semibold text-[#7F7F7F] hover:bg-white/40 disabled:opacity-50">
        다음 &gt;
      </button>
    </div>
  );

  const safeUniv = univName || "대학교";
  const safeCate = categoryName || "카테고리";

  // ✅ 경로들(모두 univ 하위로 정규화)
  const univHref = `/univ/${enc(safeUniv)}`;
  const cateHref = `/univ/${enc(safeUniv)}/category/${enc(safeCate)}`;
  const docBase = `/univ/${enc(safeUniv)}/docs/${enc(documentTitle)}`;

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 gap-6">
        {/* 좌측 본문 */}
        <div className="lg:col-span-8 space-y-4 lg:pr-10 xl:pr-12">
          {/* 브레드크럼 & 제목 */}
          <section className="p-0">
            <nav className="mb-2 text-[18px] leading-tight" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1">
                <li><Link to={univHref} className="text-[#2C80A0] hover:underline">{safeUniv}</Link></li>
                <li className="mx-1 text-gray-500">›</li>
                <li><Link to={cateHref} className="text-[#2C80A0] hover:underline">{safeCate}</Link></li>
              </ol>
            </nav>
            <h1 className="text-2xl font-semibold text-gray-900">
              <Link to={docBase} className="hover:underline" title="문서 보기로 이동">
                {documentTitle}
              </Link>{" "}
              <span className="text-gray-600 text-lg">(문서 역사)</span>
            </h1>
          </section>

          {/* 상단 액션바 */}
          <div className="flex flex-wrap items-center gap-3">
            <Pager />
            <div className="ml-1 flex items-center gap-1">
              <input
                ref={inputRef} type="text" inputMode="numeric" value={revText}
                onChange={onRevChange} onKeyDown={onRevKeyDown}
                className="h-9 w-28 rounded-md border border-[#B3B3B3] bg-white px-2 text-sm text-gray-800 outline-none focus:border-[#2C80A0] focus:ring-2 focus:ring-[#2C80A0]"
                aria-label="버전 번호 (예: r120)"
              />
              <button onClick={goToRevision}
                className="h-9 px-3 rounded-md border border-[#B3B3B3] bg-[#2C80A0] hover:brightness-95 inline-flex items-center justify-center"
                title="해당 버전으로 이동">
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* 로딩/에러 */}
          {loading && <div className="text-sm text-gray-600">버전 목록을 불러오는 중…</div>}
          {err && !loading && <div className="text-sm text-rose-600">오류: {err}</div>}

          {/* 히스토리 리스트 */}
          {!loading && !err && (
            <ul className="divide-y divide-gray-200">
              {pageItems.map((rev) => {
                const asking = confirmId === rev.id;
                const working = rollbackingId === rev.id;
                const isLatest = latestId != null && rev.id === latestId;

                return (
                  <li key={rev.id} id={`rev-${rev.id}`} className="relative block w-full">
                    <div className="relative z-10 px-2 py-3">
                      <div className="flex w-full items-center">
                        <div className="min-w-0 flex-1 text-sm">
                          <div className="flex min-w-0 items-center whitespace-nowrap">
                            <span className="mr-2 text-gray-400">•</span>
                            <span className="mr-3 text-gray-800">r{rev.id}</span>

                            <span className="mr-3 text-gray-400">|</span>
                            <span className="mr-3 text-gray-700">{fmtDateSmart(rev.createdAt, loadedAtMs)}</span>

                            <span className="mr-3 text-gray-400">|</span>
                            <Link
                              to={`/user/contributions?user=${encodeURIComponent(rev.author)}`}
                              className="mr-3 text-gray-700 hover:underline"
                              title={`${rev.author}의 문서 기여 목록`}
                            >
                              {rev.author}
                            </Link>

                            <span className="mr-3 text-gray-400">|</span>
                            <span className={`mr-3 font-semibold ${rev.delta >= 0 ? "text-sky-600" : "text-rose-600"}`}>
                              {rev.delta >= 0 ? `+${rev.delta}` : rev.delta}
                            </span>

                            <span className="ml-1 truncate text-[#B3B3B3]">({rev.summary || "변경 메모 없음"})</span>
                          </div>
                        </div>

                        <div className="ml-4 shrink-0 text-right text-sm">
                          <Link
                            to={`${docBase}/versions/${rev.id}`}
                            className="text-[#2C80A0] hover:underline"
                          >
                            보기
                          </Link>
                          <span className="mx-2 text-gray-400">|</span>

                          {/* 최신 버전은 되돌리기 금지 */}
                          {isLatest ? (
                            <button
                              type="button"
                              className="text-gray-400 cursor-not-allowed"
                              disabled
                              title="최신 버전은 되돌릴 수 없습니다."
                              aria-disabled="true"
                            >
                              이 버전으로 되돌리기
                            </button>
                          ) : !asking ? (
                            <button
                              type="button"
                              className="text-[#2C80A0] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => setConfirmId(rev.id)}
                              disabled={!!rollbackingId}
                              title="이 버전으로 현재 문서를 되돌립니다"
                            >
                              이 버전으로 되돌리기
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                className="rounded-md border border-[#B3B3B3] px-2 py-0.5 text-gray-700 hover:bg-white/60"
                                onClick={() => setConfirmId(null)}
                                disabled={working}
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                className="rounded-md border border-[#B3B3B3] px-2 py-0.5 bg-[#2C80A0] text-white hover:brightness-95 disabled:opacity-60"
                                onClick={() => doRollback(rev.id)}
                                disabled={working}
                              >
                                {working ? "되돌리는 중…" : "되돌리기"}
                              </button>
                            </span>
                          )}

                          <span className="mx-2 text-gray-400">|</span>
                          <Link to={`${docBase}/discussions`} className="text-[#2C80A0] hover:underline">
                            토론
                          </Link>
                          <span className="mx-2 text-gray-400">|</span>

                          {/* 최신본과 비교: diff 페이지로 이동 */}
                          <Link
                            to={`${docBase}/versions/${rev.id}/diff${docId ? `?docId=${docId}` : ""}`}
                            className="text-[#2C80A0] hover:underline"
                            title="이 버전을 최신본과 비교"
                          >
                            비교
                          </Link>
                        </div>
                      </div>

                      {!isLatest && asking && (
                        <div className="mt-2 rounded-md bg-[#FFE6EE] px-3 py-2 text-[13px] text-[#7A1240] border border-[#F5A3C0]">
                          현재 최신 내용이 <b>r{rev.id}</b> 기준으로 덮어씌워집니다. 실행 후 되돌릴 수 없습니다.
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && !err && (
            <div className="pt-2"><Pager /></div>
          )}
        </div>
      </div>

      {showTop && (
        <button
          onClick={scrollTop}
          className="fixed bottom-6 right-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#5C5C5C] bg-white text-[#5C5C5C] shadow-sm hover:bg-gray-50"
          aria-label="문서 상단으로 이동" title="문서 상단으로 이동"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
