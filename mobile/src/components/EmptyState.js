import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DarkButton from './DarkButton.js';
import { C, T } from '../constants/theme.js';

export default function EmptyState({ icon = 'content-cut', title, text, btn, onPress }) {
  return <View style={s.wrap}>
    <MaterialCommunityIcons name={icon} size={80} color={C.p} />
    <Text style={s.title}>{title}</Text>
    {!!text && <Text style={s.text}>{text}</Text>}
    {!!btn && <DarkButton title={btn} onPress={onPress} style={{ marginTop: 12, minWidth: 190 }} />}
  </View>;
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  title: { color: C.txt, fontSize: T.h2, fontWeight: '900', textAlign: 'center' },
  text: { color: C.sub, fontSize: T.body, textAlign: 'center', lineHeight: 22 }
});

