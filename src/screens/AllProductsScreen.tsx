import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI } from '@/services/api';
import { useAppSelector } from '@/hooks/useRedux';
import { selectIsSuperAdmin } from '@/store/slices/authSlice';
import { Product } from '@/types';
import OfflineIndicator from '@/components/OfflineIndicator';

const AllProductsScreen = () => {
  const queryClient = useQueryClient();
  const isSuperAdmin = useAppSelector(selectIsSuperAdmin);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const {
    data: productsData,
    isLoading,
    refetch,
    isRefetching,
    error,
    isError,
  } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => productsAPI.getAllProducts(30, 0),
    retry: 2,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => productsAPI.deleteProduct(productId),
    onMutate: (productId) => {
      setDeletingId(productId);
      setDeleteModalVisible(false);
    },
    onSuccess: (data, productId) => {
      setDeletingId(null);

      // Optimistically update the cache
      queryClient.setQueryData(['products', 'all'], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          products: oldData.products.filter((p: Product) => p.id !== productId),
          total: oldData.total - 1,
        };
      });

      showToast(`"${data.title}" deleted successfully`, 'success');
    },
    onError: (error: any, productId) => {
      setDeletingId(null);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete product';
      showToast(errorMessage, 'error');
    },
  });

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      deleteMutation.mutate(selectedProduct.id);
    }
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    const isDeleting = deletingId === item.id;

    return (
      <TouchableOpacity
        style={[styles.productCard, isDeleting && styles.productCardDeleting]}
        activeOpacity={0.7}
        disabled={isDeleting}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            {item.discountPercentage > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{item.discountPercentage.toFixed(0)}%</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
            </View>
          </View>
          {item.stock < 20 && (
            <Text style={styles.stockWarning}>Only {item.stock} left!</Text>
          )}
        </View>
        {isSuperAdmin && (
          <TouchableOpacity
            style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
            onPress={() => handleDelete(item)}
            disabled={isDeleting}>
            {isDeleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete</Text>
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // Render different UI states using conditional rendering instead of early returns
  // Loading State
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <OfflineIndicator />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading products...</Text>
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
          <Text style={styles.errorTitle}>Failed to Load Products</Text>
          <Text style={styles.errorMessage}>
            {error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Success State
  return (
    <View style={styles.container}>
      <OfflineIndicator />

      {/* Header Stats */}
      <View style={styles.headerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{productsData?.products?.length || 0}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
        {isSuperAdmin && (
          <View style={styles.superAdminBadge}>
            <Text style={styles.superAdminIcon}>👑</Text>
            <Text style={styles.superAdminText}>SUPERADMIN</Text>
          </View>
        )}
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
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptyText}>Pull down to refresh</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Text style={styles.modalIcon}>⚠️</Text>
              </View>
              <Text style={styles.modalTitle}>Delete Product?</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete{'\n'}
                <Text style={styles.modalProductName}>"{selectedProduct?.title}"</Text>?
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteButton}
                onPress={confirmDelete}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {toastVisible && (
        <View
          style={[
            styles.toast,
            toastType === 'success' ? styles.toastSuccess : styles.toastError,
          ]}>
          <Text style={styles.toastIcon}>{toastType === 'success' ? '✓' : '✕'}</Text>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
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
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#6E6E73',
  },
  // Error State
  errorBox: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    maxWidth: 340,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6E6E73',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Header Stats
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6E6E73',
    marginTop: 2,
  },
  superAdminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  superAdminIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  superAdminText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  // Product List
  listContent: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productCardDeleting: {
    opacity: 0.5,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 6,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#6E6E73',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#6E6E73',
    fontWeight: '500',
  },
  stockWarning: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '600',
    marginTop: 2,
  },
  // Delete Button
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignSelf: 'center',
    minWidth: 60,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6E6E73',
  },
  // Delete Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 36,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalProductName: {
    fontWeight: '600',
    color: '#1D1D1F',
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6E6E73',
  },
  modalDeleteButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FF3B30',
  },
  modalDeleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Toast Notification
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastSuccess: {
    backgroundColor: '#34C759',
  },
  toastError: {
    backgroundColor: '#FF3B30',
  },
  toastIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 12,
  },
  toastText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AllProductsScreen;
