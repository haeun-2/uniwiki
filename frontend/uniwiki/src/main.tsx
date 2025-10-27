// src/main.tsx
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layout/RootLayout'
import MainPage from './pages/MainPage'
import UnivLayout from './layout/UnivLayout'
import UnivMainPage from './pages/UnivMainPage'
import DocumentViewPage from './pages/DocumentViewPage' 

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: '/docs/:documentTitle', element: <DocumentViewPage /> },  // 문서 조회 라우트 추가
    ],
  },
  {
    path: "/univ/:univName",
    element: <UnivLayout />,
    children: [
      { index: true, element: <UnivMainPage /> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
