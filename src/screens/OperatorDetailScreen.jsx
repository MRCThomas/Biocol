// ==================== FICHIER 2: OperatorDetailScreen.jsx ====================
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { addFavorite, removeFavoriteFromState } from '../store/favoritesSlice';

const OperatorDetailScreen = ({ route }) => {
  const { operator } = route.params;
  const dispatch = useDispatch();
  const { items: favorites } = useSelector(state => state.favorites);
  
  const isFavorite = favorites.some(fav => fav.id === operator.id);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch(removeFavoriteFromState(operator.id));
      Alert.alert('Supprimé', 'Opérateur retiré de vos favoris');
    } else {
      dispatch(addFavorite(operator));
      Alert.alert('Ajouté', 'Opérateur ajouté à vos favoris');
    }
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleWebsite = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const adresse = operator.adressesOperateurs?.[0];
  const website = operator.sitesWeb?.[0];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.name}>
            {operator.raisonSociale || operator.denominationcourante}
          </Text>
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={handleToggleFavorite}
          >
            <Icon 
              name={isFavorite ? 'favorite' : 'favorite-border'} 
              size={28} 
              color={isFavorite ? '#FF5722' : '#757575'} 
            />
          </TouchableOpacity>
        </View>
        
        {operator.numeroBio && (
          <View style={styles.bioNumberContainer}>
            <Icon name="eco" size={20} color="#4CAF50" />
            <Text style={styles.bioNumber}>N° Bio: {operator.numeroBio}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        
        {adresse && (
          <View style={styles.contactItem}>
            <Icon name="location-on" size={24} color="#4CAF50" />
            <View style={styles.contactText}>
              <Text style={styles.contactValue}>
                {adresse.lieu && `${adresse.lieu}, `}
                {adresse.codePostal} {adresse.ville}
              </Text>
            </View>
          </View>
        )}

        {operator.telephone && (
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={() => handleCall(operator.telephone)}
          >
            <Icon name="phone" size={24} color="#4CAF50" />
            <View style={styles.contactText}>
              <Text style={styles.contactValue}>{operator.telephone}</Text>
              <Text style={styles.contactAction}>Appeler</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
        )}

        {operator.email && (
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={() => handleEmail(operator.email)}
          >
            <Icon name="email" size={24} color="#4CAF50" />
            <View style={styles.contactText}>
              <Text style={styles.contactValue}>{operator.email}</Text>
              <Text style={styles.contactAction}>Envoyer un email</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
        )}

        {website && (
          <TouchableOpacity 
            style={styles.contactItem} 
            onPress={() => handleWebsite(website.url)}
          >
            <Icon name="language" size={24} color="#4CAF50" />
            <View style={styles.contactText}>
              <Text style={styles.contactValue}>Site web</Text>
              <Text style={styles.contactAction}>Visiter</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
        )}
      </View>

      {operator.activites && operator.activites.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activités</Text>
          <View style={styles.tagContainer}>
            {operator.activites.map((activite, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{activite.nom}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {operator.productions && operator.productions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productions</Text>
          {operator.productions.map((production, index) => (
            <View key={index} style={styles.productionItem}>
              <Text style={styles.productionName}>{production.nom}</Text>
              {production.code && (
                <Text style={styles.productionCode}>Code: {production.code}</Text>
              )}
              {production.etatProductions && production.etatProductions.length > 0 && (
                <View style={styles.stateContainer}>
                  {production.etatProductions.map((état, stateIndex) => (
                    <View key={stateIndex} style={styles.stateItem}>
                      <Text style={styles.stateText}>
                        {état.etatProduction} ({état.anneeReferenceControle})
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {operator.certificats && operator.certificats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {operator.certificats.map((certificat, index) => (
            <View key={index} style={styles.certificateItem}>
              <View style={styles.certificateHeader}>
                <Icon name="verified" size={20} color="#4CAF50" />
                <Text style={styles.certificateOrganisme}>{certificat.organisme}</Text>
              </View>
              <Text style={styles.certificateState}>
                État: {certificat.etatCertification}
              </Text>
              {certificat.dateEngagement && (
                <Text style={styles.certificateDate}>
                  Engagement: {new Date(certificat.dateEngagement).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations légales</Text>
        {operator.siret && (
          <Text style={styles.legalInfo}>SIRET: {operator.siret}</Text>
        )}
        {operator.codeNAF && (
          <Text style={styles.legalInfo}>Code NAF: {operator.codeNAF}</Text>
        )}
        {operator.dateMaj && (
          <Text style={styles.legalInfo}>
            Dernière mise à jour: {new Date(operator.dateMaj).toLocaleDateString()}
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
    marginRight: 12,
  },
  favoriteButton: {
    padding: 8,
  },
  bioNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bioNumber: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactText: {
    flex: 1,
    marginLeft: 16,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
  },
  contactAction: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  productionItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productionCode: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  stateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stateItem: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stateText: {
    fontSize: 12,
    color: '#E65100',
  },
  certificateItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  certificateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  certificateOrganisme: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  certificateState: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
  },
  certificateDate: {
    fontSize: 12,
    color: '#666',
  },
  legalInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

export default OperatorDetailScreen;