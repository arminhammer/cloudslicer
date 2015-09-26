/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var GuiUtil = require('./gui.util');
var Element = require('./element');
var Arrow = require('./arrow');
var AWS_Users = require('./aws/AWS_Users');
var AWS_EC2_Instance = require('./aws/AWS_EC2_Instance');
var AWS_EC2_EIP = require('./aws/AWS_EC2_EIP');
var AWS_EC2_SecurityGroup = require('./aws/AWS_EC2_SecurityGroup');
var Collection = require('./collection');

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

    var winDimension = GuiUtil.getWindowDimension();

    var renderer = PIXI.autoDetectRenderer(winDimension.x, winDimension.y, {backgroundColor : 0xFFFFFF});

    var stage = new PIXI.Stage();
    stage.name = 'stage';
    stage.selected = null;
    stage.clickedOnlyStage = true;
    stage.on('mouseup', function() {
      if(stage.clickedOnlyStage) {
        console.log('Found stage click');
        if(stage.selected) {
          console.log(stage.selected);
          stage.selected.filters = null;
          stage.selected = null;
        }
      }
      else {
        stage.clickedOnlyStage = true;
      }
    });
    var elements = new Collection();
    var arrowGraphics = new PIXI.Graphics();

    var meter = new FPSMeter();

    var fps = 60;
    var now;
    var then = Date.now();
    var interval = 1000/fps;
    var delta;

    function animate(time) {
      requestAnimationFrame(animate);

      now = Date.now();
      delta = now - then;

      if (delta > interval) {
        then = now - (delta % interval);
        meter.tick();

        TWEEN.update(time);
        renderer.render(stage);
      }
    }

    function onLoaded() {
      console.log('Assets loaded');

      var dim = GuiUtil.getWindowDimension();
      console.log(elements.position);

      var users = new AWS_Users('users', dim.x/2, 100);
      console.log(users.position);
      elements.add(users);

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

      _.each(comboInstances, function(combo, key) {
        elements.add(combo);
      });

      _.each(instances, function(instance, key) {
        elements.add(instance);
      });

      _.each(eips, function(eip, key) {
        elements.add(eip);
      });

      _.each(secgroups, function(s, key) {
        elements.add(s);
      });

      /*
      _.each(groupings['AWS::EC2::EIPAssociation'], function(n) {

      });

      var instances = _.reduce(template.Resources, function(result, n, key) {
        if(n.Type === 'AWS::EC2::Instance') { result[key] = n; }
        return result;
      }, {});
      console.log('Instances:');
      console.log(instances);

      var sec_groups = _.reduce(template.Resources, function(result, n, key) {
        if(n.Type === 'AWS::EC2::SecurityGroup') { result[key] = n; }
        return result;
      }, {});
      console.log('Sec grps:');
      console.log(sec_groups);

      var keys = Object.keys(template.Resources);
      var keyLen = keys.length;
      for(var i =0; i < keyLen; i++) {
        console.log(keys[i]);
        console.log(template.Resources[keys[i]].Type);
      }
      */

      /*
      var instance1 = new AWS_EC2_Instance('instance1', dim.x/2, 400);
      console.log(instance1.position);
      elements.add(instance1);
      */

      //console.log(elementsContainer.getLocalBounds());

      //users.addArrowTo(instance1);

      console.log('Children:');
      console.log(elements.children);
      //var arrow = Arrow.drawBetween(users, instance1);

      stage.addChild(elements);
      console.log(stage.children);

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
          elements.add(instance);
        });
      stage.addChild(menuSprite);
    }

    PIXI.loader
      .add('../resources/sprites/sprites.json')
      .load(onLoaded);

    stage.interactive = true;
    var grid = stage.addChild(GuiUtil.drawGrid(winDimension.x, winDimension.y));

    console.log('Adding listener...');
    $(window).resize(function() {
      resizeGuiContainer(renderer);
      winDimension = GuiUtil.getWindowDimension();
      //console.log(newDim);
      console.log(stage);
      stage.removeChild(grid);
      grid = stage.addChild(GuiUtil.drawGrid(winDimension.x, winDimension.y));
    });

    return {
      template: options.template,

      drawCanvasEditor: function (element, isInitialized, context) {

        if (isInitialized) {
          animate();
          return;
        }

        //var elementSize = 100;
        //resizeGuiContainer();

        element.appendChild(renderer.view);

        renderer.render(stage);

        animate();

      }
    }
  },
  view: function(controller) {
    return m('#guiContainer', { config: controller.drawCanvasEditor})
  }
};

module.exports = PixiEditor;
