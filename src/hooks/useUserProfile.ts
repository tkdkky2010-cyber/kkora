import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types/user';

interface UseUserProfileResult {
  userData: UserProfile | null;
  loading: boolean;
  error: string | null;
}

/**
 * 유저 프로필 실시간 구독 훅.
 * onSnapshot으로 Firestore 변경 즉시 반영.
 */
export function useUserProfile(): UseUserProfileResult {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.data() as UserProfile);
        } else {
          setUserData(null);
        }
        setError(null);
        setLoading(false);
      },
      () => {
        setError('유저 정보를 불러올 수 없습니다.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [user]);

  return { userData, loading, error };
}
