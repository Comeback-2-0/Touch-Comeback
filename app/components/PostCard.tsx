// app/components/PostCard.tsx
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {Post} from '../navigation/types/Post';
import dayjs from 'dayjs';

type Props = {
  post: Post;
  onReport?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onShare?: () => void;
  onOpenComments?: () => void;
  minimal?: boolean;
};

const PostCard: React.FC<Props> = ({
  post,
  onReport,
  onLike,
  onDislike,
  onShare,
  onOpenComments,
  minimal = false,
}) => {
  return (
    <View style={[styles.card, minimal && styles.minimalCard]}>
      {/* Top Row */}
      {!minimal && (
        <View style={styles.topRow}>
          <Text style={styles.date}>
            {dayjs(post.approvedAt).format('MMM D, YYYY')}
          </Text>
          <TouchableOpacity onPress={onReport}>
            <Text style={styles.menu}>⋮</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>
      {post.image && (
        <View
          style={[
            styles.imageContainer,
            minimal && {marginBottom: 0},
          ]}>
          <Image
            source={{uri: post.image}}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Footer Row */}
      {!minimal && (
        <View style={styles.footer}>
          <TouchableOpacity onPress={onLike}>
            <Text style={styles.icon}>❤️ {post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDislike}>
            <Text style={styles.icon}>👎 {post.dislikes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onShare}>
            <Text style={styles.icon}>↗️ SHARE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Comments */}
      {!minimal && (
        <TouchableOpacity
          onPress={onOpenComments}
          style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>
            💬 Comments {post.comments.length}
          </Text>
          {post.comments.length > 0 && (
            <Text style={styles.topComment} numberOfLines={2}>
              {post.comments[0].text}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding:16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  minimalCard: {
  marginBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    color: '#888',
    fontSize: 12,
  },
  menu: {
    fontSize: 18,
    color: '#444',
  },
  content: {
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  icon: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  },
  commentsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  commentsTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  topComment: {
    color: '#555',
    fontSize: 13,
  },
});

export default PostCard;
