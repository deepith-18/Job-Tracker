import React from 'react';

interface MarkdownTextRendererProps {
  content: string;
  fontSize?: number;
  lineHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders inline markdown tokens (bold, italic, code spans)
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  // Match `code`, **bold**, *italic*
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIdx) {
      tokens.push(text.slice(lastIdx, match.index));
    }

    const tokenStr = match[0];
    if (tokenStr.startsWith('`') && tokenStr.endsWith('`')) {
      tokens.push(
        <code
          key={match.index}
          style={{
            background: 'var(--card-hover)',
            color: 'var(--accent)',
            padding: '2px 6px',
            borderRadius: 5,
            fontSize: '0.9em',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            border: '1px solid var(--border)',
            fontWeight: 600,
          }}
        >
          {tokenStr.slice(1, -1)}
        </code>
      );
    } else if (tokenStr.startsWith('**') && tokenStr.endsWith('**')) {
      tokens.push(
        <strong key={match.index} style={{ color: 'var(--t1)', fontWeight: 700 }}>
          {tokenStr.slice(2, -2)}
        </strong>
      );
    } else if (tokenStr.startsWith('*') && tokenStr.endsWith('*')) {
      tokens.push(
        <em key={match.index} style={{ color: 'var(--t2)' }}>
          {tokenStr.slice(1, -1)}
        </em>
      );
    }

    lastIdx = pattern.lastIndex;
  }

  if (lastIdx < text.length) {
    tokens.push(text.slice(lastIdx));
  }

  return tokens;
}

export const MarkdownTextRenderer: React.FC<MarkdownTextRendererProps> = ({
  content,
  fontSize = 14,
  lineHeight = 1.68,
  className = '',
  style = {},
}) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];
  let currentListItems: { type: 'ul' | 'ol'; text: string }[] = [];

  const flushList = (keyPrefix: number) => {
    if (currentListItems.length === 0) return;
    const isOrdered = currentListItems[0].type === 'ol';
    const ListTag = isOrdered ? 'ol' : 'ul';

    elements.push(
      <ListTag
        key={`list-${keyPrefix}`}
        style={{
          margin: '8px 0 12px',
          paddingLeft: 22,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          color: 'var(--t2)',
        }}
      >
        {currentListItems.map((item, idx) => (
          <li key={idx} style={{ lineHeight }}>
            {renderInlineMarkdown(item.text)}
          </li>
        ))}
      </ListTag>
    );
    currentListItems = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Code block toggle
    if (trimmed.startsWith('```')) {
      flushList(idx);
      if (inCodeBlock) {
        elements.push(
          <div
            key={`code-${idx}`}
            style={{
              margin: '10px 0 14px',
              borderRadius: 8,
              background: 'var(--page)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            {codeBlockLang && (
              <div
                style={{
                  padding: '4px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--t3)',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--card-hover)',
                }}
              >
                {codeBlockLang}
              </div>
            )}
            <pre
              style={{
                padding: '12px 14px',
                margin: 0,
                fontSize: Math.max(12, fontSize - 2),
                lineHeight: 1.5,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                overflowX: 'auto',
                color: 'var(--t1)',
              }}
            >
              <code>{codeBlockLines.join('\n')}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLang = '';
        codeBlockLines = [];
      } else {
        inCodeBlock = true;
        codeBlockLang = trimmed.replace('```', '').trim();
        codeBlockLines = [];
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Heading level 3 / 4
    if (trimmed.startsWith('### ')) {
      flushList(idx);
      elements.push(
        <h4
          key={`h4-${idx}`}
          style={{
            fontSize: fontSize + 2,
            fontWeight: 700,
            color: 'var(--t1)',
            margin: '14px 0 6px',
          }}
        >
          {renderInlineMarkdown(trimmed.slice(4))}
        </h4>
      );
      return;
    }

    // Numbered list item: e.g. "1. " or "2. "
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      currentListItems.push({ type: 'ol', text: olMatch[2] });
      return;
    }

    // Bullet list item: e.g. "- " or "* "
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      currentListItems.push({ type: 'ul', text: trimmed.slice(2) });
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList(idx);
      elements.push(
        <blockquote
          key={`quote-${idx}`}
          style={{
            margin: '10px 0',
            padding: '8px 14px',
            borderLeft: '3px solid var(--accent)',
            background: 'var(--card-hover)',
            borderRadius: '0 8px 8px 0',
            color: 'var(--t2)',
            fontStyle: 'italic',
            fontSize: fontSize,
          }}
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Empty line / paragraph break
    if (!trimmed) {
      flushList(idx);
      return;
    }

    // Regular paragraph line
    flushList(idx);
    elements.push(
      <p
        key={`p-${idx}`}
        style={{
          margin: '0 0 10px',
          lineHeight,
          color: 'var(--t1)',
          fontSize,
        }}
      >
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  flushList(lines.length);

  return (
    <div
      className={className}
      style={{
        fontSize,
        lineHeight,
        color: 'var(--t1)',
        wordBreak: 'break-word',
        ...style,
      }}
    >
      {elements}
    </div>
  );
};
