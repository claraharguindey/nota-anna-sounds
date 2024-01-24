const URL = "https://teachablemachine.withgoogle.com/models/VBBIow2OP/";

let model, webcam, ctx, labelContainer, maxPredictions;
const audio1 = new Audio("./media/sounds/sound1old.mp3");
const audio2 = new Audio("./media/sounds/sound2.mp3");
const audio3 = new Audio("./media/sounds/sound1.wav");

const pose1Image = document.getElementById("pose1");
const pose2Image = document.getElementById("pose2");
const pose3Image = document.getElementById("pose3");

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmPose.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const size = 200;
  const flip = true;
  webcam = new tmPose.Webcam(size, size, flip); 
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  const canvas = document.getElementById("canvas");
  canvas.width = size;
  canvas.height = size;
  ctx = canvas.getContext("2d");
  labelContainer = document.getElementById("label-container");

  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop(timestamp) {
  webcam.update(); 
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
  const prediction = await model.predict(posenetOutput);

  if (prediction[0].probability.toFixed(2) === "1.00") {
    pose1Image.style.border = "2px solid red";
    pose2Image.style.border = "none";
    pose3Image.style.border = "none";
    audio1.play();
    audio2.pause();
    audio2.currentTime = 0;
    audio3.pause();
    audio3.currentTime = 0;
  } else if (prediction[1].probability.toFixed(2) === "1.00") {
    pose1Image.style.border = "none";
    pose2Image.style.border = "2px solid red";
    pose3Image.style.border = "none";
    audio2.play();
    audio1.pause();
    audio1.currentTime = 0;
    audio3.pause();
    audio3.currentTime = 0;
  } else if (prediction[2].probability.toFixed(2) === "1.00") {
    pose1Image.style.border = "none";
    pose2Image.style.border = "none";
    pose3Image.style.border = "2px solid red";
    audio3.play();
    audio1.pause();
    audio1.currentTime = 0;
    audio2.pause();
    audio2.currentTime = 0;
  }

  drawPose(pose);
}

function drawPose(pose) {
  if (webcam.canvas) {
    ctx.drawImage(webcam.canvas, 0, 0);
    if (pose) {
      const minPartConfidence = 0.5;
      tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
    }
  }
}
