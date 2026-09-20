import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Reply} from '../navigation/types/Post';
import dayjs from 'dayjs';
import {pastelColors} from '../theme/colors';

type Props = {
  reply: Reply;
};

export default function ReplyBubble({reply}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{reply.text}</Text>
      {reply.createdAt ? (
        <Text style={styles.date}>{dayjs(reply.createdAt).format('MMM D, YYYY')}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 16,
    marginTop: 6,
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 2,
    borderLeftColor: pastelColors.auth.glassBorder,
    backgroundColor: pastelColors.auth.glassSurface,
  },
  text: {
    fontSize: 13,
    color: pastelColors.auth.deepText,
    fontWeight: '600',
  },
  date: {
    marginTop: 4,
    fontSize: 10,
    color: pastelColors.auth.mutedText,
    fontWeight: '700',
  },
});
