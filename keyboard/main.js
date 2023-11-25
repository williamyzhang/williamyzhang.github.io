var audioCtx;

var referenceNoteFrequency = 440; // A4

document.addEventListener("DOMContentLoaded", function(event) {
    
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const globalGain = audioCtx.createGain();
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    globalGain.connect(audioCtx.destination);

    document.getElementById("defaultOpen").click();

    // Define ADSR values
    var attack = 0.05;  // in seconds
    var peak = 0.6;
    var decay = 0.2;   // in seconds
    var sustain = 0.5; // gain value (0-1)
    var release = 0.05; // in seconds (used in keyUp)

    const depthGain = 0.2;
    const modulatedGain = 0.2;
    
    // maps to remember notes
    var activeOscillators = {};
    var activeGainNodes = {};
    var activeModulators = {};
    
    // user settings
    var waveform = "sine";
    var tuning = "31-EDO";
    var synthType = "additive";
    var npartials = 3;
        // new plan: 3 oscs - can choose waveform type, then can add am/fm mods
    var amOn = "false";
    var fmOn = "true";
    var AMModulatorFrequency = 90; 
    var FMModulatorIndex = 100; 
    var FMModulatorFrequency = 100;

    var LFOFrequency = 0.5;
    var LFOGainValue = 8;

    var octave = 4;

    function calcFreq(refFreq, ratio, steps) {

        return refFreq * Math.pow(ratio, steps);
    }

    const ratio12 = Math.pow(2, (1/12)); // 2 ^ (1/12), log ratio to calculate frequencies in 12-TET
    const keyboardStepMap12 = {
        '90': -9,  //Z - C
		'83': -8, //S - C#
		'88': -7,  //X - D
		'68': -6, //D - D#
		'67': -5,  //C - E
		'86': -4,  //V - F
		'71': -3, //G - F#
		'66': -2,  //B - G
		'72': -1, //H - G#
		'78': 0,  //N - A
		'74': 1, //J - A#
		'77': 2,  //M - B
		'81': 3,  //Q - C
		'50': 4, //2 - C#
		'87': 5,  //W - D
		'51': 6, //3 - D#
		'69': 7,  //E - E
		'82': 8,  //R - F
		'53': 9, //5 - F#
		'84': 10,  //T - G
		'54': 11, //6 - G#
		'89': 12,  //Y - A
		'55': 13, //7 - A#
		'85': 14,  //U - B
    }

    const ratio31 = Math.pow(2, (1/31)); //31-TET
    const keyboardStepMap31 = {
        '90': -23,  //Z - C
        '65': -22, //A - C half-sharp
		'81': -21,  //Q - C#
		'50': -20, //2 - Db
		'51': -19, //3 - D half-flat
		'88': -18,  //X - D
		'83': -17, //S - D half-sharp
		'87': -16,  //W - D#
		'69': -15,  //E - Eb
        '52': -14, //4 - E half-flat
		'67': -13,  //C - E
		'68': -12, //D - E half-sharp
        '70': -11, //F - F half-flat
        '86': -10,  //V - F
        '71': -9, //G - F half-sharp
		'84': -8,  //T - F#
		'53': -7, //5 - Gb
		'54': -6, //6 - G half-flat
		'66': -5,  //B - G
		'72': -4, //H - G half-sharp
		'89': -3,  //Y - G#
		'55': -2, //7 - Ab
        '56': -1, //8 - A half-flat
		'78': 0,  //N - A
		'74': 1, //J - A half-sharp
        '85': 2,  //U - A#
        '73': 3, //I - Bb
        '57': 4, //9 - B half-flat
		'77': 5,  //M - B
        '75': 6, //K - B half-sharp
        '76': 7, //L - C half-flat
        '188': 8, //, - C
        '190': 13 , //. - D
	
    }

    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);


    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (key === "37") { //left arrow
            if (octave > 2) { 
                octave--; // right now there's a 3 octave limit
                document.getElementById('octave').value = octave;
            }
        } else if (key === "39") { //right arrow
            if (octave < 5) {
                octave++;
                document.getElementById('octave').value = octave;
            }
        }
        tuning = document.querySelector("input[name=tunings]:checked").value;
        // console.log(tuning);
        if (tuning === '12-EDO') {
            if ((keyboardStepMap12[key] || keyboardStepMap12[key] === 0) && !activeOscillators[key]) {
                playNote(key);
            }
        } else {
            if ((keyboardStepMap31[key] || keyboardStepMap31[key] === 0) && !activeOscillators[key]) {
                playNote(key);
            }
        }
        
    }


    function deleteOscs(gainNodes, oscs) {
    // release
        // console.log(gainNodes)
        // console.log(oscs)
        gainNodes.forEach((gainNode) => {
            var val = gainNode.gain.value;
            gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
            gainNode.gain.setValueAtTime(val, audioCtx.currentTime)
            // gainNode.gain.setTargetAtTime(
            //     0,
            //     audioCtx.currentTime,
            //     release/3
            // );
            gainNode.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime + release);
            // console.log("gain node to 0")
        })

        setTimeout(() => {
            // console.log("Delayed for double release time.");
            oscs.forEach((osc) => {
            
                osc.stop();
                // console.log("osc stopped")
                // osc.stop(audioCtx.currentTime + release);
                // delete osc;
                
            });
          }, release * 2000 );
                 
                
    }
    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (tuning === '12-EDO') { 
            if (keyboardStepMap12[key] || keyboardStepMap12[key] === 0 && activeOscillators[key]) {
                const gainNodes = activeGainNodes[key];
                const oscs = activeOscillators[key];
                deleteOscs(gainNodes, oscs);
                delete activeOscillators[key];
                delete activeGainNodes[key];
                delete activeModulators[key];
            }
        } else {
            if (keyboardStepMap31[key] || keyboardStepMap31[key] === 0 && activeOscillators[key]) {
                const gainNodes = activeGainNodes[key];
                const oscs = activeOscillators[key];
                deleteOscs(gainNodes, oscs);
                delete activeOscillators[key];
                delete activeGainNodes[key];
                delete activeModulators[key];
            }
        }

    }

    function playNote(key) {
        var oscs = [];
        npartials = document.querySelector("input[name=npartials]").value;
        
        attack = document.querySelector("input[name=attack]").value;
        decay = document.querySelector("input[name=delay]").value;
        sustain = document.querySelector("input[name=sustain]").value * 0.01 * peak;
        release = parseFloat(document.querySelector("input[name=release]").value);
        // console.log(attack, decay, sustain, release)
        referenceNoteFrequency = document.querySelector("input[name=A4freq]").value;

    //   console.log (oscs)
      if (synthType === "additive") {
        for (var i=0; i<npartials; i++) {
          oscs[i] = audioCtx.createOscillator();
        }
      }
      //const osc = audioCtx.createOscillator();
      var freq = 0;
      if (tuning === "12-EDO") {
        freq = calcFreq(
            referenceNoteFrequency,
            ratio12,
            keyboardStepMap12[key]);
        freq = freq * Math.pow(2, octave - 4);
        console.log(freq);
      } else {// 31 edo
        freq = calcFreq(
            referenceNoteFrequency,
            ratio31,
            keyboardStepMap31[key]);
        freq = freq * Math.pow(2, octave - 4);
        console.log(freq);
      }
      // osc.frequency.setValueAtTime(
      //   freq,
      //   audioCtx.currentTime
      // );
    
    // choose waveform
    waveform = document.querySelector("input[name=waveforms]:checked").value.toLowerCase();
    // console.log(waveform);
    
    // osc.type = waveform

    var gainNodes = [];
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNodes[0] = gainNode;

    //AM/FM
    var modulators = [];  
    amOn = document.querySelector("input[name=amtoggle]:checked").value;
    fmOn = document.querySelector("input[name=fmtoggle]:checked").value;
    LFOFrequency = document.querySelector("input[name=LFOfreq]").value;
    LFOGainValue = document.querySelector("input[name=LFOgain]").value;
    AMModulatorFrequency = document.querySelector("input[name=AMfreq]").value;
    FMModulatorFrequency = document.querySelector("input[name=FMfreq]").value;
    FMModulatorIndex = document.querySelector("input[name=FMindex]").value;
    // amplitude mod
    var modulated;
    var depth;
    var modulatedFreq;
    if (amOn === "true") {
        modulatedFreq = audioCtx.createOscillator();
        modulatedFreq.frequency.value = AMModulatorFrequency;
        modulated = audioCtx.createGain();
        depth = audioCtx.createGain();
        depth.gain.value = 0; //start at 0 so no onset click
        modulated.gain.value = 0;
        //console.log(depth)
        modulatedFreq.connect(depth).connect(modulated.gain);
        // modulatedFreq.connect(gainNode.gain).connect(globalGain).connect(depth);
        gainNodes[1] = modulated;
        gainNodes[2] = depth;

    // console.log("am done");
    }

    // frequency mod
    var fmModulatorFreq;
    var fmModulationIndex;
    if (fmOn === "true") {
        fmModulatorFreq = audioCtx.createOscillator();
        fmModulationIndex = audioCtx.createGain();
        fmModulationIndex.gain.value = FMModulatorIndex;
        fmModulatorFreq.frequency.value = FMModulatorFrequency;

        fmModulatorFreq.connect(fmModulationIndex);
        gainNodes.push(fmModulationIndex);
    }

    // assign frequencies and start oscs
    for (var i = 0; i < oscs.length; i++) {
        // frequency
        if (i === 0) {
            oscs[i].frequency.setValueAtTime(
                freq,
                audioCtx.currentTime
        
            )
        } else if (i % 2 === 0) {
            oscs[i].frequency.setValueAtTime(
                (i + 1) * freq + Math.random() * 5,
                audioCtx.currentTime
            )
        } else {
            oscs[i].frequency.setValueAtTime(
                (i + 1) * freq - Math.random() * 5,
                audioCtx.currentTime
            )
        }    
        // waveform
        oscs[i].type = waveform;
        if (amOn === "true") {
            oscs[i].connect(modulated).connect(gainNode).connect(globalGain);
        } else {
            oscs[i].connect(gainNode).connect(globalGain).connect(audioCtx.destination);
        }
        oscs[i].start();
    }
    if (amOn === "true") {
        modulated.connect(audioCtx.destination);
        modulatedFreq.start();
        modulators.push(modulatedFreq);
    }
    if (fmOn === "true") {
        oscs.forEach((osc) => {
            fmModulationIndex.connect(osc.frequency);;
            
        });
        // fmModulationIndex.connect(oscs[0].frequency);
        fmModulatorFreq.start();
        modulators.push(fmModulatorFreq);
    }

    // LFO
    // console.log(LFOFrequency, LFOGainValue)
    var lfo = audioCtx.createOscillator();
    lfo.frequency.value = LFOFrequency;
    var lfoGain = audioCtx.createGain();
    lfoGain.gain.value = LFOGainValue;
    oscs.forEach((osc) => {
        lfo.connect(lfoGain).connect(osc.frequency);
        
    });
    // lfo.connect(lfoGain).connect(oscs[0].frequency);
    modulators.push(lfo);
    gainNodes.push(lfoGain);
    //gainNodes.push()
    lfo.start();

    //   osc.connect(gainNode).connect(globalGain).connect(audioCtx.destination);
    //   osc.start();
      activeOscillators[key] = oscs;
      activeGainNodes[key] = gainNodes;
      activeModulators[key] = modulators;
      
    // console.log(activeGainNodes);
    // console.log(activeOscillators);
    // console.log(activeModulators);
      
      // the more keys at one time, the less the gain
      var gainFactor = Object.keys(activeGainNodes).length * oscs.length;
      if (waveform === "square" || waveform === "sawtooth") {
        gainFactor *= 2; //saws & squares are loud 
      }
      

      // attack

      // reduce gain w/o using dynamic compressor
      Object.keys(activeGainNodes).forEach(function(key) {
        activeGainNodes[key][0].gain.setTargetAtTime(
                    peak / gainFactor,
                    audioCtx.currentTime,
                    attack / 3
        );
        if (amOn === "true") {
            activeGainNodes[key][1].gain.setTargetAtTime(
                modulatedGain / gainFactor,
                audioCtx.currentTime,
                attack / 3
            );
            activeGainNodes[key][2].gain.setTargetAtTime(
                depthGain / gainFactor,
                audioCtx.currentTime,
                attack / 3
            );  
        }
        
        // activeGainNodes[key].forEach((gainNode) => {
        //     gainNode.gain.setTargetAtTime(
        //         peak / gainFactor,
        //         audioCtx.currentTime,
        //         attack / 3
        //       );
        // });
        
      });
      // decay and sustain
    //   gainNodes.forEach((gainNode) => {
        gainNode.gain.setTargetAtTime(
            sustain / gainFactor,
            audioCtx.currentTime + decay/2,
            decay / 3
          );
    // });
      
    }
  },
  false
);

function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  }

document.getElementById("Tuning").addEventListener("change", 
    function(event) {
        var tuning = document.querySelector("input[name=tunings]:checked").value;
        var img = document.getElementById("keymap");
        // console.log(tuning);
        if (tuning === '12-EDO') {
            img.src = "12edo-keyboard.jpg"
        } else {
            img.src = "31edo-keyboard.jpg"
        }
});

// document.getElementById("a4freq").addEventListener("change", 
//     function(event) {
//         referenceNoteFrequency = document.querySelector("input[id=a4freq]")
//         console.log(referenceNoteFrequency)
// });

// function updateLFOFreqInput(val) {
//     // document.getElementById('LFOfreqtext').value=val; 
//     LFOFrequency = val;
//     console.log(LFOFrequency, "updated");
//   }
// function updateLFOGainInput(val) {
//     document.getElementById('LFOgaintext').value=val; 
//     LFOGainValue = val;
//   }
