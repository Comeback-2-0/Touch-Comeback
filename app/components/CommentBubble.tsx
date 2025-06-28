// app/components/CommentBubble.tsx
import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Comment} from '../navigation/types/Post';
import ReplyList from './ReplyList';
import dayjs from 'dayjs';

type Props = {
  comment: Comment;
  onReply: () => void;
  onLike: () => void;
  onDislike: () => void;
  onReport: () => void;
};

export default function CommentBubble({
  comment,
  onReply,
  onLike,
  onDislike,
  onReport,
}: Props) {
  const [showReplies, setShowReplies] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{comment.text}</Text>
      <Text style={styles.date}>
        {comment.createdAt && (
          <Text style={styles.date}>
            {dayjs(comment.createdAt).format('MMM D, YYYY')}
          </Text>
        )}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onLike} style={styles.actionButton}>
          <Text>❤️ {comment.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDislike} style={styles.actionButton}>
          <Text>👎 {comment.dislikes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onReport} style={styles.actionButton}>
          <Text>🏳️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onReply} style={styles.actionButton}>
          <Text>💬 Reply</Text>
        </TouchableOpacity>
        {comment.replies && comment.replies.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowReplies(!showReplies)}
            style={styles.actionButton}>
            <Text style={styles.repliesToggle}>
              {showReplies ? 'Hide' : `View`} {comment.replies.length} replies
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showReplies && comment.replies && (
        <ReplyList replies={comment.replies} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#222',
  },
  date: {
    fontSize: 11,
    color: '#777',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: 4,
    marginRight: 8,
  },
  repliesToggle: {
    color: '#007bff',
    marginLeft: 8,
  },
});
