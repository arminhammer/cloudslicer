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

  fps = 60;
  var now;
  var then = Date.now();
  var interval = 1000/fps;
  var delta;
  var meter = new FPSMeter();
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

  self.elements = new Collection();

  self.animate = function(time) {
    requestAnimationFrame(self.animate);

    now = Date.now();
    delta = now - then;

    if (delta > interval) {
      then = now - (delta % interval);
      meter.tick();

      TWEEN.update(time);
      self.renderer.render(self.stage);
    }
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
      self.elements.add(s);
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
        self.elements.add(instance);
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
  graphic.beginFill(0xFFFFFF, 1);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL0VkaXRvck1hbmFnZXIuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX0VJUC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvYXdzL0FXU19FQzJfSW5zdGFuY2UuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX1NlY3VyaXR5R3JvdXAuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfVXNlcnMuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2NvbGxlY3Rpb24uanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2RyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZWxlbWVudC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZ3VpLnV0aWwuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL3BpeGkuZWRpdG9yLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9zb3VyY2UuZWRpdG9yLmpzIiwiYXBwL3NjcmlwdHMvbWFpbi5qcyIsImFwcC9zY3JpcHRzL3Rlc3REYXRhL2VjMi5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8yNi8xNS5cbiAqL1xuXG52YXIgR3VpVXRpbCA9IHJlcXVpcmUoJy4vZ3VpLnV0aWwnKTtcbnZhciBDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi9jb2xsZWN0aW9uJyk7XG52YXIgQVdTX1VzZXJzID0gcmVxdWlyZSgnLi9hd3MvQVdTX1VzZXJzJyk7XG52YXIgQVdTX0VDMl9JbnN0YW5jZSA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfSW5zdGFuY2UnKTtcbnZhciBBV1NfRUMyX0VJUCA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfRUlQJyk7XG52YXIgQVdTX0VDMl9TZWN1cml0eUdyb3VwID0gcmVxdWlyZSgnLi9hd3MvQVdTX0VDMl9TZWN1cml0eUdyb3VwJyk7XG5cbnZhciBFZGl0b3JNYW5hZ2VyID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgZnBzID0gNjA7XG4gIHZhciBub3c7XG4gIHZhciB0aGVuID0gRGF0ZS5ub3coKTtcbiAgdmFyIGludGVydmFsID0gMTAwMC9mcHM7XG4gIHZhciBkZWx0YTtcbiAgdmFyIG1ldGVyID0gbmV3IEZQU01ldGVyKCk7XG4gIHZhciB3aW5EaW1lbnNpb24gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuICB2YXIgZ3JpZCA9IG51bGw7XG5cbiAgc2VsZi5yZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSwge2JhY2tncm91bmRDb2xvciA6IDB4RkZGRkZGfSk7XG5cbiAgc2VsZi5zdGFnZSA9IG5ldyBQSVhJLlN0YWdlKCk7XG4gIHNlbGYuc3RhZ2UubmFtZSA9ICdzdGFnZSc7XG4gIHNlbGYuc3RhZ2Uuc2VsZWN0ZWQgPSBudWxsO1xuICBzZWxmLnN0YWdlLmNsaWNrZWRPbmx5U3RhZ2UgPSB0cnVlO1xuICBzZWxmLnN0YWdlLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgc2VsZi5zdGFnZS5vbignbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuICAgIGlmKHNlbGYuc3RhZ2UuY2xpY2tlZE9ubHlTdGFnZSkge1xuICAgICAgY29uc29sZS5sb2coJ0ZvdW5kIHN0YWdlIGNsaWNrJyk7XG4gICAgICBpZihzZWxmLnN0YWdlLnNlbGVjdGVkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHNlbGYuc3RhZ2Uuc2VsZWN0ZWQpO1xuICAgICAgICBzZWxmLnN0YWdlLnNlbGVjdGVkLmZpbHRlcnMgPSBudWxsO1xuICAgICAgICBzZWxmLnN0YWdlLnNlbGVjdGVkID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzZWxmLnN0YWdlLmNsaWNrZWRPbmx5U3RhZ2UgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgc2VsZi5lbGVtZW50cyA9IG5ldyBDb2xsZWN0aW9uKCk7XG5cbiAgc2VsZi5hbmltYXRlID0gZnVuY3Rpb24odGltZSkge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShzZWxmLmFuaW1hdGUpO1xuXG4gICAgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBkZWx0YSA9IG5vdyAtIHRoZW47XG5cbiAgICBpZiAoZGVsdGEgPiBpbnRlcnZhbCkge1xuICAgICAgdGhlbiA9IG5vdyAtIChkZWx0YSAlIGludGVydmFsKTtcbiAgICAgIG1ldGVyLnRpY2soKTtcblxuICAgICAgVFdFRU4udXBkYXRlKHRpbWUpO1xuICAgICAgc2VsZi5yZW5kZXJlci5yZW5kZXIoc2VsZi5zdGFnZSk7XG4gICAgfVxuICB9O1xuXG4gIHNlbGYuZ3JpZE9uID0gZnVuY3Rpb24oKSB7XG4gICAgZ3JpZCA9IEd1aVV0aWwuZHJhd0dyaWQod2luRGltZW5zaW9uLngsIHdpbkRpbWVuc2lvbi55KTtcbiAgICBzZWxmLnN0YWdlLmFkZENoaWxkKGdyaWQpO1xuICB9O1xuXG4gIHNlbGYuZ3JpZE9mZiA9IGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuc3RhZ2UucmVtb3ZlQ2hpbGQoZ3JpZCk7XG4gICAgc2VsZi5ncmlkID0gbnVsbDtcbiAgfTtcblxuICBzZWxmLm9uTG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0Fzc2V0cyBsb2FkZWQnKTtcblxuICAgIHZhciBkaW0gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuICAgIGNvbnNvbGUubG9nKHNlbGYuZWxlbWVudHMucG9zaXRpb24pO1xuXG4gICAgdmFyIHVzZXJzID0gbmV3IEFXU19Vc2VycygndXNlcnMnLCBkaW0ueC8yLCAxMDApO1xuICAgIGNvbnNvbGUubG9nKHVzZXJzLnBvc2l0aW9uKTtcbiAgICBzZWxmLmVsZW1lbnRzLmFkZCh1c2Vycyk7XG5cbiAgICBjb25zb2xlLmxvZyh0ZW1wbGF0ZS5SZXNvdXJjZXMpO1xuXG4gICAgdmFyIGdyb3VwaW5ncyA9IF8ucmVkdWNlKHRlbXBsYXRlLlJlc291cmNlcywgZnVuY3Rpb24ocmVzdWx0LCBuLCBrZXkpIHtcbiAgICAgIHJlc3VsdFtuLlR5cGVdID0ge307XG4gICAgICByZXN1bHRbbi5UeXBlXVtrZXldID0gbjtcbiAgICAgIHJldHVybiByZXN1bHRcbiAgICB9LCB7fSk7XG4gICAgY29uc29sZS5sb2coJ0dyb3VwaW5nczonKTtcbiAgICBjb25zb2xlLmxvZyhncm91cGluZ3MpO1xuXG4gICAgdmFyIGluc3RhbmNlcyA9IHt9O1xuICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpJbnN0YW5jZSddLCBmdW5jdGlvbihuLCBrZXkpIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBBV1NfRUMyX0luc3RhbmNlKGtleSwgZGltLngvMiwgNDAwKTtcbiAgICAgIGluc3RhbmNlc1trZXldID0gaW5zdGFuY2U7XG4gICAgfSk7XG5cbiAgICB2YXIgZWlwcyA9IHt9O1xuICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpFSVAnXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICBjb25zb2xlLmxvZygnQWRkaW5nIEVJUCAnLCBrZXkpO1xuICAgICAgdmFyIGVpcCA9IG5ldyBBV1NfRUMyX0VJUChrZXksIGRpbS54LzIsIDUwMCk7XG4gICAgICBlaXBzW2tleV0gPSBlaXA7XG4gICAgfSk7XG5cbiAgICB2YXIgc2VjZ3JvdXBzID0ge307XG4gICAgXy5lYWNoKGdyb3VwaW5nc1snQVdTOjpFQzI6OlNlY3VyaXR5R3JvdXAnXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICBjb25zb2xlLmxvZygnQWRkaW5nIFNlY3VyaXR5IEdyb3VwICcsIGtleSk7XG4gICAgICB2YXIgc2VjZ3JvdXAgPSBuZXcgQVdTX0VDMl9TZWN1cml0eUdyb3VwKGtleSwgZGltLngvMiwgNTAwKTtcbiAgICAgIHNlY2dyb3Vwc1trZXldID0gc2VjZ3JvdXA7XG4gICAgfSk7XG5cbiAgICB2YXIgY29tYm9JbnN0YW5jZXMgPSB7fTtcbiAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6RUlQQXNzb2NpYXRpb24nXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICBjb25zb2xlLmxvZygnQ2hlY2tpbmcgYXNzb2NpYXRpb24nKTtcbiAgICAgIGNvbnNvbGUubG9nKG4pO1xuICAgICAgY29uc29sZS5sb2coa2V5KTtcbiAgICAgIGNvbnNvbGUubG9nKGVpcHMpO1xuICAgICAgY29uc29sZS5sb2coJ1JlZjogJyxuLlByb3BlcnRpZXMuRUlQLlJlZik7XG4gICAgICB2YXIgaW5zdGFuY2UgPSBpbnN0YW5jZXNbbi5Qcm9wZXJ0aWVzLkluc3RhbmNlSWQuUmVmXTtcbiAgICAgIGlmKGluc3RhbmNlKSB7XG4gICAgICAgIHZhciBlaXAgPSBlaXBzW24uUHJvcGVydGllcy5FSVAuUmVmXTtcbiAgICAgICAgaWYoZWlwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0Fzc29jaWF0aW9uIGhhcyBhIG1hdGNoIScpO1xuICAgICAgICAgIHZhciBjb250YWluZXIgPSBuZXcgQ29sbGVjdGlvbigpO1xuICAgICAgICAgIGNvbnRhaW5lci5hZGQoaW5zdGFuY2UpO1xuICAgICAgICAgIGNvbnRhaW5lci5hZGQoZWlwKTtcbiAgICAgICAgICBjb21ib0luc3RhbmNlc1trZXldID0gY29udGFpbmVyO1xuICAgICAgICAgIGRlbGV0ZSBpbnN0YW5jZXNbbi5Qcm9wZXJ0aWVzLkluc3RhbmNlSWQuUmVmXTtcbiAgICAgICAgICBkZWxldGUgZWlwc1tuLlByb3BlcnRpZXMuRUlQLlJlZl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vdmFyIGVpcCA9IG5ldyBBV1NfRUMyX0VJUChrZXksIGRpbS54LzIsIDUwMCk7XG4gICAgICAvL2VpcHNba2V5XSA9IGVpcDtcbiAgICB9KTtcblxuICAgIF8uZWFjaChzZWNncm91cHMsIGZ1bmN0aW9uKHMsIGtleSkge1xuICAgICAgc2VsZi5lbGVtZW50cy5hZGQocyk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goY29tYm9JbnN0YW5jZXMsIGZ1bmN0aW9uKGNvbWJvLCBrZXkpIHtcbiAgICAgIHNlbGYuZWxlbWVudHMuYWRkKGNvbWJvKTtcbiAgICB9KTtcblxuICAgIF8uZWFjaChpbnN0YW5jZXMsIGZ1bmN0aW9uKGluc3RhbmNlLCBrZXkpIHtcbiAgICAgIHNlbGYuZWxlbWVudHMuYWRkKGluc3RhbmNlKTtcbiAgICB9KTtcblxuICAgIF8uZWFjaChlaXBzLCBmdW5jdGlvbihlaXAsIGtleSkge1xuICAgICAgc2VsZi5lbGVtZW50cy5hZGQoZWlwKTtcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKCdDaGlsZHJlbjonKTtcbiAgICBjb25zb2xlLmxvZyhzZWxmLmVsZW1lbnRzLmNoaWxkcmVuKTtcblxuICAgIHNlbGYuc3RhZ2UuYWRkQ2hpbGQoc2VsZi5lbGVtZW50cyk7XG4gICAgY29uc29sZS5sb2coc2VsZi5zdGFnZS5jaGlsZHJlbik7XG5cbiAgICB2YXIgbWVudVNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSgpO1xuICAgIG1lbnVTcHJpdGUudGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ0NvbXB1dGVfJl9OZXR3b3JraW5nX0FtYXpvbl9FQzJfSW5zdGFuY2UucG5nJyk7XG4gICAgbWVudVNwcml0ZS5zY2FsZS5zZXQoMC4yKTtcbiAgICBtZW51U3ByaXRlLnkgPSBkaW0ueS8yO1xuICAgIG1lbnVTcHJpdGUueCA9IGRpbS54LTQwO1xuICAgIG1lbnVTcHJpdGUuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgIG1lbnVTcHJpdGUuYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgbWVudVNwcml0ZS5hbmNob3Iuc2V0KDAuNSk7XG4gICAgbWVudVNwcml0ZVxuICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqMS4yKTtcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54LzEuMik7XG4gICAgICB9KVxuICAgICAgLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkLicpO1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQVdTX0VDMl9JbnN0YW5jZSgnTmV3X0luc3RhbmNlJywgZGltLngvMiwgZGltLnkvMik7XG4gICAgICAgIHNlbGYuZWxlbWVudHMuYWRkKGluc3RhbmNlKTtcbiAgICAgIH0pO1xuICAgIHNlbGYuc3RhZ2UuYWRkQ2hpbGQobWVudVNwcml0ZSk7XG5cbiAgICB2YXIgbWVudVNlY0dyb3VwID0gbmV3IFBJWEkuU3ByaXRlKCk7XG4gICAgdmFyIG1lbnVHcmFwaGljID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICBtZW51R3JhcGhpYy5saW5lU3R5bGUoMywgMHgwMDAwMDAsIDEpO1xuICAgIG1lbnVHcmFwaGljLmJlZ2luRmlsbCgweEZGRkZGRiwgMSk7XG4gICAgbWVudUdyYXBoaWMuZHJhd1JvdW5kZWRSZWN0KDAsMCwzMCwzMCw2KTtcbiAgICBtZW51R3JhcGhpYy5lbmRGaWxsKCk7XG4gICAgbWVudVNlY0dyb3VwLnRleHR1cmUgPSBtZW51R3JhcGhpYy5nZW5lcmF0ZVRleHR1cmUoKTtcblxuICAgIG1lbnVTZWNHcm91cC5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgbWVudVNlY0dyb3VwLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgIG1lbnVTZWNHcm91cC5wb3NpdGlvbi55ID0gZGltLnkvMis0MDtcbiAgICBtZW51U2VjR3JvdXAucG9zaXRpb24ueCA9IGRpbS54LTQwO1xuICAgIG1lbnVTZWNHcm91cC5zY2FsZS5zZXQoMS4wKTtcbiAgICBtZW51U2VjR3JvdXAuYW5jaG9yLnNldCgwLjUpO1xuICAgIG1lbnVTZWNHcm91cFxuICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqMS4xKTtcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54LzEuMSk7XG4gICAgICB9KVxuICAgICAgLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkLicpO1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQVdTX0VDMl9TZWN1cml0eUdyb3VwKCdOZXdfU2VjdXJpdHlfR3JvdXAnLCBkaW0ueC8yLCBkaW0ueS8yKTtcbiAgICAgICAgc2VsZi5lbGVtZW50cy5hZGQoaW5zdGFuY2UpO1xuICAgICAgfSk7XG4gICAgc2VsZi5zdGFnZS5hZGRDaGlsZChtZW51U2VjR3JvdXApO1xuICB9O1xuXG4gIHNlbGYuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHNlbGYuZ3JpZE9uKCk7XG4gICAgUElYSS5sb2FkZXJcbiAgICAgIC5hZGQoJy4uL3Jlc291cmNlcy9zcHJpdGVzL3Nwcml0ZXMuanNvbicpXG4gICAgICAubG9hZChzZWxmLm9uTG9hZGVkKTtcbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvck1hbmFnZXI7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX0VDMl9FSVAgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi5zY2FsZS5zZXQoMC4zKTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9FbGFzdGljX0lQLnBuZycpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xufTtcbkFXU19FQzJfRUlQLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19FQzJfRUlQO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTkvMTUuXG4gKi9cblxudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuLi9lbGVtZW50Jyk7XG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuLi9kcmFnLmRyb3AnKTtcblxudmFyIEFXU19FQzJfSW5zdGFuY2UgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9JbnN0YW5jZS5wbmcnKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcbn07XG5BV1NfRUMyX0luc3RhbmNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19FQzJfSW5zdGFuY2U7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8yMS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2VsZW1lbnQnKTtcblxudmFyIEFXU19FQzJfU2VjdXJpdHlHcm91cCA9IGZ1bmN0aW9uKG5hbWUseCx5KSB7XG4gIEVsZW1lbnQuY2FsbCh0aGlzKTtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYubmFtZSA9IG5hbWU7XG5cbiAgdmFyIGdyYXBoaWMgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICBncmFwaGljLmxpbmVTdHlsZSgzLCAweDAwMDAwMCwgMSk7XG4gIGdyYXBoaWMuYmVnaW5GaWxsKDB4RkZGRkZGLCAxKTtcbiAgZ3JhcGhpYy5kcmF3Um91bmRlZFJlY3QoMCwwLDIwMCwyMDAsMTApO1xuICBncmFwaGljLmVuZEZpbGwoKTtcblxuICBzZWxmLnRleHR1cmUgPSBncmFwaGljLmdlbmVyYXRlVGV4dHVyZSgpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xuXG59O1xuQVdTX0VDMl9TZWN1cml0eUdyb3VwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19FQzJfU2VjdXJpdHlHcm91cDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE5LzE1LlxuICovXG5cbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi4vZWxlbWVudCcpO1xudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi4vZHJhZy5kcm9wJyk7XG5cbnZhciBBV1NfVXNlcnMgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnTm9uLVNlcnZpY2VfU3BlY2lmaWNfY29weV9Vc2Vycy5wbmcnKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxufTtcbkFXU19Vc2Vycy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfVXNlcnM7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMjEvMTUuXG4gKi9cbi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8xNS8xNS5cbiAqL1xuXG52YXIgQ29sbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBQSVhJLkNvbnRhaW5lci5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5lbGVtZW50cyA9IHt9O1xuXG4gIHNlbGYuYWRkID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHNlbGYuYWRkQ2hpbGQoZWxlbWVudCk7XG4gICAgc2VsZi5lbGVtZW50c1tlbGVtZW50Lm5hbWVdID0gZWxlbWVudDtcbiAgfTtcblxuICBzZWxmLnJlbW92ZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICAgIGRlbGV0ZSBzZWxmLmVsZW1lbnRzW2VsZW1lbnQubmFtZV07XG4gIH07XG5cbn07XG5Db2xsZWN0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUElYSS5Db250YWluZXIucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTQvMTUuXG4gKi9cblxudmFyIE1PVVNFX09WRVJfU0NBTEVfUkFUSU8gPSAxLjE7XG5cbnZhciBEcmFnRHJvcCA9IHtcblxuICBvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygpO1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gIH0sXG5cbiAgb25EcmFnRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLm1vdmVkKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgZHJhZ2dpbmcnKTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgTk9UIGRyYWdnaW5nJyk7XG4gICAgICB2YXIgc2hhZG93ID0gbmV3IFBJWEkuZmlsdGVycy5Ecm9wU2hhZG93RmlsdGVyKCk7XG4gICAgICB0aGlzLmZpbHRlcnMgPSBbc2hhZG93XTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgY29uc29sZS5sb2coJ1BhcmVudDonKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMucGFyZW50LnBhcmVudCk7XG4gICAgICBpZih0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQucGFyZW50LnNlbGVjdGVkLmZpbHRlcnMgPSBudWxsO1xuICAgICAgICB0aGlzLnBhcmVudC5wYXJlbnQuc2VsZWN0ZWQgPSBudWxsO1xuICAgICAgfVxuICAgICAgdGhpcy5wYXJlbnQucGFyZW50LmNsaWNrZWRPbmx5U3RhZ2UgPSBmYWxzZTtcbiAgICAgIHRoaXMucGFyZW50LnBhcmVudC5zZWxlY3RlZCA9IHRoaXM7XG4gICAgfVxuICB9LFxuXG4gIG9uRHJhZ01vdmU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5kcmFnZ2luZylcbiAgICB7XG4gICAgICB2YXIgbmV3UG9zaXRpb24gPSBzZWxmLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbihzZWxmLnBhcmVudCk7XG4gICAgICBzZWxmLnBvc2l0aW9uLnggPSBuZXdQb3NpdGlvbi54O1xuICAgICAgc2VsZi5wb3NpdGlvbi55ID0gbmV3UG9zaXRpb24ueTtcbiAgICAgIHNlbGYubW92ZWQgPSB0cnVlO1xuICAgIH1cbiAgfSxcblxuICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG92ZXIhJyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueCpNT1VTRV9PVkVSX1NDQUxFX1JBVElPKTtcbiAgICB2YXIgaWNvblNpemUgPSAxMDtcblxuICAgIHZhciBnbG9iYWwgPSBzZWxmLnRvR2xvYmFsKHNlbGYucG9zaXRpb24pO1xuICAgIC8vY29uc29sZS5sb2coJ29mZmljaWFsOiAnICsgc2VsZi5wb3NpdGlvbi54ICsgJzonICsgc2VsZi5wb3NpdGlvbi55KTtcbiAgICAvL2NvbnNvbGUubG9nKCdHTE9CQUw6ICcgKyBnbG9iYWwueCArICc6JyArIGdsb2JhbC55KTtcbiAgICAvL2NvbnNvbGUubG9nKHNlbGYuZ2V0TG9jYWxCb3VuZHMoKSk7XG5cbiAgICB2YXIgc2NhbGVMb2NhdGlvbnMgPSBbXG4gICAgICB7eDogMCwgeTogMC1zZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzItaWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAtc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzItaWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aC8yK2ljb25TaXplLzIsIHk6IDAsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiAwLCB5OiBzZWxmLmdldExvY2FsQm91bmRzKCkuaGVpZ2h0LzIraWNvblNpemUvMiwgc2l6ZTogaWNvblNpemV9XG4gICAgXTtcblxuICAgIC8vY29uc29sZS5sb2coc2NhbGVMb2NhdGlvbnNbMF0pO1xuXG4gICAgc2VsZi5zY2FsZUljb25zID0gW107XG5cbiAgICBzY2FsZUxvY2F0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGxvYykge1xuICAgICAgdmFyIGljb24gPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgICAgaWNvbi5tb3ZlVG8oMCwwKTtcbiAgICAgIGljb24uaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgaWNvbi5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICAgIGljb24ubGluZVN0eWxlKDEsIDB4MDAwMEZGLCAxKTtcbiAgICAgIGljb24uYmVnaW5GaWxsKDB4RkZGRkZGLCAxKTtcbiAgICAgIGljb24uZHJhd0NpcmNsZShsb2MueCwgbG9jLnksIGxvYy5zaXplKTtcbiAgICAgIGljb24uZW5kRmlsbCgpO1xuXG4gICAgICAvL2ljb25cbiAgICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgICAgIC8vLm9uKCdtb3VzZWRvd24nLCBvblNjYWxlSWNvbkRyYWdTdGFydClcbiAgICAgICAgLy8ub24oJ3RvdWNoc3RhcnQnLCBvblNjYWxlSWNvbkRyYWdTdGFydCk7XG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgICAvLy5vbignbW91c2V1cCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCdtb3VzZXVwb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgICAgLy8ub24oJ21vdXNlbW92ZScsIG9uRHJhZ01vdmUpXG4gICAgICAvLy5vbigndG91Y2htb3ZlJywgb25EcmFnTW92ZSlcblxuICAgICAgc2VsZi5zY2FsZUljb25zLnB1c2goaWNvbik7XG5cbiAgICB9KTtcblxuICAgIHNlbGYuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYuYWRkQ2hpbGQocyk7XG4gICAgfSk7XG5cbiAgICBzZWxmLnRvb2x0aXAgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHNlbGYudG9vbHRpcC5saW5lU3R5bGUoMywgMHgwMDAwRkYsIDEpO1xuICAgIHNlbGYudG9vbHRpcC5iZWdpbkZpbGwoMHgwMDAwMDAsIDEpO1xuICAgIC8vc2VsZi5kcmF3Lm1vdmVUbyh4LHkpO1xuICAgIHNlbGYudG9vbHRpcC5kcmF3Um91bmRlZFJlY3QoMCsyMCwtc2VsZi5oZWlnaHQsMjAwLDEwMCwxMCk7XG4gICAgc2VsZi50b29sdGlwLmVuZEZpbGwoKTtcbiAgICBzZWxmLnRvb2x0aXAudGV4dFN0eWxlID0ge1xuICAgICAgZm9udCA6ICdib2xkIGl0YWxpYyAyOHB4IEFyaWFsJyxcbiAgICAgIGZpbGwgOiAnI0Y3RURDQScsXG4gICAgICBzdHJva2UgOiAnIzRhMTg1MCcsXG4gICAgICBzdHJva2VUaGlja25lc3MgOiA1LFxuICAgICAgZHJvcFNoYWRvdyA6IHRydWUsXG4gICAgICBkcm9wU2hhZG93Q29sb3IgOiAnIzAwMDAwMCcsXG4gICAgICBkcm9wU2hhZG93QW5nbGUgOiBNYXRoLlBJIC8gNixcbiAgICAgIGRyb3BTaGFkb3dEaXN0YW5jZSA6IDYsXG4gICAgICB3b3JkV3JhcCA6IHRydWUsXG4gICAgICB3b3JkV3JhcFdpZHRoIDogNDQwXG4gICAgfTtcblxuICAgIHNlbGYudG9vbHRpcC50ZXh0ID0gbmV3IFBJWEkuVGV4dChzZWxmLm5hbWUsc2VsZi50b29sdGlwLnRleHRTdHlsZSk7XG4gICAgc2VsZi50b29sdGlwLnRleHQueCA9IDArMzA7XG4gICAgc2VsZi50b29sdGlwLnRleHQueSA9IC1zZWxmLmhlaWdodDtcblxuICAgIHZhciB0b29sdGlwVHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4oc2VsZi50b29sdGlwKVxuICAgICAgLnRvKHt4OnNlbGYud2lkdGh9LDcwMClcbiAgICAgIC5lYXNpbmcoIFRXRUVOLkVhc2luZy5FbGFzdGljLkluT3V0IClcbiAgICAgIC5zdGFydCgpO1xuICAgIHZhciB0b29sdGlwVGV4dFR3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcC50ZXh0KVxuICAgICAgLnRvKHt4OnNlbGYud2lkdGgrMjB9LDcwMClcbiAgICAgIC5lYXNpbmcoIFRXRUVOLkVhc2luZy5FbGFzdGljLkluT3V0IClcbiAgICAgIC5zdGFydCgpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyB0b29sdGlwJyk7XG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXApO1xuXG4gICAgc2VsZi5hZGRDaGlsZChzZWxmLnRvb2x0aXAudGV4dCk7XG4gIH0sXG5cbiAgb25Nb3VzZU91dDogZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnTW91c2VkIG91dCEnKTtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54L01PVVNFX09WRVJfU0NBTEVfUkFUSU8pO1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlIG91dCcpO1xuICAgIHRoaXMuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2hpbGQocyk7XG4gICAgfSk7XG4gICAgLy9jb25zb2xlLmxvZygnU2l6ZTogJyk7XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmdldEJvdW5kcygpKTtcblxuICAgIHNlbGYucmVtb3ZlQ2hpbGQoc2VsZi50b29sdGlwKTtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKHNlbGYudG9vbHRpcC50ZXh0KTtcbiAgfSxcblxuICBvblNjYWxlSWNvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gICAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIScpO1xuICB9XG5cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBEcmFnRHJvcDtcblxuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzE1LzE1LlxuICovXG5cbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4vZHJhZy5kcm9wJyk7XG5cbnZhciBERUZBVUxUX1NDQUxFID0gMC43O1xuXG52YXIgRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuICBQSVhJLlNwcml0ZS5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5zY2FsZS5zZXQoREVGQVVMVF9TQ0FMRSk7XG4gIHNlbGYuYW5jaG9yLnNldCgwLjUpO1xuICBzZWxmLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgc2VsZi5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgc2VsZlxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBzdGFydFxuICAgIC5vbignbW91c2Vkb3duJywgRHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgLm9uKCd0b3VjaHN0YXJ0JywgRHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIGVuZFxuICAgIC5vbignbW91c2V1cCcsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ21vdXNldXBvdXRzaWRlJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbigndG91Y2hlbmQnLCBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIG1vdmVcbiAgICAub24oJ21vdXNlbW92ZScsIERyYWdEcm9wLm9uRHJhZ01vdmUpXG4gICAgLm9uKCd0b3VjaG1vdmUnLCBEcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgIC8vIGV2ZW50cyBmb3IgbW91c2Ugb3ZlclxuICAgIC5vbignbW91c2VvdmVyJywgRHJhZ0Ryb3Aub25Nb3VzZU92ZXIpXG4gICAgLm9uKCdtb3VzZW91dCcsIERyYWdEcm9wLm9uTW91c2VPdXQpO1xuXG4gIHNlbGYuYXJyb3dzID0gW107XG5cbiAgc2VsZi5hZGRBcnJvd1RvID0gZnVuY3Rpb24oYikge1xuICAgIHNlbGYuYXJyb3dzLnB1c2goYik7XG4gIH07XG5cbiAgc2VsZi5yZW1vdmVBcnJvd1RvID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBzZWxmLmFycm93cy5yZW1vdmUoaW5kZXgpO1xuICB9O1xuXG59O1xuRWxlbWVudC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBJWEkuU3ByaXRlLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRWxlbWVudDtcbiIsIlxudmFyIEd1aVV0aWwgPSB7XG5cbiAgZ2V0V2luZG93RGltZW5zaW9uOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geyB4OiB3aW5kb3cuaW5uZXJXaWR0aCwgeTogd2luZG93LmlubmVySGVpZ2h0IH07XG4gIH0sXG5cbiAgZHJhd0dyaWQ6IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB2YXIgZ3JpZCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgdmFyIGludGVydmFsID0gMTAwO1xuICAgIHZhciBjb3VudCA9IGludGVydmFsO1xuICAgIGdyaWQubGluZVN0eWxlKDEsIDB4RTVFNUU1LCAxKTtcbiAgICB3aGlsZSAoY291bnQgPCB3aWR0aCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oY291bnQsIDApO1xuICAgICAgZ3JpZC5saW5lVG8oY291bnQsIGhlaWdodCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIGNvdW50ID0gaW50ZXJ2YWw7XG4gICAgd2hpbGUoY291bnQgPCBoZWlnaHQpIHtcbiAgICAgIGdyaWQubW92ZVRvKDAsIGNvdW50KTtcbiAgICAgIGdyaWQubGluZVRvKHdpZHRoLCBjb3VudCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIHZhciBjb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgICBjb250YWluZXIuYWRkQ2hpbGQoZ3JpZCk7XG4gICAgY29udGFpbmVyLmNhY2hlQXNCaXRtYXAgPSB0cnVlO1xuICAgIHJldHVybiBjb250YWluZXI7XG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHdWlVdGlsO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDcvOS8xNS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBHdWlVdGlsID0gcmVxdWlyZSgnLi9ndWkudXRpbCcpO1xudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuL2VsZW1lbnQnKTtcbi8vdmFyIEFycm93ID0gcmVxdWlyZSgnLi9hcnJvdycpO1xudmFyIEVkaXRvck1hbmFnZXIgPSByZXF1aXJlKCcuL0VkaXRvck1hbmFnZXInKTtcblxuZnVuY3Rpb24gcmVzaXplR3VpQ29udGFpbmVyKHJlbmRlcmVyKSB7XG5cbiAgdmFyIGRpbSA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG5cbiAgY29uc29sZS5sb2coJ1Jlc2l6aW5nLi4uJyk7XG4gIGNvbnNvbGUubG9nKGRpbSk7XG5cbiAgJCgnI2d1aUNvbnRhaW5lcicpLmhlaWdodChkaW0ueSk7XG4gICQoJyNndWlDb250YWluZXInKS53aWR0aChkaW0ueCk7XG5cbiAgaWYocmVuZGVyZXIpIHtcbiAgICByZW5kZXJlci52aWV3LnN0eWxlLndpZHRoID0gZGltLngrJ3B4JztcbiAgICByZW5kZXJlci52aWV3LnN0eWxlLmhlaWdodCA9IGRpbS55KydweCc7XG4gIH1cblxuICBjb25zb2xlLmxvZygnUmVzaXppbmcgZ3VpIGNvbnRhaW5lci4uLicpO1xuXG59XG5cbnZhciBQaXhpRWRpdG9yID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBvcHRpb25zLnRlbXBsYXRlKCk7XG4gICAgY29uc29sZS5sb2codGVtcGxhdGUpO1xuXG4gICAgdmFyIE1BTkFHRVIgPSBuZXcgRWRpdG9yTWFuYWdlcih0ZW1wbGF0ZSk7XG4gICAgTUFOQUdFUi5pbml0KCk7XG5cbiAgICBjb25zb2xlLmxvZygnQWRkaW5nIGxpc3RlbmVyLi4uJyk7XG4gICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgIHJlc2l6ZUd1aUNvbnRhaW5lcihyZW5kZXJlcik7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGVtcGxhdGU6IG9wdGlvbnMudGVtcGxhdGUsXG5cbiAgICAgIGRyYXdDYW52YXNFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBNQU5BR0VSLmFuaW1hdGUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKE1BTkFHRVIucmVuZGVyZXIudmlldyk7XG5cbiAgICAgICAgTUFOQUdFUi5hbmltYXRlKCk7XG5cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHZpZXc6IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICByZXR1cm4gbSgnI2d1aUNvbnRhaW5lcicsIHsgY29uZmlnOiBjb250cm9sbGVyLmRyYXdDYW52YXNFZGl0b3J9KVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpeGlFZGl0b3I7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcmVzaXplRWRpdG9yKGVkaXRvcikge1xuICBlZGl0b3Iuc2V0U2l6ZShudWxsLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xufVxuXG52YXIgU291cmNlRWRpdG9yID0ge1xuXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgIGRyYXdFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgdmFyIGVkaXRvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBpZihlZGl0b3IpIHtcbiAgICAgICAgICAgIGVkaXRvci5yZWZyZXNoKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVkaXRvciA9IENvZGVNaXJyb3IoZWxlbWVudCwge1xuICAgICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShvcHRpb25zLnRlbXBsYXRlKCksIHVuZGVmaW5lZCwgMiksXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgbW9kZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIGd1dHRlcnM6IFsnQ29kZU1pcnJvci1saW50LW1hcmtlcnMnXSxcbiAgICAgICAgICBsaW50OiB0cnVlLFxuICAgICAgICAgIHN0eWxlQWN0aXZlTGluZTogdHJ1ZSxcbiAgICAgICAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIHRoZW1lOiAnemVuYnVybidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzaXplRWRpdG9yKGVkaXRvcik7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlZGl0b3IpIHtcbiAgICAgICAgICBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcbiAgICAgICAgICBvcHRpb25zLnRlbXBsYXRlKEpTT04ucGFyc2UoZWRpdG9yLmdldFZhbHVlKCkpKTtcbiAgICAgICAgICBtLmVuZENvbXB1dGF0aW9uKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBbXG4gICAgICBtKCcjc291cmNlRWRpdG9yJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0VkaXRvciB9KVxuICAgIF1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb3VyY2VFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBTb3VyY2VFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvc291cmNlLmVkaXRvcicpO1xudmFyIFBpeGlFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcGl4aS5lZGl0b3InKTtcblxudmFyIHRlc3REYXRhID0gcmVxdWlyZSgnLi90ZXN0RGF0YS9lYzIuanNvbicpO1xuXG52YXIgdGVtcGxhdGUgPSBtLnByb3AodGVzdERhdGEpO1xuXG5tLm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbG91ZHNsaWNlci1hcHAnKSwgbS5jb21wb25lbnQoUGl4aUVkaXRvciwge1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB9KVxuKTtcblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZS1iYXInKSwgbS5jb21wb25lbnQoU291cmNlRWRpdG9yLCB7XG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIH0pXG4pO1xuIiwibW9kdWxlLmV4cG9ydHM9XG57XG4gIFwiQVdTVGVtcGxhdGVGb3JtYXRWZXJzaW9uXCIgOiBcIjIwMTAtMDktMDlcIixcblxuICBcIkRlc2NyaXB0aW9uXCIgOiBcIkFXUyBDbG91ZEZvcm1hdGlvbiBTYW1wbGUgVGVtcGxhdGUgRUMySW5zdGFuY2VXaXRoU2VjdXJpdHlHcm91cFNhbXBsZTogQ3JlYXRlIGFuIEFtYXpvbiBFQzIgaW5zdGFuY2UgcnVubmluZyB0aGUgQW1hem9uIExpbnV4IEFNSS4gVGhlIEFNSSBpcyBjaG9zZW4gYmFzZWQgb24gdGhlIHJlZ2lvbiBpbiB3aGljaCB0aGUgc3RhY2sgaXMgcnVuLiBUaGlzIGV4YW1wbGUgY3JlYXRlcyBhbiBFQzIgc2VjdXJpdHkgZ3JvdXAgZm9yIHRoZSBpbnN0YW5jZSB0byBnaXZlIHlvdSBTU0ggYWNjZXNzLiAqKldBUk5JTkcqKiBUaGlzIHRlbXBsYXRlIGNyZWF0ZXMgYW4gQW1hem9uIEVDMiBpbnN0YW5jZS4gWW91IHdpbGwgYmUgYmlsbGVkIGZvciB0aGUgQVdTIHJlc291cmNlcyB1c2VkIGlmIHlvdSBjcmVhdGUgYSBzdGFjayBmcm9tIHRoaXMgdGVtcGxhdGUuXCIsXG5cbiAgXCJQYXJhbWV0ZXJzXCIgOiB7XG4gICAgXCJLZXlOYW1lXCI6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiTmFtZSBvZiBhbiBleGlzdGluZyBFQzIgS2V5UGFpciB0byBlbmFibGUgU1NIIGFjY2VzcyB0byB0aGUgaW5zdGFuY2VcIixcbiAgICAgIFwiVHlwZVwiOiBcIkFXUzo6RUMyOjpLZXlQYWlyOjpLZXlOYW1lXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIHRoZSBuYW1lIG9mIGFuIGV4aXN0aW5nIEVDMiBLZXlQYWlyLlwiXG4gICAgfSxcblxuICAgIFwiSW5zdGFuY2VUeXBlXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIldlYlNlcnZlciBFQzIgaW5zdGFuY2UgdHlwZVwiLFxuICAgICAgXCJUeXBlXCIgOiBcIlN0cmluZ1wiLFxuICAgICAgXCJEZWZhdWx0XCIgOiBcIm0xLnNtYWxsXCIsXG4gICAgICBcIkFsbG93ZWRWYWx1ZXNcIiA6IFsgXCJ0MS5taWNyb1wiLCBcInQyLm1pY3JvXCIsIFwidDIuc21hbGxcIiwgXCJ0Mi5tZWRpdW1cIiwgXCJtMS5zbWFsbFwiLCBcIm0xLm1lZGl1bVwiLCBcIm0xLmxhcmdlXCIsIFwibTEueGxhcmdlXCIsIFwibTIueGxhcmdlXCIsIFwibTIuMnhsYXJnZVwiLCBcIm0yLjR4bGFyZ2VcIiwgXCJtMy5tZWRpdW1cIiwgXCJtMy5sYXJnZVwiLCBcIm0zLnhsYXJnZVwiLCBcIm0zLjJ4bGFyZ2VcIiwgXCJjMS5tZWRpdW1cIiwgXCJjMS54bGFyZ2VcIiwgXCJjMy5sYXJnZVwiLCBcImMzLnhsYXJnZVwiLCBcImMzLjJ4bGFyZ2VcIiwgXCJjMy40eGxhcmdlXCIsIFwiYzMuOHhsYXJnZVwiLCBcImM0LmxhcmdlXCIsIFwiYzQueGxhcmdlXCIsIFwiYzQuMnhsYXJnZVwiLCBcImM0LjR4bGFyZ2VcIiwgXCJjNC44eGxhcmdlXCIsIFwiZzIuMnhsYXJnZVwiLCBcInIzLmxhcmdlXCIsIFwicjMueGxhcmdlXCIsIFwicjMuMnhsYXJnZVwiLCBcInIzLjR4bGFyZ2VcIiwgXCJyMy44eGxhcmdlXCIsIFwiaTIueGxhcmdlXCIsIFwiaTIuMnhsYXJnZVwiLCBcImkyLjR4bGFyZ2VcIiwgXCJpMi44eGxhcmdlXCIsIFwiZDIueGxhcmdlXCIsIFwiZDIuMnhsYXJnZVwiLCBcImQyLjR4bGFyZ2VcIiwgXCJkMi44eGxhcmdlXCIsIFwiaGkxLjR4bGFyZ2VcIiwgXCJoczEuOHhsYXJnZVwiLCBcImNyMS44eGxhcmdlXCIsIFwiY2MyLjh4bGFyZ2VcIiwgXCJjZzEuNHhsYXJnZVwiXVxuICAgICxcbiAgICAgIFwiQ29uc3RyYWludERlc2NyaXB0aW9uXCIgOiBcIm11c3QgYmUgYSB2YWxpZCBFQzIgaW5zdGFuY2UgdHlwZS5cIlxuICAgIH0sXG5cbiAgICBcIlNTSExvY2F0aW9uXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIlRoZSBJUCBhZGRyZXNzIHJhbmdlIHRoYXQgY2FuIGJlIHVzZWQgdG8gU1NIIHRvIHRoZSBFQzIgaW5zdGFuY2VzXCIsXG4gICAgICBcIlR5cGVcIjogXCJTdHJpbmdcIixcbiAgICAgIFwiTWluTGVuZ3RoXCI6IFwiOVwiLFxuICAgICAgXCJNYXhMZW5ndGhcIjogXCIxOFwiLFxuICAgICAgXCJEZWZhdWx0XCI6IFwiMC4wLjAuMC8wXCIsXG4gICAgICBcIkFsbG93ZWRQYXR0ZXJuXCI6IFwiKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pLyhcXFxcZHsxLDJ9KVwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIjogXCJtdXN0IGJlIGEgdmFsaWQgSVAgQ0lEUiByYW5nZSBvZiB0aGUgZm9ybSB4LngueC54L3guXCJcbiAgICB9XG4gIH0sXG5cbiAgXCJNYXBwaW5nc1wiIDoge1xuICAgIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiA6IHtcbiAgICAgIFwidDEubWljcm9cIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcInQyLm1pY3JvXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJ0Mi5zbWFsbFwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwidDIubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0xLnNtYWxsXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMy5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzEubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcImMxLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJjMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZzIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTUcyXCIgIH0sXG4gICAgICBcInIzLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJoaTEuNHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaHMxLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImNyMS44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjYzIuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfVxuICAgIH1cbiAgLFxuICAgIFwiQVdTUmVnaW9uQXJjaDJBTUlcIiA6IHtcbiAgICAgIFwidXMtZWFzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktMGY0Y2ZkNjRcIiwgXCJIVk02NFwiIDogXCJhbWktMGQ0Y2ZkNjZcIiwgXCJIVk1HMlwiIDogXCJhbWktNWIwNWJhMzBcIn0sXG4gICAgICBcInVzLXdlc3QtMlwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWQzYzVkMWUzXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWQ1YzVkMWU1XCIsIFwiSFZNRzJcIiA6IFwiYW1pLWE5ZDZjMDk5XCJ9LFxuICAgICAgXCJ1cy13ZXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS04NWVhMTNjMVwiLCBcIkhWTTY0XCIgOiBcImFtaS04N2VhMTNjM1wiLCBcIkhWTUcyXCIgOiBcImFtaS0zNzgyN2E3M1wifSxcbiAgICAgIFwiZXUtd2VzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktZDZkMThlYTFcIiwgXCJIVk02NFwiIDogXCJhbWktZTRkMThlOTNcIiwgXCJIVk1HMlwiIDogXCJhbWktNzJhOWYxMDVcIn0sXG4gICAgICBcImV1LWNlbnRyYWwtMVwiICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWE0YjBiN2I5XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWE2YjBiN2JiXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWE2YzljZmJiXCJ9LFxuICAgICAgXCJhcC1ub3J0aGVhc3QtMVwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS0xYTFiOWYxYVwiLCBcIkhWTTY0XCIgOiBcImFtaS0xYzFiOWYxY1wiLCBcIkhWTUcyXCIgOiBcImFtaS1mNjQ0YzRmNlwifSxcbiAgICAgIFwiYXAtc291dGhlYXN0LTFcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktZDI0YjQyODBcIiwgXCJIVk02NFwiIDogXCJhbWktZDQ0YjQyODZcIiwgXCJIVk1HMlwiIDogXCJhbWktMTJiNWJjNDBcIn0sXG4gICAgICBcImFwLXNvdXRoZWFzdC0yXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWVmN2IzOWQ1XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWRiN2IzOWUxXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWIzMzM3ZTg5XCJ9LFxuICAgICAgXCJzYS1lYXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS01YjA5ODE0NlwiLCBcIkhWTTY0XCIgOiBcImFtaS01NTA5ODE0OFwiLCBcIkhWTUcyXCIgOiBcIk5PVF9TVVBQT1JURURcIn0sXG4gICAgICBcImNuLW5vcnRoLTFcIiAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWJlYzQ1ODg3XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWJjYzQ1ODg1XCIsIFwiSFZNRzJcIiA6IFwiTk9UX1NVUFBPUlRFRFwifVxuICAgIH1cblxuICB9LFxuXG4gIFwiUmVzb3VyY2VzXCIgOiB7XG4gICAgXCJFQzJJbnN0YW5jZVwiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpJbnN0YW5jZVwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiSW5zdGFuY2VUeXBlXCIgOiB7IFwiUmVmXCIgOiBcIkluc3RhbmNlVHlwZVwiIH0sXG4gICAgICAgIFwiU2VjdXJpdHlHcm91cHNcIiA6IFsgeyBcIlJlZlwiIDogXCJJbnN0YW5jZVNlY3VyaXR5R3JvdXBcIiB9IF0sXG4gICAgICAgIFwiS2V5TmFtZVwiIDogeyBcIlJlZlwiIDogXCJLZXlOYW1lXCIgfSxcbiAgICAgICAgXCJJbWFnZUlkXCIgOiB7IFwiRm46OkZpbmRJbk1hcFwiIDogWyBcIkFXU1JlZ2lvbkFyY2gyQU1JXCIsIHsgXCJSZWZcIiA6IFwiQVdTOjpSZWdpb25cIiB9LFxuICAgICAgICAgIHsgXCJGbjo6RmluZEluTWFwXCIgOiBbIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiwgeyBcIlJlZlwiIDogXCJJbnN0YW5jZVR5cGVcIiB9LCBcIkFyY2hcIiBdIH0gXSB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiSW5zdGFuY2VTZWN1cml0eUdyb3VwXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6OlNlY3VyaXR5R3JvdXBcIixcbiAgICAgIFwiUHJvcGVydGllc1wiIDoge1xuICAgICAgICBcIkdyb3VwRGVzY3JpcHRpb25cIiA6IFwiRW5hYmxlIFNTSCBhY2Nlc3MgdmlhIHBvcnQgMjJcIixcbiAgICAgICAgXCJTZWN1cml0eUdyb3VwSW5ncmVzc1wiIDogWyB7XG4gICAgICAgICAgXCJJcFByb3RvY29sXCIgOiBcInRjcFwiLFxuICAgICAgICAgIFwiRnJvbVBvcnRcIiA6IFwiMjJcIixcbiAgICAgICAgICBcIlRvUG9ydFwiIDogXCIyMlwiLFxuICAgICAgICAgIFwiQ2lkcklwXCIgOiB7IFwiUmVmXCIgOiBcIlNTSExvY2F0aW9uXCJ9XG4gICAgICAgIH0gXVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBcIk91dHB1dHNcIiA6IHtcbiAgICBcIkluc3RhbmNlSWRcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiSW5zdGFuY2VJZCBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJSZWZcIiA6IFwiRUMySW5zdGFuY2VcIiB9XG4gICAgfSxcbiAgICBcIkFaXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIkF2YWlsYWJpbGl0eSBab25lIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIkZuOjpHZXRBdHRcIiA6IFsgXCJFQzJJbnN0YW5jZVwiLCBcIkF2YWlsYWJpbGl0eVpvbmVcIiBdIH1cbiAgICB9LFxuICAgIFwiUHVibGljRE5TXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIlB1YmxpYyBETlNOYW1lIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIkZuOjpHZXRBdHRcIiA6IFsgXCJFQzJJbnN0YW5jZVwiLCBcIlB1YmxpY0Ruc05hbWVcIiBdIH1cbiAgICB9LFxuICAgIFwiUHVibGljSVBcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiUHVibGljIElQIGFkZHJlc3Mgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiRm46OkdldEF0dFwiIDogWyBcIkVDMkluc3RhbmNlXCIsIFwiUHVibGljSXBcIiBdIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
