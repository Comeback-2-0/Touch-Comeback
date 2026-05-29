import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {pastelColors} from '../../../theme/colors';

type Props = {
  posts: number;
  followers: number;
  following: number;
};

function Stat({value, label}: {value: number; label: string}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export default function ProfileStats({posts, followers, following}: Props) {
  return (
    <View style={styles.container}>
      <Stat value={posts} label="Posts" />
      <Stat value={followers} label="Followers" />
      <Stat value={following} label="Following" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: pastelColors.auth.glassSurfaceStrong,
    borderWidth: 1,
    borderColor: pastelColors.auth.glassBorder,
  },
  stat: {
    alignItems: 'center',
    minWidth: 78,
  },
  value: {
    color: pastelColors.auth.deepText,
    fontSize: 18,
    fontWeight: '900',
  },
  label: {
    marginTop: 3,
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
});
