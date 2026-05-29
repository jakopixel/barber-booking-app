import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, R, T } from '../constants/theme.js';

const map = { active: C.ok, pending: C.warn, confirmed: C.s, cancelled: C.err, completed: C.p, inactive: C.err, expired: C.err, paid: C.ok, unpaid: C.warn, failed: C.err };
export default function StatusBadge({ status = 'pending' }) {
  const bg = map[status] || C.p;
  return <View style={[s.badge, { backgroundColor: bg }]}><Text style={s.txt}>{status}</Text></View>;
}

const s = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: R.sm, alignSelf: 'flex-start' },
  txt: { color: C.txt, fontSize: T.cap, fontWeight: '800', textTransform: 'capitalize' }
});

