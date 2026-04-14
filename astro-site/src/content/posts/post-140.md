---
title: "以管理员身份运行PowerShell（提升PowerShell权限为管理员权限）"
date: 2022-03-12
slug: "以管理员身份运行powershell（提升powershell权限为管理员权限）"
categories: ["搞机技巧", "资料库"]
tags: ["Powershell", "管理员权限"]
description: "如果需要管理员权限的 PowerShell 就可以用此方法提权"
wordpressId: 140
---
第1步： 同时按下Windows + R键以弹出“运行”对话框。 第2步： 在框中键入PowerShell，然后单击OK(确定)按钮。 普通的Windows PowerShell将以当前用户身份启动。 第3步： 键入命令start-process PowerShell -verb runas，然后按“enter”键。 此时就能看到已经变成管理员窗口了 （如果想要更改操作路径可以使用“cd X:\\xxx”的命令)

```
start-process PowerShell -verb runas
```
