import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import fullImg from "/tutorial/09_my_page/full.png";

type TocItem = { id: string; label: string };
type OutletCtx = { setToc: (items: TocItem[]) => void };

export default function TutorialMyPage() {
  const { setToc } = useOutletContext<OutletCtx>();

  useEffect(() => {
    setToc([
      { id: "overview", label: "개요" },
    ]);
    return () => setToc([]);
  }, [setToc]);

  return (
    <main className="mx-auto max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 정보 페이지 기능 설명</h1>
      </header>

      <section className="space-y-8">
        <article className="space-y-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <p className="text-sm text-gray-700">
              계정 정보를 확인·수정하고, 즐겨찾기 문서 알림과 권한을 한눈에 볼 수 있는 페이지입니다.
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>프로필 정보(닉네임 등) 확인 및 닉네임, 비밀번호 수정 기능</li>
              <li>즐겨찾기한 문서가 수정되었을 경우에 이메일로 수신받는 기능 토글</li>
              <li>내가 작성/수정한 문서, 참여한 토론 내역 목록</li>
              <li>즐겨찾기한 학교·문서로 이동하는 버튼</li>
            </ul>
          </div>
        </article>

        {/* 개요 */}
        <Article id="overview" title="내 정보 페이지">
          <Figure src={fullImg} alt="내 정보 페이지 전체 화면" tall />
          <Ul className="mt-4">
            <Li title="역할">
              로그인한 사용자가 자신의 계정 정보를 관리하는 화면입니다. 닉네임, 이메일, 비밀번호,
              알림 수신 여부, 권한을 확인할 수 있습니다.
            </Li>
            <Li title="수정">
              처음 진입했을 경우에는 정보를 수정할 수 없으며, 중앙 하단 수정 버튼을 통해
              닉네임, 비밀번호, 알림 수신 여부를 수정할 수 있습니다.
            </Li>
            <Li title="닉네임">
              현재 사용 중인 닉네임을 표시하며, 우측 &quot;수정&quot; 링크를 눌러 변경 모달을
              열 수 있습니다.
            </Li>
            <Li title="이메일">
              계정에 연결된 이메일 주소를 보여줍니다. 로그인 ID와 동일합니다.
            </Li>
            <Li title="비밀번호">
              실제 비밀번호 대신 &quot;비밀번호 변경&quot; 링크만 제공하여, 별도의 모달에서
              현재 비밀번호 확인 후 새 비밀번호를 설정하도록 합니다.
            </Li>
            <Li title="체크박스">
              &quot;즐겨찾기 문서 수정 시 이메일로 알림&quot; 옵션을 체크할 수 있는 체크박스를 제공합니다.
              체크 시 즐겨찾기한 문서가 수정되면 등록된 이메일로 알림을 전송하고, 해제 시 더 이상
              발송하지 않습니다.
            </Li>
            <Li title="권한 표시">
              마지막 줄에서 현재 계정의 권한을 보여줍니다. 사용자 / 관리자로 나뉩니다.
            </Li>
            <Li title="저장 버튼">
              페이지 하단 중앙의 &quot;저장&quot; 버튼을 눌러 닉네임 변경, 알림 설정 등 수정된 내용을
              한 번에 반영합니다.
            </Li>
          </Ul>
        </Article>
      </section>
    </main>
  );
}

/* 공용 컴포넌트 (다른 Tutorial 페이지와 동일 형식) */
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
      <span className="font-medium text-gray-900">{title}: </span>
      <span className="text-gray-700">{children}</span>
    </li>
  );
}
