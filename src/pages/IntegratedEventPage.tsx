import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container, Grid, Box, Paper, Typography, Divider,
  Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip,
  OutlinedInput, FormHelperText, CircularProgress,
  Tab, Tabs, Card, CardContent, List, ListItem,
  ListItemIcon, ListItemText, Avatar, alpha, useMediaQuery,
  Snackbar, Alert, IconButton, FormControlLabel, Checkbox, Stack
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material';
import { generateEventPlan, refineEventPlan, AIEventResponse, EventPlanningInput } from '../services/openai';
// 아이콘 임포트
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessIcon from '@mui/icons-material/Business';
import { EventFormData, EventData } from '../types/event';

// 목표 KPI 옵션들
const kpiOptions = [
  '팔로워 증가',
  '이벤트 참여자 수',
  '클릭율',
  '웹사이트 트래픽',
  '앱 다운로드 수',
  '문의 수',
  '회원가입 수',
  '판매'
];

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

// 미리 정의된 스타일드 컴포넌트들
const ListItemStyled = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px dashed ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.light, 0.05),
    borderRadius: theme.shape.borderRadius,
  },
}));

const ResultCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'visible',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  },
}));

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const ResultContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
  },
}));

const TabPanelStyled = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 0),
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <TabPanelStyled
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && children}
    </TabPanelStyled>
  );
}

function getStyles(name: string, selectedItems: readonly string[], theme: Theme) {
  return {
    fontWeight:
      selectedItems.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

const IntegratedEventPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [eventTabValue, setEventTabValue] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [aiResponse, setAiResponse] = useState<AIEventResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Form 상태관리 - 새로운 단순화된 구조
  const [formData, setFormData] = useState({
    productCategory: '',           // 제품/서비스 카테고리
    productName: '',              // 제품/서비스 이름
    productFeatures: '',          // 특징 및 핵심 가치
    kpiMetrics: [] as string[],   // 목표 KPI
    targetAudience: '',           // 타깃 속성
    budget: '',                   // 예산
    startDate: '',                // 이벤트 시작일
    endDate: '',                  // 이벤트 종료일
  });

  // 이벤트 생성 함수
  const handleGenerateEvent = async () => {
    const hasRequiredFields = 
      formData.productCategory && 
      formData.productName && 
      formData.productFeatures && 
      formData.kpiMetrics.length > 0 &&
      formData.targetAudience &&
      formData.budget;
    
    if (hasRequiredFields) {
      setLoading(true);
      setError(null);
      
      try {
        console.log("이벤트 생성 요청 시작");
        
        // 새로운 형식에 맞게 데이터 변환
        const requestData: EventPlanningInput = {
          productName: formData.productName,
          productCategory: formData.productCategory,
          productFeatures: formData.productFeatures,
          targetAudience: formData.targetAudience,
          marketingGoals: ['브랜드/제품 인지도 향상'], // 기본값 설정
          kpiMetrics: formData.kpiMetrics,
          budget: formData.budget,
          platforms: ['Instagram', 'Facebook'], // 기본값 설정
          eventDuration: formData.startDate && formData.endDate 
            ? `${formData.startDate}부터 ${formData.endDate}까지` 
            : '2주',
          prizes: '',
          brandTone: '',
          additionalInfo: '',
          referenceFile: null
        };
        
        const response = await generateEventPlan(requestData);
        setAiResponse(response);
        setEventTabValue(0); // 새로운 이벤트 생성 시 첫 번째 탭으로 초기화
        console.log("이벤트 생성 완료");
      } catch (err: any) {
        console.error('API 에러:', err);
        setError(`API 호출 중 오류 발생: ${err.message || '알 수 없는 오류'}. 개발자 도구 콘솔에서 자세한 로그를 확인하세요.`);
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    } else {
      setError('필수 입력 항목을 모두 입력해주세요.');
      setOpenSnackbar(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      kpiMetrics: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEventTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setEventTabValue(newValue);
  };
  
  const handleFeedbackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(e.target.value);
  };
  
  const handleFeedbackSubmit = async () => {
    if (feedback.trim() && aiResponse) {
      setLoading(true);
      setError(null);
      
      try {
        // 원본 입력 데이터 구성
        const originalInput: EventPlanningInput = {
          productName: formData.productName,
          productCategory: formData.productCategory,
          productFeatures: formData.productFeatures,
          targetAudience: formData.targetAudience,
          marketingGoals: ['브랜드/제품 인지도 향상'], // 기본값
          kpiMetrics: formData.kpiMetrics,
          budget: formData.budget,
          platforms: ['Instagram'], // 기본값
          eventDuration: `${formData.startDate}부터 ${formData.endDate}까지`,
        };
        
        const refinedResponse = await refineEventPlan(aiResponse, feedback, originalInput);
        setAiResponse(refinedResponse);
        setFeedback('');
        setOpenSnackbar(true); // 성공 메시지 표시
      } catch (err) {
        setError('피드백 처리 중 오류가 발생했습니다.');
        setOpenSnackbar(true);
        console.error('Feedback API error:', err);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleSaveAsHtml = async () => {
    if (!aiResponse) return;
    
    try {
      setLoading(true);
      
      // 모든 이벤트 가져오기
      const eventKeys = Object.keys(aiResponse);
      
      // HTML 문서 생성
      let htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${formData.productName} 이벤트 기획안</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #1976d2;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #1976d2;
            margin: 0;
            font-size: 2.5em;
        }
        .header .subtitle {
            color: #666;
            margin-top: 10px;
            font-size: 1.2em;
        }
        .event-section {
            margin-bottom: 40px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .event-header {
            background: linear-gradient(135deg, #1976d2, #42a5f5);
            color: white;
            padding: 20px;
            margin: 0;
        }
        .event-header h2 {
            margin: 0;
            font-size: 1.8em;
        }
        .event-header .dates {
            margin-top: 10px;
            opacity: 0.9;
        }
        .event-content {
            padding: 25px;
        }
        .concept-box {
            background: #f8f9fa;
            border-left: 4px solid #1976d2;
            padding: 20px;
            margin-bottom: 25px;
        }
        .concept-box h3 {
            color: #1976d2;
            margin-top: 0;
        }
        .budget-chip {
            display: inline-block;
            background: #4caf50;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
        }
        .tab-section {
            margin-bottom: 30px;
        }
        .tab-title {
            background: #1976d2;
            color: white;
            padding: 15px 20px;
            margin: 0;
            font-size: 1.3em;
            border-radius: 6px 6px 0 0;
        }
        .tab-content {
            background: #fafafa;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 0 0 6px 6px;
        }
        .process-step {
            background: white;
            margin: 10px 0;
            padding: 15px;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-left: 4px solid #ff9800;
        }
        .process-step::before {
            content: "✓ ";
            color: #ff9800;
            font-weight: bold;
        }
        .content-format {
            margin-bottom: 25px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .content-format h4 {
            color: #1976d2;
            margin-top: 0;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
        }
        .slide-item, .frame-item {
            background: #f8f9fa;
            padding: 12px;
            margin: 8px 0;
            border-radius: 4px;
            border-left: 3px solid #2196f3;
        }
        .hashtags {
            margin-top: 15px;
        }
        .hashtag {
            display: inline-block;
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            margin: 2px;
            border-radius: 12px;
            font-size: 0.9em;
        }
        .goal-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .goal-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .quantitative {
            border-left: 4px solid #4caf50;
        }
        .qualitative {
            border-left: 4px solid #ff9800;
        }
        .metric-box, .reward-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .metric-box {
            border-left: 4px solid #9c27b0;
        }
        .reward-box {
            border-left: 4px solid #f44336;
        }
        @media (max-width: 768px) {
            .goal-section {
                grid-template-columns: 1fr;
            }
            .container {
                padding: 15px;
            }
            body {
                padding: 10px;
            }
        }
        .print-date {
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${formData.productName} 이벤트 기획안</h1>
            <div class="subtitle">총 ${eventKeys.length}개의 이벤트 기획안</div>
        </div>
`;

      // 각 이벤트에 대한 HTML 생성
      eventKeys.forEach((eventKey, index) => {
        const eventData = aiResponse[eventKey];
        
        htmlContent += `
        <div class="event-section">
            <div class="event-header">
                <h2>이벤트 ${index + 1}: ${eventData.eventConcept.split('.')[0]}</h2>
                <div class="dates">📅 ${eventData.startDate} ~ ${eventData.endDate}</div>
            </div>
            <div class="event-content">
                <div class="concept-box">
                    <h3>🎯 이벤트 컨셉</h3>
                    <p>${eventData.eventConcept}</p>
                    <span class="budget-chip">예산: ${parseInt(eventData.budget).toLocaleString()}원</span>
                </div>
                
                <div class="tab-section">
                    <h3 class="tab-title">📋 실행 계획</h3>
                    <div class="tab-content">
                        ${eventData.contentMechanics.process.map(step => `<div class="process-step">${step}</div>`).join('')}
                    </div>
                </div>
                
                <div class="tab-section">
                    <h3 class="tab-title">📱 콘텐츠 전략</h3>
                    <div class="tab-content">
                        <div class="content-format">
                            <h4>📸 피드 포스트</h4>
                            ${eventData.contentMechanics.postFormats.feed.carouselSlides ? 
                                eventData.contentMechanics.postFormats.feed.carouselSlides.map(slide => 
                                    `<div class="slide-item"><strong>슬라이드 ${slide.slide}:</strong> ${slide.concept}</div>`
                                ).join('') : ''}
                            ${eventData.contentMechanics.postFormats.feed.caption ? 
                                `<div style="margin-top: 15px;"><strong>캡션:</strong><br>${eventData.contentMechanics.postFormats.feed.caption.replace(/\n/g, '<br>')}</div>` : ''}
                            <div class="hashtags">
                                ${eventData.contentMechanics.postFormats.feed.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="content-format">
                            <h4>🎬 릴스</h4>
                            ${eventData.contentMechanics.postFormats.reels.duration ? `<p><strong>길이:</strong> ${eventData.contentMechanics.postFormats.reels.duration}</p>` : ''}
                            ${eventData.contentMechanics.postFormats.reels.hookFirst3s ? `<p><strong>첫 3초 훅:</strong> ${eventData.contentMechanics.postFormats.reels.hookFirst3s}</p>` : ''}
                            ${eventData.contentMechanics.postFormats.reels.mainScenes ? `<p><strong>메인 씬:</strong> ${eventData.contentMechanics.postFormats.reels.mainScenes}</p>` : ''}
                            ${eventData.contentMechanics.postFormats.reels.audio ? `<p><strong>음악:</strong> ${eventData.contentMechanics.postFormats.reels.audio}</p>` : ''}
                            ${eventData.contentMechanics.postFormats.reels.caption ? `<p><strong>캡션:</strong> ${eventData.contentMechanics.postFormats.reels.caption}</p>` : ''}
                            <div class="hashtags">
                                ${eventData.contentMechanics.postFormats.reels.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                            </div>
                        </div>
                        
                        <div class="content-format">
                            <h4>📖 스토리</h4>
                            ${eventData.contentMechanics.postFormats.stories.frame1 ? 
                                `<div class="frame-item"><strong>프레임 1 (${eventData.contentMechanics.postFormats.stories.frame1.type}):</strong> ${eventData.contentMechanics.postFormats.stories.frame1.text}</div>` : ''}
                            ${eventData.contentMechanics.postFormats.stories.frame2 ? 
                                `<div class="frame-item"><strong>프레임 2 (${eventData.contentMechanics.postFormats.stories.frame2.type}):</strong> ${eventData.contentMechanics.postFormats.stories.frame2.text}</div>` : ''}
                            ${eventData.contentMechanics.postFormats.stories.frame3 ? 
                                `<div class="frame-item"><strong>프레임 3 (${eventData.contentMechanics.postFormats.stories.frame3.type}):</strong> ${eventData.contentMechanics.postFormats.stories.frame3.text}</div>` : ''}
                            <div class="hashtags">
                                ${eventData.contentMechanics.postFormats.stories.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-section">
                    <h3 class="tab-title">🎯 목표 & 성과</h3>
                    <div class="tab-content">
                        <div class="goal-section">
                            <div class="goal-box quantitative">
                                <h4>📊 정량적 목표</h4>
                                <p>${eventData.goal.quantitative.replace(/\n/g, '<br>')}</p>
                            </div>
                            <div class="goal-box qualitative">
                                <h4>🎨 정성적 목표</h4>
                                <p>${eventData.goal.qualitative.replace(/\n/g, '<br>')}</p>
                            </div>
                        </div>
                        <div class="metric-box">
                            <h4>📈 성과 측정 방식</h4>
                            <p>${eventData.performanceMetric.replace(/\n/g, '<br>')}</p>
                        </div>
                    </div>
                </div>
                
                <div class="tab-section">
                    <h3 class="tab-title">🏆 경품 & 예산</h3>
                    <div class="tab-content">
                        <div class="reward-box">
                            <h4>🎁 경품 구성</h4>
                            <p>${eventData.rewards.replace(/\n/g, '<br>')}</p>
                        </div>
                        <div style="text-align: center; margin-top: 20px;">
                            <span class="budget-chip">총 예산: ${parseInt(eventData.budget).toLocaleString()}원</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
`;
      });

      htmlContent += `
        <div class="print-date">
            생성일: ${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR')}
        </div>
    </div>
</body>
</html>`;

      // HTML 파일 다운로드
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SNS_이벤트_기획안_${formData.productName}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('HTML 생성 중 오류 발생:', error);
      setError('HTML 파일 생성 중 오류가 발생했습니다.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError(null);
  };

  // 단순화된 폼 컨텐츠 렌더링
  const renderFormContent = () => {
    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              id="productCategory"
              name="productCategory"
              label="제품/서비스 카테고리"
              placeholder="제품/서비스 카테고리를 입력해 주세요."
              fullWidth
              value={formData.productCategory}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="productName"
              name="productName"
              label="제품/서비스 이름"
              placeholder="제품/서비스 이름을 입력해 주세요."
              fullWidth
              value={formData.productName}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="productFeatures"
              name="productFeatures"
              label="특징 및 핵심 가치"
              placeholder="제품/서비스의 특징 및 핵심 가치를 입력해 주세요."
              fullWidth
              multiline
              rows={3}
              value={formData.productFeatures}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel id="kpi-metrics-label">목표 KPI</InputLabel>
              <Select
                labelId="kpi-metrics-label"
                id="kpiMetrics"
                multiple
                value={formData.kpiMetrics}
                onChange={handleSelectChange}
                input={<OutlinedInput id="select-kpi" label="목표 KPI" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {kpiOptions.map((kpi) => (
                  <MenuItem
                    key={kpi}
                    value={kpi}
                    style={getStyles(kpi, formData.kpiMetrics, theme)}
                  >
                    {kpi}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>항목 선택</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="targetAudience"
              name="targetAudience"
              label="타깃 속성"
              placeholder="도달하고자 하는 소비자의 특징을 입력해 주세요."
              fullWidth
              value={formData.targetAudience}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              id="budget"
              name="budget"
              label="예산"
              fullWidth
              value={formData.budget}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="startDate"
              name="startDate"
              label="이벤트 시작일"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={formData.startDate}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              id="endDate"
              name="endDate"
              label="이벤트 종료일"
              type="date"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              value={formData.endDate}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderResults = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
            AI가 이벤트 기획안을 생성 중입니다...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            잠시만 기다려 주세요
          </Typography>
        </Box>
      );
    }

    if (!aiResponse) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <ErrorOutlineIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
            아직 생성된 기획안이 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: '80%' }}>
            제품 정보, 마케팅 목표, 타겟층 등의 정보를 입력할수록 더 정교한 제안을 받을 수 있습니다
          </Typography>
        </Box>
      );
    }

    // 모든 이벤트 가져오기
    console.log("AI 응답 전체:", aiResponse);
    const eventKeys = Object.keys(aiResponse);
    console.log("이벤트 키들:", eventKeys);

    if (eventKeys.length === 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <ErrorOutlineIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
            이벤트 데이터를 불러올 수 없습니다
          </Typography>
          <Typography variant="body2" color="text.secondary">
            디버그: 키={eventKeys.join(', ')}
          </Typography>
        </Box>
      );
    }

    // 현재 선택된 이벤트 데이터
    const selectedEventKey = eventKeys[eventTabValue] || eventKeys[0];
    const eventData = aiResponse[selectedEventKey];
    console.log("선택된 이벤트 데이터:", eventData);

    return (
      <Box ref={resultRef} sx={{ mb: 4 }}>
        {/* 제목 및 기본 정보 */}
        <Box sx={{ 
          mb: 3, 
          p: 3, 
          borderRadius: 2, 
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`
        }}>
          <Typography variant="h4" gutterBottom fontWeight={700} color="primary">
            {formData.productName} 이벤트 기획안
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            📊 총 {eventKeys.length}개의 이벤트 기획안
          </Typography>
          <Typography variant="body2" color="text.secondary">
            아래 탭에서 각 이벤트를 선택하여 상세 내용을 확인하세요
          </Typography>
        </Box>

        {/* 이벤트 탭 네비게이션 */}
        {eventKeys.length > 1 && (
          <Box sx={{ mb: 3 }}>
            <Tabs 
              value={eventTabValue} 
              onChange={handleEventTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': { 
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  minHeight: 48,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  margin: 0.5,
                  borderRadius: 1,
                }
              }}
            >
              {eventKeys.map((eventKey, index) => {
                const event = aiResponse[eventKey];
                return (
                  <Tab 
                    key={eventKey}
                    label={`이벤트 ${index + 1}`}
                    icon={<EmojiEventsIcon />}
                    iconPosition="start"
                  />
                );
              })}
            </Tabs>
          </Box>
        )}

        {/* 현재 선택된 이벤트 정보 */}
        <Box sx={{ 
          mb: 3, 
          p: 2, 
          borderRadius: 2, 
          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.02)
        }}>
          <Typography variant="h5" gutterBottom fontWeight={600} color="primary">
            이벤트 {eventTabValue + 1}: {eventData.eventConcept.split('.')[0]}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
            📅 {eventData.startDate} ~ {eventData.endDate}
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 1 }}>
            {eventData.eventConcept}
          </Typography>
          <Chip 
            label={`예산: ${parseInt(eventData.budget).toLocaleString()}원`} 
            color="secondary" 
            variant="outlined" 
            size="small"
          />
        </Box>

        {/* 탭 네비게이션 */}
        <Box sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { 
                fontWeight: 600,
                fontSize: '0.9rem',
                minHeight: 48,
              }
            }}
          >
            <Tab label="실행 계획" icon={<AutoGraphIcon />} iconPosition="start" {...a11yProps(0)} />
            <Tab label="콘텐츠 전략" icon={<CampaignIcon />} iconPosition="start" {...a11yProps(1)} />
            <Tab label="목표 & 성과" icon={<AnalyticsIcon />} iconPosition="start" {...a11yProps(2)} />
            <Tab label="경품 & 예산" icon={<EmojiEventsIcon />} iconPosition="start" {...a11yProps(3)} />
          </Tabs>
        </Box>

        {/* 탭 내용 */}
        <Box sx={{ minHeight: 400 }}>
          {/* 실행 계획 탭 */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">세부 실행 계획</Typography>
            <List>
              {eventData.contentMechanics.process.map((step: string, index: number) => (
                <ListItemStyled key={index}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Avatar sx={{ 
                      width: 24, 
                      height: 24,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={step} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItemStyled>
              ))}
            </List>
          </TabPanel>
          
          {/* 콘텐츠 전략 탭 */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">콘텐츠 포맷별 전략</Typography>
            
            {/* 피드 포스트 */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>📸 피드 포스트</Typography>
              {eventData.contentMechanics.postFormats.feed.carouselSlides && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>캐러셀 슬라이드:</Typography>
                  {eventData.contentMechanics.postFormats.feed.carouselSlides.map((slide: any, index: number) => (
                    <Typography key={index} variant="body2" sx={{ ml: 2, mb: 1 }}>
                      • 슬라이드 {slide.slide}: {slide.concept}
                    </Typography>
                  ))}
                </Box>
              )}
              {eventData.contentMechanics.postFormats.feed.caption && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>캡션:</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {eventData.contentMechanics.postFormats.feed.caption}
                  </Typography>
                </Paper>
              )}
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                {eventData.contentMechanics.postFormats.feed.hashtags.map((tag: string, index: number) => (
                  <Chip key={index} label={tag} color="primary" variant="outlined" size="small" />
                ))}
              </Box>
            </Box>

            {/* 릴스 */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'secondary.main' }}>🎬 릴스</Typography>
              <List disablePadding>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="재생 시간"
                    secondary={eventData.contentMechanics.postFormats.reels.duration}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="첫 3초 훅"
                    secondary={eventData.contentMechanics.postFormats.reels.hookFirst3s}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="메인 장면 구성"
                    secondary={eventData.contentMechanics.postFormats.reels.mainScenes}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText 
                    primary="음악 선정"
                    secondary={eventData.contentMechanics.postFormats.reels.audio}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                  />
                </ListItem>
              </List>
            </Box>

            {/* 스토리 */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'warning.main' }}>📱 스토리</Typography>
              <List disablePadding>
                {eventData.contentMechanics.postFormats.stories.frame1 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary={`프레임 1 (${eventData.contentMechanics.postFormats.stories.frame1.type})`}
                      secondary={eventData.contentMechanics.postFormats.stories.frame1.text}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                    />
                  </ListItem>
                )}
                {eventData.contentMechanics.postFormats.stories.frame2 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary={`프레임 2 (${eventData.contentMechanics.postFormats.stories.frame2.type})`}
                      secondary={eventData.contentMechanics.postFormats.stories.frame2.text}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                    />
                  </ListItem>
                )}
                {eventData.contentMechanics.postFormats.stories.frame3 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary={`프레임 3 (${eventData.contentMechanics.postFormats.stories.frame3.type})`}
                      secondary={eventData.contentMechanics.postFormats.stories.frame3.text}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          </TabPanel>

          {/* 목표 & 성과 탭 */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">목표 & 성과 지표</Typography>
            
            {/* 정량적 목표 */}
            <Box sx={{ mb: 3 }}>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', ml: 2 }}>
                  정량적 목표
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {eventData.goal.quantitative}
                </Typography>
              </Paper>
            </Box>

            {/* 정성적 목표 */}
            <Box sx={{ mb: 4 }}>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'primary.main', ml: 2 }}>
                  정성적 목표
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {eventData.goal.qualitative}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'secondary.main' }}>📊 성과 측정 방식</Typography>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.03) }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {eventData.performanceMetric}
                </Typography>
              </Paper>
            </Box>
          </TabPanel>

          {/* 경품 & 예산 탭 */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom fontWeight={600} color="primary">경품 구성 & 예산</Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'warning.main' }}>🏆 경품 구성</Typography>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.03) }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {eventData.rewards}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'success.main' }}>💰 예산</Typography>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.03) }}>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {parseInt(eventData.budget).toLocaleString()}원
                </Typography>
              </Paper>
            </Box>
          </TabPanel>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ mt: 3, bgcolor: alpha(theme.palette.background.default, 0.5), p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600} color="primary">
            피드백 제공
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            제안에 대한 피드백이나 수정 요청사항이 있으면 입력해주세요
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder="예: '더 바이럴한 요소를 추가해주세요'"
            value={feedback}
            onChange={handleFeedbackChange}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="medium"
              onClick={handleFeedbackSubmit}
              disabled={!feedback.trim()}
              endIcon={<SendIcon />}
              sx={{ borderRadius: 20, px: 3 }}
            >
              피드백 제출
            </Button>
            <Button 
              variant="outlined" 
              size="medium"
              onClick={handleSaveAsHtml}
              startIcon={<DownloadIcon />}
              sx={{ borderRadius: 20, px: 3 }}
            >
              HTML 다운로드
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      
      <Grid container spacing={4}>
        {/* 좌측: 입력 폼 */}
        <Grid item xs={12} md={5}>
          <FormContainer elevation={2}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                <LightbulbIcon sx={{ mr: 1, verticalAlign: 'middle', color: theme.palette.primary.main }} />
                이벤트 정보 입력
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                필요한 정보를 입력하시면 AI가 맞춤형 이벤트 기획안을 제안합니다
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4, minHeight: '300px' }}>
              {renderFormContent()}
            </Box>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleGenerateEvent}
                startIcon={<LightbulbIcon />}
                disabled={loading}
                sx={{
                  borderRadius: '20px',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  boxShadow: '0 8px 16px rgba(63, 81, 181, 0.2)',
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  '&:hover': {
                    boxShadow: '0 12px 20px rgba(63, 81, 181, 0.3)',
                  }
                }}
              >
                {loading ? '생성 중...' : '이벤트 기획 생성'}
              </Button>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                모든 필수 정보를 입력한 후 클릭하세요
              </Typography>
            </Box>
          </FormContainer>
        </Grid>
        
        {/* 우측: 결과 보기 */}
        <Grid item xs={12} md={7}>
          <ResultContainer elevation={2}>
            {renderResults()}
          </ResultContainer>
        </Grid>
      </Grid>
      
      {/* 에러 및 성공 메시지 표시를 위한 Snackbar 추가 */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {error || (aiResponse ? "이벤트 기획이 성공적으로 생성되었습니다!" : "작업이 완료되었습니다!")}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default IntegratedEventPage; 