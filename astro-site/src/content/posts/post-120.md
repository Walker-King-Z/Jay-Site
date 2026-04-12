---
title: "利用群晖NAS中的Docker配置HomeAssistant"
date: 2022-02-06
slug: "利用群晖nas中的docker配置homeassistant"
categories: ["智能生态"]
tags: []
description: ""
wordpressId: 120
---
### 准备材料

1、准备群晖，进入网站管理界面

### 操作步骤

在群晖套件中心找到“Docker”并安装 打开【Docker】 ，再依次点击【注册表】 -搜索【homeassistant】 -双击图中圈出的【第一项】![ODCA32TYGHT0IC9MEAZYAB.png](/images/2022/02/ODCA32TYGHT0IC9MEAZYAB-1e6b5b8b.png) ![XOSWL1XK553870V.png](/images/2022/02/XOSWL1XK553870V-a376be35.png)

等待下载过程中，前往【File Station】 --左侧文件夹列表找到【docker】 文件夹（你们打开后应该是空的，我因为装了其他Docker所以有其他文件夹）--【新建文件夹】 --命名为【HomeAssistant】 --点击确定 ![4XRA81SU9MJ3PF.png](/images/2022/02/4XRA81SU9MJ3_P_F-438523c4.png)

这样就创建好了一个文件夹，一会会将我们的HomeAssistant安装在这个目录中

等待Docker中的映像下载完成后，打开Docker 【映像】 --右侧找到刚刚下载的并【双击打开】 ![QIZT7WTMH6RBBR.png](/images/2022/02/QI_ZT7WTMH6R____BBR-1b8e5b8d.png)

双击后打开【高级设置】 --勾选【启用自动重新启动】 以在NAS断电重启后自动恢复运行 ![P4HL58JW1RFFBMRCC4.png](/images/2022/02/P4HL58JW1RFFBMRCC4-88ac4701.png)

接着点击【存储空间】 --【添加文件夹】 --找到【docker】 --选择刚刚新建的【HomeAssistant】 --点击【选择】 --装载路径输入【/config】 ![OD8RJ81174BZYQPUIH.png](/images/2022/02/OD8RJ_81174BZYQPUIH-536a268f.png)

选择【网络】 --勾选【使用与Docker Host相同的网络】 ![FA6FIAB0HG45S3IV31CV.png](/images/2022/02/FA6FIAB0HG45S3IV31CV-4efb8cee.png)

然后转到【环境】 ，配置两个变量【如下图所示】--点击【应用】 即可 ![OSKPZRIF4NJWQ50H1.png](/images/2022/02/OSKPZRIF4NJWQ50H1-7e68c0bc.png)

然后会回到【常规设置】 的面板，一路点击【下一步】 --【应用】 即可

再点击Docker左侧的【容器】 ，看到HomeAssistant的那个容器后面是【运行中】 就代表你的Home Assistant在Docker中已经配置好啦！！![PWX509W01K9FCMLF594.png](/images/2022/02/PWX509W01_K9FCMLF594-079252d3.png)

\====================================================================

\====================================================================

然后在浏览器中使用的你NAS的IP地址后面加上端口8123进行访问

（假设我的NAS IP地址是192.168.1.5，那我就应该访问【192.168.1.5:8123】，记住一定是英文冒号 ！！）

打开网址后会让你注册一个账号，这第一个注册的就是你的超级管理员账号了。

这样，你的HomeAssistant已经基本设置完毕了~~~~
