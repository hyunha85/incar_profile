import { ProfileData } from '@/types';
import { useEffect, useState } from 'react';
import { DEMO_PROFILE, DEMO_SIMPLE_PROFILE } from '@/lib/demoData';

interface Props {
  profileData: ProfileData;
  onComplete: (data: Partial<ProfileData>) => void;
  isDemo: boolean;
}

const STEPS = [
  { label: '정보 분석 중', sub: '입력하신 경력과 전문분야를 분석합니다.' },
  { label: 'AI 소개문 작성 중', sub: '당신만의 브랜드 스토리를 만들고 있습니다.' },
  { label: '추천 질문 생성 중', sub: '고객이 궁금해할 질문을 선별합니다.' },
  { label: '프로필 완성 중', sub: '마지막으로 모든 요소를 조합합니다.' },
];

export default function StepAIGenerate({ profileData, onComplete, isDemo }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDemo) {
      runDemo();
    } else {
      runReal();
    }
  }, []);

  const runDemo = async () => {
    const demoData = profileData.profileType === 'simple' ? DEMO_SIMPLE_PROFILE : DEMO_PROFILE;
    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      setProgress((i / STEPS.length) * 100);
      await sleep(600);
    }
    setProgress(100);
    await sleep(400);
    setDone(true);
    onComplete({
      aiIntro: demoData.aiIntro,
      recommendedQuestions: demoData.recommendedQuestions,
    });
  };

  const safeJson = async (response: Response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      console.error('Non-JSON response:', text.slice(0, 200));
      throw new Error('서버 응답 오류 (JSON 아님)');
    }
  };

  const runReal = async () => {
    try {
      setCurrentStep(0); setProgress(10);

      // ── simple: remove-bg 절대 호출 안 함, 원본 이미지 그대로 사용 ──
      // ── expert: remove-bg 호출, API 키 없으면 안내 메시지 표시 ──
      let processedPhotoUrl = profileData.photoUrl; // 기본값: 원본

      if (profileData.profileType === 'expert' && profileData.photoUrl) {
        setCurrentStep(0); setProgress(20);
        try {
          const bgRes = await fetch('/api/profile/remove-bg', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: profileData.photoUrl }),
          });
          const bgData = await safeJson(bgRes);

          if (bgData.success && bgData.url) {
            // 누끼 성공 → 처리된 이미지 사용
            processedPhotoUrl = bgData.url;
          } else if (bgData.error === 'API key not configured') {
            // API 키 없음 → 사용자에게 안내, 원본으로 계속 진행
            console.warn('AI 배경 제거를 사용하려면 API 키가 필요합니다. 원본 이미지로 진행합니다.');
          }
          // 그 외 실패 → 원본으로 조용히 폴백 (processedPhotoUrl 그대로)
        } catch (bgErr: any) {
          console.warn('Background removal skipped:', bgErr.message);
          // 원본으로 계속 진행
        }
      }
      // simple이면 위 블록 자체를 건너뜀 → processedPhotoUrl = 원본

      setCurrentStep(1); setProgress(45);
      let aiIntro: string | undefined;
      let recommendedQuestions: string[] | undefined;

      try {
        const aiRes = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentInfo: profileData.agentInfo }),
        });
        const aiData = await safeJson(aiRes);
        aiIntro = aiData.intro;
        recommendedQuestions = aiData.questions;
      } catch (aiErr: any) {
        // AI 생성 실패해도 폴백값으로 계속 진행
        console.warn('AI generate fallback:', aiErr.message);
      }

      setCurrentStep(2); setProgress(70);
      await sleep(500);

      setCurrentStep(3); setProgress(90);
      await sleep(400);

      setProgress(100);
      setDone(true);

      onComplete({
        processedPhotoUrl,
        aiIntro,
        recommendedQuestions,
      });
    } catch (e: any) {
      setError(e.message || 'AI 생성 중 오류가 발생했습니다.');
    }
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  if (error) {
    return (
      <div className="px-5 py-10 flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a2540', marginBottom: '8px' }}>오류가 발생했습니다</h3>
        <p style={{ color: '#718096', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-8" style={{ minHeight: 'calc(100dvh - 80px)', paddingTop: '40px' }}>
      {/* 중앙 애니메이션 */}
      <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '40px' }}>
        {/* 외부 링 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '2px solid #e2e8f0',
        }} />
        {/* 진행 SVG */}
        <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }} viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="56"
            fill="none"
            stroke="#1e3a6e"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {/* 중앙 아이콘 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}>
          {done ? (
            <div style={{ fontSize: '32px' }}>✨</div>
          ) : (
            <>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a6e, #3a6aa8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="white" />
                </svg>
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a6e', marginTop: '4px' }}>
                {Math.round(progress)}%
              </p>
            </>
          )}
        </div>
      </div>

      {/* 스텝 표시 */}
      <div className="w-full mb-8">
        {STEPS.map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 0',
            opacity: i > currentStep ? 0.3 : 1,
            transition: 'opacity 0.4s ease',
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              minWidth: '28px',
              borderRadius: '50%',
              background: i < currentStep ? '#1e3a6e' : i === currentStep ? 'white' : '#f1f5f9',
              border: i === currentStep ? '2px solid #1e3a6e' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {i < currentStep ? (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : i === currentStep ? (
                <div style={{
                  width: '8px', height: '8px',
                  borderRadius: '50%',
                  background: '#1e3a6e',
                  animation: 'pulse 1s infinite',
                }} />
              ) : (
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#cbd5e0' }} />
              )}
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: i <= currentStep ? 600 : 400, color: i <= currentStep ? '#1a2540' : '#94a3b8' }}>
                {s.label}
              </p>
              {i === currentStep && (
                <p style={{ fontSize: '12px', color: '#718096', marginTop: '1px' }}>{s.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {isDemo && (
        <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
          🎭 Demo 모드: 실제 API 호출 없이 샘플 결과를 생성합니다.
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
