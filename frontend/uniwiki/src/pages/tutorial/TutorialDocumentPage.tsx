import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import fullImg from "/tutorial/04_document/full.png";
import menuImg from "/tutorial/04_document/document_menu.png";

type TocItem = { id: string; label: string };
type OutletCtx = { setToc: (items: TocItem[]) => void };

export default function TutorialDocumentPage() {
  const { setToc } = useOutletContext<OutletCtx>();

  useEffect(() => {
    setToc([
      { id: "overview", label: "개요" },
      { id: "actions", label: "상단 메뉴" },
    ]);
    return () => setToc([]);
  }, [setToc]);

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">문서 열람 페이지 기능 설명</h1>
        <p className="mt-1 text-sm text-gray-600">
          특정 문서를 열람할 때 사용하는 페이지입니다. 상단의 문서 정보 영역, 즐겨찾기/편집/토론/역사
          메뉴, 본문 영역의 구조로 이루어져 있습니다.
        </p>
      </header>

      <section className="space-y-8">
        {/* 개요 */}
        <Article id="overview" title="개요">
          <Figure src={fullImg} alt="문서 열람 페이지 전체 화면" tall />
          <Ul className="mt-4">
            <Li title="역할">
              학교, 학과, 강의, 시설 등 모든 위키 문서를 읽는 기본 화면입니다. 대부분의 사용자가 가장
              자주 보게 되는 페이지입니다.
            </Li>
            <Li title="구성">
              상단의 문서 제목·경로·최근 수정 시간, 우측의 최근 수정된 문서/최근 토론 사이드 카드, 중앙의
              문서 본문으로 구성됩니다.
            </Li>
            <Li title="라우팅 예시">
              <code>/univ/:universityName/docs/:documentTitle</code> 형식의 경로에 매핑됩니다.
            </Li>
          </Ul>
        </Article>

        {/* 상단 메뉴 */}
        <Article id="actions" title="상단 메뉴">
          <Figure src={menuImg} alt="문서 상단 메뉴" small />
          <Ul className="mt-4">
            <Li title="즐겨찾기">
              별 아이콘을 클릭하면 해당 문서를 즐겨찾기에 추가하거나 제거합니다. 메인 페이지와 내 정보
              화면의 즐겨찾기 목록과 연동됩니다.
            </Li>
            <Li title="편집">
              클릭 시 문서 편집 페이지로 이동합니다. 예: <code>/univ/:universityName/docs/:documentTitle/edit</code>
            </Li>
            <Li title="토론">
              문서에 연결된 토론 목록/토론 상세 페이지로 이동합니다. 문서 내용 변경에 대한 의견을
              주고받는 공간입니다.
            </Li>
            <Li title="역사">
              문서의 수정 이력을 시간 순으로 확인할 수 있는 페이지로 이동합니다. 이전 버전과의 비교(diff)
              및 복원 기능과 연동됩니다.
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
