import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useInfiniteQuery } from '@tanstack/react-query';
import SearchBar from '../components/SearchBar.js';
import FilterBar from '../components/FilterBar.js';
import BarberCard from '../components/BarberCard.js';
import SkeletonList from '../components/SkeletonList.js';
import EmptyState from '../components/EmptyState.js';
import { request } from '../api/client.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { C, T, SP } from '../constants/theme.js';

export default function HomeScreen({ navigation }) {
  const [q, setQ] = useState('');
  const [loc, setLoc] = useState(null);
  const [f, setF] = useState({ rating: 0, radius: 50, specialty: [] });
  const dq = useDebouncedValue(q, 300);
  useEffect(() => { (async () => { const { status } = await Location.requestForegroundPermissionsAsync(); if (status !== 'granted') return; const p = await Location.getCurrentPositionAsync({}); setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); })(); }, []);
  const params = useMemo(() => {
    const p = new URLSearchParams({ search: dq, page: '1', minRating: String(f.rating || 0), radius: String(f.radius || 50), specialty: f.specialty.join(',') });
    if (loc) { p.set('lat', String(loc.lat)); p.set('lng', String(loc.lng)); }
    return p.toString();
  }, [dq, f, loc]);
  const query = useInfiniteQuery({
    queryKey: ['barbers', params],
    queryFn: ({ pageParam = 1 }) => request(`/api/barbers/search?${params}&page=${pageParam}`),
    getNextPageParam: last => last.hasMore ? last.page + 1 : undefined,
    staleTime: 30000
  });
  const items = useMemo(() => query.data?.pages.flatMap(p => p.items) || [], [query.data]);
  const renderItem = useCallback(({ item }) => <View style={{ marginBottom: 12 }}><BarberCard item={item} onPress={() => navigation.navigate('BarberProfile', { id: item.id })} onBook={() => navigation.navigate('BarberProfile', { id: item.id })} /></View>, [navigation]);
  const empty = !query.isLoading && !items.length;
  return <View style={s.bg}>
    <LinearGradient colors={[C.p, C.s]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.hero}><Text style={s.kicker}>Trova Barbiere</Text><Text style={s.h1}>Prenota il tuo prossimo taglio</Text><Text style={s.h2}>Ricerca, filtri e distanza in tempo reale.</Text></LinearGradient>
    <View style={s.body}>
      <SearchBar value={q} onChange={setQ} onClear={() => setQ('')} />
      <View style={{ height: SP[1] }} />
      <FilterBar value={f} onChange={setF} />
      <View style={{ height: SP[2] }} />
      {query.isLoading && !items.length ? <SkeletonList /> : <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={i => String(i.id)}
        getItemLayout={(_, i) => ({ length: 330, offset: 330 * i, index: i })}
        initialNumToRender={6}
        onEndReachedThreshold={0.6}
        onEndReached={() => query.hasNextPage && query.fetchNextPage()}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} tintColor={C.p} colors={[C.p]} />}
        ListFooterComponent={query.isFetchingNextPage ? <View style={{ paddingVertical: 16 }}><ActivityIndicator color={C.p} /></View> : <View style={{ height: 16 }} />}
        ListEmptyComponent={empty ? <EmptyState icon="content-cut" title="Nessun barbiere trovato" text={`Prova a cambiare ricerca o filtri per "${dq || 'tutto'}"`} btn="Mostra tutti" onPress={() => { setQ(''); setF({ rating: 0, radius: 50, specialty: [] }); }} /> : null}
      />}
    </View>
  </View>;
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: C.bg },
  hero: { paddingTop: 62, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  kicker: { color: C.txt, fontSize: 12, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
  h1: { color: C.txt, fontSize: 32, fontWeight: '900', marginTop: 10 },
  h2: { color: 'rgba(255,255,255,0.86)', marginTop: 8, fontSize: T.body, lineHeight: 22 },
  body: { flex: 1, padding: 20 }
});

