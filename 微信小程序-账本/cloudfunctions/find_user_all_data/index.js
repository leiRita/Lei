// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  let listName = event.listName;
  delete event.listName;
  try{
    return await db.collection(listName).where(event).get();
  }catch(err){
    console.log('err==>',err);
  }
}