import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import { uploadReel } from '../utils/api';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Feather';

const PostReelScreen = () => {
  const [videoAsset, setVideoAsset] = useState<Asset | null>(null);
  const [caption, setCaption] = useState('');
  const [mood, setMood] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [uploading, setUploading] = useState(false);


  const formatHashtags = (text: string) =>
    text
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter((tag) => tag !== '')
      .join(',');

  const pickVideo = () => {
    launchImageLibrary({ mediaType: 'video' }, (res) => {
      if (res.assets?.length) {
        setVideoAsset(res.assets[0]);
      }
    });
  };

  const recordVideo = () => {
    launchCamera({ mediaType: 'video', videoQuality: 'high' }, (res) => {
      if (res.assets?.length) {
        setVideoAsset(res.assets[0]);
      }
    });
  };

  const handleUpload = async () => {
    if (!videoAsset || !caption || !mood) {
      return Alert.alert('Missing info', 'Please select a video, caption, and mood.');
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('video', {
        uri: videoAsset.uri,
        name: videoAsset.fileName || 'upload.mp4',
        type: videoAsset.type || 'video/mp4',
      });
      formData.append('caption', caption);
      formData.append('mood', mood);
      formData.append('hashtags', formatHashtags(hashtags));

      await uploadReel(formData);

      Alert.alert('Success', 'Reel uploaded!');
      setVideoAsset(null);
      setCaption('');
      setMood('');
      setHashtags('');
    } catch (err) {
      console.error('Upload error:', err);
      Alert.alert('Error', 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🎬 Post a Reel</Text>

      {!videoAsset ? (
        <View style={styles.selectButtons}>
          <TouchableOpacity style={styles.mediaButton} onPress={pickVideo}>
            <Icon name="image" size={20} color="#fff" />
            <Text style={styles.mediaButtonText}> Select from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton} onPress={recordVideo}>
            <Icon name="video" size={20} color="#fff" />
            <Text style={styles.mediaButtonText}> Record a Reel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Video
            source={{ uri: videoAsset.uri || '' }}
            style={styles.preview}
            resizeMode="cover"
            repeat
            muted
          />
          <TextInput
            style={styles.input}
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption..."
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            value={mood}
            onChangeText={setMood}
            placeholder="Enter mood (e.g., Funny)"
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            value={hashtags}
            onChangeText={setHashtags}
            placeholder="Enter hashtags (e.g., travel, fun, party)"
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            style={[styles.uploadButton, uploading && { opacity: 0.7 }]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.uploadText}>🚀 Upload Reel</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#111',
    flexGrow: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectButtons: {
    gap: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaButton: {
    flexDirection: 'row',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  mediaButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#222',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#0f62fe',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PostReelScreen;
