import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>INCAR PROFILE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content="AI로 완성하는 설계사 퍼스널 브랜딩" />
      </Head>

      <div className="mobile-container" style={{
        minHeight: '100dvh',
        background: 'linear-gradient(170deg, #193070 20%, #1a3265 40%, #0e1e3c 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 32px',
        position: 'relative',
        overflow: 'visible',  // 배경 장식용 absolute 요소는 mobile-container가 clip
      }}>

        {/* 배경 미묘한 빛 */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%) !important',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(58,106,168,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* 콘텐츠 래퍼 */}
        <div style={{ width: '100%', maxWidth: '320px', textAlign: 'center' }}>

          {/* 1. INCAR PROFILE 타이틀 */}
          <div style={{ animation: 'fadeUp 0.7s ease both', animationDelay: '0.1s' }}>
            <img
              src="/images/IncarProfile_logo.svg"
              alt="INCAR PROFILE"
              style={{
                width: '200px',
                height: 'auto',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </div>

          {/* 2. 세로 라인 — max-height 0 → 70px */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '28px 0 26px',
          }}>
            <div style={{
              width: '1px',
              background: 'rgba(255,255,255,0.35)',
              animation: 'lineGrow 0.6s ease both',
              animationDelay: '0.55s',
            }} />
          </div>

          {/* 3. 메인 문구 */}
          <div style={{ animation: 'fadeUp 0.7s ease both', animationDelay: '0.9s' }}>
            <p style={{
              fontSize: '23px',
              fontWeight: 500,
              color: 'white',
              lineHeight: 1.5,
              marginBottom: '12px',
              letterSpacing: '-0.3px',
            }}>
              AI로 완성하는<br />
              설계사 퍼스널 브랜딩
            </p>
          </div>

          {/* 4. 서브 문구 */}
          <div style={{ animation: 'fadeUp 0.7s ease both', animationDelay: '1.1s' }}>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.7,
              marginBottom: '0',
            }}>
              신뢰는 쌓이고 전문성은 기억되도록,<br />
              당신만의 브랜딩을 완성하세요.
            </p>
          </div>

          {/* 5. 버튼 */}
          <div style={{
            marginTop: '44px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeUp 0.7s ease both',
            animationDelay: '1.3s',
          }}>
            {/* 프로필 만들기 — 흰색 */}
            <button
              onClick={() => router.push('/create')}
              style={{
                width: '100%',
                background: 'white',
                color: '#1a2f5a',
                border: 'none',
                borderRadius: '14px',
                padding: '17px 24px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '-0.2px',
                fontFamily: 'inherit',
              }}
            >
              프로필 만들기 
            </button>

            {/* Demo 체험하기 — 투명 + 흰 테두리 */}
            <button
              onClick={() => router.push('/create?demo=true')}
              style={{
                width: '100%',
                background: 'transparent',
                color: 'rgba(255,255,255,0.85)',
                border: '1.5px solid rgba(255,255,255,0.35)',
                borderRadius: '14px',
                padding: '16px 24px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
                letterSpacing: '-0.2px',
                fontFamily: 'inherit',
              }}
            >
              Demo 체험하기
            </button>
          </div>
        </div>

        {/* 6. 하단 인카 로고 */}
        <div className="landing-logo-bottom" style={{
          animation: 'fadeUp 0.7s ease both',
          animationDelay: '1.5s',
        }}>
          <img
            src="/images/IncarLogo.svg"
            alt="인카금융서비스"
            style={{
              width: '200px',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>

        {/* 키프레임 애니메이션 */}
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes lineGrow {
            from { opacity: 0; max-height: 0; }
            to   { opacity: 1; max-height: 70px; }
          }
        `}</style>
      </div>
    </>
  );
}
