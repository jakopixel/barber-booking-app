import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function SkeletonList() {
  return (
    <View style={{ gap: 12 }}>
      {[1,2,3].map(i => <View key={i} style={s.row}><View style={s.img} /><View style={{ flex: 1, gap: 8 }}><View style={s.l1} /><View style={s.l2} /><View style={s.l3} /></View></View>)}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', padding: 12, borderRadius: 18 },
  img: { width: 72, height: 72, borderRadius: 16, backgroundColor: '#eaeaea' },
  l1: { height: 14, width: '60%', borderRadius: 8, backgroundColor: '#eaeaea' },
  l2: { height: 10, width: '45%', borderRadius: 8, backgroundColor: '#efefef' },
  l3: { height: 10, width: '35%', borderRadius: 8, backgroundColor: '#f2f2f2' }
});

