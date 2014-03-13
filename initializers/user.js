exports.user = function(api, next){

  api.user = {

  };

  api.user._start = function(api, next){
    next();
  };

  api.user._stop =  function(api, next){
    next();
  };

  next();
};
