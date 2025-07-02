import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReelStackParamList } from '../navigation/types/ReelStackParamList';
type Props = NativeStackScreenProps<ReelStackParamList, 'ReelMenu'>
export default function ReelMenuScreen({ navigation }:Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.option}>
        <MaterialCommunityIcons name="post-outline" size={24} color="gray" />
        <Text style={styles.text}>Post</Text>
      </TouchableOpacity> 
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate('ReelPicker')}>
        <MaterialCommunityIcons name="movie-open-outline" size={24} color="black" />
        <Text style={styles.text}>Reel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option}>
        <Ionicons name="time-outline" size={24} color="black" />
        <Text style={styles.text}>Story</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
  },
  option: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 12, padding: 12,
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, width: '80%', justifyContent: 'center'
  },
  text: {
    fontSize: 18, marginLeft: 10
  }
});
