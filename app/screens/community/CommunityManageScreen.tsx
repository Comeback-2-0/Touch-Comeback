import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import {resolveCommunityImageUrl} from '../../utils/communityImageUpload';
import {adjustPhoto, isMediaPickerCancelled, pickAvatarPhoto} from '../../utils/mediaCrop';
import {useKeyboardAwareScroll} from './communityKeyboard';
import {pastelColors} from '../../theme/colors';
import {useAuthStore} from '../../features/profile/store/authStore';
import {
  DOT,
  ELLIPSIS,
  auditCategory,
  formatFriendlyTimestamp,
  humanAuditAction,
  humanReportReason,
  showCommunityToast,
} from './communityUx';
import CommunityConfirmSheet from './CommunityConfirmSheet';

type Route = RouteProp<CommunityStackParamList, 'CommunityManage'>;

type ManageTab =
  | 'overview'
  | 'settings'
  | 'requests'
  | 'queue'
  | 'members'
  | 'invites'
  | 'reports'
  | 'audit'
  | 'ownership'
  | 'platform';

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

type InviteItem = {
  id?: string;
  _id?: string;
  token?: string;
  createdAt?: string;
  uses?: number;
  maxUses?: number;
  expiresAt?: string;
  revokedAt?: string;
};

type ScheduleType = 'daily' | 'interval' | 'slots';
type AuditFilter = 'all' | 'membership' | 'content' | 'ownership' | 'settings';

const TAB_DEFS: Array<{id: ManageTab; label: string}> = [
  {id: 'overview', label: 'Overview'},
  {id: 'settings', label: 'Settings'},
  {id: 'requests', label: 'Requests'},
  {id: 'queue', label: 'Queue'},
  {id: 'members', label: 'Members'},
  {id: 'invites', label: 'Invites'},
  {id: 'reports', label: 'Reports'},
  {id: 'audit', label: 'Audit'},
  {id: 'ownership', label: 'Ownership'},
  {id: 'platform', label: 'Platform'},
];

function memberLabel(member: MemberItem, index: number) {
  if (member.role === 'owner') return 'Anonymous owner';
  if (member.role === 'banned') return `Banned member #${index + 1}`;
  if (member.role === 'moderator') return `Anonymous moderator #${index + 1}`;
  return `Anonymous member #${index + 1}`;
}

type ConfirmSheetConfig = {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

function requestHeadline(request: JoinRequest) {
  const hasAlias = Boolean(request.alias?.trim());
  const hasUsername = Boolean(request.revealUsername && request.revealedUsername);
  if (hasAlias && hasUsername) return `${request.alias}${DOT}@${request.revealedUsername}`;
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

function inviteId(invite: InviteItem) {
  return String(invite.id || invite._id || '');
}

function visibilityImpact(value: 'public' | 'members') {
  if (value === 'members') return 'Only members see posts. Guests see the community page only.';
  return 'Anyone can browse the feed before joining.';
}

function joinModeImpact(value: 'open' | 'approval' | 'invite-only') {
  if (value === 'approval') return 'People request access. You approve or decline each one.';
  if (value === 'invite-only') return 'Only people with a valid invite code can join.';
  return 'Anyone can join and start participating right away.';
}

export default function CommunityManageScreen() {
  const navigation = useNavigation();
  const {
    scrollRef,
    onInputFocus,
    contentPadding,
    KeyboardAvoidingView,
    keyboardAvoidingProps,
    scrollProps,
  } = useKeyboardAwareScroll();
  const {
    params: {community: routeCommunity},
  } = useRoute<Route>();
  const id = routeCommunity.id || routeCommunity._id;
  const authUser = useAuthStore(state => state.user);

  const [tab, setTab] = useState<ManageTab>('overview');
  const [community, setCommunity] = useState<any>(routeCommunity);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [transfers, setTransfers] = useState<OwnershipTransfer[]>([]);
  const [invites, setInvites] = useState<InviteItem[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [savingPlatform, setSavingPlatform] = useState(false);
  const [auditFilter, setAuditFilter] = useState<AuditFilter>('all');
  const [platformAdminFlag, setPlatformAdminFlag] = useState(false);
  const [confirmSheet, setConfirmSheet] = useState<ConfirmSheetConfig | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

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
  const [autoDeleteDays, setAutoDeleteDays] = useState('0');

  const timezone = useMemo(() => deviceTimezone(), []);

  const isPlatformAdmin = useMemo(() => {
    if (platformAdminFlag) return true;
    if (community?.platformAdmin === true) return true;
    if (authUser?.role === 'admin') return true;
    return false;
  }, [authUser?.role, community?.platformAdmin, platformAdminFlag]);

  const visibleTabs = useMemo(
    () => TAB_DEFS.filter(item => item.id !== 'platform' || isPlatformAdmin),
    [isPlatformAdmin],
  );

  const activeInvites = useMemo(
    () => invites.filter(invite => !invite.revokedAt),
    [invites],
  );

  const filteredEvents = useMemo(() => {
    if (auditFilter === 'all') return events;
    return events.filter(event => auditCategory(event?.action) === auditFilter);
  }, [auditFilter, events]);

  const applyScheduleFromCommunity = useCallback((next: any) => {
    const schedule = next?.queueSchedule;
    setAutoPublish(next?.queueMode === 'scheduled');
    setAutoDeleteDays(String(next?.queueAutoDeleteDays ?? 0));
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
      ['open', 'approval', 'invite-only'].includes(next?.joinMode) ? next.joinMode : 'open',
    );
    setShowLeadership(Boolean(next?.showLeadership));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [info, join, memberList, transferList, reportList, audit, inviteList] =
        await Promise.all([
          api.get(`/communities/${id}`),
          api.get(`/communities/${id}/join-requests`),
          api.get(`/communities/${id}/members`),
          api.get(`/communities/${id}/ownership-transfers/pending`),
          api.get(`/communities/${id}/content/reports`),
          api.get(`/communities/${id}/audit`),
          api.get(`/communities/${id}/invites`).catch(() => ({data: {invites: []}})),
        ]);
      const nextCommunity = info.data.community || routeCommunity;
      setCommunity(nextCommunity);
      setPlatformAdminFlag(Boolean(info.data?.viewerPermissions?.platformAdmin));
      applySettingsFromCommunity(nextCommunity);
      applyScheduleFromCommunity(nextCommunity);
      setRequests(join.data.requests || []);
      setMembers(memberList.data.members || []);
      setTransfers(transferList.data.transfers || []);
      setReports(reportList.data.reports || []);
      setEvents(audit.data.events || []);
      setInvites(inviteList.data?.invites || []);
    } catch {
      Alert.alert('Could not load management tools');
    } finally {
      setLoading(false);
    }
  }, [applyScheduleFromCommunity, applySettingsFromCommunity, id, routeCommunity]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (tab === 'platform' && !isPlatformAdmin) setTab('overview');
  }, [isPlatformAdmin, tab]);

  const closeConfirmSheet = useCallback(() => {
    if (confirmBusy) return;
    setConfirmSheet(null);
  }, [confirmBusy]);

  const runConfirmSheet = useCallback(async () => {
    if (!confirmSheet || confirmBusy) return;
    setConfirmBusy(true);
    try {
      await confirmSheet.onConfirm();
      setConfirmSheet(null);
    } finally {
      setConfirmBusy(false);
    }
  }, [confirmBusy, confirmSheet]);

  const pickImage = async () => {
    try {
      const picked = await pickAvatarPhoto('communityCover');
      if (picked?.uri) setImage(picked.uri);
    } catch (error) {
      if (!isMediaPickerCancelled(error)) {
        Alert.alert('Could not pick image', 'Please try again.');
      }
    }
  };

  const adjustCoverImage = async () => {
    if (!image) return;
    try {
      const adjusted = await adjustPhoto({uri: image}, 'communityCover');
      setImage(adjusted.uri);
    } catch (error) {
      if (!isMediaPickerCancelled(error)) {
        Alert.alert('Could not adjust', 'Please try again.');
      }
    }
  };

  const review = async (requestId: string, decision: string) => {
    try {
      await api.put(`/communities/${id}/join-requests/${requestId}`, {decision});
      showCommunityToast(decision === 'approved' ? 'Request approved' : 'Request declined');
      await load();
    } catch {
      Alert.alert('Could not update request');
    }
  };

  const invite = async () => {
    setCreatingInvite(true);
    try {
      const r = await api.post(`/communities/${id}/invites`, {});
      const token = r.data.token || r.data.invite?.token;
      if (!token) {
        Alert.alert('Could not create invite', 'No invite code returned.');
        return;
      }
      await Share.share({
        message: `Touch invite for ${community.name}: ${token}`,
      });
      showCommunityToast('Invite created');
      await load();
    } catch {
      Alert.alert('Could not create invite', 'Please try again.');
    } finally {
      setCreatingInvite(false);
    }
  };

  const revokeInvite = async (inviteItem: InviteItem) => {
    const targetId = inviteId(inviteItem);
    if (!targetId) {
      Alert.alert('Could not revoke invite', 'Missing invite id.');
      return;
    }
    setConfirmSheet({
      title: 'Revoke invite?',
      message: 'Anyone with this code will no longer be able to join.',
      confirmLabel: 'Revoke',
      destructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/communities/${id}/invites/${targetId}`);
          showCommunityToast('Invite revoked');
          await load();
        } catch {
          Alert.alert('Could not revoke invite');
        }
      },
    });
  };

  const saveSettings = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Community name cannot be empty.');
      return;
    }
    setSavingSettings(true);
    try {
      const imageUrl = await resolveCommunityImageUrl(image.trim());
      const response = await api.put(`/communities/${id}`, {
        name: name.trim(),
        description: description.trim(),
        image: imageUrl,
        rules: rules.trim(),
        contentVisibility,
        joinMode,
        showLeadership,
        queueMode: community.queueMode || 'manual',
        queueSchedule: community.queueSchedule || null,
        queueScheduleMinutes: community.queueScheduleMinutes || null,
        queueAutoDeleteDays: Number(autoDeleteDays) || 0,
      });
      setCommunity(response.data.community);
      applySettingsFromCommunity(response.data.community);
      showCommunityToast('Settings saved');
    } catch (err: any) {
      Alert.alert('Could not save settings', err?.response?.data?.error || 'Please try again.');
    } finally {
      setSavingSettings(false);
    }
  };

  const moderateContent = async (contentId: string, action: 'remove' | 'restore') => {
    const run = async () => {
      try {
        await api.put(`/communities/${id}/content/${contentId}/moderation`, {action});
        showCommunityToast(action === 'remove' ? 'Post removed' : 'Post kept');
        await load();
      } catch {
        Alert.alert('Could not update report');
      }
    };

    if (action === 'remove') {
      setConfirmSheet({
        title: 'Remove this post?',
        message: 'It will be hidden from the community feed.',
        confirmLabel: 'Remove',
        destructive: true,
        onConfirm: run,
      });
      return;
    }
    await run();
  };

  const updateRole = async (member: MemberItem, role: 'member' | 'moderator') => {
    try {
      await api.put(`/communities/${id}/members/${member.userId}/role`, {role});
      showCommunityToast(role === 'moderator' ? 'Made moderator' : 'Removed moderator');
      await load();
    } catch (err: any) {
      Alert.alert('Could not update role', err?.response?.data?.error || 'Please try again.');
    }
  };

  const banMember = (member: MemberItem) => {
    setConfirmSheet({
      title: 'Ban this member?',
      message: 'They will lose access and cannot participate.',
      confirmLabel: 'Ban',
      destructive: true,
      onConfirm: async () => {
        try {
          await api.put(`/communities/${id}/members/${member.userId}/role`, {role: 'banned'});
          await load();
          showCommunityToast('Member banned');
        } catch (err: any) {
          Alert.alert('Could not ban member', err?.response?.data?.error || 'Please try again.');
        }
      },
    });
  };

  const requestTransfer = async (member: MemberItem) => {
    setConfirmSheet({
      title: 'Transfer ownership?',
      message:
        'The member must accept before ownership changes. You become moderator after acceptance.',
      confirmLabel: 'Nominate',
      onConfirm: async () => {
        try {
          await api.post(`/communities/${id}/ownership-transfers`, {
            toUserId: member.userId,
          });
          showCommunityToast('Transfer requested');
          await load();
        } catch (err: any) {
          Alert.alert(
            'Could not request transfer',
            err?.response?.data?.error || 'Please try again.',
          );
        }
      },
    });
  };

  const acceptTransfer = async (transfer: OwnershipTransfer) => {
    try {
      await api.post(`/communities/${id}/ownership-transfers/${transfer.id}/accept`);
      showCommunityToast('Ownership accepted');
      await load();
    } catch (err: any) {
      Alert.alert(
        'Could not accept ownership',
        err?.response?.data?.error || 'Please try again.',
      );
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
        queueAutoDeleteDays: Math.max(0, Math.min(365, Number(autoDeleteDays) || 0)),
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
      showCommunityToast('Publish schedule saved');
    } catch (err: any) {
      Alert.alert(
        'Could not save schedule',
        err?.response?.data?.error || 'Check the times and try again.',
      );
    } finally {
      setSavingSchedule(false);
    }
  };

  const setPlatformSuspension = async (suspended: boolean) => {
    setConfirmSheet({
      title: suspended ? 'Suspend community?' : 'Restore community?',
      message: suspended
        ? 'Members will lose access until a platform admin restores it.'
        : 'The community will become available again.',
      confirmLabel: suspended ? 'Suspend' : 'Restore',
      destructive: suspended,
      onConfirm: async () => {
        setSavingPlatform(true);
        try {
          await api.put(`/communities/${id}/platform-suspension`, {suspended});
          showCommunityToast(suspended ? 'Community suspended' : 'Community restored');
          await load();
        } catch (err: any) {
          Alert.alert(
            'Could not update suspension',
            err?.response?.data?.error || 'Please try again.',
          );
        } finally {
          setSavingPlatform(false);
        }
      },
    });
  };

  const recoverOwnership = (member: MemberItem) => {
    setConfirmSheet({
      title: 'Recover ownership?',
      message: 'This member will become the community owner.',
      confirmLabel: 'Make owner',
      onConfirm: async () => {
        setSavingPlatform(true);
        try {
          await api.post(`/communities/${id}/platform-recover-ownership`, {
            toUserId: member.userId,
          });
          showCommunityToast('Ownership recovered');
          await load();
        } catch (err: any) {
          Alert.alert(
            'Could not recover ownership',
            err?.response?.data?.error || 'Please try again.',
          );
        } finally {
          setSavingPlatform(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={styles.iconButton}>
            <Feather name="arrow-left" size={22} color={pastelColors.auth.deepText} />
          </Pressable>
          <Text style={styles.head}>Manage community</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.content}>
          <View style={styles.skeletonBlock} />
          <View style={[styles.skeletonBlock, {height: 120}]} />
          <View style={[styles.skeletonBlock, {height: 160}]} />
        </View>
      </SafeAreaView>
    );
  }

  const requestCount = requests.length;
  const reportCount = reports.length;
  const transferPending = transfers.length > 0;
  const inviteCount = activeInvites.length;
  const autoOn = community?.queueMode === 'scheduled' || autoPublish;
  const isSuspended = Boolean(community?.platformSuspended || community?.suspended);

  const renderOverview = () => (
    <>
      <Text style={styles.section}>At a glance</Text>
      <Text style={styles.lead}>Tap a card to jump to that section.</Text>
      <View style={styles.summaryGrid}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open join requests"
          onPress={() => setTab('requests')}
          style={styles.summaryCard}>
          <Feather name="user-plus" size={18} color={pastelColors.accent} />
          <Text style={styles.summaryTitle}>
            {requestCount === 1
              ? '1 request waiting'
              : `${requestCount} requests waiting`}
          </Text>
          <Text style={styles.summaryCopy}>Approve or decline people knocking.</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open publish queue settings"
          onPress={() => setTab('queue')}
          style={styles.summaryCard}>
          <Feather name="clock" size={18} color={pastelColors.accent} />
          <Text style={styles.summaryTitle}>Auto-publish {autoOn ? 'on' : 'off'}</Text>
          <Text style={styles.summaryCopy}>
            {autoOn ? 'Top queue posts go live on schedule.' : 'You publish queue posts manually.'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open reports"
          onPress={() => setTab('reports')}
          style={styles.summaryCard}>
          <Feather name="flag" size={18} color={pastelColors.accent} />
          <Text style={styles.summaryTitle}>
            {reportCount === 1
              ? '1 report unresolved'
              : `${reportCount} reports unresolved`}
          </Text>
          <Text style={styles.summaryCopy}>Keep or remove reported posts.</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={transferPending ? 'Open ownership' : 'Open invites'}
          onPress={() => setTab(transferPending ? 'ownership' : 'invites')}
          style={styles.summaryCard}>
          <Feather
            name={transferPending ? 'key' : 'link'}
            size={18}
            color={pastelColors.accent}
          />
          <Text style={styles.summaryTitle}>
            {transferPending
              ? 'Owner transfer pending'
              : inviteCount === 1
                ? '1 invite active'
                : `${inviteCount} invites active`}
          </Text>
          <Text style={styles.summaryCopy}>
            {transferPending
              ? 'Someone was nominated as the next owner.'
              : 'Share codes so people can join quietly.'}
          </Text>
        </Pressable>
      </View>
    </>
  );

  const renderSettings = () => (
    <>
      <Text style={styles.section}>Community settings</Text>
      <Text style={styles.lead}>Update what people see before joining and how they get in.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          accessibilityLabel="Community name"
          value={name}
          onChangeText={setName}
          onFocus={onInputFocus}
          style={styles.input}
          placeholder="Community name"
          placeholderTextColor={pastelColors.auth.mutedText}
        />

        <Text style={styles.label}>Community photo</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose community image"
          onPress={pickImage}
          style={styles.imagePicker}>
          {image ? (
            <Image source={{uri: image}} style={styles.imagePreview} />
          ) : (
            <Feather name="camera" size={28} color={pastelColors.accent} />
          )}
        </Pressable>
        <Text style={styles.imagePickerText}>
          {image ? 'Tap to change' : 'Add a photo'}
        </Text>
        {image ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adjust community image"
            onPress={adjustCoverImage}
            style={styles.removeImage}>
            <Text style={styles.removeImageText}>Adjust image</Text>
          </Pressable>
        ) : null}
        {image ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove community image"
            onPress={() => setImage('')}
            style={styles.removeImage}>
            <Text style={styles.removeImageText}>Remove image</Text>
          </Pressable>
        ) : null}

        <Text style={styles.label}>Description</Text>
        <TextInput
          accessibilityLabel="Community description"
          value={description}
          onChangeText={setDescription}
          onFocus={onInputFocus}
          style={[styles.input, styles.largeInput]}
          placeholder="What is this space for?"
          placeholderTextColor={pastelColors.auth.mutedText}
          multiline
          scrollEnabled
        />

        <Text style={styles.label}>Rules</Text>
        <TextInput
          accessibilityLabel="Community rules"
          value={rules}
          onChangeText={setRules}
          onFocus={onInputFocus}
          style={[styles.input, styles.largeInput]}
          placeholder="What should members know?"
          placeholderTextColor={pastelColors.auth.mutedText}
          multiline
          scrollEnabled
        />

        <Text style={styles.label}>Visibility</Text>
        <View style={styles.chips}>
          {(['public', 'members'] as const).map(value => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{selected: contentVisibility === value}}
              onPress={() => setContentVisibility(value)}
              style={[styles.chip, contentVisibility === value && styles.chipActive]}>
              <Text
                style={[
                  styles.chipText,
                  contentVisibility === value && styles.chipTextActive,
                ]}>
                {value === 'public' ? 'Public feed' : 'Members only'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>{visibilityImpact(contentVisibility)}</Text>

        <Text style={styles.label}>Join policy</Text>
        <View style={styles.chips}>
          {(['open', 'approval', 'invite-only'] as const).map(value => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{selected: joinMode === value}}
              onPress={() => setJoinMode(value)}
              style={[styles.chip, joinMode === value && styles.chipActive]}>
              <Text
                style={[styles.chipText, joinMode === value && styles.chipTextActive]}>
                {value === 'open' ? 'Open' : value === 'approval' ? 'Approval' : 'Invite only'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>{joinModeImpact(joinMode)}</Text>

        <View style={styles.settingRow}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Show anonymous leadership labels</Text>
            <Text style={styles.rowCopy}>
              Members can see moderator/owner labels, not real profiles.
            </Text>
          </View>
          <Switch
            value={showLeadership}
            onValueChange={setShowLeadership}
            trackColor={{true: pastelColors.accent}}
          />
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save community settings"
        onPress={saveSettings}
        disabled={savingSettings}
        style={[styles.saveButton, savingSettings && styles.disabled]}>
        <Text style={styles.saveButtonText}>
          {savingSettings ? `Saving${ELLIPSIS}` : 'Save community settings'}
        </Text>
      </Pressable>
    </>
  );

  const renderRequests = () => (
    <>
      <Text style={styles.section}>
        {requestCount
          ? `${requestCount} ${requestCount === 1 ? 'person wants' : 'people want'} to join`
          : 'Join requests'}
      </Text>
      <Text style={styles.lead}>
        {requestCount
          ? 'Review who is knocking. You only see what they chose to share.'
          : 'Nobody is waiting right now.'}
      </Text>
      {requestCount ? (
        requests.map(r => (
          <View style={styles.card} key={r.id}>
            <Text style={styles.alias}>{requestHeadline(r)}</Text>
            <Text style={styles.copy}>{requestSubtitle(r)}</Text>
            {r.note ? <Text style={styles.note}>{r.note}</Text> : null}
            {r.createdAt ? (
              <Text style={styles.meta}>Asked {formatFriendlyTimestamp(r.createdAt)}</Text>
            ) : null}
            <View style={styles.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decline join request"
                onPress={() => review(r.id, 'declined')}
                style={styles.secondary}>
                <Text style={styles.secondaryText}>Decline</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Approve join request"
                onPress={() => review(r.id, 'approved')}
                style={styles.primary}>
                <Text style={styles.primaryText}>Approve</Text>
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Feather name="inbox" size={22} color={pastelColors.accent} />
          <Text style={styles.copy}>
            No requests waiting. Share an invite or switch to open join.
          </Text>
        </View>
      )}
    </>
  );

  const renderQueue = () => (
    <>
      <Text style={styles.section}>Auto-publish top posts</Text>
      <Text style={styles.lead}>
        At the scheduled time, the highest net-voted eligible post goes live. If tied, the
        oldest wins. Times use {timezone}.
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
        <View style={styles.card}>
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
                accessibilityRole="button"
                accessibilityState={{selected: scheduleType === value}}
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
                accessibilityLabel="Daily publish time"
                value={dailyTime}
                onChangeText={setDailyTime}
                onFocus={onInputFocus}
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
                accessibilityLabel="Interval hours"
                value={intervalHours}
                onChangeText={setIntervalHours}
                onFocus={onInputFocus}
                keyboardType="number-pad"
                placeholder="3"
                placeholderTextColor={pastelColors.auth.mutedText}
                style={styles.input}
              />
              <Text style={styles.label}>Starting from (HH:MM)</Text>
              <TextInput
                accessibilityLabel="Interval start time"
                value={startTime}
                onChangeText={setStartTime}
                onFocus={onInputFocus}
                placeholder="14:00"
                placeholderTextColor={pastelColors.auth.mutedText}
                style={styles.input}
                autoCapitalize="none"
              />
            </>
          ) : null}

          {scheduleType === 'slots' ? (
            <>
              <Text style={styles.label}>Post times (1st, 2nd, nth{ELLIPSIS})</Text>
              <TextInput
                accessibilityLabel="Slot publish times"
                value={slotTimes}
                onChangeText={setSlotTimes}
                onFocus={onInputFocus}
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
            accessibilityLabel="Repeat every N days"
            value={everyDays}
            onFocus={onInputFocus}
            onChangeText={setEveryDays}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={pastelColors.auth.mutedText}
            style={styles.input}
          />
          <Text style={styles.hint}>Use 1 for every day, 2 for every other day.</Text>
        </View>
      ) : null}
      <Text style={[styles.section, {marginTop: 22}]}>Auto-delete from queue</Text>
      <Text style={styles.lead}>
        Remove posts that stay in the queue too long without being published. Use 0 to keep them
        forever.
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>Delete after how many days?</Text>
        <TextInput
          accessibilityLabel="Queue auto delete days"
          value={autoDeleteDays}
          onChangeText={setAutoDeleteDays}
          onFocus={onInputFocus}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={pastelColors.auth.mutedText}
          style={styles.input}
        />
        <Text style={styles.hint}>0 means never auto-delete. Max 365 days.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save publish schedule"
        onPress={saveSchedule}
        disabled={savingSchedule}
        style={[styles.saveButton, savingSchedule && styles.disabled]}>
        <Text style={styles.saveButtonText}>
          {savingSchedule ? `Saving${ELLIPSIS}` : 'Save queue settings'}
        </Text>
      </Pressable>
    </>
  );

  const renderMembers = () => (
    <>
      <Text style={styles.section}>Members and roles</Text>
      <Text style={styles.lead}>
        Manage roles through anonymous labels. Real profiles stay hidden here.
      </Text>
      {members.length ? (
        members.map((member, index) => (
          <View style={styles.card} key={member.userId}>
            <Text style={styles.alias}>{memberLabel(member, index)}</Text>
            <Text style={styles.copy}>
              {member.role === 'owner'
                ? 'Owns this community'
                : member.role === 'banned'
                  ? 'Banned from this community'
                  : member.role === 'moderator'
                    ? 'Can moderate and review requests'
                    : 'Regular member'}
            </Text>
            {member.joinedAt ? (
              <Text style={styles.meta}>Joined {formatFriendlyTimestamp(member.joinedAt)}</Text>
            ) : null}
            {member.role !== 'owner' && member.role !== 'banned' ? (
              <View style={styles.row}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    member.role === 'moderator' ? 'Remove moderator' : 'Make moderator'
                  }
                  onPress={() =>
                    updateRole(member, member.role === 'moderator' ? 'member' : 'moderator')
                  }
                  style={styles.secondary}>
                  <Text style={styles.secondaryText}>
                    {member.role === 'moderator' ? 'Remove mod' : 'Make mod'}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Transfer ownership"
                  onPress={() => requestTransfer(member)}
                  style={styles.primary}>
                  <Text style={styles.primaryText}>Transfer owner</Text>
                </Pressable>
              </View>
            ) : null}
            {member.role !== 'owner' && member.role !== 'banned' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ban member"
                onPress={() => banMember(member)}
                style={[styles.dangerButton, styles.fullButton]}>
                <Text style={styles.primaryText}>Ban</Text>
              </Pressable>
            ) : null}
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Feather name="users" size={22} color={pastelColors.accent} />
          <Text style={styles.copy}>No members loaded yet.</Text>
        </View>
      )}
    </>
  );

  const renderInvites = () => (
    <>
      <Text style={styles.section}>Invites</Text>
      <Text style={styles.lead}>
        Invite codes let people join without revealing themselves first.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create and share invite"
        onPress={invite}
        disabled={creatingInvite}
        style={[styles.saveButton, creatingInvite && styles.disabled]}>
        <Text style={styles.saveButtonText}>
          {creatingInvite ? `Creating${ELLIPSIS}` : 'Create and share invite'}
        </Text>
      </Pressable>
      {activeInvites.length ? (
        activeInvites.map((inviteItem, index) => {
          const key = inviteId(inviteItem) || inviteItem.token || `invite-${index}`;
          const usesLabel =
            typeof inviteItem.uses === 'number' || typeof inviteItem.maxUses === 'number'
              ? `${inviteItem.uses ?? 0}/${inviteItem.maxUses ?? ELLIPSIS} uses`
              : null;
          return (
            <View style={styles.card} key={key}>
              <Text style={styles.alias}>Invite code</Text>
              {inviteItem.token ? (
                <Text style={styles.note} selectable>
                  {inviteItem.token}
                </Text>
              ) : null}
              {inviteItem.createdAt ? (
                <Text style={styles.meta}>
                  Created {formatFriendlyTimestamp(inviteItem.createdAt)}
                </Text>
              ) : null}
              {usesLabel ? <Text style={styles.meta}>{usesLabel}</Text> : null}
              {inviteItem.expiresAt ? (
                <Text style={styles.meta}>
                  Expires {formatFriendlyTimestamp(inviteItem.expiresAt)}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Revoke invite"
                onPress={() => revokeInvite(inviteItem)}
                style={[styles.secondary, styles.fullButton]}>
                <Text style={styles.secondaryText}>Revoke</Text>
              </Pressable>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyCard}>
          <Feather name="link" size={22} color={pastelColors.accent} />
          <Text style={styles.copy}>No active invites. Create one to share quietly.</Text>
        </View>
      )}
    </>
  );

  const renderReports = () => (
    <>
      <Text style={styles.section}>
        {reportCount
          ? `${reportCount} report${reportCount === 1 ? '' : 's'} to review`
          : 'Reports'}
      </Text>
      <Text style={styles.lead}>
        {reportCount
          ? 'Review reported content without seeing who reported it.'
          : 'No pending reports.'}
      </Text>
      {reportCount ? (
        reports.map(report => (
          <View style={styles.card} key={report.id}>
            <Text style={styles.alias}>{humanReportReason(report.reason)}</Text>
            <Text style={styles.copy}>{report.postAlias || 'Anonymous post'}</Text>
            {report.postText ? <Text style={styles.note}>{report.postText}</Text> : null}
            {report.context ? <Text style={styles.note}>{report.context}</Text> : null}
            {report.createdAt ? (
              <Text style={styles.meta}>
                Reported {formatFriendlyTimestamp(report.createdAt)}
              </Text>
            ) : null}
            <View style={styles.row}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Keep reported post"
                onPress={() => moderateContent(report.contentId, 'restore')}
                style={styles.secondary}>
                <Text style={styles.secondaryText}>Keep</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remove reported post"
                onPress={() => moderateContent(report.contentId, 'remove')}
                style={styles.primary}>
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
    </>
  );

  const renderAudit = () => (
    <>
      <Text style={styles.section}>Audit history</Text>
      <Text style={styles.lead}>A plain-language trail of what changed here.</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}>
        {(['all', 'membership', 'content', 'ownership', 'settings'] as const).map(filter => (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{selected: auditFilter === filter}}
            onPress={() => setAuditFilter(filter)}
            style={[styles.chip, auditFilter === filter && styles.chipActive]}>
            <Text
              style={[styles.chipText, auditFilter === filter && styles.chipTextActive]}>
              {filter === 'all' ? 'All' : filter}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {filteredEvents.length ? (
        filteredEvents.map(event => (
          <View style={styles.event} key={event.id || `${event.action}-${event.createdAt}`}>
            <Text style={styles.eventAction}>{humanAuditAction(event.action)}</Text>
            <Text style={styles.copy}>{formatFriendlyTimestamp(event.createdAt)}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.copy}>No recorded actions.</Text>
      )}
    </>
  );

  const renderOwnership = () => (
    <>
      <Text style={styles.section}>Ownership</Text>
      <Text style={styles.lead}>
        Transfers only complete after the nominated member accepts.
      </Text>
      {transfers.length ? (
        transfers.map(transfer => (
          <View style={styles.card} key={transfer.id}>
            <Text style={styles.alias}>You were nominated as owner</Text>
            {transfer.createdAt ? (
              <Text style={styles.meta}>
                Requested {formatFriendlyTimestamp(transfer.createdAt)}
              </Text>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Accept ownership"
              onPress={() => acceptTransfer(transfer)}
              style={[styles.primary, styles.fullButton]}>
              <Text style={styles.primaryText}>Accept ownership</Text>
            </Pressable>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Feather name="key" size={22} color={pastelColors.accent} />
          <Text style={styles.copy}>
            No pending transfers. Nominate someone from Members when you are ready.
          </Text>
        </View>
      )}
    </>
  );

  const renderPlatform = () => {
    const recoverableMembers = members.filter(
      member =>
        member.role !== 'owner' &&
        member.role !== 'banned' &&
        member.status !== 'banned' &&
        member.status !== 'left',
    );
    const platformAuditEvents = (filteredEvents.length ? filteredEvents : events).slice(0, 8);

    return (
      <>
        <Text style={styles.section}>Platform controls</Text>
        <Text style={styles.platformBanner}>Only platform admins can see this.</Text>
        <Text style={styles.lead}>
          Investigate reports, suspend access, recover ownership, and review audit history.
        </Text>

        <Text style={styles.section}>Investigate reports</Text>
        <Text style={styles.platformBanner}>Only platform admins can see this.</Text>
        <Text style={styles.lead}>
          {reportCount
            ? `${reportCount} unresolved report${reportCount === 1 ? '' : 's'}. Keep or remove, or open the full Reports tab.`
            : 'No unresolved reports right now.'}
        </Text>
        {reportCount ? (
          <>
            {reports.slice(0, 5).map(report => (
              <View style={styles.card} key={report.id}>
                <Text style={styles.alias}>{humanReportReason(report.reason)}</Text>
                <Text style={styles.copy}>{report.postAlias || 'Anonymous post'}</Text>
                {report.postText ? <Text style={styles.note}>{report.postText}</Text> : null}
                {report.createdAt ? (
                  <Text style={styles.meta}>
                    Reported {formatFriendlyTimestamp(report.createdAt)}
                  </Text>
                ) : null}
                <View style={styles.row}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Keep reported post"
                    onPress={() => moderateContent(report.contentId, 'restore')}
                    style={styles.secondary}>
                    <Text style={styles.secondaryText}>Keep</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove reported post"
                    onPress={() => moderateContent(report.contentId, 'remove')}
                    style={styles.primary}>
                    <Text style={styles.primaryText}>Remove post</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open reports tab"
              onPress={() => setTab('reports')}
              style={[styles.secondary, styles.fullButton]}>
              <Text style={styles.secondaryText}>Open full Reports tab</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open reports tab"
            onPress={() => setTab('reports')}
            style={[styles.secondary, styles.fullButton]}>
            <Text style={styles.secondaryText}>Open Reports tab</Text>
          </Pressable>
        )}

        <Text style={styles.section}>Suspend / restore</Text>
        <Text style={styles.platformBanner}>Only platform admins can see this.</Text>
        <View style={styles.card}>
          <Text style={styles.alias}>{isSuspended ? 'Currently suspended' : 'Currently live'}</Text>
          <Text style={styles.copy}>
            {isSuspended
              ? 'Members cannot access this community right now.'
              : 'This community is available to its members.'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSuspended ? 'Restore community' : 'Suspend community'}
            onPress={() => setPlatformSuspension(!isSuspended)}
            disabled={savingPlatform}
            style={[
              isSuspended ? styles.primary : styles.dangerButton,
              styles.fullButton,
              savingPlatform && styles.disabled,
            ]}>
            <Text style={styles.primaryText}>
              {savingPlatform
                ? `Working${ELLIPSIS}`
                : isSuspended
                  ? 'Restore community'
                  : 'Suspend community'}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Recover ownership</Text>
        <Text style={styles.platformBanner}>Only platform admins can see this.</Text>
        <Text style={styles.lead}>
          Pick an active non-owner member to become the owner when recovery is needed.
        </Text>
        {recoverableMembers.length ? (
          recoverableMembers.map((member, index) => (
            <View style={styles.card} key={`recover-${member.userId}`}>
              <Text style={styles.alias}>{memberLabel(member, index)}</Text>
              <Text style={styles.copy}>
                {member.role === 'moderator' ? 'Moderator' : 'Member'}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Make owner recover"
                onPress={() => recoverOwnership(member)}
                disabled={savingPlatform}
                style={[styles.primary, styles.fullButton, savingPlatform && styles.disabled]}>
                <Text style={styles.primaryText}>Make owner (recover)</Text>
              </Pressable>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Feather name="key" size={22} color={pastelColors.accent} />
            <Text style={styles.copy}>No eligible members to recover ownership to.</Text>
          </View>
        )}

        <Text style={styles.section}>View full audit</Text>
        <Text style={styles.platformBanner}>Only platform admins can see this.</Text>
        <Text style={styles.lead}>Recent platform-visible activity for this community.</Text>
        {platformAuditEvents.length ? (
          platformAuditEvents.map(event => (
            <View style={styles.event} key={event.id || `${event.action}-${event.createdAt}`}>
              <Text style={styles.eventAction}>{humanAuditAction(event.action)}</Text>
              <Text style={styles.copy}>{formatFriendlyTimestamp(event.createdAt)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.copy}>No recorded actions.</Text>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open audit tab"
          onPress={() => setTab('audit')}
          style={[styles.secondary, styles.fullButton]}>
          <Text style={styles.secondaryText}>Open Audit tab</Text>
        </Pressable>
      </>
    );
  };

  const body = (() => {
    switch (tab) {
      case 'overview':
        return renderOverview();
      case 'settings':
        return renderSettings();
      case 'requests':
        return renderRequests();
      case 'queue':
        return renderQueue();
      case 'members':
        return renderMembers();
      case 'invites':
        return renderInvites();
      case 'reports':
        return renderReports();
      case 'audit':
        return renderAudit();
      case 'ownership':
        return renderOwnership();
      case 'platform':
        return renderPlatform();
      default:
        return renderOverview();
    }
  })();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.iconButton}>
          <Feather name="arrow-left" size={22} color={pastelColors.auth.deepText} />
        </Pressable>
        <Text style={styles.head}>Manage community</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create invite"
          onPress={invite}
          style={styles.iconButton}>
          <Feather name="link" size={21} color={pastelColors.auth.deepText} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={styles.tabsScroll}>
        {visibleTabs.map(item => {
          const active = tab === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{selected: active}}
              accessibilityLabel={`${item.label} tab`}
              onPress={() => setTab(item.id)}
              style={[styles.tabChip, active && styles.tabChipActive]}>
              <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <KeyboardAvoidingView {...keyboardAvoidingProps}>
      <ScrollView
        ref={scrollRef}
        {...scrollProps}
        contentContainerStyle={[styles.content, contentPadding]}>
        {body}
      </ScrollView>
      </KeyboardAvoidingView>

      <CommunityConfirmSheet
        visible={Boolean(confirmSheet)}
        title={confirmSheet?.title || ''}
        message={confirmSheet?.message || ''}
        confirmLabel={confirmSheet?.confirmLabel || 'Confirm'}
        destructive={Boolean(confirmSheet?.destructive)}
        busy={confirmBusy}
        onConfirm={() => {
          void runConfirmSheet();
        }}
        onCancel={closeConfirmSheet}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: pastelColors.auth.background},
  header: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {fontSize: 17, fontWeight: '900', color: pastelColors.auth.deepText},
  tabsScroll: {maxHeight: 56},
  tabs: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    alignItems: 'center',
  },
  tabChip: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: pastelColors.auth.glassSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabChipActive: {backgroundColor: pastelColors.accent},
  tabChipText: {fontWeight: '800', color: pastelColors.auth.deepText, fontSize: 13},
  tabChipTextActive: {color: pastelColors.white},
  content: {padding: 16, paddingBottom: 36},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  section: {
    marginTop: 4,
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
  platformBanner: {
    marginBottom: 8,
    color: pastelColors.accent,
    fontWeight: '800',
  },
  summaryGrid: {gap: 10},
  summaryCard: {
    minHeight: 88,
    padding: 14,
    borderRadius: 16,
    backgroundColor: pastelColors.white,
    gap: 6,
  },
  summaryTitle: {fontWeight: '900', color: pastelColors.auth.deepText, fontSize: 15},
  summaryCopy: {color: pastelColors.auth.mutedText, fontWeight: '600', fontSize: 12, lineHeight: 17},
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
  card: {
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
  filterRow: {gap: 8, paddingBottom: 12},
  chip: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: pastelColors.auth.glassSurface,
    alignItems: 'center',
    justifyContent: 'center',
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
  largeInput: {height: 112, maxHeight: 112, textAlignVertical: 'top'},
  imagePicker: {
    alignSelf: 'center',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: pastelColors.auth.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 8,
  },
  imagePreview: {width: 116, height: 116, borderRadius: 58},
  imagePickerText: {
    marginTop: 8,
    fontWeight: '800',
    color: pastelColors.auth.mutedText,
    textAlign: 'center',
  },
  removeImage: {
    marginTop: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {fontWeight: '800', color: pastelColors.accent},
  hint: {
    marginTop: 8,
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  saveButton: {
    marginBottom: 18,
    minHeight: 48,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pastelColors.accent,
  },
  saveButtonText: {color: pastelColors.white, fontWeight: '900'},
  disabled: {opacity: 0.6},
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
    minHeight: 44,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: pastelColors.auth.glassSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {fontWeight: '800', color: pastelColors.auth.deepText},
  primary: {
    minHeight: 44,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: pastelColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    minHeight: 44,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#C45C5C',
    alignItems: 'center',
    justifyContent: 'center',
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
  skeletonBlock: {
    marginBottom: 12,
    height: 72,
    borderRadius: 16,
    backgroundColor: pastelColors.white,
  },
});
