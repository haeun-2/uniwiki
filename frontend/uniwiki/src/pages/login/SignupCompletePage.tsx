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
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(false);

  // 닉네임 유효성 검사
  const isNicknameValid = nickname.length >= 2;
  
  // 비밀번호 유효성 검사 (영문, 숫자, 특수문자 포함)
  const isPasswordValid = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(password);
  
  // 비밀번호 확인
  const isPasswordMatch = password === passwordConfirm && passwordConfirm !== "";

  // 닉네임 중복 검사
  const handleCheckNickname = async () => {
    if (!isNicknameValid) {
      alert("닉네임은 2자 이상이어야 합니다.");
      return;
    }

    setIsCheckingNickname(true);

    try {
      const response = await fetch(
        `https://k13d104.p.ssafy.io/api/v1/auth/nickname/check?nickname=${encodeURIComponent(nickname)}`,
        {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNicknameChecked(true);
        setNicknameAvailable(data.available);
        
        if (data.available) {
          alert("사용 가능한 닉네임입니다!");
        } else {
          alert("이미 사용 중인 닉네임입니다.");
        }
      } else {
        alert("닉네임 확인 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Nickname check error:", error);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setIsCheckingNickname(false);
    }
  };

  // 닉네임 변경 시 중복 검사 초기화
  const handleNicknameChange = (value: string) => {
    setNickname(value);
    setNicknameChecked(false);
    setNicknameAvailable(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNicknameValid) {
      alert("닉네임은 2자 이상이어야 합니다.");
      return;
    }

    if (!nicknameChecked || !nicknameAvailable) {
      alert("닉네임 중복 확인을 해주세요.");
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
      const response = await fetch("https://k13d104.p.ssafy.io/api/v1/auth/signup", {
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
        navigate("/");
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
            <div className="flex gap-2">
              <input
                id="nickname"
                type="text"
                placeholder="닉네임을 입력해주세요"
                value={nickname}
                onChange={(e) => handleNicknameChange(e.target.value)}
                required
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={!isNicknameValid || isCheckingNickname}
                className="rounded-lg bg-gray-600 px-4 py-2.5 font-medium text-white hover:bg-gray-700 disabled:bg-gray-400 whitespace-nowrap"
              >
                {isCheckingNickname ? "확인 중..." : "중복 확인"}
              </button>
            </div>
            {nickname && !nicknameChecked && (
              <p className={`mt-1 text-xs ${isNicknameValid ? "text-gray-600" : "text-red-600"}`}>
                {isNicknameValid ? "닉네임 중복 확인이 필요합니다." : "닉네임은 2자 이상이어야 합니다."}
              </p>
            )}
            {nicknameChecked && (
              <p className={`mt-1 text-xs ${nicknameAvailable ? "text-green-600" : "text-red-600"}`}>
                {nicknameAvailable ? "✓ 사용 가능한 닉네임입니다." : "✗ 이미 사용 중인 닉네임입니다."}
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
            disabled={isLoading || !nicknameChecked || !nicknameAvailable || !isPasswordValid || !isPasswordMatch}
            className="w-full rounded-lg bg-[#5b7c99] px-4 py-2.5 font-medium text-white hover:bg-[#4a6578] disabled:bg-gray-400"
          >
            {isLoading ? "처리 중..." : "가입"}
          </button>
        </form>
      </div>
    </div>
  );
}