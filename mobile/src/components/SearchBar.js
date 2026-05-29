import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import DarkInput from './DarkInput.js';
import { C } from '../constants/theme.js';

export default function SearchBar({ value, onChange, onClear }) {
  return (
    <View style={s.row}>
      <DarkInput icon="magnify" value={value} onChangeText={onChange} placeholder="Cerca barbiere, negozio, zona" style={{ flex: 1 }} />
      {!!value && <TouchableOpacity onPress={onClear} style={s.clear}><Text style={s.clearT}>✕</Text></TouchableOpacity>}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clear: { backgroundColor: C.input, borderColor: C.border, borderWidth: 1, height: 52, width: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  clearT: { color: C.sub, fontSize: 18, fontWeight: '900' }
});
