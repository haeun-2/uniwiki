// pages/admin/AdminDocumentPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* ====== 기존 타입 유지 ====== */
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

/* ====== 지역/대학교 타입 (MainPage와 동일) ====== */
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

type Chip = {
  key: "categoryId" | "universityId" | "title" | "nickname" | "startDate" | "endDate";
  label: string;
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

/* ====== 칩 컴포넌트 ====== */
function FilterChips({
  chips, onRemove, onClear,
}: {
  chips: Chip[];
  onRemove: (key: Chip["key"]) => void;
  onClear: () => void;
}) {
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={() => onRemove(c.key)}
          className="group inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs hover:bg-gray-50"
          title="이 필터 제거"
        >
          <span>{c.label}</span>
          <span className="text-gray-400 group-hover:text-gray-600">✕</span>
        </button>
      ))}
      <button onClick={onClear} className="text-xs text-gray-500 hover:underline">모두 지우기</button>
    </div>
  );
}

/* ====== 페이지 ====== */
export default function AdminDocumentPage() {
  /* 페이지/데이터 */
  const [page, setPage] = useState(0);
  const size = FIXED_SIZE;
  const [data, setData] = useState<AdminDocumentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* 필터 상태 */
  const [categoryId, setCategoryId] = useState<string>("");  // 단일 선택
  const [universityId, setUniversityId] = useState<string>("");
  const [selectedUnivName, setSelectedUnivName] = useState<string>(""); // 칩 표기를 위해 보관
  const [title, setTitle] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  /* 접기/펼치기 */
  const [open, setOpen] = useState(true);

  /* 페이지 이동 입력 */
  const [goto, setGoto] = useState<string>("");

  /* 지역/대학교 (MainPage와 동일 로직) */
  const [regions, setRegions] = useState<Region[]>([]);
  const regionChips = useMemo(
    () => [{ regionId: 0, regionName: "전체" } as Region, ...regions],
    [regions]
  );
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

  /* 쿼리스트링 */
  const queryString = useMemo(() => {
    const q = new URLSearchParams();
    const hasFilter =
      categoryId !== "" ||
      universityId !== "" ||
      title.trim() !== "" ||
      nickname.trim() !== "" ||
      startDate !== "" ||
      endDate !== "";

    if (hasFilter) {
      if (categoryId !== "") q.set("categoryId", String(Number(categoryId)));
      if (universityId !== "") q.set("universityId", String(Number(universityId)));
      if (title.trim() !== "") q.set("title", title.trim());
      if (nickname.trim() !== "") q.set("nickname", nickname.trim());
      const sISO = localToISOZ(startDate);
      const eISO = localToISOZ(endDate);
      if (sISO) q.set("startDate", sISO);
      if (eISO) q.set("endDate", eISO);
    }
    q.set("page", String(page));
    q.set("size", String(size));
    q.set("direction", direction);
    return q.toString();
  }, [categoryId, universityId, title, nickname, startDate, endDate, page, size, direction]);

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
  const pageItems = buildPageItems(page, totalPages);

  const handleGoto = () => {
    const n = Number(goto);
    if (!Number.isFinite(n)) return;
    const target = Math.max(1, Math.min(totalPages, Math.floor(n))) - 1;
    setPage(target);
  };

  const resetFilters = () => {
    setCategoryId("");
    setUniversityId("");
    setSelectedUnivName("");
    setTitle("");
    setNickname("");
    setStartDate("");
    setEndDate("");
    setDirection("desc");
    setSelectedRegionId(0);
    setPage(0);
  };

  const removeOneFilter = (key: Chip["key"]) => {
    switch (key) {
      case "categoryId": setCategoryId(""); break;
      case "universityId": setUniversityId(""); setSelectedUnivName(""); break;
      case "title": setTitle(""); break;
      case "nickname": setNickname(""); break;
      case "startDate": setStartDate(""); break;
      case "endDate": setEndDate(""); break;
    }
    setPage(0);
  };

  const chips: Chip[] = (() => {
    const out: Chip[] = [];
    if (categoryId) {
      const n = CAT.find(c => String(c.id) === categoryId)?.name ?? categoryId;
      out.push({ key: "categoryId", label: `카테고리: ${n}` });
    }
    if (universityId) out.push({ key: "universityId", label: `대학: ${selectedUnivName || universityId}` });
    if (title.trim()) out.push({ key: "title", label: `제목: ${title.trim()}` });
    if (nickname.trim()) out.push({ key: "nickname", label: `닉네임: ${nickname.trim()}` });
    if (startDate) out.push({ key: "startDate", label: `시작: ${startDate.replace("T", " ")}` });
    if (endDate) out.push({ key: "endDate", label: `종료: ${endDate.replace("T", " ")}` });
    return out;
  })();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">문서 생성/수정 내역</h1>

      {/* ====== 필터 박스 ====== */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        {/* 접힘 상태 헤더(칩만 노출) */}
        {!open && (
          <div className="p-3">
            <FilterChips chips={chips} onRemove={removeOneFilter} onClear={resetFilters} />
          </div>
        )}

        {/* 본문: 열림일 때만 */}
        {open && (
          <div className="p-4 space-y-6">
            {/* 카테고리 */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">카테고리</span>
              <div className="flex flex-wrap gap-4">
                {CAT.map((c) => {
                  const checked = categoryId === String(c.id);
                  return (
                    <label key={c.id} className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={checked}
                        onChange={() => setCategoryId(checked ? "" : String(c.id))}
                      />
                      <span>{c.name}</span>
                    </label>
                  );
                })}
              </div>
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
                {/* 고정 높이: min/max 둘 다 지정해서 탭 전환 시 높이 유지 */}
                <div className="min-h-[360px] max-h-[360px] overflow-y-auto p-3 pr-2 text-sm text-gray-700">
                  {loadingUniversities && (
                    <div className="h-full w-full rounded bg-gray-50 animate-pulse" />
                  )}
                  {univError && <div className="text-xs text-red-500">대학교 목록 오류</div>}
                  {!loadingUniversities && !univError && (
                    // {/* 👇 2) 그리드/아이템 스타일 변경(더 조밀) */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-4 gap-y-2">
                      {universities.map((u) => {
                        const active = universityId === String(u.universityId);
                        return (
                          <button
                            type="button"
                            key={u.universityId}
                            onClick={() => {
                              const next = active ? "" : String(u.universityId);
                              setUniversityId(next);
                              setSelectedUnivName(active ? "" : u.universityName);
                            }}
                            className={[
                              "block w-full truncate text-left",
                              "text-[13px] leading-6",             // 글자/줄간격 축소
                              "px-1 py-0.5",                        // 내부 여백 축소
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

            {/* 기타 필드 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-gray-600">문서명</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="문서 제목"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">작성/수정자</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="닉네임"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">기간 시작</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">기간 종료</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* 정렬 + 버튼 */}
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-gray-500">정렬</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as "asc" | "desc")}
                className="border rounded-lg px-3 py-1.5 text-sm bg-white"
              >
                <option value="desc">최신순</option>
                <option value="asc">과거순</option>
              </select>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => { setPage(0); }}
                  className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-sm"
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
          </div>
        )}

        {/* 하단 토글 버튼 */}
        <div className="flex justify-center py-3">
          <button
            onClick={() => setOpen(v => !v)}
            className="inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm hover:bg-gray-50"
            aria-label={open ? "필터 접기" : "필터 펼치기"}
            title={open ? "필터 접기" : "필터 펼치기"}
          >
            {open ? (
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 12l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* 상단 상태 바 + 페이지 이동 입력 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm text-gray-500">
          페이지 {data ? data.page + 1 : page + 1} / {data ? Math.max(1, data.totalPages) : 1} • 총 {data?.totalElements ?? 0}건 • 페이지당 {size}건
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <input
              value={goto}
              onChange={(e) => setGoto(e.target.value.replace(/[^\d]/g, ""))}
              onKeyDown={(e) => { if (e.key === "Enter") handleGoto(); }}
              placeholder="페이지 번호"
              className="w-28 border rounded-lg px-3 py-2 text-sm text-right"
              inputMode="numeric"
            />
            <button onClick={handleGoto} className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 rounded border text-xs hover:bg-gray-50">
              이동
            </button>
          </div>
        </div>
      </div>

      {/* 로딩/에러/테이블/페이지네이션 (기존 그대로) */}
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
              {rows.map((d, idx) => {
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
      </div>
    </div>
  );
}
