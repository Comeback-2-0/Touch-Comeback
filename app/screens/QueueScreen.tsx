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
import {fetchQueuePosts} from '../utils/api';

type Props = NativeStackScreenProps<ChatStackParamList, 'QueueScreen'>;

export default function QueueScreen({navigation, route}: Props) {
  const {group, userId} = route.params;
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const goToCreatePost = () => {
    navigation.navigate('CreatePostScreen', {group, userId});
  };

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const res = await fetchQueuePosts(group.id);
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
          renderItem={({item}) => (
            <View style={styles.card}>
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
              <Text style={styles.voteCount}>👍 {item.votes} votes</Text>
            </View>
          )}
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
});
