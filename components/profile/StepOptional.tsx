import { AgentInfo } from '@/types';
import { useState } from 'react';
import { DEMO_PROFILE } from '@/lib/demoData';

interface Props {
  data?: Partial<AgentInfo>;
  onSave: (info: Partial<AgentInfo>) => void;
  onNext: () => void;
  isDemo: boolean;
}

const SPECIALTY_OPTIONS = [
  '종신보험', '연금보험', '건강보험', '실손보험',
  '자동차보험', '어린이보험', '암보험', '치매보험',
  '저축보험', '변액보험',
];

// 인카 공식 SNS 기본값
const INCAR_DEFAULTS = {
  kakao: 'https://pf.kakao.com/_JPyxhX',
  blog: 'https://blog.naver.com/incar_sns_story',
  instagram: 'https://www.instagram.com/incar.finance/',
  youtube: 'https://www.youtube.com/channel/UC7pMxpyYPIBkwRT1eFjs2OQ',
};

export default function StepOptional({ data, onSave, onNext, isDemo }: Props) {
  const demo = DEMO_PROFILE.agentInfo;
  const init = isDemo
    ? {
        specialty: demo.specialty,
        careers: [...demo.careers],
        email: demo.email || '',
        kakao: INCAR_DEFAULTS.kakao,
        blog: INCAR_DEFAULTS.blog,
        instagram: INCAR_DEFAULTS.instagram,
        youtube: INCAR_DEFAULTS.youtube,
      }
    : {
        specialty: data?.specialty || [],
        careers: Array.isArray(data?.careers) ? [...data.careers] : [],
        email: data?.email || '',
        kakao: (data as any)?.kakao || '',
        blog: (data as any)?.blog || '',
        instagram: (data as any)?.instagram || '',
        youtube: (data as any)?.youtube || '',
      };

  const [specialty, setSpecialty] = useState<string[]>(init.specialty);
  const [careers, setCareers] = useState<string[]>(init.careers);
  const [email, setEmail] = useState(init.email);
  const [kakao, setKakao] = useState(init.kakao);
  const [blog, setBlog] = useState(init.blog);
  const [instagram, setInstagram] = useState(init.instagram);
  const [youtube, setYoutube] = useState(init.youtube);

  const toggleSpec = (item: string) => {
    setSpecialty(prev =>
      prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item].slice(0, 3)
    );
  };

  const setCareer = (idx: number, val: string) => {
    setCareers(prev => { const n = [...prev]; n[idx] = val; return n; });
  };
  const addCareer = () => { if (careers.length < 6) setCareers(prev => [...prev, '']); };
  const removeCareer = (idx: number) => { setCareers(prev => prev.filter((_, i) => i !== idx)); };

  const handleNext = () => {
    onSave({
      specialty,
      careers: careers.filter(c => c.trim()),
      email: email.trim(),
      kakao: kakao.trim(),
      blog: blog.trim(),
      instagram: instagram.trim(),
      youtube: youtube.trim(),
    } as any);
    onNext();
  };

  const inp: React.CSSProperties = {
    flex: 1, border: '1.5px solid #d1d9e6', borderRadius: '10px',
    padding: '13px 14px', fontSize: '15px', fontFamily: 'inherit',
    color: '#1a2540', background: 'white', outline: 'none',
  };
  const fullInp: React.CSSProperties = {
    ...inp, flex: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '24px 20px', paddingBottom: '120px' }}>
      <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#1a2540', marginBottom: '4px', letterSpacing: '-0.5px' }}>
        선택 정보
      </h2>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '28px' }}>
        비워도 다음 단계로 진행할 수 있습니다.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* 전문분야 */}
        <div>
          <label style={labelStyle}>전문분야 <span style={{ color: '#cbd5e0', fontWeight: 400 }}>(최대 3개)</span></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SPECIALTY_OPTIONS.map(item => (
              <button key={item} onClick={() => toggleSpec(item)} style={{
                padding: '8px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: 500,
                border: specialty.includes(item) ? '2px solid #1e3a6e' : '1.5px solid #e2e8f0',
                background: specialty.includes(item) ? '#1e3a6e' : 'white',
                color: specialty.includes(item) ? 'white' : '#64748b',
                cursor: 'pointer',
              }}>{item}</button>
            ))}
          </div>
        </div>

        {/* 주요 경력 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <label style={{ ...labelStyle, margin: 0 }}>주요 경력</label>
            {careers.length < 6 && (
              <button onClick={addCareer} style={{
                background: 'white', border: '1.5px solid #d1dce8', borderRadius: '8px',
                padding: '5px 12px', fontSize: '13px', color: '#1e3a6e', fontWeight: 600, cursor: 'pointer',
              }}>+ 경력 추가</button>
            )}
          </div>
          {careers.length === 0 && (
            <p style={{ fontSize: '13px', color: '#cbd5e0', padding: '10px 0' }}>경력 항목이 없습니다.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {careers.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input style={inp}
                  placeholder={i === 0 ? '예: 2026 인카금융서비스 강남지점' : '예: 연금보험 · 건강보험 전문'}
                  value={c} onChange={e => setCareer(i, e.target.value)} />
                <button onClick={() => removeCareer(i)} style={{
                  width: '36px', height: '36px', minWidth: '36px', borderRadius: '8px',
                  border: '1.5px solid #e2e8f0', background: 'white',
                  color: '#94a3b8', fontSize: '16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>×</button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#cbd5e0', marginTop: '6px' }}>최대 6개 · 빈값은 저장되지 않습니다</p>
        </div>

        {/* 이메일 */}
        <div>
          <label style={labelStyle}>이메일</label>
          <input style={fullInp} placeholder="example@incar.co.kr"
            value={email} onChange={e => setEmail(e.target.value)} type="email" />
        </div>

        {/* SNS 섹션 */}
        <div>
          <label style={{ ...labelStyle, marginBottom: '12px' }}>SNS 링크</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* 카카오 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={snsIcon('#FEE500')}>
                <svg width="14" height="13" viewBox="0 0 24 22" fill="none">
                  <path d="M12 0C5.373 0 0 4.163 0 9.3c0 3.323 1.99 6.242 5.008 8.006L3.75 22l5.108-2.813C9.906 19.38 10.94 19.5 12 19.5c6.627 0 12-4.163 12-9.3S18.627 0 12 0z" fill="#3A1D1D"/>
                </svg>
              </span>
              <input style={{ ...fullInp, flex: 1 }} placeholder="https://pf.kakao.com/..."
                value={kakao} onChange={e => setKakao(e.target.value)} />
            </div>

            {/* 네이버 블로그 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={snsIcon('#03C75A')}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3h7.5l5 7.5V3H21v18h-7.5L8.5 13.5V21H3z" fill="white"/>
                </svg>
              </span>
              <input style={{ ...fullInp, flex: 1 }} placeholder="https://blog.naver.com/..."
                value={blog} onChange={e => setBlog(e.target.value)} />
            </div>

            {/* 인스타그램 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={snsIcon('linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/>
                  <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
                </svg>
              </span>
              <input style={{ ...fullInp, flex: 1 }} placeholder="https://www.instagram.com/..."
                value={instagram} onChange={e => setInstagram(e.target.value)} />
            </div>

            {/* 유튜브 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={snsIcon('#FF0000')}>
                <svg width="14" height="10" viewBox="0 0 24 17" fill="none">
                  <path d="M23.5 2.7a3 3 0 0 0-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.6A3 3 0 0 0 .5 2.7C0 4.6 0 8.5 0 8.5s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 12.4 24 8.5 24 8.5s0-3.9-.5-5.8z" fill="white"/>
                  <path d="M9.5 12l6.5-3.5L9.5 5v7z" fill="#FF0000"/>
                </svg>
              </span>
              <input style={{ ...fullInp, flex: 1 }} placeholder="https://www.youtube.com/..."
                value={youtube} onChange={e => setYoutube(e.target.value)} />
            </div>

          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '430px',
        padding: '16px 20px', background: 'white', borderTop: '1px solid #f1f5f9',
      }}>
        <button className="btn-primary" onClick={handleNext}>다음 단계</button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '7px',
};

function snsIcon(bg: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '36px', height: '36px', minWidth: '36px',
    borderRadius: '8px', background: bg, flexShrink: 0,
  };
}
