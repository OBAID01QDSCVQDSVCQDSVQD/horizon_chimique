// lib/features/realisations/providers/realisations_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/realisation_model.dart';
import '../../../core/api/api_client.dart';

final realisationsProvider = FutureProvider<List<Realisation>>((ref) async {
  // Use public endpoint from the Next.js API
  final data = await ApiClient.get<Map<String, dynamic>>('/realizations');
  final list = data['realizations'] as List<dynamic>;
  return list.map((e) => Realisation.fromJson(e)).toList();
});
