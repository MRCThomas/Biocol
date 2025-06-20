// src/services/database.js
import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = "biocol.db";
const database_version = "1.0";
const database_displayname = "BioConnect Local Database";
const database_size = 200000;

let db;

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    SQLite.openDatabase(
      database_name,
      database_version,
      database_displayname,
      database_size
    ).then((DB) => {
      db = DB;
      console.log("Database OPENED");
      
      // Créer la table favorites
      db.executeSql(
        `CREATE TABLE IF NOT EXISTS favorites (
          id INTEGER PRIMARY KEY,
          raisonSociale TEXT,
          ville TEXT,
          codePostal TEXT,
          activites TEXT,
          telephone TEXT,
          email TEXT,
          adresse TEXT,
          dateAdded TEXT
        )`
      ).then(() => {
        console.log("Table favorites créée");
        resolve(db);
      }).catch((error) => {
        console.log("Erreur création table:", error);
        reject(error);
      });
    }).catch((error) => {
      console.log("Erreur ouverture DB:", error);
      reject(error);
    });
  });
};

export const saveFavorite = (operator) => {
  return new Promise((resolve, reject) => {
    const adresse = operator.adressesOperateurs?.[0];
    const activitesStr = operator.activites?.map(a => a.nom).join(', ') || '';
    
    db.executeSql(
      `INSERT OR REPLACE INTO favorites 
        (id, raisonSociale, ville, codePostal, activites, telephone, email, adresse, dateAdded) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        operator.id,
        operator.raisonSociale,
        adresse?.ville || '',
        adresse?.codePostal || '',
        activitesStr,
        operator.telephone || '',
        operator.email || '',
        adresse?.lieu || '',
        new Date().toISOString()
      ]
    ).then(() => {
      console.log("Favori sauvegardé");
      resolve();
    }).catch((error) => {
      console.log("Erreur sauvegarde favori:", error);
      reject(error);
    });
  });
};

// Renommé la fonction pour plus de clarté et de cohérence
export const getFavorites = () => {
  return new Promise((resolve, reject) => {
    db.executeSql("SELECT * FROM favorites ORDER BY dateAdded DESC")
      .then(([results]) => {
        const favorites = [];
        for (let i = 0; i < results.rows.length; i++) {
          favorites.push(results.rows.item(i));
        }
        resolve(favorites);
      })
      .catch((error) => {
        console.log("Erreur récupération favoris:", error);
        reject(error);
      });
  });
};

export const removeFavorite = (operatorId) => {
  return new Promise((resolve, reject) => {
    db.executeSql("DELETE FROM favorites WHERE id = ?", [operatorId])
      .then(() => {
        console.log("Favori supprimé");
        resolve();
      })
      .catch((error) => {
        console.log("Erreur suppression favori:", error);
        reject(error);
      });
  });
};
