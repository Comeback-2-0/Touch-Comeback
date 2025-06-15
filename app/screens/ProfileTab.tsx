import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ListRenderItem,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Define the navigation param types
type RootStackParamList = {
  EditProfile: undefined;
  Settings: undefined;
};

type Post = {
  id: string;
  image: string;
};

const dummyPosts: Post[] = Array.from({ length: 21 }, (_, i) => ({
  id: i.toString(),
  image:
    'https://photosbulk.com/wp-content/uploads/instagram-profile-picture-avatar_39.webp',
}));

const screenWidth = Dimensions.get('window').width;
const gap = 4;
const postSize = (screenWidth - gap * 4) / 3;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const renderPost: ListRenderItem<Post> = ({ item }) => (
    <Image source={{ uri: item.image }} style={styles.postImage} />
  );

  return (
    <View style={styles.container}>
      {/* Top Profile Info */}
      <View style={styles.profileTop}>
        <Image
          source={{
            uri: 'https://photosbulk.com/wp-content/uploads/instagram-profile-picture-avatar_39.webp',
          }}
          style={styles.avatar}
        />
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statCount}>54</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statCount}>1.2k</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statCount}>180</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      {/* Username & Bio */}
      <View style={styles.bioContainer}>
        <Text style={styles.username}>Anonymous Owl</Text>
        <Text style={styles.bio}>I post vibes. Just here for the feels 🦉</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Post Grid */}
      <View style={styles.gridContainer}>
        <FlatList
          data={dummyPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: gap + 2,
          }}
          contentContainerStyle={{ paddingHorizontal: gap, paddingTop: gap }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileTop: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
    marginLeft: 20,
  },
  stat: { alignItems: 'center' },
  statCount: { fontWeight: 'bold', fontSize: 16 },
  statLabel: { color: 'gray' },
  bioContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  username: { fontWeight: 'bold', fontSize: 16 },
  bio: { color: 'gray', marginTop: 4 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  button: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  buttonText: { fontWeight: '600' },
  gridContainer: {
    flex: 1,
  },
  postImage: {
    width: postSize,
    height: postSize,
    borderRadius: 4,
  },
});