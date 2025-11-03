// src/pages/AttributePage.tsx

import { useState } from "react";
import { Link } from "react-router-dom";

interface Contribution {
  id: number;
  documentTitle: string;
  univName: string;
  editor: string;
  editId: string;
  timestamp: string;
  byteDiff: number;
  summary: string;
}

export default function AttributePage() {
  const [contributions] = useState<Contribution[]>([
    // 1페이지
    {
      id: 1,
      documentTitle: "경북대학교 > 학과",
      univName: "경북대학교",
      editor: "r120",
      editId: "r120",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: 30,
      summary: "경북대학교 문서에 대한 수정 내용 요약",
    },
    {
      id: 2,
      documentTitle: "경북대학교 > 행사",
      univName: "경북대학교",
      editor: "r3",
      editId: "r3",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: -30,
      summary: "축제 문서에 대한 수정 내용 요약",
    },
    {
      id: 3,
      documentTitle: "경북대학교 > 학과",
      univName: "경북대학교",
      editor: "r1",
      editId: "r1",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: 230,
      summary: "건축공학과 문서에 대한 수정 내용 요약",
    },
    {
      id: 4,
      documentTitle: "경북대학교 > 시설",
      univName: "경북대학교",
      editor: "r7",
      editId: "r7",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: -82,
      summary: "Space9 문서에 대한 수정 내용 요약",
    },
    {
      id: 5,
      documentTitle: "경북대학교 > 강의",
      univName: "경북대학교",
      editor: "r32",
      editId: "r32",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: 30,
      summary: "수치해석 문서에 대한 수정 내용 요약",
    },
    {
      id: 6,
      documentTitle: "경북대학교 > 기타",
      univName: "경북대학교",
      editor: "r126",
      editId: "r126",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: 30,
      summary: "맛집 문서에 대한 수정 내용 요약",
    },
    {
      id: 7,
      documentTitle: "경북대학교 > 학과",
      univName: "경북대학교",
      editor: "r120",
      editId: "r120",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: 30,
      summary: "경북대학교 문서에 대한 수정 내용 요약",
    },
    {
      id: 8,
      documentTitle: "경북대학교 > 행사",
      univName: "경북대학교",
      editor: "r3",
      editId: "r3",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: -30,
      summary: "축제 문서에 대한 수정 내용 요약",
    },
    {
      id: 9,
      documentTitle: "경북대학교 > 학과",
      univName: "경북대학교",
      editor: "r1",
      editId: "r1",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: 230,
      summary: "건축공학과 문서에 대한 수정 내용 요약",
    },
    {
      id: 10,
      documentTitle: "경북대학교 > 시설",
      univName: "경북대학교",
      editor: "r7",
      editId: "r7",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: -82,
      summary: "Space9 문서에 대한 수정 내용 요약",
    },
    {
      id: 11,
      documentTitle: "경북대학교 > 강의",
      univName: "경북대학교",
      editor: "r32",
      editId: "r32",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: 30,
      summary: "수치해석 문서에 대한 수정 내용 요약",
    },
    {
      id: 12,
      documentTitle: "경북대학교 > 기타",
      univName: "경북대학교",
      editor: "r126",
      editId: "r126",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: 30,
      summary: "맛집 문서에 대한 수정 내용 요약",
    },
    {
      id: 13,
      documentTitle: "경북대학교 > 학과",
      univName: "경북대학교",
      editor: "r1",
      editId: "r1",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: 230,
      summary: "건축공학과 문서에 대한 수정 내용 요약",
    },
    {
      id: 14,
      documentTitle: "경북대학교 > 시설",
      univName: "경북대학교",
      editor: "r7",
      editId: "r7",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: -82,
      summary: "Space9 문서에 대한 수정 내용 요약",
    },
    {
      id: 15,
      documentTitle: "경북대학교 > 강의",
      univName: "경북대학교",
      editor: "r32",
      editId: "r32",
      timestamp: "2025.10.21 13:36:20",
      byteDiff: 30,
      summary: "수치해석 문서에 대한 수정 내용 요약",
    },
    // 2페이지
    {
      id: 16,
      documentTitle: "서울대학교 > 본관",
      univName: "서울대학교",
      editor: "r45",
      editId: "r45",
      timestamp: "2025.10.20 15:20:10",
      byteDiff: 120,
      summary: "본관 건물 정보 업데이트",
    },
    {
      id: 17,
      documentTitle: "연세대학교 > 학과",
      univName: "연세대학교",
      editor: "r88",
      editId: "r88",
      timestamp: "2025.10.19 14:15:30",
      byteDiff: -45,
      summary: "컴퓨터과학과 정보 수정",
    },
    {
      id: 18,
      documentTitle: "고려대학교 > 교수",
      univName: "고려대학교",
      editor: "r12",
      editId: "r12",
      timestamp: "2025.10.18 11:30:00",
      byteDiff: 340,
      summary: "김철수 교수 프로필 추가",
    },
    {
      id: 19,
      documentTitle: "부산대학교 > 행사",
      univName: "부산대학교",
      editor: "r99",
      editId: "r99",
      timestamp: "2025.10.17 09:45:20",
      byteDiff: 78,
      summary: "축제 일정 업데이트",
    },
    {
      id: 20,
      documentTitle: "한양대학교 > 시설",
      univName: "한양대학교",
      editor: "r56",
      editId: "r56",
      timestamp: "2025.10.16 16:20:15",
      byteDiff: -120,
      summary: "도서관 정보 수정",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContributions = contributions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(contributions.length / itemsPerPage);

  return (
    <div>
      {/* 페이지 헤더 */}
      <h1 className="mb-8 text-3xl font-semibold text-gray-900">김코드 의 기여 문서 목록</h1>

      {/* 페이지네이션 버튼 (상단) */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          &lt; 이전
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          다음 &gt;
        </button>
      </div>

      {/* 기여 목록 */}
      <div className="space-y-4">
        {currentContributions.map((contribution) => (
          <div key={contribution.id} className="border-b border-gray-200 pb-4">
            {/* 첫 번째 줄: 문서 제목 */}
            <div className="mb-1">
              <Link
                to={`/docs/${contribution.documentTitle}`}
                className="text-base font-normal text-gray-900 hover:underline"
              >
                {contribution.documentTitle}
              </Link>
            </div>

            {/* 두 번째 줄: 편집자, 시간, 바이트 변화, 요약 */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-900">{contribution.univName}</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-900">{contribution.editId}</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{contribution.timestamp}</span>
              <span
                className={`font-medium ${
                  contribution.byteDiff > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {contribution.byteDiff > 0 ? "+" : ""}
                {contribution.byteDiff}
              </span>
              <span className="text-gray-400">({contribution.summary})</span>

              {/* 오른쪽 링크들 */}
              <div className="ml-auto flex gap-2 text-gray-600">
                <Link to="#" className="hover:underline">
                  역사
                </Link>
                <span>|</span>
                <Link to="#" className="hover:underline">
                  토론
                </Link>
                <span>|</span>
                <Link to="#" className="hover:underline">
                  비교
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contributions.length === 0 && (
        <div className="py-12 text-center text-gray-500">기여한 문서가 없습니다.</div>
      )}

      {/* 페이지네이션 버튼 (하단) */}
      <div className="mt-8 flex gap-2">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          &lt; 이전
        </button>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          다음 &gt;
        </button>
      </div>
    </div>
  );
}