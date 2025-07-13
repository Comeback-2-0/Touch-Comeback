import React, {useEffect, useRef, useState} from 'react';
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
  Share,
  Alert,
} from 'react-native';
import Video, {VideoRef} from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  fetchReelComments,
  addReelComment,
  likeReel,
  saveReel,
  reportReel,
  sendWatchTime,
} from '../utils/api';

interface Props {
  id: string;
  uri: string;
  isActive: boolean;
  caption?: string;
  mood?: string;
  hashtags?: string[];
  creatorId?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  createdAt?: string;
  reelId: string;
  userId: string;
  user?: {
    username: string;
    profilePic: string;
  };
}

interface Comment {
  _id: string;
  text: string;
  userId: {
    username: string;
    //profilePic: string;
  };
}

const {width, height} = Dimensions.get('window');

const ReelCard: React.FC<Props> = ({
  id,
  uri,
  isActive,
  caption,
  mood,
  hashtags = [],
  creatorId,
  likes = 0,
  comments = 0,
  shares = 0,
  saves = 0,
  createdAt,
  reelId,
  userId,
  user,
}) => {
  if (!uri) {
    console.warn('Empty video URL received');
    return <Text style={{color: 'white'}}>Video not available</Text>;
  }

  const videoRef = useRef<VideoRef>(null);
  const [saved, setSaved] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [paused, setPaused] = useState(!isActive);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(comments);
  const [shareCount, setShareCount] = useState(shares);
  const [saveCount, setSaveCount] = useState(saves);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [fetchedComments, setFetchedComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);

  useEffect(() => {
    setPaused(!isActive);

    if (isActive) {
      setVideoKey(prev => prev + 1); // force remount on active change
    }
  }, [isActive]);


  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetchReelComments(reelId);
        setFetchedComments(res.data.comments);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      }
    };

    if (showComments) fetchComments();
  }, [showComments, reelId]);

  useEffect(() => {
    let watchStartTime: number;

    if (isActive) {
      watchStartTime = Date.now();
    }

    return () => {
      if (isActive && userId && reelId) {
        const duration = Math.floor((Date.now() - watchStartTime) / 1000);
        const moodStr = Array.isArray(mood) ? mood[0] : mood;
        if (!moodStr || duration <= 1) return;

        sendWatchTime(reelId, userId, moodStr, duration).catch(err =>
          console.error('Failed to send watch time:', err),
        );
      }
    };
  }, [isActive]);

  const handleLike = async () => {
    try {
      await likeReel(reelId, userId);
      setLiked(!liked);
      setLikeCount(prev => (liked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error('Error liking the reel', error);
    }
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
    try {
      const res = await addReelComment(reelId, userId, commentInput);
      setFetchedComments(prev => [res.data.comment, ...prev]);
      setCommentInput('');
      setCommentCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to post comment:', err);
      Alert.alert('Error', 'Could not post comment.');
    }
  };

  const handleShare = async () => {
    try {
      const message = `🔥 Watch this reel on Touch:\n\n${uri}`;
      await Share.share({message});
    } catch (error) {
      Alert.alert('Sharing Failed', 'Unable to share the reel.');
    }
  };

  const handleSave = async () => {
    try {
      await saveReel(reelId, userId);
      setSaved(!saved);
      setSaveCount(prev => (saved ? prev - 1 : prev + 1));
    } catch (error) {
      console.error('Error saving the reel', error);
    }
  };

  const handleReport = () => {
    Alert.alert('Report Reel', 'Are you sure you want to report this reel?', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Report', onPress: () => Alert.alert('Reel reported. Thank you!')},
    ]);
  };

  const formattedHashtags = hashtags.map(tag => `#${tag}`).join(' ');
  const checkBackground = uri.toLowerCase().includes('white'); // naive check
  const textColor = checkBackground ? 'black' : 'white';

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.videoWrapper}>
          {isActive && (
            <Video
              ref={videoRef}
              source={{uri}}
              onError={e => {
                console.log('❌ Video error:', e);
                console.log('📹 Video URI:', uri);
              }}
              style={styles.video}
              resizeMode="cover"
              repeat
              paused={paused}
              muted={muted}
            />
          )}

          {paused && (
            <Icon
              name="play-circle-outline"
              size={60}
              color="white"
              style={styles.playIcon}
            />
          )}

          <Animated.View
            style={[styles.heartOverlay, {transform: [{scale: scaleAnim}]}]}>
            <Icon name="heart" size={100} color="white" />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      <TouchableOpacity
        onPress={() => setMuted(!muted)}
        style={styles.muteToggle}>
        <Icon
          name={muted ? 'volume-mute' : 'volume-high'}
          size={26}
          color="white"
        />
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={{alignItems: 'center'}}>
          <Icon
            name={liked ? 'heart' : 'heart-outline'}
            size={28}
            color={liked ? 'red' : 'white'}
          />
          <Text style={styles.actionLabel}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowComments(true)}
          style={{alignItems: 'center'}}>
          <Icon name="chatbubble-outline" size={28} color="white" />
          <Text style={styles.actionLabel}>{commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={{alignItems: 'center'}}>
          <Icon name="share-social-outline" size={28} color="white" />
          <Text style={styles.actionLabel}>{shareCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={{alignItems: 'center'}}>
          <Icon
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={26}
            color="white"
          />
          <Text style={styles.actionLabel}>{saveCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleReport} style={{alignItems: 'center'}}>
          <Icon name="flag-outline" size={26} color="white" />
          <Text style={styles.actionLabel}>Report</Text>
        </TouchableOpacity>
      </View>

      {showComments && (
        <FlatList
          data={fetchedComments}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <View style={styles.commentContainer}>
              <Text style={styles.username}>{item.userId.username}:</Text>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.bottomInfo}>
        {creatorId && (
          <Text style={{color: 'white', fontSize: 14}}>{creatorId}</Text>
        )}
        {caption && <Text style={styles.captionText}>{caption}</Text>}
        {hashtags.length > 0 && (
          <Text style={{color: 'white', marginTop: 4}}>
            {formattedHashtags}
          </Text>
        )}
      </View>

      <Modal
        visible={showComments}
        animationType="slide"
        onRequestClose={() => setShowComments(false)}
        transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <FlatList
              data={fetchedComments}
              keyExtractor={item => item._id}
              renderItem={({item}) => (
                <Text style={styles.commentText}>
                  {item.userId.username} : {item.text}
                </Text>
              )}
              style={{flex: 1}}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={styles.inputContainer}>
                <TextInput
                  value={commentInput}
                  onChangeText={setCommentInput}
                  placeholder="Add a comment..."
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

export default ReelCard;

const styles = StyleSheet.create({
  container: {width, height, backgroundColor: 'black', position: 'relative'},
  videoWrapper: {flex: 1},
  video: {position: 'absolute', width: '100%', height: '100%'},
  playIcon: {position: 'absolute', top: '45%', left: '45%', zIndex: 2},
  heartOverlay: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    opacity: 0.8,
    zIndex: 5,
  },
  muteToggle: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
