import React, { useState } from 'react';
import { Modal, View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TagSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (user: string) => void;
  users: string[];
}

const TagSearchModal = ({ visible, onClose, onSelect, users }: TagSearchModalProps) => {
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => u.toLowerCase().includes(search.toLowerCase()));

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <TextInput
          placeholder="Search people..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { onSelect(item); onClose(); }}>
              <Text style={styles.user}>{item}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.close}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 12 },
  user: { paddingVertical: 10, fontSize: 16 },
  close: { marginTop: 20, color: 'blue', textAlign: 'center' },
});

export default TagSearchModal;
