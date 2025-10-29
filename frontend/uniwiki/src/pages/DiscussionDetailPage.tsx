// src/pages/DiscussionDetailPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronUp } from "lucide-react";
import RecentEdit from "@/layout/RecentEdit";
import RecentDiscuss from "@/layout/RecentDiscuss";

type TalkMessage = {
  id: string;
  no: number;
  author: string;
  body: string;
  createdAt: string; // ISO
};

type TalkDetail = {
  id: string;
  title: string;
  status: "open" | "closed";
  documentTitle: string;
  messages: TalkMessage[];
};

// 샘플 데이터
const SAMPLE: TalkDetail = {
  id: "d1",
  title: "토론 제목",
  status: "open",
  documentTitle: "예시문서",
  messages: [
    {
      id: "m1",
      no: 1,
      author: "토론연사람", // opener
      body:
        "여차저차 주제 구분의 의견이 길어질 때 카드 형식으로 표시합니다.\n두 줄 이상이어도 줄바꿈을 유지합니다.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m2",
      no: 2,
      author: "토론참가자",
      body: "올해 규정에도 동일하게 적용되는지 궁금합니다.",
      createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
  ],
};

export default function DiscussionDetailPage() {
  const { documentTitle = "문서 제목", id = "" } = useParams();

  // 데이터
  const data = useMemo<TalkDetail>(
    () => ({ ...SAMPLE, id, documentTitle: decodeURIComponent(documentTitle) }),
    [id, documentTitle]
  );
  const docTitleParam = encodeURIComponent(data.documentTitle);
  const docPath = `/docs/${docTitleParam}`;

  // 현재 사용자 (로그인 연동 전: 빈 값)
  const currentUser = ""; // TODO: 인증 연동 시 실제 로그인 사용자명/ID로 교체

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<TalkMessage[]>(data.messages);

  // opener = 첫 글 작성자
  const opener = messages[0]?.author ?? "";
  const isOpener = currentUser === opener;

  // 상태
  const [status, setStatus] = useState<"open" | "closed">(data.status);
  useEffect(() => {
    setStatus(data.status);
  }, [data.status]);

  const onSubmit = () => {
    const v = input.trim();
    if (!v || status === "closed") return;
    const next: TalkMessage = {
      id: `m${messages.length + 1}`,
      no: messages.length + 1,
      author: currentUser || "익명",
      body: v,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, next]);
    setInput("");
  };
  const onCloseDiscussion = () => setStatus("closed");

  // 날짜 포맷터 (KST, 24시간제)
  const fmtKST = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    []
  );

  // 스크롤 버튼들
  const panelRef = useRef<HTMLDivElement>(null);

  const [showTopPage, setShowTopPage] = useState(false);
  useEffect(() => {
    const onWinScroll = () => setShowTopPage(window.scrollY > 300);
    onWinScroll();
    window.addEventListener("scroll", onWinScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWinScroll);
  }, []);

  const [showTopPanel, setShowTopPanel] = useState(false);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const onPanelScroll = () => setShowTopPanel(el.scrollTop > 200);
    onPanelScroll();
    el.addEventListener("scroll", onPanelScroll, { passive: true });
    return () => el.removeEventListener("scroll", onPanelScroll);
  }, []);

  const scrollPageTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollPanelTop = () => panelRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  // ===================== 신고 모달 상태/핸들러 =====================
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<TalkMessage | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [touched, setTouched] = useState(false);
  const reportInputRef = useRef<HTMLInputElement>(null);

  const openReportFor = (msg: TalkMessage) => {
    if (msg.author === currentUser) return; // 내가 쓴 글이면 무시
    setReportTarget(msg);
    setReportReason("");
    setTouched(false);
    setReportOpen(true);
  };

  useEffect(() => {
    if (!reportOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setReportOpen(false); };
    window.addEventListener("keydown", onKey);
    setTimeout(() => reportInputRef.current?.focus(), 0);
    return () => window.removeEventListener("keydown", onKey);
  }, [reportOpen]);

  const submitReport = async () => {
    setTouched(true);
    if (!reportTarget || reportReason.trim() === "") return;

    // TODO: 실제 API 연동
    // await fetch(`/api/discussions/${data.id}/reports`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   credentials: "include",
    //   body: JSON.stringify({ messageId: reportTarget.id, reason: reportReason.trim() }),
    // });

    console.log("REPORT", {
      discussionId: data.id,
      messageId: reportTarget.id,
      reason: reportReason.trim(),
    });
    setReportOpen(false);
  };
  const hasReportError = touched && reportReason.trim() === "";
  // ===============================================================

  // 상태 네모(비클릭)
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
      <div className="mx-auto w-full max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left */}
        <div className="lg:col-span-8 space-y-6">
          {/* 상자 #1 : 헤더 + 액션바 + 패널 */}
          <section className="rounded-2xl border border-[#B3B3B3] bg-[#FAFAFA] p-6">
            {/* 제목 + 상태/종료하기 */}
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-[28px] leading-tight font-semibold text-gray-900">
                {data.title}
              </h1>

              {/* 열림 & 오너 → '종료하기' / 그 외 → 상태 네모 */}
              {status === "open" && isOpener ? (
                <button
                  onClick={onCloseDiscussion}
                  className="h-10 w-[clamp(92px,12vw,116px)] rounded-xl bg-[color:var(--uniwikicolor,#2c80a0)] text-white flex items-center justify-center hover:opacity-90 text-[18px] leading-tight"
                >
                  종료하기
                </button>
              ) : (
                StatusRect
              )}
            </div>

            {/* ‘해당 문서’ + 액션바 */}
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
                <ul className="space-y-3">
                  {messages.map((m) => {
                    const isMine = m.author === currentUser;
                    const isOpenerMsg = m.author === opener;
                    return (
                      <li
                        key={m.id}
                        className="rounded-lg border"
                        onClick={() => !isMine && openReportFor(m)}
                        role={isMine ? undefined : "button"}
                        tabIndex={isMine ? -1 : 0}
                        onKeyDown={(e) => {
                          if (!isMine && (e.key === "Enter" || e.key === " ")) openReportFor(m);
                        }}
                        title={isMine ? undefined : "클릭하여 신고하기"}
                        style={{ cursor: isMine ? "default" : "pointer" }}
                      >
                        <div
                          className={
                            "flex items-center justify-between rounded-t-lg px-3 py-2 text-sm " +
                            (isOpenerMsg
                              ? "bg-[color:var(--uniwikicolor,#2c80a0)] text-white"
                              : "bg-gray-200 text-gray-700")
                          }
                        >
                          <div className="font-semibold">
                            #{m.no} {m.author}
                          </div>
                          <div className="opacity-80">
                            {fmtKST.format(new Date(m.createdAt))}
                          </div>
                        </div>
                        <div className="whitespace-pre-wrap rounded-b-lg bg-white px-3 py-3 text-gray-800">
                          {m.body}
                        </div>
                      </li>
                    );
                  })}
                </ul>
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
              <h2 className="text-[28px] leading-tight font-semibold text-gray-900">
                의견 작성
              </h2>
            </header>

            <textarea
              className="h-28 w-full resize-none rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#2C80A0] disabled:cursor-not-allowed disabled:bg-gray-100"
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
                disabled={!input.trim() || status === "closed"}
                className="h-10 w-[clamp(92px,12vw,116px)] rounded-xl bg-[color:var(--uniwikicolor,#2c80a0)] px-5 text-white disabled:opacity-50 disabled:cursor-not-allowed text-[18px] leading-tight"
              >
                생성
              </button>
            </div>
          </section>
        </div>

        {/* Right rail */}
        <aside className="lg:col-span-4 space-y-6">
          <RecentEdit />
          <RecentDiscuss />
        </aside>
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

      {/* ================== 토론 신고 모달 ================== */}
      {reportOpen && (
        <div
          onClick={() => setReportOpen(false)}
          className="fixed inset-0 flex items-center justify-center bg-black/30 z-[1000]"
          aria-hidden
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="bg-white rounded-2xl p-8 w-[420px]"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 id="report-title" className="text-xl font-semibold">토론 내용 신고하기</h2>
              <button
                onClick={() => setReportOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-1">신고 사유</label>
              <input
                ref={reportInputRef}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                onBlur={() => setTouched(true)}
                onKeyDown={(e) => { if (e.key === "Enter") submitReport(); }}
                placeholder="재가 나한테 욕함;;;"
                className={`w-full border rounded-lg px-3 py-2 text-sm ${
                  hasReportError ? "border-red-500" : ""
                }`}
              />
              {hasReportError && (
                <p className="mt-2 text-[12px] text-red-500">신고 사유를 입력해주세요.</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setReportOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={submitReport}
                className="px-4 py-2 rounded-lg bg-[#e25b5b] text-white hover:opacity-90"
              >
                신고
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =================================================== */}
    </div>
  );
}
