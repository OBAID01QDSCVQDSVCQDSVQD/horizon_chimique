import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/widgets/sdk_text_field.dart';

final _devisLoadingProvider = StateProvider<bool>((_) => false);

class DevisScreen extends ConsumerStatefulWidget {
  final String? productName;
  const DevisScreen({super.key, this.productName});

  @override
  ConsumerState<DevisScreen> createState() => _DevisScreenState();
}

class _DevisScreenState extends ConsumerState<DevisScreen> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, String> _data = {};
  
  // Smart Devis State
  int _currentStep = 0;
  String _selectedType = 'Terrasse / Toiture';
  double _surfaceArea = 50.0;
  String _selectedCondition = 'Fissures légères';

  final List<String> _types = ['Terrasse / Toiture', 'Façade', 'Piscine / Bassin', 'Fondation / Sous-sol'];
  final List<String> _conditions = ['Bon état', 'Fissures légères', 'Fortement dégradé (Infiltrations)'];

  @override
  void initState() {
    super.initState();
    if (widget.productName != null) {
      _data['message'] = 'Demande de devis pour : ${widget.productName}';
    }
  }

  // --- CALCULATEUR INTELLIGENT ---
  Map<String, int> _calculateEstimate() {
    double basePrice = 15.0; // TND per m2 base
    
    if (_selectedType == 'Façade') basePrice = 12.0;
    if (_selectedType == 'Piscine / Bassin') basePrice = 25.0;
    if (_selectedType == 'Fondation / Sous-sol') basePrice = 20.0;

    double conditionMulti = 1.0;
    if (_selectedCondition == 'Fissures légères') conditionMulti = 1.3;
    if (_selectedCondition == 'Fortement dégradé (Infiltrations)') conditionMulti = 1.6;

    double total = basePrice * _surfaceArea * conditionMulti;
    
    return {
      'min': (total * 0.9).round(),
      'max': (total * 1.1).round(),
    };
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    final estimate = _calculateEstimate();
    final detailedMessage = '''
Type: $_selectedType
Surface: ${_surfaceArea.round()} m²
État: $_selectedCondition
Estimation App: ${estimate['min']} - ${estimate['max']} TND
---
Message: ${_data['message'] ?? 'Pas de message'}
''';

    ref.read(_devisLoadingProvider.notifier).state = true;
    try {
      await ApiClient.post('/requests', data: {
        'firstName': _data['firstName'],
        'lastName': _data['lastName'],
        'phone': _data['phone'],
        'whatsapp': _data['whatsapp'] ?? _data['phone'],
        'email': _data['email'] ?? '',
        'message': detailedMessage,
        'type': 'devis',
        'projectName': widget.productName ?? 'Smart Devis: $_selectedType',
        'source': 'mobile',
      });

      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle, color: AppColors.success, size: 60),
                const SizedBox(height: 16),
                const Text('Devis Envoyé !', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                const Text('Un expert SDK va vous contacter sous 24h avec une offre finale détaillée.', textAlign: TextAlign.center),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    context.pop();
                  },
                  child: const Text('Retour à l\'accueil'),
                )
              ],
            ),
          )
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'), backgroundColor: AppColors.error));
      }
    } finally {
      ref.read(_devisLoadingProvider.notifier).state = false;
    }
  }

  Widget _buildStepIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
      color: Colors.white,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(3, (index) {
          final isActive = index <= _currentStep;
          return Expanded(
            child: Row(
              children: [
                Container(
                  width: 30, height: 30,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.primary : AppColors.slate200,
                    shape: BoxShape.circle,
                  ),
                  child: Text('${index + 1}', style: TextStyle(color: isActive ? Colors.white : Colors.black54, fontWeight: FontWeight.bold)),
                ),
                if (index < 2) Expanded(child: Container(height: 3, color: isActive && index < _currentStep ? AppColors.primary : AppColors.slate200)),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('1. Quel est votre type de surface ?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
        const SizedBox(height: 16),
        ..._types.map((type) => GestureDetector(
          onTap: () => setState(() => _selectedType = type),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _selectedType == type ? AppColors.primary.withOpacity(0.1) : Colors.white,
              border: Border.all(color: _selectedType == type ? AppColors.primary : AppColors.slate200, width: 2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(
                  type.contains('Toiture') ? Icons.roofing : type.contains('Piscine') ? Icons.pool : Icons.architecture,
                  color: _selectedType == type ? AppColors.primary : Colors.black54,
                ),
                const SizedBox(width: 16),
                Text(type, style: TextStyle(fontSize: 16, fontWeight: _selectedType == type ? FontWeight.bold : FontWeight.normal)),
                const Spacer(),
                if (_selectedType == type) const Icon(Icons.check_circle, color: AppColors.primary),
              ],
            ),
          ),
        )).toList(),
        const SizedBox(height: 24),
        const Text('2. Quelle est la surface estimée ?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.slate200),
          ),
          child: Column(
            children: [
              Text('${_surfaceArea.round()} m²', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.primary)),
              Slider(
                value: _surfaceArea,
                min: 10,
                max: 500,
                divisions: 49,
                activeColor: AppColors.primary,
                onChanged: (val) => setState(() => _surfaceArea = val),
              ),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('10 m²', style: TextStyle(color: Colors.black54)),
                  Text('+500 m²', style: TextStyle(color: Colors.black54)),
                ],
              )
            ],
          ),
        )
      ],
    );
  }

  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Quel est l\'état actuel ?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
        const SizedBox(height: 16),
        ..._conditions.map((cond) => GestureDetector(
          onTap: () => setState(() => _selectedCondition = cond),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _selectedCondition == cond ? AppColors.primary.withOpacity(0.1) : Colors.white,
              border: Border.all(color: _selectedCondition == cond ? AppColors.primary : AppColors.slate200, width: 2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(
                  cond.contains('Bon') ? Icons.thumb_up_outlined : cond.contains('Fissures') ? Icons.water_drop_outlined : Icons.warning_amber_rounded,
                  color: _selectedCondition == cond ? AppColors.primary : Colors.black54,
                ),
                const SizedBox(width: 16),
                Expanded(child: Text(cond, style: TextStyle(fontSize: 16, fontWeight: _selectedCondition == cond ? FontWeight.bold : FontWeight.normal))),
                if (_selectedCondition == cond) const Icon(Icons.check_circle, color: AppColors.primary),
              ],
            ),
          ),
        )).toList(),
      ],
    );
  }

  Widget _buildStep3() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Vos Coordonnées', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 6),
          const Text('Pour vous envoyer le devis détaillé', style: TextStyle(color: Colors.black54)),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(child: SdkTextField(label: 'Prénom *', hint: 'Ahmed', onSaved: (v) => _data['firstName'] = v ?? '', validator: (v) => v!.isEmpty ? 'Requis' : null)),
              const SizedBox(width: 12),
              Expanded(child: SdkTextField(label: 'Nom *', hint: 'Ben Ali', onSaved: (v) => _data['lastName'] = v ?? '', validator: (v) => v!.isEmpty ? 'Requis' : null)),
            ],
          ),
          const SizedBox(height: 14),
          SdkTextField(
            label: 'Téléphone *', hint: '+216 ...',
            keyboardType: TextInputType.phone,
            onSaved: (v) => _data['phone'] = v ?? '',
            validator: (v) => v!.isEmpty ? 'Requis' : null,
          ),
          const SizedBox(height: 14),
          SdkTextField(
            label: 'Email (Facultatif)', hint: 'exemple@mail.com',
            keyboardType: TextInputType.emailAddress,
            onSaved: (v) => _data['email'] = v ?? '',
          ),
          const SizedBox(height: 14),
          SdkTextField(
            label: 'Remarques (Facultatif)',
            hint: 'Ex: Accès difficile...',
            maxLines: 3,
            initialValue: _data['message'],
            onSaved: (v) => _data['message'] = v ?? '',
          ),
        ],
      ),
    );
  }

  void _handleBack() {
    if (_currentStep > 0) {
      setState(() => _currentStep--);
    } else {
      if (context.canPop()) {
        context.pop();
      } else {
        context.go('/');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final loading = ref.watch(_devisLoadingProvider);
    final estimate = _calculateEstimate();

    return PopScope(
      canPop: _currentStep == 0,
      onPopInvoked: (didPop) {
        if (didPop) return;
        _handleBack();
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text('Smart Devis'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded),
            onPressed: _handleBack,
          ),
        ),
        bottomNavigationBar: Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, -2))],
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Estimation :', style: TextStyle(color: Colors.black54, fontSize: 14)),
                  Text('${estimate['min']} - ${estimate['max']} TND', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.primary)),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  if (_currentStep > 0) ...[
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _handleBack,
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          side: const BorderSide(color: AppColors.slate200),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: const Text('Retour', style: TextStyle(color: AppColors.slate700)),
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        if (_currentStep < 2) {
                          setState(() => _currentStep++);
                        } else {
                          if (!loading) _submit();
                        }
                      },
                      child: loading
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : Text(_currentStep < 2 ? 'Continuer' : 'Demander ce Devis', style: const TextStyle(fontSize: 16)),
                    ),
                  ),
                ],
              ),
              if (_currentStep == 0) ...[
                const SizedBox(height: 10),
                TextButton(
                  onPressed: () async {
                     final url = Uri.parse('https://wa.me/21600000000?text=Bonjour, je voudrais un devis.');
                     if (await canLaunchUrl(url)) launchUrl(url, mode: LaunchMode.externalApplication);
                  },
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.chat_rounded, color: Color(0xFF25D366), size: 18),
                      SizedBox(width: 8),
                      Text('Assistance WhatsApp', style: TextStyle(color: Colors.black87)),
                    ],
                  ),
                )
              ],
            ],
          ),
        ),
      ),
      body: Column(
        children: [
          _buildStepIndicator(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _currentStep == 0 ? _buildStep1() : 
                       _currentStep == 1 ? _buildStep2() : _buildStep3(),
              ),
            ),
          ),
        ],
      ),
    ),
   );
  }
}
