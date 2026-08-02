export interface ParsedFrontmatter {
  title?: string;
  author?: string;
  chapter_number?: number;
  bgm?: string;
  ambient_light?: string;
  default_font?: string;
  reading_time_minutes?: number;
  tags?: string[];
  [key: string]: unknown;
}

export interface MarkdownBlock {
  type:
    | 'paragraph'
    | 'heading'
    | 'callout'
    | 'speech'
    | 'scene_divider'
    | 'cyoa_choice'
    | 'table'
    | 'embed_image'
    | 'audio_trigger';
  level?: number;
  content: string;
  calloutType?: string;
  calloutTitle?: string;
  speaker?: string;
  avatar?: string;
  side?: 'left' | 'right';
  color?: string;
  font?: string;
  id?: string;
  src?: string;
  alt?: string;
  dimensions?: string;
}

export interface ParsedChapter {
  id: string;
  index: number;
  chapterNumber?: number;
  title: string;
  actOrSeason?: string;
  blocks: MarkdownBlock[];
}

export interface ParsedStory {
  frontmatter: ParsedFrontmatter;
  blocks: MarkdownBlock[];
}

export interface ParsedStoryWithChapters {
  frontmatter: ParsedFrontmatter;
  chapters: ParsedChapter[];
  emptyActs: string[];
}

export function parseYamlFrontmatter(markdown: string): { frontmatter: ParsedFrontmatter; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, content: markdown };
  }

  const yamlStr = match[1];
  const content = markdown.replace(frontmatterRegex, '');
  const frontmatter: ParsedFrontmatter = {};

  yamlStr.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value: unknown = line.slice(colonIndex + 1).trim();

      // Clean quotes
      if (typeof value === 'string') {
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!isNaN(Number(value))) {
          value = Number(value);
        }
      }
      frontmatter[key] = value;
    }
  });

  return { frontmatter, content };
}

export function parseMarkdownStory(rawMarkdown: string): ParsedStory {
  const { frontmatter, content: cleanContent } = parseYamlFrontmatter(rawMarkdown);

  // 1. Remove comments %% ... %%
  const sanitized = cleanContent.replace(/%%[\s\S]*?%%/g, '');

  // Split into raw lines / paragraphs
  const rawLines = sanitized.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];

  let currentBlockLines: string[] = [];
  let inCallout = false;
  let calloutType = 'note';
  let calloutTitle = '';

  const flushParagraph = () => {
    if (currentBlockLines.length === 0) return;
    const blockText = currentBlockLines.join('\n').trim();
    if (!blockText) {
      currentBlockLines = [];
      return;
    }

    // Check block id ^id
    let blockId: string | undefined = undefined;
    const idMatch = blockText.match(/\^([a-zA-Z0-9_-]+)$/);
    let textWithoutId = blockText;
    if (idMatch) {
      blockId = idMatch[1];
      textWithoutId = blockText.replace(/\^([a-zA-Z0-9_-]+)$/, '').trim();
    }

    // Check dialogue format **Elena:** "Quote..."
    const speechMatch = textWithoutId.match(/^[*_]{2}([^:*_]+)[*_]{2}:\s*([\s\S]+)$/);
    if (speechMatch) {
      blocks.push({
        type: 'speech',
        speaker: speechMatch[1].trim(),
        content: speechMatch[2].trim(),
        id: blockId,
      });
      currentBlockLines = [];
      return;
    }

    // Check HTML <speech>
    const htmlSpeechTag = textWithoutId.match(/<speech\s*([\s\S]*?)>([\s\S]*?)<\/speech>/i);
    if (htmlSpeechTag) {
      const attrsStr = htmlSpeechTag[1];
      const speechBody = htmlSpeechTag[2].trim();

      const speakerMatch = attrsStr.match(/speaker=["']([^"']*)["']/i);
      const avatarMatch = attrsStr.match(/avatar=["']([^"']*)["']/i);
      const sideMatch = attrsStr.match(/side=["']([^"']*)["']/i);
      const colorMatch = attrsStr.match(/color=["']([^"']*)["']/i);

      blocks.push({
        type: 'speech',
        speaker: speakerMatch ? speakerMatch[1] || 'Personaje' : 'Personaje',
        avatar: avatarMatch && avatarMatch[1] ? avatarMatch[1] : undefined,
        side: sideMatch && (sideMatch[1] === 'left' || sideMatch[1] === 'right') ? (sideMatch[1] as 'left' | 'right') : 'left',
        color: colorMatch && colorMatch[1] ? colorMatch[1] : undefined,
        content: speechBody,
        id: blockId,
      });
      currentBlockLines = [];
      return;
    }

    // Check Embed image ![[Engelbart.jpg|300x400]] or ![alt](url)
    const obsidianEmbed = textWithoutId.match(/^!\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/);
    if (obsidianEmbed) {
      blocks.push({
        type: 'embed_image',
        src: obsidianEmbed[1],
        dimensions: obsidianEmbed[2],
        content: '',
        id: blockId,
      });
      currentBlockLines = [];
      return;
    }

    // Check standard image ![alt](url)
    const stdImage = textWithoutId.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (stdImage) {
      blocks.push({
        type: 'embed_image',
        alt: stdImage[1],
        src: stdImage[2],
        content: '',
        id: blockId,
      });
      currentBlockLines = [];
      return;
    }

    // Check audio trigger ::audio-bgm[...] or ::audio-sfx[...]
    const audioMatch = textWithoutId.match(/^::audio-(bgm|sfx)\[src="([^"]+)"(?:\s+loop="([^"]+)")?(?:\s+volume="([^"]+)")?\]$/);
    if (audioMatch) {
      blocks.push({
        type: 'audio_trigger',
        calloutType: audioMatch[1],
        src: audioMatch[2],
        content: '',
        id: blockId,
      });
      currentBlockLines = [];
      return;
    }

    // Standard paragraph
    blocks.push({
      type: 'paragraph',
      content: textWithoutId,
      id: blockId,
    });

    currentBlockLines = [];
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // CYOA Choice buttons: - [ ] [Choice Text](#target-id)
    const cyoaMatch = line.match(/^-\s*\[\s*\]\s*\[([^\]]+)\]\((#[^)]+)\)/);
    if (cyoaMatch) {
      flushParagraph();
      blocks.push({
        type: 'cyoa_choice',
        content: cyoaMatch[1].trim(),
        id: cyoaMatch[2].replace('#', ''),
      });
      continue;
    }

    // Scene dividers ***, ---, ___
    if (/^(?:\*\*\*|---|___)$/.test(line.trim())) {
      flushParagraph();
      blocks.push({ type: 'scene_divider', content: '' });
      continue;
    }

    // Headings #, ##, ###, ####
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2].trim(),
      });
      continue;
    }

    // Callout start > [!note] Title
    const calloutMatch = line.match(/^>\s*\[!([a-zA-Z0-9_-]+)\]\s*(.*)$/);
    if (calloutMatch) {
      flushParagraph();
      inCallout = true;
      calloutType = calloutMatch[1];
      calloutTitle = calloutMatch[2] || calloutMatch[1].toUpperCase();
      continue;
    }

    if (inCallout) {
      if (line.startsWith('>')) {
        currentBlockLines.push(line.replace(/^>\s?/, ''));
        continue;
      } else {
        // End of callout
        blocks.push({
          type: 'callout',
          calloutType,
          calloutTitle,
          content: currentBlockLines.join('\n').trim(),
        });
        currentBlockLines = [];
        inCallout = false;
      }
    }

    // Empty line separates paragraphs
    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    currentBlockLines.push(line);
  }

  if (inCallout) {
    blocks.push({
      type: 'callout',
      calloutType,
      calloutTitle,
      content: currentBlockLines.join('\n').trim(),
    });
  } else {
    flushParagraph();
  }

  return { frontmatter, blocks };
}

export function parseInlineStyles(text: string): string {
  if (!text) return '';

  let result = text;

  // Wikilinks [[Target|Alias]] -> Alias, [[Target]] -> Target
  result = result.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '<a class="story-link text-[#C084FC] underline decoration-[#8B2FE0]/40 font-bold hover:text-white transition-colors" href="#$1">$2</a>');
  result = result.replace(/\[\[([^\]]+)\]\]/g, '<a class="story-link text-[#C084FC] underline decoration-[#8B2FE0]/40 font-bold hover:text-white transition-colors" href="#$1">$1</a>');

  // Highlights ==text== -> <mark class="story-highlight">text</mark>
  result = result.replace(/==(.*?)==/g, '<mark class="story-highlight bg-[#8B2FE0]/30 text-[#F2EDE4] px-1.5 py-0.5 rounded border border-[#8B2FE0]/50 font-semibold">$1</mark>');

  // Underline <u>text</u> or ++text++
  result = result.replace(/\+\+(.*?)\+\+/g, '<u class="story-underline underline decoration-[#8B2FE0] underline-offset-4">$1</u>');

  // Sizes {size: small/large/xl}
  result = result.replace(/\{size:\s*small\}(.*?)(?=\{size:|\n|$)/g, '<span class="text-xs opacity-75 font-normal">$1</span>');
  result = result.replace(/\{size:\s*large\}(.*?)(?=\{size:|\n|$)/g, '<span class="text-xl font-bold text-white">$1</span>');
  result = result.replace(/\{size:\s*xl\}(.*?)(?=\{size:|\n|$)/g, '<span class="text-2xl sm:text-3xl font-black uppercase text-white">$1</span>');

  // Font attribute {font: name}
  result = result.replace(/\{font:\s*([a-zA-Z0-9_-]+)\}/g, '');

  // Exponent ^sup^
  result = result.replace(/\^([^\^]+)\^/g, '<sup class="text-[0.75em] text-[#C084FC] font-mono">$1</sup>');

  // Whispers & Subscripts ~text~
  result = result.replace(/~([^~]+)~/g, (_, txt) => {
    if (txt.toLowerCase() === 'susurro' || txt.includes(' ')) {
      return `<span class="story-whisper italic opacity-70 text-xs tracking-wider">${txt}</span>`;
    }
    return `<sub class="text-[0.75em] text-[#7ED957] font-mono">${txt}</sub>`;
  });

  // Colors [Text]{color: token_or_hex}
  result = result.replace(/\[([^\]]+)\]\{color:\s*([^}]+)\}/g, (_, txt, clr) => {
    return `<span class="story-color-${clr.trim()} font-semibold" style="color: ${getNarrativeColorHex(clr)}">${txt}</span>`;
  });

  // Effects [Text]{glow: color}
  result = result.replace(/\[([^\]]+)\]\{glow:\s*([^}]+)\}/g, (_, txt, clr) => {
    return `<span class="story-effect-glow font-bold" style="text-shadow: 0 0 12px ${clr}">${txt}</span>`;
  });

  // Effects [Text]{effect: shake}
  result = result.replace(/\[([^\]]+)\]\{effect:\s*shake\}/g, '<span class="story-effect-shake inline-block animate-bounce font-bold text-[#DC143C]">$1</span>');

  // Effects [Text]{effect: fade}
  result = result.replace(/\[([^\]]+)\]\{effect:\s*fade\}/g, '<span class="story-effect-fade opacity-60 hover:opacity-100 transition-opacity font-italic">$1</span>');

  // Bold & Italic
  result = result.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="story-bold">$1</strong>');
  result = result.replace(/\*(.*?)\*/g, '<em class="story-italic">$1</em>');

  // Strikethrough ~~text~~
  result = result.replace(/~~(.*?)~~/g, '<del class="story-strike opacity-60 line-through">$1</del>');

  return result;
}

export function getNarrativeColorHex(colorToken: string): string {
  const tokenMap: Record<string, string> = {
    primary: '#e0e0e0',
    hero: '#ffd700',
    gold: '#ffd700',
    danger: '#dc143c',
    blood: '#dc143c',
    magic: '#9370db',
    arcane: '#9370db',
    poison: '#32cd32',
    nature: '#32cd32',
    ice: '#00bfff',
    mana: '#00bfff',
    shadow: '#6b7280',
    dark: '#4a4a4a',
    holy: '#fff8dc',
    light: '#fff8dc',
  };

  const lower = colorToken.trim().toLowerCase();
  if (tokenMap[lower]) return tokenMap[lower];
  if (colorToken.startsWith('#') || colorToken.startsWith('rgb')) return colorToken;
  return '#e0e0e0';
}

export function parseStoryChapters(rawMarkdown: string): ParsedStoryWithChapters {
  const { frontmatter, blocks } = parseMarkdownStory(rawMarkdown);

  const allEncounteredActs: string[] = [];
  if (frontmatter.act) allEncounteredActs.push(String(frontmatter.act));
  if (frontmatter.season) allEncounteredActs.push(String(frontmatter.season));

  if (blocks.length === 0) {
    return {
      frontmatter,
      chapters: [
        {
          id: 'seccion-1',
          index: 0,
          chapterNumber: 1,
          title: (frontmatter.title as string) || 'Inicio',
          actOrSeason: frontmatter.act ? String(frontmatter.act) : frontmatter.season ? String(frontmatter.season) : undefined,
          blocks: [],
        },
      ],
      emptyActs: [],
    };
  }

  const chapters: ParsedChapter[] = [];
  let currentChapterBlocks: MarkdownBlock[] = [];
  let currentChapterTitle = (frontmatter.title as string) || 'Inicio';
  let currentActOrSeason: string | undefined = frontmatter.act
    ? String(frontmatter.act)
    : frontmatter.season
    ? String(frontmatter.season)
    : undefined;
  let sectionIndex = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Act or Season Break: ## Acto I, ## Temporada 1, ## Parte 1
    if (
      block.type === 'heading' &&
      block.level === 2 &&
      /acto|parte|temporada|season|act|volumen|volume|libro|book|saga|arc|arco|sección|seccion/i.test(block.content)
    ) {
      if (currentChapterBlocks.length > 0) {
        chapters.push({
          id: `seccion-${sectionIndex + 1}`,
          index: sectionIndex,
          chapterNumber: sectionIndex + 1,
          title: currentChapterTitle,
          actOrSeason: currentActOrSeason,
          blocks: currentChapterBlocks,
        });
        sectionIndex++;
        currentChapterBlocks = [];
      }

      const actName = block.content.trim();
      currentActOrSeason = actName;
      if (!allEncounteredActs.includes(actName)) {
        allEncounteredActs.push(actName);
      }
      continue;
    }

    // Chapter Break: # Heading 1 or headings containing Chapter, Prologue, Epilogue, Interlude
    const isChapterHeaderBreak =
      block.type === 'heading' &&
      (block.level === 1 || /capítulo|chapter|prólogo|prologue|epílogo|epilogue|interludio|interlude/i.test(block.content));

    if (isChapterHeaderBreak) {
      if (currentChapterBlocks.length > 0) {
        chapters.push({
          id: `seccion-${sectionIndex + 1}`,
          index: sectionIndex,
          chapterNumber: sectionIndex + 1,
          title: currentChapterTitle,
          actOrSeason: currentActOrSeason,
          blocks: currentChapterBlocks,
        });
        sectionIndex++;
        currentChapterBlocks = [];
      }
      currentChapterTitle = block.content;
    } else {
      currentChapterBlocks.push(block);
    }
  }

  if (currentChapterBlocks.length > 0 || chapters.length === 0) {
    chapters.push({
      id: `seccion-${sectionIndex + 1}`,
      index: sectionIndex,
      chapterNumber: sectionIndex + 1,
      title: currentChapterTitle,
      actOrSeason: currentActOrSeason,
      blocks: currentChapterBlocks,
    });
  }

  const usedActs = new Set(chapters.map((c) => c.actOrSeason).filter((a): a is string => Boolean(a)));
  const emptyActs = allEncounteredActs.filter((a) => !usedActs.has(a));

  return { frontmatter, chapters, emptyActs };
}

export function serializeStoryChapters(
  frontmatter: ParsedFrontmatter,
  chapters: ParsedChapter[],
  emptyActs: string[] = []
): string {
  let md = '';

  const keys = Object.keys(frontmatter);
  if (keys.length > 0) {
    md += '---\n';
    for (const k of keys) {
      const val = frontmatter[k];
      if (Array.isArray(val)) {
        md += `${k}:\n`;
        val.forEach((v) => (md += `  - ${v}\n`));
      } else if (val !== undefined && val !== null) {
        md += `${k}: "${val}"\n`;
      }
    }
    md += '---\n\n';
  }

  // Group chapters by actOrSeason in order of appearance
  const actMap = new Map<string, ParsedChapter[]>();

  // Preserve empty acts
  for (const act of emptyActs) {
    if (act && act.trim()) {
      actMap.set(act.trim(), []);
    }
  }

  for (const chap of chapters) {
    const actKey = chap.actOrSeason && chap.actOrSeason.trim() ? chap.actOrSeason.trim() : '__GENERAL__';
    if (!actMap.has(actKey)) {
      actMap.set(actKey, []);
    }
    actMap.get(actKey)!.push(chap);
  }

  // Serialize bucket by bucket
  for (const [actKey, actChapters] of actMap.entries()) {
    if (actKey !== '__GENERAL__') {
      md += `## ${actKey}\n\n`;
    }

    for (const chap of actChapters) {
      md += `# ${chap.title}\n\n`;

      for (const b of chap.blocks) {
        if (b.type === 'scene_divider') {
          md += '***\n\n';
        } else if (b.type === 'heading') {
          const hashes = '#'.repeat(b.level || 2);
          md += `${hashes} ${b.content}\n\n`;
        } else if (b.type === 'callout') {
          md += `> [!${b.calloutType || 'note'}] ${b.calloutTitle || ''}\n`;
          const lines = b.content.split('\n');
          lines.forEach((l) => (md += `> ${l}\n`));
          md += '\n';
        } else if (b.type === 'speech') {
          let attrs = `speaker="${b.speaker || 'Personaje'}"`;
          if (b.avatar && b.avatar.trim()) attrs += ` avatar="${b.avatar.trim()}"`;
          if (b.side && b.side !== 'left') attrs += ` side="${b.side}"`;
          if (b.color && b.color.trim()) attrs += ` color="${b.color.trim()}"`;
          md += `<speech ${attrs}>\n${b.content}\n</speech>\n\n`;
        } else if (b.type === 'cyoa_choice') {
          md += `- [ ] [${b.content}](#${b.id || ''})\n\n`;
        } else if (b.type === 'embed_image') {
          md += `![${b.alt || ''}](${b.src || ''})\n\n`;
        } else if (b.type === 'paragraph') {
          md += `${b.content}\n\n`;
        }
      }
    }
  }

  return md.trim();
}



