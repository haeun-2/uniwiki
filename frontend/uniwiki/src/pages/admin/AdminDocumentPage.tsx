// src/pages/admin/AdminDocumentPage.tsx
import React, { useEffect, useMemo, useState } from "react";

type AdminDocumentRevision = {
  universityName: string;
  categoryName: string;
  documentTitle: string;
  createdAt: string;
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

const API_BASE = "http://k13d104.p.ssafy.io/api/v1";
const FIXED_SIZE = 10;

function getToken() {
  return (
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
}

const fmt = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

// 번호형 페이지네이션(ellipsis 포함)
function buildPageItems(cur: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const items: (number | "...")[] = [];
  const push = (v: number | "...") => items.push(v);

  const show = new Set<number>([
    0,
    total - 1,
    cur,
    cur - 1,
    cur + 1,
    1,
    total - 2,
  ]);
  const normalized = [...show].filter((n) => n >= 0 && n < total).sort((a, b) => a - b);

  let prev: number | null = null;
  for (const n of normalized) {
    if (prev !== null && n - prev > 1) push("...");
    push(n);
    prev = n;
  }
  return items;
}

export default function AdminDocumentPage() {
  const [page, setPage] = useState(0);               // 0-based
  const size = FIXED_SIZE;                            // 고정 사이즈(10)
  const [data, setData] = useState<AdminDocumentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [goto, setGoto] = useState<string>("");       // 직접 이동용 입력값(1-based)

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const res = await fetch(
          `${API_BASE}/admin/document-revisions?page=${page}&size=${size}`,
          {
            headers: {
              Accept: "*/*",
              Authorization: token ? `Bearer ${token}` : "",
            },
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as AdminDocumentResponse;
        setData(json);
      } catch (e: any) {
        if (e?.name !== "AbortError")
          setError(e?.message ?? "불러오기에 실패했습니다");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [page, size]);

  const rows = data?.content ?? [];

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return rows;
    return rows.filter((d) => d.documentTitle.includes(kw));
  }, [rows, keyword]);

  const totalPages = data?.totalPages ?? 1;
  const pageItems = buildPageItems(page, totalPages);

  const handleGoto = () => {
    const n = Number(goto);
    if (!Number.isFinite(n)) return;
    const target = Math.max(1, Math.min(totalPages, Math.floor(n))) - 1; // to 0-based
    setPage(target);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">문서 생성/수정 내역</h1>

      {/* 상단 바: 페이지 정보 + 검색 + 직접 이동 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm text-gray-500">
          페이지 {data ? data.page + 1 : page + 1} / {totalPages} • 총 {data?.totalElements ?? 0}건 • 페이지당 {size}건
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* 제목 검색 */}
          <div className="relative">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="문서 제목 검색"
              className="w-64 border rounded-lg px-3 py-2 text-sm pr-8"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 border-b bg-gray-50/60 animate-pulse" />
          ))}
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-4 text-sm">
          불러오는 중 오류가 발생했습니다: {error}
        </div>
      )}

      {/* 테이블 */}
      {!loading && !error && (
        <div className="overflow-x-auto border-t border-gray-200 rounded-2xl bg-white">
          <table className="min-w-[900px] w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-700 font-medium">
            <tr className="border-b">
                <th className="py-2 w-52">생성/수정 일시</th>
                <th className="py-2 w-40">대학</th>
                <th className="py-2 w-32">카테고리</th>
              <th className="py-2">문서 제목</th>
                <th className="py-2 w-36 text-center">변경(+/−)</th>
            </tr>
          </thead>
          <tbody>
              {filtered.map((d, idx) => (
                <tr
                  key={`${d.documentTitle}-${d.createdAt}-${idx}`}
                  className="group border-b hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    // TODO: 상세 경로 연결
                  }}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      (e.currentTarget as HTMLTableRowElement).click();
                    }
                  }}
                >
                  <td className="py-3 w-52 text-gray-700">{fmt(d.createdAt)}</td>
                  <td className="py-3 w-40 truncate">{d.universityName}</td>
                  <td className="py-3 w-32 truncate">{d.categoryName}</td>
                <td className="py-3">
                    <span className="inline-block max-w-full truncate group-hover:underline">
                      {d.documentTitle}
                    </span>
                </td>
                  <td className="py-3 w-36 text-center">
                    <span className="font-medium">
                      <span className="text-blue-600">+{d.plusCount}</span>
                      <span className="mx-1 text-gray-400">/</span>
                      <span className="text-rose-600">{d.minusCount}</span>
                    </span>
                </td>
              </tr>
            ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                    표시할 문서 내역이 없습니다.
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
      )}

      {/* 페이지네이션 + 입력칸을 한 줄로 정렬 */}
      <div className="pt-2 flex flex-wrap items-center text-sm">
        {/* 왼쪽: 페이지 버튼들 */}
        <div className="flex flex-wrap items-center gap-1">
        <button
            disabled={loading || page === 0}
            onClick={() => setPage(0)}
            className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40"
          >
            « 처음
          </button>
          <button
            disabled={loading || !(data?.hasPre)}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40"
        >
            ‹ 이전
        </button>

          {pageItems.map((it, i) =>
            it === "..." ? (
              <span key={`dots-${i}`} className="px-2 py-1 text-gray-400">…</span>
            ) : (
              <button
                key={it}
                onClick={() => setPage(it)}
                className={`px-2 py-1 rounded border ${
                  it === page ? "bg-gray-100 font-semibold" : "hover:bg-gray-50"
                }`}
                disabled={loading}
              >
                {it + 1}
              </button>
            )
          )}

          <button
            disabled={loading || !(data?.hasNext)}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40"
          >
            다음 ›
          </button>
          <button
            disabled={loading || page >= totalPages - 1}
            onClick={() => setPage(totalPages - 1)}
            className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40"
          >
            끝 »
          </button>
        </div>

        {/* 오른쪽: 페이지 입력칸 */}
        <div className="ms-5 flex items-center gap-1 text-sm">
          <input
            value={goto}
            onChange={(e) => setGoto(e.target.value.replace(/[^\d]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGoto();
            }}
            placeholder="페이지 입력"
            className="w-24 border rounded-lg px-2 py-2 text-sm text-right"
            inputMode="numeric"
          />
        <button
            onClick={handleGoto}
            className="px-2 py-2 rounded-lg border hover:bg-gray-50"
        >
            이동
        </button>
      </div>
      </div>
    </div>
  );
}
