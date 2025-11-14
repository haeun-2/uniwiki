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
        <p className="mt-1 text-sm text-gray-600">
          특정 토론 스레드의 발언들을 확인하고, 새로운 의견을 남기는 페이지입니다.
        </p>
      </header>

      <section className="space-y-8">
        {/* 개요 */}
        <Article id="overview" title="개요">
          <Figure src={fullImg} alt="진행 중인 토론 전체 화면" tall />
          <Ul className="mt-4">
            <Li title="역할">
              문서에 달린 개별 토론 스레드의 전체 흐름을 보여주고, 사용자가 추가 의견을 남길 수 있는
              상세 화면입니다.
            </Li>
            <Li title="구성">
              상단의 토론 제목·상태·문서 이동 버튼, 중앙의 발언 목록 카드, 하단의 의견 작성 영역으로
              구성됩니다.
            </Li>
            <Li title="라우팅 예시">
              <code>/univ/:universityName/docs/:documentTitle/discussions/:discussionId</code> 와 같이
              토론 ID를 포함한 경로로 매핑됩니다.
            </Li>
          </Ul>
        </Article>

        {/* 토론 헤더와 발언 목록 */}
        <Article id="thread" title="토론 헤더와 발언 목록">
          <Figure src={discussionNowTopImg} alt="토론 헤더와 발언 목록 카드" />
          <Ul className="mt-4">
            <Li title="토론 제목">
              상단에 &quot;경북대학교 문서 수정 건의&quot;와 같은 토론 제목이 크게 표시됩니다.
            </Li>
            <Li title="토론 상태 배지">
              제목 오른쪽의 상태 배지(예: &quot;열림&quot;, &quot;종료&quot;)로 현재 토론 상태를 표시합니다.
            </Li>
            <Li title="문서 정보와 이동 버튼">
              부제에서 어떤 문서에 대한 토론인지 설명하고, 우측 상단 &quot;토론 목록&quot;, &quot;문서로&quot;
              버튼으로 각각 토론 목록 페이지와 문서 열람 페이지로 이동할 수 있습니다.
            </Li>
            <Li title="발언 카드">
              각 발언은 번호, 작성자, 내용, 작성 시각을 포함한 카드 형태로 표시됩니다. 첫 발언은 보통
              토론 개설 내용이며, 이후 댓글이 시간 순으로 이어집니다.
            </Li>
            <Li title="강조 스타일">
              가장 최근이거나 선택된 발언은 진한 색 배경(예: 청록색)으로 강조하고, 이전 발언은 회색 카드로
              구분해 가독성을 높입니다.
            </Li>
          </Ul>
        </Article>

        {/* 의견 작성 폼 */}
        <Article id="reply" title="의견 작성 폼">
          <Figure src={discussionNowBottomImg} alt="의견 작성 폼" />
          <Ul className="mt-4">
            <Li title="입력 영역">
              &quot;의견을 입력하세요&quot; 플레이스홀더가 있는 텍스트 영역에 토론에 대한 의견을 작성합니다.
            </Li>
            <Li title="제한 안내">
              하단에는 &quot;내용 수정 및 삭제가 불가능합니다&quot; 안내 문구를 표시해, 한번 등록된 발언은
              수정/삭제가 되지 않는 정책을 명시합니다.
            </Li>
            <Li title="생성 버튼">
              우측 하단 &quot;생성&quot; 버튼을 클릭하면 새 발언이 현재 토론 스레드에 추가되고, 상단 발언
              목록에 바로 반영됩니다.
            </Li>
            <Li title="권한">
              로그인한 사용자만 의견을 남길 수 있으며, 비로그인 사용자는 로그인 유도 메시지를 노출할 수
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
      <span className="font-medium text-gray-900">{title}. </span>
      <span className="text-gray-700">{children}</span>
    </li>
  );
}
