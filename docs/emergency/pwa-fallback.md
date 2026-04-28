# PWA 임시 운영 설계

> **목적**: 앱스토어 제거 시 유저의 잔액 조회·출금·문의 경로를 웹으로 유지. 챌린지 기능 제공 금지 (백그라운드 감지 불가).

---

## 범위

### 제공 기능 (웹에서 가능)
- 로그인 (카카오 OAuth)
- 잔액 조회
- **출금 요청** (최소 금액 제한 해제)
- 거래 내역 조회
- 1:1 문의
- 분쟁 제기 (disputes)
- 개인정보 다운로드 (GDPR 준수)
- 회원 탈퇴

### 제공 금지 기능 (웹 불가)
- ❌ 챌린지 참여·진행 (heartbeat/앱스테이트 감지 불가)
- ❌ 신규 예치금 충전 (제거 사유와 충돌)
- ❌ 레벨·스트릭 변화
- ❌ 푸시 알림 (PWA 한계)

---

## 아키텍처

```
app.kkora.kr (PWA, Next.js)
    ↓
Firebase Auth (기존 카카오 Custom Token 재사용)
    ↓
Cloud Functions (기존 함수 일부만 노출)
    - getBalance
    - requestWithdrawal (최소 금액 해제 플래그)
    - listTransactions
    - submitDispute
    - exportUserData (신규)
    - deleteUser
    ↓
Firestore (기존 DB 그대로)
```

**재사용 원칙**: 네이티브 앱과 동일한 Cloud Functions·Firestore·Auth를 사용. 웹은 뷰어 + 출금 창구 역할만.

---

## 구현 체크리스트 (출시 전 준비)

- [ ] `web/` 폴더 생성 (Next.js 14 App Router)
- [ ] Firebase Web SDK 초기화 (`web/src/firebase.ts`)
- [ ] 카카오 OAuth 웹 리다이렉트 URL 등록 (`https://app.kkora.kr/auth/callback`)
- [ ] 위 제공 기능만 페이지 구현:
  - `/` 로그인
  - `/dashboard` 잔액/내역
  - `/withdraw` 출금
  - `/support` 문의·분쟁
  - `/account` 데이터 다운로드·탈퇴
- [ ] 배포 타겟 결정: Vercel 또는 Firebase Hosting
- [ ] DNS: `app.kkora.kr` CNAME 설정 준비 (활성화는 긴급 시)
- [ ] SSL 인증서 자동 발급 확인
- [ ] 긴급 활성화 SOP 문서화 (DNS 전환 → 배포 → 공지)

---

## 긴급 활성화 절차 (T+6시간 이내)

1. **DNS 전환**: Cloudflare 등 DNS 제공자에서 `app.kkora.kr` 활성화 (사전에 CNAME 만들어두되 프록시 OFF 상태 유지)
2. **배포**: `cd web && vercel --prod` 또는 `firebase deploy --only hosting`
3. **Cloud Functions 플래그**: `EMERGENCY_MODE = true` 배포 → 출금 최소금액 해제, 충전 API 404 반환
4. **유저 공지 발송**: [user-notices.md](user-notices.md) 템플릿에 PWA 주소 추가
5. **모니터링**: Cloud Functions 요청 수, 출금 실패율 실시간 확인

---

## 법적 주의사항

- **챌린지 기능을 웹에서 제공하면 앱스토어 우회로 해석될 위험** → 절대 금지
- PWA는 "기존 유저의 잔액 정리 창구"로만 포지셔닝
- 신규 가입 차단 (기존 유저만 로그인 가능하게 제한)

---

## 우선순위

이 문서는 **심사 통과 후 정식 오픈 전까지 구현 완료**가 목표. 오픈 후 6개월간 사용할 일이 없기를 바라지만, **사전에 만들어두지 않으면 긴급 시 대응 불가**.
