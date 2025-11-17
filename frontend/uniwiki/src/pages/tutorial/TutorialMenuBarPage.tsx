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
      </header>

      <section className="space-y-8">

        <article className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <p className="text-sm text-gray-700">
              메뉴 바 튜토리얼 페이지는 유니위키 상단 공통 네비게이션의 구성과
              동작을 설명합니다.
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>로고를 클릭했을 때 메인 페이지로 이동하는 동작</li>
              <li>검색, 로그인 / 로그아웃, 내 정보 등 주요 진입점</li>
            </ul>
          </div>
        </article>

        <Article id="full" title="개요">
          <Figure src={fullImg} alt="전체 상단 바" />
          <Ul className="mt-4">
            <Li title="위치">모든 페이지 최상단에 고정되어 있습니다.</Li>
            <Li title="역할">전역 내비게이션, 검색, 사용자 메뉴를 지원합니다.</Li>
          </Ul>
        </Article>

        <Article id="logo" title="로고">
          <Figure src={logoImg} alt="유니위키 로고" small />
          <Ul className="mt-4">
            <Li title="위치">메뉴 바 가장 왼쪽에 위치합니다.</Li>
            <Li title="역할">클릭 시 유니위키 메인 페이지로 이동합니다.</Li>
          </Ul>
        </Article>

        <Article id="search" title="검색">
          <Figure src={searchImg} alt="검색창" tall />
          <Ul className="mt-4">
            <Li title="위치">메뉴바 중단에 위치합니다.</Li>
            <Li title="역할">문서명 또는 본문 내용을 통합하여 검색할 수 있습니다.</Li>
          </Ul>
        </Article>

        <Article id="search-ai" title="AI 검색">
          <Figure src={searchAiImg} alt="AI 검색창" tall />
          <Ul className="mt-4">
            <Li title="위치">검색창 우측에 위치합니다.</Li>
            <Li title="역할">AI 검색 페이지로 이동합니다. 자연어 기반의 의미 검색을 지원합니다.</Li>
            <Li title="검색 결과">내용을 요약하여 제공하며, 근거 문서 링크를 제공합니다.</Li>
          </Ul>
        </Article>

        <Article id="personal" title="개인 아이콘">
          <Figure src={personalImg} alt="개인 아이콘" small />
          <Ul className="mt-4">
            <Li title="위치">메뉴 바 가장 우측에 존재합니다.</Li>
            <Li title="비로그인 시">클릭 시 로그인 버튼이 드롭다운되어 나타납니다.</Li>
            <Li title="로그인 시">클릭 시 개인 메뉴가 드롭다운되어 나타납니다.</Li>
          </Ul>
        </Article>

        <Article id="personal-menu" title="개인 메뉴(로그인 상태)">
          <Figure src={personalMenuImg} alt="개인 메뉴" />
          <Ul className="mt-4">
            <Li title="위치">로그인 한 후 개인 아이콘 버튼을 누르면 드롭다운되어 나타납니다.</Li>
            <Li title="구성">내 정보 / 기여 문서 목록 / 참여 토론 목록 / 즐겨찾기 / 로그아웃 으로 구성됩니다.</Li>
            <Li title="내 정보">내 정보 페이지로 이동합니다.</Li>
            <Li title="기여 문서 목록">기여 문서 목록 페이지로 이동합니다.</Li>
            <Li title="참여 토론 목록">참여 토론 목록 페이지로 이동합니다.</Li>
            <Li title="즐겨찾기">즐겨찾기 페이지로 이동합니다.</Li>
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
      <span className="font-medium text-gray-900">{title}: </span>
      <span className="text-gray-700">{children}</span>
    </li>
  );
}
