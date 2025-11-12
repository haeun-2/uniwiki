import React from "react";
import { Link } from "react-router-dom"

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  return (
    <footer 
    id="site-footer"
    className="border-t border-gray-200 bg-gray-50 py-10 text-sm text-gray-600">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-6 px-4 md:grid-cols-3">
        <div>
          <div className="mb-2 font-semibold">UniWiki 소개</div>
          <ul className="space-y-1">
            <li>
              <Link to="/welcome" className="hover:underline" onClick={scrollToTop}>
                UniWiki란?
              </Link>
            </li>
            <li>
              <Link to="" className="hover:underline" onClick={scrollToTop}>
                기능 설명
              </Link>
            </li>
            <li>
              <Link to="/guide" className="hover:underline" onClick={scrollToTop}>
                문서 작성법
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-semibold">정책</div>
          <ul className="space-y-1">
            <li>
              <Link to="/rule" className="hover:underline" onClick={scrollToTop}>
                운영정책
              </Link>
            </li>
            <li>
              <Link to="/rule#copyright" className="hover:underline">
                저작권
              </Link>
            </li>
            <li>
              <Link to="/rule#privacy" className="hover:underline">
                개인정보 처리방침
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-2 font-semibold">고지</div>
            <Link
              to=""
              className="text-xs hover:underline"
            >
              © 2025 UniWiki. 일부 콘텐츠는 CC BY-SA 기반일 수 있습니다.
            </Link>
        </div>
      </div>
    </footer>
  );
}