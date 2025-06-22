import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../navigation/ChatNavigator';
import PostCard from '../components/PostCard';
import QueueCard from '../components/QueueCard';
import CommentBox from '../components/CommentBox';
import { io } from 'socket.io-client';
import { Post, Comment } from '../types/Post';
import { usePostQueue } from '../context/PostQueueContext'; // ✅ Use context instead of navigation callback

type Props = NativeStackScreenProps<ChatStackParamList, 'GroupChatScreen'>;

const GroupChatScreen = ({ navigation, route }: Props) => {
  const { group, userId } = route.params;
  const [posts, setPosts] = useState<Post[]>([]);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const socketRef = useRef<any>(null);
  const { queue, removePostFromQueue } = usePostQueue(); // ✅ From context

  useEffect(() => {
    socketRef.current = io('http://localhost:3333');

    socketRef.current.emit('joinRoom', {
      communityId: group.id,
      senderAnonymousId: userId,
    });

    socketRef.current.on('chat_history', (messages: any[]) => {
      const postList: Post[] = messages.map((msg) => ({
        id: msg._id,
        content: msg.text,
        likes: 0,
        comments: [],
      }));
      setPosts(postList);
    });

    socketRef.current.on('newMessage', (msg: any) => {
      const newPost: Post = {
        id: msg._id,
        content: msg.text,
        likes: 0,
        comments: [],
      };
      setPosts((prev) => [newPost, ...prev]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const activePost = posts[activePostIndex];

  const handleLike = () => {
    const updated = [...posts];
    updated[activePostIndex].likes++;
    setPosts(updated);
  };

  const handleComment = (text: string) => {
    const updated = [...posts];
    const newComment: Comment = {
      id: Date.now().toString(),
      user: userId,
      text,
    };
    updated[activePostIndex].comments.push(newComment);
    setPosts(updated);
  };

  const goToCreatePost = () => {
    navigation.navigate('CreatePostScreen', {
      group,
      userId,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (queue.length > 0) {
        const mostLiked = queue.reduce((a, b) => (a.likes > b.likes ? a : b));
        setPosts((prev) => [mostLiked, ...prev]);
        removePostFromQueue(mostLiked.id); // ✅ use context-based removal
      }
    }, 6 * 60 * 60 * 1000); // every 6 hours

    return () => clearInterval(interval);
  }, [queue]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{group.name}</Text>

      {activePost ? (
        <>
          <PostCard post={activePost} onLike={handleLike} />
          <FlatList
            data={activePost.comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.commentBubble}>
                <Text>{item.text}</Text>
              </View>
            )}
            ListHeaderComponent={<Text style={styles.subtitle}>Comments</Text>}
            removeClippedSubviews={false}
          />
          <CommentBox onSubmit={handleComment} />
        </>
      ) : (
        <Text style={styles.noPost}>No active post</Text>
      )}

      <Text style={styles.subtitle}>Queue</Text>
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <QueueCard content={item.content} />}
        removeClippedSubviews={false}
      />

      <TouchableOpacity onPress={goToCreatePost} style={styles.newPostBtn}>
        <Text style={styles.newPostText}>+ New Post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F5F5' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#444' },
  subtitle: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 6 },
  commentBubble: { backgroundColor: '#EEE', padding: 8, borderRadius: 6, marginVertical: 4 },
  noPost: { color: '#777', textAlign: 'center', marginTop: 20 },
  newPostBtn: {
    backgroundColor: '#AEC6CF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  newPostText: { fontSize: 16, fontWeight: '600', color: '#333' },
});

export default GroupChatScreen;
