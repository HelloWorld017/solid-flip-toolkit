import { getFlippedElementPositionsBeforeUpdate, onFlipKeyUpdate } from 'flip-toolkit';
import { createEffect, createRenderEffect, on, Show } from 'solid-js';

import { FlipContext, PortalContext } from './FlipperContext';

import type {
  FlipCallbacks,
  FlipperProps as FlipToolkitFlipperProps,
  InProgressAnimations,
} from 'flip-toolkit/lib/types';
import type { JSX } from 'solid-js';

type CachedData = ReturnType<typeof getFlippedElementPositionsBeforeUpdate>;

type FlipperProps<T> = {
  flipKey: string | number | boolean;

  applyTransformOrigin?: boolean;
  debug?: boolean;
  class?: string;
  children: JSX.Element;
  decisionData?: T;
  element?: keyof JSX.IntrinsicElements;
  handleEnterUpdateDelete?: FlipToolkitFlipperProps['handleEnterUpdateDelete'];
  onStart?: FlipToolkitFlipperProps['onStart'];
  onComplete?: FlipToolkitFlipperProps['onComplete'];
  portalKey?: string;
  spring?: FlipToolkitFlipperProps['spring'];
  staggerConfig?: FlipToolkitFlipperProps['staggerConfig'];
};

export const Flipper = <T = unknown,>(props: FlipperProps<T>) => {
  const elem = (<div class={props.class}>{props.children}</div>) as HTMLElement;

  let isInitialized = false;
  let cachedData: CachedData | null = null;
  let lastDecisionData = props.decisionData;
  const flipCallbacks: FlipCallbacks = {};
  const inProgressAnimations: InProgressAnimations = {};

  createRenderEffect(
    on(
      () => props.flipKey,
      () => {
        if (!isInitialized) {
          isInitialized = true;
          return;
        }

        if (!elem) {
          return;
        }

        cachedData = getFlippedElementPositionsBeforeUpdate({
          element: elem,
          flipCallbacks,
          inProgressAnimations,
          portalKey: props.portalKey,
        });
      },
    ),
  );

  createEffect(
    on(
      () => props.flipKey,
      () => {
        if (!elem || !cachedData) {
          return;
        }

        onFlipKeyUpdate({
          flippedElementPositionsBeforeUpdate: cachedData.flippedElementPositions,
          cachedOrderedFlipIds: cachedData.cachedOrderedFlipIds,
          containerEl: elem,
          inProgressAnimations,
          flipCallbacks,
          applyTransformOrigin: props.applyTransformOrigin ?? true,
          spring: props.spring,
          debug: props.debug,
          portalKey: props.portalKey,
          staggerConfig: props.staggerConfig,
          handleEnterUpdateDelete: props.handleEnterUpdateDelete,
          decisionData: {
            previous: lastDecisionData,
            current: props.decisionData,
          },
          onComplete: props.onComplete,
          onStart: props.onStart,
        });

        lastDecisionData = props.decisionData;
        cachedData = null;
      },
    ),
  );

  const markup = <FlipContext.Provider value={flipCallbacks}>{elem}</FlipContext.Provider>;

  return (
    <Show when={props.portalKey} fallback={markup}>
      {portalKey => <PortalContext.Provider value={portalKey()}>{markup}</PortalContext.Provider>}
    </Show>
  );
};
