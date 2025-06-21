import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  content: string;
}

const QueueCard: React.FC<Props> = ({ content }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.text}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: '#d8eaff',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
});

export default QueueCard;
