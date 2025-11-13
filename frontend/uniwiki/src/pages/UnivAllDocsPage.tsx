// src/pages/UnivAllDocsPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

type UnivDocItem = {
  documentTitle: string;
  updatedAt: string;
  viewCount?: number;
};

export default function UnivAllDocsPage() {
  const { univName } = useParams<{ univName: string }>();
  const location = useLocation();

  const decodedUnivName = useMemo(
    () => (univName ? decodeURIComponent(univName) : ""),
    [univName]
  );

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
  const [documents, setDocuments] = useState<UnivDocItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

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

  // 전체 문서 조회
  useEffect(() => {
    if (!universityId) {
      setIsLoading(false);
      setErr("대학교 정보가 필요합니다.");
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setErr(null);

        // 실제 전체 문서 조회 API
        const baseUrl = "https://k13d104.p.ssafy.io/api/v1/documents";
        const url = `${baseUrl}?universityId=${universityId}`;

        const res = await fetch(url, {
          method: "GET",
          headers: { Accept: "*/*" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: UnivDocItem[] = await res.json();
        if (mounted) setDocuments(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (mounted)
          setErr(e?.message ?? "문서 목록을 불러오지 못했습니다.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [universityId, location.search]);

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
    const grouped: Record<string, UnivDocItem[]> = {};
    letters.forEach((letter) => (grouped[letter] = []));
    documents.forEach((doc) => {
      const key = getKoreanConsonant(doc.documentTitle);
      if (grouped[key]) grouped[key].push(doc);
    });
    return grouped;
  };

  const groupedDocuments = groupDocumentsByLetter();
  const currentDocuments = groupedDocuments[selectedLetter] || [];

  const splitIntoColumns = (items: UnivDocItem[]) => {
    const columnCount = 3;
    const columns: UnivDocItem[][] = [[], [], []];
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
        <div className="text-gray-500 text-sm">불러오는 중...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-500 text-sm">{err}</div>
      </div>
    );
  }

  return (
    <section>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {decodedUnivName || "대학교"} 전체 문서
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
              className="w-full h-12 flex items-center justify-center border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition mb-2"
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
                    className={`w-full h-12 flex items-center justify-between px-4 border rounded transition font-medium flex-shrink-0 ${
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

        {/* 중앙: 전체 문서 항목들 */}
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
        </div>
      </div>
    </section>
  );
}
