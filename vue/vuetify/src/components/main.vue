<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12" class="py-5">
        <a href="https://twitter.com/nozomi_hiragi">
          <v-avatar
            size="82">
              <img
                src="https://pbs.twimg.com/profile_images/1134100458748821509/hHlgs9wt_400x400.jpg"
                alt="twitter icon">
          </v-avatar>
        </a>
      </v-col>

      <v-col
        class="mb-１"
        cols="12">
        <h1 class="display-1 font-weight-bold mb-3">
          ひいらぎのぞみ
        </h1>

        <p class="my-0 subheading font-weight-regular">
          <span class="d-inline-block">ひいらぎのぞみです。</span><span class="d-inline-block">いろんなことしたいししてます。</span>
          <br><span class="d-inline-block">収入がないので、</span><span class="d-inline-block">私にできることあればお仕事待ってます。</span> 
        </p>
      </v-col>

      <v-col
        class="mb-5"
        cols="12"
      >
        <h2 class="headline font-weight-bold mb-3">
          Links
        </h2>

        <v-row justify="center">
          <a
            v-for="(link, i) in links"
            :key="i"
            :href="link.href"
            class="subheading mx-3"
            target="_blank"
          >
            {{ link.text }}
          </a>
        </v-row>
      </v-col>

      <v-col
        class="mb-5"
        cols="12">
        <v-card class="text-left mx-auto" max-width="400">
          <v-treeview
            :items="items"
            open-on-click
            transition>
            <template v-slot:label="{ item }">
              <a v-if="item.link" :href="item.link" target="_blank">
                {{ item.name }}
              </a>
              <div v-else>
                {{ item.name }}
              </div>
          </template>
          </v-treeview>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'HelloWorld',

    data: () => ({
      links: [
        {
          text: 'Twitter JP',
          href: 'https://twitter.com/nozomi_hiragi',
        },
        {
          text: 'Twitter EN',
          href: 'https://twitter.com/nozomi_hilagi',
        },
        {
          text: 'Twitter KR',
          href: 'https://twitter.com/nojomi_hiragi',
        },
        {
          text: 'GitHub',
          href: 'https://github.com/nozomi-hiragi',
        },
        {
          text: 'Twitch',
          href: 'https://www.twitch.tv/nozomi_hiragi',
        },
      ],
      items: [
        {
          id: 1,
          name: 'Blog',
          children: [
            { id: 2, name: 'Hatena Blog', link: 'https://nozomi-hiragi.hatenablog.com/' },
          ],
        },
        {
          id: 3,
          name: 'YouTube',
          children: [
            { id: 4, name: 'nozomi hiragi(Main)', link: 'https://www.youtube.com/channel/UCUWA9qRmV4VScrSaHaNBvog' },
            { id: 5, name: 'Another nozomi hiragi(Sub)', link: 'https://www.youtube.com/channel/UCi5z7odZ5FzDQIMi1pT5q0g' },
          ],
        },
        {
          id: 6,
          name: 'Support',
          children: [
            { id: 7, name: 'Patreon', link: 'https://www.patreon.com/nozomi_hiragi' },
            { id: 8, name: 'FANBOX', link: 'https://www.pixiv.net/fanbox/creator/31684859' },
            { id: 9, name: '干し芋', link: 'https://www.amazon.co.jp/registry/wishlist/RSOGC7R8DVLP/ref=cm_sw_r_cp_ep_ws_-Y-5Bb04SS5P4' },
          ],
        },
        {
          id: 10,
          name: 'BOOTH',
          children: [
            { id: 11, name: 'ひいらぎのぞみ屋', link: 'https://nozomi-hiragi.booth.pm/' },
          ],
        },
        {
          id: 12,
          name: 'Radio',
          children: [
            { id: 13, name: 'すこラジ', link: 'https://www.youtube.com/channel/UCj4AXmG2ZY97saMsStA5w9w' },
          ],
        },
        {
          id: 14,
          name: 'Apps',
          children: [
            { id: 15, name: 'けものの(Android Game App)', link: 'https://play.google.com/store/apps/details?id=com.noxon.kemononofree' },
            { id: 16, name: 'VRCMate', link: 'https://twitter.com/hashtag/VRCMate' },
          ],
        },
        {
          id: 17,
          name: 'Programming',
          children: [
            {
              id: 18,
              name: 'やったことある',
              children: [
                { id: 19, name: 'C++' },
                { id: 20, name: 'Android Java' },
                { id: 21, name: 'Kotlin' },
                { id: 22, name: 'DirectX 9' },
                { id: 23, name: 'DirectX 11' },
                { id: 24, name: 'DirectX 12' },
                { id: 25, name: 'Golang' },
                { id: 26, name: 'Vulkan' },
                { id: 27, name: 'OpenGL' },
                { id: 28, name: 'Python' },
                { id: 29, name: 'C#' },
                { id: 30, name: 'PHP' },
                { id: 31, name: 'Hugo' },
                { id: 32, name: 'Vuetify(これ)' },
              ],
            },
            {
              id: 40,
              name: 'いどんでる',
              children: [
                { id: 41, name: 'Flutter' },
                { id: 42, name: 'Dart' },
                { id: 43, name: 'Rust' },
              ],
            },
            {
              id: 44,
              name: 'やりたい',
              children: [
                { id: 45, name: 'Haskell' },
              ],
            },
            {
              id: 46,
              name: 'ようやらん',
              children: [
                { id: 47, name: 'Objective-C' },
                { id: 48, name: 'Swift' },
              ],
            },
          ],
        },
      ],
    }),
  }
</script>
