import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../navigation/ChatNavigator';
import GroupCard from '../components/GroupCard';

type Props = NativeStackScreenProps<ChatStackParamList, 'GroupListScreen'>;

const groups = [
  { id: '1', name: 'Late Night Studies', members: 1200 },
  { id: '2', name: 'Code Together', members: 850 },
];

const GroupListScreen: React.FC<Props> = ({ navigation }) => {
  const userId = 'dummyUserId123'; // ✅ Replace with actual user ID from context/auth

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GroupCard
            name={item.name}
            members={item.members}
            onPress={() =>
              navigation.navigate('GroupChatScreen', {
                group: item,
                userId, // ✅ Now satisfies the required param
              })
            }
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
});

export default GroupListScreen;
