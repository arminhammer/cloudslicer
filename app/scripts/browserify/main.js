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
  var winDimension = GuiUtil.getWindowDimension();
  var grid = null;

  self.renderer = PIXI.autoDetectRenderer(winDimension.x, winDimension.y, {backgroundColor : 0xFFFFFF});

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL0VkaXRvck1hbmFnZXIuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX0VJUC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvYXdzL0FXU19FQzJfSW5zdGFuY2UuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX1NlY3VyaXR5R3JvdXAuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfVXNlcnMuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2RyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZ3VpLnV0aWwuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2xpYi9jb2xsZWN0aW9uL2NvbGxlY3Rpb24uanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2xpYi9jb21wb25lbnQvY29tcG9uZW50LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9saWIvZWxlbWVudC9lbGVtZW50LmRyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2VsZW1lbnQvZWxlbWVudC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2dyb3VwL2dyb3VwLmRyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2dyb3VwL2dyb3VwLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9tZW51LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9waXhpLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvc291cmNlLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL21haW4uanMiLCJhcHAvc2NyaXB0cy90ZXN0RGF0YS9lbXB0eS5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8yNi8xNS5cbiAqL1xuXG52YXIgR3VpVXRpbCA9IHJlcXVpcmUoJy4vZ3VpLnV0aWwnKTtcbnZhciBDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9saWIvY29sbGVjdGlvbi9jb2xsZWN0aW9uJyk7XG52YXIgTWVudSA9IHJlcXVpcmUoJy4vbWVudScpO1xuXG52YXIgQVdTX1VzZXJzID0gcmVxdWlyZSgnLi9hd3MvQVdTX1VzZXJzJyk7XG52YXIgQVdTX0VDMl9JbnN0YW5jZSA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfSW5zdGFuY2UnKTtcbnZhciBBV1NfRUMyX0VJUCA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfRUlQJyk7XG52YXIgQVdTX0VDMl9TZWN1cml0eUdyb3VwID0gcmVxdWlyZSgnLi9hd3MvQVdTX0VDMl9TZWN1cml0eUdyb3VwJyk7XG5cbnZhciBFZGl0b3JNYW5hZ2VyID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdmFyIGZwc1N0YXRzID0gbmV3IFN0YXRzKCk7XG4gIGZwc1N0YXRzLnNldE1vZGUoMCk7XG4gIC8vIGFsaWduIHRvcC1sZWZ0XG4gIGZwc1N0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICBmcHNTdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4JztcbiAgZnBzU3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggZnBzU3RhdHMuZG9tRWxlbWVudCApO1xuXG4gIHZhciBtc1N0YXRzID0gbmV3IFN0YXRzKCk7XG4gIG1zU3RhdHMuc2V0TW9kZSgxKTtcbiAgLy8gYWxpZ24gdG9wLWxlZnRcbiAgbXNTdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgbXNTdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnODBweCc7XG4gIG1zU3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggbXNTdGF0cy5kb21FbGVtZW50ICk7XG5cbiAgdmFyIG1iU3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgbWJTdGF0cy5zZXRNb2RlKDIpO1xuICAvLyBhbGlnbiB0b3AtbGVmdFxuICBtYlN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICBtYlN0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICcxNjBweCc7XG4gIG1iU3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggbWJTdGF0cy5kb21FbGVtZW50ICk7XG5cblxuICBmcHMgPSA2MDtcbiAgdmFyIG5vdztcbiAgdmFyIHRoZW4gPSBEYXRlLm5vdygpO1xuICB2YXIgaW50ZXJ2YWwgPSAxMDAwL2ZwcztcbiAgdmFyIGRlbHRhO1xuICAvL3ZhciBtZXRlciA9IG5ldyBGUFNNZXRlcigpO1xuICB2YXIgd2luRGltZW5zaW9uID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcbiAgdmFyIGdyaWQgPSBudWxsO1xuXG4gIHNlbGYucmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcih3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnksIHtiYWNrZ3JvdW5kQ29sb3IgOiAweEZGRkZGRn0pO1xuXG4gIHNlbGYuc3RhZ2UgPSBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgc2VsZi5zdGFnZS5uYW1lID0gJ3N0YWdlJztcbiAgc2VsZi5zdGFnZS5zZWxlY3RlZCA9IG51bGw7XG4gIHNlbGYuc3RhZ2UuY2xpY2tlZE9ubHlTdGFnZSA9IHRydWU7XG4gIHNlbGYuc3RhZ2UuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICBzZWxmLnN0YWdlLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG4gICAgaWYoc2VsZi5zdGFnZS5jbGlja2VkT25seVN0YWdlKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgc3RhZ2UgY2xpY2snKTtcbiAgICAgIGlmKHNlbGYuc3RhZ2Uuc2VsZWN0ZWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coc2VsZi5zdGFnZS5zZWxlY3RlZCk7XG4gICAgICAgIHNlbGYuc3RhZ2Uuc2VsZWN0ZWQuZmlsdGVycyA9IG51bGw7XG4gICAgICAgIHNlbGYuc3RhZ2Uuc2VsZWN0ZWQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHNlbGYuc3RhZ2UuY2xpY2tlZE9ubHlTdGFnZSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICBzZWxmLnN0YWdlLk1BTkFHRVIgPSBzZWxmO1xuXG4gIHNlbGYuc2VjdXJpdHlncm91cHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuICBzZWxmLmVsZW1lbnRzID0gbmV3IENvbGxlY3Rpb24oKTtcblxuICB2YXIgY29sbGlzaW9ubWFuYWdlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGNvbGxTZWxmID0gdGhpcztcblxuICAgIGNvbGxTZWxmLnNlY0dyb3VwVnNFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlY0dycHMgPSBzZWxmLnNlY3VyaXR5Z3JvdXBzO1xuICAgICAgdmFyIGVsZW1zID0gc2VsZi5lbGVtZW50cztcblxuICAgICAgXy5lYWNoKHNlY0dycHMuZWxlbWVudHMsIGZ1bmN0aW9uKHMpIHtcblxuICAgICAgICBfLmVhY2goZWxlbXMuZWxlbWVudHMsIGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAgIHZhciB4ZGlzdCA9IHMucG9zaXRpb24ueCAtIGUucG9zaXRpb24ueDtcblxuICAgICAgICAgIGlmKHhkaXN0ID4gLXMud2lkdGgvMiAmJiB4ZGlzdCA8IHMud2lkdGgvMilcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YXIgeWRpc3QgPSBzLnBvc2l0aW9uLnkgLSBlLnBvc2l0aW9uLnk7XG5cbiAgICAgICAgICAgIGlmKHlkaXN0ID4gLXMuaGVpZ2h0LzIgJiYgeWRpc3QgPCBzLmhlaWdodC8yKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAvLyAgY29uc29sZS5sb2coJ0NvbGxpc2lvbiBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG5cbiAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIGNvbGxTZWxmLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgY29sbFNlbGYuc2VjR3JvdXBWc0VsZW1lbnRzKCk7XG4gICAgfTtcblxuICB9O1xuXG4gIHNlbGYuQ29sbGlzaW9uTWFuYWdlciA9IG5ldyBjb2xsaXNpb25tYW5hZ2VyKCk7XG5cbiAgc2VsZi5hbmltYXRlID0gZnVuY3Rpb24odGltZSkge1xuXG4gICAgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBkZWx0YSA9IG5vdyAtIHRoZW47XG5cbiAgICBpZiAoZGVsdGEgPiBpbnRlcnZhbCkge1xuICAgICAgZnBzU3RhdHMuYmVnaW4oKTtcbiAgICAgIG1zU3RhdHMuYmVnaW4oKTtcbiAgICAgIG1iU3RhdHMuYmVnaW4oKTtcblxuICAgICAgLy9zZWxmLkNvbGxpc2lvbk1hbmFnZXIudXBkYXRlKCk7XG5cbiAgICAgIHRoZW4gPSBub3cgLSAoZGVsdGEgJSBpbnRlcnZhbCk7XG4gICAgICAvL21ldGVyLnRpY2soKTtcblxuICAgICAgVFdFRU4udXBkYXRlKHRpbWUpO1xuICAgICAgc2VsZi5yZW5kZXJlci5yZW5kZXIoc2VsZi5zdGFnZSk7XG5cbiAgICAgIGZwc1N0YXRzLmVuZCgpO1xuICAgICAgbXNTdGF0cy5lbmQoKTtcbiAgICAgIG1iU3RhdHMuZW5kKCk7XG4gICAgfVxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHNlbGYuYW5pbWF0ZSk7XG4gIH07XG5cbiAgc2VsZi5ncmlkT24gPSBmdW5jdGlvbigpIHtcbiAgICBncmlkID0gR3VpVXRpbC5kcmF3R3JpZCh3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnkpO1xuICAgIHNlbGYuc3RhZ2UuYWRkQ2hpbGQoZ3JpZCk7XG4gIH07XG5cbiAgc2VsZi5ncmlkT2ZmID0gZnVuY3Rpb24oKSB7XG4gICAgc2VsZi5zdGFnZS5yZW1vdmVDaGlsZChncmlkKTtcbiAgICBzZWxmLmdyaWQgPSBudWxsO1xuICB9O1xuXG4gIHNlbGYub25Mb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnQXNzZXRzIGxvYWRlZCcpO1xuXG4gICAgdmFyIGRpbSA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG4gICAgY29uc29sZS5sb2coc2VsZi5lbGVtZW50cy5wb3NpdGlvbik7XG5cbiAgICB2YXIgdXNlcnMgPSBuZXcgQVdTX1VzZXJzKCd1c2VycycsIGRpbS54LzIsIDEwMCk7XG4gICAgY29uc29sZS5sb2codXNlcnMucG9zaXRpb24pO1xuICAgIHNlbGYuZWxlbWVudHMuYWRkKHVzZXJzKTtcblxuICAgIGNvbnNvbGUubG9nKHRlbXBsYXRlLlJlc291cmNlcyk7XG5cbiAgICB2YXIgZ3JvdXBpbmdzID0gXy5yZWR1Y2UodGVtcGxhdGUuUmVzb3VyY2VzLCBmdW5jdGlvbihyZXN1bHQsIG4sIGtleSkge1xuICAgICAgcmVzdWx0W24uVHlwZV0gPSB7fTtcbiAgICAgIHJlc3VsdFtuLlR5cGVdW2tleV0gPSBuO1xuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH0sIHt9KTtcbiAgICBjb25zb2xlLmxvZygnR3JvdXBpbmdzOicpO1xuICAgIGNvbnNvbGUubG9nKGdyb3VwaW5ncyk7XG5cbiAgICB2YXIgaW5zdGFuY2VzID0ge307XG4gICAgXy5lYWNoKGdyb3VwaW5nc1snQVdTOjpFQzI6Okluc3RhbmNlJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgdmFyIGluc3RhbmNlID0gbmV3IEFXU19FQzJfSW5zdGFuY2Uoa2V5LCBkaW0ueC8yLCA0MDApO1xuICAgICAgaW5zdGFuY2VzW2tleV0gPSBpbnN0YW5jZTtcbiAgICB9KTtcblxuICAgIHZhciBlaXBzID0ge307XG4gICAgXy5lYWNoKGdyb3VwaW5nc1snQVdTOjpFQzI6OkVJUCddLCBmdW5jdGlvbihuLCBrZXkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBZGRpbmcgRUlQICcsIGtleSk7XG4gICAgICB2YXIgZWlwID0gbmV3IEFXU19FQzJfRUlQKGtleSwgZGltLngvMiwgNTAwKTtcbiAgICAgIGVpcHNba2V5XSA9IGVpcDtcbiAgICB9KTtcblxuICAgIHZhciBzZWNncm91cHMgPSB7fTtcbiAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6U2VjdXJpdHlHcm91cCddLCBmdW5jdGlvbihuLCBrZXkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBZGRpbmcgU2VjdXJpdHkgR3JvdXAgJywga2V5KTtcbiAgICAgIHZhciBzZWNncm91cCA9IG5ldyBBV1NfRUMyX1NlY3VyaXR5R3JvdXAoa2V5LCBkaW0ueC8yLCA1MDApO1xuICAgICAgc2VjZ3JvdXBzW2tleV0gPSBzZWNncm91cDtcbiAgICB9KTtcblxuICAgIHZhciBjb21ib0luc3RhbmNlcyA9IHt9O1xuICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpFSVBBc3NvY2lhdGlvbiddLCBmdW5jdGlvbihuLCBrZXkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdDaGVja2luZyBhc3NvY2lhdGlvbicpO1xuICAgICAgY29uc29sZS5sb2cobik7XG4gICAgICBjb25zb2xlLmxvZyhrZXkpO1xuICAgICAgY29uc29sZS5sb2coZWlwcyk7XG4gICAgICBjb25zb2xlLmxvZygnUmVmOiAnLG4uUHJvcGVydGllcy5FSVAuUmVmKTtcbiAgICAgIHZhciBpbnN0YW5jZSA9IGluc3RhbmNlc1tuLlByb3BlcnRpZXMuSW5zdGFuY2VJZC5SZWZdO1xuICAgICAgaWYoaW5zdGFuY2UpIHtcbiAgICAgICAgdmFyIGVpcCA9IGVpcHNbbi5Qcm9wZXJ0aWVzLkVJUC5SZWZdO1xuICAgICAgICBpZihlaXApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnQXNzb2NpYXRpb24gaGFzIGEgbWF0Y2ghJyk7XG4gICAgICAgICAgdmFyIGNvbnRhaW5lciA9IG5ldyBDb2xsZWN0aW9uKCk7XG4gICAgICAgICAgY29udGFpbmVyLmFkZChpbnN0YW5jZSk7XG4gICAgICAgICAgY29udGFpbmVyLmFkZChlaXApO1xuICAgICAgICAgIGNvbWJvSW5zdGFuY2VzW2tleV0gPSBjb250YWluZXI7XG4gICAgICAgICAgZGVsZXRlIGluc3RhbmNlc1tuLlByb3BlcnRpZXMuSW5zdGFuY2VJZC5SZWZdO1xuICAgICAgICAgIGRlbGV0ZSBlaXBzW24uUHJvcGVydGllcy5FSVAuUmVmXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy92YXIgZWlwID0gbmV3IEFXU19FQzJfRUlQKGtleSwgZGltLngvMiwgNTAwKTtcbiAgICAgIC8vZWlwc1trZXldID0gZWlwO1xuICAgIH0pO1xuXG4gICAgXy5lYWNoKHNlY2dyb3VwcywgZnVuY3Rpb24ocywga2V5KSB7XG4gICAgICBzZWxmLnNlY3VyaXR5Z3JvdXBzLmFkZChzKTtcbiAgICB9KTtcblxuICAgIF8uZWFjaChjb21ib0luc3RhbmNlcywgZnVuY3Rpb24oY29tYm8sIGtleSkge1xuICAgICAgc2VsZi5lbGVtZW50cy5hZGQoY29tYm8pO1xuICAgIH0pO1xuXG4gICAgXy5lYWNoKGluc3RhbmNlcywgZnVuY3Rpb24oaW5zdGFuY2UsIGtleSkge1xuICAgICAgc2VsZi5lbGVtZW50cy5hZGQoaW5zdGFuY2UpO1xuICAgIH0pO1xuXG4gICAgXy5lYWNoKGVpcHMsIGZ1bmN0aW9uKGVpcCwga2V5KSB7XG4gICAgICBzZWxmLmVsZW1lbnRzLmFkZChlaXApO1xuICAgIH0pO1xuXG4gICAgY29uc29sZS5sb2coJ0NoaWxkcmVuOicpO1xuICAgIGNvbnNvbGUubG9nKHNlbGYuZWxlbWVudHMuY2hpbGRyZW4pO1xuXG4gICAgc2VsZi5zdGFnZS5hZGRDaGlsZChzZWxmLnNlY3VyaXR5Z3JvdXBzKTtcbiAgICBzZWxmLnN0YWdlLmFkZENoaWxkKHNlbGYuZWxlbWVudHMpO1xuICAgIGNvbnNvbGUubG9nKHNlbGYuc3RhZ2UuY2hpbGRyZW4pO1xuXG4gICAgLy92YXIgbWVudSA9IHNlbGYuZHJhd0NvbXBvbmVudE1lbnUoKTtcbiAgICB2YXIgbWVudSA9IG5ldyBNZW51KHNlbGYpO1xuICAgIHNlbGYuc3RhZ2UuYWRkQ2hpbGQobWVudSk7XG4gIH07XG5cbiAgc2VsZi5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgc2VsZi5ncmlkT24oKTtcbiAgICBQSVhJLmxvYWRlclxuICAgICAgLmFkZCgnLi4vcmVzb3VyY2VzL3Nwcml0ZXMvc3ByaXRlcy5qc29uJylcbiAgICAgIC5sb2FkKHNlbGYub25Mb2FkZWQpO1xuICB9O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvck1hbmFnZXI7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2xpYi9lbGVtZW50L2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX0VDMl9FSVAgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi5zY2FsZS5zZXQoMC4zKTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9FbGFzdGljX0lQLnBuZycpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xufTtcbkFXU19FQzJfRUlQLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19FQzJfRUlQO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTkvMTUuXG4gKi9cblxudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuLi9saWIvZWxlbWVudC9lbGVtZW50Jyk7XG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuLi9kcmFnLmRyb3AnKTtcblxudmFyIEFXU19FQzJfSW5zdGFuY2UgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9JbnN0YW5jZS5wbmcnKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxuICBzZWxmLnNlY3VyaXR5R3JvdXAgPSBudWxsO1xufTtcbkFXU19FQzJfSW5zdGFuY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX0VDMl9JbnN0YW5jZTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzIxLzE1LlxuICovXG5cbnZhciBHcm91cCA9IHJlcXVpcmUoJy4uL2xpYi9ncm91cC9ncm91cCcpO1xuXG52YXIgQVdTX0VDMl9TZWN1cml0eUdyb3VwID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgR3JvdXAuY2FsbCh0aGlzKTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYubmFtZSA9IG5hbWU7XG5cbiAgdmFyIGdyYXBoaWMgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICBncmFwaGljLmxpbmVTdHlsZSgzLCAweDAwMDAwMCwgMSk7XG4gIGdyYXBoaWMuYmVnaW5GaWxsKDB4RkZGRkZGLCAwLjApO1xuICBncmFwaGljLmRyYXdSb3VuZGVkUmVjdCgwLDAsMjAwLDIwMCwxMCk7XG4gIGdyYXBoaWMuZW5kRmlsbCgpO1xuXG4gIHNlbGYudGV4dHVyZSA9IGdyYXBoaWMuZ2VuZXJhdGVUZXh0dXJlKCk7XG4gIHNlbGYucG9zaXRpb24ueCA9IHg7XG4gIHNlbGYucG9zaXRpb24ueSA9IHk7XG5cbn07XG5BV1NfRUMyX1NlY3VyaXR5R3JvdXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcm91cC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19FQzJfU2VjdXJpdHlHcm91cDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE5LzE1LlxuICovXG5cbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi4vbGliL2VsZW1lbnQvZWxlbWVudCcpO1xudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi4vZHJhZy5kcm9wJyk7XG5cbnZhciBBV1NfVXNlcnMgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnTm9uLVNlcnZpY2VfU3BlY2lmaWNfY29weV9Vc2Vycy5wbmcnKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxufTtcbkFXU19Vc2Vycy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfVXNlcnM7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xNC8xNS5cbiAqL1xuXG52YXIgTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyA9IDEuMTtcblxudmFyIERyYWdEcm9wID0ge1xuXG4gIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCk7XG4gICAgdGhpcy5kYXRhID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLmFscGhhID0gMC41O1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICAgIHRoaXMubW92ZWQgPSBmYWxzZTtcbiAgfSxcblxuICBvbkRyYWdFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZih0aGlzLm1vdmVkKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgZHJhZ2dpbmcnKTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5kYXRhID0gbnVsbDtcblxuICAgICAgaWYoIXRoaXMuc2VjdXJpdHlHcm91cCkge1xuXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnUGFyZW50Jyk7XG4gICAgICAgIC8vY29uc29sZS5sb2coc2VsZi5wYXJlbnQucGFyZW50Lk1BTkFHRVIpO1xuICAgICAgICAgIHZhciBzZWNHcnBzID0gc2VsZi5wYXJlbnQucGFyZW50Lk1BTkFHRVIuc2VjdXJpdHlncm91cHM7XG5cbiAgICAgICAgICBfLmVhY2goc2VjR3Jwcy5lbGVtZW50cywgZnVuY3Rpb24ocykge1xuXG4gICAgICAgICAgICAgIHZhciB4ZGlzdCA9IHMucG9zaXRpb24ueCAtIHNlbGYucG9zaXRpb24ueDtcblxuICAgICAgICAgICAgICBpZih4ZGlzdCA+IC1zLndpZHRoLzIgJiYgeGRpc3QgPCBzLndpZHRoLzIpXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgeWRpc3QgPSBzLnBvc2l0aW9uLnkgLSBzZWxmLnBvc2l0aW9uLnk7XG5cbiAgICAgICAgICAgICAgICBpZih5ZGlzdCA+IC1zLmhlaWdodC8yICYmIHlkaXN0IDwgcy5oZWlnaHQvMilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb2xsaXNpb24gZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICAgICAgICBzZWxmLnBvc2l0aW9uLnggPSAwO1xuICAgICAgICAgICAgICAgICAgc2VsZi5wb3NpdGlvbi55ID0gMDtcbiAgICAgICAgICAgICAgICAgIHNlbGYuc2VjdXJpdHlHcm91cCA9IHM7XG4gICAgICAgICAgICAgICAgICAgIHMuYWRkQ2hpbGQoc2VsZik7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzZWxmKTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSk7XG5cbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgTk9UIGRyYWdnaW5nJyk7XG4gICAgICB2YXIgc2hhZG93ID0gbmV3IFBJWEkuZmlsdGVycy5Ecm9wU2hhZG93RmlsdGVyKCk7XG4gICAgICB0aGlzLmZpbHRlcnMgPSBbc2hhZG93XTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgY29uc29sZS5sb2coJ1BhcmVudDonKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMucGFyZW50LnBhcmVudCk7XG4gICAgICBpZih0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkLmZpbHRlcnMgPSBudWxsO1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LmNsaWNrZWRPbmx5U3RhZ2UgPSBmYWxzZTtcbiAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IHRoaXM7XG4gICAgfVxuICB9LFxuXG4gIG9uRHJhZ01vdmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5kcmFnZ2luZylcbiAgICB7XG4gICAgICB2YXIgbmV3UG9zaXRpb24gPSBzZWxmLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbihzZWxmLnBhcmVudCk7XG4gICAgICBzZWxmLnBvc2l0aW9uLnggPSBuZXdQb3NpdGlvbi54O1xuICAgICAgc2VsZi5wb3NpdGlvbi55ID0gbmV3UG9zaXRpb24ueTtcbiAgICAgIHNlbGYubW92ZWQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG92ZXIhJyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueCpNT1VTRV9PVkVSX1NDQUxFX1JBVElPKTtcbiAgICB2YXIgaWNvblNpemUgPSAxMDtcblxuICAgIHZhciBnbG9iYWwgPSBzZWxmLnRvR2xvYmFsKHNlbGYucG9zaXRpb24pO1xuICAgIC8vY29uc29sZS5sb2coJ29mZmljaWFsOiAnICsgc2VsZi5wb3NpdGlvbi54ICsgJzonICsgc2VsZi5wb3NpdGlvbi55KTtcbiAgICAvL2NvbnNvbGUubG9nKCdHTE9CQUw6ICcgKyBnbG9iYWwueCArICc6JyArIGdsb2JhbC55KTtcbiAgICAvL2NvbnNvbGUubG9nKHNlbGYuZ2V0TG9jYWxCb3VuZHMoKSk7XG5cbiAgICB2YXIgc2NhbGVMb2NhdGlvbnMgPSBbXG4gICAgICB7eDogMCwgeTogMC1zZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzItaWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAtc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzItaWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aC8yK2ljb25TaXplLzIsIHk6IDAsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiAwLCB5OiBzZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzIraWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9XG4gICAgXTtcblxuICAgIC8vY29uc29sZS5sb2coc2NhbGVMb2NhdGlvbnNbMF0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zID0gW107XG5cbiAgICBzY2FsZUxvY2F0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGxvYykge1xuICAgICAgdmFyIGljb24gPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgICAgaWNvbi5tb3ZlVG8oMCwwKTtcbiAgICAgIGljb24uaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgaWNvbi5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICAgIGljb24ubGluZVN0eWxlKDEsIDB4MDAwMEZGLCAxKTtcbiAgICAgIGljb24uYmVnaW5GaWxsKDB4RkZGRkZGLCAxKTtcbiAgICAgIGljb24uZHJhd0NpcmNsZShsb2MueCwgbG9jLnksIGxvYy5zaXplKTtcbiAgICAgIGljb24uZW5kRmlsbCgpO1xuXG4gICAgICAvL2ljb25cbiAgICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgICAgIC8vLm9uKCdtb3VzZWRvd24nLCBvblNjYWxlSWNvbkRyYWdTdGFydClcbiAgICAgICAgLy8ub24oJ3RvdWNoc3RhcnQnLCBvblNjYWxlSWNvbkRyYWdTdGFydCk7XG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgICAvLy5vbignbW91c2V1cCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCdtb3VzZXVwb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgICAgLy8ub24oJ21vdXNlbW92ZScsIG9uRHJhZ01vdmUpXG4gICAgICAvLy5vbigndG91Y2htb3ZlJywgb25EcmFnTW92ZSlcblxuICAgICAgc2VsZi5zY2FsZUljb25zLnB1c2goaWNvbik7XG5cbiAgICB9KTtcblxuICAgIHNlbGYuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYuYWRkQ2hpbGQocyk7XG4gICAgfSk7XG5cbiAgICBzZWxmLnRvb2x0aXAgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHNlbGYudG9vbHRpcC5saW5lU3R5bGUoMywgMHgwMDAwRkYsIDEpO1xuICAgIHNlbGYudG9vbHRpcC5iZWdpbkZpbGwoMHgwMDAwMDAsIDEpO1xuICAgIC8vc2VsZi5kcmF3Lm1vdmVUbyh4LHkpO1xuICAgIHNlbGYudG9vbHRpcC5kcmF3Um91bmRlZFJlY3QoMCsyMCwtc2VsZi5oZWlnaHQsMjAwLDEwMCwxMCk7XG4gICAgc2VsZi50b29sdGlwLmVuZEZpbGwoKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dFN0eWxlID0ge1xuICAgICAgZm9udCA6ICdib2xkIGl0YWxpYyAyOHB4IEFyaWFsJyxcbiAgICAgIGZpbGwgOiAnI0Y3RURDQScsXG4gICAgICBzdHJva2UgOiAnIzRhMTg1MCcsXG4gICAgICBzdHJva2VUaGlja25lc3MgOiA1LFxuICAgICAgZHJvcFNoYWRvdyA6IHRydWUsXG4gICAgICBkcm9wU2hhZG93Q29sb3IgOiAnIzAwMDAwMCcsXG4gICAgICBkcm9wU2hhZG93QW5nbGUgOiBNYXRoLlBJIC8gNixcbiAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZSA6IDYsXG4gICAgICB3b3JkV3JhcCA6IHRydWUsXG4gICAgICB3b3JkV3JhcFdpZHRoIDogNDQwXG4gICAgfTtcblxuICAgIHNlbGYudG9vbHRpcC50ZXh0ID0gbmV3IFBJWEkuVGV4dChzZWxmLm5hbWUsc2VsZi50b29sdGlwLnRleHRTdHlsZSk7XG4gICAgc2VsZi50b29sdGlwLnRleHQueCA9IDArMzA7XG4gICAgc2VsZi50b29sdGlwLnRleHQueSA9IC1zZWxmLmhlaWdodDtcblxuICAgIG5ldyBUV0VFTi5Ud2VlbihzZWxmLnRvb2x0aXApXG4gICAgICAudG8oe3g6c2VsZi53aWR0aH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcC50ZXh0KVxuICAgICAgLnRvKHt4OnNlbGYud2lkdGgrMjB9LDcwMClcbiAgICAgIC5lYXNpbmcoIFRXRUVOLkVhc2luZy5FbGFzdGljLkluT3V0IClcbiAgICAgIC5zdGFydCgpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyB0b29sdGlwJyk7XG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXApO1xuXG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXAudGV4dCk7XG4gIH0sXG5cbiAgb25Nb3VzZU91dDogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG91dCEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54L01PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlIG91dCcpO1xuICAgIHRoaXMuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2hpbGQocyk7XG4gICAgfSk7XG4gICAgLy9jb25zb2xlLmxvZygnU2l6ZTogJyk7XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmdldEJvdW5kcygpKTtcblxuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwKTtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvblNjYWxlSWNvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIScpO1xuICB9XG5cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEcmFnRHJvcDtcblxuIiwiXG52YXIgR3VpVXRpbCA9IHtcblxuICBnZXRXaW5kb3dEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7IHg6IHdpbmRvdy5pbm5lcldpZHRoLCB5OiB3aW5kb3cuaW5uZXJIZWlnaHQgfTtcbiAgfSxcblxuICBkcmF3R3JpZDogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgIHZhciBncmlkID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICB2YXIgaW50ZXJ2YWwgPSAxMDA7XG4gICAgdmFyIGNvdW50ID0gaW50ZXJ2YWw7XG4gICAgZ3JpZC5saW5lU3R5bGUoMSwgMHhFNUU1RTUsIDEpO1xuICAgIHdoaWxlIChjb3VudCA8IHdpZHRoKSB7XG4gICAgICBncmlkLm1vdmVUbyhjb3VudCwgMCk7XG4gICAgICBncmlkLmxpbmVUbyhjb3VudCwgaGVpZ2h0KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgY291bnQgPSBpbnRlcnZhbDtcbiAgICB3aGlsZShjb3VudCA8IGhlaWdodCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oMCwgY291bnQpO1xuICAgICAgZ3JpZC5saW5lVG8od2lkdGgsIGNvdW50KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgdmFyIGNvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICAgIGNvbnRhaW5lci5hZGRDaGlsZChncmlkKTtcbiAgICBjb250YWluZXIuY2FjaGVBc0JpdG1hcCA9IHRydWU7XG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEd1aVV0aWw7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMjEvMTUuXG4gKi9cbi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8xNS8xNS5cbiAqL1xuXG52YXIgQ29sbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBQSVhJLkNvbnRhaW5lci5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5lbGVtZW50cyA9IHt9O1xuXG4gIHNlbGYuYWRkID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHNlbGYuYWRkQ2hpbGQoZWxlbWVudCk7XG4gICAgc2VsZi5lbGVtZW50c1tlbGVtZW50Lm5hbWVdID0gZWxlbWVudDtcbiAgfTtcblxuICBzZWxmLnJlbW92ZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICAgIGRlbGV0ZSBzZWxmLmVsZW1lbnRzW2VsZW1lbnQubmFtZV07XG4gIH07XG5cbn07XG5Db2xsZWN0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUElYSS5Db250YWluZXIucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzE1LzE1LlxuICovXG5cbnZhciBDb21wb25lbnQgPSBmdW5jdGlvbigpIHtcbiAgUElYSS5TcHJpdGUuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuYW5jaG9yLnNldCgwLjUpO1xuICBzZWxmLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgc2VsZi5idXR0b25Nb2RlID0gdHJ1ZTtcblxufTtcbkNvbXBvbmVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBJWEkuU3ByaXRlLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50O1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTQvMTUuXG4gKi9cblxudmFyIE1PVVNFX09WRVJfU0NBTEVfUkFUSU8gPSAxLjE7XG5cbnZhciBFbGVtZW50RHJhZ0Ryb3AgPSB7XG5cbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coKTtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmKHRoaXMubW92ZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBkcmFnZ2luZycpO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gICAgICB0aGlzLmRhdGEgPSBudWxsO1xuXG4gICAgICBpZighdGhpcy5zZWN1cml0eUdyb3VwKSB7XG5cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdQYXJlbnQnKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzZWxmLnBhcmVudC5wYXJlbnQuTUFOQUdFUik7XG4gICAgICAgICAgdmFyIHNlY0dycHMgPSBzZWxmLnBhcmVudC5wYXJlbnQuTUFOQUdFUi5zZWN1cml0eWdyb3VwcztcblxuICAgICAgICAgIF8uZWFjaChzZWNHcnBzLmVsZW1lbnRzLCBmdW5jdGlvbihzKSB7XG5cbiAgICAgICAgICAgICAgdmFyIHhkaXN0ID0gcy5wb3NpdGlvbi54IC0gc2VsZi5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgICAgIGlmKHhkaXN0ID4gLXMud2lkdGgvMiAmJiB4ZGlzdCA8IHMud2lkdGgvMilcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciB5ZGlzdCA9IHMucG9zaXRpb24ueSAtIHNlbGYucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgICAgIGlmKHlkaXN0ID4gLXMuaGVpZ2h0LzIgJiYgeWRpc3QgPCBzLmhlaWdodC8yKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NvbGxpc2lvbiBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb24ueCA9IDA7XG4gICAgICAgICAgICAgICAgICBzZWxmLnBvc2l0aW9uLnkgPSAwO1xuICAgICAgICAgICAgICAgICAgc2VsZi5zZWN1cml0eUdyb3VwID0gcztcbiAgICAgICAgICAgICAgICAgICAgcy5hZGRDaGlsZChzZWxmKTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBOT1QgZHJhZ2dpbmcnKTtcbiAgICAgIHZhciBzaGFkb3cgPSBuZXcgUElYSS5maWx0ZXJzLkRyb3BTaGFkb3dGaWx0ZXIoKTtcbiAgICAgIHRoaXMuZmlsdGVycyA9IFtzaGFkb3ddO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICBjb25zb2xlLmxvZygnUGFyZW50OicpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5wYXJlbnQucGFyZW50KTtcbiAgICAgIGlmKHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCkge1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQuZmlsdGVycyA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcmVudC5wYXJlbnQuY2xpY2tlZE9ubHlTdGFnZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkID0gdGhpcztcbiAgICB9XG4gIH0sXG5cbiAgb25EcmFnTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLmRyYWdnaW5nKVxuICAgIHtcbiAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHNlbGYuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHNlbGYucGFyZW50KTtcbiAgICAgIHNlbGYucG9zaXRpb24ueCA9IG5ld1Bvc2l0aW9uLng7XG4gICAgICBzZWxmLnBvc2l0aW9uLnkgPSBuZXdQb3NpdGlvbi55O1xuICAgICAgc2VsZi5tb3ZlZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG4gIG9uTW91c2VPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3ZlciEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54Kk1PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuICAgIHZhciBpY29uU2l6ZSA9IDEwO1xuXG4gICAgdmFyIGdsb2JhbCA9IHNlbGYudG9HbG9iYWwoc2VsZi5wb3NpdGlvbik7XG5cbiAgICB2YXIgc2NhbGVMb2NhdGlvbnMgPSBbXG4gICAgICB7eDogMCwgeTogMC1zZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzItaWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAtc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzItaWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aC8yK2ljb25TaXplLzIsIHk6IDAsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiAwLCB5OiBzZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzIraWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9XG4gICAgXTtcblxuICAgIC8vY29uc29sZS5sb2coc2NhbGVMb2NhdGlvbnNbMF0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zID0gW107XG5cbiAgICBzY2FsZUxvY2F0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGxvYykge1xuICAgICAgdmFyIGljb24gPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgICAgaWNvbi5tb3ZlVG8oMCwwKTtcbiAgICAgIGljb24uaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgaWNvbi5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICAgIGljb24ubGluZVN0eWxlKDEsIDB4MDAwMEZGLCAxKTtcbiAgICAgIGljb24uYmVnaW5GaWxsKDB4RkZGRkZGLCAxKTtcbiAgICAgIGljb24uZHJhd0NpcmNsZShsb2MueCwgbG9jLnksIGxvYy5zaXplKTtcbiAgICAgIGljb24uZW5kRmlsbCgpO1xuXG4gICAgICAvL2ljb25cbiAgICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgICAgIC8vLm9uKCdtb3VzZWRvd24nLCBvblNjYWxlSWNvbkRyYWdTdGFydClcbiAgICAgICAgLy8ub24oJ3RvdWNoc3RhcnQnLCBvblNjYWxlSWNvbkRyYWdTdGFydCk7XG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgICAvLy5vbignbW91c2V1cCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCdtb3VzZXVwb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgICAgLy8ub24oJ21vdXNlbW92ZScsIG9uRHJhZ01vdmUpXG4gICAgICAvLy5vbigndG91Y2htb3ZlJywgb25EcmFnTW92ZSlcblxuICAgICAgc2VsZi5zY2FsZUljb25zLnB1c2goaWNvbik7XG5cbiAgICB9KTtcblxuICAgIHNlbGYuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYuYWRkQ2hpbGQocyk7XG4gICAgfSk7XG5cbiAgICBzZWxmLnRvb2x0aXAgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHNlbGYudG9vbHRpcC5saW5lU3R5bGUoMywgMHgwMDAwRkYsIDEpO1xuICAgIHNlbGYudG9vbHRpcC5iZWdpbkZpbGwoMHgwMDAwMDAsIDEpO1xuICAgIC8vc2VsZi5kcmF3Lm1vdmVUbyh4LHkpO1xuICAgIHNlbGYudG9vbHRpcC5kcmF3Um91bmRlZFJlY3QoMCsyMCwtc2VsZi5oZWlnaHQsMjAwLDEwMCwxMCk7XG4gICAgc2VsZi50b29sdGlwLmVuZEZpbGwoKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dFN0eWxlID0ge1xuICAgICAgZm9udCA6ICdib2xkIGl0YWxpYyAyOHB4IEFyaWFsJyxcbiAgICAgIGZpbGwgOiAnI0Y3RURDQScsXG4gICAgICBzdHJva2UgOiAnIzRhMTg1MCcsXG4gICAgICBzdHJva2VUaGlja25lc3MgOiA1LFxuICAgICAgZHJvcFNoYWRvdyA6IHRydWUsXG4gICAgICBkcm9wU2hhZG93Q29sb3IgOiAnIzAwMDAwMCcsXG4gICAgICBkcm9wU2hhZG93QW5nbGUgOiBNYXRoLlBJIC8gNixcbiAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZSA6IDYsXG4gICAgICB3b3JkV3JhcCA6IHRydWUsXG4gICAgICB3b3JkV3JhcFdpZHRoIDogNDQwXG4gICAgfTtcblxuICAgIHNlbGYudG9vbHRpcC50ZXh0ID0gbmV3IFBJWEkuVGV4dChzZWxmLm5hbWUsc2VsZi50b29sdGlwLnRleHRTdHlsZSk7XG4gICAgc2VsZi50b29sdGlwLnRleHQueCA9IDArMzA7XG4gICAgc2VsZi50b29sdGlwLnRleHQueSA9IC1zZWxmLmhlaWdodDtcblxuICAgIG5ldyBUV0VFTi5Ud2VlbihzZWxmLnRvb2x0aXApXG4gICAgICAudG8oe3g6c2VsZi53aWR0aH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcC50ZXh0KVxuICAgICAgLnRvKHt4OnNlbGYud2lkdGgrMjB9LDcwMClcbiAgICAgIC5lYXNpbmcoIFRXRUVOLkVhc2luZy5FbGFzdGljLkluT3V0IClcbiAgICAgIC5zdGFydCgpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyB0b29sdGlwJyk7XG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXApO1xuXG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXAudGV4dCk7XG4gIH0sXG5cbiAgb25Nb3VzZU91dDogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG91dCEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54L01PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlIG91dCcpO1xuICAgIHRoaXMuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2hpbGQocyk7XG4gICAgfSk7XG4gICAgLy9jb25zb2xlLmxvZygnU2l6ZTogJyk7XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmdldEJvdW5kcygpKTtcblxuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwKTtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvblNjYWxlSWNvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIScpO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWxlbWVudERyYWdEcm9wO1xuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudC9jb21wb25lbnQnKTtcbnZhciBFbGVtZW50RHJhZ0Ryb3AgPSByZXF1aXJlKCcuL2VsZW1lbnQuZHJhZy5kcm9wJyk7XG5cbnZhciBERUZBVUxUX1NDQUxFID0gMC43O1xuXG52YXIgRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuICBDb21wb25lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuc2NhbGUuc2V0KERFRkFVTFRfU0NBTEUpO1xuICBzZWxmXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgLm9uKCdtb3VzZWRvd24nLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgLm9uKCd0b3VjaHN0YXJ0JywgRWxlbWVudERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAub24oJ21vdXNldXAnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbignbW91c2V1cG91dHNpZGUnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbigndG91Y2hlbmQnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbigndG91Y2hlbmRvdXRzaWRlJywgRWxlbWVudERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgIC5vbignbW91c2Vtb3ZlJywgRWxlbWVudERyYWdEcm9wLm9uRHJhZ01vdmUpXG4gICAgLm9uKCd0b3VjaG1vdmUnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAvLyBldmVudHMgZm9yIG1vdXNlIG92ZXJcbiAgICAub24oJ21vdXNlb3ZlcicsIEVsZW1lbnREcmFnRHJvcC5vbk1vdXNlT3ZlcilcbiAgICAub24oJ21vdXNlb3V0JywgRWxlbWVudERyYWdEcm9wLm9uTW91c2VPdXQpO1xuXG4gIHNlbGYuYXJyb3dzID0gW107XG5cbiAgc2VsZi5hZGRBcnJvd1RvID0gZnVuY3Rpb24oYikge1xuICAgIHNlbGYuYXJyb3dzLnB1c2goYik7XG4gIH07XG5cbiAgc2VsZi5yZW1vdmVBcnJvd1RvID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBzZWxmLmFycm93cy5yZW1vdmUoaW5kZXgpO1xuICB9O1xuXG59O1xuRWxlbWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbXBvbmVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnQ7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xNC8xNS5cbiAqL1xuXG52YXIgTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyA9IDEuMTtcblxudmFyIERyYWdEcm9wID0ge1xuXG4gIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCk7XG4gICAgdGhpcy5kYXRhID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLmFscGhhID0gMC41O1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICAgIHRoaXMubW92ZWQgPSBmYWxzZTtcbiAgfSxcblxuICBvbkRyYWdFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZih0aGlzLm1vdmVkKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgZHJhZ2dpbmcnKTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgTk9UIGRyYWdnaW5nJyk7XG4gICAgICB2YXIgc2hhZG93ID0gbmV3IFBJWEkuZmlsdGVycy5Ecm9wU2hhZG93RmlsdGVyKCk7XG4gICAgICB0aGlzLmZpbHRlcnMgPSBbc2hhZG93XTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgY29uc29sZS5sb2coJ1BhcmVudDonKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMucGFyZW50LnBhcmVudCk7XG4gICAgICBpZih0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkLmZpbHRlcnMgPSBudWxsO1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LmNsaWNrZWRPbmx5U3RhZ2UgPSBmYWxzZTtcbiAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IHRoaXM7XG4gICAgfVxuICB9LFxuXG4gIG9uRHJhZ01vdmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5kcmFnZ2luZylcbiAgICB7XG4gICAgICB2YXIgbmV3UG9zaXRpb24gPSBzZWxmLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbihzZWxmLnBhcmVudCk7XG4gICAgICBzZWxmLnBvc2l0aW9uLnggPSBuZXdQb3NpdGlvbi54O1xuICAgICAgc2VsZi5wb3NpdGlvbi55ID0gbmV3UG9zaXRpb24ueTtcbiAgICAgIHNlbGYubW92ZWQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG92ZXIhJyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueCpNT1VTRV9PVkVSX1NDQUxFX1JBVElPKTtcbiAgICB2YXIgaWNvblNpemUgPSAxMDtcblxuICAgIHZhciBnbG9iYWwgPSBzZWxmLnRvR2xvYmFsKHNlbGYucG9zaXRpb24pO1xuICAgIC8vY29uc29sZS5sb2coJ29mZmljaWFsOiAnICsgc2VsZi5wb3NpdGlvbi54ICsgJzonICsgc2VsZi5wb3NpdGlvbi55KTtcbiAgICAvL2NvbnNvbGUubG9nKCdHTE9CQUw6ICcgKyBnbG9iYWwueCArICc6JyArIGdsb2JhbC55KTtcbiAgICAvL2NvbnNvbGUubG9nKHNlbGYuZ2V0TG9jYWxCb3VuZHMoKSk7XG5cbiAgICB2YXIgc2NhbGVMb2NhdGlvbnMgPSBbXG4gICAgICB7eDogMCwgeTogMC1zZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzItaWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAtc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzItaWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aC8yK2ljb25TaXplLzIsIHk6IDAsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiAwLCB5OiBzZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzIraWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9XG4gICAgXTtcblxuICAgIC8vY29uc29sZS5sb2coc2NhbGVMb2NhdGlvbnNbMF0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zID0gW107XG5cbiAgICBzY2FsZUxvY2F0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGxvYykge1xuICAgICAgdmFyIGljb24gPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgICAgaWNvbi5tb3ZlVG8oMCwwKTtcbiAgICAgIGljb24uaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgaWNvbi5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICAgIGljb24ubGluZVN0eWxlKDEsIDB4MDAwMEZGLCAxKTtcbiAgICAgIGljb24uYmVnaW5GaWxsKDB4RkZGRkZGLCAxKTtcbiAgICAgIGljb24uZHJhd0NpcmNsZShsb2MueCwgbG9jLnksIGxvYy5zaXplKTtcbiAgICAgIGljb24uZW5kRmlsbCgpO1xuXG4gICAgICAvL2ljb25cbiAgICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgICAgIC8vLm9uKCdtb3VzZWRvd24nLCBvblNjYWxlSWNvbkRyYWdTdGFydClcbiAgICAgICAgLy8ub24oJ3RvdWNoc3RhcnQnLCBvblNjYWxlSWNvbkRyYWdTdGFydCk7XG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgICAvLy5vbignbW91c2V1cCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCdtb3VzZXVwb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgICAgLy8ub24oJ21vdXNlbW92ZScsIG9uRHJhZ01vdmUpXG4gICAgICAvLy5vbigndG91Y2htb3ZlJywgb25EcmFnTW92ZSlcblxuICAgICAgc2VsZi5zY2FsZUljb25zLnB1c2goaWNvbik7XG5cbiAgICB9KTtcblxuICAgIHNlbGYuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYuYWRkQ2hpbGQocyk7XG4gICAgfSk7XG5cbiAgICBzZWxmLnRvb2x0aXAgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHNlbGYudG9vbHRpcC5saW5lU3R5bGUoMywgMHgwMDAwRkYsIDEpO1xuICAgIHNlbGYudG9vbHRpcC5iZWdpbkZpbGwoMHgwMDAwMDAsIDEpO1xuICAgIC8vc2VsZi5kcmF3Lm1vdmVUbyh4LHkpO1xuICAgIHNlbGYudG9vbHRpcC5kcmF3Um91bmRlZFJlY3QoMCsyMCwtc2VsZi5oZWlnaHQsMjAwLDEwMCwxMCk7XG4gICAgc2VsZi50b29sdGlwLmVuZEZpbGwoKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dFN0eWxlID0ge1xuICAgICAgZm9udCA6ICdib2xkIGl0YWxpYyAyOHB4IEFyaWFsJyxcbiAgICAgIGZpbGwgOiAnI0Y3RURDQScsXG4gICAgICBzdHJva2UgOiAnIzRhMTg1MCcsXG4gICAgICBzdHJva2VUaGlja25lc3MgOiA1LFxuICAgICAgZHJvcFNoYWRvdyA6IHRydWUsXG4gICAgICBkcm9wU2hhZG93Q29sb3IgOiAnIzAwMDAwMCcsXG4gICAgICBkcm9wU2hhZG93QW5nbGUgOiBNYXRoLlBJIC8gNixcbiAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZSA6IDYsXG4gICAgICB3b3JkV3JhcCA6IHRydWUsXG4gICAgICB3b3JkV3JhcFdpZHRoIDogNDQwXG4gICAgfTtcblxuICAgIHNlbGYudG9vbHRpcC50ZXh0ID0gbmV3IFBJWEkuVGV4dChzZWxmLm5hbWUsc2VsZi50b29sdGlwLnRleHRTdHlsZSk7XG4gICAgc2VsZi50b29sdGlwLnRleHQueCA9IDArMzA7XG4gICAgc2VsZi50b29sdGlwLnRleHQueSA9IC1zZWxmLmhlaWdodDtcblxuICAgIG5ldyBUV0VFTi5Ud2VlbihzZWxmLnRvb2x0aXApXG4gICAgICAudG8oe3g6c2VsZi53aWR0aH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcC50ZXh0KVxuICAgICAgLnRvKHt4OnNlbGYud2lkdGgrMjB9LDcwMClcbiAgICAgIC5lYXNpbmcoIFRXRUVOLkVhc2luZy5FbGFzdGljLkluT3V0IClcbiAgICAgIC5zdGFydCgpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyB0b29sdGlwJyk7XG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXApO1xuXG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXAudGV4dCk7XG4gIH0sXG5cbiAgb25Nb3VzZU91dDogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG91dCEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54L01PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlIG91dCcpO1xuICAgIHRoaXMuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2hpbGQocyk7XG4gICAgfSk7XG4gICAgLy9jb25zb2xlLmxvZygnU2l6ZTogJyk7XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmdldEJvdW5kcygpKTtcblxuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwKTtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvblNjYWxlSWNvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIScpO1xuICB9XG5cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEcmFnRHJvcDtcblxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzE1LzE1LlxuICovXG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9jb21wb25lbnQvY29tcG9uZW50Jyk7XG52YXIgR3JvdXBEcmFnRHJvcCA9IHJlcXVpcmUoJy4vZ3JvdXAuZHJhZy5kcm9wJyk7XG5cbnZhciBERUZBVUxUX1NDQUxFID0gMC43O1xuXG52YXIgR3JvdXAgPSBmdW5jdGlvbigpIHtcbiAgQ29tcG9uZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLnNjYWxlLnNldChERUZBVUxUX1NDQUxFKTtcbiAgc2VsZi5hbmNob3Iuc2V0KDAuNSk7XG4gIHNlbGYuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICBzZWxmLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICBzZWxmXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgLm9uKCdtb3VzZWRvd24nLCBHcm91cERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC5vbigndG91Y2hzdGFydCcsIEdyb3VwRHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIGVuZFxuICAgIC5vbignbW91c2V1cCcsIEdyb3VwRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbignbW91c2V1cG91dHNpZGUnLCBHcm91cERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ3RvdWNoZW5kJywgR3JvdXBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBHcm91cERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgIC5vbignbW91c2Vtb3ZlJywgR3JvdXBEcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgIC5vbigndG91Y2htb3ZlJywgR3JvdXBEcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgIC8vIGV2ZW50cyBmb3IgbW91c2Ugb3ZlclxuICAgIC5vbignbW91c2VvdmVyJywgR3JvdXBEcmFnRHJvcC5vbk1vdXNlT3ZlcilcbiAgICAub24oJ21vdXNlb3V0JywgR3JvdXBEcmFnRHJvcC5vbk1vdXNlT3V0KTtcblxuICBzZWxmLmFycm93cyA9IFtdO1xuXG4gIHNlbGYuYWRkQXJyb3dUbyA9IGZ1bmN0aW9uKGIpIHtcbiAgICBzZWxmLmFycm93cy5wdXNoKGIpO1xuICB9O1xuXG4gIHNlbGYucmVtb3ZlQXJyb3dUbyA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgc2VsZi5hcnJvd3MucmVtb3ZlKGluZGV4KTtcbiAgfTtcblxufTtcbkdyb3VwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JvdXA7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8zMC8xNS5cbiAqL1xuXG52YXIgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vbGliL2NvbGxlY3Rpb24vY29sbGVjdGlvbicpO1xudmFyIEd1aVV0aWwgPSByZXF1aXJlKCcuL2d1aS51dGlsJyk7XG52YXIgQVdTX0VDMl9JbnN0YW5jZSA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfSW5zdGFuY2UnKTtcbnZhciBBV1NfRUMyX0VJUCA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfRUlQJyk7XG52YXIgQVdTX0VDMl9TZWN1cml0eUdyb3VwID0gcmVxdWlyZSgnLi9hd3MvQVdTX0VDMl9TZWN1cml0eUdyb3VwJyk7XG5cbmZ1bmN0aW9uIGJ1aWxkTWVudUNvbXBvbmVudCh4LHksIHRleHR1cmUsIHNjYWxlLCBtb3VzZVVwQ2FsbGJhY2spIHtcbiAgdmFyIG1lbnVDb21wb25lbnQgPSBuZXcgUElYSS5TcHJpdGUoKTtcbiAgbWVudUNvbXBvbmVudC50ZXh0dXJlID0gdGV4dHVyZTtcbiAgbWVudUNvbXBvbmVudC5zY2FsZS5zZXQoc2NhbGUpO1xuICBtZW51Q29tcG9uZW50LnggPSB4O1xuICBtZW51Q29tcG9uZW50LnkgPSB5O1xuICBtZW51Q29tcG9uZW50LmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgbWVudUNvbXBvbmVudC5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgbWVudUNvbXBvbmVudC5hbmNob3Iuc2V0KDAuNSk7XG4gIG1lbnVDb21wb25lbnRcbiAgICAub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54KjEuMik7XG4gICAgfSlcbiAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvMS4yKTtcbiAgICB9KVxuICAgIC5vbignbW91c2V1cCcsIG1vdXNlVXBDYWxsYmFjayk7XG4gIHJldHVybiBtZW51Q29tcG9uZW50O1xufVxuXG52YXIgTWVudSA9IGZ1bmN0aW9uKG1hbmFnZXIpIHtcbiAgQ29sbGVjdGlvbi5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYuTUFOQUdFUiA9IG1hbmFnZXI7XG4gIHNlbGYubWVudSA9IHt9O1xuXG4gIHZhciBkaW0gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuXG4gIHZhciB4b2Zmc2V0ID0gZGltLngtNDA7XG4gIHZhciB5b2Zmc2V0ID0gZGltLnkvMjtcblxuXG4gIHNlbGYubWVudS5pbnN0YW5jZSA9IGJ1aWxkTWVudUNvbXBvbmVudCh4b2Zmc2V0LCB5b2Zmc2V0LCBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCdDb21wdXRlXyZfTmV0d29ya2luZ19BbWF6b25fRUMyX0luc3RhbmNlLnBuZycpLCAwLjIsXG4gICAgZnVuY3Rpb24oKSB7XG4gICAgICBzZWxmLk1BTkFHRVIuZWxlbWVudHMuYWRkKG5ldyBBV1NfRUMyX0luc3RhbmNlKCdOZXdfSW5zdGFuY2UnLCBkaW0ueC8yLCBkaW0ueS8yKSk7XG4gICAgfSk7XG5cbiAgc2VsZi5hZGQoc2VsZi5tZW51Lmluc3RhbmNlKTtcblxuICB2YXIgc2VjR3JwR3JhcGhpYyA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gIHNlY0dycEdyYXBoaWMubGluZVN0eWxlKDMsIDB4MDAwMDAwLCAxKTtcbiAgc2VjR3JwR3JhcGhpYy5iZWdpbkZpbGwoMHhGRkZGRkYsIDEpO1xuICBzZWNHcnBHcmFwaGljLmRyYXdSb3VuZGVkUmVjdCgwLDAsMzAsMzAsNik7XG4gIHNlY0dycEdyYXBoaWMuZW5kRmlsbCgpO1xuXG4gIHNlbGYubWVudS5zZWNncnAgPSBidWlsZE1lbnVDb21wb25lbnQoeG9mZnNldCwgeW9mZnNldCs0MCwgc2VjR3JwR3JhcGhpYy5nZW5lcmF0ZVRleHR1cmUoKSwgMS4wLFxuICAgIGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5NQU5BR0VSLnNlY3VyaXR5Z3JvdXBzLmFkZChuZXcgQVdTX0VDMl9TZWN1cml0eUdyb3VwKCdOZXdfU2VjdXJpdHlfR3JvdXAnLCBkaW0ueC8yLCBkaW0ueS8yKSk7XG4gICAgfSk7XG5cbiAgc2VsZi5hZGQoc2VsZi5tZW51LnNlY2dycCk7XG5cbn07XG5cbk1lbnUucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb2xsZWN0aW9uLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWVudTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA3LzkvMTUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgR3VpVXRpbCA9IHJlcXVpcmUoJy4vZ3VpLnV0aWwnKTtcbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi9saWIvZWxlbWVudC9lbGVtZW50Jyk7XG4vL3ZhciBBcnJvdyA9IHJlcXVpcmUoJy4vYXJyb3cnKTtcbnZhciBFZGl0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9FZGl0b3JNYW5hZ2VyJyk7XG5cbmZ1bmN0aW9uIHJlc2l6ZUd1aUNvbnRhaW5lcihyZW5kZXJlcikge1xuXG4gIHZhciBkaW0gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuXG4gIGNvbnNvbGUubG9nKCdSZXNpemluZy4uLicpO1xuICBjb25zb2xlLmxvZyhkaW0pO1xuXG4gICQoJyNndWlDb250YWluZXInKS5oZWlnaHQoZGltLnkpO1xuICAkKCcjZ3VpQ29udGFpbmVyJykud2lkdGgoZGltLngpO1xuXG4gIGlmKHJlbmRlcmVyKSB7XG4gICAgcmVuZGVyZXIudmlldy5zdHlsZS53aWR0aCA9IGRpbS54KydweCc7XG4gICAgcmVuZGVyZXIudmlldy5zdHlsZS5oZWlnaHQgPSBkaW0ueSsncHgnO1xuICB9XG5cbiAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIGd1aSBjb250YWluZXIuLi4nKTtcblxufVxuXG52YXIgUGl4aUVkaXRvciA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgdmFyIHRlbXBsYXRlID0gb3B0aW9ucy50ZW1wbGF0ZSgpO1xuICAgIGNvbnNvbGUubG9nKHRlbXBsYXRlKTtcblxuICAgIHZhciBNQU5BR0VSID0gbmV3IEVkaXRvck1hbmFnZXIodGVtcGxhdGUpO1xuICAgIE1BTkFHRVIuaW5pdCgpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyBsaXN0ZW5lci4uLicpO1xuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICByZXNpemVHdWlDb250YWluZXIoTUFOQUdFUi5yZW5kZXJlcik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGVtcGxhdGU6IG9wdGlvbnMudGVtcGxhdGUsXG5cbiAgICAgIGRyYXdDYW52YXNFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBNQU5BR0VSLmFuaW1hdGUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKE1BTkFHRVIucmVuZGVyZXIudmlldyk7XG5cbiAgICAgICAgTUFOQUdFUi5hbmltYXRlKCk7XG5cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHZpZXc6IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICByZXR1cm4gbSgnI2d1aUNvbnRhaW5lcicsIHsgY29uZmlnOiBjb250cm9sbGVyLmRyYXdDYW52YXNFZGl0b3J9KVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpeGlFZGl0b3I7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcmVzaXplRWRpdG9yKGVkaXRvcikge1xuICBlZGl0b3Iuc2V0U2l6ZShudWxsLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xufVxuXG52YXIgU291cmNlRWRpdG9yID0ge1xuXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgIGRyYXdFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgdmFyIGVkaXRvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBpZihlZGl0b3IpIHtcbiAgICAgICAgICAgIGVkaXRvci5yZWZyZXNoKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVkaXRvciA9IENvZGVNaXJyb3IoZWxlbWVudCwge1xuICAgICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShvcHRpb25zLnRlbXBsYXRlKCksIHVuZGVmaW5lZCwgMiksXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgbW9kZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIGd1dHRlcnM6IFsnQ29kZU1pcnJvci1saW50LW1hcmtlcnMnXSxcbiAgICAgICAgICBsaW50OiB0cnVlLFxuICAgICAgICAgIHN0eWxlQWN0aXZlTGluZTogdHJ1ZSxcbiAgICAgICAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIHRoZW1lOiAnemVuYnVybidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzaXplRWRpdG9yKGVkaXRvcik7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlZGl0b3IpIHtcbiAgICAgICAgICBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcbiAgICAgICAgICBvcHRpb25zLnRlbXBsYXRlKEpTT04ucGFyc2UoZWRpdG9yLmdldFZhbHVlKCkpKTtcbiAgICAgICAgICBtLmVuZENvbXB1dGF0aW9uKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBbXG4gICAgICBtKCcjc291cmNlRWRpdG9yJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0VkaXRvciB9KVxuICAgIF1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb3VyY2VFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBTb3VyY2VFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvc291cmNlLmVkaXRvcicpO1xudmFyIFBpeGlFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcGl4aS5lZGl0b3InKTtcblxudmFyIHRlc3REYXRhID0gcmVxdWlyZSgnLi90ZXN0RGF0YS9lbXB0eS5qc29uJyk7XG5cbnZhciB0ZW1wbGF0ZSA9IG0ucHJvcCh0ZXN0RGF0YSk7XG5cbm0ubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nsb3Vkc2xpY2VyLWFwcCcpLCBtLmNvbXBvbmVudChQaXhpRWRpdG9yLCB7XG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIH0pXG4pO1xuXG5tLm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb2RlLWJhcicpLCBtLmNvbXBvbmVudChTb3VyY2VFZGl0b3IsIHtcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgfSlcbik7XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiUmVzb3VyY2VzXCI6IHtcblxuICB9XG59XG4iXX0=
