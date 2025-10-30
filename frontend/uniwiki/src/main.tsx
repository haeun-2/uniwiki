import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// 레이아웃
import RootLayout from './layout/RootLayout'
import UnivLayout from './layout/UnivLayout'
import AdminLayout from './layout/AdminLayout'
import UserLayout from './layout/UserLayout'
import CategoryLayout from './layout/CategoryLayout'

// 메인 페이지, 대학교 메인 페이지
import MainPage from './pages/MainPage'
import UnivMainPage from './pages/UnivMainPage'

// 로그인
import LoginPage from './pages/login/LoginPage'
import SignupPage from './pages/login/SignupPage'
import SignupCompletePage from './pages/login/SignupCompletePage'
import ProfilePage from './pages/ProfilePage'

// 관리자
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminUserReportPage from './pages/admin/AdminUserReportPage'
import AdminDiscussionReportPage from './pages/admin/AdminDiscussionReportPage'
import AdminDocumentPage from './pages/admin/AdminDocumentPage'

// 문서, 토론
import DocumentViewPage from './pages/DocumentViewPage'
import DiscussionListPage from './pages/DiscussionListPage'
import DiscussionDetailPage from './pages/DiscussionDetailPage' // ✅ 추가
import DocumentEditPage from './pages/DocumentEditPage'         // ✅ 편집 화면 추가

//즐겨찾기, 참여 토론
import FavoritePage from './pages/FavoritePage'
import DiscussionHistoryPage from './pages/DiscussionHistoryPage'


// 카테고리
import CategoryPage from './pages/CategoryPage'

const router = createBrowserRouter([
  // 메인 페이지
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // 메인 페이지
      { index: true, element: <MainPage /> },

      // 로그인
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage />},
      { path: 'signup/complete', element: <SignupCompletePage /> },
      { path: 'profile', element: <ProfilePage /> },

      // 문서, 토론
      { path: 'docs/:documentTitle', element: <DocumentViewPage /> },
      { path: '/docs/:documentTitle/edit', element: <DocumentEditPage /> },          // ✅ 편집 라우트
      { path: '/docs/:documentTitle/discussions', element: <DiscussionListPage /> },
      { path: '/docs/:documentTitle/discussions/:id', element: <DiscussionDetailPage /> }, // ✅ 추가
    ],
  },

  // 대학교 메인 페이지
  {
    path: '/univ/:univName',
    element: <UnivLayout />,
    children: [
      // 대학교 메인 페이지
      { index: true, element: <UnivMainPage /> },
    ]
  },

  // 카테고리 페이지
  {
    path: '/category/:categoryName',
    element: <CategoryLayout />,
    children: [
      { index: true, element: <CategoryPage /> },
    ]
  },
  
// 사용자 페이지(즐겨찾기, 참여토론)
  {
    path: '/user',
    element: <UserLayout />,
    children: [
      { path: 'favorite', element: <FavoritePage /> },
      { path: 'discussions', element: <DiscussionHistoryPage /> },
    ]
  },

  // 관리자 페이지
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      // 관리자
      { path: 'login', element: <AdminLoginPage /> },
      { path: 'user_report', element: <AdminUserReportPage /> },
      { path: 'discussion_report', element: <AdminDiscussionReportPage /> },
      { path: 'document', element: <AdminDocumentPage /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
