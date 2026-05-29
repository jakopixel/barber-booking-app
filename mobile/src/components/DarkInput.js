import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C, R, T } from '../constants/theme.js';

export default function DarkInput({ icon, label, style, inpStyle, error, ...p }) {
  return (
    <View style={style}>
      {!!label && <Text style={s.label}>{label}</Text>}
      <View style={[s.box, error && { borderColor: C.err }]}>
        {!!icon && <MaterialCommunityIcons name={icon} size={22} color={C.p} style={s.icon} />}
        <TextInput placeholderTextColor="#666" style={[s.inp, inpStyle]} {...p} />
      </View>
      {!!error && <Text style={s.err}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  label: { color: C.sub, marginBottom: 8, fontSize: T.cap, fontWeight: '700' },
  box: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.input, borderRadius: R.sm, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 },
  icon: { marginRight: 10 },
  inp: { flex: 1, color: C.txt, paddingVertical: 14, fontSize: T.body }
});

