import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, R, T } from '../constants/theme.js';

export default function Chip({ text, color = C.p, style }) {
  return <View style={[s.chip, { backgroundColor: color }, style]}><Text style={s.txt}>{text}</Text></View>;
}

const s = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: R.sm, alignSelf: 'flex-start' },
  txt: { color: C.txt, fontSize: T.cap, fontWeight: '700' }
});

