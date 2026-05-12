export default function YinYangIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
      <path d="M50,2 A24,24 0 0,1 50,48 A24,24 0 0,0 50,98 A48,48 0 0,1 50,2" fill="currentColor" opacity="0.4"/>
      <circle cx="50" cy="26" r="6" fill="#0F0F0F" opacity="0.6"/>
      <circle cx="50" cy="74" r="6" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}
