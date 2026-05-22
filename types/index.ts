export type ProfileType = 'simple' | 'expert';

export interface AgentInfo {
  name: string;           // 필수
  branch: string;         // 필수 — 지점명
  position: string;       // 필수 — 직책
  phone: string;          // 필수
  company: string;        // 기본값: 인카금융서비스
  career?: string;        // 하위호환용
  careers: string[];      // 주요 경력 배열 (선택)
  specialty: string[];    // 전문분야 (선택)
  email?: string;         // 선택
  kakao?: string;         // 선택
  blog?: string;          // 선택
  instagram?: string;     // 인스타그램
  youtube?: string;       // 유튜브
  region?: string;        // 하위호환용
  slogan?: string;        // 하위호환용
}

export interface ProfileData {
  id?: string;
  profileType: ProfileType;
  agentInfo: AgentInfo;
  photoUrl?: string;
  processedPhotoUrl?: string;
  aiIntro?: string;
  userIntro?: string;
  recommendedQuestions?: string[];
  createdAt?: string;
  isDemo?: boolean;
}

export interface DemoProfile extends ProfileData {
  isDemo: true;
}
