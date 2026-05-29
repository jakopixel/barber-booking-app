import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { C, R, T } from '../constants/theme.js';

export default function DarkButton({ title, children, onPress, style, textStyle, disabled }) {
  const a = useRef(new Animated.Value(1)).current;
  const inS = () => Animated.spring(a, { toValue: 0.95, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
  const outS = () => Animated.spring(a, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 0 }).start();
  return (
    <Pressable onPressIn={inS} onPressOut={outS} onPress={async () => { await Haptics.selectionAsync().catch(() => {}); onPress?.(); }} disabled={disabled}>
      <Animated.View style={{ transform: [{ scale: a }], opacity: disabled ? 0.55 : 1 }}>
        <LinearGradient colors={[C.p, C.s]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.btn, style]}>
          {children || <Text style={[s.txt, textStyle]}>{title}</Text>}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  txt: { color: C.txt, fontSize: T.body, fontWeight: '800' }
});

