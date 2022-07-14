import emojiCreators, { EmojiAction, FilterEmojiActions } from "./actions";
import { Emoji, EmojiState } from "./types";

function singleEmojiReducer(
  emoji: Emoji,
  action: FilterEmojiActions<
    Exclude<keyof typeof emojiCreators.types, "addEmoji">
  >
): Emoji {
  switch (action.type) {
    case emojiCreators.types.moveEmoji:
      return {
        ...emoji,
        x: action.x,
        y: action.y
      };

    default:
      return emoji;
  }
}

export default function emojiReducer(
  emojis: EmojiState = {},
  action: EmojiAction
): EmojiState {
  if (!emojiCreators.isEmojiAction(action)) {
    return emojis;
  }

  switch (action.type) {
    case emojiCreators.types.addEmoji:
      if (action.id in emojis) {
        return emojis;
      }
      return {
        ...emojis,
        [action.id]: {
          emoji: action.emoji,
          x: action.x,
          y: action.y
        }
      };

    default:
      if (!(action.id in emojis)) {
        return emojis;
      }
      return {
        ...emojis,
        [action.id]: singleEmojiReducer(emojis[action.id], action)
      };
  }
}
