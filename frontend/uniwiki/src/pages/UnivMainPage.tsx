import React from "react";
import { useParams } from "react-router-dom"

export default function UnivMainPage() {

  const { univName } = useParams<{ univName: string }>();

  const univMap: Record<string, string> = {
    snu: "서울대학교", 
    yonsei: "연세대학교", 
    ku: "고려대학교", 
    knu: "경북대학교", 
    pnu: "부산대학교", 
    hyu: "한양대학교",
  }

  const displayName = univName ? univMap[univName] || "알 수 없는 학교" : "대학교";

  const categories = [
    { icon: "🏫", title: "학과", desc: "전공 및 학과별 위키 문서", count: 124 },
    { icon: "👨‍🏫", title: "교수", desc: "교수 및 연구진 정보", count: 58 },
    { icon: "📘", title: "강의", desc: "강의 요약 및 후기", count: 342 },
    { icon: "🏢", title: "시설", desc: "학교 시설 및 위치 정보", count: 87 },
    { icon: "🎉", title: "행사", desc: "축제·세미나 등 행사 정보", count: 25 },
    { icon: "🏷️", title: "기타", desc: "장학금·교통·등록금 등 기타 문서", count: 19 },
  ];

  return (
    <section className="space-y-8">
      {/* 상단 - 학교 개요 카드 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex items-center gap-6">
        <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
          🏫
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{ displayName }</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            { displayName }에 대한 내용을 기입합니다.
            지금은 더미 데이터를 입력하고 있습니다.
          </p>
        </div>
      </div>

      {/* 중단 - 주요 카테고리 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">학교 문서 카테고리</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 text-center hover:shadow-sm transition"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="font-medium text-gray-900">{cat.title}</div>
              <p className="text-xs text-gray-500">{cat.desc}</p>
              <div className="text-[11px] text-gray-400 mt-1">{cat.count}개 문서</div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 - 문서 활동 안내 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">이 학교에 기여하기</h2>
        <p className="text-sm text-gray-600 mb-4">
          문서를 추가하거나 수정하여 더 나은 대학 위키를 만들어주세요.
        </p>
        <button className="rounded-lg bg-[#2c80a0] text-white text-sm px-4 py-2 hover:bg-[#256a86] transition">
          새 문서 만들기
        </button>
      </div>
    </section>
  );
}
