import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

type RootStackParamList = {
  EditProfile: undefined;
  Profile:undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
};

export default function EditProfile({ navigation }: Props) {
  const [name, setName] = useState<string>('Anonymous User');
  const [bio, setBio] = useState<string>('Mood defines me.');
  const [mood, setMood] = useState<string>('Happy');

  const handleSave = () => {
    // Save to Firebase or your backend here
    Alert.alert('Profile Updated!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
       <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.backButton}>
  <Ionicons name="arrow-back" size={20} color="purple" />
</TouchableOpacity>
      <TouchableOpacity>
        <Image
          source={{
            uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkdr_DKgOXgnxgSGrfRUeoFgJEv3YY4VzkA&s',
          }}
          style={styles.avatar}
        />
        <Text style={styles.changePic}>Change Picture</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Bio"
        style={[styles.input, { height: 80 }]}
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <TextInput
        placeholder="Mood"
        style={styles.input}
        value={mood}
        onChangeText={setMood}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center' },
  changePic: { color: '#888', textAlign: 'center', marginVertical: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: 'purple',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },

  backButton: {
  marginBottom: 10,
  alignSelf: 'flex-start',
  padding: 6,
  backgroundColor: '#eee',
  borderRadius: 6,
},

backButtonText: {
  color: 'purple',
  fontWeight: 'bold',
  fontSize: 14,
},

});
