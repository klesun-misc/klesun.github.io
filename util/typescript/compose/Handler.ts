
/// <reference path="../references.ts" />

import MIDIMessageEvent = WebMidi.MIDIMessageEvent;
var Ns: any = Ns || {};
Ns.Compose = Ns.Compose || {};

// this function bounds some events: midi/mouse/keyboard to the
// SheetMusicPainter in other words, it allows to write the sheet music

Ns.Compose.Handler = function(contId: string): void
{
    var painter = Ns.SheetMusicPainter(contId);
    painter.setEnabled(true);
    var lastNoteOn = 0;
    var synth = Ns.Synths.Fluid(new AudioContext(), 'http://shmidusic.lv/out/sf2parsed/fluid/');
    var player = Util.Player($(''));

    var focusIndex = -1;
    var playing = false;

    player.addNoteHandler({
        handleNoteOn: (n: IShNote, i: number) => [
            synth.playNote(n.tune, n.channel),
            painter.handleNoteOn(n, i + focusIndex + 1),
        ].reduce((offs,off) => () => { offs(); off(); })
    });
    // player.addNoteHandler(painter);

    var handleNoteOn = function(semitone: number, receivedTime: number)
    {
        var note = {
            tune: semitone,
            channel: 0,
            length: 0.25
        };

        if (!playing) {
            if (receivedTime - lastNoteOn < 100) {
                painter.addNote(note, focusIndex);
            } else {
                focusIndex = painter.addChord({noteList: [note]}, focusIndex + 1);
            }

            lastNoteOn = receivedTime;
        } else {
            player.stop();
            playing = false;
        }
    };

    var play = function(): void
    {
        focusIndex = painter.setChordFocus(focusIndex - 1);
        var chordList = painter.getChordList(focusIndex + 1);

        var song: IShmidusicStructure = {staffList: [{
            staffConfig: {
                tempo: 120,
                keySignature: 0,
                numerator: 8,
                channelList: []
            },
            chordList: chordList
        }]};

        playing = true;
        player.playShmidusic(song, {}, () => playing = false);
    };

    var hangKeyboardHandlers = function(): void
    {
        document.onkeydown = function(keyEvent: KeyboardEvent)
        {
            console.log('Key Event: ', keyEvent);

            var handlers: { [code: number]: { (): void } } = {
                // space
                32: play,
                // left arrow
                37: () => focusIndex = painter.setChordFocus(focusIndex - 1),
                // right arrow
                39: () => focusIndex = painter.setChordFocus(focusIndex + 1),
                // delete
                46: () => focusIndex = painter.deleteChord(focusIndex),
                // home
                36: () => focusIndex = painter.setChordFocus(-1),
                // end
                35: () => focusIndex = painter.setChordFocus(99999999999), // backoffice style!
            };

            if (playing) {
                player.stop();
                playing = false;
            } else if (keyEvent.keyCode in handlers) {
                handlers[keyEvent.keyCode]();
            }
        };
    };

    var handleMidiEvent = function (message: MIDIMessageEvent) {
        var eventType = // bit mask: "100X YYYY" -> x => noteOn: yes/no | YYYY => channelNumber
            (message.data[0] === 144) ? 'noteOn' :
                (message.data[0] === 128) ? 'noteOff' :
                'unknown' + message.data[0];

        var tune = message.data[1];
        var velocity = message.data[2];
        console.log('midi event tune: ' + tune + '; velocity: ' + velocity + '; type: ' + eventType, message);

        if (eventType === 'noteOn' && velocity > 0) {
            handleNoteOn(tune, message.receivedTime);
        }
    };

    var hangMidiHandlers = function(): void
    {
        var gotMidi = function (midiInfo: WebMidi.MIDIAccess)
        {
            var compose = Util.Compose($('#composeDiv')[0]);

            console.log("Midi Access Success!", midiInfo);

            var inputs = midiInfo.inputs.values();
            for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
                input.value.onmidimessage = handleMidiEvent;
            }
        };

        // request MIDI access
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess()
                .then(gotMidi, (e: any) => console.log("Failed To Access Midi, Even Though Your Browser Has The Method...", e));
        } else {
            console.log("No MIDI support in your browser.");
        }

    };

    hangMidiHandlers();
    hangKeyboardHandlers();
};