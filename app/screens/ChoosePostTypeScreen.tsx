import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ReelStackParamList } from '../navigation/ReelStackNavigator';

type NavigationProp = NativeStackNavigationProp<ReelStackParamList, 'ChoosePostTypeScreen'>;

export default function ChoosePostTypeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const handleSelect = (type: 'post' | 'reel' | 'story') => {
    if (type === 'reel') {
      navigation.navigate('VideoPickerScreen');
    } else {
      // Placeholder — add navigation to Post/Story flow when ready
      Alert.alert(`${type.toUpperCase()} feature coming soon!`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create</Text>
      <TouchableOpacity style={styles.option} onPress={() => handleSelect('post')}>
        <Text style={styles.optionText}>Post</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => handleSelect('reel')}>
        <Text style={styles.optionText}>Reel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => handleSelect('story')}>
        <Text style={styles.optionText}>Story</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  option: {
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
