import { parseInlineStyles } from './MarkdownParser';

export interface StoryCalloutProps {
  type: string;
  title: string;
  content: string;
}

export function StoryCallout({ type, title, content }: StoryCalloutProps) {
  const lowerType = type.toLowerCase();

  const calloutStyles: Record<string, { border: string; bg: string; titleColor: string; icon: string }> = {
    note: {
      border: 'border-[#8B2FE0]/60',
      bg: 'bg-[#8B2FE0]/10',
      titleColor: 'text-[#C084FC]',
      icon: '📜',
    },
    thought: {
      border: 'border-[#7ED957]/60',
      bg: 'bg-[#7ED957]/10',
      titleColor: 'text-[#7ED957]',
      icon: '💭',
    },
    lore: {
      border: 'border-[#FFD700]/60',
      bg: 'bg-[#FFD700]/10',
      titleColor: 'text-[#FFD700]',
      icon: '🔮',
    },
    warning: {
      border: 'border-[#DC143C]/60',
      bg: 'bg-[#DC143C]/15',
      titleColor: 'text-[#DC143C]',
      icon: '⚠️',
    },
    quote: {
      border: 'border-white/30',
      bg: 'bg-white/5',
      titleColor: 'text-white',
      icon: '💬',
    },
  };

  const style = calloutStyles[lowerType] || calloutStyles.note;
  const htmlContent = parseInlineStyles(content);

  return (
    <div className={`my-6 p-5 rounded-2xl border-l-4 ${style.border} ${style.bg} backdrop-blur-md shadow-lg font-sans`}>
      <div className="flex items-center gap-2 mb-2 font-mono text-xs font-bold uppercase tracking-wider">
        <span className="text-base">{style.icon}</span>
        <span className={style.titleColor}>{title}</span>
      </div>
      <div
        className="text-xs sm:text-sm text-[#F2EDE4]/90 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
