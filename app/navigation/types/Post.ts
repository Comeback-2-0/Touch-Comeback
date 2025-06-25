// app/navigation/types/Post.ts
export type Post = {
  _id: string;
  groupId: string;
  content: string;
  isQueued: boolean;
  likes: number;
  votes: number;
  comments: Comment[];
  approvedAt?: string;
  createdAt: string;
};

export type Comment = {
  _id: string;
  userId: string;
  text: string;
  replies?: {
    _id?: string;
    userId: string;
    text: string;
    createdAt?: string;
  }[];
};
