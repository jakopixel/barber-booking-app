import React from 'react';
import { View, StyleSheet } from 'react-native';
import { C, R } from '../constants/theme.js';

export default function DarkCard({ style, children }) {
  return <View style={[s.card, style]}>{children}</View>;
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: R.md,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4
  }
});

