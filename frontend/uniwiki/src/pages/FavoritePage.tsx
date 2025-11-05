// src/pages/FavoritePage.tsx

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

interface Favorite {
  documentId: number
  documentTitle: string
  universityName: string
  documentUpdateAt: string
}

export default function FavoritePage() {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 즐겨찾기 목록 조회
  useEffect(() => {
    const fetchFavorites = async () => {
      const accessToken = localStorage.getItem("accessToken")
      
      if (!accessToken) {
        alert("로그인이 필요합니다.")
        navigate("/login")
        return
      }

      try {
        const response = await fetch("http://k13d104.p.ssafy.io/api/v1/users/me/favorites/documents", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setFavorites(data)
        } else if (response.status === 401) {
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.")
          localStorage.removeItem("accessToken")
          navigate("/login")
        } else {
          alert("즐겨찾기 목록을 불러오는데 실패했습니다.")
        }
      } catch (error) {
        console.error("Fetch favorites error:", error)
        alert("서버와의 연결에 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [navigate])

  // 즐겨찾기 삭제
  const handleDelete = async (documentId: number) => {
    if (!window.confirm("즐겨찾기를 삭제하시겠습니까?")) return

    const accessToken = localStorage.getItem("accessToken")
    
    if (!accessToken) {
      alert("로그인이 필요합니다.")
      navigate("/login")
      return
    }

    try {
      const response = await fetch(
        `http://k13d104.p.ssafy.io/api/v1/users/me/favorites/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )
      
      if (response.ok) {
        // 삭제 성공 시 로컬 상태 업데이트
        setFavorites(favorites.filter((fav) => fav.documentId !== documentId))
        alert("즐겨찾기가 삭제되었습니다.")
      } else if (response.status === 401) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.")
        localStorage.removeItem("accessToken")
        navigate("/login")
      } else {
        alert("즐겨찾기 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("Delete favorite error:", error)
      alert("서버와의 연결에 실패했습니다.")
    }
  }

  // 문서로 이동
  const handleDocumentClick = (documentTitle: string) => {
    navigate(`/docs/${encodeURIComponent(documentTitle)}`)
  }

  // 날짜 포맷 변환 (2025-11-04T06:26:38.850Z → 2025-01-15 14:30)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\. /g, '-').replace('.', '')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-semibold text-gray-900">즐겨찾기</h1>

      <div className="mb-3 grid grid-cols-12 gap-6 border-b-2 border-gray-400 pb-3">
        <div className="col-span-3 text-base font-medium text-gray-900">문서명</div>
        <div className="col-span-3 text-base font-medium text-gray-900">학교명</div>
        <div className="col-span-4 text-base font-medium text-gray-900">문서 수정 시각</div>
        <div className="col-span-2"></div>
      </div>

      <div className="space-y-0">
        {favorites.map((favorite) => (
          <div key={favorite.documentId} className="grid grid-cols-12 gap-6 border-b border-gray-200 py-4">
            <div className="col-span-3">
              <button 
                onClick={() => handleDocumentClick(favorite.documentTitle)}
                className="text-left text-sm text-yellow-600 hover:underline"
              >
                {favorite.documentTitle}
              </button>
            </div>
            <div className="col-span-3">
              <span className="text-sm text-yellow-600">{favorite.universityName}</span>
            </div>
            <div className="col-span-4">
              <span className="text-sm text-gray-600">{formatDate(favorite.documentUpdateAt)}</span>
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                onClick={() => handleDelete(favorite.documentId)}
                className="rounded bg-red-500 px-4 py-1 text-sm font-medium text-white hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {favorites.length === 0 && (
        <div className="py-12 text-center text-gray-500">즐겨찾기한 문서가 없습니다.</div>
      )}
    </div>
  )
}