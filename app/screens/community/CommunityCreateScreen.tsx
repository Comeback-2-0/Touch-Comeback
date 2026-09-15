import React, {useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {api} from '../../utils/api';
import {pastelColors} from '../../theme/colors';
import type {CommunityStackParamList} from '../../navigation/CommunityStack';

type Navigation = NativeStackNavigationProp<CommunityStackParamList>;

export default function CommunityCreateScreen() {
  const navigation = useNavigation<Navigation>();
  const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [rules, setRules] = useState('');
  const [membersOnly, setMembersOnly] = useState(false); const [approval, setApproval] = useState(false); const [saving, setSaving] = useState(false);
  const create = async () => {
    if (!name.trim()) { Alert.alert('Name required', 'Give your community a name.'); return; }
    setSaving(true);
    try {
      const response = await api.post('/communities', {name: name.trim(), description: description.trim(), rules: rules.trim(), contentVisibility: membersOnly ? 'members' : 'public', joinMode: approval ? 'approval' : 'open'});
      navigation.replace('CommunityHome', {community: response.data.community});
    } catch { Alert.alert('Could not create community', 'Please check your connection and try again.'); } finally { setSaving(false); }
  };
  return <SafeAreaView style={styles.safe}><View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Back to communities" onPress={() => navigation.goBack()} style={styles.back}><Feather name="arrow-left" size={22} color={pastelColors.auth.deepText}/></Pressable><Text style={styles.headerTitle}>Create community</Text><View style={styles.back}/></View><ScrollView contentContainerStyle={styles.content}><Text style={styles.title}>Build an anonymous corner</Text><Text style={styles.copy}>You become its anonymous owner. You can change its settings later.</Text><Text style={styles.label}>Name</Text><TextInput accessibilityLabel="Community name" value={name} onChangeText={setName} placeholder="e.g. Night thinkers" placeholderTextColor={pastelColors.auth.mutedText} style={styles.input}/><Text style={styles.label}>Description</Text><TextInput accessibilityLabel="Community description" value={description} onChangeText={setDescription} placeholder="What is this space for?" placeholderTextColor={pastelColors.auth.mutedText} style={[styles.input, styles.multiline]} multiline/><Text style={styles.label}>Rules</Text><TextInput accessibilityLabel="Community rules" value={rules} onChangeText={setRules} placeholder="Set the tone for members" placeholderTextColor={pastelColors.auth.mutedText} style={[styles.input, styles.multiline]} multiline/><View style={styles.row}><View style={styles.rowText}><Text style={styles.rowTitle}>Members-only feed</Text><Text style={styles.rowCopy}>Visitors can discover the community, but not view posts.</Text></View><Switch value={membersOnly} onValueChange={setMembersOnly} trackColor={{true:pastelColors.accent}}/></View><View style={styles.row}><View style={styles.rowText}><Text style={styles.rowTitle}>Approve new members</Text><Text style={styles.rowCopy}>People request access through an anonymous alias.</Text></View><Switch value={approval} onValueChange={setApproval} trackColor={{true:pastelColors.accent}}/></View><Pressable accessibilityRole="button" accessibilityLabel="Create community" onPress={create} disabled={saving} style={[styles.button, saving && styles.disabled]}><Text style={styles.buttonText}>{saving ? 'Creating…' : 'Create community'}</Text></Pressable></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({safe:{flex:1,backgroundColor:pastelColors.auth.background},header:{padding:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},back:{padding:8},headerTitle:{fontSize:17,fontWeight:'900',color:pastelColors.auth.deepText},content:{padding:20,paddingBottom:36},title:{fontSize:26,fontWeight:'900',color:pastelColors.auth.deepText},copy:{marginTop:6,color:pastelColors.auth.mutedText,fontWeight:'600',lineHeight:20},label:{marginTop:22,marginBottom:8,fontWeight:'900',color:pastelColors.auth.deepText},input:{minHeight:48,paddingHorizontal:14,paddingVertical:12,borderRadius:16,backgroundColor:pastelColors.white,color:pastelColors.auth.deepText,fontWeight:'700'},multiline:{minHeight:84,textAlignVertical:'top'},row:{marginTop:18,padding:14,borderRadius:16,backgroundColor:pastelColors.auth.glassSurface,flexDirection:'row',alignItems:'center'},rowText:{flex:1,paddingRight:10},rowTitle:{fontWeight:'900',color:pastelColors.auth.deepText},rowCopy:{marginTop:3,color:pastelColors.auth.mutedText,fontSize:12,fontWeight:'600',lineHeight:17},button:{marginTop:26,paddingVertical:15,alignItems:'center',borderRadius:16,backgroundColor:pastelColors.accent},disabled:{opacity:.6},buttonText:{color:pastelColors.white,fontSize:16,fontWeight:'900'}});
