---
title: "Linux常用命令（22-06-12更新）"
date: 2022-06-12
slug: "linux常用命令（22-06-12更新）"
categories: ["未分类"]
tags: []
description: ""
wordpressId: 195
---
## 相关

本文主要介绍CentOS的相关指令，指令整理自互联网，由我的各种项目中使用情况摘录的

## 指令介绍

1、清屏指令，例 `[admin@localhost ~]$ alias dir='ls -l'` `[admin@localhost ~]$ dir`

2、查看ssh是否安装 `rpm -qa | grep ssh`

3、重启ssh服务 `systemctl restart sshd`

4、开启/禁止 ssh服务开机自启 `systemctl enable sshd` 开启自启动 `systemctl disable sshd` 禁止自启动

5、查看服务器IP信息（二选一） `ipcomfig'` ip addr'
