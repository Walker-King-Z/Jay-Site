---
title: "记录关于解决YOURLS系统移动部署后出现404的方法"
date: 2024-08-04
slug: "记录关于解决yourls系统移动部署后出现404的方法"
categories: ["搞机技巧"]
tags: ["404", "YOURLS", "伪静态"]
description: "宝塔面板迁移过后，YOURLS 项目的构建错误"
wordpressId: 407
---
### 问题描述

当迁移完YOURLS数据库和网页文件后，出现管理界面可以访问、短链新增与删除均正常、数据库连接正常，但唯独使用短链访问时候出现404页面。

在后续的了解中，发现问题其实是出在伪静态的配置上

### 解决方法

在宝塔面板中，网站信息点开，配置伪静态：

```
location / {
    try_files $uri $uri/ /yourls-loader.php?$args;
}
```

#### 参考文献

[使用宝塔安装 YOURLS 搭建短链接服务 - 字节时代](https://byteage.com/195.html)
