// lib/features/artisans/data/artisan_model.dart
class Artisan {
  final String id;
  final String name;
  final String? companyName;
  final String? phone;
  final String? image;
  final String? email;
  final String? whatsapp;
  final String fidelityRank;
  final int points;

  Artisan({
    required this.id,
    required this.name,
    this.companyName,
    this.phone,
    this.image,
    this.email,
    this.whatsapp,
    this.fidelityRank = 'Membre',
    this.points = 0,
  });

  factory Artisan.fromJson(Map<String, dynamic> json) {
    return Artisan(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      companyName: json['companyName'],
      phone: json['phone'],
      image: json['image'],
      email: json['email'],
      whatsapp: json['whatsapp'],
      fidelityRank: json['fidelityRank'] ?? 'Membre',
      points: json['points'] ?? 0,
    );
  }

  String get displayName => (companyName != null && companyName!.isNotEmpty) ? companyName! : name;
}
