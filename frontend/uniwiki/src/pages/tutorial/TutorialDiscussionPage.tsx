import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import fullImg from "/tutorial/05_discussion/full.png";
import discussionTopImg from "/tutorial/05_discussion/discussion_top.png";
import discussionBottomImg from "/tutorial/05_discussion/discussion_bottom.png";

type TocItem = { id: string; label: string };
type OutletCtx = { setToc: (items: TocItem[]) => void };

export default function TutorialDiscussionPage() {
  const { setToc } = useOutletContext<OutletCtx>();

  useEffect(() => {
    setToc([
      { id: "overview", label: "개요" },
      { id: "list-header", label: "토론 목록 및 상단 헤더" },
      { id: "new-discussion", label: "새 토론 생성 폼" },
    ]);
    return () => setToc([]);
  }, [setToc]);

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">토론 페이지 기능 설명</h1>
      </header>

      <section className="space-y-8">
        <article className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <p className="text-sm text-gray-700">
              문서에 연결된 토론을 관리하는 페이지입니다. 상단 토론 목록 영역과 하단 새 토론 생성 폼으로
              구성됩니다.
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>해당 문서에 어떤 토론이 진행 중인지 표시</li>
              <li>토론 제목과 내용으로 토론을 시작하는 기능</li>
            </ul>
          </div>
        </article>

        {/* 개요 */}
        <Article id="overview" title="개요">
          <Figure src={fullImg} alt="토론 페이지 전체 화면" tall />
          <Ul className="mt-4">
            <Li title="역할">
              특정 문서에 대한 변경 제안, 이의 제기, 의견 교환 등 문서 편집 전·후 논의를 진행하는 공간입니다.
            </Li>
            <Li title="구성">
              상단의 문서 정보 및 토론 목록 카드, 하단의 새 토론 생성 카드, 우측의 최근 수정된 문서 및
              최근 토론 사이드 카드로 구성됩니다.
            </Li>
          </Ul>
        </Article>

        {/* 토론 목록 및 상단 헤더 */}
        <Article id="list-header" title="토론 목록 및 상단 헤더">
          <Figure src={discussionTopImg} alt="토론 상단 헤더 및 목록" />
          <Ul className="mt-4">
            <Li title="문서 제목">
              상단에는 문서 카테고리와 문서 제목이 표시되어, 어떤 문서의
              토론인지 명확하게 보여줍니다.
            </Li>
            <Li title="'문서로' 버튼">
              우측 상단 &quot;문서로&quot; 버튼을 클릭하면 해당 문서 열람 페이지로 돌아갑니다.
            </Li>
            <Li title="토론 목록">
              번호가 붙은 리스트 형태로 토론 제목을 나열합니다. 각 항목을 클릭하면 토론 상세 페이지로
              이동합니다.
            </Li>
          </Ul>
        </Article>

        {/* 새 토론 생성 폼 */}
        <Article id="new-discussion" title="새 토론 생성 폼">
          <Figure src={discussionBottomImg} alt="새 토론 생성 폼" />
          <Ul className="mt-4">
            <Li title="주제">
              상단 입력창에 토론의 제목을 입력항여 토론을 발제할 수 있습니다.
            </Li>
            <Li title="댓글">
              아래 큰 텍스트 영역에 토론을 시작할 내용을 작성합니다. 문서에서 어떤 점이 문제인지, 어떤
              변경을 제안하는지 구체적으로 적습니다.
            </Li>
            <Li title="수정 제한">
              한 번 등록된 토론 댓글은 수정이 제한됩니다.
            </Li>
            <Li title="생성 버튼">
              하단 우측의 &quot;생성&quot; 버튼을 클릭하면 새 토론이 생성되며, 상단 토론 목록에 추가됩니다.
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
