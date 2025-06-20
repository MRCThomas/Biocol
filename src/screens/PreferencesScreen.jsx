// ==================== FICHIER 3: PreferencesScreen.js ====================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { updatePreference, loadPreferences } from '../store/preferencesSlice';

const COLORS = {
  background: '#F6F5EC',
  card: '#FFFFFFCC',
  text: '#2E4D25',
  textSecondary: '#7A8B6F',
  primary: '#6DB36D',
  secondary: '#B3D89C',
  accent: '#F2C879',
  glass: '#E5EAD6CC',
  white: '#FFF',
};

function PreferencesScreen() {
  const dispatch = useDispatch();
  const preferences = useSelector(state => state.preferences);
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPreferencesFromStorage();
  }, [preferences]);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);
    

  const loadPreferencesFromStorage = async () => {
    try {
      const storedPreferences = await AsyncStorage.getItem('preferences');
      console.log('Préférences chargées:', storedPreferences);
      if (storedPreferences) {
        const parsed = JSON.parse(storedPreferences);
        dispatch(loadPreferences(parsed));
      }
    } catch (error) {
      console.log('Erreur chargement préférences:', error);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
    // console.log('Préférences locales mises à jour:', localPreferences);
    setHasChanges(true);
  };

  const handleFilterChange = (filterKey, value) => {
    setLocalPreferences(prev => ({
      ...prev,
      defaultFilters: {
        ...prev.defaultFilters,
        [filterKey]: value,
      },
    }));
    setHasChanges(true);
  };

  const savePreferences = async () => {
    try {
      // Sauvegarder dans AsyncStorage
      const pref = await AsyncStorage.setItem('preferences', JSON.stringify(localPreferences));
      console.log('Sauvegarde réussie:', pref);
      
      // Mettre à jour le store Redux
      dispatch(updatePreference(localPreferences));
      setHasChanges(true);
      Alert.alert('Succès', 'Préférences sauvegardées');
    } catch (error) {
      console.log('Erreur sauvegarde préférences:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les préférences');
    }
  };

  const resetPreferences = () => {
    Alert.alert(
      'Réinitialiser les préférences',
      'Êtes-vous sûr de vouloir réinitialiser toutes vos préférences ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => {
            const defaultPrefs = {
              defaultAddress: '',
              defaultRadius: 10,
              defaultFilters: {
                venteDirect: false,
                magasinSpecialise: false,
                grossiste: false,
              },
              useGeolocation: false,
            };
            setLocalPreferences(defaultPrefs);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  console.log('Préférences locales:', localPreferences);
  
  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.headerTitle, { color: COLORS.text }]}>
            Préférences
          </Text>
          <Text style={[styles.headerSubtitle, { color: COLORS.textSecondary }]}>
            Personnalisez votre expérience BioConnect
          </Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
            Localisation
          </Text>

          <View style={styles.inputContainer}>
            <Icon name="location-on" size={20} color={COLORS.primary} />
            <TextInput
              style={[styles.textInput, { color: COLORS.text }]}
              placeholder="Adresse par défaut"
              placeholderTextColor={COLORS.textSecondary}
              value={localPreferences.defaultAddress}
              onChangeText={(text) => handlePreferenceChange('defaultAddress', text)}
            />
          </View>

          <View style={styles.pickerContainer}>
            <Text style={[styles.pickerLabel, { color: COLORS.text }]}>
              Rayon de recherche par défaut
            </Text>
            <View style={[styles.pickerWrapper, { backgroundColor: COLORS.glass }]}>
              <Picker
                selectedValue={localPreferences.defaultRadius}
                onValueChange={(value) => handlePreferenceChange('defaultRadius', value)}
                style={[styles.picker, { color: COLORS.text }]}
              >
                <Picker.Item label="5 km" value={5} />
                <Picker.Item label="10 km" value={10} />
                <Picker.Item label="15 km" value={15} />
                <Picker.Item label="20 km" value={20} />
                <Picker.Item label="30 km" value={30} />
                <Picker.Item label="50 km" value={50} />
              </Picker>
            </View>
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterInfo}>
              <Icon name="my-location" size={20} color={COLORS.primary} />
              <Text style={[styles.filterLabel, { color: COLORS.text }]}>
                Utiliser la géolocalisation
              </Text>
            </View>
            <Switch
              value={localPreferences.useGeolocation}
              onValueChange={(value) => handlePreferenceChange('useGeolocation', value)}
              trackColor={{ false: COLORS.glass, true: COLORS.secondary }}
              thumbColor={COLORS.primary}
            />
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: COLORS.card }]}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
            Filtres par défaut
          </Text>

          <View style={styles.filterRow}>
            <View style={styles.filterInfo}>
              <Icon name="store" size={20} color={COLORS.primary} />
              <Text style={[styles.filterLabel, { color: COLORS.text }]}>
                Vente directe
              </Text>
            </View>
            <Switch
              value={localPreferences.defaultFilters.venteDirect}
              onValueChange={(value) => handleFilterChange('venteDirect', value)}
              trackColor={{ false: COLORS.glass, true: COLORS.secondary }}
              thumbColor={COLORS.primary}
            />
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterInfo}>
              <Icon name="shopping-cart" size={20} color={COLORS.primary} />
              <Text style={[styles.filterLabel, { color: COLORS.text }]}>
                Magasin spécialisé
              </Text>
            </View>
            <Switch
              value={localPreferences.defaultFilters.magasinSpecialise}
              onValueChange={(value) => handleFilterChange('magasinSpecialise', value)}
              trackColor={{ false: COLORS.glass, true: COLORS.secondary }}
              thumbColor={COLORS.primary}
            />
          </View>

          <View style={styles.filterRow}>
            <View style={styles.filterInfo}>
              <Icon name="business" size={20} color={COLORS.primary} />
              <Text style={[styles.filterLabel, { color: COLORS.text }]}>
                Grossiste
              </Text>
            </View>
            <Switch
              value={localPreferences.defaultFilters.grossiste}
              onValueChange={(value) => handleFilterChange('grossiste', value)}
              trackColor={{ false: COLORS.glass, true: COLORS.secondary }}
              thumbColor={COLORS.primary}
            />
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.saveButton,
              { backgroundColor: hasChanges ? COLORS.primary : COLORS.glass },
            ]}
            onPress={savePreferences}
            disabled={!hasChanges}
          >
            <Icon name="save" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Sauvegarder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton, { backgroundColor: COLORS.accent }]}
            onPress={resetPreferences}
          >
            <Icon name="refresh" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  sectionCard: {
    margin: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F0F5E4',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    paddingVertical: 8,
  },
  pickerContainer: {
    marginBottom: 8,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 0.48,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {},
  resetButton: {},
});

export default PreferencesScreen;