import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface HeaderBarProps {
  onBack?: () => void;
  onNext?: () => void;
  onClose?: () => void;
  nextLabel?: string;
  showClose?: boolean;
  showNext?: boolean;
}

const HeaderBar = ({
  onBack,
  onNext,
  onClose,
  nextLabel = 'Next',
  showClose = true,
  showNext = true,
}: HeaderBarProps) => {
  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      )}
      {showClose && (
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      )}
      {showNext && (
        <TouchableOpacity onPress={onNext}>
          <Text style={styles.next}>{nextLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  next: {
    fontSize: 16,
    fontWeight: '600',
    color: 'blue',
  },
});

export default HeaderBar;
