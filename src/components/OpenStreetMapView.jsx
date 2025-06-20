// src/components/OpenStreetMapView.js
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OpenStreetMapView = ({ 
  operators, 
  region, 
  currentLocation, 
  onMarkerPress,
  onFavoriteToggle,
  favorites = [],
  style 
}) => {
  const webViewRef = useRef(null);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [webViewLoaded, setWebViewLoaded] = useState(false);

  const generateMapData = () => {
    const markers = operators
      .filter(operator => {
        const adresse = operator.adressesOperateurs?.[0];
        return adresse && adresse.lat && adresse.long && 
               !isNaN(parseFloat(adresse.lat)) && !isNaN(parseFloat(adresse.long));
      })
      .map(operator => {
        const adresse = operator.adressesOperateurs[0];
        const isFavorite = favorites.some(fav => fav.id === operator.id);
        
        return {
          id: operator.id,
          lat: parseFloat(adresse.lat),
          lng: parseFloat(adresse.long),
          title: operator.raisonSociale || 'Opérateur bio',
          description: adresse.ville || '',
          address: `${adresse.adresse || ''} ${adresse.codePostal || ''} ${adresse.ville || ''}`.trim(),
          phone: operator.telephone || '',
          email: operator.email || '',
          website: operator.siteWeb || '',
          certifications: operator.certifications || [],
          produits: operator.produits || [],
          isFavorite: isFavorite
        };
      });

    return {
      markers,
      center: {
        lat: region.latitude,
        lng: region.longitude,
      },
      currentLocation: currentLocation ? {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      } : null,
    };
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
        crossorigin=""/>
      <style>
        * { box-sizing: border-box; }
        body { 
          margin: 0; 
          padding: 0; 
          height: 100vh; 
          width: 100vw;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow: hidden;
        }
        #map { 
          height: 100vh; 
          width: 100vw; 
          position: relative;
        }
        .custom-marker {
          background-color: white;
          border: 3px solid #4CAF50;
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .custom-marker:hover {
          transform: scale(1.1);
          border-color: #2E7D32;
        }
        .favorite-marker {
          border-color: #FF5722;
          background-color: #FFF3E0;
        }
        .user-marker {
          background-color: #2196F3;
          border: 3px solid white;
          border-radius: 50%;
          width: 25px;
          height: 25px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 16px;
          font-size: 14px;
          line-height: 1.4;
          min-width: 200px;
        }
        .popup-title {
          font-weight: bold;
          color: #2E7D32;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .popup-info {
          color: #666;
          margin-bottom: 4px;
        }
        .popup-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          margin-top: 8px;
          width: 100%;
        }
        .popup-button:hover {
          background-color: #2E7D32;
        }
        .leaflet-control-attribution {
          font-size: 10px;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""></script>
      
      <script>
        let map;
        let markersLayer;
        let isInitialized = false;
        
        function initMap() {
          try {
            console.log('Initialisation de la carte...');
            
            // Initialiser la carte
            map = L.map('map', {
              zoomControl: true,
              scrollWheelZoom: true,
              doubleClickZoom: true,
              touchZoom: true
            }).setView([48.8566, 2.3522], 10);
            
            // Ajouter la couche OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);
            
            // Créer un groupe de marqueurs
            markersLayer = L.layerGroup().addTo(map);
            
            isInitialized = true;
            console.log('Carte initialisée avec succès');
            
            // Notifier React Native que la carte est prête
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapReady'
              }));
            }
            
          } catch (error) {
            console.error('Erreur lors de l\\'initialisation:', error);
          }
        }
        
        function updateMap(data) {
          if (!map || !isInitialized) {
            console.log('Carte non initialisée, tentative de réinitialisation...');
            setTimeout(() => updateMap(data), 500);
            return;
          }
          
          try {
            console.log('Mise à jour de la carte avec', data.markers.length, 'marqueurs');
            
            // Effacer les marqueurs existants
            markersLayer.clearLayers();
            
            // Centrer la carte
            if (data.center) {
              map.setView([data.center.lat, data.center.lng], 10);
            }
            
            // Ajouter le marqueur de position actuelle
            if (data.currentLocation) {
              const userIcon = L.divIcon({
                className: 'user-marker',
                iconSize: [25, 25],
                iconAnchor: [12, 12]
              });
              
              L.marker([data.currentLocation.lat, data.currentLocation.lng], {
                icon: userIcon
              })
              .bindPopup('<div class="popup-title">📍 Ma position</div>')
              .addTo(markersLayer);
            }
            
            // Ajouter les marqueurs des opérateurs
            data.markers.forEach((marker, index) => {
              try {
                const isFavorite = marker.isFavorite;
                const markerClass = isFavorite ? 'custom-marker favorite-marker' : 'custom-marker';
                const emoji = isFavorite ? '⭐' : '🌱';
                
                const customIcon = L.divIcon({
                  className: markerClass,
                  html: '<div style="color: ' + (isFavorite ? '#FF5722' : '#4CAF50') + '; font-weight: bold;">' + emoji + '</div>',
                  iconSize: [35, 35],
                  iconAnchor: [17, 17],
                  popupAnchor: [0, -17]
                });
                
                // Créer le contenu du popup
                let popupContent = '<div class="popup-title">' + marker.title + '</div>';
                popupContent += '<div class="popup-info">📍 ' + marker.address + '</div>';
                
                if (marker.phone) {
                  popupContent += '<div class="popup-info">📞 ' + marker.phone + '</div>';
                }
                
                if (marker.email) {
                  popupContent += '<div class="popup-info">✉️ ' + marker.email + '</div>';
                }
                
                popupContent += '<button class="popup-button" onclick="showDetails(' + marker.id + ')">Voir plus de détails</button>';
                
                const leafletMarker = L.marker([marker.lat, marker.lng], { icon: customIcon })
                  .bindPopup(popupContent, {
                    maxWidth: 250,
                    className: 'custom-popup'
                  })
                  .addTo(markersLayer);
                  
                console.log('Marqueur ajouté:', marker.title, 'à', marker.lat, marker.lng);
                
              } catch (markerError) {
                console.error('Erreur lors de l\\'ajout du marqueur', index, ':', markerError);
              }
            });
            
            // Ajuster la vue pour inclure tous les marqueurs
            if (data.markers.length > 0) {
              const group = new L.featureGroup(markersLayer.getLayers());
              if (group.getBounds().isValid()) {
                map.fitBounds(group.getBounds(), { padding: [20, 20] });
              }
            }
            
            console.log('Mise à jour terminée');
            
          } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
          }
        }
        
        function showDetails(operatorId) {
          console.log('Affichage des détails pour l\\'opérateur:', operatorId);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'showDetails',
              operatorId: operatorId
            }));
          }
        }
        
        // Écouter les messages de React Native
        document.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            console.log('Message reçu:', data.type);
            if (data.type === 'updateMap') {
              updateMap(data.payload);
            }
          } catch (error) {
            console.error('Erreur lors du traitement du message:', error);
          }
        });
        
        // Pour Android
        window.addEventListener('message', function(event) {
          try {
            const data = JSON.parse(event.data);
            console.log('Message reçu (window):', data.type);
            if (data.type === 'updateMap') {
              updateMap(data.payload);
            }
          } catch (error) {
            console.error('Erreur lors du traitement du message (window):', error);
          }
        });
        
        // Initialiser la carte au chargement
        document.addEventListener('DOMContentLoaded', function() {
          console.log('DOM chargé, initialisation de la carte...');
          initMap();
        });
        
        // Fallback si DOMContentLoaded ne fonctionne pas
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initMap);
        } else {
          initMap();
        }
      </script>
    </body>
    </html>
  `;

  // Mettre à jour la carte quand les données changent
  useEffect(() => {
    if (webViewRef.current && webViewLoaded && operators.length > 0) {
      const mapData = generateMapData();
      console.log('Envoi des données à la WebView:', mapData.markers.length, 'marqueurs');
      
      const message = JSON.stringify({
        type: 'updateMap',
        payload: mapData
      });
      
      setTimeout(() => {
        webViewRef.current.postMessage(message);
      }, 100);
    }
  }, [operators, region, currentLocation, favorites, webViewLoaded]);

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message reçu de la WebView:', data.type);
      
      if (data.type === 'mapReady') {
        setWebViewLoaded(true);
        console.log('Carte prête');
      } else if (data.type === 'showDetails') {
        const operator = operators.find(op => op.id === data.operatorId);
        if (operator) {
          setSelectedOperator(operator);
          setModalVisible(true);
        }
      }
    } catch (error) {
      console.warn('Erreur lors du traitement du message de la carte:', error);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedOperator(null);
  };

  const handleFavoriteToggle = () => {
    if (selectedOperator && onFavoriteToggle) {
      onFavoriteToggle(selectedOperator);
    }
  };

  const handleViewDetails = () => {
    if (selectedOperator && onMarkerPress) {
      onMarkerPress(selectedOperator);
      handleCloseModal();
    }
  };

  const isFavoriteOperator = selectedOperator ? 
    favorites.some(fav => fav.id === selectedOperator.id) : false;

  const renderOperatorModal = () => {
    if (!selectedOperator) return null;

    const adresse = selectedOperator.adressesOperateurs?.[0];
    const fullAddress = adresse ? 
      `${adresse.adresse || ''} ${adresse.codePostal || ''} ${adresse.ville || ''}`.trim() : 
      'Adresse non disponible';

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedOperator.raisonSociale || 'Opérateur bio'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Adresse */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Icon name="location-on" size={20} color="#4CAF50" />
                  <Text style={styles.infoText}>{fullAddress}</Text>
                </View>
              </View>

              {/* Contact */}
              {(selectedOperator.telephone || selectedOperator.email) && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Contact</Text>
                  {selectedOperator.telephone && (
                    <View style={styles.infoRow}>
                      <Icon name="phone" size={20} color="#4CAF50" />
                      <Text style={styles.infoText}>{selectedOperator.telephone}</Text>
                    </View>
                  )}
                  {selectedOperator.email && (
                    <View style={styles.infoRow}>
                      <Icon name="email" size={20} color="#4CAF50" />
                      <Text style={styles.infoText}>{selectedOperator.email}</Text>
                    </View>
                  )}
                  {selectedOperator.siteWeb && (
                    <View style={styles.infoRow}>
                      <Icon name="language" size={20} color="#4CAF50" />
                      <Text style={styles.infoText}>{selectedOperator.siteWeb}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Certifications */}
              {selectedOperator.certifications && selectedOperator.certifications.length > 0 && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Certifications</Text>
                  <View style={styles.tagsContainer}>
                    {selectedOperator.certifications.map((cert, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{cert}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Produits */}
              {selectedOperator.produits && selectedOperator.produits.length > 0 && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Produits</Text>
                  <View style={styles.tagsContainer}>
                    {selectedOperator.produits.slice(0, 6).map((produit, index) => (
                      <View key={index} style={[styles.tag, styles.productTag]}>
                        <Text style={[styles.tagText, styles.productTagText]}>{produit}</Text>
                      </View>
                    ))}
                    {selectedOperator.produits.length > 6 && (
                      <View style={[styles.tag, styles.moreTag]}>
                        <Text style={styles.tagText}>+{selectedOperator.produits.length - 6}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.favoriteButton]}
                onPress={handleFavoriteToggle}
              >
                <Icon 
                  name={isFavoriteOperator ? "favorite" : "favorite-border"} 
                  size={20} 
                  color={isFavoriteOperator ? "#FF5722" : "#666"} 
                />
                <Text style={[
                  styles.actionButtonText,
                  isFavoriteOperator && styles.favoriteButtonText
                ]}>
                  {isFavoriteOperator ? "Favoris" : "Ajouter"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, styles.detailsButton]}
                onPress={handleViewDetails}
              >
                <Icon name="info" size={20} color="white" />
                <Text style={[styles.actionButtonText, styles.detailsButtonText]}>
                  Voir détails
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        style={styles.webView}
        onLoadEnd={() => {
          console.log('WebView chargée');
        }}
        onError={(error) => {
          console.error('Erreur WebView:', error);
        }}
        allowsInlineMediaPlayback={true}
        mixedContentMode="compatibility"
      />
      {renderOperatorModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
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
    minHeight: '50%',
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
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E8F5E8',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  productTag: {
    backgroundColor: '#FFF3E0',
  },
  moreTag: {
    backgroundColor: '#F5F5F5',
  },
  tagText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  productTagText: {
    color: '#FF8F00',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  favoriteButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailsButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  favoriteButtonText: {
    color: '#FF5722',
  },
  detailsButtonText: {
    color: 'white',
  },
});

export default OpenStreetMapView;