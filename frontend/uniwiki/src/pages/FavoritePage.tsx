"use client"

// src/pages/FavoritePage.tsx

import { useState } from "react"

interface Favorite {
  id: number
  documentName: string
  schoolName: string
  updatedAt: string
}

export default function FavoritePage() {
  const [favorites, setFavorites] = useState<Favorite[]>([
    {
      id: 1,
      documentName: "한국사 개론",
      schoolName: "명지대학교",
      updatedAt: "2025-01-15 14:30",
    },
    {
      id: 2,
      documentName: "컴퓨터과학 기초",
      schoolName: "한국관광대학교",
      updatedAt: "2025-01-14 16:45",
    },
    {
      id: 3,
      documentName: "일산캠퍼",
      schoolName: "무한대학교",
      updatedAt: "2025-01-13 11:20",
    },
    {
      id: 4,
      documentName: "구미대학교 주문 맛집",
      schoolName: "구미대학교",
      updatedAt: "2025-01-12 09:15",
    },
    {
      id: 5,
      documentName: "미적분학 I",
      schoolName: "부산대학교",
      updatedAt: "2025-01-11 13:50",
    },
    {
      id: 6,
      documentName: "건국대 축제 사건/논란",
      schoolName: "건국대학교",
      updatedAt: "2025-01-11 13:50",
    },
  ])

  const handleDelete = (id: number) => {
    if (window.confirm("즐겨찾기를 삭제하시겠습니까?")) {
      setFavorites(favorites.filter((fav) => fav.id !== id))
    }
  }

  return (
    <div>
      <h1 className="mb-12 text-3xl font-semibold text-gray-900">즐겨찾기</h1>

      <div className="mb-6 grid grid-cols-12 gap-6 border-b-2 border-gray-400 pb-4">
        <div className="col-span-3 text-base font-medium text-gray-900">문서명</div>
        <div className="col-span-3 text-base font-medium text-gray-900">학교명</div>
        <div className="col-span-4 text-base font-medium text-gray-900">문서 수정 시각</div>
        <div className="col-span-2"></div>
      </div>

      <div className="space-y-0">
        {favorites.map((favorite) => (
          <div key={favorite.id} className="grid grid-cols-12 gap-6 border-b border-gray-200 py-6">
            <div className="col-span-3">
              <button className="text-left text-sm text-yellow-600 hover:underline">{favorite.documentName}</button>
            </div>
            <div className="col-span-3">
              <span className="text-sm text-yellow-600">{favorite.schoolName}</span>
            </div>
            <div className="col-span-4">
              <span className="text-sm text-gray-600">{favorite.updatedAt}</span>
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                onClick={() => handleDelete(favorite.id)}
                className="rounded bg-red-500 px-4 py-1 text-sm font-medium text-white hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {favorites.length === 0 && <div className="py-12 text-center text-gray-500">즐겨찾기한 문서가 없습니다.</div>}
    </div>
  )
}
