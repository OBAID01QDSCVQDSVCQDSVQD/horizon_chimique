// lib/features/realisations/data/realisation_model.dart
class Realisation {
  final String id;
  final String title;
  final String? description;
  final List<String> images;
  final String? location;
  final DateTime? createdAt;
  final String? artisanId;
  final String artisanName;
  final String? artisanAvatar;
  final int likes;
  final int comments;

  Realisation({
    required this.id,
    required this.title,
    this.description,
    this.images = const [],
    this.location,
    this.createdAt,
    this.artisanId,
    this.artisanName = 'Artisan Partenaire',
    this.artisanAvatar,
    this.likes = 0,
    this.comments = 0,
  });

  factory Realisation.fromJson(Map<String, dynamic> json) {
    // Try to extract artisan details if populated
    String aName = 'Artisan Partenaire';
    String? aAvatar;
    String? aId;
    
    if (json['artisan'] is Map) {
      aId = json['artisan']['_id'];
      aName = json['artisan']['name'] ?? json['artisan']['companyName'] ?? aName;
      aAvatar = json['artisan']['image'];
    } else if (json['artisan'] is String) {
      aId = json['artisan'];
    }

    int parseCount(dynamic value, int fallback) {
      if (value is int) return value;
      if (value is List) return value.length;
      return fallback;
    }

    return Realisation(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      images: List<String>.from(json['images'] ?? []),
      location: json['location'],
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
      artisanId: aId,
      artisanName: aName,
      artisanAvatar: aAvatar,
      likes: json['likesCount'] ?? parseCount(json['likes'], 0),
      comments: json['commentsCount'] ?? parseCount(json['comments'], 0),
    );
  }

  String get mainImage => images.isNotEmpty ? images.first : '';
}
