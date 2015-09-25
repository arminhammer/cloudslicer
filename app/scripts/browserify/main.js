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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2Fycm93LmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9hd3MvQVdTX0VDMl9FSVAuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2F3cy9BV1NfRUMyX0luc3RhbmNlLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9hd3MvQVdTX0VDMl9TZWN1cml0eUdyb3VwLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9hd3MvQVdTX1VzZXJzLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9jb2xsZWN0aW9uLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9kcmFnLmRyb3AuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2VsZW1lbnQuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2d1aS51dGlsLmpzIiwiYXBwL3NjcmlwdHMvY29tcG9uZW50cy9waXhpLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL2NvbXBvbmVudHMvc291cmNlLmVkaXRvci5qcyIsImFwcC9zY3JpcHRzL21haW4uanMiLCJhcHAvc2NyaXB0cy90ZXN0RGF0YS9lYzIuanNvbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMTcvMTUuXG4gKi9cblxudmFyIEFycm93ID0ge1xuXG4gIGRyYXdCZXR3ZWVuOiBmdW5jdGlvbihhLCBiKSB7XG5cbiAgICB2YXIgYXJyb3cgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXG4gICAgY29uc29sZS5sb2coYS5nZXRCb3VuZHMoKSk7XG4gICAgY29uc29sZS5sb2coYi5nZXRCb3VuZHMoKSk7XG5cbiAgICAvKlxuICAgIGFycm93LmxpbmVTdHlsZSgxLCAweEU1RTVFNSwgMSk7XG4gICAgd2hpbGUgKGNvdW50IDwgd2lkdGgpIHtcbiAgICAgIGdyaWQubW92ZVRvKGNvdW50LCAwKTtcbiAgICAgIGdyaWQubGluZVRvKGNvdW50LCBoZWlnaHQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICBjb3VudCA9IGludGVydmFsO1xuICAgIHdoaWxlKGNvdW50IDwgaGVpZ2h0KSB7XG4gICAgICBncmlkLm1vdmVUbygwLCBjb3VudCk7XG4gICAgICBncmlkLmxpbmVUbyh3aWR0aCwgY291bnQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICByZXR1cm4gYXJyb3c7XG4gICAgKi9cbiAgfVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFycm93O1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTkvMTUuXG4gKi9cblxudmFyIEVsZW1lbnQgPSByZXF1aXJlKCcuLi9lbGVtZW50Jyk7XG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuLi9kcmFnLmRyb3AnKTtcblxudmFyIEFXU19FQzJfRUlQID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgRWxlbWVudC5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYubmFtZSA9IG5hbWU7XG4gIHNlbGYuc2NhbGUuc2V0KDAuMyk7XG4gIHNlbGYudGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ0NvbXB1dGVfJl9OZXR3b3JraW5nX0FtYXpvbl9FQzJfRWxhc3RpY19JUC5wbmcnKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcbn07XG5BV1NfRUMyX0VJUC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfRUMyX0VJUDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE5LzE1LlxuICovXG5cbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi4vZWxlbWVudCcpO1xudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi4vZHJhZy5kcm9wJyk7XG5cbnZhciBBV1NfRUMyX0luc3RhbmNlID0gZnVuY3Rpb24obmFtZSx4LHkpIHtcbiAgRWxlbWVudC5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYubmFtZSA9IG5hbWU7XG4gIHNlbGYudGV4dHVyZSA9IFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoJ0NvbXB1dGVfJl9OZXR3b3JraW5nX0FtYXpvbl9FQzJfSW5zdGFuY2UucG5nJyk7XG4gIHNlbGYucG9zaXRpb24ueCA9IHg7XG4gIHNlbGYucG9zaXRpb24ueSA9IHk7XG59O1xuQVdTX0VDMl9JbnN0YW5jZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfRUMyX0luc3RhbmNlO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMjEvMTUuXG4gKi9cblxudmFyIENvbGxlY3Rpb24gPSByZXF1aXJlKCcuLi9jb2xsZWN0aW9uJyk7XG5cbnZhciBBV1NfRUMyX1NlY3VyaXR5R3JvdXAgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBDb2xsZWN0aW9uLmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcblxuICBzZWxmLmRyYXcgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICBzZWxmLmRyYXcubGluZVN0eWxlKDMsIDB4MDAwMDAwLCAxKTtcbiAgLy9zZWxmLmRyYXcubW92ZVRvKHgseSk7XG4gIHNlbGYuZHJhdy5kcmF3Um91bmRlZFJlY3QoeCx5LDIwMCwyMDAsMTApO1xuICBzZWxmLmFkZChzZWxmLmRyYXcpO1xuXG59O1xuQVdTX0VDMl9TZWN1cml0eUdyb3VwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ29sbGVjdGlvbi5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFXU19FQzJfU2VjdXJpdHlHcm91cDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA5LzE5LzE1LlxuICovXG5cbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi4vZWxlbWVudCcpO1xudmFyIERyYWdEcm9wID0gcmVxdWlyZSgnLi4vZHJhZy5kcm9wJyk7XG5cbnZhciBBV1NfVXNlcnMgPSBmdW5jdGlvbihuYW1lLHgseSkge1xuICBFbGVtZW50LmNhbGwodGhpcyk7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgc2VsZi5uYW1lID0gbmFtZTtcbiAgc2VsZi50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnTm9uLVNlcnZpY2VfU3BlY2lmaWNfY29weV9Vc2Vycy5wbmcnKTtcbiAgc2VsZi5wb3NpdGlvbi54ID0geDtcbiAgc2VsZi5wb3NpdGlvbi55ID0geTtcblxufTtcbkFXU19Vc2Vycy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEVsZW1lbnQucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBV1NfVXNlcnM7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5nIG9uIDkvMjEvMTUuXG4gKi9cbi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8xNS8xNS5cbiAqL1xuXG52YXIgQ29sbGVjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICBQSVhJLkNvbnRhaW5lci5jYWxsKHRoaXMpO1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgc2VsZi5lbGVtZW50cyA9IHt9O1xuXG4gIHNlbGYuYWRkID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgIHNlbGYuYWRkQ2hpbGQoZWxlbWVudCk7XG4gICAgc2VsZi5lbGVtZW50c1tlbGVtZW50Lm5hbWVdID0gZWxlbWVudDtcbiAgfTtcblxuICBzZWxmLnJlbW92ZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICBzZWxmLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xuICAgIGRlbGV0ZSBzZWxmLmVsZW1lbnRzW2VsZW1lbnQubmFtZV07XG4gIH07XG5cbn07XG5Db2xsZWN0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUElYSS5Db250YWluZXIucHJvdG90eXBlKTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb2xsZWN0aW9uO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGFybWluaGFtbWVyIG9uIDkvMTQvMTUuXG4gKi9cblxudmFyIE1PVVNFX09WRVJfU0NBTEVfUkFUSU8gPSAxLjE7XG5cbnZhciBEcmFnRHJvcCA9IHtcblxuICBvbkRyYWdTdGFydDogZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygpO1xuICAgIHRoaXMuZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgdGhpcy5hbHBoYSA9IDAuNTtcbiAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcbiAgICB0aGlzLm1vdmVkID0gZmFsc2U7XG4gIH0sXG5cbiAgb25EcmFnRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLm1vdmVkKSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgZHJhZ2dpbmcnKTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5tb3ZlZCA9IGZhbHNlO1xuICAgICAgdGhpcy5kYXRhID0gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnRm91bmQgY2xpY2sgd2hpbGUgTk9UIGRyYWdnaW5nJyk7XG4gICAgICB2YXIgc2hhZG93ID0gbmV3IFBJWEkuZmlsdGVycy5Ecm9wU2hhZG93RmlsdGVyKCk7XG4gICAgICB0aGlzLmZpbHRlcnMgPSBbc2hhZG93XTtcbiAgICAgIHRoaXMuYWxwaGEgPSAxO1xuICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuICAgIH1cbiAgfSxcblxuICBvbkRyYWdNb3ZlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuZHJhZ2dpbmcpXG4gICAge1xuICAgICAgdmFyIG5ld1Bvc2l0aW9uID0gc2VsZi5kYXRhLmdldExvY2FsUG9zaXRpb24oc2VsZi5wYXJlbnQpO1xuICAgICAgc2VsZi5wb3NpdGlvbi54ID0gbmV3UG9zaXRpb24ueDtcbiAgICAgIHNlbGYucG9zaXRpb24ueSA9IG5ld1Bvc2l0aW9uLnk7XG4gICAgICBzZWxmLm1vdmVkID0gdHJ1ZTtcbiAgICB9XG4gIH0sXG5cbiAgb25Nb3VzZU92ZXI6IGZ1bmN0aW9uKCkge1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlZCBvdmVyIScpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqTU9VU0VfT1ZFUl9TQ0FMRV9SQVRJTyk7XG4gICAgdmFyIGljb25TaXplID0gMTA7XG5cbiAgICB2YXIgZ2xvYmFsID0gc2VsZi50b0dsb2JhbChzZWxmLnBvc2l0aW9uKTtcbiAgICAvL2NvbnNvbGUubG9nKCdvZmZpY2lhbDogJyArIHNlbGYucG9zaXRpb24ueCArICc6JyArIHNlbGYucG9zaXRpb24ueSk7XG4gICAgLy9jb25zb2xlLmxvZygnR0xPQkFMOiAnICsgZ2xvYmFsLnggKyAnOicgKyBnbG9iYWwueSk7XG4gICAgLy9jb25zb2xlLmxvZyhzZWxmLmdldExvY2FsQm91bmRzKCkpO1xuXG4gICAgdmFyIHNjYWxlTG9jYXRpb25zID0gW1xuICAgICAge3g6IDAsIHk6IDAtc2VsZi5nZXRMb2NhbEJvdW5kcygpLmhlaWdodC8yLWljb25TaXplLzIsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiAwLXNlbGYuZ2V0TG9jYWxCb3VuZHMoKS53aWR0aC8yLWljb25TaXplLzIsIHk6IDAsIHNpemU6IGljb25TaXplfSxcbiAgICAgIHt4OiBzZWxmLmdldExvY2FsQm91bmRzKCkud2lkdGgvMitpY29uU2l6ZS8yLCB5OiAwLCBzaXplOiBpY29uU2l6ZX0sXG4gICAgICB7eDogMCwgeTogc2VsZi5nZXRMb2NhbEJvdW5kcygpLmhlaWdodC8yK2ljb25TaXplLzIsIHNpemU6IGljb25TaXplfVxuICAgIF07XG5cbiAgICAvL2NvbnNvbGUubG9nKHNjYWxlTG9jYXRpb25zWzBdKTtcblxuICAgIHNlbGYuc2NhbGVJY29ucyA9IFtdO1xuXG4gICAgc2NhbGVMb2NhdGlvbnMuZm9yRWFjaChmdW5jdGlvbihsb2MpIHtcbiAgICAgIHZhciBpY29uID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICAgIGljb24ubW92ZVRvKDAsMCk7XG4gICAgICBpY29uLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgIGljb24uYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgICBpY29uLmxpbmVTdHlsZSgxLCAweDAwMDBGRiwgMSk7XG4gICAgICBpY29uLmJlZ2luRmlsbCgweEZGRkZGRiwgMSk7XG4gICAgICBpY29uLmRyYXdDaXJjbGUobG9jLngsIGxvYy55LCBsb2Muc2l6ZSk7XG4gICAgICBpY29uLmVuZEZpbGwoKTtcblxuICAgICAgLy9pY29uXG4gICAgICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBzdGFydFxuICAgICAgICAvLy5vbignbW91c2Vkb3duJywgb25TY2FsZUljb25EcmFnU3RhcnQpXG4gICAgICAgIC8vLm9uKCd0b3VjaHN0YXJ0Jywgb25TY2FsZUljb25EcmFnU3RhcnQpO1xuICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIGVuZFxuICAgICAgLy8ub24oJ21vdXNldXAnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbignbW91c2V1cG91dHNpZGUnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbigndG91Y2hlbmQnLCBvbkRyYWdFbmQpXG4gICAgICAvLy5vbigndG91Y2hlbmRvdXRzaWRlJywgb25EcmFnRW5kKVxuICAgICAgLy8gZXZlbnRzIGZvciBkcmFnIG1vdmVcbiAgICAgIC8vLm9uKCdtb3VzZW1vdmUnLCBvbkRyYWdNb3ZlKVxuICAgICAgLy8ub24oJ3RvdWNobW92ZScsIG9uRHJhZ01vdmUpXG5cbiAgICAgIHNlbGYuc2NhbGVJY29ucy5wdXNoKGljb24pO1xuXG4gICAgfSk7XG5cbiAgICBzZWxmLnNjYWxlSWNvbnMuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICBzZWxmLmFkZENoaWxkKHMpO1xuICAgIH0pO1xuXG4gICAgc2VsZi50b29sdGlwID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICBzZWxmLnRvb2x0aXAubGluZVN0eWxlKDMsIDB4MDAwMEZGLCAxKTtcbiAgICBzZWxmLnRvb2x0aXAuYmVnaW5GaWxsKDB4MDAwMDAwLCAxKTtcbiAgICAvL3NlbGYuZHJhdy5tb3ZlVG8oeCx5KTtcbiAgICBzZWxmLnRvb2x0aXAuZHJhd1JvdW5kZWRSZWN0KDArMjAsLXNlbGYuaGVpZ2h0LDIwMCwxMDAsMTApO1xuICAgIHNlbGYudG9vbHRpcC5lbmRGaWxsKCk7XG4gICAgc2VsZi50b29sdGlwLnRleHRTdHlsZSA9IHtcbiAgICAgIGZvbnQgOiAnYm9sZCBpdGFsaWMgMjhweCBBcmlhbCcsXG4gICAgICBmaWxsIDogJyNGN0VEQ0EnLFxuICAgICAgc3Ryb2tlIDogJyM0YTE4NTAnLFxuICAgICAgc3Ryb2tlVGhpY2tuZXNzIDogNSxcbiAgICAgIGRyb3BTaGFkb3cgOiB0cnVlLFxuICAgICAgZHJvcFNoYWRvd0NvbG9yIDogJyMwMDAwMDAnLFxuICAgICAgZHJvcFNoYWRvd0FuZ2xlIDogTWF0aC5QSSAvIDYsXG4gICAgICBkcm9wU2hhZG93RGlzdGFuY2UgOiA2LFxuICAgICAgd29yZFdyYXAgOiB0cnVlLFxuICAgICAgd29yZFdyYXBXaWR0aCA6IDQ0MFxuICAgIH07XG5cbiAgICBzZWxmLnRvb2x0aXAudGV4dCA9IG5ldyBQSVhJLlRleHQoc2VsZi5uYW1lLHNlbGYudG9vbHRpcC50ZXh0U3R5bGUpO1xuICAgIHNlbGYudG9vbHRpcC50ZXh0LnggPSAwKzMwO1xuICAgIHNlbGYudG9vbHRpcC50ZXh0LnkgPSAtc2VsZi5oZWlnaHQ7XG5cbiAgICB2YXIgdG9vbHRpcFR3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHNlbGYudG9vbHRpcClcbiAgICAgIC50byh7eDpzZWxmLndpZHRofSw3MDApXG4gICAgICAuZWFzaW5nKCBUV0VFTi5FYXNpbmcuRWxhc3RpYy5Jbk91dCApXG4gICAgICAuc3RhcnQoKTtcbiAgICB2YXIgdG9vbHRpcFRleHRUd2VlbiA9IG5ldyBUV0VFTi5Ud2VlbihzZWxmLnRvb2x0aXAudGV4dClcbiAgICAgIC50byh7eDpzZWxmLndpZHRoKzIwfSw3MDApXG4gICAgICAuZWFzaW5nKCBUV0VFTi5FYXNpbmcuRWxhc3RpYy5Jbk91dCApXG4gICAgICAuc3RhcnQoKTtcblxuICAgIGNvbnNvbGUubG9nKCdBZGRpbmcgdG9vbHRpcCcpO1xuICAgIHNlbGYuYWRkQ2hpbGQoc2VsZi50b29sdGlwKTtcblxuICAgIHNlbGYuYWRkQ2hpbGQoc2VsZi50b29sdGlwLnRleHQpO1xuICB9LFxuXG4gIG9uTW91c2VPdXQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vY29uc29sZS5sb2coJ01vdXNlZCBvdXQhJyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHNlbGYuc2NhbGUuc2V0KHNlbGYuc2NhbGUueC9NT1VTRV9PVkVSX1NDQUxFX1JBVElPKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAvL2NvbnNvbGUubG9nKCdNb3VzZSBvdXQnKTtcbiAgICB0aGlzLnNjYWxlSWNvbnMuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICBzZWxmLnJlbW92ZUNoaWxkKHMpO1xuICAgIH0pO1xuICAgIC8vY29uc29sZS5sb2coJ1NpemU6ICcpO1xuICAgIC8vY29uc29sZS5sb2codGhpcy5nZXRCb3VuZHMoKSk7XG5cbiAgICBzZWxmLnJlbW92ZUNoaWxkKHNlbGYudG9vbHRpcCk7XG4gICAgc2VsZi5yZW1vdmVDaGlsZChzZWxmLnRvb2x0aXAudGV4dCk7XG4gIH0sXG5cbiAgb25TY2FsZUljb25EcmFnU3RhcnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdGhpcy5kYXRhID0gZXZlbnQuZGF0YTtcbiAgICB0aGlzLmFscGhhID0gMC41O1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICAgIGNvbnNvbGUubG9nKCdSZXNpemluZyEnKTtcbiAgfVxuXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRHJhZ0Ryb3A7XG5cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmcgb24gOS8xNS8xNS5cbiAqL1xuXG52YXIgRHJhZ0Ryb3AgPSByZXF1aXJlKCcuL2RyYWcuZHJvcCcpO1xuXG52YXIgREVGQVVMVF9TQ0FMRSA9IDAuNztcblxudmFyIEVsZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgUElYSS5TcHJpdGUuY2FsbCh0aGlzKTtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIHNlbGYuc2NhbGUuc2V0KERFRkFVTFRfU0NBTEUpO1xuICBzZWxmLmFuY2hvci5zZXQoMC41KTtcbiAgc2VsZi5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gIHNlbGYuYnV0dG9uTW9kZSA9IHRydWU7XG4gIHNlbGZcbiAgICAvLyBldmVudHMgZm9yIGRyYWcgc3RhcnRcbiAgICAub24oJ21vdXNlZG93bicsIERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC5vbigndG91Y2hzdGFydCcsIERyYWdEcm9wLm9uRHJhZ1N0YXJ0KVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBlbmRcbiAgICAub24oJ21vdXNldXAnLCBEcmFnRHJvcC5vbkRyYWdFbmQpXG4gICAgLm9uKCdtb3VzZXVwb3V0c2lkZScsIERyYWdEcm9wLm9uRHJhZ0VuZClcbiAgICAub24oJ3RvdWNoZW5kJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC5vbigndG91Y2hlbmRvdXRzaWRlJywgRHJhZ0Ryb3Aub25EcmFnRW5kKVxuICAgIC8vIGV2ZW50cyBmb3IgZHJhZyBtb3ZlXG4gICAgLm9uKCdtb3VzZW1vdmUnLCBEcmFnRHJvcC5vbkRyYWdNb3ZlKVxuICAgIC5vbigndG91Y2htb3ZlJywgRHJhZ0Ryb3Aub25EcmFnTW92ZSlcbiAgICAvLyBldmVudHMgZm9yIG1vdXNlIG92ZXJcbiAgICAub24oJ21vdXNlb3ZlcicsIERyYWdEcm9wLm9uTW91c2VPdmVyKVxuICAgIC5vbignbW91c2VvdXQnLCBEcmFnRHJvcC5vbk1vdXNlT3V0KTtcblxuICBzZWxmLmFycm93cyA9IFtdO1xuXG4gIHNlbGYuYWRkQXJyb3dUbyA9IGZ1bmN0aW9uKGIpIHtcbiAgICBzZWxmLmFycm93cy5wdXNoKGIpO1xuICB9O1xuXG4gIHNlbGYucmVtb3ZlQXJyb3dUbyA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgc2VsZi5hcnJvd3MucmVtb3ZlKGluZGV4KTtcbiAgfTtcblxufTtcbkVsZW1lbnQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShQSVhJLlNwcml0ZS5wcm90b3R5cGUpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnQ7XG4iLCJcbnZhciBHdWlVdGlsID0ge1xuXG4gIGdldFdpbmRvd0RpbWVuc2lvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHsgeDogd2luZG93LmlubmVyV2lkdGgsIHk6IHdpbmRvdy5pbm5lckhlaWdodCB9O1xuICB9LFxuXG4gIGRyYXdHcmlkOiBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdmFyIGdyaWQgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIHZhciBpbnRlcnZhbCA9IDEwMDtcbiAgICB2YXIgY291bnQgPSBpbnRlcnZhbDtcbiAgICBncmlkLmxpbmVTdHlsZSgxLCAweEU1RTVFNSwgMSk7XG4gICAgd2hpbGUgKGNvdW50IDwgd2lkdGgpIHtcbiAgICAgIGdyaWQubW92ZVRvKGNvdW50LCAwKTtcbiAgICAgIGdyaWQubGluZVRvKGNvdW50LCBoZWlnaHQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICBjb3VudCA9IGludGVydmFsO1xuICAgIHdoaWxlKGNvdW50IDwgaGVpZ2h0KSB7XG4gICAgICBncmlkLm1vdmVUbygwLCBjb3VudCk7XG4gICAgICBncmlkLmxpbmVUbyh3aWR0aCwgY291bnQpO1xuICAgICAgY291bnQgPSBjb3VudCArIGludGVydmFsO1xuICAgIH1cbiAgICB2YXIgY29udGFpbmVyID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG4gICAgY29udGFpbmVyLmFkZENoaWxkKGdyaWQpO1xuICAgIGNvbnRhaW5lci5jYWNoZUFzQml0bWFwID0gdHJ1ZTtcbiAgICByZXR1cm4gY29udGFpbmVyO1xuICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR3VpVXRpbDtcbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA3LzkvMTUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgR3VpVXRpbCA9IHJlcXVpcmUoJy4vZ3VpLnV0aWwnKTtcbnZhciBFbGVtZW50ID0gcmVxdWlyZSgnLi9lbGVtZW50Jyk7XG52YXIgQXJyb3cgPSByZXF1aXJlKCcuL2Fycm93Jyk7XG52YXIgQVdTX1VzZXJzID0gcmVxdWlyZSgnLi9hd3MvQVdTX1VzZXJzJyk7XG52YXIgQVdTX0VDMl9JbnN0YW5jZSA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfSW5zdGFuY2UnKTtcbnZhciBBV1NfRUMyX0VJUCA9IHJlcXVpcmUoJy4vYXdzL0FXU19FQzJfRUlQJyk7XG52YXIgQVdTX0VDMl9TZWN1cml0eUdyb3VwID0gcmVxdWlyZSgnLi9hd3MvQVdTX0VDMl9TZWN1cml0eUdyb3VwJyk7XG52YXIgQ29sbGVjdGlvbiA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbicpO1xuXG5mdW5jdGlvbiByZXNpemVHdWlDb250YWluZXIocmVuZGVyZXIpIHtcblxuICB2YXIgZGltID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcblxuICBjb25zb2xlLmxvZygnUmVzaXppbmcuLi4nKTtcbiAgY29uc29sZS5sb2coZGltKTtcblxuICAkKCcjZ3VpQ29udGFpbmVyJykuaGVpZ2h0KGRpbS55KTtcbiAgJCgnI2d1aUNvbnRhaW5lcicpLndpZHRoKGRpbS54KTtcblxuICBpZihyZW5kZXJlcikge1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUud2lkdGggPSBkaW0ueCsncHgnO1xuICAgIHJlbmRlcmVyLnZpZXcuc3R5bGUuaGVpZ2h0ID0gZGltLnkrJ3B4JztcbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdSZXNpemluZyBndWkgY29udGFpbmVyLi4uJyk7XG5cbn1cblxudmFyIFBpeGlFZGl0b3IgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHZhciB0ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGUoKTtcbiAgICBjb25zb2xlLmxvZyh0ZW1wbGF0ZSk7XG5cbiAgICB2YXIgd2luRGltZW5zaW9uID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcblxuICAgIHZhciByZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSwge2JhY2tncm91bmRDb2xvciA6IDB4RkZGRkZGfSk7XG5cbiAgICB2YXIgc3RhZ2UgPSBuZXcgUElYSS5TdGFnZSgpO1xuICAgIHZhciBlbGVtZW50cyA9IG5ldyBDb2xsZWN0aW9uKCk7XG4gICAgdmFyIGFycm93R3JhcGhpY3MgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXG4gICAgdmFyIG1ldGVyID0gbmV3IEZQU01ldGVyKCk7XG5cbiAgICB2YXIgZnBzID0gNjA7XG4gICAgdmFyIG5vdztcbiAgICB2YXIgdGhlbiA9IERhdGUubm93KCk7XG4gICAgdmFyIGludGVydmFsID0gMTAwMC9mcHM7XG4gICAgdmFyIGRlbHRhO1xuXG4gICAgZnVuY3Rpb24gYW5pbWF0ZSh0aW1lKSB7XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XG5cbiAgICAgIG5vdyA9IERhdGUubm93KCk7XG4gICAgICBkZWx0YSA9IG5vdyAtIHRoZW47XG5cbiAgICAgIGlmIChkZWx0YSA+IGludGVydmFsKSB7XG4gICAgICAgIHRoZW4gPSBub3cgLSAoZGVsdGEgJSBpbnRlcnZhbCk7XG4gICAgICAgIG1ldGVyLnRpY2soKTtcblxuICAgICAgICBUV0VFTi51cGRhdGUodGltZSk7XG4gICAgICAgIHJlbmRlcmVyLnJlbmRlcihzdGFnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Mb2FkZWQoKSB7XG4gICAgICBjb25zb2xlLmxvZygnQXNzZXRzIGxvYWRlZCcpO1xuXG4gICAgICB2YXIgZGltID0gR3VpVXRpbC5nZXRXaW5kb3dEaW1lbnNpb24oKTtcbiAgICAgIGNvbnNvbGUubG9nKGVsZW1lbnRzLnBvc2l0aW9uKTtcblxuICAgICAgdmFyIHVzZXJzID0gbmV3IEFXU19Vc2VycygndXNlcnMnLCBkaW0ueC8yLCAxMDApO1xuICAgICAgY29uc29sZS5sb2codXNlcnMucG9zaXRpb24pO1xuICAgICAgZWxlbWVudHMuYWRkKHVzZXJzKTtcblxuICAgICAgY29uc29sZS5sb2codGVtcGxhdGUuUmVzb3VyY2VzKTtcblxuICAgICAgdmFyIGdyb3VwaW5ncyA9IF8ucmVkdWNlKHRlbXBsYXRlLlJlc291cmNlcywgZnVuY3Rpb24ocmVzdWx0LCBuLCBrZXkpIHtcbiAgICAgICAgcmVzdWx0W24uVHlwZV0gPSB7fTtcbiAgICAgICAgcmVzdWx0W24uVHlwZV1ba2V5XSA9IG47XG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgIH0sIHt9KTtcbiAgICAgIGNvbnNvbGUubG9nKCdHcm91cGluZ3M6Jyk7XG4gICAgICBjb25zb2xlLmxvZyhncm91cGluZ3MpO1xuXG4gICAgICB2YXIgaW5zdGFuY2VzID0ge307XG4gICAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6SW5zdGFuY2UnXSwgZnVuY3Rpb24obiwga2V5KSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBBV1NfRUMyX0luc3RhbmNlKGtleSwgZGltLngvMiwgNDAwKTtcbiAgICAgICAgaW5zdGFuY2VzW2tleV0gPSBpbnN0YW5jZTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgZWlwcyA9IHt9O1xuICAgICAgXy5lYWNoKGdyb3VwaW5nc1snQVdTOjpFQzI6OkVJUCddLCBmdW5jdGlvbihuLCBrZXkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0FkZGluZyBFSVAgJywga2V5KTtcbiAgICAgICAgdmFyIGVpcCA9IG5ldyBBV1NfRUMyX0VJUChrZXksIGRpbS54LzIsIDUwMCk7XG4gICAgICAgIGVpcHNba2V5XSA9IGVpcDtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgc2VjZ3JvdXBzID0ge307XG4gICAgICBfLmVhY2goZ3JvdXBpbmdzWydBV1M6OkVDMjo6U2VjdXJpdHlHcm91cCddLCBmdW5jdGlvbihuLCBrZXkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0FkZGluZyBTZWN1cml0eSBHcm91cCAnLCBrZXkpO1xuICAgICAgICB2YXIgc2VjZ3JvdXAgPSBuZXcgQVdTX0VDMl9TZWN1cml0eUdyb3VwKGtleSwgZGltLngvMiwgNTAwKTtcbiAgICAgICAgc2VjZ3JvdXBzW2tleV0gPSBzZWNncm91cDtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgY29tYm9JbnN0YW5jZXMgPSB7fTtcbiAgICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpFSVBBc3NvY2lhdGlvbiddLCBmdW5jdGlvbihuLCBrZXkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0NoZWNraW5nIGFzc29jaWF0aW9uJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKG4pO1xuICAgICAgICBjb25zb2xlLmxvZyhrZXkpO1xuICAgICAgICBjb25zb2xlLmxvZyhlaXBzKTtcbiAgICAgICAgY29uc29sZS5sb2coJ1JlZjogJyxuLlByb3BlcnRpZXMuRUlQLlJlZik7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IGluc3RhbmNlc1tuLlByb3BlcnRpZXMuSW5zdGFuY2VJZC5SZWZdO1xuICAgICAgICBpZihpbnN0YW5jZSkge1xuICAgICAgICAgIHZhciBlaXAgPSBlaXBzW24uUHJvcGVydGllcy5FSVAuUmVmXTtcbiAgICAgICAgICBpZihlaXApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBc3NvY2lhdGlvbiBoYXMgYSBtYXRjaCEnKTtcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBuZXcgQ29sbGVjdGlvbigpO1xuICAgICAgICAgICAgY29udGFpbmVyLmFkZChpbnN0YW5jZSk7XG4gICAgICAgICAgICBjb250YWluZXIuYWRkKGVpcCk7XG4gICAgICAgICAgICBjb21ib0luc3RhbmNlc1trZXldID0gY29udGFpbmVyO1xuICAgICAgICAgICAgZGVsZXRlIGluc3RhbmNlc1tuLlByb3BlcnRpZXMuSW5zdGFuY2VJZC5SZWZdO1xuICAgICAgICAgICAgZGVsZXRlIGVpcHNbbi5Qcm9wZXJ0aWVzLkVJUC5SZWZdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvL3ZhciBlaXAgPSBuZXcgQVdTX0VDMl9FSVAoa2V5LCBkaW0ueC8yLCA1MDApO1xuICAgICAgICAvL2VpcHNba2V5XSA9IGVpcDtcbiAgICAgIH0pO1xuXG4gICAgICBfLmVhY2goY29tYm9JbnN0YW5jZXMsIGZ1bmN0aW9uKGNvbWJvLCBrZXkpIHtcbiAgICAgICAgZWxlbWVudHMuYWRkKGNvbWJvKTtcbiAgICAgIH0pO1xuXG4gICAgICBfLmVhY2goaW5zdGFuY2VzLCBmdW5jdGlvbihpbnN0YW5jZSwga2V5KSB7XG4gICAgICAgIGVsZW1lbnRzLmFkZChpbnN0YW5jZSk7XG4gICAgICB9KTtcblxuICAgICAgXy5lYWNoKGVpcHMsIGZ1bmN0aW9uKGVpcCwga2V5KSB7XG4gICAgICAgIGVsZW1lbnRzLmFkZChlaXApO1xuICAgICAgfSk7XG5cbiAgICAgIF8uZWFjaChzZWNncm91cHMsIGZ1bmN0aW9uKHMsIGtleSkge1xuICAgICAgICBlbGVtZW50cy5hZGQocyk7XG4gICAgICB9KTtcblxuICAgICAgLypcbiAgICAgIF8uZWFjaChncm91cGluZ3NbJ0FXUzo6RUMyOjpFSVBBc3NvY2lhdGlvbiddLCBmdW5jdGlvbihuKSB7XG5cbiAgICAgIH0pO1xuXG4gICAgICB2YXIgaW5zdGFuY2VzID0gXy5yZWR1Y2UodGVtcGxhdGUuUmVzb3VyY2VzLCBmdW5jdGlvbihyZXN1bHQsIG4sIGtleSkge1xuICAgICAgICBpZihuLlR5cGUgPT09ICdBV1M6OkVDMjo6SW5zdGFuY2UnKSB7IHJlc3VsdFtrZXldID0gbjsgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSwge30pO1xuICAgICAgY29uc29sZS5sb2coJ0luc3RhbmNlczonKTtcbiAgICAgIGNvbnNvbGUubG9nKGluc3RhbmNlcyk7XG5cbiAgICAgIHZhciBzZWNfZ3JvdXBzID0gXy5yZWR1Y2UodGVtcGxhdGUuUmVzb3VyY2VzLCBmdW5jdGlvbihyZXN1bHQsIG4sIGtleSkge1xuICAgICAgICBpZihuLlR5cGUgPT09ICdBV1M6OkVDMjo6U2VjdXJpdHlHcm91cCcpIHsgcmVzdWx0W2tleV0gPSBuOyB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9LCB7fSk7XG4gICAgICBjb25zb2xlLmxvZygnU2VjIGdycHM6Jyk7XG4gICAgICBjb25zb2xlLmxvZyhzZWNfZ3JvdXBzKTtcblxuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0ZW1wbGF0ZS5SZXNvdXJjZXMpO1xuICAgICAgdmFyIGtleUxlbiA9IGtleXMubGVuZ3RoO1xuICAgICAgZm9yKHZhciBpID0wOyBpIDwga2V5TGVuOyBpKyspIHtcbiAgICAgICAgY29uc29sZS5sb2coa2V5c1tpXSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRlbXBsYXRlLlJlc291cmNlc1trZXlzW2ldXS5UeXBlKTtcbiAgICAgIH1cbiAgICAgICovXG5cbiAgICAgIC8qXG4gICAgICB2YXIgaW5zdGFuY2UxID0gbmV3IEFXU19FQzJfSW5zdGFuY2UoJ2luc3RhbmNlMScsIGRpbS54LzIsIDQwMCk7XG4gICAgICBjb25zb2xlLmxvZyhpbnN0YW5jZTEucG9zaXRpb24pO1xuICAgICAgZWxlbWVudHMuYWRkKGluc3RhbmNlMSk7XG4gICAgICAqL1xuXG4gICAgICAvL2NvbnNvbGUubG9nKGVsZW1lbnRzQ29udGFpbmVyLmdldExvY2FsQm91bmRzKCkpO1xuXG4gICAgICAvL3VzZXJzLmFkZEFycm93VG8oaW5zdGFuY2UxKTtcblxuICAgICAgY29uc29sZS5sb2coJ0NoaWxkcmVuOicpO1xuICAgICAgY29uc29sZS5sb2coZWxlbWVudHMuY2hpbGRyZW4pO1xuICAgICAgLy92YXIgYXJyb3cgPSBBcnJvdy5kcmF3QmV0d2Vlbih1c2VycywgaW5zdGFuY2UxKTtcblxuICAgICAgc3RhZ2UuYWRkQ2hpbGQoZWxlbWVudHMpO1xuICAgICAgY29uc29sZS5sb2coc3RhZ2UuY2hpbGRyZW4pO1xuXG4gICAgICB2YXIgbWVudVNwcml0ZSA9IG5ldyBQSVhJLlNwcml0ZSgpO1xuICAgICAgbWVudVNwcml0ZS50ZXh0dXJlID0gUElYSS5UZXh0dXJlLmZyb21GcmFtZSgnQ29tcHV0ZV8mX05ldHdvcmtpbmdfQW1hem9uX0VDMl9JbnN0YW5jZS5wbmcnKTtcbiAgICAgIG1lbnVTcHJpdGUuc2NhbGUuc2V0KDAuMik7XG4gICAgICBtZW51U3ByaXRlLnkgPSBkaW0ueS8yO1xuICAgICAgbWVudVNwcml0ZS54ID0gZGltLngtNDA7XG4gICAgICBtZW51U3ByaXRlLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgIG1lbnVTcHJpdGUuYnV0dG9uTW9kZSA9IHRydWU7XG4gICAgICBtZW51U3ByaXRlLmFuY2hvci5zZXQoMC41KTtcbiAgICAgIG1lbnVTcHJpdGVcbiAgICAgICAgLm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNjYWxlLnNldChzZWxmLnNjYWxlLngqMS4yKTtcbiAgICAgIH0pXG4gICAgICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgc2VsZi5zY2FsZS5zZXQoc2VsZi5zY2FsZS54LzEuMik7XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdDbGlja2VkLicpO1xuICAgICAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBBV1NfRUMyX0luc3RhbmNlKCdOZXdfSW5zdGFuY2UnLCBkaW0ueC8yLCBkaW0ueS8yKTtcbiAgICAgICAgICBlbGVtZW50cy5hZGQoaW5zdGFuY2UpO1xuICAgICAgICB9KTtcbiAgICAgIHN0YWdlLmFkZENoaWxkKG1lbnVTcHJpdGUpO1xuICAgIH1cblxuICAgIFBJWEkubG9hZGVyXG4gICAgICAuYWRkKCcuLi9yZXNvdXJjZXMvc3ByaXRlcy9zcHJpdGVzLmpzb24nKVxuICAgICAgLmxvYWQob25Mb2FkZWQpO1xuXG4gICAgc3RhZ2UuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgIHZhciBncmlkID0gc3RhZ2UuYWRkQ2hpbGQoR3VpVXRpbC5kcmF3R3JpZCh3aW5EaW1lbnNpb24ueCwgd2luRGltZW5zaW9uLnkpKTtcblxuICAgIGNvbnNvbGUubG9nKCdBZGRpbmcgbGlzdGVuZXIuLi4nKTtcbiAgICAkKHdpbmRvdykucmVzaXplKGZ1bmN0aW9uKCkge1xuICAgICAgcmVzaXplR3VpQ29udGFpbmVyKHJlbmRlcmVyKTtcbiAgICAgIHdpbkRpbWVuc2lvbiA9IEd1aVV0aWwuZ2V0V2luZG93RGltZW5zaW9uKCk7XG4gICAgICAvL2NvbnNvbGUubG9nKG5ld0RpbSk7XG4gICAgICBjb25zb2xlLmxvZyhzdGFnZSk7XG4gICAgICBzdGFnZS5yZW1vdmVDaGlsZChncmlkKTtcbiAgICAgIGdyaWQgPSBzdGFnZS5hZGRDaGlsZChHdWlVdGlsLmRyYXdHcmlkKHdpbkRpbWVuc2lvbi54LCB3aW5EaW1lbnNpb24ueSkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHRlbXBsYXRlOiBvcHRpb25zLnRlbXBsYXRlLFxuXG4gICAgICBkcmF3Q2FudmFzRWRpdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuXG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgYW5pbWF0ZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vdmFyIGVsZW1lbnRTaXplID0gMTAwO1xuICAgICAgICAvL3Jlc2l6ZUd1aUNvbnRhaW5lcigpO1xuXG4gICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQocmVuZGVyZXIudmlldyk7XG5cbiAgICAgICAgcmVuZGVyZXIucmVuZGVyKHN0YWdlKTtcblxuICAgICAgICBhbmltYXRlKCk7XG5cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHZpZXc6IGZ1bmN0aW9uKGNvbnRyb2xsZXIpIHtcbiAgICByZXR1cm4gbSgnI2d1aUNvbnRhaW5lcicsIHsgY29uZmlnOiBjb250cm9sbGVyLmRyYXdDYW52YXNFZGl0b3J9KVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBpeGlFZGl0b3I7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gcmVzaXplRWRpdG9yKGVkaXRvcikge1xuICBlZGl0b3Iuc2V0U2l6ZShudWxsLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xufVxuXG52YXIgU291cmNlRWRpdG9yID0ge1xuXG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcblxuICAgIHJldHVybiB7XG5cbiAgICAgIGRyYXdFZGl0b3I6IGZ1bmN0aW9uIChlbGVtZW50LCBpc0luaXRpYWxpemVkLCBjb250ZXh0KSB7XG5cbiAgICAgICAgdmFyIGVkaXRvciA9IG51bGw7XG5cbiAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICBpZihlZGl0b3IpIHtcbiAgICAgICAgICAgIGVkaXRvci5yZWZyZXNoKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGVkaXRvciA9IENvZGVNaXJyb3IoZWxlbWVudCwge1xuICAgICAgICAgIHZhbHVlOiBKU09OLnN0cmluZ2lmeShvcHRpb25zLnRlbXBsYXRlKCksIHVuZGVmaW5lZCwgMiksXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgbW9kZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIGd1dHRlcnM6IFsnQ29kZU1pcnJvci1saW50LW1hcmtlcnMnXSxcbiAgICAgICAgICBsaW50OiB0cnVlLFxuICAgICAgICAgIHN0eWxlQWN0aXZlTGluZTogdHJ1ZSxcbiAgICAgICAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIHRoZW1lOiAnemVuYnVybidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzaXplRWRpdG9yKGVkaXRvcik7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXNpemVFZGl0b3IoZWRpdG9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlZGl0b3IpIHtcbiAgICAgICAgICBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcbiAgICAgICAgICBvcHRpb25zLnRlbXBsYXRlKEpTT04ucGFyc2UoZWRpdG9yLmdldFZhbHVlKCkpKTtcbiAgICAgICAgICBtLmVuZENvbXB1dGF0aW9uKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBbXG4gICAgICBtKCcjc291cmNlRWRpdG9yJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0VkaXRvciB9KVxuICAgIF1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb3VyY2VFZGl0b3I7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBTb3VyY2VFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvc291cmNlLmVkaXRvcicpO1xudmFyIFBpeGlFZGl0b3IgPSByZXF1aXJlKCcuL2NvbXBvbmVudHMvcGl4aS5lZGl0b3InKTtcblxudmFyIHRlc3REYXRhID0gcmVxdWlyZSgnLi90ZXN0RGF0YS9lYzIuanNvbicpO1xuXG52YXIgdGVtcGxhdGUgPSBtLnByb3AodGVzdERhdGEpO1xuXG5tLm1vdW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbG91ZHNsaWNlci1hcHAnKSwgbS5jb21wb25lbnQoUGl4aUVkaXRvciwge1xuICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZVxuICB9KVxuKTtcblxubS5tb3VudChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZS1iYXInKSwgbS5jb21wb25lbnQoU291cmNlRWRpdG9yLCB7XG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIH0pXG4pO1xuIiwibW9kdWxlLmV4cG9ydHM9XG57XG4gIFwiQVdTVGVtcGxhdGVGb3JtYXRWZXJzaW9uXCIgOiBcIjIwMTAtMDktMDlcIixcblxuICBcIkRlc2NyaXB0aW9uXCIgOiBcIkFXUyBDbG91ZEZvcm1hdGlvbiBTYW1wbGUgVGVtcGxhdGUgRUMySW5zdGFuY2VXaXRoU2VjdXJpdHlHcm91cFNhbXBsZTogQ3JlYXRlIGFuIEFtYXpvbiBFQzIgaW5zdGFuY2UgcnVubmluZyB0aGUgQW1hem9uIExpbnV4IEFNSS4gVGhlIEFNSSBpcyBjaG9zZW4gYmFzZWQgb24gdGhlIHJlZ2lvbiBpbiB3aGljaCB0aGUgc3RhY2sgaXMgcnVuLiBUaGlzIGV4YW1wbGUgY3JlYXRlcyBhbiBFQzIgc2VjdXJpdHkgZ3JvdXAgZm9yIHRoZSBpbnN0YW5jZSB0byBnaXZlIHlvdSBTU0ggYWNjZXNzLiAqKldBUk5JTkcqKiBUaGlzIHRlbXBsYXRlIGNyZWF0ZXMgYW4gQW1hem9uIEVDMiBpbnN0YW5jZS4gWW91IHdpbGwgYmUgYmlsbGVkIGZvciB0aGUgQVdTIHJlc291cmNlcyB1c2VkIGlmIHlvdSBjcmVhdGUgYSBzdGFjayBmcm9tIHRoaXMgdGVtcGxhdGUuXCIsXG5cbiAgXCJQYXJhbWV0ZXJzXCIgOiB7XG4gICAgXCJLZXlOYW1lXCI6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiTmFtZSBvZiBhbiBleGlzdGluZyBFQzIgS2V5UGFpciB0byBlbmFibGUgU1NIIGFjY2VzcyB0byB0aGUgaW5zdGFuY2VcIixcbiAgICAgIFwiVHlwZVwiOiBcIkFXUzo6RUMyOjpLZXlQYWlyOjpLZXlOYW1lXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIHRoZSBuYW1lIG9mIGFuIGV4aXN0aW5nIEVDMiBLZXlQYWlyLlwiXG4gICAgfSxcblxuICAgIFwiSW5zdGFuY2VUeXBlXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIldlYlNlcnZlciBFQzIgaW5zdGFuY2UgdHlwZVwiLFxuICAgICAgXCJUeXBlXCIgOiBcIlN0cmluZ1wiLFxuICAgICAgXCJEZWZhdWx0XCIgOiBcIm0xLnNtYWxsXCIsXG4gICAgICBcIkFsbG93ZWRWYWx1ZXNcIiA6IFsgXCJ0MS5taWNyb1wiLCBcInQyLm1pY3JvXCIsIFwidDIuc21hbGxcIiwgXCJ0Mi5tZWRpdW1cIiwgXCJtMS5zbWFsbFwiLCBcIm0xLm1lZGl1bVwiLCBcIm0xLmxhcmdlXCIsIFwibTEueGxhcmdlXCIsIFwibTIueGxhcmdlXCIsIFwibTIuMnhsYXJnZVwiLCBcIm0yLjR4bGFyZ2VcIiwgXCJtMy5tZWRpdW1cIiwgXCJtMy5sYXJnZVwiLCBcIm0zLnhsYXJnZVwiLCBcIm0zLjJ4bGFyZ2VcIiwgXCJjMS5tZWRpdW1cIiwgXCJjMS54bGFyZ2VcIiwgXCJjMy5sYXJnZVwiLCBcImMzLnhsYXJnZVwiLCBcImMzLjJ4bGFyZ2VcIiwgXCJjMy40eGxhcmdlXCIsIFwiYzMuOHhsYXJnZVwiLCBcImM0LmxhcmdlXCIsIFwiYzQueGxhcmdlXCIsIFwiYzQuMnhsYXJnZVwiLCBcImM0LjR4bGFyZ2VcIiwgXCJjNC44eGxhcmdlXCIsIFwiZzIuMnhsYXJnZVwiLCBcInIzLmxhcmdlXCIsIFwicjMueGxhcmdlXCIsIFwicjMuMnhsYXJnZVwiLCBcInIzLjR4bGFyZ2VcIiwgXCJyMy44eGxhcmdlXCIsIFwiaTIueGxhcmdlXCIsIFwiaTIuMnhsYXJnZVwiLCBcImkyLjR4bGFyZ2VcIiwgXCJpMi44eGxhcmdlXCIsIFwiZDIueGxhcmdlXCIsIFwiZDIuMnhsYXJnZVwiLCBcImQyLjR4bGFyZ2VcIiwgXCJkMi44eGxhcmdlXCIsIFwiaGkxLjR4bGFyZ2VcIiwgXCJoczEuOHhsYXJnZVwiLCBcImNyMS44eGxhcmdlXCIsIFwiY2MyLjh4bGFyZ2VcIiwgXCJjZzEuNHhsYXJnZVwiXVxuICAgICxcbiAgICAgIFwiQ29uc3RyYWludERlc2NyaXB0aW9uXCIgOiBcIm11c3QgYmUgYSB2YWxpZCBFQzIgaW5zdGFuY2UgdHlwZS5cIlxuICAgIH0sXG5cbiAgICBcIlNTSExvY2F0aW9uXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIlRoZSBJUCBhZGRyZXNzIHJhbmdlIHRoYXQgY2FuIGJlIHVzZWQgdG8gU1NIIHRvIHRoZSBFQzIgaW5zdGFuY2VzXCIsXG4gICAgICBcIlR5cGVcIjogXCJTdHJpbmdcIixcbiAgICAgIFwiTWluTGVuZ3RoXCI6IFwiOVwiLFxuICAgICAgXCJNYXhMZW5ndGhcIjogXCIxOFwiLFxuICAgICAgXCJEZWZhdWx0XCI6IFwiMC4wLjAuMC8wXCIsXG4gICAgICBcIkFsbG93ZWRQYXR0ZXJuXCI6IFwiKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pLyhcXFxcZHsxLDJ9KVwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIjogXCJtdXN0IGJlIGEgdmFsaWQgSVAgQ0lEUiByYW5nZSBvZiB0aGUgZm9ybSB4LngueC54L3guXCJcbiAgICB9XG4gIH0sXG5cbiAgXCJNYXBwaW5nc1wiIDoge1xuICAgIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiA6IHtcbiAgICAgIFwidDEubWljcm9cIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcInQyLm1pY3JvXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJ0Mi5zbWFsbFwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwidDIubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0xLnNtYWxsXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMy5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzEubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcImMxLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJjMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZzIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTUcyXCIgIH0sXG4gICAgICBcInIzLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJoaTEuNHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaHMxLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImNyMS44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjYzIuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfVxuICAgIH1cbiAgLFxuICAgIFwiQVdTUmVnaW9uQXJjaDJBTUlcIiA6IHtcbiAgICAgIFwidXMtZWFzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktMGY0Y2ZkNjRcIiwgXCJIVk02NFwiIDogXCJhbWktMGQ0Y2ZkNjZcIiwgXCJIVk1HMlwiIDogXCJhbWktNWIwNWJhMzBcIn0sXG4gICAgICBcInVzLXdlc3QtMlwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWQzYzVkMWUzXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWQ1YzVkMWU1XCIsIFwiSFZNRzJcIiA6IFwiYW1pLWE5ZDZjMDk5XCJ9LFxuICAgICAgXCJ1cy13ZXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS04NWVhMTNjMVwiLCBcIkhWTTY0XCIgOiBcImFtaS04N2VhMTNjM1wiLCBcIkhWTUcyXCIgOiBcImFtaS0zNzgyN2E3M1wifSxcbiAgICAgIFwiZXUtd2VzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktZDZkMThlYTFcIiwgXCJIVk02NFwiIDogXCJhbWktZTRkMThlOTNcIiwgXCJIVk1HMlwiIDogXCJhbWktNzJhOWYxMDVcIn0sXG4gICAgICBcImV1LWNlbnRyYWwtMVwiICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWE0YjBiN2I5XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWE2YjBiN2JiXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWE2YzljZmJiXCJ9LFxuICAgICAgXCJhcC1ub3J0aGVhc3QtMVwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS0xYTFiOWYxYVwiLCBcIkhWTTY0XCIgOiBcImFtaS0xYzFiOWYxY1wiLCBcIkhWTUcyXCIgOiBcImFtaS1mNjQ0YzRmNlwifSxcbiAgICAgIFwiYXAtc291dGhlYXN0LTFcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktZDI0YjQyODBcIiwgXCJIVk02NFwiIDogXCJhbWktZDQ0YjQyODZcIiwgXCJIVk1HMlwiIDogXCJhbWktMTJiNWJjNDBcIn0sXG4gICAgICBcImFwLXNvdXRoZWFzdC0yXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWVmN2IzOWQ1XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWRiN2IzOWUxXCIsIFwiSFZNRzJcIiA6IFwiYW1pLWIzMzM3ZTg5XCJ9LFxuICAgICAgXCJzYS1lYXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS01YjA5ODE0NlwiLCBcIkhWTTY0XCIgOiBcImFtaS01NTA5ODE0OFwiLCBcIkhWTUcyXCIgOiBcIk5PVF9TVVBQT1JURURcIn0sXG4gICAgICBcImNuLW5vcnRoLTFcIiAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWJlYzQ1ODg3XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWJjYzQ1ODg1XCIsIFwiSFZNRzJcIiA6IFwiTk9UX1NVUFBPUlRFRFwifVxuICAgIH1cblxuICB9LFxuXG4gIFwiUmVzb3VyY2VzXCIgOiB7XG4gICAgXCJFQzJJbnN0YW5jZVwiIDoge1xuICAgICAgXCJUeXBlXCIgOiBcIkFXUzo6RUMyOjpJbnN0YW5jZVwiLFxuICAgICAgXCJQcm9wZXJ0aWVzXCIgOiB7XG4gICAgICAgIFwiSW5zdGFuY2VUeXBlXCIgOiB7IFwiUmVmXCIgOiBcIkluc3RhbmNlVHlwZVwiIH0sXG4gICAgICAgIFwiU2VjdXJpdHlHcm91cHNcIiA6IFsgeyBcIlJlZlwiIDogXCJJbnN0YW5jZVNlY3VyaXR5R3JvdXBcIiB9IF0sXG4gICAgICAgIFwiS2V5TmFtZVwiIDogeyBcIlJlZlwiIDogXCJLZXlOYW1lXCIgfSxcbiAgICAgICAgXCJJbWFnZUlkXCIgOiB7IFwiRm46OkZpbmRJbk1hcFwiIDogWyBcIkFXU1JlZ2lvbkFyY2gyQU1JXCIsIHsgXCJSZWZcIiA6IFwiQVdTOjpSZWdpb25cIiB9LFxuICAgICAgICAgIHsgXCJGbjo6RmluZEluTWFwXCIgOiBbIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiwgeyBcIlJlZlwiIDogXCJJbnN0YW5jZVR5cGVcIiB9LCBcIkFyY2hcIiBdIH0gXSB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiSW5zdGFuY2VTZWN1cml0eUdyb3VwXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6OlNlY3VyaXR5R3JvdXBcIixcbiAgICAgIFwiUHJvcGVydGllc1wiIDoge1xuICAgICAgICBcIkdyb3VwRGVzY3JpcHRpb25cIiA6IFwiRW5hYmxlIFNTSCBhY2Nlc3MgdmlhIHBvcnQgMjJcIixcbiAgICAgICAgXCJTZWN1cml0eUdyb3VwSW5ncmVzc1wiIDogWyB7XG4gICAgICAgICAgXCJJcFByb3RvY29sXCIgOiBcInRjcFwiLFxuICAgICAgICAgIFwiRnJvbVBvcnRcIiA6IFwiMjJcIixcbiAgICAgICAgICBcIlRvUG9ydFwiIDogXCIyMlwiLFxuICAgICAgICAgIFwiQ2lkcklwXCIgOiB7IFwiUmVmXCIgOiBcIlNTSExvY2F0aW9uXCJ9XG4gICAgICAgIH0gXVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBcIk91dHB1dHNcIiA6IHtcbiAgICBcIkluc3RhbmNlSWRcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiSW5zdGFuY2VJZCBvZiB0aGUgbmV3bHkgY3JlYXRlZCBFQzIgaW5zdGFuY2VcIixcbiAgICAgIFwiVmFsdWVcIiA6IHsgXCJSZWZcIiA6IFwiRUMySW5zdGFuY2VcIiB9XG4gICAgfSxcbiAgICBcIkFaXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIkF2YWlsYWJpbGl0eSBab25lIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIkZuOjpHZXRBdHRcIiA6IFsgXCJFQzJJbnN0YW5jZVwiLCBcIkF2YWlsYWJpbGl0eVpvbmVcIiBdIH1cbiAgICB9LFxuICAgIFwiUHVibGljRE5TXCIgOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIlB1YmxpYyBETlNOYW1lIG9mIHRoZSBuZXdseSBjcmVhdGVkIEVDMiBpbnN0YW5jZVwiLFxuICAgICAgXCJWYWx1ZVwiIDogeyBcIkZuOjpHZXRBdHRcIiA6IFsgXCJFQzJJbnN0YW5jZVwiLCBcIlB1YmxpY0Ruc05hbWVcIiBdIH1cbiAgICB9LFxuICAgIFwiUHVibGljSVBcIiA6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiUHVibGljIElQIGFkZHJlc3Mgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgRUMyIGluc3RhbmNlXCIsXG4gICAgICBcIlZhbHVlXCIgOiB7IFwiRm46OkdldEF0dFwiIDogWyBcIkVDMkluc3RhbmNlXCIsIFwiUHVibGljSXBcIiBdIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==
