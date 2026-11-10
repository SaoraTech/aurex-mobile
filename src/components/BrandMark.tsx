import { Image, StyleSheet } from 'react-native';
import { aurexMarkSource } from '../assets/aurexMark';

type BrandMarkProps = { size?: number };

export function BrandMark({ size = 38 }: BrandMarkProps) {
  return <Image accessibilityLabel="Logo officiel Aurex" source={aurexMarkSource} resizeMode="contain" style={[styles.mark, { width: size, height: size }]} />;
}

const styles = StyleSheet.create({
  mark: { flexShrink: 0 },
});
