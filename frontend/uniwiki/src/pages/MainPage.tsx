import React, { useEffect, useMemo, useState } from "react";
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
        const res = await fetch("http://k13d104.p.ssafy.io/api/v1/universities/popular", {
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

        // 보통은 /universities/{id}가 있을 확률이 높습니다.
        // 없으면 주석의 fallback을 사용하세요.
        const res = await fetch(`http://k13d104.p.ssafy.io/api/v1/universities/${universityId}`, {
          headers: { accept: "*/*" },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: University = await res.json();
        if (mounted) setMyUniv(data);
      } catch (e: any) {
        setMyUnivError(e?.message ?? "내 학교 정보를 불러오지 못했습니다.");
        // 🔁 Fallback (만약 단건 API가 없다면 주석 해제해서 전체 목록에서 찾아도 됩니다)
        // try {
        //   const all = await fetch("http://k13d104.p.ssafy.io/api/v1/universities", { headers: { accept: "*/*" }});
        //   const list: University[] = await all.json();
        //   const found = list.find(u => u.universityId === universityId) || null;
        //   if (mounted) setMyUniv(found);
        // } catch {}
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
            "http://k13d104.p.ssafy.io/api/v1/users/me/favorites/universities",
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
          "http://k13d104.p.ssafy.io/api/v1/users/me/favorites/documents",
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
      <section className="mb-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-xl font-semibold">내 학교</h2>
          {/* 비로그인 or 토큰 없음 */}
          {!accessToken && (
            <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-500">IMG</div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-sm font-medium text-gray-900">내가 다니는 학교</div>
                <p className="truncate text-xs text-gray-500">로그인하면 내 학교가 연결됩니다.</p>
              </div>
            </article>
          )}

          {/* 로그인 + universityId === null (미인증) */}
          {accessToken && universityId === null && (
            <article className="flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-xs text-amber-700">!</div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-sm font-medium text-gray-900">내가 다니는 학교</div>
                <p className="text-xs text-amber-700">학교 이메일을 인증해주세요</p>
              </div>
            </article>
          )}

          {/* 로그인 + universityId 존재 → 학교 페이지 링크 */}
          {accessToken && universityId !== null && (
            <Link
              to={myUniv ? `/univ/${encodeURIComponent(myUniv.universityName)}` : "#"}
              state={myUniv ? { universityId: myUniv.universityId } : undefined}
              className="block"
            >
              <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl">
                  {/* 로고가 있으면 표시 */}
                  {myUniv?.logoUrl ? (
                    <img src={myUniv.logoUrl} alt={myUniv.universityName} className="h-12 w-12 rounded-xl object-cover" />
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

          {/* 즐겨찾기한 학교 */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h3 className="mb-4 text-xl font-semibold">즐겨찾기한 학교</h3>
              {accessToken && favUnivs.length > 0 && (
                <Link
                  to={`/user/favorite`}
                  className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
                >더보기</Link>
              )}
            </div>

            {/* 비로그인 → 로그인 유도 */}
            {!accessToken && (
              <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-500">★</div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-sm font-medium text-gray-900">즐겨찾기한 학교</div>
                  <p className="truncate text-xs text-gray-500">로그인하면 즐겨찾기한 학교를 볼 수 있어요.</p>
                </div>
              </article>
            )}

            {/* 로그인 + 로딩 */}
            {accessToken && loadingFavs && (
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

            {/* 로그인 + 에러 */}
            {accessToken && !loadingFavs && favError && (
              <p className="text-xs text-red-500">즐겨찾기한 학교를 불러오지 못했습니다. 새로고침 해주세요.</p>
            )}

            {/* 로그인 + 데이터 */}
            {accessToken && !loadingFavs && !favError && (
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
                      <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-xl">
                          {/* 로고가 있으면 표시 */}
                          {u.logoUrl ? (
                            <img src={u.logoUrl} alt={u.universityName} className="h-12 w-12 rounded-xl object-cover" />
                          ) : (
                            <span role="img" aria-label="school">🏛️</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 text-sm font-medium text-gray-900 truncate">{u.universityName}</div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <div className="flex item-center justify-between">
            <h2 className="mb-4 text-xl font-semibold">즐겨찾기 문서</h2>
            <Link
              to={`/user/favorite`}
              className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
            >더보기</Link>
          </div>

          {/* 비로그인 → 로그인 유도 */}
          {!accessToken && (
            <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-500">📄</div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-sm font-medium text-gray-900">즐겨찾기한 문서</div>
                <p className="truncate text-xs text-gray-500">로그인하면 즐겨찾기한 문서를 볼 수 있어요.</p>
              </div>
            </article>
          )}

          {/* 로그인 + 로딩 */}
          {accessToken && loadingFavDocs && (
            <div className="space-y-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="h-3 w-40 bg-gray-100 animate-pulse" />
                  <div className="mt-2 h-3 w-28 bg-gray-100 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* 로그인 + 에러 */}
          {accessToken && !loadingFavDocs && favDocsError && (
            <p className="text-xs text-red-500">즐겨찾기한 문서를 불러오지 못했습니다. 새로고침 해주세요.</p>
          )}

          {/* 로그인 + 데이터 */}
          {accessToken && !loadingFavDocs && !favDocsError && (
            favDocs.length === 0 ? (
              <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900">아직 즐겨찾기가 없어요</h3>
                <p className="mt-1 text-xs text-gray-500">관심 있는 문서를 즐겨찾기해 보세요.</p>
              </article>
            ) : (
              <div className="space-y-3">
                {favDocs.slice(0, 4).map((d) => (
                <Link
                  key={d.documentId}
                  to={`/univ/${encodeURIComponent(d.universityName)}/docs/${encodeURIComponent(d.documentTitle)}`}
                  className="block"
                  title={`${d.universityName} · ${d.documentTitle}`}
                >
                  <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{d.documentTitle}</h3>
                    <p className="mt-1 text-xs text-gray-500 truncate">{d.universityName} · {timeAgo(d.documentUpdateAt)}</p>
                  </article>
                </Link>
                ))}
              </div>
            )
          )}
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
