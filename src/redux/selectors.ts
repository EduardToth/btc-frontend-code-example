import _ from "lodash";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { State } from "./types";

// base selectors
const getEmojis = (state: State) => state.emojis;

// selector creators
const createGetEmoji = (id: string) => (state: State) => state.emojis[id];

// reselect selectors
const getEmojiIds = createSelector(getEmojis, (emojis) =>
  Object.keys(emojis).sort()
);

// hooks
export function useEmojiIds() {
  return useSelector<State, string[]>(getEmojiIds, _.isEqual);
}

export function useEmoji(id: string) {
  return useSelector(createGetEmoji(id));
}
