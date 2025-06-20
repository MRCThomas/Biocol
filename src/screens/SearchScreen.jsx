// src/screens/SearchScreen.js
import React, { useState, useEffect, useRef, use } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { fetchOperators, clearOperators } from '../store/operatorsSlice';
// Importation des actions Redux pour les favoris
import { addFavorite, removeFavoriteFromState } from '../store/favoritesSlice';
import {
  getCurrentPosition,
  requestLocationPermission,
} from '../services/geolocation';
import { OperatorCard } from '../components/OperatorCard';
import FilterModal from '../components/FilterModal';
import OpenStreetMapView from '../components/OpenStreetMapView';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { updatePreference } from '../store/preferencesSlice';

const SearchScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { data, loading, error, hasMore, nbTotal } = useSelector(
    state => state.operators,
  );
  // Correction ici : Accès à 'items' dans l'état des favoris
  const { items: favorites } = useSelector(state => state.favorites);
  const { defaultFilters, useGeolocation } = useSelector(
    state => state.preferences,
  );

  const [searchText, setSearchText] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [region, setRegion] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  const isFocused = useIsFocused();

  useEffect(() => {
    console.log('useGeolocation avant:', useGeolocation);

    dispatch(updatePreference({ key: 'useGeolocation', value: true }));
    if (useGeolocation) {
      // Si l'utilisateur a activé la géolocalisation, on demande la permission et récupère la position
      getLocation();
      console.log('Géolocalisation activée');
    } else {
      // Recherche initiale sans géolocalisation
      handleSearch();
      console.log('Géolocalisation désactivée, recherche générale lancée');
    }
  }, [isFocused, useGeolocation]);

  console.log('useGeolocation après:', useGeolocation);

  const getLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      // console.log(hasPermission);

      if (hasPermission) {
        const position = await getCurrentPosition();
        setCurrentLocation(position);
        setRegion({
          ...region,
          latitude: position.latitude,
          longitude: position.longitude,
        });
        // Recherche automatique avec la position
        searchOperators(position.latitude, position.longitude);
      } else {
        Alert.alert(
          'Permission refusée',
          'La géolocalisation permettrait de trouver les opérateurs près de vous.',
          [{ text: 'OK', onPress: handleSearch }],
        );
      }
    } catch (error) {
      console.log('Erreur géolocalisation:', error);
      Alert.alert(
        'Erreur de géolocalisation',
        "Impossible d'obtenir votre position. Recherche générale lancée.",
        [{ text: 'OK', onPress: handleSearch }],
      );
    }
  };

  const searchOperators = (lat = null, lng = null, newSearch = true) => {
    if (newSearch) {
      dispatch(clearOperators());
    }

    const searchParams = {
      nb: 20,
      debut: newSearch ? 0 : data.length,
      filters: {
        ...activeFilters,
        ...(searchText && { q: searchText }),
      },
    };

    if (lat && lng) {
      searchParams.lat = lat;
      searchParams.lng = lng;
    }

    dispatch(fetchOperators(searchParams));
  };

  const handleSearch = () => {
    if (currentLocation) {
      searchOperators(currentLocation.latitude, currentLocation.longitude);
    } else {
      searchOperators();
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      if (currentLocation) {
        searchOperators(
          currentLocation.latitude,
          currentLocation.longitude,
          false,
        );
      } else {
        searchOperators(null, null, false);
      }
    }
  };

  const handleToggleFavorite = operator => {
    // Vérifie si l'opérateur est déjà dans les favoris
    const isFavorite = favorites.some(fav => fav.id === operator.id);
    if (isFavorite) {
      // Dispatch l'action pour retirer l'opérateur des favoris
      dispatch(removeFavoriteFromState(operator.id));
    } else {
      // Dispatch l'action pour ajouter l'opérateur aux favoris
      dispatch(addFavorite(operator));
    }
  };

  const handleOperatorPress = operator => {
    navigation.navigate('OperatorDetail', { operator });
  };

  const handleMarkerPress = operator => {
    handleOperatorPress(operator);
  };

  const handleApplyFilters = filters => {
    setActiveFilters(filters);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const renderOperatorItem = ({ item }) => (
    <OperatorCard
      operator={item}
      onPress={() => handleOperatorPress(item)}
      onFavorite={() => handleToggleFavorite(item)}
      // Utilise 'favorites.some' pour vérifier si l'opérateur est favori
      isFavorite={favorites.some(fav => fav.id === item.id)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon
            name="search"
            size={24}
            color="#757575"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un opérateur, ville, produit..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon name="clear" size={24} color="#757575" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="filter-list" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Boutons Vue/Localisation */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.viewButton, showMap && styles.activeViewButton]}
          onPress={() => setShowMap(!showMap)}
        >
          <Icon
            name={showMap ? 'list' : 'map'}
            size={20}
            color={showMap ? 'white' : '#4CAF50'}
          />
          <Text
            style={[
              styles.viewButtonText,
              showMap && styles.activeViewButtonText,
            ]}
          >
            {showMap ? 'Liste' : 'Carte'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.locationButton} onPress={getLocation}>
          <Icon name="my-location" size={20} color="#4CAF50" />
          <Text style={styles.locationButtonText}>Ma position</Text>
        </TouchableOpacity>
      </View>

      {/* Résultats */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {!error && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {nbTotal > 0
              ? `${nbTotal} opérateur${nbTotal > 1 ? 's' : ''} trouvé${
                  nbTotal > 1 ? 's' : ''
                }`
              : 'Aucun résultat'}
          </Text>

          {showMap ? (
            <OpenStreetMapView
              operators={data}
              region={region}
              currentLocation={currentLocation}
              onMarkerPress={handleMarkerPress}
              onFavoriteToggle={handleToggleFavorite}
              favorites={favorites}
              style={styles.mapContainer}
            />
          ) : (
            <FlatList
              data={data}
              keyExtractor={item => item.id.toString()}
              renderItem={renderOperatorItem}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              ListFooterComponent={() =>
                loading ? (
                  <View style={styles.loadingFooter}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                  </View>
                ) : null
              }
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Modal des filtres */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        initialFilters={activeFilters}
      />
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E8F5E8',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    backgroundColor: 'white',
  },
  activeViewButton: {
    backgroundColor: '#4CAF50',
  },
  viewButtonText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  activeViewButtonText: {
    color: 'white',
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  locationButtonText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsText: {
    padding: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    backgroundColor: 'white',
  },
  mapContainer: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
