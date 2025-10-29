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

// 문서, 토론
import DocumentViewPage from './pages/DocumentViewPage' 
import DiscussionListPage from './pages/DiscussionListPage'

//즐겨찾기
import FavoritePage from './pages/FavoritePage'

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
      { path: '/docs/:documentTitle/discussions', element: <DiscussionListPage /> },

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

// 즐겨찾기 페이지
  {
    path: '/user',
    element: <UserLayout />,
    children: [
      { path: 'favorite', element: <FavoritePage /> },
      // 나중에 기여 문서, 참여 토론 페이지도 여기 추가
    ]
  },

  // 관리자 페이지
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [

      // 관리자
      { path: 'login', element: <AdminLoginPage /> },
      { path: 'user_report', element: <AdminUserReportPage />},
      { path: 'discussion_report', element: <AdminDiscussionReportPage />},

    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
