import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/product_model.dart';
import '../../../core/api/api_client.dart';

// -- Repository --
class ProductRepository {
  Future<List<Product>> fetchAll({String? gamme}) async {
    final data = await ApiClient.get<Map<String, dynamic>>(
      '/products',
      params: gamme != null ? {'gamme': gamme} : null,
    );
    final list = data['data'] as List<dynamic>;
    return list.map((e) => Product.fromJson(e)).toList();
  }

  Future<Product> fetchById(String id) async {
    final data = await ApiClient.get<Map<String, dynamic>>('/products/$id');
    return Product.fromJson(data['data']);
  }
}

// -- Providers --
final productRepositoryProvider = Provider((_) => ProductRepository());

// All products
final productsProvider = FutureProvider.family<List<Product>, String?>((ref, gamme) async {
  final repo = ref.watch(productRepositoryProvider);
  return repo.fetchAll(gamme: gamme);
});

// Single product
final productDetailProvider = FutureProvider.family<Product, String>((ref, id) async {
  final repo = ref.watch(productRepositoryProvider);
  return repo.fetchById(id);
});

// Search query state
final searchQueryProvider = StateProvider<String>((_) => '');

// Active gamme filter
final activeGammeProvider = StateProvider<String?>((_) => null);

// Filtered products derived from search + gamme
final filteredProductsProvider = Provider<AsyncValue<List<Product>>>((ref) {
  final gamme = ref.watch(activeGammeProvider);
  final query = ref.watch(searchQueryProvider).toLowerCase();
  final productsAsync = ref.watch(productsProvider(gamme));

  return productsAsync.whenData((products) {
    if (query.isEmpty) return products;
    return products.where((p) =>
      p.designation.toLowerCase().contains(query) ||
      p.descriptionCourte.toLowerCase().contains(query) ||
      p.gamme.any((g) => g.toLowerCase().contains(query))
    ).toList();
  });
});
