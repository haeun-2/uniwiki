import React from "react";

export default function RecentEdit() {
  // 테스트용 더미 데이터
  const recentEdits = [
    "연세대학교 신촌캠퍼스",
    "연세대학교 신촌캠퍼스",
    "연세대학교 신촌캠퍼스",
    "경북대학교 대구캠퍼스",
    "고려대학교 안암캠퍼스",
    "서울대학교 관악캠퍼스",
    "부산대학교 본관",
  ];

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-800">최근 수정된 문서</h2>
      <ul className="space-y-2 text-sm text-gray-700">
        {recentEdits.map((title, idx) => (
          <li key={idx} className="flex justify-between">
            <span className="truncate">{title}</span>
            <span className="text-xs text-gray-400">2시간 전</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
