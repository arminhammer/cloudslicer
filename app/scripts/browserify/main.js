(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.editor.js":[function(require,module,exports){
/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var VideoModel = require('../models/video.model');

var GuiEditor = {
  controller: function(options) {
    return {
      template: options.template,

      drawEditor: function (element, isInitialized, context) {

        if (isInitialized) {
          return;
        }

        var s = Snap(element);

        var bigCircle = s.circle(150, 150, 100);

        bigCircle.attr({
          fill: "#bada55",
          stroke: "#000",
          strokeWidth: 5
        });

        /*
         var editor = CodeMirror(element, {
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

         editor.on('change', function(editor) {
         m.startComputation();
         options.template(editor.getValue());
         m.endComputation();
         });
         */
      }

    }
  },
  view: function(controller) {
    var parsed = null;
    var sourceBlock = null;

    try {
      parsed = JSON.parse(controller.template());
      sourceBlock =   [
        m('div', [
          _.map(parsed.Resources, function (value, key) {
            return m('div', value.Type)
          })
        ]),
        m('div', [
          parsed.Parameters.InstanceType.AllowedValues.map(function(value) {
            return m('div', value)
          })
        ])
      ]
    }
    catch(e) {
      console.log('Parse error: ' + e);
      sourceBlock =   m('div', {}, e)
    }

    /*
     var drawGUI = function() {
     var s = Snap('');

     var bigCircle = s.circle(150, 150, 100);

     bigCircle.attr({
     fill: "#bada55",
     stroke: "#000",
     strokeWidth: 5
     });

     return m('svg',s);
     };
     */

    return [
      m('#guiContainer', [
        m('svg#guiEditor', { config: controller.drawEditor })
      ])
      /*
       */

      /*
       m('div', [
       m('h1', 'Video')
       ]),
       m('video#videoPlayer[controls]', {
       src:'',
       class:'video-js vjs-default-skin',
       muted:'muted',
       //autoplay:'autoplay',
       preload:'auto',
       width:'640',
       height:'360',
       config: controller.initPlayer
       })
       */
    ]
  }
};

module.exports = GuiEditor;

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js":[function(require,module,exports){
/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var jsonlint = require('jsonlint');

var SourceEditor = {
  controller: function(options) {

    return {

      drawEditor: function (element, isInitialized, context) {

        if (isInitialized) {
          return;
        }

        var editor = CodeMirror(element, {
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

var MainPage = require('./views/main.page');
//var VideoModel = require('./models/video.model');

var testData = require('./testData/wordpress.template.json');

var template = m.prop(JSON.stringify(testData, undefined, 2));

m.route.mode = 'hash';

m.route(document.getElementById('cloudslicer-app'), '/', {
  '/': m.component(MainPage, {
    template: template
  })
});

},{"./testData/wordpress.template.json":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/testData/wordpress.template.json","./views/main.page":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/views/main.page.js"}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/testData/wordpress.template.json":[function(require,module,exports){
module.exports={
  "AWSTemplateFormatVersion" : "2010-09-09",

  "Description" : "AWS CloudFormation Sample Template WordPress_Single_Instance: WordPress is web software you can use to create a beautiful website or blog. This template installs WordPress with a local MySQL database for storage. It demonstrates using the AWS CloudFormation bootstrap scripts to deploy WordPress. **WARNING** This template creates an Amazon EC2 instance. You will be billed for the AWS resources used if you create a stack from this template.",

  "Parameters" : {

    "KeyName": {
      "Description" : "Name of an existing EC2 KeyPair to enable SSH access to the instances",
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

    "SSHLocation": {
      "Description": "The IP address range that can be used to SSH to the EC2 instances",
      "Type": "String",
      "MinLength": "9",
      "MaxLength": "18",
      "Default": "0.0.0.0/0",
      "AllowedPattern": "(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})/(\\d{1,2})",
      "ConstraintDescription": "must be a valid IP CIDR range of the form x.x.x.x/x."
    },

    "DBName" : {
      "Default": "wordpressdb",
      "Description" : "The WordPress database name",
      "Type": "String",
      "MinLength": "1",
      "MaxLength": "64",
      "AllowedPattern" : "[a-zA-Z][a-zA-Z0-9]*",
      "ConstraintDescription" : "must begin with a letter and contain only alphanumeric characters."
    },

    "DBUser" : {
      "NoEcho": "true",
      "Description" : "The WordPress database admin account username",
      "Type": "String",
      "MinLength": "1",
      "MaxLength": "16",
      "AllowedPattern" : "[a-zA-Z][a-zA-Z0-9]*",
      "ConstraintDescription" : "must begin with a letter and contain only alphanumeric characters."
    },

    "DBPassword" : {
      "NoEcho": "true",
      "Description" : "The WordPress database admin account password",
      "Type": "String",
      "MinLength": "8",
      "MaxLength": "41",
      "AllowedPattern" : "[a-zA-Z0-9]*",
      "ConstraintDescription" : "must contain only alphanumeric characters."
    },

    "DBRootPassword" : {
      "NoEcho": "true",
      "Description" : "MySQL root password",
      "Type": "String",
      "MinLength": "8",
      "MaxLength": "41",
      "AllowedPattern" : "[a-zA-Z0-9]*",
      "ConstraintDescription" : "must contain only alphanumeric characters."
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
      "us-east-1"        : {"PV64" : "ami-1ccae774", "HVM64" : "ami-1ecae776", "HVMG2" : "ami-8c6b40e4"},
      "us-west-2"        : {"PV64" : "ami-ff527ecf", "HVM64" : "ami-e7527ed7", "HVMG2" : "ami-abbe919b"},
      "us-west-1"        : {"PV64" : "ami-d514f291", "HVM64" : "ami-d114f295", "HVMG2" : "ami-f31ffeb7"},
      "eu-west-1"        : {"PV64" : "ami-bf0897c8", "HVM64" : "ami-a10897d6", "HVMG2" : "ami-d5bc24a2"},
      "eu-central-1"     : {"PV64" : "ami-ac221fb1", "HVM64" : "ami-a8221fb5", "HVMG2" : "ami-7cd2ef61"},
      "ap-northeast-1"   : {"PV64" : "ami-27f90e27", "HVM64" : "ami-cbf90ecb", "HVMG2" : "ami-6318e863"},
      "ap-southeast-1"   : {"PV64" : "ami-acd9e8fe", "HVM64" : "ami-68d8e93a", "HVMG2" : "ami-3807376a"},
      "ap-southeast-2"   : {"PV64" : "ami-ff9cecc5", "HVM64" : "ami-fd9cecc7", "HVMG2" : "ami-89790ab3"},
      "sa-east-1"        : {"PV64" : "ami-bb2890a6", "HVM64" : "ami-b52890a8", "HVMG2" : "NOT_SUPPORTED"},
      "cn-north-1"       : {"PV64" : "ami-fa39abc3", "HVM64" : "ami-f239abcb", "HVMG2" : "NOT_SUPPORTED"}
    }

  },

  "Resources" : {
    "WebServerSecurityGroup" : {
      "Type" : "AWS::EC2::SecurityGroup",
      "Properties" : {
        "GroupDescription" : "Enable HTTP access via port 80 locked down to the load balancer + SSH access",
        "SecurityGroupIngress" : [
          {"IpProtocol" : "tcp", "FromPort" : "80", "ToPort" : "80", "CidrIp" : "0.0.0.0/0"},
          {"IpProtocol" : "tcp", "FromPort" : "22", "ToPort" : "22", "CidrIp" : { "Ref" : "SSHLocation"}}
        ]
      }
    },

    "WebServer": {
      "Type" : "AWS::EC2::Instance",
      "Metadata" : {
        "AWS::CloudFormation::Init" : {
          "configSets" : {
            "wordpress_install" : ["install_cfn", "install_wordpress", "configure_wordpress" ]
          },
          "install_cfn" : {
            "files": {
              "/etc/cfn/cfn-hup.conf": {
                "content": { "Fn::Join": [ "", [
                  "[main]\n",
                  "stack=", { "Ref": "AWS::StackId" }, "\n",
                  "region=", { "Ref": "AWS::Region" }, "\n"
                ]]},
                "mode"  : "000400",
                "owner" : "root",
                "group" : "root"
              },
              "/etc/cfn/hooks.d/cfn-auto-reloader.conf": {
                "content": { "Fn::Join": [ "", [
                  "[cfn-auto-reloader-hook]\n",
                  "triggers=post.update\n",
                  "path=Resources.WebServer.Metadata.AWS::CloudFormation::Init\n",
                  "action=/opt/aws/bin/cfn-init -v ",
                  "         --stack ", { "Ref" : "AWS::StackName" },
                  "         --resource WebServer ",
                  "         --configsets wordpress_install ",
                  "         --region ", { "Ref" : "AWS::Region" }, "\n"
                ]]},
                "mode"  : "000400",
                "owner" : "root",
                "group" : "root"
              }
            },
            "services" : {
              "sysvinit" : {
                "cfn-hup" : { "enabled" : "true", "ensureRunning" : "true",
                  "files" : ["/etc/cfn/cfn-hup.conf", "/etc/cfn/hooks.d/cfn-auto-reloader.conf"] }
              }
            }
          },

          "install_wordpress" : {
            "packages" : {
              "yum" : {
                "php"          : [],
                "php-mysql"    : [],
                "mysql"        : [],
                "mysql-server" : [],
                "mysql-devel"  : [],
                "mysql-libs"   : [],
                "httpd"        : []
              }
            },
            "sources" : {
              "/var/www/html" : "http://wordpress.org/latest.tar.gz"
            },
            "files" : {
              "/tmp/setup.mysql" : {
                "content" : { "Fn::Join" : ["", [
                  "CREATE DATABASE ", { "Ref" : "DBName" }, ";\n",
                  "CREATE USER '", { "Ref" : "DBUser" }, "'@'localhost' IDENTIFIED BY '", { "Ref" : "DBPassword" }, "';\n",
                  "GRANT ALL ON ", { "Ref" : "DBName" }, ".* TO '", { "Ref" : "DBUser" }, "'@'localhost';\n",
                  "FLUSH PRIVILEGES;\n"
                ]]},
                "mode"  : "000400",
                "owner" : "root",
                "group" : "root"
              },

              "/tmp/create-wp-config" : {
                "content" : { "Fn::Join" : [ "", [
                  "#!/bin/bash -xe\n",
                  "cp /var/www/html/wordpress/wp-config-sample.php /var/www/html/wordpress/wp-config.php\n",
                  "sed -i \"s/'database_name_here'/'",{ "Ref" : "DBName" }, "'/g\" wp-config.php\n",
                  "sed -i \"s/'username_here'/'",{ "Ref" : "DBUser" }, "'/g\" wp-config.php\n",
                  "sed -i \"s/'password_here'/'",{ "Ref" : "DBPassword" }, "'/g\" wp-config.php\n"
                ]]},
                "mode" : "000500",
                "owner" : "root",
                "group" : "root"
              }
            },
            "services" : {
              "sysvinit" : {
                "httpd"  : { "enabled" : "true", "ensureRunning" : "true" },
                "mysqld" : { "enabled" : "true", "ensureRunning" : "true" }
              }
            }
          },

          "configure_wordpress" : {
            "commands" : {
              "01_set_mysql_root_password" : {
                "command" : { "Fn::Join" : ["", ["mysqladmin -u root password '", { "Ref" : "DBRootPassword" }, "'"]]},
                "test" : { "Fn::Join" : ["", ["$(mysql ", { "Ref" : "DBName" }, " -u root --password='", { "Ref" : "DBRootPassword" }, "' >/dev/null 2>&1 </dev/null); (( $? != 0 ))"]]}
              },
              "02_create_database" : {
                "command" : { "Fn::Join" : ["", ["mysql -u root --password='", { "Ref" : "DBRootPassword" }, "' < /tmp/setup.mysql"]]},
                "test" : { "Fn::Join" : ["", ["$(mysql ", { "Ref" : "DBName" }, " -u root --password='", { "Ref" : "DBRootPassword" }, "' >/dev/null 2>&1 </dev/null); (( $? != 0 ))"]]}
              },
              "03_configure_wordpress" : {
                "command" : "/tmp/create-wp-config",
                "cwd" : "/var/www/html/wordpress"
              }
            }
          }
        }
      },
      "Properties": {
        "ImageId" : { "Fn::FindInMap" : [ "AWSRegionArch2AMI", { "Ref" : "AWS::Region" },
          { "Fn::FindInMap" : [ "AWSInstanceType2Arch", { "Ref" : "InstanceType" }, "Arch" ] } ] },
        "InstanceType"   : { "Ref" : "InstanceType" },
        "SecurityGroups" : [ {"Ref" : "WebServerSecurityGroup"} ],
        "KeyName"        : { "Ref" : "KeyName" },
        "UserData" : { "Fn::Base64" : { "Fn::Join" : ["", [
          "#!/bin/bash -xe\n",
          "yum update -y aws-cfn-bootstrap\n",

          "/opt/aws/bin/cfn-init -v ",
          "         --stack ", { "Ref" : "AWS::StackName" },
          "         --resource WebServer ",
          "         --configsets wordpress_install ",
          "         --region ", { "Ref" : "AWS::Region" }, "\n",

          "/opt/aws/bin/cfn-signal -e $? ",
          "         --stack ", { "Ref" : "AWS::StackName" },
          "         --resource WebServer ",
          "         --region ", { "Ref" : "AWS::Region" }, "\n"
        ]]}}
      },
      "CreationPolicy" : {
        "ResourceSignal" : {
          "Timeout" : "PT15M"
        }
      }
    }
  },

  "Outputs" : {
    "WebsiteURL" : {
      "Value" : { "Fn::Join" : ["", ["http://", { "Fn::GetAtt" : [ "WebServer", "PublicDnsName" ]}, "/wordpress" ]]},
      "Description" : "WordPress Website"
    }
  }
}

},{}],"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/views/main.page.js":[function(require,module,exports){
/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

var SourceEditor = require('../components/source.editor');
var GuiEditor = require('../components/gui.editor');

var MainPage = {

  controller: function(options) {

    var ctrl = this;

    //var list = options.list;

    ctrl.template = options.template;
    console.log('From Controller:');
    console.log(options.template);

    ctrl.sourceEditorController = new SourceEditor.controller({
      template: options.template
    });

    ctrl.guiEditorController = new GuiEditor.controller({
      template: options.template
    });

  },

  view: function(controller) {
    console.log('From the view:');
    console.log(controller.template);
    return [
        m(".header", [
          m("ul.nav.nav-pills.pull-right", [
            m("li.active", [m("a[href='#']", "Home")]),
            m("li", [m("a[href='#']", "About")]),
            m("li", [m("a[href='#']", "Contact")])
          ]),
          m("h3.text-muted", "Cloudslicer")
        ]),
      //[m(".container-fluid", [
        m('.row', [
          m(".col-md-6", [
            m('div', 'Source'),
            SourceEditor.view(controller.sourceEditorController),
          ]),
          m(".col-md-6", [
            m('div', 'Visual'),
            GuiEditor.view(controller.guiEditorController)
          ])
        ]),
        m(".footer", [
          m("p", "By Armin Graf")
        ])
      //])]
    ]
  }

};

module.exports = MainPage;

},{"../components/gui.editor":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/gui.editor.js","../components/source.editor":"/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/components/source.editor.js"}]},{},["/Users/arminhammer/WebstormProjects/cloudslicer/app/scripts/main.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL2d1aS5lZGl0b3IuanMiLCJhcHAvc2NyaXB0cy9jb21wb25lbnRzL3NvdXJjZS5lZGl0b3IuanMiLCJhcHAvc2NyaXB0cy9tYWluLmpzIiwiYXBwL3NjcmlwdHMvdGVzdERhdGEvd29yZHByZXNzLnRlbXBsYXRlLmpzb24iLCJhcHAvc2NyaXB0cy92aWV3cy9tYWluLnBhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy92YXIgVmlkZW9Nb2RlbCA9IHJlcXVpcmUoJy4uL21vZGVscy92aWRlby5tb2RlbCcpO1xuXG52YXIgR3VpRWRpdG9yID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRlbXBsYXRlOiBvcHRpb25zLnRlbXBsYXRlLFxuXG4gICAgICBkcmF3RWRpdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuXG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHMgPSBTbmFwKGVsZW1lbnQpO1xuXG4gICAgICAgIHZhciBiaWdDaXJjbGUgPSBzLmNpcmNsZSgxNTAsIDE1MCwgMTAwKTtcblxuICAgICAgICBiaWdDaXJjbGUuYXR0cih7XG4gICAgICAgICAgZmlsbDogXCIjYmFkYTU1XCIsXG4gICAgICAgICAgc3Ryb2tlOiBcIiMwMDBcIixcbiAgICAgICAgICBzdHJva2VXaWR0aDogNVxuICAgICAgICB9KTtcblxuICAgICAgICAvKlxuICAgICAgICAgdmFyIGVkaXRvciA9IENvZGVNaXJyb3IoZWxlbWVudCwge1xuICAgICAgICAgdmFsdWU6IG9wdGlvbnMudGVtcGxhdGUoKSxcbiAgICAgICAgIGxpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgbW9kZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgZ3V0dGVyczogWydDb2RlTWlycm9yLWxpbnQtbWFya2VycyddLFxuICAgICAgICAgbGludDogdHJ1ZSxcbiAgICAgICAgIHN0eWxlQWN0aXZlTGluZTogdHJ1ZSxcbiAgICAgICAgIGF1dG9DbG9zZUJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgbWF0Y2hCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgIHRoZW1lOiAnemVuYnVybidcbiAgICAgICAgIH0pO1xuXG4gICAgICAgICBlZGl0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uKGVkaXRvcikge1xuICAgICAgICAgbS5zdGFydENvbXB1dGF0aW9uKCk7XG4gICAgICAgICBvcHRpb25zLnRlbXBsYXRlKGVkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgIG0uZW5kQ29tcHV0YXRpb24oKTtcbiAgICAgICAgIH0pO1xuICAgICAgICAgKi9cbiAgICAgIH1cblxuICAgIH1cbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHZhciBwYXJzZWQgPSBudWxsO1xuICAgIHZhciBzb3VyY2VCbG9jayA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgcGFyc2VkID0gSlNPTi5wYXJzZShjb250cm9sbGVyLnRlbXBsYXRlKCkpO1xuICAgICAgc291cmNlQmxvY2sgPSAgIFtcbiAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgIF8ubWFwKHBhcnNlZC5SZXNvdXJjZXMsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnZGl2JywgdmFsdWUuVHlwZSlcbiAgICAgICAgICB9KVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgIHBhcnNlZC5QYXJhbWV0ZXJzLkluc3RhbmNlVHlwZS5BbGxvd2VkVmFsdWVzLm1hcChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIG0oJ2RpdicsIHZhbHVlKVxuICAgICAgICAgIH0pXG4gICAgICAgIF0pXG4gICAgICBdXG4gICAgfVxuICAgIGNhdGNoKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdQYXJzZSBlcnJvcjogJyArIGUpO1xuICAgICAgc291cmNlQmxvY2sgPSAgIG0oJ2RpdicsIHt9LCBlKVxuICAgIH1cblxuICAgIC8qXG4gICAgIHZhciBkcmF3R1VJID0gZnVuY3Rpb24oKSB7XG4gICAgIHZhciBzID0gU25hcCgnJyk7XG5cbiAgICAgdmFyIGJpZ0NpcmNsZSA9IHMuY2lyY2xlKDE1MCwgMTUwLCAxMDApO1xuXG4gICAgIGJpZ0NpcmNsZS5hdHRyKHtcbiAgICAgZmlsbDogXCIjYmFkYTU1XCIsXG4gICAgIHN0cm9rZTogXCIjMDAwXCIsXG4gICAgIHN0cm9rZVdpZHRoOiA1XG4gICAgIH0pO1xuXG4gICAgIHJldHVybiBtKCdzdmcnLHMpO1xuICAgICB9O1xuICAgICAqL1xuXG4gICAgcmV0dXJuIFtcbiAgICAgIG0oJyNndWlDb250YWluZXInLCBbXG4gICAgICAgIG0oJ3N2ZyNndWlFZGl0b3InLCB7IGNvbmZpZzogY29udHJvbGxlci5kcmF3RWRpdG9yIH0pXG4gICAgICBdKVxuICAgICAgLypcbiAgICAgICAqL1xuXG4gICAgICAvKlxuICAgICAgIG0oJ2RpdicsIFtcbiAgICAgICBtKCdoMScsICdWaWRlbycpXG4gICAgICAgXSksXG4gICAgICAgbSgndmlkZW8jdmlkZW9QbGF5ZXJbY29udHJvbHNdJywge1xuICAgICAgIHNyYzonJyxcbiAgICAgICBjbGFzczondmlkZW8tanMgdmpzLWRlZmF1bHQtc2tpbicsXG4gICAgICAgbXV0ZWQ6J211dGVkJyxcbiAgICAgICAvL2F1dG9wbGF5OidhdXRvcGxheScsXG4gICAgICAgcHJlbG9hZDonYXV0bycsXG4gICAgICAgd2lkdGg6JzY0MCcsXG4gICAgICAgaGVpZ2h0OiczNjAnLFxuICAgICAgIGNvbmZpZzogY29udHJvbGxlci5pbml0UGxheWVyXG4gICAgICAgfSlcbiAgICAgICAqL1xuICAgIF1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHdWlFZGl0b3I7XG4iLCIvKipcbiAqIENyZWF0ZWQgYnkgYXJtaW5oYW1tZXIgb24gNy85LzE1LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy92YXIganNvbmxpbnQgPSByZXF1aXJlKCdqc29ubGludCcpO1xuXG52YXIgU291cmNlRWRpdG9yID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICBkcmF3RWRpdG9yOiBmdW5jdGlvbiAoZWxlbWVudCwgaXNJbml0aWFsaXplZCwgY29udGV4dCkge1xuXG4gICAgICAgIGlmIChpc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGVkaXRvciA9IENvZGVNaXJyb3IoZWxlbWVudCwge1xuICAgICAgICAgIHZhbHVlOiBvcHRpb25zLnRlbXBsYXRlKCksXG4gICAgICAgICAgbGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgbW9kZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgIGd1dHRlcnM6IFsnQ29kZU1pcnJvci1saW50LW1hcmtlcnMnXSxcbiAgICAgICAgICBsaW50OiB0cnVlLFxuICAgICAgICAgIHN0eWxlQWN0aXZlTGluZTogdHJ1ZSxcbiAgICAgICAgICBhdXRvQ2xvc2VCcmFja2V0czogdHJ1ZSxcbiAgICAgICAgICBtYXRjaEJyYWNrZXRzOiB0cnVlLFxuICAgICAgICAgIHRoZW1lOiAnemVuYnVybidcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZWRpdG9yLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbihlZGl0b3IpIHtcbiAgICAgICAgICBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcbiAgICAgICAgICBvcHRpb25zLnRlbXBsYXRlKGVkaXRvci5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICBtLmVuZENvbXB1dGF0aW9uKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfTtcbiAgfSxcbiAgdmlldzogZnVuY3Rpb24oY29udHJvbGxlcikge1xuICAgIHJldHVybiBbXG4gICAgICBtKCcjc291cmNlRWRpdG9yJywgeyBjb25maWc6IGNvbnRyb2xsZXIuZHJhd0VkaXRvciB9KVxuICAgIF1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTb3VyY2VFZGl0b3I7XG4iLCJcbid1c2Ugc3RyaWN0JztcblxudmFyIE1haW5QYWdlID0gcmVxdWlyZSgnLi92aWV3cy9tYWluLnBhZ2UnKTtcbi8vdmFyIFZpZGVvTW9kZWwgPSByZXF1aXJlKCcuL21vZGVscy92aWRlby5tb2RlbCcpO1xuXG52YXIgdGVzdERhdGEgPSByZXF1aXJlKCcuL3Rlc3REYXRhL3dvcmRwcmVzcy50ZW1wbGF0ZS5qc29uJyk7XG5cbnZhciB0ZW1wbGF0ZSA9IG0ucHJvcChKU09OLnN0cmluZ2lmeSh0ZXN0RGF0YSwgdW5kZWZpbmVkLCAyKSk7XG5cbm0ucm91dGUubW9kZSA9ICdoYXNoJztcblxubS5yb3V0ZShkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvdWRzbGljZXItYXBwJyksICcvJywge1xuICAnLyc6IG0uY29tcG9uZW50KE1haW5QYWdlLCB7XG4gICAgdGVtcGxhdGU6IHRlbXBsYXRlXG4gIH0pXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJBV1NUZW1wbGF0ZUZvcm1hdFZlcnNpb25cIiA6IFwiMjAxMC0wOS0wOVwiLFxuXG4gIFwiRGVzY3JpcHRpb25cIiA6IFwiQVdTIENsb3VkRm9ybWF0aW9uIFNhbXBsZSBUZW1wbGF0ZSBXb3JkUHJlc3NfU2luZ2xlX0luc3RhbmNlOiBXb3JkUHJlc3MgaXMgd2ViIHNvZnR3YXJlIHlvdSBjYW4gdXNlIHRvIGNyZWF0ZSBhIGJlYXV0aWZ1bCB3ZWJzaXRlIG9yIGJsb2cuIFRoaXMgdGVtcGxhdGUgaW5zdGFsbHMgV29yZFByZXNzIHdpdGggYSBsb2NhbCBNeVNRTCBkYXRhYmFzZSBmb3Igc3RvcmFnZS4gSXQgZGVtb25zdHJhdGVzIHVzaW5nIHRoZSBBV1MgQ2xvdWRGb3JtYXRpb24gYm9vdHN0cmFwIHNjcmlwdHMgdG8gZGVwbG95IFdvcmRQcmVzcy4gKipXQVJOSU5HKiogVGhpcyB0ZW1wbGF0ZSBjcmVhdGVzIGFuIEFtYXpvbiBFQzIgaW5zdGFuY2UuIFlvdSB3aWxsIGJlIGJpbGxlZCBmb3IgdGhlIEFXUyByZXNvdXJjZXMgdXNlZCBpZiB5b3UgY3JlYXRlIGEgc3RhY2sgZnJvbSB0aGlzIHRlbXBsYXRlLlwiLFxuXG4gIFwiUGFyYW1ldGVyc1wiIDoge1xuXG4gICAgXCJLZXlOYW1lXCI6IHtcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiTmFtZSBvZiBhbiBleGlzdGluZyBFQzIgS2V5UGFpciB0byBlbmFibGUgU1NIIGFjY2VzcyB0byB0aGUgaW5zdGFuY2VzXCIsXG4gICAgICBcIlR5cGVcIjogXCJBV1M6OkVDMjo6S2V5UGFpcjo6S2V5TmFtZVwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBiZSB0aGUgbmFtZSBvZiBhbiBleGlzdGluZyBFQzIgS2V5UGFpci5cIlxuICAgIH0sXG5cbiAgICBcIkluc3RhbmNlVHlwZVwiIDoge1xuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJXZWJTZXJ2ZXIgRUMyIGluc3RhbmNlIHR5cGVcIixcbiAgICAgIFwiVHlwZVwiIDogXCJTdHJpbmdcIixcbiAgICAgIFwiRGVmYXVsdFwiIDogXCJtMS5zbWFsbFwiLFxuICAgICAgXCJBbGxvd2VkVmFsdWVzXCIgOiBbIFwidDEubWljcm9cIiwgXCJ0Mi5taWNyb1wiLCBcInQyLnNtYWxsXCIsIFwidDIubWVkaXVtXCIsIFwibTEuc21hbGxcIiwgXCJtMS5tZWRpdW1cIiwgXCJtMS5sYXJnZVwiLCBcIm0xLnhsYXJnZVwiLCBcIm0yLnhsYXJnZVwiLCBcIm0yLjJ4bGFyZ2VcIiwgXCJtMi40eGxhcmdlXCIsIFwibTMubWVkaXVtXCIsIFwibTMubGFyZ2VcIiwgXCJtMy54bGFyZ2VcIiwgXCJtMy4yeGxhcmdlXCIsIFwiYzEubWVkaXVtXCIsIFwiYzEueGxhcmdlXCIsIFwiYzMubGFyZ2VcIiwgXCJjMy54bGFyZ2VcIiwgXCJjMy4yeGxhcmdlXCIsIFwiYzMuNHhsYXJnZVwiLCBcImMzLjh4bGFyZ2VcIiwgXCJjNC5sYXJnZVwiLCBcImM0LnhsYXJnZVwiLCBcImM0LjJ4bGFyZ2VcIiwgXCJjNC40eGxhcmdlXCIsIFwiYzQuOHhsYXJnZVwiLCBcImcyLjJ4bGFyZ2VcIiwgXCJyMy5sYXJnZVwiLCBcInIzLnhsYXJnZVwiLCBcInIzLjJ4bGFyZ2VcIiwgXCJyMy40eGxhcmdlXCIsIFwicjMuOHhsYXJnZVwiLCBcImkyLnhsYXJnZVwiLCBcImkyLjJ4bGFyZ2VcIiwgXCJpMi40eGxhcmdlXCIsIFwiaTIuOHhsYXJnZVwiLCBcImQyLnhsYXJnZVwiLCBcImQyLjJ4bGFyZ2VcIiwgXCJkMi40eGxhcmdlXCIsIFwiZDIuOHhsYXJnZVwiLCBcImhpMS40eGxhcmdlXCIsIFwiaHMxLjh4bGFyZ2VcIiwgXCJjcjEuOHhsYXJnZVwiLCBcImNjMi44eGxhcmdlXCIsIFwiY2cxLjR4bGFyZ2VcIl1cbiAgICAsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlIGEgdmFsaWQgRUMyIGluc3RhbmNlIHR5cGUuXCJcbiAgICB9LFxuXG4gICAgXCJTU0hMb2NhdGlvblwiOiB7XG4gICAgICBcIkRlc2NyaXB0aW9uXCI6IFwiVGhlIElQIGFkZHJlc3MgcmFuZ2UgdGhhdCBjYW4gYmUgdXNlZCB0byBTU0ggdG8gdGhlIEVDMiBpbnN0YW5jZXNcIixcbiAgICAgIFwiVHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJNaW5MZW5ndGhcIjogXCI5XCIsXG4gICAgICBcIk1heExlbmd0aFwiOiBcIjE4XCIsXG4gICAgICBcIkRlZmF1bHRcIjogXCIwLjAuMC4wLzBcIixcbiAgICAgIFwiQWxsb3dlZFBhdHRlcm5cIjogXCIoXFxcXGR7MSwzfSlcXFxcLihcXFxcZHsxLDN9KVxcXFwuKFxcXFxkezEsM30pXFxcXC4oXFxcXGR7MSwzfSkvKFxcXFxkezEsMn0pXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiOiBcIm11c3QgYmUgYSB2YWxpZCBJUCBDSURSIHJhbmdlIG9mIHRoZSBmb3JtIHgueC54LngveC5cIlxuICAgIH0sXG5cbiAgICBcIkRCTmFtZVwiIDoge1xuICAgICAgXCJEZWZhdWx0XCI6IFwid29yZHByZXNzZGJcIixcbiAgICAgIFwiRGVzY3JpcHRpb25cIiA6IFwiVGhlIFdvcmRQcmVzcyBkYXRhYmFzZSBuYW1lXCIsXG4gICAgICBcIlR5cGVcIjogXCJTdHJpbmdcIixcbiAgICAgIFwiTWluTGVuZ3RoXCI6IFwiMVwiLFxuICAgICAgXCJNYXhMZW5ndGhcIjogXCI2NFwiLFxuICAgICAgXCJBbGxvd2VkUGF0dGVyblwiIDogXCJbYS16QS1aXVthLXpBLVowLTldKlwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBiZWdpbiB3aXRoIGEgbGV0dGVyIGFuZCBjb250YWluIG9ubHkgYWxwaGFudW1lcmljIGNoYXJhY3RlcnMuXCJcbiAgICB9LFxuXG4gICAgXCJEQlVzZXJcIiA6IHtcbiAgICAgIFwiTm9FY2hvXCI6IFwidHJ1ZVwiLFxuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJUaGUgV29yZFByZXNzIGRhdGFiYXNlIGFkbWluIGFjY291bnQgdXNlcm5hbWVcIixcbiAgICAgIFwiVHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJNaW5MZW5ndGhcIjogXCIxXCIsXG4gICAgICBcIk1heExlbmd0aFwiOiBcIjE2XCIsXG4gICAgICBcIkFsbG93ZWRQYXR0ZXJuXCIgOiBcIlthLXpBLVpdW2EtekEtWjAtOV0qXCIsXG4gICAgICBcIkNvbnN0cmFpbnREZXNjcmlwdGlvblwiIDogXCJtdXN0IGJlZ2luIHdpdGggYSBsZXR0ZXIgYW5kIGNvbnRhaW4gb25seSBhbHBoYW51bWVyaWMgY2hhcmFjdGVycy5cIlxuICAgIH0sXG5cbiAgICBcIkRCUGFzc3dvcmRcIiA6IHtcbiAgICAgIFwiTm9FY2hvXCI6IFwidHJ1ZVwiLFxuICAgICAgXCJEZXNjcmlwdGlvblwiIDogXCJUaGUgV29yZFByZXNzIGRhdGFiYXNlIGFkbWluIGFjY291bnQgcGFzc3dvcmRcIixcbiAgICAgIFwiVHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJNaW5MZW5ndGhcIjogXCI4XCIsXG4gICAgICBcIk1heExlbmd0aFwiOiBcIjQxXCIsXG4gICAgICBcIkFsbG93ZWRQYXR0ZXJuXCIgOiBcIlthLXpBLVowLTldKlwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBjb250YWluIG9ubHkgYWxwaGFudW1lcmljIGNoYXJhY3RlcnMuXCJcbiAgICB9LFxuXG4gICAgXCJEQlJvb3RQYXNzd29yZFwiIDoge1xuICAgICAgXCJOb0VjaG9cIjogXCJ0cnVlXCIsXG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIk15U1FMIHJvb3QgcGFzc3dvcmRcIixcbiAgICAgIFwiVHlwZVwiOiBcIlN0cmluZ1wiLFxuICAgICAgXCJNaW5MZW5ndGhcIjogXCI4XCIsXG4gICAgICBcIk1heExlbmd0aFwiOiBcIjQxXCIsXG4gICAgICBcIkFsbG93ZWRQYXR0ZXJuXCIgOiBcIlthLXpBLVowLTldKlwiLFxuICAgICAgXCJDb25zdHJhaW50RGVzY3JpcHRpb25cIiA6IFwibXVzdCBjb250YWluIG9ubHkgYWxwaGFudW1lcmljIGNoYXJhY3RlcnMuXCJcbiAgICB9XG4gIH0sXG5cbiAgXCJNYXBwaW5nc1wiIDoge1xuICAgIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiA6IHtcbiAgICAgIFwidDEubWljcm9cIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcInQyLm1pY3JvXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJ0Mi5zbWFsbFwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwidDIubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0xLnNtYWxsXCIgICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMS5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTEubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0xLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMi54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiUFY2NFwiICAgfSxcbiAgICAgIFwibTIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcIm0yLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJtMy5tZWRpdW1cIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwibTMubGFyZ2VcIiAgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcIm0zLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJtMy4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzEubWVkaXVtXCIgICA6IHsgXCJBcmNoXCIgOiBcIlBWNjRcIiAgIH0sXG4gICAgICBcImMxLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJQVjY0XCIgICB9LFxuICAgICAgXCJjMy5sYXJnZVwiICAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImMzLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjMy40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzMuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiYzQuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImM0LjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjNC44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZzIuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTUcyXCIgIH0sXG4gICAgICBcInIzLmxhcmdlXCIgICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy54bGFyZ2VcIiAgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwicjMuMnhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcInIzLjR4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJyMy44eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIueGxhcmdlXCIgICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImkyLjJ4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJpMi40eGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaTIuOHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLnhsYXJnZVwiICAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJkMi4yeGxhcmdlXCIgIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiZDIuNHhsYXJnZVwiICA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImQyLjh4bGFyZ2VcIiAgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJoaTEuNHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfSxcbiAgICAgIFwiaHMxLjh4bGFyZ2VcIiA6IHsgXCJBcmNoXCIgOiBcIkhWTTY0XCIgIH0sXG4gICAgICBcImNyMS44eGxhcmdlXCIgOiB7IFwiQXJjaFwiIDogXCJIVk02NFwiICB9LFxuICAgICAgXCJjYzIuOHhsYXJnZVwiIDogeyBcIkFyY2hcIiA6IFwiSFZNNjRcIiAgfVxuICAgIH1cbiAgLFxuICAgIFwiQVdTUmVnaW9uQXJjaDJBTUlcIiA6IHtcbiAgICAgIFwidXMtZWFzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktMWNjYWU3NzRcIiwgXCJIVk02NFwiIDogXCJhbWktMWVjYWU3NzZcIiwgXCJIVk1HMlwiIDogXCJhbWktOGM2YjQwZTRcIn0sXG4gICAgICBcInVzLXdlc3QtMlwiICAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWZmNTI3ZWNmXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWU3NTI3ZWQ3XCIsIFwiSFZNRzJcIiA6IFwiYW1pLWFiYmU5MTliXCJ9LFxuICAgICAgXCJ1cy13ZXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1kNTE0ZjI5MVwiLCBcIkhWTTY0XCIgOiBcImFtaS1kMTE0ZjI5NVwiLCBcIkhWTUcyXCIgOiBcImFtaS1mMzFmZmViN1wifSxcbiAgICAgIFwiZXUtd2VzdC0xXCIgICAgICAgIDoge1wiUFY2NFwiIDogXCJhbWktYmYwODk3YzhcIiwgXCJIVk02NFwiIDogXCJhbWktYTEwODk3ZDZcIiwgXCJIVk1HMlwiIDogXCJhbWktZDViYzI0YTJcIn0sXG4gICAgICBcImV1LWNlbnRyYWwtMVwiICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWFjMjIxZmIxXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWE4MjIxZmI1XCIsIFwiSFZNRzJcIiA6IFwiYW1pLTdjZDJlZjYxXCJ9LFxuICAgICAgXCJhcC1ub3J0aGVhc3QtMVwiICAgOiB7XCJQVjY0XCIgOiBcImFtaS0yN2Y5MGUyN1wiLCBcIkhWTTY0XCIgOiBcImFtaS1jYmY5MGVjYlwiLCBcIkhWTUcyXCIgOiBcImFtaS02MzE4ZTg2M1wifSxcbiAgICAgIFwiYXAtc291dGhlYXN0LTFcIiAgIDoge1wiUFY2NFwiIDogXCJhbWktYWNkOWU4ZmVcIiwgXCJIVk02NFwiIDogXCJhbWktNjhkOGU5M2FcIiwgXCJIVk1HMlwiIDogXCJhbWktMzgwNzM3NmFcIn0sXG4gICAgICBcImFwLXNvdXRoZWFzdC0yXCIgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWZmOWNlY2M1XCIsIFwiSFZNNjRcIiA6IFwiYW1pLWZkOWNlY2M3XCIsIFwiSFZNRzJcIiA6IFwiYW1pLTg5NzkwYWIzXCJ9LFxuICAgICAgXCJzYS1lYXN0LTFcIiAgICAgICAgOiB7XCJQVjY0XCIgOiBcImFtaS1iYjI4OTBhNlwiLCBcIkhWTTY0XCIgOiBcImFtaS1iNTI4OTBhOFwiLCBcIkhWTUcyXCIgOiBcIk5PVF9TVVBQT1JURURcIn0sXG4gICAgICBcImNuLW5vcnRoLTFcIiAgICAgICA6IHtcIlBWNjRcIiA6IFwiYW1pLWZhMzlhYmMzXCIsIFwiSFZNNjRcIiA6IFwiYW1pLWYyMzlhYmNiXCIsIFwiSFZNRzJcIiA6IFwiTk9UX1NVUFBPUlRFRFwifVxuICAgIH1cblxuICB9LFxuXG4gIFwiUmVzb3VyY2VzXCIgOiB7XG4gICAgXCJXZWJTZXJ2ZXJTZWN1cml0eUdyb3VwXCIgOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6OlNlY3VyaXR5R3JvdXBcIixcbiAgICAgIFwiUHJvcGVydGllc1wiIDoge1xuICAgICAgICBcIkdyb3VwRGVzY3JpcHRpb25cIiA6IFwiRW5hYmxlIEhUVFAgYWNjZXNzIHZpYSBwb3J0IDgwIGxvY2tlZCBkb3duIHRvIHRoZSBsb2FkIGJhbGFuY2VyICsgU1NIIGFjY2Vzc1wiLFxuICAgICAgICBcIlNlY3VyaXR5R3JvdXBJbmdyZXNzXCIgOiBbXG4gICAgICAgICAge1wiSXBQcm90b2NvbFwiIDogXCJ0Y3BcIiwgXCJGcm9tUG9ydFwiIDogXCI4MFwiLCBcIlRvUG9ydFwiIDogXCI4MFwiLCBcIkNpZHJJcFwiIDogXCIwLjAuMC4wLzBcIn0sXG4gICAgICAgICAge1wiSXBQcm90b2NvbFwiIDogXCJ0Y3BcIiwgXCJGcm9tUG9ydFwiIDogXCIyMlwiLCBcIlRvUG9ydFwiIDogXCIyMlwiLCBcIkNpZHJJcFwiIDogeyBcIlJlZlwiIDogXCJTU0hMb2NhdGlvblwifX1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcIldlYlNlcnZlclwiOiB7XG4gICAgICBcIlR5cGVcIiA6IFwiQVdTOjpFQzI6Okluc3RhbmNlXCIsXG4gICAgICBcIk1ldGFkYXRhXCIgOiB7XG4gICAgICAgIFwiQVdTOjpDbG91ZEZvcm1hdGlvbjo6SW5pdFwiIDoge1xuICAgICAgICAgIFwiY29uZmlnU2V0c1wiIDoge1xuICAgICAgICAgICAgXCJ3b3JkcHJlc3NfaW5zdGFsbFwiIDogW1wiaW5zdGFsbF9jZm5cIiwgXCJpbnN0YWxsX3dvcmRwcmVzc1wiLCBcImNvbmZpZ3VyZV93b3JkcHJlc3NcIiBdXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImluc3RhbGxfY2ZuXCIgOiB7XG4gICAgICAgICAgICBcImZpbGVzXCI6IHtcbiAgICAgICAgICAgICAgXCIvZXRjL2Nmbi9jZm4taHVwLmNvbmZcIjoge1xuICAgICAgICAgICAgICAgIFwiY29udGVudFwiOiB7IFwiRm46OkpvaW5cIjogWyBcIlwiLCBbXG4gICAgICAgICAgICAgICAgICBcIlttYWluXVxcblwiLFxuICAgICAgICAgICAgICAgICAgXCJzdGFjaz1cIiwgeyBcIlJlZlwiOiBcIkFXUzo6U3RhY2tJZFwiIH0sIFwiXFxuXCIsXG4gICAgICAgICAgICAgICAgICBcInJlZ2lvbj1cIiwgeyBcIlJlZlwiOiBcIkFXUzo6UmVnaW9uXCIgfSwgXCJcXG5cIlxuICAgICAgICAgICAgICAgIF1dfSxcbiAgICAgICAgICAgICAgICBcIm1vZGVcIiAgOiBcIjAwMDQwMFwiLFxuICAgICAgICAgICAgICAgIFwib3duZXJcIiA6IFwicm9vdFwiLFxuICAgICAgICAgICAgICAgIFwiZ3JvdXBcIiA6IFwicm9vdFwiXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIFwiL2V0Yy9jZm4vaG9va3MuZC9jZm4tYXV0by1yZWxvYWRlci5jb25mXCI6IHtcbiAgICAgICAgICAgICAgICBcImNvbnRlbnRcIjogeyBcIkZuOjpKb2luXCI6IFsgXCJcIiwgW1xuICAgICAgICAgICAgICAgICAgXCJbY2ZuLWF1dG8tcmVsb2FkZXItaG9va11cXG5cIixcbiAgICAgICAgICAgICAgICAgIFwidHJpZ2dlcnM9cG9zdC51cGRhdGVcXG5cIixcbiAgICAgICAgICAgICAgICAgIFwicGF0aD1SZXNvdXJjZXMuV2ViU2VydmVyLk1ldGFkYXRhLkFXUzo6Q2xvdWRGb3JtYXRpb246OkluaXRcXG5cIixcbiAgICAgICAgICAgICAgICAgIFwiYWN0aW9uPS9vcHQvYXdzL2Jpbi9jZm4taW5pdCAtdiBcIixcbiAgICAgICAgICAgICAgICAgIFwiICAgICAgICAgLS1zdGFjayBcIiwgeyBcIlJlZlwiIDogXCJBV1M6OlN0YWNrTmFtZVwiIH0sXG4gICAgICAgICAgICAgICAgICBcIiAgICAgICAgIC0tcmVzb3VyY2UgV2ViU2VydmVyIFwiLFxuICAgICAgICAgICAgICAgICAgXCIgICAgICAgICAtLWNvbmZpZ3NldHMgd29yZHByZXNzX2luc3RhbGwgXCIsXG4gICAgICAgICAgICAgICAgICBcIiAgICAgICAgIC0tcmVnaW9uIFwiLCB7IFwiUmVmXCIgOiBcIkFXUzo6UmVnaW9uXCIgfSwgXCJcXG5cIlxuICAgICAgICAgICAgICAgIF1dfSxcbiAgICAgICAgICAgICAgICBcIm1vZGVcIiAgOiBcIjAwMDQwMFwiLFxuICAgICAgICAgICAgICAgIFwib3duZXJcIiA6IFwicm9vdFwiLFxuICAgICAgICAgICAgICAgIFwiZ3JvdXBcIiA6IFwicm9vdFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNlcnZpY2VzXCIgOiB7XG4gICAgICAgICAgICAgIFwic3lzdmluaXRcIiA6IHtcbiAgICAgICAgICAgICAgICBcImNmbi1odXBcIiA6IHsgXCJlbmFibGVkXCIgOiBcInRydWVcIiwgXCJlbnN1cmVSdW5uaW5nXCIgOiBcInRydWVcIixcbiAgICAgICAgICAgICAgICAgIFwiZmlsZXNcIiA6IFtcIi9ldGMvY2ZuL2Nmbi1odXAuY29uZlwiLCBcIi9ldGMvY2ZuL2hvb2tzLmQvY2ZuLWF1dG8tcmVsb2FkZXIuY29uZlwiXSB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgXCJpbnN0YWxsX3dvcmRwcmVzc1wiIDoge1xuICAgICAgICAgICAgXCJwYWNrYWdlc1wiIDoge1xuICAgICAgICAgICAgICBcInl1bVwiIDoge1xuICAgICAgICAgICAgICAgIFwicGhwXCIgICAgICAgICAgOiBbXSxcbiAgICAgICAgICAgICAgICBcInBocC1teXNxbFwiICAgIDogW10sXG4gICAgICAgICAgICAgICAgXCJteXNxbFwiICAgICAgICA6IFtdLFxuICAgICAgICAgICAgICAgIFwibXlzcWwtc2VydmVyXCIgOiBbXSxcbiAgICAgICAgICAgICAgICBcIm15c3FsLWRldmVsXCIgIDogW10sXG4gICAgICAgICAgICAgICAgXCJteXNxbC1saWJzXCIgICA6IFtdLFxuICAgICAgICAgICAgICAgIFwiaHR0cGRcIiAgICAgICAgOiBbXVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzb3VyY2VzXCIgOiB7XG4gICAgICAgICAgICAgIFwiL3Zhci93d3cvaHRtbFwiIDogXCJodHRwOi8vd29yZHByZXNzLm9yZy9sYXRlc3QudGFyLmd6XCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImZpbGVzXCIgOiB7XG4gICAgICAgICAgICAgIFwiL3RtcC9zZXR1cC5teXNxbFwiIDoge1xuICAgICAgICAgICAgICAgIFwiY29udGVudFwiIDogeyBcIkZuOjpKb2luXCIgOiBbXCJcIiwgW1xuICAgICAgICAgICAgICAgICAgXCJDUkVBVEUgREFUQUJBU0UgXCIsIHsgXCJSZWZcIiA6IFwiREJOYW1lXCIgfSwgXCI7XFxuXCIsXG4gICAgICAgICAgICAgICAgICBcIkNSRUFURSBVU0VSICdcIiwgeyBcIlJlZlwiIDogXCJEQlVzZXJcIiB9LCBcIidAJ2xvY2FsaG9zdCcgSURFTlRJRklFRCBCWSAnXCIsIHsgXCJSZWZcIiA6IFwiREJQYXNzd29yZFwiIH0sIFwiJztcXG5cIixcbiAgICAgICAgICAgICAgICAgIFwiR1JBTlQgQUxMIE9OIFwiLCB7IFwiUmVmXCIgOiBcIkRCTmFtZVwiIH0sIFwiLiogVE8gJ1wiLCB7IFwiUmVmXCIgOiBcIkRCVXNlclwiIH0sIFwiJ0AnbG9jYWxob3N0JztcXG5cIixcbiAgICAgICAgICAgICAgICAgIFwiRkxVU0ggUFJJVklMRUdFUztcXG5cIlxuICAgICAgICAgICAgICAgIF1dfSxcbiAgICAgICAgICAgICAgICBcIm1vZGVcIiAgOiBcIjAwMDQwMFwiLFxuICAgICAgICAgICAgICAgIFwib3duZXJcIiA6IFwicm9vdFwiLFxuICAgICAgICAgICAgICAgIFwiZ3JvdXBcIiA6IFwicm9vdFwiXG4gICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgXCIvdG1wL2NyZWF0ZS13cC1jb25maWdcIiA6IHtcbiAgICAgICAgICAgICAgICBcImNvbnRlbnRcIiA6IHsgXCJGbjo6Sm9pblwiIDogWyBcIlwiLCBbXG4gICAgICAgICAgICAgICAgICBcIiMhL2Jpbi9iYXNoIC14ZVxcblwiLFxuICAgICAgICAgICAgICAgICAgXCJjcCAvdmFyL3d3dy9odG1sL3dvcmRwcmVzcy93cC1jb25maWctc2FtcGxlLnBocCAvdmFyL3d3dy9odG1sL3dvcmRwcmVzcy93cC1jb25maWcucGhwXFxuXCIsXG4gICAgICAgICAgICAgICAgICBcInNlZCAtaSBcXFwicy8nZGF0YWJhc2VfbmFtZV9oZXJlJy8nXCIseyBcIlJlZlwiIDogXCJEQk5hbWVcIiB9LCBcIicvZ1xcXCIgd3AtY29uZmlnLnBocFxcblwiLFxuICAgICAgICAgICAgICAgICAgXCJzZWQgLWkgXFxcInMvJ3VzZXJuYW1lX2hlcmUnLydcIix7IFwiUmVmXCIgOiBcIkRCVXNlclwiIH0sIFwiJy9nXFxcIiB3cC1jb25maWcucGhwXFxuXCIsXG4gICAgICAgICAgICAgICAgICBcInNlZCAtaSBcXFwicy8ncGFzc3dvcmRfaGVyZScvJ1wiLHsgXCJSZWZcIiA6IFwiREJQYXNzd29yZFwiIH0sIFwiJy9nXFxcIiB3cC1jb25maWcucGhwXFxuXCJcbiAgICAgICAgICAgICAgICBdXX0sXG4gICAgICAgICAgICAgICAgXCJtb2RlXCIgOiBcIjAwMDUwMFwiLFxuICAgICAgICAgICAgICAgIFwib3duZXJcIiA6IFwicm9vdFwiLFxuICAgICAgICAgICAgICAgIFwiZ3JvdXBcIiA6IFwicm9vdFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInNlcnZpY2VzXCIgOiB7XG4gICAgICAgICAgICAgIFwic3lzdmluaXRcIiA6IHtcbiAgICAgICAgICAgICAgICBcImh0dHBkXCIgIDogeyBcImVuYWJsZWRcIiA6IFwidHJ1ZVwiLCBcImVuc3VyZVJ1bm5pbmdcIiA6IFwidHJ1ZVwiIH0sXG4gICAgICAgICAgICAgICAgXCJteXNxbGRcIiA6IHsgXCJlbmFibGVkXCIgOiBcInRydWVcIiwgXCJlbnN1cmVSdW5uaW5nXCIgOiBcInRydWVcIiB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgXCJjb25maWd1cmVfd29yZHByZXNzXCIgOiB7XG4gICAgICAgICAgICBcImNvbW1hbmRzXCIgOiB7XG4gICAgICAgICAgICAgIFwiMDFfc2V0X215c3FsX3Jvb3RfcGFzc3dvcmRcIiA6IHtcbiAgICAgICAgICAgICAgICBcImNvbW1hbmRcIiA6IHsgXCJGbjo6Sm9pblwiIDogW1wiXCIsIFtcIm15c3FsYWRtaW4gLXUgcm9vdCBwYXNzd29yZCAnXCIsIHsgXCJSZWZcIiA6IFwiREJSb290UGFzc3dvcmRcIiB9LCBcIidcIl1dfSxcbiAgICAgICAgICAgICAgICBcInRlc3RcIiA6IHsgXCJGbjo6Sm9pblwiIDogW1wiXCIsIFtcIiQobXlzcWwgXCIsIHsgXCJSZWZcIiA6IFwiREJOYW1lXCIgfSwgXCIgLXUgcm9vdCAtLXBhc3N3b3JkPSdcIiwgeyBcIlJlZlwiIDogXCJEQlJvb3RQYXNzd29yZFwiIH0sIFwiJyA+L2Rldi9udWxsIDI+JjEgPC9kZXYvbnVsbCk7ICgoICQ/ICE9IDAgKSlcIl1dfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBcIjAyX2NyZWF0ZV9kYXRhYmFzZVwiIDoge1xuICAgICAgICAgICAgICAgIFwiY29tbWFuZFwiIDogeyBcIkZuOjpKb2luXCIgOiBbXCJcIiwgW1wibXlzcWwgLXUgcm9vdCAtLXBhc3N3b3JkPSdcIiwgeyBcIlJlZlwiIDogXCJEQlJvb3RQYXNzd29yZFwiIH0sIFwiJyA8IC90bXAvc2V0dXAubXlzcWxcIl1dfSxcbiAgICAgICAgICAgICAgICBcInRlc3RcIiA6IHsgXCJGbjo6Sm9pblwiIDogW1wiXCIsIFtcIiQobXlzcWwgXCIsIHsgXCJSZWZcIiA6IFwiREJOYW1lXCIgfSwgXCIgLXUgcm9vdCAtLXBhc3N3b3JkPSdcIiwgeyBcIlJlZlwiIDogXCJEQlJvb3RQYXNzd29yZFwiIH0sIFwiJyA+L2Rldi9udWxsIDI+JjEgPC9kZXYvbnVsbCk7ICgoICQ/ICE9IDAgKSlcIl1dfVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBcIjAzX2NvbmZpZ3VyZV93b3JkcHJlc3NcIiA6IHtcbiAgICAgICAgICAgICAgICBcImNvbW1hbmRcIiA6IFwiL3RtcC9jcmVhdGUtd3AtY29uZmlnXCIsXG4gICAgICAgICAgICAgICAgXCJjd2RcIiA6IFwiL3Zhci93d3cvaHRtbC93b3JkcHJlc3NcIlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJQcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJJbWFnZUlkXCIgOiB7IFwiRm46OkZpbmRJbk1hcFwiIDogWyBcIkFXU1JlZ2lvbkFyY2gyQU1JXCIsIHsgXCJSZWZcIiA6IFwiQVdTOjpSZWdpb25cIiB9LFxuICAgICAgICAgIHsgXCJGbjo6RmluZEluTWFwXCIgOiBbIFwiQVdTSW5zdGFuY2VUeXBlMkFyY2hcIiwgeyBcIlJlZlwiIDogXCJJbnN0YW5jZVR5cGVcIiB9LCBcIkFyY2hcIiBdIH0gXSB9LFxuICAgICAgICBcIkluc3RhbmNlVHlwZVwiICAgOiB7IFwiUmVmXCIgOiBcIkluc3RhbmNlVHlwZVwiIH0sXG4gICAgICAgIFwiU2VjdXJpdHlHcm91cHNcIiA6IFsge1wiUmVmXCIgOiBcIldlYlNlcnZlclNlY3VyaXR5R3JvdXBcIn0gXSxcbiAgICAgICAgXCJLZXlOYW1lXCIgICAgICAgIDogeyBcIlJlZlwiIDogXCJLZXlOYW1lXCIgfSxcbiAgICAgICAgXCJVc2VyRGF0YVwiIDogeyBcIkZuOjpCYXNlNjRcIiA6IHsgXCJGbjo6Sm9pblwiIDogW1wiXCIsIFtcbiAgICAgICAgICBcIiMhL2Jpbi9iYXNoIC14ZVxcblwiLFxuICAgICAgICAgIFwieXVtIHVwZGF0ZSAteSBhd3MtY2ZuLWJvb3RzdHJhcFxcblwiLFxuXG4gICAgICAgICAgXCIvb3B0L2F3cy9iaW4vY2ZuLWluaXQgLXYgXCIsXG4gICAgICAgICAgXCIgICAgICAgICAtLXN0YWNrIFwiLCB7IFwiUmVmXCIgOiBcIkFXUzo6U3RhY2tOYW1lXCIgfSxcbiAgICAgICAgICBcIiAgICAgICAgIC0tcmVzb3VyY2UgV2ViU2VydmVyIFwiLFxuICAgICAgICAgIFwiICAgICAgICAgLS1jb25maWdzZXRzIHdvcmRwcmVzc19pbnN0YWxsIFwiLFxuICAgICAgICAgIFwiICAgICAgICAgLS1yZWdpb24gXCIsIHsgXCJSZWZcIiA6IFwiQVdTOjpSZWdpb25cIiB9LCBcIlxcblwiLFxuXG4gICAgICAgICAgXCIvb3B0L2F3cy9iaW4vY2ZuLXNpZ25hbCAtZSAkPyBcIixcbiAgICAgICAgICBcIiAgICAgICAgIC0tc3RhY2sgXCIsIHsgXCJSZWZcIiA6IFwiQVdTOjpTdGFja05hbWVcIiB9LFxuICAgICAgICAgIFwiICAgICAgICAgLS1yZXNvdXJjZSBXZWJTZXJ2ZXIgXCIsXG4gICAgICAgICAgXCIgICAgICAgICAtLXJlZ2lvbiBcIiwgeyBcIlJlZlwiIDogXCJBV1M6OlJlZ2lvblwiIH0sIFwiXFxuXCJcbiAgICAgICAgXV19fVxuICAgICAgfSxcbiAgICAgIFwiQ3JlYXRpb25Qb2xpY3lcIiA6IHtcbiAgICAgICAgXCJSZXNvdXJjZVNpZ25hbFwiIDoge1xuICAgICAgICAgIFwiVGltZW91dFwiIDogXCJQVDE1TVwiXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgXCJPdXRwdXRzXCIgOiB7XG4gICAgXCJXZWJzaXRlVVJMXCIgOiB7XG4gICAgICBcIlZhbHVlXCIgOiB7IFwiRm46OkpvaW5cIiA6IFtcIlwiLCBbXCJodHRwOi8vXCIsIHsgXCJGbjo6R2V0QXR0XCIgOiBbIFwiV2ViU2VydmVyXCIsIFwiUHVibGljRG5zTmFtZVwiIF19LCBcIi93b3JkcHJlc3NcIiBdXX0sXG4gICAgICBcIkRlc2NyaXB0aW9uXCIgOiBcIldvcmRQcmVzcyBXZWJzaXRlXCJcbiAgICB9XG4gIH1cbn1cbiIsIi8qKlxuICogQ3JlYXRlZCBieSBhcm1pbmhhbW1lciBvbiA3LzkvMTUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU291cmNlRWRpdG9yID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9zb3VyY2UuZWRpdG9yJyk7XG52YXIgR3VpRWRpdG9yID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9ndWkuZWRpdG9yJyk7XG5cbnZhciBNYWluUGFnZSA9IHtcblxuICBjb250cm9sbGVyOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cbiAgICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgICAvL3ZhciBsaXN0ID0gb3B0aW9ucy5saXN0O1xuXG4gICAgY3RybC50ZW1wbGF0ZSA9IG9wdGlvbnMudGVtcGxhdGU7XG4gICAgY29uc29sZS5sb2coJ0Zyb20gQ29udHJvbGxlcjonKTtcbiAgICBjb25zb2xlLmxvZyhvcHRpb25zLnRlbXBsYXRlKTtcblxuICAgIGN0cmwuc291cmNlRWRpdG9yQ29udHJvbGxlciA9IG5ldyBTb3VyY2VFZGl0b3IuY29udHJvbGxlcih7XG4gICAgICB0ZW1wbGF0ZTogb3B0aW9ucy50ZW1wbGF0ZVxuICAgIH0pO1xuXG4gICAgY3RybC5ndWlFZGl0b3JDb250cm9sbGVyID0gbmV3IEd1aUVkaXRvci5jb250cm9sbGVyKHtcbiAgICAgIHRlbXBsYXRlOiBvcHRpb25zLnRlbXBsYXRlXG4gICAgfSk7XG5cbiAgfSxcblxuICB2aWV3OiBmdW5jdGlvbihjb250cm9sbGVyKSB7XG4gICAgY29uc29sZS5sb2coJ0Zyb20gdGhlIHZpZXc6Jyk7XG4gICAgY29uc29sZS5sb2coY29udHJvbGxlci50ZW1wbGF0ZSk7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgbShcIi5oZWFkZXJcIiwgW1xuICAgICAgICAgIG0oXCJ1bC5uYXYubmF2LXBpbGxzLnB1bGwtcmlnaHRcIiwgW1xuICAgICAgICAgICAgbShcImxpLmFjdGl2ZVwiLCBbbShcImFbaHJlZj0nIyddXCIsIFwiSG9tZVwiKV0pLFxuICAgICAgICAgICAgbShcImxpXCIsIFttKFwiYVtocmVmPScjJ11cIiwgXCJBYm91dFwiKV0pLFxuICAgICAgICAgICAgbShcImxpXCIsIFttKFwiYVtocmVmPScjJ11cIiwgXCJDb250YWN0XCIpXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKFwiaDMudGV4dC1tdXRlZFwiLCBcIkNsb3Vkc2xpY2VyXCIpXG4gICAgICAgIF0pLFxuICAgICAgLy9bbShcIi5jb250YWluZXItZmx1aWRcIiwgW1xuICAgICAgICBtKCcucm93JywgW1xuICAgICAgICAgIG0oXCIuY29sLW1kLTZcIiwgW1xuICAgICAgICAgICAgbSgnZGl2JywgJ1NvdXJjZScpLFxuICAgICAgICAgICAgU291cmNlRWRpdG9yLnZpZXcoY29udHJvbGxlci5zb3VyY2VFZGl0b3JDb250cm9sbGVyKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKFwiLmNvbC1tZC02XCIsIFtcbiAgICAgICAgICAgIG0oJ2RpdicsICdWaXN1YWwnKSxcbiAgICAgICAgICAgIEd1aUVkaXRvci52aWV3KGNvbnRyb2xsZXIuZ3VpRWRpdG9yQ29udHJvbGxlcilcbiAgICAgICAgICBdKVxuICAgICAgICBdKSxcbiAgICAgICAgbShcIi5mb290ZXJcIiwgW1xuICAgICAgICAgIG0oXCJwXCIsIFwiQnkgQXJtaW4gR3JhZlwiKVxuICAgICAgICBdKVxuICAgICAgLy9dKV1cbiAgICBdXG4gIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYWluUGFnZTtcbiJdfQ==
