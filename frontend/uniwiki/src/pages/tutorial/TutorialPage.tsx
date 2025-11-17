import React from "react";

export default function TutorialPage() {
  return (
    <section className="mx-auto max-w-6xl space-y-12">
      {/* 상단 인트로 */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          유니위키 기능 설명
        </h1>
        <p className="text-base text-gray-700 leading-relaxed">
          이 페이지는 유니위키 튜토리얼에 포함된 각 화면의 역할과 흐름을
          한눈에 정리한 설명 페이지입니다. <br />
          실제 튜토리얼 페이지에서 사용되는 화면 캡처와 함께 읽으시면, 
          서비스 전체 구조를 빠르게 이해하는 데 도움이 됩니다.
        </p>
        <p className="text-sm text-gray-500">
          왼쪽 튜토리얼 메뉴에서 각 페이지를 선택하여 실제 화면 예시를 함께
          확인하실 수 있습니다.
        </p>
      </header>

      {/* 튜토리얼 전체 흐름 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          튜토리얼 전체 흐름
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            튜토리얼은 유니위키를 처음 접하는 사용자가 실제 사용 흐름에 맞춰
            화면을 따라가며 익힐 수 있도록 구성되어 있습니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>메뉴바와 AI 검색, 내 정보 페이지에서 제공하는 부가 기능을 확인합니다.</li>
            <li>메인 페이지에서 어떤 정보를 볼 수 있는지 이해합니다.</li>
            <li>학교를 선택해 학교별 메인 페이지로 이동하는 과정을 익힙니다.</li>
            <li>문서를 열람하고, 토론과 역사(버전)를 확인하는 방법을 봅니다.</li>
          </ul>
          <p className="text-sm text-gray-700">
            각 튜토리얼 페이지는 실제 서비스 화면을 기반으로 하며, 중요한 버튼,
            카드, 목록의 위치와 역할을 중심으로 설명합니다.
          </p>
        </div>
      </section>

      {/* 메뉴 바 / 상단 네비게이션 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          메뉴 바 튜토리얼
        </h2>
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
      </section>

      {/* AI 검색 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          AI 검색 튜토리얼
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-sm text-gray-700">
              AI 검색 튜토리얼 페이지는 자연어로 질문을 입력해 문서를 찾는
              화면을 설명합니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>질문 입력창과 검색 버튼, 키워드 예시 안내</li>
              <li>AI가 추천한 문서 리스트와 요약 답변 영역</li>
              <li>검색 결과 문서로 이동하는 링크 동작</li>
          </ul>
        </div>
      </section>

      {/* 내 정보 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          내 정보 튜토리얼
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-sm text-gray-700">
              내 정보 튜토리얼 페이지는 로그인한 사용자의 활동 내역과 계정
              정보를 모아서 보여주는 화면을 설명합니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>프로필 정보(닉네임 등) 확인 및 닉네임, 비밀번호 수정 기능</li>
              <li>즐겨찾기한 문서가 수정되었을 경우에 이메일로 수신받는 기능 토글</li>
              <li>내가 작성/수정한 문서, 참여한 토론 내역 목록</li>
              <li>즐겨찾기한 학교·문서로 이동하는 버튼</li>
          </ul>
        </div>
      </section>

      {/* 전체 메인 페이지 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          전체 메인 페이지 튜토리얼
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-sm text-gray-700">
            전체 메인 페이지 튜토리얼은 서비스에 처음 접속했을 때 보이는
            화면을 설명합니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>인기 많은 학교 소개 블록</li>
            <li>내 학교 · 즐겨찾기 블록 </li>
            <li>학교 별 위키 탐색 블록</li>
          </ul>
        </div>
      </section>

      {/* 학교 메인 페이지 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          학교 메인 페이지 튜토리얼
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-sm text-gray-700">
            학교 메인 페이지 튜토리얼은 특정 대학교를 선택한 뒤 보게 되는
            전용 메인 화면을 설명합니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>학교 기본 정보(로고, 이름) 표시, 즐겨찾기, 새 문서 만들기</li>
            <li>카테고리를 선택하여 해당 카테고리의 문서를 볼 수 있는 기능</li>
            <li>조회수 기반의 인기 있는 문서 추천</li>
            <li>해당 학교에서 최근 수정된 문서와 최근 토론으로 바로 가는 메뉴</li>
          </ul>
        </div>
      </section>

      {/* 문서 열람 페이지 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          문서 열람 튜토리얼
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-sm text-gray-700">
            문서 열람 튜토리얼 페이지는 실제 위키 문서를 읽을 때 보게 되는
            화면 구성을 보여줍니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>문서 제목, 학교/카테고리 정보, 수정일 표시</li>
            <li>문서 즐겨찾기 버튼, 편집, 토론, 역사(버전)으로 이동하는 버튼</li>
            <li>Markdowm 기반 본문 표시 방식</li>
          </ul>
        </div>
      </section>

      {/* 토론 페이지 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          토론 튜토리얼
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-sm text-gray-700">
            토론 튜토리얼 페이지는 특정 문서를 둘러싼 의견 교환 화면을
            설명합니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>해당 문서에 어떤 토론이 진행 중인지 표시</li>
            <li>토론 제목과 내용으로 토론을 시작하는 기능</li>
          </ul>
        </div>
      </section>

      {/* 진행 중인 토론 페이지 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          진행 중인 토론 튜토리얼
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-sm text-gray-700">
            진행 중인 토론 튜토리얼 페이지에서는 활성화된 토론의 댓글을
            보는 화면을 다룹니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>해당 토론의 진행 상황을 볼 수 있는 버튼(열림, 종료)</li>
            <li>토론에 달린 댓글을 표시해주는 부분</li>
            <li>댓글이나 댓글 작성자를 눌러 신고할 수 있는 기능</li>
            <li>해당 토론에 의견을 달 수 있는 기능</li>
          </ul>
        </div>
      </section>

      {/* 문서 역사 페이지 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          문서 역사 튜토리얼
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-sm text-gray-700">
            문서 역사 튜토리얼 페이지는 문서의 수정 이력을 시간 순으로 확인하는
            화면을 설명합니다.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>문서 수정 이력을 문서 번호로 검색할 수 있는 기능</li>
            <li>버전별 수정자, 수정일시, 요약 메시지 표시</li>
            <li>두 버전을 선택해 비교(diff)를 보는 기능</li>
            <li>이전 버전으로 복원할 수 있는 기능</li>
          </ul>
        </div>
      </section>

      {/* 마무리 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">
          튜토리얼 활용 방법
        </h2>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-2">
          <p className="text-sm text-gray-700">
            이 설명 페이지를 먼저 읽은 뒤, 왼쪽 튜토리얼 메뉴에서 각 화면을
            하나씩 눌러 보시면 유니위키의 주요 기능을 빠르게 익힐 수 있습니다.
          </p>
          <p className="text-sm text-gray-700">
            실제 서비스 화면과 동일한 흐름으로 구성했기 때문에, 튜토리얼을
            따라가며 바로 문서 열람·편집·토론 기능을 테스트해 보셔도 좋습니다.
          </p>
        </div>
      </section>
    </section>
  );
}
