// app/components/QueueItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function QueueItem({ text }: { text: string }) {
  return (
    <View style={styles.item}>
      <Text>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#F0FFFF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
});