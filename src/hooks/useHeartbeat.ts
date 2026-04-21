import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Battery from 'expo-battery';
import { pingChallenge } from '../services/firebase/functions';

const PING_INTERVAL_MS = 30000; // 30초

/**
 * 챌린지 중 30초 주기로 서버에 heartbeat ping을 보낸다.
 * - 앱이 백그라운드 상태여도 JS 타이머가 허용하는 한 ping 시도 (iOS는 OS가 차단 가능)
 * - 실패해도 재시도하지 않음 (서버에서 120초 타임아웃으로 판정)
 * - 챌린지 종료 시 훅이 언마운트되어 자동 정리
 */
export function useHeartbeat(challengeId: string | null, enabled: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !challengeId) return;

    const sendPing = async () => {
      try {
        const level = await Battery.getBatteryLevelAsync().catch(() => null);
        const appState = AppState.currentState === 'active' ? 'active' : 'background';
        await pingChallenge(
          challengeId,
          appState,
          level !== null && level >= 0 ? Math.round(level * 100) : undefined,
        );
      } catch {
        // 네트워크 오류 등은 조용히 무시 (서버 타임아웃으로 판정)
      }
    };

    // 즉시 1회 전송 후 30초 주기
    sendPing();
    intervalRef.current = setInterval(sendPing, PING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [challengeId, enabled]);
}
