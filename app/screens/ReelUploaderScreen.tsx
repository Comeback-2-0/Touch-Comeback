import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { ReelMetaData } from '../navigation/types/reelTypes';
import axios from 'axios';
import { ReelStackParamList } from '../navigation/ReelStackNavigator';
import Video from 'react-native-video';

type ReelUploadRouteProp = RouteProp<ReelStackParamList, 'ReelUploadScreen'>;

const { width } = Dimensions.get('window');

export default function ReelUploadScreen() {
  const route = useRoute<ReelUploadRouteProp>();
  const navigation = useNavigation();
  const video = route.params.video;
  
  const [meta, setMeta] = useState<ReelMetaData>({
    caption: '',
    mood: '',
    allowComments: true,
    hideLikes: false,
    hideShares: false,
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Validate form inputs
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!meta.caption.trim()) {
      newErrors.caption = 'Caption is required';
    } else if (meta.caption.length > 500) {
      newErrors.caption = 'Caption must be less than 500 characters';
    }
    
    if (meta.mood && meta.mood.length > 50) {
      newErrors.mood = 'Mood must be less than 50 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const uploadReel = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('reel', {
      uri: video.uri,
      type: video.type || 'video/mp4',
      name: video.fileName || `reel_${Date.now()}.mp4`,
    } as any);
    formData.append('caption', meta.caption);
    formData.append('mood', meta.mood);
    formData.append('allowComments', meta.allowComments.toString());
    formData.append('hideLikes', meta.hideLikes.toString());
    formData.append('hideShares', meta.hideShares.toString());

    try {
      const res = await axios.post(`http://192.168.29.250:3333/api/reel/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
        timeout: 60000, // 60 second timeout
      });
      
      setIsUploading(false);
      Alert.alert(
        'Success!',
        'Your reel has been uploaded successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      setIsUploading(false);
      console.error('Upload error:', error);
      
      let errorMessage = 'Failed to upload reel. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timed out. Please check your connection and try again.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Video file is too large. Please choose a smaller video.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid video format or data.';
      } else if (error.response?.status === 401) {
        errorMessage = 'You need to be logged in to upload reels.';
      } else if (!error.response) {
        errorMessage = 'No internet connection. Would you like to add this to your upload queue?';
        Alert.alert('Connection Error', errorMessage);
        return;
      }
      
      Alert.alert('Upload Failed', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Video Preview Section */}
      <View style={styles.videoPreview}>
        <Video
          source={{ uri: video.uri }}
          style={styles.video}
          resizeMode="cover"
          controls={true}
          paused={true}
        />
        <Text style={styles.videoInfo}>
          {video.fileName || 'Selected Video'} • {Math.round((video.fileSize || 0) / 1024 / 1024)}MB
        </Text>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Caption *</Text>
          <TextInput
            placeholder="Write a caption for your reel..."
            value={meta.caption}
            onChangeText={(text) => setMeta({ ...meta, caption: text })}
            style={[styles.input, errors.caption && styles.inputError]}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          {errors.caption && <Text style={styles.errorText}>{errors.caption}</Text>}
          <Text style={styles.characterCount}>{meta.caption.length}/500</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mood (Optional)</Text>
          <TextInput
            placeholder="How are you feeling?"
            value={meta.mood}
            onChangeText={(text) => setMeta({ ...meta, mood: text })}
            style={[styles.input, errors.mood && styles.inputError]}
            maxLength={50}
          />
          {errors.mood && <Text style={styles.errorText}>{errors.mood}</Text>}
        </View>

        {/* Privacy Settings */}
        <View style={styles.privacySection}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Allow Comments</Text>
              <Text style={styles.toggleDescription}>Let people comment on your reel</Text>
            </View>
            <Switch
              value={meta.allowComments}
              onValueChange={(val) => setMeta({ ...meta, allowComments: val })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={meta.allowComments ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Hide Likes</Text>
              <Text style={styles.toggleDescription}>Only you can see the number of likes</Text>
            </View>
            <Switch
              value={meta.hideLikes}
              onValueChange={(val) => setMeta({ ...meta, hideLikes: val })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={meta.hideLikes ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Hide Shares</Text>
              <Text style={styles.toggleDescription}>Prevent others from sharing your reel</Text>
            </View>
            <Switch
              value={meta.hideShares}
              onValueChange={(val) => setMeta({ ...meta, hideShares: val })}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={meta.hideShares ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Upload Progress */}
      {isUploading && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
          </View>
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
          disabled={isUploading}
        >
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            (isUploading || !meta.caption.trim()) && styles.disabledButton
          ]}
          onPress={uploadReel}
          disabled={isUploading || !meta.caption.trim()}
        >
          <Text style={[
            styles.primaryButtonText,
            (isUploading || !meta.caption.trim()) && styles.disabledButtonText
          ]}>
            {isUploading ? 'Uploading...' : 'Upload Reel'}
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
  videoPreview: {
    backgroundColor: '#000',
    aspectRatio: 9/16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 16,
  },
  video: {
    flex: 1,
    width: '100%',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  formSection: {
    paddingHorizontal: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  privacySection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    borderRadius: 12,
    marginVertical: 20,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#333',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  loader: {
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  queueButton: {
    backgroundColor: '#ff9500',
  },
  queueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#999',
  },
});
