// app/components/CommentList.tsx
import React from 'react';
import { FlatList, View } from 'react-native';
import CommentBubble from './CommentBubble';
import { Comment } from '../navigation/types/Post';

type Props = {
  comments: Comment[];
  onReply: (comment: Comment) => void;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  onReport: (commentId: string) => void;
};

export default function CommentList({ comments, onReply, onLike, onDislike, onReport }: Props) {
  return (
    <FlatList
      data={comments}
      keyExtractor={item => item._id}
      renderItem={({ item }) => (
        <CommentBubble
          comment={item}
          onReply={() => onReply(item)}
          onLike={() => onLike(item._id)}
          onDislike={() => onDislike(item._id)}
          onReport={() => onReport(item._id)}
        />
      )}
      removeClippedSubviews={false}
    />
  );
}