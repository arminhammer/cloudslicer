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

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/pixi.editor.js":[function(require,module,exports){
/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var DragDrop = require('./drag.drop');

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

},{"./drag.drop":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/drag.drop.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2RyYWcuZHJvcC5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvcGl4aS5lZGl0b3IuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL3NvdXJjZS5lZGl0b3IuanMiLCJhcHAvc2NyaXB0cy9tYWluLmpzIiwiYXBwL3NjcmlwdHMvdGVzdERhdGEvZWMyLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xNC8xNS5cbiAqL1xuXG52YXIgRHJhZ0Ryb3AgPSB7XG5cbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy5kYXRhID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLmFscGhhID0gMC41O1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hbHBoYSA9IDE7XG5cbiAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG5cbiAgICAvLyBzZXQgdGhlIGludGVyYWN0aW9uIGRhdGEgdG8gbnVsbFxuICAgIHRoaXMuZGF0YSA9IG51bGw7XG4gIH0sXG5cbiAgb25EcmFnTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZHJhZ2dpbmcpXG4gICAge1xuICAgICAgdmFyIGdsb2JhbCA9IHRoaXMudG9HbG9iYWwodGhpcy5wYXJlbnQpO1xuICAgICAgdmFyIGxvY2FsID0gdGhpcy50b0xvY2FsKHRoaXMucGFyZW50KTtcbiAgICAgIGNvbnNvbGUubG9nKCd4OiAnICsgdGhpcy54ICsgJyB5OiAnICsgdGhpcy55KTtcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzOiAnICsgdGhpcy54K1wiOlwiK3RoaXMueSArIFwiLCBnbG9iYWw6IFwiICsgZ2xvYmFsLnggKyBcIjpcIiArIGdsb2JhbC55ICsgXCIsIGxvY2FsOiBcIiArIGxvY2FsLnggKyBcIjpcIiArIGxvY2FsLnkpO1xuICAgICAgLy9jb25zb2xlLmxvZygnd2lkdGg6ICcgKyB0aGlzLndpZHRoICsgJyBoZWlnaHQ6ICcgKyB0aGlzLmhlaWdodCk7XG4gICAgICB2YXIgbmV3UG9zaXRpb24gPSB0aGlzLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbih0aGlzLnBhcmVudCk7XG4gICAgICBjb25zb2xlLmxvZygnTkVXOiAnICsgbmV3UG9zaXRpb24ueCArICc6JyArIG5ld1Bvc2l0aW9uLnkpO1xuICAgICAgdmFyIGxvY2FsID0gdGhpcy50b0xvY2FsKHRoaXMuZGF0YSk7XG4gICAgICBjb25zb2xlLmxvZygnTE9DQUw6ICcgKyBsb2NhbC54ICsgJzonICsgbG9jYWwueSk7XG4gICAgICB0aGlzLnBvc2l0aW9uLnggPSBuZXdQb3NpdGlvbi54O1xuICAgICAgdGhpcy5wb3NpdGlvbi55ID0gbmV3UG9zaXRpb24ueTtcbiAgICAgIC8vdGhpcy5tb3ZlVG8obmV3UG9zaXRpb24ueCwgbmV3UG9zaXRpb24ueSk7XG4gICAgfVxuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ0Ryb3A7XG5cbi8qXG5mdW5jdGlvbiBvbk1vdXNlT3ZlcigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgaWNvblNpemUgPSAxMDtcblxuICBjb25zb2xlLmxvZygnTW91c2Ugb3ZlcicpO1xuICB2YXIgZ2xvYmFsID0gc2VsZi50b0dsb2JhbChzZWxmLnBhcmVudCk7XG4gIGNvbnNvbGUubG9nKCdHTE9CQUw6ICcgKyBnbG9iYWwueCArICc6JyArIGdsb2JhbC55KTtcblxuICB2YXIgc2NhbGVMb2NhdGlvbnMgPSBbXG4gICAge3g6IC01LCB5OiAtNSwgc2l6ZTogaWNvblNpemV9LFxuICAgIHt4OiBlbGVtZW50U2l6ZS01LCB5OiAtNSwgc2l6ZTogaWNvblNpemV9LFxuICAgIHt4OiAtNSwgeTogZWxlbWVudFNpemUtNSwgc2l6ZTogaWNvblNpemV9LFxuICAgIHt4OiBlbGVtZW50U2l6ZS01LCB5OiBlbGVtZW50U2l6ZS01LCBzaXplOiBpY29uU2l6ZX1cbiAgXTtcblxuICAvL21vdmVJY29uLmRyYXdSZWN0KGVsZW1lbnRTaXplLTUsIC01LCAxMCwgMTApO1xuICAvL21vdmVJY29uLmRyYXdSZWN0KC01LCBlbGVtZW50U2l6ZS01LCAxMCwgMTApO1xuICAvL21vdmVJY29uLmRyYXdSZWN0KGVsZW1lbnRTaXplLTUsIGVsZW1lbnRTaXplLTUsIDEwLCAxMCk7XG5cbiAgc2VsZi5zY2FsZUljb25zID0gW107XG5cbiAgc2NhbGVMb2NhdGlvbnMuZm9yRWFjaChmdW5jdGlvbihsb2MpIHtcbiAgICB2YXIgaWNvbiA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgaWNvbi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgaWNvbi5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICBpY29uLmxpbmVTdHlsZSgxLCAweDAwMDBGRiwgMSk7XG4gICAgaWNvbi5iZWdpbkZpbGwoMHgwMDAwMDAsIDEpO1xuICAgIGljb24uZHJhd1JlY3QobG9jLngsIGxvYy55LCBsb2Muc2l6ZSwgbG9jLnNpemUpO1xuICAgIGljb24uZW5kRmlsbCgpO1xuXG4gICAgaWNvblxuICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgICAub24oJ21vdXNlZG93bicsIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KVxuICAgICAgLm9uKCd0b3VjaHN0YXJ0Jywgb25TY2FsZUljb25EcmFnU3RhcnQpO1xuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAvLy5vbignbW91c2V1cCcsIG9uRHJhZ0VuZClcbiAgICAvLy5vbignbW91c2V1cG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgLy8ub24oJ3RvdWNoZW5kJywgb25EcmFnRW5kKVxuICAgIC8vLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIG1vdmVcbiAgICAvLy5vbignbW91c2Vtb3ZlJywgb25EcmFnTW92ZSlcbiAgICAvLy5vbigndG91Y2htb3ZlJywgb25EcmFnTW92ZSlcblxuICAgIHNlbGYuc2NhbGVJY29ucy5wdXNoKGljb24pO1xuXG4gIH0pO1xuXG4gIC8vbW92ZUljb24uZW5kRmlsbCgpO1xuXG4gIC8vc3RhZ2UucmVtb3ZlQ2hpbGQoc2VsZik7XG4gIC8vc3RhZ2UuYWRkQ2hpbGQoaWNvbik7XG4gIHNlbGYuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICBzZWxmLmFkZENoaWxkKHMpO1xuICB9KTtcbiAgLy90aGlzLmFkZENoaWxkKHRoaXMuc2NhbGVJY29uc1swXSlcbiAgLy9zdGFnZS5hZGRDaGlsZCh0aGlzKTtcblxufVxuXG5mdW5jdGlvbiBvbk1vdXNlT3V0KCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGNvbnNvbGUubG9nKCdNb3VzZSBvdXQnKTtcbiAgdGhpcy5zY2FsZUljb25zLmZvckVhY2goZnVuY3Rpb24ocykge1xuICAgIHNlbGYucmVtb3ZlQ2hpbGQocyk7XG4gIH0pO1xuICBjb25zb2xlLmxvZygnU2l6ZTogJyk7XG4gIGNvbnNvbGUubG9nKHRoaXMuZ2V0Qm91bmRzKCkpO1xuXG59XG5cbmZ1bmN0aW9uIG9uU2NhbGVJY29uRHJhZ1N0YXJ0KGV2ZW50KSB7XG4gIC8vIHN0b3JlIGEgcmVmZXJlbmNlIHRvIHRoZSBkYXRhXG4gIC8vIHRoZSByZWFzb24gZm9yIHRoaXMgaXMgYmVjYXVzZSBvZiBtdWx0aXRvdWNoXG4gIC8vIHdlIHdhbnQgdG8gdHJhY2sgdGhlIG1vdmVtZW50IG9mIHRoaXMgcGFydGljdWxhciB0b3VjaFxuICB0aGlzLmRhdGEgPSBldmVudC5kYXRhO1xuICB0aGlzLmFscGhhID0gMC41O1xuICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIScpO1xufVxuKi9cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA3LzkvMTUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuL2RyYWcuZHJvcCcpO1xuXG5mdW5jdGlvbiBnZXRXaW5kb3dEaW1lbnNpb24oKSB7XG4gIHJldHVybiB7IHg6IHdpbmRvdy5pbm5lcldpZHRoLCB5OiB3aW5kb3cuaW5uZXJIZWlnaHQgfTtcbn1cblxuZnVuY3Rpb24gcmVzaXplR3VpQ29udGFpbmVyKHJlbmRlcmVyKSB7XG5cbiAgdmFyIGRpbSA9IGdldFdpbmRvd0RpbWVuc2lvbigpO1xuXG4gIGNvbnNvbGUubG9nKCdSZXNpemluZy4uLicpO1xuICBjb25zb2xlLmxvZyhkaW0pO1xuXG4gICQoJyNndWlDb250YWluZXInKS5oZWlnaHQoZGltLnkpO1xuICAkKCcjZ3VpQ29udGFpbmVyJykud2lkdGgoZGltLngpO1xuXG4gIGlmKHJlbmRlcmVyKSB7XG4gICAgcmVuZGVyZXIudmlldy5zdHlsZS53aWR0aCA9IGRpbS54KydweCc7XG4gICAgcmVuZGVyZXIudmlldy5zdHlsZS5oZWlnaHQgPSBkaW0ueSsncHgnO1xuICB9XG5cbiAgY29uc29sZS5sb2coJ1Jlc2l6aW5nIGd1aSBjb250YWluZXIuLi4nKTtcblxufVxuXG5mdW5jdGlvbiBkcmF3R3JpZCh3aWR0aCwgaGVpZ2h0KSB7XG4gIHZhciBncmlkID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgdmFyIGludGVydmFsID0gMjU7XG4gIHZhciBjb3VudCA9IGludGVydmFsO1xuICBncmlkLmxpbmVTdHlsZSgxLCAweEU1RTVFNSwgMSk7XG4gIHdoaWxlIChjb3VudCA8IHdpZHRoKSB7XG4gICAgZ3JpZC5tb3ZlVG8oY291bnQsIDApO1xuICAgIGdyaWQubGluZVRvKGNvdW50LCBoZWlnaHQpO1xuICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgfVxuICBjb3VudCA9IGludGVydmFsO1xuICB3aGlsZShjb3VudCA8IGhlaWdodCkge1xuICAgIGdyaWQubW92ZVRvKDAsIGNvdW50KTtcbiAgICBncmlkLmxpbmVUbyh3aWR0aCwgY291bnQpO1xuICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgfVxuICByZXR1cm4gZ3JpZDtcbn1cblxuXG5cbi8qXG4gdmFyIGVsZW1lbnRzID0gW107XG4gdmFyIGVsMSA9IGNyZWF0ZUVsZW1lbnQoJ2VsMScsIDEwMCwgMTAwKTtcbiB2YXIgZWwyID0gY3JlYXRlRWxlbWVudCgnZWwyJywgMjAwLCAyMDApO1xuIHZhciBlbDMgPSBjcmVhdGVFbGVtZW50KCdlbDMnLCAzMDAsIDMwMCk7XG4gZWxlbWVudHMucHVzaChlbDEpO1xuIGVsZW1lbnRzLnB1c2goZWwyKTtcbiBlbGVtZW50cy5wdXNoKGVsMyk7XG5cbiBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiBjb25zb2xlLmxvZyhlbGVtZW50Lm5hbWUpO1xuIGNvbnNvbGUubG9nKGVsZW1lbnQucG9zaXRpb24pO1xuIGNvbnNvbGUubG9nKGVsZW1lbnQuaGVpZ2h0ICsgJzonICsgZWxlbWVudC53aWR0aCk7XG4gc3RhZ2UuYWRkQ2hpbGQoZWxlbWVudCk7XG4gfSk7XG4gKi9cblxuZnVuY3Rpb24gZHJhdygpIHtcblxufVxuXG52YXIgUGl4aUVkaXRvciA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgdmFyIHdpbkRpbWVuc2lvbiA9IGdldFdpbmRvd0RpbWVuc2lvbigpO1xuXG4gICAgdmFyIHJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIod2luRGltZW5zaW9uLngsIHdpbkRpbWVuc2lvbi55LHtiYWNrZ3JvdW5kQ29sb3IgOiAweEZGRkZGRn0pO1xuICAgIHZhciBzdGFnZSA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICAgIHZhciBtZXRlciA9IG5ldyBGUFNNZXRlcigpO1xuXG4gICAgZnVuY3Rpb24gYW5pbWF0ZSgpIHtcbiAgICAgIHJlbmRlcmVyLnJlbmRlcihzdGFnZSk7XG4gICAgICBtZXRlci50aWNrKCk7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Mb2FkZWQoKSB7XG4gICAgICBjb25zb2xlLmxvZygnQXNzZXRzIGxvYWRlZCcpO1xuXG4gICAgICB2YXIgQVdTX0VDMl9JbnN0YW5jZSA9IFBJWEkuU3ByaXRlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMi0tLnBuZycpO1xuICAgICAgY29uc29sZS5sb2coJ0VDMkluc3RhbmNlJyk7XG4gICAgICBjb25zb2xlLmxvZyhBV1NfRUMyX0luc3RhbmNlKTtcbiAgICAgIEFXU19FQzJfSW5zdGFuY2Uuc2NhbGUuc2V0KDAuMik7XG4gICAgICBBV1NfRUMyX0luc3RhbmNlLnBvc2l0aW9uLnggPSA0MDA7XG4gICAgICBBV1NfRUMyX0luc3RhbmNlLnBvc2l0aW9uLnkgPSA0MDA7XG4gICAgICBBV1NfRUMyX0luc3RhbmNlLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIEFXU19FQzJfSW5zdGFuY2UuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgQVdTX0VDMl9JbnN0YW5jZS5idXR0b25Nb2RlID0gdHJ1ZTtcbiAgICAgIEFXU19FQzJfSW5zdGFuY2VcbiAgICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgICAgIC5vbignbW91c2Vkb3duJywgRHJhZ0Ryb3Aub25EcmFnU3RhcnQpXG4gICAgICAgIC5vbigndG91Y2hzdGFydCcsIERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgICAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgICAgIC5vbignbW91c2V1cCcsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAgICAgLm9uKCdtb3VzZXVwb3V0c2lkZScsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAgICAgLm9uKCd0b3VjaGVuZCcsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAgICAgLm9uKCd0b3VjaGVuZG91dHNpZGUnLCBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgICAgIC5vbignbW91c2Vtb3ZlJywgRHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAgICAgLm9uKCd0b3VjaG1vdmUnLCBEcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgICAgICAvLyBldmVudHMgZm9yIG1vdXNlIG92ZXJcbiAgICAgICAgLy8ub24oJ21vdXNlb3ZlcicsIG9uTW91c2VPdmVyKVxuICAgICAgICAvLy5vbignbW91c2VvdXQnLCBvbk1vdXNlT3V0KTtcbiAgICAgIHN0YWdlLmFkZENoaWxkKEFXU19FQzJfSW5zdGFuY2UpO1xuICAgIH1cblxuICAgIFBJWEkubG9hZGVyXG4gICAgICAuYWRkKCcuLi9yZXNvdXJjZXMvc3ByaXRlcy9zcHJpdGVzLmpzb24nKVxuICAgICAgLmxvYWQob25Mb2FkZWQpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRlbXBsYXRlOiBvcHRpb25zLnRlbXBsYXRlLFxuXG4gICAgICBkcmF3Q2FudmFzRWRpdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuXG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgYW5pbWF0ZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vdmFyIGVsZW1lbnRTaXplID0gMTAwO1xuXG4gICAgICAgIHN0YWdlLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdmFyIGdyaWQgPSBzdGFnZS5hZGRDaGlsZChkcmF3R3JpZCh3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnkpKTtcblxuICAgICAgICAvL3Jlc2l6ZUd1aUNvbnRhaW5lcigpO1xuXG4gICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQocmVuZGVyZXIudmlldyk7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnQWRkaW5nIGxpc3RlbmVyLi4uJyk7XG4gICAgICAgICAgcmVzaXplR3VpQ29udGFpbmVyKHJlbmRlcmVyKTtcbiAgICAgICAgICB3aW5EaW1lbnNpb24gPSBnZXRXaW5kb3dEaW1lbnNpb24oKTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKG5ld0RpbSk7XG4gICAgICAgICAgY29uc29sZS5sb2coc3RhZ2UpO1xuICAgICAgICAgIHN0YWdlLnJlbW92ZUNoaWxkKGdyaWQpO1xuICAgICAgICAgIGdyaWQgPSBzdGFnZS5hZGRDaGlsZChkcmF3R3JpZCh3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnkpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYW5pbWF0ZSgpO1xuXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB2aWV3OiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgcmV0dXJuIG0oJyNndWlDb250YWluZXInLCB7IGNvbmZpZzogY29udHJvbGxlci5kcmF3Q2FudmFzRWRpdG9yfSlcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQaXhpRWRpdG9yO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDcvOS8xNS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vdmFyIGpzb25saW50ID0gcmVxdWlyZSgnanNvbmxpbnQnKTtcblxuZnVuY3Rpb24gcmVzaXplRWRpdG9yKGVkaXRvcikge1xuICBlZGl0b3Iuc2V0U2l6ZShudWxsLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xufVxuXG52YXIgU291cmNlRWRpdG9yID0ge1xuXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgIGRyYXdFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgdmFyIGVkaXRvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBpZihlZGl0b3IpIHtcbiAgICAgICAgICAgIGVkaXRvci5yZWZyZXNoKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVkaXRvciA9IENvZGVNaXJyb3IoZWxlbWVudCwge1xuICAgICAgICAgIHZhbHVlOiBvcHRpb25zLnRlbXBsYXRlKCksXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgbW9kZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIGd1dHRlcnM6IFsnQ29kZU1pcnJvci1saW50LW1hcmtlcnMnXSxcbiAgICAgICAgICBsaW50OiB0cnVlLFxuICAgICAgICAgIHN0eWxlQWN0aXZlTGluZTogdHJ1ZSxcbiAgICAgICAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIHRoZW1lOiAnemVuYnVybidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzaXplRWRpdG9yKGVkaXRvcik7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlZGl0b3IpIHtcbiAgICAgICAgICBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcbiAgICAgICAgICBvcHRpb25zLnRlbXBsYXRlKGVkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICBtLmVuZENvbXB1dGF0aW9uKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBbXG4gICAgICBtKCcjc291cmNlRWRpdG9yJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0VkaXRvciB9KVxuICAgIF1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb3VyY2VFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBTb3VyY2VFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvc291cmNlLmVkaXRvcicpO1xudmFyIFBpeGlFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcGl4aS5lZGl0b3InKTtcblxudmFyIHRlc3REYXRhID0gcmVxdWlyZSgnLi90ZXN0RGF0YS9lYzIuanNvbicpO1xudmFyIHRlbXBsYXRlID0gbS5wcm9wKEpTT04uc3RyaW5naWZ5KHRlc3REYXRhLCB1bmRlZmluZWQsIDIpKTtcblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvdWRzbGljZXItYXBwJyksIG0uY29tcG9uZW50KFBpeGlFZGl0b3IsIHtcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgfSlcbik7XG5cbm0ubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGUtYmFyJyksIG0uY29tcG9uZW50KFNvdXJjZUVkaXRvciwge1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB9KVxuKTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJBV1NUZW1wbGF0ZUZvcm1hdFZlcnNpb25cIiA6IFwiMjAxMC0wOS0wOVwiLFxuXG4gIFwiRGVzY3JpcHRpb25cIiA6IFwiQVdTIENsb3VkRm9ybWF0aW9uIFNhbXBsZSBUZW1wbGF0ZSBTYW1wbGUgdGVtcGxhdGUgRUlQX1dpdGhfQXNzb2NpYXRpb246IFRoaXMgdGVtcGxhdGUgc2hvd3MgaG93IHRvIGFzc29jaWF0ZSBhbiBFbGFzdGljIElQIGFkZHJlc3Mgd2l0aCBhbiBBbWF6b24gRUMyIGluc3RhbmNlIC0geW91IGNhbiB1c2UgdGhpcyBzYW1lIHRlY2huaXF1ZSB0byBhc3NvY2lhdGUgYW4gRUMyIGluc3RhbmNlIHdpdGggYW4gRWxhc3RpYyBJUCBBZGRyZXNzIHRoYXQgaXMgbm90IGNyZWF0ZWQgaW5zaWRlIHRoZSB0ZW1wbGF0ZSBieSByZXBsYWNpbmcgdGhlIEVJUCByZWZlcmVuY2UgaW4gdGhlIEFXUzo6RUMyOjpFSVBBc3NvaWNhdGlvbiByZXNvdXJjZSB0eXBlIHdpdGggdGhlIElQIGFkZHJlc3Mgb2YgdGhlIGV4dGVybmFsIEVJUC4gKipXQVJOSU5HKiogVGhpcyB0ZW1wbGF0ZSBjcmVhdGVzIGFuIEFtYXpvbiBFQzIgaW5zdGFuY2UgYW5kIGFuIEVsYXN0aWMgSVAgQWRkcmVzcy4gWW91IHdpbGwgYmUgYmlsbGVkIGZvciB0aGUgQVdTIHJlc291cmNlcyB1c2VkIGlmIHlvdSBjcmVhdGUgYSBzdGFjayBmcm9tIHRoaXMgdGVtcGxhdGUuXCIsXG5cbiAgXCJQYXJhbWV0ZXJzXCIgOiB7XG4gICAgXCJJbnN0YW5jZVR5cGVcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiV2ViU2VydmVyIEVDMiBpbnN0YW5jZSB0eXBlXCIsXG4gICAgICBcIlR5cGVcIiA6IFwiU3RyaW5nXCIsXG4gICAgICBcIkRlZmF1bHRcIiA6IFwibTEuc21hbGxcIixcbiAgICAgIFwiQWxsb3dlZFZhbHVlc1wiIDogWyBcInQxLm1pY3JvXCIsIFwidDIubWljcm9cIiwgXCJ0Mi5zbWFsbFwiLCBcInQyLm1lZGl1bVwiLCBcIm0xLnNtYWxsXCIsIFwibTEubWVkaXVtXCIsIFwibTEubGFyZ2VcIiwgXCJtMS54bGFyZ2VcIiwgXCJtMi54bGFyZ2VcIiwgXCJtMi4yeGxhcmdlXCIsIFwibTIuNHhsYXJnZVwiLCBcIm0zLm1lZGl1bVwiLCBcIm0zLmxhcmdlXCIsIFwibTMueGxhcmdlXCIsIFwibTMuMnhsYXJnZVwiLCBcImMxLm1lZGl1bVwiLCBcImMxLnhsYXJnZVwiLCBcImMzLmxhcmdlXCIsIFwiYzMueGxhcmdlXCIsIFwiYzMuMnhsYXJnZVwiLCBcImMzLjR4bGFyZ2VcIiwgXCJjMy44eGxhcmdlXCIsIFwiYzQubGFyZ2VcIiwgXCJjNC54bGFyZ2VcIiwgXCJjNC4yeGxhcmdlXCIsIFwiYzQuNHhsYXJnZVwiLCBcImM0Ljh4bGFyZ2VcIiwgXCJnMi4yeGxhcmdlXCIsIFwicjMubGFyZ2VcIiwgXCJyMy54bGFyZ2VcIiwgXCJyMy4yeGxhcmdlXCIsIFwicjMuNHhsYXJnZVwiLCBcInIzLjh4bGFyZ2VcIiwgXCJpMi54bGFyZ2VcIiwgXCJpMi4yeGxhcmdlXCIsIFwiaTIuNHhsYXJnZVwiLCBcImkyLjh4bGFyZ2VcIiwgXCJkMi54bGFyZ2VcIiwgXCJkMi4yeGxhcmdlXCIsIFwiZDIuNHhsYXJnZVwiLCBcImQyLjh4bGFyZ2VcIiwgXCJoaTEuNHhsYXJnZVwiLCBcImhzMS44eGxhcmdlXCIsIFwiY3IxLjh4bGFyZ2VcIiwgXCJjYzIuOHhsYXJnZVwiLCBcImNnMS40eGxhcmdlXCJdXG4gICAgLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBiZSBhIHZhbGlkIEVDMiBpbnN0YW5jZSB0eXBlLlwiXG4gICAgfSxcblxuICAgIFwiS2V5TmFtZVwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJOYW1lIG9mIGFuIGV4aXN0aW5nIEVDMiBLZXlQYWlyIHRvIGVuYWJsZSBTU0ggYWNjZXNzIHRvIHRoZSBpbnN0YW5jZXNcIixcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6S2V5UGFpcjo6S2V5TmFtZVwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBiZSB0aGUgbmFtZSBvZiBhbiBleGlzdGluZyBFQzIgS2V5UGFpci5cIlxuICAgIH0sXG5cbiAgICBcIlNTSExvY2F0aW9uXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIlRoZSBJUCBhZGRyZXNzIHJhbmdlIHRoYXQgY2FuIGJlIHVzZWQgdG8gU1NIIHRvIHRoZSBFQzIgaW5zdGFuY2VzXCIsXG4gICAgICBcIlR5cGVcIjogXCJTdHJpbmdcIixcbiAgICAgIFwiTWluTGVuZ3RoXCI6IFwiOVwiLFxuICAgICAgXCJNYXhMZW5ndGhcIjogXCIxOFwiLFxuICAgICAgXCJEZWZhdWx0XCI6IFwiMC4wLjAuMC8wXCIsXG4gICAgICBcIkFsbG93ZWRQYXR0ZXJuXCI6IFwiKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pLyhcXFxcZHsxLDJ9KVwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIjogXCJtdXN0IGJlIGEgdmFsaWQgSVAgQ0lEUiByYW5nZSBvZiB0aGUgZm9ybSB4LngueC54L3guXCJcbiAgICB9XG4gIH0sXG5cbiAgXCJNYXBwaW5nc1wiIDoge1xuICAgIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiA6IHtcbiAgICAgIFwidDEubWljcm9cIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcInQyLm1pY3JvXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJ0Mi5zbWFsbFwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwidDIubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0xLnNtYWxsXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMy5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzEubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcImMxLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJjMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZzIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTUcyXCIgIH0sXG4gICAgICBcInIzLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJoaTEuNHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaHMxLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImNyMS44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjYzIuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfVxuICAgIH1cbiAgLFxuICAgIFwiQVdTUmVnaW9uQXJjaDJBTUlcIiA6IHtcbiAgICAgIFwidXMtZWFzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktMGY0Y2ZkNjRcIiwgXCJIVk02NFwiIDogXCJhbWktMGQ0Y2ZkNjZcIiwgXCJIVk1HMlwiIDogXCJhbWktNWIwNWJhMzBcIn0sXG4gICAgICBcInVzLXdlc3QtMlwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWQzYzVkMWUzXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWQ1YzVkMWU1XCIsIFwiSFZNRzJcIiA6IFwiYW1pLWE5ZDZjMDk5XCJ9LFxuICAgICAgXCJ1cy13ZXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS04NWVhMTNjMVwiLCBcIkhWTTY0XCIgOiBcImFtaS04N2VhMTNjM1wiLCBcIkhWTUcyXCIgOiBcImFtaS0zNzgyN2E3M1wifSxcbiAgICAgIFwiZXUtd2VzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktZDZkMThlYTFcIiwgXCJIVk02NFwiIDogXCJhbWktZTRkMThlOTNcIiwgXCJIVk1HMlwiIDogXCJhbWktNzJhOWYxMDVcIn0sXG4gICAgICBcImV1LWNlbnRyYWwtMVwiICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWE0YjBiN2I5XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWE2YjBiN2JiXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWE2YzljZmJiXCJ9LFxuICAgICAgXCJhcC1ub3J0aGVhc3QtMVwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS0xYTFiOWYxYVwiLCBcIkhWTTY0XCIgOiBcImFtaS0xYzFiOWYxY1wiLCBcIkhWTUcyXCIgOiBcImFtaS1mNjQ0YzRmNlwifSxcbiAgICAgIFwiYXAtc291dGhlYXN0LTFcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktZDI0YjQyODBcIiwgXCJIVk02NFwiIDogXCJhbWktZDQ0YjQyODZcIiwgXCJIVk1HMlwiIDogXCJhbWktMTJiNWJjNDBcIn0sXG4gICAgICBcImFwLXNvdXRoZWFzdC0yXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWVmN2IzOWQ1XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWRiN2IzOWUxXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWIzMzM3ZTg5XCJ9LFxuICAgICAgXCJzYS1lYXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS01YjA5ODE0NlwiLCBcIkhWTTY0XCIgOiBcImFtaS01NTA5ODE0OFwiLCBcIkhWTUcyXCIgOiBcIk5PVF9TVVBQT1JURURcIn0sXG4gICAgICBcImNuLW5vcnRoLTFcIiAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWJlYzQ1ODg3XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWJjYzQ1ODg1XCIsIFwiSFZNRzJcIiA6IFwiTk9UX1NVUFBPUlRFRFwifVxuICAgIH1cblxuICB9LFxuXG4gIFwiUmVzb3VyY2VzXCIgOiB7XG4gICAgXCJFQzJJbnN0YW5jZVwiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpJbnN0YW5jZVwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiVXNlckRhdGFcIiA6IHsgXCJGbjo6QmFzZTY0XCIgOiB7IFwiRm46OkpvaW5cIiA6IFsgXCJcIiwgWyBcIklQQWRkcmVzcz1cIiwge1wiUmVmXCIgOiBcIklQQWRkcmVzc1wifV1dfX0sXG4gICAgICAgIFwiSW5zdGFuY2VUeXBlXCIgOiB7IFwiUmVmXCIgOiBcIkluc3RhbmNlVHlwZVwiIH0sXG4gICAgICAgIFwiU2VjdXJpdHlHcm91cHNcIiA6IFsgeyBcIlJlZlwiIDogXCJJbnN0YW5jZVNlY3VyaXR5R3JvdXBcIiB9IF0sXG4gICAgICAgIFwiS2V5TmFtZVwiIDogeyBcIlJlZlwiIDogXCJLZXlOYW1lXCIgfSxcbiAgICAgICAgXCJJbWFnZUlkXCIgOiB7IFwiRm46OkZpbmRJbk1hcFwiIDogWyBcIkFXU1JlZ2lvbkFyY2gyQU1JXCIsIHsgXCJSZWZcIiA6IFwiQVdTOjpSZWdpb25cIiB9LFxuICAgICAgICAgIHsgXCJGbjo6RmluZEluTWFwXCIgOiBbIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiwgeyBcIlJlZlwiIDogXCJJbnN0YW5jZVR5cGVcIiB9LCBcIkFyY2hcIiBdIH0gXSB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiSW5zdGFuY2VTZWN1cml0eUdyb3VwXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6OlNlY3VyaXR5R3JvdXBcIixcbiAgICAgIFwiUHJvcGVydGllc1wiIDoge1xuICAgICAgICBcIkdyb3VwRGVzY3JpcHRpb25cIiA6IFwiRW5hYmxlIFNTSCBhY2Nlc3NcIixcbiAgICAgICAgXCJTZWN1cml0eUdyb3VwSW5ncmVzc1wiIDpcbiAgICAgICAgWyB7IFwiSXBQcm90b2NvbFwiIDogXCJ0Y3BcIiwgXCJGcm9tUG9ydFwiIDogXCIyMlwiLCBcIlRvUG9ydFwiIDogXCIyMlwiLCBcIkNpZHJJcFwiIDogeyBcIlJlZlwiIDogXCJTU0hMb2NhdGlvblwifSB9XVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcIklQQWRkcmVzc1wiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpFSVBcIlxuICAgIH0sXG5cbiAgICBcIklQQXNzb2NcIiA6IHtcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6RUlQQXNzb2NpYXRpb25cIixcbiAgICAgIFwiUHJvcGVydGllc1wiIDoge1xuICAgICAgICBcIkluc3RhbmNlSWRcIiA6IHsgXCJSZWZcIiA6IFwiRUMySW5zdGFuY2VcIiB9LFxuICAgICAgICBcIkVJUFwiIDogeyBcIlJlZlwiIDogXCJJUEFkZHJlc3NcIiB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBcIk91dHB1dHNcIiA6IHtcbiAgICBcIkluc3RhbmNlSWRcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiSW5zdGFuY2VJZCBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJSZWZcIiA6IFwiRUMySW5zdGFuY2VcIiB9XG4gICAgfSxcbiAgICBcIkluc3RhbmNlSVBBZGRyZXNzXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIklQIGFkZHJlc3Mgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiUmVmXCIgOiBcIklQQWRkcmVzc1wiIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
