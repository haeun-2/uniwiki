import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import fullImg from "/tutorial/03_univ_main/full.png";
import univInfoImg from "/tutorial/03_univ_main/univ_info.png";
import categoryImg from "/tutorial/03_univ_main/category.png";
import popularImg from "/tutorial/03_univ_main/popular.png";
import recentEditImg from "/tutorial/03_univ_main/recent_edit.png";
import recentDiscussionImg from "/tutorial/03_univ_main/recent_discussion.png";

type TocItem = { id: string; label: string };
type OutletCtx = { setToc: (items: TocItem[]) => void };

export default function TutorialUnivMainPage() {
  const { setToc } = useOutletContext<OutletCtx>();

  useEffect(() => {
    setToc([
      { id: "overview", label: "개요" },
      { id: "univ-info", label: "학교 정보 헤더" },
      { id: "category", label: "학교 문서 카테고리" },
      { id: "popular", label: "인기 문서" },
      { id: "recent-docs", label: "최근 수정된 문서" },
      { id: "recent-discussion", label: "최근 토론" },
    ]);
    return () => setToc([]);
  }, [setToc]);

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">학교 메인 페이지 기능 설명</h1>
      </header>

      <section className="space-y-8">
        <article className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <p className="text-sm text-gray-700">
              특정 학교를 선택했을 때 보여지는 메인 페이지를 설명합니다. 학교 정보,
              카테고리, 인기 문서, 최근 수정된 문서, 최근 토론 블록이 있습니다.
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>학교 기본 정보(로고, 이름) 표시, 즐겨찾기, 새 문서 만들기</li>
              <li>카테고리를 선택하여 해당 카테고리의 문서를 볼 수 있는 기능</li>
              <li>조회수 기반의 인기 있는 문서 추천</li>
              <li>해당 학교에서 최근 수정된 문서와 최근 토론으로 바로 가는 메뉴</li>
            </ul>
          </div>
        </article>

        {/* 개요 */}
        <Article id="overview" title="개요">
          <Figure src={fullImg} alt="학교 메인 페이지 전체 화면" tall />
          <Ul className="mt-4">
            <Li title="역할">
              사용자가 특정 학교에 대한 정보를 탐색하는 진입점입니다. 학교 관련 문서, 최근 활동, 토론
              상황을 한눈에 볼 수 있습니다.
            </Li>
            <Li title="구성">
              상단 학교 정보 카드, 중앙의 카테고리 및 인기 문서, 우측의 최근 수정된 문서와 최근 토론
              사이드 카드로 구성됩니다.
            </Li>
          </Ul>
        </Article>

        {/* 학교 정보 헤더 */}
        <Article id="univ-info" title="학교 정보 헤더">
          <Figure src={univInfoImg} alt="학교 기본 정보 헤더 영역" />
          <Ul className="mt-4">
            <Li title="학교 로고 및 이름">
              좌측에 학교 로고와 학교명이 표시됩니다.
            </Li>
            <Li title="즐겨찾기">
              학교명 우측의 별 아이콘을 클릭해 해당 학교를 즐겨찾기에 추가하거나 제거할 수 있습니다.
            </Li>
            <Li title="새 문서 만들기">
              우측 버튼을 통해 현재 학교를 기준으로 새 위키 문서를 작성하는 페이지로 이동합니다.
            </Li>
          </Ul>
        </Article>

        {/* 카테고리 */}
        <Article id="category" title="학교 문서 카테고리">
          <Figure src={categoryImg} alt="학교 문서 카테고리 카드 그리드" />
          <Ul className="mt-4">
            <Li title="카테고리 종류">
              학교, 학과, 강의, 시설, 행사, 기타 등 기본 카테고리가 카드 형태로 제공됩니다.
            </Li>
            <Li title="동작">
              각 카테고리를 클릭하면 해당 카테고리의 문서 목록 페이지로 이동하며,
              전체보기 버튼을 통해 모든 문서를 확인할 수 있습니다.
            </Li>
          </Ul>
        </Article>

        {/* 인기 문서 */}
        <Article id="popular" title="인기 문서">
          <Figure src={popularImg} alt="인기 문서 영역" />
          <Ul className="mt-4">
            <Li title="내용">
              선택한 학교에서 24시간 내 조회수가 많은 문서를 보여줍니다.
            </Li>
            <Li title="정렬 기준">
              기본적으로 조회수 내림차순으로 정렬하며, 매 시간마다 조회수를 집계하여 표출합니다.
            </Li>
            <Li title="동작">
              제목을 클릭하면 해당 문서 상세 페이지로 이동합니다.
            </Li>
          </Ul>
        </Article>

        {/* 최근 수정된 문서 */}
        <Article id="recent-docs" title="최근 수정된 문서">
          <Figure src={recentEditImg} alt="최근 수정된 문서 사이드 카드" small />
          <Ul className="mt-4">
            <Li title="역할">
              해당 학교에서 최근에 수정된 문서들을 시간 순으로 보여주는 사이드 카드입니다.
            </Li>
            <Li title="동작">
              목록의 각 항목을 클릭하면 해당 문서 상세 페이지로 이동합니다.
            </Li>
          </Ul>
        </Article>

        {/* 최근 토론 */}
        <Article id="recent-discussion" title="최근 토론">
          <Figure src={recentDiscussionImg} alt="최근 토론 사이드 카드" small />
          <Ul className="mt-4">
            <Li title="역할">
              현재 학교에서 진행 중이거나 최근에 활동이 있었던 토론을 한 줄로 요약해 보여줍니다.
            </Li>
            <Li title="표시 내용">
              두 줄로 나뉘어 표시되며, 윗줄에는 토론 제목이, 아랫줄에는 해당 문서 제목이 표시됩니다.
            </Li>
            <Li title="동작">
              항목을 클릭하면 해당 문서의 토론 상세 페이지로 이동합니다.
            </Li>
          </Ul>
        </Article>
      </section>
    </main>
  );
}

/** 공용 컴포넌트 (TutorialMenuBarPage 와 동일 형식) */
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
