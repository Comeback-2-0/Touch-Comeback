import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, launchCamera, MediaType } from 'react-native-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ReelStackParamList } from '../navigation/ReelStackNavigator';
import Video from 'react-native-video';

type NavigationProp = NativeStackNavigationProp<ReelStackParamList, 'VideoPickerScreen'>;

const { width, height } = Dimensions.get('window');

export default function VideoPickerScreen() {
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const navigation = useNavigation<NavigationProp>();

  // Validate video constraints
  const validateVideo = (video: any): string | null => {
    const maxSizeInMB = 100; // 100MB limit
    const maxDurationInSeconds = 60; // 60 seconds limit
    
    if (video.fileSize && video.fileSize > maxSizeInMB * 1024 * 1024) {
      return `Video file is too large. Maximum size is ${maxSizeInMB}MB.`;
    }
    
    if (videoDuration > maxDurationInSeconds) {
      return `Video is too long. Maximum duration is ${maxDurationInSeconds} seconds.`;
    }
    
    return null;
  };

  const pickFromGallery = async () => {
    setIsLoading(true);
    try {
      const result = await launchImageLibrary({
        mediaType: 'video' as MediaType,
        selectionLimit: 1,
        quality: 0.8,
        videoQuality: 'medium',
      });
      
      if (result.assets?.length) {
        const video = result.assets[0];
        setSelectedVideo(video);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video from gallery');
    } finally {
      setIsLoading(false);
    }
  };

  const recordVideo = async () => {
    setIsLoading(true);
    try {
      const result = await launchCamera({
        mediaType: 'video' as MediaType,
        quality: 0.8,
        videoQuality: 'medium',
        durationLimit: 60, // 60 seconds limit
      });
      
      if (result.assets?.length) {
        const video = result.assets[0];
        setSelectedVideo(video);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record video');
    } finally {
      setIsLoading(false);
    }
  };

const handleNext = () => {
    if (!selectedVideo) return;
    
    const validationError = validateVideo(selectedVideo);
    if (validationError) {
      Alert.alert('Invalid Video', validationError);
      return;
    }
    
    navigation.navigate('VideoEditingScreen', { video: selectedVideo });
  };

  const onVideoLoad = (data: any) => {
    setVideoDuration(data.duration || 0);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Video</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Video Preview */}
      <View style={styles.previewContainer}>
        {selectedVideo ? (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: selectedVideo.uri }}
              style={styles.video}
              resizeMode="cover"
              controls={true}
              paused={true}
              onLoad={onVideoLoad}
            />
            <View style={styles.videoInfo}>
              <Text style={styles.videoInfoText}>
                {selectedVideo.fileName || 'Selected Video'}
              </Text>
              <Text style={styles.videoInfoText}>
                Duration: {formatDuration(videoDuration)} • Size: {formatFileSize(selectedVideo.fileSize || 0)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyPreview}>
            <Text style={styles.emptyText}>No video selected</Text>
            <Text style={styles.emptySubtext}>Choose a video from your gallery or record a new one</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={pickFromGallery}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>📱 Choose from Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={recordVideo}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>🎥 Record Video</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {/* Guidelines */}
      <View style={styles.guidelines}>
        <Text style={styles.guidelinesTitle}>Video Guidelines:</Text>
        <Text style={styles.guidelineItem}>• Maximum duration: 60 seconds</Text>
        <Text style={styles.guidelineItem}>• Maximum file size: 100MB</Text>
        <Text style={styles.guidelineItem}>• Recommended aspect ratio: 9:16 (vertical)</Text>
        <Text style={styles.guidelineItem}>• Supported formats: MP4, MOV</Text>
      </View>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedVideo && styles.nextButtonDisabled
          ]}
          disabled={!selectedVideo || isLoading}
          onPress={handleNext}
        >
          <Text style={[
            styles.nextButtonText,
            !selectedVideo && styles.nextButtonTextDisabled
          ]}>
            Next →
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 60, // Same width as back button for centering
  },
  previewContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  videoContainer: {
    aspectRatio: 9/16,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    flex: 1,
    width: '100%',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  videoInfoText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
  emptyPreview: {
    aspectRatio: 9/16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  guidelines: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  guidelineItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#999',
  },
  preview: { flex: 1, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  gallery: { flex: 1, backgroundColor: '#fafafa', alignItems: 'center', justifyContent: 'center' },
  select: { color: 'blue' },
});
