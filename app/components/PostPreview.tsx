// app/components/PostPreview.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Asset } from 'react-native-image-picker';

interface Props {
  text: string;
  image: Asset | null;
}

export default function PostPreview({ text, image }: Props) {
  if (!text.trim() && !image) return null;

  return (
    <View style={styles.previewCard}>
      <Text style={styles.previewHeader}>🔍 Post Preview</Text>
      {image && (
        <Image
          source={{ uri: image.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      )}
      {!!text.trim() && <Text style={styles.previewText}>{text.trim()}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fdfdfd',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  previewText: {
    fontSize: 15,
    color: '#444',
  },
});
