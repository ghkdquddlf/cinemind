# CineMind - 영화 감상과 생각을 공유하는 공간

<div align="center">
  <img src="public/cinemind-logo.png" alt="CineMind 로고" width="200" />
  <p>영화에 대한 다양한 생각과 감정을 공유하는 플랫폼</p>
</div>

## 📚 프로젝트 소개

CineMind는 영화 리뷰 및 정보 공유 플랫폼으로, 사용자들이 영화에 대한 생각과 감상을 자유롭게 나누고 소통할 수 있는 공간입니다. 최신 영화 정보, 박스오피스 순위, 장르별 영화 추천 등 다양한 기능을 제공합니다.

### 주요 기능

- **일별 박스오피스**: 실시간으로 업데이트되는 일별 박스오피스 정보 제공
- **장르별 영화 탐색**: 다양한 장르별로 영화를 필터링하여 탐색 가능
- **영화 상세 정보**: 영화의 상세 정보, 출연진, 줄거리 등 제공
- **리뷰 및 댓글**: 영화에 대한 리뷰 작성 및 다른 사용자의 리뷰에 댓글 작성 가능
- **즐겨찾기**: 관심 있는 영화를 즐겨찾기에 추가하여 쉽게 접근 가능
- **마이페이지**: 사용자의 리뷰, 댓글, 즐겨찾기 영화를 한 곳에서 관리
- **다크모드**: 사용자 환경에 맞는 테마 선택 가능

## 🛠️ 기술 스택

### 프론트엔드

- **Next.js 14**: App Router, Server Components, Streaming
- **React**: 컴포넌트 기반 UI 개발
- **TypeScript**: 타입 안전성 확보
- **Tailwind CSS**: 반응형 디자인 및 UI 스타일링
- **next-themes**: 다크모드 구현

### 백엔드

- **Supabase**: 인증, 데이터베이스, 스토리지
- **Next.js API Routes**: 서버리스 API 엔드포인트

### 외부 API

- **KOBIS API**: 일별 박스오피스 정보
- **KMDB API**: 영화 상세 정보 및 포스터

## 🚀 설치 및 실행 방법

### 사전 요구사항

- Node.js 18.17.0 이상
- npm 또는 yarn

### 설치 단계

1. 저장소 클론

```bash
git clone https://github.com/yourusername/cinemind.git
cd cinemind
```

2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정
   `.env.local` 파일을 생성하고 다음 변수들을 설정합니다:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
KOBIS_API_KEY=your_kobis_api_key
KMDB_API_KEY=your_kmdb_api_key
```

4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

5. 브라우저에서 `http://localhost:3000`으로 접속

## 📂 프로젝트 구조

```
cinemind/
├── public/             # 정적 파일 (이미지, 아이콘 등)
├── src/                # 소스 코드
│   ├── app/            # Next.js App Router 페이지
│   │   ├── (home)/     # 홈 관련 컴포넌트
│   │   ├── admin/      # 관리자 페이지
│   │   ├── api/        # API 라우트
│   │   ├── auth/       # 인증 관련 페이지
│   │   ├── components/ # 공통 컴포넌트
│   │   ├── movies/     # 영화 관련 페이지
│   │   └── mypage/     # 마이페이지
│   ├── components/     # 전역 컴포넌트
│   ├── lib/            # 유틸리티 함수 및 훅
│   └── types/          # TypeScript 타입 정의
├── tailwind.config.ts  # Tailwind CSS 설정
└── next.config.js      # Next.js 설정
```

## 🌟 주요 구현 내용

### 렌더링 최적화

- **SSG (Static Site Generation)**: 자주 변경되지 않는 페이지에 적용
- **ISR (Incremental Static Regeneration)**: 주기적으로 업데이트가 필요한 페이지에 적용
- **SSR (Server-Side Rendering)**: 사용자별 개인화된 데이터가 필요한 페이지에 적용
- **Streaming**: 점진적 페이지 로딩으로 사용자 경험 향상

### 성능 최적화

- **이미지 최적화**: Next.js Image 컴포넌트를 활용한 이미지 최적화
- **코드 스플리팅**: 필요한 코드만 로드하여 초기 로딩 시간 단축
- **Suspense와 스켈레톤 UI**: 데이터 로딩 중 사용자 경험 개선

### 보안

- **인증 및 권한 관리**: Supabase Auth를 활용한 안전한 인증 시스템
- **데이터 접근 제어**: 사용자별 데이터 접근 권한 관리
- **API 보안**: 서버 측 검증을 통한 API 엔드포인트 보호

## 👥 기여자

- [황병일](https://github.com/ghkdquddlf) - 개발자

## 📞 연락처 - xhdlapdlxm12@naver.com

프로젝트에 관한 질문이나 제안이 있으시면 [xhdlapdlxm12@naver.com](mailto:xhdlapdlxm12@naver.com)로 연락주세요.
