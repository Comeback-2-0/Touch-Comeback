// app/screens/GroupChatScreen.tsx
import React, {useEffect, useRef, useState, useLayoutEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ChatStackParamList} from '../navigation/ChatNavigator';
import PostCard from '../components/PostCard';
import CommentList from '../components/CommentList';
import CommentBox from '../components/CommentBox';
import ReplyList from '../components/ReplyList';
import {Post, Comment} from '../navigation/types/Post';
import {
  fetchGroupPosts,
  likePost,
  dislikePost,
  commentOnPost,
  likeComment,
  dislikeComment,
  reportComment,
  replyToComment,
  fetchReplies,
} from '../utils/api';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';

type Props = NativeStackScreenProps<ChatStackParamList, 'GroupChatScreen'>;

export default function GroupChatScreen({navigation, route}: Props) {
  const flatListRef = useRef<FlatList<Post>>(null);
  const {group} = route.params;
  const {user} = useAuth();
  const userId = user?._id ?? '';
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentMode, setCommentMode] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [replyMode, setReplyMode] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<Comment[]>([]);

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (replyMode) {
        //  If we're viewing replies, close replyMode first
        e.preventDefault();
        setReplyMode(false);
        return;
      }

      if (!commentMode) {
        //  Not in comment view → allow normal back behavior
        return;
      }

      //  In comment view → block default and close comment view
      e.preventDefault();
      setCommentMode(false);
      setSelectedPost(null);
    });

    return unsubscribe;
  }, [navigation, commentMode, replyMode]);

  const goToCreatePost = () => {
    navigation.navigate('CreatePostScreen', {
      group,
    });
  };

  const goToQueue = () => {
    navigation.navigate('QueueScreen', {
      group,
    });
  };

  const refreshComments = async (postId: string) => {
    try {
      const res: {data: Post[]} = await fetchGroupPosts(group.id);
      const updatedPosts = res.data;
      const updatedSelected = updatedPosts.find(p => p._id === postId);
      if (updatedSelected) {
        updatedSelected.comments = [...updatedSelected.comments].sort(
          (a, b) => (b.likes || 0) - (a.likes || 0),
        );
        setSelectedPost(updatedSelected);
      }
      setPosts(updatedPosts);
    } catch (e) {
      console.error('Failed to refresh comments', e);
    }
  };

  const refreshPosts = async () => {
    try {
      const res = await fetchGroupPosts(group.id);
      setPosts(res.data);
    } catch (e) {
      console.error('Refresh posts failed:', e);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await likePost(postId);
      await refreshPosts(); // fetch updated post data
    } catch (e) {
      console.error('Like post failed:', e);
    }
  };

  const handleDislikePost = async (postId: string) => {
    try {
      await dislikePost(postId);
      await refreshPosts(); // fetch updated post data
    } catch (e) {
      console.error('Dislike post failed:', e);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await likeComment(commentId);
      if (!selectedPost) return;

      const updatedComments = selectedPost.comments.map(comment => {
        if (comment._id === commentId) {
          const alreadyLiked = comment.likedBy?.includes(userId);
          const alreadyDisliked = comment.dislikedBy?.includes(userId);

          return {
            ...comment,
            likes: alreadyLiked ? comment.likes - 1 : comment.likes + 1,
            dislikes: alreadyDisliked ? comment.dislikes - 1 : comment.dislikes,
            likedBy: alreadyLiked
              ? (comment.likedBy || []).filter(id => id !== userId)
              : [...(comment.likedBy || []), userId],
            dislikedBy: alreadyDisliked
              ? (comment.dislikedBy || []).filter(id => id !== userId)
              : comment.dislikedBy || [],
          };
        }
        return comment;
      });

      const updated = {...selectedPost, comments: updatedComments};
      setSelectedPost(updated);
      setPosts(prev => prev.map(p => (p._id === updated._id ? updated : p)));
    } catch (e) {
      console.error('Like failed', e);
    }
  };

  const handleDislikeComment = async (commentId: string) => {
    try {
      await dislikeComment(commentId);
      if (!selectedPost) return;

      const updatedComments = selectedPost.comments.map(comment => {
        if (comment._id === commentId) {
          const alreadyDisliked = comment.dislikedBy?.includes(userId);
          const alreadyLiked = comment.likedBy?.includes(userId);

          return {
            ...comment,
            dislikes: alreadyDisliked
              ? comment.dislikes - 1
              : comment.dislikes + 1,
            likes: alreadyLiked ? comment.likes - 1 : comment.likes,
            dislikedBy: alreadyDisliked
              ? (comment.dislikedBy || []).filter(id => id !== userId)
              : [...(comment.dislikedBy || []), userId],
            likedBy: alreadyLiked
              ? (comment.likedBy || []).filter(id => id !== userId)
              : comment.likedBy || [],
          };
        }
        return comment;
      });

      const updated = {...selectedPost, comments: updatedComments};
      setSelectedPost(updated);
      setPosts(prev => prev.map(p => (p._id === updated._id ? updated : p)));
    } catch (e) {
      console.error('Dislike failed', e);
    }
  };

  const handleReportComment = async (commentId: string) => {
    try {
      await reportComment(commentId);
      await refreshComments(selectedPost!._id);
    } catch (e) {
      console.error('Report failed', e);
    }
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

  useLayoutEffect(() => {
    const parent = navigation.getParent();

    if (parent) {
      parent.setOptions({
        tabBarStyle: commentMode ? {display: 'none'} : undefined,
      });
    }
  }, [commentMode, navigation]);

  return (
    <View style={styles.container}>
      {commentMode && selectedPost ? (
        <>
          {/*  Focused post */}
          <PostCard post={selectedPost} minimal />

          {/*  Only show Comments header + list + box if NOT in reply mode */}
          {!replyMode && (
            <>
              <View style={styles.commentHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setCommentMode(false);
                    setSelectedPost(null);
                  }}>
                  <Icon name="arrow-back" size={22} color="black" />
                </TouchableOpacity>
                <Text style={styles.commentTitle}>Comments</Text>
              </View>

              <View style={styles.commentSection}>
                <CommentList
                  comments={selectedPost.comments}
                  onReply={async comment => {
                    setSelectedComment(comment);
                    setReplyMode(true);
                    const res = await fetchReplies(comment._id);
                    setReplies(res.data.reverse());
                  }}
                  onLike={handleLikeComment}
                  onDislike={handleDislikeComment}
                  onReport={handleReportComment}
                />
              </View>

              <CommentBox
                onSubmit={async text => {
                  try {
                    const res = await commentOnPost(selectedPost._id, text);
                    const updated = {
                      ...selectedPost,
                      comments: [...selectedPost.comments, res.data],
                    };
                    setSelectedPost(updated);
                    setPosts(prev =>
                      prev.map(p => (p._id === updated._id ? updated : p)),
                    );
                  } catch (err) {
                    console.error('Comment failed:', err);
                  }
                }}
                placeholder="Add a comment..."
              />
            </>
          )}

          {/*  Replies view */}
          {replyMode && selectedComment && (
            <>
              {/* Replies Header */}
              <View style={styles.commentHeader}>
                <TouchableOpacity onPress={() => setReplyMode(false)}>
                  <Icon name="arrow-back" size={22} color="black" />
                </TouchableOpacity>
                <Text style={styles.commentTitle}>Replies</Text>
              </View>

              {/* Parent Comment Pinned */}
              <View style={styles.parentCommentBox}>
                <Text style={styles.parentCommentText}>
                  {selectedComment.text}
                </Text>
              </View>

              {/* Replies List */}
              <ReplyList replies={replies} />

              {/* Reply Input */}
              <CommentBox
                placeholder="Write a reply…"
                onSubmit={async text => {
                  await replyToComment(selectedComment._id, text);
                  const res = await fetchReplies(selectedComment._id);
                  setReplies(res.data.reverse());
                }}
              />
            </>
          )}
        </>
      ) : posts.length > 0 ? (
        <FlatList
          ref={flatListRef}
          data={posts}
          inverted
          keyExtractor={p => p._id}
          renderItem={({item}) => (
            <PostCard
              post={item}
              onLike={() => handleLikePost(item._id)}
              onDislike={() => handleDislikePost(item._id)}
              onShare={() => {
                console.log('Shared:', item._id);
              }}
              onReport={() => {
                console.log('Reported:', item._id);
              }}
              onOpenComments={() => {
                setSelectedPost(item);
                setCommentMode(true);
                refreshComments(item._id);
              }}
            />
          )}
          onScrollToIndexFailed={({index}) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({index, animated: true});
            }, 300);
          }}
          contentContainerStyle={{paddingTop: 12, paddingBottom: 12}}
          removeClippedSubviews={false}
        />
      ) : (
        <Text style={styles.noPost}>No posts yet</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    backgroundColor: '#F5F5F5',
  },
  noPost: {color: '#777', textAlign: 'center', marginTop: 20},
  commentSection: {
    flex: 1,
    paddingHorizontal: 12,
  },
  commentBoxWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
    zIndex: 10,
  },
  commentTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  parentCommentBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 12,
    borderRadius: 8,
  },
  parentCommentText: {
    fontSize: 14,
    color: '#333',
  },
});
