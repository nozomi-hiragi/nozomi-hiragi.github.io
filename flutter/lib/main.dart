import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:nozomi_hiragi/pages/home_page.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => GetMaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Nozomi Hiragi',
        theme: ThemeData.light().copyWith(primaryColor: Colors.purple),
        darkTheme: ThemeData.dark().copyWith(primaryColor: Colors.purple),
        home: HomePage(),
      );
}
