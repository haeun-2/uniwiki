// src/pages/ProfilePage.tsx

import { useState } from "react";

export default function ProfilePage() {
  const [nickname, setNickname] = useState("");
  const [email] = useState("psh406014@gmail.com");
  const [password, setPassword] = useState("");
  const [role] = useState("User");
  const [isEditing, setIsEditing] = useState(false);

  const handleCancel = () => {
    setIsEditing(false);
    setNickname("");
    setPassword("");
  };

  const handleSave = () => {
    // 저장 로직 (추후 API 연결)
    console.log("Save profile:", { nickname, password });
    alert("프로필이 저장되었습니다.");
    setIsEditing(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-12 text-center text-3xl font-semibold text-gray-900">내 정보</h1>

      <div className="space-y-8">
        {/* 닉네임 */}
        <div className="flex items-center border-b border-gray-200 pb-6">
          <label className="w-32 text-lg font-medium text-gray-900">닉네임</label>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="수정"
                className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            ) : (
              <span className="text-gray-400">수정</span>
            )}
          </div>
        </div>

        {/* 이메일 */}
        <div className="flex items-center border-b border-gray-200 pb-6">
          <label className="w-32 text-lg font-medium text-gray-900">이메일</label>
          <div className="flex-1">
            <span className="text-gray-900">{email}</span>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="flex items-center border-b border-gray-200 pb-6">
          <label className="w-32 text-lg font-medium text-gray-900">비밀번호</label>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 변경"
                className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            ) : (
              <span className="text-gray-400">비밀번호 변경</span>
            )}
          </div>
        </div>

        {/* 권한 */}
        <div className="flex items-center border-b border-gray-200 pb-6">
          <label className="w-32 text-lg font-medium text-gray-900">권한</label>
          <div className="flex-1">
            <span className="text-gray-900">{role}</span>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-center gap-4 pt-8">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="rounded-lg bg-red-500 px-8 py-2.5 font-medium text-white hover:bg-red-600"
              >
                계정 삭제
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-[#5b7c99] px-8 py-2.5 font-medium text-white hover:bg-[#4a6578]"
              >
                저장
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-[#5b7c99] px-8 py-2.5 font-medium text-white hover:bg-[#4a6578]"
            >
              수정
            </button>
          )}
        </div>
      </div>
    </div>
  );
}