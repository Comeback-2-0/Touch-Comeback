// app/navigation/types/Post.ts
export type Post = {
  _id: string;
  groupId: string;
  content: string;
  isQueued: boolean;
  likes: number;
  dislikes?: number;       
  votes: number;
  comments: Comment[];
  image?: string;
  approvedAt: string;
  createdAt: string;
};

export type Comment = {
  _id: string;
  userId: string;
  text: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  likedBy?: string[];
  dislikedBy?: string[];
  replies?: Reply[];
};

export type Reply = {
  _id?: string;
  userId: string;
  text: string;
  createdAt?: string;
};