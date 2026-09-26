import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {pastelColors} from '../theme/colors';

type Props = {
  onSubmit: (text: string) => void;
  placeholder?: string;
};

const CommentBox: React.FC<Props> = ({onSubmit, placeholder = 'Write a comment'}) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <View style={styles.box}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={pastelColors.auth.mutedText}
        value={text}
        onChangeText={setText}
        style={styles.input}
        multiline
        scrollEnabled
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send comment"
        onPress={handleSubmit}
        disabled={!text.trim()}
        style={styles.send}>
        <Feather
          name="send"
          size={20}
          color={text.trim() ? pastelColors.accent : pastelColors.auth.mutedText}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: pastelColors.white,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    color: pastelColors.auth.deepText,
    paddingRight: 8,
  },
  send: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CommentBox;
