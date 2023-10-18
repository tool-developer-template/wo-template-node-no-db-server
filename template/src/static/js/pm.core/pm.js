/*
 * pm.js
 *
 *
            
*/


(function(undefined){
    //pm object
    var pm={};
    var utils={};
    
    var class2type={};
    var breaker={};
    var empty=function(){};
    var guid=0;
    
    var ArrayProto=Array.prototype;
    var ObjectProto=Object.prototype;
    
    var toString=ObjectProto.toString;
    var slice=ArrayProto.slice;
    
    var nativeForEach=ArrayProto.forEach;
    var nativeSome=ArrayProto.some;
    var nativeFilter=ArrayProto.filter;
    var nativeIndexOf=ArrayProto.indexOf;
    var nativeBind=ArrayProto.bind;
    var nativeMap=ArrayProto.map;
    var nativeIsArray=ArrayProto.isArray;
    var nativeKeys=Object.keys;
    
    
    //version
    pm.version='0.0.1';
    //namespace method,to bind other object
    pm.namespace=pm.ns=function(){
        var i=0;
        var args=arguments;
        var len=args.length;
        var obj={};
        
        for(;i<len;i++){
            var ns=(''+args[i]).split('.');
            var j='pm' === ns[0] ? 1 : 0;
			obj=pm;
            for(;j<ns.length;j++){
				//
                obj=obj[ns[j]]=obj[ns[j]]||{};
                //return an object
                if(len === 1 && j === ns.length - 1){
                    
                    return obj;
                }
            }
        }
        
        return obj;
    };
    
    //extend class inherit
    pm.extend=function(sp,ext){
        //
        if(!utils.isFunction(sp)){
            
            return utils.extend.apply(this,slice.call(arguments,0));
        }
        var F=function(){
            
            //call the constructor
            F.superclass.constructor.apply(this,slice.call(arguments,0));          
        };
        
        //
        F.prototype=new sp();
        //
        utils.extend(F.prototype,ext);
        //
        F.prototype.constructor=sp;
        
        sp=ext.constructor !=ObjectProto.constructor ? ext.constructor : sp.prototype.constructor;
        F.superclass=sp.prototype;
        if(F.prototype.constructor === ObjectProto.constructor){
            
            F.prototype.constructor=F;
        }
        
        return F;
    };
    
    // Helper for collection methods to determine whether a collection
    // should be iterated as an array or as an object
    // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var isArrayLike = function(collection) {
        var length = collection && collection.length;
        
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };
    //Generator function to create the findIndex and findLastIndex functions
    function createIndexFinder(dir){
        
        return function(array, predicate, context){
            var length=array != null && array.length;
            var index = dir > 0 ? 0 : length -1;
            for(;index >= 0 && index < length;index+=dir){
                if(predicate.call(context,array[index],index,array)){
                    
                    return index;
                }
            }
            
            return -1;
        };
    }
    //Internal implementation of a recursive `flatten` function.
    var flatten=function(input, shallow, strict, startIndex){
        var output=[];
        var idx=0;
        for(var i=startIndex||0,length=input && input.length;i<length;i++){
            var value=input[i];
            if(isArrayLike(value) && (utils.isArray(value) || utils.isArguments(value))){
                if(!shallow){
                    value=flatten(value,shallow,strict);
                }
                var j=0;
                var len=value.length;
                output.length+=len;
                while(j<len){
                    output[idx++]=value[j++];
                }
            }else if(!strict){
                output[idx++]=value;
            }
        }
        
        return output;
    };
    
    utils={
        type:function(value){
            return value == null ?
            String(value) :
            class2type[toString.call(value)] || 'object';
        },
        isNumberic:function(value){
            
            return !isNaN(parseFloat(value)) && isFinite(value);
        },
        isNumber:function(value){
            
            return utils.type(value) === 'number';
        },
        isString:function(value){
            
            return utils.type(value) === 'string';
        },
        isFunction:function(value){
            
            return utils.type(value) === 'function';
        },
        isObject:function(value){
            
            return value === Object(value);
        },    
        /*isJsonObject:function(value){
            
            return utils.type(value) === 'object';
        },*/
        isArray:nativeIsArray||function(value){
            
            return utils.type(value) === 'array';
        },
        isArguments:function(obj){
            
            return utils.has(obj,'callee');
        },
        has:function(obj,key){
            
            return ObjectProto.hasOwnProperty.call(obj,key);
        }
    };
    //uid
    utils.uid=function(prefix){
        
        return [prefix,++guid+''].join('');
    };
    //each method,pm.utils.each
    utils.each=utils.forEach=function(obj,iterator,context){
        var i,length;
        
        if(isArrayLike(obj)){
            for(i=0,length = obj.length;i<length;i++){
                
                iterator.call(context,obj[i],i,obj);
            }
        }else{
            var keys=utils.keys(obj);
            for(i=0,length=keys.length;i<length;i++){
                
                iterator.call(context,obj[keys[i]],keys[i],obj);
            }
        }
        
        return obj;
    };
    //return the results of applying the iterator to each element.
    utils.map=function(obj,iterator,context){
        var results=[];
        
        var keys=!isArrayLike(obj) && utils.keys(obj);
        var length=(keys||obj).length;
        var index=0;
        
        results=Array(length);
        for(;index<length;index++){
            var currentKey=keys ? keys[index] : index;
            
            results[index] = iterator.call(context,obj[currentKey],currentKey,obj);
        }
        
        return results;
    };
    //keys method,pm.utils.keys
    utils.keys=function(obj){
        if(!utils.isObject(obj)){
            
            return [];
        }
        if(nativeKeys){
            
            return nativeKeys(obj);
        }
        var keys=[];
        for(var key in obj){
            if(utils.has(obj,key)){
                keys.push(key);
            }
        }
        
        return keys;
    };
    //allKeys
    utils.allKeys=function(obj){
        if(!utils.isObject(obj)){
            
            return [];
        }
        var keys=[];
        for(var key in obj){
            keys.push(key);
        }
        //ahem IE <9
        
        return keys;
    };
    //retrieve the values of an object's properties.
    utils.values=function(obj){
        var keys=utils.keys(obj);
        var len=keys.length;
        var values=Array(len);
        var i=0;
        for(;i<len;i++){
            values[i]=obj[keys[i]];
        }
        
        return values;
    };
    //extend method,pm.utils.extend
    utils.extend=function(obj){
        var len=arguments.length;
        if(len < 2 || obj == null){
            
            return obj;
        }
        var index=1;
        for(;index<len;index++){
            var source=arguments[index];
            var keys=utils.allKeys(source);
            var l=keys.length;
            var i=0;
            for(;i<l;i++){
                var key=keys[i];
                obj[key]=source[key];
            }
        }
        
        return obj;
    };
    //keep the identity function around for default iterators
    utils.identity=function(value){
        
        return value;
    };
    //at lease one elemeent in the object matches ,return truth
    utils.any=utils.some=function(obj,predicate,context){
        predicate=predicate||utils.identity;
        var keys=!isArrayLike(obj) && utils.keys(obj);
        var length=(keys || obj).length;
        var index=0;
        for(;index<length;index++){
            var currentKey=keys ? keys[index] : index;
            if(predicate(obj[currentKey],currentKey,obj)){
                
                return true;
            }
        }
        
        return false;
    };
    //the array or object contains a given value (using '===')
    utils.contains=function(obj,target,fromIndex){
        if(!isArrayLike(obj)){
            obj=utils.values(obj);
        }
        
        return utils.indexOf(obj,target,typeof fromIndex === 'number' && fromIndex ) >= 0;
    };
    //
    utils.indexOf=function(array,item,isSorted){
        var i=0;
        var length=array && array.length;
        if(typeof isSorted === 'number'){
            
            i=isSorted < 0 ? Math.max(0,length+isSorted) : isSorted;
        }else if(isSorted && length){
            
            i=utils.sortedIndex(array,item);
            
            return array[i] === item ? i : -1;
        }
        if(item !== item){
            
            return utils.findIndex(slice.call(array,i),utils.isNaN);
        }
        for(;i<length;i++){
            if(array[i] === item){
                
                return i;
            }
        }
        
        return -1;
    };
    //
    utils.sortedIndex=function(array, obj, iteratee, context){
        
        var value=iteratee.call(context,obj);
        var low=0;
        var high=array.length;
        while(low < high){
            var mid=Math.floor((low + high) / 2);
            if(iteratee.call(context,array[mid] < value)){
                low=mid+1;
            }else{
                high=mid;
            }
        }
        
        return low;
    };
    //returns the first index on an array-like that passes a predicate test
    utils.findIndex=createIndexFinder(1);
    utils.findLastIndex=createIndexFinder(-1);
    
    //return a copy of the object only containing the whitelisted properties.
    utils.pick=function(object, oiteratee, context){
        var result={},obj=object,iteratee,keys;
        if(obj == null){
            
            return result;
        }
        if(utils.isFunction(oiteratee)){
            keys=utils.allKeys(obj);
            iteratee=oiteratee;
        }else{
            keys=flatten(arguments,false,false,1);
            iteratee=function(value,key,obj){
                
                return key in obj;
            };
            obj=Object(obj);
        }
        for(var i=0,length=keys.length;i<length;i++){
            var key=keys[i];
            var value=obj[key];
            if(iteratee.call(context,value,key,obj)){
                
                result[key]=value;
            }
        }
        
        return result;
    };
    //negate
    utils.negate=function(predicate){
        
        return function(){
            
            return !predicate.apply(this,arguments);
        };
    };
    //
    utils.omit=function(obj,iteratee,context){
        if(utils.isFunction(iteratee)){
            iteratee=utils.negate(iteratee);
        }else{
            var keys=utils.map(flatten(arguments,false,false,1),String);
            iteratee=function(value,key){
                
                return !utils.contains(keys,key);
            };
        }
        
        return utils.pick(obj,iteratee,context);
    };
    //take the difference between one array and a number of other arrays
    utils.difference=function(array){
        var rest=flatten(arguments,true,true,1);
        
        return utils.filter(array,function(value){
            
            return !utils.contains(rest,value);
        });
    };
    //return all the elements that pass a truth test
    utils.filter=function(obj,predicate,context){
        var results=[];
        if(obj === null){
            
            return results;
        }
        if(nativeFilter && obj.filter === nativeFilter){
            
            return obj.filter(predicate,context);
        }
        utils.each(obj,function(value,index,list){
            if(predicate.call(context,value,index,list)){
                
                results.push(value);
            }
        });
        
        return results;
    };
    //return result,if 'property' is a function then invoke it and return result,otherwise,return it
    utils.result=function(object,property,fallback){
        var value=object == null ? void 0 : object[property];
        if(value === void 0){
            value=fallback;
        }
        
        return utils.isFunction(value) ? value.call(object) : value;
    };
    //
    utils.bind=function(func,context){
        if(nativeBind && func.bind === nativeBind){
            
            return nativeBind.apply(func,slice.call(arguments,1));
        }
        if(!utils.isFunction(func)){
            
            throw new TypeError('Bind must be called on a function');
        }
        var args=slice.call(arguments,2);
        var bound=function(){
            if(!(this instanceof bound)){
                
                return func.apply(context,args.concat(slice.call(arguments)));
            }
            empty.prototype=func.prototype;
            var self=new empty();
            empty.prototype=null;
            var result=func.apply(self,args.concat(slice.call(arguments)));
            if(Object(result) === result){
                
                return result;
            }
            
            return self;
        };
        
        return bound;
    };
    
    //other extend
    var bl={
        'true':true,
        '1':true,
        'false':false,
        '0':false,
        'null':false,
        'undefined':false
    };
    //
    function eq(a,b){
        // 0 === -0
        if(a === b){
            
            return a !== 0 || 1/a == 1/b;
        }
        //null == undefined
        if(a == null || b == null){
            
            return a === b;
        }
        var className=toString.call(a);
        if(className != toString(b)){
            
            return false;
        }
        switch(className){
            case '[object String]':
            case '[object RegExp]':
                
                return ''+a == ''+b;
            case '[object Number]':
                if(+a !== +a){
                    
                    return +b !== +b;
                }
                
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                
                return +a == +b;
        }
        var areArrays=className === '[object Array]';
        if(!areArrays){
            if (typeof a != 'object' || typeof b != 'object'){
            
                return false;
            }
            //
            var aCtor=a.constructor;
            var bCtor=b.constructr;
            if(aCtor !== bCtor && !(utils.isFunction(aCtor) && (aCtor instanceof aCtor) && utils.isFunction(bCtor) && (bCtor instanceof bCtor)) && ('constructor' in a && 'constructor' in b)){
                
                return false;
            }
        }
        //
        var length=0;
        if(areArrays){
            length=a.length;
            if(length !== b.length){
                
                return false;
            }
            while (length--) {
                if(!eq(a[length],b[length])){
                    
                    return false;
                }
            }
        }else{
            var keys=utils.keys(a),
                key;
            length=keys.length;
            if(utils.keys(b).length !== length){
                
                return false;
            }
            while(length--){
                key=keys[length];
                if(!utils.has(b,key) && eq(a[key],b[key])){
                    
                    return false;
                }
            }
        }
        
        return true;
    }
    //
    utils.extend(utils,{
        toBoolean:function(value){
            if(typeof value !== 'boolean'){
                if(!value){
                    
                    return false;
                }
                if(utils.isObject(value)){
                    
                    return !utils.isEmpty(value);  
                }
                value=value+'';
                value=value.toLowerCase();
                
                return bl[value] === undefined ? true : bl[value];
            }

            return value;
        },
        isEmpty:function(obj){
            if(obj === null){
                
                return true;
            }
            //array or string
            if(isArrayLike(obj) && (utils.isArray(obj) || utils.isString(obj) || utils.isArguments(obj))){
                
                return obj.length === 0;
            }
            
            return utils.keys(obj).length === 0;
        },
        isEqual:function(a,b){
            
            return eq(a,b);
        }
    });
    
    //class2type object
    utils.each("Boolean,Number,String,Function,Array,Date,RegExp,Object".split(","), function(name,i) {
        
        class2type[ "[object " + name + "]" ] = name.toLowerCase();
    });
    
    //utils,pm.utils
    pm.ns('utils');
    pm.utils=utils;
    //define pm.utils
    module.declare('pm.utils',function(){
        
        return utils;
    });
    
    //
    module.declare('pm',function(require){
        
        return pm;
    });
})();