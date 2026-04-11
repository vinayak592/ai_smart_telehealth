import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../services/api_service.dart';

class BillingScreen extends StatefulWidget {
  const BillingScreen({super.key});

  @override
  State<BillingScreen> createState() => _BillingScreenState();
}

class _BillingScreenState extends State<BillingScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final List<_ServiceInvoiceItem> _items = [
    _ServiceInvoiceItem(name: 'Doctor Consultation', price: 500, qty: 0),
    _ServiceInvoiceItem(name: 'Lab Test', price: 1200, qty: 0),
    _ServiceInvoiceItem(name: 'Medicine Supply', price: 700, qty: 0),
    _ServiceInvoiceItem(name: 'X-Ray', price: 400, qty: 0),
    _ServiceInvoiceItem(name: 'CT Scan', price: 2500, qty: 0),
    _ServiceInvoiceItem(name: 'Ultrasound', price: 800, qty: 0),
    _ServiceInvoiceItem(name: 'ECG', price: 300, qty: 0),
    _ServiceInvoiceItem(name: 'Blood Pressure Check', price: 50, qty: 0),
    _ServiceInvoiceItem(name: 'Vaccination', price: 250, qty: 0),
    _ServiceInvoiceItem(name: 'Nursing Care (per day)', price: 1000, qty: 0),
  ];

  List<Map<String, dynamic>> _billHistory = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadBillHistory();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadBillHistory() async {
    try {
      final bills = await ApiService().getBills();
      setState(() {
        _billHistory = bills;
      });
    } catch (e) {
      // Fallback to local storage if backend fails
      final prefs = await SharedPreferences.getInstance();
      final billsJson = prefs.getStringList('bills') ?? [];
      setState(() {
        _billHistory = billsJson
            .map((bill) => jsonDecode(bill) as Map<String, dynamic>)
            .toList();
      });
    }
  }

  Future<void> _saveBill(String billData, int total) async {
    final selectedItems = _items
        .where((item) => item.qty > 0)
        .map((item) => {'name': item.name, 'qty': item.qty, 'price': item.price})
        .toList();

    try {
      await ApiService().saveBill(selectedItems, total.toDouble());
      _loadBillHistory();
    } catch (e) {
      // Fallback to local storage if backend fails
      final prefs = await SharedPreferences.getInstance();
      final billEntry = {
        'date': DateTime.now().toString(),
        'amount': total,
        'details': billData,
      };
      final bills = prefs.getStringList('bills') ?? [];
      bills.add(jsonEncode(billEntry));
      await prefs.setStringList('bills', bills);
      _loadBillHistory();
    }
  }

  int get _total => _items.fold(0, (sum, item) => sum + (item.qty * item.price));

  void _updateQty(int index, int qty) {
    setState(() {
      _items[index].qty = qty;
    });
  }

  void _finalizeBill() {
    final billDetails = _items
        .where((item) => item.qty > 0)
        .map((item) => '${item.name} x${item.qty} = ₹${item.qty * item.price}')
        .join('\n');

    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Bill Generated'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(billDetails),
              const Divider(),
              Text('Total: ₹$_total', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              Text('Date: ${DateTime.now().toString().split('.')[0]}', style: const TextStyle(fontSize: 12)),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              _saveBill(billDetails, _total);
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Bill saved successfully!')),
              );
              // Reset items
              for (final item in _items) {
                item.qty = 0;
              }
              setState(() {});
            },
            child: const Text('Save Bill'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Billing & Invoice'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Generate Bill'),
            Tab(text: 'Bill History'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Generate Bill Tab
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Select services:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Expanded(
                  child: ListView.builder(
                    itemCount: _items.length,
                    itemBuilder: (context, index) {
                      final item = _items[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 6),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                                    Text('₹${item.price}', style: const TextStyle(color: Colors.grey)),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.remove_circle_outline),
                                    onPressed: () {
                                      if (item.qty > 0) _updateQty(index, item.qty - 1);
                                    },
                                  ),
                                  Text(item.qty.toString(), style: const TextStyle(fontSize: 18)),
                                  IconButton(
                                    icon: const Icon(Icons.add_circle_outline),
                                    onPressed: () => _updateQty(index, item.qty + 1),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.teal[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text('₹$_total', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.teal)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _total > 0 ? _finalizeBill : null,
                    child: const Text('Generate Invoice'),
                  ),
                ),
              ],
            ),
          ),
          // Bill History Tab
          ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _billHistory.length,
            itemBuilder: (context, index) {
              final bill = _billHistory[_billHistory.length - 1 - index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const Icon(Icons.receipt, color: Colors.teal),
                  title: Text('Bill #${_billHistory.length - index}'),
                  subtitle: Text(bill['date'].toString().split('.')[0]),
                  trailing: Text(
                    '₹${bill['amount']}',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.teal),
                  ),
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: Text('Bill #${_billHistory.length - index}'),
                        content: SingleChildScrollView(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(bill['details']),
                              const Divider(),
                              Text('Total: ₹${bill['amount']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              Text('Date: ${bill['date'].toString().split('.')[0]}'),
                            ],
                          ),
                        ),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Close'),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _ServiceInvoiceItem {
  final String name;
  final int price;
  int qty;

  _ServiceInvoiceItem({required this.name, required this.price, required this.qty});
}
