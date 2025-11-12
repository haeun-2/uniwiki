import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* ====== 타입 ====== */
type AdminDocumentRevision = {
  documentId: number;
  createdAt: string;
  universityName: string;
  categoryName: string;
  documentTitle: string;
  nickname: string;
  plusCount: number;
  minusCount: number;
};
type AdminDocumentResponse = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasPre: boolean;
  hasNext: boolean;
  content: AdminDocumentRevision[];
};

/* ====== 지역/대학교 타입 ====== */
type Region = { regionId: number; regionName: string };
type University = { universityId: number; universityName: string; logoUrl: string | null };

/* ====== 상수/유틸 ====== */
const API_BASE = "https://k13d104.p.ssafy.io/api/v1";
const FIXED_SIZE = 10;
const CAT = [
  { id: 1, name: "학교" },
  { id: 2, name: "학과" },
  { id: 3, name: "강의" },
  { id: 4, name: "시설" },
  { id: 5, name: "행사" },
  { id: 6, name: "기타" },
];
const shortenRegion = (name: string) => {
  if (name.endsWith("특별시")) return name.replace("특별시", "");
  if (name.endsWith("광역시")) return name.replace("광역시", "");
  if (name.endsWith("특별자치시")) return name.replace("특별자치시", "");
  if (name.endsWith("특별자치도")) return name.replace("특별자치도", "");
  if (name.endsWith("도"))
    return name.replace("경상", "경").replace("전라", "전").replace("충청", "충").replace("도", "");
  return name;
};

function getToken() {
  return (
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
}

const fmt = (iso: string) => {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
};

function buildPageItems(cur: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const items: (number | "...")[] = [];
  const show = new Set<number>([0, 1, total - 2, total - 1, cur - 1, cur, cur + 1]);
  const normalized = [...show].filter(n => n >= 0 && n < total).sort((a, b) => a - b);
  let prev: number | null = null;
  for (const n of normalized) {
    if (prev !== null && n - prev > 1) items.push("...");
    items.push(n);
    prev = n;
  }
  return items;
}

function buildDocumentHref(universityName: string, documentName: string) {
  const univ = encodeURIComponent(universityName);
  const doc = encodeURIComponent(documentName);
  return `/univ/${univ}/docs/${doc}`;
}

function localToISOZ(s: string | undefined) {
  if (!s) return undefined;
  const d = new Date(s);
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

type ChipKey = "categoryId" | "universityId" | "title" | "nickname" | "startDate" | "endDate";



/* ====== 페이지 ====== */
export default function AdminDocumentPage() {

  /* 페이지/데이터 */
  const [page, setPage] = useState(0);
  const size = FIXED_SIZE;
  const [data, setData] = useState<AdminDocumentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* 폼 상태(사용자가 입력 중인 값) */
  const [form, setForm] = useState({
    categoryId: "",
    universityId: "",
    title: "",
    nickname: "",
    startDate: "",
    endDate: "",
    direction: "desc" as "asc" | "desc",
    selectedUnivName: "",
  });

  /* 적용된 필터(실제 요청에 사용) */
  const [applied, setApplied] = useState({
    categoryId: "",
    universityId: "",
    title: "",
    nickname: "",
    startDate: "",
    endDate: "",
    direction: "desc" as "asc" | "desc",
    selectedUnivName: "",
  });

  /* 접기/펼치기 */
  const [open, setOpen] = useState(true);

  /* 페이지 이동 입력 */
  const [goto, setGoto] = useState<string>("");

  /* 지역/대학교 (MainPage와 동일 로직) */
  const [regions, setRegions] = useState<Region[]>([]);
  const regionChips = useMemo(() => [{ regionId: 0, regionName: "전체" } as Region, ...regions], [regions]);
  const [selectedRegionId, setSelectedRegionId] = useState<number>(0);

  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [univError, setUnivError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingRegions(true);
        setRegionError(null);
        const res = await fetch(`${API_BASE}/regions`, { method: "GET" });
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

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingUniversities(true);
        setUnivError(null);
        const url = selectedRegionId === 0
          ? `${API_BASE}/universities`
          : `${API_BASE}/universities?region=${selectedRegionId}`;
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

  /* 쿼리스트링(적용된 값 기준) */
  const queryString = useMemo(() => {
    const q = new URLSearchParams();
    const hasFilter =
      applied.categoryId !== "" ||
      applied.universityId !== "" ||
      applied.title.trim() !== "" ||
      applied.nickname.trim() !== "" ||
      applied.startDate !== "" ||
      applied.endDate !== "";

    if (hasFilter) {
      if (applied.categoryId !== "") q.set("categoryId", String(Number(applied.categoryId)));
      if (applied.universityId !== "") q.set("universityId", String(Number(applied.universityId)));
      if (applied.title.trim() !== "") q.set("title", applied.title.trim());
      if (applied.nickname.trim() !== "") q.set("nickname", applied.nickname.trim());
      const sISO = localToISOZ(applied.startDate);
      const eISO = localToISOZ(applied.endDate);
      if (sISO) q.set("startDate", sISO);
      if (eISO) q.set("endDate", eISO);
    }
    q.set("page", String(page));
    q.set("size", String(size));
    q.set("direction", applied.direction);
    return q.toString();
  }, [applied, page, size]);

  /* 데이터 요청 */
  async function fetchList(signal?: AbortSignal) {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/admin/document-revisions?${queryString}`, {
        headers: { Accept: "*/*", Authorization: token ? `Bearer ${token}` : "" },
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as AdminDocumentResponse;
      setData(json);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message ?? "불러오기에 실패했습니다");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetchList(controller.signal);
    return () => controller.abort();
  }, [queryString]);

  const rows = data?.content ?? [];
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  const handleGoto = () => {
    const n = Number(goto);
    if (!Number.isFinite(n)) return;
    const target = Math.max(1, Math.min(totalPages, Math.floor(n))) - 1;
    setPage(target);
  };
  
  /* 액션들 */
  const applyFilters = () => {
    setApplied(form);
    setPage(0);
  };

  const resetFilters = () => {
    const empty = {
      categoryId: "",
      universityId: "",
      title: "",
      nickname: "",
      startDate: "",
      endDate: "",
      direction: "desc" as "asc" | "desc",
      selectedUnivName: "",
    };
    setForm(empty);
    setApplied(empty);
    setSelectedRegionId(0);
    setPage(0);
  };

  const removeOneFilter = (key: ChipKey) => {
    const nextForm = { ...form };
    const nextApplied = { ...applied };
    switch (key) {
      case "categoryId": nextForm.categoryId = ""; nextApplied.categoryId = ""; break;
      case "universityId": nextForm.universityId = ""; nextApplied.universityId = ""; nextForm.selectedUnivName = ""; nextApplied.selectedUnivName = ""; break;
      case "title": nextForm.title = ""; nextApplied.title = ""; break;
      case "nickname": nextForm.nickname = ""; nextApplied.nickname = ""; break;
      case "startDate": nextForm.startDate = ""; nextApplied.startDate = ""; break;
      case "endDate": nextForm.endDate = ""; nextApplied.endDate = ""; break;
    }
    setForm(nextForm);
    setApplied(nextApplied);
    setPage(0);
  };

  const chips = (() => {
    const out: { key: ChipKey; label: string }[] = [];
    if (applied.categoryId) {
      const n = CAT.find(c => String(c.id) === applied.categoryId)?.name ?? applied.categoryId;
      out.push({ key: "categoryId", label: `카테고리: ${n}` });
    }
    if (applied.universityId) out.push({ key: "universityId", label: `대학: ${applied.selectedUnivName || applied.universityId}` });
    if (applied.title.trim()) out.push({ key: "title", label: `제목: ${applied.title.trim()}` });
    if (applied.nickname.trim()) out.push({ key: "nickname", label: `닉네임: ${applied.nickname.trim()}` });
    if (applied.startDate) out.push({ key: "startDate", label: `시작: ${applied.startDate.replace("T", " ")}` });
    if (applied.endDate) out.push({ key: "endDate", label: `종료: ${applied.endDate.replace("T", " ")}` });
    return out;
  })();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">문서 생성/수정 내역</h1>

      {/* ====== 필터 박스 ====== */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        
        {/* 상세 필터 본문: 열림일 때만 */}
        {open && (
          <div className="p-4 space-y-6">
            {/* 카테고리 */}
            <div className="flex items-center gap-4 justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">카테고리</span>
                <div className="flex flex-wrap gap-4">
                  {CAT.map((c) => {
                    const checked = form.categoryId === String(c.id);
                    return (
                      <label key={c.id} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={checked}
                          onChange={() => setForm(f => ({ ...f, categoryId: checked ? "" : String(c.id) }))}
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50"
                aria-label="필터 접기"
                title="필터 접기"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                  <path d="M5 12l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* 대학교 영역 */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 mr-1">대학교</span>

                {/* 지역 칩 */}
                {loadingRegions && (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-7 w-14 animate-pulse rounded-full bg-gray-100" />
                    ))}
                  </>
                )}
                {regionError && <span className="text-xs text-red-500">지역 목록 오류</span>}
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
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100",
                      ].join(" ")}
                      title={r.regionName}
                    >
                      {r.regionId === 0 ? "전체" : shortenRegion(r.regionName)}
                    </button>
                  );
                })}
              </div>

              {/* 대학교 스크롤 목록 */}
              <div className="rounded-2xl border border-gray-200">
                {/* 고정 높이: 탭 전환 시 높이 유지 */}
                <div className="min-h-[240px] max-h-[240px] overflow-y-auto p-3 pr-2 text-sm text-gray-700">
                  {loadingUniversities && (
                    <div className="h-full w-full rounded bg-gray-50 animate-pulse" />
                  )}
                  {univError && <div className="text-xs text-red-500">대학교 목록 오류</div>}
                  {!loadingUniversities && !univError && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-4 gap-y-2">
                      {universities.map((u) => {
                        const active = form.universityId === String(u.universityId);
                        return (
                          <button
                            type="button"
                            key={u.universityId}
                            onClick={() => {
                              const next = active ? "" : String(u.universityId);
                              setForm(f => ({ ...f, universityId: next, selectedUnivName: active ? "" : u.universityName }));
                            }}
                            className={[
                              "block w-full truncate text-left",
                              "text-[13px] leading-6",
                              "px-1 py-0.5",
                              active ? "text-[#2C80A0] font-medium underline" : "hover:underline",
                            ].join(" ")}
                            title={u.universityName}
                          >
                            {u.universityName}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 문서명, 작성/수정자 */}
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm text-gray-600">문서명</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="문서 제목"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">작성/수정자</label>
                <input
                  value={form.nickname}
                  onChange={(e) => setForm(f => ({ ...f, nickname: e.target.value }))}
                  placeholder="닉네임"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm text-gray-600">기간 시작</label>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">기간 종료</label>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* 적용된 칩 표시 */}
            {(chips.length > 0) && (
              <div className="pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  {chips.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => removeOneFilter(c.key)}
                      className="group inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs hover:bg-gray-50"
                      title="이 필터 제거"
                    >
                      <span>{c.label}</span>
                      <span className="text-gray-400 group-hover:text-gray-600">✕</span>
                    </button>
                  ))}
                  <button onClick={resetFilters} className="text-xs text-gray-500 hover:underline">모두 지우기</button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 pb-3 border-b border-gray-100">
          {open ? (
            // 열림: 정렬 + 적용/초기화
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-gray-500">정렬</label>
              <select
                value={form.direction}
                onChange={(e) => setForm(f => ({ ...f, direction: e.target.value as "asc" | "desc" }))}
                className="border rounded-lg px-3 py-1.5 text-sm bg-white"
              >
                <option value="desc">최신순</option>
                <option value="asc">과거순</option>
              </select>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={applyFilters}
                  className="px-3 py-1.5 rounded-lg bg-uniwikicolor text-white hover:bg-uniwikicolor_hover text-sm"
                >
                  적용
                </button>
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-sm"
                >
                  초기화
                </button>
              </div>
            </div>
          ) : (
            // 닫힘: 펼치기 버튼만 우측에 표시
            <div className="flex items-center">
              <span className="text-sm">필터링 메뉴 열기</span>
              <div className="ml-auto">
                <button
                  onClick={() => setOpen(true)}
                  className="inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-sm hover:bg-gray-50"
                  aria-label="필터 펼치기"
                  title="필터 펼치기"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 상단 상태 바 + 페이지 이동 입력 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm text-gray-500">
          페이지 {data ? data.page + 1 : page + 1} / {data ? Math.max(1, data.totalPages) : 1} • 총 {data?.totalElements ?? 0}건 • 페이지당 {size}건
        </div>
      </div>

      {/* 로딩/에러/테이블 */}
      {loading && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 border-b bg-gray-50/60 animate-pulse" />
          ))}
        </div>
      )}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-4 text-sm">
          불러오는 중 오류가 발생했습니다: {error}
        </div>
      )}
      {!loading && !error && (
        <div className="overflow-x-auto border-t border-gray-200 rounded-2xl bg-white">
          <table className="min-w-[1000px] w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 font-medium">
              <tr className="border-b">
                <th className="py-2 w-52">생성/수정 일시</th>
                <th className="py-2 w-40">대학</th>
                <th className="py-2 w-28">카테고리</th>
                <th className="py-2">문서 제목</th>
                <th className="py-2 w-28">닉네임</th>
                <th className="py-2 w-36 text-center">변경(+/−)</th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).map((d, idx) => {
                const href = buildDocumentHref(d.universityName, d.documentTitle);
                return (
                  <tr key={`${d.documentId}-${d.createdAt}-${idx}`} className="group border-b hover:bg-gray-50 transition-colors">
                    <td colSpan={6} className="p-0">
                      <Link
                        to={href}
                        className="flex items-center justify-between w-full px-3 py-3 text-left"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="새 창으로 문서 열기"
                      >
                        <div className="flex w-full">
                          <div className="w-52 text-gray-700">{fmt(d.createdAt)}</div>
                          <div className="w-40 truncate">{d.universityName}</div>
                          <div className="w-28 truncate">{d.categoryName}</div>
                          <div className="flex-1 truncate">{d.documentTitle}</div>
                          <div className="w-28 truncate">{d.nickname}</div>
                          <div className="w-36 text-center font-medium">
                            <span className="text-blue-600">+{d.plusCount}</span>
                            <span className="mx-1 text-gray-400">/</span>
                            <span className="text-rose-600">{d.minusCount}</span>
                          </div>
                        </div>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-gray-500">표시할 문서 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="pt-2 flex flex-wrap items-center text-sm">
        <div className="flex flex-wrap items-center gap-1">
          <button disabled={loading || page === 0} onClick={() => setPage(0)} className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40">« 처음</button>
          <button disabled={loading || !(data?.hasPre)} onClick={() => setPage(p => Math.max(0, p - 1))} className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40">‹ 이전</button>
          {buildPageItems(page, totalPages).map((it, i) =>
            it === "..." ? (
              <span key={`dots-${i}`} className="px-2 py-1 text-gray-400">…</span>
            ) : (
              <button key={it} onClick={() => setPage(it)} className={`px-2 py-1 rounded border ${it === page ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"}`} disabled={loading}>
                {it + 1}
              </button>
            )
          )}
          <button disabled={loading || !(data?.hasNext)} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40">다음 ›</button>
          <button disabled={loading || page >= totalPages - 1} onClick={() => setPage(totalPages - 1)} className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40">끝 »</button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={goto}
            onChange={(e) => setGoto(e.target.value.replace(/[^\d]/g, ""))}
            onKeyDown={(e) => { if (e.key === "Enter") handleGoto(); }}
            placeholder="페이지 번호"
            className="w-28 border rounded-lg px-3 py-2 text-sm text-right"
            inputMode="numeric"
          />
          <button onClick={handleGoto} className="px-2 py-1 rounded border text-xs hover:bg-gray-50">
            이동
          </button>
        </div>
      </div>
    </div>
  );
}
