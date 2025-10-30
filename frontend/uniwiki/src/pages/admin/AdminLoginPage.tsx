import React from "react";

export default function AdminLoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-2xl font-semibold mb-8">관리자 로그인</h1>

      <form className="w-full max-w-sm space-y-6">
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="아이디를 입력해주세요"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2C80A0]"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            placeholder="비밀번호를 입력해주세요"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2C80A0]"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-uniwikicolor text-white py-2 rounded-md hover:bg-uniwikicolor_hover transition"
        >
          로그인
        </button>
      </form>
    </div>
  );
}
