//app/screens/GroupListScreen.tsx
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TextInput, Text, ScrollView} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ChatStackParamList} from '../navigation/ChatNavigator';
import GroupCard from '../components/GroupCard';
import {useAuth} from '../context/AuthContext';
import {
  fetchJoinedGroups,
  fetchTrendingGroups,
  searchGroups,
  joinGroup,
} from '../utils/api';

type Props = NativeStackScreenProps<ChatStackParamList, 'GroupListScreen'>;

type Group = {
  _id: string;
  name: string;
  members: string[];
  latestPost?: {
    content: string;
  };
};

const GroupListScreen: React.FC<Props> = ({navigation}) => {
  const {user, loading} = useAuth();
  const userId = user?.uid ?? '';
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [trendingGroups, setTrendingGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Group[]>([]);

  useEffect(() => {
    if (!userId) return;

    const loadGroups = async () => {
      try {
        const joinedRes = await fetchJoinedGroups(userId);
        const trendingRes = await fetchTrendingGroups();
        setJoinedGroups(joinedRes.data);
        setTrendingGroups(trendingRes.data);
      } catch (err) {
        console.error('Error loading groups:', err);
      }
    };

    loadGroups();
  }, [userId]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const res = await searchGroups(query);
      setSearchResults(res.data);
    } else {
      setSearchResults([]);
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      await joinGroup(groupId, userId);
      const joinedRes = await fetchJoinedGroups(userId);
      setJoinedGroups(joinedRes.data);
    } catch (err) {
      console.error('Join failed:', err);
    }
  };

  const renderGroup = (group: Group, showJoin = false) => (
    <GroupCard
      key={group._id}
      name={group.name}
      members={group.members.length}
      latestPost={group.latestPost?.content ?? 'No posts yet'}
      unreadCount={0}
      onPress={() =>
        navigation.navigate('GroupChatScreen', {
          group: {
            id: group._id, // 👈 convert _id to id
            name: group.name,
            members: group.members.length, // 👈 convert array to count
          },
          userId,
        })
      }
      joinButton={showJoin}
      onJoinPress={() => handleJoin(group._id)}
    />
  );

  if (loading || !userId) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search groups..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Search Results */}
      {searchResults.length > 0 && (
        <>
          <Text style={styles.sectionHeader}>Search Results</Text>
          {searchResults.map(group => renderGroup(group, true))}
        </>
      )}

      {/* My Groups */}
      <Text style={styles.sectionHeader}>My Groups</Text>
      {joinedGroups.map(group => renderGroup(group))}

      {/* Trending Groups */}
      <Text style={styles.sectionHeader}>Trending Groups</Text>
      {trendingGroups.map(group =>
        joinedGroups.find(g => g._id === group._id)
          ? null
          : renderGroup(group, true),
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  searchInput: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#DDD',
    borderWidth: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default GroupListScreen;
