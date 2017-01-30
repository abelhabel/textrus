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
    var mv = this;
    var container = make('div', '#main-view');
    var title = make('div', '.title');
    var body = make('div', '.body');
    var exportText = make('div', '.button');
    exportText.innerText = 'Export';
    body.contentEditable = false;
    title.textContent = 'You see:';
    container.appendChild(title);
    container.appendChild(body);
    container.appendChild(exportText);
    document.body.appendChild(container);

    this.tags = function() {
      return {
        container: container,
        title: title,
        body: body
      }
    }
    this.mode = 'off';
    listen(mv, body, 'keyup', 'innerHTML', this.setBody.bind(this));

    exportText.addEventListener('click', function() {
      console.log(body.innerText);
    })
  }

  function listen(caller, tag, event, key, fn) {
    tag.addEventListener(event, function(e) {
      fn.call(caller, e, e.target[key]);
    })
  }

  window.addEventListener('keyup', function(e) {
    var body = mainView.tags().body;
    if(e.key == 'Enter' && mainView.mode != 'edit') {
      mainView.mode = 'edit';
      body.contentEditable = true;
      body.focus();
      var range = document.createRange();
      var sel = window.getSelection();
      console.log(mainView.selection);
      if(mainView.selection) {
        range.setStart(mainView.selection.child, mainView.selection.baseOffset);
      } else {
        range.setStart(body,0);
      }
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      console.log(sel);
    }
    if(e.key == 'Escape') {
      mainView.mode = 'off';
      body.contentEditable = false;
    }
  })

  MainView.prototype.setBody = function(e, val) {
    if(this.mode == 'edit') {
      this.body = val;
      console.log(window.getSelection())
      var sel = window.getSelection();
      this.selection = {
        baseOffset: sel.baseOffset,
        child: sel.focusNode.parentNode
      }
      return this;
    }
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

    Object.keys(ControlPanel.views).forEach(function(key) {
      mainView.body = wrapText(mainView.body, ControlPanel.views[key].name);
    })
    mainView.tags().body.innerHTML = mainView.body;
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

    listen(this, row.value, 'change', 'value', function(val) {
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
    var reg = new RegExp("([>\\s]|^)("+word+")([<\\s]|$)", 'g');
    return text.replace(reg, "$1" + wrap(word) + "$3");
  }

  window.addEventListener('click', function(e) {
    if(e.target.classList.contains('view-text')) {
      settings.renderView(e.target.textContent);
    }
  })

  mainView.tags().body.addEventListener('mouseup', function() {
    var selection = window.getSelection().toString();
    if(!selection.toString()) return;
    settings.createView(selection);

  })


});
