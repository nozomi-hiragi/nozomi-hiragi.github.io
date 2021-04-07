import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get/get.dart';
import 'package:nozomi_hiragi/responsive.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:websafe_svg/websafe_svg.dart';

launchUrl(String url) => canLaunch(url).then((can) =>
    can ? launch(url) : Get.snackbar("Some error: Can't open URL", url));

class IconButtonParams {
  final Widget icon;
  final String tooltip;
  final String url;

  const IconButtonParams({
    required this.icon,
    required this.tooltip,
    required this.url,
  });
}

class HomePage extends StatelessWidget {
  final controller = Get.put(HomeController(Get.isDarkMode));

  final iconButtonParams = [
    IconButtonParams(
        icon: FaIcon(FontAwesomeIcons.github),
        tooltip: 'GitHub',
        url: 'https://github.com/nozomi-hiragi'),
    IconButtonParams(
        icon: WebsafeSvg.asset('zenn.svg', color: Color(0xFF3EA8FF)),
        tooltip: 'Zenn',
        url: 'https://zenn.dev/nozomi_hiragi'),
    IconButtonParams(
        icon: WebsafeSvg.asset('hatenablog.svg', color: Colors.black),
        tooltip: 'Hatena Blog',
        url: 'https://nozomi-hiragi.hatenablog.com'),
    IconButtonParams(
        icon: FaIcon(FontAwesomeIcons.youtube, color: Colors.red),
        tooltip: 'Youtube Main',
        url: 'https://www.youtube.com/channel/UCUWA9qRmV4VScrSaHaNBvog'),
    IconButtonParams(
        icon: FaIcon(FontAwesomeIcons.youtube, color: Colors.blue),
        tooltip: 'Youtube Sub',
        url: 'https://www.youtube.com/channel/UCi5z7odZ5FzDQIMi1pT5q0g'),
    IconButtonParams(
        icon: FaIcon(FontAwesomeIcons.youtube, color: Colors.purple),
        tooltip: 'Youtube Programing',
        url: 'https://www.youtube.com/channel/UC85YUQcdMkWJzHW6CGOhqAQ'),
    IconButtonParams(
        icon: FaIcon(FontAwesomeIcons.twitch, color: Color(0xFF6441A5)),
        tooltip: 'Twitch',
        url: 'https://www.twitch.tv/nozomi_hiragi'),
    IconButtonParams(
        icon: WebsafeSvg.asset('booth.svg', color: Color(0xFFFC4D50)),
        tooltip: 'BOOTH',
        url: 'https://nozomi-hiragi.booth.pm'),
    IconButtonParams(
        icon: WebsafeSvg.asset('pixivfanbox.svg', color: Color(0xff000000)),
        tooltip: 'PIXIV FANBOX',
        url: 'https://nozomi-hiragi.booth.pm'),
    IconButtonParams(
        icon: FaIcon(FontAwesomeIcons.patreon, color: Color(0xffF96854)),
        tooltip: 'Patreon',
        url: 'https://www.patreon.com/nozomi_hiragi'),
    IconButtonParams(
        icon: FaIcon(FontAwesomeIcons.amazon, color: Color(0xffE47911)),
        tooltip: 'Amazon.jp Wishlist',
        url:
            'https://www.amazon.co.jp/registry/wishlist/RSOGC7R8DVLP/ref=cm_sw_r_cp_ep_ws_-Y-5Bb04SS5P4'),
    IconButtonParams(
        icon: FaIcon(FontAwesomeIcons.podcast, color: Colors.amber),
        tooltip: 'すこラジ',
        url: 'https://www.youtube.com/channel/UCj4AXmG2ZY97saMsStA5w9w'),
  ];

  Widget buildContentFrame(
      {required String title, required List<Widget> children}) {
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: 310),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(8),
                child: Text(title,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    )),
              ),
              ...children
            ],
          ),
        ),
      ),
    );
  }

  Widget buildChipWrapperFromList(List<String> list) {
    return Wrap(
      children: list
          .map((e) => Padding(
                padding: const EdgeInsets.all(8),
                child: Chip(label: Text(e)),
              ))
          .toList(),
    );
  }

  Widget buildProductWidget({
    required String title,
    required String iconName,
    required String url,
    required List<Widget> children,
  }) {
    return Column(
      children: [
        IconButton(
          icon: Image.asset(
            iconName,
            width: 128,
          ),
          iconSize: 128,
          onPressed: () => launchUrl(url),
        ),
        Padding(
          padding: const EdgeInsets.all(8),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        ...children,
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    controller.setIcon(Get.isDarkMode);
    final windowWidth = MediaQuery.of(context).size.width;
    final isMobile = Responsive.isMobile(windowWidth);
    final isTablet = Responsive.isTablet(windowWidth);

    return Scaffold(
      body: ListView(
        children: [
          Header(isMobile: isMobile),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Expanded(
              child: Wrap(
                alignment: isTablet
                    ? WrapAlignment.spaceBetween
                    : WrapAlignment.center,
                spacing: 16,
                children: iconButtonParams
                    .map((e) => IconButton(
                          icon: e.icon,
                          tooltip: e.tooltip,
                          onPressed: () => launchUrl(e.url),
                          iconSize: isMobile ? 46 : 64,
                        ))
                    .toList(),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: 1000),
                child: Flex(
                  direction: Axis.horizontal,
                  children: [
                    Expanded(
                      child: Wrap(
                        alignment: WrapAlignment.spaceAround,
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          buildContentFrame(
                            title: 'Programming Language',
                            children: [
                              buildChipWrapperFromList([
                                'C++',
                                'Dart',
                                'Java',
                                'Kotlin',
                                'Golang',
                                'Rust',
                                'TypeScript',
                                'JavaScript',
                                'C#',
                                'Python',
                                'PHP',
                              ]),
                            ],
                          ),
                          buildContentFrame(
                            title: 'Framework, SDK',
                            children: [
                              buildChipWrapperFromList([
                                'Flutter',
                                'Android',
                                'Godot',
                                'DirectX 9',
                                'DirectX 11',
                                'DirectX 12',
                                'Vulkan',
                                'Node.js',
                              ]),
                            ],
                          ),
                          buildContentFrame(
                            title: 'Products',
                            children: [
                              buildProductWidget(
                                title: 'VRCMate',
                                iconName: 'icon_vrcmate.png',
                                url: 'https://twitter.com/hashtag/VRCMate',
                                children: [
                                  Text('VRChatのフレンドを確認できるアプリ'),
                                ],
                              ),
                              buildProductWidget(
                                title: 'けものの',
                                iconName: 'icon_kemonono.png',
                                url:
                                    'https://play.google.com/store/apps/details?id=com.noxon.kemononofree',
                                children: [
                                  Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text('Collaborate with '),
                                      TextButton(
                                        onPressed: () => launchUrl(
                                            'https://twitter.com/xvenda85'),
                                        child: Text('NOXvenda85'),
                                      ),
                                    ],
                                  )
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Footer(),
        ],
      ),
    );
  }
}

class HeaderMenu extends GetView<HomeController> {
  const HeaderMenu({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Obx(
          () => IconButton(
            icon: Icon(controller.iconData.value, color: Colors.white),
            onPressed: () => Get.changeThemeMode(
              Get.isDarkMode ? ThemeMode.light : ThemeMode.dark,
            ),
          ),
        ),
      ],
    );
  }
}

class Header extends GetView<HomeController> {
  final bool isMobile;
  final double profileImageSize;

  const Header({Key? key, required this.isMobile})
      : profileImageSize = 128 * (isMobile ? 0.7 : 1.0),
        super(key: key);

  @override
  Widget build(BuildContext context) => Container(
        color: Colors.purple,
        child: Column(
          children: [
            HeaderMenu(),
            Center(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    maxWidth: 1000,
                    minHeight: 300,
                  ),
                  child: Flex(
                    direction: isMobile ? Axis.vertical : Axis.horizontal,
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      createProfileSet(
                        name: 'Nozomi Hiragi',
                        image: 'profile_image_en.jpg',
                        twitterId: 'nozomi_hilagi',
                      ),
                      createProfileSet(
                        name: 'ひいらぎ のぞみ',
                        image: 'profile_image_jp.jpg',
                        twitterId: 'nozomi_hiragi',
                      ),
                      createProfileSet(
                        name: '히이라기 노조미',
                        image: 'profile_image_ko.jpg',
                        twitterId: 'nojomi_hiragi',
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      );

  Widget createProfileSet({
    required String name,
    required String image,
    required String twitterId,
  }) =>
      Card(
        child: InkWell(
          onTap: () => launchUrl('https://twitter.com/$twitterId'),
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: 260),
            child: Flex(
              direction: isMobile ? Axis.horizontal : Axis.vertical,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(profileImageSize),
                    child: Image.asset(image, height: profileImageSize),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    children: [
                      Text(
                        name,
                        style: TextStyle(
                          fontSize: isMobile ? 16 : 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: 8),
                      FaIcon(FontAwesomeIcons.twitter,
                          color: Color(0xFF1DA1F2)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
}

class Footer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text('${DateTime.now().year} Nozomi Hiragi Powered by'),
          TextButton(
            child: Text('Flutter'),
            onPressed: () => launchUrl('https://flutter.dev/'),
          ),
          TextButton(
            child: Text('OSS Lisence'),
            onPressed: () => showLicensePage(
              context: context,
              applicationName: 'GitHub Pages\nNozomi Hiragi',
              applicationLegalese: 'Nozomi Hiragi',
            ),
          ),
        ],
      ),
    );
  }
}

class HomeController extends GetxController {
  final Rx<IconData> iconData;

  HomeController(bool isDarkMode) : iconData = getIconData(isDarkMode).obs;

  static IconData getIconData(bool isDarkMode) =>
      isDarkMode ? Icons.wb_sunny : Icons.brightness_2;

  setIcon(bool isDarkMode) => iconData.value = getIconData(isDarkMode);
}
