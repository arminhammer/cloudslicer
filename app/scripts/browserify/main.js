(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/EditorManager.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/26/15.
 */

var GuiUtil = require('./gui.util');
var Collection = require('./lib/collection/collection');
var Menu = require('./menu');

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
  self.winDimension = GuiUtil.getWindowDimension();
  var grid = null;

  self.renderer = PIXI.autoDetectRenderer(self.winDimension.x, self.winDimension.y, {backgroundColor : 0xFFFFFF});

  self.stage = new PIXI.Container();
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

  /*
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
  */

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
    grid = GuiUtil.drawGrid(self.winDimension.x, self.winDimension.y);
    self.stage.addChild(grid);
  };

  self.gridOff = function() {
    self.stage.removeChild(grid);
    self.grid = null;
  };

  self.processTemplate = function() {
    //console.log(template.Resources);

    var groupings = _.reduce(template.Resources, function(result, n, key) {
      result[n.Type] = {};
      result[n.Type][key] = n;
      return result
    }, {});
    console.log('Groupings:');
    console.log(groupings);

    var instances = {};
    _.each(groupings['AWS::EC2::Instance'], function(n, key) {
      var instance = new AWS_EC2_Instance(key, self.winDimension.x/2, 400);
      instances[key] = instance;
    });

    var eips = {};
    _.each(groupings['AWS::EC2::EIP'], function(n, key) {
      console.log('Adding EIP ', key);
      var eip = new AWS_EC2_EIP(key, self.winDimension.x/2, 500);
      eips[key] = eip;
    });

    var secgroups = {};
    _.each(groupings['AWS::EC2::SecurityGroup'], function(n, key) {
      console.log('Adding Security Group ', key);
      var secgroup = new AWS_EC2_SecurityGroup(key, self.winDimension.x/2, 500);
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
  };

  self.onLoaded = function() {
    console.log('Assets loaded');

    self.processTemplate();
    console.log('Processed template');
    console.log(self.elements.position);

    var users = new AWS_Users('users', self.winDimension.x/2, 100);
    console.log(users.position);
    self.elements.add(users);

    //var menu = self.drawComponentMenu();
    var menu = new Menu(self);
    self.stage.addChild(menu);
  };

  self.init = function() {
    self.gridOn();
    PIXI.loader
      .add('../resources/sprites/sprites.json')
      .load(self.onLoaded);
  };

};

module.exports = EditorManager;

},{"./aws/AWS_EC2_EIP":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_EIP.js","./aws/AWS_EC2_Instance":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_Instance.js","./aws/AWS_EC2_SecurityGroup":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_SecurityGroup.js","./aws/AWS_Users":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_Users.js","./gui.util":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js","./lib/collection/collection":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/collection/collection.js","./menu":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/menu.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_EIP.js":[function(require,module,exports){
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

var Group = require('../lib/group/group');

var AWS_EC2_SecurityGroup = function(name,x,y) {
  Group.call(this);

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
AWS_EC2_SecurityGroup.prototype = Object.create(Group.prototype);

module.exports = AWS_EC2_SecurityGroup;

},{"../lib/group/group":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/group/group.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_Users.js":[function(require,module,exports){
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

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/component/component.js":[function(require,module,exports){
/**
 * Created by arming on 9/15/15.
 */

var Component = function() {
  PIXI.Sprite.call(this);
  var self = this;

  self.anchor.set(0.5);
  self.interactive = true;
  self.buttonMode = true;

};
Component.prototype = Object.create(PIXI.Sprite.prototype);

module.exports = Component;

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/element/element.drag.drop.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/14/15.
 */

var MOUSE_OVER_SCALE_RATIO = 1.1;

var ElementDragDrop = {

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

module.exports = ElementDragDrop;


},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/element/element.js":[function(require,module,exports){
/**
 * Created by arming on 9/15/15.
 */

var Component = require('../component/component');
var ElementDragDrop = require('./element.drag.drop');

var DEFAULT_SCALE = 0.7;

var Element = function() {
  Component.call(this);
  var self = this;

  self.scale.set(DEFAULT_SCALE);
  self
    // events for drag start
    .on('mousedown', ElementDragDrop.onDragStart)
    .on('touchstart', ElementDragDrop.onDragStart)
    // events for drag end
    .on('mouseup', ElementDragDrop.onDragEnd)
    .on('mouseupoutside', ElementDragDrop.onDragEnd)
    .on('touchend', ElementDragDrop.onDragEnd)
    .on('touchendoutside', ElementDragDrop.onDragEnd)
    // events for drag move
    .on('mousemove', ElementDragDrop.onDragMove)
    .on('touchmove', ElementDragDrop.onDragMove)
    // events for mouse over
    .on('mouseover', ElementDragDrop.onMouseOver)
    .on('mouseout', ElementDragDrop.onMouseOut);

  self.arrows = [];

  self.addArrowTo = function(b) {
    self.arrows.push(b);
  };

  self.removeArrowTo = function(index) {
    self.arrows.remove(index);
  };

};
Element.prototype = Object.create(Component.prototype);

module.exports = Element;

},{"../component/component":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/component/component.js","./element.drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/element/element.drag.drop.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/group/group.drag.drop.js":[function(require,module,exports){
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


},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/group/group.js":[function(require,module,exports){
/**
 * Created by arming on 9/15/15.
 */

var Component = require('../component/component');
var GroupDragDrop = require('./group.drag.drop');

var DEFAULT_SCALE = 0.7;

var Group = function() {
  Component.call(this);
  var self = this;

  self.scale.set(DEFAULT_SCALE);
  self.anchor.set(0.5);
  self.interactive = true;
  self.buttonMode = true;
  self
    // events for drag start
    .on('mousedown', GroupDragDrop.onDragStart)
    .on('touchstart', GroupDragDrop.onDragStart)
    // events for drag end
    .on('mouseup', GroupDragDrop.onDragEnd)
    .on('mouseupoutside', GroupDragDrop.onDragEnd)
    .on('touchend', GroupDragDrop.onDragEnd)
    .on('touchendoutside', GroupDragDrop.onDragEnd)
    // events for drag move
    .on('mousemove', GroupDragDrop.onDragMove)
    .on('touchmove', GroupDragDrop.onDragMove)
    // events for mouse over
    .on('mouseover', GroupDragDrop.onMouseOver)
    .on('mouseout', GroupDragDrop.onMouseOut);

  self.arrows = [];

  self.addArrowTo = function(b) {
    self.arrows.push(b);
  };

  self.removeArrowTo = function(index) {
    self.arrows.remove(index);
  };

};
Group.prototype = Object.create(Component.prototype);

module.exports = Group;

},{"../component/component":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/component/component.js","./group.drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/group/group.drag.drop.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/menu.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/30/15.
 */

var Collection = require('./lib/collection/collection');
var GuiUtil = require('./gui.util');
var AWS_EC2_Instance = require('./aws/AWS_EC2_Instance');
var AWS_EC2_EIP = require('./aws/AWS_EC2_EIP');
var AWS_EC2_SecurityGroup = require('./aws/AWS_EC2_SecurityGroup');

function buildMenuComponent(x,y, texture, scale, mouseUpCallback) {
  var menuComponent = new PIXI.Sprite();
  menuComponent.texture = texture;
  menuComponent.scale.set(scale);
  menuComponent.x = x;
  menuComponent.y = y;
  menuComponent.interactive = true;
  menuComponent.buttonMode = true;
  menuComponent.anchor.set(0.5);
  menuComponent
    .on('mouseover', function() {
      var self = this;
      self.scale.set(self.scale.x*1.2);
    })
    .on('mouseout', function() {
      var self = this;
      self.scale.set(self.scale.x/1.2);
    })
    .on('mouseup', mouseUpCallback);
  return menuComponent;
}

var Menu = function(manager) {
  Collection.call(this);
  var self = this;
  self.MANAGER = manager;
  self.menu = {};

  var dim = GuiUtil.getWindowDimension();

  var xoffset = dim.x-40;
  var yoffset = dim.y/2;


  self.menu.instance = buildMenuComponent(xoffset, yoffset, PIXI.Texture.fromFrame('Compute_&_Networking_Amazon_EC2_Instance.png'), 0.2,
    function() {
      self.MANAGER.elements.add(new AWS_EC2_Instance('New_Instance', dim.x/2, dim.y/2));
    });

  self.add(self.menu.instance);

  var secGrpGraphic = new PIXI.Graphics();
  secGrpGraphic.lineStyle(3, 0x000000, 1);
  secGrpGraphic.beginFill(0xFFFFFF, 1);
  secGrpGraphic.drawRoundedRect(0,0,30,30,6);
  secGrpGraphic.endFill();

  self.menu.secgrp = buildMenuComponent(xoffset, yoffset+40, secGrpGraphic.generateTexture(), 1.0,
    function() {
      self.MANAGER.securitygroups.add(new AWS_EC2_SecurityGroup('New_Security_Group', dim.x/2, dim.y/2));
    });

  self.add(self.menu.secgrp);

};

Menu.prototype = Object.create(Collection.prototype);

module.exports = Menu;

},{"./aws/AWS_EC2_EIP":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_EIP.js","./aws/AWS_EC2_Instance":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_Instance.js","./aws/AWS_EC2_SecurityGroup":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_SecurityGroup.js","./gui.util":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js","./lib/collection/collection":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/collection/collection.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/pixi.editor.js":[function(require,module,exports){
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

var testData = require('./testData/empty.json');

var template = m.prop(testData);

m.mount(document.getElementById('cloudslicer-app'), m.component(PixiEditor, {
    template: template
  })
);

m.mount(document.getElementById('code-bar'), m.component(SourceEditor, {
    template: template
  })
);

},{"./components/pixi.editor":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/pixi.editor.js","./components/source.editor":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js","./testData/empty.json":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/testData/empty.json"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/testData/empty.json":[function(require,module,exports){
module.exports={
  "Resources": {

  }
}

},{}]},{},["/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL0VkaXRvck1hbmFnZXIuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX0VJUC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvYXdzL0FXU19FQzJfSW5zdGFuY2UuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX1NlY3VyaXR5R3JvdXAuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfVXNlcnMuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2RyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZ3VpLnV0aWwuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2xpYi9jb2xsZWN0aW9uL2NvbGxlY3Rpb24uanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2xpYi9jb21wb25lbnQvY29tcG9uZW50LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9saWIvZWxlbWVudC9lbGVtZW50LmRyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2VsZW1lbnQvZWxlbWVudC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2dyb3VwL2dyb3VwLmRyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2dyb3VwL2dyb3VwLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9tZW51LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9waXhpLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvc291cmNlLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL21haW4uanMiLCJhcHAvc2NyaXB0cy90ZXN0RGF0YS9lbXB0eS5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMjYvMTUuXG4gKi9cblxudmFyIEd1aVV0aWwgPSByZXF1aXJlKCcuL2d1aS51dGlsJyk7XG52YXIgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vbGliL2NvbGxlY3Rpb24vY29sbGVjdGlvbicpO1xudmFyIE1lbnUgPSByZXF1aXJlKCcuL21lbnUnKTtcblxudmFyIEFXU19Vc2VycyA9IHJlcXVpcmUoJy4vYXdzL0FXU19Vc2VycycpO1xudmFyIEFXU19FQzJfSW5zdGFuY2UgPSByZXF1aXJlKCcuL2F3cy9BV1NfRUMyX0luc3RhbmNlJyk7XG52YXIgQVdTX0VDMl9FSVAgPSByZXF1aXJlKCcuL2F3cy9BV1NfRUMyX0VJUCcpO1xudmFyIEFXU19FQzJfU2VjdXJpdHlHcm91cCA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfU2VjdXJpdHlHcm91cCcpO1xuXG52YXIgRWRpdG9yTWFuYWdlciA9IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHZhciBmcHNTdGF0cyA9IG5ldyBTdGF0cygpO1xuICBmcHNTdGF0cy5zZXRNb2RlKDApO1xuICAvLyBhbGlnbiB0b3AtbGVmdFxuICBmcHNTdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgZnBzU3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG4gIGZwc1N0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGZwc1N0YXRzLmRvbUVsZW1lbnQgKTtcblxuICB2YXIgbXNTdGF0cyA9IG5ldyBTdGF0cygpO1xuICBtc1N0YXRzLnNldE1vZGUoMSk7XG4gIC8vIGFsaWduIHRvcC1sZWZ0XG4gIG1zU3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIG1zU3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzgwcHgnO1xuICBtc1N0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIG1zU3RhdHMuZG9tRWxlbWVudCApO1xuXG4gIHZhciBtYlN0YXRzID0gbmV3IFN0YXRzKCk7XG4gIG1iU3RhdHMuc2V0TW9kZSgyKTtcbiAgLy8gYWxpZ24gdG9wLWxlZnRcbiAgbWJTdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgbWJTdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMTYwcHgnO1xuICBtYlN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIG1iU3RhdHMuZG9tRWxlbWVudCApO1xuXG5cbiAgZnBzID0gNjA7XG4gIHZhciBub3c7XG4gIHZhciB0aGVuID0gRGF0ZS5ub3coKTtcbiAgdmFyIGludGVydmFsID0gMTAwMC9mcHM7XG4gIHZhciBkZWx0YTtcbiAgLy92YXIgbWV0ZXIgPSBuZXcgRlBTTWV0ZXIoKTtcbiAgc2VsZi53aW5EaW1lbnNpb24gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuICB2YXIgZ3JpZCA9IG51bGw7XG5cbiAgc2VsZi5yZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKHNlbGYud2luRGltZW5zaW9uLngsIHNlbGYud2luRGltZW5zaW9uLnksIHtiYWNrZ3JvdW5kQ29sb3IgOiAweEZGRkZGRn0pO1xuXG4gIHNlbGYuc3RhZ2UgPSBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgc2VsZi5zdGFnZS5uYW1lID0gJ3N0YWdlJztcbiAgc2VsZi5zdGFnZS5zZWxlY3RlZCA9IG51bGw7XG4gIHNlbGYuc3RhZ2UuY2xpY2tlZE9ubHlTdGFnZSA9IHRydWU7XG4gIHNlbGYuc3RhZ2UuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICBzZWxmLnN0YWdlLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG4gICAgaWYoc2VsZi5zdGFnZS5jbGlja2VkT25seVN0YWdlKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgc3RhZ2UgY2xpY2snKTtcbiAgICAgIGlmKHNlbGYuc3RhZ2Uuc2VsZWN0ZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coc2VsZi5zdGFnZS5zZWxlY3RlZCk7XG4gICAgICAgIHNlbGYuc3RhZ2Uuc2VsZWN0ZWQuZmlsdGVycyA9IG51bGw7XG4gICAgICAgIHNlbGYuc3RhZ2Uuc2VsZWN0ZWQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHNlbGYuc3RhZ2UuY2xpY2tlZE9ubHlTdGFnZSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICBzZWxmLnN0YWdlLk1BTkFHRVIgPSBzZWxmO1xuXG4gIHNlbGYuc2VjdXJpdHlncm91cHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuICBzZWxmLmVsZW1lbnRzID0gbmV3IENvbGxlY3Rpb24oKTtcblxuICAvKlxuICB2YXIgY29sbGlzaW9ubWFuYWdlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGNvbGxTZWxmID0gdGhpcztcblxuICAgIGNvbGxTZWxmLnNlY0dyb3VwVnNFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlY0dycHMgPSBzZWxmLnNlY3VyaXR5Z3JvdXBzO1xuICAgICAgdmFyIGVsZW1zID0gc2VsZi5lbGVtZW50cztcblxuICAgICAgXy5lYWNoKHNlY0dycHMuZWxlbWVudHMsIGZ1bmN0aW9uKHMpIHtcblxuICAgICAgICBfLmVhY2goZWxlbXMuZWxlbWVudHMsIGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAgIHZhciB4ZGlzdCA9IHMucG9zaXRpb24ueCAtIGUucG9zaXRpb24ueDtcblxuICAgICAgICAgIGlmKHhkaXN0ID4gLXMud2lkdGgvMiAmJiB4ZGlzdCA8IHMud2lkdGgvMilcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YXIgeWRpc3QgPSBzLnBvc2l0aW9uLnkgLSBlLnBvc2l0aW9uLnk7XG5cbiAgICAgICAgICAgIGlmKHlkaXN0ID4gLXMuaGVpZ2h0LzIgJiYgeWRpc3QgPCBzLmhlaWdodC8yKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAvLyAgY29uc29sZS5sb2coJ0NvbGxpc2lvbiBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIGNvbGxTZWxmLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgY29sbFNlbGYuc2VjR3JvdXBWc0VsZW1lbnRzKCk7XG4gICAgfTtcblxuICB9O1xuXG4gIHNlbGYuQ29sbGlzaW9uTWFuYWdlciA9IG5ldyBjb2xsaXNpb25tYW5hZ2VyKCk7XG4gICovXG5cbiAgc2VsZi5hbmltYXRlID0gZnVuY3Rpb24odGltZSkge1xuXG4gICAgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBkZWx0YSA9IG5vdyAtIHRoZW47XG5cbiAgICBpZiAoZGVsdGEgPiBpbnRlcnZhbCkge1xuICAgICAgZnBzU3RhdHMuYmVnaW4oKTtcbiAgICAgIG1zU3RhdHMuYmVnaW4oKTtcbiAgICAgIG1iU3RhdHMuYmVnaW4oKTtcblxuICAgICAgLy9zZWxmLkNvbGxpc2lvbk1hbmFnZXIudXBkYXRlKCk7XG5cbiAgICAgIHRoZW4gPSBub3cgLSAoZGVsdGEgJSBpbnRlcnZhbCk7XG4gICAgICAvL21ldGVyLnRpY2soKTtcblxuICAgICAgVFdFRU4udXBkYXRlKHRpbWUpO1xuICAgICAgc2VsZi5yZW5kZXJlci5yZW5kZXIoc2VsZi5zdGFnZSk7XG5cbiAgICAgIGZwc1N0YXRzLmVuZCgpO1xuICAgICAgbXNTdGF0cy5lbmQoKTtcbiAgICAgIG1iU3RhdHMuZW5kKCk7XG4gICAgfVxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNlbGYuYW5pbWF0ZSk7XG4gIH07XG5cbiAgc2VsZi5ncmlkT24gPSBmdW5jdGlvbigpIHtcbiAgICBncmlkID0gR3VpVXRpbC5kcmF3R3JpZChzZWxmLndpbkRpbWVuc2lvbi54LCBzZWxmLndpbkRpbWVuc2lvbi55KTtcbiAgICBzZWxmLnN0YWdlLmFkZENoaWxkKGdyaWQpO1xuICB9O1xuXG4gIHNlbGYuZ3JpZE9mZiA9IGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuc3RhZ2UucmVtb3ZlQ2hpbGQoZ3JpZCk7XG4gICAgc2VsZi5ncmlkID0gbnVsbDtcbiAgfTtcblxuICBzZWxmLnByb2Nlc3NUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vY29uc29sZS5sb2codGVtcGxhdGUuUmVzb3VyY2VzKTtcblxuICAgIHZhciBncm91cGluZ3MgPSBfLnJlZHVjZSh0ZW1wbGF0ZS5SZXNvdXJjZXMsIGZ1bmN0aW9uKHJlc3VsdCwgbiwga2V5KSB7XG4gICAgICByZXN1bHRbbi5UeXBlXSA9IHt9O1xuICAgICAgcmVzdWx0W24uVHlwZV1ba2V5XSA9IG47XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSwge30pO1xuICAgIGNvbnNvbGUubG9nKCdHcm91cGluZ3M6Jyk7XG4gICAgY29uc29sZS5sb2coZ3JvdXBpbmdzKTtcblxuICAgIHZhciBpbnN0YW5jZXMgPSB7fTtcbiAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6SW5zdGFuY2UnXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQVdTX0VDMl9JbnN0YW5jZShrZXksIHNlbGYud2luRGltZW5zaW9uLngvMiwgNDAwKTtcbiAgICAgIGluc3RhbmNlc1trZXldID0gaW5zdGFuY2U7XG4gICAgfSk7XG5cbiAgICB2YXIgZWlwcyA9IHt9O1xuICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpFSVAnXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICBjb25zb2xlLmxvZygnQWRkaW5nIEVJUCAnLCBrZXkpO1xuICAgICAgdmFyIGVpcCA9IG5ldyBBV1NfRUMyX0VJUChrZXksIHNlbGYud2luRGltZW5zaW9uLngvMiwgNTAwKTtcbiAgICAgIGVpcHNba2V5XSA9IGVpcDtcbiAgICB9KTtcblxuICAgIHZhciBzZWNncm91cHMgPSB7fTtcbiAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6U2VjdXJpdHlHcm91cCddLCBmdW5jdGlvbihuLCBrZXkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBZGRpbmcgU2VjdXJpdHkgR3JvdXAgJywga2V5KTtcbiAgICAgIHZhciBzZWNncm91cCA9IG5ldyBBV1NfRUMyX1NlY3VyaXR5R3JvdXAoa2V5LCBzZWxmLndpbkRpbWVuc2lvbi54LzIsIDUwMCk7XG4gICAgICBzZWNncm91cHNba2V5XSA9IHNlY2dyb3VwO1xuICAgIH0pO1xuXG4gICAgdmFyIGNvbWJvSW5zdGFuY2VzID0ge307XG4gICAgXy5lYWNoKGdyb3VwaW5nc1snQVdTOjpFQzI6OkVJUEFzc29jaWF0aW9uJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgY29uc29sZS5sb2coJ0NoZWNraW5nIGFzc29jaWF0aW9uJyk7XG4gICAgICBjb25zb2xlLmxvZyhuKTtcbiAgICAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICBjb25zb2xlLmxvZyhlaXBzKTtcbiAgICAgIGNvbnNvbGUubG9nKCdSZWY6ICcsbi5Qcm9wZXJ0aWVzLkVJUC5SZWYpO1xuICAgICAgdmFyIGluc3RhbmNlID0gaW5zdGFuY2VzW24uUHJvcGVydGllcy5JbnN0YW5jZUlkLlJlZl07XG4gICAgICBpZihpbnN0YW5jZSkge1xuICAgICAgICB2YXIgZWlwID0gZWlwc1tuLlByb3BlcnRpZXMuRUlQLlJlZl07XG4gICAgICAgIGlmKGVpcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdBc3NvY2lhdGlvbiBoYXMgYSBtYXRjaCEnKTtcbiAgICAgICAgICB2YXIgY29udGFpbmVyID0gbmV3IENvbGxlY3Rpb24oKTtcbiAgICAgICAgICBjb250YWluZXIuYWRkKGluc3RhbmNlKTtcbiAgICAgICAgICBjb250YWluZXIuYWRkKGVpcCk7XG4gICAgICAgICAgY29tYm9JbnN0YW5jZXNba2V5XSA9IGNvbnRhaW5lcjtcbiAgICAgICAgICBkZWxldGUgaW5zdGFuY2VzW24uUHJvcGVydGllcy5JbnN0YW5jZUlkLlJlZl07XG4gICAgICAgICAgZGVsZXRlIGVpcHNbbi5Qcm9wZXJ0aWVzLkVJUC5SZWZdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL3ZhciBlaXAgPSBuZXcgQVdTX0VDMl9FSVAoa2V5LCBkaW0ueC8yLCA1MDApO1xuICAgICAgLy9laXBzW2tleV0gPSBlaXA7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goc2VjZ3JvdXBzLCBmdW5jdGlvbihzLCBrZXkpIHtcbiAgICAgIHNlbGYuc2VjdXJpdHlncm91cHMuYWRkKHMpO1xuICAgIH0pO1xuXG4gICAgXy5lYWNoKGNvbWJvSW5zdGFuY2VzLCBmdW5jdGlvbihjb21ibywga2V5KSB7XG4gICAgICBzZWxmLmVsZW1lbnRzLmFkZChjb21ibyk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goaW5zdGFuY2VzLCBmdW5jdGlvbihpbnN0YW5jZSwga2V5KSB7XG4gICAgICBzZWxmLmVsZW1lbnRzLmFkZChpbnN0YW5jZSk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goZWlwcywgZnVuY3Rpb24oZWlwLCBrZXkpIHtcbiAgICAgIHNlbGYuZWxlbWVudHMuYWRkKGVpcCk7XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnQ2hpbGRyZW46Jyk7XG4gICAgY29uc29sZS5sb2coc2VsZi5lbGVtZW50cy5jaGlsZHJlbik7XG5cbiAgICBzZWxmLnN0YWdlLmFkZENoaWxkKHNlbGYuc2VjdXJpdHlncm91cHMpO1xuICAgIHNlbGYuc3RhZ2UuYWRkQ2hpbGQoc2VsZi5lbGVtZW50cyk7XG4gICAgY29uc29sZS5sb2coc2VsZi5zdGFnZS5jaGlsZHJlbik7XG4gIH07XG5cbiAgc2VsZi5vbkxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdBc3NldHMgbG9hZGVkJyk7XG5cbiAgICBzZWxmLnByb2Nlc3NUZW1wbGF0ZSgpO1xuICAgIGNvbnNvbGUubG9nKCdQcm9jZXNzZWQgdGVtcGxhdGUnKTtcbiAgICBjb25zb2xlLmxvZyhzZWxmLmVsZW1lbnRzLnBvc2l0aW9uKTtcblxuICAgIHZhciB1c2VycyA9IG5ldyBBV1NfVXNlcnMoJ3VzZXJzJywgc2VsZi53aW5EaW1lbnNpb24ueC8yLCAxMDApO1xuICAgIGNvbnNvbGUubG9nKHVzZXJzLnBvc2l0aW9uKTtcbiAgICBzZWxmLmVsZW1lbnRzLmFkZCh1c2Vycyk7XG5cbiAgICAvL3ZhciBtZW51ID0gc2VsZi5kcmF3Q29tcG9uZW50TWVudSgpO1xuICAgIHZhciBtZW51ID0gbmV3IE1lbnUoc2VsZik7XG4gICAgc2VsZi5zdGFnZS5hZGRDaGlsZChtZW51KTtcbiAgfTtcblxuICBzZWxmLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICBzZWxmLmdyaWRPbigpO1xuICAgIFBJWEkubG9hZGVyXG4gICAgICAuYWRkKCcuLi9yZXNvdXJjZXMvc3ByaXRlcy9zcHJpdGVzLmpzb24nKVxuICAgICAgLmxvYWQoc2VsZi5vbkxvYWRlZCk7XG4gIH07XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yTWFuYWdlcjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE5LzE1LlxuICovXG5cbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi4vbGliL2VsZW1lbnQvZWxlbWVudCcpO1xudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi4vZHJhZy5kcm9wJyk7XG5cbnZhciBBV1NfRUMyX0VJUCA9IGZ1bmN0aW9uKG5hbWUseCx5KSB7XG4gIEVsZW1lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLm5hbWUgPSBuYW1lO1xuICBzZWxmLnNjYWxlLnNldCgwLjMpO1xuICBzZWxmLnRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCdDb21wdXRlXyZfTmV0d29ya2luZ19BbWF6b25fRUMyX0VsYXN0aWNfSVAucG5nJyk7XG4gIHNlbGYucG9zaXRpb24ueCA9IHg7XG4gIHNlbGYucG9zaXRpb24ueSA9IHk7XG59O1xuQVdTX0VDMl9FSVAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX0VDMl9FSVA7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2xpYi9lbGVtZW50L2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX0VDMl9JbnN0YW5jZSA9IGZ1bmN0aW9uKG5hbWUseCx5KSB7XG4gIEVsZW1lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLm5hbWUgPSBuYW1lO1xuICBzZWxmLnRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCdDb21wdXRlXyZfTmV0d29ya2luZ19BbWF6b25fRUMyX0luc3RhbmNlLnBuZycpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xuXG4gIHNlbGYuc2VjdXJpdHlHcm91cCA9IG51bGw7XG59O1xuQVdTX0VDMl9JbnN0YW5jZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfRUMyX0luc3RhbmNlO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMjEvMTUuXG4gKi9cblxudmFyIEdyb3VwID0gcmVxdWlyZSgnLi4vbGliL2dyb3VwL2dyb3VwJyk7XG5cbnZhciBBV1NfRUMyX1NlY3VyaXR5R3JvdXAgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBHcm91cC5jYWxsKHRoaXMpO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcblxuICB2YXIgZ3JhcGhpYyA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gIGdyYXBoaWMubGluZVN0eWxlKDMsIDB4MDAwMDAwLCAxKTtcbiAgZ3JhcGhpYy5iZWdpbkZpbGwoMHhGRkZGRkYsIDAuMCk7XG4gIGdyYXBoaWMuZHJhd1JvdW5kZWRSZWN0KDAsMCwyMDAsMjAwLDEwKTtcbiAgZ3JhcGhpYy5lbmRGaWxsKCk7XG5cbiAgc2VsZi50ZXh0dXJlID0gZ3JhcGhpYy5nZW5lcmF0ZVRleHR1cmUoKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxufTtcbkFXU19FQzJfU2VjdXJpdHlHcm91cC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdyb3VwLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX0VDMl9TZWN1cml0eUdyb3VwO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTkvMTUuXG4gKi9cblxudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuLi9saWIvZWxlbWVudC9lbGVtZW50Jyk7XG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuLi9kcmFnLmRyb3AnKTtcblxudmFyIEFXU19Vc2VycyA9IGZ1bmN0aW9uKG5hbWUseCx5KSB7XG4gIEVsZW1lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLm5hbWUgPSBuYW1lO1xuICBzZWxmLnRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCdOb24tU2VydmljZV9TcGVjaWZpY19jb3B5X1VzZXJzLnBuZycpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xuXG59O1xuQVdTX1VzZXJzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19Vc2VycztcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE0LzE1LlxuICovXG5cbnZhciBNT1VTRV9PVkVSX1NDQUxFX1JBVElPID0gMS4xO1xuXG52YXIgRHJhZ0Ryb3AgPSB7XG5cbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coKTtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmKHRoaXMubW92ZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBkcmFnZ2luZycpO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gICAgICB0aGlzLmRhdGEgPSBudWxsO1xuXG4gICAgICBpZighdGhpcy5zZWN1cml0eUdyb3VwKSB7XG5cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdQYXJlbnQnKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzZWxmLnBhcmVudC5wYXJlbnQuTUFOQUdFUik7XG4gICAgICAgICAgdmFyIHNlY0dycHMgPSBzZWxmLnBhcmVudC5wYXJlbnQuTUFOQUdFUi5zZWN1cml0eWdyb3VwcztcblxuICAgICAgICAgIF8uZWFjaChzZWNHcnBzLmVsZW1lbnRzLCBmdW5jdGlvbihzKSB7XG5cbiAgICAgICAgICAgICAgdmFyIHhkaXN0ID0gcy5wb3NpdGlvbi54IC0gc2VsZi5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgICAgIGlmKHhkaXN0ID4gLXMud2lkdGgvMiAmJiB4ZGlzdCA8IHMud2lkdGgvMilcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciB5ZGlzdCA9IHMucG9zaXRpb24ueSAtIHNlbGYucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgICAgIGlmKHlkaXN0ID4gLXMuaGVpZ2h0LzIgJiYgeWRpc3QgPCBzLmhlaWdodC8yKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NvbGxpc2lvbiBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb24ueCA9IDA7XG4gICAgICAgICAgICAgICAgICBzZWxmLnBvc2l0aW9uLnkgPSAwO1xuICAgICAgICAgICAgICAgICAgc2VsZi5zZWN1cml0eUdyb3VwID0gcztcbiAgICAgICAgICAgICAgICAgICAgcy5hZGRDaGlsZChzZWxmKTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBOT1QgZHJhZ2dpbmcnKTtcbiAgICAgIHZhciBzaGFkb3cgPSBuZXcgUElYSS5maWx0ZXJzLkRyb3BTaGFkb3dGaWx0ZXIoKTtcbiAgICAgIHRoaXMuZmlsdGVycyA9IFtzaGFkb3ddO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICBjb25zb2xlLmxvZygnUGFyZW50OicpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5wYXJlbnQucGFyZW50KTtcbiAgICAgIGlmKHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCkge1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQuZmlsdGVycyA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcmVudC5wYXJlbnQuY2xpY2tlZE9ubHlTdGFnZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkID0gdGhpcztcbiAgICB9XG4gIH0sXG5cbiAgb25EcmFnTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLmRyYWdnaW5nKVxuICAgIHtcbiAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHNlbGYuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHNlbGYucGFyZW50KTtcbiAgICAgIHNlbGYucG9zaXRpb24ueCA9IG5ld1Bvc2l0aW9uLng7XG4gICAgICBzZWxmLnBvc2l0aW9uLnkgPSBuZXdQb3NpdGlvbi55O1xuICAgICAgc2VsZi5tb3ZlZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG4gIG9uTW91c2VPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3ZlciEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54Kk1PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuICAgIHZhciBpY29uU2l6ZSA9IDEwO1xuXG4gICAgdmFyIGdsb2JhbCA9IHNlbGYudG9HbG9iYWwoc2VsZi5wb3NpdGlvbik7XG4gICAgLy9jb25zb2xlLmxvZygnb2ZmaWNpYWw6ICcgKyBzZWxmLnBvc2l0aW9uLnggKyAnOicgKyBzZWxmLnBvc2l0aW9uLnkpO1xuICAgIC8vY29uc29sZS5sb2coJ0dMT0JBTDogJyArIGdsb2JhbC54ICsgJzonICsgZ2xvYmFsLnkpO1xuICAgIC8vY29uc29sZS5sb2coc2VsZi5nZXRMb2NhbEJvdW5kcygpKTtcblxuICAgIHZhciBzY2FsZUxvY2F0aW9ucyA9IFtcbiAgICAgIHt4OiAwLCB5OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMi1pY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMC1zZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMi1pY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzIraWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAsIHk6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMitpY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX1cbiAgICBdO1xuXG4gICAgLy9jb25zb2xlLmxvZyhzY2FsZUxvY2F0aW9uc1swXSk7XG5cbiAgICBzZWxmLnNjYWxlSWNvbnMgPSBbXTtcblxuICAgIHNjYWxlTG9jYXRpb25zLmZvckVhY2goZnVuY3Rpb24obG9jKSB7XG4gICAgICB2YXIgaWNvbiA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICBpY29uLm1vdmVUbygwLDApO1xuICAgICAgaWNvbi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICBpY29uLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgICAgaWNvbi5saW5lU3R5bGUoMSwgMHgwMDAwRkYsIDEpO1xuICAgICAgaWNvbi5iZWdpbkZpbGwoMHhGRkZGRkYsIDEpO1xuICAgICAgaWNvbi5kcmF3Q2lyY2xlKGxvYy54LCBsb2MueSwgbG9jLnNpemUpO1xuICAgICAgaWNvbi5lbmRGaWxsKCk7XG5cbiAgICAgIC8vaWNvblxuICAgICAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAgICAgLy8ub24oJ21vdXNlZG93bicsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KVxuICAgICAgICAvLy5vbigndG91Y2hzdGFydCcsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KTtcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAgIC8vLm9uKCdtb3VzZXVwJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ21vdXNldXBvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgICAvLy5vbignbW91c2Vtb3ZlJywgb25EcmFnTW92ZSlcbiAgICAgIC8vLm9uKCd0b3VjaG1vdmUnLCBvbkRyYWdNb3ZlKVxuXG4gICAgICBzZWxmLnNjYWxlSWNvbnMucHVzaChpY29uKTtcblxuICAgIH0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5hZGRDaGlsZChzKTtcbiAgICB9KTtcblxuICAgIHNlbGYudG9vbHRpcCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgc2VsZi50b29sdGlwLmxpbmVTdHlsZSgzLCAweDAwMDBGRiwgMSk7XG4gICAgc2VsZi50b29sdGlwLmJlZ2luRmlsbCgweDAwMDAwMCwgMSk7XG4gICAgLy9zZWxmLmRyYXcubW92ZVRvKHgseSk7XG4gICAgc2VsZi50b29sdGlwLmRyYXdSb3VuZGVkUmVjdCgwKzIwLC1zZWxmLmhlaWdodCwyMDAsMTAwLDEwKTtcbiAgICBzZWxmLnRvb2x0aXAuZW5kRmlsbCgpO1xuICAgIHNlbGYudG9vbHRpcC50ZXh0U3R5bGUgPSB7XG4gICAgICBmb250IDogJ2JvbGQgaXRhbGljIDI4cHggQXJpYWwnLFxuICAgICAgZmlsbCA6ICcjRjdFRENBJyxcbiAgICAgIHN0cm9rZSA6ICcjNGExODUwJyxcbiAgICAgIHN0cm9rZVRoaWNrbmVzcyA6IDUsXG4gICAgICBkcm9wU2hhZG93IDogdHJ1ZSxcbiAgICAgIGRyb3BTaGFkb3dDb2xvciA6ICcjMDAwMDAwJyxcbiAgICAgIGRyb3BTaGFkb3dBbmdsZSA6IE1hdGguUEkgLyA2LFxuICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlIDogNixcbiAgICAgIHdvcmRXcmFwIDogdHJ1ZSxcbiAgICAgIHdvcmRXcmFwV2lkdGggOiA0NDBcbiAgICB9O1xuXG4gICAgc2VsZi50b29sdGlwLnRleHQgPSBuZXcgUElYSS5UZXh0KHNlbGYubmFtZSxzZWxmLnRvb2x0aXAudGV4dFN0eWxlKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC54ID0gMCszMDtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC55ID0gLXNlbGYuaGVpZ2h0O1xuXG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcClcbiAgICAgIC50byh7eDpzZWxmLndpZHRofSw3MDApXG4gICAgICAuZWFzaW5nKCBUV0VFTi5FYXNpbmcuRWxhc3RpYy5Jbk91dCApXG4gICAgICAuc3RhcnQoKTtcbiAgICBuZXcgVFdFRU4uVHdlZW4oc2VsZi50b29sdGlwLnRleHQpXG4gICAgICAudG8oe3g6c2VsZi53aWR0aCsyMH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG5cbiAgICBjb25zb2xlLmxvZygnQWRkaW5nIHRvb2x0aXAnKTtcbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcCk7XG5cbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvbk1vdXNlT3V0OiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3V0IScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2Ugb3V0Jyk7XG4gICAgdGhpcy5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5yZW1vdmVDaGlsZChzKTtcbiAgICB9KTtcbiAgICAvL2NvbnNvbGUubG9nKCdTaXplOiAnKTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuZ2V0Qm91bmRzKCkpO1xuXG4gICAgc2VsZi5yZW1vdmVDaGlsZChzZWxmLnRvb2x0aXApO1xuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwLnRleHQpO1xuICB9LFxuXG4gIG9uU2NhbGVJY29uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZygnUmVzaXppbmchJyk7XG4gIH1cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdEcm9wO1xuXG4iLCJcbnZhciBHdWlVdGlsID0ge1xuXG4gIGdldFdpbmRvd0RpbWVuc2lvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHsgeDogd2luZG93LmlubmVyV2lkdGgsIHk6IHdpbmRvdy5pbm5lckhlaWdodCB9O1xuICB9LFxuXG4gIGRyYXdHcmlkOiBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIGdyaWQgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHZhciBpbnRlcnZhbCA9IDEwMDtcbiAgICB2YXIgY291bnQgPSBpbnRlcnZhbDtcbiAgICBncmlkLmxpbmVTdHlsZSgxLCAweEU1RTVFNSwgMSk7XG4gICAgd2hpbGUgKGNvdW50IDwgd2lkdGgpIHtcbiAgICAgIGdyaWQubW92ZVRvKGNvdW50LCAwKTtcbiAgICAgIGdyaWQubGluZVRvKGNvdW50LCBoZWlnaHQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICBjb3VudCA9IGludGVydmFsO1xuICAgIHdoaWxlKGNvdW50IDwgaGVpZ2h0KSB7XG4gICAgICBncmlkLm1vdmVUbygwLCBjb3VudCk7XG4gICAgICBncmlkLmxpbmVUbyh3aWR0aCwgY291bnQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICB2YXIgY29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG4gICAgY29udGFpbmVyLmFkZENoaWxkKGdyaWQpO1xuICAgIGNvbnRhaW5lci5jYWNoZUFzQml0bWFwID0gdHJ1ZTtcbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR3VpVXRpbDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8yMS8xNS5cbiAqL1xuLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzE1LzE1LlxuICovXG5cbnZhciBDb2xsZWN0aW9uID0gZnVuY3Rpb24oKSB7XG4gIFBJWEkuQ29udGFpbmVyLmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLmVsZW1lbnRzID0ge307XG5cbiAgc2VsZi5hZGQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgc2VsZi5hZGRDaGlsZChlbGVtZW50KTtcbiAgICBzZWxmLmVsZW1lbnRzW2VsZW1lbnQubmFtZV0gPSBlbGVtZW50O1xuICB9O1xuXG4gIHNlbGYucmVtb3ZlID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHNlbGYucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG4gICAgZGVsZXRlIHNlbGYuZWxlbWVudHNbZWxlbWVudC5uYW1lXTtcbiAgfTtcblxufTtcbkNvbGxlY3Rpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQSVhJLkNvbnRhaW5lci5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb247XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIENvbXBvbmVudCA9IGZ1bmN0aW9uKCkge1xuICBQSVhJLlNwcml0ZS5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5hbmNob3Iuc2V0KDAuNSk7XG4gIHNlbGYuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICBzZWxmLmJ1dHRvbk1vZGUgPSB0cnVlO1xuXG59O1xuQ29tcG9uZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUElYSS5TcHJpdGUucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnQ7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xNC8xNS5cbiAqL1xuXG52YXIgTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyA9IDEuMTtcblxudmFyIEVsZW1lbnREcmFnRHJvcCA9IHtcblxuICBvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygpO1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gIH0sXG5cbiAgb25EcmFnRW5kOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYodGhpcy5tb3ZlZCkge1xuICAgICAgY29uc29sZS5sb2coJ0ZvdW5kIGNsaWNrIHdoaWxlIGRyYWdnaW5nJyk7XG4gICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMubW92ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGF0YSA9IG51bGw7XG5cbiAgICAgIGlmKCF0aGlzLnNlY3VyaXR5R3JvdXApIHtcblxuICAgICAgICAgIC8vY29uc29sZS5sb2coJ1BhcmVudCcpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHNlbGYucGFyZW50LnBhcmVudC5NQU5BR0VSKTtcbiAgICAgICAgICB2YXIgc2VjR3JwcyA9IHNlbGYucGFyZW50LnBhcmVudC5NQU5BR0VSLnNlY3VyaXR5Z3JvdXBzO1xuXG4gICAgICAgICAgXy5lYWNoKHNlY0dycHMuZWxlbWVudHMsIGZ1bmN0aW9uKHMpIHtcblxuICAgICAgICAgICAgICB2YXIgeGRpc3QgPSBzLnBvc2l0aW9uLnggLSBzZWxmLnBvc2l0aW9uLng7XG5cbiAgICAgICAgICAgICAgaWYoeGRpc3QgPiAtcy53aWR0aC8yICYmIHhkaXN0IDwgcy53aWR0aC8yKVxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHlkaXN0ID0gcy5wb3NpdGlvbi55IC0gc2VsZi5wb3NpdGlvbi55O1xuXG4gICAgICAgICAgICAgICAgaWYoeWRpc3QgPiAtcy5oZWlnaHQvMiAmJiB5ZGlzdCA8IHMuaGVpZ2h0LzIpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29sbGlzaW9uIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgICAgICAgc2VsZi5wb3NpdGlvbi54ID0gMDtcbiAgICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb24ueSA9IDA7XG4gICAgICAgICAgICAgICAgICBzZWxmLnNlY3VyaXR5R3JvdXAgPSBzO1xuICAgICAgICAgICAgICAgICAgICBzLmFkZENoaWxkKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2VsZik7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0ZvdW5kIGNsaWNrIHdoaWxlIE5PVCBkcmFnZ2luZycpO1xuICAgICAgdmFyIHNoYWRvdyA9IG5ldyBQSVhJLmZpbHRlcnMuRHJvcFNoYWRvd0ZpbHRlcigpO1xuICAgICAgdGhpcy5maWx0ZXJzID0gW3NoYWRvd107XG4gICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIGNvbnNvbGUubG9nKCdQYXJlbnQ6Jyk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnBhcmVudC5wYXJlbnQpO1xuICAgICAgaWYodGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkKSB7XG4gICAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZC5maWx0ZXJzID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFyZW50LnBhcmVudC5jbGlja2VkT25seVN0YWdlID0gZmFsc2U7XG4gICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQgPSB0aGlzO1xuICAgIH1cbiAgfSxcblxuICBvbkRyYWdNb3ZlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuZHJhZ2dpbmcpXG4gICAge1xuICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gc2VsZi5kYXRhLmdldExvY2FsUG9zaXRpb24oc2VsZi5wYXJlbnQpO1xuICAgICAgc2VsZi5wb3NpdGlvbi54ID0gbmV3UG9zaXRpb24ueDtcbiAgICAgIHNlbGYucG9zaXRpb24ueSA9IG5ld1Bvc2l0aW9uLnk7XG4gICAgICBzZWxmLm1vdmVkID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cbiAgb25Nb3VzZU92ZXI6IGZ1bmN0aW9uKCkge1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlZCBvdmVyIScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG4gICAgdmFyIGljb25TaXplID0gMTA7XG5cbiAgICB2YXIgZ2xvYmFsID0gc2VsZi50b0dsb2JhbChzZWxmLnBvc2l0aW9uKTtcblxuICAgIHZhciBzY2FsZUxvY2F0aW9ucyA9IFtcbiAgICAgIHt4OiAwLCB5OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMi1pY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMC1zZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMi1pY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzIraWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAsIHk6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMitpY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX1cbiAgICBdO1xuXG4gICAgLy9jb25zb2xlLmxvZyhzY2FsZUxvY2F0aW9uc1swXSk7XG5cbiAgICBzZWxmLnNjYWxlSWNvbnMgPSBbXTtcblxuICAgIHNjYWxlTG9jYXRpb25zLmZvckVhY2goZnVuY3Rpb24obG9jKSB7XG4gICAgICB2YXIgaWNvbiA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICBpY29uLm1vdmVUbygwLDApO1xuICAgICAgaWNvbi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICBpY29uLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgICAgaWNvbi5saW5lU3R5bGUoMSwgMHgwMDAwRkYsIDEpO1xuICAgICAgaWNvbi5iZWdpbkZpbGwoMHhGRkZGRkYsIDEpO1xuICAgICAgaWNvbi5kcmF3Q2lyY2xlKGxvYy54LCBsb2MueSwgbG9jLnNpemUpO1xuICAgICAgaWNvbi5lbmRGaWxsKCk7XG5cbiAgICAgIC8vaWNvblxuICAgICAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAgICAgLy8ub24oJ21vdXNlZG93bicsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KVxuICAgICAgICAvLy5vbigndG91Y2hzdGFydCcsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KTtcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAgIC8vLm9uKCdtb3VzZXVwJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ21vdXNldXBvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgICAvLy5vbignbW91c2Vtb3ZlJywgb25EcmFnTW92ZSlcbiAgICAgIC8vLm9uKCd0b3VjaG1vdmUnLCBvbkRyYWdNb3ZlKVxuXG4gICAgICBzZWxmLnNjYWxlSWNvbnMucHVzaChpY29uKTtcblxuICAgIH0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5hZGRDaGlsZChzKTtcbiAgICB9KTtcblxuICAgIHNlbGYudG9vbHRpcCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgc2VsZi50b29sdGlwLmxpbmVTdHlsZSgzLCAweDAwMDBGRiwgMSk7XG4gICAgc2VsZi50b29sdGlwLmJlZ2luRmlsbCgweDAwMDAwMCwgMSk7XG4gICAgLy9zZWxmLmRyYXcubW92ZVRvKHgseSk7XG4gICAgc2VsZi50b29sdGlwLmRyYXdSb3VuZGVkUmVjdCgwKzIwLC1zZWxmLmhlaWdodCwyMDAsMTAwLDEwKTtcbiAgICBzZWxmLnRvb2x0aXAuZW5kRmlsbCgpO1xuICAgIHNlbGYudG9vbHRpcC50ZXh0U3R5bGUgPSB7XG4gICAgICBmb250IDogJ2JvbGQgaXRhbGljIDI4cHggQXJpYWwnLFxuICAgICAgZmlsbCA6ICcjRjdFRENBJyxcbiAgICAgIHN0cm9rZSA6ICcjNGExODUwJyxcbiAgICAgIHN0cm9rZVRoaWNrbmVzcyA6IDUsXG4gICAgICBkcm9wU2hhZG93IDogdHJ1ZSxcbiAgICAgIGRyb3BTaGFkb3dDb2xvciA6ICcjMDAwMDAwJyxcbiAgICAgIGRyb3BTaGFkb3dBbmdsZSA6IE1hdGguUEkgLyA2LFxuICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlIDogNixcbiAgICAgIHdvcmRXcmFwIDogdHJ1ZSxcbiAgICAgIHdvcmRXcmFwV2lkdGggOiA0NDBcbiAgICB9O1xuXG4gICAgc2VsZi50b29sdGlwLnRleHQgPSBuZXcgUElYSS5UZXh0KHNlbGYubmFtZSxzZWxmLnRvb2x0aXAudGV4dFN0eWxlKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC54ID0gMCszMDtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC55ID0gLXNlbGYuaGVpZ2h0O1xuXG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcClcbiAgICAgIC50byh7eDpzZWxmLndpZHRofSw3MDApXG4gICAgICAuZWFzaW5nKCBUV0VFTi5FYXNpbmcuRWxhc3RpYy5Jbk91dCApXG4gICAgICAuc3RhcnQoKTtcbiAgICBuZXcgVFdFRU4uVHdlZW4oc2VsZi50b29sdGlwLnRleHQpXG4gICAgICAudG8oe3g6c2VsZi53aWR0aCsyMH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG5cbiAgICBjb25zb2xlLmxvZygnQWRkaW5nIHRvb2x0aXAnKTtcbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcCk7XG5cbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvbk1vdXNlT3V0OiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3V0IScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2Ugb3V0Jyk7XG4gICAgdGhpcy5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5yZW1vdmVDaGlsZChzKTtcbiAgICB9KTtcbiAgICAvL2NvbnNvbGUubG9nKCdTaXplOiAnKTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuZ2V0Qm91bmRzKCkpO1xuXG4gICAgc2VsZi5yZW1vdmVDaGlsZChzZWxmLnRvb2x0aXApO1xuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwLnRleHQpO1xuICB9LFxuXG4gIG9uU2NhbGVJY29uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZygnUmVzaXppbmchJyk7XG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50RHJhZ0Ryb3A7XG5cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8xNS8xNS5cbiAqL1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vY29tcG9uZW50L2NvbXBvbmVudCcpO1xudmFyIEVsZW1lbnREcmFnRHJvcCA9IHJlcXVpcmUoJy4vZWxlbWVudC5kcmFnLmRyb3AnKTtcblxudmFyIERFRkFVTFRfU0NBTEUgPSAwLjc7XG5cbnZhciBFbGVtZW50ID0gZnVuY3Rpb24oKSB7XG4gIENvbXBvbmVudC5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5zY2FsZS5zZXQoREVGQVVMVF9TQ0FMRSk7XG4gIHNlbGZcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAub24oJ21vdXNlZG93bicsIEVsZW1lbnREcmFnRHJvcC5vbkRyYWdTdGFydClcbiAgICAub24oJ3RvdWNoc3RhcnQnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIGVuZFxuICAgIC5vbignbW91c2V1cCcsIEVsZW1lbnREcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCdtb3VzZXVwb3V0c2lkZScsIEVsZW1lbnREcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCd0b3VjaGVuZCcsIEVsZW1lbnREcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgLm9uKCdtb3VzZW1vdmUnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAub24oJ3RvdWNobW92ZScsIEVsZW1lbnREcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgIC8vIGV2ZW50cyBmb3IgbW91c2Ugb3ZlclxuICAgIC5vbignbW91c2VvdmVyJywgRWxlbWVudERyYWdEcm9wLm9uTW91c2VPdmVyKVxuICAgIC5vbignbW91c2VvdXQnLCBFbGVtZW50RHJhZ0Ryb3Aub25Nb3VzZU91dCk7XG5cbiAgc2VsZi5hcnJvd3MgPSBbXTtcblxuICBzZWxmLmFkZEFycm93VG8gPSBmdW5jdGlvbihiKSB7XG4gICAgc2VsZi5hcnJvd3MucHVzaChiKTtcbiAgfTtcblxuICBzZWxmLnJlbW92ZUFycm93VG8gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHNlbGYuYXJyb3dzLnJlbW92ZShpbmRleCk7XG4gIH07XG5cbn07XG5FbGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRWxlbWVudDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE0LzE1LlxuICovXG5cbnZhciBNT1VTRV9PVkVSX1NDQUxFX1JBVElPID0gMS4xO1xuXG52YXIgRHJhZ0Ryb3AgPSB7XG5cbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coKTtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmKHRoaXMubW92ZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBkcmFnZ2luZycpO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gICAgICB0aGlzLmRhdGEgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBOT1QgZHJhZ2dpbmcnKTtcbiAgICAgIHZhciBzaGFkb3cgPSBuZXcgUElYSS5maWx0ZXJzLkRyb3BTaGFkb3dGaWx0ZXIoKTtcbiAgICAgIHRoaXMuZmlsdGVycyA9IFtzaGFkb3ddO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICBjb25zb2xlLmxvZygnUGFyZW50OicpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5wYXJlbnQucGFyZW50KTtcbiAgICAgIGlmKHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCkge1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQuZmlsdGVycyA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcmVudC5wYXJlbnQuY2xpY2tlZE9ubHlTdGFnZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkID0gdGhpcztcbiAgICB9XG4gIH0sXG5cbiAgb25EcmFnTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLmRyYWdnaW5nKVxuICAgIHtcbiAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHNlbGYuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHNlbGYucGFyZW50KTtcbiAgICAgIHNlbGYucG9zaXRpb24ueCA9IG5ld1Bvc2l0aW9uLng7XG4gICAgICBzZWxmLnBvc2l0aW9uLnkgPSBuZXdQb3NpdGlvbi55O1xuICAgICAgc2VsZi5tb3ZlZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG4gIG9uTW91c2VPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3ZlciEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54Kk1PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuICAgIHZhciBpY29uU2l6ZSA9IDEwO1xuXG4gICAgdmFyIGdsb2JhbCA9IHNlbGYudG9HbG9iYWwoc2VsZi5wb3NpdGlvbik7XG4gICAgLy9jb25zb2xlLmxvZygnb2ZmaWNpYWw6ICcgKyBzZWxmLnBvc2l0aW9uLnggKyAnOicgKyBzZWxmLnBvc2l0aW9uLnkpO1xuICAgIC8vY29uc29sZS5sb2coJ0dMT0JBTDogJyArIGdsb2JhbC54ICsgJzonICsgZ2xvYmFsLnkpO1xuICAgIC8vY29uc29sZS5sb2coc2VsZi5nZXRMb2NhbEJvdW5kcygpKTtcblxuICAgIHZhciBzY2FsZUxvY2F0aW9ucyA9IFtcbiAgICAgIHt4OiAwLCB5OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMi1pY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMC1zZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMi1pY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzIraWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAsIHk6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMitpY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX1cbiAgICBdO1xuXG4gICAgLy9jb25zb2xlLmxvZyhzY2FsZUxvY2F0aW9uc1swXSk7XG5cbiAgICBzZWxmLnNjYWxlSWNvbnMgPSBbXTtcblxuICAgIHNjYWxlTG9jYXRpb25zLmZvckVhY2goZnVuY3Rpb24obG9jKSB7XG4gICAgICB2YXIgaWNvbiA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICBpY29uLm1vdmVUbygwLDApO1xuICAgICAgaWNvbi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICBpY29uLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgICAgaWNvbi5saW5lU3R5bGUoMSwgMHgwMDAwRkYsIDEpO1xuICAgICAgaWNvbi5iZWdpbkZpbGwoMHhGRkZGRkYsIDEpO1xuICAgICAgaWNvbi5kcmF3Q2lyY2xlKGxvYy54LCBsb2MueSwgbG9jLnNpemUpO1xuICAgICAgaWNvbi5lbmRGaWxsKCk7XG5cbiAgICAgIC8vaWNvblxuICAgICAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAgICAgLy8ub24oJ21vdXNlZG93bicsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KVxuICAgICAgICAvLy5vbigndG91Y2hzdGFydCcsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KTtcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAgIC8vLm9uKCdtb3VzZXVwJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ21vdXNldXBvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgICAvLy5vbignbW91c2Vtb3ZlJywgb25EcmFnTW92ZSlcbiAgICAgIC8vLm9uKCd0b3VjaG1vdmUnLCBvbkRyYWdNb3ZlKVxuXG4gICAgICBzZWxmLnNjYWxlSWNvbnMucHVzaChpY29uKTtcblxuICAgIH0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5hZGRDaGlsZChzKTtcbiAgICB9KTtcblxuICAgIHNlbGYudG9vbHRpcCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgc2VsZi50b29sdGlwLmxpbmVTdHlsZSgzLCAweDAwMDBGRiwgMSk7XG4gICAgc2VsZi50b29sdGlwLmJlZ2luRmlsbCgweDAwMDAwMCwgMSk7XG4gICAgLy9zZWxmLmRyYXcubW92ZVRvKHgseSk7XG4gICAgc2VsZi50b29sdGlwLmRyYXdSb3VuZGVkUmVjdCgwKzIwLC1zZWxmLmhlaWdodCwyMDAsMTAwLDEwKTtcbiAgICBzZWxmLnRvb2x0aXAuZW5kRmlsbCgpO1xuICAgIHNlbGYudG9vbHRpcC50ZXh0U3R5bGUgPSB7XG4gICAgICBmb250IDogJ2JvbGQgaXRhbGljIDI4cHggQXJpYWwnLFxuICAgICAgZmlsbCA6ICcjRjdFRENBJyxcbiAgICAgIHN0cm9rZSA6ICcjNGExODUwJyxcbiAgICAgIHN0cm9rZVRoaWNrbmVzcyA6IDUsXG4gICAgICBkcm9wU2hhZG93IDogdHJ1ZSxcbiAgICAgIGRyb3BTaGFkb3dDb2xvciA6ICcjMDAwMDAwJyxcbiAgICAgIGRyb3BTaGFkb3dBbmdsZSA6IE1hdGguUEkgLyA2LFxuICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlIDogNixcbiAgICAgIHdvcmRXcmFwIDogdHJ1ZSxcbiAgICAgIHdvcmRXcmFwV2lkdGggOiA0NDBcbiAgICB9O1xuXG4gICAgc2VsZi50b29sdGlwLnRleHQgPSBuZXcgUElYSS5UZXh0KHNlbGYubmFtZSxzZWxmLnRvb2x0aXAudGV4dFN0eWxlKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC54ID0gMCszMDtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC55ID0gLXNlbGYuaGVpZ2h0O1xuXG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcClcbiAgICAgIC50byh7eDpzZWxmLndpZHRofSw3MDApXG4gICAgICAuZWFzaW5nKCBUV0VFTi5FYXNpbmcuRWxhc3RpYy5Jbk91dCApXG4gICAgICAuc3RhcnQoKTtcbiAgICBuZXcgVFdFRU4uVHdlZW4oc2VsZi50b29sdGlwLnRleHQpXG4gICAgICAudG8oe3g6c2VsZi53aWR0aCsyMH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG5cbiAgICBjb25zb2xlLmxvZygnQWRkaW5nIHRvb2x0aXAnKTtcbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcCk7XG5cbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvbk1vdXNlT3V0OiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3V0IScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2Ugb3V0Jyk7XG4gICAgdGhpcy5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5yZW1vdmVDaGlsZChzKTtcbiAgICB9KTtcbiAgICAvL2NvbnNvbGUubG9nKCdTaXplOiAnKTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuZ2V0Qm91bmRzKCkpO1xuXG4gICAgc2VsZi5yZW1vdmVDaGlsZChzZWxmLnRvb2x0aXApO1xuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwLnRleHQpO1xuICB9LFxuXG4gIG9uU2NhbGVJY29uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZygnUmVzaXppbmchJyk7XG4gIH1cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdEcm9wO1xuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudC9jb21wb25lbnQnKTtcbnZhciBHcm91cERyYWdEcm9wID0gcmVxdWlyZSgnLi9ncm91cC5kcmFnLmRyb3AnKTtcblxudmFyIERFRkFVTFRfU0NBTEUgPSAwLjc7XG5cbnZhciBHcm91cCA9IGZ1bmN0aW9uKCkge1xuICBDb21wb25lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuc2NhbGUuc2V0KERFRkFVTFRfU0NBTEUpO1xuICBzZWxmLmFuY2hvci5zZXQoMC41KTtcbiAgc2VsZi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gIHNlbGYuYnV0dG9uTW9kZSA9IHRydWU7XG4gIHNlbGZcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAub24oJ21vdXNlZG93bicsIEdyb3VwRHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgLm9uKCd0b3VjaHN0YXJ0JywgR3JvdXBEcmFnRHJvcC5vbkRyYWdTdGFydClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgLm9uKCdtb3VzZXVwJywgR3JvdXBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCdtb3VzZXVwb3V0c2lkZScsIEdyb3VwRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbigndG91Y2hlbmQnLCBHcm91cERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ3RvdWNoZW5kb3V0c2lkZScsIEdyb3VwRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgLm9uKCdtb3VzZW1vdmUnLCBHcm91cERyYWdEcm9wLm9uRHJhZ01vdmUpXG4gICAgLm9uKCd0b3VjaG1vdmUnLCBHcm91cERyYWdEcm9wLm9uRHJhZ01vdmUpXG4gICAgLy8gZXZlbnRzIGZvciBtb3VzZSBvdmVyXG4gICAgLm9uKCdtb3VzZW92ZXInLCBHcm91cERyYWdEcm9wLm9uTW91c2VPdmVyKVxuICAgIC5vbignbW91c2VvdXQnLCBHcm91cERyYWdEcm9wLm9uTW91c2VPdXQpO1xuXG4gIHNlbGYuYXJyb3dzID0gW107XG5cbiAgc2VsZi5hZGRBcnJvd1RvID0gZnVuY3Rpb24oYikge1xuICAgIHNlbGYuYXJyb3dzLnB1c2goYik7XG4gIH07XG5cbiAgc2VsZi5yZW1vdmVBcnJvd1RvID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBzZWxmLmFycm93cy5yZW1vdmUoaW5kZXgpO1xuICB9O1xuXG59O1xuR3JvdXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcm91cDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzMwLzE1LlxuICovXG5cbnZhciBDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9saWIvY29sbGVjdGlvbi9jb2xsZWN0aW9uJyk7XG52YXIgR3VpVXRpbCA9IHJlcXVpcmUoJy4vZ3VpLnV0aWwnKTtcbnZhciBBV1NfRUMyX0luc3RhbmNlID0gcmVxdWlyZSgnLi9hd3MvQVdTX0VDMl9JbnN0YW5jZScpO1xudmFyIEFXU19FQzJfRUlQID0gcmVxdWlyZSgnLi9hd3MvQVdTX0VDMl9FSVAnKTtcbnZhciBBV1NfRUMyX1NlY3VyaXR5R3JvdXAgPSByZXF1aXJlKCcuL2F3cy9BV1NfRUMyX1NlY3VyaXR5R3JvdXAnKTtcblxuZnVuY3Rpb24gYnVpbGRNZW51Q29tcG9uZW50KHgseSwgdGV4dHVyZSwgc2NhbGUsIG1vdXNlVXBDYWxsYmFjaykge1xuICB2YXIgbWVudUNvbXBvbmVudCA9IG5ldyBQSVhJLlNwcml0ZSgpO1xuICBtZW51Q29tcG9uZW50LnRleHR1cmUgPSB0ZXh0dXJlO1xuICBtZW51Q29tcG9uZW50LnNjYWxlLnNldChzY2FsZSk7XG4gIG1lbnVDb21wb25lbnQueCA9IHg7XG4gIG1lbnVDb21wb25lbnQueSA9IHk7XG4gIG1lbnVDb21wb25lbnQuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICBtZW51Q29tcG9uZW50LmJ1dHRvbk1vZGUgPSB0cnVlO1xuICBtZW51Q29tcG9uZW50LmFuY2hvci5zZXQoMC41KTtcbiAgbWVudUNvbXBvbmVudFxuICAgIC5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqMS4yKTtcbiAgICB9KVxuICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueC8xLjIpO1xuICAgIH0pXG4gICAgLm9uKCdtb3VzZXVwJywgbW91c2VVcENhbGxiYWNrKTtcbiAgcmV0dXJuIG1lbnVDb21wb25lbnQ7XG59XG5cbnZhciBNZW51ID0gZnVuY3Rpb24obWFuYWdlcikge1xuICBDb2xsZWN0aW9uLmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5NQU5BR0VSID0gbWFuYWdlcjtcbiAgc2VsZi5tZW51ID0ge307XG5cbiAgdmFyIGRpbSA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG5cbiAgdmFyIHhvZmZzZXQgPSBkaW0ueC00MDtcbiAgdmFyIHlvZmZzZXQgPSBkaW0ueS8yO1xuXG5cbiAgc2VsZi5tZW51Lmluc3RhbmNlID0gYnVpbGRNZW51Q29tcG9uZW50KHhvZmZzZXQsIHlvZmZzZXQsIFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ0NvbXB1dGVfJl9OZXR3b3JraW5nX0FtYXpvbl9FQzJfSW5zdGFuY2UucG5nJyksIDAuMixcbiAgICBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuTUFOQUdFUi5lbGVtZW50cy5hZGQobmV3IEFXU19FQzJfSW5zdGFuY2UoJ05ld19JbnN0YW5jZScsIGRpbS54LzIsIGRpbS55LzIpKTtcbiAgICB9KTtcblxuICBzZWxmLmFkZChzZWxmLm1lbnUuaW5zdGFuY2UpO1xuXG4gIHZhciBzZWNHcnBHcmFwaGljID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgc2VjR3JwR3JhcGhpYy5saW5lU3R5bGUoMywgMHgwMDAwMDAsIDEpO1xuICBzZWNHcnBHcmFwaGljLmJlZ2luRmlsbCgweEZGRkZGRiwgMSk7XG4gIHNlY0dycEdyYXBoaWMuZHJhd1JvdW5kZWRSZWN0KDAsMCwzMCwzMCw2KTtcbiAgc2VjR3JwR3JhcGhpYy5lbmRGaWxsKCk7XG5cbiAgc2VsZi5tZW51LnNlY2dycCA9IGJ1aWxkTWVudUNvbXBvbmVudCh4b2Zmc2V0LCB5b2Zmc2V0KzQwLCBzZWNHcnBHcmFwaGljLmdlbmVyYXRlVGV4dHVyZSgpLCAxLjAsXG4gICAgZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLk1BTkFHRVIuc2VjdXJpdHlncm91cHMuYWRkKG5ldyBBV1NfRUMyX1NlY3VyaXR5R3JvdXAoJ05ld19TZWN1cml0eV9Hcm91cCcsIGRpbS54LzIsIGRpbS55LzIpKTtcbiAgICB9KTtcblxuICBzZWxmLmFkZChzZWxmLm1lbnUuc2VjZ3JwKTtcblxufTtcblxuTWVudS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbGxlY3Rpb24ucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZW51O1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDcvOS8xNS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBHdWlVdGlsID0gcmVxdWlyZSgnLi9ndWkudXRpbCcpO1xudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuL2xpYi9lbGVtZW50L2VsZW1lbnQnKTtcbi8vdmFyIEFycm93ID0gcmVxdWlyZSgnLi9hcnJvdycpO1xudmFyIEVkaXRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0VkaXRvck1hbmFnZXInKTtcblxuZnVuY3Rpb24gcmVzaXplR3VpQ29udGFpbmVyKHJlbmRlcmVyKSB7XG5cbiAgdmFyIGRpbSA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG5cbiAgY29uc29sZS5sb2coJ1Jlc2l6aW5nLi4uJyk7XG4gIGNvbnNvbGUubG9nKGRpbSk7XG5cbiAgJCgnI2d1aUNvbnRhaW5lcicpLmhlaWdodChkaW0ueSk7XG4gICQoJyNndWlDb250YWluZXInKS53aWR0aChkaW0ueCk7XG5cbiAgaWYocmVuZGVyZXIpIHtcbiAgICByZW5kZXJlci52aWV3LnN0eWxlLndpZHRoID0gZGltLngrJ3B4JztcbiAgICByZW5kZXJlci52aWV3LnN0eWxlLmhlaWdodCA9IGRpbS55KydweCc7XG4gIH1cblxuICBjb25zb2xlLmxvZygnUmVzaXppbmcgZ3VpIGNvbnRhaW5lci4uLicpO1xuXG59XG5cbnZhciBQaXhpRWRpdG9yID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBvcHRpb25zLnRlbXBsYXRlKCk7XG4gICAgY29uc29sZS5sb2codGVtcGxhdGUpO1xuXG4gICAgdmFyIE1BTkFHRVIgPSBuZXcgRWRpdG9yTWFuYWdlcih0ZW1wbGF0ZSk7XG4gICAgTUFOQUdFUi5pbml0KCk7XG5cbiAgICBjb25zb2xlLmxvZygnQWRkaW5nIGxpc3RlbmVyLi4uJyk7XG4gICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgIHJlc2l6ZUd1aUNvbnRhaW5lcihNQU5BR0VSLnJlbmRlcmVyKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICB0ZW1wbGF0ZTogb3B0aW9ucy50ZW1wbGF0ZSxcblxuICAgICAgZHJhd0NhbnZhc0VkaXRvcjogZnVuY3Rpb24gKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcblxuICAgICAgICBpZiAoaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgIE1BTkFHRVIuYW5pbWF0ZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoTUFOQUdFUi5yZW5kZXJlci52aWV3KTtcblxuICAgICAgICBNQU5BR0VSLmFuaW1hdGUoKTtcblxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBtKCcjZ3VpQ29udGFpbmVyJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0NhbnZhc0VkaXRvcn0pXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUGl4aUVkaXRvcjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA3LzkvMTUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiByZXNpemVFZGl0b3IoZWRpdG9yKSB7XG4gIGVkaXRvci5zZXRTaXplKG51bGwsIHdpbmRvdy5pbm5lckhlaWdodCk7XG59XG5cbnZhciBTb3VyY2VFZGl0b3IgPSB7XG5cbiAgY29udHJvbGxlcjogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgZHJhd0VkaXRvcjogZnVuY3Rpb24gKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcblxuICAgICAgICB2YXIgZWRpdG9yID0gbnVsbDtcblxuICAgICAgICBpZiAoaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgIGlmKGVkaXRvcikge1xuICAgICAgICAgICAgZWRpdG9yLnJlZnJlc2goKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWRpdG9yID0gQ29kZU1pcnJvcihlbGVtZW50LCB7XG4gICAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMudGVtcGxhdGUoKSwgdW5kZWZpbmVkLCAyKSxcbiAgICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICBtb2RlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgZ3V0dGVyczogWydDb2RlTWlycm9yLWxpbnQtbWFya2VycyddLFxuICAgICAgICAgIGxpbnQ6IHRydWUsXG4gICAgICAgICAgc3R5bGVBY3RpdmVMaW5lOiB0cnVlLFxuICAgICAgICAgIGF1dG9DbG9zZUJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIG1hdGNoQnJhY2tldHM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICd6ZW5idXJuJ1xuICAgICAgICB9KTtcblxuICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcblxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJlc2l6ZUVkaXRvcihlZGl0b3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGVkaXRvcikge1xuICAgICAgICAgIG0uc3RhcnRDb21wdXRhdGlvbigpO1xuICAgICAgICAgIG9wdGlvbnMudGVtcGxhdGUoSlNPTi5wYXJzZShlZGl0b3IuZ2V0VmFsdWUoKSkpO1xuICAgICAgICAgIG0uZW5kQ29tcHV0YXRpb24oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICB2aWV3OiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG0oJyNzb3VyY2VFZGl0b3InLCB7IGNvbmZpZzogY29udHJvbGxlci5kcmF3RWRpdG9yIH0pXG4gICAgXVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNvdXJjZUVkaXRvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFNvdXJjZUVkaXRvciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9zb3VyY2UuZWRpdG9yJyk7XG52YXIgUGl4aUVkaXRvciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9waXhpLmVkaXRvcicpO1xuXG52YXIgdGVzdERhdGEgPSByZXF1aXJlKCcuL3Rlc3REYXRhL2VtcHR5Lmpzb24nKTtcblxudmFyIHRlbXBsYXRlID0gbS5wcm9wKHRlc3REYXRhKTtcblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvdWRzbGljZXItYXBwJyksIG0uY29tcG9uZW50KFBpeGlFZGl0b3IsIHtcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgfSlcbik7XG5cbm0ubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGUtYmFyJyksIG0uY29tcG9uZW50KFNvdXJjZUVkaXRvciwge1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB9KVxuKTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJSZXNvdXJjZXNcIjoge1xuXG4gIH1cbn1cbiJdfQ==
