import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { isAdmin, getStoredAuth } from '@/utils/auth';
import { useEffect } from 'react';

export default function RequireAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = getStoredAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      // 로그인 X → 로그인 페이지로 이동
      navigate('/admin/login', { replace: true, state: { from: location } });
      return;
    }

    if (!isAdmin()) {
      // 일반 사용자 → 이전 페이지로 되돌아감
      navigate(-1);
    }
  }, [isLoggedIn, location, navigate]);

  // 위 조건을 통과하지 못하면 null 반환
  if (!isAdmin() || !isLoggedIn) return null;

  return <Outlet />;
}
