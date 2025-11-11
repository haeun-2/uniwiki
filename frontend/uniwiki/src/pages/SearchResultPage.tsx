// src/pages/SearchResultPage.tsx

import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import RecentEdit from "../layout/RecentEdit";
import RecentDiscuss from "../layout/RecentDiscuss";

interface SearchResultItem {
  title: string;
  preview: string;
  universityName: string;
}

interface SearchResponse {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasPre: boolean;
  hasNext: boolean;
  content: SearchResultItem[];
}

export default function SearchResultPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // API는 0부터 시작
  const [totalPages, setTotalPages] = useState(0);
  const [hasPre, setHasPre] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  // 검색 API 호출
  useEffect(() => {
    if (!query) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        
        const res = await fetch(
          `https://k13d104.p.ssafy.io/api/v1/search/keyword?query=${encodeURIComponent(query)}&page=${currentPage}&size=10`,
          {
            method: "GET",
            headers: {
              "Accept": "*/*",
            },
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data: SearchResponse = await res.json();
        
        if (mounted) {
          setResults(data.content || []);
          setTotalCount(data.totalElements || 0);
          setTotalPages(data.totalPages || 0);
          setHasPre(data.hasPre);
          setHasNext(data.hasNext);
        }
      } catch (error) {
        console.error("검색 실패:", error);
        if (mounted) {
          setResults([]);
          setTotalCount(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [query, currentPage]);

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 페이지네이션 버튼 생성
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 10;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }

    // 이전 버튼
    if (hasPre) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition"
        >
          &lt; 이전
        </button>
      );
    }

    // 페이지 번호
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-sm border rounded transition ${
            i === currentPage
              ? "bg-uniwikicolor text-white border-uniwikicolor"
              : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          {i + 1} {/* 사용자에게는 1부터 표시 */}
        </button>
      );
    }

    // 다음 버튼
    if (hasNext) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition"
        >
          다음 &gt;
        </button>
      );
    }

    return <div className="flex items-center gap-1 justify-center mt-8">{pages}</div>;
  };

  return (
    <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
      {/* 왼쪽: 검색 결과 */}
      <main className="flex-1 min-w-0">
        {/* 검색 정보 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">검색</h1>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              defaultValue={query}
              placeholder="서울대학교"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-uniwikicolor focus:ring-2 focus:ring-uniwikicolor/20"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const newQuery = (e.target as HTMLInputElement).value;
                  if (newQuery) {
                    window.location.href = `/search?q=${encodeURIComponent(newQuery)}`;
                  }
                }
              }}
            />
            <button 
              onClick={() => {
                const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (input?.value) {
                  window.location.href = `/search?q=${encodeURIComponent(input.value)}`;
                }
              }}
              className="rounded-lg bg-uniwikicolor text-white px-4 py-2 hover:bg-uniwikicolor_hover transition"
            >
              검색
            </button>
          </div>
          <p className="text-sm text-gray-600">
            전체 <span className="font-semibold text-gray-900">{totalCount.toLocaleString()}</span> 건
          </p>
        </div>

        {/* 검색 결과 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">검색 중...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            {results.map((item, idx) => (
              <article key={idx} className="pb-6 border-b border-gray-200 last:border-0">
                <Link
                  to={`/univ/${encodeURIComponent(item.universityName)}/docs/${encodeURIComponent(item.title)}`}
                  className="block group"
                >
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-uniwikicolor mb-2 transition">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                    {item.preview}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.universityName}
                  </p>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {query ? `"${query}"에 대한 검색 결과가 없습니다.` : "검색어를 입력하세요."}
            </p>
          </div>
        )}

        {/* 페이지네이션 */}
        {renderPagination()}
      </main>

      {/* 오른쪽: 사이드바 */}
      <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
        <RecentEdit />
        <RecentDiscuss />
      </aside>
    </div>
  );
}