import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredAuth } from '@/utils/auth';

export default function AdminIndexGate() {
  const navigate = useNavigate();

  useEffect(() => {
    const { isLoggedIn, role } = getStoredAuth();

    if (!isLoggedIn) {
      // 로그인 X → /admin/login
      navigate('/admin/login', { replace: true });
      return;
    }

    if (role === 'ADMIN') {
      // 관리자 로그인 O → /admin/user_report
      navigate('/admin/user_report', { replace: true });
      return;
    }

    // 일반 사용자 로그인 O → 이전 페이지로 이동
    alert('관리자 전용 페이지입니다.');
    navigate(-1);
  }, [navigate]);

  return null;
}
