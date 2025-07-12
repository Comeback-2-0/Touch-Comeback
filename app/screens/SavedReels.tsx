import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

interface Reel {
  reelId: string;
  caption: string;
}

interface SavedReelsScreenProps {
  route: {
    params: {
      userId: string; // Access userId from route params
    };
  };
}

const SavedReelsScreen: React.FC<SavedReelsScreenProps> = ({ route }) => {
  const { userId } = route.params; // Get the userId from the route params
  const [savedReels, setSavedReels] = useState<Reel[]>([]); // State to store the saved reels
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState<string | null>(null); // State for handling errors

  useEffect(() => {
    const fetchSavedReels = async () => {
      try {
        //const response = await axios.get(`http://172.16.59.26:3333/api/reels/saved/${userId}`);
        //setSavedReels(response.data); // Store the fetched data in the state
      } catch (err) {
        setError('Failed to fetch saved reels'); // Handle the error
        console.error('Failed to fetch saved reels:', err);
      } finally {
        setLoading(false); // Hide the loading spinner once data is fetched or error occurred
      }
    };

    fetchSavedReels();
  }, [userId]); // Re-run the effect if userId changes

  // Render each reel in the FlatList
  const renderReel = ({ item }: { item: Reel }) => (
    <View style={styles.reelContainer}>
      <Text style={styles.captionText}>{item.caption}</Text>
    </View>
  );

  // Loading and error UI
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Saved Reels...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Reels</Text>
      {savedReels.length === 0 ? (
        <Text>No saved reels found.</Text> // Handle case when there are no saved reels
      ) : (
        <FlatList
          data={savedReels}
          renderItem={renderReel}
          keyExtractor={(item) => item.reelId}
        />
      )}
    </View>
  );
};

// Add some styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reelContainer: {
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  captionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SavedReelsScreen; 
