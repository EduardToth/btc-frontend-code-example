export interface Emoji {
  emoji: string;
  x: number;
  y: number;
}

export interface EmojiState {
  [id: string]: Emoji;
}
