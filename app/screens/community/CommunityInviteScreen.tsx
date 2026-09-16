import React, {useState} from 'react';
import {ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {CommunityStackParamList} from '../../navigation/CommunityStack';
import {api} from '../../utils/api';
import {pastelColors} from '../../theme/colors';

type Route = RouteProp<CommunityStackParamList, 'CommunityInvite'>;
type Navigation = NativeStackNavigationProp<CommunityStackParamList>;

export default function CommunityInviteScreen() {
  const navigation = useNavigation<Navigation>();
  const {params: {community}} = useRoute<Route>();
  const communityId = community.id || community._id;
  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const accept = async () => {
    if (!token.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.post(`/communities/${communityId}/invites/accept`, {token: token.trim()});
      Alert.alert('You are in', 'Invite accepted.');
      navigation.replace('CommunityHome', {community});
    } catch (err: any) {
      Alert.alert('Invite did not work', err?.response?.data?.error || 'Check the code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Feather name="arrow-left" size={22} color={pastelColors.auth.deepText} />
        </Pressable>
        <Text style={styles.head}>Invite code</Text>
        <View style={styles.iconButton} />
      </View>
      <View style={styles.content}>
        <Feather name="lock" size={28} color={pastelColors.accent} />
        <Text style={styles.title}>{community.name}</Text>
        <Text style={styles.copy}>Paste the private invite code a moderator shared with you.</Text>
        <TextInput
          accessibilityLabel="Invite code"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Invite code"
          placeholderTextColor={pastelColors.auth.mutedText}
          style={styles.input}
        />
        <Pressable onPress={accept} disabled={!token.trim() || submitting} style={[styles.button, (!token.trim() || submitting) && styles.disabled]}>
          {submitting ? <ActivityIndicator color={pastelColors.white} /> : <Text style={styles.buttonText}>Accept invite</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: pastelColors.auth.background},
  header: {padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  iconButton: {height: 44, width: 44, alignItems: 'center', justifyContent: 'center'},
  head: {fontSize: 18, fontWeight: '900', color: pastelColors.auth.deepText},
  content: {flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center'},
  title: {marginTop: 12, fontSize: 24, fontWeight: '900', color: pastelColors.auth.deepText, textAlign: 'center'},
  copy: {marginTop: 8, color: pastelColors.auth.mutedText, fontWeight: '700', textAlign: 'center', lineHeight: 20},
  input: {alignSelf: 'stretch', marginTop: 22, minHeight: 50, borderRadius: 16, paddingHorizontal: 14, backgroundColor: pastelColors.white, color: pastelColors.auth.deepText, fontWeight: '800'},
  button: {alignSelf: 'stretch', marginTop: 16, minHeight: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: pastelColors.accent},
  disabled: {opacity: 0.55},
  buttonText: {color: pastelColors.white, fontWeight: '900', fontSize: 16},
});
