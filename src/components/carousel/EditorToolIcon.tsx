export type EditorToolIconKey = 'template' | 'background' | 'text' | 'sticker';

export function EditorToolIcon({ tool, className = 'h-5 w-5' }: { tool: EditorToolIconKey; className?: string }) {
  if (tool === 'template') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5.25" y="5.25" width="13.5" height="13.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 8.5h-2v2M13.5 8.5h2v2M10.5 15.5h-2v-2M13.5 15.5h2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (tool === 'background') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5.25" y="5.25" width="13.5" height="13.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="m6.5 16 3.55-3.85a1 1 0 0 1 1.46 0l1.72 1.85 1.9-2.08a1 1 0 0 1 1.48.02l1.14 1.28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.35" cy="9.25" r="1.15" fill="currentColor" />
      </svg>
    );
  }

  if (tool === 'text') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5.25" y="5.25" width="13.5" height="13.5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8.5 9h7M12 9v6.5M10.35 15.5h3.3" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.75 11.8C4.75 7.9 7.9 4.75 11.8 4.75h.4c3.9 0 7.05 3.15 7.05 7.05v.4c0 1.6-.53 3.08-1.43 4.27l-3.65 3.65a7.02 7.02 0 0 1-2.37.38h-.4a7.05 7.05 0 0 1-6.65-4.72 7.3 7.3 0 0 1 0-3.98Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M19.25 11.8h-1.8a5.65 5.65 0 0 0-5.65 5.65v1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function EditorToolNavItem({
  active,
  label,
  onClick,
  tool,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  tool: EditorToolIconKey;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'flex h-14 w-full flex-col items-center justify-center gap-1 rounded-[4px] transition-colors',
        active ? 'bg-[#f3f3f3] text-[#161823]' : 'text-[#6b6f76] hover:bg-[#f7f7f7]',
      ].join(' ')}
    >
      <EditorToolIcon tool={tool} />
      <span className="text-center text-[12px] leading-4">{label}</span>
    </button>
  );
}
