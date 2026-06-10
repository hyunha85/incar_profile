import { AgentInfo, ProfileType } from '@/types';
import { useState, useEffect } from 'react';

interface Props {
  agentInfo: AgentInfo;
  profileType: ProfileType;
  userIntro?: string;
  onSave: (intro: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDemo: boolean;
}

const DEFAULT_INTRO =
  '고객 상황에 맞는 보험 설계를 통해\n신뢰할 수 있는 금융 파트너가 되겠습니다.';

function safe(v: any): string {
  if (v === undefined || v === null || String(v) === 'undefined' || String(v) === 'null') return '';
  return String(v).trim();
}

function buildInitialValue(agentInfo: AgentInfo): string {
  const careersArr = Array.isArray(agentInfo?.careers)
    ? agentInfo.careers.filter(c => c?.trim()) : [];
  const career = careersArr[0] || safe((agentInfo as any)?.career) || '';
  const specialtyArr = Array.isArray(agentInfo?.specialty)
    ? agentInfo.specialty.filter(s => s?.trim()) : [];
  const specialty = specialtyArr.length > 0 ? specialtyArr.join(' · ') : '보험';
  return [
    career ? `${career}의 경험을 바탕으로,` : '',
    '고객 상황에 맞는 보험 설계를 통해',
    '신뢰할 수 있는 금융 파트너가 되겠습니다.',
    '',
    `${specialty} 중심의 맞춤 금융 솔루션을 제공합니다.`,
  ].filter((l, i) => !(i === 0 && !career)).join('\n');
}

function buildDemoVariant(agentInfo: AgentInfo, seed: number): string {
  const careersArr = Array.isArray(agentInfo?.careers)
    ? agentInfo.careers.filter(c => c?.trim()) : [];
  const career = careersArr[0] || '';
  const specialtyArr = Array.isArray(agentInfo?.specialty)
    ? agentInfo.specialty.filter(s => s?.trim()) : [];
  const spec = specialtyArr.join(' · ') || '보험';
  const variants = [
    [
      career ? `${career}의 현장 경험을 바탕으로,` : '',
      `고객 한 분 한 분의 상황에 맞는 ${spec} 솔루션을 제공합니다.`,
      '신뢰와 전문성으로 고객의 소중한 삶을 함께 지켜드리겠습니다.',
    ],
    [
      `${spec} 분야의 전문가로서,`,
      '고객의 상황에 맞는 최적의 보험 설계를 도와드립니다.',
      career ? `${career}의 경험으로 쌓은 신뢰를 바탕으로 함께하겠습니다.` : '풍부한 경험으로 함께하겠습니다.',
    ],
    [
      '고객 한 분 한 분의 인생을 함께 설계합니다.',
      career ? `${career}의 경험을 바탕으로,` : '',
      `${spec} 전문가로서 최선을 다하겠습니다.`,
    ],
  ];
  return variants[seed % 3].filter(Boolean).join('\n');
}

export default function StepUserIntro({
  agentInfo, profileType, userIntro, onSave, onNext, onBack, isDemo,
}: Props) {
  const [value, setValue] = useState<string>(userIntro || buildInitialValue(agentInfo));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userIntro) setValue(buildInitialValue(agentInfo));
  }, []);

  const handleAIClick = async () => {
    const requestId = Date.now();
    console.log('AI CLICK', requestId);

    setLoading(true);

    try {
      const res = await fetch(`/api/ai/generate?r=${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentInfo, requestId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      console.log('[AI] 응답 requestId:', data.requestId, '| requestId sent:', requestId);

      if (data.geminiError) {
        console.error('[AI] Gemini 실패 원인:', data.geminiError);
      }
      if (data.warning) {
        console.warn('[AI] 경고:', data.warning);
      }

      // 성공/실패 무관하게 intro 있으면 표시 (에러 화면 표시 안 함)
      setValue(data.intro || DEFAULT_INTRO);

    } catch (e: any) {
      console.error('AI ERROR:', e.message);
      // 에러 화면에 표시 안 함 — 기존 값 유지
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    onSave(value.trim());
    onNext();
  };

  return (
    <div style={{ padding: '24px 20px', paddingBottom: '140px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#1a2540', marginBottom: '6px', letterSpacing: '-0.5px' }}>
          자기소개를 작성해주세요
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>직접 작성하거나 AI 추천 문구를 수정하세요.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <button
          onClick={handleAIClick}
          disabled={loading}
          style={{
            background: 'white',
            border: '1.5px solid #d1dce8',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '13px',
            color: loading ? '#94a3b8' : '#1e3a6e',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '생성 중...' : 'AI 추천 문구 생성'}
        </button>
      </div>

      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        rows={8}
        style={{
          width: '100%',
          border: '1.5px solid #d1d9e6',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '15px',
          fontFamily: 'inherit',
          color: '#1a2540',
          background: 'white',
          outline: 'none',
          resize: 'none',
          lineHeight: 1.8,
          caretColor: '#1e3a6e',
          boxSizing: 'border-box',
          whiteSpace: 'pre-wrap',
        }}
      />
      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
        모바일 기준 4~5줄 권장. 전체 삭제 후 직접 작성도 가능합니다.
      </p>

      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px',
        padding: '16px 20px', background: 'white', borderTop: '1px solid #f1f5f9',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <button className="btn-primary" onClick={handleNext}>다음 단계</button>
        <button
          onClick={() => { onSave(''); onNext(); }}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '14px', padding: '6px', cursor: 'pointer' }}
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
