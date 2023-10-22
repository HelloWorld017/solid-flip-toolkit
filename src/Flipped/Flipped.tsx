import { constants } from 'flip-toolkit';
import { createRenderEffect, splitProps, useContext, Show } from 'solid-js';

import { FlipContext, PortalContext } from '../Flipper';

import type { SerializableFlippedProps } from 'flip-toolkit/lib/types';
import type { Accessor, JSX } from 'solid-js';

type DecisionData<T> = { previous?: T; current?: T };
type CallbackFlippedProps<T> = {
  onStart?: (element: HTMLElement, decisionData?: DecisionData<T>) => void;
  onStartImmediate?: (element: HTMLElement, decisionData?: DecisionData<T>) => void;
  onComplete?: (element: HTMLElement, decisionData?: DecisionData<T>) => void;
  onSpringUpdate?: (springValue: number) => void;
  onAppear?: (element: HTMLElement, index: number, decisionData?: DecisionData<T>) => void;
  onExit?: (element: HTMLElement, index: number, removeElement: () => void, decisionData?: DecisionData<T>) => void;
  shouldFlip?: (previousDecisionData: T, currentDecisionData: T) => boolean;
  shouldInvert?: (previousDecisionData: T, currentDecisionData: T) => boolean;
};

type PropAttrs = object;
type FlippedProps<T> = Omit<SerializableFlippedProps, 'children'> &
  CallbackFlippedProps<T> & { children: (props: Accessor<PropAttrs>) => JSX.Element };

const FlippedRenderer = <T = unknown,>(props: FlippedProps<T>) => {
  const isDefaultAnimatedProperty = () => !props.scale && !props.translate && !props.opacity;
  const dataAttributes = () =>
    ({
      [constants.DATA_FLIP_CONFIG]: JSON.stringify({
        ...props,
        ...(isDefaultAnimatedProperty() && { scale: true, translate: true, opacity: true }),
      }),
      ...(props.flipId && { [constants.DATA_FLIP_ID]: String(props.flipId) }),
      ...(props.inverseFlipId && { [constants.DATA_INVERSE_FLIP_ID]: String(props.inverseFlipId) }),
      ...(props.portalKey && { [constants.DATA_PORTAL_KEY]: String(props.portalKey) }),
    }) as PropAttrs;

  return <>{props.children(dataAttributes)}</>;
};

export const Flipped = <T = unknown,>(props: FlippedProps<T>) => {
  const [, passedProps] = splitProps(props, [
    'children',
    'shouldFlip',
    'shouldInvert',
    'onAppear',
    'onStart',
    'onStartImmediate',
    'onComplete',
    'onExit',
    'onSpringUpdate',
  ]);

  const flip = useContext(FlipContext);
  const portalKey = useContext(PortalContext);

  createRenderEffect(() => {
    const { flipId, inverseFlipId } = props;
    if (inverseFlipId) {
      return () => {};
    }

    if (!flip || !flipId) {
      return () => {};
    }

    flip[flipId] = {
      shouldFlip: props.shouldFlip,
      shouldInvert: props.shouldInvert,
      onAppear: props.onAppear,
      onStart: props.onStart,
      onStartImmediate: props.onStartImmediate,
      onComplete: props.onComplete,
      onExit: props.onExit,
      onSpringUpdate: props.onSpringUpdate,
    };

    return () => {
      delete flip[flipId];
    };
  });

  return (
    <Show when={!props.inverseFlipId} fallback={<FlippedRenderer {...passedProps}>{props.children}</FlippedRenderer>}>
      <FlippedRenderer flipId={props.flipId} portalKey={portalKey} {...passedProps}>
        {props.children}
      </FlippedRenderer>
    </Show>
  );
};
