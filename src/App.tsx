import React from "react";
import styled from "styled-components";
import { useUpdatingCallbacks } from "use-updating-callbacks";
import store, { dispatch } from "./redux/store";
import { v4 as uuid } from "uuid";
import emojiCreators from "./redux/emoji/actions";
import _ from "lodash";
import { useEmojiIds } from "./redux/selectors";
import Emoji from "./Emoji";

/**
 * Links:
 *     React (with hooks): https://www.youtube.com/watch?v=hQAHSlTtcmY
 *     Styled components: https://styled-components.com/ (In this example project you can see that we don't use styled components as prominently described on their website, but an approach described as "advanced")
 *     Redux: https://redux.js.org/
 *     React-Redux with hooks: https://thoughtbot.com/blog/using-redux-with-react-hooks
 *     Reselect (High order selectors for redux): https://github.com/reduxjs/reselect
 *     Framer Motion: https://www.framer.com/motion/
 *     Updating callbacks (callback organization): https://www.npmjs.com/package/use-updating-callbacks
 */

/**
 * Possible extensions:
 *
 * 1. Allow deleting emojis
 * 2. Move emojis via drag & drop
 * 3. Implement a chooser for what emoji should be added next
 * 4. Add a "remove all" button (that also works :))
 * 5. Add additional animations
 * 6. Write tests for reducers
 * 7. ...
 */

const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "🤣",
  "😂",
  "🙂",
  "🙃",
  "😉",
  "😊",
  "😇",
];

store.subscribe(() => {
  console.log("State changed", store.getState());
});

function App({ ...otherProps }) {
  const callbacks = useUpdatingCallbacks({
    onClick(event: React.MouseEvent<HTMLDivElement>) {
      if (event.target !== event.currentTarget) {
        return;
      }

      dispatch(
        emojiCreators.addEmoji({
          id: uuid(),
          emoji: _.sample(EMOJIS)!,
          x: event.clientX,
          y: event.clientY,
        })
      );
    },
  });

  const emojiIds = useEmojiIds();

  return (
    <div {...otherProps} onDoubleClick={callbacks.onClick}>
      <div className="hint">Double click somewhere to create an emoji.</div>
      {emojiIds.map((id) => (
        <Emoji key={id} id={id} />
      ))}
    </div>
  );
}

export default styled(App)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: grid;
  place-items: center;

  .hint {
    font-size: 1.5rem;
    font-weight: bold;
    color: lightgray;
    pointer-events: none;
    user-select: none;
  }

  ${Emoji} {
    position: absolute;
  }
`;
