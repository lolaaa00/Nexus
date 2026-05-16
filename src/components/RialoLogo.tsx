export default function RialoLogo({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="10" y="15" width="50" height="22" rx="11" fill="currentColor"/>
      <rect x="10" y="44" width="80" height="22" rx="11" fill="currentColor"/>
      <rect x="40" y="63" width="50" height="22" rx="11" fill="currentColor"/>
    </svg>
  );
}
