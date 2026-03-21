import { NeoCard } from '@/components/ui/neo-card';
import { Colors, Fonts, FontSizes, Spacing } from '@/constants/theme';
import { Coffee, Eye, ShieldAlert, ShieldCheck, Siren, Skull, TriangleAlert } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type RiskLevel = 'BROKE' | 'DANGER' | 'WASTED' | 'WARNING' | 'SUS' | 'SAFE' | 'CHILL';

interface RiskBannerProps {
  riskLevel: RiskLevel;
  message: string;
  highlightedWord?: string;
}

const riskConfig: Record<RiskLevel, { icon: any, color: string }> = {
  BROKE: { icon: Skull, color: Colors.accent },
  DANGER: { icon: Siren, color: Colors.accent },
  WASTED: { icon: ShieldAlert, color: Colors.pink },
  WARNING: { icon: TriangleAlert, color: Colors.orange },
  SUS: { icon: Eye, color: Colors.yellow },
  SAFE: { icon: ShieldCheck, color: Colors.safe },
  CHILL: { icon: Coffee, color: Colors.mint },
};

export function RiskBanner({ riskLevel, message, highlightedWord }: RiskBannerProps) {
  const parts = highlightedWord ? message.split(highlightedWord) : [message];
  const { icon: Icon, color } = riskConfig[riskLevel] || riskConfig.SAFE;

  return (
    <NeoCard style={styles.cardWrapper} color={color} offset={true}>
      <View style={styles.contentPad}>
        <Icon size={48} color={Colors.black} strokeWidth={3} style={styles.icon} />

        <Text style={styles.riskLabel}>RISK LEVEL</Text>
        <Text style={styles.riskLevelText}>{riskLevel}</Text>

        <Text style={styles.message}>
          {highlightedWord && parts.length === 2 ? (
            <>
              {parts[0]}
              <Text style={styles.highlight}>{highlightedWord}</Text>
              {parts[1]}
            </>
          ) : (
            message
          )}
        </Text>
      </View>
    </NeoCard>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    marginTop: Spacing.md,
  },
  contentPad: {
    padding: Spacing.xs,
    paddingBottom: Spacing.md,
  },
  icon: {
    marginBottom: Spacing.lg,
  },
  riskLabel: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.sm,
    color: Colors.black,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  riskLevelText: {
    fontFamily: Fonts.display,
    fontSize: 72,
    color: Colors.black,
    lineHeight: 72,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.lg,
    marginTop: -4,
  },
  message: {
    fontFamily: Fonts.display,
    fontSize: FontSizes.lg,
    color: Colors.black,
    lineHeight: 24,
  },
  highlight: {
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
