import { createEffect, createRenderEffect, on } from 'solid-js';
import { getFlippedElementPositionsBeforeUpdate, onFlipKeyUpdate } from 'flip-toolkit';

import { FlipContext, PortalContext } from './FlipperContext';
import { Show } from 'solid-js';

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
  staggerConfig?: FlipToolkitFlipperProps['staggerConfig'],
};

export const Flipper = <T = unknown>(props: FlipperProps<T>) => {
  const FlipperElement = props.element ?? 'div';
  const elem = (
    <FlipperElement class={props.class}>
      {props.children}
    </FlipperElement>
  ) as HTMLElement;

  let cachedData: CachedData | null = null;
  let lastDecisionData = props.decisionData;
  const flipCallbacks: FlipCallbacks = {};
  const inProgressAnimations: InProgressAnimations = {};

  createRenderEffect(on(() => props.flipKey, () => {
    if (!elem) {
      return;
    }

    cachedData = getFlippedElementPositionsBeforeUpdate({
      element: elem,
      flipCallbacks,
      inProgressAnimations,
      portalKey: props.portalKey,
    });
  }));

  createEffect(on(() => props.flipKey, () => {
    if (!elem || !cachedData) {
      return;
    }

    onFlipKeyUpdate({
      flippedElementPositionsBeforeUpdate: cachedData.flippedElementPositions,
      cachedOrderedFlipIds: cachedData.cachedOrderedFlipIds,
      containerEl: elem,
      inProgressAnimations,
      flipCallbacks,
      applyTransformOrigin: props.applyTransformOrigin,
      spring: props.spring,
      debug: props.debug,
      portalKey: props.portalKey,
      staggerConfig: props.staggerConfig,
      handleEnterUpdateDelete: props.handleEnterUpdateDelete,
      decisionData: {
        previous: lastDecisionData,
        current: props.decisionData
      },
      onComplete: props.onComplete,
      onStart: props.onStart
    });

    lastDecisionData = props.decisionData;
  }));

  const markup = (
    <FlipContext.Provider value={flipCallbacks}>
      {elem}
    </FlipContext.Provider>
  );

  return (
    <Show when={props.portalKey} fallback={markup}>
      {portalKey => (
        <PortalContext.Provider value={portalKey()}>
          {markup}
        </PortalContext.Provider>
      )}
    </Show>
  );
};

