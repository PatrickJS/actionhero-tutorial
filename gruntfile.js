var grunt = require('grunt');
var fs    = require('fs');
var path  = require('path');

var actionheroRoot = function() {
  var rv;
  if(fs.existsSync(__dirname + '/actionhero.js')){
    // in the actionhero project itself
    rv = __dirname;
  } else if(fs.existsSync(__dirname + '/../actionhero.js')){
    // running from /grunt in the actionhero project itself
    rv =  __dirname + '/../';
  } else if(fs.existsSync(__dirname + '/node_modules/actionhero/actionhero.js')){
    // running from a project's node_modules (bin or actionhero)
    rv = __dirname + '/node_modules/actionhero';
  } else {
    // installed globally
    rv = path.normalize(__dirname);
  }
  return rv;
};

var init = function(fn, configChanges){
  var root = actionheroRoot();
  var ActionHeroPrototype = require(root + '/actionhero.js').actionheroPrototype;
  var actionhero = new ActionHeroPrototype();

  if (configChanges === null) {
    configChanges = {
      logger: {
        transports: null
      }
    };
  }
  actionhero.initialize({configChanges: configChanges}, function(err, api){
    fn(api, actionhero);
  });
};

grunt.registerTask('list','List your actions and metadata',function(){
  var done = this.async();
  init(function(api) {
    for (var actionName in api.actions.actions) {
      grunt.log.writeln(actionName);
      var collection = api.actions.actions[actionName];
      for(var version in collection){
        var action = collection[version];
        grunt.log.writeln('  ' + 'version: ' + version);
        grunt.log.writeln('    ' + action.description);
        grunt.log.writeln('    ' + 'required inputs: ' + action.inputs.required.join(', '));
        grunt.log.writeln('    ' + 'optional inputs: ' + action.inputs.optional.join(', '));
      }
    }
    done();
  });
});

grunt.registerTask('enqueueAllPeriodicTasks','This will enqueue all periodic tasks (could lead to duplicates)',function(){
  var done = this.async();
  init(function(api) {
    api.resque.startQueue(function() {
      api.tasks.enqueueAllRecurrentJobs(function(loadedTasks) {
        grunt.log.writeln('loaded tasks: ' + loadedTasks.join(', '));
        done();
      });
    });
  });
});

grunt.registerTask('enqueuePeriodicTask','Enqueue a periodic task (:taskName)',function(taskName){
  var done = this.async();
  init(function(api) {
    if (!api.tasks.tasks[taskName]) { throw new Error('Task not found'); }
    api.resque.startQueue(function() {
      // enqueue to run ASAP
      api.tasks.enqueue(taskName, function(err, toRun){
        if (err) { throw err; }
        if (toRun === true) {
          grunt.log.writeln('loaded task: ' + taskName);
        } else {
          grunt.log.writeln(taskName + ' not enqueued');
        }
        done();
      });
    });
  });
});

grunt.registerTask('stopPeriodicTask','Remove an enqueued periodic task (:taskName)',function(taskName) {
  var done = this.async()
  init(function(api){
    if (!api.tasks.tasks[taskName]) { throw new Error('Task not found'); }
    api.resque.startQueue(function() {
      api.tasks.stopRecurrentJob(taskName, function(error, count) {
        grunt.log.writeln('removed ' + count + ' instances of ' + taskName);
        done();
      });
    });
  });
});

grunt.registerTask('flushRedis','Clear the entire actionhero redis database',function() {
  var done = this.async();
  init(function(api) {
    api.redis.client.flushdb(function(err) {
      if (err) { throw err; }
      grunt.log.writeln('flushed');
      done();
    });
  });
});

grunt.registerTask('clearCache','Clear the actionhero cache',function() {
  var done = this.async();
  init(function(api) {
    api.cache.clear(function(error, count) {
      if(error) { throw error; }
      grunt.log.writeln('cleared ' + count + ' items from the cache');
      done();
    });
  });
});

grunt.registerTask('dumpCache','Save the current cache as a JSON object (:file)',function(file) {
  var done = this.async();
  init(function(api) {
    if (file === undefined) { file = 'cache.dump'; }
    api.cache.dumpWrite(file, function(error, count) {
      if (error) { throw error; }
      grunt.log.writeln('dumped ' + count + ' items from the cache to ' + file);
      done();
    });
  });
});

grunt.registerTask('loadCache','Set the cache from a file (overwrites existing cache) (:file)',function(file){
  var done = this.async();
  init(function(api) {

    if (file == null) { file = 'cache.dump' }
    api.cache.dumpRead(file, function(error, count){
      if (error) { throw error; }
      grunt.log.writeln('cleared the cache and then loaded ' + count + ' items from ' + file);
      done();
    });
  });
});
