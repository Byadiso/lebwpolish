export default function FeatureIcon({ name = 'note', size = 20, className = '' }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', className, 'aria-hidden': true };
  if (name === 'chart') return <svg {...common}><path d="M3 3v18h18"/><path d="M7 16v-4M12 16V7M17 16v-6"/></svg>;
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>;
  if (name === 'close') return <svg {...common}><path d="M18 6 6 18M6 6l12 12"/></svg>;
  return <svg {...common}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z"/><path d="m14.5 5.5 3 3"/></svg>;
}
