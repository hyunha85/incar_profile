import { ProfileData } from '@/types';

export const DEMO_PROFILE: ProfileData = {
  id: 'demo-001',
  profileType: 'expert',
  agentInfo: {
    name: '김민준',
    branch: '인카 강남지점',
    position: '설계사',
    phone: '010-1234-5678',
    company: '인카금융서비스',
    careers: [
      '2026 인카금융서비스 강남지점',
      '2024 한화손해보험 설계사',
      '연금보험 · 건강보험 전문',
    ],
    specialty: ['종신보험', '연금보험', '건강보험'],
    email: 'minjun.kim@incar.co.kr',
    kakao: '',
    blog: '',
  },
  photoUrl: '/demo/sample-agent.png',
  processedPhotoUrl: '/demo/sample-agent-nobg.png',
  aiIntro: '12년의 현장 경험을 바탕으로 고객 한 분 한 분의 삶을 깊이 이해하는 보험 전문가입니다. 종신·연금·건강보험 전 영역에서 최적의 솔루션을 제공합니다.',
  userIntro: '고객 상황에 맞는 보험 설계를 통해 신뢰할 수 있는 금융 파트너가 되겠습니다.\n연금 · 건강보험 중심의 맞춤 금융 솔루션을 제공합니다.',
  recommendedQuestions: [],
  isDemo: true,
};

export const DEMO_SIMPLE_PROFILE: ProfileData = {
  ...DEMO_PROFILE,
  id: 'demo-002',
  profileType: 'simple',
};
