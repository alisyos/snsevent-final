// 이벤트 폼 데이터 타입 정의
export interface EventFormData {
  productCategory: string;           // 제품/서비스 카테고리
  productName: string;              // 제품/서비스 이름
  productFeatures: string;          // 특징 및 핵심 가치
  kpiMetrics: string[];             // 목표 KPI
  targetAudience: string;           // 타깃 속성
  budget: string;                   // 예산
  startDate: string;                // 이벤트 시작일
  endDate: string;                  // 이벤트 종료일
}

// 이벤트 데이터 타입 정의
export interface EventData {
  startDate: string;
  endDate: string;
  eventConcept: string;
  contentMechanics: {
    process: string[];
    postFormats: {
      feed: {
        carouselSlides: Array<{
          slide: number;
          concept: string;
        }>;
        caption: string;
        hashtags: string[];
      };
      reels: {
        duration: string;
        hookFirst3s: string;
        mainScenes: string;
        audio: string;
        caption: string;
        hashtags: string[];
      };
      stories: {
        frame1: { type: string; text: string; sticker: string };
        frame2: { type: string; text: string; sticker: string };
        frame3: { type: string; text: string };
        hashtags: string[];
      };
    };
  };
  goal: {
    quantitative: string;
    qualitative: string;
  };
  performanceMetric: string;
  rewards: string;
  budget: string;
} 