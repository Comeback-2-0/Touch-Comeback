// app/components/QueueCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface Props {
  content: string;
  image?: string;
}

const QueueCard: React.FC<Props> = ({ content, image }) => {
  const imageUrl = image?.startsWith('http')
    ? image
    : image
    ? `https://api.comeback.website/${image}`
    : null;

  return (
    <View style={styles.card}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <Text style={styles.text}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default QueueCard;