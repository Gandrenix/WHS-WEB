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

export interface ParsedStory {
  frontmatter: ParsedFrontmatter;
  blocks: MarkdownBlock[];
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
    const htmlSpeechMatch = textWithoutId.match(
      /<speech\s+(?:speaker="([^"]+)")?\s*(?:avatar="([^"]+)")?\s*(?:side="([^"]+)")?\s*(?:color="([^"]+)")?>([\s\S]*?)<\/speech>/i
    );
    if (htmlSpeechMatch) {
      blocks.push({
        type: 'speech',
        speaker: htmlSpeechMatch[1] || 'Personaje',
        avatar: htmlSpeechMatch[2],
        side: (htmlSpeechMatch[3] as 'left' | 'right') || 'left',
        color: htmlSpeechMatch[4],
        content: htmlSpeechMatch[5].trim(),
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
  result = result.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '<a class="story-link" href="#$1">$2</a>');
  result = result.replace(/\[\[([^\]]+)\]\]/g, '<a class="story-link" href="#$1">$1</a>');

  // Highlights ==text== -> <mark class="story-highlight">text</mark>
  result = result.replace(/==(.*?)==/g, '<mark class="story-highlight">$1</mark>');

  // Underline <u>text</u> or ++text++
  result = result.replace(/\+\+(.*?)\+\+/g, '<u class="story-underline">$1</u>');

  // Font attribute {font: name}
  result = result.replace(/\{font:\s*([a-zA-Z0-9_-]+)\}/g, '');

  // Whispers ~susurro~
  result = result.replace(/~(.*?)~/g, '<span class="story-whisper">$1</span>');

  // Colors [Text]{color: token_or_hex}
  result = result.replace(/\[([^\]]+)\]\{color:\s*([^}]+)\}/g, (_, txt, clr) => {
    return `<span class="story-color-${clr.trim()}" style="color: ${getNarrativeColorHex(clr)}">${txt}</span>`;
  });

  // Effects [Text]{glow: color}
  result = result.replace(/\[([^\]]+)\]\{glow:\s*([^}]+)\}/g, (_, txt, clr) => {
    return `<span class="story-effect-glow" style="text-shadow: 0 0 12px ${clr}">${txt}</span>`;
  });

  // Effects [Text]{effect: shake}
  result = result.replace(/\[([^\]]+)\]\{effect:\s*shake\}/g, '<span class="story-effect-shake inline-block animate-bounce">$1</span>');

  // Effects [Text]{effect: fade}
  result = result.replace(/\[([^\]]+)\]\{effect:\s*fade\}/g, '<span class="story-effect-fade opacity-60 hover:opacity-100 transition-opacity">$1</span>');

  // Bold & Italic
  result = result.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="story-bold">$1</strong>');
  result = result.replace(/\*(.*?)\*/g, '<em class="story-italic">$1</em>');

  // Strikethrough ~~text~~
  result = result.replace(/~~(.*?)~~/g, '<del class="story-strike">$1</del>');

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
