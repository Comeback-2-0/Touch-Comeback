import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import HeaderBar from '../components/HeaderBar';
import ToolButton from '../components/ToolButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReelStackParamList } from '../navigation/types/ReelStackParamList';

type Props = NativeStackScreenProps<ReelStackParamList, 'ReelEditor'>;

export default function ReelEditorScreen({ navigation, route }: Props) {
  const { videoUri } = route.params;

  return (
    <View style={styles.container}>
      <HeaderBar
        onClose={() => navigation.goBack()}
        onNext={() => navigation.navigate('ReelShare', { videoUri })}
        showClose={true}
        showNext={true}
      />

      <View style={styles.videoContainer}>
        <Image source={{ uri: videoUri }} style={styles.videoPreview} />
        <Text style={styles.duration}>00:30</Text>
      </View>

      <View style={styles.frameStrip}>
        <Text>[Frame Strips Here]</Text>
      </View>

      <View style={styles.tools}>
        <ToolButton iconName="cut" label="Trim" onPress={() => navigation.navigate('ReelTrim', { videoUri })} />
        <ToolButton iconName="musical-notes" label="Audio" onPress={() => navigation.navigate('ReelAudio', { videoUri })} />
        <ToolButton iconName="text" label="Text" onPress={() => navigation.navigate('ReelText', { videoUri })} />
        <ToolButton iconName="color-palette" label="Filter" onPress={() => navigation.navigate('ReelFilter', { videoUri })} />
        <ToolButton iconName="create" label="Edit" onPress={() => navigation.navigate('ReelEdit', { videoUri })} />
        <ToolButton iconName="mic" label="Mic" onPress={() => navigation.navigate('ReelMic', { videoUri })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  videoContainer: { alignItems: 'center', marginVertical: 12 },
  videoPreview: { width: '90%', height: 250, borderRadius: 10 },
  duration: { marginTop: 6, fontSize: 14 },
  frameStrip: { marginTop: 10, padding: 10, alignItems: 'center' },
  tools: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
});
