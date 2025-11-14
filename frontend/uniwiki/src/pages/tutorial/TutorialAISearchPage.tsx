import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import fullImg from "/tutorial/08_ai_search/full.png";

type TocItem = { id: string; label: string };
type OutletCtx = { setToc: (items: TocItem[]) => void };

export default function TutorialAISearchPage() {
  const { setToc } = useOutletContext<OutletCtx>();

  useEffect(() => {
    setToc([
      { id: "overview", label: "개요" },
    ]);
    return () => setToc([]);
  }, [setToc]);

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI 검색 페이지 기능 설명</h1>
        <p className="mt-1 text-sm text-gray-600">
          자연어 기반 질문을 입력하면 학과, 강의, 시설, 장학, 학교 정보 등 대학 생활과 관련한 내용을
          AI가 분석하여 답변하는 페이지입니다.
        </p>
      </header>

      <section className="space-y-8">
        {/* 개요 */}
        <Article id="overview" title="개요">
          <Figure src={fullImg} alt="AI 검색 페이지 전체 화면" tall />
          <Ul className="mt-4">
            <Li title="역할">
              사용자가 자연어로 질문하면 AI가 의미 분석을 하고, 관련 문서를 함께 제공하여 답변 품질을
              높입니다.
            </Li>
            <Li title="구성">
              상단에 메인 아이콘·문구, 중앙에 AI 검색창, 아래에는 추천 질문 카드와 기능 소개 블록으로
              배치됩니다.
            </Li>
            <Li title="라우팅 예시">
              <code>/search/ai</code> 로 접근합니다.
            </Li>
            <Li title="검색창 디자인">
              큰 둥근 입력창 안에 자연어를 입력하며, 우측의 종이비행기 아이콘 버튼으로 검색을 실행합니다.
            </Li>
            <Li title="입력 방식">
              자연어 질문을 그대로 입력할 수 있습니다. 예: “학생회관 24시간 이용 가능한가요?”
            </Li>
            <Li title="동작">
              AI 분석 후 답변 페이지로 이동하며, 검색 결과에는 요약, 결론, 참고 문서 목록 등을 함께 제공합니다.
            </Li>
            <Li title="의도 파악">
              질문 예시 카드(학과, 시설, 학교 등)를 보여줘 사용자가 어떤 질문을 할 수 있는지 안내합니다.
            </Li>
            <Li title="카드 구성">
              좌측에는 카테고리 아이콘, 우측에는 실제 예시 질문 텍스트가 노출됩니다.
            </Li>
            <Li title="동작">
              추천 질문을 클릭하면 해당 질문을 바로 AI 검색창에 채워 넣을 수 있게 구현할 수 있습니다.
            </Li>
          </Ul>
        </Article>
      </section>
    </main>
  );
}

/* 공용 컴포넌트 */
function Article({
  id,
  title,
  children,
}: React.PropsWithChildren<{ id: string; title: string }>) {
  return (
    <article
      id={id}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
    >
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
      <img
        src={src}
        alt={alt}
        className={`${base} ${h}`}
        draggable={false}
      />
    </figure>
  );
}

function Ul({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return <ul className={`space-y-2 ${className}`}>{children}</ul>;
}

function Li({
  title,
  children,
}: React.PropsWithChildren<{ title: string }>) {
  return (
    <li className="text-sm leading-6">
      <span className="font-medium text-gray-900">{title}. </span>
      <span className="text-gray-700">{children}</span>
    </li>
  );
}
