module.exports = {
  extends: ['react-app'], // 继承react官方规则
  parserOptions: {
    Options: {
      babelOptions: {
        presets: [
          // 解决页面报错问题
          ['babel-preset-react-app', false],
          'babel-preset-react-app/prod'
        ]
      }
    }
  }
}
