// video view

var vm = require('../viewModels/videoViewModel');
vm.init();

var videoView = function() {
  return m("html", [
    m("body", [
      m("input", {onchange: m.withAttr("value", vm.description), value: vm.description()}),
      m("button", {onclick: vm.add}, "Add"),
      m("table", [
        vm.list.map(function(video, index) {
          return m("tr", [
            m("td", video.title()),
            m("td", video.description()),
            m("td", video.score())
            //m("td", [
            //   m("input[type=checkbox]", {onclick: m.withAttr("checked", task.done), checked: task.done()})
            //]),
            //m("td", {style: {textDecoration: task.done() ? "line-through" : "none"}}, task.description()),
          ])
        })
      ])
    ])
  ]);
};

module.exports = videoView;
