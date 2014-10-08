(function () {
  var socket = io();
  socket.emit('auth', userId);

  socket.on('dataUpdate', function(tag) {
    if (tag.rate > 60) {
      tag.rate = (tag.rate / 60).toFixed(2);
    }
  });

  document.getElementById('submit').onclick = function () {
    document.getElementById('tagForm').submit();
  };

  var tags = document.getElementsByClassName('tag', 'li', document.getElementById('tags'));

  for (var i=0; i < tags.length; i++) {
    tags[i].onclick = function(){
      socket.emit('toggleTagSelect', this.dataset.used, this.innerHTML.substr(1), userId);
      this.dataset.used = (this.dataset.used === 'true') ? 'false' : 'true';
      var parent = document.getElementById('stats');
      if (this.dataset.used !== 'true') {
        var articles = document.getElementsByTagName('article');
        for (var i = 0; i < articles.length; i++) {
          if (articles[i].dataset.index === this.dataset.index) {
            parent.removeChild(articles[i]);
          }
        }
      }
      else {
        parent.innerHTML += "<article data-index='"+ this.dataset.index +"'><h2>"+ this.innerHTML +"</h2></article>";
      }
    };
  }
})();