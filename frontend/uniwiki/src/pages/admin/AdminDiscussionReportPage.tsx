import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";

/** ---------------- Types & Mocks ---------------- */
type DiscussionReport = {
  id: number;
  processed: boolean;     // 처리 여부
  reporter: string;       // 신고자
  targetTitle: string;    // 대상(토론 제목)
  createdAt: string;      // 일시
  content: string;        // 신고/발언 내용(요약)
};

const mockDiscussionReports: DiscussionReport[] = Array.from({ length: 68 }).map((_, i) => ({
  id: i + 1,
  processed: i % 6 > 3, // 일부만 처리된 상태
  reporter: "김코드",
  targetTitle: "서울대학교 토론 주제 #21",
  createdAt: "2025.10.22 13:21:15",
  content: "최혜정 바보", // 샘플 발언 내용
}));

/** ---------------- Modals (Inline Components) ---------------- */

/** 토론 신고 처리 모달 */
function DiscussionProcessModal({
  onClose,
  onConfirm,
  targetTitle,
  speech, // 발언 내용 (읽기 전용 표시)
}: {
  onClose: () => void;
  onConfirm: (days: string, reason: string) => void;
  targetTitle: string;
  speech: string;
}) {
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-8 w-[520px]">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">토론 신고 처리</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="mb-2">
          <Link to="#" className="underline text-sm text-gray-700 hover:text-gray-900">
            {targetTitle}
          </Link>
        </div>

        <div className="mb-5">
          <label className="block text-sm mb-1">발언 내용</label>
          <textarea
            readOnly
            value={speech}
            className="w-full h-28 border rounded-xl px-3 py-2 text-sm bg-gray-50 resize-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">차단 일자 선택</label>
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full border rounded-xl px-3 py-2 text-sm"
          >
            <option value="">차단 일자 선택</option>
            <option value="1">1일</option>
            <option value="3">3일</option>
            <option value="7">7일</option>
            <option value="30">30일</option>
            <option value="1000">영구</option>
          </select>
        </div>

        <div className="mb-7">
          <label className="block text-sm mb-1">차단 사유</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="차단 사유"
            className="w-full border rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-xl hover:bg-gray-50">취소</button>
          <button
            onClick={() => {
              onConfirm(days, reason);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-uniwikicolor text-white hover:bg-uniwikicolor_hover"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

/** 신고 처리 내역 모달 */
function DiscussionProcessCheckModal({
  onClose,
  data,
}: {
  onClose: () => void;
  data: { days: string; reason: string; admin: string };
}) {
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-8 w-[520px]">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">신고 처리 내역</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">차단 일자</label>
          <input
            readOnly
            value={data.days}
            className="w-full border rounded-xl px-3 py-2 text-sm bg-gray-50"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">차단 사유</label>
          <input
            readOnly
            value={data.reason}
            className="w-full border rounded-xl px-3 py-2 text-sm bg-gray-50"
          />
        </div>

        <div className="mb-7">
          <label className="block text-sm mb-1">담당자</label>
          <input
            readOnly
            value={data.admin}
            className="w-full border rounded-xl px-3 py-2 text-sm bg-gray-50"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-uniwikicolor text-white hover:bg-uniwikicolor_hover">
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

/** ---------------- Page ---------------- */
export default function AdminDiscussionReportPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(mockDiscussionReports.length / pageSize));

  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return mockDiscussionReports.slice(start, start + pageSize);
  }, [page]);

  const paginationNumbers = useMemo(() => {
    const visible = 10;
    let start = Math.max(1, page - Math.floor(visible / 2));
    let end = start + visible - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - visible + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  // 모달 상태
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [selected, setSelected] = useState<DiscussionReport | null>(null);

  const openProcess = (r: DiscussionReport) => {
    setSelected(r);
    setShowProcessModal(true);
  };

  const openCheck = (r: DiscussionReport) => {
    setSelected(r);
    setShowCheckModal(true);
  };

  return (
    <div className="flex text-sm text-gray-800">
      {/* 좌측 사이드 메뉴 */}
      <aside className="w-56 bg-gray-50 min-h-[calc(100vh-64px)]">
        <div className="pt-4">
          <nav className="flex flex-col">
            <NavLink
              to="/admin/user_report"
              className={({ isActive }) =>
                `px-5 py-3 ${isActive ? "bg-uniwikicolor text-white font-semibold" : "text-gray-700 hover:bg-white"}`
              }
            >
              유저 신고 내역
            </NavLink>
            <NavLink
              to="/admin/discussion_report"
              className={({ isActive }) =>
                `px-5 py-3 ${isActive ? "bg-uniwikicolor text-white font-semibold" : "text-gray-700 hover:bg-white"}`
              }
            >
              토론 신고 내역
            </NavLink>
            <NavLink
              to="/admin/document"
              className={({ isActive }) =>
                `px-5 py-3 ${isActive ? "bg-uniwikicolor text-white font-semibold" : "text-gray-700 hover:bg-white"}`
              }
            >
              문서 관리
            </NavLink>
            <NavLink
              to="/admin/discussion"
              className={({ isActive }) =>
                `px-5 py-3 ${isActive ? "bg-uniwikicolor text-white font-semibold" : "text-gray-700 hover:bg-white"}`
              }
            >
              토론 관리
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* 우측 콘텐츠 */}
      <section className="flex-1 px-6 py-8">
        <h1 className="text-xl font-semibold mb-6">토론 신고 내역</h1>

        <div className="overflow-x-auto border-t border-gray-200">
          <table className="min-w-[960px] w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 font-medium">
              <tr className="border-b">
                <th className="py-2 w-24 text-center">처리 여부</th>
                <th className="py-2 w-40">일시</th>
                <th className="py-2 w-32">신고자</th>
                <th className="py-2 w-80">대상</th>
                <th className="py-2">내용</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => (r.processed ? openCheck(r) : openProcess(r))}
                  className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                    r.processed ? "text-gray-400" : "text-gray-800"
                  }`}
                >
                  <td className="py-3 text-center">{r.processed ? "Y" : "N"}</td>
                  <td className="py-3">{r.createdAt}</td>
                  <td className="py-3">
                    <Link to="#" className="hover:underline" onClick={(e) => e.stopPropagation()}>
                      {r.reporter}
                    </Link>
                  </td>
                  <td className="py-3">
                    <Link to="#" className="hover:underline" onClick={(e) => e.stopPropagation()}>
                      {r.targetTitle}
                    </Link>
                  </td>
                  <td className="py-3">{r.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="mt-5 flex items-center gap-1 text-xs">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 rounded border hover:bg-gray-50 cursor-pointer"
          >
            &lt; 이전
          </button>

          {paginationNumbers.map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`px-2 py-1 rounded border hover:bg-gray-50 cursor-pointer ${
                n === page ? "bg-gray-100 font-semibold" : ""
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 rounded border hover:bg-gray-50 cursor-pointer"
          >
            다음 &gt;
          </button>
        </div>
      </section>

      {/* ---------------- Render Modals ---------------- */}
      {showProcessModal && selected && (
        <DiscussionProcessModal
          targetTitle={selected.targetTitle}
          speech={selected.content}
          onClose={() => setShowProcessModal(false)}
          onConfirm={(days, reason) =>
            alert(
              `토론 신고 #${selected.id}\n차단: ${days || "(미선택)"}일\n사유: ${reason || "(미입력)"}`
            )
          }
        />
      )}

      {showCheckModal && (
        <DiscussionProcessCheckModal
          onClose={() => setShowCheckModal(false)}
          data={{
            days: "3일",
            reason: "토론 중에 상대방을 비하함",
            admin: "이지오",
          }}
        />
      )}
    </div>
  );
}
