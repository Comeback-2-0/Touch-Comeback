import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {CommunityStackParamList} from '../../navigation/CommunityStack';
import {api} from '../../utils/api';
import {pastelColors} from '../../theme/colors';

type Route = RouteProp<CommunityStackParamList, 'CommunityManage'>;
type JoinRequest = {
  id: string;
  alias?: string;
  revealUsername?: boolean;
  revealedUsername?: string;
  note?: string;
  status: string;
  createdAt?: string;
};
type ReportItem = {
  id: string;
  contentId: string;
  postAlias?: string;
  postText?: string;
  reason: string;
  context?: string;
  createdAt?: string;
};
type MemberItem = {
  userId: string;
  role: 'owner' | 'moderator' | 'member' | string;
  status: string;
  joinedAt?: string;
};
type OwnershipTransfer = {id: string; createdAt?: string; status: string};

type ScheduleType = 'daily' | 'interval' | 'slots';

function requestHeadline(request: JoinRequest) {
  const hasAlias = Boolean(request.alias?.trim());
  const hasUsername = Boolean(request.revealUsername && request.revealedUsername);
  if (hasAlias && hasUsername) return `${request.alias} · @${request.revealedUsername}`;
  if (hasUsername) return `@${request.revealedUsername}`;
  if (hasAlias) return request.alias || 'Someone';
  return 'Someone';
}

function requestSubtitle(request: JoinRequest) {
  const hasAlias = Boolean(request.alias?.trim());
  const hasUsername = Boolean(request.revealUsername && request.revealedUsername);
  if (hasAlias && hasUsername) return 'Shared an alias and their real username.';
  if (hasUsername) return 'Shared their real username for approval.';
  return 'Asked to join with an alias only.';
}

function deviceTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export default function CommunityManageScreen() {
  const navigation = useNavigation();
  const {
    params: {community: routeCommunity},
  } = useRoute<Route>();
  const id = routeCommunity.id || routeCommunity._id;

  const [community, setCommunity] = useState<any>(routeCommunity);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const [name, setName] = useState(routeCommunity.name || '');
  const [description, setDescription] = useState(routeCommunity.description || '');
  const [image, setImage] = useState(routeCommunity.image || '');
  const [rules, setRules] = useState('');
  const [contentVisibility, setContentVisibility] = useState<'public' | 'members'>('public');
  const [joinMode, setJoinMode] = useState<'open' | 'approval' | 'invite-only'>('open');
  const [showLeadership, setShowLeadership] = useState(false);

  const [autoPublish, setAutoPublish] = useState(false);
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [dailyTime, setDailyTime] = useState('12:00');
  const [intervalHours, setIntervalHours] = useState('3');
  const [startTime, setStartTime] = useState('14:00');
  const [slotTimes, setSlotTimes] = useState('09:00, 15:00, 21:00');
  const [everyDays, setEveryDays] = useState('1');

  const timezone = useMemo(() => deviceTimezone(), []);

  const applyScheduleFromCommunity = useCallback((next: any) => {
    const schedule = next?.queueSchedule;
    setAutoPublish(next?.queueMode === 'scheduled');
    if (!schedule) {
      setScheduleType('daily');
      setDailyTime('12:00');
      setIntervalHours('3');
      setStartTime('14:00');
      setSlotTimes('09:00, 15:00, 21:00');
      setEveryDays('1');
      return;
    }
    setScheduleType(schedule.type || 'daily');
    setDailyTime(schedule.dailyTime || schedule.times?.[0] || '12:00');
    setIntervalHours(String(schedule.intervalHours || 3));
    setStartTime(schedule.startTime || '14:00');
    setSlotTimes((schedule.times || ['09:00', '15:00', '21:00']).join(', '));
    setEveryDays(String(schedule.everyDays || 1));
  }, []);

  const applySettingsFromCommunity = useCallback((next: any) => {
    setName(next?.name || '');
    setDescription(next?.description || '');
    setImage(next?.image || '');
    setRules(next?.rules || '');
    setContentVisibility(next?.contentVisibility === 'members' ? 'members' : 'public');
    setJoinMode(
      ['open', 'approval', 'invite-only'].includes(next?.joinMode)
        ? next.joinMode
        : 'open',
    );
    setShowLeadership(Boolean(next?.showLeadership));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [info, join, memberList, transferList, reportList, audit] = await Promise.all([
        api.get(`/communities/${id}`),
        api.get(`/communities/${id}/join-requests`),
        api.get(`/communities/${id}/members`),
        api.get(`/communities/${id}/ownership-transfers/pending`),
        api.get(`/communities/${id}/content/reports`),
        api.get(`/communities/${id}/audit`),
      ]);
      const nextCommunity = info.data.community || routeCommunity;
      setCommunity(nextCommunity);
      applySettingsFromCommunity(nextCommunity);
      applyScheduleFromCommunity(nextCommunity);
      setRequests(join.data.requests || []);
      setMembers(memberList.data.members || []);
      setTransfers(transferList.data.transfers || []);
      setReports(reportList.data.reports || []);
      setEvents(audit.data.events || []);
    } catch {
      Alert.alert('Could not load management tools');
    } finally {
      setLoading(false);
    }
  }, [applyScheduleFromCommunity, applySettingsFromCommunity, id, routeCommunity]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (requestId: string, decision: string) => {
    try {
      await api.put(`/communities/${id}/join-requests/${requestId}`, {decision});
      await load();
    } catch {
      Alert.alert('Could not update request');
    }
  };

  const invite = async () => {
    try {
      const r = await api.post(`/communities/${id}/invites`, {});
      const token = r.data.token;
      await Share.share({
        message: `Touch invite for ${community.name}: ${token}`,
      });
    } catch {
      Alert.alert('Could not create invite', 'Please try again.');
    }
  };

  const saveSettings = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Community name cannot be empty.');
      return;
    }
    setSavingSettings(true);
    try {
      const response = await api.put(`/communities/${id}`, {
        name: name.trim(),
        description: description.trim(),
        image: image.trim(),
        rules: rules.trim(),
        contentVisibility,
        joinMode,
        showLeadership,
        queueMode: community.queueMode || 'manual',
        queueSchedule: community.queueSchedule || null,
        queueScheduleMinutes: community.queueScheduleMinutes || null,
      });
      setCommunity(response.data.community);
      applySettingsFromCommunity(response.data.community);
      Alert.alert('Saved', 'Community settings updated.');
    } catch (err: any) {
      Alert.alert('Could not save settings', err?.response?.data?.error || 'Please try again.');
    } finally {
      setSavingSettings(false);
    }
  };

  const moderateContent = async (contentId: string, action: 'remove' | 'restore') => {
    try {
      await api.put(`/communities/${id}/content/${contentId}/moderation`, {action});
      await load();
    } catch {
      Alert.alert('Could not update report');
    }
  };

  const updateRole = async (member: MemberItem, role: 'member' | 'moderator') => {
    try {
      await api.put(`/communities/${id}/members/${member.userId}/role`, {role});
      await load();
    } catch (err: any) {
      Alert.alert('Could not update role', err?.response?.data?.error || 'Please try again.');
    }
  };

  const requestTransfer = async (member: MemberItem) => {
    Alert.alert('Transfer ownership?', 'The member must accept before ownership changes. You become moderator after acceptance.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Nominate',
        onPress: async () => {
          try {
            await api.post(`/communities/${id}/ownership-transfers`, {toUserId: member.userId});
            Alert.alert('Transfer requested', 'Ownership changes only after the member accepts.');
            await load();
          } catch (err: any) {
            Alert.alert('Could not request transfer', err?.response?.data?.error || 'Please try again.');
          }
        },
      },
    ]);
  };

  const acceptTransfer = async (transfer: OwnershipTransfer) => {
    try {
      await api.post(`/communities/${id}/ownership-transfers/${transfer.id}/accept`);
      Alert.alert('Ownership accepted', 'You are now the owner.');
      await load();
    } catch (err: any) {
      Alert.alert('Could not accept ownership', err?.response?.data?.error || 'Please try again.');
    }
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    try {
      const payload: any = {
        name: community.name,
        description: community.description || '',
        image: community.image || '',
        rules: community.rules || '',
        contentVisibility: community.contentVisibility || 'public',
        joinMode: community.joinMode || 'open',
        showLeadership: Boolean(community.showLeadership),
        queueMode: autoPublish ? 'scheduled' : 'manual',
      };

      if (autoPublish) {
        if (scheduleType === 'daily') {
          payload.queueSchedule = {
            type: 'daily',
            dailyTime: dailyTime.trim(),
            everyDays: Number(everyDays) || 1,
            timezone,
          };
        } else if (scheduleType === 'interval') {
          payload.queueSchedule = {
            type: 'interval',
            intervalHours: Number(intervalHours) || 3,
            startTime: startTime.trim(),
            everyDays: Number(everyDays) || 1,
            timezone,
          };
        } else {
          payload.queueSchedule = {
            type: 'slots',
            times: slotTimes
              .split(',')
              .map(value => value.trim())
              .filter(Boolean),
            everyDays: Number(everyDays) || 1,
            timezone,
          };
        }
      } else {
        payload.queueSchedule = null;
        payload.queueScheduleMinutes = null;
      }

      const response = await api.put(`/communities/${id}`, payload);
      setCommunity(response.data.community);
      applyScheduleFromCommunity(response.data.community);
      Alert.alert('Saved', 'Auto-publish settings updated.');
    } catch (err: any) {
      Alert.alert(
        'Could not save schedule',
        err?.response?.data?.error || 'Check the times and try again.',
      );
    } finally {
      setSavingSchedule(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={pastelColors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={pastelColors.auth.deepText} />
        </Pressable>
        <Text style={styles.head}>Manage community</Text>
        <Pressable onPress={invite}>
          <Feather name="link" size={21} color={pastelColors.auth.deepText} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {transfers.length ? (
          <>
            <Text style={styles.section}>Ownership transfer</Text>
            {transfers.map(transfer => (
              <View style={styles.card} key={transfer.id}>
                <Text style={styles.alias}>You were nominated as owner</Text>
                {transfer.createdAt ? <Text style={styles.meta}>Requested {new Date(transfer.createdAt).toLocaleString()}</Text> : null}
                <Pressable onPress={() => acceptTransfer(transfer)} style={[styles.primary, styles.fullButton]}>
                  <Text style={styles.primaryText}>Accept ownership</Text>
                </Pressable>
              </View>
            ))}
          </>
        ) : null}

        <Text style={styles.section}>Community settings</Text>
        <Text style={styles.lead}>Update what people see before joining and how they get in.</Text>
        <View style={styles.scheduleCard}>
          <Text style={styles.label}>Name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Community name" placeholderTextColor={pastelColors.auth.mutedText} />
          <Text style={styles.label}>Image URL</Text>
          <TextInput value={image} onChangeText={setImage} style={styles.input} placeholder="https://..." placeholderTextColor={pastelColors.auth.mutedText} autoCapitalize="none" />
          <Text style={styles.label}>Description</Text>
          <TextInput value={description} onChangeText={setDescription} style={[styles.input, styles.largeInput]} placeholder="What is this space for?" placeholderTextColor={pastelColors.auth.mutedText} multiline />
          <Text style={styles.label}>Rules</Text>
          <TextInput value={rules} onChangeText={setRules} style={[styles.input, styles.largeInput]} placeholder="What should members know?" placeholderTextColor={pastelColors.auth.mutedText} multiline />
          <Text style={styles.label}>Visibility</Text>
          <View style={styles.chips}>
            {(['public', 'members'] as const).map(value => (
              <Pressable key={value} onPress={() => setContentVisibility(value)} style={[styles.chip, contentVisibility === value && styles.chipActive]}>
                <Text style={[styles.chipText, contentVisibility === value && styles.chipTextActive]}>{value === 'public' ? 'Public feed' : 'Members only'}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Join policy</Text>
          <View style={styles.chips}>
            {(['open', 'approval', 'invite-only'] as const).map(value => (
              <Pressable key={value} onPress={() => setJoinMode(value)} style={[styles.chip, joinMode === value && styles.chipActive]}>
                <Text style={[styles.chipText, joinMode === value && styles.chipTextActive]}>{value === 'open' ? 'Open' : value === 'approval' ? 'Approval' : 'Invite only'}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.settingRow}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Show anonymous leadership labels</Text>
              <Text style={styles.rowCopy}>Members can see moderator/owner labels, not real profiles.</Text>
            </View>
            <Switch value={showLeadership} onValueChange={setShowLeadership} trackColor={{true: pastelColors.accent}} />
          </View>
        </View>
        <Pressable onPress={saveSettings} disabled={savingSettings} style={[styles.saveButton, savingSettings && styles.disabled]}>
          <Text style={styles.saveButtonText}>{savingSettings ? 'Saving...' : 'Save community settings'}</Text>
        </Pressable>

        <Text style={styles.section}>Auto-publish top posts</Text>
        <Text style={styles.lead}>
          Choose when the highest-voted queue post goes live. Times use {timezone}.
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Auto-approve top of queue</Text>
            <Text style={styles.rowCopy}>Off means admins publish manually.</Text>
          </View>
          <Switch
            value={autoPublish}
            onValueChange={setAutoPublish}
            trackColor={{true: pastelColors.accent}}
          />
        </View>

        {autoPublish ? (
          <View style={styles.scheduleCard}>
            <Text style={styles.label}>Pattern</Text>
            <View style={styles.chips}>
              {(
                [
                  ['daily', 'Once a day'],
                  ['interval', 'Every few hours'],
                  ['slots', 'Multiple times'],
                ] as const
              ).map(([value, label]) => (
                <Pressable
                  key={value}
                  onPress={() => setScheduleType(value)}
                  style={[styles.chip, scheduleType === value && styles.chipActive]}>
                  <Text
                    style={[
                      styles.chipText,
                      scheduleType === value && styles.chipTextActive,
                    ]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {scheduleType === 'daily' ? (
              <>
                <Text style={styles.label}>Publish at (HH:MM)</Text>
                <TextInput
                  value={dailyTime}
                  onChangeText={setDailyTime}
                  placeholder="12:00"
                  placeholderTextColor={pastelColors.auth.mutedText}
                  style={styles.input}
                  autoCapitalize="none"
                />
              </>
            ) : null}

            {scheduleType === 'interval' ? (
              <>
                <Text style={styles.label}>Every how many hours?</Text>
                <TextInput
                  value={intervalHours}
                  onChangeText={setIntervalHours}
                  keyboardType="number-pad"
                  placeholder="3"
                  placeholderTextColor={pastelColors.auth.mutedText}
                  style={styles.input}
                />
                <Text style={styles.label}>Starting from (HH:MM)</Text>
                <TextInput
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="14:00"
                  placeholderTextColor={pastelColors.auth.mutedText}
                  style={styles.input}
                  autoCapitalize="none"
                />
              </>
            ) : null}

            {scheduleType === 'slots' ? (
              <>
                <Text style={styles.label}>Post times (1st, 2nd, nth…)</Text>
                <TextInput
                  value={slotTimes}
                  onChangeText={setSlotTimes}
                  placeholder="09:00, 15:00, 21:00"
                  placeholderTextColor={pastelColors.auth.mutedText}
                  style={styles.input}
                  autoCapitalize="none"
                />
                <Text style={styles.hint}>
                  First queued top post at the first time, next at the next time, and so on.
                </Text>
              </>
            ) : null}

            <Text style={styles.label}>Repeat every N days</Text>
            <TextInput
              value={everyDays}
              onChangeText={setEveryDays}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={pastelColors.auth.mutedText}
              style={styles.input}
            />
            <Text style={styles.hint}>Use 1 for every day, 2 for every other day.</Text>
          </View>
        ) : null}

        <Pressable
          onPress={saveSchedule}
          disabled={savingSchedule}
          style={[styles.saveButton, savingSchedule && styles.disabled]}>
          <Text style={styles.saveButtonText}>
            {savingSchedule ? 'Saving…' : 'Save publish schedule'}
          </Text>
        </Pressable>

        <Text style={styles.section}>
          {requests.length
            ? `${requests.length} ${requests.length === 1 ? 'person wants' : 'people want'} to join`
            : 'Join requests'}
        </Text>
        <Text style={styles.lead}>
          {requests.length
            ? 'Review who is knocking. You only see what they chose to share.'
            : 'Nobody is waiting right now.'}
        </Text>

        {requests.length ? (
          requests.map(r => (
            <View style={styles.card} key={r.id}>
              <Text style={styles.alias}>{requestHeadline(r)}</Text>
              <Text style={styles.copy}>{requestSubtitle(r)}</Text>
              {r.note ? <Text style={styles.note}>{r.note}</Text> : null}
              {r.createdAt ? (
                <Text style={styles.meta}>Asked {new Date(r.createdAt).toLocaleString()}</Text>
              ) : null}
              <View style={styles.row}>
                <Pressable onPress={() => review(r.id, 'declined')} style={styles.secondary}>
                  <Text style={styles.secondaryText}>Decline</Text>
                </Pressable>
                <Pressable onPress={() => review(r.id, 'approved')} style={styles.primary}>
                  <Text style={styles.primaryText}>Approve</Text>
                </Pressable>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Feather name="inbox" size={22} color={pastelColors.accent} />
            <Text style={styles.copy}>No pending requests.</Text>
          </View>
        )}

        <Text style={styles.section}>Members and roles</Text>
        <Text style={styles.lead}>Manage roles through anonymous member ids. Real profiles stay hidden here.</Text>
        {members.map(member => (
          <View style={styles.card} key={member.userId}>
            <Text style={styles.alias}>{member.role}</Text>
            <Text style={styles.copy}>Member {member.userId.slice(0, 8)}</Text>
            {member.joinedAt ? <Text style={styles.meta}>Joined {new Date(member.joinedAt).toLocaleString()}</Text> : null}
            {member.role !== 'owner' ? (
              <View style={styles.row}>
                <Pressable onPress={() => updateRole(member, member.role === 'moderator' ? 'member' : 'moderator')} style={styles.secondary}>
                  <Text style={styles.secondaryText}>{member.role === 'moderator' ? 'Remove mod' : 'Make mod'}</Text>
                </Pressable>
                <Pressable onPress={() => requestTransfer(member)} style={styles.primary}>
                  <Text style={styles.primaryText}>Transfer owner</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ))}

        <Text style={styles.section}>
          {reports.length ? `${reports.length} report${reports.length === 1 ? '' : 's'} to review` : 'Reports'}
        </Text>
        <Text style={styles.lead}>
          {reports.length ? 'Review reported content without seeing who reported it.' : 'No pending reports.'}
        </Text>
        {reports.length ? (
          reports.map(report => (
            <View style={styles.card} key={report.id}>
              <Text style={styles.alias}>{report.reason}</Text>
              <Text style={styles.copy}>{report.postAlias || 'Anonymous post'}</Text>
              {report.postText ? <Text style={styles.note}>{report.postText}</Text> : null}
              {report.context ? <Text style={styles.note}>{report.context}</Text> : null}
              {report.createdAt ? (
                <Text style={styles.meta}>Reported {new Date(report.createdAt).toLocaleString()}</Text>
              ) : null}
              <View style={styles.row}>
                <Pressable onPress={() => moderateContent(report.contentId, 'restore')} style={styles.secondary}>
                  <Text style={styles.secondaryText}>Keep</Text>
                </Pressable>
                <Pressable onPress={() => moderateContent(report.contentId, 'remove')} style={styles.primary}>
                  <Text style={styles.primaryText}>Remove post</Text>
                </Pressable>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Feather name="shield" size={22} color={pastelColors.accent} />
            <Text style={styles.copy}>Nothing needs review.</Text>
          </View>
        )}

        <Text style={styles.section}>Audit history</Text>
        {events.length ? (
          events.map(e => (
            <View style={styles.event} key={e.id}>
              <Text style={styles.eventAction}>{String(e.action).replaceAll('_', ' ')}</Text>
              <Text style={styles.copy}>{new Date(e.createdAt).toLocaleString()}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.copy}>No recorded actions.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: pastelColors.auth.background},
  header: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  head: {fontSize: 17, fontWeight: '900', color: pastelColors.auth.deepText},
  content: {padding: 16, paddingBottom: 30},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  section: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 19,
    fontWeight: '900',
    color: pastelColors.auth.deepText,
  },
  lead: {
    marginBottom: 12,
    color: pastelColors.auth.mutedText,
    fontWeight: '600',
    lineHeight: 18,
  },
  settingRow: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: pastelColors.auth.glassSurface,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowText: {flex: 1, paddingRight: 10},
  rowTitle: {fontWeight: '900', color: pastelColors.auth.deepText},
  rowCopy: {
    marginTop: 3,
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  scheduleCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: pastelColors.white,
    marginBottom: 12,
  },
  label: {
    marginTop: 10,
    marginBottom: 8,
    fontWeight: '900',
    color: pastelColors.auth.deepText,
  },
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: pastelColors.auth.glassSurface,
  },
  chipActive: {backgroundColor: pastelColors.accent},
  chipText: {fontWeight: '800', color: pastelColors.auth.deepText, fontSize: 12},
  chipTextActive: {color: pastelColors.white},
  input: {
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: pastelColors.auth.background,
    color: pastelColors.auth.deepText,
    fontWeight: '700',
  },
  largeInput: {minHeight: 88, textAlignVertical: 'top'},
  hint: {
    marginTop: 8,
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  saveButton: {
    marginBottom: 18,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: pastelColors.accent,
  },
  saveButtonText: {color: pastelColors.white, fontWeight: '900'},
  disabled: {opacity: 0.6},
  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: pastelColors.white,
    marginBottom: 10,
  },
  emptyCard: {
    padding: 18,
    borderRadius: 16,
    backgroundColor: pastelColors.auth.glassSurface,
    alignItems: 'center',
    gap: 8,
  },
  alias: {fontWeight: '900', color: pastelColors.accent, fontSize: 16},
  copy: {marginTop: 4, color: pastelColors.auth.mutedText, fontWeight: '600'},
  note: {marginTop: 8, color: pastelColors.auth.deepText, fontWeight: '600'},
  meta: {marginTop: 8, color: pastelColors.auth.mutedText, fontSize: 12, fontWeight: '700'},
  row: {flexDirection: 'row', gap: 10, marginTop: 12},
  secondary: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: pastelColors.auth.glassSurface,
  },
  secondaryText: {fontWeight: '800', color: pastelColors.auth.deepText},
  primary: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: pastelColors.accent,
  },
  fullButton: {marginTop: 12, alignItems: 'center'},
  primaryText: {color: pastelColors.white, fontWeight: '900'},
  event: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: pastelColors.auth.glassSurface,
    marginBottom: 8,
  },
  eventAction: {fontWeight: '900', color: pastelColors.auth.deepText},
});
