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
      var sel = window.getSelection();
      this.selection = {
        baseOffset: sel.baseOffset,
        child: sel.focusNode.parentNode
      }
      return this;
    }
  }

  MainView.prototype.render = function() {
    var mv = this;
    Object.keys(ControlPanel.views).forEach(function(key) {
      console.log(key)
      mv.body = wrapText(mv.body, ControlPanel.views[key].name);
    })
    console.log('rerendering mainview', mainView)
    mainView.tags().body.innerHTML = mainView.body;
  }

  MainView.prototype.remove = function(viewName) {
    console.log(this.body)
    this.body = unwrapText(this.body, '');
    this.body = unwrapText(this.body, viewName);
    console.log('removed', viewName, this.body);
    this.tags().body.innerHTML = this.body;
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
    this.senses = {
      visual: '',
      audial: '',
      tactile: ''
    };
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


    this.renderView(name);
  }

  ControlPanel.prototype.renderView = function(viewName) {
    var cp = this;
    var c = this.tags().container;
    c.innerHTML = '';
    var view = ControlPanel.views[viewName];
    var name = create.row('Name');
    var remove = make('div', '.button');
    remove.textContent = 'Delete';
    name.value.textContent = viewName;

    var sensorySection = create.section('Senses');
    Object.keys(view.senses)
    .forEach(function(s) {
      var row = create.row(s, 'textarea');
      row.value.value = view.senses.visual;
      sensorySection.body.appendChild(row.row);
    });

    remove.addEventListener('click', function() {
      delete ControlPanel.views[viewName];
      c.innerHTML = '';
      mainView.remove(viewName);
    })

    c.appendChild(name.row);
    c.appendChild(sensorySection.container);
    c.appendChild(remove);

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
    },
    section: function(title) {
      var c = make('div', '.controlpanel-section');
      var t = make('div', '.controlpanel-title');
      var b = make('div', '.controlpanel-body');
      c.appendChild(t);
      c.appendChild(b);
      t.textContent = title || '';

      return {
        container: c,
        title: t,
        body: b
      }
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

  function unwrapText(text, word, className) {
    var reg = new RegExp("<span class='view-text'>"+ word +"</span>", 'g');
    return text.replace(reg, word);
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
    if(!selection) return;
    settings.createView(selection.trim());
    mainView.render();
    console.log(mainView.body)
  })


});
