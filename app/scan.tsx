import { NeoButton } from '@/components/ui/neo-button';
import { NeoCard } from '@/components/ui/neo-card';
import { API_BASE_URL } from '@/constants/api';
import { Borders, Colors, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/auth-store';
import { useBudgetStore } from '@/store/budget-store';
import { useExpenseStore } from '@/store/expense-store';
import { parseUPIString, upiToPendingTransaction } from '@/utils/upi-parser';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Camera as CameraIcon, Car, Circle, CircleEllipsis, Film, QrCode, ScanLine, ShoppingBag, Utensils, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const iconMap: Record<string, any> = {
  'utensils': Utensils, 'car': Car, 'shopping-bag': ShoppingBag,
  'film': Film, 'zap': Zap, 'circle-ellipsis': CircleEllipsis,
};

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setPending = useExpenseStore((s) => s.setPendingTransaction);
  const categories = useBudgetStore((s) => s.categories);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState('');

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
    if (!merchant.trim() || !amount.trim() || !categoryId) return;
    setPending({
      merchant: merchant.trim(),
      amount: parseFloat(amount),
      category: categoryId,
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

  const scanReceipt = async () => {
    if (!cameraRef.current || isUploading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      setIsUploading(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      if (!photo) throw new Error('Failed to capture photo');

      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('Not logged in');

      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('file', {
        uri: Platform.OS === 'ios' ? photo.uri.replace('file://', '') : photo.uri,
        name: 'receipt.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${API_BASE_URL}/api/analyze-receipt`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          // Note: FormData sets its own Content-Type boundary!
        },
        body: formData,
      });

      const resText = await response.text();
      let result;
      try { result = JSON.parse(resText); } catch { throw new Error('Invalid JSON: ' + resText); }

      if (response.ok && result.status === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPending({
          merchant: 'Scanned Receipt',
          amount: result.data.total_spent,
          category: result.data.category,
          budgetStatus: result.data.budget_status,
          aiRoast: result.data.ai_roast, // The Ollama roast!
        });
        router.push('/decision');
      } else {
        throw new Error(result.message || 'Unknown error');
      }
    } catch (err: any) {
      console.warn('AI Analysis failed:', err);
      alert('Analysis failed: ' + (err.message || 'Unknown error'));
      setScanned(false);
    } finally {
      setIsUploading(false);
    }
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
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned || isUploading ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={[styles.overlayTop, { paddingTop: insets.top + Spacing.md }]}>
            <Text style={styles.scanInstruction}>Scan Receipt / QR</Text>
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
            {isUploading ? (
              <NeoCard color={Colors.surface} style={{ padding: Spacing.xl, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.accent} />
                <Text style={[styles.title, { marginTop: Spacing.md }]}>AI IS JUDGING...</Text>
                <Text style={styles.inputLabel}>Analyzing receipt and finding bad habits.</Text>
              </NeoCard>
            ) : (
              <NeoButton
                title="SNAP RECEIPT"
                variant="primary"
                size="lg"
                icon={<CameraIcon size={24} color={Colors.bg} />}
                onPress={scanReceipt}
                style={{ paddingHorizontal: 40 }}
              />
            )}
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

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.textMuted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.chipGrid}>
            {categories.filter(c => c.id !== 'other').map((cat) => {
              const isSelected = categoryId === cat.id;
              const LucideIcon = iconMap[cat.icon] || Circle;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => { Haptics.selectionAsync(); setCategoryId(cat.id); }}
                  style={[
                    styles.chip,
                    { borderColor: isSelected ? cat.color : Colors.border },
                    isSelected && { backgroundColor: cat.color },
                  ]}
                >
                  <LucideIcon size={14} color={isSelected ? Colors.black : Colors.textSecondary} strokeWidth={2.5} />
                  <Text style={[styles.chipText, { color: isSelected ? Colors.black : Colors.textSecondary }]}>{cat.name}</Text>
                </Pressable>
              );
            })}
          </View>
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
            disabled={!merchant.trim() || !amount.trim() || !categoryId}
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: Radii.pill,
  },
  chipText: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
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
