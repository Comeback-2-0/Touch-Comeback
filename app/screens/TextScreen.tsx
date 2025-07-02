import React from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReelStackParamList } from '../navigation/types/ReelStackParamList'; 

type Props = NativeStackScreenProps<ReelStackParamList, 'ReelText'>; 

export default function ReelTextScreen({ navigation, route }: Props) { 
  const { videoUri } = route.params;
  const [text, setText] = React.useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Text</Text>
      <TextInput
        placeholder="Your text here..."
        value={text}
        onChangeText={setText}
        style={styles.input}
      />
      <View style={styles.buttonRow}>
        <Button title="Discard" onPress={() => navigation.goBack()} />
        <Button title="Save" onPress={() => navigation.navigate('ReelEditor', { videoUri })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
});
