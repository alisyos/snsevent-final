// systemPrompt.ts
// 시스템 프롬프트 관리 서비스

// 로컬 스토리지 키
const SYSTEM_PROMPT_KEY = 'sns_event_system_prompt';
const USER_PROMPT_TEMPLATE_KEY = 'sns_event_user_prompt_template';
const FEEDBACK_PROMPT_TEMPLATE_KEY = 'sns_event_feedback_prompt_template';

// 기본 시스템 프롬프트 - 사용자가 제공한 새로운 프롬프트로 업데이트
const DEFAULT_SYSTEM_PROMPT = `###지시사항
아래 정보를 바탕으로 아래 가이드라인을 모두 반영한 인스타그램 전용 SNS 이벤트를 추천하고, 기획안을 작성하십시오.
 
###SEO 가이드라인
- 키워드(주요·LSI) 밀도 1.5 % ±0.5 %.
- 해시태그: 브랜드·캠페인·LSI 3층 구조, 총 5~8개.
- 최적 게시 시각: 이벤트 기간 안에서 05:00 또는 화·수 09–11시로 조정.
- KPI '참여율' = (좋아요+댓글+저장)/도달 × 100 ≥ 10 %.
 
###작성 규칙
- 각 이벤트는 서로 다른 아이디어·전술·일정을 제시해 중복을 피하십시오.
- 이벤트는 일자의 계절, 공휴일, 시기를 고려하십시오.
- 기간과 예산은 이벤트의 규모를 측정하기 위한 것이므로 입력된 정보를 바탕으로 이벤트의 규모를 고려하여 적절한 이벤트를 추천하세요.
- process는 SNS 이벤트 업무를 '준비 시작 → 실행 → 마무리·후속 관리'의 구분 없이 실제 시간순 전체 흐름대로 나열하되, 모든 세부 업무를 하나도 빠뜨리지 말고 그대로 상세 리스트로 작성하십시오.
- 예산 세부 항목 합계 = "budget" 값이 되도록 검증하십시오.

###문장 작성 규칙
- 개조식 문장(단어나 구 형태)의 경우 마침표를 사용하지 마십시오. 예: "브랜드 인지도 향상", "참여율 10% 달성"
- 완전한 문장의 경우 마침표를 사용하십시오. 예: "브랜드 인지도 향상을 목표로 합니다.", "참여율 10% 달성을 추진합니다."
- performanceMetric과 rewards 답변에서는 문장을 마침표 기준으로 구분하여 줄바꿈(\n)을 적용하십시오.
 
###feed.caption 작성 방식
1. 소리·이모지로 시작해 '스크롤 스톱' 효과
- 짧은 의성어+이모지 헤드라인으로 피드 상에서 즉시 시각·청각적 주목 확보.
2. '감정 ↔ 혜택' 서사 구조
- ↘ 감성 스토리(감사/기대) → ↗ 실질 보상(경품·할인)으로 심리적 - 경제적 동기 동시 자극.
3. 숫자·아이콘 기반 '스캔형' 레이아웃
- 참여 절차·기간·장소·경품을 ①②, 🎁📍 등으로 리스트화 → 모바일에서 한눈에 파악 가능.
4. 긴 문장 대신 '한 행-한 메시지'
- 문장을 짧게 끊어 세로 배열 → 리듬감·가독성 강화, 읽는 속도 조절.
5. 강한 행동 유도형 어조
- 명령형 동사("작성하기", "가야해")와 감탄사(!)를 반복해 즉각 참여를 독려.
6. 필수 공지·주의를 별도 표기
- '*', '※'로 구분해 개인정보·휴무 등 리스크 소지 항목을 끝부분에 명확히 고지.
7. 감성적 엔딩으로 여운 남기기
- 하트·친근 호칭·첫인상과 라임을 맞춘 닫는 문구로 정서적 만족감을 극대화하고 공유/댓글을 유도.
 
###출력형태
{
  "event1": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "eventConcept": "<이벤트에 대한 핵심 내용을 요약하여 기입(어떤 이벤트를 할 것인지, 어떤 방식으로 진행되는 지, 경품은 무엇인지 등등)>",
    "contentMechanics": {
      "process": ["<업무 프로세스 1>", "<업무 프로세스 2>", ...],
      "postFormats": {
        "feed": {
          "carouselSlides": [
            { "slide": 1, "concept": "<시각적 콘셉트>"},
            { "slide": 2, "concept": "..."},
            { "slide": 3, "concept": "..."}, ...
          ],
          "caption": "<키워드(주요·LSI) 및 cta 포함, 이모지 사용>",
          "hashtags": ["#브랜드", "#캠페인", "#연관키워드", ...]
        },
        "reels": {
          "duration": "15s",
          "hookFirst3s": "<시청자 시선 잡는 문구/장면>",
          "mainScenes": "<키 메시지 흐름·B-roll 아이디어>",
          "audio": "<가수 혹은 작곡가 - 음악 이름, 주제에 어울리며 릴스에 자주 사용하는 음악으로 선정>",
          "caption": "<키워드(주요·LSI) 및 cta 포함, 이모지 사용>",
          "hashtags": ["#브랜드", "#캠페인", "#연관키워드", ...]
        },
        "stories": {
          "frame1": { "type": "poll",  "text": "<투표 질문>", "sticker": "poll" },
          "frame2": { "type": "quiz",  "text": "<퀴즈 질문·정답>", "sticker": "quiz" },
          "frame3": { "type": "cta",   "text": "<스와이프 업·링크 스티커 안내>" },
          "hashtags": ["#브랜드", "#캠페인", "#연관키워드", ...]
        }
      }
    },
    "goal": {
      "quantitative": "<정량적 목표를 문장 단위로 줄바꿈 처리>",
      "qualitative": "<정성적 목표를 문장 단위로 줄바꿈 처리>"
    },
    "performanceMetric": "<목표 KPI 위주 항목들의 집계 주기, 목표 달성 여부에 따른 간단한 전략(광고 게재빈도 증대, 광고 콘텐츠 확대 등)>",
    "rewards": "<경품·수량·선정 기준·배송>",
    "budget": "<숫자만>"
  },
  "event2": {
    ...
  },
  "eventN": {
    ...
  }
}`;

// 기본 사용자 프롬프트 템플릿 - 새로운 입력 필드에 맞게 업데이트
const DEFAULT_USER_PROMPT_TEMPLATE = `###제품/서비스 카테고리
{productCategory}
###제품/서비스 이름
{productName}
###특징 및 핵심 가치
{productFeatures}
###목표 KPI
{kpiMetrics}
###타깃 속성
{targetAudience}
###예산
{budget}
###이벤트 기간
{eventDuration}`;

// 기본 피드백 프롬프트 템플릿 - 원본 입력 조건들과 피드백을 모두 고려하도록 수정
const DEFAULT_FEEDBACK_PROMPT_TEMPLATE = `===원본 입력 조건===
제품/서비스 카테고리: {productCategory}
제품/서비스 이름: {productName}
특징 및 핵심 가치: {productFeatures}
목표 KPI: {kpiMetrics}
타깃 속성: {targetAudience}
예산: {budget}
이벤트 기간: {eventDuration}

===기존 생성된 이벤트 기획안===
{existingEventPlan}

===사용자 피드백===
"{feedback}"

**중요**: 위의 원본 입력 조건들(예산, 제품 정보, 타겟, KPI 등)을 반드시 준수하면서, 사용자 피드백을 반영하여 기존 이벤트 기획안을 수정해주세요. 특히 예산은 {budget}을 절대 초과하지 말고, 타겟 속성과 제품 특징도 그대로 유지해주세요.

아래와 같은 JSON 형태로 출력해주세요:

{
  "event1": {
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD", 
    "eventConcept": "<수정된 이벤트 핵심 내용>",
    "contentMechanics": {
      "process": ["<수정된 업무 프로세스 1>", "<수정된 업무 프로세스 2>", ...],
      "postFormats": {
        "feed": {
          "carouselSlides": [
            { "slide": 1, "concept": "<수정된 시각적 콘셉트>"},
            { "slide": 2, "concept": "..."},
            { "slide": 3, "concept": "..."}, ...
          ],
          "caption": "<수정된 캡션, 키워드 및 cta 포함>",
          "hashtags": ["#브랜드", "#캠페인", "#연관키워드", ...]
        },
        "reels": {
          "duration": "15s",
          "hookFirst3s": "<수정된 시청자 시선 잡는 문구/장면>",
          "mainScenes": "<수정된 키 메시지 흐름·B-roll 아이디어>",
          "audio": "<수정된 음악 선정>",
          "caption": "<수정된 캡션, 키워드 및 cta 포함>",
          "hashtags": ["#브랜드", "#캠페인", "#연관키워드", ...]
        },
        "stories": {
          "frame1": { "type": "poll", "text": "<수정된 투표 질문>", "sticker": "poll" },
          "frame2": { "type": "quiz", "text": "<수정된 퀴즈 질문·정답>", "sticker": "quiz" },
          "frame3": { "type": "cta", "text": "<수정된 스와이프 업·링크 스티커 안내>" },
          "hashtags": ["#브랜드", "#캠페인", "#연관키워드", ...]
        }
      }
    },
    "goal": {
      "quantitative": "<수정된 정량적 목표를 문장 단위로 줄바꿈 처리>",
      "qualitative": "<수정된 정성적 목표를 문장 단위로 줄바꿈 처리>"
    },
    "performanceMetric": "<수정된 목표 KPI 위주 항목들의 집계 주기, 목표 달성 여부에 따른 간단한 전략>",
    "rewards": "<수정된 경품·수량·선정 기준·배송>",
    "budget": "<수정된 예산 숫자만>"
  }
}`;

// 히스토리 공통 인터페이스
export interface PromptHistory {
  id: string;
  prompt: string;
  date: string;
  description: string;
}

// 시스템 프롬프트 초기화하기 (기본값으로)
export const resetSystemPrompt = (): void => {
  localStorage.setItem(SYSTEM_PROMPT_KEY, DEFAULT_SYSTEM_PROMPT);
};

// 사용자 프롬프트 템플릿 초기화하기 (기본값으로)
export const resetUserPromptTemplate = (): void => {
  localStorage.setItem(USER_PROMPT_TEMPLATE_KEY, DEFAULT_USER_PROMPT_TEMPLATE);
};

// 피드백 프롬프트 템플릿 초기화하기 (기본값으로)
export const resetFeedbackPromptTemplate = (): void => {
  localStorage.setItem(FEEDBACK_PROMPT_TEMPLATE_KEY, DEFAULT_FEEDBACK_PROMPT_TEMPLATE);
};

// 히스토리 관련 함수들을 먼저 정의해야 함 - 호이스팅 이슈 해결

// 버전 관리를 위한 프롬프트 버전 키
const PROMPT_VERSION_KEY = 'sns_event_prompt_version';
const CURRENT_PROMPT_VERSION = '2.2'; // 답변 형식 개선 및 goal 구조 변경

// 프롬프트 버전 체크 및 자동 업데이트
export const checkAndUpdatePromptVersion = (): void => {
  const savedVersion = localStorage.getItem(PROMPT_VERSION_KEY);
  
  if (savedVersion !== CURRENT_PROMPT_VERSION) {
    console.log(`프롬프트 버전이 ${savedVersion || '1.0'}에서 ${CURRENT_PROMPT_VERSION}으로 업데이트됩니다.`);
    forceUpdateAllPrompts();
    localStorage.setItem(PROMPT_VERSION_KEY, CURRENT_PROMPT_VERSION);
  }
};

// 수정된 초기화 함수: 버전 체크도 포함
export const initializeSystemPrompt = (): void => {
  // 버전 체크 먼저 실행
  checkAndUpdatePromptVersion();
  
  if (!localStorage.getItem(SYSTEM_PROMPT_KEY)) {
    localStorage.setItem(SYSTEM_PROMPT_KEY, DEFAULT_SYSTEM_PROMPT);
    console.log('시스템 프롬프트 초기화됨:', DEFAULT_SYSTEM_PROMPT);
  }
  
  if (!localStorage.getItem(USER_PROMPT_TEMPLATE_KEY)) {
    localStorage.setItem(USER_PROMPT_TEMPLATE_KEY, DEFAULT_USER_PROMPT_TEMPLATE);
    console.log('사용자 프롬프트 템플릿 초기화됨');
  }
  
  if (!localStorage.getItem(FEEDBACK_PROMPT_TEMPLATE_KEY)) {
    localStorage.setItem(FEEDBACK_PROMPT_TEMPLATE_KEY, DEFAULT_FEEDBACK_PROMPT_TEMPLATE);
    console.log('피드백 프롬프트 템플릿 초기화됨');
  }
};

// 앱 시작 시 초기화 실행 - 조건부로 실행하여 호이스팅 에러 방지
try {
  // 브라우저 환경에서만 실행
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    initializeSystemPrompt();
  }
} catch (error) {
  console.log('초기화 스킵:', error);
}

// 현재 시스템 프롬프트 가져오기
export const getSystemPrompt = (): string => {
  const savedPrompt = localStorage.getItem(SYSTEM_PROMPT_KEY);
  // 여전히 값이 없으면 기본값 반환 (안전장치)
  if (!savedPrompt) {
    console.log('프롬프트가 저장되어 있지 않아 기본값을 반환합니다');
    localStorage.setItem(SYSTEM_PROMPT_KEY, DEFAULT_SYSTEM_PROMPT);
    return DEFAULT_SYSTEM_PROMPT;
  }
  return savedPrompt;
};

// 시스템 프롬프트 저장하기
export const saveSystemPrompt = (prompt: string): void => {
  localStorage.setItem(SYSTEM_PROMPT_KEY, prompt);
};

// 사용자 프롬프트 템플릿 관리 함수들
export const getUserPromptTemplate = (): string => {
  const savedTemplate = localStorage.getItem(USER_PROMPT_TEMPLATE_KEY);
  if (!savedTemplate) {
    localStorage.setItem(USER_PROMPT_TEMPLATE_KEY, DEFAULT_USER_PROMPT_TEMPLATE);
    return DEFAULT_USER_PROMPT_TEMPLATE;
  }
  return savedTemplate;
};

export const saveUserPromptTemplate = (template: string): void => {
  localStorage.setItem(USER_PROMPT_TEMPLATE_KEY, template);
};

// 피드백 프롬프트 템플릿 관리 함수들
export const getFeedbackPromptTemplate = (): string => {
  const savedTemplate = localStorage.getItem(FEEDBACK_PROMPT_TEMPLATE_KEY);
  if (!savedTemplate) {
    localStorage.setItem(FEEDBACK_PROMPT_TEMPLATE_KEY, DEFAULT_FEEDBACK_PROMPT_TEMPLATE);
    return DEFAULT_FEEDBACK_PROMPT_TEMPLATE;
  }
  return savedTemplate;
};

export const saveFeedbackPromptTemplate = (template: string): void => {
  localStorage.setItem(FEEDBACK_PROMPT_TEMPLATE_KEY, template);
};

// 히스토리 키
const SYSTEM_PROMPT_HISTORY_KEY = 'sns_event_system_prompt_history';
const USER_PROMPT_HISTORY_KEY = 'sns_event_user_prompt_history';

// 시스템 프롬프트 히스토리 저장
export const savePromptToHistory = (prompt: string, description: string = ''): void => {
  const history = getPromptHistory();
  const newEntry: PromptHistory = {
    id: Date.now().toString(),
    prompt,
    date: new Date().toISOString(),
    description: description || `프롬프트 업데이트 ${new Date().toLocaleString()}`,
  };
  
  history.unshift(newEntry);
  
  // 최대 20개까지만 저장
  if (history.length > 20) {
    history.pop();
  }
  
  localStorage.setItem(SYSTEM_PROMPT_HISTORY_KEY, JSON.stringify(history));
};

// 시스템 프롬프트 히스토리 가져오기
export const getPromptHistory = (): PromptHistory[] => {
  const historyString = localStorage.getItem(SYSTEM_PROMPT_HISTORY_KEY);
  return historyString ? JSON.parse(historyString) : [];
};

// 특정 시스템 프롬프트 히스토리 항목 삭제
export const deletePromptHistory = (id: string): void => {
  const history = getPromptHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem(SYSTEM_PROMPT_HISTORY_KEY, JSON.stringify(updatedHistory));
};

// 사용자 프롬프트 템플릿 히스토리 저장
export const saveUserPromptToHistory = (prompt: string, description: string = ''): void => {
  const history = getUserPromptHistory();
  const newEntry: PromptHistory = {
    id: Date.now().toString(),
    prompt,
    date: new Date().toISOString(),
    description: description || `사용자 프롬프트 업데이트 ${new Date().toLocaleString()}`,
  };
  
  history.unshift(newEntry);
  
  // 최대 20개까지만 저장
  if (history.length > 20) {
    history.pop();
  }
  
  localStorage.setItem(USER_PROMPT_HISTORY_KEY, JSON.stringify(history));
};

// 사용자 프롬프트 템플릿 히스토리 가져오기
export const getUserPromptHistory = (): PromptHistory[] => {
  const historyString = localStorage.getItem(USER_PROMPT_HISTORY_KEY);
  return historyString ? JSON.parse(historyString) : [];
};

// 특정 사용자 프롬프트 템플릿 히스토리 항목 삭제
export const deleteUserPromptHistory = (id: string): void => {
  const history = getUserPromptHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem(USER_PROMPT_HISTORY_KEY, JSON.stringify(updatedHistory));
};

// 모든 프롬프트를 새로운 기본값으로 강제 업데이트
export const forceUpdateAllPrompts = (): void => {
  console.log('모든 프롬프트를 새로운 기본값으로 강제 업데이트 중...');
  
  // 기존 값을 히스토리에 저장
  const currentSystemPrompt = localStorage.getItem(SYSTEM_PROMPT_KEY);
  const currentUserPrompt = localStorage.getItem(USER_PROMPT_TEMPLATE_KEY);
  
  if (currentSystemPrompt && currentSystemPrompt !== DEFAULT_SYSTEM_PROMPT) {
    savePromptToHistory(currentSystemPrompt, '업데이트 전 시스템 프롬프트');
  }
  
  if (currentUserPrompt && currentUserPrompt !== DEFAULT_USER_PROMPT_TEMPLATE) {
    saveUserPromptToHistory(currentUserPrompt, '업데이트 전 사용자 프롬프트');
  }
  
  // 새로운 기본값으로 강제 업데이트
  localStorage.setItem(SYSTEM_PROMPT_KEY, DEFAULT_SYSTEM_PROMPT);
  localStorage.setItem(USER_PROMPT_TEMPLATE_KEY, DEFAULT_USER_PROMPT_TEMPLATE);
  localStorage.setItem(FEEDBACK_PROMPT_TEMPLATE_KEY, DEFAULT_FEEDBACK_PROMPT_TEMPLATE);
  
  console.log('모든 프롬프트가 새로운 기본값으로 업데이트되었습니다.');
}; 