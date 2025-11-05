import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom"

type University = {
  universityId: number;
  universityName: string;
  logoUrl: string | null;
};

type LocationState = { universityId?: number };

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

        // 부분 포함까지 허용(원치 않으면 제거)
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
    return () => { mounted = false; };
  }, [inputName, univId]);

  // 5) 확정된 id로 “공식 이름 포함” 정보 확보
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
    return () => { mounted = false; };
  }, [univId]);

  // 6) 정규 URL로 교체: 공식 이름 기준으로 경로 통일
  useEffect(() => {
    if (!univ) return;
    const canonical = `/univ/${encodeURIComponent(univ.universityName)}`;
    if (location.pathname !== canonical) {
      navigate(canonical, { replace: true, state: { universityId: univ.universityId } });
    }
  }, [univ, location.pathname, navigate]);

  // 7) 표시는 항상 “공식 이름”
  const displayName = univ?.universityName || inputName || "대학교";

  if (err) return <div className="p-4 text-xs text-red-500">{err}</div>;
  if (loading && !univ) return <div className="p-4 text-sm text-gray-500">불러오는 중…</div>;

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
            (id: {univId ?? "미전달"}) {univ ? "매핑 완료" : ""}
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
