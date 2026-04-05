import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { useAuth } from '../contexts/AuthContext';

interface UseBalanceResult {
  balance: number;
  loading: boolean;
  error: string | null;
}

/**
 * 실시간 잔액 구독 훅.
 * Firestore users/{uid}.balance를 실시간 리슨.
 */
export function useBalance(): UseBalanceResult {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBalance(0);
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setBalance(snapshot.data().balance || 0);
        }
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError('잔액을 불러올 수 없습니다.');
        setLoading(false);
      },
    );
    return unsubscribe;
  }, [user]);

  return { balance, loading, error };
}
