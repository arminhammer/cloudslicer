(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/arrow.js":[function(require,module,exports){
/**
 * Created by arming on 9/17/15.
 */

var Arrow = {

  drawBetween: function(a, b) {

    var arrow = new PIXI.Graphics();

    console.log(a.getBounds());
    console.log(b.getBounds());

    /*
    arrow.lineStyle(1, 0xE5E5E5, 1);
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
    return arrow;
    */
  }

};

module.exports = Arrow;

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_Instance.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/19/15.
 */

var Element = require('../element');
var DragDrop = require('../drag.drop');

var AWS_EC2_Instance = function(name,x,y) {
  Element.call(this);
  var self = this;
  self.name = name;
  self.texture = PIXI.Texture.fromFrame('Compute_&_Networking_Amazon_EC2--.png');
  self.position.x = x;
  self.position.y = y;
};
AWS_EC2_Instance.prototype = Object.create(Element.prototype);

module.exports = AWS_EC2_Instance;

},{"../drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js","../element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/element.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_Users.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/19/15.
 */

var Element = require('../element');
var DragDrop = require('../drag.drop');

var AWS_Users = function(name,x,y) {
  Element.call(this);
  var self = this;
  self.scale.set(1.0);
  self.anchor.set(0.5);
  self.interactive = true;
  self.buttonMode = true;
self.name = name;
  self.texture = PIXI.Texture.fromFrame('Non-Service_Specific_copy_Users.png');
  self.position.x = x;
  self.position.y = y;

};
AWS_Users.prototype = Object.create(Element.prototype);

module.exports = AWS_Users;

},{"../drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js","../element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/element.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/14/15.
 */

var MOUSE_OVER_SCALE_RATIO = 1.1;

var DragDrop = {

  onDragStart: function(event) {
    this.data = event.data;
    this.alpha = 0.5;
    this.dragging = true;
  },

  onDragEnd: function() {
    this.alpha = 1;

    this.dragging = false;

    // set the interaction data to null
    this.data = null;
  },

  onDragMove: function() {
    var self = this;
    if (self.dragging)
    {
      console.log(self.parent);
      console.log(self);
      //var global = self.toGlobal(self.parent);
      var local = self.toLocal(self.parent);
      //console.log('x: ' + self.x + ' y: ' + self.y);
      //console.log('self: ' + self.x+":"+self.y + ", global: " + global.x + ":" + global.y + ", local: " + local.x + ":" + local.y);
      //console.log('width: ' + self.width + ' height: ' + self.height);
      var newPosition = self.data.getLocalPosition(self.parent);
      //console.log('NEW: ' + newPosition.x + ':' + newPosition.y);
      var local = self.toLocal(self.data);
      //console.log('LOCAL: ' + local.x + ':' + local.y);
      self.position.x = newPosition.x;
      self.position.y = newPosition.y;
      //self.moveTo(newPosition.x, newPosition.y);
    }
  },

  onMouseOver: function() {
    console.log('Moused over!');
    var self = this;
    self.scale.set(self.scale.x*MOUSE_OVER_SCALE_RATIO);
    var iconSize = 20;
    var elementSize = 100;

    var global = self.toGlobal(self.position);
    console.log('official: ' + self.position.x + ':' + self.position.y);
    console.log('GLOBAL: ' + global.x + ':' + global.y);
    console.log(self.getLocalBounds());

    var scaleLocations = [
      {x: 0, y: 0-self.getLocalBounds().height/2-iconSize/2, size: iconSize},
      {x: 0-self.getLocalBounds().width/2-iconSize/2, y: 0, size: iconSize},
      {x: self.getLocalBounds().width/2+iconSize/2, y: 0, size: iconSize},
      {x: 0, y: self.getLocalBounds().height/2+iconSize/2, size: iconSize}
    ];

    console.log(scaleLocations[0]);

    //moveIcon.drawRect(elementSize-5, -5, 10, 10);
    //moveIcon.drawRect(-5, elementSize-5, 10, 10);
    //moveIcon.drawRect(elementSize-5, elementSize-5, 10, 10);

    self.scaleIcons = [];

    scaleLocations.forEach(function(loc) {
      var icon = new PIXI.Graphics();
      icon.moveTo(0,0);
      icon.interactive = true;
      icon.buttonMode = true;
      icon.lineStyle(1, 0x0000FF, 1);
      icon.beginFill(0x000000, 1);
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

    //moveIcon.endFill();

    //stage.removeChild(self);
    //stage.addChild(icon);
    self.scaleIcons.forEach(function(s) {
      self.addChild(s);
    });
    //this.addChild(this.scaleIcons[0])
    //stage.addChild(this);

  },

  onMouseOut: function() {
    console.log('Moused out!');
    var self = this;
    self.scale.set(self.scale.x/MOUSE_OVER_SCALE_RATIO);

    var self = this;
    console.log('Mouse out');
    this.scaleIcons.forEach(function(s) {
      self.removeChild(s);
    });
    console.log('Size: ');
    console.log(this.getBounds());

  },

  onScaleIconDragStart: function(event) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
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

var DEFAULT_SCALE = 0.8;

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
    var interval = 25;
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
var Arrow = require('./arrow');
var AWS_Users = require('./aws/AWS_Users');
var AWS_EC2_Instance = require('./aws/AWS_EC2_Instance');

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

    var winDimension = GuiUtil.getWindowDimension();

    var renderer = PIXI.autoDetectRenderer(winDimension.x, winDimension.y, {backgroundColor : 0xFFFFFF});

    var stage = new PIXI.Container();
    var elements = new PIXI.Container();
    var arrows = new PIXI.Container();
    var arrowGraphics = new PIXI.Graphics();
    arrowGraphics.lineStyle(2, 0x00E5E5, 1);

    var meter = new FPSMeter();

    var fps = 60;
    var now;
    var then = Date.now();
    var interval = 1000/fps;
    var delta;

    function animate() {
      requestAnimationFrame(animate);

      now = Date.now();
      delta = now - then;

      if (delta > interval) {
        then = now - (delta % interval);
        meter.tick();

        renderer.render(stage);
      }
    }

    function onLoaded() {
      console.log('Assets loaded');

      var dim = GuiUtil.getWindowDimension();
      console.log(elements.position);
      var users = new AWS_Users('users', dim.x/2, 100);
      console.log(users.position);
      elements.addChild(users);

      var instance1 = new AWS_EC2_Instance('instance1', dim.x/2, 400);
      console.log(instance1.position);
      elements.addChild(instance1);

      //console.log(elementsContainer.getLocalBounds());

      users.addArrowTo(instance1);

      console.log('Children:');
      console.log(elements.children);
      //var arrow = Arrow.drawBetween(users, instance1);

      stage.addChild(elements);
      console.log(stage.children);

      arrowGraphics.clear();
      elements.children.forEach(function(element) {
        console.log('Element pos:');
        console.log(element.position);
        arrowGraphics.moveTo(element.position.x, element.position.y);
        element.arrows.forEach(function(target) {
          console.log('Target pos:');
          console.log(target.position);
          arrowGraphics.lineTo(target.position.x, target.position.y);
        })
      });
      console.log(arrowGraphics);
      arrows.addChild(arrowGraphics);
      stage.addChild(arrows);
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

},{"./arrow":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/arrow.js","./aws/AWS_EC2_Instance":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_Instance.js","./aws/AWS_Users":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_Users.js","./element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/element.js","./gui.util":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js":[function(require,module,exports){
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
module.exports={
  "AWSTemplateFormatVersion" : "2010-09-09",

  "Description" : "AWS CloudFormation Sample Template Sample template EIP_With_Association: This template shows how to associate an Elastic IP address with an Amazon EC2 instance - you can use this same technique to associate an EC2 instance with an Elastic IP Address that is not created inside the template by replacing the EIP reference in the AWS::EC2::EIPAssoication resource type with the IP address of the external EIP. **WARNING** This template creates an Amazon EC2 instance and an Elastic IP Address. You will be billed for the AWS resources used if you create a stack from this template.",

  "Parameters" : {
    "InstanceType" : {
      "Description" : "WebServer EC2 instance type",
      "Type" : "String",
      "Default" : "m1.small",
      "AllowedValues" : [ "t1.micro", "t2.micro", "t2.small", "t2.medium", "m1.small", "m1.medium", "m1.large", "m1.xlarge", "m2.xlarge", "m2.2xlarge", "m2.4xlarge", "m3.medium", "m3.large", "m3.xlarge", "m3.2xlarge", "c1.medium", "c1.xlarge", "c3.large", "c3.xlarge", "c3.2xlarge", "c3.4xlarge", "c3.8xlarge", "c4.large", "c4.xlarge", "c4.2xlarge", "c4.4xlarge", "c4.8xlarge", "g2.2xlarge", "r3.large", "r3.xlarge", "r3.2xlarge", "r3.4xlarge", "r3.8xlarge", "i2.xlarge", "i2.2xlarge", "i2.4xlarge", "i2.8xlarge", "d2.xlarge", "d2.2xlarge", "d2.4xlarge", "d2.8xlarge", "hi1.4xlarge", "hs1.8xlarge", "cr1.8xlarge", "cc2.8xlarge", "cg1.4xlarge"]
    ,
      "ConstraintDescription" : "must be a valid EC2 instance type."
    },

    "KeyName" : {
      "Description" : "Name of an existing EC2 KeyPair to enable SSH access to the instances",
      "Type" : "AWS::EC2::KeyPair::KeyName",
      "ConstraintDescription" : "must be the name of an existing EC2 KeyPair."
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
        "UserData" : { "Fn::Base64" : { "Fn::Join" : [ "", [ "IPAddress=", {"Ref" : "IPAddress"}]]}},
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
        "GroupDescription" : "Enable SSH access",
        "SecurityGroupIngress" :
        [ { "IpProtocol" : "tcp", "FromPort" : "22", "ToPort" : "22", "CidrIp" : { "Ref" : "SSHLocation"} }]
      }
    },

    "IPAddress" : {
      "Type" : "AWS::EC2::EIP"
    },

    "IPAssoc" : {
      "Type" : "AWS::EC2::EIPAssociation",
      "Properties" : {
        "InstanceId" : { "Ref" : "EC2Instance" },
        "EIP" : { "Ref" : "IPAddress" }
      }
    }
  },
  "Outputs" : {
    "InstanceId" : {
      "Description" : "InstanceId of the newly created EC2 instance",
      "Value" : { "Ref" : "EC2Instance" }
    },
    "InstanceIPAddress" : {
      "Description" : "IP address of the newly created EC2 instance",
      "Value" : { "Ref" : "IPAddress" }
    }
  }
}

},{}]},{},["/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2Fycm93LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9hd3MvQVdTX0VDMl9JbnN0YW5jZS5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvYXdzL0FXU19Vc2Vycy5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZHJhZy5kcm9wLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9lbGVtZW50LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9ndWkudXRpbC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvcGl4aS5lZGl0b3IuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL3NvdXJjZS5lZGl0b3IuanMiLCJhcHAvc2NyaXB0cy9tYWluLmpzIiwiYXBwL3NjcmlwdHMvdGVzdERhdGEvZWMyLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8xNy8xNS5cbiAqL1xuXG52YXIgQXJyb3cgPSB7XG5cbiAgZHJhd0JldHdlZW46IGZ1bmN0aW9uKGEsIGIpIHtcblxuICAgIHZhciBhcnJvdyA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG5cbiAgICBjb25zb2xlLmxvZyhhLmdldEJvdW5kcygpKTtcbiAgICBjb25zb2xlLmxvZyhiLmdldEJvdW5kcygpKTtcblxuICAgIC8qXG4gICAgYXJyb3cubGluZVN0eWxlKDEsIDB4RTVFNUU1LCAxKTtcbiAgICB3aGlsZSAoY291bnQgPCB3aWR0aCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oY291bnQsIDApO1xuICAgICAgZ3JpZC5saW5lVG8oY291bnQsIGhlaWdodCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIGNvdW50ID0gaW50ZXJ2YWw7XG4gICAgd2hpbGUoY291bnQgPCBoZWlnaHQpIHtcbiAgICAgIGdyaWQubW92ZVRvKDAsIGNvdW50KTtcbiAgICAgIGdyaWQubGluZVRvKHdpZHRoLCBjb3VudCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIHJldHVybiBhcnJvdztcbiAgICAqL1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXJyb3c7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX0VDMl9JbnN0YW5jZSA9IGZ1bmN0aW9uKG5hbWUseCx5KSB7XG4gIEVsZW1lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLm5hbWUgPSBuYW1lO1xuICBzZWxmLnRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCdDb21wdXRlXyZfTmV0d29ya2luZ19BbWF6b25fRUMyLS0ucG5nJyk7XG4gIHNlbGYucG9zaXRpb24ueCA9IHg7XG4gIHNlbGYucG9zaXRpb24ueSA9IHk7XG59O1xuQVdTX0VDMl9JbnN0YW5jZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfRUMyX0luc3RhbmNlO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTkvMTUuXG4gKi9cblxudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuLi9lbGVtZW50Jyk7XG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuLi9kcmFnLmRyb3AnKTtcblxudmFyIEFXU19Vc2VycyA9IGZ1bmN0aW9uKG5hbWUseCx5KSB7XG4gIEVsZW1lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLnNjYWxlLnNldCgxLjApO1xuICBzZWxmLmFuY2hvci5zZXQoMC41KTtcbiAgc2VsZi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gIHNlbGYuYnV0dG9uTW9kZSA9IHRydWU7XG5zZWxmLm5hbWUgPSBuYW1lO1xuICBzZWxmLnRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCdOb24tU2VydmljZV9TcGVjaWZpY19jb3B5X1VzZXJzLnBuZycpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xuXG59O1xuQVdTX1VzZXJzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19Vc2VycztcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE0LzE1LlxuICovXG5cbnZhciBNT1VTRV9PVkVSX1NDQUxFX1JBVElPID0gMS4xO1xuXG52YXIgRHJhZ0Ryb3AgPSB7XG5cbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy5kYXRhID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLmFscGhhID0gMC41O1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hbHBoYSA9IDE7XG5cbiAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG5cbiAgICAvLyBzZXQgdGhlIGludGVyYWN0aW9uIGRhdGEgdG8gbnVsbFxuICAgIHRoaXMuZGF0YSA9IG51bGw7XG4gIH0sXG5cbiAgb25EcmFnTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLmRyYWdnaW5nKVxuICAgIHtcbiAgICAgIGNvbnNvbGUubG9nKHNlbGYucGFyZW50KTtcbiAgICAgIGNvbnNvbGUubG9nKHNlbGYpO1xuICAgICAgLy92YXIgZ2xvYmFsID0gc2VsZi50b0dsb2JhbChzZWxmLnBhcmVudCk7XG4gICAgICB2YXIgbG9jYWwgPSBzZWxmLnRvTG9jYWwoc2VsZi5wYXJlbnQpO1xuICAgICAgLy9jb25zb2xlLmxvZygneDogJyArIHNlbGYueCArICcgeTogJyArIHNlbGYueSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdzZWxmOiAnICsgc2VsZi54K1wiOlwiK3NlbGYueSArIFwiLCBnbG9iYWw6IFwiICsgZ2xvYmFsLnggKyBcIjpcIiArIGdsb2JhbC55ICsgXCIsIGxvY2FsOiBcIiArIGxvY2FsLnggKyBcIjpcIiArIGxvY2FsLnkpO1xuICAgICAgLy9jb25zb2xlLmxvZygnd2lkdGg6ICcgKyBzZWxmLndpZHRoICsgJyBoZWlnaHQ6ICcgKyBzZWxmLmhlaWdodCk7XG4gICAgICB2YXIgbmV3UG9zaXRpb24gPSBzZWxmLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbihzZWxmLnBhcmVudCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdORVc6ICcgKyBuZXdQb3NpdGlvbi54ICsgJzonICsgbmV3UG9zaXRpb24ueSk7XG4gICAgICB2YXIgbG9jYWwgPSBzZWxmLnRvTG9jYWwoc2VsZi5kYXRhKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ0xPQ0FMOiAnICsgbG9jYWwueCArICc6JyArIGxvY2FsLnkpO1xuICAgICAgc2VsZi5wb3NpdGlvbi54ID0gbmV3UG9zaXRpb24ueDtcbiAgICAgIHNlbGYucG9zaXRpb24ueSA9IG5ld1Bvc2l0aW9uLnk7XG4gICAgICAvL3NlbGYubW92ZVRvKG5ld1Bvc2l0aW9uLngsIG5ld1Bvc2l0aW9uLnkpO1xuICAgIH1cbiAgfSxcblxuICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ01vdXNlZCBvdmVyIScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG4gICAgdmFyIGljb25TaXplID0gMjA7XG4gICAgdmFyIGVsZW1lbnRTaXplID0gMTAwO1xuXG4gICAgdmFyIGdsb2JhbCA9IHNlbGYudG9HbG9iYWwoc2VsZi5wb3NpdGlvbik7XG4gICAgY29uc29sZS5sb2coJ29mZmljaWFsOiAnICsgc2VsZi5wb3NpdGlvbi54ICsgJzonICsgc2VsZi5wb3NpdGlvbi55KTtcbiAgICBjb25zb2xlLmxvZygnR0xPQkFMOiAnICsgZ2xvYmFsLnggKyAnOicgKyBnbG9iYWwueSk7XG4gICAgY29uc29sZS5sb2coc2VsZi5nZXRMb2NhbEJvdW5kcygpKTtcblxuICAgIHZhciBzY2FsZUxvY2F0aW9ucyA9IFtcbiAgICAgIHt4OiAwLCB5OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMi1pY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMC1zZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMi1pY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzIraWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAsIHk6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMitpY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX1cbiAgICBdO1xuXG4gICAgY29uc29sZS5sb2coc2NhbGVMb2NhdGlvbnNbMF0pO1xuXG4gICAgLy9tb3ZlSWNvbi5kcmF3UmVjdChlbGVtZW50U2l6ZS01LCAtNSwgMTAsIDEwKTtcbiAgICAvL21vdmVJY29uLmRyYXdSZWN0KC01LCBlbGVtZW50U2l6ZS01LCAxMCwgMTApO1xuICAgIC8vbW92ZUljb24uZHJhd1JlY3QoZWxlbWVudFNpemUtNSwgZWxlbWVudFNpemUtNSwgMTAsIDEwKTtcblxuICAgIHNlbGYuc2NhbGVJY29ucyA9IFtdO1xuXG4gICAgc2NhbGVMb2NhdGlvbnMuZm9yRWFjaChmdW5jdGlvbihsb2MpIHtcbiAgICAgIHZhciBpY29uID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICAgIGljb24ubW92ZVRvKDAsMCk7XG4gICAgICBpY29uLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGljb24uYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgICBpY29uLmxpbmVTdHlsZSgxLCAweDAwMDBGRiwgMSk7XG4gICAgICBpY29uLmJlZ2luRmlsbCgweDAwMDAwMCwgMSk7XG4gICAgICBpY29uLmRyYXdDaXJjbGUobG9jLngsIGxvYy55LCBsb2Muc2l6ZSk7XG4gICAgICBpY29uLmVuZEZpbGwoKTtcblxuICAgICAgLy9pY29uXG4gICAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBzdGFydFxuICAgICAgICAvLy5vbignbW91c2Vkb3duJywgb25TY2FsZUljb25EcmFnU3RhcnQpXG4gICAgICAgIC8vLm9uKCd0b3VjaHN0YXJ0Jywgb25TY2FsZUljb25EcmFnU3RhcnQpO1xuICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIGVuZFxuICAgICAgLy8ub24oJ21vdXNldXAnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbignbW91c2V1cG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbigndG91Y2hlbmQnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbigndG91Y2hlbmRvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIG1vdmVcbiAgICAgIC8vLm9uKCdtb3VzZW1vdmUnLCBvbkRyYWdNb3ZlKVxuICAgICAgLy8ub24oJ3RvdWNobW92ZScsIG9uRHJhZ01vdmUpXG5cbiAgICAgIHNlbGYuc2NhbGVJY29ucy5wdXNoKGljb24pO1xuXG4gICAgfSk7XG5cbiAgICAvL21vdmVJY29uLmVuZEZpbGwoKTtcblxuICAgIC8vc3RhZ2UucmVtb3ZlQ2hpbGQoc2VsZik7XG4gICAgLy9zdGFnZS5hZGRDaGlsZChpY29uKTtcbiAgICBzZWxmLnNjYWxlSWNvbnMuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICBzZWxmLmFkZENoaWxkKHMpO1xuICAgIH0pO1xuICAgIC8vdGhpcy5hZGRDaGlsZCh0aGlzLnNjYWxlSWNvbnNbMF0pXG4gICAgLy9zdGFnZS5hZGRDaGlsZCh0aGlzKTtcblxuICB9LFxuXG4gIG9uTW91c2VPdXQ6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdNb3VzZWQgb3V0IScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgY29uc29sZS5sb2coJ01vdXNlIG91dCcpO1xuICAgIHRoaXMuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2hpbGQocyk7XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coJ1NpemU6ICcpO1xuICAgIGNvbnNvbGUubG9nKHRoaXMuZ2V0Qm91bmRzKCkpO1xuXG4gIH0sXG5cbiAgb25TY2FsZUljb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gc3RvcmUgYSByZWZlcmVuY2UgdG8gdGhlIGRhdGFcbiAgICAvLyB0aGUgcmVhc29uIGZvciB0aGlzIGlzIGJlY2F1c2Ugb2YgbXVsdGl0b3VjaFxuICAgIC8vIHdlIHdhbnQgdG8gdHJhY2sgdGhlIG1vdmVtZW50IG9mIHRoaXMgcGFydGljdWxhciB0b3VjaFxuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZygnUmVzaXppbmchJyk7XG4gIH1cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdEcm9wO1xuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi9kcmFnLmRyb3AnKTtcblxudmFyIERFRkFVTFRfU0NBTEUgPSAwLjg7XG5cbnZhciBFbGVtZW50ID0gZnVuY3Rpb24oKSB7XG4gIFBJWEkuU3ByaXRlLmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLnNjYWxlLnNldChERUZBVUxUX1NDQUxFKTtcbiAgc2VsZi5hbmNob3Iuc2V0KDAuNSk7XG4gIHNlbGYuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICBzZWxmLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICBzZWxmXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgLm9uKCdtb3VzZWRvd24nLCBEcmFnRHJvcC5vbkRyYWdTdGFydClcbiAgICAub24oJ3RvdWNoc3RhcnQnLCBEcmFnRHJvcC5vbkRyYWdTdGFydClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgLm9uKCdtb3VzZXVwJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbignbW91c2V1cG91dHNpZGUnLCBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCd0b3VjaGVuZCcsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ3RvdWNoZW5kb3V0c2lkZScsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgIC5vbignbW91c2Vtb3ZlJywgRHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAub24oJ3RvdWNobW92ZScsIERyYWdEcm9wLm9uRHJhZ01vdmUpXG4gICAgLy8gZXZlbnRzIGZvciBtb3VzZSBvdmVyXG4gICAgLm9uKCdtb3VzZW92ZXInLCBEcmFnRHJvcC5vbk1vdXNlT3ZlcilcbiAgICAub24oJ21vdXNlb3V0JywgRHJhZ0Ryb3Aub25Nb3VzZU91dCk7XG5cbiAgc2VsZi5hcnJvd3MgPSBbXTtcblxuICBzZWxmLmFkZEFycm93VG8gPSBmdW5jdGlvbihiKSB7XG4gICAgc2VsZi5hcnJvd3MucHVzaChiKTtcbiAgfTtcblxuICBzZWxmLnJlbW92ZUFycm93VG8gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHNlbGYuYXJyb3dzLnJlbW92ZShpbmRleCk7XG4gIH07XG5cbn07XG5FbGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUElYSS5TcHJpdGUucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50O1xuIiwiXG52YXIgR3VpVXRpbCA9IHtcblxuICBnZXRXaW5kb3dEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7IHg6IHdpbmRvdy5pbm5lcldpZHRoLCB5OiB3aW5kb3cuaW5uZXJIZWlnaHQgfTtcbiAgfSxcblxuICBkcmF3R3JpZDogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgIHZhciBncmlkID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICB2YXIgaW50ZXJ2YWwgPSAyNTtcbiAgICB2YXIgY291bnQgPSBpbnRlcnZhbDtcbiAgICBncmlkLmxpbmVTdHlsZSgxLCAweEU1RTVFNSwgMSk7XG4gICAgd2hpbGUgKGNvdW50IDwgd2lkdGgpIHtcbiAgICAgIGdyaWQubW92ZVRvKGNvdW50LCAwKTtcbiAgICAgIGdyaWQubGluZVRvKGNvdW50LCBoZWlnaHQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICBjb3VudCA9IGludGVydmFsO1xuICAgIHdoaWxlKGNvdW50IDwgaGVpZ2h0KSB7XG4gICAgICBncmlkLm1vdmVUbygwLCBjb3VudCk7XG4gICAgICBncmlkLmxpbmVUbyh3aWR0aCwgY291bnQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICB2YXIgY29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG4gICAgY29udGFpbmVyLmFkZENoaWxkKGdyaWQpO1xuICAgIGNvbnRhaW5lci5jYWNoZUFzQml0bWFwID0gdHJ1ZTtcbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR3VpVXRpbDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA3LzkvMTUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgR3VpVXRpbCA9IHJlcXVpcmUoJy4vZ3VpLnV0aWwnKTtcbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi9lbGVtZW50Jyk7XG52YXIgQXJyb3cgPSByZXF1aXJlKCcuL2Fycm93Jyk7XG52YXIgQVdTX1VzZXJzID0gcmVxdWlyZSgnLi9hd3MvQVdTX1VzZXJzJyk7XG52YXIgQVdTX0VDMl9JbnN0YW5jZSA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfSW5zdGFuY2UnKTtcblxuZnVuY3Rpb24gcmVzaXplR3VpQ29udGFpbmVyKHJlbmRlcmVyKSB7XG5cbiAgdmFyIGRpbSA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG5cbiAgY29uc29sZS5sb2coJ1Jlc2l6aW5nLi4uJyk7XG4gIGNvbnNvbGUubG9nKGRpbSk7XG5cbiAgJCgnI2d1aUNvbnRhaW5lcicpLmhlaWdodChkaW0ueSk7XG4gICQoJyNndWlDb250YWluZXInKS53aWR0aChkaW0ueCk7XG5cbiAgaWYocmVuZGVyZXIpIHtcbiAgICByZW5kZXJlci52aWV3LnN0eWxlLndpZHRoID0gZGltLngrJ3B4JztcbiAgICByZW5kZXJlci52aWV3LnN0eWxlLmhlaWdodCA9IGRpbS55KydweCc7XG4gIH1cblxuICBjb25zb2xlLmxvZygnUmVzaXppbmcgZ3VpIGNvbnRhaW5lci4uLicpO1xuXG59XG5cbnZhciBQaXhpRWRpdG9yID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICB2YXIgd2luRGltZW5zaW9uID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcblxuICAgIHZhciByZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSwge2JhY2tncm91bmRDb2xvciA6IDB4RkZGRkZGfSk7XG5cbiAgICB2YXIgc3RhZ2UgPSBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgICB2YXIgZWxlbWVudHMgPSBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgICB2YXIgYXJyb3dzID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG4gICAgdmFyIGFycm93R3JhcGhpY3MgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIGFycm93R3JhcGhpY3MubGluZVN0eWxlKDIsIDB4MDBFNUU1LCAxKTtcblxuICAgIHZhciBtZXRlciA9IG5ldyBGUFNNZXRlcigpO1xuXG4gICAgdmFyIGZwcyA9IDYwO1xuICAgIHZhciBub3c7XG4gICAgdmFyIHRoZW4gPSBEYXRlLm5vdygpO1xuICAgIHZhciBpbnRlcnZhbCA9IDEwMDAvZnBzO1xuICAgIHZhciBkZWx0YTtcblxuICAgIGZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG5cbiAgICAgIG5vdyA9IERhdGUubm93KCk7XG4gICAgICBkZWx0YSA9IG5vdyAtIHRoZW47XG5cbiAgICAgIGlmIChkZWx0YSA+IGludGVydmFsKSB7XG4gICAgICAgIHRoZW4gPSBub3cgLSAoZGVsdGEgJSBpbnRlcnZhbCk7XG4gICAgICAgIG1ldGVyLnRpY2soKTtcblxuICAgICAgICByZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uTG9hZGVkKCkge1xuICAgICAgY29uc29sZS5sb2coJ0Fzc2V0cyBsb2FkZWQnKTtcblxuICAgICAgdmFyIGRpbSA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG4gICAgICBjb25zb2xlLmxvZyhlbGVtZW50cy5wb3NpdGlvbik7XG4gICAgICB2YXIgdXNlcnMgPSBuZXcgQVdTX1VzZXJzKCd1c2VycycsIGRpbS54LzIsIDEwMCk7XG4gICAgICBjb25zb2xlLmxvZyh1c2Vycy5wb3NpdGlvbik7XG4gICAgICBlbGVtZW50cy5hZGRDaGlsZCh1c2Vycyk7XG5cbiAgICAgIHZhciBpbnN0YW5jZTEgPSBuZXcgQVdTX0VDMl9JbnN0YW5jZSgnaW5zdGFuY2UxJywgZGltLngvMiwgNDAwKTtcbiAgICAgIGNvbnNvbGUubG9nKGluc3RhbmNlMS5wb3NpdGlvbik7XG4gICAgICBlbGVtZW50cy5hZGRDaGlsZChpbnN0YW5jZTEpO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKGVsZW1lbnRzQ29udGFpbmVyLmdldExvY2FsQm91bmRzKCkpO1xuXG4gICAgICB1c2Vycy5hZGRBcnJvd1RvKGluc3RhbmNlMSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCdDaGlsZHJlbjonKTtcbiAgICAgIGNvbnNvbGUubG9nKGVsZW1lbnRzLmNoaWxkcmVuKTtcbiAgICAgIC8vdmFyIGFycm93ID0gQXJyb3cuZHJhd0JldHdlZW4odXNlcnMsIGluc3RhbmNlMSk7XG5cbiAgICAgIHN0YWdlLmFkZENoaWxkKGVsZW1lbnRzKTtcbiAgICAgIGNvbnNvbGUubG9nKHN0YWdlLmNoaWxkcmVuKTtcblxuICAgICAgYXJyb3dHcmFwaGljcy5jbGVhcigpO1xuICAgICAgZWxlbWVudHMuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdFbGVtZW50IHBvczonKTtcbiAgICAgICAgY29uc29sZS5sb2coZWxlbWVudC5wb3NpdGlvbik7XG4gICAgICAgIGFycm93R3JhcGhpY3MubW92ZVRvKGVsZW1lbnQucG9zaXRpb24ueCwgZWxlbWVudC5wb3NpdGlvbi55KTtcbiAgICAgICAgZWxlbWVudC5hcnJvd3MuZm9yRWFjaChmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnVGFyZ2V0IHBvczonKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyh0YXJnZXQucG9zaXRpb24pO1xuICAgICAgICAgIGFycm93R3JhcGhpY3MubGluZVRvKHRhcmdldC5wb3NpdGlvbi54LCB0YXJnZXQucG9zaXRpb24ueSk7XG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKGFycm93R3JhcGhpY3MpO1xuICAgICAgYXJyb3dzLmFkZENoaWxkKGFycm93R3JhcGhpY3MpO1xuICAgICAgc3RhZ2UuYWRkQ2hpbGQoYXJyb3dzKTtcbiAgICB9XG5cbiAgICBQSVhJLmxvYWRlclxuICAgICAgLmFkZCgnLi4vcmVzb3VyY2VzL3Nwcml0ZXMvc3ByaXRlcy5qc29uJylcbiAgICAgIC5sb2FkKG9uTG9hZGVkKTtcblxuICAgIHN0YWdlLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICB2YXIgZ3JpZCA9IHN0YWdlLmFkZENoaWxkKEd1aVV0aWwuZHJhd0dyaWQod2luRGltZW5zaW9uLngsIHdpbkRpbWVuc2lvbi55KSk7XG5cbiAgICBjb25zb2xlLmxvZygnQWRkaW5nIGxpc3RlbmVyLi4uJyk7XG4gICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgIHJlc2l6ZUd1aUNvbnRhaW5lcihyZW5kZXJlcik7XG4gICAgICB3aW5EaW1lbnNpb24gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuICAgICAgLy9jb25zb2xlLmxvZyhuZXdEaW0pO1xuICAgICAgY29uc29sZS5sb2coc3RhZ2UpO1xuICAgICAgc3RhZ2UucmVtb3ZlQ2hpbGQoZ3JpZCk7XG4gICAgICBncmlkID0gc3RhZ2UuYWRkQ2hpbGQoR3VpVXRpbC5kcmF3R3JpZCh3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnkpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICB0ZW1wbGF0ZTogb3B0aW9ucy50ZW1wbGF0ZSxcblxuICAgICAgZHJhd0NhbnZhc0VkaXRvcjogZnVuY3Rpb24gKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcblxuICAgICAgICBpZiAoaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgIGFuaW1hdGUoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvL3ZhciBlbGVtZW50U2l6ZSA9IDEwMDtcbiAgICAgICAgLy9yZXNpemVHdWlDb250YWluZXIoKTtcblxuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKHJlbmRlcmVyLnZpZXcpO1xuXG4gICAgICAgIHJlbmRlcmVyLnJlbmRlcihzdGFnZSk7XG5cbiAgICAgICAgYW5pbWF0ZSgpO1xuXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB2aWV3OiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgcmV0dXJuIG0oJyNndWlDb250YWluZXInLCB7IGNvbmZpZzogY29udHJvbGxlci5kcmF3Q2FudmFzRWRpdG9yfSlcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaXhpRWRpdG9yO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDcvOS8xNS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHJlc2l6ZUVkaXRvcihlZGl0b3IpIHtcbiAgZWRpdG9yLnNldFNpemUobnVsbCwgd2luZG93LmlubmVySGVpZ2h0KTtcbn1cblxudmFyIFNvdXJjZUVkaXRvciA9IHtcblxuICBjb250cm9sbGVyOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICBkcmF3RWRpdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuXG4gICAgICAgIHZhciBlZGl0b3IgPSBudWxsO1xuXG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgaWYoZWRpdG9yKSB7XG4gICAgICAgICAgICBlZGl0b3IucmVmcmVzaCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlZGl0b3IgPSBDb2RlTWlycm9yKGVsZW1lbnQsIHtcbiAgICAgICAgICB2YWx1ZTogSlNPTi5zdHJpbmdpZnkob3B0aW9ucy50ZW1wbGF0ZSgpLCB1bmRlZmluZWQsIDIpLFxuICAgICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgIG1vZGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICBndXR0ZXJzOiBbJ0NvZGVNaXJyb3ItbGludC1tYXJrZXJzJ10sXG4gICAgICAgICAgbGludDogdHJ1ZSxcbiAgICAgICAgICBzdHlsZUFjdGl2ZUxpbmU6IHRydWUsXG4gICAgICAgICAgYXV0b0Nsb3NlQnJhY2tldHM6IHRydWUsXG4gICAgICAgICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgICB0aGVtZTogJ3plbmJ1cm4nXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlc2l6ZUVkaXRvcihlZGl0b3IpO1xuXG4gICAgICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmVzaXplRWRpdG9yKGVkaXRvcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGVkaXRvci5vbignY2hhbmdlJywgZnVuY3Rpb24oZWRpdG9yKSB7XG4gICAgICAgICAgbS5zdGFydENvbXB1dGF0aW9uKCk7XG4gICAgICAgICAgb3B0aW9ucy50ZW1wbGF0ZShKU09OLnBhcnNlKGVkaXRvci5nZXRWYWx1ZSgpKSk7XG4gICAgICAgICAgbS5lbmRDb21wdXRhdGlvbigpO1xuICAgICAgICB9KTtcblxuICAgICAgfVxuICAgIH07XG4gIH0sXG4gIHZpZXc6IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICByZXR1cm4gW1xuICAgICAgbSgnI3NvdXJjZUVkaXRvcicsIHsgY29uZmlnOiBjb250cm9sbGVyLmRyYXdFZGl0b3IgfSlcbiAgICBdXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU291cmNlRWRpdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU291cmNlRWRpdG9yID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3NvdXJjZS5lZGl0b3InKTtcbnZhciBQaXhpRWRpdG9yID0gcmVxdWlyZSgnLi9jb21wb25lbnRzL3BpeGkuZWRpdG9yJyk7XG5cbnZhciB0ZXN0RGF0YSA9IHJlcXVpcmUoJy4vdGVzdERhdGEvZWMyLmpzb24nKTtcblxudmFyIHRlbXBsYXRlID0gbS5wcm9wKHRlc3REYXRhKTtcblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvdWRzbGljZXItYXBwJyksIG0uY29tcG9uZW50KFBpeGlFZGl0b3IsIHtcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgfSlcbik7XG5cbm0ubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGUtYmFyJyksIG0uY29tcG9uZW50KFNvdXJjZUVkaXRvciwge1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB9KVxuKTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJBV1NUZW1wbGF0ZUZvcm1hdFZlcnNpb25cIiA6IFwiMjAxMC0wOS0wOVwiLFxuXG4gIFwiRGVzY3JpcHRpb25cIiA6IFwiQVdTIENsb3VkRm9ybWF0aW9uIFNhbXBsZSBUZW1wbGF0ZSBTYW1wbGUgdGVtcGxhdGUgRUlQX1dpdGhfQXNzb2NpYXRpb246IFRoaXMgdGVtcGxhdGUgc2hvd3MgaG93IHRvIGFzc29jaWF0ZSBhbiBFbGFzdGljIElQIGFkZHJlc3Mgd2l0aCBhbiBBbWF6b24gRUMyIGluc3RhbmNlIC0geW91IGNhbiB1c2UgdGhpcyBzYW1lIHRlY2huaXF1ZSB0byBhc3NvY2lhdGUgYW4gRUMyIGluc3RhbmNlIHdpdGggYW4gRWxhc3RpYyBJUCBBZGRyZXNzIHRoYXQgaXMgbm90IGNyZWF0ZWQgaW5zaWRlIHRoZSB0ZW1wbGF0ZSBieSByZXBsYWNpbmcgdGhlIEVJUCByZWZlcmVuY2UgaW4gdGhlIEFXUzo6RUMyOjpFSVBBc3NvaWNhdGlvbiByZXNvdXJjZSB0eXBlIHdpdGggdGhlIElQIGFkZHJlc3Mgb2YgdGhlIGV4dGVybmFsIEVJUC4gKipXQVJOSU5HKiogVGhpcyB0ZW1wbGF0ZSBjcmVhdGVzIGFuIEFtYXpvbiBFQzIgaW5zdGFuY2UgYW5kIGFuIEVsYXN0aWMgSVAgQWRkcmVzcy4gWW91IHdpbGwgYmUgYmlsbGVkIGZvciB0aGUgQVdTIHJlc291cmNlcyB1c2VkIGlmIHlvdSBjcmVhdGUgYSBzdGFjayBmcm9tIHRoaXMgdGVtcGxhdGUuXCIsXG5cbiAgXCJQYXJhbWV0ZXJzXCIgOiB7XG4gICAgXCJJbnN0YW5jZVR5cGVcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiV2ViU2VydmVyIEVDMiBpbnN0YW5jZSB0eXBlXCIsXG4gICAgICBcIlR5cGVcIiA6IFwiU3RyaW5nXCIsXG4gICAgICBcIkRlZmF1bHRcIiA6IFwibTEuc21hbGxcIixcbiAgICAgIFwiQWxsb3dlZFZhbHVlc1wiIDogWyBcInQxLm1pY3JvXCIsIFwidDIubWljcm9cIiwgXCJ0Mi5zbWFsbFwiLCBcInQyLm1lZGl1bVwiLCBcIm0xLnNtYWxsXCIsIFwibTEubWVkaXVtXCIsIFwibTEubGFyZ2VcIiwgXCJtMS54bGFyZ2VcIiwgXCJtMi54bGFyZ2VcIiwgXCJtMi4yeGxhcmdlXCIsIFwibTIuNHhsYXJnZVwiLCBcIm0zLm1lZGl1bVwiLCBcIm0zLmxhcmdlXCIsIFwibTMueGxhcmdlXCIsIFwibTMuMnhsYXJnZVwiLCBcImMxLm1lZGl1bVwiLCBcImMxLnhsYXJnZVwiLCBcImMzLmxhcmdlXCIsIFwiYzMueGxhcmdlXCIsIFwiYzMuMnhsYXJnZVwiLCBcImMzLjR4bGFyZ2VcIiwgXCJjMy44eGxhcmdlXCIsIFwiYzQubGFyZ2VcIiwgXCJjNC54bGFyZ2VcIiwgXCJjNC4yeGxhcmdlXCIsIFwiYzQuNHhsYXJnZVwiLCBcImM0Ljh4bGFyZ2VcIiwgXCJnMi4yeGxhcmdlXCIsIFwicjMubGFyZ2VcIiwgXCJyMy54bGFyZ2VcIiwgXCJyMy4yeGxhcmdlXCIsIFwicjMuNHhsYXJnZVwiLCBcInIzLjh4bGFyZ2VcIiwgXCJpMi54bGFyZ2VcIiwgXCJpMi4yeGxhcmdlXCIsIFwiaTIuNHhsYXJnZVwiLCBcImkyLjh4bGFyZ2VcIiwgXCJkMi54bGFyZ2VcIiwgXCJkMi4yeGxhcmdlXCIsIFwiZDIuNHhsYXJnZVwiLCBcImQyLjh4bGFyZ2VcIiwgXCJoaTEuNHhsYXJnZVwiLCBcImhzMS44eGxhcmdlXCIsIFwiY3IxLjh4bGFyZ2VcIiwgXCJjYzIuOHhsYXJnZVwiLCBcImNnMS40eGxhcmdlXCJdXG4gICAgLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBiZSBhIHZhbGlkIEVDMiBpbnN0YW5jZSB0eXBlLlwiXG4gICAgfSxcblxuICAgIFwiS2V5TmFtZVwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJOYW1lIG9mIGFuIGV4aXN0aW5nIEVDMiBLZXlQYWlyIHRvIGVuYWJsZSBTU0ggYWNjZXNzIHRvIHRoZSBpbnN0YW5jZXNcIixcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6S2V5UGFpcjo6S2V5TmFtZVwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBiZSB0aGUgbmFtZSBvZiBhbiBleGlzdGluZyBFQzIgS2V5UGFpci5cIlxuICAgIH0sXG5cbiAgICBcIlNTSExvY2F0aW9uXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIlRoZSBJUCBhZGRyZXNzIHJhbmdlIHRoYXQgY2FuIGJlIHVzZWQgdG8gU1NIIHRvIHRoZSBFQzIgaW5zdGFuY2VzXCIsXG4gICAgICBcIlR5cGVcIjogXCJTdHJpbmdcIixcbiAgICAgIFwiTWluTGVuZ3RoXCI6IFwiOVwiLFxuICAgICAgXCJNYXhMZW5ndGhcIjogXCIxOFwiLFxuICAgICAgXCJEZWZhdWx0XCI6IFwiMC4wLjAuMC8wXCIsXG4gICAgICBcIkFsbG93ZWRQYXR0ZXJuXCI6IFwiKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pLyhcXFxcZHsxLDJ9KVwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIjogXCJtdXN0IGJlIGEgdmFsaWQgSVAgQ0lEUiByYW5nZSBvZiB0aGUgZm9ybSB4LngueC54L3guXCJcbiAgICB9XG4gIH0sXG5cbiAgXCJNYXBwaW5nc1wiIDoge1xuICAgIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiA6IHtcbiAgICAgIFwidDEubWljcm9cIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcInQyLm1pY3JvXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJ0Mi5zbWFsbFwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwidDIubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0xLnNtYWxsXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMy5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzEubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcImMxLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJjMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZzIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTUcyXCIgIH0sXG4gICAgICBcInIzLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJoaTEuNHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaHMxLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImNyMS44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjYzIuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfVxuICAgIH1cbiAgLFxuICAgIFwiQVdTUmVnaW9uQXJjaDJBTUlcIiA6IHtcbiAgICAgIFwidXMtZWFzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktMGY0Y2ZkNjRcIiwgXCJIVk02NFwiIDogXCJhbWktMGQ0Y2ZkNjZcIiwgXCJIVk1HMlwiIDogXCJhbWktNWIwNWJhMzBcIn0sXG4gICAgICBcInVzLXdlc3QtMlwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWQzYzVkMWUzXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWQ1YzVkMWU1XCIsIFwiSFZNRzJcIiA6IFwiYW1pLWE5ZDZjMDk5XCJ9LFxuICAgICAgXCJ1cy13ZXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS04NWVhMTNjMVwiLCBcIkhWTTY0XCIgOiBcImFtaS04N2VhMTNjM1wiLCBcIkhWTUcyXCIgOiBcImFtaS0zNzgyN2E3M1wifSxcbiAgICAgIFwiZXUtd2VzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktZDZkMThlYTFcIiwgXCJIVk02NFwiIDogXCJhbWktZTRkMThlOTNcIiwgXCJIVk1HMlwiIDogXCJhbWktNzJhOWYxMDVcIn0sXG4gICAgICBcImV1LWNlbnRyYWwtMVwiICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWE0YjBiN2I5XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWE2YjBiN2JiXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWE2YzljZmJiXCJ9LFxuICAgICAgXCJhcC1ub3J0aGVhc3QtMVwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS0xYTFiOWYxYVwiLCBcIkhWTTY0XCIgOiBcImFtaS0xYzFiOWYxY1wiLCBcIkhWTUcyXCIgOiBcImFtaS1mNjQ0YzRmNlwifSxcbiAgICAgIFwiYXAtc291dGhlYXN0LTFcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktZDI0YjQyODBcIiwgXCJIVk02NFwiIDogXCJhbWktZDQ0YjQyODZcIiwgXCJIVk1HMlwiIDogXCJhbWktMTJiNWJjNDBcIn0sXG4gICAgICBcImFwLXNvdXRoZWFzdC0yXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWVmN2IzOWQ1XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWRiN2IzOWUxXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWIzMzM3ZTg5XCJ9LFxuICAgICAgXCJzYS1lYXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS01YjA5ODE0NlwiLCBcIkhWTTY0XCIgOiBcImFtaS01NTA5ODE0OFwiLCBcIkhWTUcyXCIgOiBcIk5PVF9TVVBQT1JURURcIn0sXG4gICAgICBcImNuLW5vcnRoLTFcIiAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWJlYzQ1ODg3XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWJjYzQ1ODg1XCIsIFwiSFZNRzJcIiA6IFwiTk9UX1NVUFBPUlRFRFwifVxuICAgIH1cblxuICB9LFxuXG4gIFwiUmVzb3VyY2VzXCIgOiB7XG4gICAgXCJFQzJJbnN0YW5jZVwiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpJbnN0YW5jZVwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiVXNlckRhdGFcIiA6IHsgXCJGbjo6QmFzZTY0XCIgOiB7IFwiRm46OkpvaW5cIiA6IFsgXCJcIiwgWyBcIklQQWRkcmVzcz1cIiwge1wiUmVmXCIgOiBcIklQQWRkcmVzc1wifV1dfX0sXG4gICAgICAgIFwiSW5zdGFuY2VUeXBlXCIgOiB7IFwiUmVmXCIgOiBcIkluc3RhbmNlVHlwZVwiIH0sXG4gICAgICAgIFwiU2VjdXJpdHlHcm91cHNcIiA6IFsgeyBcIlJlZlwiIDogXCJJbnN0YW5jZVNlY3VyaXR5R3JvdXBcIiB9IF0sXG4gICAgICAgIFwiS2V5TmFtZVwiIDogeyBcIlJlZlwiIDogXCJLZXlOYW1lXCIgfSxcbiAgICAgICAgXCJJbWFnZUlkXCIgOiB7IFwiRm46OkZpbmRJbk1hcFwiIDogWyBcIkFXU1JlZ2lvbkFyY2gyQU1JXCIsIHsgXCJSZWZcIiA6IFwiQVdTOjpSZWdpb25cIiB9LFxuICAgICAgICAgIHsgXCJGbjo6RmluZEluTWFwXCIgOiBbIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiwgeyBcIlJlZlwiIDogXCJJbnN0YW5jZVR5cGVcIiB9LCBcIkFyY2hcIiBdIH0gXSB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiSW5zdGFuY2VTZWN1cml0eUdyb3VwXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6OlNlY3VyaXR5R3JvdXBcIixcbiAgICAgIFwiUHJvcGVydGllc1wiIDoge1xuICAgICAgICBcIkdyb3VwRGVzY3JpcHRpb25cIiA6IFwiRW5hYmxlIFNTSCBhY2Nlc3NcIixcbiAgICAgICAgXCJTZWN1cml0eUdyb3VwSW5ncmVzc1wiIDpcbiAgICAgICAgWyB7IFwiSXBQcm90b2NvbFwiIDogXCJ0Y3BcIiwgXCJGcm9tUG9ydFwiIDogXCIyMlwiLCBcIlRvUG9ydFwiIDogXCIyMlwiLCBcIkNpZHJJcFwiIDogeyBcIlJlZlwiIDogXCJTU0hMb2NhdGlvblwifSB9XVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcIklQQWRkcmVzc1wiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpFSVBcIlxuICAgIH0sXG5cbiAgICBcIklQQXNzb2NcIiA6IHtcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6RUlQQXNzb2NpYXRpb25cIixcbiAgICAgIFwiUHJvcGVydGllc1wiIDoge1xuICAgICAgICBcIkluc3RhbmNlSWRcIiA6IHsgXCJSZWZcIiA6IFwiRUMySW5zdGFuY2VcIiB9LFxuICAgICAgICBcIkVJUFwiIDogeyBcIlJlZlwiIDogXCJJUEFkZHJlc3NcIiB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcIk91dHB1dHNcIiA6IHtcbiAgICBcIkluc3RhbmNlSWRcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiSW5zdGFuY2VJZCBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJSZWZcIiA6IFwiRUMySW5zdGFuY2VcIiB9XG4gICAgfSxcbiAgICBcIkluc3RhbmNlSVBBZGRyZXNzXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIklQIGFkZHJlc3Mgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiUmVmXCIgOiBcIklQQWRkcmVzc1wiIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
