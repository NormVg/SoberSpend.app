import { NeoButton } from '@/components/ui/neo-button';
import { NeoCard } from '@/components/ui/neo-card';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { categorize } from '@/utils/categorize';
import { parseUPIString, upiToPendingTransaction } from '@/utils/upi-parser';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { QrCode, ScanLine } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setPending = useExpenseStore((s) => s.setPendingTransaction);
  const categories = useBudgetStore((s) => s.categories);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(true);

  // Manual entry forms
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const detectedCategory = merchant ? categorize(merchant) : null;
  const categoryObj = detectedCategory ? categories.find((c) => c.id === detectedCategory) : null;

  useEffect(() => {
    if (isScannerOpen && !permission?.granted) {
      requestPermission();
    }
  }, [isScannerOpen, permission]);

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const isDemoMode = useBudgetStore.getState().isDemoMode;
    const upiData = parseUPIString(data);

    if (upiData) {
      const pending = upiToPendingTransaction(upiData);
      setPending(pending);
      // Always go to in-app review first — Pay button will open UPI app
      router.push('/decision');
    } else {
      alert('Not a valid UPI QR code. Please use manual entry.');
      setScanned(false);
      setIsScannerOpen(false);
    }
  };

  const handleProceed = () => {
    if (!merchant.trim() || !amount.trim()) return;

    const catId = categorize(merchant);
    setPending({
      merchant: merchant.trim(),
      amount: parseFloat(amount),
      category: catId,
      note: note.trim() || undefined,
    });

    router.push('/decision');
  };

  const handleSimulate = () => {
    // Simulate a scanned UPI Deep Link for a Grocery Store
    handleBarcodeScanned({
      type: 'qr',
      data: 'upi://pay?pa=store@bank&pn=BigBazaar&mc=5411&am=1250.00&tn=Groceries'
    });
  };

  // --------------------------------------------------------------------------
  // CAMERA VIEW
  // --------------------------------------------------------------------------
  if (isScannerOpen) {
    if (!permission?.granted) {
      return (
        <View style={[styles.container, styles.centerAll]}>
          <Text style={styles.title}>Camera Access Needed</Text>
          <NeoButton title="Allow Camera" variant="primary" onPress={requestPermission} />
          <NeoButton title="Cancel" variant="outline" onPress={() => setIsScannerOpen(false)} style={{ marginTop: Spacing.md }} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={[styles.overlayTop, { paddingTop: insets.top + Spacing.md }]}>
            <Text style={styles.scanInstruction}>Scan UPI QR Code</Text>
            <NeoButton
              title="Manual Entry"
              variant="outline"
              size="sm"
              onPress={() => setIsScannerOpen(false)}
            />
          </View>

          <View style={styles.scannerOverlay}>
            <View style={styles.scanTargetGroup}>
              <View style={styles.scanTarget} />
              <ScanLine size={100} color={Colors.accent} strokeWidth={1} style={styles.scanAnim} />
            </View>
          </View>

          <View style={styles.overlayBottom}>
            <NeoButton
              title="Simulate Test QR"
              variant="primary"
              onPress={handleSimulate}
            />
          </View>
        </CameraView>
      </View>
    );
  }

  // --------------------------------------------------------------------------
  // MANUAL ENTRY VIEW
  // --------------------------------------------------------------------------
  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <NeoButton
            title="←"
            variant="outline"
            size="sm"
            onPress={() => router.back()}
            style={{ paddingHorizontal: Spacing.md }}
          />
          <Text style={styles.title}>Add Expense</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Scan Header CTA */}
        <NeoCard color={Colors.surface} style={{ marginBottom: Spacing.lg, padding: 0 }}>
          <Pressable
            style={styles.scanCardPressable}
            onPress={() => {
              setScanned(false);
              setIsScannerOpen(true);
            }}
          >
            <View style={styles.scanCardIcon}>
              <QrCode size={40} color={Colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.scanCardText}>
              <Text style={styles.scanCardTitle}>Scan UPI QR</Text>
              <Text style={styles.scanCardSub}>Auto-detects merchant & amount</Text>
            </View>
          </Pressable>
        </NeoCard>

        {/* Manual Entry */}
        <Text style={styles.sectionTitle}>Manual Entry</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Merchant / Payee</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Zomato, Uber, Amazon"
            placeholderTextColor={Colors.textMuted}
            value={merchant}
            onChangeText={setMerchant}
            autoCapitalize="words"
          />
        </View>

        {categoryObj && (
          <View style={[styles.categoryPill, { backgroundColor: categoryObj.color }]}>
            <Text style={styles.categoryPillText}>
              Category: {categoryObj.name}
            </Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount (₹)</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Note (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="What's this for?"
            placeholderTextColor={Colors.textMuted}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Proceed Button */}
        <View style={{ marginTop: Spacing.xl }}>
          <NeoButton
            title="Review Transaction"
            variant="primary"
            size="lg"
            onPress={handleProceed}
            disabled={!merchant.trim() || !amount.trim()}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centerAll: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.white,
    fontWeight: '700',
  },

  // Custom Scan Card CTA
  scanCardPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  scanCardIcon: {
    backgroundColor: 'rgba(197, 71, 112, 0.1)',
    padding: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: Borders.thin,
    borderColor: Colors.accent,
    marginRight: Spacing.md,
  },
  scanCardText: {
    flex: 1,
  },
  scanCardTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.white,
    fontWeight: '700',
  },
  scanCardSub: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  sectionTitle: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: Borders.medium,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.white,
  },
  amountInput: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    borderWidth: Borders.thin,
    borderColor: Colors.black,
    marginBottom: Spacing.md,
  },
  categoryPillText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.black,
    fontWeight: '700',
  },

  // Camera Overlay Styles
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 10,
  },
  scanInstruction: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.xl,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  scannerOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTargetGroup: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTarget: {
    width: 250,
    height: 250,
    borderWidth: Borders.thick,
    borderColor: Colors.accent,
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scanAnim: {
    position: 'absolute',
    opacity: 0.5,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: Spacing.xxl * 2,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
});
