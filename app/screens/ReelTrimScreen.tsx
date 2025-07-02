import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReelStackParamList } from '../navigation/types/ReelStackParamList'; // adjust path if needed

type Props = NativeStackScreenProps<ReelStackParamList, 'ReelTrim'>;

export default function ReelTrimScreen({ navigation, route }: Props) {
  const { videoUri } = route.params;

  const handleSave = () => {
    // handle trim save
    navigation.navigate('ReelEditor', { videoUri });
  };

  return (
    <View style={styles.container}>
      <Text>Trim Video Screen</Text>
      <Button title="Save" onPress={handleSave} />
      <Button title="Discard" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
