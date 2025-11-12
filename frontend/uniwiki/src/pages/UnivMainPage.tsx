// src/pages/UnivMainPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type University = {
  universityId: number;
  universityName: string;
  logoUrl: string | null;
};

type LocationState = {
  universityId?: number;
  isFavorite?: boolean; // ★ 즐겨찾기 선지식 전달
};

type PopularDoc = {
  documentTitle: string;
  viewCount: number;
};

const norm = (s: string) => s.normalize("NFKC").trim().toLowerCase();

export default function UnivMainPage() {
  const { univName } = useParams<{ univName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const passed = (location.state as LocationState) ?? {};
  const initialId = passed.universityId ?? null;
  const passedFav =
    typeof passed.isFavorite === "boolean" ? passed.isFavorite : null; // ★

  const inputName = useMemo(
    () => (univName ? decodeURIComponent(univName) : ""),
    [univName]
  );

  const [univId, setUnivId] = useState<number | null>(initialId);
  const [univ, setUniv] = useState<University | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [popularDocs, setPopularDocs] = useState<PopularDoc[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);

  // null = 아직 판별 전(초기 깜빡임 방지), true/false = 확정
  const [isFavorite, setIsFavorite] = useState<boolean | null>(passedFav); // ★
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // ===== 플래시 배너 =====
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const showFlash = (msg: string, ms = 3000) => {
    setFlashMsg(msg);
    window.clearTimeout((showFlash as any)._t);
    (showFlash as any)._t = window.setTimeout(() => setFlashMsg(null), ms);
  };
  // ======================

  // 이름으로 id 폴백 매핑(직접 이동 등으로 state가 없을 때만)
  useEffect(() => {
    if (univId || !inputName) return;
    let mounted = true;
    (async () => {
      try {
        setErr(null);
        const res = await fetch(
          "https://k13d104.p.ssafy.io/api/v1/universities",
          { headers: { accept: "*/*" } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list: University[] = await res.json();

        const t = norm(inputName);
        const exact =
          list.find((u) => norm(u.universityName) === t) ??
          list.find(
            (u) =>
              norm(u.universityName).replace(/\s+/g, "") ===
              t.replace(/\s+/g, "")
          );

        const partial = exact ? null : list.find((u) => norm(u.universityName).includes(t));
        const found = exact ?? partial ?? null;

        if (mounted) {
          if (found) setUnivId(found.universityId);
          else setErr("해당 이름의 대학교를 찾지 못했습니다.");
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? "대학교를 찾지 못했습니다.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [inputName, univId]);

  // 확정된 id로 상세 정보 확보(공식 이름/로고 등)
  useEffect(() => {
    if (!univId) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch(
          "https://k13d104.p.ssafy.io/api/v1/universities",
          { headers: { accept: "*/*" } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list: University[] = await res.json();
        const me = list.find((u) => u.universityId === univId) ?? null;
        if (mounted) setUniv(me);
      } catch (e: any) {
        if (mounted) setErr(e?.message ?? "대학교 정보를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [univId]);

  // 정규 URL로 교체(상태 유지: universityId + 현재 즐겨찾기 표시 상태)
  useEffect(() => {
    if (!univ) return;
    const canonical = `/univ/${encodeURIComponent(univ.universityName)}`;
    if (location.pathname !== canonical) {
      navigate(canonical, {
        replace: true,
        state: { universityId: univ.universityId, isFavorite }, // ★ 상태 유지
      });
    }
  }, [univ, location.pathname, navigate, isFavorite]);

  const displayName = univ?.universityName || inputName || "대학교";

  // 인기 문서
  useEffect(() => {
    if (!univId) return;
    let mounted = true;
    (async () => {
      try {
        setPopularLoading(true);
        const resp = await fetch(
          `https://k13d104.p.ssafy.io/api/v1/documents/popular?universityId=${univId}`,
          { method: "GET", headers: { Accept: "*/*" } }
        );
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data: PopularDoc[] = await resp.json();
        if (mounted) setPopularDocs(Array.isArray(data) ? data.slice(0, 10) : []);
      } catch (e) {
        console.error("popular fetch error:", e);
        if (mounted) setPopularDocs([]);
      } finally {
        if (mounted) setPopularLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [univId]);

  // 즐겨찾기 상태 확인(전달값이 있으면 UI는 그대로, 서버 결과로만 동기화)
  useEffect(() => {
    if (!univId) return;

    const accessToken =
      localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

    if (!accessToken) {
      // 로그인 안 된 경우: 전달값이 있으면 유지, 없으면 false로
      setIsFavorite((prev) => prev ?? false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          "https://k13d104.p.ssafy.io/api/v1/users/me/favorites/universities",
          {
            method: "GET",
            headers: { Accept: "*/*", Authorization: `Bearer ${accessToken}` },
          }
        );

        if (res.ok) {
          const data: Array<{ universityId: number }> = await res.json();
          const serverFav = data.some((fav) => fav.universityId === univId);
          if (mounted) {
            setIsFavorite((prev) =>
              prev === null ? serverFav : prev !== serverFav ? serverFav : prev
            );
          }
        } else {
          if (mounted && isFavorite === null) setIsFavorite(false);
        }
      } catch (error) {
        console.error("즐겨찾기 상태 확인 실패:", error);
        if (mounted && isFavorite === null) setIsFavorite(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [univId]);

  // 즐겨찾기 토글
  const handleFavoriteToggle = async () => {
    if (!univId) {
      showFlash("대학교 정보를 불러오는 중입니다.");
      return;
    }

    const accessToken =
      localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!accessToken) {
      showFlash("로그인이 필요합니다.");
      navigate("/login", { replace: false, state: { from: location.pathname } });
      return;
    }

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        const res = await fetch(
          `https://k13d104.p.ssafy.io/api/v1/users/me/favorites/universities/${univId}`,
          { method: "DELETE", headers: { Accept: "*/*", Authorization: `Bearer ${accessToken}` } }
        );
        if (res.ok || res.status === 204) setIsFavorite(false);
        else throw new Error("즐겨찾기 삭제 실패");
      } else {
        const res = await fetch(
          `https://k13d104.p.ssafy.io/api/v1/users/me/favorites/universities/${univId}`,
          { method: "POST", headers: { Accept: "*/*", Authorization: `Bearer ${accessToken}` } }
        );
        if (res.ok || res.status === 201) setIsFavorite(true);
        else throw new Error("즐겨찾기 추가 실패");
      }
    } catch (error: any) {
      console.error("즐겨찾기 처리 실패:", error);
      showFlash(error?.message || "즐겨찾기 처리 중 오류가 발생했습니다.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (err) return <div className="p-4 text-xs text-red-500">{err}</div>;
  if (loading && !univ) return <div className="p-4 text-sm text-gray-500">불러오는 중…</div>;

  const categories = [
    { icon: "🏛️", title: "학교", path: "학교", desc: "학교 정보 및 연혁" },
    { icon: "🏫", title: "학과", path: "학과", desc: "학과별 커리큘럼 및 진로 정보" },
    { icon: "📘", title: "강의", path: "강의", desc: "강의 요약 및 후기" },
    { icon: "🏢", title: "시설", path: "시설", desc: "학교 시설 및 위치 정보" },
    { icon: "🎉", title: "행사", path: "행사", desc: "축제·세미나 등 행사 정보" },
    { icon: "🏷️", title: "기타", path: "기타", desc: "장학금·교통·등록금 등 기타 문서" },
  ];

  return (
    <section className="space-y-8">
      {/* 플래시 배너 */}
      {flashMsg && (
        <div
          role="status"
          className="flex items-center justify-between rounded-lg bg-[#2C80A0] px-4 py-3 text-white"
        >
          <span className="text-[15px]">{flashMsg}</span>
          <button onClick={() => setFlashMsg(null)} className="hover:opacity-80">
            닫기
          </button>
        </div>
      )}

      {/* 상단 - 학교 개요 카드 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* 로고 (회색 배경 제거) */}
          <div className="h-20 w-20 flex-shrink-0 rounded-xl flex items-center justify-center overflow-hidden">
            {univ?.logoUrl ? (
              <img
                src={univ.logoUrl}
                alt={`${displayName} 로고`}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-3xl">🏫</span>
            )}
          </div>

          <div className="flex-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>

            {/* 즐겨찾기 버튼 */}
            <button
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading || isFavorite === null}
              aria-pressed={!!isFavorite}
              title={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              className={`
                flex h-8 w-8 items-center justify-center rounded-lg border-2 text-xl
                transition-all hover:scale-105
                ${
                  isFavorite
                    ? "bg-[#2C80A0] text-white border-[#2C80A0]"
                    : "bg-white text-gray-400 border-gray-300 hover:border-[#2C80A0] hover:text-[#2C80A0]"
                }
                ${(favoriteLoading || isFavorite === null) ? "opacity-60 cursor-wait" : "cursor-pointer"}
              `}
            >
              ★
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            if (!univId) {
              showFlash("대학교 정보를 불러오는 중입니다.");
              return;
            }
            const accessToken =
              localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
            if (!accessToken) {
              showFlash("로그인이 필요합니다.");
              navigate("/login", { replace: false, state: { from: location.pathname } });
              return;
            }
            const userUnivIdStr =
              localStorage.getItem("myUniversityId") ||
              localStorage.getItem("universityId") ||
              localStorage.getItem("universityID");
            const userUnivId = userUnivIdStr ? Number(userUnivIdStr) : NaN;

            if (!Number.isFinite(userUnivId) || userUnivId !== univId) {
              showFlash("해당 학교 소속만 문서를 생성할 수 있습니다.");
              return;
            }

            navigate(`/univ/${encodeURIComponent(univName!)}/new/docs`, {
              state: { universityId: univId },
            });
          }}
          className="rounded-lg bg-[#2c80a0] text-white text-sm px-4 py-2 hover:bg-[#256a86] transition flex-shrink-0"
        >
          새 문서 만들기
        </button>
      </div>

      {/* 중단 - 주요 카테고리 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">학교 문서 카테고리</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (!univId) {
                  showFlash("대학교 정보를 불러오는 중입니다.");
                  return;
                }
                navigate(`/univ/${encodeURIComponent(univName!)}/category/${cat.path}`, {
                  state: { universityId: univId },
                });
              }}
              className="group flex flex-col items-center justify-center rounded-xl border border-gray-300 bg-white p-4 text-center hover:shadow-sm transition cursor-pointer"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="font-medium text-gray-900">{cat.title}</div>
              <p className="text-xs text-gray-500">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 - 인기 문서 (2열 리스트 형태) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">인기 문서</h2>

        {popularLoading ? (
          <div className="text-sm text-gray-500">불러오는 중…</div>
        ) : popularDocs.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {popularDocs.map((doc, idx) => (
              <div
                key={`${doc.documentTitle}-${idx}`}
                className="py-1 hover:underline hover:text-uniwikicolor cursor-pointer"
                onClick={() => {
                  if (!univName) {
                    showFlash("대학교 정보를 불러오는 중입니다.");
                    return;
                  }
                  navigate(
                    `/univ/${encodeURIComponent(univName)}/docs/${encodeURIComponent(
                      doc.documentTitle
                    )}`,
                    { state: { universityId: univId } }
                  );
                }}
              >
                <h3 className="font-medium mb-1 truncate">{doc.documentTitle}</h3>
                <p className="text-sm text-gray-500">
                  조회수  {doc.viewCount.toLocaleString()}회
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">인기 문서가 없습니다.</div>
        )}
      </div>
    </section>
  );
}
