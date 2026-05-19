export default function RialoLogo({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="10" y="12" width="52" height="20" rx="10" fill={color}/>
      <rect x="10" y="40" width="80" height="20" rx="10" fill={color}/>
      <rect x="38" y="68" width="52" height="20" rx="10" fill={color}/>
    </svg>
  );
}
