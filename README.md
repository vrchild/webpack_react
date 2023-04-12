1.  初始化环境npm init -y

####
1.  npm i eslint-webpack-plugin html-webpack-plugin less-loader sass-loader stylus-loader style-loader css-loader postcss-preset-env postcss-loader -D
2.  npm i babel-loader @babel/core babel-preset-react-app eslint-config-react-app -D
3.  npm i webpack-dev-server webpack webpack-cli -D
4.  npm i react react-dom

#### react,html热更新
1.  npm install -D @pmmmwh/react-refresh-webpack-plugin react-refresh
2.  CopyPlugin public 下的静态文件复制打包到dist
