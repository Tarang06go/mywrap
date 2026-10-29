import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import SearchBar from '../../components/common/SearchBar';
import CategoryCard from '../../components/category/CategoryCard';
import ProductCard from '../../components/product/ProductCard';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import EmptyState from '../../components/common/EmptyState';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import COLORS from '../../constants/colors';

// Fallback seed menu items for offline preview
const FALLBACK_CATEGORIES = [
  { _id: 'cat_all', name: 'All Items', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600' },
  { _id: 'cat_wraps', name: 'Wraps', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600' },
  { _id: 'cat_burgers', name: 'Burgers', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600' },
  { _id: 'cat_fries', name: 'Fries', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600' },
  { _id: 'cat_drinks', name: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600' },
];

const FALLBACK_PRODUCTS = [
  {
    _id: 'p1',
    name: 'Paneer Tikka Wrap',
    description: 'Grilled paneer cubes marinated in tandoori spices wrapped with crunchy veggies.',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600',
    isVeg: true,
    available: true,
    customizations: [
      { name: 'Add Extra Cheese', price: 20 },
      { name: 'Extra Mint Mayo', price: 10 },
    ],
  },
  {
    _id: 'p2',
    name: 'Crispy Veg Patty Wrap',
    description: 'Golden crispy vegetable patty with mint mayo and fresh lettuce in soft wrap.',
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600',
    isVeg: true,
    available: true,
    customizations: [{ name: 'Add Cheese Slice', price: 15 }],
  },
  {
    _id: 'p3',
    name: 'Classic Veg Cheese Burger',
    description: 'Juicy spiced veg patty topped with cheddar cheese and Wrapchik special sauce.',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    isVeg: true,
    available: true,
    customizations: [{ name: 'Double Cheese', price: 25 }],
  },
  {
    _id: 'p4',
    name: 'Peri Peri Masala Fries',
    description: 'Crispy golden french fries tossed in spicy red peri-peri seasoning.',
    price: 70,
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
    isVeg: true,
    available: true,
    customizations: [{ name: 'Cheese Dip', price: 20 }],
  },
  {
    _id: 'p5',
    name: 'Cold Coffee with Ice Cream',
    description: 'Thick creamy blended cold coffee topped with a rich chocolate scoop.',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600',
    isVeg: true,
    available: true,
    customizations: [{ name: 'Extra Ice Cream Scoop', price: 30 }],
  },
];

import api from '../../services/api';
import { Picker } from '@react-native-picker/picker'; // Optional: if we want a nice picker, but React Native has no built in picker without installing package. Wait! I can just use a simple state or action sheet. Or just a simple custom dropdown. 
// Actually since we don't have Picker installed, I will build a simple UI. Let's just use TouchableOpacity that cycles through sort options.

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [vegOnlyFilter, setVegOnlyFilter] = useState(false);
  const [sortOption, setSortOption] = useState('Default'); // Default, Price: Low to High, Price: High to Low, Name: A-Z

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState({ acceptingOrders: true, busyStatus: 'NORMAL' });

  useEffect(() => {
    loadData();
  }, [selectedCategory, vegOnlyFilter, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch Settings
      api.get('/settings').then(res => {
        if(res.success && res.data) setSettings(res.data);
      }).catch(e => console.log('Settings error', e));

      // Fetch Categories
      const catRes = await categoryService.getCategories().catch(() => null);
      if (catRes && catRes.categories && catRes.categories.length > 0) {
        setCategories(catRes.categories);
      } else {
        setCategories(FALLBACK_CATEGORIES);
      }

      // Fetch Products
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (vegOnlyFilter) params.veg = true;

      const prodRes = await productService.getProducts(params).catch(() => null);
      let loadedProducts = [];
      if (prodRes && prodRes.products) {
        loadedProducts = prodRes.products;
      } else {
        let filtered = [...FALLBACK_PRODUCTS];
        if (searchQuery) {
          filtered = filtered.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        if (vegOnlyFilter) {
          filtered = filtered.filter((p) => p.isVeg);
        }
        loadedProducts = filtered;
      }
      setProducts(loadedProducts);
    } catch (e) {
      console.error('[HomeScreen Load Error]:', e);
      setProducts(FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleSort = () => {
    const opts = ['Default', 'Price: Low to High', 'Price: High to Low', 'Name: A-Z'];
    const idx = opts.indexOf(sortOption);
    setSortOption(opts[(idx + 1) % opts.length]);
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === 'Price: Low to High') return a.price - b.price;
    if (sortOption === 'Price: High to Low') return b.price - a.price;
    if (sortOption === 'Name: A-Z') return a.name.localeCompare(b.name);
    return 0; // Default
  });

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
      >
        {!settings.acceptingOrders && (
          <View style={[styles.statusBanner, { backgroundColor: COLORS.danger }]}>
            <Text style={styles.statusBannerText}>🔴 Restaurant is currently closed</Text>
          </View>
        )}
        {settings.acceptingOrders && ['BUSY', 'VERY_BUSY'].includes(settings.busyStatus) && (
          <View style={[styles.statusBanner, { backgroundColor: '#FFB300' }]}>
            <Text style={styles.statusBannerText}>⚡ High demand - orders may take longer</Text>
          </View>
        )}

        {/* User Greeting Banner */}
        <View style={styles.greetingBox}>
          <Text style={styles.greetingText}>
            Hello, <Text style={styles.userName}>{user?.name || 'Student'}!</Text> 👋
          </Text>
          <Text style={styles.greetingSub}>What are you craving today on campus?</Text>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* Promotional Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoBadge}>SPECIAL OFFER</Text>
            <Text style={styles.promoTitle}>Craving? We've got you covered!</Text>
            <Text style={styles.promoDesc}>Fresh hot wraps ready in 15 mins at SAC counter.</Text>
          </View>
          <Text style={styles.promoEmoji}>🌯</Text>
        </View>

        {/* Category Horizontal Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          <CategoryCard
            category={{ name: 'All', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600' }}
            isSelected={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
          />
          {categories.map((cat) => (
            <CategoryCard
              key={cat._id}
              category={cat}
              isSelected={selectedCategory === cat._id}
              onPress={() => setSelectedCategory(cat._id)}
            />
          ))}
        </ScrollView>

        {/* Veg Filter Toggle & Section Title */}
        <View style={styles.filterRow}>
          <Text style={styles.sectionTitle}>Popular Items</Text>
          <View style={{flexDirection: 'row', gap: 8}}>
            <TouchableOpacity onPress={toggleSort} style={styles.vegToggle}>
              <Text style={styles.vegToggleText}>Sort: {sortOption === 'Default' ? 'Def' : sortOption.split(':')[0]}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setVegOnlyFilter(!vegOnlyFilter)}
              style={[styles.vegToggle, vegOnlyFilter && styles.vegToggleActive]}
            >
              <View style={styles.vegDot} />
              <Text style={[styles.vegToggleText, vegOnlyFilter && styles.vegToggleTextActive]}>
                Veg Only
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Items Grid / List */}
        {loading && !refreshing ? (
          <LoadingIndicator message="Fetching Wrapchik menu..." />
        ) : sortedProducts.length === 0 ? (
          <EmptyState
            title="No items found"
            message="No products match your search or filter. Try clearing filters."
            buttonTitle="Reset Filters"
            onButtonPress={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setVegOnlyFilter(false);
              setSortOption('Default');
            }}
          />
        ) : (
          <View style={styles.productList}>
            {sortedProducts.map((item) => (
              <ProductCard
                key={item._id}
                product={item}
                onPress={() => router.push(`/product/${item._id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  greetingBox: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userName: {
    color: COLORS.primary,
  },
  greetingSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  promoBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
  },
  promoTextContainer: {
    flex: 1,
  },
  promoBadge: {
    backgroundColor: '#FFFFFF',
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  promoDesc: {
    color: '#FFE0B2',
    fontSize: 12,
    marginTop: 4,
  },
  promoEmoji: {
    fontSize: 48,
    marginLeft: 10,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  vegToggleActive: {
    borderColor: COLORS.vegGreen,
    backgroundColor: COLORS.successLight,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.vegGreen,
  },
  vegToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  vegToggleTextActive: {
    color: COLORS.vegGreen,
  },
  productList: {
    paddingHorizontal: 16,
  },
  statusBanner: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBannerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
