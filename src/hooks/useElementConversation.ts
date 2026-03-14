import { useCallback, useEffect, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { Element } from '../types/element';
import { categoryLabels } from '../utils/colors';
import { elements } from '../data/elements';

const DEBUG_VOICE = true;

function dbg(...args: unknown[]) {
  if (DEBUG_VOICE) console.log('[VoiceDebug]', ...args);
}

interface ConversationCallbacks {
  onNavigate: (element: Element) => void;
  onGoBack: () => void;
}

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
export function useElementConversation({ onNavigate, onGoBack }: ConversationCallbacks) {
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;
  const [sessionStarted, setSessionStarted] = useState(false);
  const pendingElementRef = useRef<Element | null>(null);
  const currentElementRef = useRef<number | null>(null);

  const conversation = useConversation({
    clientTools: {
      navigate_to_element: (params: { name: string }) => {
        const match = elements.find(el =>
          el.name.toLowerCase() === params.name.toLowerCase() ||
          el.symbol.toLowerCase() === params.name.toLowerCase()
        );
        if (!match) return `No element found matching "${params.name}"`;
        onNavigate(match);
        return `Navigated to ${match.name}`;
      },
      go_back_to_table: () => {
        currentElementRef.current = null;
        onGoBack();
        return "Returned to periodic table";
      },
    },
    onConnect: () => {
      dbg('onConnect fired — SDK reports connection established');
      dbg('onConnect: pendingElement =', pendingElementRef.current?.name ?? 'none');
      // If an element was clicked before connection completed, send it now
      if (pendingElementRef.current) {
        const ctx = buildElementContext(pendingElementRef.current);
        dbg('onConnect: flushing pending element context');
        conversation.sendContextualUpdate(ctx);
        currentElementRef.current = pendingElementRef.current.atomicNumber;
        pendingElementRef.current = null;
      }
    },
    onDisconnect: () => {
      dbg('onDisconnect fired — SDK reports session ended');
    },
    onMessage: (message: unknown) => {
      dbg('onMessage received:', message);
    },
    onError: (error: unknown) => {
      console.error('[VoiceDebug] onError fired:', error);
      if (error && typeof error === 'object') {
        console.error('[VoiceDebug] onError details:', JSON.stringify(error, null, 2));
      }
    },
  });

  /** Toggle session on/off — must be called from a user gesture (click) */
  const toggle = useCallback(async () => {
    console.group('[VoiceDebug] toggle()');
    dbg('entered toggle — agentId:', agentId ? `${agentId.slice(0, 8)}…` : 'MISSING');
    dbg('current state — sessionStarted:', sessionStarted, '| conversation.status:', conversation.status);

    if (!agentId) {
      dbg('aborting: no agentId configured');
      console.groupEnd();
      return;
    }

    // If connected, disconnect
    if (sessionStarted) {
      dbg('sessionStarted=true → calling endSession()');
      await conversation.endSession().catch((err) => {
        dbg('endSession() threw:', err);
      });
      dbg('endSession() settled — setting sessionStarted=false');
      setSessionStarted(false);
      console.groupEnd();
      return;
    }

    // Check mic permission without awaiting — fire-and-forget to avoid
    // breaking Chrome's user-gesture chain before startSession/getUserMedia.
    try {
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'microphone' as PermissionName }).then(
          (r) => dbg('microphone permission state:', r.state),
          (e) => dbg('permissions.query rejected:', e),
        );
      }
    } catch (permErr) {
      dbg('permissions.query threw:', permErr);
    }

    dbg('setting sessionStarted=true');
    setSessionStarted(true);

    // Timeout sentinel — logs a warning if startSession hasn't resolved in 10 s
    const timeoutId = window.setTimeout(() => {
      console.warn('[VoiceDebug] TIMEOUT: startSession() has not resolved after 10 s — the call appears to be hanging');
      console.warn('[VoiceDebug] conversation.status at timeout:', conversation.status);
    }, 10_000);

    try {
      dbg('calling conversation.startSession() with connectionType=websocket');
      const sessionResult = await conversation.startSession({
        agentId,
        connectionType: 'websocket',
      });
      clearTimeout(timeoutId);
      dbg('startSession() resolved successfully — result:', sessionResult);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('[VoiceDebug] startSession() rejected with error:', err);
      if (err && typeof err === 'object') {
        console.error('[VoiceDebug] startSession error details:', JSON.stringify(err, null, 2));
      }
      setSessionStarted(false);
    }

    console.groupEnd();
  }, [agentId, sessionStarted, conversation]);

  // Watch conversation.status for every transition
  useEffect(() => {
    if (!DEBUG_VOICE) return;
    dbg('conversation.status changed →', conversation.status);
  }, [conversation.status]);

  // Watch sessionStarted state
  useEffect(() => {
    if (!DEBUG_VOICE) return;
    dbg('sessionStarted state changed →', sessionStarted);
  }, [sessionStarted]);

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
    toggle,
    agentId,
  };
}
