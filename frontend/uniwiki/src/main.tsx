import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layout/RootLayout'
import UniWikiMainPage from './pages/UniWikiMainPage'
import LoginPage from './pages/LoginPage'   
import SignupPage from './pages/SignupPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <UniWikiMainPage /> },
      { path: 'login', element: <LoginPage /> },   
      { path: 'signup', element: <SignupPage />},
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
