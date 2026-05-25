import React from 'react';
import {StatusBar} from 'react-native';

export default function AppSystemBars() {
  return (
    <StatusBar
      translucent
      backgroundColor="transparent"
      barStyle="dark-content"
    />
  );
}
