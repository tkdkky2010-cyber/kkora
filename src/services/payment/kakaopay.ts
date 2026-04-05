/**
 * 카카오페이 결제 서비스
 *
 * 실제 카카오페이 PG 연동은 Cloud Functions에서 처리합니다.
 * 클라이언트는 Cloud Function(requestDeposit)을 호출하기만 합니다.
 *
 * PG 시크릿 키는 절대 클라이언트에 노출하지 않습니다.
 * 모든 PG API 호출은 서버(Cloud Functions)에서만 수행합니다.
 *
 * 연동 플로우:
 * 1. 클라이언트 → requestDeposit CF 호출 (금액 전달)
 * 2. CF → 카카오페이 결제 준비 API → redirect URL 반환
 * 3. 클라이언트 → WebView로 카카오페이 결제 진행
 * 4. 결제 완료 콜백 → CF에서 승인 API → 잔액 증가
 */

export const PAYMENT_METHOD = 'kakaopay' as const;
