import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, T } from '../constants/theme.js';

export default function RatingStars({ value = 0, size = 20, showText = true }) {
  return (
    <View style={s.row}>
      {[1,2,3,4,5].map(i => <MaterialCommunityIcons key={i} name={i <= Math.round(value) ? 'star' : 'star-outline'} size={size} color={C.warn} />)}
      {showText && <Text style={s.txt}>{value.toFixed(1)}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  txt: { color: C.sub, marginLeft: 6, fontSize: T.cap, fontWeight: '700' }
});

