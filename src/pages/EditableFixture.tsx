/**
 * Playwright fixture route. Renders EditableText in isolation so e2e tests
 * can drive it without going through the authenticated editor. Reachable at
 * `/dev/editable-fixture`. Query string controls initial content:
 *   ?text=hello%0Aworld  -> initial text
 *   ?rtl=1               -> uses a mixed RTL/LTR string
 * The DOM is intentionally minimal (fixed width, known font-size) so caret
 * coordinates in Playwright are deterministic across runs.
 */
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EditableText } from './TemplateEditor';

const EditableFixture = () => {
  const [params] = useSearchParams();
  const initial = useMemo(() => {
    if (params.get('rtl') === '1') {
      // Mixed LTR/RTL: Arabic + English + digits + punctuation on multi lines.
      return 'مرحبا world 123\nHello عالم!\n٠١٢٣ ABC.';
    }
    return params.get('text') ?? 'The quick brown fox\njumps over the lazy dog\nline three here';
  }, [params]);

  const [editing, setEditing] = useState(true);
  const [committed, setCommitted] = useState(initial);

  return (
    <div style={{ padding: 40, background: '#fff', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: 14, marginBottom: 12 }}>editable-fixture</h1>
      <div
        data-testid="region"
        style={{
          width: 320,
          border: '1px solid #ccc',
          background: '#fff',
          padding: 8,
        }}
      >
        <EditableText
          initialText={initial}
          editing={editing}
          onCommit={(t) => {
            setCommitted(t);
            setEditing(false);
          }}
          style={{
            fontFamily: 'monospace',
            fontSize: 16,
            lineHeight: 1.5,
            color: '#111',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            minHeight: '1em',
            outline: 'none',
          }}
        />
      </div>
      <button type="button" onClick={() => setEditing(true)} data-testid="reedit">
        edit
      </button>
      <pre data-testid="committed" style={{ marginTop: 12, fontSize: 12 }}>
        {JSON.stringify(committed)}
      </pre>
    </div>
  );
};

export default EditableFixture;
