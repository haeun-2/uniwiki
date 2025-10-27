// src/pages/SignupCompletePage.tsx

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function SignupCompletePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const email = searchParams.get("email") || "";
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 닉네임 유효성 검사
  const isNicknameValid = nickname.length >= 2;
  
  // 비밀번호 유효성 검사 (영문, 숫자, 특수문자 포함)
  const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password);
  
  // 비밀번호 확인
  const isPasswordMatch = password === passwordConfirm && passwordConfirm !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNicknameValid) {
      alert("닉네임은 2자 이상이어야 합니다.");
      return;
    }

    if (!isPasswordValid) {
      alert("비밀번호는 영문 대/소문자, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
      return;
    }

    if (!isPasswordMatch) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      // API 호출: 회원가입 완료
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          nickname,
          password,
        }),
      });

      if (response.ok) {
        alert("회원가입이 완료되었습니다!");
        navigate("/login");
      } else {
        const error = await response.json();
        alert(error.message || "회원가입 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Signup completion error:", error);
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
          {/* 이메일 (읽기 전용) */}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-600"
            />
          </div>

          {/* 사용자 닉네임 */}
          <div>
            <label htmlFor="nickname" className="mb-2 block text-sm font-medium text-gray-700">
              사용자 닉네임
            </label>
            <input
              id="nickname"
              type="text"
              placeholder="닉네임을 입력해주세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {nickname && (
              <p className={`mt-1 text-xs ${isNicknameValid ? "text-green-600" : "text-red-600"}`}>
                {isNicknameValid ? "사용 가능한 닉네임입니다." : "닉네임은 2자 이상이어야 합니다."}
              </p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {password && (
              <p className={`mt-1 text-xs ${isPasswordValid ? "text-green-600" : "text-orange-600"}`}>
                {isPasswordValid 
                  ? "안전한 비밀번호입니다." 
                  : "영문 대/소문자, 숫자, 특수문자(~!@#$%^&*)를 포함하여 8자리 이상"}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="passwordConfirm" className="mb-2 block text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type="password"
              placeholder="••••••••••"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {passwordConfirm && (
              <p className={`mt-1 text-xs ${isPasswordMatch ? "text-green-600" : "text-red-600"}`}>
                {isPasswordMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isNicknameValid || !isPasswordValid || !isPasswordMatch}
            className="w-full rounded-lg bg-[#5b7c99] px-4 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
          >
            {isLoading ? "처리 중..." : "가입"}
          </button>
        </form>
      </div>
    </div>
  );
}