#!/bin/bash
# 꺼라 프로젝트 폴더 구조 생성 스크립트
# 사용법: bash setup-structure.sh

echo "🌙 꺼라 폴더 구조 생성 중..."

# src 폴더 구조
mkdir -p src/app
mkdir -p src/screens
mkdir -p src/components/atoms
mkdir -p src/components/molecules
mkdir -p src/components/organisms
mkdir -p src/hooks
mkdir -p src/services/firebase
mkdir -p src/services/payment
mkdir -p src/services/notification
mkdir -p src/contexts
mkdir -p src/constants
mkdir -p src/utils
mkdir -p src/types
mkdir -p src/assets/images/onboarding
mkdir -p src/assets/images/levels
mkdir -p src/assets/fonts

# Firebase Cloud Functions
mkdir -p functions/src/challenge
mkdir -p functions/src/payment
mkdir -p functions/src/notification
mkdir -p functions/src/user
mkdir -p functions/src/utils

# 문서
mkdir -p docs/specs
mkdir -p docs/qa
mkdir -p docs/api

# .gitkeep (빈 폴더 유지)
touch docs/specs/.gitkeep
touch docs/qa/.gitkeep
touch docs/api/.gitkeep
touch src/assets/images/onboarding/.gitkeep
touch src/assets/images/levels/.gitkeep
touch src/assets/fonts/.gitkeep

echo "✅ 폴더 구조 생성 완료!"
echo ""
echo "다음 단계:"
echo "1. CLAUDE.md가 프로젝트 루트에 있는지 확인"
echo "2. cp .env.example .env 로 환경변수 파일 생성"
echo "3. echo '.env' >> .gitignore"
echo "4. Claude Code에서 '홈 화면 만들어줘'로 시작"
