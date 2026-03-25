-- BibliO - Script MySQL prêt à importer dans phpMyAdmin
-- Compatible MySQL 8.x / MariaDB 10.4+
-- Encodage recommandé: utf8mb4

SET NAMES utf8mb4;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS biblio
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE biblio;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS penalites;
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS emprunts;
DROP TABLE IF EXISTS livres;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS utilisateurs;

SET FOREIGN_KEY_CHECKS = 1;

-- Utilisateurs (Adhérent + Bibliothécaire via rôle)
CREATE TABLE utilisateurs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL,
  mot_de_passe_hash VARCHAR(255) NOT NULL,
  quota INT NOT NULL DEFAULT 3,
  role ENUM('ADHERENT','BIBLIOTHECAIRE') NOT NULL DEFAULT 'ADHERENT',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_utilisateurs_email (email),
  KEY idx_utilisateurs_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Catégories
CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_nom (nom)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Livres (extension du diagramme: isbn, description, année, exemplaires)
CREATE TABLE livres (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  titre VARCHAR(255) NOT NULL,
  auteur VARCHAR(255) NOT NULL,
  reference VARCHAR(64) NULL,
  isbn VARCHAR(32) NULL,
  description TEXT NULL,
  annee_publication INT NULL,
  image_url VARCHAR(500) NULL,
  exemplaires_total INT NOT NULL DEFAULT 1,
  exemplaires_disponibles INT NOT NULL DEFAULT 1,
  disponible TINYINT(1) NOT NULL DEFAULT 1,
  categorie_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_livres_categorie (categorie_id),
  KEY idx_livres_titre (titre),
  KEY idx_livres_auteur (auteur),
  UNIQUE KEY uq_livres_isbn (isbn),
  CONSTRAINT fk_livres_categorie
    FOREIGN KEY (categorie_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Emprunts
CREATE TABLE emprunts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  adherent_id INT UNSIGNED NOT NULL,
  livre_id INT UNSIGNED NOT NULL,
  date_emprunt DATE NOT NULL,
  date_retour_prevue DATE NOT NULL,
  date_retour DATE NULL,
  statut ENUM('ACTIF','RETOURNE') NOT NULL DEFAULT 'ACTIF',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_emprunts_adherent (adherent_id),
  KEY idx_emprunts_livre (livre_id),
  KEY idx_emprunts_statut (statut),
  CONSTRAINT fk_emprunts_adherent
    FOREIGN KEY (adherent_id) REFERENCES utilisateurs(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_emprunts_livre
    FOREIGN KEY (livre_id) REFERENCES livres(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Réservations
CREATE TABLE reservations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  adherent_id INT UNSIGNED NOT NULL,
  livre_id INT UNSIGNED NOT NULL,
  date_reservation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  statut ENUM('EN_ATTENTE','PRET','ANNULEE','TERMINEE') NOT NULL DEFAULT 'EN_ATTENTE',
  notified_at DATETIME NULL,
  expires_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reservations_adherent (adherent_id),
  KEY idx_reservations_livre (livre_id),
  KEY idx_reservations_statut (statut),
  UNIQUE KEY uq_reservation_active (adherent_id, livre_id, statut),
  CONSTRAINT fk_reservations_adherent
    FOREIGN KEY (adherent_id) REFERENCES utilisateurs(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_reservations_livre
    FOREIGN KEY (livre_id) REFERENCES livres(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pénalités / amendes (0..1 par emprunt)
CREATE TABLE penalites (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  emprunt_id INT UNSIGNED NOT NULL,
  adherent_id INT UNSIGNED NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  nb_jours_retard INT NOT NULL,
  statut ENUM('IMPAYEE','PAYEE') NOT NULL DEFAULT 'IMPAYEE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_penalites_emprunt (emprunt_id),
  KEY idx_penalites_adherent (adherent_id),
  KEY idx_penalites_statut (statut),
  CONSTRAINT fk_penalites_emprunt
    FOREIGN KEY (emprunt_id) REFERENCES emprunts(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_penalites_adherent
    FOREIGN KEY (adherent_id) REFERENCES utilisateurs(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Données de démonstration
INSERT INTO categories (nom) VALUES
('Informatique'),
('Littérature'),
('Histoire'),
('Développement Personnel');

-- Mot de passe démo: demo123 (bcrypt)
-- Hash généré une fois, à utiliser tel quel
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe_hash, quota, role) VALUES
('Demo', 'Adherent', 'adherent@demo.com', '$2b$12$BD.V9kPLns/sbeTcoxIk8OTYVNMgy6wgCeAqsdeZHZUT72jp19Hpi', 3, 'ADHERENT'),
('Demo', 'Biblio', 'biblio@demo.com', '$2b$12$BD.V9kPLns/sbeTcoxIk8OTYVNMgy6wgCeAqsdeZHZUT72jp19Hpi', 99, 'BIBLIOTHECAIRE');

INSERT INTO livres (titre, auteur, reference, isbn, description, annee_publication, exemplaires_total, exemplaires_disponibles, disponible, categorie_id) VALUES
('Clean Code', 'Robert C. Martin', 'REF-CC-2008', '978-0132350884', 'A handbook of agile software craftsmanship', 2008, 5, 3, 1, (SELECT id FROM categories WHERE nom='Informatique' LIMIT 1)),
('The Pragmatic Programmer', 'David Thomas, Andrew Hunt', 'REF-PP-2019', '978-0135957059', 'Your journey to mastery', 2019, 4, 2, 1, (SELECT id FROM categories WHERE nom='Informatique' LIMIT 1)),
('Design Patterns', 'Gang of Four', 'REF-DP-1994', '978-0201633610', 'Elements of Reusable Object-Oriented Software', 1994, 3, 1, 1, (SELECT id FROM categories WHERE nom='Informatique' LIMIT 1)),
('1984', 'George Orwell', 'REF-1984-1949', '978-0451524935', 'A dystopian social science fiction novel', 1949, 5, 4, 1, (SELECT id FROM categories WHERE nom='Littérature' LIMIT 1)),
('To Kill a Mockingbird', 'Harper Lee', 'REF-TKAM-1960', '978-0061120084', 'A gripping tale of racial injustice', 1960, 4, 3, 1, (SELECT id FROM categories WHERE nom='Littérature' LIMIT 1)),
('Sapiens', 'Yuval Noah Harari', 'REF-SAP-2011', '978-0062316097', 'A brief history of humankind', 2011, 3, 2, 1, (SELECT id FROM categories WHERE nom='Histoire' LIMIT 1)),
('Atomic Habits', 'James Clear', 'REF-AH-2018', '978-0735211292', 'Tiny changes, remarkable results', 2018, 6, 5, 1, (SELECT id FROM categories WHERE nom='Développement Personnel' LIMIT 1)),
('The Art of Computer Programming', 'Donald Knuth', 'REF-TAOCP-1968', '978-0201896831', 'Fundamental algorithms', 1968, 2, 0, 0, (SELECT id FROM categories WHERE nom='Informatique' LIMIT 1));

-- Exemple d'emprunts + pénalité (adherent@demo.com)
INSERT INTO emprunts (adherent_id, livre_id, date_emprunt, date_retour_prevue, date_retour, statut) VALUES
((SELECT id FROM utilisateurs WHERE email='adherent@demo.com' LIMIT 1), (SELECT id FROM livres WHERE isbn='978-0132350884' LIMIT 1), '2024-01-15', '2024-02-15', NULL, 'ACTIF'),
((SELECT id FROM utilisateurs WHERE email='adherent@demo.com' LIMIT 1), (SELECT id FROM livres WHERE isbn='978-0451524935' LIMIT 1), '2024-02-01', '2024-03-01', NULL, 'ACTIF'),
((SELECT id FROM utilisateurs WHERE email='adherent@demo.com' LIMIT 1), (SELECT id FROM livres WHERE isbn='978-0135957059' LIMIT 1), '2023-12-20', '2024-01-20', '2024-01-25', 'RETOURNE');

-- Une réservation sur le livre indisponible
INSERT INTO reservations (adherent_id, livre_id, date_reservation, statut) VALUES
((SELECT id FROM utilisateurs WHERE email='adherent@demo.com' LIMIT 1), (SELECT id FROM livres WHERE isbn='978-0201896831' LIMIT 1), '2024-02-20 10:00:00', 'EN_ATTENTE');

-- Pénalité exemple (retard de 10 jours)
INSERT INTO penalites (emprunt_id, adherent_id, montant, nb_jours_retard, statut) VALUES
((SELECT id FROM emprunts WHERE livre_id=(SELECT id FROM livres WHERE isbn='978-0451524935' LIMIT 1) ORDER BY id DESC LIMIT 1),
 (SELECT id FROM utilisateurs WHERE email='adherent@demo.com' LIMIT 1),
 5.00, 10, 'IMPAYEE');

