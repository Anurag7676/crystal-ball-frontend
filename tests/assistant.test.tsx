import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssistantPanel } from '@/components/assistant/AssistantPanel';
import { ApiError, streamAiAction } from '@/lib/api';
import { resetAssistantStore } from '@/store/assistantStore';
import { createControlledStream, delta, doneAi, meta } from './helpers/controlledStream';

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return { ...actual, streamAiAction: vi.fn() };
});

let stream: ReturnType<typeof createControlledStream>;

beforeEach(() => {
  resetAssistantStore();
  stream = createControlledStream();
  vi.mocked(streamAiAction).mockImplementation(stream.impl);
});

const renderPanel = () => render(<AssistantPanel pendingCount={4} />);
const panel = () => screen.getByRole('dialog', { name: 'Approvals assistant' });

describe('AssistantPanel', () => {
  it('renders the reference layout: header, five actions and the item count', () => {
    renderPanel();

    const dialog = panel();
    for (const name of ['Present me Summary', 'Talk to me', 'Help me', 'Teach me', 'Replay Greeting']) {
      expect(within(dialog).getByRole('button', { name })).toBeInTheDocument();
    }
    expect(within(dialog).getByRole('button', { name: 'Close assistant' })).toBeInTheDocument();
    expect(within(dialog).getByText('4 pending items')).toBeInTheDocument();
  });

  it('closes and reopens from the floating launcher', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(within(panel()).getByRole('button', { name: 'Close assistant' }));
    // The panel plays a short exit animation before unmounting.
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Open assistant' }));
    expect(panel()).toBeInTheDocument();
  });

  it('plays a greeting on open: loading → token-by-token streaming → done', async () => {
    renderPanel();
    const greeting = screen.getByRole('status', { name: 'Greeting' });

    expect(stream.last('greeting').action).toBe('greeting');
    expect(within(greeting).getByText(/thinking/i)).toBeInTheDocument();

    stream.emit('greeting', meta('greeting'), delta('Welcome '));
    expect(greeting).toHaveTextContent('Welcome');
    expect(greeting).toHaveAttribute('aria-busy', 'true');

    stream.emit('greeting', delta('back!'));
    expect(greeting).toHaveTextContent('Welcome back!');

    await stream.finish('greeting', doneAi);
    expect(greeting).toHaveAttribute('aria-busy', 'false');
  });

  it('Replay Greeting makes a fresh request each time', async () => {
    const user = userEvent.setup();
    renderPanel();
    await stream.finish('greeting', meta('greeting'), delta('Hi'), doneAi);

    await user.click(screen.getByRole('button', { name: 'Replay Greeting' }));

    expect(stream.calls.filter((c) => c.action === 'greeting')).toHaveLength(2);
  });

  it('labels a fallback answer so the operator knows it is not from the AI', async () => {
    renderPanel();

    await stream.finish(
      'greeting',
      meta('greeting'),
      { event: 'result', data: { kind: 'text', text: 'Welcome back. You have 4 pending approvals.' } },
      { event: 'done', data: { source: 'fallback', fallbackReason: 'timeout' } },
    );

    const greeting = screen.getByRole('status', { name: 'Greeting' });
    expect(greeting).toHaveTextContent('Welcome back. You have 4 pending approvals.');
    expect(within(greeting).getByText('Offline answer')).toBeInTheDocument();
  });

  it('shows an error with a working retry when the request fails', async () => {
    const user = userEvent.setup();
    renderPanel();

    await stream.fail('greeting', new ApiError('network_error', 'Could not reach the server.'));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Could not reach the server.');

    await user.click(within(alert).getByRole('button', { name: 'Try again' }));
    await stream.finish('greeting', meta('greeting'), delta('Hello again'), doneAi);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'Greeting' })).toHaveTextContent('Hello again');
  });

  it('Talk to me: sends a message, streams the reply, and keeps the conversation', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Talk to me' }));
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Which should I review first?');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(stream.last('chat').body).toMatchObject({ message: 'Which should I review first?' });
    const log = screen.getByRole('log');
    expect(within(log).getByText('Which should I review first?')).toBeInTheDocument();

    stream.emit('chat', meta('chat'), delta('Start with '));
    expect(log).toHaveTextContent('Start with');
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeDisabled();

    await stream.finish('chat', delta('Safety Equipment & Sensor Specs.'), doneAi);
    expect(log).toHaveTextContent('Start with Safety Equipment & Sensor Specs.');
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeEnabled();
  });

  it('can cancel a streaming reply with Stop', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'Talk to me' }));
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'hello');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    stream.emit('chat', meta('chat'), delta('Partial'));

    await user.click(screen.getByRole('button', { name: 'Stop' }));

    expect(stream.last('chat').signal?.aborted).toBe(true);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Message' })).toBeEnabled());
    expect(screen.getByRole('log')).toHaveTextContent('Partial');
    expect(screen.getByRole('log')).toHaveTextContent(/stopped/i);
  });

  it('shows a retryable error for a failed chat reply and resends the same question on retry', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'Talk to me' }));
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Which first?');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await stream.finish('chat', meta('chat'), {
      event: 'error',
      data: { code: 'ai_unavailable', message: 'The AI assistant took too long to respond.', retryable: true },
    });

    const alert = within(screen.getByRole('log')).getByRole('alert');
    expect(alert).toHaveTextContent('The AI assistant took too long to respond.');

    await user.click(within(alert).getByRole('button', { name: 'Try again' }));

    const chatCalls = stream.calls.filter((c) => c.action === 'chat');
    expect(chatCalls).toHaveLength(2);
    expect(chatCalls[1]!.body).toMatchObject({ message: 'Which first?' });
    expect(within(screen.getByRole('log')).getAllByText('Which first?')).toHaveLength(1);
  });

  it('surfaces rate limiting from the API as a readable error', async () => {
    renderPanel();

    await stream.fail('greeting', new ApiError('rate_limited', 'Too many AI requests. Please wait a moment and try again.', 429));

    expect(screen.getByRole('alert')).toHaveTextContent('Too many AI requests.');
  });

  it('Help me shows only the verified citations the answer used', async () => {
    const user = userEvent.setup();
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'Help me' }));
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'What about safety items?');
    await user.click(screen.getByRole('button', { name: 'Send' }));

    await stream.finish(
      'help',
      { event: 'meta', data: { action: 'help', requestId: 'r', sources: ['policy-3', 'policy-2'] } },
      delta('Review them first [policy-3].'),
      { event: 'done', data: { source: 'ai', citedSources: ['policy-3'] } },
    );

    expect(screen.getByRole('log')).toHaveTextContent('Sources: policy-3');
    expect(screen.getByRole('log')).not.toHaveTextContent('policy-2');
  });

  describe('Help citations footer', () => {
    async function askHelp(user: ReturnType<typeof userEvent.setup>, sources: string[]) {
      await user.click(screen.getByRole('button', { name: 'Help me' }));
      await user.type(screen.getByRole('textbox', { name: 'Message' }), 'How do I review safety items?');
      await user.click(screen.getByRole('button', { name: 'Send' }));
      stream.emit('help', { event: 'meta', data: { action: 'help', requestId: 'r', sources } });
    }

    it('lists each validated citation once, keeping inline citations in the text', async () => {
      const user = userEvent.setup();
      renderPanel();
      await askHelp(user, ['policy-3', 'policy-2']);

      await stream.finish(
        'help',
        delta('Steps [policy-2]. Safety first [policy-3]. Again [policy-2].'),
        { event: 'done', data: { source: 'ai', citedSources: ['policy-2', 'policy-3', 'policy-2'] } },
      );

      const log = screen.getByRole('log');
      expect(log).toHaveTextContent('Steps [policy-2]. Safety first [policy-3]. Again [policy-2].');
      const footer = within(log).getByText('Sources:', { exact: false });
      expect(footer).toHaveTextContent(/^Sources: policy-2, policy-3$/);
    });

    it('shows no footer at all when nothing was cited', async () => {
      const user = userEvent.setup();
      renderPanel();
      await askHelp(user, ['policy-3']);

      await stream.finish('help', delta("The approval policy doesn't cover that."), {
        event: 'done',
        data: { source: 'ai', citedSources: [] },
      });

      expect(screen.getByRole('log')).not.toHaveTextContent(/Sources|Policy context/);
    });

    it('drops citations that were not part of the grounding context', async () => {
      const user = userEvent.setup();
      renderPanel();
      await askHelp(user, ['policy-3']);

      await stream.finish('help', delta('See [policy-3].'), {
        event: 'done',
        data: { source: 'ai', citedSources: ['policy-3', 'policy-9'] },
      });

      const log = screen.getByRole('log');
      expect(within(log).getByText('Sources:', { exact: false })).toHaveTextContent(/^Sources: policy-3$/);
      expect(log).not.toHaveTextContent('policy-9');
    });

    it('shows no footer while streaming, and none after a cancelled reply', async () => {
      const user = userEvent.setup();
      renderPanel();
      await askHelp(user, ['policy-3']);

      stream.emit('help', delta('Escalate it [policy-3]'));
      expect(screen.getByRole('log')).not.toHaveTextContent('Sources:');

      await user.click(screen.getByRole('button', { name: 'Stop' }));
      await waitFor(() => expect(screen.getByRole('log')).toHaveTextContent(/stopped/i));
      expect(screen.getByRole('log')).not.toHaveTextContent('Sources:');
    });

    it('shows the validated citations of a fallback answer next to the offline badge', async () => {
      const user = userEvent.setup();
      renderPanel();
      await askHelp(user, ['policy-3']);

      await stream.finish(
        'help',
        { event: 'result', data: { kind: 'text', text: 'Here is the most relevant section: [policy-3] Safety…' } },
        { event: 'done', data: { source: 'fallback', fallbackReason: 'timeout', citedSources: ['policy-3'] } },
      );

      const log = screen.getByRole('log');
      expect(within(log).getByText('Offline answer')).toBeInTheDocument();
      expect(within(log).getByText('Sources:', { exact: false })).toHaveTextContent(/^Sources: policy-3$/);
    });

    it('does not carry citations into another conversation', async () => {
      const user = userEvent.setup();
      renderPanel();
      await askHelp(user, ['policy-3']);
      await stream.finish('help', delta('See [policy-3].'), {
        event: 'done',
        data: { source: 'ai', citedSources: ['policy-3'] },
      });

      await user.click(screen.getByRole('button', { name: 'Back to actions' }));
      await user.click(screen.getByRole('button', { name: 'Talk to me' }));
      await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Which first?');
      await user.click(screen.getByRole('button', { name: 'Send' }));
      await stream.finish('chat', meta('chat'), delta('Start with the safety specs.'), doneAi);

      expect(screen.getByRole('log')).not.toHaveTextContent(/Sources|policy-3/);
    });
  });

  describe('action and request isolation', () => {
    it('sends each request to the action shown on screen when switching Help → Teach', async () => {
      const user = userEvent.setup();
      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Help me' }));
      await user.type(screen.getByRole('textbox', { name: 'Message' }), 'What is the review workflow?');
      await user.click(screen.getByRole('button', { name: 'Send' }));
      await stream.finish('help', meta('help'), delta('Steps.'), doneAi);

      await user.click(screen.getByRole('button', { name: 'Back to actions' }));
      await user.click(screen.getByRole('button', { name: 'Teach me' }));

      expect(screen.getByRole('button', { name: 'Back to actions' })).toHaveTextContent('Teach me');
      expect(stream.calls.map((c) => c.action)).toEqual(['greeting', 'help', 'teach']);
      expect(stream.last('teach').body).toMatchObject({ message: 'Teach me how to review an approval.' });
    });

    it('ignores late events from a superseded greeting request', async () => {
      const user = userEvent.setup();
      renderPanel();
      const first = stream.last('greeting');
      stream.emit('greeting', meta('greeting'), delta('Old greet'));

      await user.click(screen.getByRole('button', { name: 'Replay Greeting' }));
      act(() => first.emit(delta('ing that arrived late')));
      await stream.finish('greeting', meta('greeting'), delta('Fresh greeting'), doneAi);

      expect(screen.getByRole('status', { name: 'Greeting' })).toHaveTextContent('Fresh greeting');
      expect(screen.getByRole('status', { name: 'Greeting' })).not.toHaveTextContent('arrived late');
    });

    it('ignores late events from a stopped chat reply', async () => {
      const user = userEvent.setup();
      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Talk to me' }));
      await user.type(screen.getByRole('textbox', { name: 'Message' }), 'hello');
      await user.click(screen.getByRole('button', { name: 'Send' }));
      const stopped = stream.last('chat');
      stream.emit('chat', meta('chat'), delta('Partial'));

      await user.click(screen.getByRole('button', { name: 'Stop' }));
      act(() => {
        stopped.emit(delta(' — late text'));
        stopped.emit(doneAi);
      });

      await waitFor(() => expect(screen.getByRole('log')).toHaveTextContent(/stopped/i));
      expect(screen.getByRole('log')).not.toHaveTextContent('late text');
    });
  });

  it('Teach me starts the lesson automatically', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Teach me' }));

    expect(stream.last('teach').body).toMatchObject({ message: 'Teach me how to review an approval.' });
    expect(stream.calls.filter((c) => c.action === 'teach')).toHaveLength(1);
  });

  it('Present me Summary renders the validated structured summary', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Present me Summary' }));
    expect(screen.getByText(/thinking/i)).toBeInTheDocument();

    await stream.finish(
      'summary',
      meta('summary'),
      {
        event: 'result',
        data: {
          kind: 'summary',
          summary: {
            pendingCount: 4,
            overview: 'Four items await review.',
            priorityItems: [{ approvalId: 'apr-003', title: 'Safety Equipment & Sensor Specs', reason: 'Safety first.' }],
            recommendations: ['Verify sensor models.'],
            orderingNote: 'Suggested order only.',
          },
        },
      },
      doneAi,
    );

    const summary = screen.getByRole('region', { name: 'Queue summary' });
    expect(summary).toHaveTextContent('4 pending');
    expect(summary).toHaveTextContent('Safety Equipment & Sensor Specs');
    expect(summary).toHaveTextContent('Verify sensor models.');
    expect(summary).toHaveTextContent('Suggested order only.');
  });
});
