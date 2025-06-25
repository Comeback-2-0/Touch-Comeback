import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ListRenderItem,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Type for a community
type Community = {
  id: string;
  name: string;
  members: string;
  image: string;
};

// Define the navigation prop type (adjust 'RootStackParamList' as needed)
type Props = {
  navigation: NativeStackNavigationProp<any>; // Replace 'any' with your actual type if you have a stack navigator
};

// Dummy data
const communities: Community[] = [
  {
    id: '1',
    name: 'Late Night Studies',
    members: '2.1k Members',
    image:
      'https://photosbulk.com/wp-content/uploads/instagram-profile-picture-avatar_39.webp',
  },
  {
    id: '2',
    name: 'Comeback 2.0',
    members: '1.3k Members',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkdr_DKgOXgnxgSGrfRUeoFgJEv3YY4VzkA&s',
  },
  {
    id: '3',
    name: 'Gaming Talk',
    members: '4.8k Members',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkdr_DKgOXgnxgSGrfRUeoFgJEv3YY4VzkA&s',
  },
  {
    id: '4',
    name: 'Stressed Out',
    members: '4.8k Members',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkdr_DKgOXgnxgSGrfRUeoFgJEv3YY4VzkA&s',
  },
  {
    id: '5',
    name: 'Aaj Ki Awaz',
    members: '4.8k Members',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkdr_DKgOXgnxgSGrfRUeoFgJEv3YY4VzkA&s',
  },
  {
    id: '7',
    name: 'Random Banter',
    members: '4.8k Members',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkdr_DKgOXgnxgSGrfRUeoFgJEv3YY4VzkA&s',
  },
  {
    id: '8',
    name: 'Kind Words',
    members: '4.8k Members',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkdr_DKgOXgnxgSGrfRUeoFgJEv3YY4VzkA&s',
  },
  {
    id: '9',
    name: 'Motivational Corner',
    members: '4.8k Members',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgkdr_DKgOXgnxgSGrfRUeoFgJEv3YY4VzkA&s',
  },
];

export default function Communities({ navigation }: Props) {
  const renderItem: ListRenderItem<Community> = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('ChatRoom', { community: item })}
    >
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.members}>{item.members}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Communities</Text>
      <FlatList
        data={communities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  name: { fontSize: 16, fontWeight: '600' },
  members: { color: 'gray', fontSize: 13 },
});