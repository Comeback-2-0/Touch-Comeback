// app/components/GroupCard.tsx
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

type Props = {
  name: string;
  members: number;
  latestPost?: string;
  unreadCount?: number;
  onPress: () => void;
  joinButton?: boolean;
  onJoinPress?: () => void;
};

export default function GroupCard({
  name,
  members,
  latestPost,
  unreadCount,
  onPress,
  joinButton,
  onJoinPress,
}: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.members}>{members} members</Text>
        {latestPost && <Text style={styles.preview}>{latestPost}</Text>}
        {typeof unreadCount === 'number' && <Text>Unread: {unreadCount}</Text>}
        {joinButton && (
          <TouchableOpacity onPress={onJoinPress} style={styles.joinBtn}>
            <Text style={styles.joinText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff0f5',
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  members: {
    fontSize: 14,
    color: '#888',
  },
  joinBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  joinText: {
    color: 'white',
    fontWeight: '600',
  },
  preview: {
    marginTop: 6,
    color: '#555',
    fontStyle: 'italic',
  },
});