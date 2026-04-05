import { useState, useEffect } from 'react';
import { getUserDoc } from '../services/firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types/user';

interface UseUserProfileResult {
  userData: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * 유저 프로필 공유 훅
 * getUserDoc() 패턴 중복 제거용
 */
export function useUserProfile(): UseUserProfileResult {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    getUserDoc(user.uid)
      .then((doc) => {
        setUserData(doc);
      })
      .catch(() => {
        setError('유저 정보를 불러올 수 없습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);

  return { userData, loading, error, refresh };
}
