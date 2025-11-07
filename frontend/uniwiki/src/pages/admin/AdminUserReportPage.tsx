import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// ====== 타입 (실제 API 스키마에 맞춰 정의) ======
export type ReportCode = "PENDING" | "RESOLVED" | "REJECTED";

export type ReportValue = {
  reportId: number;
  code: ReportCode;
  reporterName: string;
  reason: string;
  createdAt: string; // ISO
};

export type ReportedUser = {
  reportedId: number;
  reportedName: string;
  banUntil?: string | null;
  reportValueList: ReportValue[];
};

export type AdminUserReportResponse = {
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  hasPre: boolean;
  hasNext: boolean;
  content: ReportedUser[];
};

// ====== 유틸 ======
const fmt = (iso: string) => new Date(iso).toLocaleString();
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleString() : "");
const isFuture = (iso?: string | null) => {
  if (!iso) return false;
  return new Date(iso).getTime() > Date.now();
};

const codeBadge: Record<ReportCode, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

// 진행중 먼저, 그 뒤 최신순 정렬
function sortReports(list: ReportValue[]) {
  const order = { PENDING: 0, RESOLVED: 1, REJECTED: 2 } as const;
  return [...list].sort((a, b) => {
    const byStatus = order[a.code] - order[b.code];
    if (byStatus !== 0) return byStatus;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

const API_BASE = "http://k13d104.p.ssafy.io/api/v1";

function getToken() {
  return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";
}

// 유저 단위 기각
async function apiRejectUser(userId: number, reason: string) {
  const res = await fetch(`${API_BASE}/admin/user-reports/${userId}/reject`, {
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

// 유저 단위 차단(해결)
async function apiResolveUser(userId: number, reason: string, banUntil: string) {
  const res = await fetch(`${API_BASE}/admin/user-reports/${userId}/resolve`, {
    method: "PATCH",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ reason, banUntil }),
  });
  if (!res.ok) throw new Error(`Resolve HTTP ${res.status}`);
}

// '일수' → banUntil(ISO)
function daysToBanUntilISO(days: string): string | null {
  if (!days) return null;
  const now = new Date();
  if (days === "1000") { // 영구 = 1000년
    now.setFullYear(now.getFullYear() + 1000);
    return now.toISOString();
  }
  now.setDate(now.getDate() + Number(days));
  return now.toISOString();
}



// ====== 차단 모달 ======
function BlockModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (days: string, reason: string) => void }) {
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[420px]">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">유저 차단</h3>
          <button className="text-gray-400 text-xl" onClick={onClose}>×</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm block mb-1">차단 일자</label>
            <select value={days} onChange={(e) => setDays(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">선택</option>
              <option value="1">1일</option>
              <option value="3">3일</option>
              <option value="7">7일</option>
              <option value="30">30일</option>
              <option value="1000">영구</option>
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">사유</label>
            <textarea
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-28 border rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="차단 사유 입력"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-2 border rounded-lg">취소</button>
            <button onClick={() => { onConfirm(days, reason); onClose(); }} className="px-3 py-2 rounded-lg bg-uniwikicolor text-white hover:bg-uniwikicolor_hover">확인</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== 기각 모달 ======
function RejectModal({ onClose, onConfirm, defaultReason }: { onClose: () => void; onConfirm: (reason: string) => void; defaultReason?: string; }) {
  const [reason, setReason] = useState(defaultReason ?? "");
  const canSubmit = reason.trim().length > 0;
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-[480px]">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">신고 기각</h3>
          <button className="text-gray-400 text-xl" onClick={onClose}>×</button>
        </div>
        <div className="space-y-3">
          <label className="text-sm block">사유</label>
          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="기각 사유 입력"
            className="w-full h-28 border rounded-lg px-3 py-2 text-sm resize-none"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-3 py-2 border rounded-lg">취소</button>
            <button
              disabled={!canSubmit}
              onClick={() => { onConfirm(reason.trim()); onClose(); }}
              className={`px-3 py-2 rounded-lg text-white ${canSubmit ? "bg-gray-700 hover:bg-gray-800" : "bg-gray-300 cursor-not-allowed"}`}
            >
              기각하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



// ====== 섹션 (신고당한 유저 1명) ======
function ReportedUserSection({ user, defaultOpen = true, onOpenBlock, onOpenReject, }: {
  user: ReportedUser;
  defaultOpen?: boolean;
  onOpenBlock: (reported: ReportedUser, report?: ReportValue) => void;
  onOpenReject: (reported: ReportedUser, report?: ReportValue) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const sorted = useMemo(() => sortReports(user.reportValueList), [user.reportValueList]);

  const counts = useMemo(() => {
    return user.reportValueList.reduce(
      (acc, r) => {
        acc.total += 1;
        acc[r.code] += 1 as 1;
        return acc;
      },
      { total: 0, PENDING: 0, RESOLVED: 0, REJECTED: 0 } as { total: number } & Record<ReportCode, number>
    );
  }, [user.reportValueList]);

  const isBanned = user.banUntil && isFuture(user.banUntil);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* 헤더 */}
      <div
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50"
      >
        <div className="flex items-center gap-3 text-left">
          <div>
            <div className="font-semibold">{user.reportedName}</div>
            <div className="text-xs text-gray-500">신고 총 {counts.total}건 · 진행 {counts.PENDING}건</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full ring-1 ring-amber-200 bg-amber-50 text-amber-700">대기 {counts.PENDING}</span>
          <span className="px-2 py-1 rounded-full ring-1 ring-emerald-200 bg-emerald-50 text-emerald-700">처리 {counts.RESOLVED}</span>
          <span className="px-2 py-1 me-5 rounded-full ring-1 ring-rose-200 bg-rose-50 text-rose-700">기각 {counts.REJECTED}</span>
          {isBanned && (
            <span
              className="px-3 py-2 text-sm text-uniwikicolor"
            >
              {fmtDate(user.banUntil)} 까지 차단 중
            </span>
          )}
          <button className="px-3 py-2 ms-5 text-sm rounded-lg text-uniwikicolor border hover:bg-gray-200 cursor-pointer" onClick={(e) => { onOpenReject(user); e.stopPropagation() }}>기각하기</button>
          <button className="px-3 py-2 text-sm rounded-lg bg-uniwikicolor text-white hover:bg-uniwikicolor_hover cursor-pointer" onClick={(e) => { onOpenBlock(user); e.stopPropagation() }}>차단하기</button>
          <span className={`ml-3 text-gray-400 transition-transform ${open ? "rotate-180" : "rotate-0"}`}>▼</span>
        </div>
      </div>

      {/* 바디 */}
      {open && (
        <div className="px-5 pb-5">

          {/* 리스트 */}
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
                      <p className="mt-2 text-gray-400">신고자 <Link to="#" className="hover:underline">{r.reporterName}</Link></p>
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
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
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

// ====== 페이지 ======
export default function AdminUserReportPageGrouped() {
  const [page, setPage] = useState(0);
  const size = 10;
  
  const [data, setData] = useState<AdminUserReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refetchList() {
    try {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      const res = await fetch(`http://k13d104.p.ssafy.io/api/v1/admin/user-reports?page=${page}&size=${size}`, {
        headers: {
          Accept: "*/*",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as AdminUserReportResponse;
      setData(json);
    } catch (e) {
      // 필요 시 에러 토스트/알럿 처리
    }
  }

  // API 연동: 신고 목록 조회
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/admin/user-reports?page=${page}&size=${size}`, {
          headers: {
            Accept: "*/*",
            Authorization: token ? `Bearer ${token}` : "",
          },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as AdminUserReportResponse;
        setData(json);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message ?? "불러오기에 실패했습니다");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [page]);

  const [openBlock, setOpenBlock] = useState<null | { user: ReportedUser; report?: ReportValue }>(null);
  const [openReject, setOpenReject] = useState<null | { user: ReportedUser; report?: ReportValue }>(null);

  const content = data?.content ?? [];
  
  const [keyword, setKeyword] = useState("");
  const filtered = useMemo(() => {
    const kw = keyword.trim();
    if (!kw) return content;
    return content.filter((u) => u.reportedName.includes(kw));
  }, [content, keyword]);

  // 진행 중이 하나라도 있는 유저가 상단으로
  const sortedUsers = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aPending = a.reportValueList.some((r) => r.code === "PENDING");
      const bPending = b.reportValueList.some((r) => r.code === "PENDING");
      if (aPending !== bPending) return aPending ? -1 : 1;
      // 최신 신고 시점 desc
      const aLatest = Math.max(...a.reportValueList.map((r) => new Date(r.createdAt).getTime()));
      const bLatest = Math.max(...b.reportValueList.map((r) => new Date(r.createdAt).getTime()));
      return bLatest - aLatest;
    });
  }, [filtered]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">유저 신고 내역</h1>

      {/* 상단 바: 페이지/검색 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm text-gray-500">페이지 {data ? data.page + 1 : page + 1} / {data ? data.totalPages : 1}</div>
        <div className="relative ml-auto">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="신고 대상자 검색"
            className="w-64 border rounded-lg px-3 py-2 text-sm pr-8"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      {/* 리스트 */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="mt-3 h-4 w-full bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 p-4 text-sm">불러오는 중 오류가 발생했습니다: {error}</div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          {sortedUsers.map((u, idx) => (
            <ReportedUserSection
              key={u.reportedId}
              user={u}
              defaultOpen={false}
              onOpenBlock={(user, report) => setOpenBlock({ user, report })}
              onOpenReject={(user, report) => setOpenReject({ user, report })}
            />
          ))}
          {sortedUsers.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">신고 내역이 없습니다.</div>
          )}
        </div>
      )}

      {/* 페이지네이션 */}
      <div className="pt-2 flex items-center gap-1 text-xs">
        <button disabled={loading || !(data?.hasPre)} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40">&lt; 이전</button>
        <span className="px-2 py-1 rounded border bg-gray-100 font-semibold">{data ? data.page + 1 : page + 1}</span>
        <button disabled={loading || !(data?.hasNext)} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-40">다음 &gt;</button>
      </div>

      {/* 모달 */}
      {openBlock && (
        <BlockModal
          onClose={() => setOpenBlock(null)}
          onConfirm={async (days, reason) => {
            const userId = openBlock.user?.reportedId;
            if (!userId) {
              alert("대상 유저 ID가 없습니다.");
              return;
            }
            const banUntil = daysToBanUntilISO(days);
            if (!banUntil) {
              alert("차단 기간을 선택해 주세요.");
              return;
            }
            try {
              await apiResolveUser(userId, reason, banUntil);
              await refetchList();
            } catch (e: any) {
              alert(`차단 처리 중 오류가 발생했습니다: ${e?.message ?? "Unknown"}`);
            } finally {
              setOpenBlock(null);
            }
          }}
        />
      )}

      {openReject && (
        <RejectModal
          onClose={() => setOpenReject(null)}
          onConfirm={async (reason) => {
            const userId = openReject.user?.reportedId;
            if (!userId) {
              alert("대상 유저 ID가 없습니다.");
              return;
            }
            try {
              await apiRejectUser(userId, reason);
              await refetchList();
            } catch (e: any) {
              alert(`기각 중 오류가 발생했습니다: ${e?.message ?? "Unknown"}`);
            } finally {
              setOpenReject(null);
            }
          }}
        />
      )}
    </div>
  );
}
