import 'package:flutter/material.dart';

class Responsive extends StatelessWidget {
  final Widget mobile;
  final Widget tablet;
  final Widget desktop;

  const Responsive({
    Key? key,
    required this.mobile,
    required this.tablet,
    required this.desktop,
  }) : super(key: key);

  static bool isMobile(double width) => width < 650;

  static bool isTablet(double width) => width < 900 && width >= 650;

  static bool isDesktop(double width) => width >= 900;

  static bool isMobileFromContext(BuildContext context) =>
      isMobile(MediaQuery.of(context).size.width);

  static bool isTabletFromContext(BuildContext context) =>
      isTablet(MediaQuery.of(context).size.width);

  static bool isDesktopFromContext(BuildContext context) =>
      isDesktop(MediaQuery.of(context).size.width);

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (isDesktop(constraints.maxWidth))
          return desktop;
        else if (isMobile(constraints.maxWidth))
          return mobile;
        else
          return tablet;
      },
    );
  }
}
