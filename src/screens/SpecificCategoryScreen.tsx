import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '@/services/api';
import { Product } from '@/types';
import OfflineIndicator from '@/components/OfflineIndicator';

// Chosen category for this screen
const CHOSEN_CATEGORY = 'smartphones';

const SpecificCategoryScreen = () => {
  const {
    data: productsData,
    isLoading,
    refetch,
    isRefetching,
    error,
    isError,
  } = useQuery({
    queryKey: ['products', 'category', CHOSEN_CATEGORY],
    queryFn: () => productsAPI.getProductsByCategory(CHOSEN_CATEGORY, 30, 0),
    retry: 2,
  });

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.7}>
      {/* Product Image with Gradient Overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {item.discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discountPercentage.toFixed(0)}%</Text>
          </View>
        )}
      </View>

      {/* Product Details */}
      <View style={styles.productInfo}>
        {/* Brand Badge */}
        {item.brand && (
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>{item.brand}</Text>
          </View>
        )}

        {/* Title */}
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Rating and Reviews */}
        <View style={styles.ratingRow}>
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.dot} />
          <Text style={styles.reviewsText}>Reviews</Text>
        </View>

        {/* Price and Stock Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            {item.discountPercentage > 0 && (
              <Text style={styles.originalPrice}>
                ${(item.price / (1 - item.discountPercentage / 100)).toFixed(2)}
              </Text>
            )}
          </View>

          {item.stock < 20 ? (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>Only {item.stock} left</Text>
            </View>
          ) : (
            <View style={styles.inStockBadge}>
              <Text style={styles.inStockText}>In Stock</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Loading State
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <OfflineIndicator />
        <View style={styles.loadingBox}>
          <View style={styles.loadingIconContainer}>
            <Text style={styles.loadingIcon}>📱</Text>
          </View>
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          <Text style={styles.loadingText}>Loading Smartphones...</Text>
          <Text style={styles.loadingSubtext}>Please wait</Text>
        </View>
      </View>
    );
  }

  // Error State
  if (isError) {
    return (
      <View style={styles.centerContainer}>
        <OfflineIndicator />
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorMessage}>
            {error?.message || 'Unable to load smartphones'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OfflineIndicator />

      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.categoryIconContainer}>
              <Text style={styles.categoryIcon}>📱</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Smartphones</Text>
              <Text style={styles.headerSubtitle}>
                {productsData?.total || 0} premium devices
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{productsData?.products?.length || 0}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {productsData?.products?.filter((p: Product) => p.discountPercentage > 0).length || 0}
            </Text>
            <Text style={styles.statLabel}>On Sale</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {productsData?.products?.filter((p: Product) => p.rating >= 4.5).length || 0}
            </Text>
            <Text style={styles.statLabel}>Top Rated</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={productsData?.products || []}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No Smartphones Found</Text>
            <Text style={styles.emptyText}>Pull down to refresh</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 24,
  },
  // Loading State
  loadingBox: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 280,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingIcon: {
    fontSize: 48,
  },
  loader: {
    marginVertical: 12,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6E6E73',
  },
  // Error State
  errorBox: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    maxWidth: 340,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#6E6E73',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Header
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 32,
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6E6E73',
    marginTop: 4,
    fontWeight: '500',
  },
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#6E6E73',
    marginTop: 4,
    fontWeight: '600',
  },
  // Product List
  listContent: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#F0F0F0',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  productInfo: {
    padding: 16,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 10,
    lineHeight: 24,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C7C7CC',
    marginHorizontal: 8,
  },
  reviewsText: {
    fontSize: 13,
    color: '#6E6E73',
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productPrice: {
    fontSize: 26,
    fontWeight: '800',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 16,
    color: '#6E6E73',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  lowStockBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  lowStockText: {
    color: '#FF9500',
    fontSize: 11,
    fontWeight: '700',
  },
  inStockBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  inStockText: {
    color: '#34C759',
    fontSize: 11,
    fontWeight: '700',
  },
  // Empty State
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6E6E73',
  },
});

export default SpecificCategoryScreen;
