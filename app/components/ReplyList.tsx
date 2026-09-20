import React from 'react';
import {StyleSheet, View} from 'react-native';
import ReplyBubble from './ReplyBubble';
import {Comment} from '../navigation/types/Post';

type Props = {
  replies: Comment['replies'];
};

export default function ReplyList({replies = []}: Props) {
  return (
    <View style={styles.list}>
      {replies.map((item, index) => (
        <ReplyBubble key={item._id || `reply-${index}`} reply={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 8,
  },
});
