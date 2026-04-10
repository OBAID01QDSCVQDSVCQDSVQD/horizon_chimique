import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/widgets/sdk_text_field.dart';

final _loadingProvider = StateProvider<bool>((ref) => false);

class DiagnosticScreen extends ConsumerStatefulWidget {
  const DiagnosticScreen({super.key});

  @override
  ConsumerState<DiagnosticScreen> createState() => _DiagnosticScreenState();
}

class _DiagnosticScreenState extends ConsumerState<DiagnosticScreen> {
  final _formKey = GlobalKey<FormState>();
  final _picker = ImagePicker();
  
  // Form Data
  String _address = '';
  double? _surface;
  String _phone = '';
  String _description = '';
  List<DateTime> _availabilities = [DateTime.now().add(const Duration(days: 1))];
  List<XFile> _images = [];

  // Map state
  GoogleMapController? _mapController;
  LatLng _lastPosition = const LatLng(36.8065, 10.1815); // Tunis default

  Future<void> _pickImage() async {
    if (_images.length >= 5) return;
    final List<XFile> picked = await _picker.pickMultiImage();
    if (picked.isNotEmpty) {
      setState(() {
        _images.addAll(picked);
        if (_images.length > 5) _images = _images.sublist(0, 5);
      });
    }
  }

  void _addAvailability() {
    setState(() {
      _availabilities.add(DateTime.now().add(Duration(days: _availabilities.length + 1)));
    });
  }

  void _removeAvailability(int index) {
    if (_availabilities.length <= 1) return;
    setState(() => _availabilities.removeAt(index));
  }

  Future<void> _selectDateTime(int index) async {
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: _availabilities[index],
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (pickedDate != null) {
      final TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_availabilities[index]),
      );
      if (pickedTime != null) {
        setState(() {
          _availabilities[index] = DateTime(
            pickedDate.year,
            pickedDate.month,
            pickedDate.day,
            pickedTime.hour,
            pickedTime.minute,
          );
        });
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    ref.read(_loadingProvider.notifier).state = true;
    try {
      // Mock upload for now or real logic if API exists
      final List<String> imageUrls = [];
      // In real app, we would upload to /api/upload first
      
      final payload = {
        'type': 'diagnostic',
        'phone': _phone,
        'surface': _surface?.toString(),
        'message': _description,
        'location': {
          'address': _address,
          'lat': _lastPosition.latitude,
          'lng': _lastPosition.longitude,
        },
        'times': _availabilities.map((e) => e.toIso8601String()).toList(),
        'source': 'mobile',
      };

      await ApiClient.post('/requests', data: payload);

      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            icon: const Icon(Icons.check_circle, color: AppColors.success, size: 48),
            title: const Text('Demande Envoyée'),
            content: const Text('Votre demande de diagnostic technique a été bien reçue. Un expert vous contactera bientôt.'),
            actions: [
              TextButton(onPressed: () { Navigator.pop(ctx); context.pop(); }, child: const Text('OK')),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'), backgroundColor: AppColors.error));
      }
    } finally {
      ref.read(_loadingProvider.notifier).state = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(_loadingProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.assignment_outlined, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 12),
            const Text('Diagnostic Technique'),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.close), onPressed: () => context.pop()),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Demandez une visite technique. Remplissez les détails du chantier.',
                style: TextStyle(color: AppColors.slate500, fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 24),

              // Lieu du chantier
              const Text('Lieu du chantier', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.slate800)),
              const SizedBox(height: 12),
              TextFormField(
                onChanged: (v) => _address = v,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.search, color: AppColors.slate400),
                  hintText: 'Rechercher ma ville ou adresse...',
                  hintStyle: const TextStyle(fontSize: 13, color: AppColors.slate400),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.slate200)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.slate200)),
                ),
              ),
              const SizedBox(height: 12),
              Container(
                height: 180,
                decoration: BoxDecoration(
                  color: AppColors.slate50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.slate100),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Theme.of(context).platform == TargetPlatform.windows 
                    ? Container(
                        color: Colors.blue.withOpacity(0.05),
                        child: const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.map_outlined, color: AppColors.primary, size: 40),
                              SizedBox(height: 8),
                              Text('Carte active sur Mobile (Android/iOS)', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                            ],
                          ),
                        ),
                      )
                    : Stack(
                        children: [
                          GoogleMap(
                            initialCameraPosition: CameraPosition(target: _lastPosition, zoom: 12),
                            onMapCreated: (c) => _mapController = c,
                            onCameraMove: (pos) => _lastPosition = pos.target,
                            myLocationButtonEnabled: false,
                            zoomControlsEnabled: false,
                          ),
                          const Center(child: Icon(Icons.location_on, color: AppColors.primary, size: 36)),
                          Positioned(
                            bottom: 12, right: 12,
                            child: FloatingActionButton.small(
                              onPressed: () {}, // Current location logic
                              backgroundColor: Colors.white,
                              child: const Icon(Icons.my_location, color: AppColors.primary),
                            ),
                          ),
                        ],
                      ),
                ),
              ),
              const SizedBox(height: 24),

              // Surface & WhatsApp side by side
              Row(
                children: [
                  Expanded(
                    child: SdkTextField(
                      label: 'Surface (m²)',
                      hint: 'Ex: 120',
                      keyboardType: TextInputType.number,
                      onSaved: (v) => _surface = double.tryParse(v ?? ''),
                      validator: (v) => v!.isEmpty ? 'Requis' : null,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: SdkTextField(
                      label: 'WhatsApp',
                      hint: '+216...',
                      keyboardType: TextInputType.phone,
                      onSaved: (v) => _phone = v ?? '',
                      validator: (v) => v!.isEmpty ? 'Requis' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Disponibilités
              const Text('Disponibilités (Choix multiple)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.slate800)),
              const SizedBox(height: 12),
              ..._availabilities.asMap().entries.map((entry) {
                final i = entry.key;
                final date = entry.value;
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => _selectDateTime(i),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                            decoration: BoxDecoration(
                              color: AppColors.slate50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.slate200),
                            ),
                            child: Row(
                              children: [
                                Text(
                                  DateFormat('dd/MM/yyyy HH:mm').format(date),
                                  style: const TextStyle(fontSize: 14, color: AppColors.slate700),
                                ),
                                const Spacer(),
                                const Icon(Icons.calendar_today, size: 16, color: AppColors.slate400),
                              ],
                            ),
                          ),
                        ),
                      ),
                      if (_availabilities.length > 1) ...[
                        const SizedBox(width: 8),
                        IconButton(icon: const Icon(Icons.remove_circle_outline, color: Colors.red), onPressed: () => _removeAvailability(i)),
                      ],
                    ],
                  ),
                );
              }).toList(),
              TextButton.icon(
                onPressed: _addAvailability,
                icon: const Icon(Icons.plus_one, size: 18),
                label: const Text('Ajouter un créneau'),
                style: TextButton.styleFrom(foregroundColor: AppColors.primary),
              ),
              const SizedBox(height: 24),

              // Description
              SdkTextField(
                label: 'Description du problème',
                hint: 'Décrivez les infiltrations, l\'état de la surface...',
                maxLines: 4,
                onSaved: (v) => _description = v ?? '',
                validator: (v) => v!.isEmpty ? 'Requis' : null,
              ),
              const SizedBox(height: 24),

              // Photos
              const Text('Photos (Optionnel - Max 5)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.slate800)),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10, runSpacing: 10,
                children: [
                  ..._images.asMap().entries.map((e) => Stack(
                    children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.file(File(e.value.path), width: 80, height: 80, fit: BoxFit.cover),
                      ),
                      Positioned(
                        top: 0, right: 0,
                        child: GestureDetector(
                          onTap: () => setState(() => _images.removeAt(e.key)),
                          child: Container(color: Colors.black54, child: const Icon(Icons.close, color: Colors.white, size: 16)),
                        ),
                      ),
                    ],
                  )),
                  if (_images.length < 5)
                    GestureDetector(
                      onTap: _pickImage,
                      child: Container(
                        width: 80, height: 80,
                        decoration: BoxDecoration(
                          color: AppColors.slate50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.slate200, style: BorderStyle.none),
                        ),
                        child: const Icon(Icons.add_a_photo_outlined, color: AppColors.slate400),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: 40),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isLoading ? null : _submit,
                  style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                  child: isLoading 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Envoyer la demande'),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
