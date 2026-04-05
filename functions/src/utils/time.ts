/**
 * KST(한국 표준시) 유틸리티
 * Cloud Functions는 UTC로 실행되므로 반드시 KST 변환 필요
 */

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 현재 KST Date 객체 반환 */
export function getKSTNow(): Date {
  return new Date(Date.now() + KST_OFFSET_MS);
}

/** KST 기준 현재 시(hour) 반환 (0~23) */
export function getKSTHour(): number {
  return getKSTNow().getUTCHours();
}

/** KST 기준 오늘 날짜 문자열 (YYYY-MM-DD) */
export function getKSTDateString(date?: Date): string {
  const d = date ? new Date(date.getTime() + KST_OFFSET_MS) : getKSTNow();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** KST 기준 어제 날짜 문자열 */
export function getKSTYesterdayString(): string {
  const yesterday = new Date(Date.now() + KST_OFFSET_MS - 24 * 60 * 60 * 1000);
  return getKSTDateString(new Date(yesterday.getTime() - KST_OFFSET_MS));
}

/** KST 기준 요일 (0=일, 5=금) */
export function getKSTDay(date?: Date): number {
  const d = date ? new Date(date.getTime() + KST_OFFSET_MS) : getKSTNow();
  return d.getUTCDay();
}
