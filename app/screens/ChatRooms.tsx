import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';

// Define the type for route parameters
type RootStackParamList = {
  ChatRoom: {
    community: {
      name: string;
      // Add more fields as needed
    };
  };
};

// Define the route prop type for ChatRoom screen
type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;

type Props = {
  route: ChatRoomRouteProp;
};

export default function ChatRoom({ route }: Props) {
  const { community } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{community.name}</Text>
      <View style={styles.messages}>
        <Text style={{ color: 'gray' }}>
          Start chatting with the community...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#ff00ff',
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  messages: {
    flex: 1,
    padding: 20,
  },
});
