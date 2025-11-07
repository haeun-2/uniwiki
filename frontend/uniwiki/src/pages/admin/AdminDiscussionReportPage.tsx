import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/** ===== 타입 (API 스키마 기반) ===== */
export type ReportCode = "PENDING" | "RESOLVED" | "REJECTED";

export type DiscussionReportValue = {
  reportId: number;
  reporterName: string;
  reason: string;
  code: ReportCode;
  createdAt: string; // ISO
};

export type ReportedDiscussion = {
  discussionId: number;
  discussionContentId: number;
  documentName: string;
  universityName: string;
  discussionValueList: DiscussionReportValue[];
};

export type AdminDiscussionReportResponse = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasPre: boolean;
  hasNext: boolean;
  content: ReportedDiscussion[];
};

/** ===== 유틸 ===== */
const API_BASE = "https://k13d104.p.ssafy.io/api/v1";

const fmt = (iso: string) => new Date(iso).toLocaleString();
const codeBadge: Record<ReportCode, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};
function getToken() {
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";
}
// 상태(PENDING 우선) → 최신순
function sortReports(list: DiscussionReportValue[]) {
  const order = { PENDING: 0, RESOLVED: 1, REJECTED: 2 } as const;
  return [...list].sort((a, b) => {
    const byStatus = order[a.code] - order[b.code];
    if (byStatus !== 0) return byStatus;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/** 토론 상세로 가는 링크 빌더
 * 기본: /univ/:univName/docs/:documentTitle/discussions/:id
 * 만약 프로젝트 라우트가 /docs/:documentTitle/discussions/:id 라면 아래 return 문을 주석의 대안으로 교체하세요.
 */
function buildDiscussionHref(universityName: string, documentName: string, discussionContentId: number) {
  const univ = encodeURIComponent(universityName);
  const doc = encodeURIComponent(documentName);
  const id = encodeURIComponent(String(discussionContentId));
  return `/univ/${univ}/docs/${doc}/discussions/${id}`;

  // (대안) 라우트가 /docs/:documentTitle/discussions/:id 인 경우:
  // return `/docs/${doc}/discussions/${id}`;
}

/* ===== API ===== */
async function apiRejectDiscussion(discussionContentId: number, reason: string) {
  const res = await fetch(`${API_BASE}/admin/discussion-reports/${discussionContentId}/reject`, {
    method: "PATCH",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error(`Reject HTTP ${res.status}`);
}

async function apiResolveDiscussion(discussionId: number, reason: string) {
  const res = await fetch(`${API_BASE}/admin/discussion-reports/${discussionId}/resolve`, {
    method: "PATCH",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error(`Resolve HTTP ${res.status}`);
}

/** ===== 공용 모달 ===== */
function ReasonModal({
  title,
  confirmText,
  placeholder,
  onClose,
  onConfirm,
}: {
  title: string;
  confirmText: string;
  placeholder: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const canSubmit = reason.trim().length > 0;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[480px]">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-gray-400 text-xl" onClick={onClose}>×</button>
        </div>
        <div className="space-y-3">
          <label className="text-sm block">사유</label>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            className="w-full h-28 border rounded-lg px-3 py-2 text-sm resize-none"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-2 border rounded-lg">취소</button>
            <button
              disabled={!canSubmit}
              onClick={() => {
                onConfirm(reason.trim());
                onClose();
              }}
              className={`px-3 py-2 rounded-lg text-white ${
                canSubmit ? "bg-uniwikicolor hover:bg-uniwikicolor_hover" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** ===== 섹션(토론 1건) ===== */
function ReportedDiscussionSection({
  item,
  onOpenReject,
  onOpenResolve,
}: {
  item: ReportedDiscussion;
  onOpenReject: (d: ReportedDiscussion) => void;
  onOpenResolve: (d: ReportedDiscussion) => void;
}) {
  const [open, setOpen] = useState(false);
  const sorted = useMemo(() => sortReports(item.discussionValueList), [item.discussionValueList]);
  const counts = useMemo(() => {
    return item.discussionValueList.reduce(
      (acc, r) => {
        acc.total += 1;
        acc[r.code] += 1 as 1;
        return acc;
      },
      { total: 0, PENDING: 0, RESOLVED: 0, REJECTED: 0 } as { total: number } & Record<ReportCode, number>
    );
  }, [item.discussionValueList]);
  const hasPending = item.discussionValueList.some((r) => r.code === "PENDING");

  const href = buildDiscussionHref(item.universityName, item.documentName, item.discussionId);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* 헤더 */}
      <div
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
      >
        {/* 좌측: 제목/메타 (제목 영역은 상세 링크) */}
        <div className="flex items-center gap-3 text-left">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="font-semibold truncate"
                title={`${item.universityName} · ${item.documentName} · 토론 #${item.discussionId}`}
              >
                {item.discussionId}번 토론 #{item.discussionContentId}
              </span>
              <span className="text-xs text-gray-400">{item.universityName} · {item.documentName}</span>
            </div>
            <div className="text-xs text-gray-500">
              신고 총 {counts.total}건 · 진행 {counts.PENDING}건
            </div>
          </div>
        </div>

        {/* 우측: 상태 배지 + 액션 + 펼치기 */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full ring-1 ring-amber-200 bg-amber-50 text-amber-700">대기 {counts.PENDING}</span>
          <span className="px-2 py-1 rounded-full ring-1 ring-emerald-200 bg-emerald-50 text-emerald-700">처리 {counts.RESOLVED}</span>
          <span className="px-2 py-1 me-5 rounded-full ring-1 ring-rose-200 bg-rose-50 text-rose-700">기각 {counts.REJECTED}</span>

          <Link
            to={href}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-200"
            title="토론 페이지로 이동"
          >
            바로가기
          </Link>

          <button
            className="px-3 py-2 text-sm rounded-lg text-uniwikicolor border hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onOpenReject(item); }}
            disabled={!hasPending}
          >
            기각하기
          </button>
          <button
            className="px-3 py-2 text-sm rounded-lg bg-uniwikicolor text-white hover:bg-uniwikicolor_hover disabled:opacity-40 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onOpenResolve(item); }}
            disabled={!hasPending}
          >
            처리하기
          </button>

          <button
            aria-expanded={open}
            onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
            className="ml-2 text-gray-400 hover:text-gray-600"
            title={open ? "접기" : "펼치기"}
          >
            <span className={`inline-block transition-transform ${open ? "rotate-180" : "rotate-0"}`}>▼</span>
          </button>
        </div>
      </div>

      {/* 바디 */}
      {open && (
        <div className="px-5 pb-5">
          <ul className="divide-y">
            {sorted.map((r) => (
              <li key={r.reportId} className="py-5">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] ${codeBadge[r.code]}`}>{r.code}</span>
                      <span className="text-xs text-gray-400">{fmt(r.createdAt)}</span>
                    </div>
                    <div className="ms-2 mt-3 text-sm text-gray-800 leading-relaxed">
                      <p className="whitespace-pre-wrap">{r.reason}</p>
                      <p className="mt-2 text-gray-400">
                        신고자{" "}
                        <Link to="#" className="hover:underline">
                          {r.reporterName}
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* 닫기 핸들 */}
          <div className="pt-4">
            <div className="relative">
              <div className="h-px bg-gray-200" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="group absolute left-1/2 -translate-x-1/2 -top-3 focus:outline-none"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-white text-xs text-gray-500 shadow-sm group-hover:bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5.22 12.78a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.81l-3.97 3.97a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
                  </svg>
                  <span>접기</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** ===== 페이지 ===== */
export default function AdminDiscussionReportPageGrouped() {
  const [page, setPage] = useState(0);
  const size = 10;

  const [data, setData] = useState<AdminDiscussionReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refetchList() {
    const res = await fetch(`${API_BASE}/admin/discussion-reports?page=${page}&size=${size}`, {
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as AdminDiscussionReportResponse;
    setData(json);
  }

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/admin/discussion-reports?page=${page}&size=${size}`, {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${getToken()}`,
          },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as AdminDiscussionReportResponse;
        setData(json);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message ?? "불러오기에 실패했습니다");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [page]);

  const content = data?.content ?? [];

  // 검색 (추가: 대학명/문서명도 포함)
  const [keyword, setKeyword] = useState("");
  const filtered = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return content;
    return content.filter((d) => {
      const idMatch = String(d.discussionId).includes(kw);
      const univMatch = d.universityName?.includes(kw);
      const docMatch = d.documentName?.includes(kw);
      const inValues = d.discussionValueList.some(
        (r) => r.reporterName.includes(kw) || r.reason.includes(kw)
      );
      return idMatch || univMatch || docMatch || inValues;
    });
  }, [content, keyword]);

  // 진행중 토론 상단 → 최신 신고 시점 desc
  const sortedDiscussions = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aPending = a.discussionValueList.some((r) => r.code === "PENDING");
      const bPending = b.discussionValueList.some((r) => r.code === "PENDING");
      if (aPending !== bPending) return aPending ? -1 : 1;
      const aLatest = Math.max(...a.discussionValueList.map((r) => new Date(r.createdAt).getTime()));
      const bLatest = Math.max(...b.discussionValueList.map((r) => new Date(r.createdAt).getTime()));
      return bLatest - aLatest;
    });
  }, [filtered]);

  // 모달 상태
  const [openReject, setOpenReject] = useState<null | ReportedDiscussion>(null);
  const [openResolve, setOpenResolve] = useState<null | ReportedDiscussion>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">토론 신고 내역</h1>

      {/* 상단 바: 페이지/검색 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm text-gray-500">
          페이지 {data ? data.page + 1 : page + 1} / {data ? data.totalPages : 1}
        </div>
        <div className="relative ml-auto">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="대학 / 문서 / 토론 ID / 신고자 / 사유 검색"
            className="w-80 border rounded-lg px-3 py-2 text-sm pr-8"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      {/* 리스트 */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
              <div className="h-5 w-56 bg-gray-200 rounded" />
              <div className="mt-3 h-4 w-full bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-4 text-sm">
          불러오는 중 오류가 발생했습니다: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {sortedDiscussions.map((d) => (
            <ReportedDiscussionSection
              key={d.discussionContentId}
              item={d}
              onOpenReject={(discussion) => setOpenReject(discussion)}
              onOpenResolve={(discussion) => setOpenResolve(discussion)}
            />
          ))}
          {sortedDiscussions.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              신고 내역이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="pt-2 flex items-center gap-1 text-xs">
        <button
          disabled={loading || !(data?.hasPre)}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40"
        >
          &lt; 이전
        </button>
        <span className="px-2 py-1 rounded border bg-gray-100 font-semibold">
          {data ? data.page + 1 : page + 1}
        </span>
        <button
          disabled={loading || !(data?.hasNext)}
          onClick={() => setPage((p) => p + 1)}
          className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40"
        >
          다음 &gt;
        </button>
      </div>

      {/* 모달: 기각 */}
      {openReject && (
        <ReasonModal
          title={`토론 #${openReject.discussionContentId} 신고 기각`}
          confirmText="기각하기"
          placeholder="기각 사유를 입력하세요"
          onClose={() => setOpenReject(null)}
          onConfirm={async (reason) => {
            try {
              await apiRejectDiscussion(openReject.discussionContentId, reason);
              await refetchList();
            } catch (e: any) {
              alert(`기각 처리 중 오류가 발생했습니다: ${e?.message ?? "Unknown"}`);
            } finally {
              setOpenReject(null);
            }
          }}
        />
      )}

      {/* 모달: 처리(해결) */}
      {openResolve && (
        <ReasonModal
          title={`토론 #${openResolve.discussionContentId} 신고 처리`}
          confirmText="처리하기"
          placeholder="처리 사유를 입력하세요"
          onClose={() => setOpenResolve(null)}
          onConfirm={async (reason) => {
            try {
              await apiResolveDiscussion(openResolve.discussionContentId, reason);
              await refetchList();
            } catch (e: any) {
              alert(`처리 중 오류가 발생했습니다: ${e?.message ?? "Unknown"}`);
            } finally {
              setOpenResolve(null);
            }
          }}
        />
      )}
    </div>
  );
}
