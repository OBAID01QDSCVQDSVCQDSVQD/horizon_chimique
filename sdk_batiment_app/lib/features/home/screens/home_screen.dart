import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../products/providers/products_provider.dart';
import '../../artisans/providers/artisans_provider.dart';
import '../../realisations/providers/realisations_provider.dart';
import '../../../core/constants/app_colors.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsProvider(null));
    final artisansAsync = ref.watch(artisansProvider);
    final realisationsAsync = ref.watch(realisationsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF0F4FF),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // ─── HERO APPBAR ──────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 240,
            backgroundColor: AppColors.primaryDark,
            pinned: true,
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              collapseMode: CollapseMode.parallax,
              background: _HeroBanner(),
            ),
            title: Row(
              children: [
                Container(
                  width: 30, height: 30,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.home_work_rounded, color: Colors.white, size: 18),
                ),
                const SizedBox(width: 8),
                const Text('SDK', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 17, letterSpacing: 0.5)),
                const Text(' BATIMENT', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.w400, fontSize: 17)),
              ],
            ),
            actions: [
              IconButton(
                icon: Stack(
                  children: [
                    const Icon(Icons.notifications_outlined, color: Colors.white, size: 26),
                    Positioned(top: 0, right: 0,
                      child: Container(width: 8, height: 8,
                        decoration: const BoxDecoration(color: Color(0xFFEF4444), shape: BoxShape.circle),
                      ),
                    ),
                  ],
                ),
                onPressed: () {},
              ),
              const SizedBox(width: 4),
            ],
          ),

          // ─── STATS BANNER ───────────────────────────────────────────
          SliverToBoxAdapter(
            child: Transform.translate(
              offset: const Offset(0, -20),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: _StatsBanner()
                  .animate()
                  .fadeIn(delay: 100.ms, duration: 400.ms)
                  .slideY(begin: 0.3, end: 0),
              ),
            ),
          ),

          // ─── NEED EXPERT SECTION ─────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _SectionTitle('Besoin d\'un expert ?'),
                  const SizedBox(height: 12),
                  _QuickActionsGrid()
                    .animate()
                    .fadeIn(delay: 200.ms, duration: 400.ms)
                    .slideY(begin: 0.2, end: 0),
                ],
              ),
            ),
          ),

          // ─── PROMO BANNER ────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
              child: _PromoBanner()
                .animate()
                .fadeIn(delay: 300.ms, duration: 400.ms)
                .slideX(begin: -0.1, end: 0),
            ),
          ),

          // ─── PRODUCTS SECTION ─────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const _SectionTitle('Produits Phares'),
                  GestureDetector(
                    onTap: () => context.push('/products'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text('Voir tout →', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                    ),
                  ),
                ],
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: SizedBox(
              height: 210,
              child: productsAsync.when(
                loading: () => _ProductsShimmer(),
                error: (_, __) => const SizedBox(),
                data: (products) => ListView.separated(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  itemCount: products.take(10).length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (_, i) {
                    final p = products[i];
                    return GestureDetector(
                      onTap: () => context.push('/products/${p.id}'),
                      child: Container(
                        width: 148,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primaryDark.withOpacity(0.08),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
                              child: SizedBox(
                                height: 110,
                                width: double.infinity,
                                child: p.mainImage.isNotEmpty
                                    ? CachedNetworkImage(
                                        imageUrl: p.mainImage,
                                        fit: BoxFit.contain,
                                        placeholder: (_, __) => Container(color: AppColors.slate50),
                                        errorWidget: (_, __, ___) => _ProductPlaceholder(),
                                      )
                                    : _ProductPlaceholder(),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (p.gamme.isNotEmpty)
                                    Container(
                                      margin: const EdgeInsets.only(bottom: 4),
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withOpacity(0.08),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(p.gamme.first, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: AppColors.primary), overflow: TextOverflow.ellipsis),
                                    ),
                                  Text(
                                    p.designation,
                                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.slate900, height: 1.3),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ).animate(delay: (i * 60).ms).fadeIn(duration: 300.ms).slideX(begin: 0.1, end: 0);
                  },
                ),
              ),
            ),
          ),

          // ─── REALISATIONS SECTION ─────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const _SectionTitle('Dernières Réalisations'),
                  GestureDetector(
                    onTap: () => context.go('/realisations'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text('Découvrir →', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 200,
              child: realisationsAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (_, __) => const SizedBox(),
                data: (realisations) => ListView.separated(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  itemCount: realisations.take(5).length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (_, i) {
                    final r = realisations[i];
                    return GestureDetector(
                      onTap: () => context.push('/realisations'),
                      child: Container(
                        width: 260,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(color: AppColors.primaryDark.withOpacity(0.08), blurRadius: 10, offset: const Offset(0, 4)),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            ClipRRect(
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                              child: SizedBox(
                                height: 120,
                                width: double.infinity,
                                child: r.mainImage.isNotEmpty
                                    ? CachedNetworkImage(imageUrl: r.mainImage, fit: BoxFit.cover)
                                    : Container(color: AppColors.slate100, child: const Icon(Icons.image, color: Colors.grey)),
                              ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    r.title,
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.slate900),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      const Icon(Icons.person_outline, size: 12, color: AppColors.slate500),
                                      const SizedBox(width: 4),
                                      Expanded(
                                        child: Text(
                                          r.artisanName,
                                          style: const TextStyle(fontSize: 11, color: AppColors.slate500),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ).animate(delay: (i * 50).ms).fadeIn().slideX(begin: 0.1, end: 0);
                  },
                ),
              ),
            ),
          ),

          // ─── ARTISANS SECTION ─────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const _SectionTitle('Nos Artisans Partenaires'),
                  GestureDetector(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text('Voir tout →', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 160,
              child: artisansAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (_, __) => const SizedBox(),
                data: (artisans) => ListView.separated(
                  scrollDirection: Axis.horizontal,
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                  itemCount: artisans.take(6).length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (_, i) {
                    final a = artisans[i];
                    return Container(
                      width: 120,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.slate100),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircleAvatar(
                            radius: 30,
                            backgroundColor: AppColors.primary.withOpacity(0.1),
                            backgroundImage: a.image != null && a.image!.isNotEmpty ? CachedNetworkImageProvider(a.image!) : null,
                            child: a.image == null || a.image!.isEmpty ? const Icon(Icons.person, color: AppColors.primary) : null,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            a.name,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.slate900),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.amber.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.star, color: Colors.amber, size: 10),
                                const SizedBox(width: 2),
                                Text(
                                  a.fidelityRank,
                                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.amber.shade700),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ).animate(delay: (i * 60).ms).fadeIn().scale(begin: const Offset(0.9, 0.9), curve: Curves.easeOutBack);
                  },
                ),
              ),
            ),
          ),

          // ─── FOOTER PADDING ──────────────────────────────────────────
          const SliverToBoxAdapter(child: SizedBox(height: 80)),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════
//  HERO BANNER
// ═══════════════════════════════════════════════
class _HeroBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0F172A), Color(0xFF1E3A8A), Color(0xFF1D4ED8)],
        ),
      ),
      child: Stack(
        children: [
          // Decorative circles
          Positioned(right: -30, top: -30,
            child: _GlowCircle(size: 200, opacity: 0.12),
          ),
          Positioned(right: 60, bottom: -40,
            child: _GlowCircle(size: 140, opacity: 0.08),
          ),
          Positioned(left: -20, top: 40,
            child: _GlowCircle(size: 100, opacity: 0.06),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 95, 20, 30),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                // Badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.25)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(width: 6, height: 6,
                        decoration: const BoxDecoration(color: Color(0xFF4ADE80), shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 6),
                      const Text('Partenaire Officiel HORIZON CHIMIQUE',
                        style: TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.3)),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  "L'Excellence en\nÉtanchéité",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    height: 1.15,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Solutions haut de gamme pour professionnels',
                  style: TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.w400),
                ),
              ],
            )
            .animate()
            .fadeIn(delay: 50.ms, duration: 500.ms)
            .slideY(begin: 0.15, end: 0),
          ),
        ],
      ),
    );
  }
}

class _GlowCircle extends StatelessWidget {
  final double size;
  final double opacity;
  const _GlowCircle({required this.size, required this.opacity});
  @override
  Widget build(BuildContext context) => Container(
    width: size,
    height: size,
    decoration: BoxDecoration(
      shape: BoxShape.circle,
      border: Border.all(color: Colors.white.withOpacity(opacity), width: 1.5),
    ),
  );
}

// ═══════════════════════════════════════════════
//  STATS BANNER
// ═══════════════════════════════════════════════
class _StatsBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final stats = [
      {'icon': Icons.inventory_2_rounded, 'value': '50+', 'label': 'Produits', 'color': const Color(0xFF3B82F6)},
      {'icon': Icons.handshake_rounded, 'value': '200+', 'label': 'Artisans', 'color': const Color(0xFF8B5CF6)},
      {'icon': Icons.location_city_rounded, 'value': '23', 'label': 'Gouvernorats', 'color': const Color(0xFF10B981)},
      {'icon': Icons.verified_rounded, 'value': '10+', 'label': 'Ans d\'exp.', 'color': const Color(0xFFF59E0B)},
    ];
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryDark.withOpacity(0.1),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: stats.map((s) => Expanded(
          child: Column(
            children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  color: (s['color'] as Color).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(s['icon'] as IconData, size: 20, color: s['color'] as Color),
              ),
              const SizedBox(height: 6),
              Text(s['value'] as String, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: AppColors.slate900)),
              Text(s['label'] as String, style: const TextStyle(fontSize: 9.5, color: AppColors.slate500, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
            ],
          ),
        )).toList(),
      ),
    );
  }
}

// ═══════════════════════════════════════════════
//  QUICK ACTIONS GRID
// ═══════════════════════════════════════════════
class _QuickActionsGrid extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final actions = [
      {
        'icon': Icons.assignment_outlined,
        'label': 'Diagnostic Technique',
        'color': const Color(0xFF1D4ED8),
        'route': '/diagnostic',
        'bg': const Color(0xFFEFF6FF)
      },
      {
        'icon': Icons.error_outline_rounded,
        'label': 'Réclamation Service',
        'color': const Color(0xFFEF4444),
        'route': '/reclamations',
        'bg': const Color(0xFFFEF2F2)
      },
      {
        'icon': Icons.calendar_today_rounded,
        'label': 'Prendre Rendez-vous',
        'color': const Color(0xFF10B981),
        'route': '/rendezvous',
        'bg': const Color(0xFFECFDF5)
      },
      {
        'icon': Icons.auto_awesome_rounded,
        'label': 'Smart Devis',
        'color': const Color(0xFF7C3AED),
        'route': '/devis',
        'bg': const Color(0xFFF5F3FF)
      },
    ];

    return Row(
      children: actions.asMap().entries.map((entry) {
        final i = entry.key;
        final a = entry.value;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(left: i > 0 ? 8 : 0),
            child: GestureDetector(
              onTap: () => context.push(a['route'] as String),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.slate100),
                  boxShadow: [
                    BoxShadow(
                      color: (a['color'] as Color).withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: (a['color'] as Color).withOpacity(0.08),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Icon(a['icon'] as IconData, size: 26, color: a['color'] as Color),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      a['label'] as String,
                      style: const TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        color: AppColors.slate800,
                        height: 1.2,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                    ),
                  ],
                ),
              ).animate(delay: (i * 100).ms).fadeIn(duration: 400.ms).slideY(begin: 0.1, end: 0),
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ═══════════════════════════════════════════════
//  PROMO BANNER
// ═══════════════════════════════════════════════
class _PromoBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF7C3AED), Color(0xFF4F46E5)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF7C3AED).withOpacity(0.35),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Abstract decoration
          Positioned(right: -10, top: -10,
            child: Container(
              width: 80, height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withOpacity(0.15), width: 2),
              ),
            ),
          ),
          Positioned(right: 20, bottom: -20,
            child: Container(
              width: 50, height: 50,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withOpacity(0.1), width: 1.5),
              ),
            ),
          ),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text('✨ SMART DEVIS IA', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.5)),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Devis Instantané\nen 30 secondes',
                      style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w800, height: 1.25),
                    ),
                    const SizedBox(height: 10),
                    GestureDetector(
                      onTap: () => context.push('/devis'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Text('Essayer maintenant →', style: TextStyle(color: Color(0xFF7C3AED), fontSize: 11, fontWeight: FontWeight.w800)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                width: 70, height: 70,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: Colors.white.withOpacity(0.2)),
                ),
                child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 36),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════
//  SECTION TITLE
// ═══════════════════════════════════════════════
class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(width: 4, height: 18, decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(4))),
        const SizedBox(width: 10),
        Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.slate900, letterSpacing: -0.3)),
      ],
    );
  }
}

// ═══════════════════════════════════════════════
//  PRODUCT PLACEHOLDER
// ═══════════════════════════════════════════════
class _ProductPlaceholder extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
    color: AppColors.slate50,
    child: const Center(child: Icon(Icons.inventory_2_outlined, color: AppColors.slate300, size: 36)),
  );
}

// ═══════════════════════════════════════════════
//  SHIMMER LOADING
// ═══════════════════════════════════════════════
class _ProductsShimmer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      itemCount: 5,
      separatorBuilder: (_, __) => const SizedBox(width: 12),
      itemBuilder: (_, __) => Container(
        width: 148,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
        ),
      ).animate(onPlay: (c) => c.repeat()).shimmer(duration: 1200.ms, color: AppColors.slate100),
    );
  }
}
