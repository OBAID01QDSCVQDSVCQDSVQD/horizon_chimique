import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/widgets/sdk_text_field.dart';

class DeclareChantierScreen extends StatefulWidget {
  const DeclareChantierScreen({super.key});

  @override
  State<DeclareChantierScreen> createState() => _DeclareChantierScreenState();
}

class _DeclareChantierScreenState extends State<DeclareChantierScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      await Future.delayed(const Duration(seconds: 1)); // Simulate API

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Chantier déclaré avec succès !'), backgroundColor: Colors.green),
        );
        context.pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Déclarer un chantier'),
        leading: BackButton(onPressed: () => context.pop()),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppColors.primaryLight.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: AppColors.primary),
                    SizedBox(width: 12),
                    Expanded(child: Text("Les informations du client recevront un SMS de vérification avec lien vers le devis.", style: TextStyle(color: AppColors.primary, fontSize: 13))),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              const Text('Informations du Client', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.slate900)),
              const SizedBox(height: 16),
              SdkTextField(label: 'Nom du client', validator: (v) => v!.isEmpty ? 'Requis' : null, onSaved: (v) {}),
              const SizedBox(height: 16),
              SdkTextField(label: 'Numéro de téléphone', hint: 'Ex: 21 000 000', keyboardType: TextInputType.phone, validator: (v) => v!.isEmpty ? 'Requis' : null, onSaved: (v) {}),
              const SizedBox(height: 24),
              const Text('Détails du Chantier', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.slate900)),
              const SizedBox(height: 16),
              SdkTextField(label: 'Surface estimée (m²)', keyboardType: TextInputType.number, validator: (v) => v!.isEmpty ? 'Requis' : null, onSaved: (v) {}),
              const SizedBox(height: 16),
              SdkTextField(label: 'Localisation', hint: 'Gouvernorat, Ville...', validator: (v) => v!.isEmpty ? 'Requis' : null, onSaved: (v) {}),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('Envoyer la déclaration'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
