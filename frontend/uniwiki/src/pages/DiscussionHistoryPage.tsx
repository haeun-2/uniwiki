// src/pages/DiscussionHistoryPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://k13d104.p.ssafy.io/api";

interface DiscussionRow {
  discussionId: number;
  discussionName: string;   // 토론 제목
  documentTitle: string;    // 문서 제목(라우팅에 사용)
  updateAt: string;         // ISO
  // 🔹 백에서 제공되면 즉시 사용, 없으면 클릭 시 문서 상세 조회로 보완
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

  // 서버 페이징은 0-base이므로 currentPage도 0부터 시작
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

  // 안전 인코딩
  const enc = (s: string) => encodeURIComponent(s || "");

  // 문서 상세로부터 universityName을 필요시에만 조회
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
      // 서버의 키 후보들 중 하나를 안전히 참조
      return j.universityName ?? j.univName ?? j.university ?? null;
    } catch {
      return null;
    }
  };

  // 행 클릭 → 올바른 /univ/:univName/docs/:documentTitle/discussions/:id 로 이동
  const goToDiscussion = async (row: DiscussionRow) => {
    const docTitle = row.documentTitle || "";
    let univName = (row.universityName || "").trim();

    if (!univName) {
      // 필요시에만 추가 조회
      const fetched = await fetchUnivNameIfNeeded(docTitle);
      if (fetched) univName = fetched;
    }

    if (!univName) {
      // 최후의 폴백: 사용자에게 안내하고 이동 중단(잘못된 경로로 보내지 않음)
      alert("해당 문서의 대학교 정보를 찾지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    navigate(`/univ/${enc(univName)}/docs/${enc(docTitle)}/discussions/${row.discussionId}`);
  };

  // API 호출
  const fetchDiscussions = async (page: number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
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
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        alert("참여 토론 목록을 불러오지 못했습니다.");
      }
    } catch (e) {
      console.error("fetch discussions error:", e);
      alert("서버와의 연결에 실패했습니다.");
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
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">불러오는 중…</div>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <h1 className="mb-8 text-3xl font-semibold text-gray-900">내가 기여한 토론</h1>

      {/* 상단 페이지네이션 */}
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

      {/* 목록 */}
      <div className="space-y-0">
        {rows.map((row) => (
          <div
            key={row.discussionId}
            className="flex items-center justify-between border-b border-gray-200 py-4"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* 토론 제목 — 버튼으로 바꿔 onClick에서 정확 경로로 내비게이션 */}
              <button
                onClick={() => goToDiscussion(row)}
                className="text-left text-sm font-semibold text-uniwikicolor hover:underline"
                title={row.discussionName}
              >
                • {row.discussionName}
              </button>

              {/* 문서명 */}
              <span className="text-sm text-gray-500">{row.documentTitle}</span>
              {/* (선택) 대학교명 노출: 응답에 universityName 있으면 표시 */}
              {row.universityName && (
                <span className="text-xs text-gray-400">/ {row.universityName}</span>
              )}
            </div>
            {/* 업데이트 시간 */}
            <div className="text-sm text-gray-600">{formatDate(row.updateAt)}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="py-12 text-center text-gray-500">참여한 토론이 없습니다.</div>
      )}

      {/* 하단 페이지네이션 */}
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
  );
}
