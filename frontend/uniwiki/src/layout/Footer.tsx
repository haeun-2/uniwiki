import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-10 text-sm text-gray-600">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
        <div>
          <div className="mb-2 font-semibold">UniWiki 소개</div>
          <ul className="space-y-1">
            <li><a className="hover:underline">About</a></li>
            <li><a className="hover:underline">이용목적</a></li>
            <li><a className="hover:underline">가이드</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-semibold">정책</div>
          <ul className="space-y-1">
            <li><a className="hover:underline">이용약관</a></li>
            <li><a className="hover:underline">저작권/라이선스</a></li>
            <li><a className="hover:underline">개인정보 처리방침</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-semibold">지원</div>
          <ul className="space-y-1">
            <li><a className="hover:underline">문의하기</a></li>
            <li><a className="hover:underline">도움말</a></li>
            <li><a className="hover:underline">Q&A</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-semibold">고지</div>
          <p className="text-xs text-gray-500">© 2025 UniWiki. 일부 콘텐츠는 CC BY-SA 기반일 수 있습니다.</p>
        </div>
      </div>
    </footer>
  );
}