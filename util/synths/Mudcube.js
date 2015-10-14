
var Util = Util || {};
Util.Synths = Util.Synths || {};

// it is wrapper for Mudcube's MIDI.js to generalize it to use as other synths

Util.Synths.Mudcube = function () {

    // var DEFAULT_INSTRUMENT = 52; // oh, yeah!
    var DEFAULT_INSTRUMENT = 0;

    var firstInit = true;
    // on demand
    var mudcube = null;

    var pianoOnly = true;

    // i do this ugliness because as you see, there is way too many scripts for such a simple task as just playing a note
    // i plan to change their code a bit and limit it to, let's see... a single script? which, of course is no problem to include from html
    var include = [
        "/libs/dont_use_it_MIDI.js//inc/shim/Base64.js",
        "/libs/dont_use_it_MIDI.js//inc/shim/Base64binary.js",
        "/libs/dont_use_it_MIDI.js//inc/shim/WebAudioAPI.js",
        //    <!-- dont_use_it_MIDI.js/ package -->
        "/libs/dont_use_it_MIDI.js//js/midi/audioDetect.js",
        "/libs/dont_use_it_MIDI.js//js/midi/gm.js",
        "/libs/dont_use_it_MIDI.js//js/midi/loader.js",
        "/libs/dont_use_it_MIDI.js//js/midi/plugin.audiotag.js",
        "/libs/dont_use_it_MIDI.js//js/midi/plugin.webaudio.js",
        "/libs/dont_use_it_MIDI.js//js/midi/plugin.webmidi.js",
        //    <!-- utils -->
        "/libs/dont_use_it_MIDI.js//js/util/dom_request_xhr.js",
        "/libs/dont_use_it_MIDI.js//js/util/dom_request_script.js",
    ];

    var loadPlugin = function () {

        var done = 0;
        include.forEach(scriptPath => $.getScript(scriptPath, function() {

            console.log(scriptPath, 'loaded!');

            if (++done === include.length) {
                MIDI.loadPlugin({
                    soundfontUrl: "/libs/midi-js-soundfonts/FluidR3_GM/",
                    instruments: [DEFAULT_INSTRUMENT], // oh, yeah...
                    onsuccess: function() {
                        mudcube = MIDI;

                        MIDI.programChange(0, DEFAULT_INSTRUMENT);
                        MIDI.setVolume(0, 127);
                        MIDI.noteOn(0, 50, 127);
                        MIDI.noteOff(0, 50, 0.75);
                    }
                });

            }
        }));
    };

    var init = function () {
        if (firstInit) {
            firstInit = false;
            loadPlugin();
        }
    };

    // does not work in chromium. due to mp3 and proprietarity i suppose
    var playNote = function(noteJs, tempo) {

        var position = 0;

        var toFloat = fractionString => eval(fractionString);
        var length = toFloat(noteJs.length) / (noteJs.isTriplet ? 3 : 1);

        mudcube.noteOn(noteJs.channel, noteJs.tune, 127, position);
        mudcube.noteOff(noteJs.channel, noteJs.tune, (position + length * 240 / tempo));

        // MIDI.js has 240 default tempo...
        // 1.0 means 1 second for them... it kinda makes sense
    };

    /** @param instrumentEntries [{channel: int, instrument: int}, ...] */
    var consumeConfig = function (instrumentEntries, callback) {

        // TODO: i don't remember id of real drums... it could be 192, or probably we should send drums with a sepcial message...
        var SYNTH_DRUM = 115; // default drum in mudcube repo... well... probably it could be called a drum...

        if (pianoOnly) {
            instrumentEntries = instrumentEntries.map(e => $.extend({}, e, {instrument: e.channel == 9 ? SYNTH_DRUM : DEFAULT_INSTRUMENT}));
        }
        var instruments = instrumentEntries.length > 0 ? instrumentEntries.map(e =>  e.instrument) : [DEFAULT_INSTRUMENT];

        mudcube.loadPlugin({
            soundfontUrl: "/libs/midi-js-soundfonts/FluidR3_GM/",
            instruments: instruments,
            onsuccess: () => {
                console.log('Successfully retrieved instruments for mudcube!', instruments);
                instrumentEntries.forEach(
                        instrumentEntry => mudcube.programChange(instrumentEntry.channel, instrumentEntry.instrument)
                );
                callback();
            }
        });
    };

    return $.extend(Util.Synths.SynthAdapter(), {
        init: init,
        playNote: playNote,
        consumeConfig: consumeConfig
    });
};
