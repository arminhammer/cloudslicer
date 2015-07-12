/**
 * Created by arminhammer on 7/9/15.
 */

'use strict';

//var jsonlint = require('jsonlint');

var SourceEditor = {
  controller: function(options) {

    return {
      //template: options.template,
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
