import { Fragment, type ReactNode } from 'react';

const BOLD = /\*\*([^*\n]+?)\*\*/g;
const HEADING = /^#{1,6}\s+(.*)$/;

function renderInline(line: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of line.matchAll(BOLD)) {
    if (match.index > last) parts.push(line.slice(last, match.index));
    parts.push(
      <strong key={match.index} className="font-semibold text-fg">
        {match[1]}
      </strong>,
    );
    last = match.index + match[0].length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

/**
 * Renders model text as plain React text with two light conveniences: `**bold**` and `#` heading
 * lines become bold, without their markers. Everything else (numbered steps, line breaks, inline
 * [policy-N] citations) is shown verbatim. Nothing is parsed as HTML, so model output can't inject
 * markup. An unclosed `**` (mid-stream) simply stays as typed until it closes.
 */
export function FormattedText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        const heading = HEADING.exec(line);
        return (
          <Fragment key={i}>
            {heading ? <strong className="font-semibold text-fg">{renderInline(heading[1]!)}</strong> : renderInline(line)}
            {i < lines.length - 1 && '\n'}
          </Fragment>
        );
      })}
    </>
  );
}
