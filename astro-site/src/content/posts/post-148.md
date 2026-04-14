---
title: "HomeAssistant 加载项商店界面空的解决方法"
date: 2022-04-09
slug: "homeassistant-加载项商店界面空的解决方法"
categories: ["搞机技巧", "智能生态", "软件教程"]
tags: ["HACS", "HA", "HomeAssistant"]
description: "解决 HA 加载项商店 HACS 为空的问题"
wordpressId: 148
---
我是用虚拟机安装HomeAssistant OS过后想安装HACS，准备使用命令安装，但是加载项中并未看到SSH的插件，研究了一个下午过后发现，只需要在加载项商店的右上角，点击“仓库Repo”——添加一个新的库：

```
https://github.com/hassio-addons/repository
```

添加完成过后就会看到熟悉的加载项界面了： ![添加之前.png](/images/2022/04/image-eec6c4e5.png)

![添加之后.png](/images/2022/04/image-2caf224f.png)
