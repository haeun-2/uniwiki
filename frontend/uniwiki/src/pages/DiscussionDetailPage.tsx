// src/pages/DiscussionDetailPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronUp } from "lucide-react";

const API_BASE = "http://k13d104.p.ssafy.io/api";
const FLASH_AUTO_MS = 3200;

// 로컬 디버깅용(콘솔 로그만): localStorage.setItem('debugSSE','1')
const DEBUG_SSE = (() => {
  try {
    return localStorage.getItem("debugSSE") === "1";
  } catch {
    return false;
  }
})();

// ===== 토큰/유저 =====
function getAccessToken() {
  try {
    return localStorage.getItem("accessToken") || "";
  } catch {
    return "";
  }
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

// ===== 타입 =====
type TalkMessage = {
  id: string;
  no: number;
  author: string;
  isCreator: boolean;
  body: string;
  createdAt: string;
  writerId?: string | number | null;
};
type TalkDetail = {
  id: string;
  title: string;
  status: "open" | "closed";
  documentTitle: string;
  creatorId?: string | number | null;
  creatorNickname?: string;
  messages: TalkMessage[];
};

export default function DiscussionDetailPage() {
  const { documentTitle = "문서 제목", id = "" } = useParams();

  // UI 상태
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [flash, setFlash] = useState("");

  // 데이터
  const [data, setData] = useState<TalkDetail>({
    id,
    title: "",
    status: "open",
    documentTitle: decodeURIComponent(documentTitle),
    creatorId: null,
    creatorNickname: "",
    messages: [],
  });

  const docTitleParam = encodeURIComponent(data.documentTitle);
  const docPath = `/docs/${docTitleParam}`;

  // 현재 로그인 사용자 id
  const [viewerId, setViewerId] = useState<string | null>(null);
  useEffect(() => {
    setViewerId(getViewerIdFromStorage());
  }, []);

  // 상태
  const [status, setStatus] = useState<"open" | "closed">("open");
  useEffect(() => setStatus(data.status), [data.status]);

  // ---- 시간 포맷(KST) ----
  const formatKST = useMemo(
    () => (iso: string) => {
      const norm = iso.replace(/(\.\d{3})\d+$/, "$1");
      const hasTZ = /Z$|[+\-]\d{2}:\d{2}$/.test(norm);
      const utcIso = hasTZ ? norm : norm + "Z";
      return new Date(utcIso).toLocaleString("sv-SE", {
        timeZone: "Asia/Seoul",
        hour12: false,
      }); // YYYY-MM-DD HH:mm:ss
    },
    []
  );

  // 플래시 자동 닫힘(오류/실패/에러는 고정)
  useEffect(() => {
    if (!flash) return;
    const isSticky = /오류|실패|에러/.test(flash);
    if (isSticky) return;
    const t = setTimeout(() => setFlash(""), FLASH_AUTO_MS);
    return () => clearTimeout(t);
  }, [flash]);

  // 스크롤
  const panelRef = useRef<HTMLDivElement>(null);
  const [showTopPage, setShowTopPage] = useState(false);
  const [showTopPanel, setShowTopPanel] = useState(false);
  useEffect(() => {
    const onWinScroll = () => setShowTopPage(window.scrollY > 300);
    window.addEventListener("scroll", onWinScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWinScroll);
  }, []);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const onPanelScroll = () => setShowTopPanel(el.scrollTop > 200);
    el.addEventListener("scroll", onPanelScroll, { passive: true });
    return () => el.removeEventListener("scroll", onPanelScroll);
  }, []);
  const scrollPageTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollPanelTop = () => panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  // ----- 상세 조회 -----
  const loadDetail = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/v1/discussions/${id}`, {
        headers: { Accept: "application/json", ...authHeaders() },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`상세 조회 실패 (${res.status})`);
      const j = await res.json();

      const mapped: TalkDetail = {
        id: String(j.discussionId),
        title: j.discussionTitle,
        status: j.discussionStatus === "OPEN" ? "open" : "closed",
        documentTitle: j.documentTitle || decodeURIComponent(documentTitle),
        creatorId: j.creatorId ?? null,
        creatorNickname: j.creatorNickname,
        messages: (j.discussionContents ?? []).map((c: any) => ({
          id: String(c.discussionContentId),
          no: Number(c.contentNumber),
          author: String(c.writerNickname ?? ""),
          isCreator: Boolean(c.isCreator),
          body: String(c.discussionContent ?? ""),
          createdAt: String(c.createdAt),
          writerId:
            c.writerId ??
            c.writerMemberId ??
            c.writerUserId ??
            (c.writer && (c.writer.id ?? c.writer.userId)) ??
            null,
        })),
      };

      setData(mapped);
      setStatus(mapped.status);
    } catch (e: any) {
      setErrorMsg(e?.message || "토론을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) void loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, documentTitle]);

  // ===== SSE: 실시간 스트림 (열림 상태에서만) =====
  const evtSrcRef = useRef<EventSource | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const retryAttemptRef = useRef(0);
  const [sseState, setSseState] = useState<0 | 1 | 2>(2); // 0=CONNECTING,1=OPEN,2=CLOSED

  const mapIncoming = (c: any): TalkMessage => ({
    id: String(c.discussionContentId ?? c.id ?? crypto.randomUUID()),
    no: Number(c.contentNumber ?? c.number ?? 0),
    author: String(c.writerNickname ?? c.nickname ?? "익명"),
    isCreator: Boolean(c.isCreator ?? false),
    body: String(c.discussionContent ?? c.content ?? ""),
    createdAt: String(c.createdAt ?? new Date().toISOString()),
    writerId:
      c.writerId ??
      c.writerMemberId ??
      c.writerUserId ??
      (c.writer && (c.writer.id ?? c.writer.userId)) ??
      null,
  });

  function closeStream() {
    if (retryTimerRef.current) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (evtSrcRef.current) {
      try {
        evtSrcRef.current.close();
      } catch {}
      evtSrcRef.current = null;
    }
    setSseState(2);
    if (DEBUG_SSE) console.debug("[SSE] closed");
  }

  function openStream() {
    if (!id || evtSrcRef.current) return;
    const url = `${API_BASE}/v1/discussions/${id}/stream`;
    const es = new EventSource(url, { withCredentials: true });
    evtSrcRef.current = es;
    setSseState(0);
    if (DEBUG_SSE) console.debug("[SSE] connecting…", url);

    const resetBackoff = () => {
      retryAttemptRef.current = 0;
      if (retryTimerRef.current) {
        window.clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

    es.addEventListener("open", () => {
      resetBackoff();
      setSseState(1);
      if (DEBUG_SSE) console.debug("[SSE] open");
    });

    // 서버 이벤트명에 맞춰 수신
    es.addEventListener("new-content", (ev: MessageEvent) => {
      try {
        const payload = JSON.parse(ev.data);
        const msg = mapIncoming(payload);
        setData((prev) => {
          if (prev.messages.some((m) => m.id === msg.id)) return prev;
          return { ...prev, messages: [...prev.messages, msg] };
        });
        const el = panelRef.current;
        if (el) {
          const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          if (nearBottom) {
            setTimeout(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }), 0);
          }
        }
      } catch {}
    });

    es.addEventListener("status-change", (ev: MessageEvent) => {
      try {
        const payload = JSON.parse(ev.data); // {status:"OPEN"|"CLOSED"}
        const next = (String(payload.status || "").toUpperCase() === "OPEN" ? "open" : "closed") as
          | "open"
          | "closed";
        setStatus(next);
        setData((prev) => ({ ...prev, status: next }));
        if (next === "closed") {
          setFlash("토론이 종료되었습니다.");
          closeStream();
        } else {
          setFlash("토론이 다시 열렸습니다.");
        }
      } catch {}
    });

    es.onerror = () => {
      if (DEBUG_SSE) console.debug("[SSE] error, will retry…");
      try {
        es.close();
      } catch {}
      evtSrcRef.current = null;
      setSseState(2);

      const attempt = (retryAttemptRef.current || 0) + 1;
      retryAttemptRef.current = attempt;
      const delay = Math.min(1000 * 2 ** (attempt - 1), 10000);
      retryTimerRef.current = window.setTimeout(() => {
        if (status === "open") openStream();
      }, delay);
    };
  }

  // 열림 상태일 때만 연결, 페이지 나갈 때/닫힘일 때 해제
  useEffect(() => {
    if (status === "open") openStream();
    else closeStream();
    return () => closeStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, status]);

  // ----- 개설자 == 현재 사용자 ? 종료 버튼 -----
  const isCreator = useMemo(() => {
    if (viewerId == null || data.creatorId == null) return false;
    return String(viewerId) === String(data.creatorId);
  }, [viewerId, data.creatorId]);

  const [closing, setClosing] = useState(false);
  const onCloseDiscussion = async () => {
    if (!isCreator || status !== "open" || closing) return;
    setClosing(true);
    setFlash("");
    try {
      const res = await fetch(`${API_BASE}/v1/discussions/${id}/close`, {
        method: "PATCH",
        headers: { Accept: "application/json", ...authHeaders() },
        credentials: "include",
      });
      if (!res.ok) throw new Error(`토론 종료 실패 (${res.status})`);
      setStatus("closed");
      setData((p) => ({ ...p, status: "closed" }));
      setFlash("토론이 종료되었습니다.");
      closeStream();
    } catch (e: any) {
      setFlash(e?.message || "토론 종료에 실패했습니다.");
    } finally {
      setClosing(false);
    }
  };

  // ----- 의견 작성 -----
  const [input, setInput] = useState("");
  const [posting, setPosting] = useState(false);

  const onSubmit = async () => {
    const body = input.trim();
    if (!body || status === "closed" || posting) return;

    if (!getAccessToken()) {
      setFlash("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
      return;
    }

    setPosting(true);
    setFlash("");
    try {
      const res = await fetch(`${API_BASE}/v1/discussions/${id}/contents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ discussionContent: body }),
      });

      if (res.status === 401) {
        setFlash("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
        return;
      }
      if (res.status === 403) {
        setFlash("해당 학교 소속 학생만 의견을 작성할 수 있습니다.");
        return;
      }
      if (!res.ok) {
        setFlash(`의견 생성 실패 (${res.status})`);
        return;
      }

      setInput("");
      setFlash("의견이 등록되었습니다.");
    } catch {
      setFlash("네트워크 오류로 의견을 등록하지 못했습니다.");
    } finally {
      setPosting(false);
    }
  };

  // ====== 콘텐츠 신고(본문) 모달 상태 ======
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<TalkMessage | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportPosting, setReportPosting] = useState(false);

  // ====== 사용자 신고 모달 상태 ======
  const [userReportOpen, setUserReportOpen] = useState(false);
  const [userReportTarget, setUserReportTarget] = useState<{ id: string | number | null; nickname: string } | null>(null);
  const [userReportReason, setUserReportReason] = useState("");
  const [userReportPosting, setUserReportPosting] = useState(false);

  // 공통: 내 글/내 자신 비교
  const isMineBy = (m: { writerId?: string | number | null; author?: string }) => {
    const vid = viewerId ? String(viewerId) : null;
    const mid = m.writerId != null ? String(m.writerId) : null;
    const vnick = getViewerNicknameFromStorage();
    const manick = (m.author || "").trim();
    return (vid && mid && vid === mid) || (!!vnick && vnick === manick);
  };

  // 본문 클릭 → 콘텐츠 신고
  const openReport = (m: TalkMessage) => {
    if (isMineBy(m)) {
      setFlash("내가 작성한 내용은 신고할 수 없습니다.");
      return;
    }
    setReportTarget(m);
    setReportReason("");
    setReportOpen(true);
  };
  const closeReport = () => {
    if (reportPosting) return;
    setReportOpen(false);
  };

  // ✅ 토론 내용 신고: POST /v1/reports/discussion-contents { targetId, reason }
  const submitReport = async () => {
    if (!reportTarget) return;

    if (isMineBy(reportTarget)) {
      setFlash("내가 작성한 내용은 신고할 수 없습니다.");
      setReportOpen(false);
      return;
    }

    const reason = reportReason.trim();
    if (!reason) return;

    setReportPosting(true);
    setFlash("");
    try {
      const res = await fetch(`${API_BASE}/v1/reports/discussion-contents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          ...authHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ targetId: reportTarget.id, reason }),
      });

      if (res.status === 401) {
        setFlash("로그인이 필요합니다. 로그인 후 다시 시도해 주세요.");
        return;
      }
      if (res.status === 403) {
        setFlash("신고 권한이 없습니다.");
        return;
      }
      if (!res.ok) {
        let msg = `신고 실패 (${res.status})`;
        try {
          const txt = await res.text();
          if (txt) msg = `${msg} — ${txt.substring(0, 200)}`;
        } catch {}
        setFlash(msg);
        return;
      }

      setFlash("신고가 접수되었습니다.");
      setReportOpen(false);
    } catch (e: any) {
      setFlash(e?.message || "네트워크 오류로 신고하지 못했습니다.");
    } finally {
      setReportPosting(false);
    }
  };

  // 작성자 이름 클릭 → 사용자 신고
  const openUserReport = (m: TalkMessage) => {
    if (isMineBy(m)) {
      setFlash("본인은 신고할 수 없습니다.");
      return;
    }
    if (m.writerId == null || m.writerId === "") {
      setFlash("이 사용자의 ID를 알 수 없어 신고할 수 없습니다.");
      return;
    }
    setUserReportTarget({ id: m.writerId, nickname: m.author });
    setUserReportReason("");
    setUserReportOpen(true);
  };
  const closeUserReport = () => {
    if (userReportPosting) return;
    setUserReportOpen(false);
  };

  // ✅ 사용자 신고: POST /v1/reports/users { targetId, reason }
  const submitUserReport = async () => {
    if (!userReportTarget) return;

    const targetId = userReportTarget.id;
    if (targetId == null || targetId === "") {
      setFlash("이 사용자의 ID를 알 수 없어 신고할 수 없습니다.");
      setUserReportOpen(false);
      return;
    }
    if (isMineBy({ writerId: targetId, author: userReportTarget.nickname })) {
      setFlash("본인은 신고할 수 없습니다.");
      setUserReportOpen(false);
      return;
    }
    const reason = userReportReason.trim();
    if (!reason) return;

    setUserReportPosting(true);
    setFlash("");
    try {
      const res = await fetch(`${API_BASE}/v1/reports/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          ...authHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ targetId, reason }),
      });
      if (!res.ok) throw new Error(`사용자 신고 실패 (${res.status})`);
      setFlash("사용자 신고가 접수되었습니다.");
      setUserReportOpen(false);
    } catch (e: any) {
      setFlash(e?.message || "사용자 신고에 실패했습니다.");
    } finally {
      setUserReportPosting(false);
    }
  };

  // 상태 네모
  const StatusRect = (
    <span
      className="inline-flex h-10 w-[clamp(92px,12vw,116px)] items-center justify-center rounded-xl border text-[18px] leading-tight"
      style={{
        borderColor: "#B3B3B3",
        color: status === "open" ? "#2C80A0" : "#B3B3B3",
        backgroundColor: "#FFFFFF",
      }}
      aria-label={`토론 상태: ${status === "open" ? "열림" : "종료"}`}
    >
      {status === "open" ? "열림" : "종료"}
    </span>
  );

  return (
    <div className="bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 gap-6">
        {/* Left */}
        <div className="lg:col-span-8 space-y-6">
          {/* 상자 #1 : 헤더 + 액션바 + 패널 */}
          <section className="rounded-2xl border border-[#B3B3B3] bg-[#FAFAFA] p-6">
            {/* 배너 */}
            {errorMsg && (
              <div className="mb-4 rounded-xl bg-[#2C80A0] text-white px-4 py-3 text-[16px]">
                {errorMsg}
              </div>
            )}
            {flash && !errorMsg && (
              <div className="mb-4 rounded-xl bg-[#2C80A0] text-white px-4 py-3 text-[16px]">
                {flash}
              </div>
            )}

            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-[28px] leading-tight font-semibold text-gray-900">
                {data.title || "토론 상세"}
              </h1>

              {status === "open" && isCreator ? (
                <button
                  onClick={onCloseDiscussion}
                  disabled={closing}
                  className="h-10 w-[clamp(92px,12vw,116px)] rounded-xl bg-[color:var(--uniwikicolor,#2c80a0)] text-white flex items-center justify-center hover:opacity-90 text-[18px] leading-tight disabled:opacity-60"
                >
                  {closing ? "종료 중…" : "종료하기"}
                </button>
              ) : (
                StatusRect
              )}
            </div>

            <div className="mb-5 flex items-center gap-4">
              <p className="text-[18px] leading-tight text-gray-800 font-medium">
                ‘{data.documentTitle}’에 관한 토론
              </p>
              <div className="ml-auto" />
              <div
                role="tablist"
                aria-label="문서 작업 메뉴"
                className="grid grid-cols-2 items-stretch overflow-hidden rounded-xl border border-[#B3B3B3] bg-[#FAFAFA] w-[clamp(184px,24vw,236px)]"
              >
                <Link
                  role="tab"
                  aria-selected={false}
                  to={`${docPath}/discussions`}
                  className="h-10 px-3 text-[18px] leading-tight flex items-center justify-center text-[#7F7F7F] hover:bg-white/60"
                >
                  토론 목록
                </Link>
                <Link
                  role="tab"
                  aria-selected={false}
                  to={docPath}
                  className="h-10 px-3 text-[18px] leading-tight flex items-center justify-center border-l border-[#B3B3B3] text-[#7F7F7F] hover:bg-white/60"
                >
                  문서로
                </Link>
              </div>
            </div>

            {/* 토론 카드 패널 */}
            <div className="relative rounded-xl">
              <div
                ref={panelRef}
                className="max-h-[760px] overflow-y-auto rounded-xl p-1"
                style={{ maxHeight: "72vh" }}
              >
                {loading ? (
                  <div className="px-3 py-2 text-[18px] text-[#7F7F7F]">불러오는 중…</div>
                ) : (
                  <ul className="space-y-3">
                    {data.messages.map((m) => (
                      <li key={m.id} className="rounded-lg border border-[#B3B3B3]">
                        <div
                          className={
                            "flex items-center justify-between rounded-t-lg px-3 py-2 text-sm " +
                            (m.isCreator
                              ? "bg-[color:var(--uniwikicolor,#2c80a0)] text-white"
                              : "bg-gray-200 text-gray-700")
                          }
                        >
                          <div className="font-semibold flex items-center gap-2">
                            <span>#{m.no}</span>
                            {/* 작성자 이름 클릭 → 사용자 신고 */}
                            <button
                              type="button"
                              onClick={() => openUserReport(m)}
                              className="underline-offset-2 hover:underline focus:underline outline-none"
                              title="작성자 신고하기"
                              aria-label={`${m.author} 사용자 신고`}
                            >
                              {m.author}
                            </button>
                          </div>
                          <div className="opacity-80">{formatKST(m.createdAt)}</div>
                        </div>

                        {/* 본문 클릭 -> 콘텐츠 신고 */}
                        <div
                          className="whitespace-pre-wrap rounded-b-lg bg-white px-3 py-3 text-gray-800 cursor-pointer"
                          onClick={() => openReport(m)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openReport(m);
                            }
                          }}
                          title="클릭하여 콘텐츠 신고"
                        >
                          {m.body}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 패널 우하단 상단이동 버튼 */}
              {showTopPanel && (
                <button
                  onClick={scrollPanelTop}
                  className="absolute bottom-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#5C5C5C] bg-white text-[#5C5C5C] shadow-sm hover:bg-gray-50"
                  aria-label="패널 맨 위로"
                >
                  <ChevronUp className="h-5 w-5" strokeWidth={3} />
                </button>
              )}
            </div>
          </section>

          {/* 의견 작성 */}
          <section className="pt-2">
            <header className="mb-4">
              <h2 className="text-[28px] leading-tight font-semibold text-gray-900">의견 작성</h2>
            </header>

            <textarea
              className="h-28 w-full resize-none rounded-lg border border-[#B3B3B3] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#2C80A0] disabled:cursor-not-allowed disabled:bg-gray-100"
              rows={4}
              placeholder={
                status === "open"
                  ? "의견을 입력하세요"
                  : "종료된 토론입니다. 의견을 작성할 수 없습니다."
              }
              disabled={status === "closed"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="mt-2 text-sm text-gray-600">내용 수정 및 삭제가 불가능합니다.</div>
            <div className="mt-3 flex justify-end">
              <button
                onClick={onSubmit}
                disabled={!input.trim() || status === "closed" || posting}
                className="h-10 w-[clamp(92px,12vw,116px)] rounded-xl bg-[color:var(--uniwikicolor,#2c80a0)] px-5 text-white disabled:opacity-50 disabled:cursor-not-allowed text-[18px] leading-tight"
              >
                {posting ? "생성 중…" : "생성"}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* 페이지 우하단 '상단으로' */}
      {showTopPage && (
        <button
          onClick={scrollPageTop}
          className="fixed bottom-6 right-5 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#5C5C5C] bg-white text-[#5C5C5C] shadow-sm hover:bg-gray-50"
          aria-label="문서 상단으로 이동"
          title="문서 상단으로 이동"
        >
          <ChevronUp className="h-5 w-5" strokeWidth={3} />
        </button>
      )}

      {/* ===== 콘텐츠 신고 모달 ===== */}
      {reportOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/50" onClick={closeReport} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-[22px] font-semibold">토론 내용 신고하기</h3>
                <button
                  onClick={closeReport}
                  aria-label="닫기"
                  className="h-8 w-8 -mr-2 -mt-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {reportTarget && (
                <div className="mb-3 rounded-lg border border-[#E5E5E5] bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <div className="mb-1 font-medium">
                    #{reportTarget.no} {reportTarget.author}
                  </div>
                  <div className="whitespace-pre-wrap">{reportTarget.body}</div>
                </div>
              )}

              <input
                className="mb-1 h-12 w-full rounded-lg border border-[#B3B3B3] bg-white px-3 outline-none focus:ring-2 focus:ring-[#2C80A0]"
                placeholder="신고 사유를 입력해주세요."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              {!reportReason.trim() && (
                <div className="text-sm text-[#E45757]">신고 사유를 입력해주세요.</div>
              )}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={closeReport}
                  className="h-10 min-w-[80px] rounded-xl border border-[#B3B3B3] bg-white px-4 text-[16px]"
                >
                  취소
                </button>
                <button
                  onClick={submitReport}
                  disabled={!reportReason.trim() || reportPosting}
                  className="h-10 min-w-[80px] rounded-xl bg-[#E45757] px-4 text-white disabled:opacity-50"
                >
                  {reportPosting ? "전송 중…" : "신고"}
                </button>
              </div>
            </div>
          </div>
        </div>
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

              {userReportTarget && (
                <div className="mb-3 rounded-lg border border-[#E5E5E5] bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  <div className="font-medium">대상: {userReportTarget.nickname}</div>
                </div>
              )}

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
                  disabled={
                    !userReportReason.trim() || userReportPosting || !userReportTarget?.id
                  }
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
