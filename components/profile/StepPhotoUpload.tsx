import { ProfileType } from '@/types';
import { useState, useRef } from 'react';

interface Props {
  profileType: ProfileType;
  onUpload: (original: string, processed?: string) => void;
  onNext: () => void;
  onBack: () => void;
  isDemo: boolean;
}

type ExpertPhase = 'upload' | 'preview' | 'removing' | 'done' | 'failed';

export default function StepPhotoUpload({ profileType, onUpload, onNext, onBack, isDemo }: Props) {
  const isExpert = profileType === 'expert';
  const fileRef = useRef<HTMLInputElement>(null);

  // 간편형
  const [simplePreview, setSimplePreview] = useState<string | null>(
    isDemo ? '/demo/sample-agent.png' : null
  );

  // 전문가형 — Demo는 upload 단계부터 시작 (체감 개선)
  const [phase, setPhase] = useState<ExpertPhase>('upload');
  const [original, setOriginal] = useState<string | null>(null);
  const [processed, setProcessed] = useState<string | null>(null);
  const [failMsg, setFailMsg] = useState('');

  // Demo: 샘플 파일을 원본으로 세팅하고 preview 단계로
  const initDemo = () => {
    setOriginal('/demo/sample-agent.png');
    setPhase('preview');
  };

  const handleSimpleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setSimplePreview(result);
      onUpload(result); // 간편형: 원본만
    };
    reader.readAsDataURL(file);
  };

  const handleExpertFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      setOriginal(e.target?.result as string);
      setPhase('preview');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBg = async () => {
    if (!original) return;
    setPhase('removing');

    if (isDemo) {
      // Demo: 2초 딜레이 후 샘플 누끼 이미지로 완료
      await new Promise(r => setTimeout(r, 2000));
      setProcessed('/demo/sample-agent-nobg.png');
      setPhase('done');
      onUpload('/demo/sample-agent.png', '/demo/sample-agent-nobg.png'); // Demo: 원본 + 누끼
      return;
    }

    try {
      const res = await fetch('/api/profile/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: original, profileType: 'expert' }),
      });
      const data = await res.json();
      if (data.success && data.url) {
        setProcessed(data.url);
        setPhase('done');
        onUpload(original, data.url); // 원본 + 누끼(base64 or URL) 모두 전달
      } else {
        throw new Error(data.error || '배경 제거 실패');
      }
    } catch (e: any) {
      setFailMsg(e.message || '배경 제거에 실패했습니다.');
      setPhase('failed');
    }
  };

  const handleUsePhoto = () => {
    onUpload(original || '', processed || undefined); // 누끼 있으면 함께 전달
    onNext();
  };

  const resetExpert = () => {
    setOriginal(null);
    setProcessed(null);
    setPhase('upload');
    setFailMsg('');
  };

  // ── 간편형 ──
  if (!isExpert) {
    return (
      <div className="px-5 py-4 flex flex-col" style={{ minHeight: 'calc(100dvh - 140px)' }}>
        <div className="mb-5">
          <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#1a2540', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            사진을 업로드하세요
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>증명사진 또는 얼굴이 잘 보이는 사진</p>
        </div>
        <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '13px 16px', marginBottom: '20px', fontSize: '13px', color: '#166534', lineHeight: 1.7 }}>
          <strong>간편 프로필형</strong><br />
          · 정면을 바라보는 밝은 사진<br />
          · 해상도 300×300px 이상<br />
          <span style={{ color: '#6b7280', fontSize: '12px' }}>* 원형으로 자동 크롭됩니다</span>
        </div>
        <div
          onClick={() => !isDemo && fileRef.current?.click()}
          style={{
            flex: 1, minHeight: '240px', border: '2px dashed #d1d9e6',
            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isDemo ? 'default' : 'pointer', background: '#fafbff',
            overflow: 'hidden', position: 'relative',
          }}
        >
          {simplePreview ? (
            <>
              <img src={simplePreview} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              {isDemo && <div style={{ position: 'absolute', top: '10px', right: '10px' }}><span className="demo-badge">DEMO</span></div>}
              {!isDemo && (
                <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: '13px', padding: '6px 16px', borderRadius: '99px' }}>탭하여 변경</div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📷</div>
              <p style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>사진 업로드</p>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>탭하여 선택</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleSimpleFile(f); }} />
        <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="btn-primary"
            disabled={!simplePreview && !isDemo}
            onClick={() => { if (isDemo) onUpload('/demo/sample-agent.png'); onNext(); }}>  // 간편형 Demo
            다음 단계
          </button>
          <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '14px', padding: '8px', cursor: 'pointer' }}
            onClick={onNext}>사진 없이 진행하기</button>
        </div>
      </div>
    );
  }

  // ── 전문가형 ──
  return (
    <div className="px-5 py-4" style={{ minHeight: 'calc(100dvh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <div className="mb-5">
        <h2 style={{ fontSize: '21px', fontWeight: 700, color: '#1a2540', marginBottom: '6px', letterSpacing: '-0.5px' }}>
          사진을 업로드하세요
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>상반신이 잘 나온 정면 사진을 권장합니다.</p>
      </div>

      {/* PHASE: upload */}
      {phase === 'upload' && (
        <>
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '13px 16px', marginBottom: '20px', fontSize: '13px', color: '#1e40af', lineHeight: 1.7 }}>
            <strong>전문가 프로필형</strong><br />
            · 상반신(가슴 위) 정면 사진<br />
            · 단색 또는 단순한 배경 권장<br />
            · 해상도 500×500px 이상<br />
            <span style={{ color: '#6b7280', fontSize: '12px' }}>* AI가 배경을 자동으로 제거합니다</span>
          </div>
          <div
            onClick={() => isDemo ? initDemo() : fileRef.current?.click()}
            style={{
              flex: 1, minHeight: '260px', border: '2px dashed #d1d9e6',
              borderRadius: '16px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', background: '#fafbff',
            }}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>📷</div>
              <p style={{ color: '#1e3a6e', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
                {isDemo ? 'Demo 사진 불러오기' : '사진 업로드'}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                {isDemo ? '탭하여 샘플 사진 사용' : '탭하여 선택'}
              </p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleExpertFile(f); }} />
        </>
      )}

      {/* PHASE: preview — 원본 + AI 배경제거 버튼 */}
      {phase === 'preview' && original && (
        <>
          <div style={{ flex: 1, minHeight: '300px', borderRadius: '16px', overflow: 'hidden', position: 'relative', background: '#f1f5f9' }}>
            <img src={original} alt="원본" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.55)', color: 'white', fontSize: '12px', padding: '4px 12px', borderRadius: '99px' }}>
              {isDemo ? 'Demo 샘플 사진' : '원본 사진'}
            </div>
          </div>
          <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-primary" onClick={handleRemoveBg}>
              AI로 배경 제거하기
            </button>
            <button style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '14px', padding: '8px', cursor: 'pointer' }}
              onClick={resetExpert}>다른 사진 선택</button>
          </div>
        </>
      )}

      {/* PHASE: removing — 로딩 */}
      {phase === 'removing' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#1e3a6e', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a2540', marginBottom: '6px' }}>AI가 배경을 제거하고 있습니다.</p>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>잠시만 기다려주세요.</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* PHASE: done */}
      {phase === 'done' && (
        <>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{
              width: '100%', minHeight: '300px', borderRadius: '16px',
              background: 'repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%) 0 0 / 20px 20px',
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={processed || original || ''} alt="배경제거 결과"
                style={{ maxHeight: '320px', maxWidth: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(5,150,105,0.85)', color: 'white', fontSize: '12px', padding: '4px 12px', borderRadius: '99px', fontWeight: 600 }}>
                배경 제거 완료
              </div>
            </div>
          </div>
          <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-primary" onClick={handleUsePhoto}>이 사진 사용하기</button>
            <button className="btn-secondary" onClick={resetExpert}>다시 하기</button>
          </div>
        </>
      )}

      {/* PHASE: failed */}
      {phase === 'failed' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ fontSize: '40px' }}>⚠️</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1a2540', marginBottom: '6px' }}>배경 제거에 실패했습니다.</p>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>{failMsg || '다른 사진으로 다시 시도해주세요.'}</p>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn-primary" onClick={() => fileRef.current?.click()}>다른 사진 선택</button>
            <button className="btn-secondary" onClick={handleRemoveBg}>다시 시도</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleExpertFile(f); }} />
        </div>
      )}
    </div>
  );
}
