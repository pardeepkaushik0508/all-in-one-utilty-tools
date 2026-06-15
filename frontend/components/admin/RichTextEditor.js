import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { Extension } from '@tiptap/core';
import { useEffect, useCallback, useState } from 'react';

// ── Font Size Extension (uses TextStyle's inline style) ────────────────────
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

// ── Font Family Extension ──────────────────────────────────────────────────
const FontFamily = Extension.create({
  name: 'fontFamily',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily?.replace(/['"]/g, '') || null,
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) return {};
              return { style: `font-family: ${attributes.fontFamily}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontFamily:
        (fontFamily) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontFamily }).run(),
      unsetFontFamily:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run(),
    };
  },
});

// ── Constants ───────────────────────────────────────────────────────────────
const FONT_SIZES = ['10', '11', '12', '13', '14', '16', '18', '20', '22', '24', '28', '32', '36', '48', '64'];
const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Impact', value: 'Impact, sans-serif' },
];

// ── Toolbar helpers ─────────────────────────────────────────────────────────
function ToolBtn({ active, title, onClick, children, disabled }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`rte-btn ${active ? 'rte-btn-active' : ''}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="rte-divider" />;
}

function ToolbarLabel({ children }) {
  return <span className="rte-toolbar-label">{children}</span>;
}

// ── Main Editor ─────────────────────────────────────────────────────────────
export default function RichTextEditor({ value = '', onChange, placeholder = 'Start writing...' }) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [activeFontSize, setActiveFontSize] = useState('');
  const [activeFontFamily, setActiveFontFamily] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        bulletList: {},
        orderedList: {},
        blockquote: {},
        code: {},
        codeBlock: {},
        horizontalRule: {},
      }),
      Underline,
      TextStyle,
      FontSize,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    ],
    content: value || '',
    onUpdate({ editor: e }) {
      onChange(e.getHTML());
      // Update font size / family indicators
      const attrs = e.getAttributes('textStyle');
      setActiveFontSize(attrs?.fontSize ? attrs.fontSize.replace('px', '') : '');
      setActiveFontFamily(attrs?.fontFamily || '');
    },
    onSelectionUpdate({ editor: e }) {
      const attrs = e.getAttributes('textStyle');
      setActiveFontSize(attrs?.fontSize ? attrs.fontSize.replace('px', '') : '');
      setActiveFontFamily(attrs?.fontFamily || '');
    },
  });

  // Sync when value changes externally (e.g. switching posts)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const handleFontSize = useCallback(
    (size) => {
      if (!editor) return;
      if (!size) {
        editor.chain().focus().unsetFontSize().run();
      } else {
        editor.chain().focus().setFontSize(`${size}px`).run();
      }
      setActiveFontSize(size);
    },
    [editor]
  );

  const handleFontFamily = useCallback(
    (family) => {
      if (!editor) return;
      if (!family) {
        editor.chain().focus().unsetFontFamily().run();
      } else {
        editor.chain().focus().setFontFamily(family).run();
      }
      setActiveFontFamily(family);
    },
    [editor]
  );

  if (!editor) return null;

  const headingLevel = [1, 2, 3, 4, 5, 6].find((l) => editor.isActive('heading', { level: l }));

  return (
    <div className="rte-wrapper">
      {/* ── Row 1: Paragraph style + Font family + Font size ── */}
      <div className="rte-toolbar rte-toolbar-row">
        <ToolbarLabel>Style</ToolbarLabel>
        <select
          className="rte-select rte-select-wide"
          value={headingLevel ? `h${headingLevel}` : 'p'}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().setHeading({ level: Number(v[1]) }).run();
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>

        <Divider />

        <ToolbarLabel>Font</ToolbarLabel>
        <select
          className="rte-select rte-select-font"
          value={activeFontFamily}
          onChange={(e) => handleFontFamily(e.target.value)}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value || 'inherit' }}>
              {f.label}
            </option>
          ))}
        </select>

        <Divider />

        <ToolbarLabel>Size</ToolbarLabel>
        <select
          className="rte-select rte-select-size"
          value={activeFontSize}
          onChange={(e) => handleFontSize(e.target.value)}
        >
          <option value="">—</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>

        {/* Manual font size input */}
        <input
          type="number"
          className="rte-size-input"
          placeholder="px"
          min="8"
          max="200"
          value={activeFontSize}
          onChange={(e) => handleFontSize(e.target.value)}
          title="Custom font size"
        />
      </div>

      {/* ── Row 2: Formatting ── */}
      <div className="rte-toolbar rte-toolbar-row">
        {/* Bold / Italic / Underline / Strike */}
        <ToolBtn active={editor.isActive('bold')} title="Bold (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} title="Italic (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} title="Underline (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolBtn>
        <ToolBtn active={editor.isActive('strike')} title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </ToolBtn>

        <Divider />

        {/* Text color */}
        <label className="rte-color-label" title="Text color">
          <span className="rte-color-icon">A</span>
          <input
            type="color"
            className="rte-color-input"
            defaultValue="#000000"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>

        {/* Highlight color */}
        <label className="rte-color-label" title="Highlight color">
          <span className="rte-color-icon" style={{ backgroundColor: '#fef08a', padding: '0 2px', borderRadius: 2 }}>H</span>
          <input
            type="color"
            className="rte-color-input"
            defaultValue="#fef08a"
            onChange={(e) =>
              editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
            }
          />
        </label>

        <Divider />

        {/* Alignment */}
        <ToolBtn active={editor.isActive({ textAlign: 'left' })} title="Align left" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="5" width="9" height="2" rx="1" fill="currentColor"/><rect x="0" y="9" width="14" height="2" rx="1" fill="currentColor"/></svg>
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'center' })} title="Align center" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/><rect x="2.5" y="5" width="9" height="2" rx="1" fill="currentColor"/><rect x="0" y="9" width="14" height="2" rx="1" fill="currentColor"/></svg>
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'right' })} title="Align right" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/><rect x="5" y="5" width="9" height="2" rx="1" fill="currentColor"/><rect x="0" y="9" width="14" height="2" rx="1" fill="currentColor"/></svg>
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'justify' })} title="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="5" width="14" height="2" rx="1" fill="currentColor"/><rect x="0" y="9" width="14" height="2" rx="1" fill="currentColor"/></svg>
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn active={editor.isActive('bulletList')} title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="1.5" cy="2" r="1.5" fill="currentColor"/><rect x="4" y="1" width="10" height="2" rx="1" fill="currentColor"/><circle cx="1.5" cy="7" r="1.5" fill="currentColor"/><rect x="4" y="6" width="10" height="2" rx="1" fill="currentColor"/><circle cx="1.5" cy="12" r="1.5" fill="currentColor"/><rect x="4" y="11" width="10" height="2" rx="1" fill="currentColor"/></svg>
        </ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><text x="0" y="4" fontSize="5" fill="currentColor">1.</text><rect x="5" y="1" width="9" height="2" rx="1" fill="currentColor"/><text x="0" y="9" fontSize="5" fill="currentColor">2.</text><rect x="5" y="6" width="9" height="2" rx="1" fill="currentColor"/><text x="0" y="14" fontSize="5" fill="currentColor">3.</text><rect x="5" y="11" width="9" height="2" rx="1" fill="currentColor"/></svg>
        </ToolBtn>

        {/* Indent / Outdent */}
        <ToolBtn active={false} title="Increase indent" onClick={() => editor.chain().focus().sinkListItem('listItem').run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/><rect x="4" y="5" width="10" height="2" rx="1" fill="currentColor"/><rect x="0" y="9" width="14" height="2" rx="1" fill="currentColor"/><path d="M1 6.5L3.5 8.5L1 10.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
        </ToolBtn>
        <ToolBtn active={false} title="Decrease indent" onClick={() => editor.chain().focus().liftListItem('listItem').run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="0" y="1" width="14" height="2" rx="1" fill="currentColor"/><rect x="4" y="5" width="10" height="2" rx="1" fill="currentColor"/><rect x="0" y="9" width="14" height="2" rx="1" fill="currentColor"/><path d="M3.5 6.5L1 8.5L3.5 10.5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
        </ToolBtn>

        <Divider />

        {/* Blockquote / Code / HR */}
        <ToolBtn active={editor.isActive('blockquote')} title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </ToolBtn>
        <ToolBtn active={editor.isActive('code')} title="Inline code" onClick={() => editor.chain().focus().toggleCode().run()}>
          {'</>'}
        </ToolBtn>
        <ToolBtn active={editor.isActive('codeBlock')} title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          {'{ }'}
        </ToolBtn>
        <ToolBtn active={false} title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          —
        </ToolBtn>

        <Divider />

        {/* Link */}
        <ToolBtn active={editor.isActive('link')} title="Insert / remove link" onClick={() => setShowLinkInput((v) => !v)}>
          🔗
        </ToolBtn>

        <Divider />

        {/* Clear formatting */}
        <ToolBtn active={false} title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2L12 12M2 12L12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </ToolBtn>

        <Divider />

        {/* Undo / Redo */}
        <ToolBtn active={false} title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}>↩</ToolBtn>
        <ToolBtn active={false} title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()}>↪</ToolBtn>
      </div>

      {/* ── Link input row ── */}
      {showLinkInput && (
        <div className="rte-link-row">
          <input
            className="input-field flex-1"
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setLink(); } }}
            autoFocus
          />
          <button type="button" className="btn-primary !py-1.5 !px-3 !text-xs" onClick={setLink}>
            {linkUrl ? 'Set link' : 'Remove link'}
          </button>
          <button type="button" className="btn-secondary !py-1.5 !px-3 !text-xs" onClick={() => setShowLinkInput(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* ── Editor content area ── */}
      <EditorContent editor={editor} className="rte-content" data-placeholder={placeholder} />
    </div>
  );
}
