# AI 기반 SNS 이벤트기획 제안 시스템

이 프로젝트는 AI를 활용하여 브랜드 마케터, 사업자, 콘텐츠 기획자가 효과적인 SNS 이벤트를 기획할 수 있도록 지원하는 자동화된 시스템입니다.

## 주요 기능

- **사용자 입력 인터페이스**: 제품/서비스 기본 정보, 마케팅 목표, 이벤트 실행 조건 등 입력
- **AI 기반 제안 엔진**: OpenAI API를 활용한 맞춤형 이벤트 컨셉 추천
- **최종 기획서 출력**: 이벤트 개요, 목적, 실행 방식, 예상 성과 등 포함
- **관리자 대시보드**: 이벤트 기획 이력 관리 및 통계 분석

## 사용 기술

- React 18 + TypeScript
- Material UI (MUI) v5
- OpenAI API (GPT-3.5)
- React Router v6

## 설치 및 실행 방법

1. 저장소 클론
```bash
git clone https://github.com/yourusername/snsevent.git
cd snsevent
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
    - 프로젝트 루트에 `.env` 파일 생성
    - OpenAI API 키 추가: `REACT_APP_OPENAI_API_KEY=your_api_key_here`

4. 개발 서버 실행
```bash
npm start
```

5. 빌드
```bash
npm run build
```

## 시스템 사용 방법

1. 홈페이지에서 "이벤트 기획 시작하기" 버튼 클릭
2. 단계별로 필요한 정보 입력
    - 제품/서비스 정보
    - 마케팅 목표 설정
    - 이벤트 실행 조건
    - 브랜드 정보 및 검토
3. 제출 후 AI 기반 이벤트 기획 제안 확인
4. 필요시 피드백 제공하여 기획안 수정
5. 최종 기획안 다운로드

## 시스템 구조

```
snsevent/
├── public/                 # 정적 파일
├── src/                    # 소스 코드
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   ├── services/           # API 및 서비스 관련 코드
│   ├── App.tsx             # 메인 앱 컴포넌트
│   └── index.tsx           # 앱 진입점
└── package.json            # 프로젝트 설정 및 의존성
```

## 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| REACT_APP_OPENAI_API_KEY | OpenAI API 키 | - |

## 라이선스

MIT License

## 연락처

프로젝트 관련 문의: example@example.com 