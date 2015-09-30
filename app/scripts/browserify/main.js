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

},{"../component/component":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/component/component.js","./group.drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/lib/group/group.drag.drop.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/pixi.editor.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL0VkaXRvck1hbmFnZXIuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX0VJUC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvYXdzL0FXU19FQzJfSW5zdGFuY2UuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX1NlY3VyaXR5R3JvdXAuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfVXNlcnMuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2RyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZ3VpLnV0aWwuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2xpYi9jb2xsZWN0aW9uL2NvbGxlY3Rpb24uanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2xpYi9jb21wb25lbnQvY29tcG9uZW50LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9saWIvZWxlbWVudC9lbGVtZW50LmRyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2VsZW1lbnQvZWxlbWVudC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2dyb3VwL2dyb3VwLmRyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2dyb3VwL2dyb3VwLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9waXhpLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvc291cmNlLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL21haW4uanMiLCJhcHAvc2NyaXB0cy90ZXN0RGF0YS9lYzIuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMjYvMTUuXG4gKi9cblxudmFyIEd1aVV0aWwgPSByZXF1aXJlKCcuL2d1aS51dGlsJyk7XG52YXIgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vbGliL2NvbGxlY3Rpb24vY29sbGVjdGlvbicpO1xudmFyIEFXU19Vc2VycyA9IHJlcXVpcmUoJy4vYXdzL0FXU19Vc2VycycpO1xudmFyIEFXU19FQzJfSW5zdGFuY2UgPSByZXF1aXJlKCcuL2F3cy9BV1NfRUMyX0luc3RhbmNlJyk7XG52YXIgQVdTX0VDMl9FSVAgPSByZXF1aXJlKCcuL2F3cy9BV1NfRUMyX0VJUCcpO1xudmFyIEFXU19FQzJfU2VjdXJpdHlHcm91cCA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfU2VjdXJpdHlHcm91cCcpO1xuXG52YXIgRWRpdG9yTWFuYWdlciA9IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHZhciBmcHNTdGF0cyA9IG5ldyBTdGF0cygpO1xuICBmcHNTdGF0cy5zZXRNb2RlKDApO1xuICAvLyBhbGlnbiB0b3AtbGVmdFxuICBmcHNTdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgZnBzU3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzBweCc7XG4gIGZwc1N0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGZwc1N0YXRzLmRvbUVsZW1lbnQgKTtcblxuICB2YXIgbXNTdGF0cyA9IG5ldyBTdGF0cygpO1xuICBtc1N0YXRzLnNldE1vZGUoMSk7XG4gIC8vIGFsaWduIHRvcC1sZWZ0XG4gIG1zU3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIG1zU3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzgwcHgnO1xuICBtc1N0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIG1zU3RhdHMuZG9tRWxlbWVudCApO1xuXG4gIHZhciBtYlN0YXRzID0gbmV3IFN0YXRzKCk7XG4gIG1iU3RhdHMuc2V0TW9kZSgyKTtcbiAgLy8gYWxpZ24gdG9wLWxlZnRcbiAgbWJTdGF0cy5kb21FbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgbWJTdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMTYwcHgnO1xuICBtYlN0YXRzLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gJzBweCc7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIG1iU3RhdHMuZG9tRWxlbWVudCApO1xuXG5cbiAgZnBzID0gNjA7XG4gIHZhciBub3c7XG4gIHZhciB0aGVuID0gRGF0ZS5ub3coKTtcbiAgdmFyIGludGVydmFsID0gMTAwMC9mcHM7XG4gIHZhciBkZWx0YTtcbiAgLy92YXIgbWV0ZXIgPSBuZXcgRlBTTWV0ZXIoKTtcbiAgdmFyIHdpbkRpbWVuc2lvbiA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG4gIHZhciBncmlkID0gbnVsbDtcblxuICBzZWxmLnJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIod2luRGltZW5zaW9uLngsIHdpbkRpbWVuc2lvbi55LCB7YmFja2dyb3VuZENvbG9yIDogMHhGRkZGRkZ9KTtcblxuICBzZWxmLnN0YWdlID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG4gIHNlbGYuc3RhZ2UubmFtZSA9ICdzdGFnZSc7XG4gIHNlbGYuc3RhZ2Uuc2VsZWN0ZWQgPSBudWxsO1xuICBzZWxmLnN0YWdlLmNsaWNrZWRPbmx5U3RhZ2UgPSB0cnVlO1xuICBzZWxmLnN0YWdlLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgc2VsZi5zdGFnZS5vbignbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuICAgIGlmKHNlbGYuc3RhZ2UuY2xpY2tlZE9ubHlTdGFnZSkge1xuICAgICAgY29uc29sZS5sb2coJ0ZvdW5kIHN0YWdlIGNsaWNrJyk7XG4gICAgICBpZihzZWxmLnN0YWdlLnNlbGVjdGVkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHNlbGYuc3RhZ2Uuc2VsZWN0ZWQpO1xuICAgICAgICBzZWxmLnN0YWdlLnNlbGVjdGVkLmZpbHRlcnMgPSBudWxsO1xuICAgICAgICBzZWxmLnN0YWdlLnNlbGVjdGVkID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzZWxmLnN0YWdlLmNsaWNrZWRPbmx5U3RhZ2UgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgc2VsZi5zdGFnZS5NQU5BR0VSID0gc2VsZjtcblxuICBzZWxmLnNlY3VyaXR5Z3JvdXBzID0gbmV3IENvbGxlY3Rpb24oKTtcbiAgc2VsZi5lbGVtZW50cyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cbiAgdmFyIGNvbGxpc2lvbm1hbmFnZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciBjb2xsU2VsZiA9IHRoaXM7XG5cbiAgICBjb2xsU2VsZi5zZWNHcm91cFZzRWxlbWVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWNHcnBzID0gc2VsZi5zZWN1cml0eWdyb3VwcztcbiAgICAgIHZhciBlbGVtcyA9IHNlbGYuZWxlbWVudHM7XG5cbiAgICAgIF8uZWFjaChzZWNHcnBzLmVsZW1lbnRzLCBmdW5jdGlvbihzKSB7XG5cbiAgICAgICAgXy5lYWNoKGVsZW1zLmVsZW1lbnRzLCBmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgICB2YXIgeGRpc3QgPSBzLnBvc2l0aW9uLnggLSBlLnBvc2l0aW9uLng7XG5cbiAgICAgICAgICBpZih4ZGlzdCA+IC1zLndpZHRoLzIgJiYgeGRpc3QgPCBzLndpZHRoLzIpXG4gICAgICAgICAge1xuICAgICAgICAgICAgdmFyIHlkaXN0ID0gcy5wb3NpdGlvbi55IC0gZS5wb3NpdGlvbi55O1xuXG4gICAgICAgICAgICBpZih5ZGlzdCA+IC1zLmhlaWdodC8yICYmIHlkaXN0IDwgcy5oZWlnaHQvMilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgLy8gIGNvbnNvbGUubG9nKCdDb2xsaXNpb24gZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgICB9KTtcblxuICAgIH07XG5cbiAgICBjb2xsU2VsZi51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGNvbGxTZWxmLnNlY0dyb3VwVnNFbGVtZW50cygpO1xuICAgIH07XG5cbiAgfTtcblxuICBzZWxmLkNvbGxpc2lvbk1hbmFnZXIgPSBuZXcgY29sbGlzaW9ubWFuYWdlcigpO1xuXG4gIHNlbGYuYW5pbWF0ZSA9IGZ1bmN0aW9uKHRpbWUpIHtcblxuICAgIG5vdyA9IERhdGUubm93KCk7XG4gICAgZGVsdGEgPSBub3cgLSB0aGVuO1xuXG4gICAgaWYgKGRlbHRhID4gaW50ZXJ2YWwpIHtcbiAgICAgIGZwc1N0YXRzLmJlZ2luKCk7XG4gICAgICBtc1N0YXRzLmJlZ2luKCk7XG4gICAgICBtYlN0YXRzLmJlZ2luKCk7XG5cbiAgICAgIC8vc2VsZi5Db2xsaXNpb25NYW5hZ2VyLnVwZGF0ZSgpO1xuXG4gICAgICB0aGVuID0gbm93IC0gKGRlbHRhICUgaW50ZXJ2YWwpO1xuICAgICAgLy9tZXRlci50aWNrKCk7XG5cbiAgICAgIFRXRUVOLnVwZGF0ZSh0aW1lKTtcbiAgICAgIHNlbGYucmVuZGVyZXIucmVuZGVyKHNlbGYuc3RhZ2UpO1xuXG4gICAgICBmcHNTdGF0cy5lbmQoKTtcbiAgICAgIG1zU3RhdHMuZW5kKCk7XG4gICAgICBtYlN0YXRzLmVuZCgpO1xuICAgIH1cblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShzZWxmLmFuaW1hdGUpO1xuICB9O1xuXG4gIHNlbGYuZ3JpZE9uID0gZnVuY3Rpb24oKSB7XG4gICAgZ3JpZCA9IEd1aVV0aWwuZHJhd0dyaWQod2luRGltZW5zaW9uLngsIHdpbkRpbWVuc2lvbi55KTtcbiAgICBzZWxmLnN0YWdlLmFkZENoaWxkKGdyaWQpO1xuICB9O1xuXG4gIHNlbGYuZ3JpZE9mZiA9IGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuc3RhZ2UucmVtb3ZlQ2hpbGQoZ3JpZCk7XG4gICAgc2VsZi5ncmlkID0gbnVsbDtcbiAgfTtcblxuICBzZWxmLm9uTG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0Fzc2V0cyBsb2FkZWQnKTtcblxuICAgIHZhciBkaW0gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuICAgIGNvbnNvbGUubG9nKHNlbGYuZWxlbWVudHMucG9zaXRpb24pO1xuXG4gICAgdmFyIHVzZXJzID0gbmV3IEFXU19Vc2VycygndXNlcnMnLCBkaW0ueC8yLCAxMDApO1xuICAgIGNvbnNvbGUubG9nKHVzZXJzLnBvc2l0aW9uKTtcbiAgICBzZWxmLmVsZW1lbnRzLmFkZCh1c2Vycyk7XG5cbiAgICBjb25zb2xlLmxvZyh0ZW1wbGF0ZS5SZXNvdXJjZXMpO1xuXG4gICAgdmFyIGdyb3VwaW5ncyA9IF8ucmVkdWNlKHRlbXBsYXRlLlJlc291cmNlcywgZnVuY3Rpb24ocmVzdWx0LCBuLCBrZXkpIHtcbiAgICAgIHJlc3VsdFtuLlR5cGVdID0ge307XG4gICAgICByZXN1bHRbbi5UeXBlXVtrZXldID0gbjtcbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9LCB7fSk7XG4gICAgY29uc29sZS5sb2coJ0dyb3VwaW5nczonKTtcbiAgICBjb25zb2xlLmxvZyhncm91cGluZ3MpO1xuXG4gICAgdmFyIGluc3RhbmNlcyA9IHt9O1xuICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpJbnN0YW5jZSddLCBmdW5jdGlvbihuLCBrZXkpIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBBV1NfRUMyX0luc3RhbmNlKGtleSwgZGltLngvMiwgNDAwKTtcbiAgICAgIGluc3RhbmNlc1trZXldID0gaW5zdGFuY2U7XG4gICAgfSk7XG5cbiAgICB2YXIgZWlwcyA9IHt9O1xuICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpFSVAnXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICBjb25zb2xlLmxvZygnQWRkaW5nIEVJUCAnLCBrZXkpO1xuICAgICAgdmFyIGVpcCA9IG5ldyBBV1NfRUMyX0VJUChrZXksIGRpbS54LzIsIDUwMCk7XG4gICAgICBlaXBzW2tleV0gPSBlaXA7XG4gICAgfSk7XG5cbiAgICB2YXIgc2VjZ3JvdXBzID0ge307XG4gICAgXy5lYWNoKGdyb3VwaW5nc1snQVdTOjpFQzI6OlNlY3VyaXR5R3JvdXAnXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICBjb25zb2xlLmxvZygnQWRkaW5nIFNlY3VyaXR5IEdyb3VwICcsIGtleSk7XG4gICAgICB2YXIgc2VjZ3JvdXAgPSBuZXcgQVdTX0VDMl9TZWN1cml0eUdyb3VwKGtleSwgZGltLngvMiwgNTAwKTtcbiAgICAgIHNlY2dyb3Vwc1trZXldID0gc2VjZ3JvdXA7XG4gICAgfSk7XG5cbiAgICB2YXIgY29tYm9JbnN0YW5jZXMgPSB7fTtcbiAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6RUlQQXNzb2NpYXRpb24nXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICBjb25zb2xlLmxvZygnQ2hlY2tpbmcgYXNzb2NpYXRpb24nKTtcbiAgICAgIGNvbnNvbGUubG9nKG4pO1xuICAgICAgY29uc29sZS5sb2coa2V5KTtcbiAgICAgIGNvbnNvbGUubG9nKGVpcHMpO1xuICAgICAgY29uc29sZS5sb2coJ1JlZjogJyxuLlByb3BlcnRpZXMuRUlQLlJlZik7XG4gICAgICB2YXIgaW5zdGFuY2UgPSBpbnN0YW5jZXNbbi5Qcm9wZXJ0aWVzLkluc3RhbmNlSWQuUmVmXTtcbiAgICAgIGlmKGluc3RhbmNlKSB7XG4gICAgICAgIHZhciBlaXAgPSBlaXBzW24uUHJvcGVydGllcy5FSVAuUmVmXTtcbiAgICAgICAgaWYoZWlwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0Fzc29jaWF0aW9uIGhhcyBhIG1hdGNoIScpO1xuICAgICAgICAgIHZhciBjb250YWluZXIgPSBuZXcgQ29sbGVjdGlvbigpO1xuICAgICAgICAgIGNvbnRhaW5lci5hZGQoaW5zdGFuY2UpO1xuICAgICAgICAgIGNvbnRhaW5lci5hZGQoZWlwKTtcbiAgICAgICAgICBjb21ib0luc3RhbmNlc1trZXldID0gY29udGFpbmVyO1xuICAgICAgICAgIGRlbGV0ZSBpbnN0YW5jZXNbbi5Qcm9wZXJ0aWVzLkluc3RhbmNlSWQuUmVmXTtcbiAgICAgICAgICBkZWxldGUgZWlwc1tuLlByb3BlcnRpZXMuRUlQLlJlZl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vdmFyIGVpcCA9IG5ldyBBV1NfRUMyX0VJUChrZXksIGRpbS54LzIsIDUwMCk7XG4gICAgICAvL2VpcHNba2V5XSA9IGVpcDtcbiAgICB9KTtcblxuICAgIF8uZWFjaChzZWNncm91cHMsIGZ1bmN0aW9uKHMsIGtleSkge1xuICAgICAgc2VsZi5zZWN1cml0eWdyb3Vwcy5hZGQocyk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goY29tYm9JbnN0YW5jZXMsIGZ1bmN0aW9uKGNvbWJvLCBrZXkpIHtcbiAgICAgIHNlbGYuZWxlbWVudHMuYWRkKGNvbWJvKTtcbiAgICB9KTtcblxuICAgIF8uZWFjaChpbnN0YW5jZXMsIGZ1bmN0aW9uKGluc3RhbmNlLCBrZXkpIHtcbiAgICAgIHNlbGYuZWxlbWVudHMuYWRkKGluc3RhbmNlKTtcbiAgICB9KTtcblxuICAgIF8uZWFjaChlaXBzLCBmdW5jdGlvbihlaXAsIGtleSkge1xuICAgICAgc2VsZi5lbGVtZW50cy5hZGQoZWlwKTtcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKCdDaGlsZHJlbjonKTtcbiAgICBjb25zb2xlLmxvZyhzZWxmLmVsZW1lbnRzLmNoaWxkcmVuKTtcblxuICAgIHNlbGYuc3RhZ2UuYWRkQ2hpbGQoc2VsZi5zZWN1cml0eWdyb3Vwcyk7XG4gICAgc2VsZi5zdGFnZS5hZGRDaGlsZChzZWxmLmVsZW1lbnRzKTtcbiAgICBjb25zb2xlLmxvZyhzZWxmLnN0YWdlLmNoaWxkcmVuKTtcblxuICAgIHZhciBtZW51U3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKCk7XG4gICAgbWVudVNwcml0ZS50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9JbnN0YW5jZS5wbmcnKTtcbiAgICBtZW51U3ByaXRlLnNjYWxlLnNldCgwLjIpO1xuICAgIG1lbnVTcHJpdGUueSA9IGRpbS55LzI7XG4gICAgbWVudVNwcml0ZS54ID0gZGltLngtNDA7XG4gICAgbWVudVNwcml0ZS5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgbWVudVNwcml0ZS5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICBtZW51U3ByaXRlLmFuY2hvci5zZXQoMC41KTtcbiAgICBtZW51U3ByaXRlXG4gICAgICAub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueCoxLjIpO1xuICAgICAgfSlcbiAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvMS4yKTtcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0NsaWNrZWQuJyk7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBBV1NfRUMyX0luc3RhbmNlKCdOZXdfSW5zdGFuY2UnLCBkaW0ueC8yLCBkaW0ueS8yKTtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5hZGQoaW5zdGFuY2UpO1xuICAgICAgfSk7XG4gICAgc2VsZi5zdGFnZS5hZGRDaGlsZChtZW51U3ByaXRlKTtcblxuICAgIHZhciBtZW51U2VjR3JvdXAgPSBuZXcgUElYSS5TcHJpdGUoKTtcbiAgICB2YXIgbWVudUdyYXBoaWMgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIG1lbnVHcmFwaGljLmxpbmVTdHlsZSgzLCAweDAwMDAwMCwgMSk7XG4gICAgbWVudUdyYXBoaWMuYmVnaW5GaWxsKDB4RkZGRkZGLCAxKTtcbiAgICBtZW51R3JhcGhpYy5kcmF3Um91bmRlZFJlY3QoMCwwLDMwLDMwLDYpO1xuICAgIG1lbnVHcmFwaGljLmVuZEZpbGwoKTtcbiAgICBtZW51U2VjR3JvdXAudGV4dHVyZSA9IG1lbnVHcmFwaGljLmdlbmVyYXRlVGV4dHVyZSgpO1xuXG4gICAgbWVudVNlY0dyb3VwLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICBtZW51U2VjR3JvdXAuYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgbWVudVNlY0dyb3VwLnBvc2l0aW9uLnkgPSBkaW0ueS8yKzQwO1xuICAgIG1lbnVTZWNHcm91cC5wb3NpdGlvbi54ID0gZGltLngtNDA7XG4gICAgbWVudVNlY0dyb3VwLnNjYWxlLnNldCgxLjApO1xuICAgIG1lbnVTZWNHcm91cC5hbmNob3Iuc2V0KDAuNSk7XG4gICAgbWVudVNlY0dyb3VwXG4gICAgICAub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueCoxLjEpO1xuICAgICAgfSlcbiAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvMS4xKTtcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0NsaWNrZWQuJyk7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBBV1NfRUMyX1NlY3VyaXR5R3JvdXAoJ05ld19TZWN1cml0eV9Hcm91cCcsIGRpbS54LzIsIGRpbS55LzIpO1xuICAgICAgICBzZWxmLnNlY3VyaXR5Z3JvdXBzLmFkZChpbnN0YW5jZSk7XG4gICAgICB9KTtcbiAgICBzZWxmLnN0YWdlLmFkZENoaWxkKG1lbnVTZWNHcm91cCk7XG4gIH07XG5cbiAgc2VsZi5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgc2VsZi5ncmlkT24oKTtcbiAgICBQSVhJLmxvYWRlclxuICAgICAgLmFkZCgnLi4vcmVzb3VyY2VzL3Nwcml0ZXMvc3ByaXRlcy5qc29uJylcbiAgICAgIC5sb2FkKHNlbGYub25Mb2FkZWQpO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yTWFuYWdlcjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE5LzE1LlxuICovXG5cbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi4vbGliL2VsZW1lbnQvZWxlbWVudCcpO1xudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi4vZHJhZy5kcm9wJyk7XG5cbnZhciBBV1NfRUMyX0VJUCA9IGZ1bmN0aW9uKG5hbWUseCx5KSB7XG4gIEVsZW1lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLm5hbWUgPSBuYW1lO1xuICBzZWxmLnNjYWxlLnNldCgwLjMpO1xuICBzZWxmLnRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCdDb21wdXRlXyZfTmV0d29ya2luZ19BbWF6b25fRUMyX0VsYXN0aWNfSVAucG5nJyk7XG4gIHNlbGYucG9zaXRpb24ueCA9IHg7XG4gIHNlbGYucG9zaXRpb24ueSA9IHk7XG59O1xuQVdTX0VDMl9FSVAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX0VDMl9FSVA7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2xpYi9lbGVtZW50L2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX0VDMl9JbnN0YW5jZSA9IGZ1bmN0aW9uKG5hbWUseCx5KSB7XG4gIEVsZW1lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLm5hbWUgPSBuYW1lO1xuICBzZWxmLnRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCdDb21wdXRlXyZfTmV0d29ya2luZ19BbWF6b25fRUMyX0luc3RhbmNlLnBuZycpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xuXG4gIHNlbGYuc2VjdXJpdHlHcm91cCA9IG51bGw7XG59O1xuQVdTX0VDMl9JbnN0YW5jZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfRUMyX0luc3RhbmNlO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMjEvMTUuXG4gKi9cblxudmFyIEdyb3VwID0gcmVxdWlyZSgnLi4vbGliL2dyb3VwL2dyb3VwJyk7XG5cbnZhciBBV1NfRUMyX1NlY3VyaXR5R3JvdXAgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBHcm91cC5jYWxsKHRoaXMpO1xuXG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcblxuICB2YXIgZ3JhcGhpYyA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gIGdyYXBoaWMubGluZVN0eWxlKDMsIDB4MDAwMDAwLCAxKTtcbiAgZ3JhcGhpYy5iZWdpbkZpbGwoMHhGRkZGRkYsIDAuMCk7XG4gIGdyYXBoaWMuZHJhd1JvdW5kZWRSZWN0KDAsMCwyMDAsMjAwLDEwKTtcbiAgZ3JhcGhpYy5lbmRGaWxsKCk7XG5cbiAgc2VsZi50ZXh0dXJlID0gZ3JhcGhpYy5nZW5lcmF0ZVRleHR1cmUoKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxufTtcbkFXU19FQzJfU2VjdXJpdHlHcm91cC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdyb3VwLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX0VDMl9TZWN1cml0eUdyb3VwO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTkvMTUuXG4gKi9cblxudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuLi9saWIvZWxlbWVudC9lbGVtZW50Jyk7XG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuLi9kcmFnLmRyb3AnKTtcblxudmFyIEFXU19Vc2VycyA9IGZ1bmN0aW9uKG5hbWUseCx5KSB7XG4gIEVsZW1lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLm5hbWUgPSBuYW1lO1xuICBzZWxmLnRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCdOb24tU2VydmljZV9TcGVjaWZpY19jb3B5X1VzZXJzLnBuZycpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xuXG59O1xuQVdTX1VzZXJzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19Vc2VycztcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE0LzE1LlxuICovXG5cbnZhciBNT1VTRV9PVkVSX1NDQUxFX1JBVElPID0gMS4xO1xuXG52YXIgRHJhZ0Ryb3AgPSB7XG5cbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coKTtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmKHRoaXMubW92ZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBkcmFnZ2luZycpO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gICAgICB0aGlzLmRhdGEgPSBudWxsO1xuXG4gICAgICBpZighdGhpcy5zZWN1cml0eUdyb3VwKSB7XG5cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdQYXJlbnQnKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzZWxmLnBhcmVudC5wYXJlbnQuTUFOQUdFUik7XG4gICAgICAgICAgdmFyIHNlY0dycHMgPSBzZWxmLnBhcmVudC5wYXJlbnQuTUFOQUdFUi5zZWN1cml0eWdyb3VwcztcblxuICAgICAgICAgIF8uZWFjaChzZWNHcnBzLmVsZW1lbnRzLCBmdW5jdGlvbihzKSB7XG5cbiAgICAgICAgICAgICAgdmFyIHhkaXN0ID0gcy5wb3NpdGlvbi54IC0gc2VsZi5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgICAgIGlmKHhkaXN0ID4gLXMud2lkdGgvMiAmJiB4ZGlzdCA8IHMud2lkdGgvMilcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciB5ZGlzdCA9IHMucG9zaXRpb24ueSAtIHNlbGYucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgICAgIGlmKHlkaXN0ID4gLXMuaGVpZ2h0LzIgJiYgeWRpc3QgPCBzLmhlaWdodC8yKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NvbGxpc2lvbiBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb24ueCA9IDA7XG4gICAgICAgICAgICAgICAgICBzZWxmLnBvc2l0aW9uLnkgPSAwO1xuICAgICAgICAgICAgICAgICAgc2VsZi5zZWN1cml0eUdyb3VwID0gcztcbiAgICAgICAgICAgICAgICAgICAgcy5hZGRDaGlsZChzZWxmKTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBOT1QgZHJhZ2dpbmcnKTtcbiAgICAgIHZhciBzaGFkb3cgPSBuZXcgUElYSS5maWx0ZXJzLkRyb3BTaGFkb3dGaWx0ZXIoKTtcbiAgICAgIHRoaXMuZmlsdGVycyA9IFtzaGFkb3ddO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICBjb25zb2xlLmxvZygnUGFyZW50OicpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5wYXJlbnQucGFyZW50KTtcbiAgICAgIGlmKHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCkge1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQuZmlsdGVycyA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcmVudC5wYXJlbnQuY2xpY2tlZE9ubHlTdGFnZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkID0gdGhpcztcbiAgICB9XG4gIH0sXG5cbiAgb25EcmFnTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLmRyYWdnaW5nKVxuICAgIHtcbiAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHNlbGYuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHNlbGYucGFyZW50KTtcbiAgICAgIHNlbGYucG9zaXRpb24ueCA9IG5ld1Bvc2l0aW9uLng7XG4gICAgICBzZWxmLnBvc2l0aW9uLnkgPSBuZXdQb3NpdGlvbi55O1xuICAgICAgc2VsZi5tb3ZlZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG4gIG9uTW91c2VPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3ZlciEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54Kk1PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuICAgIHZhciBpY29uU2l6ZSA9IDEwO1xuXG4gICAgdmFyIGdsb2JhbCA9IHNlbGYudG9HbG9iYWwoc2VsZi5wb3NpdGlvbik7XG4gICAgLy9jb25zb2xlLmxvZygnb2ZmaWNpYWw6ICcgKyBzZWxmLnBvc2l0aW9uLnggKyAnOicgKyBzZWxmLnBvc2l0aW9uLnkpO1xuICAgIC8vY29uc29sZS5sb2coJ0dMT0JBTDogJyArIGdsb2JhbC54ICsgJzonICsgZ2xvYmFsLnkpO1xuICAgIC8vY29uc29sZS5sb2coc2VsZi5nZXRMb2NhbEJvdW5kcygpKTtcblxuICAgIHZhciBzY2FsZUxvY2F0aW9ucyA9IFtcbiAgICAgIHt4OiAwLCB5OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMi1pY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMC1zZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMi1pY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzIraWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAsIHk6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMitpY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX1cbiAgICBdO1xuXG4gICAgLy9jb25zb2xlLmxvZyhzY2FsZUxvY2F0aW9uc1swXSk7XG5cbiAgICBzZWxmLnNjYWxlSWNvbnMgPSBbXTtcblxuICAgIHNjYWxlTG9jYXRpb25zLmZvckVhY2goZnVuY3Rpb24obG9jKSB7XG4gICAgICB2YXIgaWNvbiA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICBpY29uLm1vdmVUbygwLDApO1xuICAgICAgaWNvbi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICBpY29uLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgICAgaWNvbi5saW5lU3R5bGUoMSwgMHgwMDAwRkYsIDEpO1xuICAgICAgaWNvbi5iZWdpbkZpbGwoMHhGRkZGRkYsIDEpO1xuICAgICAgaWNvbi5kcmF3Q2lyY2xlKGxvYy54LCBsb2MueSwgbG9jLnNpemUpO1xuICAgICAgaWNvbi5lbmRGaWxsKCk7XG5cbiAgICAgIC8vaWNvblxuICAgICAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAgICAgLy8ub24oJ21vdXNlZG93bicsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KVxuICAgICAgICAvLy5vbigndG91Y2hzdGFydCcsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KTtcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAgIC8vLm9uKCdtb3VzZXVwJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ21vdXNldXBvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgICAvLy5vbignbW91c2Vtb3ZlJywgb25EcmFnTW92ZSlcbiAgICAgIC8vLm9uKCd0b3VjaG1vdmUnLCBvbkRyYWdNb3ZlKVxuXG4gICAgICBzZWxmLnNjYWxlSWNvbnMucHVzaChpY29uKTtcblxuICAgIH0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5hZGRDaGlsZChzKTtcbiAgICB9KTtcblxuICAgIHNlbGYudG9vbHRpcCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgc2VsZi50b29sdGlwLmxpbmVTdHlsZSgzLCAweDAwMDBGRiwgMSk7XG4gICAgc2VsZi50b29sdGlwLmJlZ2luRmlsbCgweDAwMDAwMCwgMSk7XG4gICAgLy9zZWxmLmRyYXcubW92ZVRvKHgseSk7XG4gICAgc2VsZi50b29sdGlwLmRyYXdSb3VuZGVkUmVjdCgwKzIwLC1zZWxmLmhlaWdodCwyMDAsMTAwLDEwKTtcbiAgICBzZWxmLnRvb2x0aXAuZW5kRmlsbCgpO1xuICAgIHNlbGYudG9vbHRpcC50ZXh0U3R5bGUgPSB7XG4gICAgICBmb250IDogJ2JvbGQgaXRhbGljIDI4cHggQXJpYWwnLFxuICAgICAgZmlsbCA6ICcjRjdFRENBJyxcbiAgICAgIHN0cm9rZSA6ICcjNGExODUwJyxcbiAgICAgIHN0cm9rZVRoaWNrbmVzcyA6IDUsXG4gICAgICBkcm9wU2hhZG93IDogdHJ1ZSxcbiAgICAgIGRyb3BTaGFkb3dDb2xvciA6ICcjMDAwMDAwJyxcbiAgICAgIGRyb3BTaGFkb3dBbmdsZSA6IE1hdGguUEkgLyA2LFxuICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlIDogNixcbiAgICAgIHdvcmRXcmFwIDogdHJ1ZSxcbiAgICAgIHdvcmRXcmFwV2lkdGggOiA0NDBcbiAgICB9O1xuXG4gICAgc2VsZi50b29sdGlwLnRleHQgPSBuZXcgUElYSS5UZXh0KHNlbGYubmFtZSxzZWxmLnRvb2x0aXAudGV4dFN0eWxlKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC54ID0gMCszMDtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC55ID0gLXNlbGYuaGVpZ2h0O1xuXG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcClcbiAgICAgIC50byh7eDpzZWxmLndpZHRofSw3MDApXG4gICAgICAuZWFzaW5nKCBUV0VFTi5FYXNpbmcuRWxhc3RpYy5Jbk91dCApXG4gICAgICAuc3RhcnQoKTtcbiAgICBuZXcgVFdFRU4uVHdlZW4oc2VsZi50b29sdGlwLnRleHQpXG4gICAgICAudG8oe3g6c2VsZi53aWR0aCsyMH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG5cbiAgICBjb25zb2xlLmxvZygnQWRkaW5nIHRvb2x0aXAnKTtcbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcCk7XG5cbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvbk1vdXNlT3V0OiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3V0IScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2Ugb3V0Jyk7XG4gICAgdGhpcy5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5yZW1vdmVDaGlsZChzKTtcbiAgICB9KTtcbiAgICAvL2NvbnNvbGUubG9nKCdTaXplOiAnKTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuZ2V0Qm91bmRzKCkpO1xuXG4gICAgc2VsZi5yZW1vdmVDaGlsZChzZWxmLnRvb2x0aXApO1xuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwLnRleHQpO1xuICB9LFxuXG4gIG9uU2NhbGVJY29uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZygnUmVzaXppbmchJyk7XG4gIH1cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdEcm9wO1xuXG4iLCJcbnZhciBHdWlVdGlsID0ge1xuXG4gIGdldFdpbmRvd0RpbWVuc2lvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHsgeDogd2luZG93LmlubmVyV2lkdGgsIHk6IHdpbmRvdy5pbm5lckhlaWdodCB9O1xuICB9LFxuXG4gIGRyYXdHcmlkOiBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIGdyaWQgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHZhciBpbnRlcnZhbCA9IDEwMDtcbiAgICB2YXIgY291bnQgPSBpbnRlcnZhbDtcbiAgICBncmlkLmxpbmVTdHlsZSgxLCAweEU1RTVFNSwgMSk7XG4gICAgd2hpbGUgKGNvdW50IDwgd2lkdGgpIHtcbiAgICAgIGdyaWQubW92ZVRvKGNvdW50LCAwKTtcbiAgICAgIGdyaWQubGluZVRvKGNvdW50LCBoZWlnaHQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICBjb3VudCA9IGludGVydmFsO1xuICAgIHdoaWxlKGNvdW50IDwgaGVpZ2h0KSB7XG4gICAgICBncmlkLm1vdmVUbygwLCBjb3VudCk7XG4gICAgICBncmlkLmxpbmVUbyh3aWR0aCwgY291bnQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICB2YXIgY29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG4gICAgY29udGFpbmVyLmFkZENoaWxkKGdyaWQpO1xuICAgIGNvbnRhaW5lci5jYWNoZUFzQml0bWFwID0gdHJ1ZTtcbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR3VpVXRpbDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8yMS8xNS5cbiAqL1xuLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzE1LzE1LlxuICovXG5cbnZhciBDb2xsZWN0aW9uID0gZnVuY3Rpb24oKSB7XG4gIFBJWEkuQ29udGFpbmVyLmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLmVsZW1lbnRzID0ge307XG5cbiAgc2VsZi5hZGQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgc2VsZi5hZGRDaGlsZChlbGVtZW50KTtcbiAgICBzZWxmLmVsZW1lbnRzW2VsZW1lbnQubmFtZV0gPSBlbGVtZW50O1xuICB9O1xuXG4gIHNlbGYucmVtb3ZlID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHNlbGYucmVtb3ZlQ2hpbGQoZWxlbWVudCk7XG4gICAgZGVsZXRlIHNlbGYuZWxlbWVudHNbZWxlbWVudC5uYW1lXTtcbiAgfTtcblxufTtcbkNvbGxlY3Rpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQSVhJLkNvbnRhaW5lci5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb247XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIENvbXBvbmVudCA9IGZ1bmN0aW9uKCkge1xuICBQSVhJLlNwcml0ZS5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5hbmNob3Iuc2V0KDAuNSk7XG4gIHNlbGYuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICBzZWxmLmJ1dHRvbk1vZGUgPSB0cnVlO1xuXG59O1xuQ29tcG9uZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUElYSS5TcHJpdGUucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnQ7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xNC8xNS5cbiAqL1xuXG52YXIgTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyA9IDEuMTtcblxudmFyIEVsZW1lbnREcmFnRHJvcCA9IHtcblxuICBvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygpO1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gIH0sXG5cbiAgb25EcmFnRW5kOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYodGhpcy5tb3ZlZCkge1xuICAgICAgY29uc29sZS5sb2coJ0ZvdW5kIGNsaWNrIHdoaWxlIGRyYWdnaW5nJyk7XG4gICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMubW92ZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGF0YSA9IG51bGw7XG5cbiAgICAgIGlmKCF0aGlzLnNlY3VyaXR5R3JvdXApIHtcblxuICAgICAgICAgIC8vY29uc29sZS5sb2coJ1BhcmVudCcpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHNlbGYucGFyZW50LnBhcmVudC5NQU5BR0VSKTtcbiAgICAgICAgICB2YXIgc2VjR3JwcyA9IHNlbGYucGFyZW50LnBhcmVudC5NQU5BR0VSLnNlY3VyaXR5Z3JvdXBzO1xuXG4gICAgICAgICAgXy5lYWNoKHNlY0dycHMuZWxlbWVudHMsIGZ1bmN0aW9uKHMpIHtcblxuICAgICAgICAgICAgICB2YXIgeGRpc3QgPSBzLnBvc2l0aW9uLnggLSBzZWxmLnBvc2l0aW9uLng7XG5cbiAgICAgICAgICAgICAgaWYoeGRpc3QgPiAtcy53aWR0aC8yICYmIHhkaXN0IDwgcy53aWR0aC8yKVxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFyIHlkaXN0ID0gcy5wb3NpdGlvbi55IC0gc2VsZi5wb3NpdGlvbi55O1xuXG4gICAgICAgICAgICAgICAgaWYoeWRpc3QgPiAtcy5oZWlnaHQvMiAmJiB5ZGlzdCA8IHMuaGVpZ2h0LzIpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQ29sbGlzaW9uIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgICAgICAgc2VsZi5wb3NpdGlvbi54ID0gMDtcbiAgICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb24ueSA9IDA7XG4gICAgICAgICAgICAgICAgICBzZWxmLnNlY3VyaXR5R3JvdXAgPSBzO1xuICAgICAgICAgICAgICAgICAgICBzLmFkZENoaWxkKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2VsZik7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0ZvdW5kIGNsaWNrIHdoaWxlIE5PVCBkcmFnZ2luZycpO1xuICAgICAgdmFyIHNoYWRvdyA9IG5ldyBQSVhJLmZpbHRlcnMuRHJvcFNoYWRvd0ZpbHRlcigpO1xuICAgICAgdGhpcy5maWx0ZXJzID0gW3NoYWRvd107XG4gICAgICB0aGlzLmFscGhhID0gMTtcbiAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIGNvbnNvbGUubG9nKCdQYXJlbnQ6Jyk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLnBhcmVudC5wYXJlbnQpO1xuICAgICAgaWYodGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkKSB7XG4gICAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZC5maWx0ZXJzID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRoaXMucGFyZW50LnBhcmVudC5jbGlja2VkT25seVN0YWdlID0gZmFsc2U7XG4gICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQgPSB0aGlzO1xuICAgIH1cbiAgfSxcblxuICBvbkRyYWdNb3ZlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuZHJhZ2dpbmcpXG4gICAge1xuICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gc2VsZi5kYXRhLmdldExvY2FsUG9zaXRpb24oc2VsZi5wYXJlbnQpO1xuICAgICAgc2VsZi5wb3NpdGlvbi54ID0gbmV3UG9zaXRpb24ueDtcbiAgICAgIHNlbGYucG9zaXRpb24ueSA9IG5ld1Bvc2l0aW9uLnk7XG4gICAgICBzZWxmLm1vdmVkID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cbiAgb25Nb3VzZU92ZXI6IGZ1bmN0aW9uKCkge1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlZCBvdmVyIScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG4gICAgdmFyIGljb25TaXplID0gMTA7XG5cbiAgICB2YXIgZ2xvYmFsID0gc2VsZi50b0dsb2JhbChzZWxmLnBvc2l0aW9uKTtcblxuICAgIHZhciBzY2FsZUxvY2F0aW9ucyA9IFtcbiAgICAgIHt4OiAwLCB5OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMi1pY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMC1zZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMi1pY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzIraWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAsIHk6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMitpY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX1cbiAgICBdO1xuXG4gICAgLy9jb25zb2xlLmxvZyhzY2FsZUxvY2F0aW9uc1swXSk7XG5cbiAgICBzZWxmLnNjYWxlSWNvbnMgPSBbXTtcblxuICAgIHNjYWxlTG9jYXRpb25zLmZvckVhY2goZnVuY3Rpb24obG9jKSB7XG4gICAgICB2YXIgaWNvbiA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICBpY29uLm1vdmVUbygwLDApO1xuICAgICAgaWNvbi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICBpY29uLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgICAgaWNvbi5saW5lU3R5bGUoMSwgMHgwMDAwRkYsIDEpO1xuICAgICAgaWNvbi5iZWdpbkZpbGwoMHhGRkZGRkYsIDEpO1xuICAgICAgaWNvbi5kcmF3Q2lyY2xlKGxvYy54LCBsb2MueSwgbG9jLnNpemUpO1xuICAgICAgaWNvbi5lbmRGaWxsKCk7XG5cbiAgICAgIC8vaWNvblxuICAgICAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAgICAgLy8ub24oJ21vdXNlZG93bicsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KVxuICAgICAgICAvLy5vbigndG91Y2hzdGFydCcsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KTtcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAgIC8vLm9uKCdtb3VzZXVwJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ21vdXNldXBvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgICAvLy5vbignbW91c2Vtb3ZlJywgb25EcmFnTW92ZSlcbiAgICAgIC8vLm9uKCd0b3VjaG1vdmUnLCBvbkRyYWdNb3ZlKVxuXG4gICAgICBzZWxmLnNjYWxlSWNvbnMucHVzaChpY29uKTtcblxuICAgIH0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5hZGRDaGlsZChzKTtcbiAgICB9KTtcblxuICAgIHNlbGYudG9vbHRpcCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgc2VsZi50b29sdGlwLmxpbmVTdHlsZSgzLCAweDAwMDBGRiwgMSk7XG4gICAgc2VsZi50b29sdGlwLmJlZ2luRmlsbCgweDAwMDAwMCwgMSk7XG4gICAgLy9zZWxmLmRyYXcubW92ZVRvKHgseSk7XG4gICAgc2VsZi50b29sdGlwLmRyYXdSb3VuZGVkUmVjdCgwKzIwLC1zZWxmLmhlaWdodCwyMDAsMTAwLDEwKTtcbiAgICBzZWxmLnRvb2x0aXAuZW5kRmlsbCgpO1xuICAgIHNlbGYudG9vbHRpcC50ZXh0U3R5bGUgPSB7XG4gICAgICBmb250IDogJ2JvbGQgaXRhbGljIDI4cHggQXJpYWwnLFxuICAgICAgZmlsbCA6ICcjRjdFRENBJyxcbiAgICAgIHN0cm9rZSA6ICcjNGExODUwJyxcbiAgICAgIHN0cm9rZVRoaWNrbmVzcyA6IDUsXG4gICAgICBkcm9wU2hhZG93IDogdHJ1ZSxcbiAgICAgIGRyb3BTaGFkb3dDb2xvciA6ICcjMDAwMDAwJyxcbiAgICAgIGRyb3BTaGFkb3dBbmdsZSA6IE1hdGguUEkgLyA2LFxuICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlIDogNixcbiAgICAgIHdvcmRXcmFwIDogdHJ1ZSxcbiAgICAgIHdvcmRXcmFwV2lkdGggOiA0NDBcbiAgICB9O1xuXG4gICAgc2VsZi50b29sdGlwLnRleHQgPSBuZXcgUElYSS5UZXh0KHNlbGYubmFtZSxzZWxmLnRvb2x0aXAudGV4dFN0eWxlKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC54ID0gMCszMDtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC55ID0gLXNlbGYuaGVpZ2h0O1xuXG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcClcbiAgICAgIC50byh7eDpzZWxmLndpZHRofSw3MDApXG4gICAgICAuZWFzaW5nKCBUV0VFTi5FYXNpbmcuRWxhc3RpYy5Jbk91dCApXG4gICAgICAuc3RhcnQoKTtcbiAgICBuZXcgVFdFRU4uVHdlZW4oc2VsZi50b29sdGlwLnRleHQpXG4gICAgICAudG8oe3g6c2VsZi53aWR0aCsyMH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG5cbiAgICBjb25zb2xlLmxvZygnQWRkaW5nIHRvb2x0aXAnKTtcbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcCk7XG5cbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvbk1vdXNlT3V0OiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3V0IScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2Ugb3V0Jyk7XG4gICAgdGhpcy5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5yZW1vdmVDaGlsZChzKTtcbiAgICB9KTtcbiAgICAvL2NvbnNvbGUubG9nKCdTaXplOiAnKTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuZ2V0Qm91bmRzKCkpO1xuXG4gICAgc2VsZi5yZW1vdmVDaGlsZChzZWxmLnRvb2x0aXApO1xuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwLnRleHQpO1xuICB9LFxuXG4gIG9uU2NhbGVJY29uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZygnUmVzaXppbmchJyk7XG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50RHJhZ0Ryb3A7XG5cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8xNS8xNS5cbiAqL1xuXG52YXIgQ29tcG9uZW50ID0gcmVxdWlyZSgnLi4vY29tcG9uZW50L2NvbXBvbmVudCcpO1xudmFyIEVsZW1lbnREcmFnRHJvcCA9IHJlcXVpcmUoJy4vZWxlbWVudC5kcmFnLmRyb3AnKTtcblxudmFyIERFRkFVTFRfU0NBTEUgPSAwLjc7XG5cbnZhciBFbGVtZW50ID0gZnVuY3Rpb24oKSB7XG4gIENvbXBvbmVudC5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5zY2FsZS5zZXQoREVGQVVMVF9TQ0FMRSk7XG4gIHNlbGZcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAub24oJ21vdXNlZG93bicsIEVsZW1lbnREcmFnRHJvcC5vbkRyYWdTdGFydClcbiAgICAub24oJ3RvdWNoc3RhcnQnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIGVuZFxuICAgIC5vbignbW91c2V1cCcsIEVsZW1lbnREcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCdtb3VzZXVwb3V0c2lkZScsIEVsZW1lbnREcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCd0b3VjaGVuZCcsIEVsZW1lbnREcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgLm9uKCdtb3VzZW1vdmUnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAub24oJ3RvdWNobW92ZScsIEVsZW1lbnREcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgIC8vIGV2ZW50cyBmb3IgbW91c2Ugb3ZlclxuICAgIC5vbignbW91c2VvdmVyJywgRWxlbWVudERyYWdEcm9wLm9uTW91c2VPdmVyKVxuICAgIC5vbignbW91c2VvdXQnLCBFbGVtZW50RHJhZ0Ryb3Aub25Nb3VzZU91dCk7XG5cbiAgc2VsZi5hcnJvd3MgPSBbXTtcblxuICBzZWxmLmFkZEFycm93VG8gPSBmdW5jdGlvbihiKSB7XG4gICAgc2VsZi5hcnJvd3MucHVzaChiKTtcbiAgfTtcblxuICBzZWxmLnJlbW92ZUFycm93VG8gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHNlbGYuYXJyb3dzLnJlbW92ZShpbmRleCk7XG4gIH07XG5cbn07XG5FbGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRWxlbWVudDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE0LzE1LlxuICovXG5cbnZhciBNT1VTRV9PVkVSX1NDQUxFX1JBVElPID0gMS4xO1xuXG52YXIgRHJhZ0Ryb3AgPSB7XG5cbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coKTtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmKHRoaXMubW92ZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBkcmFnZ2luZycpO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gICAgICB0aGlzLmRhdGEgPSBudWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBOT1QgZHJhZ2dpbmcnKTtcbiAgICAgIHZhciBzaGFkb3cgPSBuZXcgUElYSS5maWx0ZXJzLkRyb3BTaGFkb3dGaWx0ZXIoKTtcbiAgICAgIHRoaXMuZmlsdGVycyA9IFtzaGFkb3ddO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICBjb25zb2xlLmxvZygnUGFyZW50OicpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5wYXJlbnQucGFyZW50KTtcbiAgICAgIGlmKHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCkge1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQuZmlsdGVycyA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcmVudC5wYXJlbnQuY2xpY2tlZE9ubHlTdGFnZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkID0gdGhpcztcbiAgICB9XG4gIH0sXG5cbiAgb25EcmFnTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLmRyYWdnaW5nKVxuICAgIHtcbiAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHNlbGYuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHNlbGYucGFyZW50KTtcbiAgICAgIHNlbGYucG9zaXRpb24ueCA9IG5ld1Bvc2l0aW9uLng7XG4gICAgICBzZWxmLnBvc2l0aW9uLnkgPSBuZXdQb3NpdGlvbi55O1xuICAgICAgc2VsZi5tb3ZlZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG4gIG9uTW91c2VPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3ZlciEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54Kk1PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuICAgIHZhciBpY29uU2l6ZSA9IDEwO1xuXG4gICAgdmFyIGdsb2JhbCA9IHNlbGYudG9HbG9iYWwoc2VsZi5wb3NpdGlvbik7XG4gICAgLy9jb25zb2xlLmxvZygnb2ZmaWNpYWw6ICcgKyBzZWxmLnBvc2l0aW9uLnggKyAnOicgKyBzZWxmLnBvc2l0aW9uLnkpO1xuICAgIC8vY29uc29sZS5sb2coJ0dMT0JBTDogJyArIGdsb2JhbC54ICsgJzonICsgZ2xvYmFsLnkpO1xuICAgIC8vY29uc29sZS5sb2coc2VsZi5nZXRMb2NhbEJvdW5kcygpKTtcblxuICAgIHZhciBzY2FsZUxvY2F0aW9ucyA9IFtcbiAgICAgIHt4OiAwLCB5OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMi1pY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMC1zZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMi1pY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzIraWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAsIHk6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMitpY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX1cbiAgICBdO1xuXG4gICAgLy9jb25zb2xlLmxvZyhzY2FsZUxvY2F0aW9uc1swXSk7XG5cbiAgICBzZWxmLnNjYWxlSWNvbnMgPSBbXTtcblxuICAgIHNjYWxlTG9jYXRpb25zLmZvckVhY2goZnVuY3Rpb24obG9jKSB7XG4gICAgICB2YXIgaWNvbiA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICBpY29uLm1vdmVUbygwLDApO1xuICAgICAgaWNvbi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICBpY29uLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgICAgaWNvbi5saW5lU3R5bGUoMSwgMHgwMDAwRkYsIDEpO1xuICAgICAgaWNvbi5iZWdpbkZpbGwoMHhGRkZGRkYsIDEpO1xuICAgICAgaWNvbi5kcmF3Q2lyY2xlKGxvYy54LCBsb2MueSwgbG9jLnNpemUpO1xuICAgICAgaWNvbi5lbmRGaWxsKCk7XG5cbiAgICAgIC8vaWNvblxuICAgICAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAgICAgLy8ub24oJ21vdXNlZG93bicsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KVxuICAgICAgICAvLy5vbigndG91Y2hzdGFydCcsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KTtcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAgIC8vLm9uKCdtb3VzZXVwJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ21vdXNldXBvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kJywgb25EcmFnRW5kKVxuICAgICAgLy8ub24oJ3RvdWNoZW5kb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgICAvLy5vbignbW91c2Vtb3ZlJywgb25EcmFnTW92ZSlcbiAgICAgIC8vLm9uKCd0b3VjaG1vdmUnLCBvbkRyYWdNb3ZlKVxuXG4gICAgICBzZWxmLnNjYWxlSWNvbnMucHVzaChpY29uKTtcblxuICAgIH0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5hZGRDaGlsZChzKTtcbiAgICB9KTtcblxuICAgIHNlbGYudG9vbHRpcCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgc2VsZi50b29sdGlwLmxpbmVTdHlsZSgzLCAweDAwMDBGRiwgMSk7XG4gICAgc2VsZi50b29sdGlwLmJlZ2luRmlsbCgweDAwMDAwMCwgMSk7XG4gICAgLy9zZWxmLmRyYXcubW92ZVRvKHgseSk7XG4gICAgc2VsZi50b29sdGlwLmRyYXdSb3VuZGVkUmVjdCgwKzIwLC1zZWxmLmhlaWdodCwyMDAsMTAwLDEwKTtcbiAgICBzZWxmLnRvb2x0aXAuZW5kRmlsbCgpO1xuICAgIHNlbGYudG9vbHRpcC50ZXh0U3R5bGUgPSB7XG4gICAgICBmb250IDogJ2JvbGQgaXRhbGljIDI4cHggQXJpYWwnLFxuICAgICAgZmlsbCA6ICcjRjdFRENBJyxcbiAgICAgIHN0cm9rZSA6ICcjNGExODUwJyxcbiAgICAgIHN0cm9rZVRoaWNrbmVzcyA6IDUsXG4gICAgICBkcm9wU2hhZG93IDogdHJ1ZSxcbiAgICAgIGRyb3BTaGFkb3dDb2xvciA6ICcjMDAwMDAwJyxcbiAgICAgIGRyb3BTaGFkb3dBbmdsZSA6IE1hdGguUEkgLyA2LFxuICAgICAgZHJvcFNoYWRvd0Rpc3RhbmNlIDogNixcbiAgICAgIHdvcmRXcmFwIDogdHJ1ZSxcbiAgICAgIHdvcmRXcmFwV2lkdGggOiA0NDBcbiAgICB9O1xuXG4gICAgc2VsZi50b29sdGlwLnRleHQgPSBuZXcgUElYSS5UZXh0KHNlbGYubmFtZSxzZWxmLnRvb2x0aXAudGV4dFN0eWxlKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC54ID0gMCszMDtcbiAgICBzZWxmLnRvb2x0aXAudGV4dC55ID0gLXNlbGYuaGVpZ2h0O1xuXG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcClcbiAgICAgIC50byh7eDpzZWxmLndpZHRofSw3MDApXG4gICAgICAuZWFzaW5nKCBUV0VFTi5FYXNpbmcuRWxhc3RpYy5Jbk91dCApXG4gICAgICAuc3RhcnQoKTtcbiAgICBuZXcgVFdFRU4uVHdlZW4oc2VsZi50b29sdGlwLnRleHQpXG4gICAgICAudG8oe3g6c2VsZi53aWR0aCsyMH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG5cbiAgICBjb25zb2xlLmxvZygnQWRkaW5nIHRvb2x0aXAnKTtcbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcCk7XG5cbiAgICBzZWxmLmFkZENoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvbk1vdXNlT3V0OiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3V0IScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2Ugb3V0Jyk7XG4gICAgdGhpcy5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5yZW1vdmVDaGlsZChzKTtcbiAgICB9KTtcbiAgICAvL2NvbnNvbGUubG9nKCdTaXplOiAnKTtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuZ2V0Qm91bmRzKCkpO1xuXG4gICAgc2VsZi5yZW1vdmVDaGlsZChzZWxmLnRvb2x0aXApO1xuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwLnRleHQpO1xuICB9LFxuXG4gIG9uU2NhbGVJY29uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZygnUmVzaXppbmchJyk7XG4gIH1cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdEcm9wO1xuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudC9jb21wb25lbnQnKTtcbnZhciBHcm91cERyYWdEcm9wID0gcmVxdWlyZSgnLi9ncm91cC5kcmFnLmRyb3AnKTtcblxudmFyIERFRkFVTFRfU0NBTEUgPSAwLjc7XG5cbnZhciBHcm91cCA9IGZ1bmN0aW9uKCkge1xuICBDb21wb25lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuc2NhbGUuc2V0KERFRkFVTFRfU0NBTEUpO1xuICBzZWxmLmFuY2hvci5zZXQoMC41KTtcbiAgc2VsZi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gIHNlbGYuYnV0dG9uTW9kZSA9IHRydWU7XG4gIHNlbGZcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAub24oJ21vdXNlZG93bicsIEdyb3VwRHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgLm9uKCd0b3VjaHN0YXJ0JywgR3JvdXBEcmFnRHJvcC5vbkRyYWdTdGFydClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgLm9uKCdtb3VzZXVwJywgR3JvdXBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCdtb3VzZXVwb3V0c2lkZScsIEdyb3VwRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbigndG91Y2hlbmQnLCBHcm91cERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ3RvdWNoZW5kb3V0c2lkZScsIEdyb3VwRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgLm9uKCdtb3VzZW1vdmUnLCBHcm91cERyYWdEcm9wLm9uRHJhZ01vdmUpXG4gICAgLm9uKCd0b3VjaG1vdmUnLCBHcm91cERyYWdEcm9wLm9uRHJhZ01vdmUpXG4gICAgLy8gZXZlbnRzIGZvciBtb3VzZSBvdmVyXG4gICAgLm9uKCdtb3VzZW92ZXInLCBHcm91cERyYWdEcm9wLm9uTW91c2VPdmVyKVxuICAgIC5vbignbW91c2VvdXQnLCBHcm91cERyYWdEcm9wLm9uTW91c2VPdXQpO1xuXG4gIHNlbGYuYXJyb3dzID0gW107XG5cbiAgc2VsZi5hZGRBcnJvd1RvID0gZnVuY3Rpb24oYikge1xuICAgIHNlbGYuYXJyb3dzLnB1c2goYik7XG4gIH07XG5cbiAgc2VsZi5yZW1vdmVBcnJvd1RvID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBzZWxmLmFycm93cy5yZW1vdmUoaW5kZXgpO1xuICB9O1xuXG59O1xuR3JvdXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDb21wb25lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcm91cDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA3LzkvMTUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgR3VpVXRpbCA9IHJlcXVpcmUoJy4vZ3VpLnV0aWwnKTtcbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi9saWIvZWxlbWVudC9lbGVtZW50Jyk7XG4vL3ZhciBBcnJvdyA9IHJlcXVpcmUoJy4vYXJyb3cnKTtcbnZhciBFZGl0b3JNYW5hZ2VyID0gcmVxdWlyZSgnLi9FZGl0b3JNYW5hZ2VyJyk7XG5cbmZ1bmN0aW9uIHJlc2l6ZUd1aUNvbnRhaW5lcihyZW5kZXJlcikge1xuXG4gIHZhciBkaW0gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuXG4gIGNvbnNvbGUubG9nKCdSZXNpemluZy4uLicpO1xuICBjb25zb2xlLmxvZyhkaW0pO1xuXG4gICQoJyNndWlDb250YWluZXInKS5oZWlnaHQoZGltLnkpO1xuICAkKCcjZ3VpQ29udGFpbmVyJykud2lkdGgoZGltLngpO1xuXG4gIGlmKHJlbmRlcmVyKSB7XG4gICAgcmVuZGVyZXIudmlldy5zdHlsZS53aWR0aCA9IGRpbS54KydweCc7XG4gICAgcmVuZGVyZXIudmlldy5zdHlsZS5oZWlnaHQgPSBkaW0ueSsncHgnO1xuICB9XG5cbiAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIGd1aSBjb250YWluZXIuLi4nKTtcblxufVxuXG52YXIgUGl4aUVkaXRvciA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgdmFyIHRlbXBsYXRlID0gb3B0aW9ucy50ZW1wbGF0ZSgpO1xuICAgIGNvbnNvbGUubG9nKHRlbXBsYXRlKTtcblxuICAgIHZhciBNQU5BR0VSID0gbmV3IEVkaXRvck1hbmFnZXIodGVtcGxhdGUpO1xuICAgIE1BTkFHRVIuaW5pdCgpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyBsaXN0ZW5lci4uLicpO1xuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICByZXNpemVHdWlDb250YWluZXIoTUFOQUdFUi5yZW5kZXJlcik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGVtcGxhdGU6IG9wdGlvbnMudGVtcGxhdGUsXG5cbiAgICAgIGRyYXdDYW52YXNFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBNQU5BR0VSLmFuaW1hdGUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKE1BTkFHRVIucmVuZGVyZXIudmlldyk7XG5cbiAgICAgICAgTUFOQUdFUi5hbmltYXRlKCk7XG5cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHZpZXc6IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICByZXR1cm4gbSgnI2d1aUNvbnRhaW5lcicsIHsgY29uZmlnOiBjb250cm9sbGVyLmRyYXdDYW52YXNFZGl0b3J9KVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpeGlFZGl0b3I7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcmVzaXplRWRpdG9yKGVkaXRvcikge1xuICBlZGl0b3Iuc2V0U2l6ZShudWxsLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xufVxuXG52YXIgU291cmNlRWRpdG9yID0ge1xuXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgIGRyYXdFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgdmFyIGVkaXRvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBpZihlZGl0b3IpIHtcbiAgICAgICAgICAgIGVkaXRvci5yZWZyZXNoKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVkaXRvciA9IENvZGVNaXJyb3IoZWxlbWVudCwge1xuICAgICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShvcHRpb25zLnRlbXBsYXRlKCksIHVuZGVmaW5lZCwgMiksXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgbW9kZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIGd1dHRlcnM6IFsnQ29kZU1pcnJvci1saW50LW1hcmtlcnMnXSxcbiAgICAgICAgICBsaW50OiB0cnVlLFxuICAgICAgICAgIHN0eWxlQWN0aXZlTGluZTogdHJ1ZSxcbiAgICAgICAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIHRoZW1lOiAnemVuYnVybidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzaXplRWRpdG9yKGVkaXRvcik7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlZGl0b3IpIHtcbiAgICAgICAgICBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcbiAgICAgICAgICBvcHRpb25zLnRlbXBsYXRlKEpTT04ucGFyc2UoZWRpdG9yLmdldFZhbHVlKCkpKTtcbiAgICAgICAgICBtLmVuZENvbXB1dGF0aW9uKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBbXG4gICAgICBtKCcjc291cmNlRWRpdG9yJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0VkaXRvciB9KVxuICAgIF1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb3VyY2VFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBTb3VyY2VFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvc291cmNlLmVkaXRvcicpO1xudmFyIFBpeGlFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcGl4aS5lZGl0b3InKTtcblxudmFyIHRlc3REYXRhID0gcmVxdWlyZSgnLi90ZXN0RGF0YS9lYzIuanNvbicpO1xuXG52YXIgdGVtcGxhdGUgPSBtLnByb3AodGVzdERhdGEpO1xuXG5tLm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbG91ZHNsaWNlci1hcHAnKSwgbS5jb21wb25lbnQoUGl4aUVkaXRvciwge1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB9KVxuKTtcblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZS1iYXInKSwgbS5jb21wb25lbnQoU291cmNlRWRpdG9yLCB7XG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIH0pXG4pO1xuIiwibW9kdWxlLmV4cG9ydHM9XG57XG4gIFwiQVdTVGVtcGxhdGVGb3JtYXRWZXJzaW9uXCIgOiBcIjIwMTAtMDktMDlcIixcblxuICBcIkRlc2NyaXB0aW9uXCIgOiBcIkFXUyBDbG91ZEZvcm1hdGlvbiBTYW1wbGUgVGVtcGxhdGUgRUMySW5zdGFuY2VXaXRoU2VjdXJpdHlHcm91cFNhbXBsZTogQ3JlYXRlIGFuIEFtYXpvbiBFQzIgaW5zdGFuY2UgcnVubmluZyB0aGUgQW1hem9uIExpbnV4IEFNSS4gVGhlIEFNSSBpcyBjaG9zZW4gYmFzZWQgb24gdGhlIHJlZ2lvbiBpbiB3aGljaCB0aGUgc3RhY2sgaXMgcnVuLiBUaGlzIGV4YW1wbGUgY3JlYXRlcyBhbiBFQzIgc2VjdXJpdHkgZ3JvdXAgZm9yIHRoZSBpbnN0YW5jZSB0byBnaXZlIHlvdSBTU0ggYWNjZXNzLiAqKldBUk5JTkcqKiBUaGlzIHRlbXBsYXRlIGNyZWF0ZXMgYW4gQW1hem9uIEVDMiBpbnN0YW5jZS4gWW91IHdpbGwgYmUgYmlsbGVkIGZvciB0aGUgQVdTIHJlc291cmNlcyB1c2VkIGlmIHlvdSBjcmVhdGUgYSBzdGFjayBmcm9tIHRoaXMgdGVtcGxhdGUuXCIsXG5cbiAgXCJQYXJhbWV0ZXJzXCIgOiB7XG4gICAgXCJLZXlOYW1lXCI6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiTmFtZSBvZiBhbiBleGlzdGluZyBFQzIgS2V5UGFpciB0byBlbmFibGUgU1NIIGFjY2VzcyB0byB0aGUgaW5zdGFuY2VcIixcbiAgICAgIFwiVHlwZVwiOiBcIkFXUzo6RUMyOjpLZXlQYWlyOjpLZXlOYW1lXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIHRoZSBuYW1lIG9mIGFuIGV4aXN0aW5nIEVDMiBLZXlQYWlyLlwiXG4gICAgfSxcblxuICAgIFwiSW5zdGFuY2VUeXBlXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIldlYlNlcnZlciBFQzIgaW5zdGFuY2UgdHlwZVwiLFxuICAgICAgXCJUeXBlXCIgOiBcIlN0cmluZ1wiLFxuICAgICAgXCJEZWZhdWx0XCIgOiBcIm0xLnNtYWxsXCIsXG4gICAgICBcIkFsbG93ZWRWYWx1ZXNcIiA6IFsgXCJ0MS5taWNyb1wiLCBcInQyLm1pY3JvXCIsIFwidDIuc21hbGxcIiwgXCJ0Mi5tZWRpdW1cIiwgXCJtMS5zbWFsbFwiLCBcIm0xLm1lZGl1bVwiLCBcIm0xLmxhcmdlXCIsIFwibTEueGxhcmdlXCIsIFwibTIueGxhcmdlXCIsIFwibTIuMnhsYXJnZVwiLCBcIm0yLjR4bGFyZ2VcIiwgXCJtMy5tZWRpdW1cIiwgXCJtMy5sYXJnZVwiLCBcIm0zLnhsYXJnZVwiLCBcIm0zLjJ4bGFyZ2VcIiwgXCJjMS5tZWRpdW1cIiwgXCJjMS54bGFyZ2VcIiwgXCJjMy5sYXJnZVwiLCBcImMzLnhsYXJnZVwiLCBcImMzLjJ4bGFyZ2VcIiwgXCJjMy40eGxhcmdlXCIsIFwiYzMuOHhsYXJnZVwiLCBcImM0LmxhcmdlXCIsIFwiYzQueGxhcmdlXCIsIFwiYzQuMnhsYXJnZVwiLCBcImM0LjR4bGFyZ2VcIiwgXCJjNC44eGxhcmdlXCIsIFwiZzIuMnhsYXJnZVwiLCBcInIzLmxhcmdlXCIsIFwicjMueGxhcmdlXCIsIFwicjMuMnhsYXJnZVwiLCBcInIzLjR4bGFyZ2VcIiwgXCJyMy44eGxhcmdlXCIsIFwiaTIueGxhcmdlXCIsIFwiaTIuMnhsYXJnZVwiLCBcImkyLjR4bGFyZ2VcIiwgXCJpMi44eGxhcmdlXCIsIFwiZDIueGxhcmdlXCIsIFwiZDIuMnhsYXJnZVwiLCBcImQyLjR4bGFyZ2VcIiwgXCJkMi44eGxhcmdlXCIsIFwiaGkxLjR4bGFyZ2VcIiwgXCJoczEuOHhsYXJnZVwiLCBcImNyMS44eGxhcmdlXCIsIFwiY2MyLjh4bGFyZ2VcIiwgXCJjZzEuNHhsYXJnZVwiXVxuICAgICxcbiAgICAgIFwiQ29uc3RyYWludERlc2NyaXB0aW9uXCIgOiBcIm11c3QgYmUgYSB2YWxpZCBFQzIgaW5zdGFuY2UgdHlwZS5cIlxuICAgIH0sXG5cbiAgICBcIlNTSExvY2F0aW9uXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIlRoZSBJUCBhZGRyZXNzIHJhbmdlIHRoYXQgY2FuIGJlIHVzZWQgdG8gU1NIIHRvIHRoZSBFQzIgaW5zdGFuY2VzXCIsXG4gICAgICBcIlR5cGVcIjogXCJTdHJpbmdcIixcbiAgICAgIFwiTWluTGVuZ3RoXCI6IFwiOVwiLFxuICAgICAgXCJNYXhMZW5ndGhcIjogXCIxOFwiLFxuICAgICAgXCJEZWZhdWx0XCI6IFwiMC4wLjAuMC8wXCIsXG4gICAgICBcIkFsbG93ZWRQYXR0ZXJuXCI6IFwiKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pLyhcXFxcZHsxLDJ9KVwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIjogXCJtdXN0IGJlIGEgdmFsaWQgSVAgQ0lEUiByYW5nZSBvZiB0aGUgZm9ybSB4LngueC54L3guXCJcbiAgICB9XG4gIH0sXG5cbiAgXCJNYXBwaW5nc1wiIDoge1xuICAgIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiA6IHtcbiAgICAgIFwidDEubWljcm9cIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcInQyLm1pY3JvXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJ0Mi5zbWFsbFwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwidDIubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0xLnNtYWxsXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMy5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzEubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcImMxLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJjMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZzIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTUcyXCIgIH0sXG4gICAgICBcInIzLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJoaTEuNHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaHMxLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImNyMS44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjYzIuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfVxuICAgIH1cbiAgLFxuICAgIFwiQVdTUmVnaW9uQXJjaDJBTUlcIiA6IHtcbiAgICAgIFwidXMtZWFzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktMGY0Y2ZkNjRcIiwgXCJIVk02NFwiIDogXCJhbWktMGQ0Y2ZkNjZcIiwgXCJIVk1HMlwiIDogXCJhbWktNWIwNWJhMzBcIn0sXG4gICAgICBcInVzLXdlc3QtMlwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWQzYzVkMWUzXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWQ1YzVkMWU1XCIsIFwiSFZNRzJcIiA6IFwiYW1pLWE5ZDZjMDk5XCJ9LFxuICAgICAgXCJ1cy13ZXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS04NWVhMTNjMVwiLCBcIkhWTTY0XCIgOiBcImFtaS04N2VhMTNjM1wiLCBcIkhWTUcyXCIgOiBcImFtaS0zNzgyN2E3M1wifSxcbiAgICAgIFwiZXUtd2VzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktZDZkMThlYTFcIiwgXCJIVk02NFwiIDogXCJhbWktZTRkMThlOTNcIiwgXCJIVk1HMlwiIDogXCJhbWktNzJhOWYxMDVcIn0sXG4gICAgICBcImV1LWNlbnRyYWwtMVwiICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWE0YjBiN2I5XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWE2YjBiN2JiXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWE2YzljZmJiXCJ9LFxuICAgICAgXCJhcC1ub3J0aGVhc3QtMVwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS0xYTFiOWYxYVwiLCBcIkhWTTY0XCIgOiBcImFtaS0xYzFiOWYxY1wiLCBcIkhWTUcyXCIgOiBcImFtaS1mNjQ0YzRmNlwifSxcbiAgICAgIFwiYXAtc291dGhlYXN0LTFcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktZDI0YjQyODBcIiwgXCJIVk02NFwiIDogXCJhbWktZDQ0YjQyODZcIiwgXCJIVk1HMlwiIDogXCJhbWktMTJiNWJjNDBcIn0sXG4gICAgICBcImFwLXNvdXRoZWFzdC0yXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWVmN2IzOWQ1XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWRiN2IzOWUxXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWIzMzM3ZTg5XCJ9LFxuICAgICAgXCJzYS1lYXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS01YjA5ODE0NlwiLCBcIkhWTTY0XCIgOiBcImFtaS01NTA5ODE0OFwiLCBcIkhWTUcyXCIgOiBcIk5PVF9TVVBQT1JURURcIn0sXG4gICAgICBcImNuLW5vcnRoLTFcIiAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWJlYzQ1ODg3XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWJjYzQ1ODg1XCIsIFwiSFZNRzJcIiA6IFwiTk9UX1NVUFBPUlRFRFwifVxuICAgIH1cblxuICB9LFxuXG4gIFwiUmVzb3VyY2VzXCIgOiB7XG4gICAgXCJFQzJJbnN0YW5jZVwiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpJbnN0YW5jZVwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiSW5zdGFuY2VUeXBlXCIgOiB7IFwiUmVmXCIgOiBcIkluc3RhbmNlVHlwZVwiIH0sXG4gICAgICAgIFwiU2VjdXJpdHlHcm91cHNcIiA6IFsgeyBcIlJlZlwiIDogXCJJbnN0YW5jZVNlY3VyaXR5R3JvdXBcIiB9IF0sXG4gICAgICAgIFwiS2V5TmFtZVwiIDogeyBcIlJlZlwiIDogXCJLZXlOYW1lXCIgfSxcbiAgICAgICAgXCJJbWFnZUlkXCIgOiB7IFwiRm46OkZpbmRJbk1hcFwiIDogWyBcIkFXU1JlZ2lvbkFyY2gyQU1JXCIsIHsgXCJSZWZcIiA6IFwiQVdTOjpSZWdpb25cIiB9LFxuICAgICAgICAgIHsgXCJGbjo6RmluZEluTWFwXCIgOiBbIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiwgeyBcIlJlZlwiIDogXCJJbnN0YW5jZVR5cGVcIiB9LCBcIkFyY2hcIiBdIH0gXSB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiSW5zdGFuY2VTZWN1cml0eUdyb3VwXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6OlNlY3VyaXR5R3JvdXBcIixcbiAgICAgIFwiUHJvcGVydGllc1wiIDoge1xuICAgICAgICBcIkdyb3VwRGVzY3JpcHRpb25cIiA6IFwiRW5hYmxlIFNTSCBhY2Nlc3MgdmlhIHBvcnQgMjJcIixcbiAgICAgICAgXCJTZWN1cml0eUdyb3VwSW5ncmVzc1wiIDogWyB7XG4gICAgICAgICAgXCJJcFByb3RvY29sXCIgOiBcInRjcFwiLFxuICAgICAgICAgIFwiRnJvbVBvcnRcIiA6IFwiMjJcIixcbiAgICAgICAgICBcIlRvUG9ydFwiIDogXCIyMlwiLFxuICAgICAgICAgIFwiQ2lkcklwXCIgOiB7IFwiUmVmXCIgOiBcIlNTSExvY2F0aW9uXCJ9XG4gICAgICAgIH0gXVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBcIk91dHB1dHNcIiA6IHtcbiAgICBcIkluc3RhbmNlSWRcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiSW5zdGFuY2VJZCBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJSZWZcIiA6IFwiRUMySW5zdGFuY2VcIiB9XG4gICAgfSxcbiAgICBcIkFaXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIkF2YWlsYWJpbGl0eSBab25lIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIkZuOjpHZXRBdHRcIiA6IFsgXCJFQzJJbnN0YW5jZVwiLCBcIkF2YWlsYWJpbGl0eVpvbmVcIiBdIH1cbiAgICB9LFxuICAgIFwiUHVibGljRE5TXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIlB1YmxpYyBETlNOYW1lIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIkZuOjpHZXRBdHRcIiA6IFsgXCJFQzJJbnN0YW5jZVwiLCBcIlB1YmxpY0Ruc05hbWVcIiBdIH1cbiAgICB9LFxuICAgIFwiUHVibGljSVBcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiUHVibGljIElQIGFkZHJlc3Mgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiRm46OkdldEF0dFwiIDogWyBcIkVDMkluc3RhbmNlXCIsIFwiUHVibGljSXBcIiBdIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
