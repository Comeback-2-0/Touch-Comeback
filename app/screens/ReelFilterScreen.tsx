import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReelStackParamList } from '../navigation/types/ReelStackParamList';

type Props = NativeStackScreenProps<ReelStackParamList, 'ReelFilter'>;

const filters = ['None', 'Vintage', 'Black & White', 'Sepia', 'Cool', 'Warm'];

export default function ReelFilterScreen({ navigation, route }: Props) {
  const { videoUri } = route.params;
  const [selectedFilter, setSelectedFilter] = useState('None');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Filter</Text>
      <FlatList
        data={filters}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedFilter(item)}
            style={[styles.filterOption, selectedFilter === item && styles.selected]}
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.buttonRow}>
        <Button title="Discard" onPress={() => navigation.goBack()} />
        <Button title="Save" onPress={() => navigation.navigate('ReelEditor', { videoUri })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 10 },
  filterOption: {
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  selected: {
    backgroundColor: '#ddd',
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
});
