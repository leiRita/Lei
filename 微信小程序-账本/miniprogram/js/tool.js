class Tool {

  //格式化日期
  formatDate(data, format) {
    //data: 需要进行格式化的数据, 日期对象 或者 字符串
    //format: 格式
    // console.log('data ==> ', data);
    // console.log('format ==> ', format);
    let date = null;
    if (Object.prototype.toString.call(data) === "[object Date]") {
      date = data;
    } else {
      date = new Date(data);
    }

    //获取年份
    let year = date.getFullYear().toString();
    // console.log('year ==> ', year);

    if (/(y+)/.test(format)) {
      // console.log('有年份');
      //获取匹配组的内容
      let yearContent = RegExp.$1;
      // console.log('yearContent ==> ', yearContent);

      format = format.replace(yearContent, year.slice(year.length - yearContent.length));
    }

    //替换月日时分秒
    let dateObject = {
      M: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      m: date.getMinutes(),
      s: date.getSeconds()
    };

    for (let key in dateObject) {
      //生成动态正则表达式
      let reg = new RegExp(`(${key}+)`);
      // console.log('reg ==> ', reg);
      if (reg.test(format)) {
        //获取匹配组的内容
        let content = RegExp.$1;
        // console.log('content ==> ', content);

        format = format.replace(content, dateObject[key] >= 10 ? dateObject[key] : content.length === 2 ? '0' + dateObject[
          key] : dateObject[key]);
      }
    }

    return format;
  }

  //随机颜色
  createRandomColor(){
    let color = [];
    for(let i = 0;i < 3;i++){
      let c = Math.ceil(Math.random() * 255);
      color.push(c);
    }
    return `rgb(${color.join(',')})`
  }

}

module.exports = new Tool();