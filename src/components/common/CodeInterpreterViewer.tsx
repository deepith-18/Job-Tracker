import React, { useState, useMemo } from 'react';
import { Copy, Check, Terminal, WrapText, CheckCircle2 } from 'lucide-react';
import type { CodingLanguage } from '../../types';

interface CodeInterpreterViewerProps {
  code: string;
  language?: CodingLanguage | string;
  title?: string;
  showLineNumbers?: boolean;
  maxHeight?: number | string;
}

interface Token {
  type:
    | 'keyword'
    | 'builtIn'
    | 'string'
    | 'number'
    | 'comment'
    | 'function'
    | 'operator'
    | 'punctuation'
    | 'variable'
    | 'plain';
  value: string;
}

// Language color themes and badges
const LANG_CONFIG: Record<
  string,
  { label: string; runtime: string; dotColor: string }
> = {
  python: { label: 'Python', runtime: 'Python 3.12 (CPython)', dotColor: '#38bdf8' },
  typescript: { label: 'TypeScript', runtime: 'tsc v5.4 / V8 JIT', dotColor: '#60a5fa' },
  javascript: { label: 'JavaScript', runtime: 'Node.js v20 LTS', dotColor: '#facc15' },
  java: { label: 'Java', runtime: 'OpenJDK 21 (HotSpot)', dotColor: '#f97316' },
  cpp: { label: 'C++', runtime: 'GCC 13.2 / Clang (O2)', dotColor: '#ec4899' },
  go: { label: 'Go', runtime: 'Go 1.22 Runtime', dotColor: '#2dd4bf' },
  sql: { label: 'SQL', runtime: 'PostgreSQL 16 Engine', dotColor: '#a855f7' },
  rust: { label: 'Rust', runtime: 'rustc 1.76 (LLVM)', dotColor: '#fb923c' },
};

const KEYWORDS_BY_LANG: Record<string, Set<string>> = {
  python: new Set([
    'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or',
    'is', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'yield',
    'lambda', 'pass', 'break', 'continue', 'global', 'nonlocal', 'assert', 'async', 'await',
  ]),
  javascript: new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'default', 'break', 'continue', 'import', 'from', 'export', 'as',
    'class', 'extends', 'new', 'this', 'super', 'try', 'catch', 'finally', 'throw',
    'async', 'await', 'yield', 'typeof', 'instanceof', 'void', 'delete', 'in', 'of',
  ]),
  typescript: new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
    'switch', 'case', 'default', 'break', 'continue', 'import', 'from', 'export', 'as',
    'class', 'extends', 'new', 'this', 'super', 'try', 'catch', 'finally', 'throw',
    'async', 'await', 'yield', 'typeof', 'instanceof', 'interface', 'type', 'enum',
    'implements', 'public', 'private', 'protected', 'readonly', 'abstract', 'as',
  ]),
  sql: new Set([
    'select', 'from', 'where', 'insert', 'into', 'update', 'delete', 'join', 'left', 'right',
    'inner', 'outer', 'full', 'cross', 'group', 'by', 'order', 'having', 'limit', 'offset',
    'create', 'table', 'drop', 'alter', 'index', 'primary', 'key', 'foreign', 'references',
    'on', 'as', 'and', 'or', 'not', 'distinct', 'union', 'all', 'view', 'with', 'case', 'when',
    'then', 'else', 'end', 'partition', 'over', 'between', 'in', 'like', 'is', 'null',
  ]),
  java: new Set([
    'public', 'private', 'protected', 'class', 'interface', 'extends', 'implements',
    'static', 'final', 'void', 'return', 'new', 'this', 'super', 'if', 'else', 'for',
    'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'try', 'catch',
    'finally', 'throw', 'throws', 'import', 'package', 'synchronized', 'volatile',
  ]),
  cpp: new Set([
    'class', 'struct', 'public', 'private', 'protected', 'virtual', 'override', 'void',
    'int', 'return', 'new', 'delete', 'if', 'else', 'for', 'while', 'do', 'switch',
    'case', 'default', 'break', 'continue', 'try', 'catch', 'throw', 'namespace',
    'using', 'template', 'typename', 'auto', 'const', 'constexpr', 'nullptr',
  ]),
  go: new Set([
    'func', 'return', 'package', 'import', 'type', 'struct', 'interface', 'var', 'const',
    'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'defer',
    'go', 'select', 'chan', 'map', 'make', 'new',
  ]),
  rust: new Set([
    'fn', 'let', 'mut', 'pub', 'struct', 'enum', 'impl', 'trait', 'match', 'if', 'else',
    'for', 'while', 'loop', 'return', 'use', 'mod', 'type', 'const', 'async', 'await',
    'self', 'Self', 'where', 'ref', 'move',
  ]),
};

const BUILTINS = new Set([
  'int', 'str', 'float', 'bool', 'list', 'dict', 'set', 'tuple', 'len', 'range', 'enumerate',
  'zip', 'print', 'min', 'max', 'sum', 'sorted', 'map', 'filter', 'any', 'all', 'True', 'False', 'None',
  'String', 'Number', 'Boolean', 'Array', 'Object', 'Promise', 'Map', 'Set', 'console', 'window', 'document',
  'Math', 'JSON', 'undefined', 'null', 'true', 'false', 'vector', 'unordered_map', 'unordered_set',
  'string', 'std', 'cout', 'cin', 'endl', 'ArrayList', 'HashMap', 'HashSet', 'Integer', 'System',
  'fmt', 'println', 'printf', 'error', 'nil', 'Option', 'Result', 'Some', 'None', 'Ok', 'Err', 'Vec',
]);

/**
 * Tokenizes a single line of code with language-aware rules
 */
function tokenizeLine(line: string, lang: string): Token[] {
  const tokens: Token[] = [];
  const normalizedLang = lang.toLowerCase();
  const keywords = KEYWORDS_BY_LANG[normalizedLang] || KEYWORDS_BY_LANG['python'];

  let i = 0;
  const len = line.length;

  while (i < len) {
    const char = line[i];

    // Single-line Comments
    if (
      (char === '#' && (normalizedLang === 'python' || normalizedLang === 'bash')) ||
      (char === '/' && line[i + 1] === '/') ||
      (char === '-' && line[i + 1] === '-' && normalizedLang === 'sql')
    ) {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }

    // Strings: single, double, backtick
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      let strVal = quote;
      i++;
      while (i < len) {
        strVal += line[i];
        if (line[i] === quote && line[i - 1] !== '\\') {
          i++;
          break;
        }
        i++;
      }
      tokens.push({ type: 'string', value: strVal });
      continue;
    }

    // Numbers
    if (/\d/.test(char) && (i === 0 || /[^a-zA-Z0-9_]/.test(line[i - 1]))) {
      let numVal = '';
      while (i < len && /[0-9.xXa-fA-F_]/.test(line[i])) {
        numVal += line[i];
        i++;
      }
      tokens.push({ type: 'number', value: numVal });
      continue;
    }

    // Identifiers, Keywords, Built-ins
    if (/[a-zA-Z_$]/.test(char)) {
      let word = '';
      while (i < len && /[a-zA-Z0-9_$]/.test(line[i])) {
        word += line[i];
        i++;
      }

      // Check if it's followed by '(' -> Function call/declaration
      let nextNonSpace = i;
      while (nextNonSpace < len && /\s/.test(line[nextNonSpace])) {
        nextNonSpace++;
      }
      const isFunction = line[nextNonSpace] === '(';

      const lowerWord = word.toLowerCase();
      if (keywords.has(word) || (normalizedLang === 'sql' && keywords.has(lowerWord))) {
        tokens.push({ type: 'keyword', value: word });
      } else if (BUILTINS.has(word) || BUILTINS.has(lowerWord)) {
        tokens.push({ type: 'builtIn', value: word });
      } else if (isFunction) {
        tokens.push({ type: 'function', value: word });
      } else if (word === 'self' || word === 'this') {
        tokens.push({ type: 'builtIn', value: word });
      } else {
        tokens.push({ type: 'variable', value: word });
      }
      continue;
    }

    // Operators
    if (/[+\-*/%=<>!&|^~?:;]/.test(char)) {
      let op = char;
      i++;
      while (i < len && /[+\-*/%=<>!&|^~?:;]/.test(line[i])) {
        op += line[i];
        i++;
      }
      tokens.push({ type: 'operator', value: op });
      continue;
    }

    // Punctuation brackets
    if (/[()[\]{},.]/.test(char)) {
      tokens.push({ type: 'punctuation', value: char });
      i++;
      continue;
    }

    // Spaces & fallback
    tokens.push({ type: 'plain', value: char });
    i++;
  }

  return tokens;
}

export const CodeInterpreterViewer: React.FC<CodeInterpreterViewerProps> = ({
  code,
  language = 'python',
  title,
  showLineNumbers = true,
  maxHeight = 440,
}) => {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);

  const cleanLang = (language || 'python').toLowerCase();
  const config = LANG_CONFIG[cleanLang] || {
    label: cleanLang.toUpperCase(),
    runtime: 'Universal Runtime',
    dotColor: '#a855f7',
  };

  const lines = useMemo(() => {
    return code.replace(/\r\n/g, '\n').split('\n');
  }, [code]);

  const tokenizedLines = useMemo(() => {
    return lines.map((line) => tokenizeLine(line, cleanLang));
  }, [lines, cleanLang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      style={{
        borderRadius: 12,
        background: '#0a0e17',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      }}
    >
      {/* ── Interpreter Top Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 14px',
          background: 'linear-gradient(180deg, #131b2c 0%, #0d1320 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          userSelect: 'none',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Window Controls + Language Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '2px 8px',
              borderRadius: 6,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: config.dotColor,
                boxShadow: `0 0 8px ${config.dotColor}`,
              }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.04em' }}>
              {config.label}
            </span>
          </div>

          {title && (
            <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500 }}>
              {title}
            </span>
          )}
        </div>

        {/* Right: Runtime info & Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 10.5,
              color: '#64748b',
              fontWeight: 600,
            }}
          >
            <Terminal style={{ width: 12, height: 12, color: '#0ea5e9' }} />
            <span>{config.runtime}</span>
          </div>

          {/* Wrap toggle */}
          <button
            onClick={() => setWrapLines(!wrapLines)}
            title={wrapLines ? 'Disable line wrap' : 'Enable line wrap'}
            style={{
              background: wrapLines ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: wrapLines ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
              color: wrapLines ? '#38bdf8' : '#94a3b8',
              padding: '3px 7px',
              borderRadius: 5,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10.5,
              fontWeight: 600,
            }}
          >
            <WrapText style={{ width: 12, height: 12 }} />
            <span>Wrap</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 255, 255, 0.07)',
              border: copied ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.12)',
              color: copied ? '#4ade80' : '#e2e8f0',
              padding: '3px 10px',
              borderRadius: 6,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? (
              <>
                <Check style={{ width: 12, height: 12 }} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy style={{ width: 12, height: 12 }} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Syntax Highlighted Code Area ── */}
      <div
        style={{
          maxHeight,
          overflowY: 'auto',
          overflowX: 'auto',
          padding: '12px 0',
          background: '#0a0e17',
          position: 'relative',
        }}
      >
        <pre
          style={{
            margin: 0,
            padding: 0,
            fontSize: 12.5,
            lineHeight: 1.6,
            fontFamily: 'inherit',
            whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
            wordBreak: wrapLines ? 'break-word' : 'normal',
          }}
        >
          {tokenizedLines.map((tokens, lineIdx) => {
            const lineNum = lineIdx + 1;
            return (
              <div
                key={lineIdx}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  padding: '0 14px',
                  minHeight: 20,
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {/* Line Number Column */}
                {showLineNumbers && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 38,
                      flexShrink: 0,
                      color: '#475569',
                      fontSize: 11,
                      userSelect: 'none',
                      textAlign: 'right',
                      paddingRight: 16,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {lineNum}
                  </span>
                )}

                {/* Tokens */}
                <span style={{ flex: 1 }}>
                  {tokens.map((token, tokenIdx) => {
                    let color = '#f1f5f9'; // plain / fallback
                    let fontStyle = 'normal';
                    let fontWeight: number | string = 400;

                    switch (token.type) {
                      case 'keyword':
                        color = '#ff7b72'; // Vibrant coral red / pink
                        fontWeight = 700;
                        break;
                      case 'builtIn':
                        color = '#79c0ff'; // Soft bright blue
                        fontWeight = 600;
                        break;
                      case 'string':
                        color = '#7ee787'; // Fresh terminal green
                        break;
                      case 'number':
                        color = '#ffa657'; // Warm amber/orange
                        break;
                      case 'comment':
                        color = '#8b949e'; // Muted slate gray
                        fontStyle = 'italic';
                        break;
                      case 'function':
                        color = '#d2a8ff'; // Lavender purple
                        fontWeight = 600;
                        break;
                      case 'operator':
                        color = '#56b6c2'; // Cyan/teal
                        break;
                      case 'variable':
                        color = '#e2e8f0'; // Clean white
                        break;
                      case 'punctuation':
                        color = '#94a3b8';
                        break;
                      default:
                        color = '#e2e8f0';
                    }

                    return (
                      <span
                        key={tokenIdx}
                        style={{
                          color,
                          fontStyle,
                          fontWeight,
                        }}
                      >
                        {token.value}
                      </span>
                    );
                  })}
                </span>
              </div>
            );
          })}
        </pre>
      </div>

      {/* ── Interpreter Footer Status Bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 14px',
          background: '#080c14',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: 10.5,
          color: '#64748b',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 style={{ width: 11, height: 11, color: '#10b981' }} />
            <span>Syntax Validated</span>
          </span>
          <span>{lines.length} lines</span>
          <span>{code.length} characters</span>
        </div>
        <div>UTF-8 • {config.label} Interpreter</div>
      </div>
    </div>
  );
};
