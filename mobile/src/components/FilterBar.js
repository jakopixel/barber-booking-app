import React, { useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import DarkCard from './DarkCard.js';
import DarkButton from './DarkButton.js';
import Chip from './Chip.js';
import { C } from '../constants/theme.js';

const specs = ['Taglio', 'Barba', 'Color', 'Styling'];
export default function FilterBar({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(value.rating || 0);
  const [radius, setRadius] = useState(value.radius || 50);
  const [specialty, setSpecialty] = useState(value.specialty || []);
  const items = useMemo(() => [
    { k: 'rating', t: value.rating ? `⭐ ${value.rating}+` : '⭐ Rating', a: !!value.rating },
    { k: 'radius', t: value.radius ? `📍 ${value.radius}km` : '📍 Distanza', a: !!value.radius && value.radius !== 50 },
    { k: 'specialty', t: value.specialty?.length ? `🪒 ${value.specialty.length}` : '🪒 Specialty', a: !!value.specialty?.length }
  ], [value]);
  const openModal = () => { setRating(value.rating || 0); setRadius(value.radius || 50); setSpecialty(value.specialty || []); setOpen(true); };
  const toggle = x => setSpecialty(p => p.includes(x) ? p.filter(v => v !== x) : [...p, x]);
  return <>
    <View style={s.row}>{items.map(x => <TouchableOpacity key={x.k} style={[s.pill, x.a && s.on]} onPress={openModal}><Text style={s.pillT}>{x.t}</Text></TouchableOpacity>)}<TouchableOpacity onPress={() => onChange({ rating: 0, radius: 50, specialty: [] })}><Text style={s.reset}>Reset</Text></TouchableOpacity></View>
    <Modal visible={open} transparent animationType="fade">
      <View style={s.back}><DarkCard style={s.sheet}>
        <Text style={s.title}>Filtri</Text>
        <Text style={s.txt}>Rating minimo: {rating.toFixed(1)}</Text>
        <Slider minimumValue={0} maximumValue={5} step={0.5} value={rating} onValueChange={setRating} minimumTrackTintColor={C.p} maximumTrackTintColor={C.border} thumbTintColor={C.p} />
        <Text style={s.txt}>Distanza: {Math.round(radius)} km</Text>
        <Slider minimumValue={1} maximumValue={50} step={1} value={radius} onValueChange={setRadius} minimumTrackTintColor={C.s} maximumTrackTintColor={C.border} thumbTintColor={C.s} />
        <Text style={[s.txt, { marginTop: 8 }]}>Specialty</Text>
        <View style={s.chips}>{specs.map(x => <TouchableOpacity key={x} onPress={() => toggle(x)}><Chip text={x} color={specialty.includes(x) ? C.p : C.input} /></TouchableOpacity>)}</View>
        <View style={s.actions}><TouchableOpacity onPress={() => setOpen(false)}><Text style={s.link}>Annulla</Text></TouchableOpacity><DarkButton title="Applica" onPress={() => { onChange({ rating, radius, specialty }); setOpen(false); }} style={{ minWidth: 120 }} /></View>
      </DarkCard></View>
    </Modal>
  </>;
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  pill: { backgroundColor: C.input, borderColor: C.border, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999 },
  on: { borderColor: C.p },
  pillT: { color: C.txt, fontWeight: '700', fontSize: 12 },
  reset: { color: C.sub, fontWeight: '700', paddingHorizontal: 10 },
  back: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  title: { color: C.txt, fontSize: 20, fontWeight: '900', marginBottom: 16 },
  txt: { color: C.sub, marginBottom: 8, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  link: { color: C.sub, fontWeight: '800' }
});
