/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

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
          mode: 'json'
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
      m('#sourceEditor', { config: controller.drawEditor }),
      m('div', [
        _.map(JSON.parse(controller.template()).Resources, function(value, key) {
          return m('div', value.Type)
        })
      ]),
      m('div', [
        JSON.parse(controller.template()).Parameters.InstanceType.AllowedValues.map(function(value) {
          return m('div', value)
        })
      ])
    ]
  }
};

module.exports = SourceEditor;
