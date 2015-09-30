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
