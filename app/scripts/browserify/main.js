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

    var menu = self.drawComponentMenu();
    self.stage.addChild(menu);
  };

  self.init = function() {
    self.gridOn();
    PIXI.loader
      .add('../resources/sprites/sprites.json')
      .load(self.onLoaded);
  };

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

  self.drawComponentMenu = function() {

    var dim = GuiUtil.getWindowDimension();
    var container = new PIXI.Container();

    var instanceMenuComponent = buildMenuComponent(
      dim.x-40,
      dim.y/2,
      PIXI.Texture.fromFrame('Compute_&_Networking_Amazon_EC2_Instance.png'),
      0.2,
      function() {
        console.log('Clicked.');
        var instance = new AWS_EC2_Instance('New_Instance', dim.x/2, dim.y/2);
        self.elements.add(instance);
      });

    console.log('menu instance');
    console.log(instanceMenuComponent);
    container.addChild(instanceMenuComponent);

    /*
    var menuSprite = new PIXI.Sprite();
    menuSprite.scale.set(0.2);
    menuSprite.x = dim.x-40;
    menuSprite.y = dim.y/2;
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
      container.addChild(menuSprite);
*/
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
    console.log('menu sec grp');
    console.log(menuSecGroup);

    container.addChild(menuSecGroup);

    return container;

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL0VkaXRvck1hbmFnZXIuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX0VJUC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvYXdzL0FXU19FQzJfSW5zdGFuY2UuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX1NlY3VyaXR5R3JvdXAuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfVXNlcnMuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2RyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZ3VpLnV0aWwuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2xpYi9jb2xsZWN0aW9uL2NvbGxlY3Rpb24uanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2xpYi9jb21wb25lbnQvY29tcG9uZW50LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9saWIvZWxlbWVudC9lbGVtZW50LmRyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2VsZW1lbnQvZWxlbWVudC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2dyb3VwL2dyb3VwLmRyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvbGliL2dyb3VwL2dyb3VwLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9waXhpLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvc291cmNlLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL21haW4uanMiLCJhcHAvc2NyaXB0cy90ZXN0RGF0YS9lYzIuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzI2LzE1LlxuICovXG5cbnZhciBHdWlVdGlsID0gcmVxdWlyZSgnLi9ndWkudXRpbCcpO1xudmFyIENvbGxlY3Rpb24gPSByZXF1aXJlKCcuL2xpYi9jb2xsZWN0aW9uL2NvbGxlY3Rpb24nKTtcbnZhciBBV1NfVXNlcnMgPSByZXF1aXJlKCcuL2F3cy9BV1NfVXNlcnMnKTtcbnZhciBBV1NfRUMyX0luc3RhbmNlID0gcmVxdWlyZSgnLi9hd3MvQVdTX0VDMl9JbnN0YW5jZScpO1xudmFyIEFXU19FQzJfRUlQID0gcmVxdWlyZSgnLi9hd3MvQVdTX0VDMl9FSVAnKTtcbnZhciBBV1NfRUMyX1NlY3VyaXR5R3JvdXAgPSByZXF1aXJlKCcuL2F3cy9BV1NfRUMyX1NlY3VyaXR5R3JvdXAnKTtcblxudmFyIEVkaXRvck1hbmFnZXIgPSBmdW5jdGlvbih0ZW1wbGF0ZSkge1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB2YXIgZnBzU3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgZnBzU3RhdHMuc2V0TW9kZSgwKTtcbiAgLy8gYWxpZ24gdG9wLWxlZnRcbiAgZnBzU3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIGZwc1N0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICcwcHgnO1xuICBmcHNTdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBmcHNTdGF0cy5kb21FbGVtZW50ICk7XG5cbiAgdmFyIG1zU3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgbXNTdGF0cy5zZXRNb2RlKDEpO1xuICAvLyBhbGlnbiB0b3AtbGVmdFxuICBtc1N0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICBtc1N0YXRzLmRvbUVsZW1lbnQuc3R5bGUubGVmdCA9ICc4MHB4JztcbiAgbXNTdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBtc1N0YXRzLmRvbUVsZW1lbnQgKTtcblxuICB2YXIgbWJTdGF0cyA9IG5ldyBTdGF0cygpO1xuICBtYlN0YXRzLnNldE1vZGUoMik7XG4gIC8vIGFsaWduIHRvcC1sZWZ0XG4gIG1iU3RhdHMuZG9tRWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIG1iU3RhdHMuZG9tRWxlbWVudC5zdHlsZS5sZWZ0ID0gJzE2MHB4JztcbiAgbWJTdGF0cy5kb21FbGVtZW50LnN0eWxlLnRvcCA9ICcwcHgnO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBtYlN0YXRzLmRvbUVsZW1lbnQgKTtcblxuXG4gIGZwcyA9IDYwO1xuICB2YXIgbm93O1xuICB2YXIgdGhlbiA9IERhdGUubm93KCk7XG4gIHZhciBpbnRlcnZhbCA9IDEwMDAvZnBzO1xuICB2YXIgZGVsdGE7XG4gIC8vdmFyIG1ldGVyID0gbmV3IEZQU01ldGVyKCk7XG4gIHZhciB3aW5EaW1lbnNpb24gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuICB2YXIgZ3JpZCA9IG51bGw7XG5cbiAgc2VsZi5yZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSwge2JhY2tncm91bmRDb2xvciA6IDB4RkZGRkZGfSk7XG5cbiAgc2VsZi5zdGFnZSA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICBzZWxmLnN0YWdlLm5hbWUgPSAnc3RhZ2UnO1xuICBzZWxmLnN0YWdlLnNlbGVjdGVkID0gbnVsbDtcbiAgc2VsZi5zdGFnZS5jbGlja2VkT25seVN0YWdlID0gdHJ1ZTtcbiAgc2VsZi5zdGFnZS5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gIHNlbGYuc3RhZ2Uub24oJ21vdXNldXAnLCBmdW5jdGlvbigpIHtcbiAgICBpZihzZWxmLnN0YWdlLmNsaWNrZWRPbmx5U3RhZ2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBzdGFnZSBjbGljaycpO1xuICAgICAgaWYoc2VsZi5zdGFnZS5zZWxlY3RlZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhzZWxmLnN0YWdlLnNlbGVjdGVkKTtcbiAgICAgICAgc2VsZi5zdGFnZS5zZWxlY3RlZC5maWx0ZXJzID0gbnVsbDtcbiAgICAgICAgc2VsZi5zdGFnZS5zZWxlY3RlZCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc2VsZi5zdGFnZS5jbGlja2VkT25seVN0YWdlID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHNlbGYuc3RhZ2UuTUFOQUdFUiA9IHNlbGY7XG5cbiAgc2VsZi5zZWN1cml0eWdyb3VwcyA9IG5ldyBDb2xsZWN0aW9uKCk7XG4gIHNlbGYuZWxlbWVudHMgPSBuZXcgQ29sbGVjdGlvbigpO1xuXG4gIHZhciBjb2xsaXNpb25tYW5hZ2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgY29sbFNlbGYgPSB0aGlzO1xuXG4gICAgY29sbFNlbGYuc2VjR3JvdXBWc0VsZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VjR3JwcyA9IHNlbGYuc2VjdXJpdHlncm91cHM7XG4gICAgICB2YXIgZWxlbXMgPSBzZWxmLmVsZW1lbnRzO1xuXG4gICAgICBfLmVhY2goc2VjR3Jwcy5lbGVtZW50cywgZnVuY3Rpb24ocykge1xuXG4gICAgICAgIF8uZWFjaChlbGVtcy5lbGVtZW50cywgZnVuY3Rpb24oZSkge1xuXG4gICAgICAgICAgdmFyIHhkaXN0ID0gcy5wb3NpdGlvbi54IC0gZS5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgaWYoeGRpc3QgPiAtcy53aWR0aC8yICYmIHhkaXN0IDwgcy53aWR0aC8yKVxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZhciB5ZGlzdCA9IHMucG9zaXRpb24ueSAtIGUucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgaWYoeWRpc3QgPiAtcy5oZWlnaHQvMiAmJiB5ZGlzdCA8IHMuaGVpZ2h0LzIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIC8vICBjb25zb2xlLmxvZygnQ29sbGlzaW9uIGRldGVjdGVkIScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgY29sbFNlbGYudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBjb2xsU2VsZi5zZWNHcm91cFZzRWxlbWVudHMoKTtcbiAgICB9O1xuXG4gIH07XG5cbiAgc2VsZi5Db2xsaXNpb25NYW5hZ2VyID0gbmV3IGNvbGxpc2lvbm1hbmFnZXIoKTtcblxuICBzZWxmLmFuaW1hdGUgPSBmdW5jdGlvbih0aW1lKSB7XG5cbiAgICBub3cgPSBEYXRlLm5vdygpO1xuICAgIGRlbHRhID0gbm93IC0gdGhlbjtcblxuICAgIGlmIChkZWx0YSA+IGludGVydmFsKSB7XG4gICAgICBmcHNTdGF0cy5iZWdpbigpO1xuICAgICAgbXNTdGF0cy5iZWdpbigpO1xuICAgICAgbWJTdGF0cy5iZWdpbigpO1xuXG4gICAgICAvL3NlbGYuQ29sbGlzaW9uTWFuYWdlci51cGRhdGUoKTtcblxuICAgICAgdGhlbiA9IG5vdyAtIChkZWx0YSAlIGludGVydmFsKTtcbiAgICAgIC8vbWV0ZXIudGljaygpO1xuXG4gICAgICBUV0VFTi51cGRhdGUodGltZSk7XG4gICAgICBzZWxmLnJlbmRlcmVyLnJlbmRlcihzZWxmLnN0YWdlKTtcblxuICAgICAgZnBzU3RhdHMuZW5kKCk7XG4gICAgICBtc1N0YXRzLmVuZCgpO1xuICAgICAgbWJTdGF0cy5lbmQoKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc2VsZi5hbmltYXRlKTtcbiAgfTtcblxuICBzZWxmLmdyaWRPbiA9IGZ1bmN0aW9uKCkge1xuICAgIGdyaWQgPSBHdWlVdGlsLmRyYXdHcmlkKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSk7XG4gICAgc2VsZi5zdGFnZS5hZGRDaGlsZChncmlkKTtcbiAgfTtcblxuICBzZWxmLmdyaWRPZmYgPSBmdW5jdGlvbigpIHtcbiAgICBzZWxmLnN0YWdlLnJlbW92ZUNoaWxkKGdyaWQpO1xuICAgIHNlbGYuZ3JpZCA9IG51bGw7XG4gIH07XG5cbiAgc2VsZi5vbkxvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdBc3NldHMgbG9hZGVkJyk7XG5cbiAgICB2YXIgZGltID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcbiAgICBjb25zb2xlLmxvZyhzZWxmLmVsZW1lbnRzLnBvc2l0aW9uKTtcblxuICAgIHZhciB1c2VycyA9IG5ldyBBV1NfVXNlcnMoJ3VzZXJzJywgZGltLngvMiwgMTAwKTtcbiAgICBjb25zb2xlLmxvZyh1c2Vycy5wb3NpdGlvbik7XG4gICAgc2VsZi5lbGVtZW50cy5hZGQodXNlcnMpO1xuXG4gICAgY29uc29sZS5sb2codGVtcGxhdGUuUmVzb3VyY2VzKTtcblxuICAgIHZhciBncm91cGluZ3MgPSBfLnJlZHVjZSh0ZW1wbGF0ZS5SZXNvdXJjZXMsIGZ1bmN0aW9uKHJlc3VsdCwgbiwga2V5KSB7XG4gICAgICByZXN1bHRbbi5UeXBlXSA9IHt9O1xuICAgICAgcmVzdWx0W24uVHlwZV1ba2V5XSA9IG47XG4gICAgICByZXR1cm4gcmVzdWx0XG4gICAgfSwge30pO1xuICAgIGNvbnNvbGUubG9nKCdHcm91cGluZ3M6Jyk7XG4gICAgY29uc29sZS5sb2coZ3JvdXBpbmdzKTtcblxuICAgIHZhciBpbnN0YW5jZXMgPSB7fTtcbiAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6SW5zdGFuY2UnXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQVdTX0VDMl9JbnN0YW5jZShrZXksIGRpbS54LzIsIDQwMCk7XG4gICAgICBpbnN0YW5jZXNba2V5XSA9IGluc3RhbmNlO1xuICAgIH0pO1xuXG4gICAgdmFyIGVpcHMgPSB7fTtcbiAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6RUlQJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgY29uc29sZS5sb2coJ0FkZGluZyBFSVAgJywga2V5KTtcbiAgICAgIHZhciBlaXAgPSBuZXcgQVdTX0VDMl9FSVAoa2V5LCBkaW0ueC8yLCA1MDApO1xuICAgICAgZWlwc1trZXldID0gZWlwO1xuICAgIH0pO1xuXG4gICAgdmFyIHNlY2dyb3VwcyA9IHt9O1xuICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpTZWN1cml0eUdyb3VwJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgY29uc29sZS5sb2coJ0FkZGluZyBTZWN1cml0eSBHcm91cCAnLCBrZXkpO1xuICAgICAgdmFyIHNlY2dyb3VwID0gbmV3IEFXU19FQzJfU2VjdXJpdHlHcm91cChrZXksIGRpbS54LzIsIDUwMCk7XG4gICAgICBzZWNncm91cHNba2V5XSA9IHNlY2dyb3VwO1xuICAgIH0pO1xuXG4gICAgdmFyIGNvbWJvSW5zdGFuY2VzID0ge307XG4gICAgXy5lYWNoKGdyb3VwaW5nc1snQVdTOjpFQzI6OkVJUEFzc29jaWF0aW9uJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgY29uc29sZS5sb2coJ0NoZWNraW5nIGFzc29jaWF0aW9uJyk7XG4gICAgICBjb25zb2xlLmxvZyhuKTtcbiAgICAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICBjb25zb2xlLmxvZyhlaXBzKTtcbiAgICAgIGNvbnNvbGUubG9nKCdSZWY6ICcsbi5Qcm9wZXJ0aWVzLkVJUC5SZWYpO1xuICAgICAgdmFyIGluc3RhbmNlID0gaW5zdGFuY2VzW24uUHJvcGVydGllcy5JbnN0YW5jZUlkLlJlZl07XG4gICAgICBpZihpbnN0YW5jZSkge1xuICAgICAgICB2YXIgZWlwID0gZWlwc1tuLlByb3BlcnRpZXMuRUlQLlJlZl07XG4gICAgICAgIGlmKGVpcCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdBc3NvY2lhdGlvbiBoYXMgYSBtYXRjaCEnKTtcbiAgICAgICAgICB2YXIgY29udGFpbmVyID0gbmV3IENvbGxlY3Rpb24oKTtcbiAgICAgICAgICBjb250YWluZXIuYWRkKGluc3RhbmNlKTtcbiAgICAgICAgICBjb250YWluZXIuYWRkKGVpcCk7XG4gICAgICAgICAgY29tYm9JbnN0YW5jZXNba2V5XSA9IGNvbnRhaW5lcjtcbiAgICAgICAgICBkZWxldGUgaW5zdGFuY2VzW24uUHJvcGVydGllcy5JbnN0YW5jZUlkLlJlZl07XG4gICAgICAgICAgZGVsZXRlIGVpcHNbbi5Qcm9wZXJ0aWVzLkVJUC5SZWZdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL3ZhciBlaXAgPSBuZXcgQVdTX0VDMl9FSVAoa2V5LCBkaW0ueC8yLCA1MDApO1xuICAgICAgLy9laXBzW2tleV0gPSBlaXA7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goc2VjZ3JvdXBzLCBmdW5jdGlvbihzLCBrZXkpIHtcbiAgICAgIHNlbGYuc2VjdXJpdHlncm91cHMuYWRkKHMpO1xuICAgIH0pO1xuXG4gICAgXy5lYWNoKGNvbWJvSW5zdGFuY2VzLCBmdW5jdGlvbihjb21ibywga2V5KSB7XG4gICAgICBzZWxmLmVsZW1lbnRzLmFkZChjb21ibyk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goaW5zdGFuY2VzLCBmdW5jdGlvbihpbnN0YW5jZSwga2V5KSB7XG4gICAgICBzZWxmLmVsZW1lbnRzLmFkZChpbnN0YW5jZSk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goZWlwcywgZnVuY3Rpb24oZWlwLCBrZXkpIHtcbiAgICAgIHNlbGYuZWxlbWVudHMuYWRkKGVpcCk7XG4gICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnQ2hpbGRyZW46Jyk7XG4gICAgY29uc29sZS5sb2coc2VsZi5lbGVtZW50cy5jaGlsZHJlbik7XG5cbiAgICBzZWxmLnN0YWdlLmFkZENoaWxkKHNlbGYuc2VjdXJpdHlncm91cHMpO1xuICAgIHNlbGYuc3RhZ2UuYWRkQ2hpbGQoc2VsZi5lbGVtZW50cyk7XG4gICAgY29uc29sZS5sb2coc2VsZi5zdGFnZS5jaGlsZHJlbik7XG5cbiAgICB2YXIgbWVudSA9IHNlbGYuZHJhd0NvbXBvbmVudE1lbnUoKTtcbiAgICBzZWxmLnN0YWdlLmFkZENoaWxkKG1lbnUpO1xuICB9O1xuXG4gIHNlbGYuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuZ3JpZE9uKCk7XG4gICAgUElYSS5sb2FkZXJcbiAgICAgIC5hZGQoJy4uL3Jlc291cmNlcy9zcHJpdGVzL3Nwcml0ZXMuanNvbicpXG4gICAgICAubG9hZChzZWxmLm9uTG9hZGVkKTtcbiAgfTtcblxuICBmdW5jdGlvbiBidWlsZE1lbnVDb21wb25lbnQoeCx5LCB0ZXh0dXJlLCBzY2FsZSwgbW91c2VVcENhbGxiYWNrKSB7XG4gICAgdmFyIG1lbnVDb21wb25lbnQgPSBuZXcgUElYSS5TcHJpdGUoKTtcbiAgICBtZW51Q29tcG9uZW50LnRleHR1cmUgPSB0ZXh0dXJlO1xuICAgIG1lbnVDb21wb25lbnQuc2NhbGUuc2V0KHNjYWxlKTtcbiAgICBtZW51Q29tcG9uZW50LnggPSB4O1xuICAgIG1lbnVDb21wb25lbnQueSA9IHk7XG4gICAgbWVudUNvbXBvbmVudC5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgbWVudUNvbXBvbmVudC5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICBtZW51Q29tcG9uZW50LmFuY2hvci5zZXQoMC41KTtcbiAgICBtZW51Q29tcG9uZW50XG4gICAgICAub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueCoxLjIpO1xuICAgICAgfSlcbiAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvMS4yKTtcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNldXAnLCBtb3VzZVVwQ2FsbGJhY2spO1xuICAgIHJldHVybiBtZW51Q29tcG9uZW50O1xuICB9XG5cbiAgc2VsZi5kcmF3Q29tcG9uZW50TWVudSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGRpbSA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG4gICAgdmFyIGNvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuXG4gICAgdmFyIGluc3RhbmNlTWVudUNvbXBvbmVudCA9IGJ1aWxkTWVudUNvbXBvbmVudChcbiAgICAgIGRpbS54LTQwLFxuICAgICAgZGltLnkvMixcbiAgICAgIFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ0NvbXB1dGVfJl9OZXR3b3JraW5nX0FtYXpvbl9FQzJfSW5zdGFuY2UucG5nJyksXG4gICAgICAwLjIsXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0NsaWNrZWQuJyk7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBBV1NfRUMyX0luc3RhbmNlKCdOZXdfSW5zdGFuY2UnLCBkaW0ueC8yLCBkaW0ueS8yKTtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5hZGQoaW5zdGFuY2UpO1xuICAgICAgfSk7XG5cbiAgICBjb25zb2xlLmxvZygnbWVudSBpbnN0YW5jZScpO1xuICAgIGNvbnNvbGUubG9nKGluc3RhbmNlTWVudUNvbXBvbmVudCk7XG4gICAgY29udGFpbmVyLmFkZENoaWxkKGluc3RhbmNlTWVudUNvbXBvbmVudCk7XG5cbiAgICAvKlxuICAgIHZhciBtZW51U3ByaXRlID0gbmV3IFBJWEkuU3ByaXRlKCk7XG4gICAgbWVudVNwcml0ZS5zY2FsZS5zZXQoMC4yKTtcbiAgICBtZW51U3ByaXRlLnggPSBkaW0ueC00MDtcbiAgICBtZW51U3ByaXRlLnkgPSBkaW0ueS8yO1xuICAgIG1lbnVTcHJpdGUuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgIG1lbnVTcHJpdGUuYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgbWVudVNwcml0ZS5hbmNob3Iuc2V0KDAuNSk7XG4gICAgbWVudVNwcml0ZVxuICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqMS4yKTtcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54LzEuMik7XG4gICAgICB9KVxuICAgICAgY29udGFpbmVyLmFkZENoaWxkKG1lbnVTcHJpdGUpO1xuKi9cbiAgICB2YXIgbWVudVNlY0dyb3VwID0gbmV3IFBJWEkuU3ByaXRlKCk7XG4gICAgdmFyIG1lbnVHcmFwaGljID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICBtZW51R3JhcGhpYy5saW5lU3R5bGUoMywgMHgwMDAwMDAsIDEpO1xuICAgIG1lbnVHcmFwaGljLmJlZ2luRmlsbCgweEZGRkZGRiwgMSk7XG4gICAgbWVudUdyYXBoaWMuZHJhd1JvdW5kZWRSZWN0KDAsMCwzMCwzMCw2KTtcbiAgICBtZW51R3JhcGhpYy5lbmRGaWxsKCk7XG4gICAgbWVudVNlY0dyb3VwLnRleHR1cmUgPSBtZW51R3JhcGhpYy5nZW5lcmF0ZVRleHR1cmUoKTtcblxuICAgIG1lbnVTZWNHcm91cC5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgbWVudVNlY0dyb3VwLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgIG1lbnVTZWNHcm91cC5wb3NpdGlvbi55ID0gZGltLnkvMis0MDtcbiAgICBtZW51U2VjR3JvdXAucG9zaXRpb24ueCA9IGRpbS54LTQwO1xuICAgIG1lbnVTZWNHcm91cC5zY2FsZS5zZXQoMS4wKTtcbiAgICBtZW51U2VjR3JvdXAuYW5jaG9yLnNldCgwLjUpO1xuICAgIG1lbnVTZWNHcm91cFxuICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqMS4xKTtcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54LzEuMSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkLicpO1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQVdTX0VDMl9TZWN1cml0eUdyb3VwKCdOZXdfU2VjdXJpdHlfR3JvdXAnLCBkaW0ueC8yLCBkaW0ueS8yKTtcbiAgICAgICAgc2VsZi5zZWN1cml0eWdyb3Vwcy5hZGQoaW5zdGFuY2UpO1xuICAgICAgfSk7XG4gICAgY29uc29sZS5sb2coJ21lbnUgc2VjIGdycCcpO1xuICAgIGNvbnNvbGUubG9nKG1lbnVTZWNHcm91cCk7XG5cbiAgICBjb250YWluZXIuYWRkQ2hpbGQobWVudVNlY0dyb3VwKTtcblxuICAgIHJldHVybiBjb250YWluZXI7XG5cbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvck1hbmFnZXI7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2xpYi9lbGVtZW50L2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX0VDMl9FSVAgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi5zY2FsZS5zZXQoMC4zKTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9FbGFzdGljX0lQLnBuZycpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xufTtcbkFXU19FQzJfRUlQLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19FQzJfRUlQO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTkvMTUuXG4gKi9cblxudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuLi9saWIvZWxlbWVudC9lbGVtZW50Jyk7XG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuLi9kcmFnLmRyb3AnKTtcblxudmFyIEFXU19FQzJfSW5zdGFuY2UgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9JbnN0YW5jZS5wbmcnKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxuICBzZWxmLnNlY3VyaXR5R3JvdXAgPSBudWxsO1xufTtcbkFXU19FQzJfSW5zdGFuY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX0VDMl9JbnN0YW5jZTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzIxLzE1LlxuICovXG5cbnZhciBHcm91cCA9IHJlcXVpcmUoJy4uL2xpYi9ncm91cC9ncm91cCcpO1xuXG52YXIgQVdTX0VDMl9TZWN1cml0eUdyb3VwID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgR3JvdXAuY2FsbCh0aGlzKTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYubmFtZSA9IG5hbWU7XG5cbiAgdmFyIGdyYXBoaWMgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICBncmFwaGljLmxpbmVTdHlsZSgzLCAweDAwMDAwMCwgMSk7XG4gIGdyYXBoaWMuYmVnaW5GaWxsKDB4RkZGRkZGLCAwLjApO1xuICBncmFwaGljLmRyYXdSb3VuZGVkUmVjdCgwLDAsMjAwLDIwMCwxMCk7XG4gIGdyYXBoaWMuZW5kRmlsbCgpO1xuXG4gIHNlbGYudGV4dHVyZSA9IGdyYXBoaWMuZ2VuZXJhdGVUZXh0dXJlKCk7XG4gIHNlbGYucG9zaXRpb24ueCA9IHg7XG4gIHNlbGYucG9zaXRpb24ueSA9IHk7XG5cbn07XG5BV1NfRUMyX1NlY3VyaXR5R3JvdXAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcm91cC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19FQzJfU2VjdXJpdHlHcm91cDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE5LzE1LlxuICovXG5cbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi4vbGliL2VsZW1lbnQvZWxlbWVudCcpO1xudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi4vZHJhZy5kcm9wJyk7XG5cbnZhciBBV1NfVXNlcnMgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnTm9uLVNlcnZpY2VfU3BlY2lmaWNfY29weV9Vc2Vycy5wbmcnKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxufTtcbkFXU19Vc2Vycy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfVXNlcnM7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xNC8xNS5cbiAqL1xuXG52YXIgTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyA9IDEuMTtcblxudmFyIERyYWdEcm9wID0ge1xuXG4gIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCk7XG4gICAgdGhpcy5kYXRhID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLmFscGhhID0gMC41O1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICAgIHRoaXMubW92ZWQgPSBmYWxzZTtcbiAgfSxcblxuICBvbkRyYWdFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZih0aGlzLm1vdmVkKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgZHJhZ2dpbmcnKTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5kYXRhID0gbnVsbDtcblxuICAgICAgaWYoIXRoaXMuc2VjdXJpdHlHcm91cCkge1xuXG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnUGFyZW50Jyk7XG4gICAgICAgIC8vY29uc29sZS5sb2coc2VsZi5wYXJlbnQucGFyZW50Lk1BTkFHRVIpO1xuICAgICAgICAgIHZhciBzZWNHcnBzID0gc2VsZi5wYXJlbnQucGFyZW50Lk1BTkFHRVIuc2VjdXJpdHlncm91cHM7XG5cbiAgICAgICAgICBfLmVhY2goc2VjR3Jwcy5lbGVtZW50cywgZnVuY3Rpb24ocykge1xuXG4gICAgICAgICAgICAgIHZhciB4ZGlzdCA9IHMucG9zaXRpb24ueCAtIHNlbGYucG9zaXRpb24ueDtcblxuICAgICAgICAgICAgICBpZih4ZGlzdCA+IC1zLndpZHRoLzIgJiYgeGRpc3QgPCBzLndpZHRoLzIpXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB2YXIgeWRpc3QgPSBzLnBvc2l0aW9uLnkgLSBzZWxmLnBvc2l0aW9uLnk7XG5cbiAgICAgICAgICAgICAgICBpZih5ZGlzdCA+IC1zLmhlaWdodC8yICYmIHlkaXN0IDwgcy5oZWlnaHQvMilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb2xsaXNpb24gZGV0ZWN0ZWQhJyk7XG4gICAgICAgICAgICAgICAgICBzZWxmLnBvc2l0aW9uLnggPSAwO1xuICAgICAgICAgICAgICAgICAgc2VsZi5wb3NpdGlvbi55ID0gMDtcbiAgICAgICAgICAgICAgICAgIHNlbGYuc2VjdXJpdHlHcm91cCA9IHM7XG4gICAgICAgICAgICAgICAgICAgIHMuYWRkQ2hpbGQoc2VsZik7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzZWxmKTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSk7XG5cbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgTk9UIGRyYWdnaW5nJyk7XG4gICAgICB2YXIgc2hhZG93ID0gbmV3IFBJWEkuZmlsdGVycy5Ecm9wU2hhZG93RmlsdGVyKCk7XG4gICAgICB0aGlzLmZpbHRlcnMgPSBbc2hhZG93XTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgY29uc29sZS5sb2coJ1BhcmVudDonKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMucGFyZW50LnBhcmVudCk7XG4gICAgICBpZih0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkLmZpbHRlcnMgPSBudWxsO1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LmNsaWNrZWRPbmx5U3RhZ2UgPSBmYWxzZTtcbiAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IHRoaXM7XG4gICAgfVxuICB9LFxuXG4gIG9uRHJhZ01vdmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5kcmFnZ2luZylcbiAgICB7XG4gICAgICB2YXIgbmV3UG9zaXRpb24gPSBzZWxmLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbihzZWxmLnBhcmVudCk7XG4gICAgICBzZWxmLnBvc2l0aW9uLnggPSBuZXdQb3NpdGlvbi54O1xuICAgICAgc2VsZi5wb3NpdGlvbi55ID0gbmV3UG9zaXRpb24ueTtcbiAgICAgIHNlbGYubW92ZWQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG92ZXIhJyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueCpNT1VTRV9PVkVSX1NDQUxFX1JBVElPKTtcbiAgICB2YXIgaWNvblNpemUgPSAxMDtcblxuICAgIHZhciBnbG9iYWwgPSBzZWxmLnRvR2xvYmFsKHNlbGYucG9zaXRpb24pO1xuICAgIC8vY29uc29sZS5sb2coJ29mZmljaWFsOiAnICsgc2VsZi5wb3NpdGlvbi54ICsgJzonICsgc2VsZi5wb3NpdGlvbi55KTtcbiAgICAvL2NvbnNvbGUubG9nKCdHTE9CQUw6ICcgKyBnbG9iYWwueCArICc6JyArIGdsb2JhbC55KTtcbiAgICAvL2NvbnNvbGUubG9nKHNlbGYuZ2V0TG9jYWxCb3VuZHMoKSk7XG5cbiAgICB2YXIgc2NhbGVMb2NhdGlvbnMgPSBbXG4gICAgICB7eDogMCwgeTogMC1zZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzItaWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAtc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzItaWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aC8yK2ljb25TaXplLzIsIHk6IDAsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiAwLCB5OiBzZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzIraWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9XG4gICAgXTtcblxuICAgIC8vY29uc29sZS5sb2coc2NhbGVMb2NhdGlvbnNbMF0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zID0gW107XG5cbiAgICBzY2FsZUxvY2F0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGxvYykge1xuICAgICAgdmFyIGljb24gPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgICAgaWNvbi5tb3ZlVG8oMCwwKTtcbiAgICAgIGljb24uaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgaWNvbi5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICAgIGljb24ubGluZVN0eWxlKDEsIDB4MDAwMEZGLCAxKTtcbiAgICAgIGljb24uYmVnaW5GaWxsKDB4RkZGRkZGLCAxKTtcbiAgICAgIGljb24uZHJhd0NpcmNsZShsb2MueCwgbG9jLnksIGxvYy5zaXplKTtcbiAgICAgIGljb24uZW5kRmlsbCgpO1xuXG4gICAgICAvL2ljb25cbiAgICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgICAgIC8vLm9uKCdtb3VzZWRvd24nLCBvblNjYWxlSWNvbkRyYWdTdGFydClcbiAgICAgICAgLy8ub24oJ3RvdWNoc3RhcnQnLCBvblNjYWxlSWNvbkRyYWdTdGFydCk7XG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgICAvLy5vbignbW91c2V1cCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCdtb3VzZXVwb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgICAgLy8ub24oJ21vdXNlbW92ZScsIG9uRHJhZ01vdmUpXG4gICAgICAvLy5vbigndG91Y2htb3ZlJywgb25EcmFnTW92ZSlcblxuICAgICAgc2VsZi5zY2FsZUljb25zLnB1c2goaWNvbik7XG5cbiAgICB9KTtcblxuICAgIHNlbGYuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYuYWRkQ2hpbGQocyk7XG4gICAgfSk7XG5cbiAgICBzZWxmLnRvb2x0aXAgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHNlbGYudG9vbHRpcC5saW5lU3R5bGUoMywgMHgwMDAwRkYsIDEpO1xuICAgIHNlbGYudG9vbHRpcC5iZWdpbkZpbGwoMHgwMDAwMDAsIDEpO1xuICAgIC8vc2VsZi5kcmF3Lm1vdmVUbyh4LHkpO1xuICAgIHNlbGYudG9vbHRpcC5kcmF3Um91bmRlZFJlY3QoMCsyMCwtc2VsZi5oZWlnaHQsMjAwLDEwMCwxMCk7XG4gICAgc2VsZi50b29sdGlwLmVuZEZpbGwoKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dFN0eWxlID0ge1xuICAgICAgZm9udCA6ICdib2xkIGl0YWxpYyAyOHB4IEFyaWFsJyxcbiAgICAgIGZpbGwgOiAnI0Y3RURDQScsXG4gICAgICBzdHJva2UgOiAnIzRhMTg1MCcsXG4gICAgICBzdHJva2VUaGlja25lc3MgOiA1LFxuICAgICAgZHJvcFNoYWRvdyA6IHRydWUsXG4gICAgICBkcm9wU2hhZG93Q29sb3IgOiAnIzAwMDAwMCcsXG4gICAgICBkcm9wU2hhZG93QW5nbGUgOiBNYXRoLlBJIC8gNixcbiAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZSA6IDYsXG4gICAgICB3b3JkV3JhcCA6IHRydWUsXG4gICAgICB3b3JkV3JhcFdpZHRoIDogNDQwXG4gICAgfTtcblxuICAgIHNlbGYudG9vbHRpcC50ZXh0ID0gbmV3IFBJWEkuVGV4dChzZWxmLm5hbWUsc2VsZi50b29sdGlwLnRleHRTdHlsZSk7XG4gICAgc2VsZi50b29sdGlwLnRleHQueCA9IDArMzA7XG4gICAgc2VsZi50b29sdGlwLnRleHQueSA9IC1zZWxmLmhlaWdodDtcblxuICAgIG5ldyBUV0VFTi5Ud2VlbihzZWxmLnRvb2x0aXApXG4gICAgICAudG8oe3g6c2VsZi53aWR0aH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcC50ZXh0KVxuICAgICAgLnRvKHt4OnNlbGYud2lkdGgrMjB9LDcwMClcbiAgICAgIC5lYXNpbmcoIFRXRUVOLkVhc2luZy5FbGFzdGljLkluT3V0IClcbiAgICAgIC5zdGFydCgpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyB0b29sdGlwJyk7XG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXApO1xuXG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXAudGV4dCk7XG4gIH0sXG5cbiAgb25Nb3VzZU91dDogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG91dCEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54L01PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlIG91dCcpO1xuICAgIHRoaXMuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2hpbGQocyk7XG4gICAgfSk7XG4gICAgLy9jb25zb2xlLmxvZygnU2l6ZTogJyk7XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmdldEJvdW5kcygpKTtcblxuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwKTtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvblNjYWxlSWNvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIScpO1xuICB9XG5cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEcmFnRHJvcDtcblxuIiwiXG52YXIgR3VpVXRpbCA9IHtcblxuICBnZXRXaW5kb3dEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7IHg6IHdpbmRvdy5pbm5lcldpZHRoLCB5OiB3aW5kb3cuaW5uZXJIZWlnaHQgfTtcbiAgfSxcblxuICBkcmF3R3JpZDogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgIHZhciBncmlkID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICB2YXIgaW50ZXJ2YWwgPSAxMDA7XG4gICAgdmFyIGNvdW50ID0gaW50ZXJ2YWw7XG4gICAgZ3JpZC5saW5lU3R5bGUoMSwgMHhFNUU1RTUsIDEpO1xuICAgIHdoaWxlIChjb3VudCA8IHdpZHRoKSB7XG4gICAgICBncmlkLm1vdmVUbyhjb3VudCwgMCk7XG4gICAgICBncmlkLmxpbmVUbyhjb3VudCwgaGVpZ2h0KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgY291bnQgPSBpbnRlcnZhbDtcbiAgICB3aGlsZShjb3VudCA8IGhlaWdodCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oMCwgY291bnQpO1xuICAgICAgZ3JpZC5saW5lVG8od2lkdGgsIGNvdW50KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgdmFyIGNvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICAgIGNvbnRhaW5lci5hZGRDaGlsZChncmlkKTtcbiAgICBjb250YWluZXIuY2FjaGVBc0JpdG1hcCA9IHRydWU7XG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEd1aVV0aWw7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMjEvMTUuXG4gKi9cbi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8xNS8xNS5cbiAqL1xuXG52YXIgQ29sbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBQSVhJLkNvbnRhaW5lci5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5lbGVtZW50cyA9IHt9O1xuXG4gIHNlbGYuYWRkID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHNlbGYuYWRkQ2hpbGQoZWxlbWVudCk7XG4gICAgc2VsZi5lbGVtZW50c1tlbGVtZW50Lm5hbWVdID0gZWxlbWVudDtcbiAgfTtcblxuICBzZWxmLnJlbW92ZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICAgIGRlbGV0ZSBzZWxmLmVsZW1lbnRzW2VsZW1lbnQubmFtZV07XG4gIH07XG5cbn07XG5Db2xsZWN0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUElYSS5Db250YWluZXIucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzE1LzE1LlxuICovXG5cbnZhciBDb21wb25lbnQgPSBmdW5jdGlvbigpIHtcbiAgUElYSS5TcHJpdGUuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuYW5jaG9yLnNldCgwLjUpO1xuICBzZWxmLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgc2VsZi5idXR0b25Nb2RlID0gdHJ1ZTtcblxufTtcbkNvbXBvbmVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBJWEkuU3ByaXRlLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29tcG9uZW50O1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTQvMTUuXG4gKi9cblxudmFyIE1PVVNFX09WRVJfU0NBTEVfUkFUSU8gPSAxLjE7XG5cbnZhciBFbGVtZW50RHJhZ0Ryb3AgPSB7XG5cbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coKTtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmKHRoaXMubW92ZWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBkcmFnZ2luZycpO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gICAgICB0aGlzLmRhdGEgPSBudWxsO1xuXG4gICAgICBpZighdGhpcy5zZWN1cml0eUdyb3VwKSB7XG5cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdQYXJlbnQnKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhzZWxmLnBhcmVudC5wYXJlbnQuTUFOQUdFUik7XG4gICAgICAgICAgdmFyIHNlY0dycHMgPSBzZWxmLnBhcmVudC5wYXJlbnQuTUFOQUdFUi5zZWN1cml0eWdyb3VwcztcblxuICAgICAgICAgIF8uZWFjaChzZWNHcnBzLmVsZW1lbnRzLCBmdW5jdGlvbihzKSB7XG5cbiAgICAgICAgICAgICAgdmFyIHhkaXN0ID0gcy5wb3NpdGlvbi54IC0gc2VsZi5wb3NpdGlvbi54O1xuXG4gICAgICAgICAgICAgIGlmKHhkaXN0ID4gLXMud2lkdGgvMiAmJiB4ZGlzdCA8IHMud2lkdGgvMilcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhciB5ZGlzdCA9IHMucG9zaXRpb24ueSAtIHNlbGYucG9zaXRpb24ueTtcblxuICAgICAgICAgICAgICAgIGlmKHlkaXN0ID4gLXMuaGVpZ2h0LzIgJiYgeWRpc3QgPCBzLmhlaWdodC8yKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0NvbGxpc2lvbiBkZXRlY3RlZCEnKTtcbiAgICAgICAgICAgICAgICAgIHNlbGYucG9zaXRpb24ueCA9IDA7XG4gICAgICAgICAgICAgICAgICBzZWxmLnBvc2l0aW9uLnkgPSAwO1xuICAgICAgICAgICAgICAgICAgc2VsZi5zZWN1cml0eUdyb3VwID0gcztcbiAgICAgICAgICAgICAgICAgICAgcy5hZGRDaGlsZChzZWxmKTtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNlbGYpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KTtcblxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdGb3VuZCBjbGljayB3aGlsZSBOT1QgZHJhZ2dpbmcnKTtcbiAgICAgIHZhciBzaGFkb3cgPSBuZXcgUElYSS5maWx0ZXJzLkRyb3BTaGFkb3dGaWx0ZXIoKTtcbiAgICAgIHRoaXMuZmlsdGVycyA9IFtzaGFkb3ddO1xuICAgICAgdGhpcy5hbHBoYSA9IDE7XG4gICAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG4gICAgICBjb25zb2xlLmxvZygnUGFyZW50OicpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5wYXJlbnQucGFyZW50KTtcbiAgICAgIGlmKHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCkge1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQuZmlsdGVycyA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IG51bGw7XG4gICAgICB9XG4gICAgICB0aGlzLnBhcmVudC5wYXJlbnQuY2xpY2tlZE9ubHlTdGFnZSA9IGZhbHNlO1xuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkID0gdGhpcztcbiAgICB9XG4gIH0sXG5cbiAgb25EcmFnTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLmRyYWdnaW5nKVxuICAgIHtcbiAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHNlbGYuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHNlbGYucGFyZW50KTtcbiAgICAgIHNlbGYucG9zaXRpb24ueCA9IG5ld1Bvc2l0aW9uLng7XG4gICAgICBzZWxmLnBvc2l0aW9uLnkgPSBuZXdQb3NpdGlvbi55O1xuICAgICAgc2VsZi5tb3ZlZCA9IHRydWU7XG4gICAgfVxuICB9LFxuXG4gIG9uTW91c2VPdmVyOiBmdW5jdGlvbigpIHtcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZWQgb3ZlciEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54Kk1PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuICAgIHZhciBpY29uU2l6ZSA9IDEwO1xuXG4gICAgdmFyIGdsb2JhbCA9IHNlbGYudG9HbG9iYWwoc2VsZi5wb3NpdGlvbik7XG5cbiAgICB2YXIgc2NhbGVMb2NhdGlvbnMgPSBbXG4gICAgICB7eDogMCwgeTogMC1zZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzItaWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAtc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzItaWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aC8yK2ljb25TaXplLzIsIHk6IDAsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiAwLCB5OiBzZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzIraWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9XG4gICAgXTtcblxuICAgIC8vY29uc29sZS5sb2coc2NhbGVMb2NhdGlvbnNbMF0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zID0gW107XG5cbiAgICBzY2FsZUxvY2F0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGxvYykge1xuICAgICAgdmFyIGljb24gPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgICAgaWNvbi5tb3ZlVG8oMCwwKTtcbiAgICAgIGljb24uaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgaWNvbi5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICAgIGljb24ubGluZVN0eWxlKDEsIDB4MDAwMEZGLCAxKTtcbiAgICAgIGljb24uYmVnaW5GaWxsKDB4RkZGRkZGLCAxKTtcbiAgICAgIGljb24uZHJhd0NpcmNsZShsb2MueCwgbG9jLnksIGxvYy5zaXplKTtcbiAgICAgIGljb24uZW5kRmlsbCgpO1xuXG4gICAgICAvL2ljb25cbiAgICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgICAgIC8vLm9uKCdtb3VzZWRvd24nLCBvblNjYWxlSWNvbkRyYWdTdGFydClcbiAgICAgICAgLy8ub24oJ3RvdWNoc3RhcnQnLCBvblNjYWxlSWNvbkRyYWdTdGFydCk7XG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgICAvLy5vbignbW91c2V1cCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCdtb3VzZXVwb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgICAgLy8ub24oJ21vdXNlbW92ZScsIG9uRHJhZ01vdmUpXG4gICAgICAvLy5vbigndG91Y2htb3ZlJywgb25EcmFnTW92ZSlcblxuICAgICAgc2VsZi5zY2FsZUljb25zLnB1c2goaWNvbik7XG5cbiAgICB9KTtcblxuICAgIHNlbGYuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYuYWRkQ2hpbGQocyk7XG4gICAgfSk7XG5cbiAgICBzZWxmLnRvb2x0aXAgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHNlbGYudG9vbHRpcC5saW5lU3R5bGUoMywgMHgwMDAwRkYsIDEpO1xuICAgIHNlbGYudG9vbHRpcC5iZWdpbkZpbGwoMHgwMDAwMDAsIDEpO1xuICAgIC8vc2VsZi5kcmF3Lm1vdmVUbyh4LHkpO1xuICAgIHNlbGYudG9vbHRpcC5kcmF3Um91bmRlZFJlY3QoMCsyMCwtc2VsZi5oZWlnaHQsMjAwLDEwMCwxMCk7XG4gICAgc2VsZi50b29sdGlwLmVuZEZpbGwoKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dFN0eWxlID0ge1xuICAgICAgZm9udCA6ICdib2xkIGl0YWxpYyAyOHB4IEFyaWFsJyxcbiAgICAgIGZpbGwgOiAnI0Y3RURDQScsXG4gICAgICBzdHJva2UgOiAnIzRhMTg1MCcsXG4gICAgICBzdHJva2VUaGlja25lc3MgOiA1LFxuICAgICAgZHJvcFNoYWRvdyA6IHRydWUsXG4gICAgICBkcm9wU2hhZG93Q29sb3IgOiAnIzAwMDAwMCcsXG4gICAgICBkcm9wU2hhZG93QW5nbGUgOiBNYXRoLlBJIC8gNixcbiAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZSA6IDYsXG4gICAgICB3b3JkV3JhcCA6IHRydWUsXG4gICAgICB3b3JkV3JhcFdpZHRoIDogNDQwXG4gICAgfTtcblxuICAgIHNlbGYudG9vbHRpcC50ZXh0ID0gbmV3IFBJWEkuVGV4dChzZWxmLm5hbWUsc2VsZi50b29sdGlwLnRleHRTdHlsZSk7XG4gICAgc2VsZi50b29sdGlwLnRleHQueCA9IDArMzA7XG4gICAgc2VsZi50b29sdGlwLnRleHQueSA9IC1zZWxmLmhlaWdodDtcblxuICAgIG5ldyBUV0VFTi5Ud2VlbihzZWxmLnRvb2x0aXApXG4gICAgICAudG8oe3g6c2VsZi53aWR0aH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcC50ZXh0KVxuICAgICAgLnRvKHt4OnNlbGYud2lkdGgrMjB9LDcwMClcbiAgICAgIC5lYXNpbmcoIFRXRUVOLkVhc2luZy5FbGFzdGljLkluT3V0IClcbiAgICAgIC5zdGFydCgpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyB0b29sdGlwJyk7XG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXApO1xuXG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXAudGV4dCk7XG4gIH0sXG5cbiAgb25Nb3VzZU91dDogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG91dCEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54L01PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlIG91dCcpO1xuICAgIHRoaXMuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2hpbGQocyk7XG4gICAgfSk7XG4gICAgLy9jb25zb2xlLmxvZygnU2l6ZTogJyk7XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmdldEJvdW5kcygpKTtcblxuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwKTtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvblNjYWxlSWNvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIScpO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRWxlbWVudERyYWdEcm9wO1xuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudC9jb21wb25lbnQnKTtcbnZhciBFbGVtZW50RHJhZ0Ryb3AgPSByZXF1aXJlKCcuL2VsZW1lbnQuZHJhZy5kcm9wJyk7XG5cbnZhciBERUZBVUxUX1NDQUxFID0gMC43O1xuXG52YXIgRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuICBDb21wb25lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuc2NhbGUuc2V0KERFRkFVTFRfU0NBTEUpO1xuICBzZWxmXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgLm9uKCdtb3VzZWRvd24nLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgLm9uKCd0b3VjaHN0YXJ0JywgRWxlbWVudERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAub24oJ21vdXNldXAnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbignbW91c2V1cG91dHNpZGUnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbigndG91Y2hlbmQnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbigndG91Y2hlbmRvdXRzaWRlJywgRWxlbWVudERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgIC5vbignbW91c2Vtb3ZlJywgRWxlbWVudERyYWdEcm9wLm9uRHJhZ01vdmUpXG4gICAgLm9uKCd0b3VjaG1vdmUnLCBFbGVtZW50RHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAvLyBldmVudHMgZm9yIG1vdXNlIG92ZXJcbiAgICAub24oJ21vdXNlb3ZlcicsIEVsZW1lbnREcmFnRHJvcC5vbk1vdXNlT3ZlcilcbiAgICAub24oJ21vdXNlb3V0JywgRWxlbWVudERyYWdEcm9wLm9uTW91c2VPdXQpO1xuXG4gIHNlbGYuYXJyb3dzID0gW107XG5cbiAgc2VsZi5hZGRBcnJvd1RvID0gZnVuY3Rpb24oYikge1xuICAgIHNlbGYuYXJyb3dzLnB1c2goYik7XG4gIH07XG5cbiAgc2VsZi5yZW1vdmVBcnJvd1RvID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBzZWxmLmFycm93cy5yZW1vdmUoaW5kZXgpO1xuICB9O1xuXG59O1xuRWxlbWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbXBvbmVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnQ7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xNC8xNS5cbiAqL1xuXG52YXIgTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyA9IDEuMTtcblxudmFyIERyYWdEcm9wID0ge1xuXG4gIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCk7XG4gICAgdGhpcy5kYXRhID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLmFscGhhID0gMC41O1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICAgIHRoaXMubW92ZWQgPSBmYWxzZTtcbiAgfSxcblxuICBvbkRyYWdFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZih0aGlzLm1vdmVkKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgZHJhZ2dpbmcnKTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgTk9UIGRyYWdnaW5nJyk7XG4gICAgICB2YXIgc2hhZG93ID0gbmV3IFBJWEkuZmlsdGVycy5Ecm9wU2hhZG93RmlsdGVyKCk7XG4gICAgICB0aGlzLmZpbHRlcnMgPSBbc2hhZG93XTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgY29uc29sZS5sb2coJ1BhcmVudDonKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMucGFyZW50LnBhcmVudCk7XG4gICAgICBpZih0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkLmZpbHRlcnMgPSBudWxsO1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LmNsaWNrZWRPbmx5U3RhZ2UgPSBmYWxzZTtcbiAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IHRoaXM7XG4gICAgfVxuICB9LFxuXG4gIG9uRHJhZ01vdmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5kcmFnZ2luZylcbiAgICB7XG4gICAgICB2YXIgbmV3UG9zaXRpb24gPSBzZWxmLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbihzZWxmLnBhcmVudCk7XG4gICAgICBzZWxmLnBvc2l0aW9uLnggPSBuZXdQb3NpdGlvbi54O1xuICAgICAgc2VsZi5wb3NpdGlvbi55ID0gbmV3UG9zaXRpb24ueTtcbiAgICAgIHNlbGYubW92ZWQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG92ZXIhJyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueCpNT1VTRV9PVkVSX1NDQUxFX1JBVElPKTtcbiAgICB2YXIgaWNvblNpemUgPSAxMDtcblxuICAgIHZhciBnbG9iYWwgPSBzZWxmLnRvR2xvYmFsKHNlbGYucG9zaXRpb24pO1xuICAgIC8vY29uc29sZS5sb2coJ29mZmljaWFsOiAnICsgc2VsZi5wb3NpdGlvbi54ICsgJzonICsgc2VsZi5wb3NpdGlvbi55KTtcbiAgICAvL2NvbnNvbGUubG9nKCdHTE9CQUw6ICcgKyBnbG9iYWwueCArICc6JyArIGdsb2JhbC55KTtcbiAgICAvL2NvbnNvbGUubG9nKHNlbGYuZ2V0TG9jYWxCb3VuZHMoKSk7XG5cbiAgICB2YXIgc2NhbGVMb2NhdGlvbnMgPSBbXG4gICAgICB7eDogMCwgeTogMC1zZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzItaWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAtc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzItaWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aC8yK2ljb25TaXplLzIsIHk6IDAsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiAwLCB5OiBzZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzIraWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9XG4gICAgXTtcblxuICAgIC8vY29uc29sZS5sb2coc2NhbGVMb2NhdGlvbnNbMF0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zID0gW107XG5cbiAgICBzY2FsZUxvY2F0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGxvYykge1xuICAgICAgdmFyIGljb24gPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgICAgaWNvbi5tb3ZlVG8oMCwwKTtcbiAgICAgIGljb24uaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgaWNvbi5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICAgIGljb24ubGluZVN0eWxlKDEsIDB4MDAwMEZGLCAxKTtcbiAgICAgIGljb24uYmVnaW5GaWxsKDB4RkZGRkZGLCAxKTtcbiAgICAgIGljb24uZHJhd0NpcmNsZShsb2MueCwgbG9jLnksIGxvYy5zaXplKTtcbiAgICAgIGljb24uZW5kRmlsbCgpO1xuXG4gICAgICAvL2ljb25cbiAgICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgICAgIC8vLm9uKCdtb3VzZWRvd24nLCBvblNjYWxlSWNvbkRyYWdTdGFydClcbiAgICAgICAgLy8ub24oJ3RvdWNoc3RhcnQnLCBvblNjYWxlSWNvbkRyYWdTdGFydCk7XG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgICAvLy5vbignbW91c2V1cCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCdtb3VzZXVwb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgICAgLy8ub24oJ21vdXNlbW92ZScsIG9uRHJhZ01vdmUpXG4gICAgICAvLy5vbigndG91Y2htb3ZlJywgb25EcmFnTW92ZSlcblxuICAgICAgc2VsZi5zY2FsZUljb25zLnB1c2goaWNvbik7XG5cbiAgICB9KTtcblxuICAgIHNlbGYuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYuYWRkQ2hpbGQocyk7XG4gICAgfSk7XG5cbiAgICBzZWxmLnRvb2x0aXAgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHNlbGYudG9vbHRpcC5saW5lU3R5bGUoMywgMHgwMDAwRkYsIDEpO1xuICAgIHNlbGYudG9vbHRpcC5iZWdpbkZpbGwoMHgwMDAwMDAsIDEpO1xuICAgIC8vc2VsZi5kcmF3Lm1vdmVUbyh4LHkpO1xuICAgIHNlbGYudG9vbHRpcC5kcmF3Um91bmRlZFJlY3QoMCsyMCwtc2VsZi5oZWlnaHQsMjAwLDEwMCwxMCk7XG4gICAgc2VsZi50b29sdGlwLmVuZEZpbGwoKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dFN0eWxlID0ge1xuICAgICAgZm9udCA6ICdib2xkIGl0YWxpYyAyOHB4IEFyaWFsJyxcbiAgICAgIGZpbGwgOiAnI0Y3RURDQScsXG4gICAgICBzdHJva2UgOiAnIzRhMTg1MCcsXG4gICAgICBzdHJva2VUaGlja25lc3MgOiA1LFxuICAgICAgZHJvcFNoYWRvdyA6IHRydWUsXG4gICAgICBkcm9wU2hhZG93Q29sb3IgOiAnIzAwMDAwMCcsXG4gICAgICBkcm9wU2hhZG93QW5nbGUgOiBNYXRoLlBJIC8gNixcbiAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZSA6IDYsXG4gICAgICB3b3JkV3JhcCA6IHRydWUsXG4gICAgICB3b3JkV3JhcFdpZHRoIDogNDQwXG4gICAgfTtcblxuICAgIHNlbGYudG9vbHRpcC50ZXh0ID0gbmV3IFBJWEkuVGV4dChzZWxmLm5hbWUsc2VsZi50b29sdGlwLnRleHRTdHlsZSk7XG4gICAgc2VsZi50b29sdGlwLnRleHQueCA9IDArMzA7XG4gICAgc2VsZi50b29sdGlwLnRleHQueSA9IC1zZWxmLmhlaWdodDtcblxuICAgIG5ldyBUV0VFTi5Ud2VlbihzZWxmLnRvb2x0aXApXG4gICAgICAudG8oe3g6c2VsZi53aWR0aH0sNzAwKVxuICAgICAgLmVhc2luZyggVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW5PdXQgKVxuICAgICAgLnN0YXJ0KCk7XG4gICAgbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcC50ZXh0KVxuICAgICAgLnRvKHt4OnNlbGYud2lkdGgrMjB9LDcwMClcbiAgICAgIC5lYXNpbmcoIFRXRUVOLkVhc2luZy5FbGFzdGljLkluT3V0IClcbiAgICAgIC5zdGFydCgpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyB0b29sdGlwJyk7XG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXApO1xuXG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXAudGV4dCk7XG4gIH0sXG5cbiAgb25Nb3VzZU91dDogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG91dCEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54L01PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlIG91dCcpO1xuICAgIHRoaXMuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2hpbGQocyk7XG4gICAgfSk7XG4gICAgLy9jb25zb2xlLmxvZygnU2l6ZTogJyk7XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmdldEJvdW5kcygpKTtcblxuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwKTtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvblNjYWxlSWNvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIScpO1xuICB9XG5cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEcmFnRHJvcDtcblxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzE1LzE1LlxuICovXG5cbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi9jb21wb25lbnQvY29tcG9uZW50Jyk7XG52YXIgR3JvdXBEcmFnRHJvcCA9IHJlcXVpcmUoJy4vZ3JvdXAuZHJhZy5kcm9wJyk7XG5cbnZhciBERUZBVUxUX1NDQUxFID0gMC43O1xuXG52YXIgR3JvdXAgPSBmdW5jdGlvbigpIHtcbiAgQ29tcG9uZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLnNjYWxlLnNldChERUZBVUxUX1NDQUxFKTtcbiAgc2VsZi5hbmNob3Iuc2V0KDAuNSk7XG4gIHNlbGYuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICBzZWxmLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICBzZWxmXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgLm9uKCdtb3VzZWRvd24nLCBHcm91cERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC5vbigndG91Y2hzdGFydCcsIEdyb3VwRHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIGVuZFxuICAgIC5vbignbW91c2V1cCcsIEdyb3VwRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbignbW91c2V1cG91dHNpZGUnLCBHcm91cERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ3RvdWNoZW5kJywgR3JvdXBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBHcm91cERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgIC5vbignbW91c2Vtb3ZlJywgR3JvdXBEcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgIC5vbigndG91Y2htb3ZlJywgR3JvdXBEcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgIC8vIGV2ZW50cyBmb3IgbW91c2Ugb3ZlclxuICAgIC5vbignbW91c2VvdmVyJywgR3JvdXBEcmFnRHJvcC5vbk1vdXNlT3ZlcilcbiAgICAub24oJ21vdXNlb3V0JywgR3JvdXBEcmFnRHJvcC5vbk1vdXNlT3V0KTtcblxuICBzZWxmLmFycm93cyA9IFtdO1xuXG4gIHNlbGYuYWRkQXJyb3dUbyA9IGZ1bmN0aW9uKGIpIHtcbiAgICBzZWxmLmFycm93cy5wdXNoKGIpO1xuICB9O1xuXG4gIHNlbGYucmVtb3ZlQXJyb3dUbyA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgc2VsZi5hcnJvd3MucmVtb3ZlKGluZGV4KTtcbiAgfTtcblxufTtcbkdyb3VwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29tcG9uZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR3JvdXA7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEd1aVV0aWwgPSByZXF1aXJlKCcuL2d1aS51dGlsJyk7XG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4vbGliL2VsZW1lbnQvZWxlbWVudCcpO1xuLy92YXIgQXJyb3cgPSByZXF1aXJlKCcuL2Fycm93Jyk7XG52YXIgRWRpdG9yTWFuYWdlciA9IHJlcXVpcmUoJy4vRWRpdG9yTWFuYWdlcicpO1xuXG5mdW5jdGlvbiByZXNpemVHdWlDb250YWluZXIocmVuZGVyZXIpIHtcblxuICB2YXIgZGltID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcblxuICBjb25zb2xlLmxvZygnUmVzaXppbmcuLi4nKTtcbiAgY29uc29sZS5sb2coZGltKTtcblxuICAkKCcjZ3VpQ29udGFpbmVyJykuaGVpZ2h0KGRpbS55KTtcbiAgJCgnI2d1aUNvbnRhaW5lcicpLndpZHRoKGRpbS54KTtcblxuICBpZihyZW5kZXJlcikge1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUud2lkdGggPSBkaW0ueCsncHgnO1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUuaGVpZ2h0ID0gZGltLnkrJ3B4JztcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdSZXNpemluZyBndWkgY29udGFpbmVyLi4uJyk7XG5cbn1cblxudmFyIFBpeGlFZGl0b3IgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciB0ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUoKTtcbiAgICBjb25zb2xlLmxvZyh0ZW1wbGF0ZSk7XG5cbiAgICB2YXIgTUFOQUdFUiA9IG5ldyBFZGl0b3JNYW5hZ2VyKHRlbXBsYXRlKTtcbiAgICBNQU5BR0VSLmluaXQoKTtcblxuICAgIGNvbnNvbGUubG9nKCdBZGRpbmcgbGlzdGVuZXIuLi4nKTtcbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgcmVzaXplR3VpQ29udGFpbmVyKE1BTkFHRVIucmVuZGVyZXIpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRlbXBsYXRlOiBvcHRpb25zLnRlbXBsYXRlLFxuXG4gICAgICBkcmF3Q2FudmFzRWRpdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuXG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgTUFOQUdFUi5hbmltYXRlKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChNQU5BR0VSLnJlbmRlcmVyLnZpZXcpO1xuXG4gICAgICAgIE1BTkFHRVIuYW5pbWF0ZSgpO1xuXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB2aWV3OiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgcmV0dXJuIG0oJyNndWlDb250YWluZXInLCB7IGNvbmZpZzogY29udHJvbGxlci5kcmF3Q2FudmFzRWRpdG9yfSlcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaXhpRWRpdG9yO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDcvOS8xNS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHJlc2l6ZUVkaXRvcihlZGl0b3IpIHtcbiAgZWRpdG9yLnNldFNpemUobnVsbCwgd2luZG93LmlubmVySGVpZ2h0KTtcbn1cblxudmFyIFNvdXJjZUVkaXRvciA9IHtcblxuICBjb250cm9sbGVyOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICBkcmF3RWRpdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuXG4gICAgICAgIHZhciBlZGl0b3IgPSBudWxsO1xuXG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgaWYoZWRpdG9yKSB7XG4gICAgICAgICAgICBlZGl0b3IucmVmcmVzaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlZGl0b3IgPSBDb2RlTWlycm9yKGVsZW1lbnQsIHtcbiAgICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkob3B0aW9ucy50ZW1wbGF0ZSgpLCB1bmRlZmluZWQsIDIpLFxuICAgICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgIG1vZGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICBndXR0ZXJzOiBbJ0NvZGVNaXJyb3ItbGludC1tYXJrZXJzJ10sXG4gICAgICAgICAgbGludDogdHJ1ZSxcbiAgICAgICAgICBzdHlsZUFjdGl2ZUxpbmU6IHRydWUsXG4gICAgICAgICAgYXV0b0Nsb3NlQnJhY2tldHM6IHRydWUsXG4gICAgICAgICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgICB0aGVtZTogJ3plbmJ1cm4nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlc2l6ZUVkaXRvcihlZGl0b3IpO1xuXG4gICAgICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmVzaXplRWRpdG9yKGVkaXRvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVkaXRvci5vbignY2hhbmdlJywgZnVuY3Rpb24oZWRpdG9yKSB7XG4gICAgICAgICAgbS5zdGFydENvbXB1dGF0aW9uKCk7XG4gICAgICAgICAgb3B0aW9ucy50ZW1wbGF0ZShKU09OLnBhcnNlKGVkaXRvci5nZXRWYWx1ZSgpKSk7XG4gICAgICAgICAgbS5lbmRDb21wdXRhdGlvbigpO1xuICAgICAgICB9KTtcblxuICAgICAgfVxuICAgIH07XG4gIH0sXG4gIHZpZXc6IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICByZXR1cm4gW1xuICAgICAgbSgnI3NvdXJjZUVkaXRvcicsIHsgY29uZmlnOiBjb250cm9sbGVyLmRyYXdFZGl0b3IgfSlcbiAgICBdXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU291cmNlRWRpdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU291cmNlRWRpdG9yID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3NvdXJjZS5lZGl0b3InKTtcbnZhciBQaXhpRWRpdG9yID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3BpeGkuZWRpdG9yJyk7XG5cbnZhciB0ZXN0RGF0YSA9IHJlcXVpcmUoJy4vdGVzdERhdGEvZWMyLmpzb24nKTtcblxudmFyIHRlbXBsYXRlID0gbS5wcm9wKHRlc3REYXRhKTtcblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvdWRzbGljZXItYXBwJyksIG0uY29tcG9uZW50KFBpeGlFZGl0b3IsIHtcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgfSlcbik7XG5cbm0ubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGUtYmFyJyksIG0uY29tcG9uZW50KFNvdXJjZUVkaXRvciwge1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB9KVxuKTtcbiIsIm1vZHVsZS5leHBvcnRzPVxue1xuICBcIkFXU1RlbXBsYXRlRm9ybWF0VmVyc2lvblwiIDogXCIyMDEwLTA5LTA5XCIsXG5cbiAgXCJEZXNjcmlwdGlvblwiIDogXCJBV1MgQ2xvdWRGb3JtYXRpb24gU2FtcGxlIFRlbXBsYXRlIEVDMkluc3RhbmNlV2l0aFNlY3VyaXR5R3JvdXBTYW1wbGU6IENyZWF0ZSBhbiBBbWF6b24gRUMyIGluc3RhbmNlIHJ1bm5pbmcgdGhlIEFtYXpvbiBMaW51eCBBTUkuIFRoZSBBTUkgaXMgY2hvc2VuIGJhc2VkIG9uIHRoZSByZWdpb24gaW4gd2hpY2ggdGhlIHN0YWNrIGlzIHJ1bi4gVGhpcyBleGFtcGxlIGNyZWF0ZXMgYW4gRUMyIHNlY3VyaXR5IGdyb3VwIGZvciB0aGUgaW5zdGFuY2UgdG8gZ2l2ZSB5b3UgU1NIIGFjY2Vzcy4gKipXQVJOSU5HKiogVGhpcyB0ZW1wbGF0ZSBjcmVhdGVzIGFuIEFtYXpvbiBFQzIgaW5zdGFuY2UuIFlvdSB3aWxsIGJlIGJpbGxlZCBmb3IgdGhlIEFXUyByZXNvdXJjZXMgdXNlZCBpZiB5b3UgY3JlYXRlIGEgc3RhY2sgZnJvbSB0aGlzIHRlbXBsYXRlLlwiLFxuXG4gIFwiUGFyYW1ldGVyc1wiIDoge1xuICAgIFwiS2V5TmFtZVwiOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIk5hbWUgb2YgYW4gZXhpc3RpbmcgRUMyIEtleVBhaXIgdG8gZW5hYmxlIFNTSCBhY2Nlc3MgdG8gdGhlIGluc3RhbmNlXCIsXG4gICAgICBcIlR5cGVcIjogXCJBV1M6OkVDMjo6S2V5UGFpcjo6S2V5TmFtZVwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBiZSB0aGUgbmFtZSBvZiBhbiBleGlzdGluZyBFQzIgS2V5UGFpci5cIlxuICAgIH0sXG5cbiAgICBcIkluc3RhbmNlVHlwZVwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJXZWJTZXJ2ZXIgRUMyIGluc3RhbmNlIHR5cGVcIixcbiAgICAgIFwiVHlwZVwiIDogXCJTdHJpbmdcIixcbiAgICAgIFwiRGVmYXVsdFwiIDogXCJtMS5zbWFsbFwiLFxuICAgICAgXCJBbGxvd2VkVmFsdWVzXCIgOiBbIFwidDEubWljcm9cIiwgXCJ0Mi5taWNyb1wiLCBcInQyLnNtYWxsXCIsIFwidDIubWVkaXVtXCIsIFwibTEuc21hbGxcIiwgXCJtMS5tZWRpdW1cIiwgXCJtMS5sYXJnZVwiLCBcIm0xLnhsYXJnZVwiLCBcIm0yLnhsYXJnZVwiLCBcIm0yLjJ4bGFyZ2VcIiwgXCJtMi40eGxhcmdlXCIsIFwibTMubWVkaXVtXCIsIFwibTMubGFyZ2VcIiwgXCJtMy54bGFyZ2VcIiwgXCJtMy4yeGxhcmdlXCIsIFwiYzEubWVkaXVtXCIsIFwiYzEueGxhcmdlXCIsIFwiYzMubGFyZ2VcIiwgXCJjMy54bGFyZ2VcIiwgXCJjMy4yeGxhcmdlXCIsIFwiYzMuNHhsYXJnZVwiLCBcImMzLjh4bGFyZ2VcIiwgXCJjNC5sYXJnZVwiLCBcImM0LnhsYXJnZVwiLCBcImM0LjJ4bGFyZ2VcIiwgXCJjNC40eGxhcmdlXCIsIFwiYzQuOHhsYXJnZVwiLCBcImcyLjJ4bGFyZ2VcIiwgXCJyMy5sYXJnZVwiLCBcInIzLnhsYXJnZVwiLCBcInIzLjJ4bGFyZ2VcIiwgXCJyMy40eGxhcmdlXCIsIFwicjMuOHhsYXJnZVwiLCBcImkyLnhsYXJnZVwiLCBcImkyLjJ4bGFyZ2VcIiwgXCJpMi40eGxhcmdlXCIsIFwiaTIuOHhsYXJnZVwiLCBcImQyLnhsYXJnZVwiLCBcImQyLjJ4bGFyZ2VcIiwgXCJkMi40eGxhcmdlXCIsIFwiZDIuOHhsYXJnZVwiLCBcImhpMS40eGxhcmdlXCIsIFwiaHMxLjh4bGFyZ2VcIiwgXCJjcjEuOHhsYXJnZVwiLCBcImNjMi44eGxhcmdlXCIsIFwiY2cxLjR4bGFyZ2VcIl1cbiAgICAsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIGEgdmFsaWQgRUMyIGluc3RhbmNlIHR5cGUuXCJcbiAgICB9LFxuXG4gICAgXCJTU0hMb2NhdGlvblwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJUaGUgSVAgYWRkcmVzcyByYW5nZSB0aGF0IGNhbiBiZSB1c2VkIHRvIFNTSCB0byB0aGUgRUMyIGluc3RhbmNlc1wiLFxuICAgICAgXCJUeXBlXCI6IFwiU3RyaW5nXCIsXG4gICAgICBcIk1pbkxlbmd0aFwiOiBcIjlcIixcbiAgICAgIFwiTWF4TGVuZ3RoXCI6IFwiMThcIixcbiAgICAgIFwiRGVmYXVsdFwiOiBcIjAuMC4wLjAvMFwiLFxuICAgICAgXCJBbGxvd2VkUGF0dGVyblwiOiBcIihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KS8oXFxcXGR7MSwyfSlcIixcbiAgICAgIFwiQ29uc3RyYWludERlc2NyaXB0aW9uXCI6IFwibXVzdCBiZSBhIHZhbGlkIElQIENJRFIgcmFuZ2Ugb2YgdGhlIGZvcm0geC54LngueC94LlwiXG4gICAgfVxuICB9LFxuXG4gIFwiTWFwcGluZ3NcIiA6IHtcbiAgICBcIkFXU0luc3RhbmNlVHlwZTJBcmNoXCIgOiB7XG4gICAgICBcInQxLm1pY3JvXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJ0Mi5taWNyb1wiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwidDIuc21hbGxcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInQyLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMS5zbWFsbFwiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTMubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMxLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJjMS54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwiYzMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImcyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk1HMlwiICB9LFxuICAgICAgXCJyMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaGkxLjR4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImhzMS44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjcjEuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiY2MyLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH1cbiAgICB9XG4gICxcbiAgICBcIkFXU1JlZ2lvbkFyY2gyQU1JXCIgOiB7XG4gICAgICBcInVzLWVhc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTBmNGNmZDY0XCIsIFwiSFZNNjRcIiA6IFwiYW1pLTBkNGNmZDY2XCIsIFwiSFZNRzJcIiA6IFwiYW1pLTViMDViYTMwXCJ9LFxuICAgICAgXCJ1cy13ZXN0LTJcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kM2M1ZDFlM1wiLCBcIkhWTTY0XCIgOiBcImFtaS1kNWM1ZDFlNVwiLCBcIkhWTUcyXCIgOiBcImFtaS1hOWQ2YzA5OVwifSxcbiAgICAgIFwidXMtd2VzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktODVlYTEzYzFcIiwgXCJIVk02NFwiIDogXCJhbWktODdlYTEzYzNcIiwgXCJIVk1HMlwiIDogXCJhbWktMzc4MjdhNzNcIn0sXG4gICAgICBcImV1LXdlc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWQ2ZDE4ZWExXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWU0ZDE4ZTkzXCIsIFwiSFZNRzJcIiA6IFwiYW1pLTcyYTlmMTA1XCJ9LFxuICAgICAgXCJldS1jZW50cmFsLTFcIiAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1hNGIwYjdiOVwiLCBcIkhWTTY0XCIgOiBcImFtaS1hNmIwYjdiYlwiLCBcIkhWTUcyXCIgOiBcImFtaS1hNmM5Y2ZiYlwifSxcbiAgICAgIFwiYXAtbm9ydGhlYXN0LTFcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktMWExYjlmMWFcIiwgXCJIVk02NFwiIDogXCJhbWktMWMxYjlmMWNcIiwgXCJIVk1HMlwiIDogXCJhbWktZjY0NGM0ZjZcIn0sXG4gICAgICBcImFwLXNvdXRoZWFzdC0xXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWQyNGI0MjgwXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWQ0NGI0Mjg2XCIsIFwiSFZNRzJcIiA6IFwiYW1pLTEyYjViYzQwXCJ9LFxuICAgICAgXCJhcC1zb3V0aGVhc3QtMlwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS1lZjdiMzlkNVwiLCBcIkhWTTY0XCIgOiBcImFtaS1kYjdiMzllMVwiLCBcIkhWTUcyXCIgOiBcImFtaS1iMzMzN2U4OVwifSxcbiAgICAgIFwic2EtZWFzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktNWIwOTgxNDZcIiwgXCJIVk02NFwiIDogXCJhbWktNTUwOTgxNDhcIiwgXCJIVk1HMlwiIDogXCJOT1RfU1VQUE9SVEVEXCJ9LFxuICAgICAgXCJjbi1ub3J0aC0xXCIgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1iZWM0NTg4N1wiLCBcIkhWTTY0XCIgOiBcImFtaS1iY2M0NTg4NVwiLCBcIkhWTUcyXCIgOiBcIk5PVF9TVVBQT1JURURcIn1cbiAgICB9XG5cbiAgfSxcblxuICBcIlJlc291cmNlc1wiIDoge1xuICAgIFwiRUMySW5zdGFuY2VcIiA6IHtcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6SW5zdGFuY2VcIixcbiAgICAgIFwiUHJvcGVydGllc1wiIDoge1xuICAgICAgICBcIkluc3RhbmNlVHlwZVwiIDogeyBcIlJlZlwiIDogXCJJbnN0YW5jZVR5cGVcIiB9LFxuICAgICAgICBcIlNlY3VyaXR5R3JvdXBzXCIgOiBbIHsgXCJSZWZcIiA6IFwiSW5zdGFuY2VTZWN1cml0eUdyb3VwXCIgfSBdLFxuICAgICAgICBcIktleU5hbWVcIiA6IHsgXCJSZWZcIiA6IFwiS2V5TmFtZVwiIH0sXG4gICAgICAgIFwiSW1hZ2VJZFwiIDogeyBcIkZuOjpGaW5kSW5NYXBcIiA6IFsgXCJBV1NSZWdpb25BcmNoMkFNSVwiLCB7IFwiUmVmXCIgOiBcIkFXUzo6UmVnaW9uXCIgfSxcbiAgICAgICAgICB7IFwiRm46OkZpbmRJbk1hcFwiIDogWyBcIkFXU0luc3RhbmNlVHlwZTJBcmNoXCIsIHsgXCJSZWZcIiA6IFwiSW5zdGFuY2VUeXBlXCIgfSwgXCJBcmNoXCIgXSB9IF0gfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcIkluc3RhbmNlU2VjdXJpdHlHcm91cFwiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpTZWN1cml0eUdyb3VwXCIsXG4gICAgICBcIlByb3BlcnRpZXNcIiA6IHtcbiAgICAgICAgXCJHcm91cERlc2NyaXB0aW9uXCIgOiBcIkVuYWJsZSBTU0ggYWNjZXNzIHZpYSBwb3J0IDIyXCIsXG4gICAgICAgIFwiU2VjdXJpdHlHcm91cEluZ3Jlc3NcIiA6IFsge1xuICAgICAgICAgIFwiSXBQcm90b2NvbFwiIDogXCJ0Y3BcIixcbiAgICAgICAgICBcIkZyb21Qb3J0XCIgOiBcIjIyXCIsXG4gICAgICAgICAgXCJUb1BvcnRcIiA6IFwiMjJcIixcbiAgICAgICAgICBcIkNpZHJJcFwiIDogeyBcIlJlZlwiIDogXCJTU0hMb2NhdGlvblwifVxuICAgICAgICB9IF1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgXCJPdXRwdXRzXCIgOiB7XG4gICAgXCJJbnN0YW5jZUlkXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIkluc3RhbmNlSWQgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiUmVmXCIgOiBcIkVDMkluc3RhbmNlXCIgfVxuICAgIH0sXG4gICAgXCJBWlwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJBdmFpbGFiaWxpdHkgWm9uZSBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJGbjo6R2V0QXR0XCIgOiBbIFwiRUMySW5zdGFuY2VcIiwgXCJBdmFpbGFiaWxpdHlab25lXCIgXSB9XG4gICAgfSxcbiAgICBcIlB1YmxpY0ROU1wiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJQdWJsaWMgRE5TTmFtZSBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJGbjo6R2V0QXR0XCIgOiBbIFwiRUMySW5zdGFuY2VcIiwgXCJQdWJsaWNEbnNOYW1lXCIgXSB9XG4gICAgfSxcbiAgICBcIlB1YmxpY0lQXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIlB1YmxpYyBJUCBhZGRyZXNzIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIkZuOjpHZXRBdHRcIiA6IFsgXCJFQzJJbnN0YW5jZVwiLCBcIlB1YmxpY0lwXCIgXSB9XG4gICAgfVxuICB9XG59XG4iXX0=
