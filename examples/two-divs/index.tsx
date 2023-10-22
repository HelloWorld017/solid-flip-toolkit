import { createSignal, Show } from 'solid-js';
import { render } from 'solid-js/web';
import { Flipper, Flipped } from 'solid-flip-toolkit';

const sheet = new CSSStyleSheet();
sheet.insertRule(`
  * {
    box-sizing: border-box;
  }
`);

sheet.insertRule(`
  body {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
`);

sheet.insertRule(`
  .square {
    width: 5rem;
    height: 5rem;
    cursor: pointer;
    background-image: linear-gradient(
      45deg,
      rgb(121, 113, 234),
      rgb(97, 71, 182)
    );
  }
`);

const Square = ({ toggleFullScreen }: { toggleFullScreen: () => void }) => (
  <Flipped flipId="square">{props => <div class="square" onClick={toggleFullScreen} {...props()} />}</Flipped>
);

sheet.insertRule(`
  .full-screen-square {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    background-image: linear-gradient(
      45deg,
      rgb(121, 113, 234),
      rgb(97, 71, 182)
    );
  }
`);
const FullScreenSquare = ({ toggleFullScreen }: { toggleFullScreen: () => void }) => (
  <Flipped flipId="square">
    {props => <div class="full-screen-square" onClick={toggleFullScreen} {...props()} />}
  </Flipped>
);

const AnimatedSquare = () => {
  const [fullScreen, setFullScreen] = createSignal(false);
  const toggleFullScreen = () => setFullScreen(prevState => !prevState);

  return (
    <>
      <Flipper flipKey={fullScreen()}>
        {fullScreen() ? (
          <FullScreenSquare toggleFullScreen={toggleFullScreen} />
        ) : (
          <Square toggleFullScreen={toggleFullScreen} />
        )}
      </Flipper>
      {/*
      <Flipper flipKey={fullScreen()}>
        <Show when={fullScreen()} fallback={<Square toggleFullScreen={toggleFullScreen} />}>
          <FullScreenSquare toggleFullScreen={toggleFullScreen} />
        </Show>
      </Flipper>
      */}
    </>
  );
};

const div = document.createElement('div');
document.body.appendChild(div);
document.adoptedStyleSheets = [sheet];
render(() => <AnimatedSquare />, div);
