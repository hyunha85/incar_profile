import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useCallback } from 'react';
import { ProfileData, ProfileType, AgentInfo } from '@/types';

import StepProfileType from '@/components/profile/StepProfileType';
import StepRequired    from '@/components/profile/StepRequired';
import StepOptional    from '@/components/profile/StepOptional';
import StepPhotoUpload from '@/components/profile/StepPhotoUpload';
import StepUserIntro   from '@/components/profile/StepUserIntro';
import StepPreview     from '@/components/profile/StepPreview';
import Header          from '@/components/layout/Header';
import ProgressBar     from '@/components/ui/ProgressBar';

const STEP_LABELS = [
  '프로필 유형',
  '필수 입력',
  '선택 정보',
  '사진 업로드',
  '자기소개',
  '미리보기',
];
const TOTAL = 6;

export default function CreatePage() {
  const router = useRouter();
  const isDemo = router.query.demo === 'true';

  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({
    isDemo,
    agentInfo: {
      name: '', branch: '', position: '', phone: '',
      company: '인카금융서비스', careers: [], specialty: [],
    } as AgentInfo,
  });

  const update = useCallback((data: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  }, []);

  const updateAgent = useCallback((info: Partial<AgentInfo>) => {
    setProfileData(prev => ({
      ...prev,
      agentInfo: { ...(prev.agentInfo as AgentInfo), ...info },
    }));
  }, []);

  const next = () => setStep(s => Math.min(s + 1, TOTAL));

  // 뒤로가기: 1단계면 랜딩으로, 나머지는 이전 스텝 (입력값 유지)
  const prev = () => {
    if (step === 1) router.push('/');
    else setStep(s => s - 1);
  };

  return (
    <>
      <Head>
        <title>INCAR PROFILE {isDemo ? '— Demo' : '만들기'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="mobile-container" style={{ background: 'white', minHeight: '100dvh' }}>
        {/* onBack을 prev로 연결 — 항상 이전 스텝으로 */}
        <Header showBack onBack={prev} isDemo={isDemo} />
        <ProgressBar current={step} total={TOTAL} label={STEP_LABELS[step - 1]} />

        {step === 1 && (
          <StepProfileType
            selected={profileData.profileType}
            onSelect={(type: ProfileType) => update({ profileType: type })}
            onNext={next}
            isDemo={isDemo}
          />
        )}
        {step === 2 && (
          <StepRequired
            data={profileData.agentInfo}
            onSave={updateAgent}
            onNext={next}
            isDemo={isDemo}
          />
        )}
        {step === 3 && (
          <StepOptional
            data={profileData.agentInfo}
            onSave={updateAgent}
            onNext={next}
            isDemo={isDemo}
          />
        )}
        {step === 4 && (
          <StepPhotoUpload
            profileType={profileData.profileType!}
            onUpload={(original: string, processed?: string) => {
              update({ photoUrl: original, processedPhotoUrl: processed || undefined });
            }}
            onNext={next}
            onBack={prev}
            isDemo={isDemo}
          />
        )}
        {step === 5 && (
          <StepUserIntro
            agentInfo={profileData.agentInfo!}
            profileType={profileData.profileType!}
            userIntro={profileData.userIntro}
            onSave={(intro: string) => update({ userIntro: intro })}
            onNext={next}
            onBack={prev}
            isDemo={isDemo}
          />
        )}
        {step === 6 && (
          <StepPreview
            profileData={profileData as ProfileData}
            onBack={prev}
            isDemo={isDemo}
          />
        )}
      </div>
    </>
  );
}
