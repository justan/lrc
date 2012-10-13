/**
 * lrc parser and player
 * @version 0.1
 */

var Lrc = (function(){
  Date.now = Date.now || (new Date).getTime;
  var timeExp = /\[(\d{2,})\:(\d{2})(?:\.(\d{2}))?\]/g
    , tagsRegMap = {
        title: 'ti'
      , artist: 'ar'
      , album: 'al'
      , offset: 'offset'
      , by: 'by'
    }
    ;
  
  /**
   * lrc parser
   * @param {string} lrc lrc 歌词字符串
   * @param {function} [handler] 
   * @constructor
   */
  var Parser = function(lrc, handler){
    lrc = Parser.trim(lrc);
    this.lrc = lrc;//lrc 歌词
    this.handler = handler || function(){}
    this.tags = {};//ID tags. 标题, 歌手, 专辑
    this.lines = [];//详细的歌词信息
    this.txts = [];
    this.isLrc = Parser.isLrc(lrc);
    
    this.curLine = 0;//
    this.state = 0;// 0: stop, 1: playing
        
    var res, line, time, lines = lrc.split(/\n/);
    
    for(var tag in tagsRegMap){
      res = lrc.match(new RegExp('\\[' + tagsRegMap[tag] + ':([^\\]]*)\\]', 'i'));
      this.tags[tag] = res && res[1] || '';
    }
    
    timeExp.lastIndex = 0;
    for(var i = 0, l = lines.length; i < l; i++){
      while(time = timeExp.exec(lines[i])){
        line = Parser.trim(lines[i].replace(timeExp, ''));
        this.lines.push({
            time: time[1] * 60 * 1000 + time[2] * 1000 + (time[3] || 0) * 10
          , originLineNum: i
          , txt: line
        });
        this.txts.push(line);
      }
    }
    
    this.lines.sort(function(a, b){
      return a.time - b.time;
    });
  };
  
  //按照时间点确定歌词行数
  function findCurLine(time){
    for(var i = 0, l = this.lines.length; i < l; i++){
      if(time <= this.lines[i].time){
        return i;
      }
    }
  }
  
  function focusLine(i){
    this.handler.call(this, this.lines[i].txt, {
        originLineNum: this.lines[i].originLineNum
      , lineNum: i
    })
  }
  
  //lrc stream control and output
  Parser.prototype = {
      //time: 播放起点
      play: function(time){
        var that = this;
        time = time || 0;
        that._startStamp = Date.now() - time;//相对开始时间戳
        this.state = 1;
        
        if(this.isLrc){
          that.curLine = findCurLine.call(this, time);
          clearTimeout(this._timer);
          
          this._timer = setTimeout(function loopy(){
            focusLine.call(that, that.curLine++);
            
            if(that.lines[that.curLine]){
              that._timer = setTimeout(function(){
                loopy();
              }, that.lines[that.curLine].time - (Date.now() - that._startStamp));
              //}, that.lines[that.curLine].time - that.lines[that.curLine--].time);//一些情况可能用得上
            }else{
              //end
            }
          }, this.lines[that.curLine].time - time)
          
        }
      }
    , pause: function(){
        var now = Date.now();
        if(this.state){
          this.stop();
          this._pauseStamp = now;
        }else{
          this.play((this._pauseStamp || now) - (this._startStamp || now));
          delete this._pauseStamp;
        }
      }
    , seek: function(offset){
        this._startStamp -= offset;
        this.state && this.play(Date.now() - this._startStamp);//播放时让修改立即生效
      }
    , stop: function(){
        this.state = 0;
        clearTimeout(this._timer);
      }
  };
    
  Parser.trim = function(lrc){
    return lrc.replace(/(^\s*|\s*$)/m, '')
  };
  Parser.isLrc = function(lrc){
    return timeExp.test(lrc);
  };
  return Parser;
})();

//node.js module
if(typeof exports !== 'undefined'){
  exports.Lrc = Lrc;
}