<template>
  <v-app>
    <v-app-bar
      app
      >
      <v-toolbar-title>ひいらぎのぞみ</v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn
        href="https://nozomi-hiragi.hatenablog.com/"
        target="_blank"
        text
        >
        <span class="mr-2">Hatena Blog</span>
        <v-icon>mdi-post-outline</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <Main/>
    </v-main>
  </v-app>
</template>

<script>
import Main from './components/main';

export default {
  name: 'App',

  components: {
    Main,
  },

  data: () => ({
    //
  }),
};
</script>
