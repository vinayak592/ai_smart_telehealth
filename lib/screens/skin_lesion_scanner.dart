import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../services/skin_lesion_scanner_service.dart';

class SkinLesionScannerScreen extends StatefulWidget {
  const SkinLesionScannerScreen({super.key});

  @override
  State<SkinLesionScannerScreen> createState() => _SkinLesionScannerScreenState();
}

class _SkinLesionScannerScreenState extends State<SkinLesionScannerScreen> {
  final ImagePicker _picker = ImagePicker();
  final SkinLesionScannerService _scannerService = SkinLesionScannerService();
  XFile? _selectedImage;
  Uint8List? _selectedBytes;
  SkinLesionAnalysisResult? _analysisResult;
  bool _isAnalyzing = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _scannerService.loadModel();
  }

  @override
  void dispose() {
    _scannerService.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(source: source);
      if (image != null) {
        final bytes = await image.readAsBytes();
        setState(() {
          _selectedImage = image;
          _selectedBytes = bytes;
          _analysisResult = null;
          _error = null;
        });
      }
    } catch (e) {
      setState(() => _error = 'Failed to pick image: $e');
    }
  }

  Future<void> _analyzeImage() async {
    if (_selectedImage == null) return;

    setState(() {
      _isAnalyzing = true;
      _error = null;
    });

    try {
      final result = await _scannerService.analyzeImage(_selectedImage!);
      setState(() => _analysisResult = result);
    } catch (e) {
      setState(() => _error = 'Analysis failed: $e');
    } finally {
      setState(() => _isAnalyzing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Skin Lesion Scanner'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'AI-Powered Skin Analysis',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Take a clear photo of your skin lesion for AI analysis. This is not a substitute for professional medical advice.',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _pickImage(ImageSource.camera),
                    icon: const Icon(Icons.camera),
                    label: const Text('Take Photo'),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _pickImage(ImageSource.gallery),
                    icon: const Icon(Icons.photo_library),
                    label: const Text('Choose from Gallery'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            if (_selectedImage != null) ...[
              const Text(
                'Selected Image:',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: _selectedBytes != null
                      ? Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.memory(_selectedBytes!, fit: BoxFit.cover),
                            if (_analysisResult != null)
                              Positioned.fill(
                                child: CustomPaint(
                                  painter: ARHighlightPainter(),
                                ),
                              ),
                          ],
                        )
                      : const SizedBox.shrink(),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isAnalyzing ? null : _analyzeImage,
                  child: _isAnalyzing
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Analyze Image'),
                ),
              ),
            ],
            if (_analysisResult != null) ...[
              const SizedBox(height: 24),
              const Text(
                'Analysis Result:',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Card(
                elevation: 4,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.warning, color: Colors.orange),
                          const SizedBox(width: 8),
                          Text(
                            'Risk Level: ${_analysisResult!.riskLevel}',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Confidence: ${(_analysisResult!.confidence * 100).toStringAsFixed(1)}%',
                        style: const TextStyle(fontSize: 16),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _analysisResult!.recommendation,
                        style: const TextStyle(fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error, color: Colors.red),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _error!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '⚠️ Medical Disclaimer',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'This AI analysis is for informational purposes only and should not replace professional medical diagnosis. Always consult with a qualified healthcare provider for medical concerns.',
                    style: TextStyle(fontSize: 14, color: Colors.blue),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ARHighlightPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.greenAccent.withOpacity(0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3;

    // Simulate an AR bounding box targeting a lesion
    final rect = Rect.fromCenter(
      center: Offset(size.width / 2, size.height / 2),
      width: 100,
      height: 100,
    );
    canvas.drawRect(rect, paint);

    // Corner brackets for AR feel
    final bracketPaint = Paint()
      ..color = Colors.cyanAccent
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;
    
    const double len = 15;
    // Top-left
    canvas.drawLine(rect.topLeft, rect.topLeft + const Offset(len, 0), bracketPaint);
    canvas.drawLine(rect.topLeft, rect.topLeft + const Offset(0, len), bracketPaint);
    // Top-right
    canvas.drawLine(rect.topRight, rect.topRight + const Offset(-len, 0), bracketPaint);
    canvas.drawLine(rect.topRight, rect.topRight + const Offset(0, len), bracketPaint);
    // Bottom-left
    canvas.drawLine(rect.bottomLeft, rect.bottomLeft + const Offset(len, 0), bracketPaint);
    canvas.drawLine(rect.bottomLeft, rect.bottomLeft + const Offset(0, -len), bracketPaint);
    // Bottom-right
    canvas.drawLine(rect.bottomRight, rect.bottomRight + const Offset(-len, 0), bracketPaint);
    canvas.drawLine(rect.bottomRight, rect.bottomRight + const Offset(0, -len), bracketPaint);

    // Text label
    final textPainter = TextPainter(
      text: const TextSpan(
        text: 'Area: 4.2cm² | Redness: +12%',
        style: TextStyle(color: Colors.cyanAccent, fontSize: 12, fontWeight: FontWeight.bold, backgroundColor: Colors.black45),
      ),
      textDirection: TextDirection.ltr,
    );
    textPainter.layout();
    textPainter.paint(canvas, Offset(rect.left, rect.top - 20));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}