import {
  signInWithCustomToken,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';

// 카카오 Custom Token으로 로그인 (Cloud Functions 연동 후 사용)
export async function signInWithKakao(customToken: string): Promise<User> {
  const credential = await signInWithCustomToken(auth, customToken);
  return credential.user;
}

// 개발용: 익명 로그인 (카카오 연동 전 테스트용)
export async function signInAnonymouslyDev(): Promise<User> {
  const credential = await signInAnonymously(auth);
  return credential.user;
}

// 로그아웃
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// 인증 상태 리스너
export function onAuthChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export type { User };
