# 使用说明
`i18n`统一放在一起，按语言分隔打包，减少首屏代码体积
如果以后翻译文件存在后台数据库，也可以很方便的切换

默认namespace是`common`，
其他模块只需新建`模块名.json`，就可以使用
```javascript
i18n.getFixedT(null, '模块名')
```

**不需要修改`index.js`**

