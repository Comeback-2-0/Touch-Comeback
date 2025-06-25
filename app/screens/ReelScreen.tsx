import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  StatusBar,
  Text,
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import axios from 'axios';
import ReelCard from '../components/ReelCard';

const { height } = Dimensions.get('window');

// Define types
type Comment = {
  id: string;
  text: string;
};

type User = {
  username: string;
  profilePic: string;
};

type Reel = {
  id: string;
  uri: string;
  caption: string;
  music: string;
  likeCount: number;
  comments: Comment[];
  user: User;
  reelId?: string;
};

type MoodReel = {
  mood: string;
  reels: Reel[];
};

const MoodPagerScreen = () => {
  const [reelsByMood, setReelsByMood] = useState<MoodReel[]>([]);
  const [activeMoodIndex, setActiveMoodIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeReelIndexes, setActiveReelIndexes] = useState<number[]>([]);
  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await axios.get('http://172.16.59.34:3333/api/reels');
        setReelsByMood(response.data);
        setActiveReelIndexes(Array(response.data.length).fill(0));
      } catch (error) {
        console.error('Failed to fetch reels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  const handleReelScroll = (
    moodIndex: number,
    yOffset: number
  ) => {
    const index = Math.round(yOffset / height);
    setActiveReelIndexes((prev) => {
      const updated = [...prev];
      updated[moodIndex] = index;
      return updated;
    });
  };

  const renderReels = (reels: Reel[], moodIndex: number) => {
    return (
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ minHeight: height }}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          handleReelScroll(moodIndex, e.nativeEvent.contentOffset.y);
        }}
        renderItem={({ item, index }) => (
          <ReelCard
            id={item.id}
            reelId={item.reelId ?? ''}
            uri={item.uri}
            isActive={index === activeReelIndexes[moodIndex]}
            caption={item.caption}
            user={item.user}
          />
        )}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: 'white', marginTop: 10 }}>Loading reels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.moodLabel}>
        <Text style={styles.moodText}>
          {reelsByMood[activeMoodIndex]?.mood?.toUpperCase()}
        </Text>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setActiveMoodIndex(e.nativeEvent.position)}
      >
        {reelsByMood.map((moodItem, index) => (
          <View key={moodItem.mood} style={styles.page}>
            {renderReels(moodItem.reels, index)}
          </View>
        ))}
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  moodLabel: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  moodText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MoodPagerScreen;
