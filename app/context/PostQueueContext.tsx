// PostQueueContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { Post } from '../navigation/types/Post';

type PostQueueContextType = {
  queue: Post[];
  addPostToQueue: (post: Post) => void;
  removePostFromQueue: (id: string) => void; // ✅ Include this
};

const PostQueueContext = createContext<PostQueueContextType | null>(null);

export const PostQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<Post[]>([]);

  const addPostToQueue = (post: Post) => {
    setQueue((prev) => [...prev, post]);
  };

  const removePostFromQueue = (id: string) => {
    setQueue((prev) => prev.filter((post) => post._id !== id));
  };

  return (
    <PostQueueContext.Provider value={{ queue, addPostToQueue, removePostFromQueue }}>
      {children}
    </PostQueueContext.Provider>
  );
};

export const usePostQueue = () => {
  const context = useContext(PostQueueContext);
  if (!context) throw new Error("usePostQueue must be used within PostQueueProvider");
  return context;
};
