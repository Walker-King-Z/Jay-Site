---
title: "更改U盘图标 强制更改U盘名称"
date: 2022-05-02
slug: "更改u盘图标-强制更改u盘名称"
categories: ["搞机技巧"]
tags: []
description: ""
wordpressId: 150
---
## 准备材料：

1：一个图片，作为你的图标

2：格式工厂（[官网下载](http://www.pcgeshi.com/) 或 [我的阿里云盘](https://www.aliyundrive.com/s/wp8nJ1zAaDN))

3：一个U盘

4：一个Windows电脑

## 操作步骤：

#### 分步骤一：转换图片格式

1、打开格式工厂（本次演示使用的是5.11.0），找到图片一栏中转换 **“->ICO”** 部分，点击打开

2、点击中央添加文件（建议提前将图片裁剪为1:1的矩形），然后点击右下角确定

3、点击左上角开始，等待完成后到2小步左下角的输出文件夹中找到输出的图片文件

![步骤一 <1>.png](/images/2022/05/image-bf946d12.png)

![步骤一 <2>.png](/images/2022/05/image-d4d75c2d.png)

![步骤一 <3>.png](/images/2022/05/image-f0c3f63f.png)

#### 分步骤二：配置U盘部分

1、打开你的U盘根目录

2、将图片复制至**根目录**（建议使用.ico）

3、新建一个txt文档，输入以下内容

```
; Created by Walker-King
; https://walker-king.cloud
[autorun]
icon=文件名.ico
label = 取的名字
```

代码中的中文均需替换；代码头两行是注释行，可删除，也可更改为你的自定义句子。列如：（我的图片输出后名字是Destination，我想把我的U盘命名为“W-King的U盘”）

![步骤二 <3>.png](/images/2022/05/image-ed26dec0.png)

4、点击 **“文件”** —> **“另存为”** 另存文件为【autorun.inf】**（注意：另存为的路径也必须是U盘的根目录）**

![步骤二 <4>.png](/images/2022/05/%E6%AD%A5%E9%AA%A4%E4%BA%8C4-839ec3a4.png)

5、最后将你的ico图片也复制到U盘的**根目录**下即可。

6、弹出U盘，重新插入U盘，完工~
