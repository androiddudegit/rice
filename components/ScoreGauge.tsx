"use client";

interface Props {
  score: number;
  size?: "sm" | "lg";
}

export default function ScoreGauge({ score, size = "sm" }: Props) {
  const max = 100;
  const pct = Math.min(score / max, 1);
  const r = size === "lg" ? 36 : 22;
  const cx = size === "lg" ? 44 : 28;
  const cy = size === "lg" ? 44 : 28;
  const svgSize = size === "lg" ? 88 : 56;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * pct;
  const color = score >= 50 ? "#22c55e" : score >= 20 ? "#f59e0b" : "#ef4444";
  const textSize = size === "lg" ? "text-xl font-bold" : "text-xs font-semibold";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={size === "lg" ? 5 : 3}
        />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={size === "lg" ? 5 : 3}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span className={`absolute ${textSize}`} style={{ color }}>
        {score}
      </span>
    </div>
  );
}
