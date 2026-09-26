import React, {useEffect, useMemo, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {pastelColors} from '../../theme/colors';
import {DOT, ELLIPSIS} from './communityUx';
import {useKeyboardHeight} from './communityKeyboard';

type Props = {
  visible: boolean;
  username?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    useAlias: boolean;
    alias: string;
    revealUsername: boolean;
    username: string;
    note: string;
  }) => void;
};

function suggestAlias() {
  const animals = ['Owl', 'Fox', 'Moth', 'Kite', 'Fern', 'Wave', 'Ember', 'Moss', 'Lantern', 'Rain'];
  const moods = ['Quiet', 'Night', 'Soft', 'Hidden', 'Kind', 'Brave', 'Calm', 'Wild', 'Guest', 'Blue'];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const mood = moods[Math.floor(Math.random() * moods.length)];
  return `${mood} ${animal}`;
}

export default function CommunityJoinRequestSheet({
  visible,
  username = '',
  submitting = false,
  onClose,
  onSubmit,
}: Props) {
  const [useAlias, setUseAlias] = useState(true);
  const [revealUsername, setRevealUsername] = useState(false);
  const [alias, setAlias] = useState(suggestAlias());
  const [note, setNote] = useState('');
  const keyboardHeight = useKeyboardHeight();
  const displayUsername = username.trim().replace(/^@/, '');

  useEffect(() => {
    if (visible) {
      setUseAlias(true);
      setRevealUsername(false);
      setAlias(suggestAlias());
      setNote('');
    }
  }, [visible]);

  const canSend = useMemo(() => {
    if (useAlias && !alias.trim()) return false;
    if (revealUsername && !displayUsername) return false;
    return useAlias || revealUsername;
  }, [alias, displayUsername, revealUsername, useAlias]);

  const previewParts = [
    useAlias ? alias.trim() || 'alias' : null,
    revealUsername ? `@${displayUsername}` : null,
    note.trim() ? 'your note' : null,
  ].filter(Boolean);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, {paddingBottom: 28 + keyboardHeight}]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          bounces={false}>
          <Text style={styles.title}>Ask to join</Text>
          <Text style={styles.copy}>
            Your public profile is not shown in the community. Moderators only see what you
            choose below.
          </Text>

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Use only an alias</Text>
              <Text style={styles.rowCopy}>A nickname only for this request.</Text>
            </View>
            <Switch
              value={useAlias}
              onValueChange={setUseAlias}
              trackColor={{true: pastelColors.accent}}
            />
          </View>
          {useAlias ? (
            <TextInput
              accessibilityLabel="Join request alias"
              value={alias}
              onChangeText={setAlias}
              placeholder="Quiet Fox"
              placeholderTextColor={pastelColors.auth.mutedText}
              style={styles.input}
            />
          ) : null}

          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Reveal my app username to admins</Text>
              <Text style={styles.rowCopy}>
                Admins see @{displayUsername || 'your_username'} - not the whole community.
              </Text>
            </View>
            <Switch
              value={revealUsername}
              onValueChange={setRevealUsername}
              trackColor={{true: pastelColors.accent}}
              disabled={!displayUsername}
            />
          </View>

          <TextInput
            accessibilityLabel="Join request note"
            value={note}
            onChangeText={setNote}
            placeholder="Optional note to moderators"
            placeholderTextColor={pastelColors.auth.mutedText}
            multiline
            scrollEnabled
            style={[styles.input, styles.noteInput]}
          />

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Admins will see</Text>
            <Text style={styles.previewText}>{previewParts.join(DOT) || 'Nothing yet'}</Text>
            <Text style={styles.warning}>Your public profile is not shown in the community.</Text>
          </View>

          {!canSend ? (
            <Text style={styles.hint}>Turn on an alias, your username, or both.</Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send join request"
            disabled={!canSend || submitting}
            onPress={() =>
              onSubmit({
                useAlias,
                alias: alias.trim(),
                revealUsername,
                username: displayUsername,
                note: note.trim(),
              })
            }
            style={[styles.button, (!canSend || submitting) && styles.disabled]}>
            <Text style={styles.buttonText}>
              {submitting ? `Sending${ELLIPSIS}` : 'Send request'}
            </Text>
          </Pressable>
          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Not now</Text>
          </Pressable>
        </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, justifyContent: 'flex-end'},
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(50, 17, 31, 0.28)'},
  sheet: {
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: pastelColors.auth.background,
  },
  title: {fontSize: 24, fontWeight: '900', color: pastelColors.auth.deepText},
  copy: {
    marginTop: 6,
    marginBottom: 8,
    color: pastelColors.auth.mutedText,
    fontWeight: '600',
    lineHeight: 20,
  },
  row: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: pastelColors.auth.glassSurface,
    flexDirection: 'row',
    alignItems: 'center',
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
  input: {
    marginTop: 10,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: pastelColors.white,
    color: pastelColors.auth.deepText,
    fontWeight: '700',
  },
  noteInput: {height: 96, maxHeight: 96, textAlignVertical: 'top'},
  preview: {
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: pastelColors.auth.glassSurface,
  },
  previewLabel: {color: pastelColors.auth.deepText, fontWeight: '900'},
  previewText: {
    marginTop: 4,
    color: pastelColors.auth.mutedText,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  warning: {
    marginTop: 8,
    color: pastelColors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  hint: {
    marginTop: 12,
    color: pastelColors.auth.mutedText,
    fontWeight: '700',
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    minHeight: 48,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: pastelColors.accent,
  },
  disabled: {opacity: 0.55},
  buttonText: {color: pastelColors.white, fontSize: 16, fontWeight: '900'},
  cancel: {marginTop: 12, alignItems: 'center', padding: 8},
  cancelText: {color: pastelColors.auth.mutedText, fontWeight: '800'},
});
