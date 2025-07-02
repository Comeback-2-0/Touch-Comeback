import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onToggle: () => void;
}

const ToggleRow = ({ label, value, onToggle }: ToggleRowProps) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
  },
});

export default ToggleRow;
