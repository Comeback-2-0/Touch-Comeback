import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Dimensions,
  Image,
  Modal,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Slider from '@react-native-community/slider'; // Importing the community slider
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ReelStackParamList } from '../navigation/ReelStackNavigator';
import { Alert } from 'react-native';
type NavigationProp = NativeStackNavigationProp<ReelStackParamList, 'VideoEditingScreen'>;
type RouteProps = RouteProp<ReelStackParamList, 'VideoEditingScreen'>;

const { width } = Dimensions.get('window');

const audioRecorderPlayer = new AudioRecorderPlayer();

const fonts = ['System', 'Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana'];
const filters = [
  { name: 'Normal', value: 'none' },
  { name: 'Saturate', value: 'saturate(2)' },
  { name: 'Contrast', value: 'contrast(1.5)' },
  { name: 'Sepia', value: 'sepia(0.8)' },
  { name: 'Grayscale', value: 'grayscale(1)' },
  { name: 'Invert', value: 'invert(1)' },
];

export default function VideoEditingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const video = route.params?.video;
  const videoRef = useRef(null);

  const [textOverlay, setTextOverlay] = useState('');
  const [overlayPosition, setOverlayPosition] = useState({ x: width / 2, y: (width * 16) / 9 / 2 });
  const [selectedFont, setSelectedFont] = useState(fonts[0]);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('none');
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [duration, setDuration] = useState(10);
  const [isDraggingOverlay, setIsDraggingOverlay] = useState(false);
  
  // Audio states
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedAudioPath, setRecordedAudioPath] = useState('');
  const [playTime, setPlayTime] = useState('00:00');
  const [recordTime, setRecordTime] = useState('00:00');
  const [includeOriginalAudio, setIncludeOriginalAudio] = useState(true);

  useEffect(() => {
    return () => {
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  const onVideoLoad = (data: { duration: number }) => {
    setDuration(data.duration);
    setEndTime(data.duration);
  };

  const renderTextOverlay = () => {
    if (!textOverlay) return null;
    return (
      <View 
        style={[
          styles.textOverlay, 
          { 
            transform: [{ translateX: overlayPosition.x }, { translateY: overlayPosition.y }]
          }
        ]}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={() => setIsDraggingOverlay(true)}
        onResponderMove={(e) => {
          if (isDraggingOverlay) {
            setOverlayPosition({
              x: e.nativeEvent.locationX,
              y: e.nativeEvent.locationY
            });
          }
        }}
        onResponderRelease={() => setIsDraggingOverlay(false)}
      >
        <Text style={{ color: 'white', fontSize: 24, fontFamily: selectedFont }}>
          {textOverlay}
        </Text>
      </View>
    );
  };

  const applyTrim = () => {
    Alert.alert('Info', 'Video trim will be processed when saved');
    setShowTrimModal(false);
  };

  // Audio recording functions
  const onStartRecord = async () => {
    try {
      const path = await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecordBackListener((e: any) => {
        const time = audioRecorderPlayer.mmss(Math.floor(e.current_position / 1000));
        setRecordTime(time);
        return;
      });
      setIsRecording(true);
      setRecordedAudioPath(path);
    } catch (err) {
      console.log('Error starting recording: ', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const onStopRecord = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
    } catch (err) {
      console.log('Error stopping recording: ', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const onStartPlay = async () => {
    try {
      if (!recordedAudioPath) return;
      
      await audioRecorderPlayer.startPlayer(recordedAudioPath);
      audioRecorderPlayer.addPlayBackListener((e: any) => {
        const time = audioRecorderPlayer.mmss(Math.floor(e.current_position / 1000));
        setPlayTime(time);
        if (e.current_position === e.duration) {
          audioRecorderPlayer.stopPlayer();
          setIsPlaying(false);
        }
        return;
      });
      setIsPlaying(true);
    } catch (err) {
      console.log('Error playing audio: ', err);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const onStopPlay = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
    } catch (err) {
      console.log('Error stopping playback: ', err);
      Alert.alert('Error', 'Failed to stop playback');
    }
  };

  const onDeleteRecording = () => {
    setRecordedAudioPath('');
    setPlayTime('00:00');
    setRecordTime('00:00');
    onStopPlay();
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {video ? (
          <>
            <Video
              ref={videoRef}
              source={{ uri: video.uri }}
              style={[styles.video, { filter: currentFilter }]}
              resizeMode="contain"
              paused={false}
              onLoad={onVideoLoad}
              volume={includeOriginalAudio ? 1 : 0}
            />
            {renderTextOverlay()}
          </>
        ) : (
          <Text>No video selected</Text>
        )}
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={() => setShowTextModal(true)}
        >
          <Icon name="text-fields" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="photo-filter" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={() => setShowTrimModal(true)}
        >
          <Icon name="content-cut" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={() => setShowAudioModal(true)}
        >
          <Icon name="mic" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={() => navigation.navigate('ReelUploadScreen', { video })}
        >
          <Icon name="check" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Audio Recording Modal */}
      <Modal
        visible={showAudioModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAudioModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { width: '90%' }]}>
            <Text style={styles.modalTitle}>Audio Recording</Text>
            
            <View style={styles.audioControlRow}>
              {!isRecording ? (
                <TouchableOpacity 
                  style={styles.recordButton}
                  onPress={onStartRecord}
                >
                  <Icon name="mic" size={28} color="white" />
                  <Text style={styles.recordButtonText}>Record</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={[styles.recordButton, { backgroundColor: 'red' }]}
                  onPress={onStopRecord}
                >
                  <Icon name="stop" size={28} color="white" />
                  <Text style={styles.recordButtonText}>Stop</Text>
                </TouchableOpacity>
              )}
              
              <Text style={styles.timeText}>{recordTime}</Text>
            </View>

            {recordedAudioPath ? (
              <>
                <View style={styles.audioControlRow}>
                  {!isPlaying ? (
                    <TouchableOpacity 
                      style={styles.playButton}
                      onPress={onStartPlay}
                    >
                      <Icon name="play-arrow" size={28} color="white" />
                      <Text style={styles.playButtonText}>Play</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={styles.playButton}
                      onPress={onStopPlay}
                    >
                      <Icon name="pause" size={28} color="white" />
                      <Text style={styles.playButtonText}>Pause</Text>
                    </TouchableOpacity>
                  )}
                  
                  <Text style={styles.timeText}>{playTime}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={onDeleteRecording}
                >
                  <Icon name="delete" size={20} color="white" />
                  <Text style={styles.deleteButtonText}>Delete Recording</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.noRecordingText}>No recording yet</Text>
            )}

            <View style={styles.audioOption}>
              <Text style={styles.optionText}>Include Original Audio:</Text>
              <TouchableOpacity
                onPress={() => setIncludeOriginalAudio(!includeOriginalAudio)}
                style={styles.toggleButton}
              >
                <Icon 
                  name={includeOriginalAudio ? "toggle-on" : "toggle-off"} 
                  size={36} 
                  color={includeOriginalAudio ? "green" : "gray"} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowAudioModal(false)}
            >
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rest of the modals (Text, Filter, Trim) remain the same as previous code */}
      {/* ... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width: width,
    height: (width * 16) / 9,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  toolButton: {
    backgroundColor: '#333',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  textOverlay: {
    position: 'absolute',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Audio specific styles
  audioControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  recordButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    justifyContent: 'center',
  },
  recordButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    justifyContent: 'center',
  },
  playButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  timeText: {
    color: 'white',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  deleteButtonText: {
    color: 'white',
    marginLeft: 8,
  },
  noRecordingText: {
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  audioOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
  toggleButton: {
    padding: 5,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // Rest of your styles...
});
