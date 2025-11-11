// src/pages/DocumentDiffPage.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronUp } from "lucide-react";

const API_BASE = "https://k13d104.p.ssafy.io/api";

/* ===== 공통 유틸 ===== */
function getAccessToken() {
  try { return localStorage.getItem("accessToken") || ""; } catch { return ""; }
}
function authHeaders() {
  const t = getAccessToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
function getViewerIdFromStorage(): string | null {
  try {
    const directKeys = ["userId", "userID", "memberId", "id"];
    for (const k of directKeys) {
      const v = localStorage.getItem(k);
      if (v && String(v).trim() !== "") return String(v);
    }
    const objKeys = ["user", "profile", "me"];
    for (const k of objKeys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        const o = JSON.parse(raw);
        const cand = o?.userId ?? o?.id ?? o?.memberId;
        if (cand != null) return String(cand);
      } catch {}
    }
  } catch {}
  return null;
}
function getViewerNicknameFromStorage(): string | null {
  try {
    const direct = ["nickname", "userNickname", "username", "name"];
    for (const k of direct) {
      const v = localStorage.getItem(k);
      if (v && String(v).trim() !== "") return String(v).trim();
    }
    const objKeys = ["user", "profile", "me"];
    for (const k of objKeys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      try {
        const o = JSON.parse(raw);
        const cand = o?.nickname ?? o?.userNickname ?? o?.username ?? o?.name;
        if (cand) return String(cand).trim();
      } catch {}
    }
  } catch {}
  return null;
}

/* ===== 타입 ===== */
type DocumentDto = {
  documentId: number;
  documentTitle: string;
  versionNumber: number;
  universityName?: string;
  categoryName?: string;
};

type RawDiffItem = { lineNumber: number; content: string; type: string };
type DiffApiResponse = {
  oldCreatedAt: string;
  newCreatedAt: string;
  editorId: number | string;
  editorNickname: string;
  editMemo: string;
  plusCount: number;
  minusCount: number;
  diffs: string | RawDiffItem[];
};

type Row = { left?: RawDiffItem; right?: RawDiffItem };

/* ===== 시간 포맷 ===== */
function parseServerUtc(iso: string): Date {
  const hasTZ = /Z$|[+-]\d\d:\d\d$/.test(iso);
  if (hasTZ) return new Date(iso);
  const m = iso.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(\.\d+)?$/
  );
  if (!m) return new Date(iso + "Z");
  const [, y, mo, d, h, mi, s, ms] = m;
  const sec = s ? +s : 0;
  const milli = ms ? Math.round(parseFloat(ms) * 1000) : 0;
  return new Date(Date.UTC(+y, +mo - 1, +d, +h - 9, +mi, sec, milli)); // KST→UTC
}
function formatYmdHmKST(iso?: string) {
  if (!iso) return "";
  const d = parseServerUtc(iso);
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  return `${get("year")}.${get("month")}.${get("day")} ${get("hour")}:${get("minute")}`;
}

export default function DocumentDiffPage() {
  const params = useParams();
  const documentTitle = params.documentTitle ?? "";
  const versionId = Number(params.versionId ?? "");
  const prevVersion = Number.isFinite(versionId) ? versionId - 1 : NaN;

  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const [meta, setMeta] = useState<DocumentDto | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  // 헤더 보조 메타
  const [prevCreatedAt, setPrevCreatedAt] = useState<string | undefined>();
  const [currCreatedAt, setCurrCreatedAt] = useState<string | undefined>();
  const [currEditor, setCurrEditor] = useState<string | undefined>();
  const [currEditorId, setCurrEditorId] = useState<string | number | undefined>();
  const [currEditMemo, setCurrEditMemo] = useState<string>("");

  // 플래시 배너 (문서 조회 화면과 동일 스타일)
  const [flashMsg, setFlashMsg] = useState<string | null>(null);
  const showFlash = (msg: string) => {
    setFlashMsg(msg);
    window.setTimeout(() => setFlashMsg(null), 3000);
  };

  // 신고 모달 상태
  const [userReportOpen, setUserReportOpen] = useState(false);
  const [userReportReason, setUserReportReason] = useState("");
  const [userReportPosting, setUserReportPosting] = useState(false);

  // 로그인 사용자
  const viewerId = useMemo(() => getViewerIdFromStorage(), []);
  const viewerNick = useMemo(() => getViewerNicknameFromStorage(), []);

  // 상단 버튼
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // 문서 메타
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `${API_BASE}/v1/documents/${encodeURIComponent(documentTitle)}`,
          { headers: { Accept: "application/json", ...authHeaders() } }
        );
        if (!r.ok) throw new Error(`문서 조회 실패: ${r.status}`);
        const dto: DocumentDto = await r.json();
        if (!cancelled) setMeta(dto);
      } catch (e: any) {
        if (!cancelled) { setStatus("error"); setErrorMsg(e?.message || "문서 정보를 불러올 수 없습니다."); }
      }
    })();
    return () => { cancelled = true; };
  }, [documentTitle]);

  // diff 조회
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!meta?.documentId || !versionId) return;
      setStatus("loading");
      try {
        const r = await fetch(
          `${API_BASE}/v1/documents/${meta.documentId}/versions/${versionId}/diff`,
          { headers: { Accept: "application/json", ...authHeaders() } }
        );
        if (!r.ok) throw new Error(`diff 조회 실패: ${r.status}`);
        const data: DiffApiResponse = await r.json();

        // 헤더 메타 채우기
        setPrevCreatedAt(data.oldCreatedAt);
        setCurrCreatedAt(data.newCreatedAt);
        setCurrEditor(data.editorNickname);
        setCurrEditorId(data.editorId);
        setCurrEditMemo(data.editMemo ?? "");

        // diffs 파싱
        let list: RawDiffItem[] = [];
        try {
          if (typeof data.diffs === "string") {
            const parsed = JSON.parse(data.diffs);
            if (Array.isArray(parsed)) list = parsed as RawDiffItem[];
          } else if (Array.isArray(data.diffs)) {
            list = data.diffs as RawDiffItem[];
          }
        } catch {}

        const norm = (s: string) =>
          (s || "").toUpperCase().replace("-", "_").replace("CHAGNE", "CHANGE");
        const tmp: Row[] = [];
        list.forEach((it) => {
          const t = norm(it.type);
          const isLeft =
            t === "DELETE" || t === "CHANGE_OLD" || t === "CHANGEOLD";
          const isRight =
            t === "INSERT" || t === "CHANGE_NEW" || t === "CHANGENEW";
          if (isLeft) {
            const last = tmp[tmp.length - 1];
            if (last && !last.left) last.left = it;
            else tmp.push({ left: it });
          } else if (isRight) {
            const last = tmp[tmp.length - 1];
            if (last && !last.right) last.right = it;
            else tmp.push({ right: it });
          } else {
            tmp.push({ right: it });
          }
        });

        if (!cancelled) { setRows(tmp); setStatus("ok"); }
      } catch (e: any) {
        if (!cancelled) { setStatus("error"); setErrorMsg(e?.message || "diff를 불러오는 중 오류가 발생했습니다."); }
      }
    })();
    return () => { cancelled = true; };
  }, [meta?.documentId, versionId]);

  /* === 신고 모달 로직 === */
  const isMine = (targetId?: string | number | null, targetNick?: string) => {
    const vid = viewerId ? String(viewerId) : null;
    const tid = targetId != null ? String(targetId) : null;
    const sameId = !!vid && !!tid && vid === tid;
    const sameNick = !!viewerNick && !!targetNick && viewerNick === targetNick;
    return sameId || sameNick;
  };
  const openUserReport = () => {
    if (isMine(currEditorId ?? null, currEditor)) {
      showFlash("본인은 신고할 수 없습니다.");
      return;
    }
    setUserReportReason("");
    setUserReportOpen(true);
  };
  const closeUserReport = () => {
    if (userReportPosting) return;
    setUserReportOpen(false);
  };
  const submitUserReport = async () => {
    if (!currEditorId) return;
    const reason = userReportReason.trim();
    if (!reason) return;

    setUserReportPosting(true);
    try {
      const res = await fetch(`${API_BASE}/v1/reports/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "*/*", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ targetId: currEditorId, reason }),
      });
      if (!res.ok) throw new Error(`사용자 신고 실패 (${res.status})`);
      setUserReportOpen(false);
      showFlash("사용자 신고가 접수되었습니다.");
    } catch (e: any) {
      showFlash(String(e?.message || "사용자 신고에 실패했습니다."));
    } finally {
      setUserReportPosting(false);
    }
  };

  /* === 렌더 === */
  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="text-sm text-gray-500">불러오는 중…</div>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      </div>
    );
  }

  const title = meta?.documentTitle ?? documentTitle;
  const univName = meta?.universityName || "대학교";
  const categoryName = meta?.categoryName || "카테고리";
  const enc = (s: string) => encodeURIComponent(s || "");
  const countLines = (s?: string) => (s == null ? 0 : Math.max(1, s.split("\n").length));
  const docBase = `/univ/${enc(univName)}/docs/${enc(title)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* 플래시 배너 (문서 조회 화면과 동일) */}
      {flashMsg && (
        <div
          role="status"
          className="mb-4 flex items-center justify-between rounded-lg bg-[#2C80A0] px-4 py-3 text-white"
        >
          <span className="text-[15px]">{flashMsg}</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setFlashMsg(null)} className="hover:opacity-80">
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 브레드크럼 */}
      <div className="mb-2 text-[18px] leading-tight">
        <ol className="flex items-center gap-1">
          <li><Link to={`/univ/${enc(univName)}`} className="text-[#2C80A0] hover:underline">{univName}</Link></li>
          <li className="mx-1 text-gray-500">›</li>
          <li><Link to={`/univ/${enc(univName)}/category/${enc(categoryName)}`} className="text-[#2C80A0] hover:underline">{categoryName}</Link></li>
        </ol>
      </div>

      {/* 제목 + 요약/액션바 + 수정자 */}
      <div className="mb-3">
        <h1 className="text-2xl font-semibold">
          <Link to={docBase} className="hover:underline">
            {title}
          </Link>{" "}
          <span className="text-gray-600 text-lg">
            (r{Number.isFinite(prevVersion) ? prevVersion : "—"} vs r{versionId})
          </span>
        </h1>

        <div className="mt-1 mb-1 flex items-center gap-4">
          <p className="text-[18px] leading-tight text-gray-800">
            (편집 내용 요약 : {currEditMemo?.trim() || "없음"})
          </p>
          <div className="ml-auto" />
          <div
            role="tablist"
            aria-label="버전 비교 메뉴"
            className="grid grid-cols-1 items-stretch overflow-hidden rounded-xl border border-[#B3B3B3] bg-[#FAFAFA] w-[clamp(92px,12vw,116px)]"
          >
            <Link
              role="tab"
              to={`${docBase}/history`}
              className="h-10 px-3 text-[18px] leading-tight flex items-center justify-center text-[#7F7F7F] hover:bg-white/60"
            >
              돌아가기
            </Link>
          </div>
        </div>

        {/* 수정자 */}
        <div className="mb-3 text-[18px] leading-tight text-gray-800">
          수정자 :
          {currEditor ? (
            <button
              type="button"
              onClick={openUserReport}
              className="ml-2 underline-offset-2 hover:underline focus:underline outline-none"
              title="사용자 신고하기"
            >
              {currEditor}
            </button>
          ) : (
            <span className="ml-2 text-gray-500">알 수 없음</span>
          )}
        </div>
      </div>

      {/* 표: 상단 헤더 */}
      <div className="rounded-2xl border border-[#B3B3B3] overflow-hidden">
        <div className="grid grid-cols-[84px_1fr_1fr] border-b border-[#B3B3B3] bg-gray-50">
          <div className="px-3 py-3 border-r border-[#B3B3B3] text-sm text-gray-800 text-center">
            line
          </div>
          <div className="px-4 py-3 text-sm text-gray-800">
            비교 대상 버전 : r{Number.isFinite(prevVersion) ? prevVersion : "—"}
            {prevCreatedAt && <span className="ml-2 text-gray-500">({formatYmdHmKST(prevCreatedAt)})</span>}
          </div>
          <div className="px-4 py-3 text-sm text-gray-800 border-l border-[#B3B3B3]">
            비교 선택 버전 : r{versionId}
            {currCreatedAt && <span className="ml-2 text-gray-500">({formatYmdHmKST(currCreatedAt)})</span>}
          </div>
        </div>

        {/* 행들 */}
        <div>
          {rows.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500">변경 사항이 없습니다.</div>
          )}
          {rows.map((r, idx) => {
            const L = r.left, R = r.right;
            const lineForIndex = (L?.lineNumber ?? R?.lineNumber ?? undefined);
            const delta = (R ? countLines(R.content) : 0) - (L ? countLines(L.content) : 0);
            return (
              <div key={idx} className="grid grid-cols-[84px_1fr_1fr] border-b border-[#B3B3B3] last:border-b-0">
                {/* 라인번호 */}
                <div className="px-3 py-3 border-r border-[#B3B3B3] flex items-start justify-center">
                  <div className="text-center leading-5">
                    <div className="text-base font-normal text-gray-900">
                      {typeof lineForIndex === "number" ? lineForIndex : "—"}
                    </div>
                    {delta !== 0 && (
                      <div className={`text-sm ${delta > 0 ? "text-sky-600" : "text-rose-600"}`}>
                        {delta > 0 ? `+${delta}` : `${delta}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* LEFT */}
                <div className="px-4 py-3">
                  {L ? (
                    <div className="text-[13px] leading-6 text-gray-900 whitespace-pre-wrap break-words">
                      <span className="rounded-sm px-1" style={{ backgroundColor: "#FCEEEB" }}>
                        {L.content || "(빈 줄)"}
                      </span>
                    </div>
                  ) : (<div className="text-[12px] text-gray-300 italic">—</div>)}
                </div>

                {/* RIGHT */}
                <div className="px-4 py-3 border-l border-[#B3B3B3]">
                  {R ? (
                    <div className="text-[13px] leading-6 text-gray-900 whitespace-pre-wrap break-words">
                      <span className="rounded-sm px-1" style={{ backgroundColor: "#D8EEFD" }}>
                        {R.content || "(빈 줄)"}
                      </span>
                    </div>
                  ) : (<div className="text-[12px] text-gray-300 italic">—</div>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 상단으로 */}
      {showTop && (
        <button
          onClick={scrollTop}
          className="fixed bottom-8 right-8 z-20 rounded-2xl border-2 border-[#5C5C5C] px-3 py-2 shadow-sm text-sm text-[#5C5C5C] bg-white hover:bg-gray-50"
          aria-label="상단으로"
        >
          <ChevronUp className="inline-block mr-1" size={16} />
          상단으로
        </button>
      )}

      {/* ===== 사용자 신고 모달 ===== */}
      {userReportOpen && (
        <div className="fixed inset-0 z-[110]">
          <div className="absolute inset-0 bg-black/50" onClick={closeUserReport} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-[22px] font-semibold">사용자 신고하기</h3>
                <button
                  onClick={closeUserReport}
                  aria-label="닫기"
                  className="h-8 w-8 -mr-2 -mt-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="mb-3 rounded-lg border border-[#E5E5E5] bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <div className="font-medium">대상: {currEditor ?? "알 수 없음"}</div>
                {!currEditorId && (
                  <div className="mt-1 text-[#E45757]">
                    이 사용자의 ID를 알 수 없어 신고 제출이 불가능합니다.
                  </div>
                )}
              </div>

              <input
                className="mb-1 h-12 w-full rounded-lg border border-[#B3B3B3] bg-white px-3 outline-none focus:ring-2 focus:ring-[#2C80A0]"
                placeholder="신고 사유를 입력해주세요."
                value={userReportReason}
                onChange={(e) => setUserReportReason(e.target.value)}
              />
              {!userReportReason.trim() && (
                <div className="text-sm text-[#E45757]">신고 사유를 입력해주세요.</div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={closeUserReport}
                  className="h-10 min-w-[80px] rounded-xl border border-[#B3B3B3] bg-white px-4 text-[16px]"
                >
                  취소
                </button>
                <button
                  onClick={submitUserReport}
                  disabled={!userReportReason.trim() || userReportPosting || !currEditorId}
                  className="h-10 min-w-[80px] rounded-xl bg-[#E45757] px-4 text-white disabled:opacity-50"
                >
                  {userReportPosting ? "전송 중…" : "신고"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
