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
    var arrowGraphics = new PIXI.Graphics();

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

      //users.addArrowTo(instance1);

      console.log('Children:');
      console.log(elements.children);
      //var arrow = Arrow.drawBetween(users, instance1);

      stage.addChild(elements);
      console.log(stage.children);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2Fycm93LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9hd3MvQVdTX0VDMl9JbnN0YW5jZS5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvYXdzL0FXU19Vc2Vycy5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZHJhZy5kcm9wLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9lbGVtZW50LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9ndWkudXRpbC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvcGl4aS5lZGl0b3IuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL3NvdXJjZS5lZGl0b3IuanMiLCJhcHAvc2NyaXB0cy9tYWluLmpzIiwiYXBwL3NjcmlwdHMvdGVzdERhdGEvZWMyLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzE3LzE1LlxuICovXG5cbnZhciBBcnJvdyA9IHtcblxuICBkcmF3QmV0d2VlbjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgdmFyIGFycm93ID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblxuICAgIGNvbnNvbGUubG9nKGEuZ2V0Qm91bmRzKCkpO1xuICAgIGNvbnNvbGUubG9nKGIuZ2V0Qm91bmRzKCkpO1xuXG4gICAgLypcbiAgICBhcnJvdy5saW5lU3R5bGUoMSwgMHhFNUU1RTUsIDEpO1xuICAgIHdoaWxlIChjb3VudCA8IHdpZHRoKSB7XG4gICAgICBncmlkLm1vdmVUbyhjb3VudCwgMCk7XG4gICAgICBncmlkLmxpbmVUbyhjb3VudCwgaGVpZ2h0KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgY291bnQgPSBpbnRlcnZhbDtcbiAgICB3aGlsZShjb3VudCA8IGhlaWdodCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oMCwgY291bnQpO1xuICAgICAgZ3JpZC5saW5lVG8od2lkdGgsIGNvdW50KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgcmV0dXJuIGFycm93O1xuICAgICovXG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJvdztcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE5LzE1LlxuICovXG5cbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi4vZWxlbWVudCcpO1xudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi4vZHJhZy5kcm9wJyk7XG5cbnZhciBBV1NfRUMyX0luc3RhbmNlID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgRWxlbWVudC5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYubmFtZSA9IG5hbWU7XG4gIHNlbGYudGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ0NvbXB1dGVfJl9OZXR3b3JraW5nX0FtYXpvbl9FQzItLS5wbmcnKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcbn07XG5BV1NfRUMyX0luc3RhbmNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWxlbWVudC5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19FQzJfSW5zdGFuY2U7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX1VzZXJzID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgRWxlbWVudC5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYuc2NhbGUuc2V0KDEuMCk7XG4gIHNlbGYuYW5jaG9yLnNldCgwLjUpO1xuICBzZWxmLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgc2VsZi5idXR0b25Nb2RlID0gdHJ1ZTtcbnNlbGYubmFtZSA9IG5hbWU7XG4gIHNlbGYudGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ05vbi1TZXJ2aWNlX1NwZWNpZmljX2NvcHlfVXNlcnMucG5nJyk7XG4gIHNlbGYucG9zaXRpb24ueCA9IHg7XG4gIHNlbGYucG9zaXRpb24ueSA9IHk7XG5cbn07XG5BV1NfVXNlcnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX1VzZXJzO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTQvMTUuXG4gKi9cblxudmFyIE1PVVNFX09WRVJfU0NBTEVfUkFUSU8gPSAxLjE7XG5cbnZhciBEcmFnRHJvcCA9IHtcblxuICBvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gIH0sXG5cbiAgb25EcmFnRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFscGhhID0gMTtcblxuICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcblxuICAgIC8vIHNldCB0aGUgaW50ZXJhY3Rpb24gZGF0YSB0byBudWxsXG4gICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgfSxcblxuICBvbkRyYWdNb3ZlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuZHJhZ2dpbmcpXG4gICAge1xuICAgICAgY29uc29sZS5sb2coc2VsZi5wYXJlbnQpO1xuICAgICAgY29uc29sZS5sb2coc2VsZik7XG4gICAgICAvL3ZhciBnbG9iYWwgPSBzZWxmLnRvR2xvYmFsKHNlbGYucGFyZW50KTtcbiAgICAgIHZhciBsb2NhbCA9IHNlbGYudG9Mb2NhbChzZWxmLnBhcmVudCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCd4OiAnICsgc2VsZi54ICsgJyB5OiAnICsgc2VsZi55KTtcbiAgICAgIC8vY29uc29sZS5sb2coJ3NlbGY6ICcgKyBzZWxmLngrXCI6XCIrc2VsZi55ICsgXCIsIGdsb2JhbDogXCIgKyBnbG9iYWwueCArIFwiOlwiICsgZ2xvYmFsLnkgKyBcIiwgbG9jYWw6IFwiICsgbG9jYWwueCArIFwiOlwiICsgbG9jYWwueSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCd3aWR0aDogJyArIHNlbGYud2lkdGggKyAnIGhlaWdodDogJyArIHNlbGYuaGVpZ2h0KTtcbiAgICAgIHZhciBuZXdQb3NpdGlvbiA9IHNlbGYuZGF0YS5nZXRMb2NhbFBvc2l0aW9uKHNlbGYucGFyZW50KTtcbiAgICAgIC8vY29uc29sZS5sb2coJ05FVzogJyArIG5ld1Bvc2l0aW9uLnggKyAnOicgKyBuZXdQb3NpdGlvbi55KTtcbiAgICAgIHZhciBsb2NhbCA9IHNlbGYudG9Mb2NhbChzZWxmLmRhdGEpO1xuICAgICAgLy9jb25zb2xlLmxvZygnTE9DQUw6ICcgKyBsb2NhbC54ICsgJzonICsgbG9jYWwueSk7XG4gICAgICBzZWxmLnBvc2l0aW9uLnggPSBuZXdQb3NpdGlvbi54O1xuICAgICAgc2VsZi5wb3NpdGlvbi55ID0gbmV3UG9zaXRpb24ueTtcbiAgICAgIC8vc2VsZi5tb3ZlVG8obmV3UG9zaXRpb24ueCwgbmV3UG9zaXRpb24ueSk7XG4gICAgfVxuICB9LFxuXG4gIG9uTW91c2VPdmVyOiBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnTW91c2VkIG92ZXIhJyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueCpNT1VTRV9PVkVSX1NDQUxFX1JBVElPKTtcbiAgICB2YXIgaWNvblNpemUgPSAyMDtcbiAgICB2YXIgZWxlbWVudFNpemUgPSAxMDA7XG5cbiAgICB2YXIgZ2xvYmFsID0gc2VsZi50b0dsb2JhbChzZWxmLnBvc2l0aW9uKTtcbiAgICBjb25zb2xlLmxvZygnb2ZmaWNpYWw6ICcgKyBzZWxmLnBvc2l0aW9uLnggKyAnOicgKyBzZWxmLnBvc2l0aW9uLnkpO1xuICAgIGNvbnNvbGUubG9nKCdHTE9CQUw6ICcgKyBnbG9iYWwueCArICc6JyArIGdsb2JhbC55KTtcbiAgICBjb25zb2xlLmxvZyhzZWxmLmdldExvY2FsQm91bmRzKCkpO1xuXG4gICAgdmFyIHNjYWxlTG9jYXRpb25zID0gW1xuICAgICAge3g6IDAsIHk6IDAtc2VsZi5nZXRMb2NhbEJvdW5kcygpLmhlaWdodC8yLWljb25TaXplLzIsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aC8yLWljb25TaXplLzIsIHk6IDAsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiBzZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMitpY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMCwgeTogc2VsZi5nZXRMb2NhbEJvdW5kcygpLmhlaWdodC8yK2ljb25TaXplLzIsIHNpemU6IGljb25TaXplfVxuICAgIF07XG5cbiAgICBjb25zb2xlLmxvZyhzY2FsZUxvY2F0aW9uc1swXSk7XG5cbiAgICAvL21vdmVJY29uLmRyYXdSZWN0KGVsZW1lbnRTaXplLTUsIC01LCAxMCwgMTApO1xuICAgIC8vbW92ZUljb24uZHJhd1JlY3QoLTUsIGVsZW1lbnRTaXplLTUsIDEwLCAxMCk7XG4gICAgLy9tb3ZlSWNvbi5kcmF3UmVjdChlbGVtZW50U2l6ZS01LCBlbGVtZW50U2l6ZS01LCAxMCwgMTApO1xuXG4gICAgc2VsZi5zY2FsZUljb25zID0gW107XG5cbiAgICBzY2FsZUxvY2F0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGxvYykge1xuICAgICAgdmFyIGljb24gPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgICAgaWNvbi5tb3ZlVG8oMCwwKTtcbiAgICAgIGljb24uaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgaWNvbi5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICAgIGljb24ubGluZVN0eWxlKDEsIDB4MDAwMEZGLCAxKTtcbiAgICAgIGljb24uYmVnaW5GaWxsKDB4MDAwMDAwLCAxKTtcbiAgICAgIGljb24uZHJhd0NpcmNsZShsb2MueCwgbG9jLnksIGxvYy5zaXplKTtcbiAgICAgIGljb24uZW5kRmlsbCgpO1xuXG4gICAgICAvL2ljb25cbiAgICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgICAgIC8vLm9uKCdtb3VzZWRvd24nLCBvblNjYWxlSWNvbkRyYWdTdGFydClcbiAgICAgICAgLy8ub24oJ3RvdWNoc3RhcnQnLCBvblNjYWxlSWNvbkRyYWdTdGFydCk7XG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgICAvLy5vbignbW91c2V1cCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCdtb3VzZXVwb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZCcsIG9uRHJhZ0VuZClcbiAgICAgIC8vLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgICAgLy8ub24oJ21vdXNlbW92ZScsIG9uRHJhZ01vdmUpXG4gICAgICAvLy5vbigndG91Y2htb3ZlJywgb25EcmFnTW92ZSlcblxuICAgICAgc2VsZi5zY2FsZUljb25zLnB1c2goaWNvbik7XG5cbiAgICB9KTtcblxuICAgIC8vbW92ZUljb24uZW5kRmlsbCgpO1xuXG4gICAgLy9zdGFnZS5yZW1vdmVDaGlsZChzZWxmKTtcbiAgICAvL3N0YWdlLmFkZENoaWxkKGljb24pO1xuICAgIHNlbGYuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYuYWRkQ2hpbGQocyk7XG4gICAgfSk7XG4gICAgLy90aGlzLmFkZENoaWxkKHRoaXMuc2NhbGVJY29uc1swXSlcbiAgICAvL3N0YWdlLmFkZENoaWxkKHRoaXMpO1xuXG4gIH0sXG5cbiAgb25Nb3VzZU91dDogZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ01vdXNlZCBvdXQhJyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueC9NT1VTRV9PVkVSX1NDQUxFX1JBVElPKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBjb25zb2xlLmxvZygnTW91c2Ugb3V0Jyk7XG4gICAgdGhpcy5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgICAgc2VsZi5yZW1vdmVDaGlsZChzKTtcbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZygnU2l6ZTogJyk7XG4gICAgY29uc29sZS5sb2codGhpcy5nZXRCb3VuZHMoKSk7XG5cbiAgfSxcblxuICBvblNjYWxlSWNvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAvLyBzdG9yZSBhIHJlZmVyZW5jZSB0byB0aGUgZGF0YVxuICAgIC8vIHRoZSByZWFzb24gZm9yIHRoaXMgaXMgYmVjYXVzZSBvZiBtdWx0aXRvdWNoXG4gICAgLy8gd2Ugd2FudCB0byB0cmFjayB0aGUgbW92ZW1lbnQgb2YgdGhpcyBwYXJ0aWN1bGFyIHRvdWNoXG4gICAgdGhpcy5kYXRhID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLmFscGhhID0gMC41O1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICAgIGNvbnNvbGUubG9nKCdSZXNpemluZyEnKTtcbiAgfVxuXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ0Ryb3A7XG5cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8xNS8xNS5cbiAqL1xuXG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuL2RyYWcuZHJvcCcpO1xuXG52YXIgREVGQVVMVF9TQ0FMRSA9IDAuODtcblxudmFyIEVsZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgUElYSS5TcHJpdGUuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuc2NhbGUuc2V0KERFRkFVTFRfU0NBTEUpO1xuICBzZWxmLmFuY2hvci5zZXQoMC41KTtcbiAgc2VsZi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gIHNlbGYuYnV0dG9uTW9kZSA9IHRydWU7XG4gIHNlbGZcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAub24oJ21vdXNlZG93bicsIERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC5vbigndG91Y2hzdGFydCcsIERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAub24oJ21vdXNldXAnLCBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCdtb3VzZXVwb3V0c2lkZScsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ3RvdWNoZW5kJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbigndG91Y2hlbmRvdXRzaWRlJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgLm9uKCdtb3VzZW1vdmUnLCBEcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgIC5vbigndG91Y2htb3ZlJywgRHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAvLyBldmVudHMgZm9yIG1vdXNlIG92ZXJcbiAgICAub24oJ21vdXNlb3ZlcicsIERyYWdEcm9wLm9uTW91c2VPdmVyKVxuICAgIC5vbignbW91c2VvdXQnLCBEcmFnRHJvcC5vbk1vdXNlT3V0KTtcblxuICBzZWxmLmFycm93cyA9IFtdO1xuXG4gIHNlbGYuYWRkQXJyb3dUbyA9IGZ1bmN0aW9uKGIpIHtcbiAgICBzZWxmLmFycm93cy5wdXNoKGIpO1xuICB9O1xuXG4gIHNlbGYucmVtb3ZlQXJyb3dUbyA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgc2VsZi5hcnJvd3MucmVtb3ZlKGluZGV4KTtcbiAgfTtcblxufTtcbkVsZW1lbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQSVhJLlNwcml0ZS5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnQ7XG4iLCJcbnZhciBHdWlVdGlsID0ge1xuXG4gIGdldFdpbmRvd0RpbWVuc2lvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHsgeDogd2luZG93LmlubmVyV2lkdGgsIHk6IHdpbmRvdy5pbm5lckhlaWdodCB9O1xuICB9LFxuXG4gIGRyYXdHcmlkOiBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIGdyaWQgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHZhciBpbnRlcnZhbCA9IDI1O1xuICAgIHZhciBjb3VudCA9IGludGVydmFsO1xuICAgIGdyaWQubGluZVN0eWxlKDEsIDB4RTVFNUU1LCAxKTtcbiAgICB3aGlsZSAoY291bnQgPCB3aWR0aCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oY291bnQsIDApO1xuICAgICAgZ3JpZC5saW5lVG8oY291bnQsIGhlaWdodCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIGNvdW50ID0gaW50ZXJ2YWw7XG4gICAgd2hpbGUoY291bnQgPCBoZWlnaHQpIHtcbiAgICAgIGdyaWQubW92ZVRvKDAsIGNvdW50KTtcbiAgICAgIGdyaWQubGluZVRvKHdpZHRoLCBjb3VudCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIHZhciBjb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgICBjb250YWluZXIuYWRkQ2hpbGQoZ3JpZCk7XG4gICAgY29udGFpbmVyLmNhY2hlQXNCaXRtYXAgPSB0cnVlO1xuICAgIHJldHVybiBjb250YWluZXI7XG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHdWlVdGlsO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDcvOS8xNS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBHdWlVdGlsID0gcmVxdWlyZSgnLi9ndWkudXRpbCcpO1xudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuL2VsZW1lbnQnKTtcbnZhciBBcnJvdyA9IHJlcXVpcmUoJy4vYXJyb3cnKTtcbnZhciBBV1NfVXNlcnMgPSByZXF1aXJlKCcuL2F3cy9BV1NfVXNlcnMnKTtcbnZhciBBV1NfRUMyX0luc3RhbmNlID0gcmVxdWlyZSgnLi9hd3MvQVdTX0VDMl9JbnN0YW5jZScpO1xuXG5mdW5jdGlvbiByZXNpemVHdWlDb250YWluZXIocmVuZGVyZXIpIHtcblxuICB2YXIgZGltID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcblxuICBjb25zb2xlLmxvZygnUmVzaXppbmcuLi4nKTtcbiAgY29uc29sZS5sb2coZGltKTtcblxuICAkKCcjZ3VpQ29udGFpbmVyJykuaGVpZ2h0KGRpbS55KTtcbiAgJCgnI2d1aUNvbnRhaW5lcicpLndpZHRoKGRpbS54KTtcblxuICBpZihyZW5kZXJlcikge1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUud2lkdGggPSBkaW0ueCsncHgnO1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUuaGVpZ2h0ID0gZGltLnkrJ3B4JztcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdSZXNpemluZyBndWkgY29udGFpbmVyLi4uJyk7XG5cbn1cblxudmFyIFBpeGlFZGl0b3IgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciB3aW5EaW1lbnNpb24gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuXG4gICAgdmFyIHJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIod2luRGltZW5zaW9uLngsIHdpbkRpbWVuc2lvbi55LCB7YmFja2dyb3VuZENvbG9yIDogMHhGRkZGRkZ9KTtcblxuICAgIHZhciBzdGFnZSA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICAgIHZhciBlbGVtZW50cyA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICAgIHZhciBhcnJvd0dyYXBoaWNzID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblxuICAgIHZhciBtZXRlciA9IG5ldyBGUFNNZXRlcigpO1xuXG4gICAgdmFyIGZwcyA9IDYwO1xuICAgIHZhciBub3c7XG4gICAgdmFyIHRoZW4gPSBEYXRlLm5vdygpO1xuICAgIHZhciBpbnRlcnZhbCA9IDEwMDAvZnBzO1xuICAgIHZhciBkZWx0YTtcblxuICAgIGZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG5cbiAgICAgIG5vdyA9IERhdGUubm93KCk7XG4gICAgICBkZWx0YSA9IG5vdyAtIHRoZW47XG5cbiAgICAgIGlmIChkZWx0YSA+IGludGVydmFsKSB7XG4gICAgICAgIHRoZW4gPSBub3cgLSAoZGVsdGEgJSBpbnRlcnZhbCk7XG4gICAgICAgIG1ldGVyLnRpY2soKTtcblxuICAgICAgICByZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uTG9hZGVkKCkge1xuICAgICAgY29uc29sZS5sb2coJ0Fzc2V0cyBsb2FkZWQnKTtcblxuICAgICAgdmFyIGRpbSA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG4gICAgICBjb25zb2xlLmxvZyhlbGVtZW50cy5wb3NpdGlvbik7XG4gICAgICB2YXIgdXNlcnMgPSBuZXcgQVdTX1VzZXJzKCd1c2VycycsIGRpbS54LzIsIDEwMCk7XG4gICAgICBjb25zb2xlLmxvZyh1c2Vycy5wb3NpdGlvbik7XG4gICAgICBlbGVtZW50cy5hZGRDaGlsZCh1c2Vycyk7XG5cbiAgICAgIHZhciBpbnN0YW5jZTEgPSBuZXcgQVdTX0VDMl9JbnN0YW5jZSgnaW5zdGFuY2UxJywgZGltLngvMiwgNDAwKTtcbiAgICAgIGNvbnNvbGUubG9nKGluc3RhbmNlMS5wb3NpdGlvbik7XG4gICAgICBlbGVtZW50cy5hZGRDaGlsZChpbnN0YW5jZTEpO1xuXG4gICAgICAvL2NvbnNvbGUubG9nKGVsZW1lbnRzQ29udGFpbmVyLmdldExvY2FsQm91bmRzKCkpO1xuXG4gICAgICAvL3VzZXJzLmFkZEFycm93VG8oaW5zdGFuY2UxKTtcblxuICAgICAgY29uc29sZS5sb2coJ0NoaWxkcmVuOicpO1xuICAgICAgY29uc29sZS5sb2coZWxlbWVudHMuY2hpbGRyZW4pO1xuICAgICAgLy92YXIgYXJyb3cgPSBBcnJvdy5kcmF3QmV0d2Vlbih1c2VycywgaW5zdGFuY2UxKTtcblxuICAgICAgc3RhZ2UuYWRkQ2hpbGQoZWxlbWVudHMpO1xuICAgICAgY29uc29sZS5sb2coc3RhZ2UuY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIFBJWEkubG9hZGVyXG4gICAgICAuYWRkKCcuLi9yZXNvdXJjZXMvc3ByaXRlcy9zcHJpdGVzLmpzb24nKVxuICAgICAgLmxvYWQob25Mb2FkZWQpO1xuXG4gICAgc3RhZ2UuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgIHZhciBncmlkID0gc3RhZ2UuYWRkQ2hpbGQoR3VpVXRpbC5kcmF3R3JpZCh3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnkpKTtcblxuICAgIGNvbnNvbGUubG9nKCdBZGRpbmcgbGlzdGVuZXIuLi4nKTtcbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgcmVzaXplR3VpQ29udGFpbmVyKHJlbmRlcmVyKTtcbiAgICAgIHdpbkRpbWVuc2lvbiA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG4gICAgICAvL2NvbnNvbGUubG9nKG5ld0RpbSk7XG4gICAgICBjb25zb2xlLmxvZyhzdGFnZSk7XG4gICAgICBzdGFnZS5yZW1vdmVDaGlsZChncmlkKTtcbiAgICAgIGdyaWQgPSBzdGFnZS5hZGRDaGlsZChHdWlVdGlsLmRyYXdHcmlkKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRlbXBsYXRlOiBvcHRpb25zLnRlbXBsYXRlLFxuXG4gICAgICBkcmF3Q2FudmFzRWRpdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuXG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgYW5pbWF0ZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vdmFyIGVsZW1lbnRTaXplID0gMTAwO1xuICAgICAgICAvL3Jlc2l6ZUd1aUNvbnRhaW5lcigpO1xuXG4gICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQocmVuZGVyZXIudmlldyk7XG5cbiAgICAgICAgcmVuZGVyZXIucmVuZGVyKHN0YWdlKTtcblxuICAgICAgICBhbmltYXRlKCk7XG5cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHZpZXc6IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICByZXR1cm4gbSgnI2d1aUNvbnRhaW5lcicsIHsgY29uZmlnOiBjb250cm9sbGVyLmRyYXdDYW52YXNFZGl0b3J9KVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpeGlFZGl0b3I7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcmVzaXplRWRpdG9yKGVkaXRvcikge1xuICBlZGl0b3Iuc2V0U2l6ZShudWxsLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xufVxuXG52YXIgU291cmNlRWRpdG9yID0ge1xuXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgIGRyYXdFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgdmFyIGVkaXRvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBpZihlZGl0b3IpIHtcbiAgICAgICAgICAgIGVkaXRvci5yZWZyZXNoKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVkaXRvciA9IENvZGVNaXJyb3IoZWxlbWVudCwge1xuICAgICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShvcHRpb25zLnRlbXBsYXRlKCksIHVuZGVmaW5lZCwgMiksXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgbW9kZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIGd1dHRlcnM6IFsnQ29kZU1pcnJvci1saW50LW1hcmtlcnMnXSxcbiAgICAgICAgICBsaW50OiB0cnVlLFxuICAgICAgICAgIHN0eWxlQWN0aXZlTGluZTogdHJ1ZSxcbiAgICAgICAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIHRoZW1lOiAnemVuYnVybidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzaXplRWRpdG9yKGVkaXRvcik7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlZGl0b3IpIHtcbiAgICAgICAgICBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcbiAgICAgICAgICBvcHRpb25zLnRlbXBsYXRlKEpTT04ucGFyc2UoZWRpdG9yLmdldFZhbHVlKCkpKTtcbiAgICAgICAgICBtLmVuZENvbXB1dGF0aW9uKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBbXG4gICAgICBtKCcjc291cmNlRWRpdG9yJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0VkaXRvciB9KVxuICAgIF1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb3VyY2VFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBTb3VyY2VFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvc291cmNlLmVkaXRvcicpO1xudmFyIFBpeGlFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcGl4aS5lZGl0b3InKTtcblxudmFyIHRlc3REYXRhID0gcmVxdWlyZSgnLi90ZXN0RGF0YS9lYzIuanNvbicpO1xuXG52YXIgdGVtcGxhdGUgPSBtLnByb3AodGVzdERhdGEpO1xuXG5tLm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbG91ZHNsaWNlci1hcHAnKSwgbS5jb21wb25lbnQoUGl4aUVkaXRvciwge1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB9KVxuKTtcblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZS1iYXInKSwgbS5jb21wb25lbnQoU291cmNlRWRpdG9yLCB7XG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIH0pXG4pO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIkFXU1RlbXBsYXRlRm9ybWF0VmVyc2lvblwiIDogXCIyMDEwLTA5LTA5XCIsXG5cbiAgXCJEZXNjcmlwdGlvblwiIDogXCJBV1MgQ2xvdWRGb3JtYXRpb24gU2FtcGxlIFRlbXBsYXRlIFNhbXBsZSB0ZW1wbGF0ZSBFSVBfV2l0aF9Bc3NvY2lhdGlvbjogVGhpcyB0ZW1wbGF0ZSBzaG93cyBob3cgdG8gYXNzb2NpYXRlIGFuIEVsYXN0aWMgSVAgYWRkcmVzcyB3aXRoIGFuIEFtYXpvbiBFQzIgaW5zdGFuY2UgLSB5b3UgY2FuIHVzZSB0aGlzIHNhbWUgdGVjaG5pcXVlIHRvIGFzc29jaWF0ZSBhbiBFQzIgaW5zdGFuY2Ugd2l0aCBhbiBFbGFzdGljIElQIEFkZHJlc3MgdGhhdCBpcyBub3QgY3JlYXRlZCBpbnNpZGUgdGhlIHRlbXBsYXRlIGJ5IHJlcGxhY2luZyB0aGUgRUlQIHJlZmVyZW5jZSBpbiB0aGUgQVdTOjpFQzI6OkVJUEFzc29pY2F0aW9uIHJlc291cmNlIHR5cGUgd2l0aCB0aGUgSVAgYWRkcmVzcyBvZiB0aGUgZXh0ZXJuYWwgRUlQLiAqKldBUk5JTkcqKiBUaGlzIHRlbXBsYXRlIGNyZWF0ZXMgYW4gQW1hem9uIEVDMiBpbnN0YW5jZSBhbmQgYW4gRWxhc3RpYyBJUCBBZGRyZXNzLiBZb3Ugd2lsbCBiZSBiaWxsZWQgZm9yIHRoZSBBV1MgcmVzb3VyY2VzIHVzZWQgaWYgeW91IGNyZWF0ZSBhIHN0YWNrIGZyb20gdGhpcyB0ZW1wbGF0ZS5cIixcblxuICBcIlBhcmFtZXRlcnNcIiA6IHtcbiAgICBcIkluc3RhbmNlVHlwZVwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJXZWJTZXJ2ZXIgRUMyIGluc3RhbmNlIHR5cGVcIixcbiAgICAgIFwiVHlwZVwiIDogXCJTdHJpbmdcIixcbiAgICAgIFwiRGVmYXVsdFwiIDogXCJtMS5zbWFsbFwiLFxuICAgICAgXCJBbGxvd2VkVmFsdWVzXCIgOiBbIFwidDEubWljcm9cIiwgXCJ0Mi5taWNyb1wiLCBcInQyLnNtYWxsXCIsIFwidDIubWVkaXVtXCIsIFwibTEuc21hbGxcIiwgXCJtMS5tZWRpdW1cIiwgXCJtMS5sYXJnZVwiLCBcIm0xLnhsYXJnZVwiLCBcIm0yLnhsYXJnZVwiLCBcIm0yLjJ4bGFyZ2VcIiwgXCJtMi40eGxhcmdlXCIsIFwibTMubWVkaXVtXCIsIFwibTMubGFyZ2VcIiwgXCJtMy54bGFyZ2VcIiwgXCJtMy4yeGxhcmdlXCIsIFwiYzEubWVkaXVtXCIsIFwiYzEueGxhcmdlXCIsIFwiYzMubGFyZ2VcIiwgXCJjMy54bGFyZ2VcIiwgXCJjMy4yeGxhcmdlXCIsIFwiYzMuNHhsYXJnZVwiLCBcImMzLjh4bGFyZ2VcIiwgXCJjNC5sYXJnZVwiLCBcImM0LnhsYXJnZVwiLCBcImM0LjJ4bGFyZ2VcIiwgXCJjNC40eGxhcmdlXCIsIFwiYzQuOHhsYXJnZVwiLCBcImcyLjJ4bGFyZ2VcIiwgXCJyMy5sYXJnZVwiLCBcInIzLnhsYXJnZVwiLCBcInIzLjJ4bGFyZ2VcIiwgXCJyMy40eGxhcmdlXCIsIFwicjMuOHhsYXJnZVwiLCBcImkyLnhsYXJnZVwiLCBcImkyLjJ4bGFyZ2VcIiwgXCJpMi40eGxhcmdlXCIsIFwiaTIuOHhsYXJnZVwiLCBcImQyLnhsYXJnZVwiLCBcImQyLjJ4bGFyZ2VcIiwgXCJkMi40eGxhcmdlXCIsIFwiZDIuOHhsYXJnZVwiLCBcImhpMS40eGxhcmdlXCIsIFwiaHMxLjh4bGFyZ2VcIiwgXCJjcjEuOHhsYXJnZVwiLCBcImNjMi44eGxhcmdlXCIsIFwiY2cxLjR4bGFyZ2VcIl1cbiAgICAsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIGEgdmFsaWQgRUMyIGluc3RhbmNlIHR5cGUuXCJcbiAgICB9LFxuXG4gICAgXCJLZXlOYW1lXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIk5hbWUgb2YgYW4gZXhpc3RpbmcgRUMyIEtleVBhaXIgdG8gZW5hYmxlIFNTSCBhY2Nlc3MgdG8gdGhlIGluc3RhbmNlc1wiLFxuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpLZXlQYWlyOjpLZXlOYW1lXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIHRoZSBuYW1lIG9mIGFuIGV4aXN0aW5nIEVDMiBLZXlQYWlyLlwiXG4gICAgfSxcblxuICAgIFwiU1NITG9jYXRpb25cIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiVGhlIElQIGFkZHJlc3MgcmFuZ2UgdGhhdCBjYW4gYmUgdXNlZCB0byBTU0ggdG8gdGhlIEVDMiBpbnN0YW5jZXNcIixcbiAgICAgIFwiVHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJNaW5MZW5ndGhcIjogXCI5XCIsXG4gICAgICBcIk1heExlbmd0aFwiOiBcIjE4XCIsXG4gICAgICBcIkRlZmF1bHRcIjogXCIwLjAuMC4wLzBcIixcbiAgICAgIFwiQWxsb3dlZFBhdHRlcm5cIjogXCIoXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSkvKFxcXFxkezEsMn0pXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiOiBcIm11c3QgYmUgYSB2YWxpZCBJUCBDSURSIHJhbmdlIG9mIHRoZSBmb3JtIHgueC54LngveC5cIlxuICAgIH1cbiAgfSxcblxuICBcIk1hcHBpbmdzXCIgOiB7XG4gICAgXCJBV1NJbnN0YW5jZVR5cGUyQXJjaFwiIDoge1xuICAgICAgXCJ0MS5taWNyb1wiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwidDIubWljcm9cIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInQyLnNtYWxsXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJ0Mi5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTEuc21hbGxcIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0zLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMS5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwiYzEueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcImMzLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0Ljh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJnMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNRzJcIiAgfSxcbiAgICAgIFwicjMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImhpMS40eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJoczEuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiY3IxLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImNjMi44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9XG4gICAgfVxuICAsXG4gICAgXCJBV1NSZWdpb25BcmNoMkFNSVwiIDoge1xuICAgICAgXCJ1cy1lYXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS0wZjRjZmQ2NFwiLCBcIkhWTTY0XCIgOiBcImFtaS0wZDRjZmQ2NlwiLCBcIkhWTUcyXCIgOiBcImFtaS01YjA1YmEzMFwifSxcbiAgICAgIFwidXMtd2VzdC0yXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktZDNjNWQxZTNcIiwgXCJIVk02NFwiIDogXCJhbWktZDVjNWQxZTVcIiwgXCJIVk1HMlwiIDogXCJhbWktYTlkNmMwOTlcIn0sXG4gICAgICBcInVzLXdlc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTg1ZWExM2MxXCIsIFwiSFZNNjRcIiA6IFwiYW1pLTg3ZWExM2MzXCIsIFwiSFZNRzJcIiA6IFwiYW1pLTM3ODI3YTczXCJ9LFxuICAgICAgXCJldS13ZXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kNmQxOGVhMVwiLCBcIkhWTTY0XCIgOiBcImFtaS1lNGQxOGU5M1wiLCBcIkhWTUcyXCIgOiBcImFtaS03MmE5ZjEwNVwifSxcbiAgICAgIFwiZXUtY2VudHJhbC0xXCIgICAgIDoge1wiUFY2NFwiIDogXCJhbWktYTRiMGI3YjlcIiwgXCJIVk02NFwiIDogXCJhbWktYTZiMGI3YmJcIiwgXCJIVk1HMlwiIDogXCJhbWktYTZjOWNmYmJcIn0sXG4gICAgICBcImFwLW5vcnRoZWFzdC0xXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTFhMWI5ZjFhXCIsIFwiSFZNNjRcIiA6IFwiYW1pLTFjMWI5ZjFjXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWY2NDRjNGY2XCJ9LFxuICAgICAgXCJhcC1zb3V0aGVhc3QtMVwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kMjRiNDI4MFwiLCBcIkhWTTY0XCIgOiBcImFtaS1kNDRiNDI4NlwiLCBcIkhWTUcyXCIgOiBcImFtaS0xMmI1YmM0MFwifSxcbiAgICAgIFwiYXAtc291dGhlYXN0LTJcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktZWY3YjM5ZDVcIiwgXCJIVk02NFwiIDogXCJhbWktZGI3YjM5ZTFcIiwgXCJIVk1HMlwiIDogXCJhbWktYjMzMzdlODlcIn0sXG4gICAgICBcInNhLWVhc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTViMDk4MTQ2XCIsIFwiSFZNNjRcIiA6IFwiYW1pLTU1MDk4MTQ4XCIsIFwiSFZNRzJcIiA6IFwiTk9UX1NVUFBPUlRFRFwifSxcbiAgICAgIFwiY24tbm9ydGgtMVwiICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktYmVjNDU4ODdcIiwgXCJIVk02NFwiIDogXCJhbWktYmNjNDU4ODVcIiwgXCJIVk1HMlwiIDogXCJOT1RfU1VQUE9SVEVEXCJ9XG4gICAgfVxuXG4gIH0sXG5cbiAgXCJSZXNvdXJjZXNcIiA6IHtcbiAgICBcIkVDMkluc3RhbmNlXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6Okluc3RhbmNlXCIsXG4gICAgICBcIlByb3BlcnRpZXNcIiA6IHtcbiAgICAgICAgXCJVc2VyRGF0YVwiIDogeyBcIkZuOjpCYXNlNjRcIiA6IHsgXCJGbjo6Sm9pblwiIDogWyBcIlwiLCBbIFwiSVBBZGRyZXNzPVwiLCB7XCJSZWZcIiA6IFwiSVBBZGRyZXNzXCJ9XV19fSxcbiAgICAgICAgXCJJbnN0YW5jZVR5cGVcIiA6IHsgXCJSZWZcIiA6IFwiSW5zdGFuY2VUeXBlXCIgfSxcbiAgICAgICAgXCJTZWN1cml0eUdyb3Vwc1wiIDogWyB7IFwiUmVmXCIgOiBcIkluc3RhbmNlU2VjdXJpdHlHcm91cFwiIH0gXSxcbiAgICAgICAgXCJLZXlOYW1lXCIgOiB7IFwiUmVmXCIgOiBcIktleU5hbWVcIiB9LFxuICAgICAgICBcIkltYWdlSWRcIiA6IHsgXCJGbjo6RmluZEluTWFwXCIgOiBbIFwiQVdTUmVnaW9uQXJjaDJBTUlcIiwgeyBcIlJlZlwiIDogXCJBV1M6OlJlZ2lvblwiIH0sXG4gICAgICAgICAgeyBcIkZuOjpGaW5kSW5NYXBcIiA6IFsgXCJBV1NJbnN0YW5jZVR5cGUyQXJjaFwiLCB7IFwiUmVmXCIgOiBcIkluc3RhbmNlVHlwZVwiIH0sIFwiQXJjaFwiIF0gfSBdIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJJbnN0YW5jZVNlY3VyaXR5R3JvdXBcIiA6IHtcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6U2VjdXJpdHlHcm91cFwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiR3JvdXBEZXNjcmlwdGlvblwiIDogXCJFbmFibGUgU1NIIGFjY2Vzc1wiLFxuICAgICAgICBcIlNlY3VyaXR5R3JvdXBJbmdyZXNzXCIgOlxuICAgICAgICBbIHsgXCJJcFByb3RvY29sXCIgOiBcInRjcFwiLCBcIkZyb21Qb3J0XCIgOiBcIjIyXCIsIFwiVG9Qb3J0XCIgOiBcIjIyXCIsIFwiQ2lkcklwXCIgOiB7IFwiUmVmXCIgOiBcIlNTSExvY2F0aW9uXCJ9IH1dXG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiSVBBZGRyZXNzXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6OkVJUFwiXG4gICAgfSxcblxuICAgIFwiSVBBc3NvY1wiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpFSVBBc3NvY2lhdGlvblwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiSW5zdGFuY2VJZFwiIDogeyBcIlJlZlwiIDogXCJFQzJJbnN0YW5jZVwiIH0sXG4gICAgICAgIFwiRUlQXCIgOiB7IFwiUmVmXCIgOiBcIklQQWRkcmVzc1wiIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFwiT3V0cHV0c1wiIDoge1xuICAgIFwiSW5zdGFuY2VJZFwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJJbnN0YW5jZUlkIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIlJlZlwiIDogXCJFQzJJbnN0YW5jZVwiIH1cbiAgICB9LFxuICAgIFwiSW5zdGFuY2VJUEFkZHJlc3NcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiSVAgYWRkcmVzcyBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJSZWZcIiA6IFwiSVBBZGRyZXNzXCIgfVxuICAgIH1cbiAgfVxufVxuIl19
