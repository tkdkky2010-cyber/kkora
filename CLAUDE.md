# 꺼라 (KKORA) — 수면 챌린지 앱

> 폰을 끄면 돈을 번다

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
- **출시 초기**: 1,000원 / 5,000원 / 10,000원 (상한 10,000원)
- **확장 로드맵**: 출시 후 사용자 데이터·법률 검토·앱스토어 정책 확인 후 30,000원 / 50,000원 단계적 추가
- 금액은 서버·클라이언트 상수로 중앙화 (functions/src/utils/config.ts, src/constants/config.ts)
- 풀 통합 1개

### 수익 모델
- 성공자: 원금 100% 환급 + 상금 (수수료 0%)
- 실패자: 참여금 전액 몰수
- 플랫폼 수수료: 미환급액의 20%
- 상금: 미환급액의 80%를 성공자에게 참여 금액 비율로 분배
- 금요일 밤의 대학살: 수수료 0%

### 수면 레벨 시스템 (넘버링 + 등급 혼합)
- 0일: 참가자 ???번 (1~100,000 랜덤 번호 부여)
- 3일: 생존자 (번호 사라지고 생존자로 승격)
- 7일: 상위 50% (등급 시작)
- 14일: 상위 20% 🥈
- 30일: 상위 5% 🥇
- 60일: 상위 1% 💎
- 100일: VIP 🃏 (번호도 %도 필요 없는 존재)
- 365일: 호스트 👁️ (게임의 주인)

### 레벨/스트릭 강등 룰
- **스트릭**: 실패 시 즉시 0으로 리셋 (연속일수는 무조건 깨짐)
- **레벨**: 스트릭과 분리하여 관리
  - 실패 1회: 레벨 유지 (스트릭만 리셋)
  - 같은 주 2회 실패: 1단계 강등
  - 복귀해서 다시 해당 일수 채우면 레벨 복구

### 무료 체험
- 최초 3일 무료 포인트 참여
- 성공 시 "만약 1,000원을 걸었다면 +89원을 받았을 거예요!" 표시
- 4일차부터 유료 전환 유도

### 회원가입/인증
- 카카오 로그인만
- 카카오페이 1인 1계정 중복 방지

### 결제
- 카카오페이 예치금 모델 (PG 연동)
- 충전: **카카오페이머니 단일** — 카드·무통장입금 불가
  - 카드 제외 이유: 수수료 부담 (카카오페이머니 0.5~1.55% vs 카드 0.56~1.72%)
  - 무통장입금(개인 계좌) 제외 이유: 전자금융업법상 미등록 예치금 영업 리스크 + 입금자명 매칭 운영 부담 + 1인 1계정 우회 취약
- 챌린지: 앱 내 예치금 차감/복구
- 출금: 오픈뱅킹 API, 최소 3,000원
- 탈퇴 시 잔액 전액 환불

### 알림
- 밤 9:30 리마인더 푸시 1회
- 아침 7시 결과 알림

### 잠금화면
- iOS Live Activity / Android 위젯
- 토글 ON/OFF (기본 OFF)
- 남은 시간 + 생존자 수 표시

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
