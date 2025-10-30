// src/pages/DiscussionHistoryPage.tsx

import { useState } from "react";
import { Link } from "react-router-dom";

interface Discussion {
  id: number;
  title: string;
  documentName: string;
  createdAt: string;
}

export default function DiscussionHistoryPage() {
  const [discussions] = useState<Discussion[]>([
    // 1페이지
    {
      id: 1,
      title: "#토론시세대체지대용 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "39초 전",
    },
    {
      id: 2,
      title: "#1 토론제목",
      documentName: "경북대학교 > 문서이름",
      createdAt: "2025-10-21 21:48:23",
    },
    {
      id: 3,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 4,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 5,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 6,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 7,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 8,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 9,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 10,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 11,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 12,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 13,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 14,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    {
      id: 15,
      title: "#4 토론제목",
      documentName: "토론 관련 문서 이름",
      createdAt: "2025-09-22",
    },
    // 2페이지
    {
      id: 16,
      title: "#5 캠퍼스 건물 이름 변경",
      documentName: "서울대학교 > 본관",
      createdAt: "2025-09-21",
    },
    {
      id: 17,
      title: "#2 학과 이름 수정",
      documentName: "연세대학교 > 컴퓨터과학과",
      createdAt: "2025-09-20",
    },
    {
      id: 18,
      title: "#7 교수 정보 업데이트",
      documentName: "고려대학교 > 김철수 교수",
      createdAt: "2025-09-19",
    },
    {
      id: 19,
      title: "#3 강의실 위치 오류",
      documentName: "경북대학교 > IT대학",
      createdAt: "2025-09-18",
    },
    {
      id: 20,
      title: "#8 축제 일정 토론",
      documentName: "부산대학교 > 축제",
      createdAt: "2025-09-17",
    },
    {
      id: 21,
      title: "#1 도서관 운영시간",
      documentName: "한양대학교 > 중앙도서관",
      createdAt: "2025-09-16",
    },
    {
      id: 22,
      title: "#9 셔틀버스 노선 변경",
      documentName: "서울대학교 > 교통",
      createdAt: "2025-09-15",
    },
    {
      id: 23,
      title: "#6 학식 메뉴 추가 요청",
      documentName: "연세대학교 > 학생식당",
      createdAt: "2025-09-14",
    },
    {
      id: 24,
      title: "#4 기숙사 규칙",
      documentName: "고려대학교 > 기숙사",
      createdAt: "2025-09-13",
    },
    {
      id: 25,
      title: "#10 동아리 소개 수정",
      documentName: "경북대학교 > 동아리",
      createdAt: "2025-09-12",
    },
    {
      id: 26,
      title: "#2 체육관 이용 안내",
      documentName: "부산대학교 > 체육시설",
      createdAt: "2025-09-11",
    },
    {
      id: 27,
      title: "#5 졸업 요건 변경",
      documentName: "한양대학교 > 학사정보",
      createdAt: "2025-09-10",
    },
    {
      id: 28,
      title: "#11 실습실 예약 방법",
      documentName: "서울대학교 > 공과대학",
      createdAt: "2025-09-09",
    },
    {
      id: 29,
      title: "#3 장학금 신청 기간",
      documentName: "연세대학교 > 장학금",
      createdAt: "2025-09-08",
    },
    {
      id: 30,
      title: "#7 수강신청 시스템",
      documentName: "고려대학교 > 학사시스템",
      createdAt: "2025-09-07",
    },
    // 3페이지
    {
      id: 31,
      title: "#12 캠퍼스 맵 업데이트",
      documentName: "경북대학교 > 캠퍼스맵",
      createdAt: "2025-09-06",
    },
    {
      id: 32,
      title: "#8 주차장 정보",
      documentName: "부산대학교 > 주차",
      createdAt: "2025-09-05",
    },
    {
      id: 33,
      title: "#4 편의점 운영시간",
      documentName: "한양대학교 > 편의시설",
      createdAt: "2025-09-04",
    },
    {
      id: 34,
      title: "#13 강의 평가 시스템",
      documentName: "서울대학교 > 강의평가",
      createdAt: "2025-09-03",
    },
    {
      id: 35,
      title: "#9 취업 지원 프로그램",
      documentName: "연세대학교 > 취업지원센터",
      createdAt: "2025-09-02",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDiscussions = discussions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(discussions.length / itemsPerPage);

  return (
    <div>
      {/* 페이지 헤더 */}
      <h1 className="mb-8 text-3xl font-semibold text-gray-900">"유저 이름"의 참여 토론 목록</h1>

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

      {/* 토론 목록 */}
      <div className="space-y-0">
        {currentDiscussions.map((discussion) => (
          <div
            key={discussion.id}
            className="flex items-center justify-between border-b border-gray-200 py-4"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* 토론 제목 */}
              <Link
                to={`/docs/${discussion.documentName}/discussions/${discussion.id}`}
                className="text-sm font-semibold text-uniwikicolor hover:underline"
              >
                • {discussion.title}
              </Link>
              {/* 문서명 */}
              <span className="text-sm text-gray-500">{discussion.documentName}</span>
            </div>
            {/* 작성 시간 */}
            <div className="text-sm text-gray-600">{discussion.createdAt}</div>
          </div>
        ))}
      </div>

      {discussions.length === 0 && (
        <div className="py-12 text-center text-gray-500">참여한 토론이 없습니다.</div>
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