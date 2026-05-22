import { ProfileData } from '@/types';
import { useState } from 'react';
import { useRouter } from 'next/router';

const DEFAULT_INTRO = '고객 상황에 맞는 보험 설계를 통해 신뢰할 수 있는 금융 파트너가 되겠습니다.';

interface Props {
  profileData: ProfileData;
  onBack: () => void;
  isDemo: boolean;
}

export default function StepPreview({ profileData, onBack, isDemo }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<{ id: string; url: string } | null>(null);
  const [toast, setToast] = useState(false);

  const agent = profileData.agentInfo;
  const isExpert = profileData.profileType === 'expert';
  const displayIntro = profileData.userIntro || profileData.aiIntro || DEFAULT_INTRO;
  const careers = agent?.careers?.filter(c => c.trim()) || [];

  const handleSave = async () => {
    if (isDemo) {
      setModal({ id: 'demo-001', url: `${window.location.origin}/profile/demo-001` });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (data.id) {
        setModal({ id: data.id, url: `${window.location.origin}/profile/${data.id}` });
      }
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!modal) return;
    navigator.clipboard.writeText(modal.url);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  };

  return (
    <div style={{ background: '#f5f7fb', minHeight: 'calc(100dvh - 80px)', paddingBottom: '40px' }}>
      {isDemo && (
        <div style={{
          background: '#1e3a6e', color: 'white',
          padding: '9px 20px', textAlign: 'center',
          fontSize: '13px', fontWeight: 600,
        }}>
          DEMO — 실제 저장되지 않습니다
        </div>
      )}

      {/* 프로필 카드 */}
      <div style={{ padding: '20px 20px 0' }}>
        {isExpert ? <ExpertCard profileData={profileData} /> : <SimpleCard profileData={profileData} />}
      </div>

      {/* 소개 */}
      <Section>
        <Label>소개</Label>
        <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#374151' }}>{displayIntro}</p>
      </Section>

      {/* 주요 경력 */}
      {careers.length > 0 && (
        <Section>
          <Label>주요 경력</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {careers.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#1e3a6e', fontSize: '14px', marginTop: '2px', flexShrink: 0 }}>•</span>
                <span style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{c}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 추가 정보 — 카카오/블로그/이메일, 전화버튼 없음 */}
      {(agent?.kakao || agent?.blog || agent?.email) && (
        <Section>
          <Label>추가 정보</Label>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {agent?.kakao && (
              <a href={agent.kakao} target="_blank" rel="noopener noreferrer" style={rowLink}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KakaoIcon />
                  카카오톡 상담
                </span>
                <Chevron />
              </a>
            )}
            {agent?.blog && (
              <a href={agent.blog} target="_blank" rel="noopener noreferrer"
                style={{ ...rowLink, borderBottom: 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <NaverIcon />
                  블로그 보기
                </span>
                <Chevron />
              </a>
            )}
            {agent?.email && !agent?.blog && (
              <a href={`mailto:${agent.email}`}
                style={{ ...rowLink, borderBottom: 'none' }}>
                <span>{agent.email}</span>
                <Chevron />
              </a>
            )}
          </div>
        </Section>
      )}

      {/* 저장 버튼 */}
      <div style={{ padding: '16px 20px 0' }}>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : isDemo ? 'Demo URL 발급' : '저장 및 URL 발급'}
        </button>
        <button className="btn-secondary" style={{ marginTop: '10px' }} onClick={onBack}>
          수정하기
        </button>
      </div>

      {/* 생성 완료 모달 */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center', zIndex: 100,
        }}
          onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div style={{
            background: 'white',
            borderRadius: '20px 20px 0 0',
            padding: '28px 24px 40px',
            width: '100%', maxWidth: '430px',
          }}>
            <div style={{
              width: '40px', height: '4px',
              background: '#e2e8f0', borderRadius: '99px',
              margin: '0 auto 24px',
            }} />

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a2540', marginBottom: '6px' }}>
              프로필 생성 완료
            </h3>
            <p style={{ fontSize: '14px', color: '#718096', marginBottom: '20px' }}>
              프로필 URL이 생성되었습니다.
            </p>

            {/* URL 표시 */}
            <div style={{
              background: '#f8faff',
              border: '1px solid #e2eaf8',
              borderRadius: '10px',
              padding: '12px 14px',
              fontSize: '13px',
              color: '#374151',
              wordBreak: 'break-all',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}>
              {modal.url}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleCopy}
                className="btn-primary"
                style={{ background: '#1e3a6e' }}
              >
                URL 복사
              </button>
              <button
                onClick={() => router.push(`/profile/${modal.id}`)}
                className="btn-secondary"
              >
                내 페이지 보기
              </button>
            </div>

            <button
              onClick={() => setModal(null)}
              style={{
                display: 'block', width: '100%', marginTop: '14px',
                background: 'transparent', border: 'none',
                color: '#94a3b8', fontSize: '14px', cursor: 'pointer', padding: '6px',
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 복사 Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)',
          background: '#1a2540', color: 'white',
          padding: '10px 22px', borderRadius: '99px',
          fontSize: '14px', fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 200, whiteSpace: 'nowrap',
          animation: 'fadeIn 0.2s ease',
        }}>
          URL이 복사되었습니다.
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

// ── 공통 헬퍼 ──
function Section({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      margin: '14px 20px 0',
      background: 'white',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      {children}
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: '11px', fontWeight: 700, color: '#94a3b8',
      letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '12px',
    }}>{children}</p>
  );
}
function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" flexShrink={0}>
      <path d="M9 18l6-6-6-6" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
const rowLink: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '13px 0', borderBottom: '1px solid #f1f5f9',
  fontSize: '14px', color: '#374151', textDecoration: 'none',
};

// 카카오 아이콘
function KakaoIcon() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '22px', height: '22px', borderRadius: '6px',
      background: '#FEE500', flexShrink: 0,
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C6.477 3 2 6.582 2 11c0 2.8 1.57 5.27 3.95 6.84L5 21l3.55-1.9C9.6 19.35 10.77 19.5 12 19.5c5.523 0 10-3.582 10-8s-4.477-8-10-8z" fill="#3A1D1D" />
      </svg>
    </span>
  );
}

// 네이버 아이콘
function NaverIcon() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '22px', height: '22px', borderRadius: '6px',
      background: '#03C75A', flexShrink: 0,
    }}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
        <path d="M3 3h7l4 6V3h7v18h-7l-4-6v6H3z" fill="white" />
      </svg>
    </span>
  );
}

// 전문가 카드
function ExpertCard({ profileData }: { profileData: ProfileData }) {
  const agent = profileData.agentInfo;
  return (
    <div style={{
      borderRadius: '18px',
      background: 'linear-gradient(160deg, #1e3a6e 0%, #0e1e3c 100%)',
      padding: '24px',
      boxShadow: '0 12px 40px rgba(14,30,60,0.22)',
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{
          width: '86px', minWidth: '86px', height: '106px',
          borderRadius: '10px', overflow: 'hidden',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}>
          {profileData.photoUrl && (
            <img src={profileData.processedPhotoUrl || profileData.photoUrl}
              alt={agent?.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {agent?.specialty?.map(s => (
              <span key={s} style={{
                background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
                fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
              }}>{s}</span>
            ))}
          </div>
          <h2 style={{ color: 'white', fontSize: '21px', fontWeight: 700, marginBottom: '3px' }}>
            {agent?.name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '2px' }}>
            {agent?.company}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{agent?.region}</p>
        </div>
      </div>
      {agent?.slogan && (
        <p style={{
          marginTop: '16px', paddingTop: '14px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontStyle: 'italic',
        }}>"{agent.slogan}"</p>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          color: 'rgba(201,168,76,0.55)',
          fontSize: '11px', letterSpacing: '1.5px',
        }}>INCAR PROFILE</span>
      </div>
    </div>
  );
}

// 간편 카드
function SimpleCard({ profileData }: { profileData: ProfileData }) {
  const agent = profileData.agentInfo;
  return (
    <div style={{
      borderRadius: '18px', background: 'white', padding: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    }}>
      <div style={{
        width: '84px', height: '84px', borderRadius: '50%',
        overflow: 'hidden', background: '#e8edf5',
        border: '2.5px solid #1e3a6e', marginBottom: '14px',
      }}>
        {profileData.photoUrl && (
          <img src={profileData.photoUrl} alt={agent?.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '8px' }}>
        {agent?.specialty?.map(s => (
          <span key={s} style={{
            background: '#f0f4fb', color: '#1e3a6e',
            fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '4px',
          }}>{s}</span>
        ))}
      </div>
      <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#1a2540', marginBottom: '3px' }}>
        {agent?.name}
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '2px' }}>{agent?.company}</p>
      <p style={{ color: '#94a3b8', fontSize: '13px' }}>{agent?.region}</p>
      {agent?.slogan && (
        <p style={{ color: '#3a6aa8', fontSize: '13px', fontStyle: 'italic', marginTop: '10px' }}>
          "{agent.slogan}"
        </p>
      )}
      <p style={{
        fontSize: '11px', color: '#cbd5e0',
        marginTop: '14px', paddingTop: '12px',
        borderTop: '1px solid #f1f5f9', width: '100%',
      }}>INCAR PROFILE</p>
    </div>
  );
}
