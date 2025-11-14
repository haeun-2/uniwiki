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
              <Link to="/tutorial" className="hover:underline" onClick={scrollToTop}>
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
            <p className="text-xs mb-3">
              유니위키의 모든 저작물은
              <Link
                to="https://creativecommons.org/licenses/by-nc-sa/2.0/kr/"
                target="_blank"
                className="text-xs hover:underline ms-1 text-uniwikicolor"
              >
              CC BY-NC-SA 2.0 KR
              </Link>
              를 따릅니다.
            </p>
            <p className="text-xs mb-1">모든 문서의 저작권은 문서의 기여자에게 있으며,</p>
            <p className="text-xs mb-1">각 기여자는 기여하신 부분의 저작권만을 가집니다.</p>
        </div>
      </div>
    </footer>
  );
}