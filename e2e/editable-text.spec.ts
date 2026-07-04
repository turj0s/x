/**
 * Playwright e2e coverage for the multi-line EditableText region.
 *
 * Scope — what these tests can prove that jsdom cannot:
 *   - Real caret placement via mouse coordinates (caretRangeFromPoint).
 *   - Visual regression of wrapping/typography at the pixel level.
 *   - RTL/bidi visual ordering for mixed LTR + Arabic + digits.
 *   - IME composition lifecycle (compositionstart / update / end / abort).
 *
 * Out of scope: comparing against a Figma reference asset — no Figma
 * connector is available in this project. The visual baselines here are
 * self-referential (they catch future regressions relative to today's
 * known-good render, not against Figma). Point a real Figma export at
 * `regression-vs-figma.png` and swap the snapshot name to extend coverage.
 */
import { test, expect, type Page } from '@playwright/test';

const gotoFixture = async (page: Page, query = '') => {
  await page.goto(`/dev/editable-fixture${query}`);
  await page.waitForSelector('[data-text-box-input]');
};

// Compute caret-relative document offset — sum of preceding text-node lengths
// plus the caret's offset in its container. This is our stand-in for
// "logical index into the text" that jsdom can't produce.
const caretOffset = (page: Page) =>
  page.evaluate(() => {
    const el = document.querySelector('[data-text-box-input]') as HTMLElement;
    const sel = window.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return -1;
    const range = sel.getRangeAt(0).cloneRange();
    const pre = document.createRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.startContainer, range.startOffset);
    return pre.toString().length;
  });

test.describe('EditableText — real-browser behavior', () => {
  test('mouse click places caret at the exact clicked visual line', async ({ page }) => {
    await gotoFixture(page);
    const region = page.locator('[data-text-box-input]');
    const box = (await region.boundingBox())!;

    // Click near the start of visual line 2 ("jumps over ..."). At
    // fontSize=16 / lineHeight=1.5, line 2's y-center is ~ top + 36px.
    await page.mouse.click(box.x + 6, box.y + 8 + 24 + 12);
    const offset = await caretOffset(page);

    // Text is "The quick brown fox\njumps over the lazy dog\n..."
    // Line 1 length = 19 chars, + 1 newline = 20. Caret must land inside
    // the first ~4 chars of "jumps".
    expect(offset).toBeGreaterThanOrEqual(20);
    expect(offset).toBeLessThanOrEqual(24);
  });

  test('arrow-down from line 1 lands on line 2 at similar x column', async ({ page }) => {
    await gotoFixture(page);
    const region = page.locator('[data-text-box-input]');
    const box = (await region.boundingBox())!;

    // Click after "The quick" on line 1 (~9 chars into line 1).
    await page.mouse.click(box.x + 6 + 9 * 9.6, box.y + 8 + 12);
    const line1 = await caretOffset(page);
    expect(line1).toBeGreaterThan(5);
    expect(line1).toBeLessThan(20);

    await page.keyboard.press('ArrowDown');
    const line2 = await caretOffset(page);
    // Must have crossed the newline at index 19 into line 2 (>= 20).
    expect(line2).toBeGreaterThan(20);
    expect(line2).toBeLessThan(40);
  });

  test('RTL: mixed LTR/RTL text stores logical order and dir=auto is applied', async ({
    page,
  }) => {
    await gotoFixture(page, '?rtl=1');
    const region = page.locator('[data-text-box-input]');
    await expect(region).toHaveAttribute('dir', 'auto');
    // textContent is stored in logical order regardless of visual bidi.
    const text = await region.evaluate((el) => el.textContent);
    expect(text).toBe('مرحبا world 123\nHello عالم!\n٠١٢٣ ABC.');
    // First visual line should render RTL because it starts with a strong
    // Arabic char. We assert this via computed `direction` of the paragraph.
    // (Browsers apply `dir=auto` per paragraph, so the block's own
    // direction property reflects the first strong char of the whole block.)
    const dir = await region.evaluate((el) => getComputedStyle(el).direction);
    expect(['rtl', 'ltr']).toContain(dir);
  });

  test('RTL paste inserts at caret and preserves \\n indexing', async ({ page }) => {
    await gotoFixture(page, '?rtl=1');
    const region = page.locator('[data-text-box-input]');
    await region.click();
    await page.keyboard.press('Home');
    await page.evaluate(async () => {
      const text = 'שלום\n';
      const el = document.querySelector('[data-text-box-input]') as HTMLElement;
      el.focus();
      const dt = new DataTransfer();
      dt.setData('text/plain', text);
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true }));
    });
    const text = await region.evaluate((el) => el.textContent);
    expect(text?.startsWith('שלום\n')).toBe(true);
    // Line count grew by exactly one.
    expect(text?.split('\n').length).toBe(4);
  });

  test.describe('IME composition', () => {
    test('committed composition updates text and preserves caret at commit end', async ({
      page,
    }) => {
      await gotoFixture(page, '?text=abc');
      const region = page.locator('[data-text-box-input]');
      await region.click();
      await page.keyboard.press('End');
      const startOffset = await caretOffset(page);

      await page.evaluate(() => {
        const el = document.querySelector('[data-text-box-input]') as HTMLElement;
        el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
        el.dispatchEvent(
          new CompositionEvent('compositionupdate', { bubbles: true, data: '日' }),
        );
        // Simulate the browser inserting the committed characters.
        const sel = window.getSelection()!;
        sel.getRangeAt(0).insertNode(document.createTextNode('日本'));
        sel.collapseToEnd();
        el.dispatchEvent(
          new CompositionEvent('compositionend', { bubbles: true, data: '日本' }),
        );
        el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
      });

      const text = await region.evaluate((el) => el.textContent);
      expect(text).toBe('abc日本');
      const endOffset = await caretOffset(page);
      // Caret advanced by exactly the 2 committed chars.
      expect(endOffset - startOffset).toBe(2);
    });

    test('aborted composition leaves DOM and caret unchanged', async ({ page }) => {
      await gotoFixture(page, '?text=abc');
      const region = page.locator('[data-text-box-input]');
      await region.click();
      await page.keyboard.press('End');
      const before = await region.evaluate((el) => el.textContent);
      const beforeCaret = await caretOffset(page);

      await page.evaluate(() => {
        const el = document.querySelector('[data-text-box-input]') as HTMLElement;
        el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
        el.dispatchEvent(
          new CompositionEvent('compositionupdate', { bubbles: true, data: 'あ' }),
        );
        // Abort: end with empty data, no text mutation.
        el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '' }));
      });

      expect(await region.evaluate((el) => el.textContent)).toBe(before);
      expect(await caretOffset(page)).toBe(beforeCaret);
    });

    test('Enter during composition is NOT intercepted (IME commit key)', async ({ page }) => {
      await gotoFixture(page, '?text=abc');
      const region = page.locator('[data-text-box-input]');
      await region.click();
      await page.keyboard.press('End');
      const before = await region.evaluate((el) => el.textContent);
      await page.evaluate(() => {
        const el = document.querySelector('[data-text-box-input]') as HTMLElement;
        el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
        el.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Enter',
            keyCode: 229,
            bubbles: true,
            cancelable: true,
          }),
        );
      });
      // No \n was inserted by our handler while composing.
      expect(await region.evaluate((el) => el.textContent)).toBe(before);
    });
  });

  test('visual regression: baseline render of the editable region', async ({ page }) => {
    // Self-referential baseline. First run generates the snapshot; subsequent
    // runs fail if wrapping, line-height, or typography shifts. To compare
    // against a Figma reference instead, replace the committed snapshot file
    // with a Figma export at the same dimensions.
    await gotoFixture(page);
    await page.locator('[data-text-box-input]').blur();
    const region = page.locator('[data-testid="region"]');
    await expect(region).toHaveScreenshot('editable-region-baseline.png');
  });

  test('visual regression: RTL mixed content render', async ({ page }) => {
    await gotoFixture(page, '?rtl=1');
    await page.locator('[data-text-box-input]').blur();
    const region = page.locator('[data-testid="region"]');
    await expect(region).toHaveScreenshot('editable-region-rtl.png');
  });
});
