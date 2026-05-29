import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useInfiniteQuery } from '@tanstack/react-query';
import SearchBar from '../components/SearchBar.js';
import FilterBar from '../components/FilterBar.js';
import BarberCard from '../components/BarberCard.js';
import SkeletonList from '../components/SkeletonList.js';
import { request } from '../api/client.js';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';

export default function HomeScreen({ navigation }) {
  const [q, setQ] = useState('');
  const [loc, setLoc] = useState(null);
  const [filters, setFilters] = useState({ rating: 0, radius: 50, specialty: [] });
  const dq = useDebouncedValue(q, 300);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const p = await Location.getCurrentPositionAsync({});
      setLoc({ lat: p.coords.latitude, lng: p.coords.longitude });
    })();
  }, []);

  const params = useMemo(() => {
    const p = new URLSearchParams({ q: dq, page: '1', limit: '20', minRating: String(filters.rating || 0), radius: String(filters.radius || 50), specialty: filters.specialty.join(',') });
    if (loc) { p.set('lat', String(loc.lat)); p.set('lng', String(loc.lng)); }
    return p.toString();
  }, [dq, filters, loc]);

  const query = useInfiniteQuery({
    queryKey: ['barbers', params],
    queryFn: ({ pageParam = 1 }) => request(`/api/barbers/search?${params}&page=${pageParam}`),
    getNextPageParam: last => last.hasMore ? last.page + 1 : undefined,
    staleTime: 30000
  });

  const items = useMemo(() => query.data?.pages.flatMap(p => p.items) || [], [query.data]);
  const renderItem = useCallback(({ item }) => <View style={{ marginBottom: 12 }}><BarberCard item={item} onPress={() => navigation.navigate('BarberProfile', { id: item.id })} /></View>, [navigation]);
  const empty = !query.isLoading && !items.length;
  const reset = () => { setQ(''); setFilters({ rating: 0, radius: 50, specialty: [] }); };

  return (
    <View style={s.wrap}>
      <SearchBar value={q} onChange={setQ} onClear={() => setQ('')} />
      <FilterBar value={filters} onChange={setFilters} />
      {query.isLoading && !items.length ? <SkeletonList /> : empty ? (
        <View style={s.empty}><Text style={s.emptyT}>Nessun barbiere trovato per "{dq}"</Text><TouchableOpacity onPress={reset} style={s.emptyBtn}><Text style={s.emptyBtnT}>Mostra tutti</Text></TouchableOpacity></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} />}
          onEndReached={() => query.hasNextPage && query.fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={query.isFetchingNextPage ? <Text style={s.footer}>Caricamento...</Text> : null}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#f5f2ea', padding: 16, gap: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  emptyT: { fontSize: 16, color: '#444', textAlign: 'center' },
  emptyBtn: { backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  emptyBtnT: { color: '#fff', fontWeight: '700' },
  footer: { textAlign: 'center', padding: 16, color: '#666' }
});

