import React, { useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

const specs = ['Taglio', 'Barba', 'Color', 'Styling'];

export default function FilterBar({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(value.rating || 0);
  const [radius, setRadius] = useState(value.radius || 50);
  const [specialty, setSpecialty] = useState(value.specialty || []);
  const label = useMemo(() => [value.rating ? `⭐ ${value.rating}+` : '⭐ Rating', value.radius ? `📍 ${value.radius}km` : '📍 Distanza', value.specialty?.length ? `🪒 ${value.specialty.length}` : '🪒 Specialty'], [value]);
  const openModal = () => { setRating(value.rating || 0); setRadius(value.radius || 50); setSpecialty(value.specialty || []); setOpen(true); };
  const toggle = s => setSpecialty(x => x.includes(s) ? x.filter(v => v !== s) : [...x, s]);
  return <>
    <View style={s.row}>
      {label.map(x => <TouchableOpacity key={x} style={s.pill} onPress={openModal}><Text style={s.pillText}>{x}</Text></TouchableOpacity>)}
      <TouchableOpacity style={s.reset} onPress={() => onChange({ rating: 0, radius: 50, specialty: [] })}><Text>Reset</Text></TouchableOpacity>
    </View>
    <Modal visible={open} transparent animationType="slide">
      <View style={s.modalBg}><View style={s.modal}>
        <Text style={s.title}>Filtri</Text>
        <Text>Rating minimo: {rating.toFixed(1)}</Text>
        <Slider minimumValue={0} maximumValue={5} step={0.5} value={rating} onValueChange={setRating} minimumTrackTintColor="#111" />
        <Text>Distanza: {Math.round(radius)} km</Text>
        <Slider minimumValue={1} maximumValue={50} step={1} value={radius} onValueChange={setRadius} minimumTrackTintColor="#111" />
        <Text style={{ marginBottom: 8 }}>Specialty</Text>
        <View style={s.chips}>{specs.map(x => <TouchableOpacity key={x} onPress={() => toggle(x)} style={[s.chip, specialty.includes(x) && s.chipOn]}><Text style={specialty.includes(x) ? s.chipOnText : s.chipText}>{x}</Text></TouchableOpacity>)}</View>
        <View style={s.actions}>
          <TouchableOpacity onPress={() => setOpen(false)}><Text style={s.link}>Annulla</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => { onChange({ rating, radius, specialty }); setOpen(false); }}><Text style={s.link}>Applica</Text></TouchableOpacity>
        </View>
      </View></View>
    </Modal>
  </>;
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  pill: { backgroundColor: '#111', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  pillText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  reset: { paddingHorizontal: 10, paddingVertical: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  chipOn: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { color: '#111' },
  chipOnText: { color: '#fff' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  link: { fontWeight: '700', fontSize: 16 }
});

