import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/PostReelsStack';
import PostStack from '../navigation/PostReelsStack';

import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const avatarUri =
  'https://photosbulk.com/wp-content/uploads/instagram-profile-picture-avatar_39.webp';
const postUri =
  'https://photosbulk.com/wp-content/uploads/instagram-profile-picture-avatar_39.webp';

type StoryUser = {
  id: string;
  username: string;
  avatar: string;
};

export default function FeedScreen(): JSX.Element {
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const storyUsers: StoryUser[] = Array(8)
    .fill(null)
    .map((_, index) => ({
      id: index.toString(),
      username: `user${index + 1}`,
      avatar: avatarUri,
    }));

  const Post: React.FC = () => (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: avatarUri }} style={styles.profilePic} />
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>Afsha09._123</Text>
          <Text style={styles.postDate}>23 Jan 2025</Text>
        </View>
        <TouchableOpacity style={styles.followBtn}>
          <Text style={styles.followText}>Follow</Text>
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <Image source={{ uri: postUri }} style={styles.postImage} />

      {/* Post Footer */}
      <View style={styles.postFooter}>
        <Text style={styles.caption}>Nice Background 😍</Text>
        <View style={styles.statsRow}>
          <FontAwesome name="heart-o" size={18} color="#000" />
          <Text style={styles.statText}>200k</Text>
          <Icon name="eye-outline" size={20} color="#000" style={{ marginLeft: 15 }} />
          <Text style={styles.statText}>1.4M</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
         <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('PostReels')}>
          <Icon name="add-circle-outline" size={28} color="#fff" style={{ position: 'absolute', right:135}} />
        </TouchableOpacity>
        <Text style={styles.headerText}>TOUCH</Text>
      </View>

      {/* Stories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storyBar}>
        {storyUsers.map((story) => (
          <View key={story.id} style={styles.storyItem}>
            <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
            <Text style={styles.storyUsername} numberOfLines={1}>
              {story.username}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Posts */}
      <Post />
      <Post />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#ff00ff',
    paddingVertical: 12,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    left:120
  },

  storyBar: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ff00ff',
  },
  storyUsername: {
    marginTop: 4,
    fontSize: 12,
    maxWidth: 60,
    textAlign: 'center',
  },

  postContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePic: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  postDate: {
    fontSize: 12,
    color: 'gray',
  },
  followBtn: {
    backgroundColor: '#ff00ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  followText: {
    color: '#fff',
    fontWeight: '600',
  },

  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
  },
  postFooter: {
    paddingHorizontal: 5,
  },
  caption: {
    fontSize: 14,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
  },
});