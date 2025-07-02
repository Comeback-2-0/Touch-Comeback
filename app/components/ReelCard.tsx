import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
  Modal,
  TextInput,
  FlatList,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Image,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

interface Props {
  id: string;
  uri: string;
  isActive: boolean;
  caption?: string;
  reelId: string;
  user?: {
    username: string;
    profilePic: string;
  };
}

interface Comment {
  _id: string;
  text: string;
}


const { width, height } = Dimensions.get('window');

const ReelCard: React.FC<Props> = ({ id, uri, isActive, caption, user, reelId  }) => {
  const videoRef = useRef<VideoRef>(null);
  const [saved, setSaved] = useState(false);
  const [paused, setPaused] = useState(!isActive);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(120);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  const [loadingComments, setLoadingComments] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);

  useEffect(() => {
    setPaused(!isActive);
  }, [isActive]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const res = await axios.get("http://172.16.59.34:3333/api/reels/${reelId}/comments");
        setComments(res.data);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    if (showComments) fetchComments();
  }, [showComments]);

  const handleLike = () => {
    const updated = !liked;
    setLiked(updated);
    setLikeCount((prev) => prev + (updated ? 1 : -1));
  };

  const handleDoubleTap = () => {
    if (!liked) handleLike();
    scaleAnim.setValue(0.2);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap.current < DOUBLE_PRESS_DELAY) {
      handleDoubleTap();
    } else {
      setPaused(!paused);
    }
    lastTap.current = now;
  };

 const handleAddComment = async () => {
  if (commentInput.trim()) {
    try {
      const res = await axios.post("http://172.16.59.34:3333/api/reels/${reelId}/comments", {
        text: commentInput,
      });

      // Update comments with new one from backend
      setComments((prev) => [res.data.comment, ...prev]);
      setCommentInput('');
    } catch (error) {
      console.error('Failed to post comment:', error);
      Alert.alert('Error', 'Could not post comment.');
    }
  }
};


  const handleShare = async () => {
    try {
      const message = "🔥 Watch this reel on Touch:\n\n${uri}";
      await Share.share({ message });
    } catch (error) {
      Alert.alert('Sharing Failed', 'Unable to share the reel.');
    }
  };

  const handleSave = () => {
    setSaved((prev) => !prev);
  };

  const handleReport = () => {
    Alert.alert(
      'Report Reel',
      'Are you sure you want to report this reel?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', onPress: () => Alert.alert('Reel reported. Thank you!') },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.videoWrapper}>
          <Video
            ref={videoRef}
            source={{ uri }}
            style={styles.video}
            resizeMode="cover"
            repeat
            paused={paused}
            muted={muted}
          />

          {paused && (
            <Icon name="play-circle-outline" size={60} color="white" style={styles.playIcon} />
          )}

          <Animated.View style={[styles.heartOverlay, { transform: [{ scale: scaleAnim }] }]}>
            <Icon name="heart" size={100} color="white" />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      <TouchableOpacity onPress={() => setMuted(!muted)} style={styles.muteToggle}>
        <Icon name={muted ? 'volume-mute' : 'volume-high'} size={26} color="white" />
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={{ alignItems: 'center' }}>
          <Icon name={liked ? 'heart' : 'heart-outline'} size={28} color={liked ? 'red' : 'white'} />
          <Text style={styles.actionLabel}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowComments(true)} style={{ alignItems: 'center' }}>
          <Icon name="chatbubble-outline" size={28} color="white" />
          <Text style={styles.actionLabel}>{comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={{ alignItems: 'center' }}>
          <Icon name="share-social-outline" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={{ alignItems: 'center' }}>
          <Icon name={saved ? 'bookmark' : 'bookmark-outline'} size={26} color="white" />
          <Text style={styles.actionLabel}>{saved ? 'Saved' : 'Save'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleReport} style={{ alignItems: 'center' }}>
          <Icon name="flag-outline" size={26} color="white" />
          <Text style={styles.actionLabel}>Report</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomInfo}>
        {user && (
          <View style={styles.bottomUserRow}>
            <Image source={{ uri: user.profilePic }} style={styles.profilePicSmall} />
            <Text style={styles.usernameBottomText}>@{user.username}</Text>
          </View>
        )}
        <Text style={styles.captionText}>{caption || '🎬 A cool reel!'}</Text>

        <View style={styles.musicRow}>
          <Icon name="musical-notes" size={14} color="white" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={styles.musicText}>
              Original sound • @{user?.username || 'touch_user'} 🎵🔥🔥🔥
            </Text>
          </ScrollView>
        </View>
      </View>

      <Modal
        visible={showComments}
        animationType="slide"
        onRequestClose={() => setShowComments(false)}
        transparent
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setShowComments(false)}>
                <Icon name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comments}
              keyExtractor={(item) => item._id }
              renderItem={({ item }) => <Text style={styles.commentText}>• {item.text}</Text>}
              style={{ flex: 1 }}
            />

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={100}
            >
              <View style={styles.inputContainer}>
                <TextInput
                  value={commentInput}
                  onChangeText={setCommentInput}
                  placeholder="Add a comment..."
                  placeholderTextColor="gray"
                  style={styles.textInput}
                />
                <TouchableOpacity onPress={handleAddComment}>
                  <Text style={styles.sendText}>Send</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// styles unchanged ...




const styles = StyleSheet.create({
  container: { width, height, backgroundColor: 'black', position: 'relative' },
  videoWrapper: { flex: 1 },
  video: { position: 'absolute', width: '100%', height: '100%' },
  playIcon: { position: 'absolute', top: '45%', left: '45%', zIndex: 2 },
  heartOverlay: { position: 'absolute', top: '40%', left: '40%', opacity: 0.8, zIndex: 5 },
  muteToggle: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  actions: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
    gap: 20,
  },
  actionLabel: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  bottomUserRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 6,
},

profilePicSmall: {
  width: 28,
  height: 28,
  borderRadius: 14,
  marginRight: 8,
  borderWidth: 1,
  borderColor: '#fff',
},

usernameBottomText: {
  color: 'white',
  fontSize: 14,
  fontWeight: '600',
},

  captionText: {
    color: 'white',
    fontSize: 15,
    marginBottom: 6,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    color: 'white',
    fontSize: 13,
    marginLeft: 4,
  },
  profileInfo: {
    position: 'absolute',
    top: 60,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  usernameText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    height: '50%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentText: {
    paddingVertical: 6,
    fontSize: 15,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
    fontSize: 15,
    color: '#000',
  },
  sendText: {
    color: '#007bff',
    marginLeft: 10,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ReelCard;