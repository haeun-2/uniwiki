import React, { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";

type Report = {
  id: number;
  processed: boolean;
  reporter: string;
  target: string;
  createdAt: string;
  content: string;
};

const mockReports: Report[] = Array.from({ length: 73 }).map((_, i) => ({
  id: i + 1,
  processed: i % 7 > 3,
  reporter: "김코드",
  target: "김하은",
  createdAt: "2025.10.22 13:21:15",
  content: "허위 정보 기재 및 비하 발언",
}));

// ✅ 유저 신고 처리 모달
function UserBlockModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (days: string, reason: string) => void;
}) {
  const [days, setDays] = useState("");
  const [reason, setReason] = useState("");

  return (
    <div onClick={onClose} className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-8 w-[420px]">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">유저 신고 처리</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">차단 일자 선택</label>
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">차단 일자 선택</option>
            <option value="1">1일</option>
            <option value="3">3일</option>
            <option value="7">7일</option>
            <option value="30">30일</option>
            <option value="1000">영구</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1">차단 사유</label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="차단 사유"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            취소
          </button>
          <button
            onClick={() => {
              onConfirm(days, reason);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-uniwikicolor text-white"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ 신고 처리 내역 모달
function UserBlockCheckModal({
  onClose,
  data,
}: {
  onClose: () => void;
  data: { days: string; reason: string; admin: string };
}) {
  return (
    <div onClick={onClose} className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-8 w-[420px]">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">신고 처리 내역</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">차단 일자</label>
          <input
            readOnly
            value={data.days}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">차단 사유</label>
          <input
            readOnly
            value={data.reason}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm mb-1">담당자</label>
          <input
            readOnly
            value={data.admin}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            취소
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-uniwikicolor text-white">
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUserReportPage() {
  const [page, setPage] = useState(1);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showCheckModal, setShowCheckModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(mockReports.length / pageSize));

  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return mockReports.slice(start, start + pageSize);
  }, [page]);

  const handleProcess = (id: number) => {
    setSelectedId(id);
    setShowBlockModal(true);
  };

  const handleCheck = (id: number) => {
    setSelectedId(id);
    setShowCheckModal(true);
  };

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

  return (
    <div className="flex text-sm text-gray-800">
      {/* 좌측 메뉴 */}
      <aside className="w-56 bg-gray-50 min-h-[calc(100vh-64px)]">
        <div className="pt-4">
          <nav className="flex flex-col">
            <NavLink
              to="/admin/user_report"
              className={({ isActive }) =>
                `px-5 py-3 ${
                  isActive
                    ? "bg-uniwikicolor text-white font-semibold"
                    : "text-gray-700 hover:bg-white"
                }`
              }
            >
              유저 신고 내역
            </NavLink>
            <NavLink
              to="/admin/discussion_report"
              className={({ isActive }) =>
                `px-5 py-3 ${
                  isActive
                    ? "bg-uniwikicolor text-white font-semibold"
                    : "text-gray-700 hover:bg-white"
                }`
              }
            >
              토론 신고 내역
            </NavLink>
            <NavLink
              to="/admin/document"
              className={({ isActive }) =>
                `px-5 py-3 ${
                  isActive
                    ? "bg-uniwikicolor text-white font-semibold"
                    : "text-gray-700 hover:bg-white"
                }`
              }
            >
              문서 관리
            </NavLink>
            <NavLink
              to="/admin/discussion"
              className={({ isActive }) =>
                `px-5 py-3 ${
                  isActive
                    ? "bg-uniwikicolor text-white font-semibold"
                    : "text-gray-700 hover:bg-white"
                }`
              }
            >
              토론 관리
            </NavLink>
          </nav>
        </div>
      </aside>

      {/* 메인 영역 */}
      <section className="flex-1 px-6 py-8">
        <h1 className="text-xl font-semibold mb-6">유저 신고 내역</h1>

        <div className="overflow-x-auto border-t border-gray-200">
          <table className="min-w-[960px] w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 font-medium">
              <tr className="border-b">
                <th className="py-2 w-24"></th>
                <th className="py-2 w-20">처리 여부</th>
                <th className="py-2 w-24">신고자</th>
                <th className="py-2 w-24">대상</th>
                <th className="py-2 w-40">일시</th>
                <th className="py-2">내용</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b ${
                    r.processed ? "text-gray-400" : "text-gray-800"
                  }`}
                >
                  <td className="py-3">
                    {r.processed ? (
                      <button
                        onClick={() => handleCheck(r.id)}
                        className="text-gray-500 hover:underline"
                      >
                        확인
                      </button>
                    ) : (
                      <button
                        onClick={() => handleProcess(r.id)}
                        className="text-[#2C80A0] hover:underline"
                      >
                        처리하기
                      </button>
                    )}
                  </td>
                  <td className="py-3">{r.processed ? "Y" : "N"}</td>
                  <td className="py-3">
                    <Link to="#" className="hover:underline">
                      {r.reporter}
                    </Link>
                  </td>
                  <td className="py-3">
                    <Link to="#" className="hover:underline">
                      {r.target}
                    </Link>
                  </td>
                  <td className="py-3">{r.createdAt}</td>
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
            className="px-2 py-1 rounded border hover:bg-gray-50"
          >
            &lt; 이전
          </button>

          {paginationNumbers.map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`px-2 py-1 rounded border hover:bg-gray-50 ${
                n === page ? "bg-gray-100 font-semibold" : ""
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 rounded border hover:bg-gray-50"
          >
            다음 &gt;
          </button>
        </div>
      </section>

      {/* ✅ 모달 렌더링 */}
      {showBlockModal && (
        <UserBlockModal
          onClose={() => setShowBlockModal(false)}
          onConfirm={(days, reason) =>
            alert(`ID: ${selectedId}\n차단: ${days}일\n사유: ${reason}`)
          }
        />
      )}
      {showCheckModal && (
        <UserBlockCheckModal
          onClose={() => setShowCheckModal(false)}
          data={{
            days: "3일",
            reason: "무분별한 문서 내용 삭제",
            admin: "이지오",
          }}
        />
      )}
    </div>
  );
}
