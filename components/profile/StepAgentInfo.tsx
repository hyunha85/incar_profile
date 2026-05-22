import { AgentInfo } from '@/types';
import { useState, useEffect } from 'react';
import { DEMO_PROFILE } from '@/lib/demoData';

interface Props {
  data?: AgentInfo;
  onSave: (info: AgentInfo) => void;
  onNext: () => void;
  onBack: () => void;
  isDemo: boolean;
}

const SPECIALTY_OPTIONS = [
  '종신보험', '연금보험', '건강보험', '실손보험',
  '자동차보험', '어린이보험', '암보험', '치매보험',
  '저축보험', '변액보험',
];

// AgentInfo 타입과 완전히 일치 — branch, position 필수 포함
const DEFAULT_FORM: AgentInfo = {
  name: '',
  branch: '',
  position: '',
  phone: '',
  company: '인카금융서비스',
  careers: ['', ''],
  specialty: [],
  email: '',
  kakao: '',
  blog: '',
};

export default function StepAgentInfo({ data, onSave, onNext, onBack, isDemo }: Props) {
  const ensureCareers = (info: AgentInfo): AgentInfo => {
    const careers =
      Array.isArray(info.careers) && info.careers.length > 0
        ? info.careers
        : info.career
        ? [info.career, '']
        : ['', ''];
    return { ...DEFAULT_FORM, ...info, careers };
  };

  const initialData = (): AgentInfo => {
    if (isDemo) return ensureCareers(DEMO_PROFILE.agentInfo);
    if (data) return ensureCareers(data);
    return { ...DEFAULT_FORM };
  };

  const [form, setForm] = useState<AgentInfo>(initialData);

  useEffect(() => {
    if (isDemo) setForm(ensureCareers(DEMO_PROFILE.agentInfo));
  }, [isDemo]);

  const set = (key: keyof AgentInfo, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleSpecialty = (item: string) => {
    set('specialty', form.specialty.includes(item)
      ? form.specialty.filter(s => s !== item)
      : [...form.specialty, item].slice(0, 3)
    );
  };

  const careers = Array.isArray(form.careers) ? form.careers : ['', ''];

  const setCareer = (idx: number, val: string) => {
    const next = [...careers];
    next[idx] = val;
    set('careers', next);
  };
  const addCareer = () => {
    if (careers.length < 6) set('careers', [...careers, '']);
  };
  const removeCareer = (idx: number) => {
    const next = careers.filter((_, i) => i !== idx);
    set('careers', next.length > 0 ? next : ['']);
  };

  const isValid = !!(form.name && form.branch && form.position && form.phone);

  const handleNext = () => {
    onSave({ ...form, careers: careers.filter(c => c.trim()) });
    onNext();
  };

  const inp: React.CSSProperties = {
    width: '100%',
    border: '1.5px solid #d1d9e6',
    borderRadius: '10px',
    padding: '13px 14px',
    fontSize: '15px',
    fontFamily: 'inherit',
    color: '#1a2540',
    background: 'white',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const lbl: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#64748b',
    marginBottom: '7px',
  };

  return (
    <div style={{ padding: '24px 20px', paddingBottom: '120px' }}>
      <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#1a2540', marginBottom: '28px', letterSpacing: '-0.5px' }}>
        기본 정보 <span style={{ color: '#e53e3e', fontSize: '16px' }}>*</span>
      </h2>

      {isDemo && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '11px 14px', marginBottom: '20px', fontSize: '13px', color: '#92400e' }}>
          Demo 모드: 샘플 데이터가 자동 입력되었습니다.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={lbl}>이름 *</label>
          <input style={inp} placeholder="홍길동" value={form.name}
            onChange={e => set('name', e.target.value)} />
        </div>

        <div>
          <label style={lbl}>지점명 *</label>
          <input style={inp} placeholder="인카 강남지점" value={form.branch}
            onChange={e => set('branch', e.target.value)} />
        </div>

        <div>
          <label style={lbl}>직책 *</label>
          <input style={inp} placeholder="설계사" value={form.position}
            onChange={e => set('position', e.target.value)} />
        </div>

        <div>
          <label style={lbl}>연락처 *</label>
          <input style={inp} placeholder="010-0000-0000" value={form.phone}
            onChange={e => set('phone', e.target.value)} type="tel" />
        </div>

        <div>
          <label style={lbl}>소속 회사</label>
          <input style={inp} value={form.company}
            onChange={e => set('company', e.target.value)} />
        </div>

        {/* 전문분야 */}
        <div>
          <label style={lbl}>전문분야 <span style={{ color: '#cbd5e0', fontWeight: 400 }}>(최대 3개)</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SPECIALTY_OPTIONS.map(item => (
              <button key={item} onClick={() => toggleSpecialty(item)} style={{
                padding: '8px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: 500,
                border: form.specialty.includes(item) ? '2px solid #1e3a6e' : '1.5px solid #e2e8f0',
                background: form.specialty.includes(item) ? '#1e3a6e' : 'white',
                color: form.specialty.includes(item) ? 'white' : '#64748b',
                cursor: 'pointer',
              }}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 주요 경력 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ ...lbl, marginBottom: 0 }}>주요 경력</label>
            {careers.length < 6 && (
              <button onClick={addCareer} style={{ background: '#f0f4fb', border: '1px solid #d1dce8', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', color: '#1e3a6e', fontWeight: 600, cursor: 'pointer' }}>
                + 추가
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {careers.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  style={{ ...inp, flex: 1 }}
                  placeholder={i === 0 ? '예: 12년 이상 보험 상담 경력' : '예: 우수 설계사 수상'}
                  value={c}
                  onChange={e => setCareer(i, e.target.value)}
                />
                {careers.length > 1 && (
                  <button onClick={() => removeCareer(i)} style={{ width: '34px', height: '34px', minWidth: '34px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>빈 항목은 저장되지 않습니다. 최대 6개</p>
        </div>

        <div>
          <label style={lbl}>이메일</label>
          <input style={inp} placeholder="example@incar.co.kr" value={form.email || ''}
            onChange={e => set('email', e.target.value)} type="email" />
        </div>

        <div>
          <label style={lbl}>카카오톡 상담 링크</label>
          <input style={inp} placeholder="https://open.kakao.com/..." value={form.kakao || ''}
            onChange={e => set('kakao', e.target.value)} />
        </div>

        <div>
          <label style={lbl}>블로그 주소</label>
          <input style={inp} placeholder="https://blog.naver.com/..." value={form.blog || ''}
            onChange={e => set('blog', e.target.value)} />
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '430px', padding: '16px 20px', background: 'white', borderTop: '1px solid #f1f5f9' }}>
        <button className="btn-primary" disabled={!isValid} onClick={handleNext}>
          다음 단계
        </button>
      </div>
    </div>
  );
}
