import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { getServerNow } from '../utils/serverTime';
import { AppConfig } from '../constants/config';

interface UseAppStateOptions {
  /** 앱 이탈 시 콜백 */
  onBackground?: () => void;
  /**
   * 앱 복귀 시 콜백 (경과 시간, 이탈 시각 ms 전달)
   * 수면(5분+ 이탈)에서는 호출되지 않음
   */
  onForeground?: (elapsedSeconds: number, exitTimeMs: number) => void;
  /** 활성화 여부 */
  enabled?: boolean;
}

// 5분 이상 이탈 = 수면으로 간주 → grace 소모 안 함
const SLEEP_THRESHOLD_SECONDS = 300;

/** 유예 카운트다운 로컬 알림 스케줄링 */
async function scheduleGraceNotifications(): Promise<string[]> {
  const ids: string[] = [];
  try {
    ids.push(await Notifications.scheduleNotificationAsync({
      content: { title: '꺼라 — 유예 시간', body: '60초 내에 앱으로 돌아오세요!', sound: true },
      trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
    }));
    ids.push(await Notifications.scheduleNotificationAsync({
      content: { title: '꺼라 — 20초 남음', body: '20초 내에 돌아오지 않으면 실패합니다!', sound: true },
      trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 40 },
    }));
    ids.push(await Notifications.scheduleNotificationAsync({
      content: { title: '꺼라 — 10초 남음!', body: '지금 바로 돌아오세요!', sound: true },
      trigger: { type: SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 50 },
    }));
  } catch { /* 알림 실패 시 무시 */ }
  return ids;
}

async function cancelGraceNotifications(ids: string[]) {
  for (const id of ids) {
    try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
  }
}

/**
 * 앱 포그라운드/백그라운드 전환 감지 훅.
 *
 * 핵심: "화면 꺼짐(수면)"과 "앱 전환"을 경과 시간으로 구분.
 * - 5분 이상 이탈 = 수면 → grace 소모 안 함, 정상 대기
 * - 60초 이내 복귀 = 앱 전환 후 복귀 → grace 1회 소모
 * - 60초~5분 이탈 후 복귀 = 앱 전환 후 미복귀 → 실패
 *
 * grace timeout은 클라이언트에서 발동하지 않음.
 * 서버 정산(settle)에서 아직 active인 챌린지는 성공 처리.
 * 앱을 끄고 자면 → 복귀 시 경과 시간이 수시간 → 수면으로 판정 → 성공.
 */
export function useAppState({
  onBackground,
  onForeground,
  enabled = true,
}: UseAppStateOptions) {
  const backgroundTimeRef = useRef<number | null>(null);
  const notificationIdsRef = useRef<string[]>([]);

  const handleAppStateChange = useCallback(
    (nextState: AppStateStatus) => {
      if (!enabled) return;

      if (nextState === 'background') {
        const exitTime = getServerNow().getTime();
        backgroundTimeRef.current = exitTime;
        onBackground?.();

        // 로컬 알림 스케줄링 (수면 중에는 OS가 표시 안 함)
        scheduleGraceNotifications().then((ids) => {
          notificationIdsRef.current = ids;
        });

      } else if (nextState === 'active' && backgroundTimeRef.current) {
        const exitTime = backgroundTimeRef.current;
        const elapsed = (getServerNow().getTime() - exitTime) / 1000;
        backgroundTimeRef.current = null;

        // 알림 취소
        cancelGraceNotifications(notificationIdsRef.current);
        notificationIdsRef.current = [];

        // 수면 판별: 5분+ = 수면 → 무시
        if (elapsed >= SLEEP_THRESHOLD_SECONDS) {
          return;
        }

        // 앱 전환 판별: 5분 미만 → onForeground로 처리
        onForeground?.(elapsed, exitTime);
      }
    },
    [enabled, onBackground, onForeground],
  );

  useEffect(() => {
    if (!enabled) return;

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      sub.remove();
      cancelGraceNotifications(notificationIdsRef.current);
    };
  }, [enabled, handleAppStateChange]);
}
