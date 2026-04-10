// lib/features/artisans/screens/artisans_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/artisans_provider.dart';
import '../data/artisan_model.dart';
import '../../../core/constants/app_colors.dart';

class ArtisansScreen extends ConsumerWidget {
  const ArtisansScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final artisansAsync = ref.watch(artisansProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Nos Artisans Partenaires'),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: artisansAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              const Text('Impossible de charger les partenaires.'),
              ElevatedButton(
                onPressed: () => ref.refresh(artisansProvider),
                child: const Text('Réessayer'),
              ),
            ],
          ),
        ),
        data: (list) => ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: list.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, i) => _ArtisanCard(artisan: list[i]),
        ),
      ),
    );
  }
}

class _ArtisanCard extends StatelessWidget {
  final Artisan artisan;
  const _ArtisanCard({required this.artisan});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.slate100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Profile Image
          CircleAvatar(
            radius: 30,
            backgroundColor: AppColors.slate100,
            backgroundImage: artisan.image != null ? CachedNetworkImageProvider(artisan.image!) : null,
            child: artisan.image == null ? const Icon(Icons.person, color: AppColors.slate400) : null,
          ),
          const SizedBox(width: 16),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  artisan.displayName,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.slate900),
                ),
                if (artisan.companyName != null && artisan.companyName!.isNotEmpty)
                  Text(
                    artisan.name,
                    style: const TextStyle(fontSize: 12, color: AppColors.slate500),
                  ),
                const SizedBox(height: 8),
                const Row(
                  children: [
                    Icon(Icons.star_rounded, size: 14, color: Colors.amber),
                    SizedBox(width: 4),
                    Text('Artisan Distributeur Agreé', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primary)),
                  ],
                ),
              ],
            ),
          ),
          // Actions
          IconButton(
            onPressed: () => _callArtisan(artisan.phone),
            icon: const Icon(Icons.phone_in_talk_rounded, color: AppColors.success),
            style: IconButton.styleFrom(backgroundColor: AppColors.success.withOpacity(0.1)),
          ),
        ],
      ),
    );
  }

  void _callArtisan(String? phone) async {
    if (phone == null) return;
    final Uri url = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(url)) await launchUrl(url);
  }
}
