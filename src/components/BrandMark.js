import { Image, StyleSheet, View } from 'react-native';

export function BrandMark({ size = 38 }) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size * 0.24 }]}>
      <Image
        accessibilityLabel="Logo Aurex"
        resizeMode="contain"
        source={require('../../assets/icon.png')}
        style={{ width: size, height: size, borderRadius: size * 0.24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E8F4FF',
  },
});
