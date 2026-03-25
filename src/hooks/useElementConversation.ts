import { useCallback, useEffect, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { Element } from '../types/element';
import { categoryLabels } from '../utils/colors';
import { elements } from '../data/elements';
import { getVideoEntry } from '../data/videoManifest';
import { getRadioactivity } from '../utils/elementDerived';
import { getReactivity } from '../utils/elementDerived';
import { DEFAULT_VIEW_MODE, getAtomConfig, getValenceIndices, type AtomViewMode, type OrbitalFilter } from '../components/atom/atomConfig';

interface ConversationCallbacks {
  onNavigate: (element: Element) => void;
  onGoBack: () => void;
  onSetAtomViewMode: (mode: AtomViewMode) => void;
}

export type VoiceStatus = 'off' | 'connecting' | 'connected' | 'error';
export type MicError = 'timeout' | 'not-allowed' | 'device' | 'no-input' | null;

function getDensityContext(density: number): string {
  if (density < 0.01) return 'So light it floats in air';
  if (density < 1) return 'Floats on water';
  if (density < 3) return 'A bit heavier than water';
  if (density < 8) return 'About as dense as common metals';
  if (density < 12) return 'Heavier than iron';
  if (density < 18) return 'Heavier than lead';
  return 'One of the densest things on Earth';
}

function buildElementContext(element: Element): string {
  const video = getVideoEntry(element.atomicNumber);
  const { level: radioLevel } = getRadioactivity(element);
  const { label: reactLabel, description: reactDesc } = getReactivity(element);
  const mpC = element.meltingPoint != null ? Math.round(element.meltingPoint - 273) : null;
  const bpC = element.boilingPoint != null ? Math.round(element.boilingPoint - 273) : null;
  const roomPhase = element.meltingPoint != null && element.meltingPoint > 293 ? 'solid'
    : element.boilingPoint != null && element.boilingPoint > 293 ? 'liquid' : 'gas';

  const parts = [
    `[ELEMENT CLICK] The child just clicked on ${element.name} (symbol: ${element.symbol}, atomic number: ${element.atomicNumber}).`,
    `It is a ${categoryLabels[element.category]}. Atomic mass: ${element.atomicMass.toFixed(2)} u.`,
    `Electron configuration: ${element.electronConfiguration}.`,
    `Appearance: ${element.appearance || 'unknown'}.`,
    '',
    `[WHAT THE CHILD SEES ON SCREEN]`,
    `LEFT SIDE:`,
    `- A spinning 3D atom model showing ${element.symbol}'s electron orbitals.`,
    `  You can control the atom view with these tools:`,
    `  - show_valence_electrons: highlights just the outermost electrons, dims inner shells`,
    `  - show_orbital_type: shows only s, p, d, or f orbitals to reveal their shapes`,
    `  - show_unfilled_orbitals: shows ghost electrons in empty valence slots (explains reactivity!)`,
    `  - reset_atom_view: returns to normal view`,
    `  Proactively use these when explaining reactivity, bonding, or orbital shapes!`,
    `- Element identity: #${element.atomicNumber} ${element.symbol} ${element.name} (${categoryLabels[element.category]})`,
  ];

  // Phase diagram
  if (element.meltingPoint != null) {
    parts.push(
      `- An interactive phase diagram showing when ${element.name} is solid, liquid, or gas at different temperatures and pressures.`,
      `  At room temperature (20°C, 1 atm), ${element.name} is a ${roomPhase}.`,
      mpC != null ? `  Melting point: ${mpC}°C.` : '',
      bpC != null ? `  Boiling point: ${bpC}°C.` : '',
      `  The child can drag sliders to change temperature and pressure and see the phase change.`,
    );
  }

  parts.push('', `RIGHT SIDE:`);

  // Video or photo
  if (video) {
    parts.push(
      `- VIDEO (playing right now): "${video.description}"`,
      `  IMPORTANT: Describe THIS specific video to the child, not what you think the element generally looks like. The video shows exactly what is described above.`,
    );
  } else {
    parts.push(`- A photograph of ${element.name} from Wikipedia showing what it looks like.`);
  }

  // Density
  if (element.density != null) {
    parts.push(`- Density card: ${element.density} g/cm³ — ${getDensityContext(element.density)}.`);
  }

  // Stability
  const radioLabels: Record<string, string> = {
    stable: 'Stable — atoms stay together',
    mildly: 'Radioactive — some atoms slowly break apart over time',
    highly: 'Highly Radioactive — atoms are very unstable and break apart quickly',
  };
  parts.push(`- Stability card: ${radioLabels[radioLevel]}.`);

  // Reactivity
  parts.push(`- Reactivity card: ${reactLabel} — ${reactDesc}.`);

  // Electronegativity
  if (element.electronegativity != null) {
    parts.push(`- Electronegativity: ${element.electronegativity}.`);
  }

  // Fun facts
  // Summary
  parts.push('', `[ABOUT THIS ELEMENT]`, element.summary);

  parts.push('', `[FUN FACTS shown on screen]`);
  element.funFacts.forEach((fact, i) => parts.push(`${i + 1}. ${fact}`));

  // Discovery
  parts.push('', `Discovered by ${element.discoveredBy} (${element.yearDiscovered}).`);

  parts.push('', `Get excited about ${element.name} and tell the child about what they're seeing! Reference the visuals — the video, the phase diagram, the atomic model.`);

  return parts.filter(Boolean).join('\n');
}

/**
 * Persistent voice agent at App level.
 * Starts immediately on page load — greets the kid on the periodic table.
 * Element clicks are sent as contextual updates.
 */
export function useElementConversation({ onNavigate, onGoBack, onSetAtomViewMode }: ConversationCallbacks) {
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;
  const [sessionStarted, setSessionStarted] = useState(false);
  const [micError, setMicError] = useState<MicError>(null);
  const pendingElementRef = useRef<Element | null>(null);
  const currentElementRef = useRef<number | null>(null);
  const inputVolumeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      show_valence_electrons: () => {
        if (!currentElementRef.current) return "No element is open right now — ask them to click one first!";
        onSetAtomViewMode({ valenceOnly: true, orbitalFilter: null, showUnfilled: false });
        const el = elements.find(e => e.atomicNumber === currentElementRef.current);
        if (!el) return "Showing valence electrons";
        const config = getAtomConfig(el.atomicNumber);
        const valence = getValenceIndices(config.subshells);
        const parts = [...valence].map(i => {
          const s = config.subshells[i];
          return `${s.n}${s.type}${s.electronCount}`;
        });
        return `Now showing valence electrons for ${el.name}: ${parts.join(', ')}. Inner shells are dimmed.`;
      },
      show_orbital_type: (params: { type: string }) => {
        if (!currentElementRef.current) return "No element is open right now — ask them to click one first!";
        const t = params.type as OrbitalFilter;
        if (!['s', 'p', 'd', 'f'].includes(t!)) return `Invalid orbital type "${params.type}". Use s, p, d, or f.`;
        onSetAtomViewMode({ valenceOnly: false, orbitalFilter: t, showUnfilled: false });
        const el = elements.find(e => e.atomicNumber === currentElementRef.current);
        const shapes: Record<string, string> = {
          s: 'spherical (circular)',
          p: 'dumbbell (figure-8) with 3 orientations',
          d: 'cloverleaf with 5 orientations',
          f: 'complex multi-lobed with 7 orientations',
        };
        return `Now showing only ${t} orbitals for ${el?.name ?? 'this element'}. ${t} orbitals are ${shapes[t!] ?? ''} shaped.`;
      },
      show_unfilled_orbitals: () => {
        if (!currentElementRef.current) return "No element is open right now — ask them to click one first!";
        onSetAtomViewMode({ valenceOnly: true, orbitalFilter: null, showUnfilled: true });
        const el = elements.find(e => e.atomicNumber === currentElementRef.current);
        if (!el) return "Showing unfilled orbitals";
        const config = getAtomConfig(el.atomicNumber);
        const valence = getValenceIndices(config.subshells);
        const unfilled = [...valence]
          .map(i => config.subshells[i])
          .filter(s => s.electronCount < s.maxElectrons)
          .map(s => `${s.n}${s.type}: ${s.electronCount}/${s.maxElectrons}`);
        if (unfilled.length === 0) return `${el.name} has all valence shells full — it's very stable (noble gas configuration)!`;
        return `Now showing unfilled orbitals for ${el.name}. Ghost electrons show empty slots: ${unfilled.join(', ')}. These empty spots explain its chemical reactivity!`;
      },
      reset_atom_view: () => {
        onSetAtomViewMode(DEFAULT_VIEW_MODE);
        return "Reset atom view to show all electrons normally.";
      },
    },
    onConnect: () => {
      // If an element was clicked before connection completed, send it now
      if (pendingElementRef.current) {
        const ctx = buildElementContext(pendingElementRef.current);
        conversation.sendContextualUpdate(ctx);
        currentElementRef.current = pendingElementRef.current.atomicNumber;
        pendingElementRef.current = null;
      }
    },
    onError: (error: unknown) => {
      console.error('[VoiceAgent] session error:', error);
    },
  });

  // Poll input volume after connecting to detect silent/wrong input device
  useEffect(() => {
    if (conversation.status !== 'connected') {
      if (inputVolumeIntervalRef.current !== null) {
        clearInterval(inputVolumeIntervalRef.current);
        inputVolumeIntervalRef.current = null;
      }
      return;
    }

    const startedAt = Date.now();
    const POLL_DURATION_MS = 10_000;
    const POLL_INTERVAL_MS = 500;

    inputVolumeIntervalRef.current = setInterval(() => {
      const volume = conversation.getInputVolume();
      if (volume > 0) {
        clearInterval(inputVolumeIntervalRef.current!);
        inputVolumeIntervalRef.current = null;
        return;
      }
      if (Date.now() - startedAt >= POLL_DURATION_MS) {
        clearInterval(inputVolumeIntervalRef.current!);
        inputVolumeIntervalRef.current = null;
        setMicError('no-input');
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (inputVolumeIntervalRef.current !== null) {
        clearInterval(inputVolumeIntervalRef.current);
        inputVolumeIntervalRef.current = null;
      }
    };
  }, [conversation.status]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Toggle session on/off — must be called from a user gesture (click) */
  const toggle = useCallback(async () => {
    if (!agentId) return;

    // If connected, disconnect
    if (sessionStarted) {
      await conversation.endSession().catch(() => {});
      setSessionStarted(false);
      return;
    }

    // Acquire mic permission NOW while the user gesture is still valid.
    // The ElevenLabs SDK calls getUserMedia internally, but by the time it
    // gets there Chrome's gesture allowance has expired and the prompt is
    // suppressed (getUserMedia hangs forever). By acquiring+releasing the
    // mic here, the permission state becomes 'granted' so the SDK's own
    // getUserMedia call resolves immediately without needing a gesture.
    try {
      const micPromise = navigator.mediaDevices.getUserMedia({ audio: true });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new DOMException('getUserMedia timed out', 'TimeoutError')), 5_000)
      );
      const tempStream = await Promise.race([micPromise, timeoutPromise]);
      tempStream.getTracks().forEach(t => t.stop());
    } catch (err) {
      const error = err as DOMException;
      if (error.name === 'TimeoutError') {
        setMicError('timeout');
      } else if (error.name === 'NotAllowedError') {
        setMicError('not-allowed');
      } else {
        setMicError('device');
      }
      return;
    }

    setSessionStarted(true);

    try {
      await conversation.startSession({
        agentId,
        connectionType: 'websocket',
      });
    } catch (err) {
      console.error('[VoiceAgent] startSession failed:', err);
      setSessionStarted(false);
    }
  }, [agentId, sessionStarted, conversation]);

  const clearMicError = useCallback(() => {
    setMicError(null);
  }, []);

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
    micError,
    clearMicError,
    notifyElementChange,
    notifyElementClosed,
    toggle,
    agentId,
  };
}
