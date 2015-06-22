// video view

var vm = require('../viewModels/videoViewModel');
vm.init();

var videoView = function() {
  return m("div", [
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
    ]),
  ]),
    m("table", [
      m("video[controls]", {
        id: "vid1",
        //src: ""
        class: "video-js vjs-default-skin",
        preload:"auto",
        width: "640",
        height: "360"
        //"data-setup": '{"techOrder": ["youtube"], "src": "http://www.youtube.com/watch?v=QcIy9NiNbmo"}'
      })
    ])
};

module.exports = videoView;

