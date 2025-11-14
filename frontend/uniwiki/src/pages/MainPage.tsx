import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom"

// 지역
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

// 즐겨찾기한 대학교
type FavoriteUniversity = {
universityId: number;
universityName: string;
logoUrl: string | null;
};

// 즐겨찾기 문서
type FavoriteDocument = {
  documentId: number;
  documentTitle: string;
  universityName: string;
  documentUpdateAt: string;
};

// 로그인한 회원의 학교
type AuthPayload = {
  accessToken?: string;
  universityId?: number | null;
};
function getStoredAuth(): AuthPayload {
  // 1) 세션/로컬의 'auth' JSON을 최우선으로 신뢰
  const fromSession = sessionStorage.getItem("auth");
  const fromLocal = localStorage.getItem("auth");

  const parseAuth = (raw: string | null) => {
    if (!raw) return null;
    try {
      const a = JSON.parse(raw);
      // universityId 숫자 보정
      const uid =
        typeof a?.universityId === "number"
          ? a.universityId
          : a?.universityId != null
          ? Number(a.universityId)
          : null;
      return {
        accessToken: typeof a?.accessToken === "string" ? a.accessToken : undefined,
        universityId: Number.isFinite(uid as number) ? (uid as number) : null,
      } as AuthPayload;
    } catch {
      return null;
    }
  };

  const authFromSession = parseAuth(fromSession);
  const authFromLocal = parseAuth(fromLocal);

  // 세션 auth가 있으면 우선 사용, 아니면 로컬 auth 사용
  const base: AuthPayload =
    authFromSession ??
    authFromLocal ?? {
      accessToken:
        sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken") || undefined,
      universityId: null,
    };

  // 2) universityId가 비어있다면, ✅ localStorage의 개별 키를 후순위로 보완
  if (base.universityId == null) {
    const rawUid = localStorage.getItem("universityId"); // ← 요구사항: MainPage에서는 이 값을 사용
    if (rawUid != null) {
      const coerced = Number(rawUid);
      if (Number.isFinite(coerced)) {
        base.universityId = coerced;
      }
    }
  }

  // 3) ⚠️ sessionStorage에 남아있던 universityId는 사용하지 않음 (오염 방지)
  return base;
}



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
        const res = await fetch("https://k13d104.p.ssafy.io/api/v1/regions", { method: "GET" });
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
  const univCacheRef = useRef<Record<number, University[]>>({});

  useEffect(() => {
    let mounted = true;

    (async () => {
      // 1) 캐시에 있으면 네트워크 요청 없이 바로 사용
      const cached = univCacheRef.current[selectedRegionId];
      if (cached) {
        setUniversities(cached);
        setLoadingUniversities(false);
        return;
      }

      // 2) 없으면 서버에서 요청 후 캐시에 저장
      try {
        setLoadingUniversities(true);
        setUnivError(null);

        const url =
          selectedRegionId === 0
            ? `https://k13d104.p.ssafy.io/api/v1/universities`
            : `https://k13d104.p.ssafy.io/api/v1/universities?region=${selectedRegionId}`;

        const res = await fetch(url, { headers: { accept: "*/*" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: University[] = await res.json();
        if (!mounted) return;

        setUniversities(data);
        // 캐시에 저장
        univCacheRef.current[selectedRegionId] = data;
      } catch (e: any) {
        if (mounted) {
          setUnivError(e?.message ?? "대학교 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (mounted) {
          setLoadingUniversities(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedRegionId]);



  // ---------------- Popular Universities ----------------
  const [popularUnivs, setPopularUnivs] = useState<University[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [popularError, setPopularError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingPopular(true);
        setPopularError(null);
        const res = await fetch("https://k13d104.p.ssafy.io/api/v1/universities/popular", {
          headers: { accept: "*/*" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: University[] = await res.json();
        if (mounted) setPopularUnivs(data);
      } catch (e: any) {
        if (mounted) setPopularError(e?.message ?? "인기 대학교를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoadingPopular(false);
      }
    })();
    return () => { mounted = false; };
  }, []);



  // ---------------- My University ----------------
  const [{ accessToken, universityId }] = useState(getStoredAuth());
  const [myUniv, setMyUniv] = useState<University | null>(null);
  const [loadingMyUniv, setLoadingMyUniv] = useState(false);
  const [myUnivError, setMyUnivError] = useState<string | null>(null);

  // universityId가 있을 때만 상세 조회 → 이름을 링크용으로 사용
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!accessToken || universityId == null) return; // 토큰 없거나 미인증(null)이면 패스
      try {
        setLoadingMyUniv(true);
        setMyUnivError(null);
        const res = await fetch(`https://k13d104.p.ssafy.io/api/v1/universities/${universityId}`, {
          headers: { accept: "*/*" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: University = await res.json();
        if (mounted) setMyUniv(data);
      } catch (e: any) {
        setMyUnivError(e?.message ?? "내 학교 정보를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoadingMyUniv(false);
      }
    })();
    return () => { mounted = false; };
  }, [accessToken, universityId]);



    // ---------------- Favorite Universities (내 학교 즐겨찾기) ----------------
    const [favUnivs, setFavUnivs] = useState<FavoriteUniversity[]>([]);
    const [loadingFavs, setLoadingFavs] = useState(false);
    const [favError, setFavError] = useState<string | null>(null);

    useEffect(() => {
      let mounted = true;
      (async () => {
        if (!accessToken) return; // 비로그인 시 요청 X
        try {
          setLoadingFavs(true);
          setFavError(null);
          const res = await fetch(
            "https://k13d104.p.ssafy.io/api/v1/users/me/favorites/universities",
            {
              method: "GET",
              headers: {
                accept: "*/*",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: FavoriteUniversity[] = await res.json();
          if (mounted) setFavUnivs(data);
        } catch (e: any) {
          if (mounted) setFavError(e?.message ?? "즐겨찾기한 학교를 불러오지 못했습니다.");
        } finally {
          if (mounted) setLoadingFavs(false);
        }
      })();
      return () => { mounted = false; };
    }, [accessToken]);



      // ---------------- Favorite Documents ----------------
  const [favDocs, setFavDocs] = useState<FavoriteDocument[]>([]);
  const [loadingFavDocs, setLoadingFavDocs] = useState(false);
  const [favDocsError, setFavDocsError] = useState<string | null>(null);

  // 상대 시간 표시 유틸
  const timeAgo = (iso: string) => {
    try {
      const d = new Date(iso);
      const diff = Date.now() - d.getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return "방금 전";
      if (m < 60) return `${m}분 전`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}시간 전`;
      const day = Math.floor(h / 24);
      if (day < 7) return `${day}일 전`;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch { return ""; }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!accessToken) return; // 비로그인 시 요청 X
      try {
        setLoadingFavDocs(true);
        setFavDocsError(null);
        const res = await fetch(
          "https://k13d104.p.ssafy.io/api/v1/users/me/favorites/documents",
          {
            method: "GET",
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: FavoriteDocument[] = await res.json();
        if (mounted) setFavDocs(data);
      } catch (e: any) {
        if (mounted) setFavDocsError(e?.message ?? "즐겨찾기한 문서를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoadingFavDocs(false);
      }
    })();
    return () => { mounted = false; };
  }, [accessToken]);

  

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      {/* 인기 많은 학교 */}
      <section className="mb-12">
        <h2 className="mb-6 text-xl font-semibold">인기 많은 학교</h2>

      {/* 로딩 스켈레톤 */}
      {loadingPopular && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="h-10 w-10 rounded-full bg-gray-100 animate-pulse" />
              <div className="mt-3 h-3 w-16 bg-gray-100 animate-pulse" />
              <div className="mt-2 h-3 w-24 bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      )}
      
      {/* 에러 */}
      {popularError && (
        <p className="text-xs text-red-500">인기 대학교를 불러오지 못했습니다. 새로고침 해주세요.</p>
      )}

      {/* 데이터 */}
      {!loadingPopular && !popularError && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
          {popularUnivs.slice(0, 6).map((u) => (
            <Link
              key={u.universityId}
              to={`/univ/${encodeURIComponent(u.universityName)}`}
              state={{ universityId: u.universityId }}
              className="group rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:shadow"
              title={u.universityName}
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl">
                  {/* 로고가 있으면 표시 */}
                  {u.logoUrl ? (
                    <img src={u.logoUrl} alt={u.universityName}/>
                  ) : (
                    <span role="img" aria-label="school">🏛️</span>
                  )}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 group-hover:underline truncate">
                {u.universityName}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>

    {/* 내 학교 & 즐겨찾기 문서 */}
      {!accessToken ? (
        // 비로그인: 통합 안내 박스
        <section className="mb-12">
          <article className="flex flex-col items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center">

            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-900">
                로그인하면 즐겨찾기를 사용할 수 있습니다
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                내 학교 바로가기, 즐겨찾기한 학교, 즐겨찾기한 문서를 한곳에서 빠르게 볼 수 있습니다.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                to="/login"
                className="rounded-lg bg-[#2C80A0] px-4 py-2 text-sm text-white hover:opacity-90"
              >
                로그인하기
              </Link>
            </div>
          </article>
        </section>
      ) : (
        // 로그인: 기존 2열 구성 유지
        <section className="relative left-1/2 right-1/2 -mx-[50vw] w-[calc(100vw-8px)] bg-gray-50 py-6 mb-12">
          <div className="mx-auto max-w-6xl ps-8 pe-4 grid gap-8 md:grid-cols-2">
            {/* --- 왼쪽: 내 학교 + 즐겨찾기한 학교 --- */}
            <div>
              <h2 className="mb-4 text-xl font-semibold">내 학교</h2>

              {/* universityId === null → 학교 인증 유도 (기존 그대로) */}
              {accessToken && universityId === null && (
                <article className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-xs text-amber-700">!</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 text-sm font-medium text-gray-900">내가 다니는 학교</div>
                    <p className="text-xs text-amber-700">학교 이메일을 인증해주세요</p>
                  </div>
                </article>
              )}

              {/* universityId 존재 → 내 학교 링크 (기존 그대로) */}
              {accessToken && universityId !== null && (
                <Link
                  to={myUniv ? `/univ/${encodeURIComponent(myUniv.universityName)}` : "#"}
                  state={myUniv ? { universityId: myUniv.universityId } : undefined}
                  className="block"
                >
                  <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl">
                      {myUniv?.logoUrl ? (
                        <img
                          src={myUniv.logoUrl}
                          alt={myUniv.universityName}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <span role="img" aria-label="school">🏛️</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 text-sm font-medium text-gray-900">
                        {loadingMyUniv ? "불러오는 중..." : (myUniv?.universityName ?? (myUnivError ? "내 학교 정보 오류" : "학교 정보 준비 중"))}
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* 즐겨찾기한 학교 (기존 로딩/에러/데이터 분기 유지, 비로그인 분기는 더 이상 필요 없음) */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="mb-4 text-xl font-semibold">즐겨찾기한 학교</h3>
                  {favUnivs.length > 0 && (
                    <Link
                      to={`/user/favorite`}
                      state={{ tab: "universities" }}
                      className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
                    >
                      더보기
                    </Link>
                  )}
                </div>

                {loadingFavs && (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 animate-pulse" />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 h-3 w-28 bg-gray-100 animate-pulse" />
                          <div className="h-3 w-40 bg-gray-100 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loadingFavs && favError && (
                  <p className="text-xs text-red-500">즐겨찾기한 학교를 불러오지 못했습니다. 새로고침 해주세요.</p>
                )}

                {!loadingFavs && !favError && (
                  favUnivs.length === 0 ? (
                    <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-500">☆</div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 text-sm font-medium text-gray-900">아직 즐겨찾기가 없어요</div>
                        <p className="truncate text-xs text-gray-500">관심 있는 학교를 즐겨찾기해 보세요.</p>
                      </div>
                    </article>
                  ) : (
                    <div className="space-y-3">
                      {favUnivs.slice(0, 2).map((u) => (
                        <Link
                          key={u.universityId}
                          to={`/univ/${encodeURIComponent(u.universityName)}`}
                          state={{ universityId: u.universityId }}
                          className="block"
                          title={u.universityName}
                        >
                          <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl">
                              {u.logoUrl ? (
                                <img src={u.logoUrl} alt={u.universityName} className="h-12 w-12 rounded-xl object-cover" />
                              ) : (
                                <span role="img" aria-label="school">🏛️</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 truncate text-sm font-medium text-gray-900">{u.universityName}</div>
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* --- 오른쪽: 즐겨찾기 문서 --- */}
            <div className="w-[90%] ml-auto">
              <div className="w-full flex items-center justify-between">
                <h2 className="mb-5 text-xl font-semibold">즐겨찾기 문서</h2>
                <Link
                  to={`/user/favorite`}
                  state={{ tab: "documents" }}
                  className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
                >
                  더보기
                </Link>
              </div>

              {loadingFavDocs && (
                <ul className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <li key={i} className="h-4 w-3/4 bg-gray-100 animate-pulse rounded" />
                  ))}
                </ul>
              )}

              {!loadingFavDocs && favDocsError && (
                <p className="text-xs text-red-500">
                  즐겨찾기한 문서를 불러오지 못했습니다. 새로고침 해주세요.
                </p>
              )}

              {!loadingFavDocs && !favDocsError && (
                favDocs.length === 0 ? (
                  <p className="text-sm text-gray-500">아직 즐겨찾기한 문서가 없습니다.</p>
                ) : (
                  <ul className="space-y-6">
                    {favDocs.slice(0, 8).map((d) => (
                      <li key={d.documentId}>
                        <Link
                          to={`/univ/${encodeURIComponent(d.universityName)}/docs/${encodeURIComponent(d.documentTitle)}`}
                          className="group block text-sm text-gray-800 hover:text-uniwikicolor"
                          title={`${d.universityName} · ${d.documentTitle}`}
                        >
                          <span className="font-medium group-hover:underline">{d.documentTitle}</span>
                          <span className="text-gray-400 text-xs ml-2">{d.universityName} · {timeAgo(d.documentUpdateAt)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </div>
        </section>
      )}

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
                  "rounded-full border px-3 py-1 text-xs transition cursor-pointer",
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
          {univError && (
            <p className="text-xs text-red-500">
              대학교 목록을 불러오지 못했습니다. 새로고침 해주세요.
            </p>
          )}

          {!univError && universities.length > 0 && (
            <div className="relative">
              {/* 로딩 중 오버레이 (이 부분은 취향에 따라 문구/스타일 조정 가능) */}
              {loadingUniversities && (
                <div className="absolute inset-0 flex items-center justify-center bg-white text-xs text-gray-400">
                  불러오는 중...
                </div>
              )}

              <div className="max-h-96 overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 text-sm text-gray-700">
                  {universities.map((u) => (
                    <div key={u.universityId} className="truncate">
                      <Link
                        to={`/univ/${encodeURIComponent(u.universityName)}`}
                        state={{ universityId: u.universityId }}
                        className="cursor-pointer hover:underline"
                        title={u.universityName}
                      >
                        {u.universityName}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 참여 섹션 */}
      <section className="grid gap-6 md:grid-cols-2">

        <div className="space-y-3">
          <Link
            to="/welcome"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900">환영합니다!</div>
              <p className="text-xs text-gray-500">유니위키를 소개합니다</p>
            </div>
          </Link>
          <Link
            to="/tutorial"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900">기능 설명</div>
              <p className="text-xs text-gray-500">유니위키에는 어떤 기능이 있을까요?</p>
            </div>
          </Link>
        </div>

        <div className="space-y-3">
          <Link
              to="/guide"
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900">문서 작성법</div>
                <p className="text-xs text-gray-500">쉬운 위키 편집을 돕는 가이드북!</p>
              </div>
            </Link>
          <Link
            to="/rule"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900">정책과 방침</div>
              <p className="text-xs text-gray-500">편집과 저작권 등 법적 가이드!</p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
