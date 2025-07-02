import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, PermissionsAndroid, Platform, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { ReelStackParamList } from '../navigation/types/ReelStackParamList';

type Props = NativeStackScreenProps<ReelStackParamList, 'ReelMic'>;

const audioRecorderPlayer = new AudioRecorderPlayer();

export default function ReelMicScreen({ navigation, route }: Props) {
  const { videoUri } = route.params;
  const [recording, setRecording] = useState(false);
  const [audioPath, setAudioPath] = useState<string | null>(null);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      return Object.values(granted).every(p => p === PermissionsAndroid.RESULTS.GRANTED);
    }
    return true;
  };

  const onStartRecord = async () => {
    if (!(await requestPermission())) return Alert.alert('Permission denied');
    const path = await audioRecorderPlayer.startRecorder();
    setAudioPath(path);
    setRecording(true);
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRecording(false);
    setAudioPath(result);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Over</Text>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? onStopRecord : onStartRecord}
      />
      <View style={styles.buttonRow}>
        <Button title="Discard" onPress={() => navigation.goBack()} />
        <Button
          title="Save"
          onPress={() => {
            if (audioPath) {
              navigation.navigate('ReelEditor', { videoUri });
            } else {
              Alert.alert('No recording found');
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30 },
});
