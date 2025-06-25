// app/screens/GroupChatScreen.tsx
import React, {useEffect, useRef, useState, useLayoutEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ChatStackParamList} from '../navigation/ChatNavigator';
import PostCard from '../components/PostCard';
import CommentBox from '../components/CommentBox';
import {Post, Comment} from '../navigation/types/Post';
import {usePostQueue} from '../context/PostQueueContext';
import {fetchGroupPosts, commentOnPost, replyToComment} from '../utils/api';
import Icon from 'react-native-vector-icons/Ionicons';

type Props = NativeStackScreenProps<ChatStackParamList, 'GroupChatScreen'>;

export default function GroupChatScreen({navigation, route}: Props) {
  const {group, userId} = route.params;
  const [posts, setPosts] = useState<Post[]>([]);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const socketRef = useRef<any>(null);
  const {queue, removePostFromQueue} = usePostQueue();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await fetchGroupPosts(group.id);
        setPosts(res.data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      }
    };

    loadPosts();
  }, []);

  const activePost = posts[activePostIndex];

  const handleLike = () => {
    const updated = [...posts];
    updated[activePostIndex].likes++;
    setPosts(updated);
  };

  const handleComment = async (text: string) => {
    const postId = posts[activePostIndex]._id;
    try {
      const res = await commentOnPost(postId, text, userId);
      const updatedPosts = [...posts];
      updatedPosts[activePostIndex].comments.push(res.data);
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleReply = async (commentId: string, text: string) => {
    try {
      const res = await replyToComment(commentId, text, userId);
      const updatedPosts = [...posts];
      const comments = updatedPosts[activePostIndex].comments;

      const commentIndex = comments.findIndex(c => c._id === commentId);
      if (commentIndex !== -1) {
        const existingReplies = comments[commentIndex].replies || [];
        comments[commentIndex].replies = [...existingReplies, res.data];
      }
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Reply failed:', err);
    }
  };

  const goToCreatePost = () => {
    navigation.navigate('CreatePostScreen', {
      group,
      userId,
    });
  };

  const goToQueue = () => {
    navigation.navigate('QueueScreen', {
      group,
      userId,
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: group.name,
      headerRight: () => (
        <View style={{flexDirection: 'row', gap: 12}}>
          <TouchableOpacity onPress={goToQueue}>
            <Icon name="list" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToCreatePost}>
            <Icon name="add" size={22} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (queue.length > 0) {
        const mostLiked = queue.reduce((a, b) => (a.likes > b.likes ? a : b));
        setPosts(prev => [mostLiked, ...prev]);
        removePostFromQueue(mostLiked.id); 
      }
    }, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [queue]);

  return (
    <View style={styles.container}>

      {activePost ? (
        <>
          <PostCard post={activePost} onLike={handleLike} />
          <FlatList
            data={activePost.comments}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
              <View style={styles.commentBubble}>
                <Text>{item.text}</Text>

                {item.replies?.map((reply, index) => (
                  <Text key={reply._id || index} style={styles.replyText}>
                    ↪ {reply.text}
                  </Text>
                ))}
                <CommentBox
                  onSubmit={text => handleReply(item._id, text)}
                  placeholder="Reply to comment"
                />
              </View>
            )}
            ListHeaderComponent={<Text style={styles.subtitle}>Comments</Text>}
            contentContainerStyle={{ paddingBottom: 80 }}
            removeClippedSubviews={false}
          />
          <CommentBox onSubmit={handleComment} />
        </>
      ) : (
        <Text style={styles.noPost}>No active post</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#F5F5F5'},
  subtitle: {fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 6},
  commentBubble: {
    backgroundColor: '#EEE',
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  noPost: {color: '#777', textAlign: 'center', marginTop: 20},
  replyText: {
    marginLeft: 10,
    fontStyle: 'italic',
    fontSize: 13,
    color: '#666',
  },
});
