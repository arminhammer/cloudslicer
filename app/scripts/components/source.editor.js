/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var jsonlint = require('jsonlint');

var SourceEditor = {
  controller: function(options) {

    return {
      template: options.template,
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
    var parsed = null;
    var resourcesBlock = null;

    try {
      parsed = JSON.parse(controller.template());
      resourcesBlock =   m('div', [
        _.map(parsed.Resources, function (value, key) {
          return m('div', value.Type)
        })
      ])
    }
    catch(e) {
      console.log('Parse error: ' + e);
      //var specError = jsonlint.parse(controller.template());
      //console.log(specError);
      resourcesBlock =   m('div', {}, e + ' at ' + e.lineNumber)
    }
    return [
      m('#sourceEditor', { config: controller.drawEditor }),
      resourcesBlock
      /*
      m('div', [
        JSON.parse(controller.template()).Parameters.InstanceType.AllowedValues.map(function(value) {
          return m('div', value)
        })
      ])
      */
    ]
  }
};

module.exports = SourceEditor;
