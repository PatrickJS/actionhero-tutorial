exports.blog = function(api, next){

  api.blog = {};

  api.blog._start = function(api, next){
    next();
  };

  api.blog._stop =  function(api, next){
    next();
  };

  next();
}