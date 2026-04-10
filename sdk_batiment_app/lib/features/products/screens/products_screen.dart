import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../providers/products_provider.dart';
import '../../../core/constants/app_colors.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  const ProductsScreen({super.key});

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  final _searchCtrl = TextEditingController();

  static const _gammes = [
    null,
    'Étanchéité Liquide',
    'Adjuvants',
    'Mortiers',
    'Résines',
    'Isolation',
  ];

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final products = ref.watch(filteredProductsProvider);
    final activeGamme = ref.watch(activeGammeProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            floating: true,
            pinned: true,
            expandedHeight: 130,
            backgroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              titlePadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              title: _buildSearchBar(),
            ),
            title: const Text(
              'Catalogue Produits',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
          ),

          // Gamme filters
          SliverToBoxAdapter(
            child: _buildGammeFilters(activeGamme),
          ),

          // Products grid
          products.when(
            loading: () => _buildShimmerGrid(),
            error: (e, _) => SliverToBoxAdapter(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      const Icon(Icons.wifi_off_rounded, size: 48, color: AppColors.slate400),
                      const SizedBox(height: 12),
                      Text('Impossible de charger les produits', style: TextStyle(color: AppColors.slate500)),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => ref.refresh(productsProvider(activeGamme)),
                        child: const Text('Réessayer'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            data: (list) => list.isEmpty
                ? SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          children: [
                            const Icon(Icons.search_off_rounded, size: 48, color: AppColors.slate400),
                            const SizedBox(height: 12),
                            const Text('Aucun produit trouvé', style: TextStyle(color: AppColors.slate500)),
                          ],
                        ),
                      ),
                    ),
                  )
                : SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverGrid(
                      delegate: SliverChildBuilderDelegate(
                        (ctx, i) => _ProductCard(product: list[i]),
                        childCount: list.length,
                      ),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        childAspectRatio: 0.72,
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return TextField(
      controller: _searchCtrl,
      onChanged: (v) => ref.read(searchQueryProvider.notifier).state = v,
      decoration: InputDecoration(
        hintText: 'Rechercher un produit...',
        hintStyle: const TextStyle(fontSize: 13, color: AppColors.slate400),
        prefixIcon: const Icon(Icons.search_rounded, size: 20, color: AppColors.slate400),
        suffixIcon: _searchCtrl.text.isNotEmpty
            ? IconButton(
                icon: const Icon(Icons.clear_rounded, size: 18),
                onPressed: () {
                  _searchCtrl.clear();
                  ref.read(searchQueryProvider.notifier).state = '';
                },
              )
            : null,
        contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.slate200),
        ),
        filled: true,
        fillColor: AppColors.slate50,
      ),
    );
  }

  Widget _buildGammeFilters(String? activeGamme) {
    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _gammes.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, i) {
          final g = _gammes[i];
          final isActive = activeGamme == g;
          return FilterChip(
            label: Text(g ?? 'Tous', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isActive ? Colors.white : AppColors.slate600)),
            selected: isActive,
            onSelected: (_) {
              ref.read(activeGammeProvider.notifier).state = g;
            },
            showCheckmark: false,
            backgroundColor: Colors.white,
            selectedColor: AppColors.primary,
            side: BorderSide(color: isActive ? AppColors.primary : AppColors.slate200),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          );
        },
      ),
    );
  }

  Widget _buildShimmerGrid() {
    return SliverPadding(
      padding: const EdgeInsets.all(16),
      sliver: SliverGrid(
        delegate: SliverChildBuilderDelegate(
          (_, __) => Shimmer.fromColors(
            baseColor: AppColors.slate100,
            highlightColor: AppColors.slate50,
            child: Container(decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16))),
          ),
          childCount: 6,
        ),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.65, // <-- Made taller
        ),
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final dynamic product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/products/${product.id}'),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.slate100),
          boxShadow: [
            BoxShadow(
              color: AppColors.slate900.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image (Expanded to take remaining height)
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                child: SizedBox(
                  width: double.infinity,
                  child: product.mainImage.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: product.mainImage,
                          fit: BoxFit.cover,
                          placeholder: (c, u) => Container(color: AppColors.slate50, child: const Center(child: CircularProgressIndicator(strokeWidth: 2))),
                          errorWidget: (c, u, e) => Container(
                            color: AppColors.slate50,
                            child: const Icon(Icons.inventory_2_outlined, size: 40, color: AppColors.slate300),
                          ),
                        )
                      : Container(
                          color: AppColors.slate50,
                          child: const Icon(Icons.inventory_2_outlined, size: 40, color: AppColors.slate300),
                        ),
                ),
              ),
            ),
            // Info
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (product.gamme.isNotEmpty)
                    Text(
                      product.gamme.first.toUpperCase(),
                      style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.primary, letterSpacing: 0.5),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  const SizedBox(height: 3),
                  Text(
                    product.designation,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.slate900, height: 1.3),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    product.descriptionCourte,
                    style: const TextStyle(fontSize: 10, color: AppColors.slate500, height: 1.4),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
