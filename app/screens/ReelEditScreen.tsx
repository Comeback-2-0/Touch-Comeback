import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import { FFmpegKit } from '@react-native-oh-tpl/react-native-ffmpeg-kit';
import { ReelStackParamList } from '../navigation/types/ReelStackParamList';

type Props = NativeStackScreenProps<ReelStackParamList, 'ReelEdit'>;

export default function ReelEditScreen({ navigation, route }: Props) {
  const { videoUri } = route.params;
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(15);

  const handleTrim = async () => {
    const outputPath = `${Platform.OS === 'android' ? '/sdcard/' : ''}trimmedVideo_${Date.now()}.mp4`;
    const command = `-i "${videoUri}" -ss ${startTime} -to ${endTime} -c copy "${outputPath}"`;

    try {
      console.log('Executing FFmpeg command:', command);
      const session = await FFmpegKit.execute(command);
      const returnCode = await session.getReturnCode();

      if (returnCode?.isSuccess()) {
        console.log('Trim successful:', outputPath);
        navigation.navigate('ReelEditor', { videoUri: `file://${outputPath}` });
      } else {
        console.error('FFmpeg failed', await session.getAllLogsAsString());
        Alert.alert('Trimming failed. Check logs.');
      }
    } catch (err) {
      console.error('FFmpegKit error:', err);
      Alert.alert('Unexpected error during trimming');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trim Video</Text>
      <Video
        source={{ uri: videoUri }}
        style={styles.video}
        controls
        resizeMode="contain"
      />
      <Text>Start Time: {startTime.toFixed(1)}s</Text>
      <Slider
        minimumValue={0}
        maximumValue={endTime}
        value={startTime}
        onValueChange={setStartTime}
      />
      <Text>End Time: {endTime.toFixed(1)}s</Text>
      <Slider
        minimumValue={startTime + 1}
        maximumValue={60}
        value={endTime}
        onValueChange={setEndTime}
      />
      <View style={styles.buttonRow}>
        <Button title="Discard" onPress={() => navigation.goBack()} />
        <Button title="Save Trim" onPress={handleTrim} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
  video: { height: 200, backgroundColor: '#000', marginBottom: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
});
