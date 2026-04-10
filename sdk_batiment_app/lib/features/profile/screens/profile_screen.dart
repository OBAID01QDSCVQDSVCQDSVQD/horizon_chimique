import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/api/api_client.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _isLoggedIn = false;
  bool _showOtpInput = false;
  Map<String, dynamic>? _userData;
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool _isLoading = false;

  void _sendOtp() async {
    if (_phoneController.text.isEmpty) return;
    setState(() => _isLoading = true);
    
    try {
      await ApiClient.post('/auth/otp/send', data: {'phone': _phoneController.text});
      if (mounted) {
        setState(() {
          _isLoading = false;
          _showOtpInput = true;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'), backgroundColor: AppColors.error));
      }
    }
  }

  void _verifyOtp() async {
    if (_otpController.text.isEmpty) return;
    setState(() => _isLoading = true);
    
    try {
      final res = await ApiClient.post<Map<String, dynamic>>('/auth/mobile-verify', data: {
        'phone': _phoneController.text,
        'otp': _otpController.text,
      });

      if (res['success'] == true) {
        final prefs = await SharedPreferences.getInstance();
        if (res['token'] != null) {
          await prefs.setString('auth_token', res['token']);
        }
        
        if (mounted) {
          setState(() {
            _isLoading = false;
            _isLoggedIn = true;
            _userData = res['user'];
          });
        }
      } else {
        throw Exception("Invalid response");
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Code invalide ou expiré'), backgroundColor: AppColors.error));
      }
    }
  }

  void _logout() {
    setState(() {
      _isLoggedIn = false;
      _showOtpInput = false;
      _userData = null;
      _phoneController.clear();
      _otpController.clear();
    });
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(_isLoggedIn ? 'Mon Profil' : 'Connexion'),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          if (_isLoggedIn)
            IconButton(
              icon: const Icon(Icons.logout_rounded, color: AppColors.error),
              onPressed: _logout,
            ),
        ],
      ),
      body: _isLoggedIn ? _buildProfileView() : _buildLoginView(),
    );
  }

  Widget _buildLoginView() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.slate100),
            boxShadow: [
              BoxShadow(
                color: AppColors.slate900.withOpacity(0.04),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.lock_person_rounded, size: 64, color: AppColors.primary),
              const SizedBox(height: 16),
              const Text(
                'Espace Partenaire',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.slate900),
              ),
              const SizedBox(height: 8),
              Text(
                _showOtpInput
                    ? 'Saisissez le code reçu par SMS (WinSMS)'
                    : 'Connectez-vous avec votre numéro de téléphone pour gérer vos projets.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, color: AppColors.slate500, height: 1.5),
              ),
              const SizedBox(height: 32),
              
              if (!_showOtpInput) ...[
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Numéro de téléphone', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.slate700)),
                    const SizedBox(height: 6),
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      style: const TextStyle(fontSize: 14, color: AppColors.slate900),
                      decoration: const InputDecoration(
                        hintText: 'Ex: 21 000 000',
                        hintStyle: TextStyle(color: AppColors.slate400, fontSize: 13),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _sendOtp,
                    child: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Recevoir le code SMS'),
                  ),
                ),
              ] else ...[
                TextFormField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 8),
                  maxLength: 6,
                  decoration: InputDecoration(
                    hintText: '000000',
                    counterText: '',
                    filled: true,
                    fillColor: AppColors.slate50,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _verifyOtp,
                    child: _isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Vérifier et se connecter'),
                  ),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: _isLoading ? null : () => setState(() => _showOtpInput = false),
                  child: const Text('Modifier le numéro', style: TextStyle(color: AppColors.slate500)),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileView() {
    final String name = _userData?['name'] ?? 'Artisan Partenaire';
    final String phone = _userData?['phone'] ?? '+216 00 000 000';
    final String company = _userData?['companyName'] ?? '';
    final String rank = _userData?['fidelityRank'] ?? 'Membre';
    final List<dynamic> specializations = _userData?['specializations'] ?? [];
    final String mainSpecialization = specializations.isNotEmpty ? specializations.first.toString().toUpperCase() : 'ARTISAN';
    final String image = _userData?['image'] ?? '';
    final String points = (_userData?['points'] ?? 0).toString();

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // Header
        Row(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primaryLight.withOpacity(0.1),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primaryLight, width: 2),
                image: image.isNotEmpty ? DecorationImage(image: NetworkImage(image), fit: BoxFit.cover) : null,
              ),
              child: image.isEmpty ? const Icon(Icons.person, size: 40, color: AppColors.primary) : null,
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.slate900), maxLines: 1, overflow: TextOverflow.ellipsis),
                  if (company.isNotEmpty) Text(company, style: const TextStyle(fontSize: 14, color: AppColors.slate600, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(phone, style: const TextStyle(fontSize: 14, color: AppColors.slate500)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: Colors.amber.withOpacity(0.2), borderRadius: BorderRadius.circular(4)),
                        child: Text(rank.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.amber.shade700)),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                        child: Text(mainSpecialization, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primary)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 32),
        
        // MON SOLDE FIDELITÉ
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.slate200),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('MON SOLDE FIDELITÉ', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.slate500)),
                  const SizedBox(height: 4),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(points, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: AppColors.slate900)),
                      const SizedBox(width: 4),
                      const Text('PTS', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.primary)),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.account_balance_wallet_outlined, color: AppColors.primary, size: 28),
              ),
            ],
          ),
        ),

        const SizedBox(height: 20),

        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.5,
          children: [
            _DashboardCard(
              title: 'Nouveau Chantier', 
              subtitle: 'Déclarer un achat & gagner', 
              icon: Icons.add_box_outlined, 
              bgColor: Colors.lightBlue.shade500, 
              textColor: Colors.white, 
              iconColor: Colors.white, 
              onTap: () => context.push('/declare-chantier')
            ),
            _DashboardCard(
              title: 'Mes Chantiers', 
              subtitle: 'Historique des déclarations', 
              icon: Icons.construction_outlined, 
              onTap: () {}
            ),
            _DashboardCard(
              title: 'Mes Garanties', 
              subtitle: 'Certificats & Demandes', 
              icon: Icons.verified_user_outlined, 
              onTap: () => context.push('/garanties')
            ),
            _DashboardCard(
              title: 'Smart Devis', 
              subtitle: 'Calculateur intelligent', 
              icon: Icons.calculate_outlined, 
              bgColor: AppColors.slate900, 
              textColor: Colors.white, 
              iconColor: Colors.white54, 
              badge: 'IA',
              onTap: () => context.push('/devis')
            ),
            _DashboardCard(
              title: 'Mon Portfolio', 
              subtitle: 'Galerie de mes projets', 
              icon: Icons.image_outlined, 
              onTap: () => context.go('/realisations')
            ),
            _DashboardCard(
              title: 'Mon Profil', 
              subtitle: 'Paramètres et infos', 
              icon: Icons.account_circle_outlined, 
              onTap: () => context.push('/edit-profile', extra: _userData)
            ),
          ],
        ),
        const SizedBox(height: 40),
      ],
    );
  }
}

class _DashboardCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color bgColor;
  final Color textColor;
  final Color iconColor;
  final String? badge;
  final VoidCallback onTap;

  const _DashboardCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    this.bgColor = Colors.white,
    this.textColor = AppColors.slate900,
    this.iconColor = AppColors.slate400,
    this.badge,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12),
          border: bgColor == Colors.white ? Border.all(color: AppColors.slate200) : null,
          boxShadow: [
            BoxShadow(
              color: AppColors.slate900.withOpacity(0.04),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Flexible(
                        child: Text(
                          title,
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: textColor),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (badge != null) ...[
                        const SizedBox(width: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          decoration: BoxDecoration(color: Colors.blue.shade500, borderRadius: BorderRadius.circular(4)),
                          child: Text(badge!, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.white)),
                        ),
                      ]
                    ],
                  ),
                ),
                const SizedBox(width: 4),
                Icon(icon, color: iconColor, size: 20),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              style: TextStyle(fontSize: 10, color: textColor == Colors.white ? Colors.white70 : AppColors.slate500),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
