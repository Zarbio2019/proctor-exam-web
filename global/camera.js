const video = document.getElementById('video');

async function startCamera(){
  if(stream) return; // already started

  try {
    // Eye-Tracking
    const faceMesh = new window.FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true, // IMPORTANT → gives iris landmarks (468-478)
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults(onResults);

    // Start camera
    const cam = new window.Camera(video, {
      onFrame: async () => {
        await faceMesh.send({ image: video });
      },
      width: 480,
      height: 360,
    });
    cam.start();

    /*****/
/*
    // Old
    // get camera (and optionally audio)
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;

    await video.play();
*/

    // set canvas size to video display size
    document.getElementById("overlay").style.display = "none"; // hide detection rectangle, hide = "none", show = "block"

    overlay.width = video.videoWidth || video.clientWidth;
    overlay.height = video.videoHeight || video.clientHeight;

    console.log('Camera started');

    //-------------------------------------//
    
    // Face detection
    // lazy-load TF and model after camera starts
    await loadModelIfNeeded();
    startDetectLoop();

    isCameraStarted = true;

  } catch(e) {
    console.log('Camera error', e);
    alert('Camera error', e);
  }

  function stopCamera(){
    if (stream){
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    video.pause();
    video.srcObject = null;
    stopDetectLoop();
    console.log('Camera stopped');
    ctx && ctx.clearRect(0,0,overlay.width, overlay.height);
}

  /*
  // prepare MediaRecorder but don't start until toggleRecording
  const options = { mimeType: 'video/webm;codecs=vp8,opus' };

  try {
    mediaRecorder = new MediaRecorder(mediaStream, options);
  } catch(e) {
    mediaRecorder = new MediaRecorder(mediaStream); // fallback
  }
  mediaRecorder.ondataavailable = e => {
    if(e.data && e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    createRecordingBlob();
  };
  */
}

function startTimer(){
  // you can set timeLeft before startingExam if desired
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if(timeLeft <= 0){
      clearInterval(timerInterval);
      submitExam();
    }
  }, 1000);
}