export interface Reel {
  id: string;
  uri: string;
  caption: string;
  user: string;
  mood: string;
  createdAt: Date;
}

export interface MoodFeed {
  mood: string;
  reels: Reel[];
}

export type ChatStackParamList = {
  GroupList: undefined;
  GroupChatScreen: { group: { id: string; name: string; members: number } };
};
