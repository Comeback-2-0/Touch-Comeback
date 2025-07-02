// ReelPickerScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CameraRoll from '@react-native-camera-roll/camera-roll';
console.log('CameraRoll Object:', CameraRoll);
console.log('CameraRoll.getPhotos:', typeof CameraRoll?.getPhotos);
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReelStackParamList } from '../navigation/types/ReelStackParamList';

type Props = NativeStackScreenProps<ReelStackParamList, 'ReelPicker'>;

export default function ReelPickerScreen({ navigation }: Props) {
  const [media, setMedia] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);

      if (apiLevel >= 33) {
        const videoGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
        );
        const imageGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
        return (
          videoGranted === PermissionsAndroid.RESULTS.GRANTED ||
          imageGranted === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const loadGallery = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.warn('Permission denied');
        return;
      }

      const result = await CameraRoll.getPhotos({
        first: 50,
        assetType: 'Videos', // or 'All' for both photos + videos
      });

      const uris = result.edges.map((edge) => edge.node.image.uri);
      setMedia(uris);
      console.log('Loaded media count:', uris.length);
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!selected}
          onPress={() => {
            if (selected) {
              navigation.navigate('ReelEditor', { videoUri: selected });
            }
          }}
        >
          <Text style={[styles.next, !selected && { color: 'gray' }]}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Preview */}
      {selected && (
        <View style={styles.preview}>
          <Image source={{ uri: selected }} style={styles.previewImage} />
        </View>
      )}

      {/* Gallery */}
      <FlatList
        data={media}
        keyExtractor={(item) => item}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelected(item)} style={{ margin: 2 }}>
            <Image
              source={{ uri: item }}
              style={[styles.thumbnail, selected === item && styles.selected]}
            />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  next: {
    fontSize: 18,
    color: 'blue',
  },
  preview: {
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: 120,
    height: 120,
  },
  selected: {
    borderWidth: 2,
    borderColor: 'blue',
  },
});
