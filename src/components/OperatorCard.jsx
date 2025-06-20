// src/components/OperatorCard.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export const OperatorCard = ({ operator, onPress, onFavorite, isFavorite }) => {
  const adresse = operator.adressesOperateurs?.[0];
  const activites = operator.activites?.map(a => a.nom).join(', ') || 'Non spécifié';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.name} numberOfLines={2}>
          {operator.raisonSociale || operator.denominationcourante}
        </Text>
        <TouchableOpacity onPress={onFavorite} style={styles.favoriteButton}>
          <Icon 
            name={isFavorite ? 'favorite' : 'favorite-border'} 
            size={24} 
            color={isFavorite ? '#FF5722' : '#757575'} 
          />
        </TouchableOpacity>
      </View>
      
      {adresse && (
        <Text style={styles.address}>
          {adresse.ville} ({adresse.codePostal})
        </Text>
      )}
      
      <Text style={styles.activities}>{activites}</Text>
      
      <View style={styles.cardFooter}>
        {operator.numeroBio && (
          <Text style={styles.bioNumber}>N° Bio: {operator.numeroBio}</Text>
        )}
        <Icon name="chevron-right" size={24} color="#757575" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activities: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bioNumber: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});