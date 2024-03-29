const postParams = require('../../util/postParams')
const {userModel, articalModel} = require('../../mongodb/usr')
const {mySend, myError} = require('../../util/send')

module.exports = function (app) {

  // 发帖子接口
  app.post('/zx/artical/sendArtical', async (req, res) => {
    const {title, content, author, type, personal} = app.get('params');
    articalModel.create({
      title,
      content,
      likes: [],
      answer: [],
      collect: 0,
      id: app.get('_id'),
      create_time: new Date().getTime(),
      author: JSON.parse(author),
      type,
      personal
    }, err => {
      if (err) {
        myError(res, err)
        return
      }
      mySend(res, {msg: '发贴成功'})
    })
  })

  // 获取帖子
  app.get('/zx/artical', async (req, res) => {
    const {pageIndex, type} = req.query;
    if (type) {
      articalModel.countDocuments({}, (err, count) => {
        if (err) {
          myError(res, err)
          return
        }
        articalModel.find({type})
          .skip(5 * ((pageIndex ? pageIndex : 1) - 1))
          .sort({'_id': -1})
          .limit(5)
          .exec((err, msg) => {
            if (err) {
              myError(res, err)
              return
            }
            mySend(res, {msg: '获取成功', data: msg, total: count})
          })
      })
    } else {
      articalModel.countDocuments({}, (err, count) => {
        if (err) {
          myError(res, err)
          return
        }
        articalModel.find({})
          .skip(5 * ((pageIndex ? pageIndex : 1) - 1))
          .sort({'_id': -1})
          .limit(5)
          .exec((err, msg) => {
            if (err) {
              myError(res, err)
              return
            }
            mySend(res, {msg: '获取成功', data: msg, total: count})
          })
      })
    }
  })

  // 点赞帖子
  app.get('/zx/artical/like', async (req, res) => {
    const {id, is_like} = req.query
    const userId = app.get('_id')
    if (String(is_like) == 'true') {
      const promise_one = new Promise((resolve, reject) => {
        articalModel.updateOne({_id: id}, {
            $push: {
              likes: userId
            },
            $inc: {collect: 1}
          },
          (err, meg) => {
            if (err) {
              reject(err)
            }
            resolve()
            // mySend(res, { msg: '点赞成功' })
          })
      })
      const promise_two = new Promise((resolve, reject) => {
        articalModel.findOne({_id: id}, (err, msg) => {
          if (err) {
            reject(err)
          }
          userModel.updateOne({_id: msg.id}, {
              $inc: {like: 1}
            },
            (err, meg) => {
              if (err) {
                reject(err)
              }
              resolve()
            })
        })

      })
      Promise.all([promise_one, promise_two]).then(() => {
        mySend(res, {msg: '点赞成功'})
      }).catch(err => {
        myError(res, err)
      })
    } else {
      const promise_one = new Promise((resolve, reject) => {
        articalModel.updateOne({_id: id}, {
            $pull: {
              likes: userId
            },
            $inc: {collect: -1}
          },
          (err, meg) => {
            if (err) {
              reject(err)
            }
            resolve()
            // mySend(res, { msg: '点赞成功' })
          })
      })
      const promise_two = new Promise((resolve, reject) => {
        articalModel.findOne({_id: id}, (err, msg) => {
          if (err) {
            reject(err)
          }
          userModel.updateOne({_id: msg.id}, {
              $inc: {like: -1}
            },
            (err, meg) => {
              if (err) {
                reject(err)
              }
              resolve()
            })
        })
      })
      Promise.all([promise_one, promise_two]).then(() => {
        mySend(res, {msg: '取消点赞成功'})
      }).catch(err => {
        myError(res, err)
      })
    }
  })

  // 获取帖子排行
  app.get('/zx/artical/sort', async (req, res) => {
    articalModel.find({}).sort({'looks': -1}).limit(9).exec((err, msg) => {
      if (err) {
        myError(res, err)
        return
      }
      mySend(res, {msg: '获取成功', data: msg})
    })
  })

  // 获取帖子分类数量
  app.get('/zx/artical/typeNum', async (req, res) => {
    // const type = req.query.type
    // console.log(type);
    let typeList= [];
    articalModel.aggregate(
      [
        {
          $group:
            {
              _id: {"type": "$type"},
              count: {$sum: 1},
              // total:{$sum: }
            },
        },
        {
          $sort: {
            count: -1
          }
        }
      ]
    ).exec((err, data) => {
      if (err) {
        myError(res, err)
      }
      typeList.push(data);
      articalModel.countDocuments({},(err,count)=>{
        if (err){
          myError(res,err);
          return
        }
        typeList[0].unshift({
          "_id": {
            type: "全部"
          },
          "count": count
        });
        mySend(res,{data:typeList})
      })

    })


    // ['All', 'Talk', 'Javascript', 'Vue', 'React', 'Typescript', 'Webpack', 'Markdown', 'Jquery', 'Node', 'Python', 'Css', 'Git']
    /*const All = new Promise((resolve, reject) => {
        articalModel.countDocuments({}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'html', count})
        })
    })

    /!*const Talk = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: '闲聊'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: '闲聊', count})
        })
    })
    const Javascript = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: 'Javascript'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'Javascript', count})
        })
    })
    const Vue = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: 'Vue'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'Vue', count})
        })
    })
    const Typescript = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: 'Typescript'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'Typescript', count})
        })
    })
    const React = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: 'React'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'React', count})
        })
    })
    const Markdown = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: 'Markdown'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'Markdown', count})
        })
    })
    const Webpack = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: 'Webpack'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'Webpack', count})
        })
    })
    const Jquery = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: 'Jquery'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'Jquery', count})
        })
    })
    const Node = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: 'Node'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'Node', count})
        })
    })
    const Python = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: 'Python'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'Python', count})
        })
    })
    const Css = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: 'Css'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'Css', count})
        })
    })
    const Git = new Promise((resolve, reject) => {
        articalModel.countDocuments({type: 'Git'}, (err, count) => {
            if (err) {
                reject()
            }
            resolve({name: 'Git', count})
        })
    })*!/
    Promise.all([All]).then(ress => {
        const lostArr = ress.filter(item => {return item.count > 0})
      console.log(lostArr);
      mySend(res, {data: lostArr, msg: '获取成功'})
    }).catch(err => {
        myError(res, err)
    })*/
  })

  // 获取帖子详情
  app.get('/zx/artical/detail', async (req, res) => {
    const {_id} = req.query;
    const promise_one = new Promise((resolve, reject) => {
      articalModel.findOne({_id}, (err, msgD) => {
        if (err) {
          reject(err)
        }
        userModel.updateOne({_id: msgD.id}, {
          $inc: {looks: 1}
        }, (err, msg) => {
          if (err) {
            reject(err)
          }
          resolve(msgD)
        });
      });
    })
    const promise_two = new Promise((resolve, reject) => {
      articalModel.updateOne({_id}, {
        $inc: {looks: 1}
      }, (err, msg) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
    Promise.all([promise_one, promise_two]).then((sres) => {
      mySend(res, {msg: '获取成功', data: sres[0]})
    }).catch(err => {
      myError(res, err)
    })

  })

  // 回复帖子
  app.get('/zx/artical/reply', async (req, res) => {
    const {_id, content} = req.query;
    articalModel.updateOne({_id}, {
      '$push': {
        answer: {
          user_info: app.get('userInfo'),
          content,
          time: new Date().getTime()
        }
      }
    }, (err, msg) => {
      if (err) {
        myError(res, err)
        return
      }
      mySend(res, {msg: '评论成功'})
    });
  })

}
