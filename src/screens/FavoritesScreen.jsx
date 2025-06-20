import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SwipeRow } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  setFavorites,
  setLoading,
  removeFavoriteFromState,
} from '../store/favoritesSlice';
import { getFavorites } from '../services/database';
import { OperatorCard } from '../components/OperatorCard';

const colors = {
  background: '#F3F8F2',
  text: '#2E4D25',
  textSecondary: '#6B8E6E',
  primary: '#7BB661',
  accent: '#E57373',
  white: '#FFF',
  card: '#E9F5E1',
  border: '#B6D7A8',
  shadow: '#C8E6C9',
};

const FavoritesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items: favorites = [], loading } = useSelector(
    state => state.favorites,
  );

  // useEffect(() => {
  //   loadFavoritesFromDB();
  // }, []);

  // const loadFavoritesFromDB = async () => {
  //   try {
  //     dispatch(setLoading(true));
  //     const favoritesData = await getFavorites();
  //     dispatch(setFavorites(favoritesData));
  //   } catch (error) {
  //     console.log('Erreur chargement favoris:', error);
  //     Alert.alert('Erreur', 'Impossible de charger les favoris');
  //   } finally {
  //     dispatch(setLoading(false));
  //   }
  // };

  const handleRemoveFavorite = operatorId => {
    Alert.alert(
      'Supprimer des favoris',
      'Êtes-vous sûr de vouloir retirer cet opérateur de vos favoris ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => dispatch(removeFavoriteFromState(operatorId)),
        },
      ],
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <SwipeRow
      rightOpenValue={-75}
      disableRightSwipe={true}
      key={item.id.toString()}
    >
      <View style={[styles.hiddenItem, { backgroundColor: colors.accent }]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Icon name="delete" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.rowFront}>
        <OperatorCard
          operator={item}
          onPress={() =>
            navigation.navigate('SearchTab', {
              screen: 'OperatorDetail',
              params: {
                operator: item,
              },
            })
          }
          onFavorite={() => handleRemoveFavorite(item.id)}
          isFavorite={true}
        />
      </View>
    </SwipeRow>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Chargement des favoris...
        </Text>
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.emptyCard}>
          <Icon name="favorite-border" size={64} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Aucun favori
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Ajoutez des opérateurs bio à vos favoris pour les retrouver
            facilement ici
          </Text>
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: colors.primary }]}
            onPress={() =>
              navigation.navigate('SearchTab', { screen: 'SearchOperators' })
            } //GOOD ICI
          >
            <Text style={styles.searchButtonText}>
              Rechercher des opérateurs
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerCard}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mes favoris ({favorites.length})
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Glissez vers la gauche pour supprimer
        </Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={item => item.id.toString()}
        renderItem={renderFavoriteItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  hiddenItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 16,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 75,
    height: '100%',
  },
  rowFront: {
    backgroundColor: 'transparent',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    margin: 32,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  searchButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  loadingText: {
    fontSize: 18,
  },
});
