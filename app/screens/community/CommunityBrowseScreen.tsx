import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, Animated, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {api} from '../../utils/api';
import {pastelColors} from '../../theme/colors';
import type {CommunityStackParamList, CommunitySummary} from '../../navigation/CommunityStack';

type Navigation = NativeStackNavigationProp<CommunityStackParamList>;

export default function CommunityBrowseScreen() {
  const navigation = useNavigation<Navigation>();
  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchProgress = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const load = async () => {
    setLoading(true); setError(false);
    try { const response = await api.get<CommunitySummary[]>('/communities'); setCommunities(response.data); }
    catch { setError(true); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    Animated.timing(searchProgress, {toValue: searchOpen ? 1 : 0, duration: 180, useNativeDriver: false}).start(() => {
      if (searchOpen) inputRef.current?.focus();
    });
  }, [searchOpen, searchProgress]);
  const visible = useMemo(() => communities.filter(item => `${item.name} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase())), [communities, query]);
  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}><View><Text style={styles.title}>Community</Text><Text style={styles.subtitle}>Find your anonymous corner</Text></View><View style={styles.headerActions}><Pressable accessibilityRole="button" accessibilityLabel="Create community" onPress={() => navigation.navigate('CommunityCreate')} style={styles.createIcon}><Feather name="plus" size={21} color={pastelColors.white} /></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Search communities" onPress={() => setSearchOpen(true)} style={styles.icon}><Feather name="search" size={22} color={pastelColors.auth.deepText} /></Pressable></View></View>
    <Animated.View style={[styles.search, {height: searchProgress.interpolate({inputRange:[0,1], outputRange:[0,46]}), opacity: searchProgress, marginBottom: searchProgress.interpolate({inputRange:[0,1], outputRange:[0,12]})}]} pointerEvents={searchOpen ? 'auto' : 'none'}><Feather name="search" size={18} color={pastelColors.auth.mutedText}/><TextInput ref={inputRef} accessibilityLabel="Search communities" value={query} onChangeText={setQuery} placeholder="Search communities" placeholderTextColor={pastelColors.auth.mutedText} style={styles.input}/><Pressable accessibilityRole="button" accessibilityLabel="Close search" onPress={() => {setSearchOpen(false); setQuery('');}}><Feather name="x" size={18} color={pastelColors.auth.mutedText}/></Pressable></Animated.View>
    {loading ? <View style={styles.center}><ActivityIndicator color={pastelColors.accent}/><Text style={styles.copy}>Loading communities...</Text></View> : error ? <View style={styles.center}><Text style={styles.error}>Could not load communities</Text><Pressable onPress={load} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable></View> : <FlatList data={visible} keyExtractor={item => item.id || item._id} refreshing={loading} onRefresh={load} contentContainerStyle={visible.length ? styles.list : styles.empty} renderItem={({item}) => <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.name}`} onPress={() => navigation.navigate('CommunityHome', {community: item})} style={styles.card}>{item.image ? <Image source={{uri: item.image}} style={styles.image}/> : <View style={styles.imageFallback}><Feather name="users" size={24} color={pastelColors.accent}/></View>}<View style={styles.cardText}><Text style={styles.name}>{item.name}</Text><Text numberOfLines={2} style={styles.description}>{item.description || 'An anonymous place to connect.'}</Text><Text style={styles.members}>{item.membersCount || 0} members</Text></View><Feather name="chevron-right" size={20} color={pastelColors.auth.mutedText}/></Pressable>} ListEmptyComponent={<View style={styles.center}><Feather name="users" size={28} color={pastelColors.accent}/><Text style={styles.emptyTitle}>No communities found</Text><Text style={styles.copy}>Try another search.</Text></View>}/>}</SafeAreaView>;
}
const styles = StyleSheet.create({safe:{flex:1,backgroundColor:pastelColors.auth.background},header:{paddingHorizontal:16,paddingTop:12,paddingBottom:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},headerActions:{flexDirection:'row',alignItems:'center'},title:{fontSize:28,fontWeight:'900',color:pastelColors.auth.deepText},subtitle:{marginTop:2,fontWeight:'700',color:pastelColors.auth.mutedText},icon:{padding:10},createIcon:{height:38,width:38,borderRadius:19,marginRight:2,alignItems:'center',justifyContent:'center',backgroundColor:pastelColors.accent},search:{overflow:'hidden',marginHorizontal:16,paddingHorizontal:14,borderRadius:16,backgroundColor:pastelColors.white,flexDirection:'row',alignItems:'center'},input:{flex:1,marginLeft:10,color:pastelColors.auth.deepText,fontWeight:'700'},list:{paddingHorizontal:16,paddingBottom:18},card:{padding:14,marginBottom:10,borderRadius:18,backgroundColor:pastelColors.auth.glassSurface,flexDirection:'row',alignItems:'center'},image:{height:54,width:54,borderRadius:16,marginRight:12},imageFallback:{height:54,width:54,borderRadius:16,marginRight:12,alignItems:'center',justifyContent:'center',backgroundColor:pastelColors.auth.primaryOverlay},cardText:{flex:1},name:{fontSize:16,fontWeight:'900',color:pastelColors.auth.deepText},description:{marginTop:3,color:pastelColors.auth.mutedText,fontWeight:'600'},members:{marginTop:6,color:pastelColors.accent,fontWeight:'800',fontSize:12},center:{flex:1,justifyContent:'center',alignItems:'center',padding:24},empty:{flexGrow:1},copy:{marginTop:10,color:pastelColors.auth.mutedText,fontWeight:'700',textAlign:'center'},emptyTitle:{marginTop:12,color:pastelColors.auth.deepText,fontSize:18,fontWeight:'900'},error:{color:pastelColors.auth.deepText,fontSize:18,fontWeight:'900'},retry:{marginTop:16,paddingHorizontal:22,paddingVertical:12,borderRadius:16,backgroundColor:pastelColors.accent},retryText:{color:pastelColors.white,fontWeight:'900'}});
