// app/components/ReplyBubble.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Reply } from '../navigation/types/Post';
import dayjs from 'dayjs';

type Props = {
  reply: Reply;
};

export default function ReplyBubble({ reply }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{reply.text}</Text>
      <Text style={styles.date}>{dayjs(reply.createdAt).format('MMM D, YYYY')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 20,
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  text: {
    fontSize: 13,
    color: '#333',
  },
  date: {
    fontSize: 10,
    color: '#666',
  },
});