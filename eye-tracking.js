/* -------------------------
   Eye-Tracking
   ------------------------- */
//const video = document.getElementById("cam");
//const canvas = document.getElementById("canvas");
//const ctx = canvas.getContext("2d");

const canvas = document.getElementById("overlay");

let lastBlinkTime = 0;
let blinkCount = 0;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getEyeOpenness(landmarks, top, bottom) {
  return distance(landmarks[top], landmarks[bottom]);
}

function analyzeEyes(landmarks) {
  // MediaPipe eye landmark indices
  const LEFT_TOP = 159;
  const LEFT_BOTTOM = 145;
  const RIGHT_TOP = 386;
  const RIGHT_BOTTOM = 374;

  const leftOpenness = getEyeOpenness(landmarks, LEFT_TOP, LEFT_BOTTOM);
  const rightOpenness = getEyeOpenness(landmarks, RIGHT_TOP, RIGHT_BOTTOM);

  const avgOpenness = (leftOpenness + rightOpenness) / 2;

  if (avgOpenness < 0.01) {
    const now = Date.now();
    if (now - lastBlinkTime > 300) {
      blinkCount++;
      lastBlinkTime = now;
    }

    //alert('NO BLINK');
    return "BLINK";
  }

  return "OPEN";
}

function getGazeDirection(landmarks) {
  // Eye corner indices
  const leftEyeLeft = landmarks[33];
  const leftEyeRight = landmarks[133];
  const leftPupil = landmarks[468]; // iris center

  const eyeWidth = distance(leftEyeLeft, leftEyeRight);
  const pupilOffset = (leftPupil.x - leftEyeLeft.x) / eyeWidth;

  if (pupilOffset < 0.32) {
    alert('NO LOOK TO THE RIGHT');
    return "LOOKING RIGHT";
  }

  if (pupilOffset > 0.68) {
    alert('NO LOOK TO THE LEFT');
    return "LOOKING LEFT";
  }

  return "CENTER";
}

function onResults(results) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
    ctx.fillStyle = "red";
    ctx.fillText("FACE NOT DETECTED", 10, 20);
    return;
  }

  const landmarks = results.multiFaceLandmarks[0];

  // Draw mesh
  window.drawConnectors(ctx, landmarks, window.FACEMESH_TESSELATION, { color: "#0f0" });

  // Eye state
  const eyeState = analyzeEyes(landmarks);
  const gaze = getGazeDirection(landmarks);

  ctx.fillStyle = "yellow";
  /*
  ctx.fillText(`Eyes: ${eyeState}`, 10, 20);
  ctx.fillText(`Gaze: ${gaze}`, 10, 40);
  ctx.fillText(`Blink Count: ${blinkCount}`, 10, 60);
  */
  console.log('Eyes: ', eyeState);
  console.log('Gaze: ', gaze);
  console.log('Blink Count: ', blinkCount);
}