// src/pages/CategoryPage.tsx
import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";

interface CategoryItem {
  documentTitle: string;
  updatedAt: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
}

const PAGE_SIZE = 20; // 한 페이지당 문서 수

export default function CategoryPage() {
  const { univName, categoryName = "" } = useParams<{
    univName?: string;
    categoryName: string;
  }>();
  const location = useLocation();

  // --- universityId 결정: state 우선, 없으면 ?universityId= 쿼리 사용 ---
  const searchParams = new URLSearchParams(location.search);
  const queryUnivId = searchParams.get("universityId");
  const universityIdFromQuery =
    queryUnivId != null && queryUnivId !== "" ? Number(queryUnivId) : undefined;
  const universityId =
    (location.state as any)?.universityId != null
      ? Number((location.state as any).universityId)
      : universityIdFromQuery;

  const [isEnglish, setIsEnglish] = useState<boolean>(false);
  const [selectedLetter, setSelectedLetter] = useState<string>("ㄱ");
  const [documents, setDocuments] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(
    null
  );

  // 클라이언트 페이지네이션용 상태
  const [currentPage, setCurrentPage] = useState<number>(0);

  const koreanConsonants = [
    "ㄱ",
    "ㄴ",
    "ㄷ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅅ",
    "ㅇ",
    "ㅈ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];
  const englishAlphabets = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  const letters = isEnglish ? englishAlphabets : koreanConsonants;

  // 1) 카테고리 목록 조회 → 현재 URL의 categoryName과 이름 매칭해 categoryId 결정
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://k13d104.p.ssafy.io/api/v1/categories",
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );
        if (!res.ok) {
          alert("카테고리 목록을 불러오는데 실패했습니다.");
          return;
        }
        const all: Category[] = await res.json();
        const matched = all.find((c) => c.categoryName === categoryName);
        if (matched) {
          setCurrentCategoryId(matched.categoryId);
        } else {
          console.error("카테고리 이름 매칭 실패:", categoryName);
        }
      } catch (e) {
        console.error("Fetch categories error:", e);
        alert("서버와의 연결에 실패했습니다.");
      }
    };
    fetchCategories();
  }, [categoryName]);

  // 2) 특정 카테고리의 문서 목록 조회(배열 응답 + universityId 필터)
  const fetchDocuments = async () => {
    if (currentCategoryId === null) return;

    setIsLoading(true);
    try {
      const base = `https://k13d104.p.ssafy.io/api/v1/categories/${currentCategoryId}`;
      const qs = new URLSearchParams();
      if (Number.isFinite(universityId as number)) {
        qs.set("universityId", String(universityId));
      }
      const url = qs.toString() ? `${base}?${qs.toString()}` : base;

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        alert("문서 목록을 불러오는데 실패했습니다.");
        return;
      }

      const data: CategoryItem[] = await response.json();
      setDocuments(data || []);
      setCurrentPage(0); // 새로 불러오면 1페이지로 리셋
    } catch (error) {
      console.error("Fetch documents error:", error);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // universityId는 쿼리/상태로 변할 수 있으니 의존성 포함
  }, [currentCategoryId, universityId, location.search]);

  // 전체 문서 기준 페이지네이션 메타 계산
  const totalElements = documents.length;
  const totalPages =
    totalElements === 0 ? 1 : Math.ceil(totalElements / PAGE_SIZE);

  // currentPage가 범위를 벗어나면 보정
  useEffect(() => {
    if (currentPage > 0 && currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
  }, [totalPages, currentPage]);

  const pageStart = currentPage * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const pagedDocuments = documents.slice(pageStart, pageEnd);

  const pagination = {
    page: currentPage,
    size: PAGE_SIZE,
    totalPages,
    totalElements,
    hasPre: currentPage > 0,
    hasNext: currentPage < totalPages - 1,
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 한글 초성 / 알파벳 추출
  const getKoreanConsonant = (text: string): string => {
    const firstChar = text.charAt(0);
    const code = firstChar.charCodeAt(0);

    if (code >= 0xac00 && code <= 0xd7a3) {
      const consonants = [
        "ㄱ",
        "ㄲ",
        "ㄴ",
        "ㄷ",
        "ㄸ",
        "ㄹ",
        "ㅁ",
        "ㅂ",
        "ㅃ",
        "ㅅ",
        "ㅆ",
        "ㅇ",
        "ㅈ",
        "ㅉ",
        "ㅊ",
        "ㅋ",
        "ㅌ",
        "ㅍ",
        "ㅎ",
      ];
      const consonantIndex = Math.floor((code - 0xac00) / 588);
      return consonants[consonantIndex];
    }
    if (/[A-Za-z]/.test(firstChar)) return firstChar.toUpperCase();
    return "기타";
  };

  const groupDocumentsByLetter = () => {
    const grouped: Record<string, CategoryItem[]> = {};
    letters.forEach((letter) => (grouped[letter] = []));
    pagedDocuments.forEach((doc) => {
      const key = getKoreanConsonant(doc.documentTitle);
      if (grouped[key]) grouped[key].push(doc);
    });
    return grouped;
  };

  const groupedDocuments = groupDocumentsByLetter();
  const currentDocuments = groupedDocuments[selectedLetter] || [];

  const splitIntoColumns = (items: CategoryItem[]) => {
    const columnCount = 3;
    const columns: CategoryItem[][] = [[], [], []];
    items.forEach((item, index) => {
      columns[index % columnCount].push(item);
    });
    return columns;
  };

  const columns = splitIntoColumns(currentDocuments);

  const getLatestUpdateTime = () => {
    if (documents.length === 0) return "정보 없음";
    const latestDoc = documents.reduce((latest, current) =>
      new Date(current.updatedAt) > new Date(latest.updatedAt)
        ? current
        : latest
    );
    const date = new Date(latestDoc.updatedAt);
    return date
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

  const handleLanguageToggle = () => {
    setIsEnglish(!isEnglish);
    setSelectedLetter(isEnglish ? "ㄱ" : "A");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <section>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          분류 : {categoryName || "카테고리"}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>최근 수정 시각 {getLatestUpdateTime()}</span>
          <span>•</span>
          <span>총 {documents.length}개의 문서</span>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 왼쪽: 자음/알파벳 네비게이션 */}
        <div className="sticky top-8">
          <div className="w-full lg:w-[80%] lg:mx-auto">
            <button
              onClick={handleLanguageToggle}
              className="w-full h-12 flex items-center justify-center border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition mb-2 cursor-pointer"
            >
              {isEnglish ? "한글 변환 / KR" : "영문 변환 / EN"}
            </button>

            <div
              className="
                flex flex-col gap-2 pr-2
                max-h-[calc(100vh-250px)]
                overflow-y-auto
                scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
                [scrollbar-gutter:stable]
              "
            >
              {letters.map((letter) => {
                const count = groupedDocuments[letter]?.length || 0;
                return (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    className={`w-full h-12 flex items-center justify-between px-4 border rounded transition font-medium flex-shrink-0 cursor-pointer ${
                      selectedLetter === letter
                        ? "bg-[rgba(44,128,160,0.1)] border-uniwikicolor text-uniwikicolor hover:bg-[rgba(44,128,160,0.15)]"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                    aria-pressed={selectedLetter === letter}
                  >
                    <span>{letter}</span>
                    <span className="text-xs text-gray-400">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 중앙: 카테고리 항목들 + 페이지네이션 */}
        <div className="lg:col-span-3">
          <div className="mb-6 pb-4 border-b-2 border-gray-300">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedLetter} ({currentDocuments.length})
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-x-8 gap-y-1">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="space-y-1">
                {column.map((item, idx) => (
                  <div key={idx}>
                    <Link
                      to={
                        univName
                          ? `/univ/${encodeURIComponent(
                              univName
                            )}/docs/${encodeURIComponent(item.documentTitle)}`
                          : `/docs/${encodeURIComponent(item.documentTitle)}`
                      }
                      className="text-sm text-blue-600 hover:underline block py-1"
                    >
                      {item.documentTitle}
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {currentDocuments.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              "{selectedLetter}"로 시작하는 항목이 없습니다.
            </p>
          )}

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-end items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPre}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition"
              >
                이전
              </button>
              <span className="px-3 text-sm text-gray-600">
                {pagination.page + 1} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-white transition"
              >
                다음
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
