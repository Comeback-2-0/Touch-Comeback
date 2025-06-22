// app/types/Post.ts
export type Comment = {
  id: string;
  user: string;
  text: string;
};

export type Post = {
  id: string;
  content: string;
  likes: number;
  comments: Comment[];
};
