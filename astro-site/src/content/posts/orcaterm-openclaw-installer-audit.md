---
title: "一次 OpenClaw 第三方一键安装脚本审计：问题可能不在 Raspberry Pi OS"
date: 2026-08-08
slug: "orcaterm-openclaw-installer-audit"
categories: ["资料库", "服务器运维", "Debug"]
tags: ["OpenClaw", "OrcaTerm", "Raspberry Pi", "脚本审计"]
description: "对 OrcaTerm 托管的一套 OpenClaw 一键安装脚本进行静态审计，并重新分析树莓派部署中出现的超时、PATH、systemd、插件构建和镜像错误。"
---

## 摘要

我曾在 Raspberry Pi OS 上部署 OpenClaw，过程中遇到 `/dev/fd/63`、pnpm PATH、systemd 用户服务、五分钟安装超时、腾讯 npm 镜像断连、插件构建被忽略，以及 QQ、钉钉、企业微信和 Skill 安装失败等一系列问题。

这些问题一度被解释为“普通用户安装带来的麻烦”，并由此推导出“直接以 root 安装可能更省事”。但重新检查当时执行的命令后发现，使用的并不是 OpenClaw 官方安装器，而是一套由第三方对象存储托管、会继续下载并执行四个子脚本的一键安装方案：

```bash
bash <(curl -fsSL \
  https://orcaterm-script-1258344699.cos.ap-shanghai.myqcloud.com/linux/AI/openclaw/install.sh)
```

2026 年 8 月 8 日对该入口脚本及其四个子脚本进行只读下载和静态审计后，可以确认：此前多个故障都与这套脚本中硬编码的超时、`CI=true`、镜像选择、全局 Git URL 重写、混合权限模型和自定义插件安装流程直接对应。

因此，更准确的结论是：

> 此前的安装经历不能用来证明 Raspberry Pi OS 不适合 OpenClaw，也不能证明必须以 root 运行 OpenClaw。大量问题首先应归因于第三方整合脚本自身的设计选择。

本文只讨论可观察的脚本行为及其技术影响，不判断脚本作者的主观意图，也不声称本次取得的文件与过去执行时的版本完全相同。

## 审计范围与方法

本次审计只做了以下操作：

1. 将入口脚本下载到临时目录；
2. 阅读入口脚本引用的四个子脚本；
3. 计算本次取得文件的 SHA-256；
4. 对照此前保存的错误现象；
5. 与 OpenClaw 当前官方安装文档进行比较。

**没有执行这些脚本，也没有让它们修改本机系统。**

入口脚本会依次下载并执行：

```text
01-setup-deps.sh
02-install-openclaw.sh
03-install-plugins.sh
04-install-skills.sh
```

本次取得文件的完整哈希如下：

| 文件 | SHA-256 |
|---|---|
| `install.sh` | `eb1890b405ba37bbe6990ac4b910869a8413a7f2e24e530410224755fa689d79` |
| `01-setup-deps.sh` | `c6a21ebfec498d339ecbc7b94d9ac69680630db691c3f7d63a7cdd7a33d6e1f5` |
| `02-install-openclaw.sh` | `7376dddaba7eeadb722b419f3ae5e08441d2ab8bf20f84bcdc63156017bf48bc` |
| `03-install-plugins.sh` | `0fc6faaf5cf1ceeef3b9125a0d208b84e47fffc8995d90589b6ff1706a3de6a2` |
| `04-install-skills.sh` | `3b477cd18ffe7c3138e7e044aae50058f974da3bf2e4b469182c5c666cc23fb2` |

需要特别强调：这些脚本来自没有固定版本号和完整性校验的远程 URL。发布方可以原地替换内容，因此上述哈希只能标识 **2026 年 8 月 8 日本次审计取得的版本**，不能证明历史版本完全一致。

## 它不是 OpenClaw 官方安装器

OpenClaw 当前官方文档为 macOS、Linux 和 WSL 推荐的入口是：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

官方还提供无需 root、安装到本地前缀的方式：

```bash
curl -fsSL https://openclaw.ai/install-cli.sh | bash
```

官方 Raspberry Pi 指南建议使用 Raspberry Pi OS Lite 64-bit，并通过普通用户执行 onboarding 和安装 systemd 用户服务：

```bash
openclaw onboard --install-daemon
```

参考资料：

- [OpenClaw 安装文档](https://docs.openclaw.ai/install)
- [OpenClaw 安装器说明](https://docs.openclaw.ai/install/installer)
- [OpenClaw Raspberry Pi 指南](https://docs.openclaw.ai/install/raspberry-pi)
- [OpenClaw Gateway runbook](https://docs.openclaw.ai/gateway)

第三方脚本并非只对官方安装器进行简单封装。它还会配置系统依赖、swap、nvm、pnpm、镜像、Git URL、Gateway 参数、Clawhub、Skillhub、第三方渠道插件、Skills 和浏览器依赖，实际作用范围远大于“安装 OpenClaw”。

## 发现一：权限模型内在矛盾

第一份子脚本会直接执行或修改：

```text
apt-get
/etc/profile
/swapfile
/etc/fstab
/etc/sysctl.conf
/usr/local/bin
```

这些操作通常需要 root 权限。

但同一套脚本又会：

- 把 nvm 安装到当前 `$HOME/.nvm`；
- 把 pnpm 安装到当前用户目录；
- 把 OpenClaw 状态放到当前 `$HOME/.openclaw`；
- 为当前用户启用 systemd lingering；
- 安装当前用户的 systemd user service；
- 生成依赖当前 `$HOME` 的 `/usr/local/bin/openclaw` 包装脚本。

这使脚本很难拥有一个一致的执行身份：

```text
普通用户直接执行
  └─ 写 /etc、/usr/local 和 swap 时可能权限不足

通过 sudo 执行
  └─ HOME、PATH、UID、nvm、pnpm 和 systemd user 上下文可能改变

直接以 root 登录执行
  └─ OpenClaw 状态和 Gateway 进入 /root，并获得整机最高权限
```

这比“普通用户安装有问题”更能解释此前出现的 pnpm PATH、`XDG_RUNTIME_DIR` 和 Gateway Unit 不存在等故障。

### 为什么 root 不是正确修复

root 可能暂时绕过文件写入权限问题，但不会修复网络、包管理器策略、ARM64 编译时间或插件兼容性。它还会让 OpenClaw、插件、Skill 和被调用的 shell 继承整机最高权限。

对于一个会接收通知、网页、邮件、聊天和第三方内容的 Agent 系统，这会显著放大 Prompt Injection、恶意依赖或错误命令的影响范围。

更合理的结构是：

```text
管理用户 + sudo
  └─ 安装经审核的系统依赖、管理磁盘和网络

专用 openclaw 普通用户
  └─ 拥有 Node、OpenClaw、~/.openclaw 和 systemd user service
```

## 发现二：五分钟超时由脚本硬编码

第二份子脚本使用：

```bash
timeout --kill-after=10 300 \
  env CI=true \
  pnpm install -g "openclaw@${OPENCLAW_VERSION}"
```

这直接解释了此前的“安装运行五分钟后被 timeout 强制终止”。

该限制不是 Raspberry Pi OS 提供的，也不是 OpenClaw 官方安装器的默认行为。Raspberry Pi ARM64 在下载较慢、缓存为空或需要编译原生依赖时，安装超过五分钟并不反常。硬编码 300 秒会把“运行较慢”误判成“安装失败”。

同样的 300 秒限制还被用于 Clawhub、插件依赖和 agent-browser 安装。

## 发现三：脚本主动注入 `CI=true`

脚本会在非交互环境中设置：

```bash
export CI=true
```

多个安装命令还显式使用：

```bash
env CI=true pnpm install ...
```

这与此前钉钉、企业微信等插件安装时出现的 `IGNORED_BUILDS` 或构建脚本未执行高度吻合。

构建脚本是供应链风险点，包管理器在 CI 或非交互环境中采取更严格策略有其安全理由。但第三方脚本一方面强制使用 CI 模式，另一方面又批量安装依赖构建脚本的插件，形成了自身流程上的冲突。

因此，这类问题不能归咎于普通用户或 Raspberry Pi OS。

## 发现四：自定义镜像和全局 Git 重写增加了变量

脚本会测速并在以下 npm 源中选择：

```text
https://mirrors.tencent.com/npm
https://mirrors.cloud.tencent.com/npm
https://registry.npmjs.org
```

在它判断处于国内环境时，还可能设置 Node.js 镜像：

```bash
NVM_NODEJS_ORG_MIRROR=https://mirrors.cloud.tencent.com/nodejs-release/
```

以及修改当前用户的全局 Git 配置：

```bash
git config --global \
  url."https://gitclone.com/github.com/".insteadOf \
  "https://github.com/"
```

这意味着原本请求 GitHub 的依赖可能被透明重定向到另一服务。此前出现的腾讯 npm 镜像 `ECONNRESET`、Git 依赖下载异常和 `libsignal` 获取失败，都应首先检查这些自定义镜像及 URL 重写。

使用镜像本身不必然错误，但自动选择镜像、修改全局 Git 行为且缺乏清晰回滚，会增加诊断复杂度，也改变了软件供应链路径。

## 发现五：插件并非通过标准流程安装

第三份子脚本批量处理以下第三方插件：

```text
@sliverp/qqbot
@largezhou/ddingtalk
@mocrane/wecom
adp-openclaw
```

它采用的主要流程是：

1. 使用 `npm pack` 下载压缩包；
2. 手动解压到 `~/.openclaw/extensions/<plugin>`；
3. 在插件目录运行 `pnpm install --prod`；
4. 使用 `jq` 直接修改 `openclaw.json`；
5. 模拟写入一条插件安装记录。

这不是单纯调用 OpenClaw 标准插件管理命令。它可能产生：

- 插件目录已创建，但依赖只安装了一部分；
- pnpm 安全策略拦截构建脚本；
- ARM64 原生依赖没有可用的预编译产物；
- 配置显示插件已启用，但实际运行依赖不完整；
- 后续升级无法准确判断插件来源和状态。

此前 QQ、钉钉和企业微信插件失败，应首先重新定性为“第三方批量插件安装流程失败”，而不是“OpenClaw 无法在 Raspberry Pi OS 上安装”。

## 发现六：安装范围远超最小 OpenClaw

这套脚本还会自动安装或配置：

- Clawhub；
- 另一套由第三方 COS 地址分发的 Skillhub；
- 多个默认 Skills；
- agent-browser；
- Playwright Chromium；
- 多个第三方消息渠道插件；
- nvm 与 pnpm；
- swap 和系统级环境变量。

当所有步骤被放在一次执行中时，任一镜像、插件、Skill、浏览器包或 ARM64 原生依赖失败，用户看到的都可能只是“一键安装 OpenClaw 失败”。实际上，OpenClaw 核心可能已经安装成功，失败的是某个非必要扩展。

这违反了排障中的一个基本原则：一次只增加一个变量。

## 发现七：部分默认配置会降低安全基线

脚本在非交互 onboarding 后执行了包括以下含义的配置：

```text
清空 gateway.auth.token
tools.profile = full
gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback = true
```

它同时使用 `--accept-risk` 自动接受 onboarding 风险提示。

虽然脚本把 Gateway 初始绑定在 loopback，降低了直接公网暴露的风险，但上述配置仍不适合作为私人长期实例未经审查的默认值：

- 清空认证 token 会削弱一道访问控制；
- `tools.profile=full` 扩大默认工具能力；
- 启用名称中明确标注 `dangerously` 的 Host Header fallback 会放宽控制台来源判断；
- 自动接受风险会跳过用户理解安全边界的过程。

在后续通过 SSH Tunnel、Tailscale、反向代理或局域网开放控制台时，这些设置尤其需要重新审计。

## 发现八：对 4 GB Pi 创建 8 GB swap 并不合理

脚本只要检测到 swap 少于 4 GB，就优先尝试创建 8 GB `/swapfile`，空间不足时才退到 4 GB，并设置：

```text
vm.swappiness=50
```

对于 4 GB 内存、64 GB microSD 的 Raspberry Pi 5，这会：

- 占用约八分之一的标称存储容量；
- 增加 microSD 写入；
- 在内存压力下产生明显性能下降；
- 掩盖插件或浏览器任务本身的内存配置问题。

OpenClaw 官方 Raspberry Pi 指南主要建议为 2 GB 或更低内存设备增加 swap。4 GB Pi 不应在没有监控数据的情况下默认创建 8 GB swap。

## 此前问题的重新归因

| 现象 | 旧解释 | 静态审计后的判断 |
|---|---|---|
| `/dev/fd/63` | sudo 安全策略问题 | 第三方入口采用 `bash <(curl ...)`，首先是调用形式问题 |
| pnpm 不在 PATH | 普通用户环境麻烦 | 脚本混用用户级 nvm/pnpm、sudo/root 和系统路径 |
| Gateway Unit 不存在 | systemd 用户服务不好用 | 安装用户、查询用户及 user bus 上下文不一致 |
| 五分钟后被终止 | Pi 编译太慢 | 脚本明确硬编码 300 秒 timeout；Pi 较慢只是触发条件 |
| 腾讯镜像断开 | 网络偶发问题 | 脚本主动选择第三方镜像，属于其引入的依赖 |
| QQ/libsignal 失败 | root 也会遇到 | 自定义镜像、Git 重写和手工插件安装是首要嫌疑 |
| 钉钉/企微 `IGNORED_BUILDS` | pnpm 自身限制 | 脚本多处强制 `CI=true`，与现象直接对应 |
| Skill 安装冲突 | Skill 工具有问题 | 这是第三方额外安装体系，不属于最小 OpenClaw |
| RPi OS bug 多 | 操作系统不稳定 | 现有证据不足以支持 |
| 应改用 root | root 更省事 | 只能绕过部分权限表象，同时扩大安全风险 |

## 推荐的替代部署流程

对于 Raspberry Pi 5 上的私人长期 OpenClaw，更稳妥的做法是：

1. 使用 Raspberry Pi OS Lite 64-bit；
2. 创建一个可 sudo 的管理用户；
3. 创建一个无 sudo 的专用 `openclaw` 服务用户；
4. 由管理用户安装少量、明确的系统依赖；
5. 由 `openclaw` 用户使用官方安装入口；
6. 首先只完成最小 Gateway 和模型连接；
7. 验证 systemd、重启、控制台、日志和备份；
8. 每次只增加一个插件或渠道；
9. 安装插件前核验 ARM64 支持、来源和构建脚本；
10. 保留原始命令、版本、哈希和失败日志。

服务账户建议保持：

```text
用户：openclaw
sudo：无
直接 SSH：默认关闭
状态目录：/home/openclaw/.openclaw
服务：systemd user service + lingering
```

系统级操作则由管理用户审核后通过 sudo 执行。不要为了消除 PATH 或权限报错，让生产 Gateway 长期以 root 身份运行。

## 如何安全看待一键安装脚本

`curl | bash` 或 `bash <(curl ...)` 并不自动等于恶意，但它们都意味着把远程发布方当前返回的内容直接交给 shell。使用前至少应确认：

- 域名是否属于官方项目；
- 是否固定版本或 commit；
- 是否提供可核验哈希或签名；
- 是否还会下载更多未固定版本的脚本；
- 会修改哪些系统文件；
- 是否改变全局 Git/npm 配置；
- 是否安装额外插件和 Skills；
- 是否降低认证或网络安全设置；
- 能否回滚所有改动。

更审慎的操作方式是先下载再阅读：

```bash
curl -fsSL <URL> -o install.sh
sha256sum install.sh
less install.sh
```

确认无误后再执行，并记录版本和哈希。

## 结论

这次复盘中最重要的变化，不是找到了一个新的安装技巧，而是纠正了问题定义。

此前看起来像是：

> Raspberry Pi OS 问题很多，普通用户安装 OpenClaw 很麻烦，也许应该直接用 root。

静态审计后，更符合证据的描述是：

> 一套第三方整合脚本同时承担系统初始化、用户级工具链、OpenClaw、Gateway、镜像、插件、Skills 和浏览器安装；其权限模型、硬编码超时、CI 策略及自定义插件流程共同制造或放大了安装故障。

这并不保证官方安装器在 Raspberry Pi ARM64 上永远不会遇到问题。原生依赖、插件预编译产物、网络和版本回归仍需逐项验证。但至少，现有故障不能再被当作否定 Raspberry Pi OS 或普通用户部署方式的证据。

下一次部署应该从官方最小安装开始，让系统底座、OpenClaw 核心、渠道插件和数据迁移成为彼此独立、可验证、可回滚的阶段。
