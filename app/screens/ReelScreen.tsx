import React, { useState, useRef } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  StatusBar,
  Text,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { moodBasedReels } from '../data/ReelsData'; // updated dummy data
import ReelCard from '../components/ReelCard';

const { height } = Dimensions.get('window');

const MoodPagerScreen = () => {
  const [activeMoodIndex, setActiveMoodIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const renderReels = (reels: any[]) => {
    const [activeReelIndex, setActiveReelIndex] = useState(0);

    return (
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ minHeight: height }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / height);
          setActiveReelIndex(index);
        }}
        renderItem={({ item, index }) => (
          <ReelCard
            uri={item.uri}
            isActive={index === activeReelIndex}
            caption={item.caption}
            user={item.user}
          />
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {/* Mood Label at Top */}
      <View style={styles.moodLabel}>
        <Text style={styles.moodText}>
          {moodBasedReels[activeMoodIndex]?.mood.toUpperCase()}
        </Text>
      </View>

      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setActiveMoodIndex(e.nativeEvent.position)}
      >
        {moodBasedReels.map((moodItem) => (
          <View key={moodItem.mood} style={styles.page}>
            {renderReels(moodItem.reels)}
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
});

export default MoodPagerScreen;