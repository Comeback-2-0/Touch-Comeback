// app/components/CommentBox.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

type Props = {
  onSubmit: (text: string) => void;
  placeholder?: string; 
};

const CommentBox: React.FC<Props> = ({ onSubmit, placeholder = 'Add a comment' }) => {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };

  return (
    <View style={styles.box}>
      <TextInput
        placeholder={placeholder} 
        value={text}
        onChangeText={setText}
        style={styles.input}
      />
      <Button title="Send" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
});

export default CommentBox;
