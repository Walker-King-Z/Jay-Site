---
title: "【最详细】树莓派3B+安装Win10（Win11）桌面ARM版"
date: 2022-02-06
slug: "【最详细】树莓派3b安装win10（win11）桌面arm版"
categories: ["搞机技巧", "智能生态"]
tags: []
description: ""
wordpressId: 116
---
### 一、资源参考

1、[How to install | Windows on Raspberry (worproject.ml)](https://www.worproject.ml/guides/how-to-install) 2、[UUP dump](https://uupdump.net/)

### 二、作者实操

先在**“[资源1](https://www.worproject.ml/guides/how-to-install)”网址** 中选择你现在的桌面系统（我用的是Windows，所以选择“I have a Windows machine”）然后在下方找到“**Prerequisites** ”栏目，点击下方的“[Windows on Raspberry imager](https://www.worproject.ml/downloads#windows-on-raspberry-imager)”

点击“**Download version x.x.x** ”，会下载第一个压缩包——“WoR\_Release\_x.x.x”，这个是镜像写卡的软件，暂且先留着 ![屏幕截图20211106235502.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-06-235502-152ad8c5.jpg)

![屏幕截图202111062355022.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-06-235502-2-1482ff0e.jpg)

![屏幕截图202111062355021.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-06-235502-1-5b1df0e8.jpg)

然后翻到网页最底部，找到“**Windows images** ”，点击下方的“[Getting Windows Images](https://www.worproject.ml/guides/getting-windows-images)”

在新跳转的页面中，能直接看到子标题“**Downloading an ISO image using UUPDump** ”，点击下方第一个步骤中的链接“[](https://uupdump.net/)[https://uupdump.net](https://uupdump.net/)”（这其实就是我上面文章开头的链接“[资源2](https://uupdump.net/)”）

然后在这个页面里有许多种镜像下载的选择，我建议选择“**公开发布的最新内部版本** ”，你也可以在下方找Win10的文件，但是**无论如何选择，都一定要选择arm64架构的！！！**

如果不去做其他选择的话，就直接点击“**快速选项** ”第一行右边的“**arm64** ”就好，接着便会跳转到“**来自服务器的响应** ”页面

如果有多个更新，那就直接选择**最上面的** 一个就好，跳转后在选择语言界面，应该默认是“中文（简体）”，直接单击下一步

注意在这个页面，最好**只选择“Windows Pro”** ，否则你的下载量会变大几番

最后会到最终的一个页面“**来自你所选择版本的摘要** ”，啥都不用更改，直接“**创建下载包** ” ![屏幕截图202111062355025.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-06-235502-5-a3ccad1f.jpg)

![T2HA9M3J1N9NPOJI.png](/images/2022/02/T2HA9M3J1N9_NPOJI-1b65e4d4.png)

![屏幕截图202111062355023.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-06-235502-3-3edc098e.jpg)

![屏幕截图202111062355024.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-06-235502-4-1f89ad48.jpg)

下载后，直接解压你下载到的安装包，在解压出的文件夹里，你会看到一个“**uup\_download\_windows.cmd** ”的文件，右键，**以管理员身份运行**

如果出现报错“Current directory contains spaces in its path. Please move or rename the directory to one not containing spaces.”则代表你的文件路径中，有存在文件夹命名包含空格，检查一下路径上的文件夹命名就好，实在不行就把这个压缩包拷贝到一个硬盘的根目录去解压，再运行这个批处理文件（.cmd的文件）

打开过后，若是正常，屏幕中会偶尔闪过绿色的关键字，程序会不断运行，然后变成一个蓝色的窗口，继续运行，直到最后提示“**按0退出** ”，就代表你的ISO镜像文件创建完成了，你就能在这个文件夹中看到.iso为后缀的文件，这就是接下来会用到的系统镜像

![屏幕截图202111062355026.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-06-235502-6-babbf6bb.jpg)

![屏幕截图202111062355027.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-06-235502-7-eb18010e.jpg)

![屏幕截图202111062355028.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-06-235502-8-dbe4e578.jpg)

接下来，我们回到之前下载的第一个压缩包，解压过后，会看到一个叫“**WoR.exe** ”的文件（这个我就不放图了），双击运行

**欢迎页：** 直接点击下一步，如果不是**简体中文** ，点击选择一下就好了

**选择您的设备：** 点击展开后，选择你的**插有内存卡的读卡器** ；然后在下侧选择你的**树莓派型号**

**选择镜像：** 将刚刚生成的.iso文件选中；下方版本中选择“**专业版** ”（如果你需要选择的话，当然，你也可以试着装其他的版本比如“家庭教育版”等等）

**选择驱动程序：** 选择“**使用服务器上提供的最新驱动程序包** ”

**UEFI固件：** 选择“**使用服务器上提供的最新固件** ”

**配置：** 啥都不用改，**直接“下一步”**

**安装概览：** 也是，啥都不管，直接“**安装** ”

![屏幕截图20211107005023.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-07-005023-c0cad318.jpg)

![屏幕截图202111070050231.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-07-005023-1-c72738de.jpg)

![屏幕截图202111070050232.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-07-005023-2-49c06ae7.jpg)

![屏幕截图202111070050233.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-07-005023-3-85801fe6.jpg)

![屏幕截图202111070050234.jpg](/images/2022/02/%E5%B1%8F%E5%B9%95%E6%88%AA%E5%9B%BE-2021-11-07-005023-4-e9b7cc3a.jpg)
