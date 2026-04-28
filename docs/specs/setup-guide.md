# 꺼라 — 외부 서비스 셋업 가이드

> 이 문서를 따라가면 Firebase, 카카오 로그인, 카카오페이를 연결할 수 있는 "키"가 모두 준비됩니다.
> 각 단계 완료 후 `.env` 파일에 값을 붙여넣으면 됩니다.

---

## 0. 전체 흐름 한눈에 보기

```
① Firebase 프로젝트 생성        → 앱의 DB / 로그인 / 서버 함수 인프라
② 카카오 개발자 앱 등록          → 카카오 로그인 SDK 키
③ 카카오페이 가맹점 승인        → 결제 CID + Secret Key (사업자등록증 필요)
④ 키 → .env 붙여넣기 → 배포
```

**예상 소요**
- ① Firebase: 30분
- ② 카카오 로그인: 1시간 (심사 없음)
- ③ 카카오페이: **1~7일** (사업자등록증 제출 + 심사) — 가장 먼저 신청해두세요

---

## 1. Firebase 프로젝트 생성

### 1-1. 프로젝트 만들기
1. https://console.firebase.google.com 접속 → 구글 계정 로그인
2. **"프로젝트 추가"** 클릭
3. 이름: `kkora-prod` (운영용) — 나중에 `kkora-dev`도 따로 만들 것
4. Google Analytics: **사용 설정** (Firebase Analytics 스펙에 있음)
5. 계정 선택 → "Default Account for Firebase" 선택 → 프로젝트 만들기

### 1-2. 결제 수단 등록 (필수)
Cloud Functions는 **유료 플랜(Blaze)** 에서만 동작합니다.
- 프로젝트 콘솔 좌측 하단 **"Spark 플랜"** → **"요금제 업그레이드"** → **Blaze(종량제)** 선택
- 신용카드 등록
- 월 무료 할당량 내에서는 요금이 청구되지 않음 (초기 개발/테스트는 대부분 무료)

### 1-3. 앱 등록 (웹 SDK용 키 발급)
1. 프로젝트 개요 화면 → **`</>` 웹 아이콘** 클릭
2. 앱 닉네임: `kkora-web` (Expo가 내부적으로 웹 SDK를 씀)
3. Firebase Hosting 체크 **해제**
4. **"앱 등록"** → 나타나는 `firebaseConfig` 객체의 값들을 복사해서
   프로젝트 루트 `.env` 파일에 붙여넣기:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=kkora-prod.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=kkora-prod
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=kkora-prod.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123...:web:abc...
```

### 1-4. 서비스 활성화
좌측 메뉴에서 하나씩 들어가서 활성화:

| 서비스 | 경로 | 설정 |
|---|---|---|
| Authentication | 빌드 → Authentication → 시작하기 | 로그인 방법: **익명** 활성화 (개발용), **Custom Auth System** 활성화 (카카오용) |
| Firestore | 빌드 → Firestore Database → 데이터베이스 만들기 | **프로덕션 모드**, 리전: `asia-northeast3` (서울) |
| Cloud Functions | 빌드 → Functions → 시작하기 | (배포 시 자동 활성화됨) |
| Cloud Messaging | 빌드 → Cloud Messaging | 자동 활성화 |

⚠️ Firestore 리전은 **한 번 정하면 변경 불가**. 반드시 `asia-northeast3` (서울) 선택.

### 1-5. Firebase CLI 설치 및 로그인 (로컬 터미널)
```bash
npm install -g firebase-tools
firebase login
cd /Users/jasonkim/Desktop/Vibe\ Coding/kkora
firebase use --add kkora-prod
```

이후 배포는:
```bash
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only functions
```

### 1-6. 서비스 계정 키 (Cloud Functions용 Admin 권한)
Cloud Functions 내부에서는 자동으로 Admin 권한을 가지므로 별도 키 발급 불필요.
로컬에서 Admin SDK를 써야 할 때만:
- Firebase 콘솔 → 프로젝트 설정 → 서비스 계정 → **새 비공개 키 생성** → JSON 다운로드
- `functions/service-account.json` 으로 저장 (절대 git에 커밋 금지 — `.gitignore` 확인)

---

## 2. 카카오 개발자 (카카오 로그인)

### 2-1. 애플리케이션 만들기
1. https://developers.kakao.com 접속 → 카카오 계정 로그인
2. 우측 상단 **"내 애플리케이션"** → **"애플리케이션 추가하기"**
3. 입력:
   - 앱 이름: `꺼라`
   - 사업자명: 개인이면 본인 이름, 사업자면 상호
   - 카테고리: 라이프스타일
   - 앱 아이콘: `assets/icon.png` 업로드

### 2-2. 앱 키 확인
좌측 메뉴 **"앱 키"** 에서 4가지 키가 보입니다:

| 키 이름 | 용도 | 어디에 저장? |
|---|---|---|
| 네이티브 앱 키 | iOS/Android SDK에서 로그인 호출 | `app.json` 의 kakao config |
| **REST API 키** | **서버에서 토큰 검증/발급** | `functions/.env` 의 `KAKAO_REST_API_KEY` |
| JavaScript 키 | 사용 안 함 | — |
| Admin 키 | 서버 관리자 API | 사용 안 함, **절대 공개 금지** |

`.env` 에 다음과 같이 저장:
```
KAKAO_APP_KEY=네이티브 앱 키
KAKAO_REST_API_KEY=REST API 키
```

### 2-3. 플랫폼 등록
좌측 메뉴 **"플랫폼"** → 하단 **"플랫폼 등록"**

**iOS 추가**
- 번들 ID: `com.kkora.app` (EAS Build에서 사용할 동일 값)

**Android 추가**
- 패키지명: `com.kkora.app`
- 키 해시: EAS Build 후 아래 명령으로 얻음 (빌드 전에는 일단 비워둬도 됨)
  ```bash
  # 개발용 디버그 키 해시
  keytool -exportcert -alias androiddebugkey \
    -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
  ```

### 2-4. 카카오 로그인 활성화
좌측 메뉴 **"카카오 로그인"** → **활성화 ON**

**Redirect URI** 등록 (앱 딥링크):
- `kakao${NATIVE_APP_KEY}://oauth` (iOS/Android SDK용, 자동)
- `kkora://oauth/kakao` (앱 딥링크 — `app.json` 의 `scheme` 과 일치시켜야 함)

### 2-5. 동의 항목 설정
좌측 메뉴 **"카카오 로그인" → "동의 항목"**

- **닉네임**: 필수 동의
- **프로필 사진**: 선택 동의
- **카카오계정(이메일)**: 선택 동의

---

## 3. 카카오페이 결제 (가맹점 신청)

⚠️ **사업자등록증이 필수입니다.** 개인사업자라도 등록증만 있으면 됩니다.

### 3-1. 테스트 먼저 (승인 전 개발 가능)
카카오페이는 **테스트 CID `TC0ONETIME`** 을 제공합니다. 사업자등록 없이도 API 호출 테스트 가능.
- `.env.example` 에 이미 `KAKAOPAY_CID=TC0ONETIME` 을 기본값으로 둘 것
- Secret Key는 테스트용 키를 https://developers.kakaopay.com 문서에서 확인

### 3-2. 실제 가맹점 신청
1. https://pg.kakao.com 접속 → **"가맹점 신청"**
2. 사업자등록증 / 통장 사본 / 대표자 신분증 업로드
3. 심사 **영업일 3~5일** 소요
4. 승인 후 카카오페이 비즈에서 **운영 CID**, **Secret Key** 발급

`.env` 에 저장:
```
KAKAOPAY_CID=TC0ONETIME                 # 개발 중
# KAKAOPAY_CID=실제_발급받은_CID        # 운영 승인 후 교체
KAKAOPAY_SECRET_KEY=DEV...SecretKey
```

### 3-3. API 엔드포인트
운영용 엔드포인트 (v1):
- 준비: `POST https://open-api.kakaopay.com/online/v1/payment/ready`
- 승인: `POST https://open-api.kakaopay.com/online/v1/payment/approve`
- 취소: `POST https://open-api.kakaopay.com/online/v1/payment/cancel`

헤더:
```
Authorization: SECRET_KEY ${KAKAOPAY_SECRET_KEY}
Content-Type: application/json
```

자세한 흐름은 `functions/src/payment/deposit.ts` 주석 참고.

---

## 4. 출금 (사용자 → 본인 계좌)

카카오페이 결제는 **입금**만 가능. **출금(B2C 송금)** 은 별도 솔루션 필요:

### 옵션 A. 수동 출금 (MVP 권장)
1. 사용자가 앱에서 출금 신청 → `withdrawalRequests` 컬렉션에 기록
2. 관리자(본인)가 승인 → 본인 은행 앱에서 수동 이체 → Cloud Function `markWithdrawalComplete` 호출
3. 최소 3,000원 제한은 클라이언트 + 서버 모두에서 검증

### 옵션 B. 자동 출금 (확장 시)
- **토스페이먼츠 지급대행** (https://docs.tosspayments.com/guides/payouts) — 가장 진입장벽 낮음
- **금융결제원 오픈뱅킹 공동업무** — 전자금융업자 등록 필요
- **NHN KCP, 다날** — PG사 송금 서비스

초기에는 **옵션 A**로 시작 → 월 출금 총액 500만 원 넘어가면 옵션 B 전환 검토.

---

## 5. EAS Build (카카오 SDK 쓰려면 필수)

Expo Go에서는 카카오 로그인 SDK가 동작하지 않습니다. **Dev Client + EAS Build** 필요.

### 5-1. EAS CLI 설치
```bash
npm install -g eas-cli
eas login                    # Expo 계정
eas init                     # 프로젝트 연결
```

### 5-2. 개발 빌드 (한 번만)
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```
완료되면 기기에 설치할 수 있는 .ipa / .apk 링크가 나옴.

### 5-3. 이후 개발 사이클
```bash
npx expo start --dev-client   # 기기에 설치된 Dev Client로 붙음
```
JS 변경은 리빌드 없이 실시간 반영됨. 네이티브 의존성(`@react-native-seoul/kakao-login` 등) 추가 시에만 재빌드.

---

## 6. `.env` 최종 형태 (키 모두 수령 후)

```
# ───── Firebase (Expo 클라이언트용, EXPO_PUBLIC_ 접두사 필수) ─────
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=kkora-prod.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=kkora-prod
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=kkora-prod.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123...:web:abc...

# ───── 카카오 로그인 (클라이언트 공개 가능) ─────
EXPO_PUBLIC_KAKAO_APP_KEY=네이티브_앱_키
```

그리고 **`functions/.env`** (서버 전용, 절대 클라이언트에 노출 금지):
```
KAKAO_REST_API_KEY=REST_API_키
KAKAOPAY_CID=TC0ONETIME
KAKAOPAY_SECRET_KEY=DEV...SecretKey
KAKAOPAY_APPROVAL_URL=kkora://pay/approve
KAKAOPAY_CANCEL_URL=kkora://pay/cancel
KAKAOPAY_FAIL_URL=kkora://pay/fail
```

Cloud Functions에 환경 변수 배포:
```bash
cd functions
firebase functions:config:set kakao.rest_key="REST_API_키"
firebase functions:config:set kakaopay.cid="TC0ONETIME"
firebase functions:config:set kakaopay.secret="DEV...SecretKey"
firebase deploy --only functions
```

---

## 7. 체크리스트

각 단계 완료 시 ☑ 로 표시하세요.

### 계정 생성
- [ ] Firebase 프로젝트 `kkora-prod` 생성
- [ ] Firebase 요금제 Blaze 업그레이드
- [ ] Firestore `asia-northeast3` 생성
- [ ] Firebase Auth 익명 + Custom 활성화
- [ ] Firebase 웹 앱 등록 → `.env` 채움
- [ ] `npm install -g firebase-tools && firebase login`
- [ ] 카카오 개발자 앱 `꺼라` 생성
- [ ] 카카오 로그인 활성화 + Redirect URI 등록
- [ ] 카카오페이 가맹점 신청서 제출 (심사 대기)

### 로컬 환경
- [ ] `.env` 에 Firebase 6개 값 채움
- [ ] `.env` 에 카카오 앱 키 채움
- [ ] `functions/.env` 생성 후 카카오 REST 키 + 카카오페이 테스트 키 채움
- [ ] `npm install -g eas-cli && eas login`

### 배포 테스트
- [ ] `firebase deploy --only firestore:rules`
- [ ] `cd functions && npm install && npm run build`
- [ ] `firebase deploy --only functions`
- [ ] Firebase 콘솔 Functions 탭에서 함수 목록 확인

---

## 8. 문제 발생 시

- Firebase 배포 에러: `firebase --version` 이 13 이상인지 확인
- Cloud Functions 빌드 에러: `cd functions && npx tsc --noEmit` 로 타입 체크
- 카카오 로그인 "KOE101" 에러: 플랫폼 등록의 번들 ID/패키지명이 `app.json` 과 일치하는지 확인
- 카카오페이 401: Authorization 헤더 포맷 `SECRET_KEY ${키}` — 공백 하나, `Bearer` 아님
