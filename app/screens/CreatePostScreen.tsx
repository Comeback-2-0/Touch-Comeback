import React, { useRef, useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../navigation/ChatNavigator';
import { Post } from '../types/Post';
import { io } from 'socket.io-client';
import { usePostQueue } from '../context/PostQueueContext';

type Props = NativeStackScreenProps<ChatStackParamList, 'CreatePostScreen'>;

const CreatePostScreen = ({ route, navigation }: Props) => {
  const { group, userId } = route.params;
  const { addPostToQueue } = usePostQueue(); // ✅ Use context instead of onPostCreated
  const [text, setText] = useState('');
  const socketRef = useRef<any>(null);

  const handlePost = () => {
    if (!text.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      content: text,
      likes: 0,
      comments: [],
    };

    // ✅ Send message through socket
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:3333');
    }

    socketRef.current.emit('sendMessage', {
      communityId: group.id,
      text,
      senderAnonymousId: userId,
    });

    // ✅ Add post to queue using context
    addPostToQueue(newPost);

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Write your post..."
        value={text}
        onChangeText={setText}
        multiline
        style={styles.input}
      />
      <Button title="Post" onPress={handlePost} color="#4CAF50" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  input: {
    height: 150,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
});

export default CreatePostScreen;
