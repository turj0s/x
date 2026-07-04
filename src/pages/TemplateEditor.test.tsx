/**
 * Behavior tests for the multi-line editable region used by the PDF template
 * editor. These run in jsdom, which has NO layout engine, NO
 * `caretRangeFromPoint`, and only a stub `document.execCommand`. That means:
 *
 *   - Pixel / visual-regression checks (wrapping vs. original PDF, caret
 *     position under a mouse coordinate, RTL bidi ordering) MUST be done in
 *     a real browser via Playwright — jsdom cannot answer them.
 *
 *   - What jsdom CAN verify, and what this file covers:
 *       * Uncontrolled semantics: prop changes never stomp the DOM while the
 *         element is focused.
 *       * `onFirstChange` fires exactly once, and only after real text
 *         mutation.
 *       * IME composition suppresses change bookkeeping until
 *         `compositionend`, so aborted compositions never mark the box dirty.
 *       * Paste normalizes CRLF/CR to LF, preserves tabs and boundary
 *         newlines, and stays within the box on very large inputs.
 *       * `onCommit` fires on blur with the final `textContent`, which is
 *         what parent state and undo/redo bookkeeping consume.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { EditableText } from './TemplateEditor';

const getBox = () => screen.getByRole('textbox', { hidden: true }) ??
  document.querySelector('[data-text-box-input]') as HTMLDivElement;

// jsdom's execCommand is a no-op stub. Give it a minimal implementation that
// inserts the text at the current selection so we can exercise our paste and
// Enter paths deterministically.
const installExecCommandShim = () => {
  (document as unknown as { execCommand: (cmd: string, ui: boolean, val?: string) => boolean })
    .execCommand = (cmd, _ui, val = '') => {
    if (cmd !== 'insertText') return false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(val);
    range.insertNode(node);
    const after = document.createRange();
    after.setStartAfter(node);
    after.collapse(true);
    sel.removeAllRanges();
    sel.addRange(after);
    // Match browser behavior: execCommand fires an input event.
    range.startContainer.parentElement?.dispatchEvent(
      new Event('input', { bubbles: true }),
    );
    return true;
  };
};

const placeCaretAtEnd = (el: HTMLElement) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection()!;
  sel.removeAllRanges();
  sel.addRange(range);
};

const Harness = (props: {
  initialText?: string;
  onFirstChange?: () => void;
  onCommit?: (t: string) => void;
}) => {
  const [editing, setEditing] = useState(true);
  const [text, setText] = useState(props.initialText ?? 'hello\nworld');
  return (
    <>
      <button type="button" onClick={() => setEditing(false)}>blur-toggle</button>
      <button type="button" onClick={() => setText('EXTERNAL')}>ext-update</button>
      <EditableText
        initialText={text}
        editing={editing}
        style={{}}
        onFirstChange={props.onFirstChange}
        onCommit={(t) => {
          props.onCommit?.(t);
          setText(t);
        }}
      />
    </>
  );
};

describe('EditableText — multi-line region behavior', () => {
  it('renders initial multi-line text verbatim', () => {
    render(<Harness initialText={'a\nb\nc'} />);
    const el = document.querySelector('[data-text-box-input]') as HTMLDivElement;
    expect(el.textContent).toBe('a\nb\nc');
  });

  it('does NOT rewrite the DOM from prop changes while focused (caret preservation contract)', () => {
    render(<Harness initialText={'one\ntwo'} />);
    const el = document.querySelector('[data-text-box-input]') as HTMLDivElement;
    el.focus();
    // Simulate user having typed something into the DOM.
    el.textContent = 'user-typed\nmore';
    placeCaretAtEnd(el);
    // External prop update fires while focus is still inside.
    fireEvent.click(screen.getByText('ext-update'));
    expect(document.activeElement).toBe(el);
    // DOM must be untouched — this is what keeps the caret from jumping.
    expect(el.textContent).toBe('user-typed\nmore');
  });

  it('fires onFirstChange exactly once after real text mutation', () => {
    const onFirstChange = vi.fn();
    render(<Harness onFirstChange={onFirstChange} />);
    const el = document.querySelector('[data-text-box-input]') as HTMLDivElement;
    el.focus();
    el.textContent = 'hello\nworld!';
    fireEvent.input(el);
    el.textContent = 'hello\nworld!!';
    fireEvent.input(el);
    expect(onFirstChange).toHaveBeenCalledTimes(1);
  });

  it('commits final textContent on blur, including newlines and tabs', () => {
    const onCommit = vi.fn();
    render(<Harness onCommit={onCommit} />);
    const el = document.querySelector('[data-text-box-input]') as HTMLDivElement;
    el.focus();
    el.textContent = 'line1\n\tindented\nline3';
    fireEvent.input(el);
    fireEvent.blur(el);
    expect(onCommit).toHaveBeenCalledWith('line1\n\tindented\nline3');
  });

  describe('IME composition', () => {
    it('suppresses onFirstChange for input events fired mid-composition', () => {
      const onFirstChange = vi.fn();
      render(<Harness onFirstChange={onFirstChange} />);
      const el = document.querySelector('[data-text-box-input]') as HTMLDivElement;
      el.focus();
      fireEvent.compositionStart(el);
      el.textContent = 'hello\nworldあ'; // composing candidate
      fireEvent.input(el);
      expect(onFirstChange).not.toHaveBeenCalled();
      // Aborted composition: revert candidate, end without commit.
      el.textContent = 'hello\nworld';
      fireEvent.compositionEnd(el);
      expect(onFirstChange).not.toHaveBeenCalled();
    });

    it('fires onFirstChange on compositionend when a commit changed the text', () => {
      const onFirstChange = vi.fn();
      render(<Harness onFirstChange={onFirstChange} />);
      const el = document.querySelector('[data-text-box-input]') as HTMLDivElement;
      el.focus();
      fireEvent.compositionStart(el);
      el.textContent = 'hello\nworld日本語';
      fireEvent.compositionEnd(el);
      expect(onFirstChange).toHaveBeenCalledTimes(1);
    });

    it('does not intercept Enter while composing (would swallow IME commit key)', () => {
      installExecCommandShim();
      render(<Harness />);
      const el = document.querySelector('[data-text-box-input]') as HTMLDivElement;
      el.focus();
      placeCaretAtEnd(el);
      fireEvent.compositionStart(el);
      const before = el.textContent;
      fireEvent.keyDown(el, { key: 'Enter', keyCode: 229, isComposing: true });
      // Enter must NOT have inserted a \n — the IME owns that key.
      expect(el.textContent).toBe(before);
      fireEvent.compositionEnd(el);
    });
  });

  describe('paste', () => {
    it('normalizes CRLF and CR to LF and preserves tabs + boundary newlines', () => {
      installExecCommandShim();
      render(<Harness initialText="" />);
      const el = document.querySelector('[data-text-box-input]') as HTMLDivElement;
      el.focus();
      placeCaretAtEnd(el);
      const clipboard = {
        getData: (t: string) => (t === 'text/plain' ? '\r\nA\tB\r\nC\rD\n' : ''),
      };
      fireEvent.paste(el, { clipboardData: clipboard });
      // Leading \n, trailing \n, tabs, and CR/CRLF all normalized to \n.
      expect(el.textContent).toBe('\nA\tB\nC\nD\n');
    });


    it('handles very large multi-line pastes as a single text node insert', () => {
      installExecCommandShim();
      render(<Harness initialText="" />);
      const el = document.querySelector('[data-text-box-input]') as HTMLDivElement;
      el.focus();
      placeCaretAtEnd(el);
      const line = 'lorem ipsum dolor sit amet\t';
      const big = Array.from({ length: 5000 }, (_, i) => `${i}:${line}`).join('\n');
      const start = performance.now();
      fireEvent.paste(el, { clipboardData: { getData: () => big } });
      const elapsed = performance.now() - start;
      expect(el.textContent?.length).toBe(big.length);
      // Sanity: 5k lines should insert well under a second in jsdom.
      expect(elapsed).toBeLessThan(1000);
    });

    it('is a no-op during composition (must not fight the IME)', () => {
      installExecCommandShim();
      render(<Harness initialText="abc" />);
      const el = document.querySelector('[data-text-box-input]') as HTMLDivElement;
      el.focus();
      placeCaretAtEnd(el);
      fireEvent.compositionStart(el);
      fireEvent.paste(el, { clipboardData: { getData: () => 'XYZ' } });
      expect(el.textContent).toBe('abc');
      fireEvent.compositionEnd(el);
    });
  });

  describe('RTL', () => {
    it('sets dir="auto" so each paragraph picks its own direction from strong chars', () => {
      render(<Harness initialText={'مرحبا\nhello 123'} />);
      const el = document.querySelector('[data-text-box-input]') as HTMLDivElement;
      expect(el.getAttribute('dir')).toBe('auto');
      // Content itself is stored logical-order; visual bidi is a browser
      // concern verified in Playwright, not jsdom.
      expect(el.textContent).toBe('مرحبا\nhello 123');
    });
  });
});
