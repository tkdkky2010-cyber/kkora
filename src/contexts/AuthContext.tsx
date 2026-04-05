import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChanged, signOut, signInAnonymouslyDev, User } from '../services/firebase/auth';
import { getUserDoc, createUserDoc } from '../services/firebase/firestore';
import { syncServerTime } from '../utils/serverTime';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // 로그인 성공 시 서버 시간 동기화 + 유저 문서 확인/생성
      if (firebaseUser) {
        // 서버 시간 동기화 (uid 필요하므로 로그인 후 실행)
        syncServerTime().catch(() => {});

        // 유저 문서 없으면 자동 생성
        try {
          const doc = await getUserDoc(firebaseUser.uid);
          if (!doc) {
            await createUserDoc(firebaseUser.uid, {
              displayName: firebaseUser.displayName || '유저',
              kakaoId: '',
              deviceId: '',
            });
          }
        } catch {
          // 오프라인 등에서는 다음 접속 시 재시도
        }
      }
    });
    return unsubscribe;
  }, []);

  // 개발 단계: 익명 로그인 (카카오 연동 후 교체)
  const signIn = async () => {
    try {
      await signInAnonymouslyDev();
    } catch (error: any) {
      const message = error?.message || '로그인에 실패했습니다. 네트워크를 확인해주세요.';
      throw new Error(message);
    }
  };

  const logOut = async () => {
    try {
      await signOut();
    } catch {
      // 로그아웃 실패는 무시
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
