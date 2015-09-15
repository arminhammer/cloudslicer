(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js":[function(require,module,exports){
/**
 * Created by arminhammer on 9/14/15.
 */

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
      console.log('x: ' + this.x + ' y: ' + this.y);
      console.log('this: ' + this.x+":"+this.y + ", global: " + global.x + ":" + global.y + ", local: " + local.x + ":" + local.y);
      //console.log('width: ' + this.width + ' height: ' + this.height);
      var newPosition = this.data.getLocalPosition(this.parent);
      console.log('NEW: ' + newPosition.x + ':' + newPosition.y);
      var local = this.toLocal(this.data);
      console.log('LOCAL: ' + local.x + ':' + local.y);
      this.position.x = newPosition.x;
      this.position.y = newPosition.y;
      //this.moveTo(newPosition.x, newPosition.y);
    }
  }

};

module.exports = DragDrop;

/*
function onMouseOver() {
  var self = this;
  var iconSize = 10;

  console.log('Mouse over');
  var global = self.toGlobal(self.parent);
  console.log('GLOBAL: ' + global.x + ':' + global.y);

  var scaleLocations = [
    {x: -5, y: -5, size: iconSize},
    {x: elementSize-5, y: -5, size: iconSize},
    {x: -5, y: elementSize-5, size: iconSize},
    {x: elementSize-5, y: elementSize-5, size: iconSize}
  ];

  //moveIcon.drawRect(elementSize-5, -5, 10, 10);
  //moveIcon.drawRect(-5, elementSize-5, 10, 10);
  //moveIcon.drawRect(elementSize-5, elementSize-5, 10, 10);

  self.scaleIcons = [];

  scaleLocations.forEach(function(loc) {
    var icon = new PIXI.Graphics();
    icon.interactive = true;
    icon.buttonMode = true;
    icon.lineStyle(1, 0x0000FF, 1);
    icon.beginFill(0x000000, 1);
    icon.drawRect(loc.x, loc.y, loc.size, loc.size);
    icon.endFill();

    icon
      // events for drag start
      .on('mousedown', onScaleIconDragStart)
      .on('touchstart', onScaleIconDragStart);
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

}

function onMouseOut() {
  var self = this;
  console.log('Mouse out');
  this.scaleIcons.forEach(function(s) {
    self.removeChild(s);
  });
  console.log('Size: ');
  console.log(this.getBounds());

}

function onScaleIconDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
  console.log('Resizing!');
}
*/

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js":[function(require,module,exports){

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
    return grid;
  }

};

module.exports = GuiUtil;

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/pixi.editor.js":[function(require,module,exports){
/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var DragDrop = require('./drag.drop');
var GuiUtil = require('./gui.util');

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

    var renderer = PIXI.autoDetectRenderer(winDimension.x, winDimension.y,{backgroundColor : 0xFFFFFF});
    var stage = new PIXI.Container();
    var meter = new FPSMeter();

    function animate() {
      renderer.render(stage);
      meter.tick();
      requestAnimationFrame(animate);
    }

    function onLoaded() {
      console.log('Assets loaded');

      var AWS_EC2_Instance = PIXI.Sprite.fromFrame('Compute_&_Networking_Amazon_EC2--.png');
      console.log('EC2Instance');
      console.log(AWS_EC2_Instance);
      AWS_EC2_Instance.scale.set(0.2);
      AWS_EC2_Instance.position.x = 400;
      AWS_EC2_Instance.position.y = 400;
      AWS_EC2_Instance.anchor.set(0.5);
      AWS_EC2_Instance.interactive = true;
      AWS_EC2_Instance.buttonMode = true;
      AWS_EC2_Instance
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
        //.on('mouseover', onMouseOver)
        //.on('mouseout', onMouseOut);
      stage.addChild(AWS_EC2_Instance);
    }

    PIXI.loader
      .add('../resources/sprites/sprites.json')
      .load(onLoaded);

    stage.interactive = true;
    var grid = stage.addChild(GuiUtil.drawGrid(winDimension.x, winDimension.y));

    console.log('Adding listener...');
    $(window).resize(function() {
      resizeGuiContainer(renderer);
      winDimension = getWindowDimension();
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
        animate();

      }
    }
  },
  view: function(controller) {
    return m('#guiContainer', { config: controller.drawCanvasEditor})
  }
};

module.exports = PixiEditor;

},{"./drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js","./gui.util":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2RyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvZ3VpLnV0aWwuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL3BpeGkuZWRpdG9yLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9zb3VyY2UuZWRpdG9yLmpzIiwiYXBwL3NjcmlwdHMvbWFpbi5qcyIsImFwcC9zY3JpcHRzL3Rlc3REYXRhL2VjMi5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTQvMTUuXG4gKi9cblxudmFyIERyYWdEcm9wID0ge1xuXG4gIG9uRHJhZ1N0YXJ0OiBmdW5jdGlvbihldmVudCkge1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgfSxcblxuICBvbkRyYWdFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWxwaGEgPSAxO1xuXG4gICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgLy8gc2V0IHRoZSBpbnRlcmFjdGlvbiBkYXRhIHRvIG51bGxcbiAgICB0aGlzLmRhdGEgPSBudWxsO1xuICB9LFxuXG4gIG9uRHJhZ01vdmU6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmRyYWdnaW5nKVxuICAgIHtcbiAgICAgIHZhciBnbG9iYWwgPSB0aGlzLnRvR2xvYmFsKHRoaXMucGFyZW50KTtcbiAgICAgIHZhciBsb2NhbCA9IHRoaXMudG9Mb2NhbCh0aGlzLnBhcmVudCk7XG4gICAgICBjb25zb2xlLmxvZygneDogJyArIHRoaXMueCArICcgeTogJyArIHRoaXMueSk7XG4gICAgICBjb25zb2xlLmxvZygndGhpczogJyArIHRoaXMueCtcIjpcIit0aGlzLnkgKyBcIiwgZ2xvYmFsOiBcIiArIGdsb2JhbC54ICsgXCI6XCIgKyBnbG9iYWwueSArIFwiLCBsb2NhbDogXCIgKyBsb2NhbC54ICsgXCI6XCIgKyBsb2NhbC55KTtcbiAgICAgIC8vY29uc29sZS5sb2coJ3dpZHRoOiAnICsgdGhpcy53aWR0aCArICcgaGVpZ2h0OiAnICsgdGhpcy5oZWlnaHQpO1xuICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gdGhpcy5kYXRhLmdldExvY2FsUG9zaXRpb24odGhpcy5wYXJlbnQpO1xuICAgICAgY29uc29sZS5sb2coJ05FVzogJyArIG5ld1Bvc2l0aW9uLnggKyAnOicgKyBuZXdQb3NpdGlvbi55KTtcbiAgICAgIHZhciBsb2NhbCA9IHRoaXMudG9Mb2NhbCh0aGlzLmRhdGEpO1xuICAgICAgY29uc29sZS5sb2coJ0xPQ0FMOiAnICsgbG9jYWwueCArICc6JyArIGxvY2FsLnkpO1xuICAgICAgdGhpcy5wb3NpdGlvbi54ID0gbmV3UG9zaXRpb24ueDtcbiAgICAgIHRoaXMucG9zaXRpb24ueSA9IG5ld1Bvc2l0aW9uLnk7XG4gICAgICAvL3RoaXMubW92ZVRvKG5ld1Bvc2l0aW9uLngsIG5ld1Bvc2l0aW9uLnkpO1xuICAgIH1cbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdEcm9wO1xuXG4vKlxuZnVuY3Rpb24gb25Nb3VzZU92ZXIoKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIGljb25TaXplID0gMTA7XG5cbiAgY29uc29sZS5sb2coJ01vdXNlIG92ZXInKTtcbiAgdmFyIGdsb2JhbCA9IHNlbGYudG9HbG9iYWwoc2VsZi5wYXJlbnQpO1xuICBjb25zb2xlLmxvZygnR0xPQkFMOiAnICsgZ2xvYmFsLnggKyAnOicgKyBnbG9iYWwueSk7XG5cbiAgdmFyIHNjYWxlTG9jYXRpb25zID0gW1xuICAgIHt4OiAtNSwgeTogLTUsIHNpemU6IGljb25TaXplfSxcbiAgICB7eDogZWxlbWVudFNpemUtNSwgeTogLTUsIHNpemU6IGljb25TaXplfSxcbiAgICB7eDogLTUsIHk6IGVsZW1lbnRTaXplLTUsIHNpemU6IGljb25TaXplfSxcbiAgICB7eDogZWxlbWVudFNpemUtNSwgeTogZWxlbWVudFNpemUtNSwgc2l6ZTogaWNvblNpemV9XG4gIF07XG5cbiAgLy9tb3ZlSWNvbi5kcmF3UmVjdChlbGVtZW50U2l6ZS01LCAtNSwgMTAsIDEwKTtcbiAgLy9tb3ZlSWNvbi5kcmF3UmVjdCgtNSwgZWxlbWVudFNpemUtNSwgMTAsIDEwKTtcbiAgLy9tb3ZlSWNvbi5kcmF3UmVjdChlbGVtZW50U2l6ZS01LCBlbGVtZW50U2l6ZS01LCAxMCwgMTApO1xuXG4gIHNlbGYuc2NhbGVJY29ucyA9IFtdO1xuXG4gIHNjYWxlTG9jYXRpb25zLmZvckVhY2goZnVuY3Rpb24obG9jKSB7XG4gICAgdmFyIGljb24gPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIGljb24uaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgIGljb24uYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgaWNvbi5saW5lU3R5bGUoMSwgMHgwMDAwRkYsIDEpO1xuICAgIGljb24uYmVnaW5GaWxsKDB4MDAwMDAwLCAxKTtcbiAgICBpY29uLmRyYXdSZWN0KGxvYy54LCBsb2MueSwgbG9jLnNpemUsIGxvYy5zaXplKTtcbiAgICBpY29uLmVuZEZpbGwoKTtcblxuICAgIGljb25cbiAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBzdGFydFxuICAgICAgLm9uKCdtb3VzZWRvd24nLCBvblNjYWxlSWNvbkRyYWdTdGFydClcbiAgICAgIC5vbigndG91Y2hzdGFydCcsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KTtcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgLy8ub24oJ21vdXNldXAnLCBvbkRyYWdFbmQpXG4gICAgLy8ub24oJ21vdXNldXBvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgIC8vLm9uKCd0b3VjaGVuZCcsIG9uRHJhZ0VuZClcbiAgICAvLy5vbigndG91Y2hlbmRvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgLy8ub24oJ21vdXNlbW92ZScsIG9uRHJhZ01vdmUpXG4gICAgLy8ub24oJ3RvdWNobW92ZScsIG9uRHJhZ01vdmUpXG5cbiAgICBzZWxmLnNjYWxlSWNvbnMucHVzaChpY29uKTtcblxuICB9KTtcblxuICAvL21vdmVJY29uLmVuZEZpbGwoKTtcblxuICAvL3N0YWdlLnJlbW92ZUNoaWxkKHNlbGYpO1xuICAvL3N0YWdlLmFkZENoaWxkKGljb24pO1xuICBzZWxmLnNjYWxlSWNvbnMuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgc2VsZi5hZGRDaGlsZChzKTtcbiAgfSk7XG4gIC8vdGhpcy5hZGRDaGlsZCh0aGlzLnNjYWxlSWNvbnNbMF0pXG4gIC8vc3RhZ2UuYWRkQ2hpbGQodGhpcyk7XG5cbn1cblxuZnVuY3Rpb24gb25Nb3VzZU91dCgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBjb25zb2xlLmxvZygnTW91c2Ugb3V0Jyk7XG4gIHRoaXMuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKHMpO1xuICB9KTtcbiAgY29uc29sZS5sb2coJ1NpemU6ICcpO1xuICBjb25zb2xlLmxvZyh0aGlzLmdldEJvdW5kcygpKTtcblxufVxuXG5mdW5jdGlvbiBvblNjYWxlSWNvbkRyYWdTdGFydChldmVudCkge1xuICAvLyBzdG9yZSBhIHJlZmVyZW5jZSB0byB0aGUgZGF0YVxuICAvLyB0aGUgcmVhc29uIGZvciB0aGlzIGlzIGJlY2F1c2Ugb2YgbXVsdGl0b3VjaFxuICAvLyB3ZSB3YW50IHRvIHRyYWNrIHRoZSBtb3ZlbWVudCBvZiB0aGlzIHBhcnRpY3VsYXIgdG91Y2hcbiAgdGhpcy5kYXRhID0gZXZlbnQuZGF0YTtcbiAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgdGhpcy5kcmFnZ2luZyA9IHRydWU7XG4gIGNvbnNvbGUubG9nKCdSZXNpemluZyEnKTtcbn1cbiovXG4iLCJcbnZhciBHdWlVdGlsID0ge1xuXG4gIGdldFdpbmRvd0RpbWVuc2lvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHsgeDogd2luZG93LmlubmVyV2lkdGgsIHk6IHdpbmRvdy5pbm5lckhlaWdodCB9O1xuICB9LFxuXG4gIGRyYXdHcmlkOiBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIGdyaWQgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHZhciBpbnRlcnZhbCA9IDI1O1xuICAgIHZhciBjb3VudCA9IGludGVydmFsO1xuICAgIGdyaWQubGluZVN0eWxlKDEsIDB4RTVFNUU1LCAxKTtcbiAgICB3aGlsZSAoY291bnQgPCB3aWR0aCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oY291bnQsIDApO1xuICAgICAgZ3JpZC5saW5lVG8oY291bnQsIGhlaWdodCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIGNvdW50ID0gaW50ZXJ2YWw7XG4gICAgd2hpbGUoY291bnQgPCBoZWlnaHQpIHtcbiAgICAgIGdyaWQubW92ZVRvKDAsIGNvdW50KTtcbiAgICAgIGdyaWQubGluZVRvKHdpZHRoLCBjb3VudCk7XG4gICAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gICAgfVxuICAgIHJldHVybiBncmlkO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR3VpVXRpbDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA3LzkvMTUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuL2RyYWcuZHJvcCcpO1xudmFyIEd1aVV0aWwgPSByZXF1aXJlKCcuL2d1aS51dGlsJyk7XG5cbmZ1bmN0aW9uIHJlc2l6ZUd1aUNvbnRhaW5lcihyZW5kZXJlcikge1xuXG4gIHZhciBkaW0gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuXG4gIGNvbnNvbGUubG9nKCdSZXNpemluZy4uLicpO1xuICBjb25zb2xlLmxvZyhkaW0pO1xuXG4gICQoJyNndWlDb250YWluZXInKS5oZWlnaHQoZGltLnkpO1xuICAkKCcjZ3VpQ29udGFpbmVyJykud2lkdGgoZGltLngpO1xuXG4gIGlmKHJlbmRlcmVyKSB7XG4gICAgcmVuZGVyZXIudmlldy5zdHlsZS53aWR0aCA9IGRpbS54KydweCc7XG4gICAgcmVuZGVyZXIudmlldy5zdHlsZS5oZWlnaHQgPSBkaW0ueSsncHgnO1xuICB9XG5cbiAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIGd1aSBjb250YWluZXIuLi4nKTtcblxufVxuXG52YXIgUGl4aUVkaXRvciA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgdmFyIHdpbkRpbWVuc2lvbiA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG5cbiAgICB2YXIgcmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcih3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnkse2JhY2tncm91bmRDb2xvciA6IDB4RkZGRkZGfSk7XG4gICAgdmFyIHN0YWdlID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG4gICAgdmFyIG1ldGVyID0gbmV3IEZQU01ldGVyKCk7XG5cbiAgICBmdW5jdGlvbiBhbmltYXRlKCkge1xuICAgICAgcmVuZGVyZXIucmVuZGVyKHN0YWdlKTtcbiAgICAgIG1ldGVyLnRpY2soKTtcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkxvYWRlZCgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBc3NldHMgbG9hZGVkJyk7XG5cbiAgICAgIHZhciBBV1NfRUMyX0luc3RhbmNlID0gUElYSS5TcHJpdGUuZnJvbUZyYW1lKCdDb21wdXRlXyZfTmV0d29ya2luZ19BbWF6b25fRUMyLS0ucG5nJyk7XG4gICAgICBjb25zb2xlLmxvZygnRUMySW5zdGFuY2UnKTtcbiAgICAgIGNvbnNvbGUubG9nKEFXU19FQzJfSW5zdGFuY2UpO1xuICAgICAgQVdTX0VDMl9JbnN0YW5jZS5zY2FsZS5zZXQoMC4yKTtcbiAgICAgIEFXU19FQzJfSW5zdGFuY2UucG9zaXRpb24ueCA9IDQwMDtcbiAgICAgIEFXU19FQzJfSW5zdGFuY2UucG9zaXRpb24ueSA9IDQwMDtcbiAgICAgIEFXU19FQzJfSW5zdGFuY2UuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgQVdTX0VDMl9JbnN0YW5jZS5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICBBV1NfRUMyX0luc3RhbmNlLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgICAgQVdTX0VDMl9JbnN0YW5jZVxuICAgICAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAgICAgLm9uKCdtb3VzZWRvd24nLCBEcmFnRHJvcC5vbkRyYWdTdGFydClcbiAgICAgICAgLm9uKCd0b3VjaHN0YXJ0JywgRHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAgICAgLm9uKCdtb3VzZXVwJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgICAgICAub24oJ21vdXNldXBvdXRzaWRlJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgICAgICAub24oJ3RvdWNoZW5kJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgICAgICAub24oJ3RvdWNoZW5kb3V0c2lkZScsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIG1vdmVcbiAgICAgICAgLm9uKCdtb3VzZW1vdmUnLCBEcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgICAgICAub24oJ3RvdWNobW92ZScsIERyYWdEcm9wLm9uRHJhZ01vdmUpXG4gICAgICAgIC8vIGV2ZW50cyBmb3IgbW91c2Ugb3ZlclxuICAgICAgICAvLy5vbignbW91c2VvdmVyJywgb25Nb3VzZU92ZXIpXG4gICAgICAgIC8vLm9uKCdtb3VzZW91dCcsIG9uTW91c2VPdXQpO1xuICAgICAgc3RhZ2UuYWRkQ2hpbGQoQVdTX0VDMl9JbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgUElYSS5sb2FkZXJcbiAgICAgIC5hZGQoJy4uL3Jlc291cmNlcy9zcHJpdGVzL3Nwcml0ZXMuanNvbicpXG4gICAgICAubG9hZChvbkxvYWRlZCk7XG5cbiAgICBzdGFnZS5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgdmFyIGdyaWQgPSBzdGFnZS5hZGRDaGlsZChHdWlVdGlsLmRyYXdHcmlkKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSkpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyBsaXN0ZW5lci4uLicpO1xuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICByZXNpemVHdWlDb250YWluZXIocmVuZGVyZXIpO1xuICAgICAgd2luRGltZW5zaW9uID0gZ2V0V2luZG93RGltZW5zaW9uKCk7XG4gICAgICAvL2NvbnNvbGUubG9nKG5ld0RpbSk7XG4gICAgICBjb25zb2xlLmxvZyhzdGFnZSk7XG4gICAgICBzdGFnZS5yZW1vdmVDaGlsZChncmlkKTtcbiAgICAgIGdyaWQgPSBzdGFnZS5hZGRDaGlsZChHdWlVdGlsLmRyYXdHcmlkKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRlbXBsYXRlOiBvcHRpb25zLnRlbXBsYXRlLFxuXG4gICAgICBkcmF3Q2FudmFzRWRpdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuXG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgYW5pbWF0ZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vdmFyIGVsZW1lbnRTaXplID0gMTAwO1xuICAgICAgICAvL3Jlc2l6ZUd1aUNvbnRhaW5lcigpO1xuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKHJlbmRlcmVyLnZpZXcpO1xuICAgICAgICBhbmltYXRlKCk7XG5cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHZpZXc6IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICByZXR1cm4gbSgnI2d1aUNvbnRhaW5lcicsIHsgY29uZmlnOiBjb250cm9sbGVyLmRyYXdDYW52YXNFZGl0b3J9KVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpeGlFZGl0b3I7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcmVzaXplRWRpdG9yKGVkaXRvcikge1xuICBlZGl0b3Iuc2V0U2l6ZShudWxsLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xufVxuXG52YXIgU291cmNlRWRpdG9yID0ge1xuXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgIGRyYXdFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgdmFyIGVkaXRvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBpZihlZGl0b3IpIHtcbiAgICAgICAgICAgIGVkaXRvci5yZWZyZXNoKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVkaXRvciA9IENvZGVNaXJyb3IoZWxlbWVudCwge1xuICAgICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShvcHRpb25zLnRlbXBsYXRlKCksIHVuZGVmaW5lZCwgMiksXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgbW9kZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIGd1dHRlcnM6IFsnQ29kZU1pcnJvci1saW50LW1hcmtlcnMnXSxcbiAgICAgICAgICBsaW50OiB0cnVlLFxuICAgICAgICAgIHN0eWxlQWN0aXZlTGluZTogdHJ1ZSxcbiAgICAgICAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIHRoZW1lOiAnemVuYnVybidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzaXplRWRpdG9yKGVkaXRvcik7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlZGl0b3IpIHtcbiAgICAgICAgICBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcbiAgICAgICAgICBvcHRpb25zLnRlbXBsYXRlKEpTT04ucGFyc2UoZWRpdG9yLmdldFZhbHVlKCkpKTtcbiAgICAgICAgICBtLmVuZENvbXB1dGF0aW9uKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBbXG4gICAgICBtKCcjc291cmNlRWRpdG9yJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0VkaXRvciB9KVxuICAgIF1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb3VyY2VFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBTb3VyY2VFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvc291cmNlLmVkaXRvcicpO1xudmFyIFBpeGlFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcGl4aS5lZGl0b3InKTtcblxudmFyIHRlc3REYXRhID0gcmVxdWlyZSgnLi90ZXN0RGF0YS9lYzIuanNvbicpO1xuXG52YXIgdGVtcGxhdGUgPSBtLnByb3AodGVzdERhdGEpO1xuXG5tLm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbG91ZHNsaWNlci1hcHAnKSwgbS5jb21wb25lbnQoUGl4aUVkaXRvciwge1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB9KVxuKTtcblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZS1iYXInKSwgbS5jb21wb25lbnQoU291cmNlRWRpdG9yLCB7XG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIH0pXG4pO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIkFXU1RlbXBsYXRlRm9ybWF0VmVyc2lvblwiIDogXCIyMDEwLTA5LTA5XCIsXG5cbiAgXCJEZXNjcmlwdGlvblwiIDogXCJBV1MgQ2xvdWRGb3JtYXRpb24gU2FtcGxlIFRlbXBsYXRlIFNhbXBsZSB0ZW1wbGF0ZSBFSVBfV2l0aF9Bc3NvY2lhdGlvbjogVGhpcyB0ZW1wbGF0ZSBzaG93cyBob3cgdG8gYXNzb2NpYXRlIGFuIEVsYXN0aWMgSVAgYWRkcmVzcyB3aXRoIGFuIEFtYXpvbiBFQzIgaW5zdGFuY2UgLSB5b3UgY2FuIHVzZSB0aGlzIHNhbWUgdGVjaG5pcXVlIHRvIGFzc29jaWF0ZSBhbiBFQzIgaW5zdGFuY2Ugd2l0aCBhbiBFbGFzdGljIElQIEFkZHJlc3MgdGhhdCBpcyBub3QgY3JlYXRlZCBpbnNpZGUgdGhlIHRlbXBsYXRlIGJ5IHJlcGxhY2luZyB0aGUgRUlQIHJlZmVyZW5jZSBpbiB0aGUgQVdTOjpFQzI6OkVJUEFzc29pY2F0aW9uIHJlc291cmNlIHR5cGUgd2l0aCB0aGUgSVAgYWRkcmVzcyBvZiB0aGUgZXh0ZXJuYWwgRUlQLiAqKldBUk5JTkcqKiBUaGlzIHRlbXBsYXRlIGNyZWF0ZXMgYW4gQW1hem9uIEVDMiBpbnN0YW5jZSBhbmQgYW4gRWxhc3RpYyBJUCBBZGRyZXNzLiBZb3Ugd2lsbCBiZSBiaWxsZWQgZm9yIHRoZSBBV1MgcmVzb3VyY2VzIHVzZWQgaWYgeW91IGNyZWF0ZSBhIHN0YWNrIGZyb20gdGhpcyB0ZW1wbGF0ZS5cIixcblxuICBcIlBhcmFtZXRlcnNcIiA6IHtcbiAgICBcIkluc3RhbmNlVHlwZVwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJXZWJTZXJ2ZXIgRUMyIGluc3RhbmNlIHR5cGVcIixcbiAgICAgIFwiVHlwZVwiIDogXCJTdHJpbmdcIixcbiAgICAgIFwiRGVmYXVsdFwiIDogXCJtMS5zbWFsbFwiLFxuICAgICAgXCJBbGxvd2VkVmFsdWVzXCIgOiBbIFwidDEubWljcm9cIiwgXCJ0Mi5taWNyb1wiLCBcInQyLnNtYWxsXCIsIFwidDIubWVkaXVtXCIsIFwibTEuc21hbGxcIiwgXCJtMS5tZWRpdW1cIiwgXCJtMS5sYXJnZVwiLCBcIm0xLnhsYXJnZVwiLCBcIm0yLnhsYXJnZVwiLCBcIm0yLjJ4bGFyZ2VcIiwgXCJtMi40eGxhcmdlXCIsIFwibTMubWVkaXVtXCIsIFwibTMubGFyZ2VcIiwgXCJtMy54bGFyZ2VcIiwgXCJtMy4yeGxhcmdlXCIsIFwiYzEubWVkaXVtXCIsIFwiYzEueGxhcmdlXCIsIFwiYzMubGFyZ2VcIiwgXCJjMy54bGFyZ2VcIiwgXCJjMy4yeGxhcmdlXCIsIFwiYzMuNHhsYXJnZVwiLCBcImMzLjh4bGFyZ2VcIiwgXCJjNC5sYXJnZVwiLCBcImM0LnhsYXJnZVwiLCBcImM0LjJ4bGFyZ2VcIiwgXCJjNC40eGxhcmdlXCIsIFwiYzQuOHhsYXJnZVwiLCBcImcyLjJ4bGFyZ2VcIiwgXCJyMy5sYXJnZVwiLCBcInIzLnhsYXJnZVwiLCBcInIzLjJ4bGFyZ2VcIiwgXCJyMy40eGxhcmdlXCIsIFwicjMuOHhsYXJnZVwiLCBcImkyLnhsYXJnZVwiLCBcImkyLjJ4bGFyZ2VcIiwgXCJpMi40eGxhcmdlXCIsIFwiaTIuOHhsYXJnZVwiLCBcImQyLnhsYXJnZVwiLCBcImQyLjJ4bGFyZ2VcIiwgXCJkMi40eGxhcmdlXCIsIFwiZDIuOHhsYXJnZVwiLCBcImhpMS40eGxhcmdlXCIsIFwiaHMxLjh4bGFyZ2VcIiwgXCJjcjEuOHhsYXJnZVwiLCBcImNjMi44eGxhcmdlXCIsIFwiY2cxLjR4bGFyZ2VcIl1cbiAgICAsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIGEgdmFsaWQgRUMyIGluc3RhbmNlIHR5cGUuXCJcbiAgICB9LFxuXG4gICAgXCJLZXlOYW1lXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIk5hbWUgb2YgYW4gZXhpc3RpbmcgRUMyIEtleVBhaXIgdG8gZW5hYmxlIFNTSCBhY2Nlc3MgdG8gdGhlIGluc3RhbmNlc1wiLFxuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpLZXlQYWlyOjpLZXlOYW1lXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIHRoZSBuYW1lIG9mIGFuIGV4aXN0aW5nIEVDMiBLZXlQYWlyLlwiXG4gICAgfSxcblxuICAgIFwiU1NITG9jYXRpb25cIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiVGhlIElQIGFkZHJlc3MgcmFuZ2UgdGhhdCBjYW4gYmUgdXNlZCB0byBTU0ggdG8gdGhlIEVDMiBpbnN0YW5jZXNcIixcbiAgICAgIFwiVHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJNaW5MZW5ndGhcIjogXCI5XCIsXG4gICAgICBcIk1heExlbmd0aFwiOiBcIjE4XCIsXG4gICAgICBcIkRlZmF1bHRcIjogXCIwLjAuMC4wLzBcIixcbiAgICAgIFwiQWxsb3dlZFBhdHRlcm5cIjogXCIoXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSkvKFxcXFxkezEsMn0pXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiOiBcIm11c3QgYmUgYSB2YWxpZCBJUCBDSURSIHJhbmdlIG9mIHRoZSBmb3JtIHgueC54LngveC5cIlxuICAgIH1cbiAgfSxcblxuICBcIk1hcHBpbmdzXCIgOiB7XG4gICAgXCJBV1NJbnN0YW5jZVR5cGUyQXJjaFwiIDoge1xuICAgICAgXCJ0MS5taWNyb1wiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwidDIubWljcm9cIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInQyLnNtYWxsXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJ0Mi5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTEuc21hbGxcIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0zLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMS5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwiYzEueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcImMzLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0Ljh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJnMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNRzJcIiAgfSxcbiAgICAgIFwicjMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImhpMS40eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJoczEuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiY3IxLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImNjMi44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9XG4gICAgfVxuICAsXG4gICAgXCJBV1NSZWdpb25BcmNoMkFNSVwiIDoge1xuICAgICAgXCJ1cy1lYXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS0wZjRjZmQ2NFwiLCBcIkhWTTY0XCIgOiBcImFtaS0wZDRjZmQ2NlwiLCBcIkhWTUcyXCIgOiBcImFtaS01YjA1YmEzMFwifSxcbiAgICAgIFwidXMtd2VzdC0yXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktZDNjNWQxZTNcIiwgXCJIVk02NFwiIDogXCJhbWktZDVjNWQxZTVcIiwgXCJIVk1HMlwiIDogXCJhbWktYTlkNmMwOTlcIn0sXG4gICAgICBcInVzLXdlc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTg1ZWExM2MxXCIsIFwiSFZNNjRcIiA6IFwiYW1pLTg3ZWExM2MzXCIsIFwiSFZNRzJcIiA6IFwiYW1pLTM3ODI3YTczXCJ9LFxuICAgICAgXCJldS13ZXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kNmQxOGVhMVwiLCBcIkhWTTY0XCIgOiBcImFtaS1lNGQxOGU5M1wiLCBcIkhWTUcyXCIgOiBcImFtaS03MmE5ZjEwNVwifSxcbiAgICAgIFwiZXUtY2VudHJhbC0xXCIgICAgIDoge1wiUFY2NFwiIDogXCJhbWktYTRiMGI3YjlcIiwgXCJIVk02NFwiIDogXCJhbWktYTZiMGI3YmJcIiwgXCJIVk1HMlwiIDogXCJhbWktYTZjOWNmYmJcIn0sXG4gICAgICBcImFwLW5vcnRoZWFzdC0xXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTFhMWI5ZjFhXCIsIFwiSFZNNjRcIiA6IFwiYW1pLTFjMWI5ZjFjXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWY2NDRjNGY2XCJ9LFxuICAgICAgXCJhcC1zb3V0aGVhc3QtMVwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kMjRiNDI4MFwiLCBcIkhWTTY0XCIgOiBcImFtaS1kNDRiNDI4NlwiLCBcIkhWTUcyXCIgOiBcImFtaS0xMmI1YmM0MFwifSxcbiAgICAgIFwiYXAtc291dGhlYXN0LTJcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktZWY3YjM5ZDVcIiwgXCJIVk02NFwiIDogXCJhbWktZGI3YjM5ZTFcIiwgXCJIVk1HMlwiIDogXCJhbWktYjMzMzdlODlcIn0sXG4gICAgICBcInNhLWVhc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTViMDk4MTQ2XCIsIFwiSFZNNjRcIiA6IFwiYW1pLTU1MDk4MTQ4XCIsIFwiSFZNRzJcIiA6IFwiTk9UX1NVUFBPUlRFRFwifSxcbiAgICAgIFwiY24tbm9ydGgtMVwiICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktYmVjNDU4ODdcIiwgXCJIVk02NFwiIDogXCJhbWktYmNjNDU4ODVcIiwgXCJIVk1HMlwiIDogXCJOT1RfU1VQUE9SVEVEXCJ9XG4gICAgfVxuXG4gIH0sXG5cbiAgXCJSZXNvdXJjZXNcIiA6IHtcbiAgICBcIkVDMkluc3RhbmNlXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6Okluc3RhbmNlXCIsXG4gICAgICBcIlByb3BlcnRpZXNcIiA6IHtcbiAgICAgICAgXCJVc2VyRGF0YVwiIDogeyBcIkZuOjpCYXNlNjRcIiA6IHsgXCJGbjo6Sm9pblwiIDogWyBcIlwiLCBbIFwiSVBBZGRyZXNzPVwiLCB7XCJSZWZcIiA6IFwiSVBBZGRyZXNzXCJ9XV19fSxcbiAgICAgICAgXCJJbnN0YW5jZVR5cGVcIiA6IHsgXCJSZWZcIiA6IFwiSW5zdGFuY2VUeXBlXCIgfSxcbiAgICAgICAgXCJTZWN1cml0eUdyb3Vwc1wiIDogWyB7IFwiUmVmXCIgOiBcIkluc3RhbmNlU2VjdXJpdHlHcm91cFwiIH0gXSxcbiAgICAgICAgXCJLZXlOYW1lXCIgOiB7IFwiUmVmXCIgOiBcIktleU5hbWVcIiB9LFxuICAgICAgICBcIkltYWdlSWRcIiA6IHsgXCJGbjo6RmluZEluTWFwXCIgOiBbIFwiQVdTUmVnaW9uQXJjaDJBTUlcIiwgeyBcIlJlZlwiIDogXCJBV1M6OlJlZ2lvblwiIH0sXG4gICAgICAgICAgeyBcIkZuOjpGaW5kSW5NYXBcIiA6IFsgXCJBV1NJbnN0YW5jZVR5cGUyQXJjaFwiLCB7IFwiUmVmXCIgOiBcIkluc3RhbmNlVHlwZVwiIH0sIFwiQXJjaFwiIF0gfSBdIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJJbnN0YW5jZVNlY3VyaXR5R3JvdXBcIiA6IHtcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6U2VjdXJpdHlHcm91cFwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiR3JvdXBEZXNjcmlwdGlvblwiIDogXCJFbmFibGUgU1NIIGFjY2Vzc1wiLFxuICAgICAgICBcIlNlY3VyaXR5R3JvdXBJbmdyZXNzXCIgOlxuICAgICAgICBbIHsgXCJJcFByb3RvY29sXCIgOiBcInRjcFwiLCBcIkZyb21Qb3J0XCIgOiBcIjIyXCIsIFwiVG9Qb3J0XCIgOiBcIjIyXCIsIFwiQ2lkcklwXCIgOiB7IFwiUmVmXCIgOiBcIlNTSExvY2F0aW9uXCJ9IH1dXG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiSVBBZGRyZXNzXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6OkVJUFwiXG4gICAgfSxcblxuICAgIFwiSVBBc3NvY1wiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpFSVBBc3NvY2lhdGlvblwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiSW5zdGFuY2VJZFwiIDogeyBcIlJlZlwiIDogXCJFQzJJbnN0YW5jZVwiIH0sXG4gICAgICAgIFwiRUlQXCIgOiB7IFwiUmVmXCIgOiBcIklQQWRkcmVzc1wiIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFwiT3V0cHV0c1wiIDoge1xuICAgIFwiSW5zdGFuY2VJZFwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJJbnN0YW5jZUlkIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIlJlZlwiIDogXCJFQzJJbnN0YW5jZVwiIH1cbiAgICB9LFxuICAgIFwiSW5zdGFuY2VJUEFkZHJlc3NcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiSVAgYWRkcmVzcyBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJSZWZcIiA6IFwiSVBBZGRyZXNzXCIgfVxuICAgIH1cbiAgfVxufVxuIl19
