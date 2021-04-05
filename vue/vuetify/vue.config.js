module.exports = {
  publicPath: "/",
  outputDir: '../docs',
  "transpileDependencies": [
    "vuetify"
  ],
  pages: {
    index: {
     entry: 'src/main.js',
     template: 'public/index.html',
      title: 'Nozomi Hiragi',
    }
  }
}