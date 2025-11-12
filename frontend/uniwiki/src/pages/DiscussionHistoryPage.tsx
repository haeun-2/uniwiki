// src/pages/DiscussionHistoryPage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const API_BASE = "https://k13d104.p.ssafy.io/api";
const FLASH_AUTO_MS = 1800;          // 플래시 표시 시간(끝나면 이동)
const REDIRECT_AFTER_MS = FLASH_AUTO_MS + 50; // 플래시가 사라진 직후로 살짝 여유

interface DiscussionRow {
  discussionId: number;
  discussionName: string;   // 토론 제목
  documentTitle: string;    // 문서 제목(라우팅에 사용)
  updateAt: string;         // ISO
  universityName?: string;
}

interface PaginationResponse<T> {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasPre: boolean;
  hasNext: boolean;
  content: T[];
}

export default function DiscussionHistoryPage() {
  const navigate = useNavigate();

  // ── Flash (LoginPage와 동일한 스타일)
  const [flash, setFlash] = useState("");
  const [flashType, setFlashType] = useState<"success" | "error" | "info">("info");
  const flashTimerRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);

  const showFlash = (
    msg: string,
    type: "success" | "error" | "info" = "info",
    autoMs = FLASH_AUTO_MS
  ) => {
    setFlash(msg);
    setFlashType(type);
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    // 자동 닫기
    flashTimerRef.current = window.setTimeout(() => setFlash(""), autoMs);
  };

  const scheduleRedirectToLogin = (msg: string) => {
    showFlash(msg, "error", FLASH_AUTO_MS);
    if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    // 플래시가 사라진 직후 로그인으로 이동
    redirectTimerRef.current = window.setTimeout(() => {
      navigate("/login", { replace: true });
    }, REDIRECT_AFTER_MS);
  };

  const closeFlash = () => {
    if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    setFlash("");
  };

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
      if (redirectTimerRef.current) window.clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const getFlashStyle = () => {
    switch (flashType) {
      case "success": return "bg-green-500/80 border-green-600/40";
      case "error":   return "bg-red-500/80 border-red-600/40";
      default:        return "bg-blue-500/80 border-blue-600/40";
    }
  };

  // 서버 페이징은 0-base
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const [rows, setRows] = useState<DiscussionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 0,
    size: pageSize,
    totalPages: 0,
    totalElements: 0,
    hasPre: false,
    hasNext: false,
  });

  // 날짜 포맷 (서버 ISO → 2025-11-05 13:29)
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d
      .toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/\. /g, "-")
      .replace(".", "");
  };

  const enc = (s: string) => encodeURIComponent(s || "");

  // 문서 상세로부터 universityName 필요시 조회
  const fetchUnivNameIfNeeded = async (title: string): Promise<string | null> => {
    try {
      const token = localStorage.getItem("accessToken") || "";
      const res = await fetch(`${API_BASE}/v1/documents/${enc(title)}`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) return null;
      const j = await res.json();
      return j.universityName ?? j.univName ?? j.university ?? null;
    } catch {
      return null;
    }
  };

  // 행 클릭 → 정확한 경로로 이동
  const goToDiscussion = async (row: DiscussionRow) => {
    const docTitle = row.documentTitle || "";
    let univName = (row.universityName || "").trim();

    if (!univName) {
      const fetched = await fetchUnivNameIfNeeded(docTitle);
      if (fetched) univName = fetched;
    }

    if (!univName) {
      showFlash("해당 문서의 대학교 정보를 찾지 못했습니다. 잠시 후 다시 시도해 주세요.", "error");
      return;
    }

    navigate(`/univ/${enc(univName)}/docs/${enc(docTitle)}/discussions/${row.discussionId}`);
  };

  // API 호출
  const fetchDiscussions = async (page: number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // ✅ 토큰 없으면: 플래시 → 자동 이동
      scheduleRedirectToLogin("로그인이 필요한 페이지입니다.");
      return;
    }

    setIsLoading(true);
    try {
      const resp = await fetch(
        `${API_BASE}/v1/users/me/discussions?page=${page}&size=${pageSize}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (resp.ok) {
        const data: PaginationResponse<DiscussionRow> = await resp.json();
        setRows(data.content ?? []);
        setPagination({
          page: data.page,
          size: data.size,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          hasPre: data.hasPre,
          hasNext: data.hasNext,
        });
      } else if (resp.status === 401) {
        // ✅ 만료: 토큰 제거 후 플래시 → 자동 이동
        localStorage.removeItem("accessToken");
        scheduleRedirectToLogin("로그인이 만료되었습니다. 다시 로그인해주세요.");
      } else {
        showFlash("목록을 불러오지 못했습니다.", "error");
      }
    } catch (e) {
      console.error("fetch discussions error:", e);
      showFlash("서버와의 연결에 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePrev = () => setCurrentPage((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrentPage((p) => p + 1);

  if (isLoading) {
    return (
      <>
        {/* Flash */}
        {flash && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-slideDown">
            <div className={`${getFlashStyle()} min-w-[320px] max-w-md rounded-xl border px-6 py-4 shadow-lg backdrop-blur-[2px] flex items-center justify-between gap-4`}>
              <span className="text-white font-medium text-base flex-1">{flash}</span>
              <button onClick={closeFlash} className="text-white hover:text-gray-200 transition-colors flex-shrink-0" aria-label="닫기">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
        <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}.animate-slideDown{animation:slideDown .3s ease-out}`}</style>

        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-gray-500">불러오는 중…</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Flash */}
      {flash && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-slideDown">
          <div className={`${getFlashStyle()} min-w-[320px] max-w-md rounded-xl border px-6 py-4 shadow-lg backdrop-blur-[2px] flex items-center justify-between gap-4`}>
            <span className="text-white font-medium text-base flex-1">{flash}</span>
            <button onClick={closeFlash} className="text-white hover:text-gray-200 transition-colors flex-shrink-0" aria-label="닫기">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}.animate-slideDown{animation:slideDown .3s ease-out}`}</style>

      <div>
        <h1 className="mb-8 text-3xl font-semibold text-gray-900">내가 기여한 토론</h1>

        {pagination.totalPages > 1 && (
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={!pagination.hasPre}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              &lt; 이전
            </button>
            <span className="text-sm text-gray-600">
              {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={!pagination.hasNext}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              다음 &gt;
            </button>
          </div>
        )}

        <div className="space-y-0">
          {rows.map((row) => (
            <div
              key={row.discussionId}
              className="flex items-center justify-between border-b border-gray-200 py-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => goToDiscussion(row)}
                  className="text-left text-sm font-semibold text-uniwikicolor hover:underline"
                  title={row.discussionName}
                >
                  • {row.discussionName}
                </button>
                <span className="text-sm text-gray-500">{row.documentTitle}</span>
                {row.universityName && (
                  <span className="text-xs text-gray-400">/ {row.universityName}</span>
                )}
              </div>
              <div className="text-sm text-gray-600">{formatDate(row.updateAt)}</div>
            </div>
          ))}
        </div>

        {rows.length === 0 && (
          <div className="py-12 text-center text-gray-500">참여한 토론이 없습니다.</div>
        )}

        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={!pagination.hasPre}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              &lt; 이전
            </button>
            <span className="text-sm text-gray-600">
              {pagination.page + 1} / {pagination.totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={!pagination.hasNext}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              다음 &gt;
            </button>
          </div>
        )}
      </div>
    </>
  );
}
