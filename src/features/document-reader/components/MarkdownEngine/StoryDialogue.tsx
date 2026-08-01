import Image from 'next/image';
import { parseInlineStyles } from './MarkdownParser';

export interface StoryDialogueProps {
  speaker: string;
  content: string;
  avatar?: string;
  side?: 'left' | 'right';
  color?: string;
  id?: string;
}

export function StoryDialogue({ speaker, content, avatar, side = 'left', color, id }: StoryDialogueProps) {
  const isRight = side === 'right';
  const accentColor = color || '#8B2FE0';
  const htmlContent = parseInlineStyles(content);

  return (
    <div id={id} className={`my-6 flex items-start gap-4 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 shadow-lg relative bg-black/80 flex items-center justify-center font-mono font-bold text-white text-sm"
        style={{ borderColor: accentColor }}
      >
        {avatar ? (
          <Image src={avatar} alt={speaker} fill className="object-cover" />
        ) : (
          <span>{speaker.slice(0, 2).toUpperCase()}</span>
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-2xl p-5 rounded-2xl border backdrop-blur-md shadow-xl bg-[#120A08]/90 font-sans ${
          isRight ? 'rounded-tr-none' : 'rounded-tl-none'
        }`}
        style={{ borderColor: `${accentColor}40` }}
      >
        <div className="font-mono text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: accentColor }}>
          {speaker}
        </div>
        <div
          className="text-xs sm:text-sm text-[#F2EDE4] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
}
