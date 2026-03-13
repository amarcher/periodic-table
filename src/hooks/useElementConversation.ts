import { useCallback, useEffect, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { Element } from '../types/element';
import { categoryLabels } from '../utils/colors';

export type VoiceStatus = 'off' | 'connecting' | 'connected' | 'error';

function buildElementContext(element: Element): string {
  return [
    `[ELEMENT CLICK] The child just clicked on ${element.name} (symbol: ${element.symbol}, atomic number: ${element.atomicNumber}).`,
    `It is a ${categoryLabels[element.category]}.`,
    `Appearance: ${element.appearance || 'unknown'}.`,
    `Summary: ${element.summary}`,
    `Fun facts: ${element.funFacts.join('. ')}`,
    `Get excited about ${element.name} and start telling the child about it!`,
  ].join(' ');
}

/**
 * Persistent voice agent at App level.
 * Starts immediately on page load — greets the kid on the periodic table.
 * Element clicks are sent as contextual updates.
 */
export function useElementConversation() {
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;
  const [sessionStarted, setSessionStarted] = useState(false);
  const pendingElementRef = useRef<Element | null>(null);
  const currentElementRef = useRef<number | null>(null);
  const startAttemptedRef = useRef(false);

  const conversation = useConversation({
    onConnect: () => {
      // If an element was clicked before connection completed, send it now
      if (pendingElementRef.current) {
        const ctx = buildElementContext(pendingElementRef.current);
        conversation.sendContextualUpdate(ctx);
        currentElementRef.current = pendingElementRef.current.atomicNumber;
        pendingElementRef.current = null;
      }
    },
    onError: (error) => {
      console.error('ElevenLabs conversation error:', error);
    },
  });

  // Start session on mount — agent greets the kid on the homepage
  useEffect(() => {
    if (!agentId || startAttemptedRef.current) return;
    startAttemptedRef.current = true;

    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.error('Mic permission denied:', err);
        return;
      }

      setSessionStarted(true);

      try {
        await conversation.startSession({
          agentId,
          connectionType: 'websocket',
        });
      } catch (err) {
        console.error('Failed to start conversation:', err);
        setSessionStarted(false);
      }
    })();
  }, [agentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const notifyElementChange = useCallback((element: Element) => {
    if (!agentId) return;

    // Skip if same element
    if (currentElementRef.current === element.atomicNumber) return;
    currentElementRef.current = element.atomicNumber;

    if (conversation.status === 'connected') {
      const ctx = buildElementContext(element);
      conversation.sendContextualUpdate(ctx);
    } else {
      // Queue it — onConnect will flush
      pendingElementRef.current = element;
    }
  }, [agentId, conversation]);

  const notifyElementClosed = useCallback(() => {
    if (!agentId || conversation.status !== 'connected') return;
    currentElementRef.current = null;
    conversation.sendContextualUpdate(
      '[ELEMENT CLOSED] The child closed the element view and is back on the periodic table. ' +
      'Encourage them to pick another element to explore!'
    );
  }, [agentId, conversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionStarted) {
        conversation.endSession().catch(() => {});
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Map ElevenLabs status to our simpler status
  let status: VoiceStatus = 'off';
  if (sessionStarted) {
    if (conversation.status === 'connected') status = 'connected';
    else if (conversation.status === 'connecting') status = 'connecting';
    else if (conversation.status === 'disconnected') status = 'error';
    else status = 'connecting';
  }

  return {
    status,
    isSpeaking: conversation.isSpeaking,
    notifyElementChange,
    notifyElementClosed,
    agentId,
  };
}
