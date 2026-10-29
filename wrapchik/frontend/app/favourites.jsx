import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import Header from '../components/common/Header';
import ProductCard from '../components/product/ProductCard';
import EmptyState from '../components/common/EmptyState';
import COLORS from '../constants/colors';
import favouriteService from '../services/favouriteService';

export default function FavouritesScreen() {
  const router = useRouter();
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavourites = async () => {
    try {
      const response = await favouriteService.getFavourites();
      if (response.success) {
        setFavourites(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch favourites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavourites();
  };

  const handleRemoveFavourite = async (productId) => {
    try {
      const response = await favouriteService.removeFavourite(productId);
      if (response.success) {
        setFavourites(prev => prev.filter(item => item._id !== productId));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove from favourites');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="My Favourites" showBack showCart={false} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : favourites.length === 0 ? (
        <EmptyState
          title="No Favourites Saved"
          message="Heart your favourite food items to save them here for quick re-ordering."
          buttonTitle="Explore Menu"
          onButtonPress={() => router.push('/(tabs)/home')}
        />
      ) : (
        <FlatList
          data={favourites}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <ProductCard
                product={item}
                onPress={() => router.push(`/product/${item._id}`)}
              />
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => handleRemoveFavourite(item._id)}
              >
                <Heart size={20} color={COLORS.primary} fill={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    position: 'relative',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  }
});
