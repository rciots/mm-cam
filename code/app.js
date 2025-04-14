const io = require("socket.io-client");
const { spawn } = require("child_process");
var cliport = process.env.CLI_PORT || 8081;
var videodevice = process.env.VIDEO_DEVICE || "video4";
var connectorsvc= process.env.CONNECTOR_SVC || "localhost";
const socket = io('http://' + connectorsvc + ':' + cliport, { query: { id: 'cam' } });
const ffmpeg = spawn("ffmpeg", [
  "-f", "v4l2",
  "-framerate", "30",
  "-s", "854x480",
  "-i", "/dev/" + videodevice,
  "-f", "mpegts",
  "-codec:v", "mpeg1video",
  "-b:v", "5000k",
  "-bf", "0",
  "pipe:1"
]);

ffmpeg.stderr.on("data", (data) => {
  console.error(`FFmpeg error: ${data}`);
});
ffmpeg.stdout.on("data", (data) => {
  socket.emit("video", data);
});

