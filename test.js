var assert = require('assert');
var spawnSync = require('child_process').spawnSync;

// 在子进程中解析：若全局正则的 lastIndex 回归，超时可避免卡住整个测试。
if (process.argv[2] !== '--child') {
  var result = spawnSync(process.execPath, [__filename, '--child'], {
    timeout: 3000,
    encoding: 'utf8'
  });
  assert.ifError(result.error);
  assert.strictEqual(result.status, 0, result.stderr);
  process.stdout.write(result.stdout);
} else {
  var Lrc = require('./').Lrc;
  assert.deepStrictEqual(new Lrc('[00:01.00]鹅鹅鹅').lines.map(function(line) {
    return [line.time, line.txt];
  }), [[1000, '鹅鹅鹅']]);

  var events = [];
  var player = new Lrc('[00:01.00][00:05.00]鹅鹅鹅\n[00:03.00]\n[00:07.00]曲项向天歌', function(text) {
    events.push(text);
  });
  assert.deepStrictEqual(player.lines.map(function(line) {
    return [line.time, line.txt];
  }), [[1000, '鹅鹅鹅'], [3000, ''], [5000, '鹅鹅鹅'], [7000, '曲项向天歌']]);

  player.play(2000);
  player.stop();
  assert.deepStrictEqual(events, ['鹅鹅鹅']);
  player.play(4000);
  player.stop();
  assert.strictEqual(events[1], '');
  assert.doesNotThrow(function() { player.play(8000); });
  player.stop();
  assert.strictEqual(events[2], '曲项向天歌');
  console.log('通过：解析不死循环、重复时间标签、空歌词、指定进度与末尾播放');
}
