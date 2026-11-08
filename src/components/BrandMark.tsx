import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme/tokens';

type BrandMarkProps = { size?: number };

export function BrandMark({ size = 38 }: BrandMarkProps) {
  return (
    <View style={[styles.mark, { width: size, height: size, borderRadius: size * 0.32 }]}>
      <View style={[styles.stem, { height: size * 0.48 }]} />
      <View style={[styles.left, { width: size * 0.14, height: size * 0.32 }]} />
      <View style={[styles.right, { width: size * 0.14, height: size * 0.32 }]} />
      <Text style={[styles.dot, { fontSize: size * 0.15 }]}>●</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: colors.primary },
  stem: { width: 3, borderRadius: radius.pill, backgroundColor: colors.white, transform: [{ rotate: '18deg' }] },
  left: { position: 'absolute', left: '27%', bottom: '23%', borderRadius: radius.pill, backgroundColor: '#A5F3FC', transform: [{ rotate: '18deg' }] },
  right: { position: 'absolute', right: '25%', bottom: '23%', borderRadius: radius.pill, backgroundColor: '#C4B5FD', transform: [{ rotate: '-18deg' }] },
  dot: { position: 'absolute', top: '15%', right: '17%', color: colors.white },
});
