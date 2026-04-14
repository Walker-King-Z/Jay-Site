---
title: "在网页中插入运行时间统计"
date: 2021-08-26
slug: "在网页中插入运行时间统计"
categories: ["资料库", "网站运维"]
tags: ["脚本", "插件"]
description: "本文介绍了怎么在网页中实现运行时间的计算和展示"
wordpressId: 128
---
### 在Head中进行计算

```
<script>
    function runTime() {
        var d = new Date(), str = '';
        BirthDay = new Date("Aug 26,2021");
        today = new Date();
        timeold = (today.getTime() - BirthDay.getTime());
        sectimeold = timeold / 1000
        secondsold = Math.floor(sectimeold);
        msPerDay = 24 * 60 * 60 * 1000
        msPerYear = 365 * 24 * 60 * 60 * 1000
        e_daysold = timeold / msPerDay
        e_yearsold = timeold / msPerYear
        daysold = Math.floor(e_daysold);
        yearsold = Math.floor(e_yearsold);
        //str = yearsold + "年";
        str += daysold + "天";
        str += d.getHours() + '时';
        str += d.getMinutes() + '分';
        str += d.getSeconds() + '秒';
        return str;
    }
    setInterval(function () { $('#run_time').html(runTime()) }, 1000);
</script>
```

### 在需要的地方调用运算的结果（一般放在foot）

```
网站已在风雨中运行:<span id="run_time" style="color:white"></span>
```

### 提示

文本颜色也可以自定义，格式如下

```
网站已在风雨中运行:<span id="run_time" style="color:输入颜色英文"></span>
```
