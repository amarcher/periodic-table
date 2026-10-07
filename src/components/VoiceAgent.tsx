import { useEffect, useRef, useState } from 'react';
import type { AskMessage, AskStatus, MicError, VoiceStatus } from '../hooks/useElementConversation';
import { trackEvent } from '../utils/analytics';
import './VoiceAgent.css';

interface VoiceAgentProps {
  status: VoiceStatus;
  isSpeaking: boolean;
  onToggle: () => void;
  micError: MicError;
  onDismissError: () => void;
  askStatus: AskStatus;
  askMessages: AskMessage[];
  onAsk: (question: string) => void;
  onCloseAsk: () => void;
  /** Name of the open element, if any. */
  askTopic?: string;
  catColor?: string;
}

function MicIcon() {
  return (
    <svg className="voice-agent__mic-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

const MIC_ERROR_MESSAGES: Record<NonNullable<MicError>, string> = {
  timeout: 'The microphone did not respond. You can keep exploring, or try voice again.',
  'not-allowed': 'Microphone access is off. You can type a question instead.',
  device: 'No microphone is available. You can type a question instead.',
  'no-input': 'No sound detected. Check that your microphone is unmuted, or continue exploring without voice.',
  connection: 'The voice guide could not connect. You can keep exploring and try again later.',
};

function statusText(status: VoiceStatus, isSpeaking: boolean, micError: MicError): string {
  if (micError) return 'Tap to try again';
  if (status === 'connecting') return 'Getting ready...';
  if (status === 'connected' && isSpeaking) return 'Talking to you!';
  if (status === 'connected') return 'Listening...';
  if (status === 'error') return 'Tap to try again';
  return 'Tap to talk';
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
    </svg>
  );
}

/** Keep the floating control above the on-screen keyboard while typing. */
function useKeyboardOffset(active: boolean) {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!active || !viewport) return;
    const root = document.documentElement.style;
    const update = () => {
      const covered = window.innerHeight - viewport.height - viewport.offsetTop;
      root.setProperty('--ask-keyboard', `${Math.max(0, Math.round(covered))}px`);
      root.setProperty('--ask-viewport', `${Math.round(viewport.height)}px`);
    };
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      root.removeProperty('--ask-keyboard');
      root.removeProperty('--ask-viewport');
    };
  }, [active]);
}

export function VoiceAgent({
  status, isSpeaking, onToggle, micError, onDismissError,
  askStatus, askMessages, onAsk, onCloseAsk, askTopic, catColor,
}: VoiceAgentProps) {
  const [askOpen, setAskOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const threadRef = useRef<HTMLDivElement>(null);
  useKeyboardOffset(askOpen);

  useEffect(() => {
    // Bring the start of the newest line into view so a long answer reads from its top
    const thread = threadRef.current;
    const latest = thread?.lastElementChild as HTMLElement | null;
    if (thread && latest) thread.scrollTop = latest.offsetTop - thread.offsetTop;
  }, [askMessages, askStatus]);

  const closeAsk = () => { setAskOpen(false); setDraft(''); onCloseAsk(); };
  const toggleAsk = () => {
    if (askOpen) { closeAsk(); return; }
    setAskOpen(true);
    trackEvent('ask_opened');
  };
  const toggleVoice = () => { setAskOpen(false); setDraft(''); onToggle(); };
  const submitAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || askStatus === 'waiting') return;
    onAsk(draft);
    setDraft('');
  };
  const orbClass = [
    'voice-agent__orb',
    status === 'connecting' && 'voice-agent__orb--connecting',
    status === 'connected' && !isSpeaking && 'voice-agent__orb--listening',
    status === 'connected' && isSpeaking && 'voice-agent__orb--speaking',
  ].filter(Boolean).join(' ');

  const containerClass = [
    'voice-agent__orb-container',
    isSpeaking && 'voice-agent__orb-container--speaking',
  ].filter(Boolean).join(' ');

  return (
    <div
      className="voice-agent"
      style={catColor ? { '--cat-color': catColor } as React.CSSProperties : undefined}
    >
      <div className={containerClass}>
        <button className={orbClass} aria-label="Voice agent" onClick={toggleVoice} type="button">
          <MicIcon />
        </button>
        <div className="voice-agent__wave" />
        <div className="voice-agent__wave" />
        <div className="voice-agent__wave" />
      </div>
      <span className="voice-agent__status">
        {statusText(status, isSpeaking, micError)}
      </span>
      {micError && (
        <button
          className="voice-agent__error"
          onClick={onDismissError}
          type="button"
          aria-label="Dismiss microphone error"
        >
          {MIC_ERROR_MESSAGES[micError]}
        </button>
      )}
      {status === 'off' && (
        <button className="voice-agent__ask-toggle" onClick={toggleAsk} type="button" aria-expanded={askOpen}>
          {askOpen ? 'Close' : 'or type a question'}
        </button>
      )}
      {askOpen && status === 'off' && (
        <form
          className="voice-agent__ask"
          aria-label="Ask a question"
          onSubmit={submitAsk}
          onKeyDown={(e) => {
            // The element dialog also listens for Escape; close only this panel.
            if (e.key === 'Escape') { e.stopPropagation(); closeAsk(); }
          }}
        >
          <div className="voice-agent__ask-thread" ref={threadRef} aria-live="polite">
            {askMessages.length === 0 && askStatus !== 'error' && (
              <p className="voice-agent__ask-note">Answers appear here as text. No microphone or sound.</p>
            )}
            {askMessages.map(message => (
              <p key={message.id} className={`voice-agent__ask-message voice-agent__ask-message--${message.role}`}>
                {message.text}
              </p>
            ))}
            {askStatus === 'waiting' && <p className="voice-agent__ask-note">Thinking…</p>}
            {askStatus === 'error' && (
              <p className="voice-agent__ask-note voice-agent__ask-note--error" role="alert">
                No answer came back. Try asking again.
              </p>
            )}
          </div>
          <div className="voice-agent__ask-row">
            <input
              className="voice-agent__ask-input"
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={askTopic ? `Ask about ${askTopic.toLowerCase()}…` : 'Ask about any element…'}
              aria-label="Your question"
              maxLength={300}
              enterKeyHint="send"
              autoComplete="off"
              autoFocus
            />
            <button
              className="voice-agent__ask-send"
              type="submit"
              aria-label="Send question"
              disabled={!draft.trim() || askStatus === 'waiting'}
            >
              <SendIcon />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
