import { EmojiAction } from "./emoji/actions";
import emojiReducer from "./emoji/emojiReducer";
import { State } from "./types";

type Actions = Parameters<typeof emojiReducer>[1];

const INITIAL_STATE: State = {
  emojis: {}
};

export default function rootReducer(
  state: State = INITIAL_STATE,
  action: Actions
) {
  const newEmojis = emojiReducer(state.emojis, action as EmojiAction);

  if (state.emojis === newEmojis) {
    return state;
  }

  return {
    emojis: newEmojis
  };
}
