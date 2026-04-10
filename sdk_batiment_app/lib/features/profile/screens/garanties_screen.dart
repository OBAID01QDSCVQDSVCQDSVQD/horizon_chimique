import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';

class GarantiesScreen extends StatelessWidget {
  const GarantiesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Mes Demandes de Garantie'),
        leading: BackButton(onPressed: () => context.pop()),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: TextButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.add, color: Colors.white, size: 18),
              label: const Text('Nouvelle Demande', style: TextStyle(color: Colors.white)),
              style: TextButton.styleFrom(
                backgroundColor: Colors.lightBlue.shade400,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Demandez des certificats de garantie pour vos chantiers réalisés.",
              style: TextStyle(color: AppColors.slate500, fontSize: 13),
            ),
            const SizedBox(height: 24),
            _buildGarantieCard(
              clientInfo: "Pro construction TABOUBI",
              chantier: "Maison Nadia Chaouchi , Chaouach Mjadz El Bab Beja",
              duree: "10 Ans",
              visites: "3 visite(s)",
            ),
            const SizedBox(height: 16),
            _buildGarantieCard(
              clientInfo: "Mohamed Ben Brahim",
              chantier: "Non spécifié",
              duree: "10 Ans",
              visites: "3 visite(s)",
            ),
            const SizedBox(height: 16),
            _buildGarantieCard(
              clientInfo: "mahmoud mahmoud vv",
              chantier: "Non spécifié",
              duree: "10 Ans",
              visites: "3 visite(s)",
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGarantieCard({
    required String clientInfo,
    required String chantier,
    required String duree,
    required String visites,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.slate200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.blue.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: const Icon(Icons.description_outlined, color: Colors.blue, size: 20),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.green.withOpacity(0.1), borderRadius: BorderRadius.circular(20)),
                child: const Row(
                  children: [
                    Icon(Icons.check_circle_outline, color: Colors.green, size: 14),
                    SizedBox(width: 4),
                    Text("Validée", style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  clientInfo,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.slate900),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const Icon(Icons.edit_outlined, color: AppColors.slate400, size: 18),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            "Chantier: $chantier",
            style: const TextStyle(color: AppColors.slate500, fontSize: 13),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Durée:", style: TextStyle(color: AppColors.slate500, fontSize: 13)),
              Text(duree, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.slate900, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Visites de contrôle:", style: TextStyle(color: AppColors.slate500, fontSize: 13)),
              Text(visites, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.slate900, fontSize: 13)),
            ],
          ),
          const SizedBox(height: 8),
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Prochaine:", style: TextStyle(color: AppColors.slate400, fontSize: 12)),
              Text("Invalid Date", style: TextStyle(color: AppColors.slate400, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: Colors.lightBlue.shade400),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              child: Text("Télécharger le Certificat", style: TextStyle(color: Colors.lightBlue.shade500, fontWeight: FontWeight.bold)),
            ),
          )
        ],
      ),
    );
  }
}
