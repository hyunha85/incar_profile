interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percent = (current / total) * 100;

  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-slate-500">{label || '프로필 타입 선택'}</span>
        <span className="text-sm font-semibold text-slate-400">{current}/{total}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
