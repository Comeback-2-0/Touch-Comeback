import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Button,
  StyleSheet,
} from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';
import {RouteProp} from '@react-navigation/native';
import {CommunitiesStackParamList} from '../navigation/CommunityStack';
import {API_URL} from '../utils/api';

type ChatRoomRouteProp = RouteProp<CommunitiesStackParamList, 'ChatRoom'>;

type Props = {
  route: ChatRoomRouteProp;
};

type Message = {
  communityId: string;
  content: string;
  senderAnonymousId: string;
};

const socket = io(API_URL);

export default function ChatRoom({route}: Props) {
  const {community} = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const anonymousId = useRef(
    'anon_' + Math.floor(Math.random() * 10000),
  ).current;

  useEffect(() => {
    socket.emit('joinRoom', community._id);

    axios.get(`${API_URL}/messages/${community._id}`).then(res => {
      setMessages(res.data);
    });

    socket.on('newMessage', (message: Message) => {
      setMessages((prev: Message[]) => [...prev, message]);
    });

    return () => {
      socket.off('newMessage');
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;

    const message = {
      communityId: community._id,
      content: input,
      senderAnonymousId: anonymousId,
    };

    socket.emit('sendMessage', message);

    axios.post(`${API_URL}/messages`, message);

    setInput('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item}) => (
          <Text style={styles.msg}>
            {item.senderAnonymousId}: {item.content}
          </Text>
        )}
        removeClippedSubviews={false}
      />

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Type anonymously..."
          value={input}
          onChangeText={setInput}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 10},
  msg: {
    padding: 6,
    backgroundColor: '#eee',
    borderRadius: 6,
    marginVertical: 2,
  },
  inputBox: {flexDirection: 'row', alignItems: 'center'},
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 6,
    padding: 10,
    marginRight: 10,
  },
});
