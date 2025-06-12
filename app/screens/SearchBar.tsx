import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  ListRenderItem,
} from 'react-native';

const moods = ['All', 'Happy', 'Chill', 'Sad', 'Inspired'] as const;
type Mood = typeof moods[number];

type Post = {
  id: string;
  image: string;
  mood: Mood;
};

const mockPosts: Post[] = Array.from({ length: 18 }, (_, i) => ({
  id: i.toString(),
  image: `https://picsum.photos/id/${i + 10}/300/300`,
  mood: moods[i % moods.length],
}));

export default function SearchScreen() {
  const [selectedMood, setSelectedMood] = useState<Mood>('All');
  const [query, setQuery] = useState('');

  const filteredPosts = mockPosts.filter(
    (post) =>
      (selectedMood === 'All' || post.mood === selectedMood) &&
      post.mood.toLowerCase().includes(query.toLowerCase())
  );

  const renderItem: ListRenderItem<Post> = ({ item }) => (
    <Image source={{ uri: item.image }} style={styles.postImage} />
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        placeholder="Search moods, users, tags..."
        placeholderTextColor="#888"
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
      />

      {/* Mood Filter Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodBar}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[styles.moodButton, selectedMood === mood && styles.activeMood]}
            onPress={() => setSelectedMood(mood)}
          >
            <Text style={selectedMood === mood ? styles.activeMoodText : styles.moodText}>
              {mood}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <FlatList
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 4 }}
        contentContainerStyle={{ paddingHorizontal: 4 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;
const postSize = (screenWidth - 4 * 4) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  searchInput: {
    backgroundColor: '#444',
    marginHorizontal: 10,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
    color: '#fff',
  },
  moodBar: {
    paddingHorizontal: 10,
    marginBottom: 20,
    flexGrow: 0,
  },
  moodButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minWidth: 60,
    alignItems: 'center',
    height: 34,
  },
  moodText: {
    fontSize: 14,
    color: '#444',
    alignItems: 'center',
  },
  activeMood: {
    backgroundColor: '#ff00ff',
  },
  activeMoodText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  postImage: {
    width: postSize,
    height: postSize,
    borderRadius: 4,
  },
});
