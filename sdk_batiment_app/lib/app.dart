import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'core/constants/app_colors.dart';
import 'features/home/screens/home_screen.dart';
import 'features/products/screens/products_screen.dart';
import 'features/products/screens/product_detail_screen.dart';
import 'features/devis/screens/devis_screen.dart';
import 'features/devis/screens/diagnostic_screen.dart';
import 'features/realisations/screens/realisations_screen.dart';
import 'features/artisans/screens/artisans_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'shared/widgets/bottom_nav.dart';
import 'features/profile/screens/declare_chantier_screen.dart';
import 'features/profile/screens/garanties_screen.dart';
import 'features/profile/screens/edit_profile_screen.dart';
import 'shared/widgets/app_updater.dart';

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) => ScaffoldWithNav(navigationShell: navigationShell),
      branches: [
        StatefulShellBranch(routes: [GoRoute(path: '/', builder: (c, s) => const HomeScreen())]),
        StatefulShellBranch(routes: [GoRoute(path: '/products', builder: (c, s) => const ProductsScreen())]),
        StatefulShellBranch(routes: [GoRoute(path: '/realisations', builder: (c, s) => const RealisationsScreen())]),
        StatefulShellBranch(routes: [GoRoute(path: '/artisans', builder: (c, s) => const ArtisansScreen())]),
        StatefulShellBranch(routes: [GoRoute(path: '/profile', builder: (c, s) => const ProfileScreen())]),
      ],
    ),
    GoRoute(
      path: '/products/:id',
      builder: (c, s) => ProductDetailScreen(id: s.pathParameters['id']!),
    ),
    GoRoute(
      path: '/devis',
      builder: (c, s) => DevisScreen(
        productName: s.uri.queryParameters['product'],
      ),
    ),
    GoRoute(
      path: '/diagnostic',
      builder: (c, s) => const DiagnosticScreen(),
    ),
    GoRoute(
      path: '/declare-chantier',
      builder: (c, s) => const DeclareChantierScreen(),
    ),
    GoRoute(
      path: '/garanties',
      builder: (c, s) => const GarantiesScreen(),
    ),
    GoRoute(
      path: '/edit-profile',
      builder: (c, s) => EditProfileScreen(userData: s.extra as Map<String, dynamic>?),
    ),
  ],
);

class SdkBatimentApp extends StatelessWidget {
  const SdkBatimentApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'SDK BATIMENT',
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
      builder: (context, child) {
        return AppUpdater(child: child!);
      },
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          surface: AppColors.surface,
          background: AppColors.background,
        ),
        fontFamily: 'Inter',
        scaffoldBackgroundColor: AppColors.background,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: AppColors.slate900,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            fontFamily: 'Inter',
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.slate900,
          ),
          iconTheme: IconThemeData(color: AppColors.slate700),
        ),
        cardTheme: CardTheme(
          color: AppColors.cardBg,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: AppColors.slate200),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: const TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700, fontSize: 14),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.slate50,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.slate200),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.slate200),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          labelStyle: const TextStyle(color: AppColors.slate500, fontFamily: 'Inter'),
        ),
      ),
    );
  }
}
