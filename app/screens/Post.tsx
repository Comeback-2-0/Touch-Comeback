import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import Video from 'react-native-video';
import { StackNavigationProp } from '@react-navigation/stack';

// Define navigation param types
type RootStackParamList = {
  PostReels: undefined;
  PostPreview: { video: Asset | null };
};

// Define props type
type PostReelsScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PostReels'>;
};

const { width } = Dimensions.get('window');

export default function PostReelsScreen({ navigation }: PostReelsScreenProps) {
  const [selectedVideo, setSelectedVideo] = useState<Asset | null>(null);
  const [videos, setVideos] = useState<Asset[]>([]);

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'video',
        selectionLimit: 10,
      },
      (response) => {
        if (response.didCancel) return;

        const assets = response.assets || [];
        setVideos(assets);
        setSelectedVideo(assets[0] || null); // Default selection
      }
    );
  };

  const renderThumbnail = ({ item }: { item: Asset }) => (
    <TouchableOpacity onPress={() => setSelectedVideo(item)}>
      <Image
        source={{ uri: item.uri }}
        style={[
          styles.thumbnail,
          selectedVideo?.uri === item.uri && styles.selectedThumbnail,
        ]}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>New post</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('PostPreview', { video: selectedVideo })
          }
        >
          <Text style={styles.nextBtn}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Video Preview */}
      <View style={styles.videoPreview}>
        {selectedVideo?.uri ? (
          <Video
            source={{ uri: selectedVideo.uri }}
            style={styles.video}
            resizeMode="cover"
            paused={true}
          />
        ) : (
          <Text style={styles.previewText}>No video selected</Text>
        )}
      </View>

      {/* Video Grid */}
      <View style={styles.galleryHeader}>
        <Text style={styles.galleryLabel}>Recents</Text>
        <TouchableOpacity onPress={openGallery}>
          <Text style={styles.selectText}>Select Multiple</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={videos}
        numColumns={3}
        renderItem={renderThumbnail}
        keyExtractor={(item) => item.uri ?? Math.random().toString()}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton}>
          <Text style={styles.footerText}>POST</Text>
        </TouchableOpacity>
        <Text style={[styles.footerText, { opacity: 0.5 }]}>STORY</Text>
        <Text style={[styles.footerText, { opacity: 0.5 }]}>REEL</Text>
        <Text style={[styles.footerText, { opacity: 0.5 }]}>LIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    alignItems: 'center',
  },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  nextBtn: { color: '#3498db', fontSize: 16 },
  videoPreview: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: { width: '100%', height: '100%' },
  previewText: { color: '#888' },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 8,
  },
  galleryLabel: { color: 'white' },
  selectText: { color: '#aaa' },
  thumbnail: {
    width: width / 3,
    height: width / 3,
    borderWidth: 1,
    borderColor: '#111',
  },
  selectedThumbnail: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 0.3,
    borderTopColor: '#555',
  },
  footerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  footerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
