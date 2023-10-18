(function () {
  if (module.declare === undefined) {
    throw 'There is no global module.declare method!';
  }

  //define os module
  module.declare('db', function (require, exports, module) {
    // @ts-ignore
    const IndexDB =
      window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    const IDBKeyRange = window.IDBKeyRange || window.mozIDBKeyRange ||  window.webkitIDBKeyRange || window.msIDBKeyRange;
    let db = null;

    // 打开链接
    const open = (options, cb) => {
      //
      if (db) {

        return cb(null,db);
      }
      
      const db_name = options.name;
      const db_version = options.version;
      //
      if (!IndexDB) {

        return console.log('not support indexDB');
      }
      if (!db_name) {

        return console.log('no db name');
      }
      //
      const request = IndexDB.open(db_name,db_version || 1);
      // 
      request.onerror = function (event) {
        //
        console.log('db on error', event);
        //
        cb && cb(event);
      };
      //
      request.onsuccess = function (event) {
        //
        // console.log('db on success', event);
        //
        db = event.target.result;
        //
        cb && cb(null,db);
      };
      //
      request.onupgradeneeded = function (event) {
        //
        cb && cb('onupgradeneeded', event.target.result, event);
      };
    }
    // 关闭
    const close = () => {
      if (db) {
        db.close();
        db = null;
      }
    }
    // 操作函数
    const handle_commit = (tableName, commit, mode = "readwrite", cb) => {
      //
      if (db) {
        const store = db.transaction(tableName, mode).objectStore(tableName);
        //
        if (commit) {
          //
          const res = commit(store);
          //
          res.onsuccess = (e) => {
            //
            cb && cb(null, e, store);
          }
          //
          res.onerror = (e) => {
            //
            cb && cb(e, store);
          }
        } else {
          //
          cb && cb(null, store);
        }
      }
    }
    // 游标操作
    const handle_cursor = (e, options) => {
      const { condition, handler, cb } = options;
      const cursor = e.target.result;
      //
      if (cursor) {
        const value = cursor.value;
        //
        if (condition(value)) {
          //
          handler({
            cursor,
            value
          });
        }
        //
        cursor.continue();
      } else {
        //
        return cb && cb();
      }
    }
    // 查询所有
    const queryAll = (table_name, condition,cb) => {
      //
      const res = [];
      //
      if(cb === undefined && typeof condition === 'function'){
        cb = condition;
        condition = null;
      }
      //
      return handle_commit(table_name, (transaction) => {
        //
        return transaction.openCursor();
      }, 'readonly', (err, store) => {
        //
        if (err) {
          //
          return cb && cb(err);
        }
        //
        condition = condition || (() => true);
        //
        return handle_cursor(store, {
          condition,
          handler: ({ value }) => {
            //
            res.push(value);
          },
          cb: () => {
            //
            cb && cb(null, res);
          }
        });
      });
    }

    // 查询
    const query = (table_name, key, value, cb) => {
      //
      return handle_commit(table_name, (transaction) => {
        //
        if(Array.isArray(value)){
          //
          return transaction.index(key).openCursor(IDBKeyRange.only(value));
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/IDBKeyRange
        // query('tab_name','keyIndex',(IDBKeyRange)=>IDBKeyRange.bound([value1,value2]))
        if(typeof value === 'function'){
          //
          return transaction.index(key).openCursor(value(IDBKeyRange));
        }
        //
        return transaction.index(key).get(value);
      }, 'readonly', (err, e) => {
        //
        if (err) {
          //
          return cb && cb(err);
        }
        //
        return cb(null, e.target.result || null);
      });
    }
    // 添加文件
    const insert = (table_name, data,cb) => {
      //
      return handle_commit(table_name, undefined, 'readwrite', (err, store) => {
        //
        if (!err) {
          //
          if (Array.isArray(data)) {
            data.forEach(d => store.put(d))
          } else {
            store.put(data);
          }
        }
        //
        cb && cb(err,data);
      });
    };
    // 更新
    const update = (table_name, condition, handle, cb) => {
      let res = [];
      //
      return handle_commit(table_name, (transaction) => transaction.openCursor(), 'readwrite', (err, store) => {
        //
        if (err) {
          //
          return cb && cb(err);
        }
        //
        return handle_cursor(store, {
          condition,
          handler: ({ value, cursor }) => {
            //
            const updatedValue = handle(value);
            //
            res.push(updatedValue);
            //
            cursor.update(updatedValue);
          },
          cb: () => {
            //
            cb && cb(null, res);
          }
        });
      })
    }
    // 删除
    const del = (table_name, condition, cb) => {
      let res = [];
      //
      return handle_commit(table_name, (transaction) => transaction.openCursor(), 'readwrite', (err, store) => {
        //
        if (err) {
          //
          return cb && cb(err);
        }
        //
        return handle_cursor(store, {
          condition,
          handler: ({ value, cursor }) => {
            //
            res.push(value);
            //
            cursor.delete();
          },
          cb: () => {
            //
            cb && cb(null, res);
          }
        });
      })
    };
    // 清空表数据
    const empty = (table_name, cb) => {
      //
      return handle_commit(table_name, (transaction) => transaction.clear(), 'readwrite', () => {
        //
        cb && cb();
      })
    }

    // 不存在则插入，存在则更新
    const handle = (table_name, data,key='id',value,cb) => {
      //
      if (!Array.isArray(data)) {
        //
        data = [data];
      }
      //
      let condition = null;
      let valueHandle = null;
      if(typeof value === 'object' && value.condition){
        condition = value.condition;
        valueHandle = value.handle;
        value = value.value;
      }
      //
      let handleLength = data.length;
      //
      const callbackHandle = (err,res)=>{
        handleLength = handleLength - 1;
        if(!handleLength){
          //
          cb && cb(err,data);
        }
      }
      //
      data.forEach(item => {
        //
        let val = value || item[key];
        //
        if (val !== undefined) {
          //
          if(Array.isArray(val)){
            //
            val = val.map(v=>item[v])
          }
          if(typeof val === 'function'){
            const temp = val;
            val = function(IDBKeyRange){
              //
              return temp(IDBKeyRange,item);
            }
          }
          //
          query(table_name, key, val, (err, result) => {
            //
            if (!err) {
              // 记录存在
              if (result) {
                //
                update(table_name, (d) => {
                  //
                  if(condition){
                    //
                    return condition(d,item);
                  }
                  //
                  if (d[key] !== val) {
                    //
                    return false;
                  }
                  //
                  return true;
                }, (currentValue) => {
                  if(valueHandle){
                    //
                    return valueHandle(currentValue,item)
                  }
                  //
                  return {...currentValue,...item};
                },callbackHandle);
              } else {
                // 记录不存在
                insert(table_name, item,callbackHandle);
              }
            }
          });
        }
      })
    }
    //
    return {
      open,
      close,
      insert,
      query,
      queryAll,
      update,
      del,
      empty,
      handle
    }
  });
})();