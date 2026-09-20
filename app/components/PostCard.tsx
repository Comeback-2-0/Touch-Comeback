// app/components/PostCard.tsx
import React from 'react';
import {Pressable, StyleSheet, Text, View, Image} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {Post} from '../navigation/types/Post';
import dayjs from 'dayjs';
import {pastelColors} from '../theme/colors';

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
          <Pressable onPress={onReport} accessibilityRole="button" accessibilityLabel="Post options">
            <Feather name="more-vertical" size={18} color={pastelColors.auth.deepText} />
          </Pressable>
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
          <Pressable onPress={onLike} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Like post">
            <Feather name="thumbs-up" size={18} color={pastelColors.auth.deepText} />
            <Text style={styles.icon}>{post.likes}</Text>
          </Pressable>
          <Pressable onPress={onDislike} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Dislike post">
            <Feather name="thumbs-down" size={18} color={pastelColors.auth.deepText} />
            <Text style={styles.icon}>{post.dislikes || 0}</Text>
          </Pressable>
          <Pressable onPress={onShare} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Share post">
            <Feather name="share-2" size={18} color={pastelColors.auth.deepText} />
            <Text style={styles.icon}>Share</Text>
          </Pressable>
        </View>
      )}

      {/* Comments */}
      {!minimal && (
        <Pressable
          onPress={onOpenComments}
          style={styles.commentsContainer}
          accessibilityRole="button"
          accessibilityLabel={`Comments, ${post.comments.length}`}>
          <Text style={styles.commentsTitle}>
            Comments {post.comments.length}
          </Text>
          {post.comments.length > 0 && (
            <Text style={styles.topComment} numberOfLines={2}>
              {post.comments[0].text}
            </Text>
          )}
        </Pressable>
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
  iconButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
