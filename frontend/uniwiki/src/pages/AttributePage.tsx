// src/pages/AttributePage.tsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface Contribution {
  documentId: number;
  documentName: string;
  universityName: string;
  editMemo: string;
  plusCount: number;
  minusCount: number;
  updateAt: string;
}

interface PaginationResponse {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasPre: boolean;
  hasNext: boolean;
  content: Contribution[];
}

export default function AttributePage() {
  const navigate = useNavigate();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 15,
    totalPages: 0,
    totalElements: 0,
    hasPre: false,
    hasNext: false,
  });

  // 기여 문서 목록 조회
  const fetchContributions = async (page: number) => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://k13d104.p.ssafy.io/api/v1/users/me/documents?page=${page}&size=15`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/json",
          },
        }
      );

      if (response.ok) {
        const data: PaginationResponse = await response.json();
        setContributions(data.content || []);
        setPagination({
          page: data.page,
          size: data.size,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          hasPre: data.hasPre,
          hasNext: data.hasNext,
        });
      } else if (response.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("accessToken");
        navigate("/login");
      } else {
        alert("기여 문서 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Fetch contributions error:", error);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions(currentPage);
  }, [currentPage]);

  // 페이지 변경 함수
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 날짜 포맷 변환
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\. /g, '.').replace(/\.$/, '');
  };

  // 바이트 변화량 계산
  const getByteChange = (plusCount: number, minusCount: number) => {
    return plusCount - minusCount;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <h1 className="mb-8 text-3xl font-semibold text-gray-900">내가 기여한 문서 목록</h1>

      {/* 페이지네이션 버튼 (상단) */}
      {pagination.totalPages > 1 && (
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPre}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt; 이전
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음 &gt;
          </button>
        </div>
      )}

      {/* 기여 목록 */}
      <div className="space-y-4">
        {contributions.map((contribution) => {
          const byteChange = getByteChange(contribution.plusCount, contribution.minusCount);
          
          return (
            <div key={contribution.documentId} className="border-b border-gray-200 pb-4">
              {/* 첫 번째 줄: 문서 제목 */}
              <div className="mb-1">
                <Link
                  to={`/docs/${encodeURIComponent(contribution.documentName)}`}
                  className="text-base font-normal text-gray-900 hover:underline"
                >
                  {contribution.documentName}
                </Link>
              </div>

              {/* 두 번째 줄: 대학명, 시간, 바이트 변화, 요약 */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-900">{contribution.universityName}</span>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">{formatDate(contribution.updateAt)}</span>
                <span
                  className={`font-medium ${
                    byteChange > 0 ? "text-green-600" : byteChange < 0 ? "text-red-600" : "text-gray-600"
                  }`}
                >
                  {byteChange > 0 ? "+" : ""}
                  {byteChange}
                </span>
                <span className="text-gray-400">({contribution.editMemo || "수정 내용 없음"})</span>

                {/* 오른쪽 링크들 */}
                <div className="ml-auto flex gap-2 text-gray-600">
                  <Link 
                    to={`/docs/${encodeURIComponent(contribution.documentName)}/history`} 
                    className="hover:underline"
                  >
                    역사
                  </Link>
                  <span>|</span>
                  <Link 
                    to={`/docs/${encodeURIComponent(contribution.documentName)}/discussions`} 
                    className="hover:underline"
                  >
                    토론
                  </Link>
                  <span>|</span>
                  <Link 
                    to={`/docs/${encodeURIComponent(contribution.documentName)}/history`} 
                    className="hover:underline"
                  >
                    비교
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {contributions.length === 0 && (
        <div className="py-12 text-center text-gray-500">기여한 문서가 없습니다.</div>
      )}

      {/* 페이지네이션 버튼 (하단) */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPre}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt; 이전
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음 &gt;
          </button>
        </div>
      )}
    </div>
  );
}