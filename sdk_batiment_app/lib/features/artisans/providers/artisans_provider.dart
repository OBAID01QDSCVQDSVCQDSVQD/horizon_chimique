// lib/features/artisans/providers/artisans_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/artisan_model.dart';
import '../../../core/api/api_client.dart';

final artisansProvider = FutureProvider<List<Artisan>>((ref) async {
  final data = await ApiClient.get<Map<String, dynamic>>('/artisans/nearby?lat=&lng=');
  final list = data['artisans'] as List<dynamic>;
  return list.map((e) => Artisan.fromJson(e)).toList();
});
