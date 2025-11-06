// src/pages/DiscussionHistoryPage.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface DiscussionRow {
  discussionId: number;
  discussionName: string;   // 토론 제목
  documentTitle: string;    // 문서 제목(라우팅에 사용)
  updateAt: string;         // ISO
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
        `http://k13d104.p.ssafy.io/api/v1/users/me/discussions?page=${page}&size=${pageSize}`,
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
              {/* 토론 제목 */}
              <Link
                to={`/docs/${encodeURIComponent(row.documentTitle)}/discussions/${row.discussionId}`}
                className="text-sm font-semibold text-uniwikicolor hover:underline"
                title={row.discussionName}
              >
                • {row.discussionName}
              </Link>
              {/* 문서명 */}
              <span className="text-sm text-gray-500">{row.documentTitle}</span>
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
