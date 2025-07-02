import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ReelStackParamList } from '../navigation/types/ReelStackParamList';
import HeaderBar from '../components/HeaderBar';
import ToggleRow from '../components/ToggleRow';
import TagSearchModal from '../components/TagSearchModal';
type Props = NativeStackScreenProps<ReelStackParamList, 'ReelShare'>;
export default function ReelShareScreen({ navigation, route }:Props) {
  const { videoUri } = route.params;
  const [caption, setCaption] = useState('');
  const [hideComments, setHideComments] = useState(false);
  const [hideLikes, setHideLikes] = useState(false);
  const [hideShares, setHideShares] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleShare = () => {
    // TODO: Upload video + metadata
    navigation.navigate('ReelMenu'); // Or Home
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        onClose={() => setModalVisible(true)}
        showClose={true}
        showNext={false}
      />

      <TextInput
        placeholder="Write a caption..."
        value={caption}
        onChangeText={setCaption}
        style={styles.captionInput}
      />

      <ToggleRow label="No commenting" value={hideComments} onToggle={() => setHideComments(!hideComments)} />
      <ToggleRow label="Hide like count" value={hideLikes} onToggle={() => setHideLikes(!hideLikes)} />
      <ToggleRow label="Hide share count" value={hideShares} onToggle={() => setHideShares(!hideShares)} />

      <Button title="Tag People" onPress={() => setModalVisible(true)} />
      <Button title="Share" onPress={handleShare} />

      <TagSearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        users={['John', 'Jane', 'Ravi', 'Ananya']}
        onSelect={(u) => console.log('Tagged:', u)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  captionInput: {
    height: 100,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
});
