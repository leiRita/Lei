// 云函数入口文件
const cloud = require('wx-server-sdk')

//初始化
cloud.init()

//获取数据库引用
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  let userInfo = event.userInfo;
  let listName = event.listName;

  delete event.userInfo;
  delete event.listName;

  try{
    //无条件查询
    if( Object.keys(event).length == 0 ){
      return db.collection(listName).get();
    }else{
      return await db.collection(listName).where({...event,userInfo}).get();
    }
    
  }catch(err){
    console.log("err==>",err);
  }
}