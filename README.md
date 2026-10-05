lrc
===

a javascript lrc parser

lrc 是个 [lrc 歌词][1]解析程序, 并且有 lrc 播放功能.
可用于 node 和 browser 环境.

## 安装
  
  - In node: `npm install lrc`
  - In browser: `<script type="text/javascript" src="lrc.js"></script>` 
  
在浏览器中暂不支持模块加载器.

## 用法示例

```javascript

//创建实例
var lrcStr = "[ti: title]\n[ar: artist]\n[00:01.00]line 1\n[00:05.00]line 2"
var lrc = new Lrc(lrcStr, outputHandler);

//定义歌词输出处理程序
function outputHandler(line, extra){
  console.log(line)
}

//播放控制
lrc.play();
lrc.pauseToggle();
lrc.seek(500);
lrc.stop();

```

[1]: https://zh.wikipedia.org/wiki/LRC

## 0.1.1

将仓库中已有的解析与播放修复发布到 npm：修复解析时全局正则的
`lastIndex` 被重置造成的死循环，以及从最后一句之后开始播放时的越界问题。
支持从指定进度立即输出当前歌词。增加独立进程回归测试，解析卡住时会超时退出。

开发验证：`pnpm test`。
