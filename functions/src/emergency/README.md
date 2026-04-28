# 긴급 대응 Cloud Functions

> 서비스 제거·종료·행정처분 등 긴급 사태 시 사용하는 함수들.
> 평상시 호출 금지. 모든 함수는 **admin custom claim** 필수.

---

## 함수 목록

### 1. `setServiceKillSwitch`
서비스 기능별 차단 플래그 토글. 재배포 없이 즉시 반영.

**사용 예**
```ts
// 신규 챌린지·충전만 차단, 출금은 유지
await httpsCallable(functions, 'setServiceKillSwitch')({
  enabled: false,
  blockDeposit: true,
  blockChallenge: true,
  blockWithdrawal: false,
  reason: '2026-XX-XX 앱스토어 심사 사후 제거 대응',
});
```

**⚠️ 의존성**: 각 Cloud Function 초입에 플래그 체크 코드 추가 필요.
`startChallenge`, `requestDeposit`, `pingChallenge` 등은 아래 패턴 삽입:

```ts
const flag = await db.collection('systemFlags').doc('service').get();
if (flag.exists && flag.data()?.blockChallenge) {
  throw new functions.HttpsError('unavailable', flag.data()!.reason);
}
```

### 2. `bulkRefund`
전체 유저 예치금 일괄 환불.

**사용 순서**
1. **dryRun 실행** — 대상 유저 수·총액 확인
2. 결과 검토 (auditLogs 확인)
3. 법무법인 서면 승인
4. **dryRun=false 실행** — 실제 집행
5. PG/오픈뱅킹으로 실제 이체는 별도 (이 함수는 Firestore balance만 처리)

**예시**
```ts
// 1단계: dry run
const dryRunResult = await httpsCallable(functions, 'bulkRefund')({
  dryRun: true,
  reason: '앱스토어 제거로 인한 서비스 중단 환불',
  incidentId: 'incident_2026-05-15_appstore_removal',
});
console.log(dryRunResult.data);
// { scannedUsers: 1234, eligibleUsers: 987, totalRefundAmount: 12345000, ... }

// 2단계: 실제 집행 (cursor 기반 페이지네이션)
let cursor: string | undefined = undefined;
do {
  const result = await httpsCallable(functions, 'bulkRefund')({
    dryRun: false,
    reason: '앱스토어 제거로 인한 서비스 중단 환불',
    incidentId: 'incident_2026-05-15_appstore_removal',
    cursorUserId: cursor,
  });
  cursor = result.data.nextCursorUserId || undefined;
} while (cursor);
```

**제약**
- 진행중 챌린지 있는 유저는 **skip** (정산 완료 후 재처리)
- 음수 잔액 유저는 **skip** (수동 조사)
- 한 호출당 최대 2,000명 (timeout 540초)
- 장애 시 `refundFailures/` 컬렉션에 자동 기록

### 3. `exportUserData`
유저 본인 데이터 JSON 다운로드 (개인정보이동권).

**누가 호출**: 유저 본인 (admin 불가)

**반환**: user, challenges, transactions, disputes, graceLogs

---

## 배포

`functions/src/index.ts` 에 export 추가 완료. 배포:

```bash
cd functions
npm run deploy -- --only functions:bulkRefund,functions:setServiceKillSwitch,functions:exportUserData
```

---

## admin claim 부여 방법

```bash
# gcloud로 한 번만 설정
firebase functions:shell
> admin.auth().setCustomUserClaims('USER_UID_HERE', { admin: true })
```

또는 초기 부트스트랩 스크립트(별도 작성)에서 설정.

---

## 관련 문서

- [../../docs/emergency/takedown-playbook.md](../../docs/emergency/takedown-playbook.md)
- [../../docs/emergency/user-notices.md](../../docs/emergency/user-notices.md)
- [../../docs/emergency/pwa-fallback.md](../../docs/emergency/pwa-fallback.md)
