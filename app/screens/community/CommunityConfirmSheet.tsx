import React from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import {pastelColors} from '../../theme/colors';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function CommunityConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={styles.backdrop}
          onPress={onCancel}
        />
        <View style={styles.sheet} accessibilityViewIsModal>
          <Text style={styles.title} maxFontSizeMultiplier={1.4}>
            {title}
          </Text>
          <Text style={styles.message} maxFontSizeMultiplier={1.4}>
            {message}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
            disabled={busy}
            onPress={onConfirm}
            style={[
              styles.confirm,
              destructive ? styles.danger : styles.primary,
              busy && styles.disabled,
            ]}>
            <Text style={styles.confirmText}>{busy ? 'Working...' : confirmLabel}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            onPress={onCancel}
            style={styles.cancel}>
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {flex: 1, justifyContent: 'flex-end'},
  backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(50, 17, 31, 0.32)'},
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: pastelColors.auth.background,
  },
  title: {fontSize: 22, fontWeight: '900', color: pastelColors.auth.deepText},
  message: {
    marginTop: 8,
    marginBottom: 16,
    color: pastelColors.auth.mutedText,
    fontWeight: '700',
    lineHeight: 20,
  },
  confirm: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {backgroundColor: pastelColors.accent},
  danger: {backgroundColor: '#C45C5C'},
  disabled: {opacity: 0.55},
  confirmText: {color: pastelColors.white, fontWeight: '900', fontSize: 16},
  cancel: {marginTop: 12, minHeight: 44, alignItems: 'center', justifyContent: 'center'},
  cancelText: {color: pastelColors.auth.mutedText, fontWeight: '800'},
});
