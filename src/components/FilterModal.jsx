// src/components/FilterModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
} from 'react-native';

const FilterModal = ({ visible, onClose, onApply, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    filtrerVenteDetail: false,
    filtrerRestaurants: false,
    filtrerGrossistes: false,
    filtrerGrandeSurface: false,
    filtrerCommercantsEtArtisans: false,
    filtrerMagasinSpec: false,
    ...initialFilters,
  });

  useEffect(() => {
    setFilters({ ...filters, ...initialFilters });
  }, [initialFilters]);

  const filterLabels = {
    filtrerVenteDetail: 'Vente directe aux consommateurs',
    filtrerRestaurants: 'Restaurants',
    filtrerGrossistes: 'Grossistes',
    filtrerGrandeSurface: 'Grandes surfaces',
    filtrerCommercantsEtArtisans: 'Commerçants et artisans',
    filtrerMagasinSpec: 'Magasins spécialisés',
  };

  const handleToggle = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApply = () => {
    const activeFilters = {};
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        activeFilters[key] = 1;
      }
    });
    onApply(activeFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {};
    Object.keys(filters).forEach(key => {
      resetFilters[key] = false;
    });
    setFilters(resetFilters);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filtersContainer}>
            {Object.keys(filterLabels).map(key => (
              <View key={key} style={styles.filterItem}>
                <Text style={styles.filterLabel}>{filterLabels[key]}</Text>
                <Switch
                  value={filters[key]}
                  onValueChange={() => handleToggle(key)}
                  trackColor={{ false: '#767577', true: '#4CAF50' }}
                  thumbColor={filters[key] ? '#2E7D32' : '#f4f3f4'}
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  closeButton: {
    fontSize: 24,
    color: '#757575',
  },
  filtersContainer: {
    padding: 20,
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FilterModal;