# INCAR PROFILE

> AI로 완성하는 설계사 퍼스널 브랜딩 모바일 웹앱

---

## 📁 파일 구조

```
incar-profile/
├── pages/
│   ├── index.tsx              # 랜딩 페이지 (로고 + 버튼 2개)
│   ├── create.tsx             # 프로필 생성 플로우 (스텝 관리)
│   ├── profile/
│   │   └── [id].tsx           # 공개 프로필 페이지 (/profile/abc123)
│   └── api/
│       ├── ai/
│       │   └── generate.ts    # OpenAI 소개문 + 추천질문 생성
│       └── profile/
│           ├── save.ts        # Supabase DB 저장 + 이미지 업로드
│           └── remove-bg.ts   # Remove.bg API 배경 제거
├── components/
│   ├── layout/
│   │   └── Header.tsx         # 공통 헤더 (뒤로가기, Demo 뱃지)
│   ├── ui/
│   │   └── ProgressBar.tsx    # 진행률 바
│   └── profile/
│       ├── StepProfileType.tsx   # Step 1: 프로필 타입 선택
│       ├── StepAgentInfo.tsx     # Step 2: 기본 정보 입력
│       ├── StepPhotoUpload.tsx   # Step 3: 사진 업로드
│       ├── StepAIGenerate.tsx    # Step 4: AI 생성 로딩
│       └── StepPreview.tsx       # Step 5: 미리보기 + URL 발급
├── lib/
│   ├── supabase.ts            # Supabase 클라이언트
│   ├── openai.ts              # OpenAI 헬퍼
│   ├── removeBg.ts            # Remove.bg 헬퍼 (교체 가능)
│   └── demoData.ts            # Demo 모드 샘플 데이터
├── types/
│   └── index.ts               # TypeScript 타입 정의
├── styles/
│   └── globals.css            # 전역 스타일
├── .env.example               # 환경변수 템플릿
└── supabase-schema.sql        # DB 스키마 (처음 1회 실행)
```

---

## 🚀 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env.local
# .env.local 파일을 열고 실제 값 입력
```

### 3. Supabase 설정

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 내용 실행
3. Storage > New bucket: `profile-images` (Public 체크)
4. `.env.local`에 URL과 키 입력

### 4. 개발 서버 실행

```bash
npm run dev
# http://localhost:3000
```

---

## 🎭 Demo 모드

- `/` 에서 **Demo 체험하기** 클릭하면 자동 활성화
- 샘플 데이터 자동 입력
- AI API 호출 없음 (2초 로딩 후 샘플 결과)
- DB 저장 없음
- 결과 화면에 **DEMO** 배지 표시

---

## 🔑 필요한 API 키

| 서비스 | 용도 | 링크 |
|--------|------|------|
| Supabase | DB + Storage | [supabase.com](https://supabase.com) |
| OpenAI | 소개문 + 추천질문 생성 | [platform.openai.com](https://platform.openai.com) |
| Remove.bg | 배경 제거 (전문가형) | [remove.bg](https://www.remove.bg/api) |

> Remove.bg는 선택사항입니다. 실패해도 원본 이미지로 폴백됩니다.

---

## 💡 Remove.bg 교체 방법

`lib/removeBg.ts`의 `removeBackground` 함수만 교체하면 됩니다.
함수 시그니처: `(imageBase64: string) => Promise<string>`
