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

const DEFAULT_FORM: AgentInfo = {
  name: '',
  company: '인카금융서비스',
  careers: ['', ''],
  specialty: [],
  region: '',
  slogan: '',
  phone: '',
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
    return DEFAULT_FORM;
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

  // careers 배열 — 항상 안전하게 접근
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

  const isValid = form.name && form.specialty.length > 0 && form.region;

  const handleNext = () => {
    // 빈 항목 제거 후 저장
    onSave({ ...form, careers: careers.filter(c => c.trim()) });
    onNext();
  };

  const inputStyle = {
    width: '100%',
    border: '1.5px solid #d1d9e6',
    borderRadius: '10px',
    padding: '13px 14px',
    fontSize: '15px',
    fontFamily: 'inherit',
    color: '#1a2540',
    background: 'white',
    outline: 'none',
  };

  return (
    <div className="px-5 py-4" style={{ paddingBottom: '120px' }}>
      <div className="mb-6">
        <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#1a2540', marginBottom: '6px', letterSpacing: '-0.5px' }}>
          기본 정보를 입력해주세요
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>입력하신 정보로 프로필을 구성합니다.</p>
      </div>

      {isDemo && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fcd34d',
          borderRadius: '10px', padding: '11px 14px',
          marginBottom: '20px', fontSize: '13px', color: '#92400e',
        }}>
          Demo 모드: 샘플 데이터가 자동 입력되었습니다.
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* 이름 */}
        <div>
          <label className="form-label">이름 *</label>
          <input style={inputStyle} placeholder="홍길동" value={form.name}
            onChange={e => set('name', e.target.value)} />
        </div>

        {/* 소속 */}
        <div>
          <label className="form-label">소속 회사</label>
          <input style={inputStyle} value={form.company}
            onChange={e => set('company', e.target.value)} />
        </div>

        {/* 전문분야 */}
        <div>
          <label className="form-label">전문분야 (최대 3개) *</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {SPECIALTY_OPTIONS.map(item => (
              <button key={item} onClick={() => toggleSpecialty(item)} style={{
                padding: '8px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: 500,
                border: form.specialty.includes(item) ? '2px solid #1e3a6e' : '1.5px solid #e2e8f0',
                background: form.specialty.includes(item) ? '#1e3a6e' : 'white',
                color: form.specialty.includes(item) ? 'white' : '#64748b',
                cursor: 'pointer', transition: 'all 0.15s ease',
              }}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 활동 지역 */}
        <div>
          <label className="form-label">활동 지역 *</label>
          <input style={inputStyle} placeholder="예: 서울 강남구" value={form.region}
            onChange={e => set('region', e.target.value)} />
        </div>

        {/* 주요 경력 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label className="form-label" style={{ margin: 0 }}>주요 경력</label>
            {careers.length < 6 && (
              <button onClick={addCareer} style={{
                background: '#f0f4fb', border: '1px solid #d1dce8',
                borderRadius: '8px', padding: '5px 12px',
                fontSize: '13px', color: '#1e3a6e', fontWeight: 600, cursor: 'pointer',
              }}>
                + 추가
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {careers.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder={i === 0 ? '예: 12년 이상 보험 상담 경력' : '예: 우수 설계사 수상'}
                  value={c}
                  onChange={e => setCareer(i, e.target.value)}
                />
                {careers.length > 1 && (
                  <button onClick={() => removeCareer(i)} style={{
                    width: '34px', height: '34px', minWidth: '34px',
                    borderRadius: '8px', border: '1px solid #e2e8f0',
                    background: 'white', color: '#94a3b8',
                    fontSize: '16px', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>×</button>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
            빈 항목은 저장되지 않습니다. 최대 6개
          </p>
        </div>

        {/* 한 줄 슬로건 */}
        <div>
          <label className="form-label">한 줄 슬로건</label>
          <input style={inputStyle} placeholder="예: 신뢰로 함께하는 보험파트너" value={form.slogan}
            onChange={e => set('slogan', e.target.value)} maxLength={30} />
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{form.slogan.length}/30자</p>
        </div>

        {/* 연락처 */}
        <div>
          <label className="form-label">전화번호</label>
          <input style={inputStyle} placeholder="010-0000-0000" value={form.phone}
            onChange={e => set('phone', e.target.value)} type="tel" />
        </div>

        <div>
          <label className="form-label">이메일</label>
          <input style={inputStyle} placeholder="example@incar.co.kr" value={form.email}
            onChange={e => set('email', e.target.value)} type="email" />
        </div>

        <div>
          <label className="form-label">카카오톡 상담 링크</label>
          <input style={inputStyle} placeholder="https://open.kakao.com/..." value={form.kakao || ''}
            onChange={e => set('kakao', e.target.value)} />
        </div>

        <div>
          <label className="form-label">블로그 주소</label>
          <input style={inputStyle} placeholder="https://blog.naver.com/..." value={form.blog || ''}
            onChange={e => set('blog', e.target.value)} />
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
