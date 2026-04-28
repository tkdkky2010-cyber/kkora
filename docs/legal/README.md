# 법률 문서 보관소

> 꺼라 운영에 필요한 법률 자문, 유권해석, 계약서, 심사 서한을 **원본 PDF**로 보관하는 폴더.

---

## 폴더 구조

```
docs/legal/
├── README.md                        ← 본 문서
├── opinions/                        ← 법무법인 자문 의견서
│   ├── 2026-xx-xx_{법인명}_전금법.pdf
│   ├── 2026-xx-xx_{법인명}_사행성.pdf
│   └── 2026-xx-xx_{법인명}_개인정보.pdf
├── authority/                       ← 정부기관 유권해석
│   ├── 2026-xx-xx_문체부_게임산업법.pdf
│   ├── 2026-xx-xx_금감원_전자금융업.pdf
│   └── 2026-xx-xx_방통위_위치정보.pdf
├── appstore/                        ← 애플·구글 서한
│   ├── apple_review_qa_{yyyy-mm-dd}.pdf
│   ├── google_policy_response_{yyyy-mm-dd}.pdf
│   └── rejection_logs/
├── contracts/                       ← 계약서
│   ├── kakaopay_pg_contract.pdf
│   ├── law_firm_retainer.pdf
│   └── accounting_firm.pdf
├── terms/                           ← 약관·정책 버전 관리
│   ├── v1.0_terms_of_service.pdf
│   ├── v1.0_privacy_policy.pdf
│   └── changelog.md
└── incidents/                       ← 이벤트 발생 시 증거
    └── {yyyy-mm-dd}/
        ├── notification.pdf
        ├── our_response.pdf
        └── firestore_snapshot.json
```

---

## 보관 원칙

1. **원본 우선**: 이메일·스캔본 모두 PDF로 통합 보관
2. **파일명 규칙**: `{yyyy-mm-dd}_{주체}_{주제}.pdf`
3. **버전 관리**: 약관 변경 시 이전 버전 삭제 금지 → 모두 보관
4. **git 포함**: PDF는 대용량이 아니므로 git에 커밋 (히스토리 감사 목적)
   - 단, 민감 개인정보 포함 문서는 `.gitignore` 대상 → 별도 암호화 저장소
5. **백업 이중화**: Google Drive + 로컬 암호화 외장하드 2곳

---

## 필수 확보 문서 체크리스트 (출시 전)

### 법무법인 자문 의견서
- [ ] **전자금융거래법 해당 여부** — 예치금 모델이 선불전자지급수단 발행업에 해당하는지
  - 시한: 개발 6주차 시작 전
  - 결론 반영 위치: CLAUDE.md 미결 #2
- [ ] **사행산업 리스크** — 게임산업법·사행행위법 적용 여부
  - 시한: 출시 4주 전
  - 결론 반영 위치: CLAUDE.md 미결 #3
- [ ] **개인정보보호법·정보통신망법** — 수집 항목, 보관 기간, 제3자 제공
  - 시한: 출시 4주 전
- [ ] **전자상거래법** — 통신판매업 신고 필요 여부, 청약철회 규정
  - 시한: 출시 6주 전
- [ ] **약관의 규제에 관한 법률** — 약관 검토 및 수정
  - 시한: 출시 2주 전

### 정부기관 유권해석
- [ ] **문체부 게임물관리위** — 꺼라가 게임에 해당하지 않음을 서면 확인
  - 시한: 출시 6주 전 접수, 회신 2~4주 소요 예상
- [ ] **금융감독원** — 전자금융업 비해당 확인 (해당 시 등록 필요)
  - 시한: 출시 6주 전

### 스토어 사전 확인
- [ ] **Apple App Review** — Resolution Center 또는 App Review Contact로 사전 문의
  - "수면 챌린지 + 보증금 환급 모델" 가이드라인 준수 여부
  - 시한: 출시 4주 전
- [ ] **Google Play Support** — 정책팀 서면 문의
  - 시한: 출시 4주 전

### 계약서
- [ ] 카카오페이 PG 가맹점 계약
- [ ] 법무법인 리테이너 계약 (긴급 대응 포함)
- [ ] 회계법인 계약
- [ ] 개인정보 처리위탁 계약 (Firebase, 카카오 등)

### 약관·정책 (자체 작성 후 법무법인 검토)
- [ ] 이용약관
- [ ] 개인정보처리방침
- [ ] 환불 정책
- [ ] 분쟁 처리 방침
- [ ] 운영 정책 (미성년자 차단, 다계정 금지 등)

---

## 커밋 규칙

```
legal: {카테고리} {간결한 설명}

예:
legal: opinions 전금법 자문 의견서 접수 (법무법인 XXX)
legal: authority 문체부 유권해석 질의서 발송
legal: appstore Apple 사전 문의 회신 수령 (정책 가이드 확인)
legal: incidents 2026-05-15 심사 리젝 대응 기록
```

---

## 민감 정보 취급

아래 문서는 **git 커밋 금지**, 별도 암호화 저장소에 보관:
- 법무법인 자문 과정의 원본 이메일 (변호사-의뢰인 비밀특권)
- 개인정보가 포함된 분쟁 증거 (disputes 케이스별 상세)
- 카카오페이 PG 계약서 중 요율·정산 조건 상세 페이지

→ `.gitignore`에 `docs/legal/private/` 추가 (아래 참고)

---

## 관련 문서

- [../emergency/takedown-playbook.md](../emergency/takedown-playbook.md) — 긴급 사태 대응
- [../review-defense.md](../review-defense.md) — 심사 방어 논리
- `/CLAUDE.md` 상단 "미결 사항" 표 — 4건 차단점
