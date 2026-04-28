# 꺼라 (KKORA) — 수면 챌린지 앱

> 폰을 끄면 돈을 번다

---

## ⚠️ 미결 사항 (Open Questions)

아래 항목은 **출시 전 반드시** 확정해야 하며, 결정 전까지는 관련 기능 구현을 보류한다.

| # | 항목 | 리스크 | 결정 시한 | 담당 |
|---|---|---|---|---|
| 1 | **Apple IAP vs 외부 결제** | iOS 앱스토어 정책상 "디지털 재화"는 IAP 강제(수수료 30%). "실물 환급 가능한 예치금"은 외부 결제 허용 가능성 있으나 심사 리젝 리스크 존재. 애플 판단에 따라 수익 모델 붕괴 가능. | **출시 4주 전** (심사 제출 전) | 본인 + 앱스토어 심사팀 문의 |
| 2 | **전자금융거래법 해당 여부** | 선불전자지급수단 발행업(예치금) 등록 대상이면 자본금 20억 필요. 카카오페이 PG 경유 시 면제 가능성 있으나 법률 자문 필수. | **개발 6주차 시작 전** (결제 코드 작성 전) | 법무법인 자문 |
| 3 | **사행산업통합감독위원회 해석** | "수면 성공 시 금전 환급"이 게임산업법·사행행위법상 "베팅/도박"으로 판정되면 앱 전체 불법. "챌린지/현상광고"로 분류되어야 함. | **출시 4주 전** | 법률 자문 + 문체부 유권해석 요청 |
| 4 | **카카오페이 PG 가맹점 심사 통과** | 수면 챌린지 앱이 카카오페이 가맹 정책(도박·사행성 차단 조항)에 걸릴 수 있음. | **개발 6주차** | 카카오페이 파트너센터 선협의 |

**규칙**
- 이 섹션이 비어있을 때까지 `functions/src/payment/**` 실배포 금지
- 결정 사항은 이 표에 기록 후 하단 "결정 이력"에 사유 포함하여 이관
- 법률 자문 결과는 `docs/legal/` 폴더에 PDF로 보관

**진행 중 액션 (2026-04-27 결정)**
- [ ] 네이버엑스퍼트 5만원 변호사 상담 (1순위) — 핵심 질문 3개 사전 송부
- [ ] 카카오페이 비즈니스팀 미팅 (무료) — 6개 핵심 질문 (sub-account 등)
- [ ] 토스페이먼츠 영업 미팅 (백업, 동시 진행)
- [ ] 사업자등록 (미팅 결과 반영 후)
- [ ] 정식 변호사 의견서 (50~200만원) — 매출 발생 후 또는 출시 직전 보류

**결정 이력**
- 2026-04-27: 정식 의견서(50~200만원) 보류, **5만원 상담 + PG 미팅 결과 우선** 채택. 부트스트랩 단계 예산 효율 우선.
- 2026-04-27: **카카오페이머니 네이티브 모델** 채택 (자금이 우리 통장 안 들어옴 → 전금법 등록 의무 면제). PG 미팅에서 sub-account 지원 여부 최종 확인 필요.

---

## 프로젝트 개요

- **앱 이름**: 꺼라
- **한 줄 설명**: 밤에 폰을 끄고 7시간 이상 자면 돈을 버는 수면 챌린지 앱
- **타겟**: 18~30세, 밤에 폰을 놓지 못하는 한국인
- **스택**: React Native + TypeScript + Expo SDK 52 + Firebase
- **저장소**: https://github.com/tkdkky2010-cyber/kkora

---

## 하네스 엔지니어링 (멀티 전문가 시스템)

모든 기능 개발 시 5개 전문가 파트가 순차적으로 협업한다.
각 파트는 자신의 전문 영역에서 최고 품질을 보장한다.

### 📋 PM (Project Manager)
- 기능 요구를 받으면 **가장 먼저** 활성화
- 상세 스펙 문서 작성:
  - 화면 구성 요소 목록
  - 사용자 플로우 (시작 → 끝)
  - 필요한 API / DB 구조
  - 엣지케이스 목록
  - 각 파트별 할 일 분배
- 완료 체크리스트 작성 (□ 형태)
- **사용자 승인을 받기 전까지 코드를 작성하지 않는다**

### 🎨 Design Lead
- 아래 '디자인 시스템'을 **엄격히** 준수
- 화면별 레이아웃, 계층구조, 여백 설계
- 인터랙션/애니메이션 정의 (토글, 버튼, 전환 효과)
- 모바일 최적화:
  - 터치 영역 최소 44px
  - 한 손 조작 고려 (주요 버튼 하단 배치)
  - 안전 영역(Safe Area) 항상 적용
- 다크 테마 가독성 보장
- **참고 수준**: 토스 앱의 깔끔함 + 게임의 긴장감

### ⚛️ Frontend Engineer
- Design Lead의 설계를 **정확히** 구현 (임의 변경 금지)
- React Native + TypeScript 모범 사례 준수
- 컴포넌트 분리 원칙:
  - 파일당 **200줄 이하**
  - 재사용 가능한 공통 컴포넌트 우선 제작
  - Atomic Design: atoms → molecules → organisms → screens
- 상태관리:
  - 로컬 상태: React useState/useReducer
  - 서버 상태: Firebase 실시간 리스너
  - 전역 상태: Context API (가벼운 것만)
- **반드시 포함**: 에러 화면, 로딩 화면, 빈 상태 화면
- 대응 기기: iPhone SE ~ iPhone 16 Pro Max, 주요 Android 기기

### 🔥 Backend Engineer
- Firebase 보안 규칙: **최소 권한 원칙**
- 모든 시간 판단: **서버 시간(Firebase Server Timestamp)** 기준
- **돈 관련 로직은 반드시 Cloud Functions에서만 처리**
  - 클라이언트에서 예치금/상금 직접 수정 절대 불가
  - 모든 금융 트랜잭션은 Firestore Transaction 사용
- API 응답 시간 500ms 이내 목표
- 동시 접속 10,000명 기준 설계
- DB 인덱스 최적화

### 🧪 QA Engineer
- 매 기능 완성 후 아래 항목 **전수 검사**:
  - PM의 체크리스트 전 항목 통과
  - TypeScript 에러 zero
  - Happy Path 정상 작동
  - 엣지 케이스 **5개 이상** 시나리오 작성 및 검증
  - 보안: 클라이언트에서 조작 가능한 값 여부
  - 성능: 불필요한 리렌더링, 메모리 누수
  - 접근성: 폰트 크기, 터치 영역, 색상 대비
- 발견된 이슈를 심각도로 분류:
  - **Critical**: 즉시 수정 (다음 기능 진행 불가)
  - **Major**: 같은 주 내 수정
  - **Minor**: 목록화 후 일괄 수정

### 작업 순서 (PGE 사이클)

```
1. 📋 PM → 스펙 작성 → 사용자 승인 대기 ──── [Plan]
2. 🎨 Design Lead → UI 설계
3. ⚛️ Frontend + 🔥 Backend → 동시 구현 ────── [Generate]
4. 🧪 QA → 검수 → 이슈 리포트
5. 수정 → 재검수 → 사용자에게 최종 보고 ──── [Evaluate]
```

### 파트 간 규칙
- Design Lead가 정한 디자인을 Frontend가 **임의 변경 불가**
- Backend의 API 스펙을 Frontend가 **임의로 바꿀 수 없음**
- QA가 Critical 판정한 이슈는 **다음 기능 진행 전 반드시 해결**
- 각 파트는 자기 영역의 결정에 대해 **근거를 명시**

---

## 디자인 시스템

### 컬러

```
배경 (Primary):    #08080c
배경 (Card):       #14141e
배경 (Elevated):   #1c1c2a

초록 (성공/돈):    #3ddc84
빨강 (실패/경고):  #e24b4a
골드 (스트릭):     #f0b429

텍스트 (Primary):  #e8e8ec
텍스트 (Sub):      #6b6b7b
텍스트 (Disabled): #3a3a4a

라인/보더:         rgba(255, 255, 255, 0.06)
```

### 타이포그래피

**폰트 패밀리**
- **한글**: Pretendard Variable (GitHub OFL 라이선스, 상업 사용 가능)
  - 번들 방식: `expo-font` + `assets/fonts/PretendardVariable.woff2`
  - 대체 폰트: `system-ui, -apple-system, sans-serif` (로드 실패 시)
- **영문/숫자**: 시스템 폰트 (`-apple-system` iOS, `Roboto` Android) — 금액/타이머 가독성 최우선
- **금지**: Inter, Noto Sans, Roboto를 한글에 강제 사용하지 말 것

**크기 / 굵기**
```
최대 숫자 (금액/시간):  48px, weight 900
제목 (H1):             28px, weight 900
부제목 (H2):           22px, weight 700
본문:                  16px, weight 400
캡션:                  13px, weight 300
뱃지/태그:             11px, weight 500
```

### 간격 (Spacing)

```
화면 패딩:        24px 좌우
카드 패딩:        20px
카드 간 간격:     16px
섹션 간 간격:     32px
요소 간 최소:     8px
```

### 컴포넌트 규격

```
버튼 (Primary):   height 56px, borderRadius 14px, 초록 배경
버튼 (Secondary): height 48px, borderRadius 12px, 투명 + 보더
카드:             borderRadius 16px, 배경 #14141e, 보더 rgba(255,255,255,0.06)
입력 필드:        height 52px, borderRadius 12px
토글 스위치:      width 64px, height 36px
뱃지:             borderRadius 100px, padding 4px 12px
```

### 애니메이션

```
기본 전환:        duration 200ms, easing ease-out
화면 전환:        duration 300ms, slide from right
숫자 카운트:      duration 500ms, ease-in-out
성공 효과:        confetti 또는 pulse glow
실패 효과:        shake + red flash
토글 밀기:        spring animation
```

### 금지 사항
- ❌ 그라데이션 배경 남용
- ❌ 그림자(shadow) 과다 사용
- ❌ 작은 글씨에 중요한 정보
- ❌ 흰색 배경 사용
- ❌ 체계 없는 색상 추가
- ❌ 장식 목적의 아이콘 남발
- ❌ Inter, Roboto, Arial 같은 기본 폰트

---

## 앱 상수 (Config)

모든 값은 `src/constants/config.ts` (클라이언트) 및 `functions/src/utils/config.ts` (서버)에 **중앙화**한다. 변경 시 양쪽 동시 수정 필수.

```ts
// 챌린지 시간
challenge.startHour           = 22        // 밤 10시 (KST)
challenge.endHour             = 0         // 자정 (KST, 다음날 00:00)
challenge.durationHours       = 7         // 수면 시간
challenge.settlementHour      = 7         // 아침 7시 정산

// 유예 (Grace)
grace.maxCount                = 3         // 최대 유예 횟수
grace.durationSeconds         = 60        // 1회당 유예 시간 (초)

// Heartbeat (이탈 감지)
heartbeat.intervalSeconds     = 30        // 클라이언트 ping 주기
heartbeat.serverTimeoutSeconds = 120      // 서버가 이탈로 판정하는 무응답 시간

// 참여 금액 (원) — 2026-04-27 변경: 1,000원 제거, 3,000원 신설
amounts                       = [3000, 5000, 10000]      // 출시 초기
maxAmount                     = 10000                    // 확장 전 상한
// 확장 로드맵: 30000, 50000 추가 예정 (법률 검토 후)

// 예치금 충전 (원)
chargeAmounts                 = [5000, 10000, 30000, 50000]

// 수수료 — 2026-04-27 검토 중 (PG 미팅 후 확정)
fee.normalRate                = 0.2       // 현행 20% (변경 검토: 30% OR 챌린저스 룰)
fee.fridayRate                = 0.0       // ⚠️ 폐지 검토 중 (PG 충전 수수료 적자 위험)

// 챌린저스 룰 옵션: 총예치금의 5% OR 미환급액의 50% 중 큰 값
// 출처: https://biz-challengers.com/terms

// 무료 체험
freeTrial.days                = 3         // 신규 가입 3일

// 출금 — 2026-04-27 변경
withdrawal.minAmount          = 5000      // 최소 출금액 (3,000 → 5,000)
withdrawal.freeMonthlyCount   = 1         // 월 1회 무료
withdrawal.feePerExtra        = 500       // 추가 출금 시 건당 500원

// 알림
notification.reminderHour     = 21
notification.reminderMinute   = 30        // 밤 9:30 리마인더
notification.resultHour       = 7         // 아침 7시 결과

// 시간 허용 오차
timeDriftMaxMinutes           = 5         // 서버/로컬 시간 차이 한계
```

---

## 앱 기능 스펙

### 핵심 룰
- 참여 시간: 밤 10시 ~ 자정 12시 (서버 시간)
- 체크리스트 전체 동의 → 토글 스위치 밀기 → 챌린지 시작
- 시작 후 취소 불가
- 다른 앱 전환 시 1분(60초) 유예, 최대 3회
- 4회차 이탈 → 즉시 실패
- 7시간 후 자동 성공, 정산 아침 7시

### 시작 전 체크리스트
1. ☐ 전체 동의 (누르면 아래 6개 전부 체크)
2. ☐ 앱 자동 정리 프로그램 껐습니다
3. ☐ 배터리 50% 이상입니다 (자동 감지)
4. ☐ 앱 자동 업데이트 껐습니다
5. ☐ 저전력 모드 껐습니다 (자동 감지)
6. ☐ 시작 후 되돌릴 수 없음 이해합니다
7. ☐ 미준수로 인한 실패는 본인 책임입니다

### 참여 금액
- **출시 초기**: 3,000원 / 5,000원 / 10,000원 (상한 10,000원) — 2026-04-27 변경 (1,000원 제거)
- **확장 로드맵**: 출시 후 사용자 데이터·법률 검토·앱스토어 정책 확인 후 30,000원 / 50,000원 단계적 추가
- 금액은 서버·클라이언트 상수로 중앙화 (functions/src/utils/config.ts, src/constants/config.ts)
- 풀 통합 1개

### 수익 모델 (검토 중 — PG 미팅 후 확정)

**현행 (CLAUDE.md 초기)**:
- 플랫폼 수수료: 미환급액의 20%
- 상금: 미환급액의 80%를 성공자 분배
- 금요일 밤의 대학살: 수수료 0%

**변경 검토안 1 (단순화)**:
- 플랫폼 수수료: 미환급액의 **30%**
- 상금: 미환급액의 70%를 성공자 분배
- 금요일 0% **폐지** (또는 월 1회로 축소)

**변경 검토안 2 (챌린저스 룰)**:
- 플랫폼 수수료: **총예치금의 5% OR 미환급액의 50% 중 큰 값**
- 출처: https://biz-challengers.com/terms (7년 운영 검증된 룰)

**금요일 0% 폐지 사유 (중요)**:
PG 충전 수수료(카카오페이 직결제 0.6~1.55%)는 플랫폼 수수료와 별개로 무조건 발생. 1,000명 × 1만원 풀에서 0% 이벤트 시 PG 수수료 30만원이 그대로 적자. 참여자 많을수록 손실 비례 증가. **반드시 폐지 또는 축소 필요**.

**공통 원칙**:
- 성공자: 원금 100% 환급 + 상금
- 실패자: 참여금 전액 몰수
- 충전 수수료: 사용자 부담 X (플랫폼 흡수)

### 수면 레벨 시스템 (알 → 용 → 불사조)
- 0일: **잠알 #NNN** (1~100,000 랜덤 플레이어 번호 부여)
- 3일: **꿈틀알** (생존의 기미)
- 7일: **부화** (알을 깨고 나왔다)
- 14일: **병아리**
- 30일: **유니콘**
- 60일: **아기용**
- 100일: **불사조** (최고 레벨)

**레벨 아이콘**
- 이미지 2종 테마 제공: **컬러(v1)** / **블랙(v2)**
- 파일 경로: `src/assets/images/levels/{v1|v2}/level-{days}-{name}.png`
- 홈/프로필에서 아이콘은 아이들 애니메이션 (스케일 펄스 + 플로팅)
- 유저 테마 선택: AsyncStorage 영속 (`@kkora/levelTheme`)
- "?" 버튼 또는 아이콘 탭 → `LevelInfoModal` 오픈 (전체 레벨 미리보기 + 테마 전환)

**서버 동기화**
- `src/constants/levels.ts` 변경 시 반드시 `functions/src/challenge/fail.ts` + `settle.ts`의 `LEVEL_THRESHOLDS` 동시 수정
- 신규 유저 초기 레벨명은 3곳에 존재: `functions/src/user/create.ts`, `src/services/firebase/firestore.ts`, `firestore.rules` (create 검증)

### 레벨/스트릭 강등 룰
- **스트릭**: 실패 시 즉시 0으로 리셋 (연속일수는 무조건 깨짐)
- **레벨**: 스트릭과 분리하여 관리
  - 실패 1회: 레벨 유지 (스트릭만 리셋)
  - 같은 주 2회 실패: 1단계 강등
  - 복귀해서 다시 해당 일수 채우면 레벨 복구

### 무료 체험
- 최초 3일 무료 포인트 참여
- 성공 시 "만약 3,000원을 걸었다면 +267원을 받았을 거예요!" 표시 (최소 참여금 3,000원 기준)
- 4일차부터 유료 전환 유도

### 회원가입/인증
- 카카오 로그인만
- 카카오페이 1인 1계정 중복 방지

### 결제 / 자금 보관 아키텍처 (카카오페이머니 네이티브 모델)

**핵심 구조** (2026-04-27 결정):
```
[충전] 사용자 카카오페이 → 카카오페이 에스크로 (꺼라 가맹점 명의)
[잔액] Firestore DB 기록 (또는 카카오페이 sub-account)
[챌린지] DB 차감만 (실제 자금 이동 없음)
[정산] 카카오페이 송금 API로 결과 분배
[출금] 사용자가 카카오페이 앱에서 본인 계좌로 (펌뱅킹 불필요)
```

**채택 이유**:
- 자금이 우리 통장에 안 들어옴 → **전자금융거래법 등록 의무 면제**
- 카카오페이가 모든 라이선스 보유 (PG/에스크로/송금/선불전자지급수단)
- 직결제 수수료 **0.56~1.55%** (영세 0.6%, 일반 1.5% — 매출 적을 때 영세 자동 적용)
- 챌린저스 7년 운영의 표준 모델로 검증됨

**미팅 확인 필요 항목**:
1. 사용자별 잔액 분리 추적 (sub-account) 지원 여부
2. 가맹점 → 사용자 임의 송금 (B2C) API
3. Batch 송금 (100명 동시 다른 금액)
4. N:N 분배 정산 가능 여부

### 결제 수단 (최종은 PG 미팅 후 확정)

- **1순위 (확정 방향)**: 카카오페이머니 직결제 — 0.56~1.55%
- **2순위 (추가 검토)**: 토스페이 직결제 — 카카오페이 미사용자 30% 커버
- **3순위 (검토 중)**: 퀵계좌이체 (토스페이먼츠 PG 경유) — 2.0%
- **제외**: 신용카드 (수수료 3.4%), 무통장입금 (전자금융업 리스크)

### 충전·출금 정책

- **충전 단위**: 5,000 / 10,000 / 30,000 / 50,000원 (chargeAmounts)
- **참여 단위**: 3,000 / 5,000 / 10,000원 (amounts)
- **충전 수수료**: 사용자 부담 X (플랫폼 흡수)
- **출금 최소액**: 5,000원 (3,000 → 5,000 변경)
- **출금 수수료**: **월 1회 무료, 추가 시 건당 500원 고정**
- 챌린지: 앱 내 예치금 차감/복구
- 탈퇴 시 잔액 전액 환불 (출금 수수료 면제)

### 백업 PG (카카오페이 미사용자 대응)

- **토스페이먼츠** PG (가입비 22만원 + 연관리비 11만원)
- 카드 결제 3.4% (VAT 별도) — 마진 거의 없음, 폴백 용도만
- 현재는 **카카오페이 단일**로 시작, 매출 안정 시 토스페이먼츠 추가 검토

### 알림
- 밤 9:30 리마인더 푸시 1회
- 아침 7시 결과 알림

### 잠금화면
- iOS Live Activity / Android 위젯
- 토글 ON/OFF (기본 OFF)
- 남은 시간 + 생존자 수 표시

### 챌린지 감지 메커니즘 (기술 스펙)

**AppState 기준 이탈 정의**
- `active → background` **전환만** 이탈로 판정
- `active → inactive` (전화 수신, 알림센터 pull-down 등): **면제** (Apple/Google OS 동작)
- `background → active` 복귀: 유예 종료로 간주, 60초 이내 복귀 시 gracesUsed +1

**면제 규칙 (이탈로 카운트하지 않음)**
| 이벤트 | iOS | Android | 처리 |
|---|---|---|---|
| 화면 잠금 (전원 버튼) | inactive | onPause만, AppState 유지 | 면제 |
| 전화 수신 (통화) | inactive | inactive | 면제 (CallKit / TelephonyManager 감지) |
| 시스템 알림 (SMS, 알람) | inactive | active 유지 | 면제 |
| 음악 재생 (백그라운드) | background | background | **이탈로 처리** (사전 고지) |
| 앱 스위처 열기 | inactive | inactive | 면제 |
| 다른 앱 실행 | background | background | **이탈** → 60초 타이머 시작 |
| 시스템 업데이트 알림 dismiss | inactive | inactive | 면제 |

**Heartbeat**
- 주기: **30초**마다 클라이언트가 Cloud Function `pingChallenge` 호출
- 저장: `heartbeats/{challengeId}_{timestamp}` (또는 RTDB `heartbeats/{challengeId}`로 비용 최적화)
- 서버 타임아웃: **120초** 동안 heartbeat 없으면 `failChallenge(reason: 'heartbeat_lost')` 자동 실행
- 네트워크 끊김 유예: 최대 2분까지는 기다렸다가 실패 처리 (사용자 Wi-Fi 일시 끊김 보호)

**면제 예외 정책 (이탈로 처리하지 않는 물리적 사건)**
- **앱 강제 종료(kill swipe)**: 이탈로 처리 (사용자 의도 명확)
- **OS 자체 종료 (메모리 부족)**: 복귀 후 10초 이내 재접속 시 유예 1회 소모, 초과 시 실패
- **배터리 방전**: 배터리 0% → 재충전 후 복귀 시 `challenges/{id}.failReason = 'battery_drained'`, **참여금 환불** (단, 시작 시 배터리 50% 이상 체크 통과자에 한함)
- **앱 크래시**: Crashlytics 로그와 heartbeat 시각 대조 → 크래시 인증 시 유예 1회 소모, 2회차부터는 실패
- **기기 재부팅**: `background → terminated` 동일 취급, 이탈로 처리

**서버 측 최종 판정 (정산 시)**
1. heartbeat 마지막 시각 → 이탈 시점 확정
2. graceLogs 합산 → 남은 횟수 검증
3. Crashlytics 이벤트 크로스체크 → 예외 사유 확인
4. 불일치 시 `disputes` 컬렉션에 자동 기록 → 수동 검토

### 엣지 케이스 규칙

**참여자 수 기반**
- **참여자 1명**: 풀 혼자 차지, 수수료 0% 적용, 원금 100% + "오늘은 나밖에 없음" 메시지
- **전원 성공**: 미환급액 = 0, 수수료/상금 없음, 원금만 100% 환급, "전원 생존" 뱃지
- **전원 실패**: 전액 플랫폼 귀속 (수수료 20%), 다음 날 풀 시드머니로 사용하지 않음

**금액 분배 엣지**
- **상금 원단위 미만**: 내림 처리, 잔액은 플랫폼에 귀속 (감사 로그 기록)
- **참여자 2명 중 1명 성공, 금액 동일**: 패자 참여금 전액 → 수수료 공제 후 승자 단독 수령
- **참여자 2명 중 1명 성공, 금액 상이**: 승자가 큰 금액이어도 상금은 `패자 참여금의 80%` (비율 무관)

**정산 엣지**
- **아침 7시 정산 크론 실패**: 재시도 3회, 실패 시 Sentry 알림 + 수동 정산 대기
- **정산 중 Firestore 장애**: 트랜잭션 롤백 후 5분 재시도, 1시간 경과 시 운영자 개입
- **정산 완료 후 버그 발견**: `challenges/{id}.settled = true` 잠금, 수정은 `disputes` 플로우로만

**네트워크/클라이언트**
- **챌린지 중 인터넷 끊김**: heartbeat 타임아웃(120초) 이내 복구 시 유예 유지, 초과 시 실패 (단, 분쟁 제기 가능)
- **앱 강제 업데이트 필요**: 챌린지 진행 중 차단 금지, 종료 후 다음 참여 시 업데이트 강제
- **서버 시간 sync 실패**: 챌린지 시작 차단, "시간 확인 중" 토스트 → 재시도

**결제 엣지**
- **충전 중 네트워크 끊김**: PG 콜백 수신 전 사용자 앱 종료 → 재접속 시 `paymentStatus` 폴링으로 복구
- **PG는 성공했으나 Firestore balance 업데이트 실패**: `transactions` 컬렉션의 `status='pg_ok_balance_fail'` 레코드 → 운영자 수동 보정
- **출금 중 잔액 변동 (동시 챌린지 참여)**: 트랜잭션으로 출금 시점 잔액 재확인, 부족 시 출금 자동 취소

---

## MVP 화면 구조

```
1. Onboarding     — 앱 소개 3~4장 (최초 1회)
2. Login          — 카카오 로그인 버튼
3. Home           — 참전자 수 + 풀 금액 + "잠자기" 버튼
4. Checklist      — 전체 동의 + 6개 항목
5. Challenge      — 남은 시간 + 생존자 + 남은 기회
6. Result         — 성공/실패 + 수익 + 생존 카드
7. Profile        — 잔액 + 스트릭 + 레벨 + 충전/출금
8. History        — 월별 달력 + 수익 내역
9. Settings       — 잠금화면 토글 + 알림 + 1:1 문의
```

---

## 보안 규칙

### 클라이언트 (React Native)
- 예치금/상금 금액을 **절대 클라이언트에서 계산하지 않는다**
- API 키, 시크릿은 코드에 하드코딩 금지 → 환경 변수(.env) 사용
- .env 파일은 .gitignore에 반드시 포함
- 시간 관련 판단은 서버 시간만 사용 (로컬 시간 신뢰 금지)
- 사용자 입력은 항상 검증 (인젝션 방지)

### 서버 (Firebase)
- Firestore 보안 규칙:
  - 본인 데이터만 읽기/쓰기 가능
  - 예치금 필드는 **Cloud Functions만** 수정 가능
  - 챌린지 결과는 **Cloud Functions만** 기록 가능
- Cloud Functions:
  - 모든 금융 트랜잭션에 Firestore Transaction 사용
  - 입력값 서버사이드 재검증
  - Rate Limiting 적용 (과도한 요청 차단)
- 인증:
  - Firebase Auth + 카카오 Custom Token
  - 토큰 만료 관리 철저

### 코드/인프라
- API 키, 시크릿: 환경 변수(.env) 관리, 절대 커밋 금지
- Firebase 키스토어/인증서: 안전한 곳에 백업, 잃으면 안 됨
- GitHub: main 브랜치 직접 push 지양, feature 브랜치 사용
- 민감한 로그 (유저 정보, 금액) 프로덕션에서 출력 금지

### 부정행위 방지
- 카카오페이 1인 1계정 → 다계정 차단
- 참여 상한 10,000원
- 동일 기기 계정 전환 감지
- 로컬과 서버 시간 차이 5분 이상 → 참여 차단
- "자동 시간 설정" 비활성화 → 참여 차단

### 치팅 방어 테이블

| # | 공격 패턴 | 감지 방법 | 방어/처리 |
|---|---|---|---|
| 1 | **서브폰 사용** (메인폰은 잠들고 서브폰으로 놀기) | 앱 차원 감지 불가 | 사용자 자발성 전제 + 약관에 "본인 사용 기기 서약" |
| 2 | **양쪽 베팅** (친구와 한명씩 성공/실패 분담) | 동일 IP/deviceId/결제계좌 패턴 탐지 | Firebase Analytics + `users.deviceId` 인덱스, 의심 계정 수동 검토 |
| 3 | **비행기모드 유지** | heartbeat 무응답 감지 → 120초 타임아웃 | 자동 실패 처리, `failReason: 'heartbeat_lost'` |
| 4 | **시간 조작** (기기 시계 변경) | 서버 시간과 로컬 시간 diff 체크 | 5분 이상 차이 시 참여 차단, 챌린지 중 발견 시 실패 |
| 5 | **앱 리버스 엔지니어링** (클라이언트 조작) | — | 금융 로직 서버 only, 클라이언트 값 불신 |
| 6 | **루팅/탈옥 기기** | `expo-device` + `jail-monk` 등 감지 라이브러리 | 감지 시 참여 차단 (선택적, Phase 2) |
| 7 | **에뮬레이터 참여** | `expo-device.isDevice` 체크 | 참여 차단 |
| 8 | **다계정 (카카오 ID 부계정)** | kakaoId + 카카오페이 계정 + deviceId 3중 체크 | 중복 시 가입 차단, 기존 계정 병합 유도 |
| 9 | **챌린지 중 VPN 전환** | 서버에서 IP 변경 로그만 기록 | 단독 근거로는 실패 처리하지 않음 (정상 사용자 피해 방지) |
| 10 | **자동 복귀 매크로** | grace 타이머 만료 직전 복귀 패턴 반복 감지 | 3회 연속 패턴 시 수동 검토 큐 추가 |
| 11 | **Cloud Functions 직접 호출 우회** | Auth 토큰 검증 + Rate Limiting | 비인증 호출 거부, 초당 제한 초과 시 차단 |
| 12 | **동시 여러 기기 로그인** | Firebase Auth 세션 추적 | 챌린지 진행 중엔 단일 세션만 허용 |

### 분쟁 처리 프로세스

**플로우**
```
[1] 사용자 이의 제기 (Settings → 1:1 문의 → "챌린지 판정 이의")
    ↓ disputes/{disputeId} 생성 (status: 'open')
[2] 자동 판정 (Cloud Function: autoJudgeDispute)
    - heartbeats, graceLogs, Crashlytics 이벤트 조합 분석
    - 명백한 근거가 있으면 autoJudgement 필드에 결과 기록
    ↓ status: 'reviewing' (자동 판정 불가) 또는 'resolved_*' (자동 해결)
[3] 수동 검토 (운영자, 24시간 이내)
    - 자동 판정 결과 + 사용자 제출 증거 확인
    - 필요 시 사용자에게 추가 자료 요청 (푸시 알림)
    ↓
[4] 최종 판정
    - resolved_approve: 환불 → transactions 레코드 생성 (type: 'adjustment')
    - resolved_reject: 거부 사유 사용자에게 전송
    - escalated: CS 팀 2차 검토 (복잡한 케이스)
```

**SLA**
- 자동 판정: 즉시 (Cloud Function trigger)
- 수동 검토 응답: **24시간 이내** (영업일 기준)
- 최종 해결: 접수 후 **72시간 이내**

**자동 환불 트리거 (disputes 없이 즉시 환불)**
- 배터리 방전 + 시작 시 50% 이상 통과 확인
- Crashlytics 크래시 이벤트 + heartbeat 단절 시각 일치
- Firestore 장애 로그 시점에 정산 실패

### 환불 정책 3단 계층 (치팅 방어 설계)

외부 장애 환불 요청을 사용자 주장이 아닌 **서버 로그 기반**으로 판정한다. 전액 무조건 환불은 치팅 인센티브를 만들기 때문에 아래 3단 계층을 적용한다.

**1단: 자동 환불 (즉시, disputes 없이)**
- Crashlytics 크래시 이벤트 + heartbeat 단절 시각 일치 (60초 오차 이내)
- Firestore/서버 장애 로그 시점과 정산 실패 시각 일치
- **계정당 월 1회 한도** (초과 시 2단으로 이관)

**2단: 수동 검토 (24~72시간)**
- **배터리 방전**: 시작 시 50% 이상 체크 통과자에 한함 + 배터리 소모 속도가 정상 범위 이내
- **네트워크 장애**: 통신사 IP 로그 기반 광역 장애 시점 확인
- **OS 자체 종료 (메모리 부족)**: 복귀 후 10초 이내 재접속 로그 확인
- 모두 **2회차부터는 실패 처리** (반복 패턴 = 치팅 의심)

**3단: 절대 환불 불가 (즉시 실패 확정)**
- 다른 앱 실행으로 인한 이탈 (명백한 사용자 의지)
- 알 수 없는 재부팅이 3회 이상 반복 (치팅 패턴)
- 루팅/탈옥 기기 감지 (`expo-device` + jail-monk) — 애초 참여 차단이 원칙
- 앱 강제 종료(kill swipe)

**운영 원칙**
- 사용자 주장만으로 환불하지 않는다 — 반드시 객관 서버 로그 요구
- 환불 거부 시 사유를 상세 문자/푸시로 통지 (disputes 재제기 가능)
- 월 환불 횟수가 임계치 초과한 계정은 별도 큐로 분리하여 수동 감사

---

## 백업 플랜 (서비스 긴급 중단 대응)

> 앱스토어 사후 제거, 법적 제재, 카카오페이 계약 해지 등 **심사 통과 이후에도 발생 가능한 중단 사태**에 대비한다. 상세 절차는 [`docs/emergency/takedown-playbook.md`](docs/emergency/takedown-playbook.md) 참조.

### 구현된 기술 수단

| 수단 | 파일 | 용도 |
|---|---|---|
| **Kill Switch** | `functions/src/emergency/serviceKillSwitch.ts` | Firestore 플래그로 신규 챌린지/충전 즉시 차단 (재배포 불필요) |
| **Bulk Refund** | `functions/src/emergency/bulkRefund.ts` | 전체 유저 예치금 일괄 환불 (dryRun 필수 선행, 배치 2000명) |
| **User Data Export** | `functions/src/emergency/exportUserData.ts` | 유저 본인 데이터 JSON 다운로드 (개인정보이동권) |
| **Takedown Playbook** | `docs/emergency/takedown-playbook.md` | T+0 ~ T+30일 단계별 대응 SOP |
| **Notice Templates** | `docs/emergency/user-notices.md` | 시나리오별 공지 템플릿 5종 (법무 검토 필수) |
| **PWA Fallback** | `docs/emergency/pwa-fallback.md` | 앱 제거 시 웹 출금/조회 창구 설계 |
| **Legal Archive** | `docs/legal/README.md` | 자문·유권해석·계약서 원본 PDF 보관 규칙 |

### 운영 수단 (코드 외)

- **분쟁 대응 준비금**: 오픈 당일 기준 전체 예치금의 **110%** 별도 계좌 동결
- **법무법인 리테이너**: 긴급 대응 조항 포함, 출시 8주 전까지 계약 체결
- **환불 재원 전용 계좌**: 매출과 분리, 서비스 종료 시 환불 우선 재원
- **Firestore 일 1회 백업 크론**: `gcloud firestore export gs://kkora-backup/daily-{yyyy-mm-dd}`

### 절대 원칙

1. **출금 기능은 어떤 상황에서도 유지** — 유저 환불 출구
2. **진행 중 챌린지는 정상 정산 후 종료** — 강제 실패 금지 (분쟁 소지)
3. **공지 발송 전 법무법인 검토** — 금칙어(도박/불법/사기) 회피
4. **모든 긴급 조치는 `auditLogs/` 기록** — 사후 감사·재발 방지

### Kill Switch 연동 의무

`startChallenge`, `requestDeposit`, `pingChallenge` 등 유저 액션 진입 함수는 아래 체크를 함수 초입에 포함해야 한다:

```ts
const flag = await db.collection('systemFlags').doc('service').get();
if (flag.exists && flag.data()?.blockChallenge) {
  throw new functions.HttpsError('unavailable', flag.data()!.reason);
}
```

출금(`requestWithdrawal`)은 `blockWithdrawal` 플래그를 별도 확인하되, **기본값은 false** (환불 출구 보존).

---

## 기술 스택

```
프레임워크:     React Native + Expo SDK 52
언어:           TypeScript (strict mode)
상태관리:       React Context + useState
네비게이션:     React Navigation (Native Stack)
백엔드:         Firebase (Auth, Firestore, Cloud Functions, FCM)
결제:           카카오페이 PG
분석:           Firebase Analytics + Crashlytics
빌드:           EAS Build
배포:           App Store + Google Play
코드 품질:      ESLint + Prettier
테스트:         Jest + React Native Testing Library
```

---

## Firebase 비용 최적화 메모

챌린지 특성상 **동시 참여자 수 × 30초 heartbeat**가 전체 비용을 지배한다. 초기 설계부터 최적화 필수.

### Firestore vs RTDB 용도 분리

| 데이터 | 저장소 | 이유 |
|---|---|---|
| users, challenges, transactions, disputes, dailyPool | **Firestore** | 트랜잭션·쿼리·인덱스 필요 |
| **heartbeats** | **RTDB** (Realtime Database) | 30초 간격 덮어쓰기 → Firestore 쓰기 요금(1건당 $0.18/10만건) 압도적 불리, RTDB는 대역폭 과금 |
| graceLogs | Firestore | 영구 보관, 분쟁 시 증거 |

**예상 비용 비교 (1,000명 동시 참여, 7시간)**
- Firestore만 사용: 1,000명 × 7시간 × 120회/시간 = **840,000 writes/night** → 약 $1.5/일
- RTDB로 heartbeat 분리: 대역폭 약 50MB/일 → 약 **$0.05/일** (30배 절감)

### 쿼리 최적화 규칙
- 정산 함수(`settleDailyPool`)는 `dailyPool.settled == false` 필터 + `limit(500)` 배치 처리
- 헤비 쿼리에는 복합 인덱스 필수 (firestore.indexes.json 관리)
- 실시간 리스너는 화면 활성화 시에만, `onSnapshot` 언마운트 시 즉시 해제
- **`.get()` 남발 금지** — 리스트 화면은 페이지네이션(20개)

### Cloud Functions 최적화
- `region: 'asia-northeast3'` (서울) 고정 → 한국 유저 지연 최소 + 데이터 전송 비용 절감
- 동시 실행(minInstances): 0 (콜드 스타트 감수), 정산 크론만 warm up
- 함수 timeout: 60초 기본, 정산 함수만 540초
- 메모리: 256MB 기본, 정산 함수만 1GB

### Cloud Storage
- 분쟁 증거 스크린샷만 저장, 생명주기 규칙: 90일 후 자동 삭제
- 사용자당 업로드 10MB 제한

### 모니터링
- Firebase 사용량 알림: 일일 예산 초과 시 SMS
- Crashlytics 크래시율 > 1% 시 Slack 알림
- Cloud Functions 에러율 > 5% 시 Sentry 알림

---

## 폴더 구조

```
kkora/
├── CLAUDE.md
├── app.json
├── App.tsx
├── .env
├── .env.example
├── .gitignore
├── tsconfig.json
│
├── src/
│   ├── app/
│   │   ├── AppNavigator.tsx
│   │   └── linking.ts
│   │
│   ├── screens/
│   │   ├── OnboardingScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ChecklistScreen.tsx
│   │   ├── ChallengeScreen.tsx
│   │   ├── ResultScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button.tsx
│   │   │   ├── Text.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Toggle.tsx
│   │   │   └── Icon.tsx
│   │   │
│   │   ├── molecules/
│   │   │   ├── ChecklistItem.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── TimerDisplay.tsx
│   │   │   ├── LevelBadge.tsx
│   │   │   └── AmountSelector.tsx
│   │   │
│   │   └── organisms/
│   │       ├── ChallengePanel.tsx
│   │       ├── SurvivorCard.tsx
│   │       ├── WarBroadcast.tsx
│   │       └── HistoryCalendar.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useChallenge.ts
│   │   ├── useBalance.ts
│   │   ├── useTimer.ts
│   │   ├── useAppState.ts
│   │   └── useNotification.ts
│   │
│   ├── services/
│   │   ├── firebase/
│   │   │   ├── config.ts
│   │   │   ├── auth.ts
│   │   │   ├── firestore.ts
│   │   │   └── functions.ts
│   │   │
│   │   ├── payment/
│   │   │   └── kakaopay.ts
│   │   │
│   │   └── notification/
│   │       ├── local.ts
│   │       └── push.ts
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ChallengeContext.tsx
│   │
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── levels.ts
│   │   └── config.ts
│   │
│   ├── utils/
│   │   ├── format.ts
│   │   ├── time.ts
│   │   ├── validation.ts
│   │   └── security.ts
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── challenge.ts
│   │   ├── payment.ts
│   │   └── navigation.ts
│   │
│   └── assets/
│       ├── images/
│       │   ├── logo.png
│       │   ├── onboarding/
│       │   └── levels/
│       └── fonts/
│
├── functions/
│   ├── src/
│   │   ├── index.ts
│   │   ├── challenge/
│   │   │   ├── start.ts
│   │   │   ├── fail.ts
│   │   │   └── settle.ts
│   │   │
│   │   ├── payment/
│   │   │   ├── deposit.ts
│   │   │   ├── withdraw.ts
│   │   │   └── refund.ts
│   │   │
│   │   ├── notification/
│   │   │   ├── reminder.ts
│   │   │   └── result.ts
│   │   │
│   │   ├── user/
│   │   │   ├── create.ts
│   │   │   └── delete.ts
│   │   │
│   │   └── utils/
│   │       ├── time.ts
│   │       └── security.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── firestore.rules
├── firestore.indexes.json
│
└── docs/
    ├── specs/
    ├── qa/
    └── api/
```

---

## DB 구조 (Firestore)

```
users/{userId}
  ├── displayName: string
  ├── kakaoId: string
  ├── deviceId: string
  ├── balance: number              ← Cloud Functions만 수정 가능
  ├── freeTrialDaysLeft: number
  ├── streak: number
  ├── maxStreak: number
  ├── level: string
  ├── totalEarnings: number
  ├── createdAt: timestamp
  └── lastActiveAt: timestamp

challenges/{challengeId}
  ├── userId: string
  ├── date: string (YYYY-MM-DD)
  ├── amount: number
  ├── startTime: timestamp         ← 서버 시간으로 기록
  ├── status: 'active' | 'success' | 'failed'
  ├── failReason: string | null
  ├── gracesUsed: number (0~3)
  ├── settledAt: timestamp | null
  ├── earnings: number | null
  └── isFreePlay: boolean

dailyPool/{date}
  ├── totalParticipants: number
  ├── totalPool: number
  ├── survivors: number
  ├── failures: number
  ├── settled: boolean
  ├── isFriday: boolean
  └── feeRate: number (0 or 0.2)

graceLogs/{logId}
  ├── challengeId: string
  ├── userId: string
  ├── exitTime: timestamp
  ├── returnTime: timestamp | null
  ├── duration: number (seconds)
  └── result: 'returned' | 'failed'

transactions/{txId}                ← 돈 흐름 전수 추적 (CS/감사 필수)
  ├── userId: string
  ├── type: 'deposit' | 'withdraw' | 'challenge_bet' | 'challenge_refund' | 'prize' | 'fee' | 'adjustment'
  ├── amount: number (원, 음수 가능 — 차감은 -)
  ├── balanceBefore: number        ← 트랜잭션 직전 잔액
  ├── balanceAfter: number         ← 트랜잭션 직후 잔액
  ├── relatedId: string | null     ← challengeId 또는 paymentId 등
  ├── status: 'pending' | 'success' | 'failed' | 'pg_ok_balance_fail' | 'reversed'
  ├── pgResponse: object | null    ← PG 원본 응답 (JSON)
  ├── createdAt: timestamp
  └── reason: string | null        ← 운영자 수동 조정 사유

heartbeats/{challengeId}           ← RTDB 권장 (비용 최적화, Firebase 비용 메모 참조)
  ├── userId: string
  ├── lastPingAt: timestamp        ← 30초마다 덮어씀
  ├── pingCount: number            ← 누적 ping 수
  ├── appState: 'active' | 'background'
  └── batteryLevel: number | null  ← 분쟁 증거용

disputes/{disputeId}               ← 이의 제기 처리
  ├── userId: string
  ├── challengeId: string | null   ← 결제 분쟁은 null 가능
  ├── type: 'challenge_result' | 'payment' | 'refund' | 'other'
  ├── reason: string               ← 사용자 제출 내용
  ├── evidence: string[] (URLs)    ← 스크린샷 등 Cloud Storage 경로
  ├── status: 'open' | 'reviewing' | 'resolved_approve' | 'resolved_reject' | 'escalated'
  ├── autoJudgement: object | null ← 자동 판정 결과 (heartbeat + crashlytics 조합)
  ├── resolution: string | null    ← 운영자 최종 판정 사유
  ├── refundAmount: number | null  ← 승인 시 환불 금액
  ├── createdAt: timestamp
  ├── respondedAt: timestamp | null
  └── assignedTo: string | null    ← 담당 운영자 uid
```

---

## Git 브랜치 전략

```
main              ← 배포 가능한 안정 코드만
  └── develop     ← 개발 통합 브랜치
       ├── feature/home-screen
       ├── feature/challenge-flow
       ├── feature/payment
       └── fix/timer-bug
```

- feature 완성 → develop에 머지
- 테스트 통과 → main에 머지
- main은 항상 빌드 가능한 상태 유지
