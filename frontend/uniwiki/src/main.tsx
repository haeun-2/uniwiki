// main.tsx
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
import UnivAllDocsPage from './pages/UnivAllDocsPage' // ★ 전체 문서 페이지

// 로그인
import LoginPage from './pages/login/LoginPage'
import SignupPage from './pages/login/SignupPage'
import SignupCompletePage from './pages/login/SignupCompletePage'
import ProfilePage from './pages/ProfilePage'

// 관리자
import AdminIndexGate from './utils/AdminIndexGate'
import RequireAdmin from './utils/RequireAdmin'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminUserReportPage from './pages/admin/AdminUserReportPage'
import AdminDiscussionReportPage from './pages/admin/AdminDiscussionReportPage'
import AdminDocumentPage from './pages/admin/AdminDocumentPage'
import AdminDiscussionPage from './pages/admin/AdminDiscussionPage'
import AdminManualPage from './pages/admin/AdminManualPage'

// 문서, 토론
import DocumentViewPage from './pages/DocumentViewPage'
import DiscussionListPage from './pages/DiscussionListPage'
import DiscussionDetailPage from './pages/DiscussionDetailPage'
import DocumentEditPage from './pages/DocumentEditPage'
import DocumentHistoryPage from './pages/DocumentHistoryPage'

// ✅ 특정 버전 문서 조회
import DocumentVersionViewPage from './pages/DocumentVersionViewPage'

// ✅ 버전 비교
import DocumentDiffPage from './pages/DocumentDiffPage'

// ✅ 새 문서 생성
import DocumentCreatePage from './pages/DocumentCreatePage'

// 즐겨찾기, 참여 토론, 기여 문서
import FavoritePage from './pages/FavoritePage'
import DiscussionHistoryPage from './pages/DiscussionHistoryPage'
import AttributePage from './pages/AttributePage'

// 카테고리
import CategoryPage from './pages/CategoryPage'

//검색
import AiSearchPage from './pages/AiSearchPage'
import SearchResultPage from './pages/SearchResultPage'

// footer 내용
import WelcomePage from './pages/footer/WelcomePage'
import GuidePage from './pages/footer/GuidePage'
import RulePage from './pages/footer/RulePage'

// tutorial
import TutorialLayout from './layout/TutorialLayout'
import TutorialMenuBarPage from './pages/tutorial/TutorialMenuBarPage'
import TutorialMainPage from './pages/tutorial/TutorialMainPage'
import TutorialUnivMainPage from './pages/tutorial/TutorialUnivMainPage'
import TutorialDocumentPage from './pages/tutorial/TutorialDocumentPage'
import TutorialDiscussionPage from './pages/tutorial/TutorialDiscussionPage'
import TutorialDiscussionNowPage from './pages/tutorial/TutorialDiscussionNowPage'
import TutorialHistoryPage from './pages/tutorial/TutorialHistoryPage'
import TutorialAISearchPage from './pages/tutorial/TutorialAISearchPage'
import TutorialMyPage from './pages/tutorial/TutorialMyPage'
import TutorialPage from './pages/tutorial/TutorialPage'


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
      { path: 'signup', element: <SignupPage /> },
      { path: 'signup/complete', element: <SignupCompletePage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'ai-search', element: <AiSearchPage /> },
      { path: 'search', element: <SearchResultPage /> },
      
      // footer 내용
      { path: 'welcome', element: <WelcomePage /> },
      { path: 'guide', element: <GuidePage /> },
      { path: 'rule', element: <RulePage /> },
    ],
  },

  // 대학교 메인 페이지
  {
    path: '/univ/:univName',
    element: <UnivLayout />,
    children: [
      { index: true, element: <UnivMainPage /> },
      { path: 'category/:categoryName', element: <CategoryPage /> },

      // ★ 전체 문서 페이지
      { path: 'docs/all', element: <UnivAllDocsPage /> },

      // 문서, 토론
      { path: 'new/docs', element: <DocumentCreatePage /> }, // ✅ 새 문서 생성
      { path: 'docs/:documentTitle', element: <DocumentViewPage /> },
      { path: 'docs/:documentTitle/history', element: <DocumentHistoryPage /> }, // ✅ 역사
      { path: 'docs/:documentTitle/edit', element: <DocumentEditPage /> }, // ✅ 편집
      { path: 'docs/:documentTitle/discussions', element: <DiscussionListPage /> },
      { path: 'docs/:documentTitle/discussions/:id', element: <DiscussionDetailPage /> },
      { path: 'docs/:documentTitle/versions/:versionId', element: <DocumentVersionViewPage /> },

      // ✅ 버전 비교 (r{versionId} vs 직전)
      { path: 'docs/:documentTitle/versions/:versionId/diff', element: <DocumentDiffPage /> },
    ],
  },

  // 카테고리 페이지
  {
    path: '/category/:categoryName',
    element: <CategoryLayout />,
    children: [{ index: true, element: <CategoryPage /> }],
  },

  // 사용자 페이지(즐겨찾기, 참여토론)
  {
    path: '/user',
    element: <UserLayout />,
    children: [
      { path: 'contributions', element: <AttributePage /> },
      { path: 'favorite', element: <FavoritePage /> },
      { path: 'discussions', element: <DiscussionHistoryPage /> },
    ],
  },

  // 관리자 페이지
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminIndexGate /> },
      { path: 'login', element: <AdminLoginPage /> },
      {
        element: <RequireAdmin />,
        children: [
          { path: 'user_report', element: <AdminUserReportPage /> },
          { path: 'discussion_report', element: <AdminDiscussionReportPage /> },
          { path: 'document', element: <AdminDocumentPage /> },
          { path: 'discussion', element: <AdminDiscussionPage /> },
          { path: 'manual', element: <AdminManualPage /> },
        ],
      },
    ],
  },

  {
    path: '/tutorial',
    element: <TutorialLayout />,
    children: [
      { index: true, element: <TutorialPage /> },

      { path: 'menu_bar', element: <TutorialMenuBarPage /> },
      { path: 'main', element: <TutorialMainPage /> },
      { path: 'main/univ_main', element: <TutorialUnivMainPage /> },
      { path: 'main/univ_main/document', element: <TutorialDocumentPage /> },
      { path: 'main/univ_main/document/discussion', element: <TutorialDiscussionPage /> }, 
      { path: 'main/univ_main/document/discussion/discussion_now', element: <TutorialDiscussionNowPage /> },
      { path: 'main/univ_main/document/history', element: <TutorialHistoryPage /> },
      { path: 'menu_bar/ai_search', element: <TutorialAISearchPage /> },
      { path: 'menu_bar/my_page', element: <TutorialMyPage /> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
