exports.blog = function(api, next){

  api.blog = {
    // Constants
    separator: ';',
    postPrefix: 'posts',
    commentPrefix: 'comments',
    // Posts
    postAdd: function(userName, title, content, next) {

    },

    postView: function(userName, title, next) {

    },

    postsList: function(userName, next) {

    },

    postEdit: function(userName, title, content, next) {

    },

    postDelete: function(userName, title, next) {

    },
    // Comments
    commentAdd: function(userName, title, commentorName, comment, next) {

    },
    commentsView: function(userName, title, next) {

    },
    commentDelete: function(userName, title, commentId, next) {

    }
  };

  api.blog._start = function(api, next){
    next();
  };

  api.blog._stop =  function(api, next){
    next();
  };

  next();
};
