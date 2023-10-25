// babbling brook variables
var audioCtx;
var brownNoise1;
var brownNoise2;
var lpf1;
var lpf2;
var rhpf;
// var hpf;
var analyser;
var canvasCtx = document.getElementById("visualizer").getContext("2d");
var dataArray;
var WIDTH = 800;
var HEIGHT = 300;
var bufferLength;
const playBrookButton = document.querySelector('button[name=babbling]');

// clock variables
const playClockButton = document.querySelector('button[name=custom]')

var audioContext; // apologies for the confusing naming, i'll refactor later

// * * * * * * * *
// Clock Functions
function initClockAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext);
    // hand ticks every second
    setInterval(triggerTick, 1000);
    setInterval(triggerEscapement, 500);
    // triggerTick();
    // triggerEscapement();

}

function createEnvelope(decay, maxGain) {
    decay = decay / 1000; // convert to ms
    const envelope = audioContext.createGain();
    envelope.gain.setValueAtTime(0, audioContext.currentTime);
    var randVal = Math.random();
    envelope.gain.linearRampToValueAtTime(maxGain - randVal * 0.1, audioContext.currentTime + 0.001); // short attack time
    envelope.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + decay); // Decay
    return envelope;
}

function createWhiteNoise() {
    const bufferSize = 4096;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;
    return whiteNoise;
}

function createBandPassFilter(freq) {
    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(freq, audioContext.currentTime);
    filter.Q.setValueAtTime(30, audioContext.currentTime); // Modify resonance as per preference
    return filter;
}

function createClockBodySound() {

    // 2 delays
    const delay1 = audioContext.createDelay();
    const delay2 = audioContext.createDelay();

    delay1.delayTime.setValueAtTime(0.04, audioContext.currentTime); // Modify delay time as per preference
    delay2.delayTime.setValueAtTime(0.06, audioContext.currentTime);

    // 2 bandpass filters
    const filter1 = audioContext.createBiquadFilter();
    const filter2 = audioContext.createBiquadFilter();

    filter1.type = "bandpass";
    filter2.type = "bandpass";

    filter1.frequency.setValueAtTime(2000, audioContext.currentTime); 
    filter2.frequency.setValueAtTime(1000, audioContext.currentTime); 

    filter1.Q.setValueAtTime(3.0, audioContext.currentTime); // resonance of 3.0, as per Farnell
    filter2.Q.setValueAtTime(3.0, audioContext.currentTime); 

    // Connect the nodes together
    delay1.connect(filter1).connect(audioContext.destination);
    delay2.connect(filter2).connect(audioContext.destination);

    // Create feedback loop with gain factor 0.3 for both delays
    const gain1 = audioContext.createGain();
    const gain2 = audioContext.createGain();

    gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain2.gain.setValueAtTime(0.3, audioContext.currentTime);

    filter1.connect(gain1).connect(delay1);
    filter2.connect(gain2).connect(delay2);
    
    return [delay1, delay2]
}

// fast high ticking sound for the escapement ratchet
function triggerEscapement() {
    const decayTime = 40;
    const envelope = createEnvelope(20, 0.05);
    const oscillator1 = audioContext.createOscillator();
    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(8000, audioContext.currentTime); // 8kHz

    const oscillator2 = audioContext.createOscillator();
    oscillator2.type = 'sine';
    oscillator2.frequency.setValueAtTime(10000, audioContext.currentTime); // 10kHz

    const gain1 = audioContext.createGain();
    const gain2 = audioContext.createGain();
    
    oscillator1.connect(envelope).connect(audioContext.destination);
    oscillator2.connect(envelope).connect(audioContext.destination);
    const bodys = createClockBodySound(); // don't you realize our bodies could fall apart at any second
    bodys.forEach(delay => {
        oscillator1.connect(envelope).connect(delay);
        oscillator2.connect(envelope).connect(delay);
    })
    
    oscillator1.start();
    oscillator2.start(audioContext.currentTime + 0.02);
    oscillator1.stop(audioContext.currentTime + 0.04);
    oscillator2.stop(audioContext.currentTime + 0.04);
}

// clock tick
function triggerTick() {
    const whiteNoise = createWhiteNoise();
    const randVal = Math.random();

    const filterFreqs = [1400 + randVal * 300, 6500 - randVal * 700, 3200 + randVal * 500]; // Modify freq/decay as per preference
    const decays = [10 + randVal * 3, 30 + randVal * 12, 27 - randVal * 7]
    const bodys = createClockBodySound(); // don't you realize our bodies could fall apart at any second

    for (var i=0; i<3; i++) {
        const filter = createBandPassFilter(filterFreqs[i]);
        const envelope = createEnvelope(decays[i], 1);
        bodys.forEach(delay => {
            whiteNoise.connect(filter).connect(envelope).connect(delay);
        })
        whiteNoise.connect(filter).connect(envelope).connect(audioContext.destination);
    };

    whiteNoise.start();
    whiteNoise.stop(audioContext.currentTime + 0.04);
}

// * * * * * * * *
// Babbling Brook
function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext);

    var bufferSize = 10 * audioCtx.sampleRate,
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
    output = noiseBuffer.getChannelData(0);

    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
        var brown = Math.random() * 2 - 1;
    
        output[i] = (lastOut + (0.02 * brown)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
    }

    lpf1 = audioCtx.createBiquadFilter();
    lpf1.type = 'lowpass';
    lpf1.frequency.setValueAtTime(60, audioCtx.currentTime);

    lpf2 = audioCtx.createBiquadFilter();
    lpf2.type = 'lowpass';
    lpf2.frequency.setValueAtTime(25, audioCtx.currentTime);
    // lpf2.gain.setValueAtTime

    // LPF.ar(BrownNoise.ar(), 14) * 400 + 500
    const multiplier = audioCtx.createGain();
    multiplier.gain.setValueAtTime(1000, audioCtx.currentTime);

    rhpf = audioCtx.createBiquadFilter();
    rhpf.type = 'highpass';
    
    // The frequency of RHPF is modulated by the second LPF output

    rhpf.Q.setValueAtTime(1 / 0.02, audioCtx.currentTime); 
    rhpf.gain.setValueAtTime(0.1, audioCtx.currentTime);
    rhpf.frequency.setValueAtTime(500, audioCtx.currentTime);

    // hpf = audioCtx.createBiquadFilter();
    // hpf.type = 'highpass';
    // hpf.frequency.setValueAtTime(500, audioCtx.currentTime);

    brownNoise1 = audioCtx.createBufferSource();
    brownNoise1.buffer = noiseBuffer;
    brownNoise1.loop = true;

    brownNoise2 = audioCtx.createBufferSource();
    brownNoise2.buffer = noiseBuffer;
    brownNoise2.loop = true;

    // brownNoise1.connect(lpf2).connect(audioCtx.destination);
    // brownNoise1.start();

    // Connecting nodes
    brownNoise1.connect(lpf1);
    brownNoise2.connect(lpf2);
    lpf1.connect(rhpf);
    lpf2.connect(multiplier).connect(rhpf.frequency);
    rhpf.connect(audioCtx.destination);
    // rhpf.connect(hpf).connect(audioCtx.destination);

    // To start playing (equivalent to .play)
    brownNoise1.start();
    brownNoise2.start();

    analyser = audioCtx.createAnalyser();
    rhpf.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    draw();
    
    // osc = audioCtx.createOscillator();
    // osc.connect(audioCtx.destination);
    // osc.start()
}
function draw() {
    drawVisual = requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 2;

        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
        canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);

        x += barWidth + 1;
    }
};

playBrookButton.addEventListener('click', function () {

    if (!audioCtx) {
        initAudio();
        return;
    }
    else if (audioCtx.state === 'suspended') {
        audioCtx.resume();
        console.log('start');
        // console.log(rhpf.frequency.value)
    }
    else if (audioCtx.state === 'running') {
        audioCtx.suspend();
        console.log('stop');
    }

}, false);

playClockButton.addEventListener('click', function () {

    if (!audioContext) {
        initClockAudio();
        return;
    }
    else if (audioContext.state === 'suspended') {
        audioContext.resume();
        console.log('clock start');
    }
    else if (audioContext.state === 'running') {
        audioContext.suspend();
        console.log('clock stop');
    }

}, false);


