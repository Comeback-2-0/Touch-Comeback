import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {Comment} from '../navigation/types/Post';
import ReplyList from './ReplyList';
import dayjs from 'dayjs';
import {pastelColors} from '../theme/colors';

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
      {comment.createdAt ? (
        <Text style={styles.date}>{dayjs(comment.createdAt).format('MMM D, YYYY')}</Text>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Like comment, ${comment.likes || 0}`}
          onPress={onLike}
          style={styles.actionButton}>
          <Feather name="thumbs-up" size={20} color={pastelColors.auth.deepText} />
          <Text style={styles.count}>{comment.likes || 0}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Dislike comment, ${comment.dislikes || 0}`}
          onPress={onDislike}
          style={styles.actionButton}>
          <Feather name="thumbs-down" size={20} color={pastelColors.auth.deepText} />
          <Text style={styles.count}>{comment.dislikes || 0}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Report comment"
          onPress={onReport}
          style={styles.actionButton}>
          <Feather name="flag" size={20} color={pastelColors.auth.mutedText} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reply"
          onPress={onReply}
          style={styles.actionButton}>
          <Feather name="corner-up-left" size={20} color={pastelColors.auth.mutedText} />
          <Text style={styles.count}>Reply</Text>
        </Pressable>
        {comment.replies && comment.replies.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowReplies(!showReplies)}
            style={styles.actionButton}>
            <Text style={styles.repliesToggle}>
              {showReplies ? 'Hide' : 'View'} {comment.replies.length} replies
            </Text>
          </Pressable>
        ) : null}
      </View>

      {showReplies && comment.replies ? <ReplyList replies={comment.replies} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: pastelColors.white,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: pastelColors.auth.deepText,
    fontWeight: '600',
  },
  date: {
    marginTop: 4,
    fontSize: 11,
    color: pastelColors.auth.mutedText,
    fontWeight: '700',
  },
  actions: {
    marginTop: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  actionButton: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  count: {
    fontSize: 12,
    fontWeight: '800',
    color: pastelColors.auth.mutedText,
  },
  repliesToggle: {
    color: pastelColors.accent,
    fontWeight: '800',
  },
});
