const io = require("socket.io-client");
const { spawn } = require("child_process");
var cliport = process.env.CLI_PORT || 8080;
var videodevice = process.env.VIDEO_DEVICE || "video0";
var connectorsvc= process.env.CONNECTOR_SVC || "localhost";
const socket = io('http://' + connectorsvc + ':' + cliport, { extraHeaders: { origin: 'cam' } });

var ffmpeg_process = function(){
  const ffmpeg = spawn("ffmpeg", [
    "-f", "v4l2",
    "-framerate", "30",
    "-s", "854x480",
    "-i", "/dev/" + videodevice,
    "-f", "mpegts",
    "-codec:v", "mpeg1video",
    "-b:v", "2000k",
    "-bf", "0",
    "pipe:1"
  ]);

  ffmpeg.stdout.on("data", (data) => {
    socket.emit("video", data);
  });
  ffmpeg.stderr.on("data", (data) => {
    console.error(`FFmpeg error: ${data}`);
  });
  ffmpeg.on('exit', function(code) {
      console.log('child process exited with code ' + code);
      var timeout = setTimeout(ffmpeg_process, 1000);

  });
};
setTimeout(ffmpeg_process, 1000);