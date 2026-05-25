// app/screens/CreatePostScreen.tsx
import React, {useRef, useState} from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ChatStackParamList} from '../navigation/ChatNavigator';
import {uploadPost} from '../utils/api';
import PostPreview from '../components/PostPreview';

type Props = NativeStackScreenProps<ChatStackParamList, 'CreatePostScreen'>;

export default function CreatePostScreen({route, navigation}: Props) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const {group} = route.params;

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        const allGranted = Object.values(granted).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED,
        );

        if (!allGranted) {
          Alert.alert(
            'Permission Denied',
            'Camera and storage permissions are required',
          );
          return false;
        }
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }

    return true;
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
      }
    });
  };

  const openCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    launchCamera({mediaType: 'photo'}, response => {
      if (response.assets && response.assets.length > 0) {
        setImage(response.assets[0]);
      }
    });
  };

  const handlePost = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('content', text);
      formData.append('groupId', group.id);

      if (image) {
        formData.append('image', {
          uri: image.uri,
          name: image.fileName || 'photo.jpg',
          type: image.type || 'image/jpeg',
        });
      }

      await uploadPost(formData);
      navigation.goBack();
    } catch (err) {
      console.error('Error uploading post:', err);
      Alert.alert('Error', 'Could not upload post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TextInput
        placeholder="Write your post..."
        value={text}
        onChangeText={setText}
        multiline
        style={styles.input}
      />

      <PostPreview text={text} image={image} />

      <View style={styles.buttonRow}>
        <Button title="📷 Camera" onPress={openCamera} />
        <Button title="🖼️ Gallery" onPress={pickFromGallery} />
      </View>

      <View style={{height: 20}} />

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <Button title="🚀 Submit Post" onPress={handlePost} color="#4CAF50" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, flexGrow: 1},
  input: {
    height: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
