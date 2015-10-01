/**
 * Created by arminhammer on 9/30/15.
 */

var Collection = require('./lib/collection/collection');
var GuiUtil = require('./gui.util');
var AWS_EC2_Instance = require('./aws/AWS_EC2_Instance');
var AWS_EC2_EIP = require('./aws/AWS_EC2_EIP');
var AWS_EC2_SecurityGroup = require('./aws/AWS_EC2_SecurityGroup');

function buildMenuComponent(x,y, texture, scale, mouseUpCallback) {
  var menuComponent = new PIXI.Sprite();
  menuComponent.texture = texture;
  menuComponent.scale.set(scale);
  menuComponent.x = x;
  menuComponent.y = y;
  menuComponent.interactive = true;
  menuComponent.buttonMode = true;
  menuComponent.anchor.set(0.5);
  menuComponent
    .on('mouseover', function() {
      var self = this;
      self.scale.set(self.scale.x*1.2);
    })
    .on('mouseout', function() {
      var self = this;
      self.scale.set(self.scale.x/1.2);
    })
    .on('mouseup', mouseUpCallback);
  return menuComponent;
}

var Menu = function(manager) {
  Collection.call(this);
  var self = this;
  self.MANAGER = manager;
  self.menu = {};

  var dim = GuiUtil.getWindowDimension();

  var xoffset = dim.x-40;
  var yoffset = dim.y/2;


  self.menu.instance = buildMenuComponent(xoffset, yoffset, PIXI.Texture.fromFrame('Compute_&_Networking_Amazon_EC2_Instance.png'), 0.2,
    function() {
      self.MANAGER.elements.add(new AWS_EC2_Instance('New_Instance', dim.x/2, dim.y/2));
    });

  self.add(self.menu.instance);

  var secGrpGraphic = new PIXI.Graphics();
  secGrpGraphic.lineStyle(3, 0x000000, 1);
  secGrpGraphic.beginFill(0xFFFFFF, 1);
  secGrpGraphic.drawRoundedRect(0,0,30,30,6);
  secGrpGraphic.endFill();

  self.menu.secgrp = buildMenuComponent(xoffset, yoffset+40, secGrpGraphic.generateTexture(), 1.0,
    function() {
      self.MANAGER.securitygroups.add(new AWS_EC2_SecurityGroup('New_Security_Group', dim.x/2, dim.y/2));
    });

  self.add(self.menu.secgrp);

};

Menu.prototype = Object.create(Collection.prototype);

module.exports = Menu;
