import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  static const String baseUrl = 'https://horizon-chimique.fly.dev/api';

  static final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ))
    ..interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    )
    ..interceptors.add(LogInterceptor(
      requestBody: false,
      responseBody: false,
      logPrint: (o) => print('[API] $o'),
    ));

  static Dio get instance => _dio;

  static Future<T> get<T>(
    String path, {
    Map<String, dynamic>? params,
    T Function(dynamic)? fromJson,
  }) async {
    final res = await _dio.get(path, queryParameters: params);
    if (fromJson != null) return fromJson(res.data);
    return res.data as T;
  }

  static Future<T> post<T>(
    String path, {
    required Map<String, dynamic> data,
    T Function(dynamic)? fromJson,
  }) async {
    final res = await _dio.post(path, data: data);
    if (fromJson != null) return fromJson(res.data);
    return res.data as T;
  }

  static Future<T> delete<T>(
    String path, {
    T Function(dynamic)? fromJson,
  }) async {
    final res = await _dio.delete(path);
    if (fromJson != null) return fromJson(res.data);
    return res.data as T;
  }

  static Future<T> put<T>(
    String path, {
    Map<String, dynamic>? data,
    T Function(dynamic)? fromJson,
  }) async {
    final res = await _dio.put(path, data: data);
    if (fromJson != null) return fromJson(res.data);
    return res.data as T;
  }
}
