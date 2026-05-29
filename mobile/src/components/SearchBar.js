import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ value, onChange, onClear }) {
  return (
    <View style={s.box}>
      <Ionicons name="search" size={18} color="#666" />
      <TextInput value={value} onChangeText={onChange} placeholder="Cerca barbiere, negozio, zona" style={s.input} placeholderTextColor="#777" />
      {!!value && <TouchableOpacity onPress={onClear}><Text style={s.clear}>✕</Text></TouchableOpacity>}
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e7e7e7' },
  input: { flex: 1, fontSize: 15, color: '#111' },
  clear: { fontSize: 18, color: '#666' }
});

