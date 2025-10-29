// src/pages/CategoryPage.tsx

import { useState } from "react";
import { Link, useParams } from "react-router-dom";

interface CategoryItem {
  id: number;
  name: string;
}

export default function CategoryPage() {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [isEnglish, setIsEnglish] = useState<boolean>(false);
  const [selectedLetter, setSelectedLetter] = useState<string>("ㄱ");

  const koreanConsonants = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  const englishAlphabets = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  const letters = isEnglish ? englishAlphabets : koreanConsonants;

  const categoryData: Record<string, CategoryItem[][]> = {
    ㄱ: [
      [
        { id: 1, name: "가곡의 역사" },
        { id: 2, name: "고전문학 개론" },
        { id: 3, name: "근대문학사" },
        { id: 4, name: "구비문학론" },
      ],
      [
        { id: 5, name: "고학가요 연구" },
        { id: 6, name: "국문학개설" },
        { id: 7, name: "고전소설론" },
        { id: 8, name: "근세문학사" },
      ],
      [
        { id: 9, name: "갈래별 문학사" },
        { id: 10, name: "공중문학 연구" },
        { id: 11, name: "고전사가론" },
        { id: 12, name: "국어국문학과" },
      ],
    ],
    ㄴ: [
      [
        { id: 1, name: "나노공학" },
        { id: 2, name: "노동경제학" },
        { id: 3, name: "논리학개론" },
      ],
      [
        { id: 4, name: "뇌과학입문" },
        { id: 5, name: "뉴미디어론" },
      ],
      [
        { id: 6, name: "냉전사" },
        { id: 7, name: "농업경제학" },
      ],
    ],
    ㄷ: [
      [
        { id: 1, name: "데이터구조" },
        { id: 2, name: "동양철학" },
        { id: 3, name: "디지털공학" },
        { id: 4, name: "도시계획학" },
      ],
      [
        { id: 5, name: "독일문학사" },
        { id: 6, name: "동물행동학" },
      ],
      [
        { id: 7, name: "디자인론" },
        { id: 8, name: "도예실기" },
      ],
    ],
    ㄹ: [
      [
        { id: 1, name: "로마사" },
        { id: 2, name: "러시아어" },
      ],
      [
        { id: 3, name: "리더십론" },
        { id: 4, name: "로봇공학" },
      ],
      [
        { id: 5, name: "논리회로" },
      ],
    ],
    ㅁ: [
      [
        { id: 1, name: "마케팅관리" },
        { id: 2, name: "미적분학" },
        { id: 3, name: "문화인류학" },
        { id: 4, name: "무역학개론" },
      ],
      [
        { id: 5, name: "미디어론" },
        { id: 6, name: "미술사" },
        { id: 7, name: "물리화학" },
      ],
      [
        { id: 8, name: "민속학" },
        { id: 9, name: "미생물학" },
      ],
    ],
    ㅂ: [
      [
        { id: 1, name: "법학개론" },
        { id: 2, name: "병리학" },
        { id: 3, name: "분자생물학" },
      ],
      [
        { id: 4, name: "방송학" },
        { id: 5, name: "반도체공학" },
      ],
      [
        { id: 6, name: "북한학" },
        { id: 7, name: "비교문학" },
      ],
    ],
    ㅅ: [
      [
        { id: 1, name: "생화학" },
        { id: 2, name: "서양사" },
        { id: 3, name: "소프트웨어공학" },
        { id: 4, name: "심리학개론" },
        { id: 5, name: "사회학이론" },
      ],
      [
        { id: 6, name: "수치해석" },
        { id: 7, name: "세포생물학" },
        { id: 8, name: "신문방송학" },
        { id: 9, name: "선형대수학" },
      ],
      [
        { id: 10, name: "스포츠의학" },
        { id: 11, name: "산업디자인" },
        { id: 12, name: "식품공학" },
      ],
    ],
    ㅇ: [
      [
        { id: 1, name: "영문학개론" },
        { id: 2, name: "운영체제" },
        { id: 3, name: "유기화학" },
        { id: 4, name: "의료윤리학" },
      ],
      [
        { id: 5, name: "음악이론" },
        { id: 6, name: "응용통계학" },
        { id: 7, name: "언어학개론" },
      ],
      [
        { id: 8, name: "영화론" },
        { id: 9, name: "원자물리학" },
      ],
    ],
    ㅈ: [
      [
        { id: 1, name: "재무관리" },
        { id: 2, name: "정치학개론" },
        { id: 3, name: "전자회로" },
      ],
      [
        { id: 4, name: "조직행동론" },
        { id: 5, name: "지구과학" },
      ],
      [
        { id: 6, name: "중국문학" },
        { id: 7, name: "작곡법" },
      ],
    ],
    ㅊ: [
      [
        { id: 1, name: "철학개론" },
        { id: 2, name: "천문학" },
      ],
      [
        { id: 3, name: "청소년심리학" },
        { id: 4, name: "체육학" },
      ],
      [
        { id: 5, name: "촬영기법" },
      ],
    ],
    ㅋ: [
      [
        { id: 1, name: "컴퓨터구조" },
        { id: 2, name: "콘텐츠제작" },
      ],
      [
        { id: 3, name: "코딩이론" },
      ],
      [],
    ],
    ㅌ: [
      [
        { id: 1, name: "통계학개론" },
        { id: 2, name: "토목공학" },
      ],
      [
        { id: 3, name: "텍스트마이닝" },
      ],
      [],
    ],
    ㅍ: [
      [
        { id: 1, name: "프로그래밍언어" },
        { id: 2, name: "패션디자인" },
      ],
      [
        { id: 3, name: "풍속사" },
      ],
      [],
    ],
    ㅎ: [
      [
        { id: 1, name: "한국사" },
        { id: 2, name: "화학공학" },
        { id: 3, name: "해부학" },
      ],
      [
        { id: 4, name: "행정학개론" },
        { id: 5, name: "회계학" },
      ],
      [
        { id: 6, name: "환경공학" },
      ],
    ],
    // 영어 데이터
    A: [
      [
        { id: 1, name: "Algorithm" },
        { id: 2, name: "Anthropology" },
      ],
      [
        { id: 3, name: "Architecture" },
        { id: 4, name: "Astronomy" },
      ],
      [
        { id: 5, name: "Anatomy" },
      ],
    ],
    B: [
      [
        { id: 1, name: "Biology" },
        { id: 2, name: "Business" },
      ],
      [
        { id: 3, name: "Biochemistry" },
      ],
      [],
    ],
    C: [
      [
        { id: 1, name: "Chemistry" },
        { id: 2, name: "Computer Science" },
        { id: 3, name: "Calculus" },
      ],
      [
        { id: 4, name: "Communication" },
      ],
      [],
    ],
    D: [
      [
        { id: 1, name: "Design" },
        { id: 2, name: "Data Science" },
      ],
      [],
      [],
    ],
    E: [
      [
        { id: 1, name: "Economics" },
        { id: 2, name: "Engineering" },
      ],
      [
        { id: 3, name: "English Literature" },
      ],
      [],
    ],
    M: [
      [
        { id: 1, name: "Mathematics" },
        { id: 2, name: "Medicine" },
      ],
      [
        { id: 3, name: "Marketing" },
      ],
      [],
    ],
    P: [
      [
        { id: 1, name: "Physics" },
        { id: 2, name: "Psychology" },
        { id: 3, name: "Philosophy" },
      ],
      [],
      [],
    ],
    S: [
      [
        { id: 1, name: "Sociology" },
        { id: 2, name: "Statistics" },
      ],
      [
        { id: 3, name: "Software Engineering" },
      ],
      [],
    ],
  };

  const currentColumns = categoryData[selectedLetter] || [[], [], []];

  const handleLanguageToggle = () => {
    setIsEnglish(!isEnglish);
    setSelectedLetter(isEnglish ? "ㄱ" : "A");
  };

  return (
    <section>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          분류 : {categoryName || "서울대학교 과목"}
        </h1>
        <p className="text-sm text-gray-400">최근 수정 시각 2025-01-15 14:30</p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 왼쪽: 자음 네비게이션 */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
  {/* 영문 변환 버튼 - 패딩 제거하여 버튼 크기 축소 */}
  <button 
    onClick={handleLanguageToggle}
    className="w-full h-12 flex items-center justify-center border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition mb-2"
  >
    {isEnglish ? "한글 변환 / KR" : "영문 변환 / EN"}
  </button>

  {/* 스크롤 가능한 자음/알파벳 버튼들 (영어일 때만 스크롤) */}
<div
  className={`flex flex-col gap-2 pr-2 ${
    isEnglish
      ? "max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      : "overflow-visible"
  }`}
>
  {letters.map((letter) => (
    <button
      key={letter}
      onClick={() => setSelectedLetter(letter)}
      className={`w-full h-12 flex items-center justify-center border rounded transition font-medium flex-shrink-0 ${
        selectedLetter === letter
          ? "bg-blue-50 border-blue-500 text-blue-600"
          : "border-gray-300 text-gray-600 hover:bg-gray-50"
      }`}
      aria-pressed={selectedLetter === letter}
    >
      {letter}
    </button>
  ))}
</div>

</div>
        </div>

        {/* 중앙: 카테고리 항목들 */}
        <div className="lg:col-span-3">
          <div className="mb-6 pb-4 border-b-2 border-gray-300">
            <h2 className="text-2xl font-bold text-gray-900">{selectedLetter}</h2>
          </div>

          {/* 3열 그리드 */}
          <div className="grid grid-cols-3 gap-x-8 gap-y-1">
            {currentColumns.map((column, colIndex) => (
              <div key={colIndex} className="space-y-1">
                {column.map((item) => (
                  <div key={item.id}>
                    <Link
                      to={`/docs/${item.name}`}
                      className="text-sm text-blue-600 hover:underline block py-1"
                    >
                      {item.name}
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {currentColumns.every((col) => col.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-8">
              "{selectedLetter}"로 시작하는 항목이 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}