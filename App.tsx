/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */



// 1:34:00

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';


import MainNavigator from './app/src/navigation/Navigation';
// If you're not using ChatNavigation right now, you can safely comment/remove this line
// import AppNavigator from './src/navigation/ChatNavigation';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
};

export default App;




/*

import { StyleSheet, Text, View, Image, Button, TouchableOpacity, Alert, Pressable, SafeAreaView, useColorScheme, ScrollView, TextInput } from 'react-native'
import React, { useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';


const App = () => {

  // const [text, setText] = useState('')
  useEffect(() => {
    SplashScreen.hide(); // Hide the splash screen after the app has loaded
     }, []);

  const style = {
    container:{
      width: '100%',
      height: '100%',
      backgroundColor:"red",
    }
  }

  return(
    <SafeAreaView
    style = {{
      flex:1,
      justifyContent:"center", // vertical
      alignItems: "center" //horizontal
    }} 
    >
      <Text>Hello IJ Roy this app is for version 1.0.0</Text>
      <Text>My task is to make the splash screen</Text>
    </SafeAreaView>
  )

}

export default App

*/

/*
import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
*/