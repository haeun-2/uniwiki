// src/pages/ProfilePage.tsx

import { useState } from "react";

export default function ProfilePage() {
  const [nickname, setNickname] = useState("김코드");
  const [email] = useState("psh406014@gmail.com");
  const [role] = useState("User");
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    console.log("Save profile:", { nickname });
    alert("프로필이 저장되었습니다.");
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("정말로 계정을 삭제하시겠습니까?")) {
      console.log("Account deleted");
      alert("계정이 삭제되었습니다.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-12 text-center text-3xl font-semibold text-gray-900">내 정보</h1>

      <div className="space-y-8">
        {/* 닉네임 */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <label className="text-lg font-medium text-gray-900">닉네임</label>
          <div className="flex items-center gap-4">
            <span className="text-gray-900">{nickname}</span>
            {isEditing && (
              <button className="text-sm text-gray-400 hover:text-gray-600">
                수정
              </button>
            )}
          </div>
        </div>

        {/* 이메일 */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <label className="text-lg font-medium text-gray-900">이메일</label>
          <span className="text-gray-900">{email}</span>
        </div>

        {/* 비밀번호 */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <label className="text-lg font-medium text-gray-900">비밀번호</label>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">비밀번호 변경</span>
            {isEditing && (
              <button className="text-sm text-gray-400 hover:text-gray-600">
                수정
              </button>
            )}
          </div>
        </div>

        {/* 권한 */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-6">
          <label className="text-lg font-medium text-gray-900">권한</label>
          <span className="text-gray-900">{role}</span>
        </div>

        {/* 버튼 */}
        <div className="flex justify-center gap-4 pt-8">
          {isEditing ? (
            <>
              <button
                onClick={handleDelete}
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