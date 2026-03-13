import type { VoiceStatus } from '../hooks/useElementConversation';
import './VoiceAgent.css';

interface VoiceAgentProps {
  status: VoiceStatus;
  isSpeaking: boolean;
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

function statusText(status: VoiceStatus, isSpeaking: boolean): string {
  if (status === 'connecting') return 'Getting ready...';
  if (status === 'connected' && isSpeaking) return 'Talking to you!';
  if (status === 'connected') return 'Listening...';
  if (status === 'error') return 'Tap to try again';
  return '';
}

export function VoiceAgent({ status, isSpeaking, catColor }: VoiceAgentProps) {
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
        <div className={orbClass} aria-label="Voice agent">
          <MicIcon />
        </div>
        <div className="voice-agent__wave" />
        <div className="voice-agent__wave" />
        <div className="voice-agent__wave" />
      </div>
      <span className="voice-agent__status">
        {statusText(status, isSpeaking)}
      </span>
    </div>
  );
}
