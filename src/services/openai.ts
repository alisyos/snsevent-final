import { Configuration, OpenAIApi } from 'openai';
import { getSystemPrompt, getUserPromptTemplate, getFeedbackPromptTemplate } from './systemPrompt';

// 환경 변수에서 API 키를 가져오거나 설정에서 관리
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

// 디버그: API 키 소스 확인
console.log("=== API 키 디버그 정보 ===");
console.log("REACT_APP_OPENAI_API_KEY 환경변수:", process.env.REACT_APP_OPENAI_API_KEY ? "존재" : "없음");
console.log("최종 OPENAI_API_KEY 값:", OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 10)}...` : "비어있음");

// API 설정
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// 이벤트 기획을 위한 입력 데이터 인터페이스
export interface EventPlanningInput {
  productName: string;
  productCategory: string;
  productFeatures: string;
  targetAudience: string;
  marketingGoals: string[];
  kpiMetrics: string[];
  budget: string;
  platforms: string[];
  eventDuration: string;
  prizes?: string;
  brandTone?: string;
  additionalInfo?: string;
  referenceLinks?: string;
  referenceFile?: File | null;
}

// 새로운 JSON 구조에 맞는 AI 응답 타입 정의
export interface PostFormat {
  carouselSlides?: { slide: number; concept: string }[];
  caption?: string;
  hashtags: string[];
  duration?: string;
  hookFirst3s?: string;
  mainScenes?: string;
  audio?: string;
  frame1?: { type: string; text: string; sticker?: string };
  frame2?: { type: string; text: string; sticker?: string };
  frame3?: { type: string; text: string };
}

export interface ContentMechanics {
  process: string[];
  postFormats: {
    feed: PostFormat;
    reels: PostFormat;
    stories: PostFormat;
  };
}

export interface EventData {
  startDate: string;
  endDate: string;
  eventConcept: string;
  contentMechanics: ContentMechanics;
  goal: {
    quantitative: string;
    qualitative: string;
  };
  performanceMetric: string;
  rewards: string;
  budget: string;
}

export interface AIEventResponse {
  [key: string]: EventData; // event1, event2, etc.
}

/**
 * OpenAI API를 사용하여 이벤트 기획안을 생성하는 함수
 * @param eventData 사용자 입력 이벤트 데이터
 * @returns Promise<AIEventResponse> AI가 생성한 이벤트 기획안
 */
export const generateEventPlan = async (eventData: EventPlanningInput): Promise<AIEventResponse> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    // 사용자 프롬프트 템플릿 가져오기
    let promptTemplate = getUserPromptTemplate();
    
    // 변수 치환 - 새로운 단순화된 필드에 맞게 수정
    let prompt = promptTemplate
      .replace('{productCategory}', eventData.productCategory)
      .replace('{productName}', eventData.productName)
      .replace('{productFeatures}', eventData.productFeatures)
      .replace('{kpiMetrics}', eventData.kpiMetrics.join(', '))
      .replace('{targetAudience}', eventData.targetAudience)
      .replace('{budget}', eventData.budget)
      .replace('{eventDuration}', eventData.eventDuration);

    console.log("=== OpenAI API 요청 정보 ===");
    console.log("입력 데이터:", JSON.stringify(eventData, null, 2));
    console.log("프롬프트:", prompt);

    // API 키가 없는 경우 목업 데이터 반환 (개발 모드)
    if (OPENAI_API_KEY === 'your_openai_api_key_here' || OPENAI_API_KEY === '') {
      console.log('개발 모드: API 키가 설정되지 않아 목업 데이터를 반환합니다.');
      // 새로운 JSON 구조에 맞는 목업 데이터 제공
      const mockData: AIEventResponse = {
        event1: {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          eventConcept: `${eventData.productName}과 함께하는 창의적인 UGC 챌린지입니다. 사용자들이 제품과 함께하는 특별한 순간을 SNS에 공유하고, 브랜드 인지도와 참여를 동시에 높이는 이벤트입니다.`,
          contentMechanics: {
            process: [
              "티저 콘텐츠 배포 (D-7): 인플루언서를 통해 챌린지 예고",
              "공식 런칭 (D-Day): 브랜드 계정에서 챌린지 방법과 상품 안내",
              "중간 리마인더 (D+7): 우수 참여 사례 소개 및 참여 독려",
              "마감 임박 알림 (D+12): 마지막 참여 독려",
              "수상자 발표 (D+14): 우수 참여자 10명 선정 및 발표"
            ],
            postFormats: {
              feed: {
                carouselSlides: [
                  { slide: 1, concept: "브랜드 로고와 제품 이미지로 챌린지 소개" },
                  { slide: 2, concept: "참여 방법과 단계별 가이드 안내" },
                  { slide: 3, concept: "경품 구성과 당첨자 발표 일정" }
                ],
                caption: `🎉 특별한 순간을 #${eventData.productName}챌린지 와 함께! ✨\n\n📸 ${eventData.productName}과 함께하는 창의적인 순간을 포착하세요\n🏆 총 10분께 특별한 선물을 드려요!\n\n참여방법 👇\n① 제품과 함께한 사진/영상 촬영\n② 해시태그와 함께 업로드\n③ 창의적인 캡션 작성\n\n마감: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n발표: 마감 후 3일 이내\n\n✨ 지금 바로 참여하세요! ✨`,
                hashtags: [`#${eventData.productName}챌린지`, `#${eventData.productCategory}`, `#${eventData.productName}`, "#이벤트"]
              },
              reels: {
                duration: "15s",
                hookFirst3s: "와! 이런 이벤트 처음이야! 🤩",
                mainScenes: "제품 사용 장면 → 창의적인 활용법 → 해시태그 등장 → CTA",
                audio: "NewJeans - Get Up (트렌디하고 밝은 분위기)",
                caption: `💫 15초 안에 ${eventData.productName}의 매력 발견! 💫\n\n당신만의 스타일로 제품을 활용해보세요\n가장 창의적인 영상에 특별한 선물이! 🎁\n\n#${eventData.productName}챌린지`,
                hashtags: [`#${eventData.productName}챌린지`, `#${eventData.productCategory}`, "#릴스챌린지"]
              },
              stories: {
                frame1: { type: "poll", text: `${eventData.productName} 사용해본 적 있나요?`, sticker: "poll" },
                frame2: { type: "quiz", text: `${eventData.productName}의 핵심 기능은? 정답: ${eventData.productFeatures.split(',')[0]}`, sticker: "quiz" },
                frame3: { type: "cta", text: "챌린지 참여하고 선물 받아가세요! 👆 링크 클릭" },
                hashtags: [`#${eventData.productName}챌린지`, `#${eventData.productCategory}`]
              }
            }
          },
          goal: {
            quantitative: `이벤트 게시물 도달 10,000회 이상 달성\n좋아요+댓글+저장 합산 1,000건 이상 확보\n문의(DM) 100건 이상 유입\n참여율 10% 이상 달성`,
            qualitative: `브랜드에 대한 긍정적 인식 증진\n고객과의 정서적 유대감 강화\nMZ세대 중심 고객층 확대\n${eventData.productName} 가치 인식 향상`
          },
          performanceMetric: `주요 KPI인 ${eventData.kpiMetrics.join(', ')}를 주간 단위로 모니터링합니다.\n참여율 10% 미달 시 인플루언서 추가 투입을 검토합니다.\n15% 초과 시 이벤트 기간 연장을 검토합니다.`,
          rewards: "1등(1명): 제품 풀세트 30만원 상당\n2등(3명): 신제품 패키지 15만원 상당\n3등(6명): 미니 샘플러 세트 5만원 상당\n당첨자 발표 후 개별 연락하여 배송 정보 수집",
          budget: eventData.budget.replace(/[^0-9]/g, '') || "100"
        }
      };
      
      console.log("목업 데이터 반환:", JSON.stringify(mockData, null, 2));
      return mockData;
    }

    // OpenAI API 호출
    console.log("API 호출 시작:", new Date().toISOString());
    const response = await openai.createChatCompletion({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });
    console.log("API 호출 완료:", new Date().toISOString());
    console.log("API 응답 상태:", response.status);
    console.log("API 응답 헤더:", JSON.stringify(response.headers, null, 2));
    
    // 응답 텍스트 분석 및 파싱
    const aiResponse = response.data.choices[0]?.message?.content || '';
    console.log("API 응답 내용:", aiResponse);
    
    // 파싱 결과
    const parsedResponse = parseAIResponse(aiResponse);
    console.log("파싱된 응답:", JSON.stringify(parsedResponse, null, 2));
    
    return parsedResponse;
  } catch (error: any) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    console.error('에러 상세 정보:', error.message);
    if (error.response) {
      console.error('에러 응답:', error.response.status);
      console.error('에러 데이터:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error('이벤트 기획 생성 중 오류가 발생했습니다.');
  }
};

/**
 * 사용자 피드백을 반영해 이벤트 기획안을 수정하는 함수
 * @param eventData 기존 이벤트 기획안
 * @param feedback 사용자 피드백
 * @param originalInput 원본 입력 데이터 (옵션)
 * @returns Promise<AIEventResponse> 수정된 이벤트 기획안
 */
export const refineEventPlan = async (
  eventData: AIEventResponse, 
  feedback: string,
  originalInput?: EventPlanningInput
): Promise<AIEventResponse> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다.');
    }

    // 피드백 프롬프트 템플릿 가져오기
    let promptTemplate = getFeedbackPromptTemplate();
    
    // 원본 입력 데이터가 있는 경우 변수 치환, 없으면 기본값 사용
    let finalPrompt: string;
    if (originalInput) {
      finalPrompt = promptTemplate
        .replace('{productCategory}', originalInput.productCategory)
        .replace('{productName}', originalInput.productName)
        .replace('{productFeatures}', originalInput.productFeatures)
        .replace('{kpiMetrics}', originalInput.kpiMetrics.join(', '))
        .replace('{targetAudience}', originalInput.targetAudience)
        .replace('{budget}', originalInput.budget)
        .replace('{eventDuration}', originalInput.eventDuration)
        .replace('{existingEventPlan}', JSON.stringify(eventData, null, 2))
        .replace('{feedback}', feedback);
    } else {
      // 원본 입력 데이터가 없는 경우 기본값으로 치환
      finalPrompt = promptTemplate
        .replace('{productCategory}', '정보 없음')
        .replace('{productName}', '정보 없음')
        .replace('{productFeatures}', '정보 없음')
        .replace('{kpiMetrics}', '정보 없음')
        .replace('{targetAudience}', '정보 없음')
        .replace('{budget}', '정보 없음')
        .replace('{eventDuration}', '정보 없음')
        .replace('{existingEventPlan}', JSON.stringify(eventData, null, 2))
        .replace('{feedback}', feedback);
    }

    // API 키가 없는 경우 목업 데이터 반환 (개발 모드)
    if (OPENAI_API_KEY === 'your_openai_api_key_here' || OPENAI_API_KEY === '') {
      console.log('개발 모드: API 키가 설정되지 않아 목업 데이터를 반환합니다.');
      // 간단한 수정된 목업 반환 - 첫 번째 이벤트만 수정
      const firstEventKey = Object.keys(eventData)[0];
      const firstEvent = eventData[firstEventKey];
      return {
        ...eventData,
        [firstEventKey]: {
          ...firstEvent,
          eventConcept: `${firstEvent.eventConcept} 피드백을 반영하여 ${feedback.substring(0, 30)}... 부분을 개선했습니다.`,
        }
      };
    }

    // OpenAI API 호출
    const response = await openai.createChatCompletion({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: finalPrompt }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    // 응답 텍스트 분석 및 파싱
    const aiResponse = response.data.choices[0]?.message?.content || '';
    return parseAIResponse(aiResponse);
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    throw new Error('이벤트 기획 수정 중 오류가 발생했습니다.');
  }
};

// AI 응답을 파싱하는 함수 - 새로운 JSON 구조에 맞게 수정
const parseAIResponse = (responseText: string): AIEventResponse => {
  console.log("=== JSON 파싱 시작 ===");
  console.log("원본 텍스트:", responseText);
  
  try {
    // 1단계: 전체 텍스트가 JSON인지 먼저 시도
    try {
      const parsed = JSON.parse(responseText);
      console.log("전체 텍스트 JSON 파싱 성공:", parsed);
      return parsed;
    } catch (directParseError) {
      console.log("전체 텍스트 직접 파싱 실패, 정규식으로 JSON 찾기 시도");
    }

    // 2단계: 정규식으로 JSON 부분 찾기
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        let jsonStr = jsonMatch[0];
        
        // JSON이 완전하지 않은 경우 (중괄호나 대괄호가 닫히지 않은 경우) 수정 시도
        const openBraces = (jsonStr.match(/\{/g) || []).length;
        const closeBraces = (jsonStr.match(/\}/g) || []).length;
        const openBrackets = (jsonStr.match(/\[/g) || []).length;
        const closeBrackets = (jsonStr.match(/\]/g) || []).length;
        
        // 중괄호 수정
        for (let i = 0; i < openBraces - closeBraces; i++) {
          jsonStr += '}';
        }
        
        // 대괄호 수정  
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          jsonStr += ']';
        }
        
        console.log("수정된 JSON 문자열:", jsonStr);
        const parsed = JSON.parse(jsonStr);
        console.log("정규식 + 수정 JSON 파싱 성공:", parsed);
        return parsed;
      } catch (jsonError) {
        console.log("정규식 JSON 파싱도 실패:", jsonError);
      }
    }

    // JSON 파싱 실패 시 기본 응답 템플릿 반환
    const defaultResponse: AIEventResponse = {
      event1: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        eventConcept: "AI 응답을 파싱하지 못했습니다. 기본 이벤트 기획안을 제공합니다.",
        contentMechanics: {
          process: ["1. 계획 수립", "2. 이벤트 실행", "3. 결과 분석"],
          postFormats: {
            feed: {
              carouselSlides: [
                { slide: 1, concept: "기본 슬라이드 1" },
                { slide: 2, concept: "기본 슬라이드 2" }
              ],
              caption: "기본 캡션입니다.",
              hashtags: ["#이벤트", "#브랜드"]
            },
            reels: {
              duration: "15s",
              hookFirst3s: "기본 훅",
              mainScenes: "기본 메인 씬",
              audio: "기본 음악",
              caption: "기본 릴스 캡션",
              hashtags: ["#릴스", "#이벤트"]
            },
            stories: {
              frame1: { type: "poll", text: "기본 투표", sticker: "poll" },
              frame2: { type: "quiz", text: "기본 퀴즈", sticker: "quiz" },
              frame3: { type: "cta", text: "기본 CTA" },
              hashtags: ["#스토리", "#이벤트"]
            }
          }
        },
        goal: {
          quantitative: "브랜드 인지도 10% 향상\n참여율 5% 달성",
          qualitative: "브랜드 인지도 향상을 목표로 합니다"
        },
        performanceMetric: "주간 단위로 KPI를 모니터링합니다.",
        rewards: "경품 구성을 검토 중입니다.",
        budget: "100"
      }
    };

    console.log("=== 기본 응답 반환 ===");
    console.log(JSON.stringify(defaultResponse, null, 2));
    return defaultResponse;
  } catch (error) {
    console.error('AI 응답 파싱 중 오류 발생:', error);
    // 오류 발생 시 기본 응답 반환
    return {
      event1: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        eventConcept: "응답 파싱 중 오류가 발생했습니다. 기본 이벤트 기획안을 제공합니다.",
        contentMechanics: {
          process: ["1. 계획 수립", "2. 이벤트 실행", "3. 결과 분석"],
          postFormats: {
            feed: {
              hashtags: ["#이벤트", "#브랜드"]
            },
            reels: {
              hashtags: ["#릴스", "#이벤트"]
            },
            stories: {
              hashtags: ["#스토리", "#이벤트"]
            }
          }
        },
        goal: {
          quantitative: "파싱 오류로 인한 기본 정량 목표",
          qualitative: "파싱 오류로 인한 기본 정성 목표"
        },
        performanceMetric: "기본 성과 지표입니다.",
        rewards: "기본 경품 구성입니다.",
        budget: "100"
      }
    };
  }
};

const OpenAIService = {
  generateEventPlan,
  refineEventPlan,
  parseAIResponse
};

export default OpenAIService; 