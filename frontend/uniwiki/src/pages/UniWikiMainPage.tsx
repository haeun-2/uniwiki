import React from "react";

// 더미 데이터
const popularSchools = [
  { name: "서울대학교", city: "서울특별시" },
  { name: "연세대학교", city: "서울특별시" },
  { name: "고려대학교", city: "서울특별시" },
  { name: "경북대학교", city: "대구광역시" },
  { name: "부산대학교", city: "부산광역시" },
  { name: "한양대학교", city: "서울특별시" },
];

export default function UniWikiMainPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      {/* 인기 많은 학교 */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold">인기 많은 학교</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
          {popularSchools.map((s, idx) => (
            <button
              key={idx}
              className="group rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:shadow"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                🏛️
              </div>
              <div className="mb-1 text-[11px] text-gray-500">{s.city}</div>
              <div className="text-sm font-medium text-gray-900 group-hover:underline">{s.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 내 학교 & 즐겨찾기 문서 */}
      <section className="mb-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">내 학교</h2>
          <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-500">IMG</div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-sm font-medium text-gray-900">내가 다니는 학교</div>
              <p className="truncate text-xs text-gray-500">서울특별시의 어떤 도서관으로 2시간 운행…</p>
            </div>
          </article>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold">즐겨찾기 문서</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((id) => (
              <article key={id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900">신촌캠퍼스 맛집</h3>
                <p className="mt-1 text-xs text-gray-500">연세대학교 · 2시간 전</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 학교별 위키 탐색 */}
      <section className="mb-14">
        <h2 className="mb-4 text-xl font-semibold">학교별 위키 탐색</h2>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {["전체", "서울", "경기", "대전", "대구", "경북", "제주", "기타"].map((region, idx) => (
            <button
              key={idx}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-100"
            >
              {region}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {Array(4)
              .fill(null)
              .map((_, i) => (
                <ul key={i} className="space-y-2 text-sm text-gray-700">
                  {Array(14)
                    .fill(null)
                    .map((__, j) => (
                      <li key={j} className="cursor-pointer truncate hover:underline">
                        서울대학교
                      </li>
                    ))}
                </ul>
              ))}
          </div>
        </div>
      </section>

      {/* 참여 섹션 */}
      <section className="mb-16 grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          {[
            { t: "사용법", d: "다른 문서를 위키와 관련해봐요!" },
            { t: "질문함", d: "필요한 정보를 함께 찾아봐요!" },
            { t: "사용자 모임", d: "커뮤니티 모집에 참여해 보세요!" },
            { t: "정책과 지침", d: "편집과 커뮤니티 관련 가이드!" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">{idx + 1}</div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900">{item.t}</div>
                <p className="text-xs text-gray-500">{item.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {[
            { t: "환영합니다!", d: "위키가 되는 여러분을 환영합니다." },
            { t: "위키백과 길라잡이", d: "쉬운 위키편집을 돕는 가이드북!" },
            { t: "새 문서 만들기 도움말", d: "새 문서 만드는 방법 안내" },
            { t: "문서 편집 도움말", d: "문서를 편집하는 방법 안내" },
            { t: "그림 올리기 도움말", d: "이미지 업로드, 라이선스 안내" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">★</div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900">{item.t}</div>
                <p className="text-xs text-gray-500">{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
