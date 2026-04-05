import { useState, useEffect, useRef } from 'react';
import { getServerNow } from '../utils/serverTime';
import { AppConfig } from '../constants/config';

interface UseTimerOptions {
  /** 서버 startTime (ms). null이면 로컬 카운트다운 */
  startTimeMs: number | null;
  /** 총 시간 (초). 기본 7시간 */
  totalSeconds?: number;
  /** 0 도달 시 콜백 */
  onComplete?: () => void;
}

interface UseTimerResult {
  remainingSeconds: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

/**
 * 서버 시간 기반 카운트다운 타이머 훅.
 * startTimeMs가 주어지면 서버 기준, 없으면 로컬 기준.
 */
export function useTimer({
  startTimeMs,
  totalSeconds = AppConfig.challenge.durationHours * 3600,
  onComplete,
}: UseTimerOptions): UseTimerResult {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const completedRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (startTimeMs) {
        const now = getServerNow().getTime();
        const elapsed = (now - startTimeMs) / 1000;
        const remaining = Math.max(0, Math.ceil(totalSeconds - elapsed));
        setRemainingSeconds(remaining);

        if (remaining === 0 && !completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTimeMs, totalSeconds, onComplete]);

  return {
    remainingSeconds,
    hours: Math.floor(remainingSeconds / 3600),
    minutes: Math.floor((remainingSeconds % 3600) / 60),
    seconds: remainingSeconds % 60,
    isComplete: remainingSeconds === 0,
  };
}
