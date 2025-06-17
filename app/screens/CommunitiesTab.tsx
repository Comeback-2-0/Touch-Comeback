// app/screens/CommunitiesTab.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ListRenderItem,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunitiesStackParamList } from '../navigation/CommunityStack';
import type { Community } from '../navigation/types/community';

type Props = {
  navigation: NativeStackNavigationProp<CommunitiesStackParamList, 'CommunitiesTabScreen'>;
};



export default function Communities({ navigation }: Props) {
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
  axios.get(`${API_URL}/communities`).then((res) => {
    setCommunities(res.data);
  });
}, []);

  const renderItem: ListRenderItem<Community> = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('ChatRoom', { community: item })}
    >
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.members}>{item.membersCount} Members</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Communities</Text>
      <FlatList
        data={communities}
        keyExtractor={(item) => item._id}
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