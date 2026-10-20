export default function Cover({ src, label = '', className = '' }) {
  if (src) return <img src={src} alt="" loading="lazy" className={`object-cover ${className}`} />;
  return (
    <div className={`flex items-center justify-center bg-ink-700 font-semibold text-zinc-400 ${className}`}>
      {label.slice(0, 1).toUpperCase() || '?'}
    </div>
  );
}
