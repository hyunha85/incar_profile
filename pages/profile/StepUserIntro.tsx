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

const DEFAULT_INTRO = '고객 상황에 맞는 보험 설계를 통해\n신뢰할 수 있는 금융 파트너가 되겠습니다.';

function buildInitialValue(agentInfo: AgentInfo): string {
  const specialty = agentInfo?.specialty?.join(' · ') || '보험';
  const career = agentInfo?.careers?.[0] || '';
  return [
    career ? `${career}의 경험을 바탕으로,` : '',
    '고객 상황에 맞는 보험 설계를 통해',
    '신뢰할 수 있는 금융 파트너가 되겠습니다.',
    '',
    `${specialty} 중심의`,
    '맞춤 금융 솔루션을 제공합니다.',
  ].filter((l, i) => !(i === 0 && !career)).join('\n');
}

export default function StepUserIntro({
  agentInfo, profileType, userIntro, onSave, onNext, onBack, isDemo,
}: Props) {
  // 진입 시 바로 value로 세팅 — placeholder 없음
  const [value, setValue] = useState<string>(
    userIntro || buildInitialValue(agentInfo)
  );
  const [loading, setLoading] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  // Demo일 때도 초기값 세팅
  useEffect(() => {
    if (isDemo && !userIntro) {
      setValue(buildInitialValue(agentInfo));
    }
  }, []);

  const applyAI = async () => {
    if (isDemo) {
      const career = agentInfo?.careers?.[0] || '';
      const spec = agentInfo?.specialty?.join(' · ') || '보험';
      setValue(
        `${career ? career + '의 현장 경험을 바탕으로,\n' : ''}고객 한 분 한 분의 상황에 맞는 최적의 보험 솔루션을 제공합니다.\n\n${spec} 전문가로서\n${agentInfo?.region || ''}을 중심으로 신뢰를 쌓아왔습니다.`
      );
      setConfirmOverwrite(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentInfo }),
      });
      const data = await res.json();
      setValue(data.intro || DEFAULT_INTRO);
    } catch {
      setValue(DEFAULT_INTRO);
    } finally {
      setLoading(false);
      setConfirmOverwrite(false);
    }
  };

  const handleAIClick = () => {
    if (value.trim()) {
      setConfirmOverwrite(true);
    } else {
      applyAI();
    }
  };

  const handleNext = () => {
    onSave(value.trim());
    onNext();
  };

  return (
    <div className="px-5 py-4" style={{ paddingBottom: '140px' }}>
      <div className="mb-5">
        <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#1a2540', marginBottom: '6px', letterSpacing: '-0.5px' }}>
          자기소개를 작성해주세요
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          직접 작성하거나 AI 추천 문구를 수정해 사용하세요.
        </p>
      </div>

      {/* AI 추천문구 버튼 */}
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
          {loading ? '생성 중...' : 'AI 추천문구 다시 생성'}
        </button>
      </div>

      {/* 덮어쓰기 확인 */}
      {confirmOverwrite && (
        <div style={{
          background: '#f8faff',
          border: '1px solid #d1dce8',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '10px',
          fontSize: '13px',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}>
          <span>현재 내용을 새 AI 추천문구로 교체할까요?</span>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button onClick={() => setConfirmOverwrite(false)} style={{
              background: 'white', border: '1px solid #d1d5db',
              borderRadius: '6px', padding: '5px 12px',
              fontSize: '12px', cursor: 'pointer', color: '#374151',
            }}>취소</button>
            <button onClick={applyAI} style={{
              background: '#1e3a6e', color: 'white',
              border: 'none', borderRadius: '6px',
              padding: '5px 12px', fontSize: '12px',
              cursor: 'pointer', fontWeight: 600,
            }}>교체</button>
          </div>
        </div>
      )}

      {/* textarea — value로 직접 수정 가능 */}
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
          color: '#1a2540',       // 항상 검정 — placeholder 회색 없음
          background: 'white',
          outline: 'none',
          resize: 'none',
          lineHeight: 1.8,
          caretColor: '#1e3a6e',
          boxSizing: 'border-box',
        }}
      />
      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
        모바일 기준 4~5줄 권장. 전체 삭제 후 직접 작성도 가능합니다.
      </p>

      {/* 하단 고정 버튼 */}
      <div style={{
        position: 'fixed', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px',
        padding: '16px 20px',
        background: 'white',
        borderTop: '1px solid #f1f5f9',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <button className="btn-primary" onClick={handleNext}>
          다음 단계
        </button>
        <button
          onClick={() => { onSave(''); onNext(); }}
          style={{
            background: 'transparent', border: 'none',
            color: '#94a3b8', fontSize: '14px',
            padding: '6px', cursor: 'pointer',
          }}
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
