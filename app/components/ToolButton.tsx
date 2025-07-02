import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';


interface ToolButtonProps {
  iconName: string;
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

const ToolButton = ({ iconName, label, onPress, style }: ToolButtonProps) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Ionicons name={iconName} size={24} color="black" />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    margin: 8,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default ToolButton;
