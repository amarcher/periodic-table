import { useEffect } from 'react';
import { ConversationProvider } from '@elevenlabs/react';
import { useElementConversation } from '../hooks/useElementConversation';
import type { Element } from '../types/element';
import type { AtomViewMode } from './atom/atomConfig';
import { VoiceAgent } from './VoiceAgent';

interface Props {
  selected: Element | null;
  onNavigate: (element: Element) => void;
  onGoBack: () => void;
  onSetAtomViewMode: (mode: AtomViewMode) => void;
}

function VoiceSession(props: Props) {
  const voice = useElementConversation(props);
  const { notifyElementChange, notifyElementClosed } = voice;
  useEffect(() => {
    if (props.selected) notifyElementChange(props.selected);
    else notifyElementClosed();
  }, [props.selected, notifyElementChange, notifyElementClosed]);
  return <VoiceAgent status={voice.status} isSpeaking={voice.isSpeaking} onToggle={voice.toggle}
    micError={voice.micError} onDismissError={voice.clearMicError} />;
}

export default function VoiceExperience(props: Props) {
  return <ConversationProvider><VoiceSession {...props} /></ConversationProvider>;
}
