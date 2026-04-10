// lib/features/realisations/screens/realisations_screen.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_client.dart';
import '../providers/realisations_provider.dart';
import '../data/realisation_model.dart';
import '../../../core/constants/app_colors.dart';

class RealisationsScreen extends ConsumerStatefulWidget {
  const RealisationsScreen({super.key});

  @override
  ConsumerState<RealisationsScreen> createState() => _RealisationsScreenState();
}

class _RealisationsScreenState extends ConsumerState<RealisationsScreen> {
  @override
  void initState() {
    super.initState();
    timeago.setLocaleMessages('fr', timeago.FrMessages());
  }

  @override
  Widget build(BuildContext context) {
    final realisationsAsync = ref.watch(realisationsProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F5), // Facebook exact background color
      appBar: AppBar(
        title: const Text('Réalisations', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 22, color: AppColors.slate900)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        centerTitle: false,
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: Colors.grey.shade200, shape: BoxShape.circle),
              child: const Icon(Icons.search, color: Colors.black87, size: 20),
            ),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: realisationsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Erreur: $e')),
        data: (list) => ListView.separated(
          padding: const EdgeInsets.symmetric(vertical: 8),
          itemCount: list.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (ctx, i) => _FacebookPostCard(realisation: list[i]),
        ),
      ),
    );
  }
}

class _FacebookPostCard extends ConsumerStatefulWidget {
  final Realisation realisation;
  const _FacebookPostCard({required this.realisation});

  @override
  ConsumerState<_FacebookPostCard> createState() => _FacebookPostCardState();
}

class _FacebookPostCardState extends ConsumerState<_FacebookPostCard> {
  bool isLiked = false;
  late int likesCount;
  late int commentsCount;
  bool _isOwner = false;

  @override
  void initState() {
    super.initState();
    likesCount = widget.realisation.likes;
    commentsCount = widget.realisation.comments;
    _checkOwnership();
  }

  Future<void> _checkOwnership() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    if (token == null || widget.realisation.artisanId == null) return;
    
    try {
      final parts = token.split('.');
      if (parts.length == 3) {
        String payloadBase64 = parts[1];
        String normalized = payloadBase64.replaceAll('-', '+').replaceAll('_', '/');
        switch (normalized.length % 4) {
          case 0: break;
          case 2: normalized += '=='; break;
          case 3: normalized += '='; break;
          default: return; // Invalid base64
        }
        final String decoded = utf8.decode(base64Url.decode(normalized));
        final Map<String, dynamic> payload = json.decode(decoded); // Requires dart:convert
        
        final String? userId = payload['id'] ?? payload['_id'];
        final String? role = payload['role'];
        
        if (mounted && userId != null) {
          setState(() {
            _isOwner = (userId == widget.realisation.artisanId) || (role == 'admin');
          });
        }
      }
    } catch(e) {
      // Ignore decoding errors gracefully
    }
  }

  Future<void> _toggleLike() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    
    if (token == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Veuillez vous connecter pour aimer ce projet.')),
        );
        context.push('/profile');
      }
      return;
    }

    setState(() {
      isLiked = !isLiked;
      likesCount += isLiked ? 1 : -1;
    });
    try {
      final res = await ApiClient.post('/realisations/${widget.realisation.id}/like', data: {});
      setState(() {
         likesCount = res['likesCount'] ?? likesCount;
         isLiked = res['isLiked'] ?? isLiked;
      });
    } catch(e) {
      setState(() {
        isLiked = !isLiked;
        likesCount += isLiked ? 1 : -1;
      });
    }
  }

  Future<void> _deletePost() async {
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer la publication'),
        content: const Text('Êtes-vous sûr de vouloir supprimer cette réalisation ? Cette action est irréversible.'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Annuler')),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Supprimer', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final res = await ApiClient.delete('/realizations/${widget.realisation.id}');
      if (res['success'] == true) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Publication supprimée avec succès')));
          // Refresh list
          ref.refresh(realisationsProvider);
        }
      }
    } catch(e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Action refusée: Vous n\'êtes pas l\'auteur de cette publication.'),
          backgroundColor: Colors.red,
        ));
      }
    }
  }

  void _share() {
    final String shareUrl = 'https://sdkbatiment.com/realisations/${widget.realisation.id}';
    Share.share('Découvrez cette réalisation exceptionnelle par ${widget.realisation.artisanName} : $shareUrl');
  }

  void _showComments() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _CommentsBottomSheet(
        realisationId: widget.realisation.id,
        onCommentAdded: () => setState(() => commentsCount++),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.realisation;
    final timeStr = r.createdAt != null 
        ? timeago.format(r.createdAt!, locale: 'fr') 
        : 'Récemment';

    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Post Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: AppColors.slate200,
                  backgroundImage: r.artisanAvatar != null 
                      ? CachedNetworkImageProvider(r.artisanAvatar!) 
                      : null,
                  child: r.artisanAvatar == null 
                      ? const Icon(Icons.person, color: Colors.white) 
                      : null,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        r.artisanName,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.black87),
                      ),
                      Row(
                        children: [
                          Text(
                            timeStr,
                            style: const TextStyle(color: Colors.black54, fontSize: 13),
                          ),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 4),
                            child: Icon(Icons.circle, size: 3, color: Colors.black54),
                          ),
                          const Icon(Icons.public, size: 12, color: Colors.black54),
                        ],
                      ),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_horiz, color: Colors.black54),
                  onSelected: (value) {
                    if (value == 'copy') {
                      _share();
                    } else if (value == 'report') {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Publication signalée. Merci pour votre retour.')),
                      );
                    } else if (value == 'edit') {
                      showModalBottomSheet(
                        context: context,
                        isScrollControlled: true,
                        backgroundColor: Colors.transparent,
                        builder: (ctx) => _EditPostBottomSheet(
                          realisation: widget.realisation,
                          onEditComplete: () => ref.refresh(realisationsProvider),
                        ),
                      );
                    } else if (value == 'delete') {
                      _deletePost();
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'copy',
                      child: Row(
                        children: [
                          Icon(Icons.link, size: 20, color: Colors.black87),
                          SizedBox(width: 10),
                          Text('Partager le lien'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'report',
                      child: Row(
                        children: [
                          Icon(Icons.flag_outlined, size: 20, color: Colors.black87),
                          SizedBox(width: 10),
                          Text('Signaler la publication'),
                        ],
                      ),
                    ),
                    if (_isOwner) const PopupMenuDivider(),
                    if (_isOwner) const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit, size: 20, color: Colors.black87),
                          SizedBox(width: 10),
                          Text('Modifier (Auteur)'),
                        ],
                      ),
                    ),
                    if (_isOwner) const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete, size: 20, color: Colors.red),
                          SizedBox(width: 10),
                          Text('Supprimer (Auteur)', style: TextStyle(color: Colors.red)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Post Body (Text)
          if (r.title.isNotEmpty || r.description != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    r.title,
                    style: const TextStyle(fontSize: 15, color: Colors.black87, fontWeight: FontWeight.w600),
                  ),
                  if (r.description != null && r.description!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      r.description!,
                      style: const TextStyle(fontSize: 15, color: Colors.black87),
                    ),
                  ],
                  if (r.location != null) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 16, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                          r.location!,
                          style: const TextStyle(fontSize: 14, color: AppColors.primary, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 12),
                ],
              ),
            ),

          // Post Images
          if (r.images.isNotEmpty)
            _buildPostImages(r.images),

          // Post Stats (Likes & Comments counts)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(color: AppColors.primaryLight, shape: BoxShape.circle),
                  child: const Icon(Icons.thumb_up, size: 12, color: Colors.white),
                ),
                const SizedBox(width: 6),
                Text(
                  '$likesCount',
                  style: const TextStyle(color: Colors.black54, fontSize: 13),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: _showComments,
                  child: Text(
                    '$commentsCount commentaires',
                    style: const TextStyle(color: Colors.black54, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 1, thickness: 1, color: Color(0xFFE5E7EB)),

          // Post Actions (Like, Comment, Share)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: Row(
              children: [
                _buildActionButton(
                  icon: isLiked ? Icons.thumb_up : Icons.thumb_up_outlined,
                  label: 'J\'aime',
                  color: isLiked ? AppColors.primary : Colors.black54,
                  onTap: _toggleLike,
                ),
                _buildActionButton(
                  icon: Icons.chat_bubble_outline,
                  label: 'Commenter',
                  color: Colors.black54,
                  onTap: _showComments,
                ),
                _buildActionButton(
                  icon: Icons.share_outlined,
                  label: 'Partager',
                  color: Colors.black54,
                  onTap: _share,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({required IconData icon, required String label, required Color color, required VoidCallback onTap}) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(4),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 6),
              Text(label, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }

  void _showImageFullScreen(List<String> allImages, int initialIndex) {
    int currentIndex = initialIndex;
    final pageController = PageController(initialPage: initialIndex);

    showDialog(
      context: context,
      useSafeArea: false,
      barrierColor: Colors.black,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return Scaffold(
              backgroundColor: Colors.black,
              body: Stack(
                children: [
                  PageView.builder(
                    itemCount: allImages.length,
                    controller: pageController,
                    onPageChanged: (index) {
                      setDialogState(() => currentIndex = index);
                    },
                    itemBuilder: (context, index) {
                      return InteractiveViewer(
                        minScale: 0.8,
                        maxScale: 4.0,
                        child: CachedNetworkImage(
                          imageUrl: allImages[index],
                          fit: BoxFit.contain,
                          placeholder: (context, url) => const Center(child: CircularProgressIndicator()),
                          errorWidget: (context, url, error) => const Icon(Icons.broken_image, color: Colors.white),
                        ),
                      );
                    },
                  ),
                  
                  // Top overlay (Close button and counter)
                  Positioned(
                    top: 40,
                    left: 0,
                    right: 0,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${currentIndex + 1} / ${allImages.length}',
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.white, size: 30),
                            onPressed: () => Navigator.of(ctx).pop(),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Desktop/Web Navigation Arrows
                  if (allImages.length > 1) ...[
                    if (currentIndex > 0)
                      Positioned(
                        left: 16,
                        top: 0,
                        bottom: 0,
                        child: Center(
                          child: IconButton(
                            icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 30),
                            onPressed: () => pageController.previousPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut),
                          ),
                        ),
                      ),
                    if (currentIndex < allImages.length - 1)
                      Positioned(
                        right: 16,
                        top: 0,
                        bottom: 0,
                        child: Center(
                          child: IconButton(
                            icon: const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 30),
                            onPressed: () => pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut),
                          ),
                        ),
                      ),
                  ],
                ],
              ),
            );
          }
        );
      },
    );
  }

  Widget _buildPostImages(List<String> images) {
    if (images.length == 1) {
      return GestureDetector(
        onTap: () => _showImageFullScreen(images, 0),
        child: CachedNetworkImage(
          imageUrl: images[0],
          fit: BoxFit.cover,
          width: double.infinity,
          height: 300,
          placeholder: (_, __) => Container(height: 300, color: AppColors.slate100),
        ),
      );
    } else if (images.length == 2) {
      return Row(
        children: [
          Expanded(child: GestureDetector(onTap: () => _showImageFullScreen(images, 0), child: _img(images[0], 250))),
          const SizedBox(width: 2),
          Expanded(child: GestureDetector(onTap: () => _showImageFullScreen(images, 1), child: _img(images[1], 250))),
        ],
      );
    } else {
      return Column(
        children: [
          GestureDetector(onTap: () => _showImageFullScreen(images, 0), child: _img(images[0], 250)),
          const SizedBox(height: 2),
          Row(
            children: [
              Expanded(child: GestureDetector(onTap: () => _showImageFullScreen(images, 1), child: _img(images[1], 150))),
              const SizedBox(width: 2),
              Expanded(
                child: GestureDetector(
                  onTap: () => _showImageFullScreen(images, 2),
                  child: SizedBox(
                    height: 150,
                    child: Stack(
                      children: [
                        Positioned.fill(child: _img(images[2], 150)),
                        if (images.length > 3)
                          Positioned.fill(
                            child: Container(
                              color: Colors.black45,
                              alignment: Alignment.center,
                              child: Text('+${images.length - 3}', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          )
        ],
      );
    }
  }

  Widget _img(String url, double height) {
    try {
      return CachedNetworkImage(
        imageUrl: url,
        fit: BoxFit.cover,
        height: height,
        width: double.infinity,
        placeholder: (_, __) => Container(color: AppColors.slate100, height: height),
        errorWidget: (_, __, ___) => Container(color: AppColors.slate100, height: height, child: const Icon(Icons.broken_image, color: Colors.grey)),
      );
    } catch(e) {
      return Container(color: AppColors.slate100, height: height);
    }
  }
}

// ═══════════════════════════════════════════════
//  COMMENTS BOTTOM SHEET
// ═══════════════════════════════════════════════
class _CommentsBottomSheet extends StatefulWidget {
  final String realisationId;
  final VoidCallback onCommentAdded;

  const _CommentsBottomSheet({required this.realisationId, required this.onCommentAdded});

  @override
  State<_CommentsBottomSheet> createState() => _CommentsBottomSheetState();
}

class _CommentsBottomSheetState extends State<_CommentsBottomSheet> {
  final TextEditingController _controller = TextEditingController();
  List<dynamic> _comments = [];
  bool _isLoading = true;
  bool _isPosting = false;

  @override
  void initState() {
    super.initState();
    _fetchComments();
  }

  Future<void> _fetchComments() async {
    try {
      final res = await ApiClient.get<Map<String, dynamic>>('/comments?realizationId=${widget.realisationId}');
      if (res['success'] == true) {
        setState(() {
          _comments = res['data'] ?? [];
          _isLoading = false;
        });
      }
    } catch(e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _postComment() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');

    if (token == null) {
      if (mounted) {
        Navigator.pop(context); // Close bottom sheet
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Veuillez vous connecter pour commenter.')),
        );
        context.push('/profile');
      }
      return;
    }

    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() => _isPosting = true);
    // Optimistic UI
    final tempComment = {
      '_id': DateTime.now().toIso8601String(),
      'content': text,
      'createdAt': DateTime.now().toIso8601String(),
      'user': {
        'name': 'Vous',
        'image': null
      }
    };
    setState(() {
      _comments.insert(0, tempComment);
      _controller.clear();
    });
    widget.onCommentAdded();

    try {
      await ApiClient.post('/comments', data: {
        'realizationId': widget.realisationId,
        'content': text
      });
    } catch(e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e'), backgroundColor: Colors.red),
        );
      }
      setState(() {
        _comments.removeAt(0);
        _controller.text = text;
      });
    } finally {
      setState(() => _isPosting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Drag handle and Title
          Container(
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Column(
              children: [
                Container(
                  width: 40, height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                ),
                const Text('Commentaires', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
          ),
          
          // Comments List
          Expanded(
            child: _isLoading 
                ? const Center(child: CircularProgressIndicator())
                : _comments.isEmpty 
                    ? const Center(child: Text('Soyez le premier à commenter !', style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic)))
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        physics: const BouncingScrollPhysics(),
                        itemCount: _comments.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 16),
                        itemBuilder: (ctx, i) {
                          final c = _comments[i];
                          final user = c['user'] ?? {};
                          final avatarUrl = user['image'];
                          return Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              CircleAvatar(
                                radius: 18,
                                backgroundColor: AppColors.slate200,
                                backgroundImage: avatarUrl != null ? CachedNetworkImageProvider(avatarUrl) : null,
                                child: avatarUrl == null ? Text((user['name'] ?? 'U')[0].toUpperCase(), style: const TextStyle(color: AppColors.slate600, fontWeight: FontWeight.bold, fontSize: 16)) : null,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: AppColors.slate50,
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(user['name'] ?? 'Utilisateur', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                          const SizedBox(height: 4),
                                          Text(c['content'] ?? '', style: const TextStyle(fontSize: 14, color: AppColors.slate800, height: 1.3)),
                                        ],
                                      ),
                                    ),
                                    Padding(
                                      padding: const EdgeInsets.only(left: 12, top: 4),
                                      child: Text(
                                        c['createdAt'] != null ? timeago.format(DateTime.parse(c['createdAt']), locale: 'fr') : 'À l\'instant',
                                        style: const TextStyle(color: AppColors.slate500, fontSize: 11),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          );
                        },
                      ),
          ),
          
          // Input Area
          Container(
            padding: EdgeInsets.only(
              left: 16, right: 16, top: 12, 
              // Adapt to keyboard
              bottom: MediaQuery.of(context).viewInsets.bottom + 16
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      hintText: 'Écrivez un commentaire...',
                      hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
                      filled: true,
                      fillColor: AppColors.slate50,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    maxLines: null,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _postComment(),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _isPosting ? null : _postComment,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: _isPosting 
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                        : const Icon(Icons.send_rounded, color: AppColors.primary, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════
//  EDIT POST BOTTOM SHEET
// ═══════════════════════════════════════════════
class _EditPostBottomSheet extends StatefulWidget {
  final Realisation realisation;
  final VoidCallback onEditComplete;

  const _EditPostBottomSheet({required this.realisation, required this.onEditComplete});

  @override
  State<_EditPostBottomSheet> createState() => _EditPostBottomSheetState();
}

class _EditPostBottomSheetState extends State<_EditPostBottomSheet> {
  late TextEditingController _titleController;
  late TextEditingController _descController;
  late TextEditingController _locController;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.realisation.title);
    _descController = TextEditingController(text: widget.realisation.description);
    _locController = TextEditingController(text: widget.realisation.location);
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    _locController.dispose();
    super.dispose();
  }

  Future<void> _saveChanges() async {
    if (_titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Le titre est requis.')));
      return;
    }
    setState(() => _isSaving = true);
    try {
      final res = await ApiClient.put('/realizations/${widget.realisation.id}', data: {
        'title': _titleController.text.trim(),
        'description': _descController.text.trim(),
        'location': _locController.text.trim(),
      });
      if (res['success'] == true && mounted) {
        Navigator.pop(context);
        widget.onEditComplete();
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Modifications enregistrées !')));
      }
    } catch(e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Modifier la publication', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _titleController,
            decoration: const InputDecoration(labelText: 'Titre du projet', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _descController,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Description', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _locController,
            decoration: const InputDecoration(labelText: 'Lieu', border: OutlineInputBorder(), prefixIcon: Icon(Icons.location_on)),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: _isSaving ? null : _saveChanges,
            child: _isSaving 
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Enregistrer', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
