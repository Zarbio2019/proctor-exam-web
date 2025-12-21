/* -------------------------
   Microphone
   ------------------------- */
// Config
const NOISE_THRESHOLD = 0.16;   // When “too loud”
const SPEAK_THRESHOLD = 0.18;   // When voice detected
const MAX_NOISE_TIME = 5;       // Seconds before auto-fail

let noiseSeconds = 0;
let lastNoiseTime = 0;
let failed = false;

async function startMicrophone() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;

        const freqAnalyser = audioCtx.createAnalyser();
        freqAnalyser.fftSize = 512;

        const mic = audioCtx.createMediaStreamSource(stream);
        mic.connect(analyser);
        mic.connect(freqAnalyser);

        const timeData = new Uint8Array(analyser.fftSize);
        const freqData = new Uint8Array(freqAnalyser.frequencyBinCount);

        function update() {
            analyser.getByteTimeDomainData(timeData);
            freqAnalyser.getByteFrequencyData(freqData);

            // Calculate volume (RMS)
            let sum = 0;
            for (let i = 0; i < timeData.length; i++) {
                const v = (timeData[i] - 128) / 128;
                sum += (v * v);
            }
            const volume = Math.sqrt(sum / timeData.length);

            //console.log('volume = ', volume);

            // Check for noise / speaking
            if (volume > SPEAK_THRESHOLD) {
                console.log('🎤 Someone is speaking!');
                alert('🎤 Someone is speaking!');
                lastNoiseTime = Date.now();
            } else if (volume > NOISE_THRESHOLD) {
                console.log('⚠ Too loud!');
                alert('⚠ Too loud!');
                lastNoiseTime = Date.now();
            } else {
                //alertBox.textContent = "";
            }

            // Count continuous noise time
            if (Date.now() - lastNoiseTime < 1000)
              noiseSeconds++;
            else
              noiseSeconds = 0;

            //console.log('noiseSeconds = ', noiseSeconds);

            // Auto-fail
            if (!failed && noiseSeconds >= MAX_NOISE_TIME) {
                failed = true;
                alert("❌ Exam failed: too much noise.");
            }

            requestAnimationFrame(update);
        }

        update();

    } catch (e) {
        alert("Microphone error: " + e.message);
    }
}