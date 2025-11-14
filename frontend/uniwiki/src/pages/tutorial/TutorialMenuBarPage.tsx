import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import fullImg from "/tutorial/01_menu_bar/full.png";
import logoImg from "/tutorial/01_menu_bar/logo.png";
import personalImg from "/tutorial/01_menu_bar/personal.png";
import personalMenuImg from "/tutorial/01_menu_bar/personal_normal.png";
import searchImg from "/tutorial/01_menu_bar/search.png";
import searchAiImg from "/tutorial/01_menu_bar/search_ai.png";

type TocItem = { id: string; label: string };
type OutletCtx = { setToc: (items: TocItem[]) => void };

export default function TutorialMenuBarPage() {
  const { setToc } = useOutletContext<OutletCtx>();

  useEffect(() => {
    setToc([
      { id: "overview", label: "개요" },
      { id: "full", label: "상단 바(전체)" },
      { id: "logo", label: "로고" },
      { id: "search", label: "검색" },
      { id: "search-ai", label: "AI 검색" },
      { id: "personal", label: "개인 아이콘" },
      { id: "personal-menu", label: "개인 메뉴(로그인 상태)" },
    ]);
    return () => setToc([]); // 페이지 이탈 시 정리
  }, [setToc]);

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">메뉴 바 기능 설명</h1>
        <p className="text-sm text-gray-600 mt-1">
          상단 바의 구성 요소를 이미지와 함께 설명합니다. 각 섹션은 동작, 상태, 연동 포인트를 포함합니다.
        </p>
      </header>

      <section className="space-y-8">
        <Article id="overview" title="개요">
          <p className="text-sm text-gray-700">
            메뉴 바는 좌측 로고, 중앙 검색, 우측 개인 메뉴로 구성되며 일반 검색과 AI 검색을 지원합니다.
          </p>
        </Article>

        <Article id="full" title="상단 바(전체)">
          <Figure src={fullImg} alt="전체 상단 바" />
          <Ul className="mt-4">
            <Li title="위치">모든 페이지 최상단에 고정</Li>
            <Li title="역할">전역 내비게이션, 검색 진입, 사용자 메뉴 진입 제공</Li>
            <Li title="스타일">브랜드 컬러 배경, 검색 영역 라운드</Li>
          </Ul>
        </Article>

        <Article id="logo" title="로고">
          <Figure src={logoImg} alt="유니위키 로고" small />
          <Ul className="mt-4">
            <Li title="동작">클릭 시 홈페이지로 이동</Li>
            <Li title="접근성">키보드 탭 및 Enter 이동</Li>
          </Ul>
        </Article>

        <Article id="search" title="검색">
          <Figure src={searchImg} alt="검색창" tall />
          <Ul className="mt-4">
            <Li title="역할">문서명·본문 통합 검색</Li>
            <Li title="자동완성">문서명 자동완성(추후 연동)</Li>
            <Li title="라우팅 예시">/search?q=...</Li>
          </Ul>
        </Article>

        <Article id="search-ai" title="AI 검색">
          <Figure src={searchAiImg} alt="AI 검색창" tall />
          <Ul className="mt-4">
            <Li title="역할">자연어 기반 의미 검색</Li>
            <Li title="결과">요약·근거 문서 링크 제공(추후 연동)</Li>
            <Li title="라우팅 예시">/search/ai?q=...</Li>
          </Ul>
        </Article>

        <Article id="personal" title="개인 아이콘">
          <Figure src={personalImg} alt="개인 아이콘" small />
          <Ul className="mt-4">
            <Li title="비로그인">클릭 시 로그인 버튼 표시</Li>
            <Li title="로그인">클릭 시 개인 메뉴 오픈</Li>
          </Ul>
        </Article>

        <Article id="personal-menu" title="개인 메뉴(로그인 상태)">
          <Figure src={personalMenuImg} alt="개인 메뉴" />
          <Ul className="mt-4">
            <Li title="구성">내 정보 / 기여 문서 / 참여 토론 / 즐겨찾기 / 로그아웃</Li>
            <Li title="로그아웃">토큰 및 저장 정보 제거 후 새로고침</Li>
          </Ul>
        </Article>
      </section>
    </main>
  );
}

/** 공용 컴포넌트 */
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
