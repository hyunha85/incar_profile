interface HeaderProps {
  showBack?: boolean;
  isDemo?: boolean;
  transparent?: boolean;
  onBack?: () => void;  // 커스텀 뒤로가기 — 없으면 browser back
}

export default function Header({ showBack = true, isDemo = false, transparent = false, onBack }: HeaderProps) {
  const handleBack = () => {
    if (onBack) onBack();
    else if (typeof window !== 'undefined') window.history.back();
  };

  return (
    <header
      className="flex items-center justify-between px-5 py-4"
      style={transparent ? {} : { background: 'white', borderBottom: '1px solid #eef0f5' }}
    >
      {showBack ? (
        <button onClick={handleBack} className="p-1 -ml-1" aria-label="뒤로가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 19L8 12L15 5" stroke="#1e3a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div className="w-8" />
      )}

      <div className="flex items-center gap-2">
        <img
          src="/images/IncarLogo_navy.svg"
          alt="INCAR PROFILE"
          style={{ width: '160px', height: 'auto', display: 'block' }}
        />
        {isDemo && <span className="demo-badge">DEMO</span>}
      </div>

      <div className="w-8" />
    </header>
  );
}
