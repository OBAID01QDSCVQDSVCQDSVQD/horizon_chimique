import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:open_file_plus/open_file_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../api/api_client.dart';

class UpdateService {
  static Future<void> downloadAndInstall(
    BuildContext context, 
    String apkUrl, 
    Function(double) onProgress
  ) async {
    try {
      // 1. Request Installation Permission
      if (Platform.isAndroid) {
        final status = await Permission.requestInstallPackages.request();
        if (!status.isGranted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Permission de sauvegarde/installation requise.'))
          );
          return;
        }
      }

      // 2. Prepare Path
      final directory = await getExternalStorageDirectory();
      final filePath = "${directory!.path}/sdk_batiment_update.apk";
      
      // Delete old file if exists
      final oldFile = File(filePath);
      if (await oldFile.exists()) {
        await oldFile.delete();
      }

      // 3. Download
      final dio = Dio();
      await dio.download(
        apkUrl,
        filePath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            onProgress(received / total);
          }
        },
      );

      // 4. Open Installer
      final result = await OpenFile.open(filePath);
      if (result.type != ResultType.done) {
         ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Erreur lors de l’ouverture du fichier: ${result.message}'))
         );
      }

    } catch (e) {
      debugPrint("Download Error: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Échec du téléchargement: $e'))
      );
    }
  }
}
