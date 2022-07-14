import {
  ActionCreatorBuilder,
  AllActions,
  FilterAction,
  SimpleCreator,
  SIMPLE_ACTION_CREATOR
} from "../buildCreators";

const builder = new ActionCreatorBuilder("emoji", "isEmojiAction");

const creators = builder.createCreatorDescriptor({
  addEmoji: SIMPLE_ACTION_CREATOR as SimpleCreator<{
    id: string;
    emoji: string;
    x: number;
    y: number;
  }>,
  moveEmoji: SIMPLE_ACTION_CREATOR as SimpleCreator<{
    id: string;
    x: number;
    y: number;
  }>
});

const emojiCreators = builder.createCreators(creators, {});

export type EmojiAction = AllActions<typeof creators>;
export type FilterEmojiActions<
  Type extends keyof typeof creators
> = FilterAction<typeof creators, Type>;

export default emojiCreators;
