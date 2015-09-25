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

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_EIP.js":[function(require,module,exports){
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

var Collection = require('../collection');

var AWS_EC2_SecurityGroup = function(name,x,y) {
  Collection.call(this);
  var self = this;
  self.name = name;

  self.draw = new PIXI.Graphics();
  self.draw.lineStyle(3, 0x000000, 1);
  //self.draw.moveTo(x,y);
  self.draw.drawRoundedRect(x,y,200,200,10);
  self.add(self.draw);

};
AWS_EC2_SecurityGroup.prototype = Object.create(Collection.prototype);

module.exports = AWS_EC2_SecurityGroup;

},{"../collection":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/collection.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_Users.js":[function(require,module,exports){
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
    var iconSize = 10;
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

    var stage = new PIXI.Container();
    var elements = new Collection();
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

},{"./arrow":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/arrow.js","./aws/AWS_EC2_EIP":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_EIP.js","./aws/AWS_EC2_Instance":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_Instance.js","./aws/AWS_EC2_SecurityGroup":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_EC2_SecurityGroup.js","./aws/AWS_Users":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/aws/AWS_Users.js","./collection":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/collection.js","./element":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/element.js","./gui.util":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.util.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2Fycm93LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9hd3MvQVdTX0VDMl9FSVAuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX0luc3RhbmNlLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9hd3MvQVdTX0VDMl9TZWN1cml0eUdyb3VwLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9hd3MvQVdTX1VzZXJzLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9jb2xsZWN0aW9uLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9kcmFnLmRyb3AuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2VsZW1lbnQuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2d1aS51dGlsLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9waXhpLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvc291cmNlLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL21haW4uanMiLCJhcHAvc2NyaXB0cy90ZXN0RGF0YS9lYzIuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzE3LzE1LlxuICovXG5cbnZhciBBcnJvdyA9IHtcblxuICBkcmF3QmV0d2VlbjogZnVuY3Rpb24oYSwgYikge1xuXG4gICAgdmFyIGFycm93ID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcblxuICAgIGNvbnNvbGUubG9nKGEuZ2V0Qm91bmRzKCkpO1xuICAgIGNvbnNvbGUubG9nKGIuZ2V0Qm91bmRzKCkpO1xuXG4gICAgLypcbiAgICBhcnJvdy5saW5lU3R5bGUoMSwgMHhFNUU1RTUsIDEpO1xuICAgIHdoaWxlIChjb3VudCA8IHdpZHRoKSB7XG4gICAgICBncmlkLm1vdmVUbyhjb3VudCwgMCk7XG4gICAgICBncmlkLmxpbmVUbyhjb3VudCwgaGVpZ2h0KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgY291bnQgPSBpbnRlcnZhbDtcbiAgICB3aGlsZShjb3VudCA8IGhlaWdodCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oMCwgY291bnQpO1xuICAgICAgZ3JpZC5saW5lVG8od2lkdGgsIGNvdW50KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgcmV0dXJuIGFycm93O1xuICAgICovXG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJvdztcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE5LzE1LlxuICovXG5cbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi4vZWxlbWVudCcpO1xudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi4vZHJhZy5kcm9wJyk7XG5cbnZhciBBV1NfRUMyX0VJUCA9IGZ1bmN0aW9uKG5hbWUseCx5KSB7XG4gIEVsZW1lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLm5hbWUgPSBuYW1lO1xuICBzZWxmLnNjYWxlLnNldCgwLjMpO1xuICBzZWxmLnRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCdDb21wdXRlXyZfTmV0d29ya2luZ19BbWF6b25fRUMyX0VsYXN0aWNfSVAucG5nJyk7XG4gIHNlbGYucG9zaXRpb24ueCA9IHg7XG4gIHNlbGYucG9zaXRpb24ueSA9IHk7XG59O1xuQVdTX0VDMl9FSVAucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX0VDMl9FSVA7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX0VDMl9JbnN0YW5jZSA9IGZ1bmN0aW9uKG5hbWUseCx5KSB7XG4gIEVsZW1lbnQuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLm5hbWUgPSBuYW1lO1xuICBzZWxmLnRleHR1cmUgPSBQSVhJLlRleHR1cmUuZnJvbUZyYW1lKCdDb21wdXRlXyZfTmV0d29ya2luZ19BbWF6b25fRUMyX0luc3RhbmNlLnBuZycpO1xuICBzZWxmLnBvc2l0aW9uLnggPSB4O1xuICBzZWxmLnBvc2l0aW9uLnkgPSB5O1xufTtcbkFXU19FQzJfSW5zdGFuY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX0VDMl9JbnN0YW5jZTtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzIxLzE1LlxuICovXG5cbnZhciBDb2xsZWN0aW9uID0gcmVxdWlyZSgnLi4vY29sbGVjdGlvbicpO1xuXG52YXIgQVdTX0VDMl9TZWN1cml0eUdyb3VwID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgQ29sbGVjdGlvbi5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYubmFtZSA9IG5hbWU7XG5cbiAgc2VsZi5kcmF3ID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgc2VsZi5kcmF3LmxpbmVTdHlsZSgzLCAweDAwMDAwMCwgMSk7XG4gIC8vc2VsZi5kcmF3Lm1vdmVUbyh4LHkpO1xuICBzZWxmLmRyYXcuZHJhd1JvdW5kZWRSZWN0KHgseSwyMDAsMjAwLDEwKTtcbiAgc2VsZi5hZGQoc2VsZi5kcmF3KTtcblxufTtcbkFXU19FQzJfU2VjdXJpdHlHcm91cC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENvbGxlY3Rpb24ucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfRUMyX1NlY3VyaXR5R3JvdXA7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gOS8xOS8xNS5cbiAqL1xuXG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4uL2VsZW1lbnQnKTtcbnZhciBEcmFnRHJvcCA9IHJlcXVpcmUoJy4uL2RyYWcuZHJvcCcpO1xuXG52YXIgQVdTX1VzZXJzID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgRWxlbWVudC5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYubmFtZSA9IG5hbWU7XG4gIHNlbGYudGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ05vbi1TZXJ2aWNlX1NwZWNpZmljX2NvcHlfVXNlcnMucG5nJyk7XG4gIHNlbGYucG9zaXRpb24ueCA9IHg7XG4gIHNlbGYucG9zaXRpb24ueSA9IHk7XG5cbn07XG5BV1NfVXNlcnMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShFbGVtZW50LnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQVdTX1VzZXJzO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluZyBvbiA5LzIxLzE1LlxuICovXG4vKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIENvbGxlY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgUElYSS5Db250YWluZXIuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuZWxlbWVudHMgPSB7fTtcblxuICBzZWxmLmFkZCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBzZWxmLmFkZENoaWxkKGVsZW1lbnQpO1xuICAgIHNlbGYuZWxlbWVudHNbZWxlbWVudC5uYW1lXSA9IGVsZW1lbnQ7XG4gIH07XG5cbiAgc2VsZi5yZW1vdmUgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgc2VsZi5yZW1vdmVDaGlsZChlbGVtZW50KTtcbiAgICBkZWxldGUgc2VsZi5lbGVtZW50c1tlbGVtZW50Lm5hbWVdO1xuICB9O1xuXG59O1xuQ29sbGVjdGlvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKFBJWEkuQ29udGFpbmVyLnByb3RvdHlwZSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE0LzE1LlxuICovXG5cbnZhciBNT1VTRV9PVkVSX1NDQUxFX1JBVElPID0gMS4xO1xuXG52YXIgRHJhZ0Ryb3AgPSB7XG5cbiAgb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy5kYXRhID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLmFscGhhID0gMC41O1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICB9LFxuXG4gIG9uRHJhZ0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hbHBoYSA9IDE7XG5cbiAgICB0aGlzLmRyYWdnaW5nID0gZmFsc2U7XG5cbiAgICAvLyBzZXQgdGhlIGludGVyYWN0aW9uIGRhdGEgdG8gbnVsbFxuICAgIHRoaXMuZGF0YSA9IG51bGw7XG4gIH0sXG5cbiAgb25EcmFnTW92ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLmRyYWdnaW5nKVxuICAgIHtcbiAgICAgIGNvbnNvbGUubG9nKHNlbGYucGFyZW50KTtcbiAgICAgIGNvbnNvbGUubG9nKHNlbGYpO1xuICAgICAgLy92YXIgZ2xvYmFsID0gc2VsZi50b0dsb2JhbChzZWxmLnBhcmVudCk7XG4gICAgICB2YXIgbG9jYWwgPSBzZWxmLnRvTG9jYWwoc2VsZi5wYXJlbnQpO1xuICAgICAgLy9jb25zb2xlLmxvZygneDogJyArIHNlbGYueCArICcgeTogJyArIHNlbGYueSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdzZWxmOiAnICsgc2VsZi54K1wiOlwiK3NlbGYueSArIFwiLCBnbG9iYWw6IFwiICsgZ2xvYmFsLnggKyBcIjpcIiArIGdsb2JhbC55ICsgXCIsIGxvY2FsOiBcIiArIGxvY2FsLnggKyBcIjpcIiArIGxvY2FsLnkpO1xuICAgICAgLy9jb25zb2xlLmxvZygnd2lkdGg6ICcgKyBzZWxmLndpZHRoICsgJyBoZWlnaHQ6ICcgKyBzZWxmLmhlaWdodCk7XG4gICAgICB2YXIgbmV3UG9zaXRpb24gPSBzZWxmLmRhdGEuZ2V0TG9jYWxQb3NpdGlvbihzZWxmLnBhcmVudCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdORVc6ICcgKyBuZXdQb3NpdGlvbi54ICsgJzonICsgbmV3UG9zaXRpb24ueSk7XG4gICAgICB2YXIgbG9jYWwgPSBzZWxmLnRvTG9jYWwoc2VsZi5kYXRhKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ0xPQ0FMOiAnICsgbG9jYWwueCArICc6JyArIGxvY2FsLnkpO1xuICAgICAgc2VsZi5wb3NpdGlvbi54ID0gbmV3UG9zaXRpb24ueDtcbiAgICAgIHNlbGYucG9zaXRpb24ueSA9IG5ld1Bvc2l0aW9uLnk7XG4gICAgICAvL3NlbGYubW92ZVRvKG5ld1Bvc2l0aW9uLngsIG5ld1Bvc2l0aW9uLnkpO1xuICAgIH1cbiAgfSxcblxuICBvbk1vdXNlT3ZlcjogZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ01vdXNlZCBvdmVyIScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG4gICAgdmFyIGljb25TaXplID0gMTA7XG4gICAgdmFyIGVsZW1lbnRTaXplID0gMTAwO1xuXG4gICAgdmFyIGdsb2JhbCA9IHNlbGYudG9HbG9iYWwoc2VsZi5wb3NpdGlvbik7XG4gICAgY29uc29sZS5sb2coJ29mZmljaWFsOiAnICsgc2VsZi5wb3NpdGlvbi54ICsgJzonICsgc2VsZi5wb3NpdGlvbi55KTtcbiAgICBjb25zb2xlLmxvZygnR0xPQkFMOiAnICsgZ2xvYmFsLnggKyAnOicgKyBnbG9iYWwueSk7XG4gICAgY29uc29sZS5sb2coc2VsZi5nZXRMb2NhbEJvdW5kcygpKTtcblxuICAgIHZhciBzY2FsZUxvY2F0aW9ucyA9IFtcbiAgICAgIHt4OiAwLCB5OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMi1pY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMC1zZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMi1pY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogc2VsZi5nZXRMb2NhbEJvdW5kcygpLndpZHRoLzIraWNvblNpemUvMiwgeTogMCwgc2l6ZTogaWNvblNpemV9LFxuICAgICAge3g6IDAsIHk6IHNlbGYuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQvMitpY29uU2l6ZS8yLCBzaXplOiBpY29uU2l6ZX1cbiAgICBdO1xuXG4gICAgY29uc29sZS5sb2coc2NhbGVMb2NhdGlvbnNbMF0pO1xuXG4gICAgLy9tb3ZlSWNvbi5kcmF3UmVjdChlbGVtZW50U2l6ZS01LCAtNSwgMTAsIDEwKTtcbiAgICAvL21vdmVJY29uLmRyYXdSZWN0KC01LCBlbGVtZW50U2l6ZS01LCAxMCwgMTApO1xuICAgIC8vbW92ZUljb24uZHJhd1JlY3QoZWxlbWVudFNpemUtNSwgZWxlbWVudFNpemUtNSwgMTAsIDEwKTtcblxuICAgIHNlbGYuc2NhbGVJY29ucyA9IFtdO1xuXG4gICAgc2NhbGVMb2NhdGlvbnMuZm9yRWFjaChmdW5jdGlvbihsb2MpIHtcbiAgICAgIHZhciBpY29uID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICAgIGljb24ubW92ZVRvKDAsMCk7XG4gICAgICBpY29uLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGljb24uYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgICBpY29uLmxpbmVTdHlsZSgxLCAweDAwMDBGRiwgMSk7XG4gICAgICBpY29uLmJlZ2luRmlsbCgweEZGRkZGRiwgMSk7XG4gICAgICBpY29uLmRyYXdDaXJjbGUobG9jLngsIGxvYy55LCBsb2Muc2l6ZSk7XG4gICAgICBpY29uLmVuZEZpbGwoKTtcblxuICAgICAgLy9pY29uXG4gICAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBzdGFydFxuICAgICAgICAvLy5vbignbW91c2Vkb3duJywgb25TY2FsZUljb25EcmFnU3RhcnQpXG4gICAgICAgIC8vLm9uKCd0b3VjaHN0YXJ0Jywgb25TY2FsZUljb25EcmFnU3RhcnQpO1xuICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIGVuZFxuICAgICAgLy8ub24oJ21vdXNldXAnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbignbW91c2V1cG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbigndG91Y2hlbmQnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbigndG91Y2hlbmRvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIG1vdmVcbiAgICAgIC8vLm9uKCdtb3VzZW1vdmUnLCBvbkRyYWdNb3ZlKVxuICAgICAgLy8ub24oJ3RvdWNobW92ZScsIG9uRHJhZ01vdmUpXG5cbiAgICAgIHNlbGYuc2NhbGVJY29ucy5wdXNoKGljb24pO1xuXG4gICAgfSk7XG5cbiAgICAvL21vdmVJY29uLmVuZEZpbGwoKTtcblxuICAgIC8vc3RhZ2UucmVtb3ZlQ2hpbGQoc2VsZik7XG4gICAgLy9zdGFnZS5hZGRDaGlsZChpY29uKTtcbiAgICBzZWxmLnNjYWxlSWNvbnMuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICBzZWxmLmFkZENoaWxkKHMpO1xuICAgIH0pO1xuICAgIC8vdGhpcy5hZGRDaGlsZCh0aGlzLnNjYWxlSWNvbnNbMF0pXG4gICAgLy9zdGFnZS5hZGRDaGlsZCh0aGlzKTtcblxuICB9LFxuXG4gIG9uTW91c2VPdXQ6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdNb3VzZWQgb3V0IScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngvTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgY29uc29sZS5sb2coJ01vdXNlIG91dCcpO1xuICAgIHRoaXMuc2NhbGVJY29ucy5mb3JFYWNoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHNlbGYucmVtb3ZlQ2hpbGQocyk7XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coJ1NpemU6ICcpO1xuICAgIGNvbnNvbGUubG9nKHRoaXMuZ2V0Qm91bmRzKCkpO1xuXG4gIH0sXG5cbiAgb25TY2FsZUljb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gc3RvcmUgYSByZWZlcmVuY2UgdG8gdGhlIGRhdGFcbiAgICAvLyB0aGUgcmVhc29uIGZvciB0aGlzIGlzIGJlY2F1c2Ugb2YgbXVsdGl0b3VjaFxuICAgIC8vIHdlIHdhbnQgdG8gdHJhY2sgdGhlIG1vdmVtZW50IG9mIHRoaXMgcGFydGljdWxhciB0b3VjaFxuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICBjb25zb2xlLmxvZygnUmVzaXppbmchJyk7XG4gIH1cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERyYWdEcm9wO1xuXG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTUvMTUuXG4gKi9cblxudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi9kcmFnLmRyb3AnKTtcblxudmFyIERFRkFVTFRfU0NBTEUgPSAwLjc7XG5cbnZhciBFbGVtZW50ID0gZnVuY3Rpb24oKSB7XG4gIFBJWEkuU3ByaXRlLmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBzZWxmLnNjYWxlLnNldChERUZBVUxUX1NDQUxFKTtcbiAgc2VsZi5hbmNob3Iuc2V0KDAuNSk7XG4gIHNlbGYuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICBzZWxmLmJ1dHRvbk1vZGUgPSB0cnVlO1xuICBzZWxmXG4gICAgLy8gZXZlbnRzIGZvciBkcmFnIHN0YXJ0XG4gICAgLm9uKCdtb3VzZWRvd24nLCBEcmFnRHJvcC5vbkRyYWdTdGFydClcbiAgICAub24oJ3RvdWNoc3RhcnQnLCBEcmFnRHJvcC5vbkRyYWdTdGFydClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgZW5kXG4gICAgLm9uKCdtb3VzZXVwJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbignbW91c2V1cG91dHNpZGUnLCBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCd0b3VjaGVuZCcsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ3RvdWNoZW5kb3V0c2lkZScsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgbW92ZVxuICAgIC5vbignbW91c2Vtb3ZlJywgRHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAub24oJ3RvdWNobW92ZScsIERyYWdEcm9wLm9uRHJhZ01vdmUpXG4gICAgLy8gZXZlbnRzIGZvciBtb3VzZSBvdmVyXG4gICAgLm9uKCdtb3VzZW92ZXInLCBEcmFnRHJvcC5vbk1vdXNlT3ZlcilcbiAgICAub24oJ21vdXNlb3V0JywgRHJhZ0Ryb3Aub25Nb3VzZU91dCk7XG5cbiAgc2VsZi5hcnJvd3MgPSBbXTtcblxuICBzZWxmLmFkZEFycm93VG8gPSBmdW5jdGlvbihiKSB7XG4gICAgc2VsZi5hcnJvd3MucHVzaChiKTtcbiAgfTtcblxuICBzZWxmLnJlbW92ZUFycm93VG8gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHNlbGYuYXJyb3dzLnJlbW92ZShpbmRleCk7XG4gIH07XG5cbn07XG5FbGVtZW50LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUElYSS5TcHJpdGUucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbGVtZW50O1xuIiwiXG52YXIgR3VpVXRpbCA9IHtcblxuICBnZXRXaW5kb3dEaW1lbnNpb246IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7IHg6IHdpbmRvdy5pbm5lcldpZHRoLCB5OiB3aW5kb3cuaW5uZXJIZWlnaHQgfTtcbiAgfSxcblxuICBkcmF3R3JpZDogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgIHZhciBncmlkID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICB2YXIgaW50ZXJ2YWwgPSAxMDA7XG4gICAgdmFyIGNvdW50ID0gaW50ZXJ2YWw7XG4gICAgZ3JpZC5saW5lU3R5bGUoMSwgMHhFNUU1RTUsIDEpO1xuICAgIHdoaWxlIChjb3VudCA8IHdpZHRoKSB7XG4gICAgICBncmlkLm1vdmVUbyhjb3VudCwgMCk7XG4gICAgICBncmlkLmxpbmVUbyhjb3VudCwgaGVpZ2h0KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgY291bnQgPSBpbnRlcnZhbDtcbiAgICB3aGlsZShjb3VudCA8IGhlaWdodCkge1xuICAgICAgZ3JpZC5tb3ZlVG8oMCwgY291bnQpO1xuICAgICAgZ3JpZC5saW5lVG8od2lkdGgsIGNvdW50KTtcbiAgICAgIGNvdW50ID0gY291bnQgKyBpbnRlcnZhbDtcbiAgICB9XG4gICAgdmFyIGNvbnRhaW5lciA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuICAgIGNvbnRhaW5lci5hZGRDaGlsZChncmlkKTtcbiAgICBjb250YWluZXIuY2FjaGVBc0JpdG1hcCA9IHRydWU7XG4gICAgcmV0dXJuIGNvbnRhaW5lcjtcbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEd1aVV0aWw7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIEd1aVV0aWwgPSByZXF1aXJlKCcuL2d1aS51dGlsJyk7XG52YXIgRWxlbWVudCA9IHJlcXVpcmUoJy4vZWxlbWVudCcpO1xudmFyIEFycm93ID0gcmVxdWlyZSgnLi9hcnJvdycpO1xudmFyIEFXU19Vc2VycyA9IHJlcXVpcmUoJy4vYXdzL0FXU19Vc2VycycpO1xudmFyIEFXU19FQzJfSW5zdGFuY2UgPSByZXF1aXJlKCcuL2F3cy9BV1NfRUMyX0luc3RhbmNlJyk7XG52YXIgQVdTX0VDMl9FSVAgPSByZXF1aXJlKCcuL2F3cy9BV1NfRUMyX0VJUCcpO1xudmFyIEFXU19FQzJfU2VjdXJpdHlHcm91cCA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfU2VjdXJpdHlHcm91cCcpO1xudmFyIENvbGxlY3Rpb24gPSByZXF1aXJlKCcuL2NvbGxlY3Rpb24nKTtcblxuZnVuY3Rpb24gcmVzaXplR3VpQ29udGFpbmVyKHJlbmRlcmVyKSB7XG5cbiAgdmFyIGRpbSA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG5cbiAgY29uc29sZS5sb2coJ1Jlc2l6aW5nLi4uJyk7XG4gIGNvbnNvbGUubG9nKGRpbSk7XG5cbiAgJCgnI2d1aUNvbnRhaW5lcicpLmhlaWdodChkaW0ueSk7XG4gICQoJyNndWlDb250YWluZXInKS53aWR0aChkaW0ueCk7XG5cbiAgaWYocmVuZGVyZXIpIHtcbiAgICByZW5kZXJlci52aWV3LnN0eWxlLndpZHRoID0gZGltLngrJ3B4JztcbiAgICByZW5kZXJlci52aWV3LnN0eWxlLmhlaWdodCA9IGRpbS55KydweCc7XG4gIH1cblxuICBjb25zb2xlLmxvZygnUmVzaXppbmcgZ3VpIGNvbnRhaW5lci4uLicpO1xuXG59XG5cbnZhciBQaXhpRWRpdG9yID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBvcHRpb25zLnRlbXBsYXRlKCk7XG4gICAgY29uc29sZS5sb2codGVtcGxhdGUpO1xuXG4gICAgdmFyIHdpbkRpbWVuc2lvbiA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG5cbiAgICB2YXIgcmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcih3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnksIHtiYWNrZ3JvdW5kQ29sb3IgOiAweEZGRkZGRn0pO1xuXG4gICAgdmFyIHN0YWdlID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG4gICAgdmFyIGVsZW1lbnRzID0gbmV3IENvbGxlY3Rpb24oKTtcbiAgICB2YXIgYXJyb3dHcmFwaGljcyA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG5cbiAgICB2YXIgbWV0ZXIgPSBuZXcgRlBTTWV0ZXIoKTtcblxuICAgIHZhciBmcHMgPSA2MDtcbiAgICB2YXIgbm93O1xuICAgIHZhciB0aGVuID0gRGF0ZS5ub3coKTtcbiAgICB2YXIgaW50ZXJ2YWwgPSAxMDAwL2ZwcztcbiAgICB2YXIgZGVsdGE7XG5cbiAgICBmdW5jdGlvbiBhbmltYXRlKCkge1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xuXG4gICAgICBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgZGVsdGEgPSBub3cgLSB0aGVuO1xuXG4gICAgICBpZiAoZGVsdGEgPiBpbnRlcnZhbCkge1xuICAgICAgICB0aGVuID0gbm93IC0gKGRlbHRhICUgaW50ZXJ2YWwpO1xuICAgICAgICBtZXRlci50aWNrKCk7XG5cbiAgICAgICAgcmVuZGVyZXIucmVuZGVyKHN0YWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkxvYWRlZCgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdBc3NldHMgbG9hZGVkJyk7XG5cbiAgICAgIHZhciBkaW0gPSBHdWlVdGlsLmdldFdpbmRvd0RpbWVuc2lvbigpO1xuICAgICAgY29uc29sZS5sb2coZWxlbWVudHMucG9zaXRpb24pO1xuXG4gICAgICB2YXIgdXNlcnMgPSBuZXcgQVdTX1VzZXJzKCd1c2VycycsIGRpbS54LzIsIDEwMCk7XG4gICAgICBjb25zb2xlLmxvZyh1c2Vycy5wb3NpdGlvbik7XG4gICAgICBlbGVtZW50cy5hZGQodXNlcnMpO1xuXG4gICAgICBjb25zb2xlLmxvZyh0ZW1wbGF0ZS5SZXNvdXJjZXMpO1xuXG4gICAgICB2YXIgZ3JvdXBpbmdzID0gXy5yZWR1Y2UodGVtcGxhdGUuUmVzb3VyY2VzLCBmdW5jdGlvbihyZXN1bHQsIG4sIGtleSkge1xuICAgICAgICByZXN1bHRbbi5UeXBlXSA9IHt9O1xuICAgICAgICByZXN1bHRbbi5UeXBlXVtrZXldID0gbjtcbiAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgfSwge30pO1xuICAgICAgY29uc29sZS5sb2coJ0dyb3VwaW5nczonKTtcbiAgICAgIGNvbnNvbGUubG9nKGdyb3VwaW5ncyk7XG5cbiAgICAgIHZhciBpbnN0YW5jZXMgPSB7fTtcbiAgICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpJbnN0YW5jZSddLCBmdW5jdGlvbihuLCBrZXkpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gbmV3IEFXU19FQzJfSW5zdGFuY2Uoa2V5LCBkaW0ueC8yLCA0MDApO1xuICAgICAgICBpbnN0YW5jZXNba2V5XSA9IGluc3RhbmNlO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBlaXBzID0ge307XG4gICAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6RUlQJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgICBjb25zb2xlLmxvZygnQWRkaW5nIEVJUCAnLCBrZXkpO1xuICAgICAgICB2YXIgZWlwID0gbmV3IEFXU19FQzJfRUlQKGtleSwgZGltLngvMiwgNTAwKTtcbiAgICAgICAgZWlwc1trZXldID0gZWlwO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBzZWNncm91cHMgPSB7fTtcbiAgICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpTZWN1cml0eUdyb3VwJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgICBjb25zb2xlLmxvZygnQWRkaW5nIFNlY3VyaXR5IEdyb3VwICcsIGtleSk7XG4gICAgICAgIHZhciBzZWNncm91cCA9IG5ldyBBV1NfRUMyX1NlY3VyaXR5R3JvdXAoa2V5LCBkaW0ueC8yLCA1MDApO1xuICAgICAgICBzZWNncm91cHNba2V5XSA9IHNlY2dyb3VwO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBjb21ib0luc3RhbmNlcyA9IHt9O1xuICAgICAgXy5lYWNoKGdyb3VwaW5nc1snQVdTOjpFQzI6OkVJUEFzc29jaWF0aW9uJ10sIGZ1bmN0aW9uKG4sIGtleSkge1xuICAgICAgICBjb25zb2xlLmxvZygnQ2hlY2tpbmcgYXNzb2NpYXRpb24nKTtcbiAgICAgICAgY29uc29sZS5sb2cobik7XG4gICAgICAgIGNvbnNvbGUubG9nKGtleSk7XG4gICAgICAgIGNvbnNvbGUubG9nKGVpcHMpO1xuICAgICAgICBjb25zb2xlLmxvZygnUmVmOiAnLG4uUHJvcGVydGllcy5FSVAuUmVmKTtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gaW5zdGFuY2VzW24uUHJvcGVydGllcy5JbnN0YW5jZUlkLlJlZl07XG4gICAgICAgIGlmKGluc3RhbmNlKSB7XG4gICAgICAgICAgdmFyIGVpcCA9IGVpcHNbbi5Qcm9wZXJ0aWVzLkVJUC5SZWZdO1xuICAgICAgICAgIGlmKGVpcCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Fzc29jaWF0aW9uIGhhcyBhIG1hdGNoIScpO1xuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IG5ldyBDb2xsZWN0aW9uKCk7XG4gICAgICAgICAgICBjb250YWluZXIuYWRkKGluc3RhbmNlKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5hZGQoZWlwKTtcbiAgICAgICAgICAgIGNvbWJvSW5zdGFuY2VzW2tleV0gPSBjb250YWluZXI7XG4gICAgICAgICAgICBkZWxldGUgaW5zdGFuY2VzW24uUHJvcGVydGllcy5JbnN0YW5jZUlkLlJlZl07XG4gICAgICAgICAgICBkZWxldGUgZWlwc1tuLlByb3BlcnRpZXMuRUlQLlJlZl07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vdmFyIGVpcCA9IG5ldyBBV1NfRUMyX0VJUChrZXksIGRpbS54LzIsIDUwMCk7XG4gICAgICAgIC8vZWlwc1trZXldID0gZWlwO1xuICAgICAgfSk7XG5cbiAgICAgIF8uZWFjaChjb21ib0luc3RhbmNlcywgZnVuY3Rpb24oY29tYm8sIGtleSkge1xuICAgICAgICBlbGVtZW50cy5hZGQoY29tYm8pO1xuICAgICAgfSk7XG5cbiAgICAgIF8uZWFjaChpbnN0YW5jZXMsIGZ1bmN0aW9uKGluc3RhbmNlLCBrZXkpIHtcbiAgICAgICAgZWxlbWVudHMuYWRkKGluc3RhbmNlKTtcbiAgICAgIH0pO1xuXG4gICAgICBfLmVhY2goZWlwcywgZnVuY3Rpb24oZWlwLCBrZXkpIHtcbiAgICAgICAgZWxlbWVudHMuYWRkKGVpcCk7XG4gICAgICB9KTtcblxuICAgICAgXy5lYWNoKHNlY2dyb3VwcywgZnVuY3Rpb24ocywga2V5KSB7XG4gICAgICAgIGVsZW1lbnRzLmFkZChzKTtcbiAgICAgIH0pO1xuXG4gICAgICAvKlxuICAgICAgXy5lYWNoKGdyb3VwaW5nc1snQVdTOjpFQzI6OkVJUEFzc29jaWF0aW9uJ10sIGZ1bmN0aW9uKG4pIHtcblxuICAgICAgfSk7XG5cbiAgICAgIHZhciBpbnN0YW5jZXMgPSBfLnJlZHVjZSh0ZW1wbGF0ZS5SZXNvdXJjZXMsIGZ1bmN0aW9uKHJlc3VsdCwgbiwga2V5KSB7XG4gICAgICAgIGlmKG4uVHlwZSA9PT0gJ0FXUzo6RUMyOjpJbnN0YW5jZScpIHsgcmVzdWx0W2tleV0gPSBuOyB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCB7fSk7XG4gICAgICBjb25zb2xlLmxvZygnSW5zdGFuY2VzOicpO1xuICAgICAgY29uc29sZS5sb2coaW5zdGFuY2VzKTtcblxuICAgICAgdmFyIHNlY19ncm91cHMgPSBfLnJlZHVjZSh0ZW1wbGF0ZS5SZXNvdXJjZXMsIGZ1bmN0aW9uKHJlc3VsdCwgbiwga2V5KSB7XG4gICAgICAgIGlmKG4uVHlwZSA9PT0gJ0FXUzo6RUMyOjpTZWN1cml0eUdyb3VwJykgeyByZXN1bHRba2V5XSA9IG47IH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0sIHt9KTtcbiAgICAgIGNvbnNvbGUubG9nKCdTZWMgZ3JwczonKTtcbiAgICAgIGNvbnNvbGUubG9nKHNlY19ncm91cHMpO1xuXG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRlbXBsYXRlLlJlc291cmNlcyk7XG4gICAgICB2YXIga2V5TGVuID0ga2V5cy5sZW5ndGg7XG4gICAgICBmb3IodmFyIGkgPTA7IGkgPCBrZXlMZW47IGkrKykge1xuICAgICAgICBjb25zb2xlLmxvZyhrZXlzW2ldKTtcbiAgICAgICAgY29uc29sZS5sb2codGVtcGxhdGUuUmVzb3VyY2VzW2tleXNbaV1dLlR5cGUpO1xuICAgICAgfVxuICAgICAgKi9cblxuICAgICAgLypcbiAgICAgIHZhciBpbnN0YW5jZTEgPSBuZXcgQVdTX0VDMl9JbnN0YW5jZSgnaW5zdGFuY2UxJywgZGltLngvMiwgNDAwKTtcbiAgICAgIGNvbnNvbGUubG9nKGluc3RhbmNlMS5wb3NpdGlvbik7XG4gICAgICBlbGVtZW50cy5hZGQoaW5zdGFuY2UxKTtcbiAgICAgICovXG5cbiAgICAgIC8vY29uc29sZS5sb2coZWxlbWVudHNDb250YWluZXIuZ2V0TG9jYWxCb3VuZHMoKSk7XG5cbiAgICAgIC8vdXNlcnMuYWRkQXJyb3dUbyhpbnN0YW5jZTEpO1xuXG4gICAgICBjb25zb2xlLmxvZygnQ2hpbGRyZW46Jyk7XG4gICAgICBjb25zb2xlLmxvZyhlbGVtZW50cy5jaGlsZHJlbik7XG4gICAgICAvL3ZhciBhcnJvdyA9IEFycm93LmRyYXdCZXR3ZWVuKHVzZXJzLCBpbnN0YW5jZTEpO1xuXG4gICAgICBzdGFnZS5hZGRDaGlsZChlbGVtZW50cyk7XG4gICAgICBjb25zb2xlLmxvZyhzdGFnZS5jaGlsZHJlbik7XG4gICAgfVxuXG4gICAgUElYSS5sb2FkZXJcbiAgICAgIC5hZGQoJy4uL3Jlc291cmNlcy9zcHJpdGVzL3Nwcml0ZXMuanNvbicpXG4gICAgICAubG9hZChvbkxvYWRlZCk7XG5cbiAgICBzdGFnZS5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgdmFyIGdyaWQgPSBzdGFnZS5hZGRDaGlsZChHdWlVdGlsLmRyYXdHcmlkKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSkpO1xuXG4gICAgY29uc29sZS5sb2coJ0FkZGluZyBsaXN0ZW5lci4uLicpO1xuICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgICByZXNpemVHdWlDb250YWluZXIocmVuZGVyZXIpO1xuICAgICAgd2luRGltZW5zaW9uID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcbiAgICAgIC8vY29uc29sZS5sb2cobmV3RGltKTtcbiAgICAgIGNvbnNvbGUubG9nKHN0YWdlKTtcbiAgICAgIHN0YWdlLnJlbW92ZUNoaWxkKGdyaWQpO1xuICAgICAgZ3JpZCA9IHN0YWdlLmFkZENoaWxkKEd1aVV0aWwuZHJhd0dyaWQod2luRGltZW5zaW9uLngsIHdpbkRpbWVuc2lvbi55KSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGVtcGxhdGU6IG9wdGlvbnMudGVtcGxhdGUsXG5cbiAgICAgIGRyYXdDYW52YXNFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBhbmltYXRlKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy92YXIgZWxlbWVudFNpemUgPSAxMDA7XG4gICAgICAgIC8vcmVzaXplR3VpQ29udGFpbmVyKCk7XG5cbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChyZW5kZXJlci52aWV3KTtcblxuICAgICAgICByZW5kZXJlci5yZW5kZXIoc3RhZ2UpO1xuXG4gICAgICAgIGFuaW1hdGUoKTtcblxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBtKCcjZ3VpQ29udGFpbmVyJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0NhbnZhc0VkaXRvcn0pXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUGl4aUVkaXRvcjtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA3LzkvMTUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiByZXNpemVFZGl0b3IoZWRpdG9yKSB7XG4gIGVkaXRvci5zZXRTaXplKG51bGwsIHdpbmRvdy5pbm5lckhlaWdodCk7XG59XG5cbnZhciBTb3VyY2VFZGl0b3IgPSB7XG5cbiAgY29udHJvbGxlcjogZnVuY3Rpb24ob3B0aW9ucykge1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgZHJhd0VkaXRvcjogZnVuY3Rpb24gKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQsIGNvbnRleHQpIHtcblxuICAgICAgICB2YXIgZWRpdG9yID0gbnVsbDtcblxuICAgICAgICBpZiAoaXNJbml0aWFsaXplZCkge1xuICAgICAgICAgIGlmKGVkaXRvcikge1xuICAgICAgICAgICAgZWRpdG9yLnJlZnJlc2goKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZWRpdG9yID0gQ29kZU1pcnJvcihlbGVtZW50LCB7XG4gICAgICAgICAgdmFsdWU6IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMudGVtcGxhdGUoKSwgdW5kZWZpbmVkLCAyKSxcbiAgICAgICAgICBsaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICBtb2RlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgZ3V0dGVyczogWydDb2RlTWlycm9yLWxpbnQtbWFya2VycyddLFxuICAgICAgICAgIGxpbnQ6IHRydWUsXG4gICAgICAgICAgc3R5bGVBY3RpdmVMaW5lOiB0cnVlLFxuICAgICAgICAgIGF1dG9DbG9zZUJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIG1hdGNoQnJhY2tldHM6IHRydWUsXG4gICAgICAgICAgdGhlbWU6ICd6ZW5idXJuJ1xuICAgICAgICB9KTtcblxuICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcblxuICAgICAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJlc2l6ZUVkaXRvcihlZGl0b3IpO1xuICAgICAgICB9KTtcblxuICAgICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGVkaXRvcikge1xuICAgICAgICAgIG0uc3RhcnRDb21wdXRhdGlvbigpO1xuICAgICAgICAgIG9wdGlvbnMudGVtcGxhdGUoSlNPTi5wYXJzZShlZGl0b3IuZ2V0VmFsdWUoKSkpO1xuICAgICAgICAgIG0uZW5kQ29tcHV0YXRpb24oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIH1cbiAgICB9O1xuICB9LFxuICB2aWV3OiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIG0oJyNzb3VyY2VFZGl0b3InLCB7IGNvbmZpZzogY29udHJvbGxlci5kcmF3RWRpdG9yIH0pXG4gICAgXVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNvdXJjZUVkaXRvcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFNvdXJjZUVkaXRvciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9zb3VyY2UuZWRpdG9yJyk7XG52YXIgUGl4aUVkaXRvciA9IHJlcXVpcmUoJy4vY29tcG9uZW50cy9waXhpLmVkaXRvcicpO1xuXG52YXIgdGVzdERhdGEgPSByZXF1aXJlKCcuL3Rlc3REYXRhL2VjMi5qc29uJyk7XG5cbnZhciB0ZW1wbGF0ZSA9IG0ucHJvcCh0ZXN0RGF0YSk7XG5cbm0ubW91bnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nsb3Vkc2xpY2VyLWFwcCcpLCBtLmNvbXBvbmVudChQaXhpRWRpdG9yLCB7XG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIH0pXG4pO1xuXG5tLm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb2RlLWJhcicpLCBtLmNvbXBvbmVudChTb3VyY2VFZGl0b3IsIHtcbiAgICB0ZW1wbGF0ZTogdGVtcGxhdGVcbiAgfSlcbik7XG4iLCJtb2R1bGUuZXhwb3J0cz1cbntcbiAgXCJBV1NUZW1wbGF0ZUZvcm1hdFZlcnNpb25cIiA6IFwiMjAxMC0wOS0wOVwiLFxuXG4gIFwiRGVzY3JpcHRpb25cIiA6IFwiQVdTIENsb3VkRm9ybWF0aW9uIFNhbXBsZSBUZW1wbGF0ZSBFQzJJbnN0YW5jZVdpdGhTZWN1cml0eUdyb3VwU2FtcGxlOiBDcmVhdGUgYW4gQW1hem9uIEVDMiBpbnN0YW5jZSBydW5uaW5nIHRoZSBBbWF6b24gTGludXggQU1JLiBUaGUgQU1JIGlzIGNob3NlbiBiYXNlZCBvbiB0aGUgcmVnaW9uIGluIHdoaWNoIHRoZSBzdGFjayBpcyBydW4uIFRoaXMgZXhhbXBsZSBjcmVhdGVzIGFuIEVDMiBzZWN1cml0eSBncm91cCBmb3IgdGhlIGluc3RhbmNlIHRvIGdpdmUgeW91IFNTSCBhY2Nlc3MuICoqV0FSTklORyoqIFRoaXMgdGVtcGxhdGUgY3JlYXRlcyBhbiBBbWF6b24gRUMyIGluc3RhbmNlLiBZb3Ugd2lsbCBiZSBiaWxsZWQgZm9yIHRoZSBBV1MgcmVzb3VyY2VzIHVzZWQgaWYgeW91IGNyZWF0ZSBhIHN0YWNrIGZyb20gdGhpcyB0ZW1wbGF0ZS5cIixcblxuICBcIlBhcmFtZXRlcnNcIiA6IHtcbiAgICBcIktleU5hbWVcIjoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJOYW1lIG9mIGFuIGV4aXN0aW5nIEVDMiBLZXlQYWlyIHRvIGVuYWJsZSBTU0ggYWNjZXNzIHRvIHRoZSBpbnN0YW5jZVwiLFxuICAgICAgXCJUeXBlXCI6IFwiQVdTOjpFQzI6OktleVBhaXI6OktleU5hbWVcIixcbiAgICAgIFwiQ29uc3RyYWludERlc2NyaXB0aW9uXCIgOiBcIm11c3QgYmUgdGhlIG5hbWUgb2YgYW4gZXhpc3RpbmcgRUMyIEtleVBhaXIuXCJcbiAgICB9LFxuXG4gICAgXCJJbnN0YW5jZVR5cGVcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiV2ViU2VydmVyIEVDMiBpbnN0YW5jZSB0eXBlXCIsXG4gICAgICBcIlR5cGVcIiA6IFwiU3RyaW5nXCIsXG4gICAgICBcIkRlZmF1bHRcIiA6IFwibTEuc21hbGxcIixcbiAgICAgIFwiQWxsb3dlZFZhbHVlc1wiIDogWyBcInQxLm1pY3JvXCIsIFwidDIubWljcm9cIiwgXCJ0Mi5zbWFsbFwiLCBcInQyLm1lZGl1bVwiLCBcIm0xLnNtYWxsXCIsIFwibTEubWVkaXVtXCIsIFwibTEubGFyZ2VcIiwgXCJtMS54bGFyZ2VcIiwgXCJtMi54bGFyZ2VcIiwgXCJtMi4yeGxhcmdlXCIsIFwibTIuNHhsYXJnZVwiLCBcIm0zLm1lZGl1bVwiLCBcIm0zLmxhcmdlXCIsIFwibTMueGxhcmdlXCIsIFwibTMuMnhsYXJnZVwiLCBcImMxLm1lZGl1bVwiLCBcImMxLnhsYXJnZVwiLCBcImMzLmxhcmdlXCIsIFwiYzMueGxhcmdlXCIsIFwiYzMuMnhsYXJnZVwiLCBcImMzLjR4bGFyZ2VcIiwgXCJjMy44eGxhcmdlXCIsIFwiYzQubGFyZ2VcIiwgXCJjNC54bGFyZ2VcIiwgXCJjNC4yeGxhcmdlXCIsIFwiYzQuNHhsYXJnZVwiLCBcImM0Ljh4bGFyZ2VcIiwgXCJnMi4yeGxhcmdlXCIsIFwicjMubGFyZ2VcIiwgXCJyMy54bGFyZ2VcIiwgXCJyMy4yeGxhcmdlXCIsIFwicjMuNHhsYXJnZVwiLCBcInIzLjh4bGFyZ2VcIiwgXCJpMi54bGFyZ2VcIiwgXCJpMi4yeGxhcmdlXCIsIFwiaTIuNHhsYXJnZVwiLCBcImkyLjh4bGFyZ2VcIiwgXCJkMi54bGFyZ2VcIiwgXCJkMi4yeGxhcmdlXCIsIFwiZDIuNHhsYXJnZVwiLCBcImQyLjh4bGFyZ2VcIiwgXCJoaTEuNHhsYXJnZVwiLCBcImhzMS44eGxhcmdlXCIsIFwiY3IxLjh4bGFyZ2VcIiwgXCJjYzIuOHhsYXJnZVwiLCBcImNnMS40eGxhcmdlXCJdXG4gICAgLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBiZSBhIHZhbGlkIEVDMiBpbnN0YW5jZSB0eXBlLlwiXG4gICAgfSxcblxuICAgIFwiU1NITG9jYXRpb25cIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiVGhlIElQIGFkZHJlc3MgcmFuZ2UgdGhhdCBjYW4gYmUgdXNlZCB0byBTU0ggdG8gdGhlIEVDMiBpbnN0YW5jZXNcIixcbiAgICAgIFwiVHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJNaW5MZW5ndGhcIjogXCI5XCIsXG4gICAgICBcIk1heExlbmd0aFwiOiBcIjE4XCIsXG4gICAgICBcIkRlZmF1bHRcIjogXCIwLjAuMC4wLzBcIixcbiAgICAgIFwiQWxsb3dlZFBhdHRlcm5cIjogXCIoXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSkvKFxcXFxkezEsMn0pXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiOiBcIm11c3QgYmUgYSB2YWxpZCBJUCBDSURSIHJhbmdlIG9mIHRoZSBmb3JtIHgueC54LngveC5cIlxuICAgIH1cbiAgfSxcblxuICBcIk1hcHBpbmdzXCIgOiB7XG4gICAgXCJBV1NJbnN0YW5jZVR5cGUyQXJjaFwiIDoge1xuICAgICAgXCJ0MS5taWNyb1wiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwidDIubWljcm9cIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInQyLnNtYWxsXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJ0Mi5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTEuc21hbGxcIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0zLm1lZGl1bVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMS5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwiYzEueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcImMzLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0Ljh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJnMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNRzJcIiAgfSxcbiAgICAgIFwicjMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImhpMS40eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJoczEuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiY3IxLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImNjMi44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9XG4gICAgfVxuICAsXG4gICAgXCJBV1NSZWdpb25BcmNoMkFNSVwiIDoge1xuICAgICAgXCJ1cy1lYXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS0wZjRjZmQ2NFwiLCBcIkhWTTY0XCIgOiBcImFtaS0wZDRjZmQ2NlwiLCBcIkhWTUcyXCIgOiBcImFtaS01YjA1YmEzMFwifSxcbiAgICAgIFwidXMtd2VzdC0yXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktZDNjNWQxZTNcIiwgXCJIVk02NFwiIDogXCJhbWktZDVjNWQxZTVcIiwgXCJIVk1HMlwiIDogXCJhbWktYTlkNmMwOTlcIn0sXG4gICAgICBcInVzLXdlc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTg1ZWExM2MxXCIsIFwiSFZNNjRcIiA6IFwiYW1pLTg3ZWExM2MzXCIsIFwiSFZNRzJcIiA6IFwiYW1pLTM3ODI3YTczXCJ9LFxuICAgICAgXCJldS13ZXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kNmQxOGVhMVwiLCBcIkhWTTY0XCIgOiBcImFtaS1lNGQxOGU5M1wiLCBcIkhWTUcyXCIgOiBcImFtaS03MmE5ZjEwNVwifSxcbiAgICAgIFwiZXUtY2VudHJhbC0xXCIgICAgIDoge1wiUFY2NFwiIDogXCJhbWktYTRiMGI3YjlcIiwgXCJIVk02NFwiIDogXCJhbWktYTZiMGI3YmJcIiwgXCJIVk1HMlwiIDogXCJhbWktYTZjOWNmYmJcIn0sXG4gICAgICBcImFwLW5vcnRoZWFzdC0xXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTFhMWI5ZjFhXCIsIFwiSFZNNjRcIiA6IFwiYW1pLTFjMWI5ZjFjXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWY2NDRjNGY2XCJ9LFxuICAgICAgXCJhcC1zb3V0aGVhc3QtMVwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kMjRiNDI4MFwiLCBcIkhWTTY0XCIgOiBcImFtaS1kNDRiNDI4NlwiLCBcIkhWTUcyXCIgOiBcImFtaS0xMmI1YmM0MFwifSxcbiAgICAgIFwiYXAtc291dGhlYXN0LTJcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktZWY3YjM5ZDVcIiwgXCJIVk02NFwiIDogXCJhbWktZGI3YjM5ZTFcIiwgXCJIVk1HMlwiIDogXCJhbWktYjMzMzdlODlcIn0sXG4gICAgICBcInNhLWVhc3QtMVwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLTViMDk4MTQ2XCIsIFwiSFZNNjRcIiA6IFwiYW1pLTU1MDk4MTQ4XCIsIFwiSFZNRzJcIiA6IFwiTk9UX1NVUFBPUlRFRFwifSxcbiAgICAgIFwiY24tbm9ydGgtMVwiICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktYmVjNDU4ODdcIiwgXCJIVk02NFwiIDogXCJhbWktYmNjNDU4ODVcIiwgXCJIVk1HMlwiIDogXCJOT1RfU1VQUE9SVEVEXCJ9XG4gICAgfVxuXG4gIH0sXG5cbiAgXCJSZXNvdXJjZXNcIiA6IHtcbiAgICBcIkVDMkluc3RhbmNlXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6Okluc3RhbmNlXCIsXG4gICAgICBcIlByb3BlcnRpZXNcIiA6IHtcbiAgICAgICAgXCJJbnN0YW5jZVR5cGVcIiA6IHsgXCJSZWZcIiA6IFwiSW5zdGFuY2VUeXBlXCIgfSxcbiAgICAgICAgXCJTZWN1cml0eUdyb3Vwc1wiIDogWyB7IFwiUmVmXCIgOiBcIkluc3RhbmNlU2VjdXJpdHlHcm91cFwiIH0gXSxcbiAgICAgICAgXCJLZXlOYW1lXCIgOiB7IFwiUmVmXCIgOiBcIktleU5hbWVcIiB9LFxuICAgICAgICBcIkltYWdlSWRcIiA6IHsgXCJGbjo6RmluZEluTWFwXCIgOiBbIFwiQVdTUmVnaW9uQXJjaDJBTUlcIiwgeyBcIlJlZlwiIDogXCJBV1M6OlJlZ2lvblwiIH0sXG4gICAgICAgICAgeyBcIkZuOjpGaW5kSW5NYXBcIiA6IFsgXCJBV1NJbnN0YW5jZVR5cGUyQXJjaFwiLCB7IFwiUmVmXCIgOiBcIkluc3RhbmNlVHlwZVwiIH0sIFwiQXJjaFwiIF0gfSBdIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJJbnN0YW5jZVNlY3VyaXR5R3JvdXBcIiA6IHtcbiAgICAgIFwiVHlwZVwiIDogXCJBV1M6OkVDMjo6U2VjdXJpdHlHcm91cFwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiR3JvdXBEZXNjcmlwdGlvblwiIDogXCJFbmFibGUgU1NIIGFjY2VzcyB2aWEgcG9ydCAyMlwiLFxuICAgICAgICBcIlNlY3VyaXR5R3JvdXBJbmdyZXNzXCIgOiBbIHtcbiAgICAgICAgICBcIklwUHJvdG9jb2xcIiA6IFwidGNwXCIsXG4gICAgICAgICAgXCJGcm9tUG9ydFwiIDogXCIyMlwiLFxuICAgICAgICAgIFwiVG9Qb3J0XCIgOiBcIjIyXCIsXG4gICAgICAgICAgXCJDaWRySXBcIiA6IHsgXCJSZWZcIiA6IFwiU1NITG9jYXRpb25cIn1cbiAgICAgICAgfSBdXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIFwiT3V0cHV0c1wiIDoge1xuICAgIFwiSW5zdGFuY2VJZFwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJJbnN0YW5jZUlkIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIlJlZlwiIDogXCJFQzJJbnN0YW5jZVwiIH1cbiAgICB9LFxuICAgIFwiQVpcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiQXZhaWxhYmlsaXR5IFpvbmUgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiRm46OkdldEF0dFwiIDogWyBcIkVDMkluc3RhbmNlXCIsIFwiQXZhaWxhYmlsaXR5Wm9uZVwiIF0gfVxuICAgIH0sXG4gICAgXCJQdWJsaWNETlNcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiUHVibGljIEROU05hbWUgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiRm46OkdldEF0dFwiIDogWyBcIkVDMkluc3RhbmNlXCIsIFwiUHVibGljRG5zTmFtZVwiIF0gfVxuICAgIH0sXG4gICAgXCJQdWJsaWNJUFwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJQdWJsaWMgSVAgYWRkcmVzcyBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJGbjo6R2V0QXR0XCIgOiBbIFwiRUMySW5zdGFuY2VcIiwgXCJQdWJsaWNJcFwiIF0gfVxuICAgIH1cbiAgfVxufVxuIl19
