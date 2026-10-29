import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

const CategoryCard = ({ category, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.card, isSelected && styles.cardSelected]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: category.imageUrl || 'https://via.placeholder.com/100' }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <Text style={[styles.name, isSelected && styles.nameSelected]} numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    marginRight: 16,
    width: 76,
  },
  cardSelected: {
    transform: [{ scale: 1.05 }],
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  nameSelected: {
    fontWeight: '800',
    color: COLORS.primary,
  },
});

export default CategoryCard;
