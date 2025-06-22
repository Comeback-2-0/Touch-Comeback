import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Post } from '../types/Post';

type Props = {
  post: Post;
  onLike: () => void;
};

const PostCard: React.FC<Props> = ({ post, onLike }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.content}>{post.content}</Text>
      <View style={styles.footer}>
        <Text style={styles.likes}>Likes: {post.likes}</Text>
        <TouchableOpacity onPress={onLike} style={styles.likeBtn}>
          <Text style={styles.likeText}>❤️ Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff0f5',
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  likes: {
    color: '#444',
  },
  likeBtn: {
    backgroundColor: '#ffb6c1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  likeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PostCard;