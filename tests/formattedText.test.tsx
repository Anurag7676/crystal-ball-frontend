import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormattedText } from '@/components/assistant/FormattedText';

const renderText = (text: string) => render(<p data-testid="t"><FormattedText text={text} /></p>).getByTestId('t');

describe('FormattedText (assistant replies)', () => {
  it('renders **bold** as bold text without the asterisks', () => {
    const el = renderText('**Priority and safety checks**\n- Review safety items first [policy-3].');

    expect(el).toHaveTextContent('Priority and safety checks - Review safety items first [policy-3].');
    expect(el.textContent).not.toContain('**');
    expect(el.querySelector('strong')).toHaveTextContent('Priority and safety checks');
  });

  it('turns markdown heading lines into bold text without the hashes', () => {
    const el = renderText('## Standard review steps [policy-2]\n1. Open the item.');

    expect(el.textContent).not.toContain('#');
    expect(el.querySelector('strong')).toHaveTextContent('Standard review steps [policy-2]');
  });

  it('keeps numbered steps, line breaks and inline citations exactly', () => {
    const text = '1. Open the item [policy-2].\n2. Check it is complete [policy-2].\n\nEscalate if unsure [policy-3].';
    const el = renderText(text);

    expect(el.textContent).toBe(text);
    expect(el.querySelector('strong')).toBeNull();
  });

  it('leaves an unclosed ** (still streaming) as plain text', () => {
    const el = renderText('Some text **Priority and');
    expect(el.textContent).toBe('Some text **Priority and');
  });

  it('never interprets model output as HTML', () => {
    const el = renderText('**<img src=x onerror=alert(1)>** <script>alert(1)</script>');

    expect(el.querySelector('img')).toBeNull();
    expect(el.querySelector('script')).toBeNull();
    expect(el.textContent).toContain('<script>alert(1)</script>');
  });
});
