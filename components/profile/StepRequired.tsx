import { AgentInfo } from '@/types';
import { useState } from 'react';
import { DEMO_PROFILE } from '@/lib/demoData';

interface Props {
  data?: Partial<AgentInfo>;
  onSave: (info: Partial<AgentInfo>) => void;
  onNext: () => void;
  isDemo: boolean;
}

const DEFAULTS = {
  name: '', branch: '', position: '', phone: '',
  company: '인카금융서비스',
};

export default function StepRequired({ data, onSave, onNext, isDemo }: Props) {
  const init = isDemo
    ? { name: DEMO_PROFILE.agentInfo.name, branch: DEMO_PROFILE.agentInfo.branch, position: DEMO_PROFILE.agentInfo.position, phone: DEMO_PROFILE.agentInfo.phone }
    : { ...DEFAULTS, ...data };

  const [form, setForm] = useState(init);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const isValid = form.name.trim() && form.branch.trim() && form.position.trim() && form.phone.trim();

  const handleNext = () => {
    onSave({ ...form, company: '인카금융서비스' });
    onNext();
  };

  const inp: React.CSSProperties = {
    width: '100%', border: '1.5px solid #d1d9e6', borderRadius: '10px',
    padding: '14px', fontSize: '16px', fontFamily: 'inherit',
    color: '#1a2540', background: 'white', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '24px 20px', paddingBottom: '120px' }}>
      <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#1a2540', marginBottom: '28px', letterSpacing: '-0.5px' }}>
        기본 정보*
      </h2>

      {isDemo && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '11px 14px', marginBottom: '20px', fontSize: '13px', color: '#92400e' }}>
          Demo 모드: 샘플 데이터가 자동 입력되었습니다.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>이름*</label>
          <input style={inp} placeholder="홍길동" value={form.name}
            onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>지점명*</label>
          <input style={inp} placeholder="인카 강남지점" value={form.branch}
            onChange={e => set('branch', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>직책*</label>
          <input style={inp} placeholder="설계사" value={form.position}
            onChange={e => set('position', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>연락처*</label>
          <input style={inp} placeholder="010-0000-0000" value={form.phone}
            onChange={e => set('phone', e.target.value)} type="tel" />
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px',
        padding: '16px 20px', background: 'white', borderTop: '1px solid #f1f5f9',
      }}>
        <button className="btn-primary" disabled={!isValid} onClick={handleNext}>
          다음 단계
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 600,
  color: '#64748b', marginBottom: '7px',
};
