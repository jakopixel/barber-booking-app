import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import DarkCard from './DarkCard.js';
import { C } from '../constants/theme.js';

export default function SkeletonList() {
  const v = useRef(new Animated.Value(0.4)).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: true }), Animated.timing(v, { toValue: 0.4, duration: 700, useNativeDriver: true })])).start(); }, []);
  return <View style={{ gap: 12 }}>{[1,2,3].map(i => <DarkCard key={i} style={s.card}><View style={s.row}><Animated.View style={[s.img, { opacity: v }]} /><View style={s.box}><Animated.View style={[s.l1, { opacity: v }]} /><Animated.View style={[s.l2, { opacity: v }]} /><Animated.View style={[s.l3, { opacity: v }]} /></View></View></DarkCard>)}</View>;
}

const s = StyleSheet.create({
  card: { padding: 16 },
  row: { flexDirection: 'row', gap: 12 },
  img: { width: 84, height: 84, borderRadius: 12, backgroundColor: C.input },
  box: { flex: 1, gap: 10, justifyContent: 'center' },
  l1: { height: 14, width: '65%', borderRadius: 8, backgroundColor: C.input },
  l2: { height: 10, width: '45%', borderRadius: 8, backgroundColor: C.input },
  l3: { height: 10, width: '35%', borderRadius: 8, backgroundColor: C.input }
});
