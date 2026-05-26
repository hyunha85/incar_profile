import { ProfileType } from '@/types';
import { useState, useEffect } from 'react';

interface Props {
  selected?: ProfileType;
  onSelect: (type: ProfileType) => void;
  onNext: () => void;
  isDemo: boolean;
}

const TYPES = [
  {
    id: 'expert' as ProfileType,
    tag: '추천',
    title: '전문가 프로필형',
    desc: 'AI 배경제거와 고급 프레임으로 전문적인 브랜드 이미지를 완성합니다.',
    targets: ['상반신 사진 보유자', '브랜드 이미지가 중요한 분'],
    previewText: '전문가 프로필 예시 보기 →',
    modalTitle: '전문가 프로필형',
    modalDesc: '상반신 사진을 AI로 배경 제거 후, 고급 브랜드 카드 템플릿에 합성합니다.',
    modalImg: '/images/sample_pro.jpg',
  },
  {
    id: 'simple' as ProfileType,
    tag: null,
    title: '간편 프로필형',
    desc: '증명사진만으로 빠르고 간편하게 프로필을 제작합니다.',
    targets: ['신입 설계사', '사진 촬영이 어려운 경우'],
    previewText: '간편 프로필 예시 보기 →',
    modalTitle: '간편 프로필형',
    modalDesc: '증명사진을 원형으로 배치하여 심플하고 깔끔한 프로필을 만듭니다.',
    modalImg: '/images/sample_lite.jpg',
  },
];

export default function StepProfileType({ selected, onSelect, onNext, isDemo }: Props) {
  const [chosen, setChosen] = useState<ProfileType | undefined>(selected);
  const [modalType, setModalType] = useState<typeof TYPES[0] | null>(null);

  // ESC 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalType(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (type: ProfileType) => {
    setChosen(type);
    onSelect(type);
  };

  return (
    <div className="px-5 py-4 flex flex-col" style={{ minHeight: 'calc(100dvh - 140px)' }}>
      <div className="mb-6">
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a2540', marginBottom: '6px', letterSpacing: '-0.5px' }}>
          프로필 타입을 선택해주세요
        </h2>
        <p style={{ color: '#718096', fontSize: '14px' }}>당신에게 맞는 브랜딩 방식을 선택하세요.</p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {TYPES.map(type => (
          <div
            key={type.id}
            className={`profile-card ${chosen === type.id ? 'selected' : ''}`}
            onClick={() => handleSelect(type.id)}
          >
            <div className="flex gap-4">
              {/* 썸네일 */}
             <div style={{
                  width: '100px', minWidth: '100px', height: '130px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  <img
                    src={type.modalImg}
                    alt={type.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                  />
                </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {type.tag && (
                    <span style={{ background: '#1e3a6e', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px' }}>
                      {type.tag}
                    </span>
                  )}
                  <div style={{ marginLeft: 'auto' }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      border: chosen === type.id ? 'none' : '2px solid #d1d5db',
                      background: chosen === type.id ? '#1e3a6e' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {chosen === type.id && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a2540', marginBottom: '4px' }}>{type.title}</h3>
                <p style={{ fontSize: '12px', color: '#718096', lineHeight: 1.5, marginBottom: '8px' }}>{type.desc}</p>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>추천 대상</p>
                {type.targets.map(t => (
                  <p key={t} style={{ fontSize: '12px', color: '#64748b' }}>· {t}</p>
                ))}
              </div>
            </div>

            {/* 예시 보기 버튼 — 카드 선택 이벤트와 분리 */}
            <button
              onClick={e => { e.stopPropagation(); setModalType(type); }}
              style={{
                marginTop: '12px',
                borderTop: '1px solid #f1f5f9',
                width: '100%', textAlign: 'left',
                fontSize: '12px', color: '#3a6aa8', fontWeight: 600,
                background: 'transparent', border: 'none',
                cursor: 'pointer', padding: '12px 0 0',
              }}
            >
              {type.previewText}
            </button>
          </div>
        ))}
      </div>

      <div className="pt-6 pb-4">
        <button className="btn-primary" disabled={!chosen} onClick={onNext}>
          브랜딩 시작하기 →
        </button>
      </div>

      {/* 예시 모달 */}
      {modalType && (
        <div
          onClick={() => setModalType(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200, padding: '24px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '20px',
              width: '100%', maxWidth: '360px',
              overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* 이미지 영역 */}
            <div style={{
              background: '#f1f5f9', height: '480px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <img
                src={modalType.modalImg}
                alt={modalType.modalTitle}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', position: 'relative', zIndex: 2 }}
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const placeholder = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
              {/* 이미지 없을 때만 표시되는 플레이스홀더 */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: modalType.id === 'expert' ? 'linear-gradient(160deg,#1e3a6e,#0e1e3c)' : '#f8faff',
              }}>
                <div style={{
                  width: '60px', height: '75px', borderRadius: '8px',
                  background: modalType.id === 'expert' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                  marginBottom: '8px',
                }} />
                <p style={{ color: modalType.id === 'expert' ? 'rgba(255,255,255,0.5)' : '#94a3b8', fontSize: '12px' }}>
                  {modalType.modalTitle} 예시
                </p>
              </div>

              {/* X 버튼 */}
              <button
                onClick={() => setModalType(null)}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)', border: 'none',
                  color: 'white', fontSize: '16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>

            {/* 내용 */}
            <div style={{ padding: '20px 20px 24px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1a2540', marginBottom: '10px' }}>
                {modalType.modalTitle}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {modalType.modalDesc}
              </p>
              <button
                onClick={() => { handleSelect(modalType.id); setModalType(null); }}
                className="btn-primary"
                style={{ marginTop: '16px' }}
              >
                이 유형으로 선택
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
