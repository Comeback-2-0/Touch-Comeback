import React from 'react';
import {View, Button, Alert, StyleSheet, PermissionsAndroid, Platform} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

export default function ImagePickerTestScreen() {
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera to take pictures.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Camera permission is required');
      return;
    }

    launchCamera({mediaType: 'photo'}, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.error('Camera Error:', response.errorMessage);
        Alert.alert('Error', response.errorMessage || 'Unknown error');
      } else if (response.assets && response.assets.length > 0) {
        console.log('📷 Camera image:', response.assets[0]);
        Alert.alert('Image Captured', JSON.stringify(response.assets[0], null, 2));
      }
    });
  };

  const pickFromGallery = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel) {
        console.log('User cancelled gallery picker');
      } else if (response.errorCode) {
        console.error('Gallery Error:', response.errorMessage);
        Alert.alert('Error', response.errorMessage || 'Unknown error');
      } else if (response.assets && response.assets.length > 0) {
        console.log('🖼️ Gallery image:', response.assets[0]);
        Alert.alert('Image Selected', JSON.stringify(response.assets[0], null, 2));
      }
    });
  };

  return (
    <View style={styles.container}>
      <Button title="📂 Pick from Gallery" onPress={pickFromGallery} />
      <View style={{height: 20}} />
      <Button title="📷 Open Camera" onPress={openCamera} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
});