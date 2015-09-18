(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/arrow.js":[function(require,module,exports){
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

},{}],"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js":[function(require,module,exports){
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
    if (this.dragging)
    {
      var global = this.toGlobal(this.parent);
      var local = this.toLocal(this.parent);
      //console.log('x: ' + this.x + ' y: ' + this.y);
      //console.log('this: ' + this.x+":"+this.y + ", global: " + global.x + ":" + global.y + ", local: " + local.x + ":" + local.y);
      //console.log('width: ' + this.width + ' height: ' + this.height);
      var newPosition = this.data.getLocalPosition(this.parent);
      //console.log('NEW: ' + newPosition.x + ':' + newPosition.y);
      var local = this.toLocal(this.data);
      //console.log('LOCAL: ' + local.x + ':' + local.y);
      this.position.x = newPosition.x;
      this.position.y = newPosition.y;
      //this.moveTo(newPosition.x, newPosition.y);
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


},{}],"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/element.js":[function(require,module,exports){
/**
 * Created by arming on 9/15/15.
 */

var DragDrop = require('./drag.drop');

var DEFAULT_SCALE = 0.8;

function construct(iconURL, x, y, scale) {
  var element = PIXI.Sprite.fromFrame(iconURL);
  element.name = iconURL;
  //console.log('EC2Instance');
  //console.log(element);
  element.scale.set(scale);
  element.position.x = x;
  element.position.y = y;
  element.anchor.set(0.5);
  element.interactive = true;
  element.buttonMode = true;
  element
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
  element.arrows = [];
  return element;
}

var Element = {

  AWS_EC2_Element: function(x,y) {
    return construct('Compute_&_Networking_Amazon_EC2--.png', x, y, DEFAULT_SCALE)
  },

  AWS_Users: function(x,y) {
    return construct('Non-Service_Specific_copy_Users.png', x, y, DEFAULT_SCALE)
  },

  addArrowTo: function(b) {
    this.arrows.push(b);
  },

  removeArrowTo: function(index) {
    this.arrows.remove(index);
  },

  drawArrowTo: function(b) {

    var arrow = new PIXI.Graphics();

    console.log(a.getBounds());
    console.log(b.getBounds());

  }

};

module.exports = Element;

},{"./drag.drop":"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js"}],"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js":[function(require,module,exports){

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

},{}],"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/pixi.editor.js":[function(require,module,exports){
/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var GuiUtil = require('./gui.util');
var Element = require('./element');
var Arrow = require('./arrow');

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
    //var renderer = new PIXI.CanvasRenderer(winDimension.x, winDimension.y, {backgroundColor : 0xFFFFFF});
    console.log('Using ');
    console.log(renderer);
    var stage = new PIXI.Container();

    var elementsContainer = new PIXI.Container();

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

      var users = Element.AWS_Users(dim.x/2, 200);
      elementsContainer.addChild(users);

      var instance1 = Element.AWS_EC2_Element(dim.x/2,400);
      elementsContainer.addChild(instance1);

      console.log(elementsContainer.getLocalBounds());

      //users.addArrow(instance1);

      console.log('Children:');
      console.log(elementsContainer.children);
      //var arrow = Arrow.drawBetween(users, instance1);

      stage.addChild(elementsContainer);
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

},{"./arrow":"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/arrow.js","./element":"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/element.js","./gui.util":"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js"}],"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js":[function(require,module,exports){
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

},{}],"/Users/arming/WebstormProjects/cloudslicer/app/scripts/main.js":[function(require,module,exports){
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

},{"./components/pixi.editor":"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/pixi.editor.js","./components/source.editor":"/Users/arming/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js","./testData/ec2.json":"/Users/arming/WebstormProjects/cloudslicer/app/scripts/testData/ec2.json"}],"/Users/arming/WebstormProjects/cloudslicer/app/scripts/testData/ec2.json":[function(require,module,exports){
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

},{}]},{},["/Users/arming/WebstormProjects/cloudslicer/app/scripts/main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2Fycm93LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9kcmFnLmRyb3AuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2VsZW1lbnQuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2d1aS51dGlsLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9waXhpLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvc291cmNlLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL21haW4uanMiLCJhcHAvc2NyaXB0cy90ZXN0RGF0YS9lYzIuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTcvMTUuXG4gKi9cblxudmFyIEFycm93ID0ge1xuXG4gIGRyYXdCZXR3ZWVuOiBmdW5jdGlvbihhLCBiKSB7XG5cbiAgICB2YXIgYXJyb3cgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXG4gICAgY29uc29sZS5sb2coYS5nZXRCb3VuZHMoKSk7XG4gICAgY29uc29sZS5sb2coYi5nZXRCb3VuZHMoKSk7XG5cbiAgICAvKlxuICAgIGFycm93LmxpbmVTdHlsZSgxLCAweEU1RTVFNSwgMSk7XG4gICAgd2hpbGUgKGNvdW50IDwgd2lkdGgpIHtcbiAgICAgIGdyaWQubW92ZVRvKGNvdW50LCAwKTtcbiAgICAgIGdyaWQubGluZVRvKGNvdW50LCBoZWlnaHQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICBjb3VudCA9IGludGVydmFsO1xuICAgIHdoaWxlKGNvdW50IDwgaGVpZ2h0KSB7XG4gICAgICBncmlkLm1vdmVUbygwLCBjb3VudCk7XG4gICAgICBncmlkLmxpbmVUbyh3aWR0aCwgY291bnQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICByZXR1cm4gYXJyb3c7XG4gICAgKi9cbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFycm93O1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTQvMTUuXG4gKi9cblxudmFyIE1PVVNFX09WRVJfU0NBTEVfUkFUSU8gPSAxLjE7XG5cbnZhciBEcmFnRHJvcCA9IHtcblxuICBvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICAgIHRoaXMuYWxwaGEgPSAwLjU7XG4gICAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gIH0sXG5cbiAgb25EcmFnRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFscGhhID0gMTtcblxuICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcblxuICAgIC8vIHNldCB0aGUgaW50ZXJhY3Rpb24gZGF0YSB0byBudWxsXG4gICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgfSxcblxuICBvbkRyYWdNb3ZlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5kcmFnZ2luZylcbiAgICB7XG4gICAgICB2YXIgZ2xvYmFsID0gdGhpcy50b0dsb2JhbCh0aGlzLnBhcmVudCk7XG4gICAgICB2YXIgbG9jYWwgPSB0aGlzLnRvTG9jYWwodGhpcy5wYXJlbnQpO1xuICAgICAgLy9jb25zb2xlLmxvZygneDogJyArIHRoaXMueCArICcgeTogJyArIHRoaXMueSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCd0aGlzOiAnICsgdGhpcy54K1wiOlwiK3RoaXMueSArIFwiLCBnbG9iYWw6IFwiICsgZ2xvYmFsLnggKyBcIjpcIiArIGdsb2JhbC55ICsgXCIsIGxvY2FsOiBcIiArIGxvY2FsLnggKyBcIjpcIiArIGxvY2FsLnkpO1xuICAgICAgLy9jb25zb2xlLmxvZygnd2lkdGg6ICcgKyB0aGlzLndpZHRoICsgJyBoZWlnaHQ6ICcgKyB0aGlzLmhlaWdodCk7XG4gICAgICB2YXIgbmV3UG9zaXRpb24gPSB0aGlzLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbih0aGlzLnBhcmVudCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdORVc6ICcgKyBuZXdQb3NpdGlvbi54ICsgJzonICsgbmV3UG9zaXRpb24ueSk7XG4gICAgICB2YXIgbG9jYWwgPSB0aGlzLnRvTG9jYWwodGhpcy5kYXRhKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ0xPQ0FMOiAnICsgbG9jYWwueCArICc6JyArIGxvY2FsLnkpO1xuICAgICAgdGhpcy5wb3NpdGlvbi54ID0gbmV3UG9zaXRpb24ueDtcbiAgICAgIHRoaXMucG9zaXRpb24ueSA9IG5ld1Bvc2l0aW9uLnk7XG4gICAgICAvL3RoaXMubW92ZVRvKG5ld1Bvc2l0aW9uLngsIG5ld1Bvc2l0aW9uLnkpO1xuICAgIH1cbiAgfSxcblxuICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ01vdXNlZCBvdmVyIScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG4gICAgdmFyIGljb25TaXplID0gMjA7XG4gICAgdmFyIGVsZW1lbnRTaXplID0gMTAwO1xuXG4gICAgdmFyIGdsb2JhbCA9IHNlbGYudG9HbG9iYWwoc2VsZi5wb3NpdGlvbik7XG4gICAgY29uc29sZS5sb2coJ29mZmljaWFsOiAnICsgc2VsZi5wb3NpdGlvbi54ICsgJzonICsgc2VsZi5wb3NpdGlvbi55KTtcbiAgICBjb25zb2xlLmxvZygnR0xPQkFMOiAnICsgZ2xvYmFsLnggKyAnOicgKyBnbG9iYWwueSk7XG4gICAgY29uc29sZS5sb2coc2VsZi5nZXRMb2NhbEJvdW5kcygpKTtcblxuICAgIHZhciBzY2FsZUxvY2F0aW9ucyA9IFtcbiAgICAgIHt4OiAwLCB5OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMi1pY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMC1zZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMi1pY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzIraWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAsIHk6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMitpY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX1cbiAgICBdO1xuXG4gICAgY29uc29sZS5sb2coc2NhbGVMb2NhdGlvbnNbMF0pO1xuXG4gICAgLy9tb3ZlSWNvbi5kcmF3UmVjdChlbGVtZW50U2l6ZS01LCAtNSwgMTAsIDEwKTtcbiAgICAvL21vdmVJY29uLmRyYXdSZWN0KC01LCBlbGVtZW50U2l6ZS01LCAxMCwgMTApO1xuICAgIC8vbW92ZUljb24uZHJhd1JlY3QoZWxlbWVudFNpemUtNSwgZWxlbWVudFNpemUtNSwgMTAsIDEwKTtcblxuICAgIHNlbGYuc2NhbGVJY29ucyA9IFtdO1xuXG4gICAgc2NhbGVMb2NhdGlvbnMuZm9yRWFjaChmdW5jdGlvbihsb2MpIHtcbiAgICAgIHZhciBpY29uID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICAgIGljb24ubW92ZVRvKDAsMCk7XG4gICAgICBpY29uLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGljb24uYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgICBpY29uLmxpbmVTdHlsZSgxLCAweDAwMDBGRiwgMSk7XG4gICAgICBpY29uLmJlZ2luRmlsbCgweDAwMDAwMCwgMSk7XG4gICAgICBpY29uLmRyYXdDaXJjbGUobG9jLngsIGxvYy55LCBsb2Muc2l6ZSk7XG4gICAgICBpY29uLmVuZEZpbGwoKTtcblxuICAgICAgLy9pY29uXG4gICAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBzdGFydFxuICAgICAgICAvLy5vbignbW91c2Vkb3duJywgb25TY2FsZUljb25EcmFnU3RhcnQpXG4gICAgICAgIC8vLm9uKCd0b3VjaHN0YXJ0Jywgb25TY2FsZUljb25EcmFnU3RhcnQpO1xuICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIGVuZFxuICAgICAgLy8ub24oJ21vdXNldXAnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbignbW91c2V1cG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbigndG91Y2hlbmQnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbigndG91Y2hlbmRvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIG1vdmVcbiAgICAgIC8vLm9uKCdtb3VzZW1vdmUnLCBvbkRyYWdNb3ZlKVxuICAgICAgLy8ub24oJ3RvdWNobW92ZScsIG9uRHJhZ01vdmUpXG5cbiAgICAgIHNlbGYuc2NhbGVJY29ucy5wdXNoKGljb24pO1xuXG4gICAgfSk7XG5cbiAgICAvL21vdmVJY29uLmVuZEZpbGwoKTtcblxuICAgIC8vc3RhZ2UucmVtb3ZlQ2hpbGQoc2VsZik7XG4gICAgLy9zdGFnZS5hZGRDaGlsZChpY29uKTtcbiAgICBzZWxmLnNjYWxlSWNvbnMuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICBzZWxmLmFkZENoaWxkKHMpO1xuICAgIH0pO1xuICAgIC8vdGhpcy5hZGRDaGlsZCh0aGlzLnNjYWxlSWNvbnNbMF0pXG4gICAgLy9zdGFnZS5hZGRDaGlsZCh0aGlzKTtcblxuICB9LFxuXG4gIG9uTW91c2VPdXQ6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdNb3VzZWQgb3V0IScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgY29uc29sZS5sb2coJ01vdXNlIG91dCcpO1xuICAgIHRoaXMuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2hpbGQocyk7XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coJ1NpemU6ICcpO1xuICAgIGNvbnNvbGUubG9nKHRoaXMuZ2V0Qm91bmRzKCkpO1xuXG4gIH0sXG5cbiAgb25TY2FsZUljb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gc3RvcmUgYSByZWZlcmVuY2UgdG8gdGhlIGRhdGFcbiAgICAvLyB0aGUgcmVhc29uIGZvciB0aGlzIGlzIGJlY2F1c2Ugb2YgbXVsdGl0b3VjaFxuICAgIC8vIHdlIHdhbnQgdG8gdHJhY2sgdGhlIG1vdmVtZW50IG9mIHRoaXMgcGFydGljdWxhciB0b3VjaFxuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZygnUmVzaXppbmchJyk7XG4gIH1cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdEcm9wO1xuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi9kcmFnLmRyb3AnKTtcblxudmFyIERFRkFVTFRfU0NBTEUgPSAwLjg7XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdChpY29uVVJMLCB4LCB5LCBzY2FsZSkge1xuICB2YXIgZWxlbWVudCA9IFBJWEkuU3ByaXRlLmZyb21GcmFtZShpY29uVVJMKTtcbiAgZWxlbWVudC5uYW1lID0gaWNvblVSTDtcbiAgLy9jb25zb2xlLmxvZygnRUMySW5zdGFuY2UnKTtcbiAgLy9jb25zb2xlLmxvZyhlbGVtZW50KTtcbiAgZWxlbWVudC5zY2FsZS5zZXQoc2NhbGUpO1xuICBlbGVtZW50LnBvc2l0aW9uLnggPSB4O1xuICBlbGVtZW50LnBvc2l0aW9uLnkgPSB5O1xuICBlbGVtZW50LmFuY2hvci5zZXQoMC41KTtcbiAgZWxlbWVudC5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gIGVsZW1lbnQuYnV0dG9uTW9kZSA9IHRydWU7XG4gIGVsZW1lbnRcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAub24oJ21vdXNlZG93bicsIERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC5vbigndG91Y2hzdGFydCcsIERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAub24oJ21vdXNldXAnLCBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCdtb3VzZXVwb3V0c2lkZScsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ3RvdWNoZW5kJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbigndG91Y2hlbmRvdXRzaWRlJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgLm9uKCdtb3VzZW1vdmUnLCBEcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgIC5vbigndG91Y2htb3ZlJywgRHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAvLyBldmVudHMgZm9yIG1vdXNlIG92ZXJcbiAgICAub24oJ21vdXNlb3ZlcicsIERyYWdEcm9wLm9uTW91c2VPdmVyKVxuICAgIC5vbignbW91c2VvdXQnLCBEcmFnRHJvcC5vbk1vdXNlT3V0KTtcbiAgZWxlbWVudC5hcnJvd3MgPSBbXTtcbiAgcmV0dXJuIGVsZW1lbnQ7XG59XG5cbnZhciBFbGVtZW50ID0ge1xuXG4gIEFXU19FQzJfRWxlbWVudDogZnVuY3Rpb24oeCx5KSB7XG4gICAgcmV0dXJuIGNvbnN0cnVjdCgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMi0tLnBuZycsIHgsIHksIERFRkFVTFRfU0NBTEUpXG4gIH0sXG5cbiAgQVdTX1VzZXJzOiBmdW5jdGlvbih4LHkpIHtcbiAgICByZXR1cm4gY29uc3RydWN0KCdOb24tU2VydmljZV9TcGVjaWZpY19jb3B5X1VzZXJzLnBuZycsIHgsIHksIERFRkFVTFRfU0NBTEUpXG4gIH0sXG5cbiAgYWRkQXJyb3dUbzogZnVuY3Rpb24oYikge1xuICAgIHRoaXMuYXJyb3dzLnB1c2goYik7XG4gIH0sXG5cbiAgcmVtb3ZlQXJyb3dUbzogZnVuY3Rpb24oaW5kZXgpIHtcbiAgICB0aGlzLmFycm93cy5yZW1vdmUoaW5kZXgpO1xuICB9LFxuXG4gIGRyYXdBcnJvd1RvOiBmdW5jdGlvbihiKSB7XG5cbiAgICB2YXIgYXJyb3cgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXG4gICAgY29uc29sZS5sb2coYS5nZXRCb3VuZHMoKSk7XG4gICAgY29uc29sZS5sb2coYi5nZXRCb3VuZHMoKSk7XG5cbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnQ7XG4iLCJcbnZhciBHdWlVdGlsID0ge1xuXG4gIGdldFdpbmRvd0RpbWVuc2lvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHsgeDogd2luZG93LmlubmVyV2lkdGgsIHk6IHdpbmRvdy5pbm5lckhlaWdodCB9O1xuICB9LFxuXG4gIGRyYXdHcmlkOiBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIGdyaWQgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHZhciBpbnRlcnZhbCA9IDI1O1xuICAgIHZhciBjb3VudCA9IGludGVydmFsO1xuICAgIGdyaWQubGluZVN0eWxlKDEsIDB4RTVFNUU1LCAxKTtcbiAgICB3aGlsZSAoY291bnQgPCB3aWR0aCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oY291bnQsIDApO1xuICAgICAgZ3JpZC5saW5lVG8oY291bnQsIGhlaWdodCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIGNvdW50ID0gaW50ZXJ2YWw7XG4gICAgd2hpbGUoY291bnQgPCBoZWlnaHQpIHtcbiAgICAgIGdyaWQubW92ZVRvKDAsIGNvdW50KTtcbiAgICAgIGdyaWQubGluZVRvKHdpZHRoLCBjb3VudCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIHZhciBjb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgICBjb250YWluZXIuYWRkQ2hpbGQoZ3JpZCk7XG4gICAgY29udGFpbmVyLmNhY2hlQXNCaXRtYXAgPSB0cnVlO1xuICAgIHJldHVybiBjb250YWluZXI7XG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHdWlVdGlsO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDcvOS8xNS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBHdWlVdGlsID0gcmVxdWlyZSgnLi9ndWkudXRpbCcpO1xudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuL2VsZW1lbnQnKTtcbnZhciBBcnJvdyA9IHJlcXVpcmUoJy4vYXJyb3cnKTtcblxuZnVuY3Rpb24gcmVzaXplR3VpQ29udGFpbmVyKHJlbmRlcmVyKSB7XG5cbiAgdmFyIGRpbSA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG5cbiAgY29uc29sZS5sb2coJ1Jlc2l6aW5nLi4uJyk7XG4gIGNvbnNvbGUubG9nKGRpbSk7XG5cbiAgJCgnI2d1aUNvbnRhaW5lcicpLmhlaWdodChkaW0ueSk7XG4gICQoJyNndWlDb250YWluZXInKS53aWR0aChkaW0ueCk7XG5cbiAgaWYocmVuZGVyZXIpIHtcbiAgICByZW5kZXJlci52aWV3LnN0eWxlLndpZHRoID0gZGltLngrJ3B4JztcbiAgICByZW5kZXJlci52aWV3LnN0eWxlLmhlaWdodCA9IGRpbS55KydweCc7XG4gIH1cblxuICBjb25zb2xlLmxvZygnUmVzaXppbmcgZ3VpIGNvbnRhaW5lci4uLicpO1xuXG59XG5cbnZhciBQaXhpRWRpdG9yID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICB2YXIgd2luRGltZW5zaW9uID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcblxuICAgIHZhciByZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSwge2JhY2tncm91bmRDb2xvciA6IDB4RkZGRkZGfSk7XG4gICAgLy92YXIgcmVuZGVyZXIgPSBuZXcgUElYSS5DYW52YXNSZW5kZXJlcih3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnksIHtiYWNrZ3JvdW5kQ29sb3IgOiAweEZGRkZGRn0pO1xuICAgIGNvbnNvbGUubG9nKCdVc2luZyAnKTtcbiAgICBjb25zb2xlLmxvZyhyZW5kZXJlcik7XG4gICAgdmFyIHN0YWdlID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG5cbiAgICB2YXIgZWxlbWVudHNDb250YWluZXIgPSBuZXcgUElYSS5Db250YWluZXIoKTtcblxuICAgIHZhciBhcnJvd0dyYXBoaWNzID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblxuICAgIHZhciBtZXRlciA9IG5ldyBGUFNNZXRlcigpO1xuXG4gICAgdmFyIGZwcyA9IDYwO1xuICAgIHZhciBub3c7XG4gICAgdmFyIHRoZW4gPSBEYXRlLm5vdygpO1xuICAgIHZhciBpbnRlcnZhbCA9IDEwMDAvZnBzO1xuICAgIHZhciBkZWx0YTtcblxuICAgIGZ1bmN0aW9uIGFuaW1hdGUoKSB7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG5cbiAgICAgIG5vdyA9IERhdGUubm93KCk7XG4gICAgICBkZWx0YSA9IG5vdyAtIHRoZW47XG5cbiAgICAgIGlmIChkZWx0YSA+IGludGVydmFsKSB7XG4gICAgICAgIHRoZW4gPSBub3cgLSAoZGVsdGEgJSBpbnRlcnZhbCk7XG4gICAgICAgIG1ldGVyLnRpY2soKTtcblxuICAgICAgICByZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uTG9hZGVkKCkge1xuICAgICAgY29uc29sZS5sb2coJ0Fzc2V0cyBsb2FkZWQnKTtcblxuICAgICAgdmFyIGRpbSA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG5cbiAgICAgIHZhciB1c2VycyA9IEVsZW1lbnQuQVdTX1VzZXJzKGRpbS54LzIsIDIwMCk7XG4gICAgICBlbGVtZW50c0NvbnRhaW5lci5hZGRDaGlsZCh1c2Vycyk7XG5cbiAgICAgIHZhciBpbnN0YW5jZTEgPSBFbGVtZW50LkFXU19FQzJfRWxlbWVudChkaW0ueC8yLDQwMCk7XG4gICAgICBlbGVtZW50c0NvbnRhaW5lci5hZGRDaGlsZChpbnN0YW5jZTEpO1xuXG4gICAgICBjb25zb2xlLmxvZyhlbGVtZW50c0NvbnRhaW5lci5nZXRMb2NhbEJvdW5kcygpKTtcblxuICAgICAgLy91c2Vycy5hZGRBcnJvdyhpbnN0YW5jZTEpO1xuXG4gICAgICBjb25zb2xlLmxvZygnQ2hpbGRyZW46Jyk7XG4gICAgICBjb25zb2xlLmxvZyhlbGVtZW50c0NvbnRhaW5lci5jaGlsZHJlbik7XG4gICAgICAvL3ZhciBhcnJvdyA9IEFycm93LmRyYXdCZXR3ZWVuKHVzZXJzLCBpbnN0YW5jZTEpO1xuXG4gICAgICBzdGFnZS5hZGRDaGlsZChlbGVtZW50c0NvbnRhaW5lcik7XG4gICAgfVxuXG4gICAgUElYSS5sb2FkZXJcbiAgICAgIC5hZGQoJy4uL3Jlc291cmNlcy9zcHJpdGVzL3Nwcml0ZXMuanNvbicpXG4gICAgICAubG9hZChvbkxvYWRlZCk7XG5cbiAgICBzdGFnZS5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgdmFyIGdyaWQgPSBzdGFnZS5hZGRDaGlsZChHdWlVdGlsLmRyYXdHcmlkKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSkpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyBsaXN0ZW5lci4uLicpO1xuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICByZXNpemVHdWlDb250YWluZXIocmVuZGVyZXIpO1xuICAgICAgd2luRGltZW5zaW9uID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcbiAgICAgIC8vY29uc29sZS5sb2cobmV3RGltKTtcbiAgICAgIGNvbnNvbGUubG9nKHN0YWdlKTtcbiAgICAgIHN0YWdlLnJlbW92ZUNoaWxkKGdyaWQpO1xuICAgICAgZ3JpZCA9IHN0YWdlLmFkZENoaWxkKEd1aVV0aWwuZHJhd0dyaWQod2luRGltZW5zaW9uLngsIHdpbkRpbWVuc2lvbi55KSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGVtcGxhdGU6IG9wdGlvbnMudGVtcGxhdGUsXG5cbiAgICAgIGRyYXdDYW52YXNFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBhbmltYXRlKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy92YXIgZWxlbWVudFNpemUgPSAxMDA7XG4gICAgICAgIC8vcmVzaXplR3VpQ29udGFpbmVyKCk7XG5cbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChyZW5kZXJlci52aWV3KTtcblxuICAgICAgICByZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuXG4gICAgICAgIGFuaW1hdGUoKTtcblxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBtKCcjZ3VpQ29udGFpbmVyJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0NhbnZhc0VkaXRvcn0pXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUGl4aUVkaXRvcjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA3LzkvMTUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiByZXNpemVFZGl0b3IoZWRpdG9yKSB7XG4gIGVkaXRvci5zZXRTaXplKG51bGwsIHdpbmRvdy5pbm5lckhlaWdodCk7XG59XG5cbnZhciBTb3VyY2VFZGl0b3IgPSB7XG5cbiAgY29udHJvbGxlcjogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgZHJhd0VkaXRvcjogZnVuY3Rpb24gKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcblxuICAgICAgICB2YXIgZWRpdG9yID0gbnVsbDtcblxuICAgICAgICBpZiAoaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgIGlmKGVkaXRvcikge1xuICAgICAgICAgICAgZWRpdG9yLnJlZnJlc2goKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWRpdG9yID0gQ29kZU1pcnJvcihlbGVtZW50LCB7XG4gICAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMudGVtcGxhdGUoKSwgdW5kZWZpbmVkLCAyKSxcbiAgICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICBtb2RlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgZ3V0dGVyczogWydDb2RlTWlycm9yLWxpbnQtbWFya2VycyddLFxuICAgICAgICAgIGxpbnQ6IHRydWUsXG4gICAgICAgICAgc3R5bGVBY3RpdmVMaW5lOiB0cnVlLFxuICAgICAgICAgIGF1dG9DbG9zZUJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIG1hdGNoQnJhY2tldHM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICd6ZW5idXJuJ1xuICAgICAgICB9KTtcblxuICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcblxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJlc2l6ZUVkaXRvcihlZGl0b3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGVkaXRvcikge1xuICAgICAgICAgIG0uc3RhcnRDb21wdXRhdGlvbigpO1xuICAgICAgICAgIG9wdGlvbnMudGVtcGxhdGUoSlNPTi5wYXJzZShlZGl0b3IuZ2V0VmFsdWUoKSkpO1xuICAgICAgICAgIG0uZW5kQ29tcHV0YXRpb24oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICB2aWV3OiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG0oJyNzb3VyY2VFZGl0b3InLCB7IGNvbmZpZzogY29udHJvbGxlci5kcmF3RWRpdG9yIH0pXG4gICAgXVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNvdXJjZUVkaXRvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFNvdXJjZUVkaXRvciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9zb3VyY2UuZWRpdG9yJyk7XG52YXIgUGl4aUVkaXRvciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9waXhpLmVkaXRvcicpO1xuXG52YXIgdGVzdERhdGEgPSByZXF1aXJlKCcuL3Rlc3REYXRhL2VjMi5qc29uJyk7XG5cbnZhciB0ZW1wbGF0ZSA9IG0ucHJvcCh0ZXN0RGF0YSk7XG5cbm0ubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nsb3Vkc2xpY2VyLWFwcCcpLCBtLmNvbXBvbmVudChQaXhpRWRpdG9yLCB7XG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIH0pXG4pO1xuXG5tLm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb2RlLWJhcicpLCBtLmNvbXBvbmVudChTb3VyY2VFZGl0b3IsIHtcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgfSlcbik7XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiQVdTVGVtcGxhdGVGb3JtYXRWZXJzaW9uXCIgOiBcIjIwMTAtMDktMDlcIixcblxuICBcIkRlc2NyaXB0aW9uXCIgOiBcIkFXUyBDbG91ZEZvcm1hdGlvbiBTYW1wbGUgVGVtcGxhdGUgU2FtcGxlIHRlbXBsYXRlIEVJUF9XaXRoX0Fzc29jaWF0aW9uOiBUaGlzIHRlbXBsYXRlIHNob3dzIGhvdyB0byBhc3NvY2lhdGUgYW4gRWxhc3RpYyBJUCBhZGRyZXNzIHdpdGggYW4gQW1hem9uIEVDMiBpbnN0YW5jZSAtIHlvdSBjYW4gdXNlIHRoaXMgc2FtZSB0ZWNobmlxdWUgdG8gYXNzb2NpYXRlIGFuIEVDMiBpbnN0YW5jZSB3aXRoIGFuIEVsYXN0aWMgSVAgQWRkcmVzcyB0aGF0IGlzIG5vdCBjcmVhdGVkIGluc2lkZSB0aGUgdGVtcGxhdGUgYnkgcmVwbGFjaW5nIHRoZSBFSVAgcmVmZXJlbmNlIGluIHRoZSBBV1M6OkVDMjo6RUlQQXNzb2ljYXRpb24gcmVzb3VyY2UgdHlwZSB3aXRoIHRoZSBJUCBhZGRyZXNzIG9mIHRoZSBleHRlcm5hbCBFSVAuICoqV0FSTklORyoqIFRoaXMgdGVtcGxhdGUgY3JlYXRlcyBhbiBBbWF6b24gRUMyIGluc3RhbmNlIGFuZCBhbiBFbGFzdGljIElQIEFkZHJlc3MuIFlvdSB3aWxsIGJlIGJpbGxlZCBmb3IgdGhlIEFXUyByZXNvdXJjZXMgdXNlZCBpZiB5b3UgY3JlYXRlIGEgc3RhY2sgZnJvbSB0aGlzIHRlbXBsYXRlLlwiLFxuXG4gIFwiUGFyYW1ldGVyc1wiIDoge1xuICAgIFwiSW5zdGFuY2VUeXBlXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIldlYlNlcnZlciBFQzIgaW5zdGFuY2UgdHlwZVwiLFxuICAgICAgXCJUeXBlXCIgOiBcIlN0cmluZ1wiLFxuICAgICAgXCJEZWZhdWx0XCIgOiBcIm0xLnNtYWxsXCIsXG4gICAgICBcIkFsbG93ZWRWYWx1ZXNcIiA6IFsgXCJ0MS5taWNyb1wiLCBcInQyLm1pY3JvXCIsIFwidDIuc21hbGxcIiwgXCJ0Mi5tZWRpdW1cIiwgXCJtMS5zbWFsbFwiLCBcIm0xLm1lZGl1bVwiLCBcIm0xLmxhcmdlXCIsIFwibTEueGxhcmdlXCIsIFwibTIueGxhcmdlXCIsIFwibTIuMnhsYXJnZVwiLCBcIm0yLjR4bGFyZ2VcIiwgXCJtMy5tZWRpdW1cIiwgXCJtMy5sYXJnZVwiLCBcIm0zLnhsYXJnZVwiLCBcIm0zLjJ4bGFyZ2VcIiwgXCJjMS5tZWRpdW1cIiwgXCJjMS54bGFyZ2VcIiwgXCJjMy5sYXJnZVwiLCBcImMzLnhsYXJnZVwiLCBcImMzLjJ4bGFyZ2VcIiwgXCJjMy40eGxhcmdlXCIsIFwiYzMuOHhsYXJnZVwiLCBcImM0LmxhcmdlXCIsIFwiYzQueGxhcmdlXCIsIFwiYzQuMnhsYXJnZVwiLCBcImM0LjR4bGFyZ2VcIiwgXCJjNC44eGxhcmdlXCIsIFwiZzIuMnhsYXJnZVwiLCBcInIzLmxhcmdlXCIsIFwicjMueGxhcmdlXCIsIFwicjMuMnhsYXJnZVwiLCBcInIzLjR4bGFyZ2VcIiwgXCJyMy44eGxhcmdlXCIsIFwiaTIueGxhcmdlXCIsIFwiaTIuMnhsYXJnZVwiLCBcImkyLjR4bGFyZ2VcIiwgXCJpMi44eGxhcmdlXCIsIFwiZDIueGxhcmdlXCIsIFwiZDIuMnhsYXJnZVwiLCBcImQyLjR4bGFyZ2VcIiwgXCJkMi44eGxhcmdlXCIsIFwiaGkxLjR4bGFyZ2VcIiwgXCJoczEuOHhsYXJnZVwiLCBcImNyMS44eGxhcmdlXCIsIFwiY2MyLjh4bGFyZ2VcIiwgXCJjZzEuNHhsYXJnZVwiXVxuICAgICxcbiAgICAgIFwiQ29uc3RyYWludERlc2NyaXB0aW9uXCIgOiBcIm11c3QgYmUgYSB2YWxpZCBFQzIgaW5zdGFuY2UgdHlwZS5cIlxuICAgIH0sXG5cbiAgICBcIktleU5hbWVcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiTmFtZSBvZiBhbiBleGlzdGluZyBFQzIgS2V5UGFpciB0byBlbmFibGUgU1NIIGFjY2VzcyB0byB0aGUgaW5zdGFuY2VzXCIsXG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6OktleVBhaXI6OktleU5hbWVcIixcbiAgICAgIFwiQ29uc3RyYWludERlc2NyaXB0aW9uXCIgOiBcIm11c3QgYmUgdGhlIG5hbWUgb2YgYW4gZXhpc3RpbmcgRUMyIEtleVBhaXIuXCJcbiAgICB9LFxuXG4gICAgXCJTU0hMb2NhdGlvblwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJUaGUgSVAgYWRkcmVzcyByYW5nZSB0aGF0IGNhbiBiZSB1c2VkIHRvIFNTSCB0byB0aGUgRUMyIGluc3RhbmNlc1wiLFxuICAgICAgXCJUeXBlXCI6IFwiU3RyaW5nXCIsXG4gICAgICBcIk1pbkxlbmd0aFwiOiBcIjlcIixcbiAgICAgIFwiTWF4TGVuZ3RoXCI6IFwiMThcIixcbiAgICAgIFwiRGVmYXVsdFwiOiBcIjAuMC4wLjAvMFwiLFxuICAgICAgXCJBbGxvd2VkUGF0dGVyblwiOiBcIihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KS8oXFxcXGR7MSwyfSlcIixcbiAgICAgIFwiQ29uc3RyYWludERlc2NyaXB0aW9uXCI6IFwibXVzdCBiZSBhIHZhbGlkIElQIENJRFIgcmFuZ2Ugb2YgdGhlIGZvcm0geC54LngueC94LlwiXG4gICAgfVxuICB9LFxuXG4gIFwiTWFwcGluZ3NcIiA6IHtcbiAgICBcIkFXU0luc3RhbmNlVHlwZTJBcmNoXCIgOiB7XG4gICAgICBcInQxLm1pY3JvXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJ0Mi5taWNyb1wiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwidDIuc21hbGxcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInQyLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMS5zbWFsbFwiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTMubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMxLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJjMS54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwiYzMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImcyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk1HMlwiICB9LFxuICAgICAgXCJyMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaGkxLjR4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImhzMS44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjcjEuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiY2MyLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH1cbiAgICB9XG4gICxcbiAgICBcIkFXU1JlZ2lvbkFyY2gyQU1JXCIgOiB7XG4gICAgICBcInVzLWVhc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTBmNGNmZDY0XCIsIFwiSFZNNjRcIiA6IFwiYW1pLTBkNGNmZDY2XCIsIFwiSFZNRzJcIiA6IFwiYW1pLTViMDViYTMwXCJ9LFxuICAgICAgXCJ1cy13ZXN0LTJcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kM2M1ZDFlM1wiLCBcIkhWTTY0XCIgOiBcImFtaS1kNWM1ZDFlNVwiLCBcIkhWTUcyXCIgOiBcImFtaS1hOWQ2YzA5OVwifSxcbiAgICAgIFwidXMtd2VzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktODVlYTEzYzFcIiwgXCJIVk02NFwiIDogXCJhbWktODdlYTEzYzNcIiwgXCJIVk1HMlwiIDogXCJhbWktMzc4MjdhNzNcIn0sXG4gICAgICBcImV1LXdlc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWQ2ZDE4ZWExXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWU0ZDE4ZTkzXCIsIFwiSFZNRzJcIiA6IFwiYW1pLTcyYTlmMTA1XCJ9LFxuICAgICAgXCJldS1jZW50cmFsLTFcIiAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1hNGIwYjdiOVwiLCBcIkhWTTY0XCIgOiBcImFtaS1hNmIwYjdiYlwiLCBcIkhWTUcyXCIgOiBcImFtaS1hNmM5Y2ZiYlwifSxcbiAgICAgIFwiYXAtbm9ydGhlYXN0LTFcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktMWExYjlmMWFcIiwgXCJIVk02NFwiIDogXCJhbWktMWMxYjlmMWNcIiwgXCJIVk1HMlwiIDogXCJhbWktZjY0NGM0ZjZcIn0sXG4gICAgICBcImFwLXNvdXRoZWFzdC0xXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWQyNGI0MjgwXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWQ0NGI0Mjg2XCIsIFwiSFZNRzJcIiA6IFwiYW1pLTEyYjViYzQwXCJ9LFxuICAgICAgXCJhcC1zb3V0aGVhc3QtMlwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS1lZjdiMzlkNVwiLCBcIkhWTTY0XCIgOiBcImFtaS1kYjdiMzllMVwiLCBcIkhWTUcyXCIgOiBcImFtaS1iMzMzN2U4OVwifSxcbiAgICAgIFwic2EtZWFzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktNWIwOTgxNDZcIiwgXCJIVk02NFwiIDogXCJhbWktNTUwOTgxNDhcIiwgXCJIVk1HMlwiIDogXCJOT1RfU1VQUE9SVEVEXCJ9LFxuICAgICAgXCJjbi1ub3J0aC0xXCIgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1iZWM0NTg4N1wiLCBcIkhWTTY0XCIgOiBcImFtaS1iY2M0NTg4NVwiLCBcIkhWTUcyXCIgOiBcIk5PVF9TVVBQT1JURURcIn1cbiAgICB9XG5cbiAgfSxcblxuICBcIlJlc291cmNlc1wiIDoge1xuICAgIFwiRUMySW5zdGFuY2VcIiA6IHtcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6SW5zdGFuY2VcIixcbiAgICAgIFwiUHJvcGVydGllc1wiIDoge1xuICAgICAgICBcIlVzZXJEYXRhXCIgOiB7IFwiRm46OkJhc2U2NFwiIDogeyBcIkZuOjpKb2luXCIgOiBbIFwiXCIsIFsgXCJJUEFkZHJlc3M9XCIsIHtcIlJlZlwiIDogXCJJUEFkZHJlc3NcIn1dXX19LFxuICAgICAgICBcIkluc3RhbmNlVHlwZVwiIDogeyBcIlJlZlwiIDogXCJJbnN0YW5jZVR5cGVcIiB9LFxuICAgICAgICBcIlNlY3VyaXR5R3JvdXBzXCIgOiBbIHsgXCJSZWZcIiA6IFwiSW5zdGFuY2VTZWN1cml0eUdyb3VwXCIgfSBdLFxuICAgICAgICBcIktleU5hbWVcIiA6IHsgXCJSZWZcIiA6IFwiS2V5TmFtZVwiIH0sXG4gICAgICAgIFwiSW1hZ2VJZFwiIDogeyBcIkZuOjpGaW5kSW5NYXBcIiA6IFsgXCJBV1NSZWdpb25BcmNoMkFNSVwiLCB7IFwiUmVmXCIgOiBcIkFXUzo6UmVnaW9uXCIgfSxcbiAgICAgICAgICB7IFwiRm46OkZpbmRJbk1hcFwiIDogWyBcIkFXU0luc3RhbmNlVHlwZTJBcmNoXCIsIHsgXCJSZWZcIiA6IFwiSW5zdGFuY2VUeXBlXCIgfSwgXCJBcmNoXCIgXSB9IF0gfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcIkluc3RhbmNlU2VjdXJpdHlHcm91cFwiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpTZWN1cml0eUdyb3VwXCIsXG4gICAgICBcIlByb3BlcnRpZXNcIiA6IHtcbiAgICAgICAgXCJHcm91cERlc2NyaXB0aW9uXCIgOiBcIkVuYWJsZSBTU0ggYWNjZXNzXCIsXG4gICAgICAgIFwiU2VjdXJpdHlHcm91cEluZ3Jlc3NcIiA6XG4gICAgICAgIFsgeyBcIklwUHJvdG9jb2xcIiA6IFwidGNwXCIsIFwiRnJvbVBvcnRcIiA6IFwiMjJcIiwgXCJUb1BvcnRcIiA6IFwiMjJcIiwgXCJDaWRySXBcIiA6IHsgXCJSZWZcIiA6IFwiU1NITG9jYXRpb25cIn0gfV1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJJUEFkZHJlc3NcIiA6IHtcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6RUlQXCJcbiAgICB9LFxuXG4gICAgXCJJUEFzc29jXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6OkVJUEFzc29jaWF0aW9uXCIsXG4gICAgICBcIlByb3BlcnRpZXNcIiA6IHtcbiAgICAgICAgXCJJbnN0YW5jZUlkXCIgOiB7IFwiUmVmXCIgOiBcIkVDMkluc3RhbmNlXCIgfSxcbiAgICAgICAgXCJFSVBcIiA6IHsgXCJSZWZcIiA6IFwiSVBBZGRyZXNzXCIgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgXCJPdXRwdXRzXCIgOiB7XG4gICAgXCJJbnN0YW5jZUlkXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIkluc3RhbmNlSWQgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiUmVmXCIgOiBcIkVDMkluc3RhbmNlXCIgfVxuICAgIH0sXG4gICAgXCJJbnN0YW5jZUlQQWRkcmVzc1wiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJJUCBhZGRyZXNzIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIlJlZlwiIDogXCJJUEFkZHJlc3NcIiB9XG4gICAgfVxuICB9XG59XG4iXX0=
