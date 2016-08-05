/// <reference path="references.ts" />

// initialises the website main page - the js performed the moment page is loaded

import {IShmidusicStructure, IGeneralStructure} from "./DataStructures";
import {SheetMusicPainter} from "./compose/Painter";
import UnfairRandom from "./UnfairRandom";
import {ISmfFile} from "./DataStructures";
import {TableGenerator} from "./TableGenerator";
import {ColModel} from "./TableGenerator";
import {Tls} from "./utils/Tls";
import PianoLayout from "./views/PianoLayout";
import {Player} from "./player/Player";
import {Switch} from "./synths/Switch";
import {PresetList} from "./views/PresetList";
import PlaybackControl from "./views/PlaybackControl";
import {ServApi} from "./utils/ServApi";
type dict<Tx> = {[k: string]: Tx};

type cb = () => void;

/** @param mainCont - div dom with children
 * structure defined in index.html */
export let MainPage = function (mainCont: HTMLDivElement)
{
    const
        pianoCanvas = <HTMLCanvasElement>$(mainCont).find('.pianoLayoutCanvas')[0],
        $playbackControlCont = $(mainCont).find('.playbackControlCont'),
        sheetMusicConfigCont = $(mainCont).find('#sheetMusicConfigDiv')[0],
        sheetMusicCont = $(mainCont).find('.sheetMusicCont')[0],
        violinKeyImage = $(mainCont).find('.violinKeyImage')[0],
        bassKeyImage = $(mainCont).find('.bassKeyImage')[0],
        instrumentInfoBlock = <HTMLDivElement>$(mainCont).find('#instrumentInfoBlock')[0],
        drawSheetMusicFlag = <HTMLInputElement>$(mainCont).find('#drawSheetMusicFlag')[0],
        playRandomBtn = $(mainCont).find('.playRandomBtn')[0],
        playMidiFromDiskBtn = $(mainCont).find('.playMidiFromDiskBtn')[0],
        midiFileCounter = <HTMLAnchorElement>$(mainCont).find('#midiFileCounter')[0],
        youtubeEmbededVideosCont = <HTMLDivElement>$(mainCont).find('#youtubeEmbededVideosCont')[0],
        O_O = 'O_O'
        ;
    
    const sheetMusicPainter = SheetMusicPainter('mainSongContainer', sheetMusicConfigCont);
    
    const synth = Switch(
        <HTMLSelectElement>$(mainCont).find('#synthDropdown')[0],
        <HTMLDivElement>$(mainCont).find('#synthControl')[0],
        PresetList(instrumentInfoBlock),
        PianoLayout(pianoCanvas)
    );

    const control = PlaybackControl($playbackControlCont);
    const player = Player(control);
    player.addNoteHandler(synth);

    var playRandom = () => alert("Please, wait till midi names load from ajax!");
    let linksBySongName: {[fileName: string]: Array<{ youtubeId: string, viewCount: number }>} = {};
    // time-outing cuz i suspect it slows down initialization
    setTimeout(() => ServApi.getYoutubeLinks((links) => linksBySongName = links), 4);

    const playSMF = (song: IGeneralStructure) =>
    {
        synth.consumeConfig(song.config.channels);
        synth.analyse(song.chordList);

        player.playSheetMusic(song, () => {}, 0);
    };

    const songDirUrl = '/Dropbox/web/midiCollection/';

    const playStandardMidiFile = function(fileInfo: ISmfFile)
    {
        /** @debug */
        console.log(' ');
        console.log('gonna play', fileInfo.fileName);

        // <iframe width="320" height="240" src="https://www.youtube.com/embed/_M-ytoRguS8" frameborder="0" allowfullscreen></iframe>

        // TODO: in row them, not in col
        youtubeEmbededVideosCont.innerHTML = '';
        if (fileInfo.fileName in linksBySongName) {
            linksBySongName[fileInfo.fileName].forEach(record => {
                youtubeEmbededVideosCont.appendChild($('<div style="float: left"></div>')
                    .append($('<div></div>')
                        .append(record.viewCount + ''))
                    .append($('<iframe></iframe>')
                        .attr('width', 320)
                        .attr('height', 240)
                        .attr('src', 'https://www.youtube.com/embed/' + record.youtubeId)
                        // likely optional
                        .attr('frameborder', '0')
                        .attr('allowfullscreen', 'allowfullscreen')
                    )[0]);
            });
        }

        setTimeout(() => Tls.fetchMidi(songDirUrl + '/' + fileInfo.fileName, (song: IGeneralStructure) =>
        {
            synth.consumeConfig(song.config.channels);
            synth.analyse(song.chordList);
            control.setFields(song);
            control.setFileInfo(fileInfo);

            player.playSheetMusic(song, () => playRandom());
        }), 500); // timeout for youtube embeded videos to load so it did not lag
    };

    const makeFileName = function(path: string, row: {rawFileName: string}): HTMLAnchorElement
    {
        var result = document.createElement('a');
        result.setAttribute('href', songDirUrl + '/' + row.rawFileName);
        result.innerHTML = (path + '').replace(/[_\/]/g, ' ');

        return result;
    };

    const initIchigosMidiList = function ()
    {
        var playButtonFormatter = function(cell: string, row: ISmfFile)
        {
            return $('<input type="button" class="playBtn" value=">"/>')
                .click((_) => playStandardMidiFile(row));
        };

        ServApi.get_ichigos_midi_names((rowList: ISmfFile[]) => {
            $(midiFileCounter).html(rowList.length + '');

            var colModel: ColModel<ISmfFile> = [
                {'name': 'fileName', 'caption': 'File Name', formatter: makeFileName},
                //{'name': 'length', 'caption': 'Length'},
                {'name': 'rating', 'caption': '*', formatter: null},
                {'name': 'playButton', 'caption': 'Play', formatter: playButtonFormatter}
            ];

            var caption = 'Mostly from <a href="http://ichigos.com">ichigos.com</a>';

            var table = TableGenerator().generateTable(colModel, rowList, caption, 500, 200);
            $('.random-midi-list-cont').append(table); // defined in index.html

            var random = UnfairRandom(rowList);

            playRandom = () => playStandardMidiFile(random.getAny());
        });
    };

    drawSheetMusicFlag.onclick = () =>
        sheetMusicPainter.setEnabled(drawSheetMusicFlag.checked);

    playMidiFromDiskBtn.onclick = () => Tls.openMidi(playSMF);
    playRandomBtn.onclick = () => playRandom();

    initIchigosMidiList();
};