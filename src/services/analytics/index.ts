import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';
import app from '../firebase/config';

let analytics: ReturnType<typeof getAnalytics> | null = null;

/**
 * Firebase Analytics 초기화.
 * 웹/모바일 환경에서만 동작 (SSR 등에서는 무시).
 */
async function getAnalyticsInstance() {
  if (analytics) return analytics;
  const supported = await isSupported();
  if (supported) {
    analytics = getAnalytics(app);
  }
  return analytics;
}

/** 이벤트 로깅 */
export async function trackEvent(eventName: string, params?: Record<string, any>) {
  try {
    const instance = await getAnalyticsInstance();
    if (instance) {
      logEvent(instance, eventName, params);
    }
  } catch {
    // Analytics 실패는 무시
  }
}

// 주요 이벤트 헬퍼
export const AnalyticsEvents = {
  challengeStart: (amount: number) =>
    trackEvent('challenge_start', { amount }),

  challengeSuccess: (earnings: number) =>
    trackEvent('challenge_success', { earnings }),

  challengeFail: (reason: string) =>
    trackEvent('challenge_fail', { reason }),

  deposit: (amount: number) =>
    trackEvent('deposit', { amount }),

  withdrawal: (amount: number) =>
    trackEvent('withdrawal', { amount }),

  shareCard: () =>
    trackEvent('share_survivor_card'),

  screenView: (screenName: string) =>
    trackEvent('screen_view', { screen_name: screenName }),
};
