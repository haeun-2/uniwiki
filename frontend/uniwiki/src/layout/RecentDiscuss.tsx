import React from "react";

export default function RecentDiscuss() {
  // 테스트용 더미 데이터
  const recentDiscussions = [
    "연세대학교 신촌캠퍼스",
    "기계공학과 커리큘럼",
    "데이터구조 강의",
    "건축학부 설계 박상훈 교수",
    "통계의 이해 최혜정 교수",
  ];

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-800">최근 토론</h2>
      <ul className="space-y-2 text-sm text-gray-700">
        {recentDiscussions.map((title, idx) => (
          <li key={idx} className="flex justify-between">
            <span className="truncate">{title}</span>
            <span className="text-xs text-gray-400">2시간 전</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
