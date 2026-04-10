import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../core/api/api_client.dart';
import '../../core/services/update_service.dart';

class AppUpdater extends StatefulWidget {
  final Widget child;
  const AppUpdater({super.key, required this.child});

  @override
  State<AppUpdater> createState() => _AppUpdaterState();
}

class _AppUpdaterState extends State<AppUpdater> {
  // VERSION ACTUELLE DE L'APPLICATION
  int _currentBuildNumber = 0; 

  bool _needsUpdate = false;
  bool _isDownloading = false;
  double _downloadProgress = 0.0;
  String _updateMessage = '';
  String _updateUrl = '';

  @override
  void initState() {
    super.initState();
    _checkForUpdates();
  }

  Future<void> _checkForUpdates() async {
    try {
      final PackageInfo packageInfo = await PackageInfo.fromPlatform();
      _currentBuildNumber = int.tryParse(packageInfo.buildNumber) ?? 0;
      
      final res = await ApiClient.get('/app-version');
      final int serverBuildNumber = res['buildNumber'] ?? 1;
      
      if (serverBuildNumber > _currentBuildNumber && res['forceUpdate'] == true) {
        if (mounted) {
          setState(() {
            _needsUpdate = true;
            _updateMessage = res['updateMessage'] ?? res['message'] ?? 'Une mise à jour est requise.';
            _updateUrl = res['downloadUrl'] ?? '';
          });
        }
      }
    } catch(e) {
      debugPrint('AppUpdater Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_needsUpdate) {
      return widget.child;
    }

    return Directionality(
      textDirection: TextDirection.ltr,
      child: Material(
        color: Colors.white,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.system_update_rounded, color: Colors.blue, size: 80),
                const SizedBox(height: 24),
                const Text('Mise à jour requise', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black87)),
                const SizedBox(height: 16),
                Text(_updateMessage, textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, color: Colors.black54)),
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      backgroundColor: Colors.blue,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _isDownloading ? null : () async {
                       setState(() {
                         _isDownloading = true;
                         _downloadProgress = 0.0;
                       });

                       await UpdateService.downloadAndInstall(
                         context, 
                         _updateUrl, 
                         (progress) {
                            if (mounted) setState(() => _downloadProgress = progress);
                         }
                       );

                       if (mounted) setState(() => _isDownloading = false);
                    },
                    child: _isDownloading 
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)),
                            const SizedBox(width: 15),
                            Text("${(_downloadProgress * 100).toInt()}%", style: const TextStyle(color: Colors.white)),
                          ],
                        )
                      : const Text('Télécharger et Installer', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
