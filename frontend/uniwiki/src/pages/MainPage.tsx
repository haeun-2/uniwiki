import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"


// 인기 학교 더미 데이터
const popularSchools = [
  { name: "서울대학교", city: "서울특별시", slug: "snu" },
  { name: "연세대학교", city: "서울특별시", slug: "yonsei" },
  { name: "고려대학교", city: "서울특별시", slug: "ku" },
  { name: "경북대학교", city: "대구광역시", slug: "knu" },
  { name: "부산대학교", city: "부산광역시", slug: "pnu" },
  { name: "한양대학교", city: "서울특별시", slug: "hyu" },
];



// 지역별

type Region = {
  regionId: number;
  regionName: string;
};

const shortenRegion = (name: string) => {
  if (name.endsWith("특별시")) return name.replace("특별시", "");
  if (name.endsWith("광역시")) return name.replace("광역시", "");
  if (name.endsWith("특별자치시")) return name.replace("특별자치시", "");
  if (name.endsWith("특별자치도")) return name.replace("특별자치도", "");
  if (name.endsWith("도")) return name.replace("경상", "경").replace("전라", "전").replace("충청", "충").replace("강원", "강원").replace("도", "");
  return name;
};



// 대학교

type University = {
  universityId: number;
  universityName: string;
  logoUrl: string | null;
};


export default function MainPage() {

  // ---------------- Regions ----------------
  const [regions, setRegions] = useState<Region[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [regionError, setRegionError] = useState<string | null>(null);

  // 선택된 지역 (0은 "전체")
  const [selectedRegionId, setSelectedRegionId] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingRegions(true);
        setRegionError(null);
        const res = await fetch("http://k13d104.p.ssafy.io/api/v1/regions", { method: "GET" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Region[] = await res.json();
        if (mounted) setRegions(data);
      } catch (e: any) {
        if (mounted) setRegionError(e?.message ?? "지역 목록을 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoadingRegions(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // "전체" 가상 항목을 앞에 추가
  const regionChips = useMemo(
    () => [{ regionId: 0, regionName: "전체" } as Region, ...regions],
    [regions]
  );



  // ---------------- Universities ----------------
  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [univError, setUnivError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingUniversities(true);
        setUnivError(null);
        const url = selectedRegionId === 0
          ? `http://k13d104.p.ssafy.io/api/v1/universities`
          : `http://k13d104.p.ssafy.io/api/v1/universities?region=${selectedRegionId}`;
        const res = await fetch(url, { headers: { accept: "*/*" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: University[] = await res.json();
        if (mounted) setUniversities(data);
      } catch (e: any) {
        if (mounted) setUnivError(e?.message ?? "대학교 목록을 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoadingUniversities(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedRegionId]);

  

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      {/* 인기 많은 학교 */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold">인기 많은 학교</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
          {popularSchools.map((s, idx) => (
            <Link
              key={idx}
              to={`/univ/${s.slug}`}
              className="group rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:shadow"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                🏛️
              </div>
              <div className="mb-1 text-[11px] text-gray-500">{s.city}</div>
              <div className="text-sm font-medium text-gray-900 group-hover:underline">{s.name}</div>
            </Link>
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

        {/* 지역 칩 */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {loadingRegions && (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-7 w-14 animate-pulse rounded-full bg-gray-100" />
              ))}
            </>
          )}

          {regionError && (
            <span className="text-xs text-red-500">
              지역 목록을 불러오지 못했습니다. 새로고침 해주세요.
            </span>
          )}

          {!loadingRegions && !regionError && regionChips.map((r) => {
            const isActive = selectedRegionId === r.regionId;
            return (
              <button
                key={r.regionId}
                onClick={() => setSelectedRegionId(r.regionId)}
                className={[
                  "rounded-full border px-3 py-1 text-xs transition",
                  isActive
                    ? "border-[#2C80A0] bg-[#2C80A0] text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                ].join(" ")}
                title={r.regionName}
              >
                {r.regionId === 0 ? "전체" : shortenRegion(r.regionName)}
              </button>
            );
          })}
        </div>

        {/* 대학교 목록 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {!loadingUniversities && !univError && universities.length > 0 && (
            <div className="max-h-96 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 text-sm text-gray-700">
                {universities.map((u) => (
                  <div key={u.universityId} className="truncate">
                    <Link
                      to={`/univ/${u.universityId}`}
                      className="cursor-pointer hover:underline"
                      title={u.universityName}
                    >
                      {u.universityName}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
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
