// src/pages/DocumentHistoryPage.tsx
import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronUp, ChevronRight } from "lucide-react";

import { getAccessToken, authHeaders } from "@/utils/auth";

type Revision = {
  id: number;
  delta: number;
  author: string;
  createdAt: string;
  summary: string;
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

// 로그인 시 localStorage에 저장된 "사용자 소속 대학 ID" 읽기
// universityId / myUniversityId / univId 순으로 찾아봄
function getViewerUnivIdFromStorage(): number | null {
  try {
    const keys = ["universityId", "myUniversityId", "univId"];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw || raw === "null" || raw === "undefined") continue;
      const n = Number(raw);
      if (Number.isFinite(n)) return n;
    }
  } catch {}
  return null;
}

/** timezone 표기 없으면 'Z' 추가해 UTC로 파싱 */
function parseServerUtc(iso: string): Date {
  const hasTZ = /Z$|[+-]\d\d:\d\d$/.test(iso);
  return new Date(hasTZ ? iso : iso + "Z");
}
/** KST YYYY.MM.DD */
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
/** 상대시간 */
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
  const [univId, setUnivId] = useState<number | null>(null);

  // 상대시간용 "조회 시각" 스냅샷
  const [loadedAtMs, setLoadedAtMs] = useState<number>(Date.now());

  // ===== 플래시 배너 =====
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const showFlash = (msg: string, ms = 3000) => {
    setFlashMsg(msg);
    window.clearTimeout((showFlash as any)._t);
    (showFlash as any)._t = window.setTimeout(() => setFlashMsg(null), ms);
  };

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
        setUnivId(
          typeof data.universityId === "number" && Number.isFinite(data.universityId)
            ? data.universityId
            : null
        );
      } catch (e: any) {
        if (aborted) return;
        const msg = e?.message || "문서 조회 중 오류가 발생했습니다.";
        setErr(msg);
        showFlash(msg);
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
        const msg = e?.message || "버전 목록 조회 중 오류가 발생했습니다.";
        setErr(msg);
        showFlash(msg);
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

  // 버전 검색 (숫자만 입력)
  const [revText, setRevText] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const sanitizeDigits = (raw: string) => raw.replace(/\D+/g, "");
  const onRevChange = (e: React.ChangeEvent<HTMLInputElement>) => setRevText(sanitizeDigits(e.target.value));
  const onRevKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") goToRevision();
  };

  // 하이라이트 대상 ID
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const goToRevision = () => {
    const n = parseInt(revText, 10);
    if (Number.isNaN(n)) return;
    const idx = revisions.findIndex((r) => r.id === n);
    if (idx === -1) return;
    const targetPage = Math.floor(idx / pageSize) + 1;
    setPage(targetPage);
    setHighlightId(revisions[idx].id);
    setTimeout(() => {
      document.getElementById(`rev-${n}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
    setTimeout(() => setHighlightId(null), 1800);
  };

  // 롤백 진행/확인 상태
  const [rollbackingId, setRollbackingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  // 특정 버전으로 되돌리기
  const doRollback = async (versionNumber: number) => {
    if (!docId) return;
    const token = getAccessToken();
    if (!token) {
      navigate('/login', { replace: true, state: { from: (location as any).pathname } });
      return;
    }
    try {
      setRollbackingId(versionNumber);
      const url = `${API_BASE}/v1/documents/${docId}/versions/${versionNumber}/rollback`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Accept: '*/*', ...authHeaders() },
        credentials: 'include',
        body: ''
      });

      if (res.status === 401) {
        navigate('/login', { replace: true, state: { from: (location as any).pathname } });
        return;
      }

      let bodyText = "";
      try { bodyText = await res.clone().text(); } catch {}

      const lower = (bodyText || "").toLowerCase();
      const looksBlocked =
        res.status === 423 || res.status === 451 ||
        lower.includes("blocked") || lower.includes("block") || lower.includes("차단");

      if (res.status === 403 && !looksBlocked) {
        showFlash('해당 학교 소속만 되돌릴 수 있습니다.');
        return;
      }

      if (!res.ok) {
        if (looksBlocked) {
          showFlash('차단된 사용자입니다.');
          return;
        }
        showFlash(bodyText || `되돌리기 실패(${res.status})`);
        return;
      }

      const univ = univName || "대학교";
      navigate(`/univ/${enc(univ)}/docs/${enc(documentTitle)}`, {
        replace: true,
        state: { flash: { msg: `r${versionNumber} 버전으로 되돌렸습니다.` } },
      });
    } catch (e: any) {
      showFlash(e?.message || '되돌리기 중 오류가 발생했습니다.');
    } finally {
      setRollbackingId(null);
      setConfirmId(null);
    }
  };

  // 페이저
  const Pager = ({ className = "" }: { className?: string }) => (
    <div className={`inline-flex items-stretch overflow-hidden rounded-[10px] border border-[#B3B3B3] bg-[#FAFAFA] ${className}`}>
      <button
        type="button"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-5 py-2 text-sm font-semibold text-[#7F7F7F] hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        &lt; 이전
      </button>
      <div className="w-px bg-[#B3B3B3]" />
      <button
        type="button"
        onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
        disabled={page === maxPage}
        className="px-5 py-2 text-sm font-semibold text-[#7F7F7F] hover:bg:white/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        다음 &gt;
      </button>
    </div>
  );

  const safeUniv = univName || "대학교";
  const safeCate = categoryName || "카테고리";

  const univHref = `/univ/${enc(safeUniv)}`;
  const catePathBase = `/univ/${enc(safeUniv)}/category/${enc(safeCate)}`;
  const cateHref = typeof univId === "number" ? `${catePathBase}?universityId=${univId}` : catePathBase;
  const docBase = `/univ/${enc(safeUniv)}/docs/${enc(documentTitle)}`;

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 gap-6">
        {/* 상단 플래시 배너 */}
        {flashMsg && (
          <div
            role="status"
            className="mb-4 flex items-center justify-between rounded-lg bg-[#2C80A0] px-4 py-3 text-white"
          >
            <span className="text-[15px]">{flashMsg}</span>
            <button
              onClick={() => setFlashMsg(null)}
              className="hover:opacity-80 cursor-pointer"
            >
              닫기
            </button>
          </div>
        )}

        {/* 좌측 본문 */}
        <div className="lg:col-span-8 space-y-4 lg:pr-10 xl:pr-12">
          {/* 브레드크럼 & 제목 */}
          <section className="p-0">
            <nav className="mb-2 text-[18px] leading-tight" aria-label="Breadcrumb">
              <ol className="flex items-center gap-1">
                <li><Link to={univHref} className="text-[#2C80A0] hover:underline">{safeUniv}</Link></li>
                <li className="mx-1 text-gray-500">›</li>
                <li>
                  <Link
                    to={cateHref}
                    state={typeof univId === "number" ? { universityId: univId } : undefined}
                    className="text-[#2C80A0] hover:underline"
                  >
                    {safeCate}
                  </Link>
                </li>
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
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={revText}
                onChange={onRevChange}
                onKeyDown={onRevKeyDown}
                placeholder="(예시 : 11)"
                title="검색하고자 하는 버전 번호를 입력하세요"
                className="h-9 w-28 rounded-md border border-[#B3B3B3] bg-white px-2 text-sm text-gray-800 outline-none focus:border-[#2C80A0] focus:ring-2 focus:ring-[#2C80A0] placeholder:text-gray-400"
                aria-label="버전 번호 숫자 입력 (예: 11)"
              />
              <button
                onClick={goToRevision}
                className="h-9 px-3 rounded-md border border-[#B3B3B3] bg-[#2C80A0] hover:brightness-95 inline-flex items-center justify-center cursor-pointer"
                title="해당 버전으로 이동"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* 로딩/에러 표시 */}
          {loading && <div className="text-sm text-gray-600">버전 목록을 불러오는 중…</div>}
          {err && !loading && <div className="text-sm text-rose-600">오류: {err}</div>}

          {/* 히스토리 리스트 */}
          {!loading && !err && (
            <ul className="divide-y divide-gray-200">
              {pageItems.map((rev) => {
                const asking = confirmId === rev.id;
                const working = rollbackingId === rev.id;
                const isLatest = latestId != null && rev.id === latestId;
                const isVersion1 = rev.id === 1; // r1은 비교 비활성화
                const isHighlighted = highlightId === rev.id;

                // 문서 대학 ID vs 사용자 대학 ID(localStorage) 비교
                const viewerUnivId = getViewerUnivIdFromStorage();
                const isForeignViewer =
                  typeof univId === "number" &&
                  Number.isFinite(univId) &&
                  viewerUnivId !== univId; // viewerUnivId가 null이어도 => mismatch → 차단

                return (
                  <li key={rev.id} id={`rev-${rev.id}`} className="relative block w-full">
                    <div
                      className={
                        "relative z-10 px-2 py-3 rounded-md transition-[background-color] duration-300 " +
                        (isHighlighted ? "bg-[#2C80A0]/15" : "")
                      }
                    >
                      <div className="flex w-full items-center">
                        <div className="min-w-0 flex-1 text-sm">
                          <div className="flex min-w-0 items-center whitespace-nowrap">
                            <span className="mr-2 text-gray-400">•</span>
                            <span className="mr-3 text-gray-800">r{rev.id}</span>

                            <span className="mr-3 text-gray-400">|</span>
                            <span className="mr-3 text-gray-700">{fmtDateSmart(rev.createdAt, loadedAtMs)}</span>

                            <span className="mr-3 text-gray-400">|</span>
                            <span className="mr-3 text-gray-700">{rev.author}</span>

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
                              className="text-[#2C80A0] hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              onClick={() => {
                                // 클릭 순간 소속 대학 체크: 아니면 바로 플래시만 띄우고 종료
                                if (isForeignViewer) {
                                  showFlash('해당 학교 소속만 되돌릴 수 있습니다.');
                                  return;
                                }
                                setConfirmId(rev.id);
                              }}
                              disabled={!!rollbackingId}
                              title="이 버전으로 현재 문서를 되돌립니다"
                            >
                              이 버전으로 되돌리기
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                className="rounded-md border border-[#B3B3B3] px-2 py-0.5 text-gray-700 hover:bg-white/60 cursor-pointer disabled:cursor-not-allowed"
                                onClick={() => setConfirmId(null)}
                                disabled={working}
                              >
                                취소
                              </button>
                              <button
                                type="button"
                                className="rounded-md border border-[#B3B3B3] px-2 py-0.5 bg-[#2C80A0] text-white hover:brightness-95 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                                onClick={() => doRollback(rev.id)}
                                disabled={working}
                              >
                                {working ? "되돌리는 중…" : "되돌리기"}
                              </button>
                            </span>
                          )}

                          <span className="mx-2 text-gray-400">|</span>

                          {isVersion1 ? (
                            <span
                              className="text-gray-400 cursor-not-allowed"
                              title="r1은 비교할 수 없습니다."
                              aria-disabled="true"
                            >
                              비교
                            </span>
                          ) : (
                            <Link
                              to={`${docBase}/versions/${rev.id}/diff${docId ? `?docId=${docId}` : ""}`}
                              className="text-[#2C80A0] hover:underline"
                              title="이 버전을 직전 버전과 비교"
                            >
                              비교
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* 경고 문구(되돌리기 확인 모드) */}
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

          {/* 하단 페이징: 한 페이지 표시 개수가 15 미만이면 숨김 */}
          {!loading && !err && pageItems.length >= 15 && (
            <div className="pt-2"><Pager /></div>
          )}
        </div>
      </div>

      {showTop && (
        <button
          onClick={scrollTop}
          className="fixed bottom-6 right-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#5C5C5C] bg-white text-[#5C5C5C] shadow-sm hover:bg-gray-50 cursor-pointer"
          aria-label="문서 상단으로 이동" title="문서 상단으로 이동"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
