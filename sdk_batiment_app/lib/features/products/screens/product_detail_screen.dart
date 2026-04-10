import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/products_provider.dart';
import '../../../core/constants/app_colors.dart';

class ProductDetailScreen extends ConsumerWidget {
  final String id;
  const ProductDetailScreen({super.key, required this.id});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productAsync = ref.watch(productDetailProvider(id));

    return Scaffold(
      backgroundColor: AppColors.background,
      body: productAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (product) => CustomScrollView(
          slivers: [
            // Image Gallery App Bar
            SliverAppBar(
              expandedHeight: 320,
              pinned: true,
              backgroundColor: Colors.white,
              leading: GestureDetector(
                onTap: () => context.pop(),
                child: Container(
                  margin: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8)]),
                  child: const Icon(Icons.arrow_back_rounded, color: AppColors.slate900),
                ),
              ),
              flexibleSpace: FlexibleSpaceBar(
                background: product.images.isNotEmpty
                    ? _ImageGallery(images: product.images)
                    : Container(color: AppColors.slate50, child: const Icon(Icons.inventory_2_outlined, size: 80, color: AppColors.slate300)),
              ),
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Category
                    if (product.gamme.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.08), borderRadius: BorderRadius.circular(6)),
                        child: Text(product.categoryLabel.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.primary, letterSpacing: 0.8)),
                      ),
                    const SizedBox(height: 10),

                    // Name
                    Text(product.designation, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppColors.slate900, height: 1.2)),
                    const SizedBox(height: 10),

                    // Short desc
                    Text(product.descriptionCourte, style: const TextStyle(fontSize: 14, color: AppColors.slate600, height: 1.6)),
                    const SizedBox(height: 20),

                    // Quick stats
                    if (product.caracteristiques != null)
                      _QuickStats(caract: product.caracteristiques!),

                    const SizedBox(height: 24),

                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => context.push('/devis?product=${Uri.encodeComponent(product.designation)}'),
                            icon: const Icon(Icons.request_quote_rounded, size: 18),
                            label: const Text('Demander un Devis'),
                          ),
                        ),
                        if (product.pdfUrl != null) ...[
                          const SizedBox(width: 10),
                          OutlinedButton(
                            onPressed: () => _openPdf(context, product.pdfUrl!),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.all(14),
                              side: const BorderSide(color: AppColors.slate300),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Icon(Icons.picture_as_pdf_rounded, color: AppColors.slate600),
                          ),
                        ],
                      ],
                    ),

                    const SizedBox(height: 28),
                    const Divider(color: AppColors.slate100),
                    const SizedBox(height: 20),

                    // Avantages
                    if (product.avantages.isNotEmpty) ...[
                      _SectionTitle('Pourquoi choisir ce produit ?', Icons.star_rounded),
                      const SizedBox(height: 12),
                      ...product.avantages.map((av) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.check_circle_rounded, size: 18, color: AppColors.success),
                            const SizedBox(width: 10),
                            Expanded(child: Text(av, style: const TextStyle(fontSize: 13, color: AppColors.slate700, height: 1.5))),
                          ],
                        ),
                      )),
                      const SizedBox(height: 24),
                    ],

                    // Description
                    if (product.informations != null) ...[
                      _SectionTitle('Description & Usage', Icons.info_outline_rounded),
                      const SizedBox(height: 10),
                      _InfoCard(content: product.informations!),
                      const SizedBox(height: 20),
                    ],

                    // Mise en oeuvre
                    if (product.miseEnOeuvre != null) ...[
                      _SectionTitle('Mise en Œuvre', Icons.construction_rounded),
                      const SizedBox(height: 10),
                      _InfoCard(content: product.miseEnOeuvre!),
                      const SizedBox(height: 20),
                    ],

                    // Tech specs card
                    _TechSpecsCard(product: product),

                    const SizedBox(height: 30),

                    // Security
                    if (product.securite.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFFECACA))),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(children: [
                              Icon(Icons.shield_rounded, size: 18, color: Color(0xFFDC2626)),
                              SizedBox(width: 8),
                              Text('Sécurité', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF7F1D1D))),
                            ]),
                            const SizedBox(height: 10),
                            ...product.securite.map((s) => Padding(
                              padding: const EdgeInsets.only(bottom: 4),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('• ', style: TextStyle(color: Color(0xFFDC2626), fontWeight: FontWeight.bold)),
                                  Expanded(child: Text(s, style: const TextStyle(fontSize: 12, color: Color(0xFF7F1D1D), height: 1.5))),
                                ],
                              ),
                            )),
                          ],
                        ),
                      ),
                    ],

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openPdf(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}

class _ImageGallery extends StatefulWidget {
  final List<String> images;
  const _ImageGallery({required this.images});

  @override
  State<_ImageGallery> createState() => _ImageGalleryState();
}

class _ImageGalleryState extends State<_ImageGallery> {
  final _ctrl = PageController();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        PageView.builder(
          controller: _ctrl,
          itemCount: widget.images.length,
          itemBuilder: (_, i) => CachedNetworkImage(
            imageUrl: widget.images[i],
            fit: BoxFit.contain,
            placeholder: (c, u) => Shimmer.fromColors(
              baseColor: AppColors.slate100,
              highlightColor: AppColors.slate50,
              child: Container(color: Colors.white),
            ),
            errorWidget: (c, u, e) => const Icon(Icons.broken_image_outlined, size: 60, color: AppColors.slate300),
          ),
        ),
        if (widget.images.length > 1)
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Center(
              child: SmoothPageIndicator(
                controller: _ctrl,
                count: widget.images.length,
                effect: const WormEffect(
                  dotHeight: 6,
                  dotWidth: 6,
                  activeDotColor: AppColors.primary,
                  dotColor: AppColors.slate300,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _QuickStats extends StatelessWidget {
  final dynamic caract;
  const _QuickStats({required this.caract});

  @override
  Widget build(BuildContext context) {
    final stats = <Map<String, String>>[];
    if (caract.rendement != null) stats.add({'label': 'Rendement', 'value': caract.rendement!});
    if (caract.tempsSechage != null) stats.add({'label': 'Séchage', 'value': caract.tempsSechage!});
    if (caract.conditionnement != null) stats.add({'label': 'Conditionnement', 'value': caract.conditionnement!});
    if (stats.isEmpty) return const SizedBox();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.slate50, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.slate100)),
      child: Row(
        children: stats.map((s) => Expanded(
          child: Column(
            children: [
              Text(s['value']!, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.slate900)),
              const SizedBox(height: 2),
              Text(s['label']!, style: const TextStyle(fontSize: 10, color: AppColors.slate500, fontWeight: FontWeight.w600)),
            ],
          ),
        )).toList(),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final IconData icon;
  const _SectionTitle(this.title, this.icon);

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Icon(icon, size: 18, color: AppColors.primary),
      const SizedBox(width: 8),
      Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.slate900)),
    ]);
  }
}

class _InfoCard extends StatelessWidget {
  final String content;
  const _InfoCard({required this.content});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.slate100)),
      child: Text(content, style: const TextStyle(fontSize: 13, color: AppColors.slate600, height: 1.6)),
    );
  }
}

class _TechSpecsCard extends StatelessWidget {
  final dynamic product;
  const _TechSpecsCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final rows = <MapEntry<String, String>>[];
    final dt = product.donneesTechniques;
    if (dt != null) {
      if (dt.couleur != null) rows.add(MapEntry('Couleur', dt.couleur!));
      if (dt.densite != null) rows.add(MapEntry('Densité', dt.densite!));
      if (dt.extraitSec != null) rows.add(MapEntry('Extrait Sec', dt.extraitSec!));
    }
    if (product.caracteristiques?.aspect != null) rows.add(MapEntry('Aspect', product.caracteristiques!.aspect!));
    if (product.stockage != null) rows.add(MapEntry('Stockage', product.stockage!));
    if (rows.isEmpty) return const SizedBox();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.slate900, borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(children: [
            Icon(Icons.science_rounded, size: 18, color: AppColors.primaryLight),
            SizedBox(width: 8),
            Text('Données Techniques', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
          ]),
          const SizedBox(height: 14),
          ...rows.map((r) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(r.key, style: const TextStyle(fontSize: 12, color: AppColors.slate400)),
                Flexible(child: Text(r.value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white), textAlign: TextAlign.end)),
              ],
            ),
          )),
        ],
      ),
    );
  }
}
