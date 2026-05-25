//app/screens/GroupListScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  ScrollView,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
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

export default function GroupListScreen({navigation}: Props) {
  const {user, loading} = useAuth();
  const userId = user?._id ?? '';
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [trendingGroups, setTrendingGroups] = useState<Group[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Group[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (!userId) return;

    const loadGroups = async () => {
      try {
        const joinedRes = await fetchJoinedGroups();
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
      await joinGroup(groupId);
      const joinedRes = await fetchJoinedGroups();
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
      onPress={() => {
        const isJoined = joinedGroups.some(g => g._id === group._id);
        if (isJoined) {
          navigation.navigate('GroupChatScreen', {
            group: {
              id: group._id,
              name: group.name,
              members: group.members.length,
            },
          });
        } else {
          setSelectedGroup(group);
          setShowModal(true);
        }
      }}
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Group</Text>
            {selectedGroup && (
              <>
                <Text style={styles.modalGroupName}>{selectedGroup.name}</Text>
                <Text>{selectedGroup.members.length} members</Text>
                <Text style={{marginVertical: 8}}>
                  Latest post:{' '}
                  {selectedGroup.latestPost?.content || 'No posts yet'}
                </Text>
              </>
            )}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.button, {backgroundColor: '#ccc'}]}
                onPress={() => setShowModal(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, {backgroundColor: '#4CAF50'}]}
                onPress={async () => {
                  if (selectedGroup) {
                    await handleJoin(selectedGroup._id);
                    setShowModal(false);
                  }
                }}>
                <Text style={{color: '#fff'}}>Join</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalGroupName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
});
