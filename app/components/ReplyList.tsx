// app/components/ReplyList.tsx
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ReplyBubble from './ReplyBubble';
import { Comment } from '../navigation/types/Post';

type Props = {
  replies: Comment['replies'];
};

export default function ReplyList({ replies = [] }: Props) {
  return (
    <FlatList
      data={replies}
      keyExtractor={(item, index) => item._id || `reply-${index}`}
      renderItem={({ item }) => <ReplyBubble reply={item} />}
      inverted //  Open from bottom and scroll up
      contentContainerStyle={styles.content}
      style={styles.list}
      removeClippedSubviews={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    paddingHorizontal: 12,
  },
  content: {
    paddingBottom: 0,
    paddingTop: 10
  },
});
