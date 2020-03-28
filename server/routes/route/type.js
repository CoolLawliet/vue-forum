const postParams = require('../../util/postParams')
const {userModel,typeModel} = require('../../mongodb/usr')
const {mySend, myError} = require('../../util/send')

module.exports = (app) => {
  app.get('/zx/type/getType', async (req, res) => {
    typeModel.find({}, (err, doc) => {
          if (err){
            myError(res,err);
            return
          }
      mySend(res,{msg:"获取成功",data:doc})
    })
  })
};
