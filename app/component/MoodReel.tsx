import React, { useState } from 'react';
import { FlatList, useWindowDimensions } from 'react-native';
import ReelCard from './ReelCard';

interface Reel {
  id: string;
  uri: string;
}

interface Mood {
  id: string;
  name: string;
  reels: Reel[];
}

const MoodReel = ({ mood }: { mood: Mood }) => {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const { height } = useWindowDimensions();

  return (
    <FlatList
      data={mood.reels}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <ReelCard uri={item.uri} isActive={index === activeReelIndex} />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onMomentumScrollEnd={(e) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / height);
        setActiveReelIndex(index);
      }}
    />
  );
};

export default MoodReel;
