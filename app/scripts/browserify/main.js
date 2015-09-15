(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/pixi.editor.js":[function(require,module,exports){
/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

function getWindowDimension() {
  return { x: window.innerWidth, y: window.innerHeight };
}

function resizeGuiContainer(renderer) {

  var dim = getWindowDimension();

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

function drawGrid(width, height) {
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

function onDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
}

function onDragEnd() {
  this.alpha = 1;

  this.dragging = false;

  // set the interaction data to null
  this.data = null;
}

function onDragMove() {
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

/*
 var elements = [];
 var el1 = createElement('el1', 100, 100);
 var el2 = createElement('el2', 200, 200);
 var el3 = createElement('el3', 300, 300);
 elements.push(el1);
 elements.push(el2);
 elements.push(el3);

 elements.forEach(function(element) {
 console.log(element.name);
 console.log(element.position);
 console.log(element.height + ':' + element.width);
 stage.addChild(element);
 });
 */

function draw() {

}

var PixiEditor = {
  controller: function(options) {

    var winDimension = getWindowDimension();

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
        .on('mousedown', onDragStart)
        .on('touchstart', onDragStart)
        // events for drag end
        .on('mouseup', onDragEnd)
        .on('mouseupoutside', onDragEnd)
        .on('touchend', onDragEnd)
        .on('touchendoutside', onDragEnd)
        // events for drag move
        .on('mousemove', onDragMove)
        .on('touchmove', onDragMove)
        // events for mouse over
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseOut);
      stage.addChild(AWS_EC2_Instance);
    }

    PIXI.loader
      .add('../resources/sprites/sprites.json')
      .load(onLoaded);

    return {
      template: options.template,

      drawCanvasEditor: function (element, isInitialized, context) {

        if (isInitialized) {
          animate();
          return;
        }

        //var elementSize = 100;

        stage.interactive = true;
        var grid = stage.addChild(drawGrid(winDimension.x, winDimension.y));

        //resizeGuiContainer();

        element.appendChild(renderer.view);

        $(window).resize(function() {
          console.log('Adding listener...');
          resizeGuiContainer(renderer);
          winDimension = getWindowDimension();
          //console.log(newDim);
          console.log(stage);
          stage.removeChild(grid);
          grid = stage.addChild(drawGrid(winDimension.x, winDimension.y));
        });

        animate();

      }
    }
  },
  view: function(controller) {
    return m('#guiContainer', { config: controller.drawCanvasEditor})
  }
};

module.exports = PixiEditor;

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js":[function(require,module,exports){
/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var jsonlint = require('jsonlint');

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
          value: options.template(),
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
          options.template(editor.getValue());
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
var template = m.prop(JSON.stringify(testData, undefined, 2));

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL3BpeGkuZWRpdG9yLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9zb3VyY2UuZWRpdG9yLmpzIiwiYXBwL3NjcmlwdHMvbWFpbi5qcyIsImFwcC9zY3JpcHRzL3Rlc3REYXRhL2VjMi5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gZ2V0V2luZG93RGltZW5zaW9uKCkge1xuICByZXR1cm4geyB4OiB3aW5kb3cuaW5uZXJXaWR0aCwgeTogd2luZG93LmlubmVySGVpZ2h0IH07XG59XG5cbmZ1bmN0aW9uIHJlc2l6ZUd1aUNvbnRhaW5lcihyZW5kZXJlcikge1xuXG4gIHZhciBkaW0gPSBnZXRXaW5kb3dEaW1lbnNpb24oKTtcblxuICBjb25zb2xlLmxvZygnUmVzaXppbmcuLi4nKTtcbiAgY29uc29sZS5sb2coZGltKTtcblxuICAkKCcjZ3VpQ29udGFpbmVyJykuaGVpZ2h0KGRpbS55KTtcbiAgJCgnI2d1aUNvbnRhaW5lcicpLndpZHRoKGRpbS54KTtcblxuICBpZihyZW5kZXJlcikge1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUud2lkdGggPSBkaW0ueCsncHgnO1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUuaGVpZ2h0ID0gZGltLnkrJ3B4JztcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdSZXNpemluZyBndWkgY29udGFpbmVyLi4uJyk7XG5cbn1cblxuZnVuY3Rpb24gZHJhd0dyaWQod2lkdGgsIGhlaWdodCkge1xuICB2YXIgZ3JpZCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gIHZhciBpbnRlcnZhbCA9IDI1O1xuICB2YXIgY291bnQgPSBpbnRlcnZhbDtcbiAgZ3JpZC5saW5lU3R5bGUoMSwgMHhFNUU1RTUsIDEpO1xuICB3aGlsZSAoY291bnQgPCB3aWR0aCkge1xuICAgIGdyaWQubW92ZVRvKGNvdW50LCAwKTtcbiAgICBncmlkLmxpbmVUbyhjb3VudCwgaGVpZ2h0KTtcbiAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gIH1cbiAgY291bnQgPSBpbnRlcnZhbDtcbiAgd2hpbGUoY291bnQgPCBoZWlnaHQpIHtcbiAgICBncmlkLm1vdmVUbygwLCBjb3VudCk7XG4gICAgZ3JpZC5saW5lVG8od2lkdGgsIGNvdW50KTtcbiAgICBjb3VudCA9IGNvdW50ICsgaW50ZXJ2YWw7XG4gIH1cbiAgcmV0dXJuIGdyaWQ7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ1N0YXJ0KGV2ZW50KSB7XG4gIC8vIHN0b3JlIGEgcmVmZXJlbmNlIHRvIHRoZSBkYXRhXG4gIC8vIHRoZSByZWFzb24gZm9yIHRoaXMgaXMgYmVjYXVzZSBvZiBtdWx0aXRvdWNoXG4gIC8vIHdlIHdhbnQgdG8gdHJhY2sgdGhlIG1vdmVtZW50IG9mIHRoaXMgcGFydGljdWxhciB0b3VjaFxuICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICB0aGlzLmFscGhhID0gMC41O1xuICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gb25EcmFnRW5kKCkge1xuICB0aGlzLmFscGhhID0gMTtcblxuICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG5cbiAgLy8gc2V0IHRoZSBpbnRlcmFjdGlvbiBkYXRhIHRvIG51bGxcbiAgdGhpcy5kYXRhID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gb25EcmFnTW92ZSgpIHtcbiAgaWYgKHRoaXMuZHJhZ2dpbmcpXG4gIHtcbiAgICB2YXIgZ2xvYmFsID0gdGhpcy50b0dsb2JhbCh0aGlzLnBhcmVudCk7XG4gICAgdmFyIGxvY2FsID0gdGhpcy50b0xvY2FsKHRoaXMucGFyZW50KTtcbiAgICBjb25zb2xlLmxvZygneDogJyArIHRoaXMueCArICcgeTogJyArIHRoaXMueSk7XG4gICAgY29uc29sZS5sb2coJ3RoaXM6ICcgKyB0aGlzLngrXCI6XCIrdGhpcy55ICsgXCIsIGdsb2JhbDogXCIgKyBnbG9iYWwueCArIFwiOlwiICsgZ2xvYmFsLnkgKyBcIiwgbG9jYWw6IFwiICsgbG9jYWwueCArIFwiOlwiICsgbG9jYWwueSk7XG4gICAgLy9jb25zb2xlLmxvZygnd2lkdGg6ICcgKyB0aGlzLndpZHRoICsgJyBoZWlnaHQ6ICcgKyB0aGlzLmhlaWdodCk7XG4gICAgdmFyIG5ld1Bvc2l0aW9uID0gdGhpcy5kYXRhLmdldExvY2FsUG9zaXRpb24odGhpcy5wYXJlbnQpO1xuICAgIGNvbnNvbGUubG9nKCdORVc6ICcgKyBuZXdQb3NpdGlvbi54ICsgJzonICsgbmV3UG9zaXRpb24ueSk7XG4gICAgdmFyIGxvY2FsID0gdGhpcy50b0xvY2FsKHRoaXMuZGF0YSk7XG4gICAgY29uc29sZS5sb2coJ0xPQ0FMOiAnICsgbG9jYWwueCArICc6JyArIGxvY2FsLnkpO1xuICAgIHRoaXMucG9zaXRpb24ueCA9IG5ld1Bvc2l0aW9uLng7XG4gICAgdGhpcy5wb3NpdGlvbi55ID0gbmV3UG9zaXRpb24ueTtcbiAgICAvL3RoaXMubW92ZVRvKG5ld1Bvc2l0aW9uLngsIG5ld1Bvc2l0aW9uLnkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VPdmVyKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHZhciBpY29uU2l6ZSA9IDEwO1xuXG4gIGNvbnNvbGUubG9nKCdNb3VzZSBvdmVyJyk7XG4gIHZhciBnbG9iYWwgPSBzZWxmLnRvR2xvYmFsKHNlbGYucGFyZW50KTtcbiAgY29uc29sZS5sb2coJ0dMT0JBTDogJyArIGdsb2JhbC54ICsgJzonICsgZ2xvYmFsLnkpO1xuXG4gIHZhciBzY2FsZUxvY2F0aW9ucyA9IFtcbiAgICB7eDogLTUsIHk6IC01LCBzaXplOiBpY29uU2l6ZX0sXG4gICAge3g6IGVsZW1lbnRTaXplLTUsIHk6IC01LCBzaXplOiBpY29uU2l6ZX0sXG4gICAge3g6IC01LCB5OiBlbGVtZW50U2l6ZS01LCBzaXplOiBpY29uU2l6ZX0sXG4gICAge3g6IGVsZW1lbnRTaXplLTUsIHk6IGVsZW1lbnRTaXplLTUsIHNpemU6IGljb25TaXplfVxuICBdO1xuXG4gIC8vbW92ZUljb24uZHJhd1JlY3QoZWxlbWVudFNpemUtNSwgLTUsIDEwLCAxMCk7XG4gIC8vbW92ZUljb24uZHJhd1JlY3QoLTUsIGVsZW1lbnRTaXplLTUsIDEwLCAxMCk7XG4gIC8vbW92ZUljb24uZHJhd1JlY3QoZWxlbWVudFNpemUtNSwgZWxlbWVudFNpemUtNSwgMTAsIDEwKTtcblxuICBzZWxmLnNjYWxlSWNvbnMgPSBbXTtcblxuICBzY2FsZUxvY2F0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKGxvYykge1xuICAgIHZhciBpY29uID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICBpY29uLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICBpY29uLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICAgIGljb24ubGluZVN0eWxlKDEsIDB4MDAwMEZGLCAxKTtcbiAgICBpY29uLmJlZ2luRmlsbCgweDAwMDAwMCwgMSk7XG4gICAgaWNvbi5kcmF3UmVjdChsb2MueCwgbG9jLnksIGxvYy5zaXplLCBsb2Muc2l6ZSk7XG4gICAgaWNvbi5lbmRGaWxsKCk7XG5cbiAgICBpY29uXG4gICAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAgIC5vbignbW91c2Vkb3duJywgb25TY2FsZUljb25EcmFnU3RhcnQpXG4gICAgICAub24oJ3RvdWNoc3RhcnQnLCBvblNjYWxlSWNvbkRyYWdTdGFydCk7XG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIGVuZFxuICAgIC8vLm9uKCdtb3VzZXVwJywgb25EcmFnRW5kKVxuICAgIC8vLm9uKCdtb3VzZXVwb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAvLy5vbigndG91Y2hlbmQnLCBvbkRyYWdFbmQpXG4gICAgLy8ub24oJ3RvdWNoZW5kb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgIC8vLm9uKCdtb3VzZW1vdmUnLCBvbkRyYWdNb3ZlKVxuICAgIC8vLm9uKCd0b3VjaG1vdmUnLCBvbkRyYWdNb3ZlKVxuXG4gICAgc2VsZi5zY2FsZUljb25zLnB1c2goaWNvbik7XG5cbiAgfSk7XG5cbiAgLy9tb3ZlSWNvbi5lbmRGaWxsKCk7XG5cbiAgLy9zdGFnZS5yZW1vdmVDaGlsZChzZWxmKTtcbiAgLy9zdGFnZS5hZGRDaGlsZChpY29uKTtcbiAgc2VsZi5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgIHNlbGYuYWRkQ2hpbGQocyk7XG4gIH0pO1xuICAvL3RoaXMuYWRkQ2hpbGQodGhpcy5zY2FsZUljb25zWzBdKVxuICAvL3N0YWdlLmFkZENoaWxkKHRoaXMpO1xuXG59XG5cbmZ1bmN0aW9uIG9uTW91c2VPdXQoKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgY29uc29sZS5sb2coJ01vdXNlIG91dCcpO1xuICB0aGlzLnNjYWxlSWNvbnMuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgc2VsZi5yZW1vdmVDaGlsZChzKTtcbiAgfSk7XG4gIGNvbnNvbGUubG9nKCdTaXplOiAnKTtcbiAgY29uc29sZS5sb2codGhpcy5nZXRCb3VuZHMoKSk7XG5cbn1cblxuZnVuY3Rpb24gb25TY2FsZUljb25EcmFnU3RhcnQoZXZlbnQpIHtcbiAgLy8gc3RvcmUgYSByZWZlcmVuY2UgdG8gdGhlIGRhdGFcbiAgLy8gdGhlIHJlYXNvbiBmb3IgdGhpcyBpcyBiZWNhdXNlIG9mIG11bHRpdG91Y2hcbiAgLy8gd2Ugd2FudCB0byB0cmFjayB0aGUgbW92ZW1lbnQgb2YgdGhpcyBwYXJ0aWN1bGFyIHRvdWNoXG4gIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gIHRoaXMuYWxwaGEgPSAwLjU7XG4gIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICBjb25zb2xlLmxvZygnUmVzaXppbmchJyk7XG59XG5cbi8qXG4gdmFyIGVsZW1lbnRzID0gW107XG4gdmFyIGVsMSA9IGNyZWF0ZUVsZW1lbnQoJ2VsMScsIDEwMCwgMTAwKTtcbiB2YXIgZWwyID0gY3JlYXRlRWxlbWVudCgnZWwyJywgMjAwLCAyMDApO1xuIHZhciBlbDMgPSBjcmVhdGVFbGVtZW50KCdlbDMnLCAzMDAsIDMwMCk7XG4gZWxlbWVudHMucHVzaChlbDEpO1xuIGVsZW1lbnRzLnB1c2goZWwyKTtcbiBlbGVtZW50cy5wdXNoKGVsMyk7XG5cbiBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiBjb25zb2xlLmxvZyhlbGVtZW50Lm5hbWUpO1xuIGNvbnNvbGUubG9nKGVsZW1lbnQucG9zaXRpb24pO1xuIGNvbnNvbGUubG9nKGVsZW1lbnQuaGVpZ2h0ICsgJzonICsgZWxlbWVudC53aWR0aCk7XG4gc3RhZ2UuYWRkQ2hpbGQoZWxlbWVudCk7XG4gfSk7XG4gKi9cblxuZnVuY3Rpb24gZHJhdygpIHtcblxufVxuXG52YXIgUGl4aUVkaXRvciA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgdmFyIHdpbkRpbWVuc2lvbiA9IGdldFdpbmRvd0RpbWVuc2lvbigpO1xuXG4gICAgdmFyIHJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIod2luRGltZW5zaW9uLngsIHdpbkRpbWVuc2lvbi55LHtiYWNrZ3JvdW5kQ29sb3IgOiAweEZGRkZGRn0pO1xuICAgIHZhciBzdGFnZSA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICAgIHZhciBtZXRlciA9IG5ldyBGUFNNZXRlcigpO1xuXG4gICAgZnVuY3Rpb24gYW5pbWF0ZSgpIHtcbiAgICAgIHJlbmRlcmVyLnJlbmRlcihzdGFnZSk7XG4gICAgICBtZXRlci50aWNrKCk7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Mb2FkZWQoKSB7XG4gICAgICBjb25zb2xlLmxvZygnQXNzZXRzIGxvYWRlZCcpO1xuXG4gICAgICB2YXIgQVdTX0VDMl9JbnN0YW5jZSA9IFBJWEkuU3ByaXRlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMi0tLnBuZycpO1xuICAgICAgY29uc29sZS5sb2coJ0VDMkluc3RhbmNlJyk7XG4gICAgICBjb25zb2xlLmxvZyhBV1NfRUMyX0luc3RhbmNlKTtcbiAgICAgIEFXU19FQzJfSW5zdGFuY2Uuc2NhbGUuc2V0KDAuMik7XG4gICAgICBBV1NfRUMyX0luc3RhbmNlLnBvc2l0aW9uLnggPSA0MDA7XG4gICAgICBBV1NfRUMyX0luc3RhbmNlLnBvc2l0aW9uLnkgPSA0MDA7XG4gICAgICBBV1NfRUMyX0luc3RhbmNlLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIEFXU19FQzJfSW5zdGFuY2UuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgQVdTX0VDMl9JbnN0YW5jZS5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICAgIEFXU19FQzJfSW5zdGFuY2VcbiAgICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgICAgIC5vbignbW91c2Vkb3duJywgb25EcmFnU3RhcnQpXG4gICAgICAgIC5vbigndG91Y2hzdGFydCcsIG9uRHJhZ1N0YXJ0KVxuICAgICAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgICAgIC5vbignbW91c2V1cCcsIG9uRHJhZ0VuZClcbiAgICAgICAgLm9uKCdtb3VzZXVwb3V0c2lkZScsIG9uRHJhZ0VuZClcbiAgICAgICAgLm9uKCd0b3VjaGVuZCcsIG9uRHJhZ0VuZClcbiAgICAgICAgLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgICAgIC5vbignbW91c2Vtb3ZlJywgb25EcmFnTW92ZSlcbiAgICAgICAgLm9uKCd0b3VjaG1vdmUnLCBvbkRyYWdNb3ZlKVxuICAgICAgICAvLyBldmVudHMgZm9yIG1vdXNlIG92ZXJcbiAgICAgICAgLm9uKCdtb3VzZW92ZXInLCBvbk1vdXNlT3ZlcilcbiAgICAgICAgLm9uKCdtb3VzZW91dCcsIG9uTW91c2VPdXQpO1xuICAgICAgc3RhZ2UuYWRkQ2hpbGQoQVdTX0VDMl9JbnN0YW5jZSk7XG4gICAgfVxuXG4gICAgUElYSS5sb2FkZXJcbiAgICAgIC5hZGQoJy4uL3Jlc291cmNlcy9zcHJpdGVzL3Nwcml0ZXMuanNvbicpXG4gICAgICAubG9hZChvbkxvYWRlZCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGVtcGxhdGU6IG9wdGlvbnMudGVtcGxhdGUsXG5cbiAgICAgIGRyYXdDYW52YXNFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBhbmltYXRlKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy92YXIgZWxlbWVudFNpemUgPSAxMDA7XG5cbiAgICAgICAgc3RhZ2UuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgICB2YXIgZ3JpZCA9IHN0YWdlLmFkZENoaWxkKGRyYXdHcmlkKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSkpO1xuXG4gICAgICAgIC8vcmVzaXplR3VpQ29udGFpbmVyKCk7XG5cbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChyZW5kZXJlci52aWV3KTtcblxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdBZGRpbmcgbGlzdGVuZXIuLi4nKTtcbiAgICAgICAgICByZXNpemVHdWlDb250YWluZXIocmVuZGVyZXIpO1xuICAgICAgICAgIHdpbkRpbWVuc2lvbiA9IGdldFdpbmRvd0RpbWVuc2lvbigpO1xuICAgICAgICAgIC8vY29uc29sZS5sb2cobmV3RGltKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhzdGFnZSk7XG4gICAgICAgICAgc3RhZ2UucmVtb3ZlQ2hpbGQoZ3JpZCk7XG4gICAgICAgICAgZ3JpZCA9IHN0YWdlLmFkZENoaWxkKGRyYXdHcmlkKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBhbmltYXRlKCk7XG5cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHZpZXc6IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICByZXR1cm4gbSgnI2d1aUNvbnRhaW5lcicsIHsgY29uZmlnOiBjb250cm9sbGVyLmRyYXdDYW52YXNFZGl0b3J9KVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpeGlFZGl0b3I7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy92YXIganNvbmxpbnQgPSByZXF1aXJlKCdqc29ubGludCcpO1xuXG5mdW5jdGlvbiByZXNpemVFZGl0b3IoZWRpdG9yKSB7XG4gIGVkaXRvci5zZXRTaXplKG51bGwsIHdpbmRvdy5pbm5lckhlaWdodCk7XG59XG5cbnZhciBTb3VyY2VFZGl0b3IgPSB7XG5cbiAgY29udHJvbGxlcjogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgZHJhd0VkaXRvcjogZnVuY3Rpb24gKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcblxuICAgICAgICB2YXIgZWRpdG9yID0gbnVsbDtcblxuICAgICAgICBpZiAoaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgIGlmKGVkaXRvcikge1xuICAgICAgICAgICAgZWRpdG9yLnJlZnJlc2goKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWRpdG9yID0gQ29kZU1pcnJvcihlbGVtZW50LCB7XG4gICAgICAgICAgdmFsdWU6IG9wdGlvbnMudGVtcGxhdGUoKSxcbiAgICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICBtb2RlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgZ3V0dGVyczogWydDb2RlTWlycm9yLWxpbnQtbWFya2VycyddLFxuICAgICAgICAgIGxpbnQ6IHRydWUsXG4gICAgICAgICAgc3R5bGVBY3RpdmVMaW5lOiB0cnVlLFxuICAgICAgICAgIGF1dG9DbG9zZUJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIG1hdGNoQnJhY2tldHM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICd6ZW5idXJuJ1xuICAgICAgICB9KTtcblxuICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcblxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJlc2l6ZUVkaXRvcihlZGl0b3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGVkaXRvcikge1xuICAgICAgICAgIG0uc3RhcnRDb21wdXRhdGlvbigpO1xuICAgICAgICAgIG9wdGlvbnMudGVtcGxhdGUoZWRpdG9yLmdldFZhbHVlKCkpO1xuICAgICAgICAgIG0uZW5kQ29tcHV0YXRpb24oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICB2aWV3OiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG0oJyNzb3VyY2VFZGl0b3InLCB7IGNvbmZpZzogY29udHJvbGxlci5kcmF3RWRpdG9yIH0pXG4gICAgXVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNvdXJjZUVkaXRvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFNvdXJjZUVkaXRvciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9zb3VyY2UuZWRpdG9yJyk7XG52YXIgUGl4aUVkaXRvciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9waXhpLmVkaXRvcicpO1xuXG52YXIgdGVzdERhdGEgPSByZXF1aXJlKCcuL3Rlc3REYXRhL2VjMi5qc29uJyk7XG52YXIgdGVtcGxhdGUgPSBtLnByb3AoSlNPTi5zdHJpbmdpZnkodGVzdERhdGEsIHVuZGVmaW5lZCwgMikpO1xuXG5tLm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbG91ZHNsaWNlci1hcHAnKSwgbS5jb21wb25lbnQoUGl4aUVkaXRvciwge1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB9KVxuKTtcblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZS1iYXInKSwgbS5jb21wb25lbnQoU291cmNlRWRpdG9yLCB7XG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIH0pXG4pO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIkFXU1RlbXBsYXRlRm9ybWF0VmVyc2lvblwiIDogXCIyMDEwLTA5LTA5XCIsXG5cbiAgXCJEZXNjcmlwdGlvblwiIDogXCJBV1MgQ2xvdWRGb3JtYXRpb24gU2FtcGxlIFRlbXBsYXRlIFNhbXBsZSB0ZW1wbGF0ZSBFSVBfV2l0aF9Bc3NvY2lhdGlvbjogVGhpcyB0ZW1wbGF0ZSBzaG93cyBob3cgdG8gYXNzb2NpYXRlIGFuIEVsYXN0aWMgSVAgYWRkcmVzcyB3aXRoIGFuIEFtYXpvbiBFQzIgaW5zdGFuY2UgLSB5b3UgY2FuIHVzZSB0aGlzIHNhbWUgdGVjaG5pcXVlIHRvIGFzc29jaWF0ZSBhbiBFQzIgaW5zdGFuY2Ugd2l0aCBhbiBFbGFzdGljIElQIEFkZHJlc3MgdGhhdCBpcyBub3QgY3JlYXRlZCBpbnNpZGUgdGhlIHRlbXBsYXRlIGJ5IHJlcGxhY2luZyB0aGUgRUlQIHJlZmVyZW5jZSBpbiB0aGUgQVdTOjpFQzI6OkVJUEFzc29pY2F0aW9uIHJlc291cmNlIHR5cGUgd2l0aCB0aGUgSVAgYWRkcmVzcyBvZiB0aGUgZXh0ZXJuYWwgRUlQLiAqKldBUk5JTkcqKiBUaGlzIHRlbXBsYXRlIGNyZWF0ZXMgYW4gQW1hem9uIEVDMiBpbnN0YW5jZSBhbmQgYW4gRWxhc3RpYyBJUCBBZGRyZXNzLiBZb3Ugd2lsbCBiZSBiaWxsZWQgZm9yIHRoZSBBV1MgcmVzb3VyY2VzIHVzZWQgaWYgeW91IGNyZWF0ZSBhIHN0YWNrIGZyb20gdGhpcyB0ZW1wbGF0ZS5cIixcblxuICBcIlBhcmFtZXRlcnNcIiA6IHtcbiAgICBcIkluc3RhbmNlVHlwZVwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJXZWJTZXJ2ZXIgRUMyIGluc3RhbmNlIHR5cGVcIixcbiAgICAgIFwiVHlwZVwiIDogXCJTdHJpbmdcIixcbiAgICAgIFwiRGVmYXVsdFwiIDogXCJtMS5zbWFsbFwiLFxuICAgICAgXCJBbGxvd2VkVmFsdWVzXCIgOiBbIFwidDEubWljcm9cIiwgXCJ0Mi5taWNyb1wiLCBcInQyLnNtYWxsXCIsIFwidDIubWVkaXVtXCIsIFwibTEuc21hbGxcIiwgXCJtMS5tZWRpdW1cIiwgXCJtMS5sYXJnZVwiLCBcIm0xLnhsYXJnZVwiLCBcIm0yLnhsYXJnZVwiLCBcIm0yLjJ4bGFyZ2VcIiwgXCJtMi40eGxhcmdlXCIsIFwibTMubWVkaXVtXCIsIFwibTMubGFyZ2VcIiwgXCJtMy54bGFyZ2VcIiwgXCJtMy4yeGxhcmdlXCIsIFwiYzEubWVkaXVtXCIsIFwiYzEueGxhcmdlXCIsIFwiYzMubGFyZ2VcIiwgXCJjMy54bGFyZ2VcIiwgXCJjMy4yeGxhcmdlXCIsIFwiYzMuNHhsYXJnZVwiLCBcImMzLjh4bGFyZ2VcIiwgXCJjNC5sYXJnZVwiLCBcImM0LnhsYXJnZVwiLCBcImM0LjJ4bGFyZ2VcIiwgXCJjNC40eGxhcmdlXCIsIFwiYzQuOHhsYXJnZVwiLCBcImcyLjJ4bGFyZ2VcIiwgXCJyMy5sYXJnZVwiLCBcInIzLnhsYXJnZVwiLCBcInIzLjJ4bGFyZ2VcIiwgXCJyMy40eGxhcmdlXCIsIFwicjMuOHhsYXJnZVwiLCBcImkyLnhsYXJnZVwiLCBcImkyLjJ4bGFyZ2VcIiwgXCJpMi40eGxhcmdlXCIsIFwiaTIuOHhsYXJnZVwiLCBcImQyLnhsYXJnZVwiLCBcImQyLjJ4bGFyZ2VcIiwgXCJkMi40eGxhcmdlXCIsIFwiZDIuOHhsYXJnZVwiLCBcImhpMS40eGxhcmdlXCIsIFwiaHMxLjh4bGFyZ2VcIiwgXCJjcjEuOHhsYXJnZVwiLCBcImNjMi44eGxhcmdlXCIsIFwiY2cxLjR4bGFyZ2VcIl1cbiAgICAsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIGEgdmFsaWQgRUMyIGluc3RhbmNlIHR5cGUuXCJcbiAgICB9LFxuXG4gICAgXCJLZXlOYW1lXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIk5hbWUgb2YgYW4gZXhpc3RpbmcgRUMyIEtleVBhaXIgdG8gZW5hYmxlIFNTSCBhY2Nlc3MgdG8gdGhlIGluc3RhbmNlc1wiLFxuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpLZXlQYWlyOjpLZXlOYW1lXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIHRoZSBuYW1lIG9mIGFuIGV4aXN0aW5nIEVDMiBLZXlQYWlyLlwiXG4gICAgfSxcblxuICAgIFwiU1NITG9jYXRpb25cIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiVGhlIElQIGFkZHJlc3MgcmFuZ2UgdGhhdCBjYW4gYmUgdXNlZCB0byBTU0ggdG8gdGhlIEVDMiBpbnN0YW5jZXNcIixcbiAgICAgIFwiVHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJNaW5MZW5ndGhcIjogXCI5XCIsXG4gICAgICBcIk1heExlbmd0aFwiOiBcIjE4XCIsXG4gICAgICBcIkRlZmF1bHRcIjogXCIwLjAuMC4wLzBcIixcbiAgICAgIFwiQWxsb3dlZFBhdHRlcm5cIjogXCIoXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSkvKFxcXFxkezEsMn0pXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiOiBcIm11c3QgYmUgYSB2YWxpZCBJUCBDSURSIHJhbmdlIG9mIHRoZSBmb3JtIHgueC54LngveC5cIlxuICAgIH1cbiAgfSxcblxuICBcIk1hcHBpbmdzXCIgOiB7XG4gICAgXCJBV1NJbnN0YW5jZVR5cGUyQXJjaFwiIDoge1xuICAgICAgXCJ0MS5taWNyb1wiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwidDIubWljcm9cIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInQyLnNtYWxsXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJ0Mi5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTEuc21hbGxcIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0zLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMS5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwiYzEueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcImMzLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0Ljh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJnMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNRzJcIiAgfSxcbiAgICAgIFwicjMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImhpMS40eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJoczEuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiY3IxLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImNjMi44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9XG4gICAgfVxuICAsXG4gICAgXCJBV1NSZWdpb25BcmNoMkFNSVwiIDoge1xuICAgICAgXCJ1cy1lYXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS0wZjRjZmQ2NFwiLCBcIkhWTTY0XCIgOiBcImFtaS0wZDRjZmQ2NlwiLCBcIkhWTUcyXCIgOiBcImFtaS01YjA1YmEzMFwifSxcbiAgICAgIFwidXMtd2VzdC0yXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktZDNjNWQxZTNcIiwgXCJIVk02NFwiIDogXCJhbWktZDVjNWQxZTVcIiwgXCJIVk1HMlwiIDogXCJhbWktYTlkNmMwOTlcIn0sXG4gICAgICBcInVzLXdlc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTg1ZWExM2MxXCIsIFwiSFZNNjRcIiA6IFwiYW1pLTg3ZWExM2MzXCIsIFwiSFZNRzJcIiA6IFwiYW1pLTM3ODI3YTczXCJ9LFxuICAgICAgXCJldS13ZXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kNmQxOGVhMVwiLCBcIkhWTTY0XCIgOiBcImFtaS1lNGQxOGU5M1wiLCBcIkhWTUcyXCIgOiBcImFtaS03MmE5ZjEwNVwifSxcbiAgICAgIFwiZXUtY2VudHJhbC0xXCIgICAgIDoge1wiUFY2NFwiIDogXCJhbWktYTRiMGI3YjlcIiwgXCJIVk02NFwiIDogXCJhbWktYTZiMGI3YmJcIiwgXCJIVk1HMlwiIDogXCJhbWktYTZjOWNmYmJcIn0sXG4gICAgICBcImFwLW5vcnRoZWFzdC0xXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTFhMWI5ZjFhXCIsIFwiSFZNNjRcIiA6IFwiYW1pLTFjMWI5ZjFjXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWY2NDRjNGY2XCJ9LFxuICAgICAgXCJhcC1zb3V0aGVhc3QtMVwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kMjRiNDI4MFwiLCBcIkhWTTY0XCIgOiBcImFtaS1kNDRiNDI4NlwiLCBcIkhWTUcyXCIgOiBcImFtaS0xMmI1YmM0MFwifSxcbiAgICAgIFwiYXAtc291dGhlYXN0LTJcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktZWY3YjM5ZDVcIiwgXCJIVk02NFwiIDogXCJhbWktZGI3YjM5ZTFcIiwgXCJIVk1HMlwiIDogXCJhbWktYjMzMzdlODlcIn0sXG4gICAgICBcInNhLWVhc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTViMDk4MTQ2XCIsIFwiSFZNNjRcIiA6IFwiYW1pLTU1MDk4MTQ4XCIsIFwiSFZNRzJcIiA6IFwiTk9UX1NVUFBPUlRFRFwifSxcbiAgICAgIFwiY24tbm9ydGgtMVwiICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktYmVjNDU4ODdcIiwgXCJIVk02NFwiIDogXCJhbWktYmNjNDU4ODVcIiwgXCJIVk1HMlwiIDogXCJOT1RfU1VQUE9SVEVEXCJ9XG4gICAgfVxuXG4gIH0sXG5cbiAgXCJSZXNvdXJjZXNcIiA6IHtcbiAgICBcIkVDMkluc3RhbmNlXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6Okluc3RhbmNlXCIsXG4gICAgICBcIlByb3BlcnRpZXNcIiA6IHtcbiAgICAgICAgXCJVc2VyRGF0YVwiIDogeyBcIkZuOjpCYXNlNjRcIiA6IHsgXCJGbjo6Sm9pblwiIDogWyBcIlwiLCBbIFwiSVBBZGRyZXNzPVwiLCB7XCJSZWZcIiA6IFwiSVBBZGRyZXNzXCJ9XV19fSxcbiAgICAgICAgXCJJbnN0YW5jZVR5cGVcIiA6IHsgXCJSZWZcIiA6IFwiSW5zdGFuY2VUeXBlXCIgfSxcbiAgICAgICAgXCJTZWN1cml0eUdyb3Vwc1wiIDogWyB7IFwiUmVmXCIgOiBcIkluc3RhbmNlU2VjdXJpdHlHcm91cFwiIH0gXSxcbiAgICAgICAgXCJLZXlOYW1lXCIgOiB7IFwiUmVmXCIgOiBcIktleU5hbWVcIiB9LFxuICAgICAgICBcIkltYWdlSWRcIiA6IHsgXCJGbjo6RmluZEluTWFwXCIgOiBbIFwiQVdTUmVnaW9uQXJjaDJBTUlcIiwgeyBcIlJlZlwiIDogXCJBV1M6OlJlZ2lvblwiIH0sXG4gICAgICAgICAgeyBcIkZuOjpGaW5kSW5NYXBcIiA6IFsgXCJBV1NJbnN0YW5jZVR5cGUyQXJjaFwiLCB7IFwiUmVmXCIgOiBcIkluc3RhbmNlVHlwZVwiIH0sIFwiQXJjaFwiIF0gfSBdIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJJbnN0YW5jZVNlY3VyaXR5R3JvdXBcIiA6IHtcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6U2VjdXJpdHlHcm91cFwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiR3JvdXBEZXNjcmlwdGlvblwiIDogXCJFbmFibGUgU1NIIGFjY2Vzc1wiLFxuICAgICAgICBcIlNlY3VyaXR5R3JvdXBJbmdyZXNzXCIgOlxuICAgICAgICBbIHsgXCJJcFByb3RvY29sXCIgOiBcInRjcFwiLCBcIkZyb21Qb3J0XCIgOiBcIjIyXCIsIFwiVG9Qb3J0XCIgOiBcIjIyXCIsIFwiQ2lkcklwXCIgOiB7IFwiUmVmXCIgOiBcIlNTSExvY2F0aW9uXCJ9IH1dXG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiSVBBZGRyZXNzXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6OkVJUFwiXG4gICAgfSxcblxuICAgIFwiSVBBc3NvY1wiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpFSVBBc3NvY2lhdGlvblwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiSW5zdGFuY2VJZFwiIDogeyBcIlJlZlwiIDogXCJFQzJJbnN0YW5jZVwiIH0sXG4gICAgICAgIFwiRUlQXCIgOiB7IFwiUmVmXCIgOiBcIklQQWRkcmVzc1wiIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIFwiT3V0cHV0c1wiIDoge1xuICAgIFwiSW5zdGFuY2VJZFwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJJbnN0YW5jZUlkIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIlJlZlwiIDogXCJFQzJJbnN0YW5jZVwiIH1cbiAgICB9LFxuICAgIFwiSW5zdGFuY2VJUEFkZHJlc3NcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiSVAgYWRkcmVzcyBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJSZWZcIiA6IFwiSVBBZGRyZXNzXCIgfVxuICAgIH1cbiAgfVxufVxuIl19
