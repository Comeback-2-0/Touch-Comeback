// app/screens/QueueScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ChatStackParamList} from '../navigation/ChatNavigator';
import Icon from 'react-native-vector-icons/Ionicons';
import {fetchQueuePosts, API_URL} from '../utils/api';

type Props = NativeStackScreenProps<ChatStackParamList, 'QueueScreen'>;

export default function QueueScreen({navigation, route}: Props) {
  const {group, userId} = route.params;
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const goToCreatePost = () => {
    navigation.navigate('CreatePostScreen', {group, userId});
  };

  const voteOnPost = async (postId: string) => {
    const post = queue.find(p => p._id === postId);
    const hasVoted = post?.votedBy?.includes(userId);

    try {
      await fetch(`${API_URL}/queue/${postId}/vote`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId}),
      });

      setQueue(prev =>
        prev.map(p =>
          p._id === postId
            ? {
                ...p,
                votes: p.votes + (hasVoted ? -1 : 1),
                votedBy: hasVoted
                  ? p.votedBy.filter((id: string) => id !== userId)
                  : [...(p.votedBy || []), userId],
              }
            : p,
        ),
      );
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const reportPost = async (postId: string) => {
    try {
      await fetch(`${API_URL}/queue/${postId}/report`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId}),
      });
      setQueue(prev =>
        prev.map(p =>
          p._id === postId
            ? {
                ...p,
                reportedBy: [...(p.reportedBy || []), userId],
              }
            : p,
        ),
      );
    } catch (err) {
      console.error('Report failed:', err);
    }
  };

  const undoReportPost = async (postId: string) => {
    try {
      await fetch(`${API_URL}/queue/${postId}/unreport`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId}),
      });

      setQueue(prev =>
        prev.map(p =>
          p._id === postId
            ? {
                ...p,
                reportedBy: p.reportedBy.filter((id: string) => id !== userId),
              }
            : p,
        ),
      );
    } catch (err) {
      console.error('Undo report failed:', err);
    }
  };

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const res = await fetchQueuePosts(group.id, userId);
        setQueue(res.data);
      } catch (err) {
        console.error('Failed to load queue:', err);
      } finally {
        setLoading(false);
      }
    };
    loadQueue();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={queue}
          keyExtractor={item => item._id}
          renderItem={({item}) => {
            const isReported = item.reportedBy?.includes(userId);

            return (
              <View style={[styles.card, isReported && {opacity: 0.4}]}>
                {item.image && (
                  <Image
                    source={{
                      uri: item.image.startsWith('http')
                        ? item.image
                        : `https://api.comeback.website/${item.image}`,
                    }}
                    style={styles.image}
                  />
                )}
                <Text style={styles.content}>{item.content}</Text>
                <Text style={styles.voteCount}>🗳️ {item.votes} votes</Text>

                {isReported && (
                  <View style={styles.reportOverlay}>
                    <Text style={styles.reportText}>
                      You reported this post
                    </Text>
                    <TouchableOpacity onPress={() => undoReportPost(item._id)}>
                      <Text style={styles.undoReport}>Undo Report</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {!isReported && (
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => voteOnPost(item._id)}>
                      <Icon name="arrow-up" size={24} color="#4CAF50" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => reportPost(item._id)}>
                      <Icon name="alert-circle" size={24} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>No items in queue</Text>
          }
          removeClippedSubviews={false}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={goToCreatePost}>
        <Icon name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  card: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 10,
    marginVertical: 6,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  image: {width: '100%', height: 200, borderRadius: 8, marginBottom: 10},
  content: {fontSize: 16, color: '#333'},
  empty: {textAlign: 'center', marginTop: 40, color: '#999'},
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    padding: 16,
    elevation: 4,
  },
  voteCount: {marginTop: 6, color: '#888'},
  reportedBadge: {
    color: '#FF5252',
    fontSize: 13,
    marginTop: 6,
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  reportOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 12,
  },

  reportText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    transform: [{rotate: '-25deg'}],
  },

  undoReport: {
    color: '#fff',
    backgroundColor: '#000000aa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: 14,
    overflow: 'hidden',
  },
});
