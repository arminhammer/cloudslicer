(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/EditorManager.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/26/15.
 */

var GuiUtil = require('./gui.util');
var Collection = require('./collection');
var AWS_Users = require('./aws/AWS_Users');
var AWS_EC2_Instance = require('./aws/AWS_EC2_Instance');
var AWS_EC2_EIP = require('./aws/AWS_EC2_EIP');
var AWS_EC2_SecurityGroup = require('./aws/AWS_EC2_SecurityGroup');

var EditorManager = function(template) {

  var self = this;

  var fpsStats = new Stats();
  fpsStats.setMode(0);
  // align top-left
  fpsStats.domElement.style.position = 'absolute';
  fpsStats.domElement.style.left = '0px';
  fpsStats.domElement.style.top = '0px';
  document.body.appendChild( fpsStats.domElement );

  var msStats = new Stats();
  msStats.setMode(1);
  // align top-left
  msStats.domElement.style.position = 'absolute';
  msStats.domElement.style.left = '80px';
  msStats.domElement.style.top = '0px';
  document.body.appendChild( msStats.domElement );

  var mbStats = new Stats();
  mbStats.setMode(2);
  // align top-left
  mbStats.domElement.style.position = 'absolute';
  mbStats.domElement.style.left = '160px';
  mbStats.domElement.style.top = '0px';
  document.body.appendChild( mbStats.domElement );


  fps = 60;
  var now;
  var then = Date.now();
  var interval = 1000/fps;
  var delta;
  //var meter = new FPSMeter();
  var winDimension = GuiUtil.getWindowDimension();
  var grid = null;

  self.renderer = PIXI.autoDetectRenderer(winDimension.x, winDimension.y, {backgroundColor : 0xFFFFFF});

  self.stage = new PIXI.Stage();
  self.stage.name = 'stage';
  self.stage.selected = null;
  self.stage.clickedOnlyStage = true;
  self.stage.interactive = true;
  self.stage.on('mouseup', function() {
    if(self.stage.clickedOnlyStage) {
      console.log('Found stage click');
      if(self.stage.selected) {
        console.log(self.stage.selected);
        self.stage.selected.filters = null;
        self.stage.selected = null;
      }
    }
    else {
      self.stage.clickedOnlyStage = true;
    }
  });

  self.stage.MANAGER = self;

  self.securitygroups = new Collection();
  self.elements = new Collection();

  var collisionmanager = function() {

    var collSelf = this;

    collSelf.secGroupVsElements = function() {
      var secGrps = self.securitygroups;
      var elems = self.elements;

      _.each(secGrps.elements, function(s) {

        _.each(elems.elements, function(e) {

          var xdist = s.position.x - e.position.x;

          if(xdist > -s.width/2 && xdist < s.width/2)
          {
            var ydist = s.position.y - e.position.y;

            if(ydist > -s.height/2 && ydist < s.height/2)
            {
              //  console.log('Collision detected!');
            }
          }

        });

      });

    };

    collSelf.update = function() {
      collSelf.secGroupVsElements();
    };

  };

  self.CollisionManager = new collisionmanager();

  self.animate = function(time) {

    now = Date.now();
    delta = now - then;

    if (delta > interval) {
      fpsStats.begin();
      msStats.begin();
      mbStats.begin();

      //self.CollisionManager.update();

      then = now - (delta % interval);
      //meter.tick();

      TWEEN.update(time);
      self.renderer.render(self.stage);

      fpsStats.end();
      msStats.end();
      mbStats.end();
    }

    requestAnimationFrame(self.animate);
  };

  self.gridOn = function() {
    grid = GuiUtil.drawGrid(winDimension.x, winDimension.y);
    self.stage.addChild(grid);
  };

  self.gridOff = function() {
    self.stage.removeChild(grid);
    self.grid = null;
  };

  self.onLoaded = function() {
    console.log('Assets loaded');

    var dim = GuiUtil.getWindowDimension();
    console.log(self.elements.position);

    var users = new AWS_Users('users', dim.x/2, 100);
    console.log(users.position);
    self.elements.add(users);

    console.log(template.Resources);

    var groupings = _.reduce(template.Resources, function(result, n, key) {
      result[n.Type] = {};
      result[n.Type][key] = n;
      return result
    }, {});
    console.log('Groupings:');
    console.log(groupings);

    var instances = {};
    _.each(groupings['AWS::EC2::Instance'], function(n, key) {
      var instance = new AWS_EC2_Instance(key, dim.x/2, 400);
      instances[key] = instance;
    });

    var eips = {};
    _.each(groupings['AWS::EC2::EIP'], function(n, key) {
      console.log('Adding EIP ', key);
      var eip = new AWS_EC2_EIP(key, dim.x/2, 500);
      eips[key] = eip;
    });

    var secgroups = {};
    _.each(groupings['AWS::EC2::SecurityGroup'], function(n, key) {
      console.log('Adding Security Group ', key);
      var secgroup = new AWS_EC2_SecurityGroup(key, dim.x/2, 500);
      secgroups[key] = secgroup;
    });

    var comboInstances = {};
    _.each(groupings['AWS::EC2::EIPAssociation'], function(n, key) {
      console.log('Checking association');
      console.log(n);
      console.log(key);
      console.log(eips);
      console.log('Ref: ',n.Properties.EIP.Ref);
      var instance = instances[n.Properties.InstanceId.Ref];
      if(instance) {
        var eip = eips[n.Properties.EIP.Ref];
        if(eip) {
          console.log('Association has a match!');
          var container = new Collection();
          container.add(instance);
          container.add(eip);
          comboInstances[key] = container;
          delete instances[n.Properties.InstanceId.Ref];
          delete eips[n.Properties.EIP.Ref];
        }
      }
      //var eip = new AWS_EC2_EIP(key, dim.x/2, 500);
      //eips[key] = eip;
    });

    _.each(secgroups, function(s, key) {
      self.securitygroups.add(s);
    });

    _.each(comboInstances, function(combo, key) {
      self.elements.add(combo);
    });

    _.each(instances, function(instance, key) {
      self.elements.add(instance);
    });

    _.each(eips, function(eip, key) {
      self.elements.add(eip);
    });

    console.log('Children:');
    console.log(self.elements.children);

    self.stage.addChild(self.securitygroups);
    self.stage.addChild(self.elements);
    console.log(self.stage.children);

    var menuSprite = new PIXI.Sprite();
    menuSprite.texture = PIXI.Texture.fromFrame('Compute_&_Networking_Amazon_EC2_Instance.png');
    menuSprite.scale.set(0.2);
    menuSprite.y = dim.y/2;
    menuSprite.x = dim.x-40;
    menuSprite.interactive = true;
    menuSprite.buttonMode = true;
    menuSprite.anchor.set(0.5);
    menuSprite
      .on('mouseover', function() {
        var self = this;
        self.scale.set(self.scale.x*1.2);
      })
      .on('mouseout', function() {
        var self = this;
        self.scale.set(self.scale.x/1.2);
      })
      .on('mouseup', function() {
        console.log('Clicked.');
        var instance = new AWS_EC2_Instance('New_Instance', dim.x/2, dim.y/2);
        self.elements.add(instance);
      });
    self.stage.addChild(menuSprite);

    var menuSecGroup = new PIXI.Sprite();
    var menuGraphic = new PIXI.Graphics();
    menuGraphic.lineStyle(3, 0x000000, 1);
    menuGraphic.beginFill(0xFFFFFF, 1);
    menuGraphic.drawRoundedRect(0,0,30,30,6);
    menuGraphic.endFill();
    menuSecGroup.texture = menuGraphic.generateTexture();

    menuSecGroup.interactive = true;
    menuSecGroup.buttonMode = true;
    menuSecGroup.position.y = dim.y/2+40;
    menuSecGroup.position.x = dim.x-40;
    menuSecGroup.scale.set(1.0);
    menuSecGroup.anchor.set(0.5);
    menuSecGroup
      .on('mouseover', function() {
        var self = this;
        self.scale.set(self.scale.x*1.1);
      })
      .on('mouseout', function() {
        var self = this;
        self.scale.set(self.scale.x/1.1);
      })
      .on('mouseup', function() {
        console.log('Clicked.');
        var instance = new AWS_EC2_SecurityGroup('New_Security_Group', dim.x/2, dim.y/2);
        self.securitygroups.add(instance);
      });
    self.stage.addChild(menuSecGroup);
  };

  self.init = function() {
    self.gridOn();
    PIXI.loader
      .add('../resources/sprites/sprites.json')
      .load(self.onLoaded);
  }

};

module.exports = EditorManager;

},{"./aws/AWS_EC2_EIP":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_EIP.js","./aws/AWS_EC2_Instance":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_Instance.js","./aws/AWS_EC2_SecurityGroup":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_SecurityGroup.js","./aws/AWS_Users":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_Users.js","./collection":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/collection.js","./gui.util":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_EIP.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/19/15.
 */

var Element = require('../element');
var DragDrop = require('../drag.drop');

var AWS_EC2_EIP = function(name,x,y) {
  Element.call(this);
  var self = this;
  self.name = name;
  self.scale.set(0.3);
  self.texture = PIXI.Texture.fromFrame('Compute_&_Networking_Amazon_EC2_Elastic_IP.png');
  self.position.x = x;
  self.position.y = y;
};
AWS_EC2_EIP.prototype = Object.create(Element.prototype);

module.exports = AWS_EC2_EIP;

},{"../drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js","../element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/element.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_Instance.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/19/15.
 */

var Element = require('../element');
var DragDrop = require('../drag.drop');

var AWS_EC2_Instance = function(name,x,y) {
  Element.call(this);
  var self = this;
  self.name = name;
  self.texture = PIXI.Texture.fromFrame('Compute_&_Networking_Amazon_EC2_Instance.png');
  self.position.x = x;
  self.position.y = y;

  self.securityGroup = null;
};
AWS_EC2_Instance.prototype = Object.create(Element.prototype);

module.exports = AWS_EC2_Instance;

},{"../drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js","../element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/element.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_SecurityGroup.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/21/15.
 */

var Element = require('../element');

var AWS_EC2_SecurityGroup = function(name,x,y) {
  Element.call(this);

  var self = this;
  self.name = name;

  var graphic = new PIXI.Graphics();
  graphic.lineStyle(3, 0x000000, 1);
  graphic.beginFill(0xFFFFFF, 0.0);
  graphic.drawRoundedRect(0,0,200,200,10);
  graphic.endFill();

  self.texture = graphic.generateTexture();
  self.position.x = x;
  self.position.y = y;

};
AWS_EC2_SecurityGroup.prototype = Object.create(Element.prototype);

module.exports = AWS_EC2_SecurityGroup;

},{"../element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/element.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_Users.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/19/15.
 */

var Element = require('../element');
var DragDrop = require('../drag.drop');

var AWS_Users = function(name,x,y) {
  Element.call(this);
  var self = this;
  self.name = name;
  self.texture = PIXI.Texture.fromFrame('Non-Service_Specific_copy_Users.png');
  self.position.x = x;
  self.position.y = y;

};
AWS_Users.prototype = Object.create(Element.prototype);

module.exports = AWS_Users;

},{"../drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js","../element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/element.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/collection.js":[function(require,module,exports){
/**
 * Created by arming on 9/21/15.
 */
/**
 * Created by arming on 9/15/15.
 */

var Collection = function() {
  PIXI.Container.call(this);
  var self = this;

  self.elements = {};

  self.add = function(element) {
    self.addChild(element);
    self.elements[element.name] = element;
  };

  self.remove = function(element) {
    self.removeChild(element);
    delete self.elements[element.name];
  };

};
Collection.prototype = Object.create(PIXI.Container.prototype);

module.exports = Collection;

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/14/15.
 */

var MOUSE_OVER_SCALE_RATIO = 1.1;

var DragDrop = {

  onDragStart: function(event) {
    console.log();
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
    this.moved = false;
  },

  onDragEnd: function() {
    var self = this;
    if(this.moved) {
      console.log('Found click while dragging');
      this.alpha = 1;
      this.dragging = false;
      this.moved = false;
      this.data = null;

      if(!this.securityGroup) {

          //console.log('Parent');
        //console.log(self.parent.parent.MANAGER);
          var secGrps = self.parent.parent.MANAGER.securitygroups;

          _.each(secGrps.elements, function(s) {

              var xdist = s.position.x - self.position.x;

              if(xdist > -s.width/2 && xdist < s.width/2)
              {
                var ydist = s.position.y - self.position.y;

                if(ydist > -s.height/2 && ydist < s.height/2)
                {
                    console.log('Collision detected!');
                  self.position.x = 0;
                  self.position.y = 0;
                  self.securityGroup = s;
                    s.addChild(self);
                  console.log(self);
                  console.log(s);
                }
              }

          });

      }
    }
    else {
      console.log('Found click while NOT dragging');
      var shadow = new PIXI.filters.DropShadowFilter();
      this.filters = [shadow];
      this.alpha = 1;
      this.dragging = false;
      console.log('Parent:');
      console.log(this.parent.parent);
      if(this.parent.parent.selected) {
        this.parent.parent.selected.filters = null;
        this.parent.parent.selected = null;
      }
      this.parent.parent.clickedOnlyStage = false;
      this.parent.parent.selected = this;
    }
  },

  onDragMove: function() {
    var self = this;
    if (self.dragging)
    {
      var newPosition = self.data.getLocalPosition(self.parent);
      self.position.x = newPosition.x;
      self.position.y = newPosition.y;
      self.moved = true;
    }
  },

  onMouseOver: function() {
    //console.log('Moused over!');
    var self = this;
    self.scale.set(self.scale.x*MOUSE_OVER_SCALE_RATIO);
    var iconSize = 10;

    var global = self.toGlobal(self.position);
    //console.log('official: ' + self.position.x + ':' + self.position.y);
    //console.log('GLOBAL: ' + global.x + ':' + global.y);
    //console.log(self.getLocalBounds());

    var scaleLocations = [
      {x: 0, y: 0-self.getLocalBounds().height/2-iconSize/2, size: iconSize},
      {x: 0-self.getLocalBounds().width/2-iconSize/2, y: 0, size: iconSize},
      {x: self.getLocalBounds().width/2+iconSize/2, y: 0, size: iconSize},
      {x: 0, y: self.getLocalBounds().height/2+iconSize/2, size: iconSize}
    ];

    //console.log(scaleLocations[0]);

    self.scaleIcons = [];

    scaleLocations.forEach(function(loc) {
      var icon = new PIXI.Graphics();
      icon.moveTo(0,0);
      icon.interactive = true;
      icon.buttonMode = true;
      icon.lineStyle(1, 0x0000FF, 1);
      icon.beginFill(0xFFFFFF, 1);
      icon.drawCircle(loc.x, loc.y, loc.size);
      icon.endFill();

      //icon
        // events for drag start
        //.on('mousedown', onScaleIconDragStart)
        //.on('touchstart', onScaleIconDragStart);
      // events for drag end
      //.on('mouseup', onDragEnd)
      //.on('mouseupoutside', onDragEnd)
      //.on('touchend', onDragEnd)
      //.on('touchendoutside', onDragEnd)
      // events for drag move
      //.on('mousemove', onDragMove)
      //.on('touchmove', onDragMove)

      self.scaleIcons.push(icon);

    });

    self.scaleIcons.forEach(function(s) {
      self.addChild(s);
    });

    self.tooltip = new PIXI.Graphics();
    self.tooltip.lineStyle(3, 0x0000FF, 1);
    self.tooltip.beginFill(0x000000, 1);
    //self.draw.moveTo(x,y);
    self.tooltip.drawRoundedRect(0+20,-self.height,200,100,10);
    self.tooltip.endFill();
    self.tooltip.textStyle = {
      font : 'bold italic 28px Arial',
      fill : '#F7EDCA',
      stroke : '#4a1850',
      strokeThickness : 5,
      dropShadow : true,
      dropShadowColor : '#000000',
      dropShadowAngle : Math.PI / 6,
      dropShadowDistance : 6,
      wordWrap : true,
      wordWrapWidth : 440
    };

    self.tooltip.text = new PIXI.Text(self.name,self.tooltip.textStyle);
    self.tooltip.text.x = 0+30;
    self.tooltip.text.y = -self.height;

    var tooltipTween = new TWEEN.Tween(self.tooltip)
      .to({x:self.width},700)
      .easing( TWEEN.Easing.Elastic.InOut )
      .start();
    var tooltipTextTween = new TWEEN.Tween(self.tooltip.text)
      .to({x:self.width+20},700)
      .easing( TWEEN.Easing.Elastic.InOut )
      .start();

    console.log('Adding tooltip');
    self.addChild(self.tooltip);

    self.addChild(self.tooltip.text);
  },

  onMouseOut: function() {
    //console.log('Moused out!');
    var self = this;
    self.scale.set(self.scale.x/MOUSE_OVER_SCALE_RATIO);

    var self = this;
    //console.log('Mouse out');
    this.scaleIcons.forEach(function(s) {
      self.removeChild(s);
    });
    //console.log('Size: ');
    //console.log(this.getBounds());

    self.removeChild(self.tooltip);
    self.removeChild(self.tooltip.text);
  },

  onScaleIconDragStart: function(event) {
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
    console.log('Resizing!');
  }


};

module.exports = DragDrop;


},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/element.js":[function(require,module,exports){
/**
 * Created by arming on 9/15/15.
 */

var DragDrop = require('./drag.drop');

var DEFAULT_SCALE = 0.7;

var Element = function() {
  PIXI.Sprite.call(this);
  var self = this;

  self.scale.set(DEFAULT_SCALE);
  self.anchor.set(0.5);
  self.interactive = true;
  self.buttonMode = true;
  self
    // events for drag start
    .on('mousedown', DragDrop.onDragStart)
    .on('touchstart', DragDrop.onDragStart)
    // events for drag end
    .on('mouseup', DragDrop.onDragEnd)
    .on('mouseupoutside', DragDrop.onDragEnd)
    .on('touchend', DragDrop.onDragEnd)
    .on('touchendoutside', DragDrop.onDragEnd)
    // events for drag move
    .on('mousemove', DragDrop.onDragMove)
    .on('touchmove', DragDrop.onDragMove)
    // events for mouse over
    .on('mouseover', DragDrop.onMouseOver)
    .on('mouseout', DragDrop.onMouseOut);

  self.arrows = [];

  self.addArrowTo = function(b) {
    self.arrows.push(b);
  };

  self.removeArrowTo = function(index) {
    self.arrows.remove(index);
  };

};
Element.prototype = Object.create(PIXI.Sprite.prototype);

module.exports = Element;

},{"./drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js":[function(require,module,exports){

var GuiUtil = {

  getWindowDimension: function() {
    return { x: window.innerWidth, y: window.innerHeight };
  },

  drawGrid: function(width, height) {
    var grid = new PIXI.Graphics();
    var interval = 100;
    var count = interval;
    grid.lineStyle(1, 0xE5E5E5, 1);
    while (count < width) {
      grid.moveTo(count, 0);
      grid.lineTo(count, height);
      count = count + interval;
    }
    count = interval;
    while(count < height) {
      grid.moveTo(0, count);
      grid.lineTo(width, count);
      count = count + interval;
    }
    var container = new PIXI.Container();
    container.addChild(grid);
    container.cacheAsBitmap = true;
    return container;
  }

};

module.exports = GuiUtil;

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/pixi.editor.js":[function(require,module,exports){
/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var GuiUtil = require('./gui.util');
var Element = require('./element');
//var Arrow = require('./arrow');
var EditorManager = require('./EditorManager');

function resizeGuiContainer(renderer) {

  var dim = GuiUtil.getWindowDimension();

  console.log('Resizing...');
  console.log(dim);

  $('#guiContainer').height(dim.y);
  $('#guiContainer').width(dim.x);

  if(renderer) {
    renderer.view.style.width = dim.x+'px';
    renderer.view.style.height = dim.y+'px';
  }

  console.log('Resizing gui container...');

}

var PixiEditor = {
  controller: function(options) {

    var template = options.template();
    console.log(template);

    var MANAGER = new EditorManager(template);
    MANAGER.init();

    console.log('Adding listener...');
    $(window).resize(function() {
      resizeGuiContainer(renderer);
    });

    return {
      template: options.template,

      drawCanvasEditor: function (element, isInitialized, context) {

        if (isInitialized) {
          MANAGER.animate();
          return;
        }

        element.appendChild(MANAGER.renderer.view);

        MANAGER.animate();

      }
    }
  },
  view: function(controller) {
    return m('#guiContainer', { config: controller.drawCanvasEditor})
  }
};

module.exports = PixiEditor;

},{"./EditorManager":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/EditorManager.js","./element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/element.js","./gui.util":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js":[function(require,module,exports){
/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

function resizeEditor(editor) {
  editor.setSize(null, window.innerHeight);
}

var SourceEditor = {

  controller: function(options) {

    return {

      drawEditor: function (element, isInitialized, context) {

        var editor = null;

        if (isInitialized) {
          if(editor) {
            editor.refresh();
          }
          return;
        }

        editor = CodeMirror(element, {
          value: JSON.stringify(options.template(), undefined, 2),
          lineNumbers: true,
          mode: 'application/json',
          gutters: ['CodeMirror-lint-markers'],
          lint: true,
          styleActiveLine: true,
          autoCloseBrackets: true,
          matchBrackets: true,
          theme: 'zenburn'
        });

        resizeEditor(editor);

        $(window).resize(function() {
          resizeEditor(editor);
        });

        editor.on('change', function(editor) {
          m.startComputation();
          options.template(JSON.parse(editor.getValue()));
          m.endComputation();
        });

      }
    };
  },
  view: function(controller) {
    return [
      m('#sourceEditor', { config: controller.drawEditor })
    ]
  }
};

module.exports = SourceEditor;

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/main.js":[function(require,module,exports){
'use strict';

var SourceEditor = require('./components/source.editor');
var PixiEditor = require('./components/pixi.editor');

var testData = require('./testData/ec2.json');

var template = m.prop(testData);

m.mount(document.getElementById('cloudslicer-app'), m.component(PixiEditor, {
    template: template
  })
);

m.mount(document.getElementById('code-bar'), m.component(SourceEditor, {
    template: template
  })
);

},{"./components/pixi.editor":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/pixi.editor.js","./components/source.editor":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js","./testData/ec2.json":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/testData/ec2.json"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/testData/ec2.json":[function(require,module,exports){
module.exports=
{
  "AWSTemplateFormatVersion" : "2010-09-09",

  "Description" : "AWS CloudFormation Sample Template EC2InstanceWithSecurityGroupSample: Create an Amazon EC2 instance running the Amazon Linux AMI. The AMI is chosen based on the region in which the stack is run. This example creates an EC2 security group for the instance to give you SSH access. **WARNING** This template creates an Amazon EC2 instance. You will be billed for the AWS resources used if you create a stack from this template.",

  "Parameters" : {
    "KeyName": {
      "Description" : "Name of an existing EC2 KeyPair to enable SSH access to the instance",
      "Type": "AWS::EC2::KeyPair::KeyName",
      "ConstraintDescription" : "must be the name of an existing EC2 KeyPair."
    },

    "InstanceType" : {
      "Description" : "WebServer EC2 instance type",
      "Type" : "String",
      "Default" : "m1.small",
      "AllowedValues" : [ "t1.micro", "t2.micro", "t2.small", "t2.medium", "m1.small", "m1.medium", "m1.large", "m1.xlarge", "m2.xlarge", "m2.2xlarge", "m2.4xlarge", "m3.medium", "m3.large", "m3.xlarge", "m3.2xlarge", "c1.medium", "c1.xlarge", "c3.large", "c3.xlarge", "c3.2xlarge", "c3.4xlarge", "c3.8xlarge", "c4.large", "c4.xlarge", "c4.2xlarge", "c4.4xlarge", "c4.8xlarge", "g2.2xlarge", "r3.large", "r3.xlarge", "r3.2xlarge", "r3.4xlarge", "r3.8xlarge", "i2.xlarge", "i2.2xlarge", "i2.4xlarge", "i2.8xlarge", "d2.xlarge", "d2.2xlarge", "d2.4xlarge", "d2.8xlarge", "hi1.4xlarge", "hs1.8xlarge", "cr1.8xlarge", "cc2.8xlarge", "cg1.4xlarge"]
    ,
      "ConstraintDescription" : "must be a valid EC2 instance type."
    },

    "SSHLocation" : {
      "Description" : "The IP address range that can be used to SSH to the EC2 instances",
      "Type": "String",
      "MinLength": "9",
      "MaxLength": "18",
      "Default": "0.0.0.0/0",
      "AllowedPattern": "(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})/(\\d{1,2})",
      "ConstraintDescription": "must be a valid IP CIDR range of the form x.x.x.x/x."
    }
  },

  "Mappings" : {
    "AWSInstanceType2Arch" : {
      "t1.micro"    : { "Arch" : "PV64"   },
      "t2.micro"    : { "Arch" : "HVM64"  },
      "t2.small"    : { "Arch" : "HVM64"  },
      "t2.medium"   : { "Arch" : "HVM64"  },
      "m1.small"    : { "Arch" : "PV64"   },
      "m1.medium"   : { "Arch" : "PV64"   },
      "m1.large"    : { "Arch" : "PV64"   },
      "m1.xlarge"   : { "Arch" : "PV64"   },
      "m2.xlarge"   : { "Arch" : "PV64"   },
      "m2.2xlarge"  : { "Arch" : "PV64"   },
      "m2.4xlarge"  : { "Arch" : "PV64"   },
      "m3.medium"   : { "Arch" : "HVM64"  },
      "m3.large"    : { "Arch" : "HVM64"  },
      "m3.xlarge"   : { "Arch" : "HVM64"  },
      "m3.2xlarge"  : { "Arch" : "HVM64"  },
      "c1.medium"   : { "Arch" : "PV64"   },
      "c1.xlarge"   : { "Arch" : "PV64"   },
      "c3.large"    : { "Arch" : "HVM64"  },
      "c3.xlarge"   : { "Arch" : "HVM64"  },
      "c3.2xlarge"  : { "Arch" : "HVM64"  },
      "c3.4xlarge"  : { "Arch" : "HVM64"  },
      "c3.8xlarge"  : { "Arch" : "HVM64"  },
      "c4.large"    : { "Arch" : "HVM64"  },
      "c4.xlarge"   : { "Arch" : "HVM64"  },
      "c4.2xlarge"  : { "Arch" : "HVM64"  },
      "c4.4xlarge"  : { "Arch" : "HVM64"  },
      "c4.8xlarge"  : { "Arch" : "HVM64"  },
      "g2.2xlarge"  : { "Arch" : "HVMG2"  },
      "r3.large"    : { "Arch" : "HVM64"  },
      "r3.xlarge"   : { "Arch" : "HVM64"  },
      "r3.2xlarge"  : { "Arch" : "HVM64"  },
      "r3.4xlarge"  : { "Arch" : "HVM64"  },
      "r3.8xlarge"  : { "Arch" : "HVM64"  },
      "i2.xlarge"   : { "Arch" : "HVM64"  },
      "i2.2xlarge"  : { "Arch" : "HVM64"  },
      "i2.4xlarge"  : { "Arch" : "HVM64"  },
      "i2.8xlarge"  : { "Arch" : "HVM64"  },
      "d2.xlarge"   : { "Arch" : "HVM64"  },
      "d2.2xlarge"  : { "Arch" : "HVM64"  },
      "d2.4xlarge"  : { "Arch" : "HVM64"  },
      "d2.8xlarge"  : { "Arch" : "HVM64"  },
      "hi1.4xlarge" : { "Arch" : "HVM64"  },
      "hs1.8xlarge" : { "Arch" : "HVM64"  },
      "cr1.8xlarge" : { "Arch" : "HVM64"  },
      "cc2.8xlarge" : { "Arch" : "HVM64"  }
    }
  ,
    "AWSRegionArch2AMI" : {
      "us-east-1"        : {"PV64" : "ami-0f4cfd64", "HVM64" : "ami-0d4cfd66", "HVMG2" : "ami-5b05ba30"},
      "us-west-2"        : {"PV64" : "ami-d3c5d1e3", "HVM64" : "ami-d5c5d1e5", "HVMG2" : "ami-a9d6c099"},
      "us-west-1"        : {"PV64" : "ami-85ea13c1", "HVM64" : "ami-87ea13c3", "HVMG2" : "ami-37827a73"},
      "eu-west-1"        : {"PV64" : "ami-d6d18ea1", "HVM64" : "ami-e4d18e93", "HVMG2" : "ami-72a9f105"},
      "eu-central-1"     : {"PV64" : "ami-a4b0b7b9", "HVM64" : "ami-a6b0b7bb", "HVMG2" : "ami-a6c9cfbb"},
      "ap-northeast-1"   : {"PV64" : "ami-1a1b9f1a", "HVM64" : "ami-1c1b9f1c", "HVMG2" : "ami-f644c4f6"},
      "ap-southeast-1"   : {"PV64" : "ami-d24b4280", "HVM64" : "ami-d44b4286", "HVMG2" : "ami-12b5bc40"},
      "ap-southeast-2"   : {"PV64" : "ami-ef7b39d5", "HVM64" : "ami-db7b39e1", "HVMG2" : "ami-b3337e89"},
      "sa-east-1"        : {"PV64" : "ami-5b098146", "HVM64" : "ami-55098148", "HVMG2" : "NOT_SUPPORTED"},
      "cn-north-1"       : {"PV64" : "ami-bec45887", "HVM64" : "ami-bcc45885", "HVMG2" : "NOT_SUPPORTED"}
    }

  },

  "Resources" : {
    "EC2Instance" : {
      "Type" : "AWS::EC2::Instance",
      "Properties" : {
        "InstanceType" : { "Ref" : "InstanceType" },
        "SecurityGroups" : [ { "Ref" : "InstanceSecurityGroup" } ],
        "KeyName" : { "Ref" : "KeyName" },
        "ImageId" : { "Fn::FindInMap" : [ "AWSRegionArch2AMI", { "Ref" : "AWS::Region" },
          { "Fn::FindInMap" : [ "AWSInstanceType2Arch", { "Ref" : "InstanceType" }, "Arch" ] } ] }
      }
    },

    "InstanceSecurityGroup" : {
      "Type" : "AWS::EC2::SecurityGroup",
      "Properties" : {
        "GroupDescription" : "Enable SSH access via port 22",
        "SecurityGroupIngress" : [ {
          "IpProtocol" : "tcp",
          "FromPort" : "22",
          "ToPort" : "22",
          "CidrIp" : { "Ref" : "SSHLocation"}
        } ]
      }
    }
  },

  "Outputs" : {
    "InstanceId" : {
      "Description" : "InstanceId of the newly created EC2 instance",
      "Value" : { "Ref" : "EC2Instance" }
    },
    "AZ" : {
      "Description" : "Availability Zone of the newly created EC2 instance",
      "Value" : { "Fn::GetAtt" : [ "EC2Instance", "AvailabilityZone" ] }
    },
    "PublicDNS" : {
      "Description" : "Public DNSName of the newly created EC2 instance",
      "Value" : { "Fn::GetAtt" : [ "EC2Instance", "PublicDnsName" ] }
    },
    "PublicIP" : {
      "Description" : "Public IP address of the newly created EC2 instance",
      "Value" : { "Fn::GetAtt" : [ "EC2Instance", "PublicIp" ] }
    }
  }
}

},{}]},{},["/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL0VkaXRvck1hbmFnZXIuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX0VJUC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvYXdzL0FXU19FQzJfSW5zdGFuY2UuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX1NlY3VyaXR5R3JvdXAuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfVXNlcnMuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2NvbGxlY3Rpb24uanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2RyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZWxlbWVudC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZ3VpLnV0aWwuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL3BpeGkuZWRpdG9yLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9zb3VyY2UuZWRpdG9yLmpzIiwiYXBwL3NjcmlwdHMvbWFpbi5qcyIsImFwcC9zY3JpcHRzL3Rlc3REYXRhL2VjMi5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8yNi8xNS5cbiAqL1xuXG52YXIgR3VpVXRpbCA9IHJlcXVpcmUoJy4vZ3VpLnV0aWwnKTtcbnZhciBDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9jb2xsZWN0aW9uJyk7XG52YXIgQVdTX1VzZXJzID0gcmVxdWlyZSgnLi9hd3MvQVdTX1VzZXJzJyk7XG52YXIgQVdTX0VDMl9JbnN0YW5jZSA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfSW5zdGFuY2UnKTtcbnZhciBBV1NfRUMyX0VJUCA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfRUlQJyk7XG52YXIgQVdTX0VDMl9TZWN1cml0eUdyb3VwID0gcmVxdWlyZSgnLi9hd3MvQVdTX0VDMl9TZWN1cml0eUdyb3VwJyk7XG5cbnZhciBFZGl0b3JNYW5hZ2VyID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdmFyIGZwc1N0YXRzID0gbmV3IFN0YXRzKCk7XG4gIGZwc1N0YXRzLnNldE1vZGUoMCk7XG4gIC8vIGFsaWduIHRvcC1sZWZ0XG4gIGZwc1N0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICBmcHNTdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4JztcbiAgZnBzU3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZnBzU3RhdHMuZG9tRWxlbWVudCApO1xuXG4gIHZhciBtc1N0YXRzID0gbmV3IFN0YXRzKCk7XG4gIG1zU3RhdHMuc2V0TW9kZSgxKTtcbiAgLy8gYWxpZ24gdG9wLWxlZnRcbiAgbXNTdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgbXNTdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnODBweCc7XG4gIG1zU3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggbXNTdGF0cy5kb21FbGVtZW50ICk7XG5cbiAgdmFyIG1iU3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgbWJTdGF0cy5zZXRNb2RlKDIpO1xuICAvLyBhbGlnbiB0b3AtbGVmdFxuICBtYlN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICBtYlN0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICcxNjBweCc7XG4gIG1iU3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggbWJTdGF0cy5kb21FbGVtZW50ICk7XG5cblxuICBmcHMgPSA2MDtcbiAgdmFyIG5vdztcbiAgdmFyIHRoZW4gPSBEYXRlLm5vdygpO1xuICB2YXIgaW50ZXJ2YWwgPSAxMDAwL2ZwcztcbiAgdmFyIGRlbHRhO1xuICAvL3ZhciBtZXRlciA9IG5ldyBGUFNNZXRlcigpO1xuICB2YXIgd2luRGltZW5zaW9uID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcbiAgdmFyIGdyaWQgPSBudWxsO1xuXG4gIHNlbGYucmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcih3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnksIHtiYWNrZ3JvdW5kQ29sb3IgOiAweEZGRkZGRn0pO1xuXG4gIHNlbGYuc3RhZ2UgPSBuZXcgUElYSS5TdGFnZSgpO1xuICBzZWxmLnN0YWdlLm5hbWUgPSAnc3RhZ2UnO1xuICBzZWxmLnN0YWdlLnNlbGVjdGVkID0gbnVsbDtcbiAgc2VsZi5zdGFnZS5jbGlja2VkT25seVN0YWdlID0gdHJ1ZTtcbiAgc2VsZi5zdGFnZS5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gIHNlbGYuc3RhZ2Uub24oJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcbiAgICBpZihzZWxmLnN0YWdlLmNsaWNrZWRPbmx5U3RhZ2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBzdGFnZSBjbGljaycpO1xuICAgICAgaWYoc2VsZi5zdGFnZS5zZWxlY3RlZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhzZWxmLnN0YWdlLnNlbGVjdGVkKTtcbiAgICAgICAgc2VsZi5zdGFnZS5zZWxlY3RlZC5maWx0ZXJzID0gbnVsbDtcbiAgICAgICAgc2VsZi5zdGFnZS5zZWxlY3RlZCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2VsZi5zdGFnZS5jbGlja2VkT25seVN0YWdlID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHNlbGYuc3RhZ2UuTUFOQUdFUiA9IHNlbGY7XG5cbiAgc2VsZi5zZWN1cml0eWdyb3VwcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG4gIHNlbGYuZWxlbWVudHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG4gIHZhciBjb2xsaXNpb25tYW5hZ2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgY29sbFNlbGYgPSB0aGlzO1xuXG4gICAgY29sbFNlbGYuc2VjR3JvdXBWc0VsZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VjR3JwcyA9IHNlbGYuc2VjdXJpdHlncm91cHM7XG4gICAgICB2YXIgZWxlbXMgPSBzZWxmLmVsZW1lbnRzO1xuXG4gICAgICBfLmVhY2goc2VjR3Jwcy5lbGVtZW50cywgZnVuY3Rpb24ocykge1xuXG4gICAgICAgIF8uZWFjaChlbGVtcy5lbGVtZW50cywgZnVuY3Rpb24oZSkge1xuXG4gICAgICAgICAgdmFyIHhkaXN0ID0gcy5wb3NpdGlvbi54IC0gZS5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgaWYoeGRpc3QgPiAtcy53aWR0aC8yICYmIHhkaXN0IDwgcy53aWR0aC8yKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhciB5ZGlzdCA9IHMucG9zaXRpb24ueSAtIGUucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgaWYoeWRpc3QgPiAtcy5oZWlnaHQvMiAmJiB5ZGlzdCA8IHMuaGVpZ2h0LzIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIC8vICBjb25zb2xlLmxvZygnQ29sbGlzaW9uIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgY29sbFNlbGYudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBjb2xsU2VsZi5zZWNHcm91cFZzRWxlbWVudHMoKTtcbiAgICB9O1xuXG4gIH07XG5cbiAgc2VsZi5Db2xsaXNpb25NYW5hZ2VyID0gbmV3IGNvbGxpc2lvbm1hbmFnZXIoKTtcblxuICBzZWxmLmFuaW1hdGUgPSBmdW5jdGlvbih0aW1lKSB7XG5cbiAgICBub3cgPSBEYXRlLm5vdygpO1xuICAgIGRlbHRhID0gbm93IC0gdGhlbjtcblxuICAgIGlmIChkZWx0YSA+IGludGVydmFsKSB7XG4gICAgICBmcHNTdGF0cy5iZWdpbigpO1xuICAgICAgbXNTdGF0cy5iZWdpbigpO1xuICAgICAgbWJTdGF0cy5iZWdpbigpO1xuXG4gICAgICAvL3NlbGYuQ29sbGlzaW9uTWFuYWdlci51cGRhdGUoKTtcblxuICAgICAgdGhlbiA9IG5vdyAtIChkZWx0YSAlIGludGVydmFsKTtcbiAgICAgIC8vbWV0ZXIudGljaygpO1xuXG4gICAgICBUV0VFTi51cGRhdGUodGltZSk7XG4gICAgICBzZWxmLnJlbmRlcmVyLnJlbmRlcihzZWxmLnN0YWdlKTtcblxuICAgICAgZnBzU3RhdHMuZW5kKCk7XG4gICAgICBtc1N0YXRzLmVuZCgpO1xuICAgICAgbWJTdGF0cy5lbmQoKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2VsZi5hbmltYXRlKTtcbiAgfTtcblxuICBzZWxmLmdyaWRPbiA9IGZ1bmN0aW9uKCkge1xuICAgIGdyaWQgPSBHdWlVdGlsLmRyYXdHcmlkKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSk7XG4gICAgc2VsZi5zdGFnZS5hZGRDaGlsZChncmlkKTtcbiAgfTtcblxuICBzZWxmLmdyaWRPZmYgPSBmdW5jdGlvbigpIHtcbiAgICBzZWxmLnN0YWdlLnJlbW92ZUNoaWxkKGdyaWQpO1xuICAgIHNlbGYuZ3JpZCA9IG51bGw7XG4gIH07XG5cbiAgc2VsZi5vbkxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdBc3NldHMgbG9hZGVkJyk7XG5cbiAgICB2YXIgZGltID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcbiAgICBjb25zb2xlLmxvZyhzZWxmLmVsZW1lbnRzLnBvc2l0aW9uKTtcblxuICAgIHZhciB1c2VycyA9IG5ldyBBV1NfVXNlcnMoJ3VzZXJzJywgZGltLngvMiwgMTAwKTtcbiAgICBjb25zb2xlLmxvZyh1c2Vycy5wb3NpdGlvbik7XG4gICAgc2VsZi5lbGVtZW50cy5hZGQodXNlcnMpO1xuXG4gICAgY29uc29sZS5sb2codGVtcGxhdGUuUmVzb3VyY2VzKTtcblxuICAgIHZhciBncm91cGluZ3MgPSBfLnJlZHVjZSh0ZW1wbGF0ZS5SZXNvdXJjZXMsIGZ1bmN0aW9uKHJlc3VsdCwgbiwga2V5KSB7XG4gICAgICByZXN1bHRbbi5UeXBlXSA9IHt9O1xuICAgICAgcmVzdWx0W24uVHlwZV1ba2V5XSA9IG47XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSwge30pO1xuICAgIGNvbnNvbGUubG9nKCdHcm91cGluZ3M6Jyk7XG4gICAgY29uc29sZS5sb2coZ3JvdXBpbmdzKTtcblxuICAgIHZhciBpbnN0YW5jZXMgPSB7fTtcbiAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6SW5zdGFuY2UnXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQVdTX0VDMl9JbnN0YW5jZShrZXksIGRpbS54LzIsIDQwMCk7XG4gICAgICBpbnN0YW5jZXNba2V5XSA9IGluc3RhbmNlO1xuICAgIH0pO1xuXG4gICAgdmFyIGVpcHMgPSB7fTtcbiAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6RUlQJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgY29uc29sZS5sb2coJ0FkZGluZyBFSVAgJywga2V5KTtcbiAgICAgIHZhciBlaXAgPSBuZXcgQVdTX0VDMl9FSVAoa2V5LCBkaW0ueC8yLCA1MDApO1xuICAgICAgZWlwc1trZXldID0gZWlwO1xuICAgIH0pO1xuXG4gICAgdmFyIHNlY2dyb3VwcyA9IHt9O1xuICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpTZWN1cml0eUdyb3VwJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgY29uc29sZS5sb2coJ0FkZGluZyBTZWN1cml0eSBHcm91cCAnLCBrZXkpO1xuICAgICAgdmFyIHNlY2dyb3VwID0gbmV3IEFXU19FQzJfU2VjdXJpdHlHcm91cChrZXksIGRpbS54LzIsIDUwMCk7XG4gICAgICBzZWNncm91cHNba2V5XSA9IHNlY2dyb3VwO1xuICAgIH0pO1xuXG4gICAgdmFyIGNvbWJvSW5zdGFuY2VzID0ge307XG4gICAgXy5lYWNoKGdyb3VwaW5nc1snQVdTOjpFQzI6OkVJUEFzc29jaWF0aW9uJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgY29uc29sZS5sb2coJ0NoZWNraW5nIGFzc29jaWF0aW9uJyk7XG4gICAgICBjb25zb2xlLmxvZyhuKTtcbiAgICAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICBjb25zb2xlLmxvZyhlaXBzKTtcbiAgICAgIGNvbnNvbGUubG9nKCdSZWY6ICcsbi5Qcm9wZXJ0aWVzLkVJUC5SZWYpO1xuICAgICAgdmFyIGluc3RhbmNlID0gaW5zdGFuY2VzW24uUHJvcGVydGllcy5JbnN0YW5jZUlkLlJlZl07XG4gICAgICBpZihpbnN0YW5jZSkge1xuICAgICAgICB2YXIgZWlwID0gZWlwc1tuLlByb3BlcnRpZXMuRUlQLlJlZl07XG4gICAgICAgIGlmKGVpcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdBc3NvY2lhdGlvbiBoYXMgYSBtYXRjaCEnKTtcbiAgICAgICAgICB2YXIgY29udGFpbmVyID0gbmV3IENvbGxlY3Rpb24oKTtcbiAgICAgICAgICBjb250YWluZXIuYWRkKGluc3RhbmNlKTtcbiAgICAgICAgICBjb250YWluZXIuYWRkKGVpcCk7XG4gICAgICAgICAgY29tYm9JbnN0YW5jZXNba2V5XSA9IGNvbnRhaW5lcjtcbiAgICAgICAgICBkZWxldGUgaW5zdGFuY2VzW24uUHJvcGVydGllcy5JbnN0YW5jZUlkLlJlZl07XG4gICAgICAgICAgZGVsZXRlIGVpcHNbbi5Qcm9wZXJ0aWVzLkVJUC5SZWZdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL3ZhciBlaXAgPSBuZXcgQVdTX0VDMl9FSVAoa2V5LCBkaW0ueC8yLCA1MDApO1xuICAgICAgLy9laXBzW2tleV0gPSBlaXA7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goc2VjZ3JvdXBzLCBmdW5jdGlvbihzLCBrZXkpIHtcbiAgICAgIHNlbGYuc2VjdXJpdHlncm91cHMuYWRkKHMpO1xuICAgIH0pO1xuXG4gICAgXy5lYWNoKGNvbWJvSW5zdGFuY2VzLCBmdW5jdGlvbihjb21ibywga2V5KSB7XG4gICAgICBzZWxmLmVsZW1lbnRzLmFkZChjb21ibyk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goaW5zdGFuY2VzLCBmdW5jdGlvbihpbnN0YW5jZSwga2V5KSB7XG4gICAgICBzZWxmLmVsZW1lbnRzLmFkZChpbnN0YW5jZSk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goZWlwcywgZnVuY3Rpb24oZWlwLCBrZXkpIHtcbiAgICAgIHNlbGYuZWxlbWVudHMuYWRkKGVpcCk7XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnQ2hpbGRyZW46Jyk7XG4gICAgY29uc29sZS5sb2coc2VsZi5lbGVtZW50cy5jaGlsZHJlbik7XG5cbiAgICBzZWxmLnN0YWdlLmFkZENoaWxkKHNlbGYuc2VjdXJpdHlncm91cHMpO1xuICAgIHNlbGYuc3RhZ2UuYWRkQ2hpbGQoc2VsZi5lbGVtZW50cyk7XG4gICAgY29uc29sZS5sb2coc2VsZi5zdGFnZS5jaGlsZHJlbik7XG5cbiAgICB2YXIgbWVudVNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSgpO1xuICAgIG1lbnVTcHJpdGUudGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ0NvbXB1dGVfJl9OZXR3b3JraW5nX0FtYXpvbl9FQzJfSW5zdGFuY2UucG5nJyk7XG4gICAgbWVudVNwcml0ZS5zY2FsZS5zZXQoMC4yKTtcbiAgICBtZW51U3ByaXRlLnkgPSBkaW0ueS8yO1xuICAgIG1lbnVTcHJpdGUueCA9IGRpbS54LTQwO1xuICAgIG1lbnVTcHJpdGUuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgIG1lbnVTcHJpdGUuYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgbWVudVNwcml0ZS5hbmNob3Iuc2V0KDAuNSk7XG4gICAgbWVudVNwcml0ZVxuICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqMS4yKTtcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54LzEuMik7XG4gICAgICB9KVxuICAgICAgLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkLicpO1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQVdTX0VDMl9JbnN0YW5jZSgnTmV3X0luc3RhbmNlJywgZGltLngvMiwgZGltLnkvMik7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuYWRkKGluc3RhbmNlKTtcbiAgICAgIH0pO1xuICAgIHNlbGYuc3RhZ2UuYWRkQ2hpbGQobWVudVNwcml0ZSk7XG5cbiAgICB2YXIgbWVudVNlY0dyb3VwID0gbmV3IFBJWEkuU3ByaXRlKCk7XG4gICAgdmFyIG1lbnVHcmFwaGljID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICBtZW51R3JhcGhpYy5saW5lU3R5bGUoMywgMHgwMDAwMDAsIDEpO1xuICAgIG1lbnVHcmFwaGljLmJlZ2luRmlsbCgweEZGRkZGRiwgMSk7XG4gICAgbWVudUdyYXBoaWMuZHJhd1JvdW5kZWRSZWN0KDAsMCwzMCwzMCw2KTtcbiAgICBtZW51R3JhcGhpYy5lbmRGaWxsKCk7XG4gICAgbWVudVNlY0dyb3VwLnRleHR1cmUgPSBtZW51R3JhcGhpYy5nZW5lcmF0ZVRleHR1cmUoKTtcblxuICAgIG1lbnVTZWNHcm91cC5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgbWVudVNlY0dyb3VwLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgIG1lbnVTZWNHcm91cC5wb3NpdGlvbi55ID0gZGltLnkvMis0MDtcbiAgICBtZW51U2VjR3JvdXAucG9zaXRpb24ueCA9IGRpbS54LTQwO1xuICAgIG1lbnVTZWNHcm91cC5zY2FsZS5zZXQoMS4wKTtcbiAgICBtZW51U2VjR3JvdXAuYW5jaG9yLnNldCgwLjUpO1xuICAgIG1lbnVTZWNHcm91cFxuICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqMS4xKTtcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54LzEuMSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkLicpO1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQVdTX0VDMl9TZWN1cml0eUdyb3VwKCdOZXdfU2VjdXJpdHlfR3JvdXAnLCBkaW0ueC8yLCBkaW0ueS8yKTtcbiAgICAgICAgc2VsZi5zZWN1cml0eWdyb3Vwcy5hZGQoaW5zdGFuY2UpO1xuICAgICAgfSk7XG4gICAgc2VsZi5zdGFnZS5hZGRDaGlsZChtZW51U2VjR3JvdXApO1xuICB9O1xuXG4gIHNlbGYuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuZ3JpZE9uKCk7XG4gICAgUElYSS5sb2FkZXJcbiAgICAgIC5hZGQoJy4uL3Jlc291cmNlcy9zcHJpdGVzL3Nwcml0ZXMuanNvbicpXG4gICAgICAubG9hZChzZWxmLm9uTG9hZGVkKTtcbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvck1hbmFnZXI7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX0VDMl9FSVAgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi5zY2FsZS5zZXQoMC4zKTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9FbGFzdGljX0lQLnBuZycpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xufTtcbkFXU19FQzJfRUlQLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19FQzJfRUlQO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTkvMTUuXG4gKi9cblxudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuLi9lbGVtZW50Jyk7XG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuLi9kcmFnLmRyb3AnKTtcblxudmFyIEFXU19FQzJfSW5zdGFuY2UgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9JbnN0YW5jZS5wbmcnKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxuICBzZWxmLnNlY3VyaXR5R3JvdXAgPSBudWxsO1xufTtcbkFXU19FQzJfSW5zdGFuY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX0VDMl9JbnN0YW5jZTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzIxLzE1LlxuICovXG5cbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi4vZWxlbWVudCcpO1xuXG52YXIgQVdTX0VDMl9TZWN1cml0eUdyb3VwID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgRWxlbWVudC5jYWxsKHRoaXMpO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcblxuICB2YXIgZ3JhcGhpYyA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gIGdyYXBoaWMubGluZVN0eWxlKDMsIDB4MDAwMDAwLCAxKTtcbiAgZ3JhcGhpYy5iZWdpbkZpbGwoMHhGRkZGRkYsIDAuMCk7XG4gIGdyYXBoaWMuZHJhd1JvdW5kZWRSZWN0KDAsMCwyMDAsMjAwLDEwKTtcbiAgZ3JhcGhpYy5lbmRGaWxsKCk7XG5cbiAgc2VsZi50ZXh0dXJlID0gZ3JhcGhpYy5nZW5lcmF0ZVRleHR1cmUoKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxufTtcbkFXU19FQzJfU2VjdXJpdHlHcm91cC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfRUMyX1NlY3VyaXR5R3JvdXA7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX1VzZXJzID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgRWxlbWVudC5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYubmFtZSA9IG5hbWU7XG4gIHNlbGYudGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ05vbi1TZXJ2aWNlX1NwZWNpZmljX2NvcHlfVXNlcnMucG5nJyk7XG4gIHNlbGYucG9zaXRpb24ueCA9IHg7XG4gIHNlbGYucG9zaXRpb24ueSA9IHk7XG5cbn07XG5BV1NfVXNlcnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX1VzZXJzO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzIxLzE1LlxuICovXG4vKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIENvbGxlY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgUElYSS5Db250YWluZXIuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuZWxlbWVudHMgPSB7fTtcblxuICBzZWxmLmFkZCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBzZWxmLmFkZENoaWxkKGVsZW1lbnQpO1xuICAgIHNlbGYuZWxlbWVudHNbZWxlbWVudC5uYW1lXSA9IGVsZW1lbnQ7XG4gIH07XG5cbiAgc2VsZi5yZW1vdmUgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgc2VsZi5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgICBkZWxldGUgc2VsZi5lbGVtZW50c1tlbGVtZW50Lm5hbWVdO1xuICB9O1xuXG59O1xuQ29sbGVjdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBJWEkuQ29udGFpbmVyLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE0LzE1LlxuICovXG5cbnZhciBNT1VTRV9PVkVSX1NDQUxFX1JBVElPID0gMS4xO1xuXG52YXIgRHJhZ0Ryb3AgPSB7XG5cbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coKTtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmKHRoaXMubW92ZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBkcmFnZ2luZycpO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gICAgICB0aGlzLmRhdGEgPSBudWxsO1xuXG4gICAgICBpZighdGhpcy5zZWN1cml0eUdyb3VwKSB7XG5cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdQYXJlbnQnKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzZWxmLnBhcmVudC5wYXJlbnQuTUFOQUdFUik7XG4gICAgICAgICAgdmFyIHNlY0dycHMgPSBzZWxmLnBhcmVudC5wYXJlbnQuTUFOQUdFUi5zZWN1cml0eWdyb3VwcztcblxuICAgICAgICAgIF8uZWFjaChzZWNHcnBzLmVsZW1lbnRzLCBmdW5jdGlvbihzKSB7XG5cbiAgICAgICAgICAgICAgdmFyIHhkaXN0ID0gcy5wb3NpdGlvbi54IC0gc2VsZi5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgICAgIGlmKHhkaXN0ID4gLXMud2lkdGgvMiAmJiB4ZGlzdCA8IHMud2lkdGgvMilcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciB5ZGlzdCA9IHMucG9zaXRpb24ueSAtIHNlbGYucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgICAgIGlmKHlkaXN0ID4gLXMuaGVpZ2h0LzIgJiYgeWRpc3QgPCBzLmhlaWdodC8yKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NvbGxpc2lvbiBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb24ueCA9IDA7XG4gICAgICAgICAgICAgICAgICBzZWxmLnBvc2l0aW9uLnkgPSAwO1xuICAgICAgICAgICAgICAgICAgc2VsZi5zZWN1cml0eUdyb3VwID0gcztcbiAgICAgICAgICAgICAgICAgICAgcy5hZGRDaGlsZChzZWxmKTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBOT1QgZHJhZ2dpbmcnKTtcbiAgICAgIHZhciBzaGFkb3cgPSBuZXcgUElYSS5maWx0ZXJzLkRyb3BTaGFkb3dGaWx0ZXIoKTtcbiAgICAgIHRoaXMuZmlsdGVycyA9IFtzaGFkb3ddO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICBjb25zb2xlLmxvZygnUGFyZW50OicpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5wYXJlbnQucGFyZW50KTtcbiAgICAgIGlmKHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCkge1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQuZmlsdGVycyA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcmVudC5wYXJlbnQuY2xpY2tlZE9ubHlTdGFnZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkID0gdGhpcztcbiAgICB9XG4gIH0sXG5cbiAgb25EcmFnTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLmRyYWdnaW5nKVxuICAgIHtcbiAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHNlbGYuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHNlbGYucGFyZW50KTtcbiAgICAgIHNlbGYucG9zaXRpb24ueCA9IG5ld1Bvc2l0aW9uLng7XG4gICAgICBzZWxmLnBvc2l0aW9uLnkgPSBuZXdQb3NpdGlvbi55O1xuICAgICAgc2VsZi5tb3ZlZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG4gIG9uTW91c2VPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3ZlciEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54Kk1PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuICAgIHZhciBpY29uU2l6ZSA9IDEwO1xuXG4gICAgdmFyIGdsb2JhbCA9IHNlbGYudG9HbG9iYWwoc2VsZi5wb3NpdGlvbik7XG4gICAgLy9jb25zb2xlLmxvZygnb2ZmaWNpYWw6ICcgKyBzZWxmLnBvc2l0aW9uLnggKyAnOicgKyBzZWxmLnBvc2l0aW9uLnkpO1xuICAgIC8vY29uc29sZS5sb2coJ0dMT0JBTDogJyArIGdsb2JhbC54ICsgJzonICsgZ2xvYmFsLnkpO1xuICAgIC8vY29uc29sZS5sb2coc2VsZi5nZXRMb2NhbEJvdW5kcygpKTtcblxuICAgIHZhciBzY2FsZUxvY2F0aW9ucyA9IFtcbiAgICAgIHt4OiAwLCB5OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMi1pY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMC1zZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMi1pY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzIraWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAsIHk6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMitpY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX1cbiAgICBdO1xuXG4gICAgLy9jb25zb2xlLmxvZyhzY2FsZUxvY2F0aW9uc1swXSk7XG5cbiAgICBzZWxmLnNjYWxlSWNvbnMgPSBbXTtcblxuICAgIHNjYWxlTG9jYXRpb25zLmZvckVhY2goZnVuY3Rpb24obG9jKSB7XG4gICAgICB2YXIgaWNvbiA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICBpY29uLm1vdmVUbygwLDApO1xuICAgICAgaWNvbi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICBpY29uLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgICAgaWNvbi5saW5lU3R5bGUoMSwgMHgwMDAwRkYsIDEpO1xuICAgICAgaWNvbi5iZWdpbkZpbGwoMHhGRkZGRkYsIDEpO1xuICAgICAgaWNvbi5kcmF3Q2lyY2xlKGxvYy54LCBsb2MueSwgbG9jLnNpemUpO1xuICAgICAgaWNvbi5lbmRGaWxsKCk7XG5cbiAgICAgIC8vaWNvblxuICAgICAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAgICAgLy8ub24oJ21vdXNlZG93bicsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KVxuICAgICAgICAvLy5vbigndG91Y2hzdGFydCcsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KTtcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAgIC8vLm9uKCdtb3VzZXVwJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ21vdXNldXBvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgICAvLy5vbignbW91c2Vtb3ZlJywgb25EcmFnTW92ZSlcbiAgICAgIC8vLm9uKCd0b3VjaG1vdmUnLCBvbkRyYWdNb3ZlKVxuXG4gICAgICBzZWxmLnNjYWxlSWNvbnMucHVzaChpY29uKTtcblxuICAgIH0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5hZGRDaGlsZChzKTtcbiAgICB9KTtcblxuICAgIHNlbGYudG9vbHRpcCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgc2VsZi50b29sdGlwLmxpbmVTdHlsZSgzLCAweDAwMDBGRiwgMSk7XG4gICAgc2VsZi50b29sdGlwLmJlZ2luRmlsbCgweDAwMDAwMCwgMSk7XG4gICAgLy9zZWxmLmRyYXcubW92ZVRvKHgseSk7XG4gICAgc2VsZi50b29sdGlwLmRyYXdSb3VuZGVkUmVjdCgwKzIwLC1zZWxmLmhlaWdodCwyMDAsMTAwLDEwKTtcbiAgICBzZWxmLnRvb2x0aXAuZW5kRmlsbCgpO1xuICAgIHNlbGYudG9vbHRpcC50ZXh0U3R5bGUgPSB7XG4gICAgICBmb250IDogJ2JvbGQgaXRhbGljIDI4cHggQXJpYWwnLFxuICAgICAgZmlsbCA6ICcjRjdFRENBJyxcbiAgICAgIHN0cm9rZSA6ICcjNGExODUwJyxcbiAgICAgIHN0cm9rZVRoaWNrbmVzcyA6IDUsXG4gICAgICBkcm9wU2hhZG93IDogdHJ1ZSxcbiAgICAgIGRyb3BTaGFkb3dDb2xvciA6ICcjMDAwMDAwJyxcbiAgICAgIGRyb3BTaGFkb3dBbmdsZSA6IE1hdGguUEkgLyA2LFxuICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlIDogNixcbiAgICAgIHdvcmRXcmFwIDogdHJ1ZSxcbiAgICAgIHdvcmRXcmFwV2lkdGggOiA0NDBcbiAgICB9O1xuXG4gICAgc2VsZi50b29sdGlwLnRleHQgPSBuZXcgUElYSS5UZXh0KHNlbGYubmFtZSxzZWxmLnRvb2x0aXAudGV4dFN0eWxlKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC54ID0gMCszMDtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC55ID0gLXNlbGYuaGVpZ2h0O1xuXG4gICAgdmFyIHRvb2x0aXBUd2VlbiA9IG5ldyBUV0VFTi5Ud2VlbihzZWxmLnRvb2x0aXApXG4gICAgICAudG8oe3g6c2VsZi53aWR0aH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG4gICAgdmFyIHRvb2x0aXBUZXh0VHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4oc2VsZi50b29sdGlwLnRleHQpXG4gICAgICAudG8oe3g6c2VsZi53aWR0aCsyMH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG5cbiAgICBjb25zb2xlLmxvZygnQWRkaW5nIHRvb2x0aXAnKTtcbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcCk7XG5cbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvbk1vdXNlT3V0OiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3V0IScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2Ugb3V0Jyk7XG4gICAgdGhpcy5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5yZW1vdmVDaGlsZChzKTtcbiAgICB9KTtcbiAgICAvL2NvbnNvbGUubG9nKCdTaXplOiAnKTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuZ2V0Qm91bmRzKCkpO1xuXG4gICAgc2VsZi5yZW1vdmVDaGlsZChzZWxmLnRvb2x0aXApO1xuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwLnRleHQpO1xuICB9LFxuXG4gIG9uU2NhbGVJY29uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZygnUmVzaXppbmchJyk7XG4gIH1cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdEcm9wO1xuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi9kcmFnLmRyb3AnKTtcblxudmFyIERFRkFVTFRfU0NBTEUgPSAwLjc7XG5cbnZhciBFbGVtZW50ID0gZnVuY3Rpb24oKSB7XG4gIFBJWEkuU3ByaXRlLmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLnNjYWxlLnNldChERUZBVUxUX1NDQUxFKTtcbiAgc2VsZi5hbmNob3Iuc2V0KDAuNSk7XG4gIHNlbGYuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICBzZWxmLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICBzZWxmXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgLm9uKCdtb3VzZWRvd24nLCBEcmFnRHJvcC5vbkRyYWdTdGFydClcbiAgICAub24oJ3RvdWNoc3RhcnQnLCBEcmFnRHJvcC5vbkRyYWdTdGFydClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgLm9uKCdtb3VzZXVwJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbignbW91c2V1cG91dHNpZGUnLCBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCd0b3VjaGVuZCcsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ3RvdWNoZW5kb3V0c2lkZScsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgIC5vbignbW91c2Vtb3ZlJywgRHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAub24oJ3RvdWNobW92ZScsIERyYWdEcm9wLm9uRHJhZ01vdmUpXG4gICAgLy8gZXZlbnRzIGZvciBtb3VzZSBvdmVyXG4gICAgLm9uKCdtb3VzZW92ZXInLCBEcmFnRHJvcC5vbk1vdXNlT3ZlcilcbiAgICAub24oJ21vdXNlb3V0JywgRHJhZ0Ryb3Aub25Nb3VzZU91dCk7XG5cbiAgc2VsZi5hcnJvd3MgPSBbXTtcblxuICBzZWxmLmFkZEFycm93VG8gPSBmdW5jdGlvbihiKSB7XG4gICAgc2VsZi5hcnJvd3MucHVzaChiKTtcbiAgfTtcblxuICBzZWxmLnJlbW92ZUFycm93VG8gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHNlbGYuYXJyb3dzLnJlbW92ZShpbmRleCk7XG4gIH07XG5cbn07XG5FbGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUElYSS5TcHJpdGUucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50O1xuIiwiXG52YXIgR3VpVXRpbCA9IHtcblxuICBnZXRXaW5kb3dEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7IHg6IHdpbmRvdy5pbm5lcldpZHRoLCB5OiB3aW5kb3cuaW5uZXJIZWlnaHQgfTtcbiAgfSxcblxuICBkcmF3R3JpZDogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgIHZhciBncmlkID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICB2YXIgaW50ZXJ2YWwgPSAxMDA7XG4gICAgdmFyIGNvdW50ID0gaW50ZXJ2YWw7XG4gICAgZ3JpZC5saW5lU3R5bGUoMSwgMHhFNUU1RTUsIDEpO1xuICAgIHdoaWxlIChjb3VudCA8IHdpZHRoKSB7XG4gICAgICBncmlkLm1vdmVUbyhjb3VudCwgMCk7XG4gICAgICBncmlkLmxpbmVUbyhjb3VudCwgaGVpZ2h0KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgY291bnQgPSBpbnRlcnZhbDtcbiAgICB3aGlsZShjb3VudCA8IGhlaWdodCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oMCwgY291bnQpO1xuICAgICAgZ3JpZC5saW5lVG8od2lkdGgsIGNvdW50KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgdmFyIGNvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICAgIGNvbnRhaW5lci5hZGRDaGlsZChncmlkKTtcbiAgICBjb250YWluZXIuY2FjaGVBc0JpdG1hcCA9IHRydWU7XG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEd1aVV0aWw7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEd1aVV0aWwgPSByZXF1aXJlKCcuL2d1aS51dGlsJyk7XG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4vZWxlbWVudCcpO1xuLy92YXIgQXJyb3cgPSByZXF1aXJlKCcuL2Fycm93Jyk7XG52YXIgRWRpdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vRWRpdG9yTWFuYWdlcicpO1xuXG5mdW5jdGlvbiByZXNpemVHdWlDb250YWluZXIocmVuZGVyZXIpIHtcblxuICB2YXIgZGltID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcblxuICBjb25zb2xlLmxvZygnUmVzaXppbmcuLi4nKTtcbiAgY29uc29sZS5sb2coZGltKTtcblxuICAkKCcjZ3VpQ29udGFpbmVyJykuaGVpZ2h0KGRpbS55KTtcbiAgJCgnI2d1aUNvbnRhaW5lcicpLndpZHRoKGRpbS54KTtcblxuICBpZihyZW5kZXJlcikge1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUud2lkdGggPSBkaW0ueCsncHgnO1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUuaGVpZ2h0ID0gZGltLnkrJ3B4JztcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdSZXNpemluZyBndWkgY29udGFpbmVyLi4uJyk7XG5cbn1cblxudmFyIFBpeGlFZGl0b3IgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciB0ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUoKTtcbiAgICBjb25zb2xlLmxvZyh0ZW1wbGF0ZSk7XG5cbiAgICB2YXIgTUFOQUdFUiA9IG5ldyBFZGl0b3JNYW5hZ2VyKHRlbXBsYXRlKTtcbiAgICBNQU5BR0VSLmluaXQoKTtcblxuICAgIGNvbnNvbGUubG9nKCdBZGRpbmcgbGlzdGVuZXIuLi4nKTtcbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgcmVzaXplR3VpQ29udGFpbmVyKHJlbmRlcmVyKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICB0ZW1wbGF0ZTogb3B0aW9ucy50ZW1wbGF0ZSxcblxuICAgICAgZHJhd0NhbnZhc0VkaXRvcjogZnVuY3Rpb24gKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcblxuICAgICAgICBpZiAoaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgIE1BTkFHRVIuYW5pbWF0ZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoTUFOQUdFUi5yZW5kZXJlci52aWV3KTtcblxuICAgICAgICBNQU5BR0VSLmFuaW1hdGUoKTtcblxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBtKCcjZ3VpQ29udGFpbmVyJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0NhbnZhc0VkaXRvcn0pXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUGl4aUVkaXRvcjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA3LzkvMTUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiByZXNpemVFZGl0b3IoZWRpdG9yKSB7XG4gIGVkaXRvci5zZXRTaXplKG51bGwsIHdpbmRvdy5pbm5lckhlaWdodCk7XG59XG5cbnZhciBTb3VyY2VFZGl0b3IgPSB7XG5cbiAgY29udHJvbGxlcjogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgZHJhd0VkaXRvcjogZnVuY3Rpb24gKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcblxuICAgICAgICB2YXIgZWRpdG9yID0gbnVsbDtcblxuICAgICAgICBpZiAoaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgIGlmKGVkaXRvcikge1xuICAgICAgICAgICAgZWRpdG9yLnJlZnJlc2goKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWRpdG9yID0gQ29kZU1pcnJvcihlbGVtZW50LCB7XG4gICAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMudGVtcGxhdGUoKSwgdW5kZWZpbmVkLCAyKSxcbiAgICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICBtb2RlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgZ3V0dGVyczogWydDb2RlTWlycm9yLWxpbnQtbWFya2VycyddLFxuICAgICAgICAgIGxpbnQ6IHRydWUsXG4gICAgICAgICAgc3R5bGVBY3RpdmVMaW5lOiB0cnVlLFxuICAgICAgICAgIGF1dG9DbG9zZUJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIG1hdGNoQnJhY2tldHM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICd6ZW5idXJuJ1xuICAgICAgICB9KTtcblxuICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcblxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJlc2l6ZUVkaXRvcihlZGl0b3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGVkaXRvcikge1xuICAgICAgICAgIG0uc3RhcnRDb21wdXRhdGlvbigpO1xuICAgICAgICAgIG9wdGlvbnMudGVtcGxhdGUoSlNPTi5wYXJzZShlZGl0b3IuZ2V0VmFsdWUoKSkpO1xuICAgICAgICAgIG0uZW5kQ29tcHV0YXRpb24oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICB2aWV3OiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG0oJyNzb3VyY2VFZGl0b3InLCB7IGNvbmZpZzogY29udHJvbGxlci5kcmF3RWRpdG9yIH0pXG4gICAgXVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNvdXJjZUVkaXRvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFNvdXJjZUVkaXRvciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9zb3VyY2UuZWRpdG9yJyk7XG52YXIgUGl4aUVkaXRvciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9waXhpLmVkaXRvcicpO1xuXG52YXIgdGVzdERhdGEgPSByZXF1aXJlKCcuL3Rlc3REYXRhL2VjMi5qc29uJyk7XG5cbnZhciB0ZW1wbGF0ZSA9IG0ucHJvcCh0ZXN0RGF0YSk7XG5cbm0ubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nsb3Vkc2xpY2VyLWFwcCcpLCBtLmNvbXBvbmVudChQaXhpRWRpdG9yLCB7XG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIH0pXG4pO1xuXG5tLm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb2RlLWJhcicpLCBtLmNvbXBvbmVudChTb3VyY2VFZGl0b3IsIHtcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgfSlcbik7XG4iLCJtb2R1bGUuZXhwb3J0cz1cbntcbiAgXCJBV1NUZW1wbGF0ZUZvcm1hdFZlcnNpb25cIiA6IFwiMjAxMC0wOS0wOVwiLFxuXG4gIFwiRGVzY3JpcHRpb25cIiA6IFwiQVdTIENsb3VkRm9ybWF0aW9uIFNhbXBsZSBUZW1wbGF0ZSBFQzJJbnN0YW5jZVdpdGhTZWN1cml0eUdyb3VwU2FtcGxlOiBDcmVhdGUgYW4gQW1hem9uIEVDMiBpbnN0YW5jZSBydW5uaW5nIHRoZSBBbWF6b24gTGludXggQU1JLiBUaGUgQU1JIGlzIGNob3NlbiBiYXNlZCBvbiB0aGUgcmVnaW9uIGluIHdoaWNoIHRoZSBzdGFjayBpcyBydW4uIFRoaXMgZXhhbXBsZSBjcmVhdGVzIGFuIEVDMiBzZWN1cml0eSBncm91cCBmb3IgdGhlIGluc3RhbmNlIHRvIGdpdmUgeW91IFNTSCBhY2Nlc3MuICoqV0FSTklORyoqIFRoaXMgdGVtcGxhdGUgY3JlYXRlcyBhbiBBbWF6b24gRUMyIGluc3RhbmNlLiBZb3Ugd2lsbCBiZSBiaWxsZWQgZm9yIHRoZSBBV1MgcmVzb3VyY2VzIHVzZWQgaWYgeW91IGNyZWF0ZSBhIHN0YWNrIGZyb20gdGhpcyB0ZW1wbGF0ZS5cIixcblxuICBcIlBhcmFtZXRlcnNcIiA6IHtcbiAgICBcIktleU5hbWVcIjoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJOYW1lIG9mIGFuIGV4aXN0aW5nIEVDMiBLZXlQYWlyIHRvIGVuYWJsZSBTU0ggYWNjZXNzIHRvIHRoZSBpbnN0YW5jZVwiLFxuICAgICAgXCJUeXBlXCI6IFwiQVdTOjpFQzI6OktleVBhaXI6OktleU5hbWVcIixcbiAgICAgIFwiQ29uc3RyYWludERlc2NyaXB0aW9uXCIgOiBcIm11c3QgYmUgdGhlIG5hbWUgb2YgYW4gZXhpc3RpbmcgRUMyIEtleVBhaXIuXCJcbiAgICB9LFxuXG4gICAgXCJJbnN0YW5jZVR5cGVcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiV2ViU2VydmVyIEVDMiBpbnN0YW5jZSB0eXBlXCIsXG4gICAgICBcIlR5cGVcIiA6IFwiU3RyaW5nXCIsXG4gICAgICBcIkRlZmF1bHRcIiA6IFwibTEuc21hbGxcIixcbiAgICAgIFwiQWxsb3dlZFZhbHVlc1wiIDogWyBcInQxLm1pY3JvXCIsIFwidDIubWljcm9cIiwgXCJ0Mi5zbWFsbFwiLCBcInQyLm1lZGl1bVwiLCBcIm0xLnNtYWxsXCIsIFwibTEubWVkaXVtXCIsIFwibTEubGFyZ2VcIiwgXCJtMS54bGFyZ2VcIiwgXCJtMi54bGFyZ2VcIiwgXCJtMi4yeGxhcmdlXCIsIFwibTIuNHhsYXJnZVwiLCBcIm0zLm1lZGl1bVwiLCBcIm0zLmxhcmdlXCIsIFwibTMueGxhcmdlXCIsIFwibTMuMnhsYXJnZVwiLCBcImMxLm1lZGl1bVwiLCBcImMxLnhsYXJnZVwiLCBcImMzLmxhcmdlXCIsIFwiYzMueGxhcmdlXCIsIFwiYzMuMnhsYXJnZVwiLCBcImMzLjR4bGFyZ2VcIiwgXCJjMy44eGxhcmdlXCIsIFwiYzQubGFyZ2VcIiwgXCJjNC54bGFyZ2VcIiwgXCJjNC4yeGxhcmdlXCIsIFwiYzQuNHhsYXJnZVwiLCBcImM0Ljh4bGFyZ2VcIiwgXCJnMi4yeGxhcmdlXCIsIFwicjMubGFyZ2VcIiwgXCJyMy54bGFyZ2VcIiwgXCJyMy4yeGxhcmdlXCIsIFwicjMuNHhsYXJnZVwiLCBcInIzLjh4bGFyZ2VcIiwgXCJpMi54bGFyZ2VcIiwgXCJpMi4yeGxhcmdlXCIsIFwiaTIuNHhsYXJnZVwiLCBcImkyLjh4bGFyZ2VcIiwgXCJkMi54bGFyZ2VcIiwgXCJkMi4yeGxhcmdlXCIsIFwiZDIuNHhsYXJnZVwiLCBcImQyLjh4bGFyZ2VcIiwgXCJoaTEuNHhsYXJnZVwiLCBcImhzMS44eGxhcmdlXCIsIFwiY3IxLjh4bGFyZ2VcIiwgXCJjYzIuOHhsYXJnZVwiLCBcImNnMS40eGxhcmdlXCJdXG4gICAgLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBiZSBhIHZhbGlkIEVDMiBpbnN0YW5jZSB0eXBlLlwiXG4gICAgfSxcblxuICAgIFwiU1NITG9jYXRpb25cIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiVGhlIElQIGFkZHJlc3MgcmFuZ2UgdGhhdCBjYW4gYmUgdXNlZCB0byBTU0ggdG8gdGhlIEVDMiBpbnN0YW5jZXNcIixcbiAgICAgIFwiVHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJNaW5MZW5ndGhcIjogXCI5XCIsXG4gICAgICBcIk1heExlbmd0aFwiOiBcIjE4XCIsXG4gICAgICBcIkRlZmF1bHRcIjogXCIwLjAuMC4wLzBcIixcbiAgICAgIFwiQWxsb3dlZFBhdHRlcm5cIjogXCIoXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSkvKFxcXFxkezEsMn0pXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiOiBcIm11c3QgYmUgYSB2YWxpZCBJUCBDSURSIHJhbmdlIG9mIHRoZSBmb3JtIHgueC54LngveC5cIlxuICAgIH1cbiAgfSxcblxuICBcIk1hcHBpbmdzXCIgOiB7XG4gICAgXCJBV1NJbnN0YW5jZVR5cGUyQXJjaFwiIDoge1xuICAgICAgXCJ0MS5taWNyb1wiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwidDIubWljcm9cIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInQyLnNtYWxsXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJ0Mi5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTEuc21hbGxcIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0zLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMS5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwiYzEueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcImMzLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0Ljh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJnMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNRzJcIiAgfSxcbiAgICAgIFwicjMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImhpMS40eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJoczEuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiY3IxLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImNjMi44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9XG4gICAgfVxuICAsXG4gICAgXCJBV1NSZWdpb25BcmNoMkFNSVwiIDoge1xuICAgICAgXCJ1cy1lYXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS0wZjRjZmQ2NFwiLCBcIkhWTTY0XCIgOiBcImFtaS0wZDRjZmQ2NlwiLCBcIkhWTUcyXCIgOiBcImFtaS01YjA1YmEzMFwifSxcbiAgICAgIFwidXMtd2VzdC0yXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktZDNjNWQxZTNcIiwgXCJIVk02NFwiIDogXCJhbWktZDVjNWQxZTVcIiwgXCJIVk1HMlwiIDogXCJhbWktYTlkNmMwOTlcIn0sXG4gICAgICBcInVzLXdlc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTg1ZWExM2MxXCIsIFwiSFZNNjRcIiA6IFwiYW1pLTg3ZWExM2MzXCIsIFwiSFZNRzJcIiA6IFwiYW1pLTM3ODI3YTczXCJ9LFxuICAgICAgXCJldS13ZXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kNmQxOGVhMVwiLCBcIkhWTTY0XCIgOiBcImFtaS1lNGQxOGU5M1wiLCBcIkhWTUcyXCIgOiBcImFtaS03MmE5ZjEwNVwifSxcbiAgICAgIFwiZXUtY2VudHJhbC0xXCIgICAgIDoge1wiUFY2NFwiIDogXCJhbWktYTRiMGI3YjlcIiwgXCJIVk02NFwiIDogXCJhbWktYTZiMGI3YmJcIiwgXCJIVk1HMlwiIDogXCJhbWktYTZjOWNmYmJcIn0sXG4gICAgICBcImFwLW5vcnRoZWFzdC0xXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTFhMWI5ZjFhXCIsIFwiSFZNNjRcIiA6IFwiYW1pLTFjMWI5ZjFjXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWY2NDRjNGY2XCJ9LFxuICAgICAgXCJhcC1zb3V0aGVhc3QtMVwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kMjRiNDI4MFwiLCBcIkhWTTY0XCIgOiBcImFtaS1kNDRiNDI4NlwiLCBcIkhWTUcyXCIgOiBcImFtaS0xMmI1YmM0MFwifSxcbiAgICAgIFwiYXAtc291dGhlYXN0LTJcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktZWY3YjM5ZDVcIiwgXCJIVk02NFwiIDogXCJhbWktZGI3YjM5ZTFcIiwgXCJIVk1HMlwiIDogXCJhbWktYjMzMzdlODlcIn0sXG4gICAgICBcInNhLWVhc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTViMDk4MTQ2XCIsIFwiSFZNNjRcIiA6IFwiYW1pLTU1MDk4MTQ4XCIsIFwiSFZNRzJcIiA6IFwiTk9UX1NVUFBPUlRFRFwifSxcbiAgICAgIFwiY24tbm9ydGgtMVwiICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktYmVjNDU4ODdcIiwgXCJIVk02NFwiIDogXCJhbWktYmNjNDU4ODVcIiwgXCJIVk1HMlwiIDogXCJOT1RfU1VQUE9SVEVEXCJ9XG4gICAgfVxuXG4gIH0sXG5cbiAgXCJSZXNvdXJjZXNcIiA6IHtcbiAgICBcIkVDMkluc3RhbmNlXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6Okluc3RhbmNlXCIsXG4gICAgICBcIlByb3BlcnRpZXNcIiA6IHtcbiAgICAgICAgXCJJbnN0YW5jZVR5cGVcIiA6IHsgXCJSZWZcIiA6IFwiSW5zdGFuY2VUeXBlXCIgfSxcbiAgICAgICAgXCJTZWN1cml0eUdyb3Vwc1wiIDogWyB7IFwiUmVmXCIgOiBcIkluc3RhbmNlU2VjdXJpdHlHcm91cFwiIH0gXSxcbiAgICAgICAgXCJLZXlOYW1lXCIgOiB7IFwiUmVmXCIgOiBcIktleU5hbWVcIiB9LFxuICAgICAgICBcIkltYWdlSWRcIiA6IHsgXCJGbjo6RmluZEluTWFwXCIgOiBbIFwiQVdTUmVnaW9uQXJjaDJBTUlcIiwgeyBcIlJlZlwiIDogXCJBV1M6OlJlZ2lvblwiIH0sXG4gICAgICAgICAgeyBcIkZuOjpGaW5kSW5NYXBcIiA6IFsgXCJBV1NJbnN0YW5jZVR5cGUyQXJjaFwiLCB7IFwiUmVmXCIgOiBcIkluc3RhbmNlVHlwZVwiIH0sIFwiQXJjaFwiIF0gfSBdIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJJbnN0YW5jZVNlY3VyaXR5R3JvdXBcIiA6IHtcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6U2VjdXJpdHlHcm91cFwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiR3JvdXBEZXNjcmlwdGlvblwiIDogXCJFbmFibGUgU1NIIGFjY2VzcyB2aWEgcG9ydCAyMlwiLFxuICAgICAgICBcIlNlY3VyaXR5R3JvdXBJbmdyZXNzXCIgOiBbIHtcbiAgICAgICAgICBcIklwUHJvdG9jb2xcIiA6IFwidGNwXCIsXG4gICAgICAgICAgXCJGcm9tUG9ydFwiIDogXCIyMlwiLFxuICAgICAgICAgIFwiVG9Qb3J0XCIgOiBcIjIyXCIsXG4gICAgICAgICAgXCJDaWRySXBcIiA6IHsgXCJSZWZcIiA6IFwiU1NITG9jYXRpb25cIn1cbiAgICAgICAgfSBdXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIFwiT3V0cHV0c1wiIDoge1xuICAgIFwiSW5zdGFuY2VJZFwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJJbnN0YW5jZUlkIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIlJlZlwiIDogXCJFQzJJbnN0YW5jZVwiIH1cbiAgICB9LFxuICAgIFwiQVpcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiQXZhaWxhYmlsaXR5IFpvbmUgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiRm46OkdldEF0dFwiIDogWyBcIkVDMkluc3RhbmNlXCIsIFwiQXZhaWxhYmlsaXR5Wm9uZVwiIF0gfVxuICAgIH0sXG4gICAgXCJQdWJsaWNETlNcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiUHVibGljIEROU05hbWUgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiRm46OkdldEF0dFwiIDogWyBcIkVDMkluc3RhbmNlXCIsIFwiUHVibGljRG5zTmFtZVwiIF0gfVxuICAgIH0sXG4gICAgXCJQdWJsaWNJUFwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJQdWJsaWMgSVAgYWRkcmVzcyBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJGbjo6R2V0QXR0XCIgOiBbIFwiRUMySW5zdGFuY2VcIiwgXCJQdWJsaWNJcFwiIF0gfVxuICAgIH1cbiAgfVxufVxuIl19
