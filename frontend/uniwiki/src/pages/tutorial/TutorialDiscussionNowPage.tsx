import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import fullImg from "/tutorial/06_discussion_now/full.png";
import discussionNowTopImg from "/tutorial/06_discussion_now/discussion_now_top.png";
import discussionNowBottomImg from "/tutorial/06_discussion_now/discussion_now_bottom.png";

type TocItem = { id: string; label: string };
type OutletCtx = { setToc: (items: TocItem[]) => void };

export default function TutorialDiscussionNowPage() {
  const { setToc } = useOutletContext<OutletCtx>();

  useEffect(() => {
    setToc([
      { id: "overview", label: "개요" },
      { id: "thread", label: "토론 헤더와 발언 목록" },
      { id: "reply", label: "의견 작성 폼" },
    ]);
    return () => setToc([]);
  }, [setToc]);

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">진행 중인 토론 페이지 기능 설명</h1>
      </header>

      <section className="space-y-8">
        <article className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <p className="text-sm text-gray-700">
              특정 토론의 발언들을 확인하고, 새로운 의견을 남기는 페이지입니다.
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>해당 토론의 진행 상황을 볼 수 있는 버튼(열림, 종료)</li>
              <li>토론에 달린 댓글을 표시해주는 부분</li>
              <li>댓글이나 댓글 작성자를 눌러 신고할 수 있는 기능</li>
              <li>해당 토론에 의견을 달 수 있는 기능</li>
            </ul>
          </div>
        </article>

        {/* 개요 */}
        <Article id="overview" title="개요">
          <Figure src={fullImg} alt="진행 중인 토론 전체 화면" tall />
          <Ul className="mt-4">
            <Li title="역할">
              문서에 달린 개별 토론의 전체 흐름을 보여주고, 사용자가 추가 의견을 남길 수 있는
              상세 화면입니다.
            </Li>
            <Li title="구성">
              상단의 토론 제목·상태·문서 이동 버튼, 중앙의 발언 목록 카드, 하단의 의견 작성 영역으로
              구성됩니다.
            </Li>
          </Ul>
        </Article>

        {/* 토론 헤더와 발언 목록 */}
        <Article id="thread" title="토론 헤더와 발언 목록">
          <Figure src={discussionNowTopImg} alt="토론 헤더와 발언 목록 카드" />
          <Ul className="mt-4">
            <Li title="토론 제목">
              상단에 토론 제목이 표시됩니다.
            </Li>
            <Li title="토론 상태 배지">
              제목 오른쪽의 상태 배지(예: &quot;열림&quot;, &quot;종료&quot;)로 현재 토론 상태를 표시합니다.
              토론 발제자의 경우, 해당 버튼이 '종료하기'로 표시되며, 해당 버튼을 눌러 토론을 종료할 수 있습니다.
            </Li>
            <Li title="이동 버튼">
              우측 상단 &quot;토론 목록&quot;, &quot;문서로&quot; 버튼으로
              각각 토론 목록 페이지와 문서 열람 페이지로 이동할 수 있습니다.
            </Li>
            <Li title="발언 댓글">
              각 발언은 댓글 형태로 순차적으로 표시됩니다. 첫 댓글은 보통
              토론 개설 내용이며, 이후 댓글이 시간 순으로 이어집니다.
            </Li>
            <Li title="강조 스타일">
              토론 발제자의 경우 진한 색 배경으로 강조됩니다.
            </Li>
            <Li title="신고">
              부적절한 댓글의 경우 댓글 또는 사용자를 눌러 신고할 수 있습니다.
            </Li>
          </Ul>
        </Article>

        {/* 의견 작성 폼 */}
        <Article id="reply" title="의견 작성 폼">
          <Figure src={discussionNowBottomImg} alt="의견 작성 폼" />
          <Ul className="mt-4">
            <Li title="입력 영역">
              텍스트 영역에 토론에 대한 의견을 작성합니다.
            </Li>
            <Li title="제한 안내">
              한번 등록된 댓글은 수정/삭제가 되지 않습니다.
            </Li>
            <Li title="생성 버튼">
              우측 하단 &quot;생성&quot; 버튼을 클릭하면 새 발언이 현재 토론 스레드에 추가되고, 상단 발언
              목록에 바로 반영됩니다.
            </Li>
            <Li title="권한">
              로그인한 해당 학교 학생만 의견을 남길 수 있으며, 비로그인 사용자는 로그인 유도 메시지를 노출할 수
              있습니다.
            </Li>
          </Ul>
        </Article>
      </section>
    </main>
  );
}

/** 공용 컴포넌트 (TutorialMainPage 와 동일 형식) */
function Article({
  id,
  title,
  children,
}: React.PropsWithChildren<{ id: string; title: string }>) {
  return (
    <article id={id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </article>
  );
}

function Figure({
  src,
  alt,
  small,
  tall,
}: {
  src: string;
  alt: string;
  small?: boolean;
  tall?: boolean;
}) {
  const base = "block w-full object-contain select-none";
  const h = small ? "h-24 md:h-28" : tall ? "h-56 md:h-64" : "h-40 md:h-48";
  return (
    <figure className="rounded-xl bg-gray-50 border border-gray-100 p-3">
      <img src={src} alt={alt} className={`${base} ${h}`} draggable={false} />
    </figure>
  );
}

function Ul({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return <ul className={`space-y-2 ${className}`}>{children}</ul>;
}

function Li({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <li className="text-sm leading-6">
      <span className="font-medium text-gray-900">{title}: </span>
      <span className="text-gray-700">{children}</span>
    </li>
  );
}
