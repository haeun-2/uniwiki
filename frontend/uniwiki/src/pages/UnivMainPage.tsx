import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type University = {
  universityId: number;
  universityName: string;
  logoUrl: string | null;
};

type LocationState = { universityId?: number };

type PopularDoc = {
  documentTitle: string;
  viewCount: number;
};

// 한글/영문 혼용, 공백, 정규화 대비
const norm = (s: string) =>
  s
    .normalize("NFKC")
    .trim()
    .toLowerCase();

export default function UnivMainPage() {
  const { univName } = useParams<{ univName: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const passedUnivId = (location.state as LocationState | null)?.universityId ?? null;

  // 1) URL에서 받은 이름(사용자 입력값)
  const inputName = useMemo(
    () => (univName ? decodeURIComponent(univName) : ""),
    [univName]
  );

  // 2) state에서 온 id (MainPage 링크 클릭 시)
  const initialId = location.state?.universityId ?? null;

  // 3) 확정된 id/대학 정보/오류/로딩
  const [univId, setUnivId] = useState<number | null>(initialId);
  const [univ, setUniv] = useState<University | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 🔥 인기 문서 상태
  const [popularDocs, setPopularDocs] = useState<PopularDoc[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);

  // 4) state가 없을 때: 이름으로 id 폴백 매핑
  useEffect(() => {
    if (univId || !inputName) return;
    let mounted = true;
    (async () => {
      try {
        setErr(null);
        const res = await fetch("http://k13d104.p.ssafy.io/api/v1/universities", {
          headers: { accept: "*/*" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list: University[] = await res.json();

        const t = norm(inputName);
        const exact =
          list.find(u => norm(u.universityName) === t) ??
          list.find(u => norm(u.universityName).replace(/\s+/g, "") === t.replace(/\s+/g, ""));

        // 부분 포함 허용(원치 않으면 제거)
        const partial = exact ? null : list.find(u => norm(u.universityName).includes(t));

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

  // 5) 확정된 id로 "공식 이름 포함" 정보 확보
  useEffect(() => {
    if (!univId) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        // (임시) 목록 재사용. 백엔드에 /universities/:id 가 생기면 교체 권장
        const res = await fetch("http://k13d104.p.ssafy.io/api/v1/universities", {
          headers: { accept: "*/*" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const list: University[] = await res.json();
        const me = list.find(u => u.universityId === univId) ?? null;
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

  // 6) 정규 URL로 교체: 공식 이름 기준으로 경로 통일
  useEffect(() => {
    if (!univ) return;
    const canonical = `/univ/${encodeURIComponent(univ.universityName)}`;
    if (location.pathname !== canonical) {
      navigate(canonical, { replace: true, state: { universityId: univ.universityId } });
    }
  }, [univ, location.pathname, navigate]);

  // 7) 표시는 항상 "공식 이름"
  const displayName = univ?.universityName || inputName || "대학교";

  // ⭐ 인기 문서 API 호출: /api/v1/documents/popular?universityId=...
  useEffect(() => {
    if (!univId) return;
    let mounted = true;
    (async () => {
      try {
        setPopularLoading(true);
        const resp = await fetch(
          `http://k13d104.p.ssafy.io/api/v1/documents/popular?universityId=${univId}`,
          {
            method: "GET",
            headers: { Accept: "*/*" },
          }
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

  if (err) return <div className="p-4 text-xs text-red-500">{err}</div>;
  if (loading && !univ) return <div className="p-4 text-sm text-gray-500">불러오는 중…</div>;

  const categories = [
    { icon: "🏛️", title: "학교", path: "학교", desc: "학교 정보 및 연혁" },
    { icon: "🏫", title: "학과", path: "학과", desc: "학과별 커리큘럼 및 진로 정보" },
    { icon: "📘", title: "강의", path: "강의", desc: "강의 요약 및 후기" },
    { icon: "🏢", title: "시설", path: "시설", desc: "학교 시설 및 위치 정보"},
    { icon: "🎉", title: "행사", path: "행사", desc: "축제·세미나 등 행사 정보",  },
    { icon: "🏷️", title: "기타", path: "기타", desc: "장학금·교통·등록금 등 기타 문서" },
  ];

  return (
    <section className="space-y-8">
      {/* 상단 - 학교 개요 카드 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
            🏫
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{displayName}</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              (id: {univId ?? "미전달"}) {univ ? "매핑 완료" : ""}
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            if (!univId) {
              alert("대학교 정보를 불러오는 중입니다.");
              return;
            }

            // ✅ 로그인 체크
            const accessToken = localStorage.getItem("accessToken");
            if (!accessToken) {
              alert("로그인이 필요합니다.");
              navigate("/login", { 
                replace: false, 
                state: { from: location.pathname } 
              });
              return;
            }

            // ✅ 대학교 일치 여부 확인 (universityId가 없거나 다른 경우 모두 포함)
            const userUnivId = localStorage.getItem("universityId");
            if (!userUnivId || parseInt(userUnivId) !== univId) {
              alert("해당 학교 소속만 문서를 생성할 수 있습니다.");
              return;
            }

            // ✅ 모든 체크 통과 → 페이지 이동
            navigate(`/univ/${encodeURIComponent(univName!)}/new/docs`, {
              state: { universityId: univId }
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
                  alert("대학교 정보를 불러오는 중입니다.");
                  return;
                }
                navigate(`/univ/${encodeURIComponent(univName!)}/category/${cat.path}`, {
                  state: { universityId: univId }
                });
              }}
              className="group flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 text-center hover:shadow-sm transition cursor-pointer"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="font-medium text-gray-900">{cat.title}</div>
              <p className="text-xs text-gray-500">{cat.desc}</p>
              <div className="text-[11px] text-gray-400 mt-1">{cat.count}개 문서</div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 - 인기 문서 (UI 동일, 데이터만 API 연동) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 문서</h2>

        {popularLoading ? (
          <div className="text-sm text-gray-500">불러오는 중…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {popularDocs.length > 0 ? (
              popularDocs.map((doc, idx) => (
                <div
                  key={`${doc.documentTitle}-${idx}`}
                  className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition cursor-pointer"
                  onClick={() => {
                    if (!univName) {
                      alert("대학교 정보를 불러오는 중입니다.");
                      return;
                    }
                    navigate(`/univ/${encodeURIComponent(univName)}/docs/${encodeURIComponent(doc.documentTitle)}`, {
                      state: { universityId: univId }
                    });
                  }}
                >
                  <h3 className="font-medium text-gray-900 mb-1">{doc.documentTitle}</h3>
                  <p className="text-sm text-gray-500">
                    {displayName} · 조회수 {doc.viewCount.toLocaleString()}회
                  </p>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">인기 문서가 없습니다.</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}