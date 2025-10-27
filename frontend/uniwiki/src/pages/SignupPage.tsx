// src/pages/SignupPage.tsx

import { useState } from "react";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed) {
      alert("개인정보 처리방침 및 이용약관에 동의해주세요.");
      return;
    }

    setIsLoading(true);

// 백엔드 서버 없이 테스트: 바로 다음 페이지로 이동
    setTimeout(() => {
      setIsLoading(false);
      alert("인증 메일이 발송되었습니다. (테스트 모드)");
      navigate(`/signup/complete?email=${encodeURIComponent(email)}`);
    }, 500);

    try {
      // API 호출: 이메일 인증 요청
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // 이메일 인증 메일 발송 성공
        alert("인증 메일이 발송되었습니다. 이메일을 확인해주세요.");
        // 실제로는 이메일의 인증 링크를 클릭하면 토큰과 함께 다음 페이지로 이동
        // 여기서는 테스트를 위해 바로 이동
        navigate(`/signup/complete?email=${encodeURIComponent(email)}`);
      } else {
        const error = await response.json();
        alert(error.message || "회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-3xl font-semibold text-gray-900">계정 만들기</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              이메일
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="이메일을 입력해주세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-10 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              학교 이메일(@univ.ac.kr)을 인증 시 학교 우위 소속 권리이 부여됩니다.
            </p>
          </div>

          <div className="flex items-start">
            <input
              id="agree"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="agree" className="ml-2 text-sm text-gray-700">
              개인정보 처리방침 및 이용약관에 동의합니다
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-[#5b7c99] px-4 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
          >
            {isLoading ? "처리 중..." : "인증하기"}
          </button>
        </form>
      </div>
    </div>
  );
}