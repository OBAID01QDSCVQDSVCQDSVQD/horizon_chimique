class Product {
  final String id;
  final String designation;
  final List<String> gamme;
  final String descriptionCourte;
  final List<String> images;
  final List<String> avantages;
  final String? informations;
  final String? domaineApplication;
  final String? miseEnOeuvre;
  final String? preparationSupport;
  final String? stockage;
  final String? consommation;
  final String? nettoyage;
  final List<String> securite;
  final String? pdfUrl;
  final Caracteristiques? caracteristiques;
  final DonneesTechniques? donneesTechniques;
  final int pointFidelite;

  const Product({
    required this.id,
    required this.designation,
    required this.gamme,
    required this.descriptionCourte,
    this.images = const [],
    this.avantages = const [],
    this.informations,
    this.domaineApplication,
    this.miseEnOeuvre,
    this.preparationSupport,
    this.stockage,
    this.consommation,
    this.nettoyage,
    this.securite = const [],
    this.pdfUrl,
    this.caracteristiques,
    this.donneesTechniques,
    this.pointFidelite = 0,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['_id'] ?? '',
      designation: json['designation'] ?? '',
      gamme: List<String>.from(json['gamme'] ?? []),
      descriptionCourte: json['description_courte'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      avantages: List<String>.from(json['avantages'] ?? []),
      informations: json['informations'],
      domaineApplication: json['domaine_application'],
      miseEnOeuvre: json['mise_en_oeuvre'],
      preparationSupport: json['preparation_support'],
      stockage: json['stockage'],
      consommation: json['consommation'],
      nettoyage: json['nettoyage'],
      securite: List<String>.from(json['securite'] ?? []),
      pdfUrl: json['pdf_url'],
      caracteristiques: json['caracteristiques'] != null
          ? Caracteristiques.fromJson(json['caracteristiques'])
          : null,
      donneesTechniques: json['donnees_techniques'] != null
          ? DonneesTechniques.fromJson(json['donnees_techniques'])
          : null,
      pointFidelite: json['point_fidelite'] ?? 0,
    );
  }

  String get mainImage => images.isNotEmpty ? images.first : '';
  String get categoryLabel => gamme.isNotEmpty ? gamme.join(' / ') : '';
}

class Caracteristiques {
  final String? aspect;
  final String? rendement;
  final String? tempsSechage;
  final String? conditionnement;

  const Caracteristiques({
    this.aspect,
    this.rendement,
    this.tempsSechage,
    this.conditionnement,
  });

  factory Caracteristiques.fromJson(Map<String, dynamic> json) {
    return Caracteristiques(
      aspect: json['aspect'],
      rendement: json['rendement'],
      tempsSechage: json['temps_sechage'],
      conditionnement: json['conditionnement'],
    );
  }
}

class DonneesTechniques {
  final String? couleur;
  final String? densite;
  final String? extraitSec;

  const DonneesTechniques({this.couleur, this.densite, this.extraitSec});

  factory DonneesTechniques.fromJson(Map<String, dynamic> json) {
    return DonneesTechniques(
      couleur: json['couleur'],
      densite: json['densite'],
      extraitSec: json['extrait_sec'],
    );
  }
}
