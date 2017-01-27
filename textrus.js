window.addEventListener('load', function() {
  function make(tag, name) {
    var d = document.createElement(tag);
    if(name) {
      if(name.charAt(0) == '.') d.className = name.substr(1);
      if(name.charAt(0) == '#') d.id = name.substr(1);
    }
    return d;
  }

  function MainView(o) {
    var container = make('div', '#main-view');
    var title = make('div', '.title');
    var body = make('div', '.body');
    body.contentEditable = true;
    title.textContent = 'You see:';
    container.appendChild(title);
    container.appendChild(body);
    document.body.appendChild(container);

    this.tags = function() {
      return {
        container: container,
        title: title,
        body: body
      }
    }

    listen(body, 'keyup', 'textContent', this.setBody.bind(this));
  }

  function listen(tag, event, key, fn) {
    tag.addEventListener(event, function(e) {
      console.log(e)
      // fn(e.target[key]);
    })
  }

  MainView.prototype.setBody = function(val) {
    this.body = val;
    return this;
  }

  MainView.prototype.render = function(part) {
    this.tags()[part].innerHTML = this.body;
  }

  function MainInput(o) {
    var container = make('div', '#main-input');
    var input = make('input');
    input.type = 'text';

    container.appendChild(input);
    o.container.appendChild(container);
  }

  function View(name) {
    this.name = name;
    this.sense = 'visual';
    this.on = {};
  }

  function ControlPanel(o) {
    var container = make('div', '#control-panel');

    document.body.appendChild(container);

    this.tags = function() {
      return {
        container: container
      }
    }
  }
  ControlPanel.views = {};
  ControlPanel.prototype.createView = function(name) {
    var view;
    if(ControlPanel.views.hasOwnProperty(name)) {
      view = ControlPanel.views[name];
    } else {
      ControlPanel.views[name] = view = new View(name);

    }

    var text = wrapText(mainView.body, view.name);
    console.log(text);
    mainView.tags().body.innerHTML = text;
    this.renderView(name);
  }

  ControlPanel.prototype.renderView = function(viewName) {
    var c = this.tags().container;
    c.innerHTML = '';
    var view = ControlPanel.views[viewName];
    var name = make('div', '.label');
    name.textContent = view.name;
    var sense = make('div', '.label');
    sense.textContent = view.sense;

    var row = create.row('on', 'select');
    ['visual', 'audial', 'tactile']
    .forEach(function(s) {
      row.value.appendChild(create.option(s));
    });

    listen(row.value, 'change', 'value', function(val) {
      view.sense = val;
      console.log(view);
    })

    c.appendChild(name);
    c.appendChild(sense);
    c.appendChild(row.row);

  }

  var create = {
    row: function(text, valueTag) {
      var r = make('div', '.row-container');
      var l = make('div', '.row-label');
      l.textContent = text;
      var v = make(valueTag || 'div', '.row-value');
      r.appendChild(l);
      r.appendChild(v);
      return {
        row: r,
        label: l,
        value: v
      }
    },
    option: function(val) {
      var o = make('option');
      o.value = val;
      o.innerHTML = val;
      return o;
    }
  }

  var settings = new ControlPanel();




  var mainView = new MainView();

  var mainInput = new MainInput({
    container: mainView.tags().container
  })

  function wrap(w) {
    return "<span class='view-text'>" + w + "</span>";
  }

  function wrapText(text, word, className) {
    var out = '', l = word.length;
    var m = new RegExp(word, 'g');
    var r = text.match(m);

    // console.log(r);
    // console.log(text.indexOf(word))
    var w = '';
    for(var i = 0; i < text.length; i += 1)  {
      w = text.substr(i, l)
      console.log('params', w, i, l)
      if(w != word
        || i && text.charAt(i -1) != ' '
        || (i + l != text.length && !text.charAt(i + l -1).match(/[a-zA-Z0-9]/))
      ) {
        out += text.charAt(i);
        continue;
      }
      console.log('match')
      out += wrap(word);
      i += l -1;

    }

    return out;
  }

  window.addEventListener('click', function(e) {
    console.log(e);
    if(e.target.classList.contains('view-text')) {
      settings.renderView(e.target.textContent);
    }
  })

  mainView.tags().body.addEventListener('mouseup', function() {
    var selection = window.getSelection().toString();
    if(!selection.toString()) return;
    console.log(selection);
    settings.createView(selection);

  })


});
