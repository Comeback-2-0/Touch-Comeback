import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {pastelColors} from '../../../theme/colors';

type Props = {
  isPrivate: boolean;
};

export default function ProfileStatusPill({isPrivate}: Props) {
  return (
    <View style={styles.pill}>
      <Ionicons
        name={isPrivate ? 'lock-closed' : 'earth'}
        size={14}
        color={pastelColors.auth.deepText}
      />
      <Text style={styles.text}>{isPrivate ? 'Private Account' : 'Public Account'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: pastelColors.card,
  },
  text: {
    color: pastelColors.auth.deepText,
    fontSize: 12,
    fontWeight: '800',
  },
});
