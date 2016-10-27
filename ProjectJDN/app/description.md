# static 目录

- 没有通过 `webpack` 打包的资源目录，编译时会自动 `copy` 到 `dist` 目录
- 开发环境 `server` 会监听这个目录，启动访问权限，如 `http://localhost:3000/(sso|browser|kindEditorPlugins)`
