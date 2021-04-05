import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get/get.dart';
import 'package:nozomi_hiragi/responsive.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:websafe_svg/websafe_svg.dart';

class HomePage extends StatelessWidget {
  static const imageSize = 128.0;

  final controller = Get.put(HomeController(Get.isDarkMode));

  @override
  Widget build(BuildContext context) {
    controller.setIcon(Get.isDarkMode);
    final windowWidth = MediaQuery.of(context).size.width;
    final isMobile = Responsive.isMobile(windowWidth);

    final List<Widget> profileCildren = [
      createProfileSet(
        name: 'Nozomi Hiragi',
        image: 'profile_image_en.jpg',
        twitterId: 'nozomi_hilagi',
        isMobile: isMobile,
      ),
      createProfileSet(
        name: 'ひいらぎ のぞみ',
        image: 'profile_image_jp.jpg',
        twitterId: 'nozomi_hiragi',
        isMobile: isMobile,
      ),
      createProfileSet(
        name: '히이라기 노조미',
        image: 'profile_image_ko.jpg',
        twitterId: 'nojomi_hiragi',
        isMobile: isMobile,
      ),
    ];

    return Scaffold(
      body: ListView(
        children: [
          Container(
            color: Colors.purple,
            child: Column(
              children: [
                Header(),
                Center(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Responsive.isMobile(windowWidth)
                        ? Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: profileCildren,
                          )
                        : ConstrainedBox(
                            constraints:
                                BoxConstraints(maxWidth: 1000, minHeight: 300),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceAround,
                              children: profileCildren,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: EdgeInsets.all(16),
            child: Expanded(
              child: Wrap(
                alignment: Responsive.isTablet(windowWidth)
                    ? WrapAlignment.spaceBetween
                    : WrapAlignment.center,
                spacing: 16,
                children: [
                  createAccountButton(
                    FaIcon(FontAwesomeIcons.github),
                    'GitHub',
                    'https://github.com/nozomi-hiragi',
                    isMobile,
                  ),
                  createAccountButton(
                    WebsafeSvg.asset('zenn.svg',
                        color: Theme.of(context).textTheme.bodyText1?.color),
                    'Zenn',
                    'https://zenn.dev/nozomi_hiragi',
                    isMobile,
                  ),
                  createAccountButton(
                    FaIcon(FontAwesomeIcons.blog),
                    'Hatena Blog',
                    'https://nozomi-hiragi.hatenablog.com',
                    isMobile,
                  ),
                  createAccountButton(
                    FaIcon(FontAwesomeIcons.youtube),
                    'Youtube Main',
                    'https://www.youtube.com/channel/UCUWA9qRmV4VScrSaHaNBvog',
                    isMobile,
                  ),
                  createAccountButton(
                    FaIcon(FontAwesomeIcons.youtube),
                    'Youtube Sub',
                    'https://www.youtube.com/channel/UCi5z7odZ5FzDQIMi1pT5q0g',
                    isMobile,
                  ),
                  createAccountButton(
                    FaIcon(FontAwesomeIcons.youtube),
                    'Youtube Programing',
                    'https://www.youtube.com/channel/UC85YUQcdMkWJzHW6CGOhqAQ',
                    isMobile,
                  ),
                  createAccountButton(
                    FaIcon(FontAwesomeIcons.twitch),
                    'Twitch',
                    'https://www.twitch.tv/nozomi_hiragi',
                    isMobile,
                  ),
                  createAccountButton(
                    WebsafeSvg.asset('booth.svg',
                        color: Theme.of(context).textTheme.bodyText1?.color),
                    'BOOTH',
                    'https://nozomi-hiragi.booth.pm',
                    isMobile,
                  ),
                  createAccountButton(
                    WebsafeSvg.asset('pixivfanbox.svg',
                        color: Theme.of(context).textTheme.bodyText1?.color),
                    'PIXIV FANBOX',
                    'https://nozomi-hiragi.booth.pm',
                    isMobile,
                  ),
                  createAccountButton(
                    FaIcon(FontAwesomeIcons.patreon),
                    'Patreon',
                    'https://www.patreon.com/nozomi_hiragi',
                    isMobile,
                  ),
                  createAccountButton(
                    FaIcon(FontAwesomeIcons.amazon),
                    'Amazon.jp Wishlist',
                    'https://www.amazon.co.jp/registry/wishlist/RSOGC7R8DVLP/ref=cm_sw_r_cp_ep_ws_-Y-5Bb04SS5P4',
                    isMobile,
                  ),
                  createAccountButton(
                    FaIcon(FontAwesomeIcons.podcast),
                    'すこラジ',
                    'https://www.youtube.com/channel/UCj4AXmG2ZY97saMsStA5w9w',
                    isMobile,
                  ),
                ],
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
                          ConstrainedBox(
                            constraints: BoxConstraints(maxWidth: 310),
                            child: Card(
                              child: Padding(
                                  padding: const EdgeInsets.all(8),
                                  child: Column(
                                    children: [
                                      Padding(
                                          padding: const EdgeInsets.all(8),
                                          child: Text(
                                            'Programming Language',
                                            style: TextStyle(fontSize: 24),
                                          )),
                                      Wrap(
                                        children: [
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
                                        ]
                                            .map(
                                              (e) => Padding(
                                                padding:
                                                    const EdgeInsets.all(8),
                                                child: Chip(label: Text(e)),
                                              ),
                                            )
                                            .toList(),
                                      ),
                                    ],
                                  )),
                            ),
                          ),
                          ConstrainedBox(
                            constraints: BoxConstraints(maxWidth: 310),
                            child: Card(
                              child: Padding(
                                  padding: const EdgeInsets.all(8),
                                  child: Column(
                                    children: [
                                      Padding(
                                          padding: const EdgeInsets.all(8),
                                          child: Text(
                                            'Framework, SDK',
                                            style: TextStyle(fontSize: 24),
                                          )),
                                      Wrap(
                                        children: [
                                          'Flutter',
                                          'Android',
                                          'Godot',
                                          'DirectX 9',
                                          'DirectX 11',
                                          'DirectX 12',
                                          'Vulkan',
                                          'Node.js',
                                        ]
                                            .map(
                                              (e) => Padding(
                                                padding:
                                                    const EdgeInsets.all(8),
                                                child: Chip(label: Text(e)),
                                              ),
                                            )
                                            .toList(),
                                      ),
                                    ],
                                  )),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  createProfileSet({
    required String name,
    required String image,
    required String twitterId,
    required isMobile,
  }) =>
      Card(
          child: InkWell(
        onTap: () => canLaunch('https://twitter.com/$twitterId').then((can) =>
            can
                ? launch('https://twitter.com/$twitterId')
                : Get.snackbar('Some error: Can\'t open URL',
                    'https://twitter.com/$twitterId')),
        child: Padding(
            padding: const EdgeInsets.all(16),
            child: isMobile
                ? ConstrainedBox(
                    constraints: BoxConstraints(maxWidth: 240),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.max,
                      children: [
                        ClipRRect(
                          borderRadius:
                              BorderRadius.circular(imageSize * 0.5 * 0.7),
                          child: Image.asset(image, height: imageSize * 0.7),
                        ),
                        Column(
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Text(name,
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  )),
                            ),
                            FaIcon(
                              FontAwesomeIcons.twitter,
                              color: Color(0xFF1DA1F2),
                            ),
                          ],
                        ),
                      ],
                    ),
                  )
                : Column(children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(imageSize * 0.5),
                      child: Image.asset(image, height: imageSize),
                    ),
                    SizedBox(height: 8),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          name,
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    FaIcon(
                      FontAwesomeIcons.twitter,
                      color: Color(0xFF1DA1F2),
                    ),
                  ])),
      ));

  createAccountButton(icon, tooltip, url, isMobile) => IconButton(
      icon: icon,
      iconSize: isMobile ? 46 : 64,
      tooltip: tooltip,
      onPressed: () => canLaunch(url).then((can) => can
          ? launch(url)
          : Get.snackbar('Some error: Can\'t open URL', url)));
}

class Header extends GetView<HomeController> {
  const Header({Key? key}) : super(key: key);
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

class HomeController extends GetxController {
  final Rx<IconData> iconData;

  HomeController(bool isDarkMode) : iconData = getIconData(isDarkMode).obs;

  static IconData getIconData(bool isDarkMode) =>
      isDarkMode ? Icons.wb_sunny : Icons.brightness_2;

  setIcon(bool isDarkMode) => iconData.value = getIconData(isDarkMode);
}
