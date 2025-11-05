import React, { useState } from "react";
import { useNavigate } from "react-router-dom"

export default function AdminLoginPage() {

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://k13d104.p.ssafy.io/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // 1) 관리자 권한 확인 (ADMIN만 통과)
        const role = (data.role ?? "").toUpperCase();
        if (role !== "ADMIN") {
          // 관리자 권한이 아니면 저장하지 않고 차단
          alert("관리자 권한이 없습니다. 일반 사용자 로그인 페이지를 이용해주세요.");
          return; // 종료
        }

        // 일반 로그인과 동일하게 토큰/사용자 정보 저장
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userId", String(data.userId));
        localStorage.setItem("nickName", data.nickName);
        localStorage.setItem("role", data.role);
        if (data.universityId) {
          localStorage.setItem("universityId", String(data.universityId));
        }

        alert(`${data.nickName}님, 환영합니다!`);
        // 관리자 로그인 성공 시 관리자 첫 화면으로 이동

        navigate("/admin/user_report");
        
      } else {
        const error = await response.json();
        alert(
          error.message ||
            "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."
        );
      }
    } catch (error) {
      console.error("Admin login error:", error);
      alert("서버와의 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-2xl font-semibold mb-8">관리자 로그인</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="아이디를 입력해주세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2C80A0]"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2C80A0]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-uniwikicolor text-white py-2 rounded-md hover:bg-uniwikicolor_hover transition disabled:bg-gray-400"
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
