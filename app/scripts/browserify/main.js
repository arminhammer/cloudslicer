(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/EditorManager.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/26/15.
 */

var GuiUtil = require('./gui.util');
var Collection = require('./lib/collection/collection');
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

},{"./aws/AWS_EC2_EIP":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_EIP.js","./aws/AWS_EC2_Instance":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_Instance.js","./aws/AWS_EC2_SecurityGroup":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_SecurityGroup.js","./aws/AWS_Users":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_Users.js","./gui.util":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js","./lib/collection/collection":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/collection/collection.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_EIP.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/19/15.
 */

var Element = require('../lib/element/element');
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

},{"../drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js","../lib/element/element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/element/element.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_Instance.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/19/15.
 */

var Element = require('../lib/element/element');
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

},{"../drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js","../lib/element/element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/element/element.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_SecurityGroup.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/21/15.
 */

var Element = require('../lib/element/element');

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

},{"../lib/element/element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/element/element.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_Users.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/19/15.
 */

var Element = require('../lib/element/element');
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

},{"../drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js","../lib/element/element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/element/element.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js":[function(require,module,exports){
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

    new TWEEN.Tween(self.tooltip)
      .to({x:self.width},700)
      .easing( TWEEN.Easing.Elastic.InOut )
      .start();
    new TWEEN.Tween(self.tooltip.text)
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


},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js":[function(require,module,exports){

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

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/collection/collection.js":[function(require,module,exports){
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

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/element/element.js":[function(require,module,exports){
/**
 * Created by arming on 9/15/15.
 */

var DragDrop = require('./../../drag.drop.js');

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

},{"./../../drag.drop.js":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/pixi.editor.js":[function(require,module,exports){
/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var GuiUtil = require('./gui.util');
var Element = require('./lib/element/element');
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
      resizeGuiContainer(MANAGER.renderer);
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

},{"./EditorManager":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/EditorManager.js","./gui.util":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js","./lib/element/element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/element/element.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL0VkaXRvck1hbmFnZXIuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX0VJUC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvYXdzL0FXU19FQzJfSW5zdGFuY2UuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX1NlY3VyaXR5R3JvdXAuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfVXNlcnMuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2RyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZ3VpLnV0aWwuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2xpYi9jb2xsZWN0aW9uL2NvbGxlY3Rpb24uanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2xpYi9lbGVtZW50L2VsZW1lbnQuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL3BpeGkuZWRpdG9yLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9zb3VyY2UuZWRpdG9yLmpzIiwiYXBwL3NjcmlwdHMvbWFpbi5qcyIsImFwcC9zY3JpcHRzL3Rlc3REYXRhL2VjMi5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8yNi8xNS5cbiAqL1xuXG52YXIgR3VpVXRpbCA9IHJlcXVpcmUoJy4vZ3VpLnV0aWwnKTtcbnZhciBDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9saWIvY29sbGVjdGlvbi9jb2xsZWN0aW9uJyk7XG52YXIgQVdTX1VzZXJzID0gcmVxdWlyZSgnLi9hd3MvQVdTX1VzZXJzJyk7XG52YXIgQVdTX0VDMl9JbnN0YW5jZSA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfSW5zdGFuY2UnKTtcbnZhciBBV1NfRUMyX0VJUCA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfRUlQJyk7XG52YXIgQVdTX0VDMl9TZWN1cml0eUdyb3VwID0gcmVxdWlyZSgnLi9hd3MvQVdTX0VDMl9TZWN1cml0eUdyb3VwJyk7XG5cbnZhciBFZGl0b3JNYW5hZ2VyID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdmFyIGZwc1N0YXRzID0gbmV3IFN0YXRzKCk7XG4gIGZwc1N0YXRzLnNldE1vZGUoMCk7XG4gIC8vIGFsaWduIHRvcC1sZWZ0XG4gIGZwc1N0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICBmcHNTdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4JztcbiAgZnBzU3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZnBzU3RhdHMuZG9tRWxlbWVudCApO1xuXG4gIHZhciBtc1N0YXRzID0gbmV3IFN0YXRzKCk7XG4gIG1zU3RhdHMuc2V0TW9kZSgxKTtcbiAgLy8gYWxpZ24gdG9wLWxlZnRcbiAgbXNTdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgbXNTdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnODBweCc7XG4gIG1zU3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggbXNTdGF0cy5kb21FbGVtZW50ICk7XG5cbiAgdmFyIG1iU3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgbWJTdGF0cy5zZXRNb2RlKDIpO1xuICAvLyBhbGlnbiB0b3AtbGVmdFxuICBtYlN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICBtYlN0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICcxNjBweCc7XG4gIG1iU3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggbWJTdGF0cy5kb21FbGVtZW50ICk7XG5cblxuICBmcHMgPSA2MDtcbiAgdmFyIG5vdztcbiAgdmFyIHRoZW4gPSBEYXRlLm5vdygpO1xuICB2YXIgaW50ZXJ2YWwgPSAxMDAwL2ZwcztcbiAgdmFyIGRlbHRhO1xuICAvL3ZhciBtZXRlciA9IG5ldyBGUFNNZXRlcigpO1xuICB2YXIgd2luRGltZW5zaW9uID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcbiAgdmFyIGdyaWQgPSBudWxsO1xuXG4gIHNlbGYucmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcih3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnksIHtiYWNrZ3JvdW5kQ29sb3IgOiAweEZGRkZGRn0pO1xuXG4gIHNlbGYuc3RhZ2UgPSBuZXcgUElYSS5TdGFnZSgpO1xuICBzZWxmLnN0YWdlLm5hbWUgPSAnc3RhZ2UnO1xuICBzZWxmLnN0YWdlLnNlbGVjdGVkID0gbnVsbDtcbiAgc2VsZi5zdGFnZS5jbGlja2VkT25seVN0YWdlID0gdHJ1ZTtcbiAgc2VsZi5zdGFnZS5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gIHNlbGYuc3RhZ2Uub24oJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcbiAgICBpZihzZWxmLnN0YWdlLmNsaWNrZWRPbmx5U3RhZ2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBzdGFnZSBjbGljaycpO1xuICAgICAgaWYoc2VsZi5zdGFnZS5zZWxlY3RlZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhzZWxmLnN0YWdlLnNlbGVjdGVkKTtcbiAgICAgICAgc2VsZi5zdGFnZS5zZWxlY3RlZC5maWx0ZXJzID0gbnVsbDtcbiAgICAgICAgc2VsZi5zdGFnZS5zZWxlY3RlZCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2VsZi5zdGFnZS5jbGlja2VkT25seVN0YWdlID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHNlbGYuc3RhZ2UuTUFOQUdFUiA9IHNlbGY7XG5cbiAgc2VsZi5zZWN1cml0eWdyb3VwcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG4gIHNlbGYuZWxlbWVudHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG4gIHZhciBjb2xsaXNpb25tYW5hZ2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgY29sbFNlbGYgPSB0aGlzO1xuXG4gICAgY29sbFNlbGYuc2VjR3JvdXBWc0VsZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VjR3JwcyA9IHNlbGYuc2VjdXJpdHlncm91cHM7XG4gICAgICB2YXIgZWxlbXMgPSBzZWxmLmVsZW1lbnRzO1xuXG4gICAgICBfLmVhY2goc2VjR3Jwcy5lbGVtZW50cywgZnVuY3Rpb24ocykge1xuXG4gICAgICAgIF8uZWFjaChlbGVtcy5lbGVtZW50cywgZnVuY3Rpb24oZSkge1xuXG4gICAgICAgICAgdmFyIHhkaXN0ID0gcy5wb3NpdGlvbi54IC0gZS5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgaWYoeGRpc3QgPiAtcy53aWR0aC8yICYmIHhkaXN0IDwgcy53aWR0aC8yKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhciB5ZGlzdCA9IHMucG9zaXRpb24ueSAtIGUucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgaWYoeWRpc3QgPiAtcy5oZWlnaHQvMiAmJiB5ZGlzdCA8IHMuaGVpZ2h0LzIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIC8vICBjb25zb2xlLmxvZygnQ29sbGlzaW9uIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgY29sbFNlbGYudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBjb2xsU2VsZi5zZWNHcm91cFZzRWxlbWVudHMoKTtcbiAgICB9O1xuXG4gIH07XG5cbiAgc2VsZi5Db2xsaXNpb25NYW5hZ2VyID0gbmV3IGNvbGxpc2lvbm1hbmFnZXIoKTtcblxuICBzZWxmLmFuaW1hdGUgPSBmdW5jdGlvbih0aW1lKSB7XG5cbiAgICBub3cgPSBEYXRlLm5vdygpO1xuICAgIGRlbHRhID0gbm93IC0gdGhlbjtcblxuICAgIGlmIChkZWx0YSA+IGludGVydmFsKSB7XG4gICAgICBmcHNTdGF0cy5iZWdpbigpO1xuICAgICAgbXNTdGF0cy5iZWdpbigpO1xuICAgICAgbWJTdGF0cy5iZWdpbigpO1xuXG4gICAgICAvL3NlbGYuQ29sbGlzaW9uTWFuYWdlci51cGRhdGUoKTtcblxuICAgICAgdGhlbiA9IG5vdyAtIChkZWx0YSAlIGludGVydmFsKTtcbiAgICAgIC8vbWV0ZXIudGljaygpO1xuXG4gICAgICBUV0VFTi51cGRhdGUodGltZSk7XG4gICAgICBzZWxmLnJlbmRlcmVyLnJlbmRlcihzZWxmLnN0YWdlKTtcblxuICAgICAgZnBzU3RhdHMuZW5kKCk7XG4gICAgICBtc1N0YXRzLmVuZCgpO1xuICAgICAgbWJTdGF0cy5lbmQoKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2VsZi5hbmltYXRlKTtcbiAgfTtcblxuICBzZWxmLmdyaWRPbiA9IGZ1bmN0aW9uKCkge1xuICAgIGdyaWQgPSBHdWlVdGlsLmRyYXdHcmlkKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSk7XG4gICAgc2VsZi5zdGFnZS5hZGRDaGlsZChncmlkKTtcbiAgfTtcblxuICBzZWxmLmdyaWRPZmYgPSBmdW5jdGlvbigpIHtcbiAgICBzZWxmLnN0YWdlLnJlbW92ZUNoaWxkKGdyaWQpO1xuICAgIHNlbGYuZ3JpZCA9IG51bGw7XG4gIH07XG5cbiAgc2VsZi5vbkxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdBc3NldHMgbG9hZGVkJyk7XG5cbiAgICB2YXIgZGltID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcbiAgICBjb25zb2xlLmxvZyhzZWxmLmVsZW1lbnRzLnBvc2l0aW9uKTtcblxuICAgIHZhciB1c2VycyA9IG5ldyBBV1NfVXNlcnMoJ3VzZXJzJywgZGltLngvMiwgMTAwKTtcbiAgICBjb25zb2xlLmxvZyh1c2Vycy5wb3NpdGlvbik7XG4gICAgc2VsZi5lbGVtZW50cy5hZGQodXNlcnMpO1xuXG4gICAgY29uc29sZS5sb2codGVtcGxhdGUuUmVzb3VyY2VzKTtcblxuICAgIHZhciBncm91cGluZ3MgPSBfLnJlZHVjZSh0ZW1wbGF0ZS5SZXNvdXJjZXMsIGZ1bmN0aW9uKHJlc3VsdCwgbiwga2V5KSB7XG4gICAgICByZXN1bHRbbi5UeXBlXSA9IHt9O1xuICAgICAgcmVzdWx0W24uVHlwZV1ba2V5XSA9IG47XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSwge30pO1xuICAgIGNvbnNvbGUubG9nKCdHcm91cGluZ3M6Jyk7XG4gICAgY29uc29sZS5sb2coZ3JvdXBpbmdzKTtcblxuICAgIHZhciBpbnN0YW5jZXMgPSB7fTtcbiAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6SW5zdGFuY2UnXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQVdTX0VDMl9JbnN0YW5jZShrZXksIGRpbS54LzIsIDQwMCk7XG4gICAgICBpbnN0YW5jZXNba2V5XSA9IGluc3RhbmNlO1xuICAgIH0pO1xuXG4gICAgdmFyIGVpcHMgPSB7fTtcbiAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6RUlQJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgY29uc29sZS5sb2coJ0FkZGluZyBFSVAgJywga2V5KTtcbiAgICAgIHZhciBlaXAgPSBuZXcgQVdTX0VDMl9FSVAoa2V5LCBkaW0ueC8yLCA1MDApO1xuICAgICAgZWlwc1trZXldID0gZWlwO1xuICAgIH0pO1xuXG4gICAgdmFyIHNlY2dyb3VwcyA9IHt9O1xuICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpTZWN1cml0eUdyb3VwJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgY29uc29sZS5sb2coJ0FkZGluZyBTZWN1cml0eSBHcm91cCAnLCBrZXkpO1xuICAgICAgdmFyIHNlY2dyb3VwID0gbmV3IEFXU19FQzJfU2VjdXJpdHlHcm91cChrZXksIGRpbS54LzIsIDUwMCk7XG4gICAgICBzZWNncm91cHNba2V5XSA9IHNlY2dyb3VwO1xuICAgIH0pO1xuXG4gICAgdmFyIGNvbWJvSW5zdGFuY2VzID0ge307XG4gICAgXy5lYWNoKGdyb3VwaW5nc1snQVdTOjpFQzI6OkVJUEFzc29jaWF0aW9uJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgY29uc29sZS5sb2coJ0NoZWNraW5nIGFzc29jaWF0aW9uJyk7XG4gICAgICBjb25zb2xlLmxvZyhuKTtcbiAgICAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICBjb25zb2xlLmxvZyhlaXBzKTtcbiAgICAgIGNvbnNvbGUubG9nKCdSZWY6ICcsbi5Qcm9wZXJ0aWVzLkVJUC5SZWYpO1xuICAgICAgdmFyIGluc3RhbmNlID0gaW5zdGFuY2VzW24uUHJvcGVydGllcy5JbnN0YW5jZUlkLlJlZl07XG4gICAgICBpZihpbnN0YW5jZSkge1xuICAgICAgICB2YXIgZWlwID0gZWlwc1tuLlByb3BlcnRpZXMuRUlQLlJlZl07XG4gICAgICAgIGlmKGVpcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdBc3NvY2lhdGlvbiBoYXMgYSBtYXRjaCEnKTtcbiAgICAgICAgICB2YXIgY29udGFpbmVyID0gbmV3IENvbGxlY3Rpb24oKTtcbiAgICAgICAgICBjb250YWluZXIuYWRkKGluc3RhbmNlKTtcbiAgICAgICAgICBjb250YWluZXIuYWRkKGVpcCk7XG4gICAgICAgICAgY29tYm9JbnN0YW5jZXNba2V5XSA9IGNvbnRhaW5lcjtcbiAgICAgICAgICBkZWxldGUgaW5zdGFuY2VzW24uUHJvcGVydGllcy5JbnN0YW5jZUlkLlJlZl07XG4gICAgICAgICAgZGVsZXRlIGVpcHNbbi5Qcm9wZXJ0aWVzLkVJUC5SZWZdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL3ZhciBlaXAgPSBuZXcgQVdTX0VDMl9FSVAoa2V5LCBkaW0ueC8yLCA1MDApO1xuICAgICAgLy9laXBzW2tleV0gPSBlaXA7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goc2VjZ3JvdXBzLCBmdW5jdGlvbihzLCBrZXkpIHtcbiAgICAgIHNlbGYuc2VjdXJpdHlncm91cHMuYWRkKHMpO1xuICAgIH0pO1xuXG4gICAgXy5lYWNoKGNvbWJvSW5zdGFuY2VzLCBmdW5jdGlvbihjb21ibywga2V5KSB7XG4gICAgICBzZWxmLmVsZW1lbnRzLmFkZChjb21ibyk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goaW5zdGFuY2VzLCBmdW5jdGlvbihpbnN0YW5jZSwga2V5KSB7XG4gICAgICBzZWxmLmVsZW1lbnRzLmFkZChpbnN0YW5jZSk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goZWlwcywgZnVuY3Rpb24oZWlwLCBrZXkpIHtcbiAgICAgIHNlbGYuZWxlbWVudHMuYWRkKGVpcCk7XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnQ2hpbGRyZW46Jyk7XG4gICAgY29uc29sZS5sb2coc2VsZi5lbGVtZW50cy5jaGlsZHJlbik7XG5cbiAgICBzZWxmLnN0YWdlLmFkZENoaWxkKHNlbGYuc2VjdXJpdHlncm91cHMpO1xuICAgIHNlbGYuc3RhZ2UuYWRkQ2hpbGQoc2VsZi5lbGVtZW50cyk7XG4gICAgY29uc29sZS5sb2coc2VsZi5zdGFnZS5jaGlsZHJlbik7XG5cbiAgICB2YXIgbWVudVNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSgpO1xuICAgIG1lbnVTcHJpdGUudGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ0NvbXB1dGVfJl9OZXR3b3JraW5nX0FtYXpvbl9FQzJfSW5zdGFuY2UucG5nJyk7XG4gICAgbWVudVNwcml0ZS5zY2FsZS5zZXQoMC4yKTtcbiAgICBtZW51U3ByaXRlLnkgPSBkaW0ueS8yO1xuICAgIG1lbnVTcHJpdGUueCA9IGRpbS54LTQwO1xuICAgIG1lbnVTcHJpdGUuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgIG1lbnVTcHJpdGUuYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgbWVudVNwcml0ZS5hbmNob3Iuc2V0KDAuNSk7XG4gICAgbWVudVNwcml0ZVxuICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqMS4yKTtcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54LzEuMik7XG4gICAgICB9KVxuICAgICAgLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkLicpO1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQVdTX0VDMl9JbnN0YW5jZSgnTmV3X0luc3RhbmNlJywgZGltLngvMiwgZGltLnkvMik7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuYWRkKGluc3RhbmNlKTtcbiAgICAgIH0pO1xuICAgIHNlbGYuc3RhZ2UuYWRkQ2hpbGQobWVudVNwcml0ZSk7XG5cbiAgICB2YXIgbWVudVNlY0dyb3VwID0gbmV3IFBJWEkuU3ByaXRlKCk7XG4gICAgdmFyIG1lbnVHcmFwaGljID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICBtZW51R3JhcGhpYy5saW5lU3R5bGUoMywgMHgwMDAwMDAsIDEpO1xuICAgIG1lbnVHcmFwaGljLmJlZ2luRmlsbCgweEZGRkZGRiwgMSk7XG4gICAgbWVudUdyYXBoaWMuZHJhd1JvdW5kZWRSZWN0KDAsMCwzMCwzMCw2KTtcbiAgICBtZW51R3JhcGhpYy5lbmRGaWxsKCk7XG4gICAgbWVudVNlY0dyb3VwLnRleHR1cmUgPSBtZW51R3JhcGhpYy5nZW5lcmF0ZVRleHR1cmUoKTtcblxuICAgIG1lbnVTZWNHcm91cC5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgbWVudVNlY0dyb3VwLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgIG1lbnVTZWNHcm91cC5wb3NpdGlvbi55ID0gZGltLnkvMis0MDtcbiAgICBtZW51U2VjR3JvdXAucG9zaXRpb24ueCA9IGRpbS54LTQwO1xuICAgIG1lbnVTZWNHcm91cC5zY2FsZS5zZXQoMS4wKTtcbiAgICBtZW51U2VjR3JvdXAuYW5jaG9yLnNldCgwLjUpO1xuICAgIG1lbnVTZWNHcm91cFxuICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqMS4xKTtcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54LzEuMSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkLicpO1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQVdTX0VDMl9TZWN1cml0eUdyb3VwKCdOZXdfU2VjdXJpdHlfR3JvdXAnLCBkaW0ueC8yLCBkaW0ueS8yKTtcbiAgICAgICAgc2VsZi5zZWN1cml0eWdyb3Vwcy5hZGQoaW5zdGFuY2UpO1xuICAgICAgfSk7XG4gICAgc2VsZi5zdGFnZS5hZGRDaGlsZChtZW51U2VjR3JvdXApO1xuICB9O1xuXG4gIHNlbGYuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuZ3JpZE9uKCk7XG4gICAgUElYSS5sb2FkZXJcbiAgICAgIC5hZGQoJy4uL3Jlc291cmNlcy9zcHJpdGVzL3Nwcml0ZXMuanNvbicpXG4gICAgICAubG9hZChzZWxmLm9uTG9hZGVkKTtcbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvck1hbmFnZXI7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2xpYi9lbGVtZW50L2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX0VDMl9FSVAgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi5zY2FsZS5zZXQoMC4zKTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9FbGFzdGljX0lQLnBuZycpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xufTtcbkFXU19FQzJfRUlQLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19FQzJfRUlQO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTkvMTUuXG4gKi9cblxudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuLi9saWIvZWxlbWVudC9lbGVtZW50Jyk7XG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuLi9kcmFnLmRyb3AnKTtcblxudmFyIEFXU19FQzJfSW5zdGFuY2UgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9JbnN0YW5jZS5wbmcnKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxuICBzZWxmLnNlY3VyaXR5R3JvdXAgPSBudWxsO1xufTtcbkFXU19FQzJfSW5zdGFuY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX0VDMl9JbnN0YW5jZTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzIxLzE1LlxuICovXG5cbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi4vbGliL2VsZW1lbnQvZWxlbWVudCcpO1xuXG52YXIgQVdTX0VDMl9TZWN1cml0eUdyb3VwID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgRWxlbWVudC5jYWxsKHRoaXMpO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcblxuICB2YXIgZ3JhcGhpYyA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gIGdyYXBoaWMubGluZVN0eWxlKDMsIDB4MDAwMDAwLCAxKTtcbiAgZ3JhcGhpYy5iZWdpbkZpbGwoMHhGRkZGRkYsIDAuMCk7XG4gIGdyYXBoaWMuZHJhd1JvdW5kZWRSZWN0KDAsMCwyMDAsMjAwLDEwKTtcbiAgZ3JhcGhpYy5lbmRGaWxsKCk7XG5cbiAgc2VsZi50ZXh0dXJlID0gZ3JhcGhpYy5nZW5lcmF0ZVRleHR1cmUoKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxufTtcbkFXU19FQzJfU2VjdXJpdHlHcm91cC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfRUMyX1NlY3VyaXR5R3JvdXA7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2xpYi9lbGVtZW50L2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX1VzZXJzID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgRWxlbWVudC5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYubmFtZSA9IG5hbWU7XG4gIHNlbGYudGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ05vbi1TZXJ2aWNlX1NwZWNpZmljX2NvcHlfVXNlcnMucG5nJyk7XG4gIHNlbGYucG9zaXRpb24ueCA9IHg7XG4gIHNlbGYucG9zaXRpb24ueSA9IHk7XG5cbn07XG5BV1NfVXNlcnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX1VzZXJzO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTQvMTUuXG4gKi9cblxudmFyIE1PVVNFX09WRVJfU0NBTEVfUkFUSU8gPSAxLjE7XG5cbnZhciBEcmFnRHJvcCA9IHtcblxuICBvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygpO1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gIH0sXG5cbiAgb25EcmFnRW5kOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYodGhpcy5tb3ZlZCkge1xuICAgICAgY29uc29sZS5sb2coJ0ZvdW5kIGNsaWNrIHdoaWxlIGRyYWdnaW5nJyk7XG4gICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMubW92ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGF0YSA9IG51bGw7XG5cbiAgICAgIGlmKCF0aGlzLnNlY3VyaXR5R3JvdXApIHtcblxuICAgICAgICAgIC8vY29uc29sZS5sb2coJ1BhcmVudCcpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHNlbGYucGFyZW50LnBhcmVudC5NQU5BR0VSKTtcbiAgICAgICAgICB2YXIgc2VjR3JwcyA9IHNlbGYucGFyZW50LnBhcmVudC5NQU5BR0VSLnNlY3VyaXR5Z3JvdXBzO1xuXG4gICAgICAgICAgXy5lYWNoKHNlY0dycHMuZWxlbWVudHMsIGZ1bmN0aW9uKHMpIHtcblxuICAgICAgICAgICAgICB2YXIgeGRpc3QgPSBzLnBvc2l0aW9uLnggLSBzZWxmLnBvc2l0aW9uLng7XG5cbiAgICAgICAgICAgICAgaWYoeGRpc3QgPiAtcy53aWR0aC8yICYmIHhkaXN0IDwgcy53aWR0aC8yKVxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHlkaXN0ID0gcy5wb3NpdGlvbi55IC0gc2VsZi5wb3NpdGlvbi55O1xuXG4gICAgICAgICAgICAgICAgaWYoeWRpc3QgPiAtcy5oZWlnaHQvMiAmJiB5ZGlzdCA8IHMuaGVpZ2h0LzIpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29sbGlzaW9uIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgICAgICAgc2VsZi5wb3NpdGlvbi54ID0gMDtcbiAgICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb24ueSA9IDA7XG4gICAgICAgICAgICAgICAgICBzZWxmLnNlY3VyaXR5R3JvdXAgPSBzO1xuICAgICAgICAgICAgICAgICAgICBzLmFkZENoaWxkKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2VsZik7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0ZvdW5kIGNsaWNrIHdoaWxlIE5PVCBkcmFnZ2luZycpO1xuICAgICAgdmFyIHNoYWRvdyA9IG5ldyBQSVhJLmZpbHRlcnMuRHJvcFNoYWRvd0ZpbHRlcigpO1xuICAgICAgdGhpcy5maWx0ZXJzID0gW3NoYWRvd107XG4gICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIGNvbnNvbGUubG9nKCdQYXJlbnQ6Jyk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnBhcmVudC5wYXJlbnQpO1xuICAgICAgaWYodGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkKSB7XG4gICAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZC5maWx0ZXJzID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFyZW50LnBhcmVudC5jbGlja2VkT25seVN0YWdlID0gZmFsc2U7XG4gICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQgPSB0aGlzO1xuICAgIH1cbiAgfSxcblxuICBvbkRyYWdNb3ZlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuZHJhZ2dpbmcpXG4gICAge1xuICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gc2VsZi5kYXRhLmdldExvY2FsUG9zaXRpb24oc2VsZi5wYXJlbnQpO1xuICAgICAgc2VsZi5wb3NpdGlvbi54ID0gbmV3UG9zaXRpb24ueDtcbiAgICAgIHNlbGYucG9zaXRpb24ueSA9IG5ld1Bvc2l0aW9uLnk7XG4gICAgICBzZWxmLm1vdmVkID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cbiAgb25Nb3VzZU92ZXI6IGZ1bmN0aW9uKCkge1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlZCBvdmVyIScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG4gICAgdmFyIGljb25TaXplID0gMTA7XG5cbiAgICB2YXIgZ2xvYmFsID0gc2VsZi50b0dsb2JhbChzZWxmLnBvc2l0aW9uKTtcbiAgICAvL2NvbnNvbGUubG9nKCdvZmZpY2lhbDogJyArIHNlbGYucG9zaXRpb24ueCArICc6JyArIHNlbGYucG9zaXRpb24ueSk7XG4gICAgLy9jb25zb2xlLmxvZygnR0xPQkFMOiAnICsgZ2xvYmFsLnggKyAnOicgKyBnbG9iYWwueSk7XG4gICAgLy9jb25zb2xlLmxvZyhzZWxmLmdldExvY2FsQm91bmRzKCkpO1xuXG4gICAgdmFyIHNjYWxlTG9jYXRpb25zID0gW1xuICAgICAge3g6IDAsIHk6IDAtc2VsZi5nZXRMb2NhbEJvdW5kcygpLmhlaWdodC8yLWljb25TaXplLzIsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aC8yLWljb25TaXplLzIsIHk6IDAsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiBzZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMitpY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMCwgeTogc2VsZi5nZXRMb2NhbEJvdW5kcygpLmhlaWdodC8yK2ljb25TaXplLzIsIHNpemU6IGljb25TaXplfVxuICAgIF07XG5cbiAgICAvL2NvbnNvbGUubG9nKHNjYWxlTG9jYXRpb25zWzBdKTtcblxuICAgIHNlbGYuc2NhbGVJY29ucyA9IFtdO1xuXG4gICAgc2NhbGVMb2NhdGlvbnMuZm9yRWFjaChmdW5jdGlvbihsb2MpIHtcbiAgICAgIHZhciBpY29uID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICAgIGljb24ubW92ZVRvKDAsMCk7XG4gICAgICBpY29uLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGljb24uYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgICBpY29uLmxpbmVTdHlsZSgxLCAweDAwMDBGRiwgMSk7XG4gICAgICBpY29uLmJlZ2luRmlsbCgweEZGRkZGRiwgMSk7XG4gICAgICBpY29uLmRyYXdDaXJjbGUobG9jLngsIGxvYy55LCBsb2Muc2l6ZSk7XG4gICAgICBpY29uLmVuZEZpbGwoKTtcblxuICAgICAgLy9pY29uXG4gICAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBzdGFydFxuICAgICAgICAvLy5vbignbW91c2Vkb3duJywgb25TY2FsZUljb25EcmFnU3RhcnQpXG4gICAgICAgIC8vLm9uKCd0b3VjaHN0YXJ0Jywgb25TY2FsZUljb25EcmFnU3RhcnQpO1xuICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIGVuZFxuICAgICAgLy8ub24oJ21vdXNldXAnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbignbW91c2V1cG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbigndG91Y2hlbmQnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbigndG91Y2hlbmRvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIG1vdmVcbiAgICAgIC8vLm9uKCdtb3VzZW1vdmUnLCBvbkRyYWdNb3ZlKVxuICAgICAgLy8ub24oJ3RvdWNobW92ZScsIG9uRHJhZ01vdmUpXG5cbiAgICAgIHNlbGYuc2NhbGVJY29ucy5wdXNoKGljb24pO1xuXG4gICAgfSk7XG5cbiAgICBzZWxmLnNjYWxlSWNvbnMuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICBzZWxmLmFkZENoaWxkKHMpO1xuICAgIH0pO1xuXG4gICAgc2VsZi50b29sdGlwID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICBzZWxmLnRvb2x0aXAubGluZVN0eWxlKDMsIDB4MDAwMEZGLCAxKTtcbiAgICBzZWxmLnRvb2x0aXAuYmVnaW5GaWxsKDB4MDAwMDAwLCAxKTtcbiAgICAvL3NlbGYuZHJhdy5tb3ZlVG8oeCx5KTtcbiAgICBzZWxmLnRvb2x0aXAuZHJhd1JvdW5kZWRSZWN0KDArMjAsLXNlbGYuaGVpZ2h0LDIwMCwxMDAsMTApO1xuICAgIHNlbGYudG9vbHRpcC5lbmRGaWxsKCk7XG4gICAgc2VsZi50b29sdGlwLnRleHRTdHlsZSA9IHtcbiAgICAgIGZvbnQgOiAnYm9sZCBpdGFsaWMgMjhweCBBcmlhbCcsXG4gICAgICBmaWxsIDogJyNGN0VEQ0EnLFxuICAgICAgc3Ryb2tlIDogJyM0YTE4NTAnLFxuICAgICAgc3Ryb2tlVGhpY2tuZXNzIDogNSxcbiAgICAgIGRyb3BTaGFkb3cgOiB0cnVlLFxuICAgICAgZHJvcFNoYWRvd0NvbG9yIDogJyMwMDAwMDAnLFxuICAgICAgZHJvcFNoYWRvd0FuZ2xlIDogTWF0aC5QSSAvIDYsXG4gICAgICBkcm9wU2hhZG93RGlzdGFuY2UgOiA2LFxuICAgICAgd29yZFdyYXAgOiB0cnVlLFxuICAgICAgd29yZFdyYXBXaWR0aCA6IDQ0MFxuICAgIH07XG5cbiAgICBzZWxmLnRvb2x0aXAudGV4dCA9IG5ldyBQSVhJLlRleHQoc2VsZi5uYW1lLHNlbGYudG9vbHRpcC50ZXh0U3R5bGUpO1xuICAgIHNlbGYudG9vbHRpcC50ZXh0LnggPSAwKzMwO1xuICAgIHNlbGYudG9vbHRpcC50ZXh0LnkgPSAtc2VsZi5oZWlnaHQ7XG5cbiAgICBuZXcgVFdFRU4uVHdlZW4oc2VsZi50b29sdGlwKVxuICAgICAgLnRvKHt4OnNlbGYud2lkdGh9LDcwMClcbiAgICAgIC5lYXNpbmcoIFRXRUVOLkVhc2luZy5FbGFzdGljLkluT3V0IClcbiAgICAgIC5zdGFydCgpO1xuICAgIG5ldyBUV0VFTi5Ud2VlbihzZWxmLnRvb2x0aXAudGV4dClcbiAgICAgIC50byh7eDpzZWxmLndpZHRoKzIwfSw3MDApXG4gICAgICAuZWFzaW5nKCBUV0VFTi5FYXNpbmcuRWxhc3RpYy5Jbk91dCApXG4gICAgICAuc3RhcnQoKTtcblxuICAgIGNvbnNvbGUubG9nKCdBZGRpbmcgdG9vbHRpcCcpO1xuICAgIHNlbGYuYWRkQ2hpbGQoc2VsZi50b29sdGlwKTtcblxuICAgIHNlbGYuYWRkQ2hpbGQoc2VsZi50b29sdGlwLnRleHQpO1xuICB9LFxuXG4gIG9uTW91c2VPdXQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlZCBvdXQhJyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueC9NT1VTRV9PVkVSX1NDQUxFX1JBVElPKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZSBvdXQnKTtcbiAgICB0aGlzLnNjYWxlSWNvbnMuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICBzZWxmLnJlbW92ZUNoaWxkKHMpO1xuICAgIH0pO1xuICAgIC8vY29uc29sZS5sb2coJ1NpemU6ICcpO1xuICAgIC8vY29uc29sZS5sb2codGhpcy5nZXRCb3VuZHMoKSk7XG5cbiAgICBzZWxmLnJlbW92ZUNoaWxkKHNlbGYudG9vbHRpcCk7XG4gICAgc2VsZi5yZW1vdmVDaGlsZChzZWxmLnRvb2x0aXAudGV4dCk7XG4gIH0sXG5cbiAgb25TY2FsZUljb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy5kYXRhID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLmFscGhhID0gMC41O1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICAgIGNvbnNvbGUubG9nKCdSZXNpemluZyEnKTtcbiAgfVxuXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ0Ryb3A7XG5cbiIsIlxudmFyIEd1aVV0aWwgPSB7XG5cbiAgZ2V0V2luZG93RGltZW5zaW9uOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geyB4OiB3aW5kb3cuaW5uZXJXaWR0aCwgeTogd2luZG93LmlubmVySGVpZ2h0IH07XG4gIH0sXG5cbiAgZHJhd0dyaWQ6IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgZ3JpZCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgdmFyIGludGVydmFsID0gMTAwO1xuICAgIHZhciBjb3VudCA9IGludGVydmFsO1xuICAgIGdyaWQubGluZVN0eWxlKDEsIDB4RTVFNUU1LCAxKTtcbiAgICB3aGlsZSAoY291bnQgPCB3aWR0aCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oY291bnQsIDApO1xuICAgICAgZ3JpZC5saW5lVG8oY291bnQsIGhlaWdodCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIGNvdW50ID0gaW50ZXJ2YWw7XG4gICAgd2hpbGUoY291bnQgPCBoZWlnaHQpIHtcbiAgICAgIGdyaWQubW92ZVRvKDAsIGNvdW50KTtcbiAgICAgIGdyaWQubGluZVRvKHdpZHRoLCBjb3VudCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIHZhciBjb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgICBjb250YWluZXIuYWRkQ2hpbGQoZ3JpZCk7XG4gICAgY29udGFpbmVyLmNhY2hlQXNCaXRtYXAgPSB0cnVlO1xuICAgIHJldHVybiBjb250YWluZXI7XG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHdWlVdGlsO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzIxLzE1LlxuICovXG4vKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIENvbGxlY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgUElYSS5Db250YWluZXIuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuZWxlbWVudHMgPSB7fTtcblxuICBzZWxmLmFkZCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBzZWxmLmFkZENoaWxkKGVsZW1lbnQpO1xuICAgIHNlbGYuZWxlbWVudHNbZWxlbWVudC5uYW1lXSA9IGVsZW1lbnQ7XG4gIH07XG5cbiAgc2VsZi5yZW1vdmUgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgc2VsZi5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgICBkZWxldGUgc2VsZi5lbGVtZW50c1tlbGVtZW50Lm5hbWVdO1xuICB9O1xuXG59O1xuQ29sbGVjdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBJWEkuQ29udGFpbmVyLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8xNS8xNS5cbiAqL1xuXG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuLy4uLy4uL2RyYWcuZHJvcC5qcycpO1xuXG52YXIgREVGQVVMVF9TQ0FMRSA9IDAuNztcblxudmFyIEVsZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgUElYSS5TcHJpdGUuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuc2NhbGUuc2V0KERFRkFVTFRfU0NBTEUpO1xuICBzZWxmLmFuY2hvci5zZXQoMC41KTtcbiAgc2VsZi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gIHNlbGYuYnV0dG9uTW9kZSA9IHRydWU7XG4gIHNlbGZcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAub24oJ21vdXNlZG93bicsIERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC5vbigndG91Y2hzdGFydCcsIERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAub24oJ21vdXNldXAnLCBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCdtb3VzZXVwb3V0c2lkZScsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ3RvdWNoZW5kJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbigndG91Y2hlbmRvdXRzaWRlJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgLm9uKCdtb3VzZW1vdmUnLCBEcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgIC5vbigndG91Y2htb3ZlJywgRHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAvLyBldmVudHMgZm9yIG1vdXNlIG92ZXJcbiAgICAub24oJ21vdXNlb3ZlcicsIERyYWdEcm9wLm9uTW91c2VPdmVyKVxuICAgIC5vbignbW91c2VvdXQnLCBEcmFnRHJvcC5vbk1vdXNlT3V0KTtcblxuICBzZWxmLmFycm93cyA9IFtdO1xuXG4gIHNlbGYuYWRkQXJyb3dUbyA9IGZ1bmN0aW9uKGIpIHtcbiAgICBzZWxmLmFycm93cy5wdXNoKGIpO1xuICB9O1xuXG4gIHNlbGYucmVtb3ZlQXJyb3dUbyA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgc2VsZi5hcnJvd3MucmVtb3ZlKGluZGV4KTtcbiAgfTtcblxufTtcbkVsZW1lbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQSVhJLlNwcml0ZS5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnQ7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEd1aVV0aWwgPSByZXF1aXJlKCcuL2d1aS51dGlsJyk7XG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4vbGliL2VsZW1lbnQvZWxlbWVudCcpO1xuLy92YXIgQXJyb3cgPSByZXF1aXJlKCcuL2Fycm93Jyk7XG52YXIgRWRpdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vRWRpdG9yTWFuYWdlcicpO1xuXG5mdW5jdGlvbiByZXNpemVHdWlDb250YWluZXIocmVuZGVyZXIpIHtcblxuICB2YXIgZGltID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcblxuICBjb25zb2xlLmxvZygnUmVzaXppbmcuLi4nKTtcbiAgY29uc29sZS5sb2coZGltKTtcblxuICAkKCcjZ3VpQ29udGFpbmVyJykuaGVpZ2h0KGRpbS55KTtcbiAgJCgnI2d1aUNvbnRhaW5lcicpLndpZHRoKGRpbS54KTtcblxuICBpZihyZW5kZXJlcikge1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUud2lkdGggPSBkaW0ueCsncHgnO1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUuaGVpZ2h0ID0gZGltLnkrJ3B4JztcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdSZXNpemluZyBndWkgY29udGFpbmVyLi4uJyk7XG5cbn1cblxudmFyIFBpeGlFZGl0b3IgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciB0ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUoKTtcbiAgICBjb25zb2xlLmxvZyh0ZW1wbGF0ZSk7XG5cbiAgICB2YXIgTUFOQUdFUiA9IG5ldyBFZGl0b3JNYW5hZ2VyKHRlbXBsYXRlKTtcbiAgICBNQU5BR0VSLmluaXQoKTtcblxuICAgIGNvbnNvbGUubG9nKCdBZGRpbmcgbGlzdGVuZXIuLi4nKTtcbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgcmVzaXplR3VpQ29udGFpbmVyKE1BTkFHRVIucmVuZGVyZXIpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRlbXBsYXRlOiBvcHRpb25zLnRlbXBsYXRlLFxuXG4gICAgICBkcmF3Q2FudmFzRWRpdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuXG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgTUFOQUdFUi5hbmltYXRlKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChNQU5BR0VSLnJlbmRlcmVyLnZpZXcpO1xuXG4gICAgICAgIE1BTkFHRVIuYW5pbWF0ZSgpO1xuXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB2aWV3OiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgcmV0dXJuIG0oJyNndWlDb250YWluZXInLCB7IGNvbmZpZzogY29udHJvbGxlci5kcmF3Q2FudmFzRWRpdG9yfSlcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaXhpRWRpdG9yO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDcvOS8xNS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHJlc2l6ZUVkaXRvcihlZGl0b3IpIHtcbiAgZWRpdG9yLnNldFNpemUobnVsbCwgd2luZG93LmlubmVySGVpZ2h0KTtcbn1cblxudmFyIFNvdXJjZUVkaXRvciA9IHtcblxuICBjb250cm9sbGVyOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICBkcmF3RWRpdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuXG4gICAgICAgIHZhciBlZGl0b3IgPSBudWxsO1xuXG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgaWYoZWRpdG9yKSB7XG4gICAgICAgICAgICBlZGl0b3IucmVmcmVzaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlZGl0b3IgPSBDb2RlTWlycm9yKGVsZW1lbnQsIHtcbiAgICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkob3B0aW9ucy50ZW1wbGF0ZSgpLCB1bmRlZmluZWQsIDIpLFxuICAgICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgIG1vZGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICBndXR0ZXJzOiBbJ0NvZGVNaXJyb3ItbGludC1tYXJrZXJzJ10sXG4gICAgICAgICAgbGludDogdHJ1ZSxcbiAgICAgICAgICBzdHlsZUFjdGl2ZUxpbmU6IHRydWUsXG4gICAgICAgICAgYXV0b0Nsb3NlQnJhY2tldHM6IHRydWUsXG4gICAgICAgICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgICB0aGVtZTogJ3plbmJ1cm4nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlc2l6ZUVkaXRvcihlZGl0b3IpO1xuXG4gICAgICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmVzaXplRWRpdG9yKGVkaXRvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVkaXRvci5vbignY2hhbmdlJywgZnVuY3Rpb24oZWRpdG9yKSB7XG4gICAgICAgICAgbS5zdGFydENvbXB1dGF0aW9uKCk7XG4gICAgICAgICAgb3B0aW9ucy50ZW1wbGF0ZShKU09OLnBhcnNlKGVkaXRvci5nZXRWYWx1ZSgpKSk7XG4gICAgICAgICAgbS5lbmRDb21wdXRhdGlvbigpO1xuICAgICAgICB9KTtcblxuICAgICAgfVxuICAgIH07XG4gIH0sXG4gIHZpZXc6IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICByZXR1cm4gW1xuICAgICAgbSgnI3NvdXJjZUVkaXRvcicsIHsgY29uZmlnOiBjb250cm9sbGVyLmRyYXdFZGl0b3IgfSlcbiAgICBdXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU291cmNlRWRpdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU291cmNlRWRpdG9yID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3NvdXJjZS5lZGl0b3InKTtcbnZhciBQaXhpRWRpdG9yID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3BpeGkuZWRpdG9yJyk7XG5cbnZhciB0ZXN0RGF0YSA9IHJlcXVpcmUoJy4vdGVzdERhdGEvZWMyLmpzb24nKTtcblxudmFyIHRlbXBsYXRlID0gbS5wcm9wKHRlc3REYXRhKTtcblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvdWRzbGljZXItYXBwJyksIG0uY29tcG9uZW50KFBpeGlFZGl0b3IsIHtcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgfSlcbik7XG5cbm0ubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGUtYmFyJyksIG0uY29tcG9uZW50KFNvdXJjZUVkaXRvciwge1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB9KVxuKTtcbiIsIm1vZHVsZS5leHBvcnRzPVxue1xuICBcIkFXU1RlbXBsYXRlRm9ybWF0VmVyc2lvblwiIDogXCIyMDEwLTA5LTA5XCIsXG5cbiAgXCJEZXNjcmlwdGlvblwiIDogXCJBV1MgQ2xvdWRGb3JtYXRpb24gU2FtcGxlIFRlbXBsYXRlIEVDMkluc3RhbmNlV2l0aFNlY3VyaXR5R3JvdXBTYW1wbGU6IENyZWF0ZSBhbiBBbWF6b24gRUMyIGluc3RhbmNlIHJ1bm5pbmcgdGhlIEFtYXpvbiBMaW51eCBBTUkuIFRoZSBBTUkgaXMgY2hvc2VuIGJhc2VkIG9uIHRoZSByZWdpb24gaW4gd2hpY2ggdGhlIHN0YWNrIGlzIHJ1bi4gVGhpcyBleGFtcGxlIGNyZWF0ZXMgYW4gRUMyIHNlY3VyaXR5IGdyb3VwIGZvciB0aGUgaW5zdGFuY2UgdG8gZ2l2ZSB5b3UgU1NIIGFjY2Vzcy4gKipXQVJOSU5HKiogVGhpcyB0ZW1wbGF0ZSBjcmVhdGVzIGFuIEFtYXpvbiBFQzIgaW5zdGFuY2UuIFlvdSB3aWxsIGJlIGJpbGxlZCBmb3IgdGhlIEFXUyByZXNvdXJjZXMgdXNlZCBpZiB5b3UgY3JlYXRlIGEgc3RhY2sgZnJvbSB0aGlzIHRlbXBsYXRlLlwiLFxuXG4gIFwiUGFyYW1ldGVyc1wiIDoge1xuICAgIFwiS2V5TmFtZVwiOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIk5hbWUgb2YgYW4gZXhpc3RpbmcgRUMyIEtleVBhaXIgdG8gZW5hYmxlIFNTSCBhY2Nlc3MgdG8gdGhlIGluc3RhbmNlXCIsXG4gICAgICBcIlR5cGVcIjogXCJBV1M6OkVDMjo6S2V5UGFpcjo6S2V5TmFtZVwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBiZSB0aGUgbmFtZSBvZiBhbiBleGlzdGluZyBFQzIgS2V5UGFpci5cIlxuICAgIH0sXG5cbiAgICBcIkluc3RhbmNlVHlwZVwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJXZWJTZXJ2ZXIgRUMyIGluc3RhbmNlIHR5cGVcIixcbiAgICAgIFwiVHlwZVwiIDogXCJTdHJpbmdcIixcbiAgICAgIFwiRGVmYXVsdFwiIDogXCJtMS5zbWFsbFwiLFxuICAgICAgXCJBbGxvd2VkVmFsdWVzXCIgOiBbIFwidDEubWljcm9cIiwgXCJ0Mi5taWNyb1wiLCBcInQyLnNtYWxsXCIsIFwidDIubWVkaXVtXCIsIFwibTEuc21hbGxcIiwgXCJtMS5tZWRpdW1cIiwgXCJtMS5sYXJnZVwiLCBcIm0xLnhsYXJnZVwiLCBcIm0yLnhsYXJnZVwiLCBcIm0yLjJ4bGFyZ2VcIiwgXCJtMi40eGxhcmdlXCIsIFwibTMubWVkaXVtXCIsIFwibTMubGFyZ2VcIiwgXCJtMy54bGFyZ2VcIiwgXCJtMy4yeGxhcmdlXCIsIFwiYzEubWVkaXVtXCIsIFwiYzEueGxhcmdlXCIsIFwiYzMubGFyZ2VcIiwgXCJjMy54bGFyZ2VcIiwgXCJjMy4yeGxhcmdlXCIsIFwiYzMuNHhsYXJnZVwiLCBcImMzLjh4bGFyZ2VcIiwgXCJjNC5sYXJnZVwiLCBcImM0LnhsYXJnZVwiLCBcImM0LjJ4bGFyZ2VcIiwgXCJjNC40eGxhcmdlXCIsIFwiYzQuOHhsYXJnZVwiLCBcImcyLjJ4bGFyZ2VcIiwgXCJyMy5sYXJnZVwiLCBcInIzLnhsYXJnZVwiLCBcInIzLjJ4bGFyZ2VcIiwgXCJyMy40eGxhcmdlXCIsIFwicjMuOHhsYXJnZVwiLCBcImkyLnhsYXJnZVwiLCBcImkyLjJ4bGFyZ2VcIiwgXCJpMi40eGxhcmdlXCIsIFwiaTIuOHhsYXJnZVwiLCBcImQyLnhsYXJnZVwiLCBcImQyLjJ4bGFyZ2VcIiwgXCJkMi40eGxhcmdlXCIsIFwiZDIuOHhsYXJnZVwiLCBcImhpMS40eGxhcmdlXCIsIFwiaHMxLjh4bGFyZ2VcIiwgXCJjcjEuOHhsYXJnZVwiLCBcImNjMi44eGxhcmdlXCIsIFwiY2cxLjR4bGFyZ2VcIl1cbiAgICAsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIGEgdmFsaWQgRUMyIGluc3RhbmNlIHR5cGUuXCJcbiAgICB9LFxuXG4gICAgXCJTU0hMb2NhdGlvblwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJUaGUgSVAgYWRkcmVzcyByYW5nZSB0aGF0IGNhbiBiZSB1c2VkIHRvIFNTSCB0byB0aGUgRUMyIGluc3RhbmNlc1wiLFxuICAgICAgXCJUeXBlXCI6IFwiU3RyaW5nXCIsXG4gICAgICBcIk1pbkxlbmd0aFwiOiBcIjlcIixcbiAgICAgIFwiTWF4TGVuZ3RoXCI6IFwiMThcIixcbiAgICAgIFwiRGVmYXVsdFwiOiBcIjAuMC4wLjAvMFwiLFxuICAgICAgXCJBbGxvd2VkUGF0dGVyblwiOiBcIihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KS8oXFxcXGR7MSwyfSlcIixcbiAgICAgIFwiQ29uc3RyYWludERlc2NyaXB0aW9uXCI6IFwibXVzdCBiZSBhIHZhbGlkIElQIENJRFIgcmFuZ2Ugb2YgdGhlIGZvcm0geC54LngueC94LlwiXG4gICAgfVxuICB9LFxuXG4gIFwiTWFwcGluZ3NcIiA6IHtcbiAgICBcIkFXU0luc3RhbmNlVHlwZTJBcmNoXCIgOiB7XG4gICAgICBcInQxLm1pY3JvXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJ0Mi5taWNyb1wiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwidDIuc21hbGxcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInQyLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMS5zbWFsbFwiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTMubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMxLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJjMS54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwiYzMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImcyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk1HMlwiICB9LFxuICAgICAgXCJyMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaGkxLjR4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImhzMS44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjcjEuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiY2MyLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH1cbiAgICB9XG4gICxcbiAgICBcIkFXU1JlZ2lvbkFyY2gyQU1JXCIgOiB7XG4gICAgICBcInVzLWVhc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTBmNGNmZDY0XCIsIFwiSFZNNjRcIiA6IFwiYW1pLTBkNGNmZDY2XCIsIFwiSFZNRzJcIiA6IFwiYW1pLTViMDViYTMwXCJ9LFxuICAgICAgXCJ1cy13ZXN0LTJcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kM2M1ZDFlM1wiLCBcIkhWTTY0XCIgOiBcImFtaS1kNWM1ZDFlNVwiLCBcIkhWTUcyXCIgOiBcImFtaS1hOWQ2YzA5OVwifSxcbiAgICAgIFwidXMtd2VzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktODVlYTEzYzFcIiwgXCJIVk02NFwiIDogXCJhbWktODdlYTEzYzNcIiwgXCJIVk1HMlwiIDogXCJhbWktMzc4MjdhNzNcIn0sXG4gICAgICBcImV1LXdlc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWQ2ZDE4ZWExXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWU0ZDE4ZTkzXCIsIFwiSFZNRzJcIiA6IFwiYW1pLTcyYTlmMTA1XCJ9LFxuICAgICAgXCJldS1jZW50cmFsLTFcIiAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1hNGIwYjdiOVwiLCBcIkhWTTY0XCIgOiBcImFtaS1hNmIwYjdiYlwiLCBcIkhWTUcyXCIgOiBcImFtaS1hNmM5Y2ZiYlwifSxcbiAgICAgIFwiYXAtbm9ydGhlYXN0LTFcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktMWExYjlmMWFcIiwgXCJIVk02NFwiIDogXCJhbWktMWMxYjlmMWNcIiwgXCJIVk1HMlwiIDogXCJhbWktZjY0NGM0ZjZcIn0sXG4gICAgICBcImFwLXNvdXRoZWFzdC0xXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWQyNGI0MjgwXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWQ0NGI0Mjg2XCIsIFwiSFZNRzJcIiA6IFwiYW1pLTEyYjViYzQwXCJ9LFxuICAgICAgXCJhcC1zb3V0aGVhc3QtMlwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS1lZjdiMzlkNVwiLCBcIkhWTTY0XCIgOiBcImFtaS1kYjdiMzllMVwiLCBcIkhWTUcyXCIgOiBcImFtaS1iMzMzN2U4OVwifSxcbiAgICAgIFwic2EtZWFzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktNWIwOTgxNDZcIiwgXCJIVk02NFwiIDogXCJhbWktNTUwOTgxNDhcIiwgXCJIVk1HMlwiIDogXCJOT1RfU1VQUE9SVEVEXCJ9LFxuICAgICAgXCJjbi1ub3J0aC0xXCIgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1iZWM0NTg4N1wiLCBcIkhWTTY0XCIgOiBcImFtaS1iY2M0NTg4NVwiLCBcIkhWTUcyXCIgOiBcIk5PVF9TVVBQT1JURURcIn1cbiAgICB9XG5cbiAgfSxcblxuICBcIlJlc291cmNlc1wiIDoge1xuICAgIFwiRUMySW5zdGFuY2VcIiA6IHtcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6SW5zdGFuY2VcIixcbiAgICAgIFwiUHJvcGVydGllc1wiIDoge1xuICAgICAgICBcIkluc3RhbmNlVHlwZVwiIDogeyBcIlJlZlwiIDogXCJJbnN0YW5jZVR5cGVcIiB9LFxuICAgICAgICBcIlNlY3VyaXR5R3JvdXBzXCIgOiBbIHsgXCJSZWZcIiA6IFwiSW5zdGFuY2VTZWN1cml0eUdyb3VwXCIgfSBdLFxuICAgICAgICBcIktleU5hbWVcIiA6IHsgXCJSZWZcIiA6IFwiS2V5TmFtZVwiIH0sXG4gICAgICAgIFwiSW1hZ2VJZFwiIDogeyBcIkZuOjpGaW5kSW5NYXBcIiA6IFsgXCJBV1NSZWdpb25BcmNoMkFNSVwiLCB7IFwiUmVmXCIgOiBcIkFXUzo6UmVnaW9uXCIgfSxcbiAgICAgICAgICB7IFwiRm46OkZpbmRJbk1hcFwiIDogWyBcIkFXU0luc3RhbmNlVHlwZTJBcmNoXCIsIHsgXCJSZWZcIiA6IFwiSW5zdGFuY2VUeXBlXCIgfSwgXCJBcmNoXCIgXSB9IF0gfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcIkluc3RhbmNlU2VjdXJpdHlHcm91cFwiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpTZWN1cml0eUdyb3VwXCIsXG4gICAgICBcIlByb3BlcnRpZXNcIiA6IHtcbiAgICAgICAgXCJHcm91cERlc2NyaXB0aW9uXCIgOiBcIkVuYWJsZSBTU0ggYWNjZXNzIHZpYSBwb3J0IDIyXCIsXG4gICAgICAgIFwiU2VjdXJpdHlHcm91cEluZ3Jlc3NcIiA6IFsge1xuICAgICAgICAgIFwiSXBQcm90b2NvbFwiIDogXCJ0Y3BcIixcbiAgICAgICAgICBcIkZyb21Qb3J0XCIgOiBcIjIyXCIsXG4gICAgICAgICAgXCJUb1BvcnRcIiA6IFwiMjJcIixcbiAgICAgICAgICBcIkNpZHJJcFwiIDogeyBcIlJlZlwiIDogXCJTU0hMb2NhdGlvblwifVxuICAgICAgICB9IF1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgXCJPdXRwdXRzXCIgOiB7XG4gICAgXCJJbnN0YW5jZUlkXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIkluc3RhbmNlSWQgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiUmVmXCIgOiBcIkVDMkluc3RhbmNlXCIgfVxuICAgIH0sXG4gICAgXCJBWlwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJBdmFpbGFiaWxpdHkgWm9uZSBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJGbjo6R2V0QXR0XCIgOiBbIFwiRUMySW5zdGFuY2VcIiwgXCJBdmFpbGFiaWxpdHlab25lXCIgXSB9XG4gICAgfSxcbiAgICBcIlB1YmxpY0ROU1wiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJQdWJsaWMgRE5TTmFtZSBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJGbjo6R2V0QXR0XCIgOiBbIFwiRUMySW5zdGFuY2VcIiwgXCJQdWJsaWNEbnNOYW1lXCIgXSB9XG4gICAgfSxcbiAgICBcIlB1YmxpY0lQXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIlB1YmxpYyBJUCBhZGRyZXNzIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIkZuOjpHZXRBdHRcIiA6IFsgXCJFQzJJbnN0YW5jZVwiLCBcIlB1YmxpY0lwXCIgXSB9XG4gICAgfVxuICB9XG59XG4iXX0=
