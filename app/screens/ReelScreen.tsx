import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  StatusBar,
  Text,
  ActivityIndicator,
  ViewToken,
} from 'react-native';
import {fetchReelMoods, fetchReelsFeed} from '../utils/api';
import PagerView from 'react-native-pager-view';
import ReelCard from '../components/ReelCard';

const {height} = Dimensions.get('window');

type Reel = {
  _id: string;
  videoUrl?: string;
  mood: string;
  hashtags: string[];
  caption?: string;
  creatorId: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  createdAt: string;
};

const MoodPagerScreen = () => {
  const [moods, setMoods] = useState<string[]>([]);
  const [activeMoodIndex, setActiveMoodIndex] = useState<number>(0);
  const [reelsByMood, setReelsByMood] = useState<Record<string, Reel[]>>({});
  const [pageByMood, setPageByMood] = useState<Record<string, number>>({});
  const [activeReelIndexByMood, setActiveReelIndexByMood] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const pagerRef = useRef<PagerView>(null);

  useEffect(() => {
    const fetchMoods = async () => {
      try {
        const response = await fetchReelMoods();
        setMoods(response.data);
      } catch (error) {
        console.error('Failed to fetch moods:', error);
      }
    };

    fetchMoods();
  }, []);

  useEffect(() => {
    if (moods.length === 0) return;
    fetchReelsForMood(moods[activeMoodIndex], 1);
  }, [activeMoodIndex, moods]);

  const fetchReelsForMood = async (mood: string, page: number) => {
    try {
      const response = await fetchReelsFeed(mood, page);
      setReelsByMood(prev => ({
        ...prev,
        [mood]:
          page === 1
            ? response.data
            : [...(prev[mood] || []), ...response.data],
      }));
      setPageByMood(prev => ({...prev, [mood]: page}));
    } catch (error) {
      console.error(`Failed to fetch reels for mood ${mood}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const onViewableItemsChanged = useCallback(
    (mood: string) =>
      ({viewableItems}: {viewableItems: Array<ViewToken>}) => {
        if (viewableItems.length > 0) {
          const currentIndex = viewableItems[0].index || 0;
          setActiveReelIndexByMood(prev => ({...prev, [mood]: currentIndex}));
        }
      },
    [],
  );

  const renderReels = (mood: string) => {
    const reels = reelsByMood[mood] || [];
    const activeIndex = activeReelIndexByMood[mood] || 0;

    return (
      <FlatList
        data={reels}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onEndReached={() =>
          fetchReelsForMood(mood, (pageByMood[mood] || 1) + 1)
        }
        onEndReachedThreshold={0.2}
        renderItem={({item, index}) => {
          const videoUrl = item.videoUrl?.trim().replace(/^\/+/g, '') || '';
          return (
            <ReelCard
              id={item._id}
              reelId={item._id}
              uri={videoUrl}
              isActive={index === activeIndex}
              caption={item.caption}
              mood={item.mood}
              hashtags={item.hashtags}
              creatorId={item.creatorId}
              likes={item.likes}
              comments={item.comments}
              shares={item.shares}
              saves={item.saves}
              createdAt={item.createdAt}
            />
          );
        }}
        contentContainerStyle={{minHeight: height}}
        onViewableItemsChanged={onViewableItemsChanged(mood)}
        viewabilityConfig={{itemVisiblePercentThreshold: 80}}
      />
    );
  };

  if (loading && moods.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{color: 'white', marginTop: 10}}>Loading moods...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {moods.length > 0 && (
        <View style={styles.moodLabel}>
          <Text style={styles.moodText}>
            {moods[activeMoodIndex]?.toUpperCase()}
          </Text>
        </View>
      )}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={e => setActiveMoodIndex(e.nativeEvent.position)}>
        {moods.map(mood => (
          <View key={mood} style={styles.page}>
            {renderReels(mood)}
          </View>
        ))}
      </PagerView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'black'},
  pagerView: {flex: 1},
  page: {flex: 1},
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
