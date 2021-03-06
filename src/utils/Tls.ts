/// <reference path="../references.ts" />

import {IGeneralStructure} from "../DataStructures";
import {DecodeMidi} from "../player/DecodeMidi";
import {S, IPromise} from "./S";
import {Dom} from "./Dom";

var Static: any = {};

// for asynchronous buffer retrieval
var cachedSampleBuffers: { [url: string]: AudioBuffer; } = {};
var awaiting: { [url: string]: Array<{ (resp: AudioBuffer): void }> } = {};

const toDict = <Tv>(pairs: [string,Tv][]): {[k: string]: Tv} => {
    var result: {[k: string]: Tv} = {};
    pairs.forEach(p => result[p[0]] = p[1]);
    return result;
};

const range = S.range;

const parseRgbCss = function(rgbCss: string): [number, number, number]
{
    // TODO: also parse rgba(), #FDE, #FFDDEE

    var result = /rgb\((\d+), *(\d+), *(\d+)\)/
        .exec(rgbCss)
        .slice(1);

    return <any>result;
};

let fetchFile = function(url: string, responseType: 'arraybuffer' | 'json' | 'text', whenLoaded: { (buf: any): void })
{
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = responseType;
    oReq.onload = () => whenLoaded(oReq.response);
    oReq.send(null);
};

// http://stackoverflow.com/a/21797381/2750743
let _base64ToArrayBuffer = function(base64: string): ArrayBuffer
{
    var binary_string =  atob(base64);

    return new Uint8Array(binary_string.length)
        .fill(0)
        .map((_, i) => binary_string.charCodeAt(i))
        .buffer;
};

/** json-encodes "data" in such indent format that attributes are not line-broken */
let xmlyJson = function($var: any, $margin?: string): string
{
    // slows performance twice
    let builtIn = JSON.stringify($var);
    if (builtIn.length < 20) {
        return builtIn;
    }

    var ind = '    ';
    $margin = $margin || '';

    return Array.isArray($var) ? '[\n'
            + $var.map((el: any) => $margin + ind + xmlyJson(el, $margin + ind)).join(',\n')
            + '\n' + $margin + ']'
        : (typeof $var === 'object' && $var !== null) ? '{'
            + Object.keys($var).map(k => JSON.stringify(k) + ': ' + xmlyJson($var[k], $margin)).join(', ')
            + '}'
        : JSON.stringify($var);
};

let ditu = <Tv>(pairs: {key: number, val: Tv}[]) => {
    let result: {[k: number]: Tv} = {};
    for (let pair of pairs) {
        result[pair.key] = pair.val;
    }
    return result;
};

let audioCtxOnDemand = S.onDemand(() => new AudioContext());

/**
 * i put here random reusable functions and stuff
 * all functions here should migrate to specialized classes like S.ts and Dom.ts one day
 */
export let Tls =
{
    get audioCtx() {
        return audioCtxOnDemand();
    },

    shuffle: function<T>(elmts: T[])
    {
        for (let i = 0; i < elmts.length; ++i) {
            let rnd = Math.random() * elmts.length | 0;
            [elmts[i], elmts[rnd]] = [elmts[rnd], elmts[i]];
        }
        return elmts;
    },

    for: <Tx>(dict: {[k: string]: Tx}, callback: { (k: string, v: Tx): void }) =>
        Object.keys(dict).forEach(k => callback(k, dict[k])),

    /** @params l - left index inclusive, r - right index exclusive */
    range: range,

    /** transforms array of [key, value] tuples into a dict */
    toDict: toDict,
    dict: function<Tv>(obj: {[key: string]: Tv}) {
    },

    digt: S.digt,

    /** transforms key-value pair tuples to a dict */
    ditu: ditu,

    map: <Tx, Ty>(val: Tx, f: (v: Tx) => Ty) => val && f(val),

    /** transforms array of [key, value] tuples into a dict */
    dicti: <Tv>(pairs: [number,Tv][]): {[k: number]: Tv} => {
        var result: {[k: number]: Tv} = {};
        pairs.forEach(p => result[p[0]] = p[1]);
        return result;
    },

    fori: <Tx>(dict: {[k: number]: Tx}, callback: { (k: number, v: Tx): void }) =>
        Object.keys(dict).forEach(k => callback(+k, dict[+k])),

    mapi: <Tx, Ty>(dict: {[k: number]: Tx}, callback: (v: Tx, k: number) => Ty) =>
        Object.keys(dict).map(k => callback(dict[+k], +k)),

    selectFileFromDisc: function(whenLoaded: { (dataBase64: string): void }): void
    {
        var loadSelectedFile = function (fileInfo: File, whenLoaded: { (data: any): void }): void
        {
            var maxSize = 2 * 1024 * 1024; // 2 mebibytes

            if (fileInfo.size < maxSize ||
                confirm('File is very large, ' + (fileInfo.size / 1024 / 1024).toFixed(2) + ' MiB . Are you sure?')
            ) {
                var reader = new FileReader();
                reader.readAsDataURL(fileInfo);
                reader.onload = (e: any) => {
                    whenLoaded(e.target.result.split(',')[1]);
                }
            } else {
                alert('too big file, more than 2 MiB!');
            }
        };

        if (!Static.FILE_INPUT) {
            Static.FILE_INPUT = Dom.mk.input({type: 'file'}).s;
            document.querySelector('body').appendChild(Static.FILE_INPUT);
        }
        var input = Static.FILE_INPUT;
        input.onchange = (inputEvent: Event) => loadSelectedFile(input.files[0], whenLoaded);
        input.onclick = (inputEvent: Event) => { input.value = null; };
        console.log(input);
        input.click();
    },

    fetchFile: fetchFile,

    fetchBinaryFile: (url: string, whenLoaded: (buf: ArrayBuffer) => void) =>
        fetchFile(url, 'arraybuffer', whenLoaded),

    httpForm: (url: string, restMethod: 'GET' | 'POST' = 'GET', params: {[k: string]: primitive_t} = {}) =>
        <IPromise<string>>S.promise(delayedReturn => {
            let http = new XMLHttpRequest();
            http.onload = () => delayedReturn(http.responseText);
            let esc = encodeURIComponent;
            let query = Object.keys(params)
                .map(k => esc(k) + '=' + esc('' + params[k]))
                .join('&');

            if (restMethod === 'GET') {
                http.open(restMethod, url + '?' + query, true);
                http.send(null);
            } else {
                http.open(restMethod, url + '?' + query, true);
                http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                http.send(query);
            }
        }),

    http: (url: string, restMethod: 'GET' | 'POST' = 'GET', params: valid_json_t = {}) =>
        S.promise<string>(resolve => fetch(url, {
            method: restMethod,
            headers: {'Content-Type': 'application/json;UTF-8'},
            body: restMethod === 'POST' ? JSON.stringify(params) : null,
        })  .then(respObj => respObj.text())
            .then(respTxt => resolve(respTxt))),

    fetchJson: (url: string, whenLoaded: (parsedJson: {[k: string]: any}) => void) =>
        fetchFile(url, 'json', whenLoaded),

    ajax: (url: string, restMethod: string, params: {[k: string]: any}) => {
        let result = {then: (data: any) => {}};
        var http = new XMLHttpRequest();
        http.open(restMethod, url, true);
        http.responseType = 'text';
        http.setRequestHeader('Content-Type', 'application/json;UTF-8');
        http.onload = () => result.then(JSON.parse(http.response));
        http.send(restMethod === 'POST' ? JSON.stringify(params) : null);
        return result;
    },

    fetchMidi: (url: string, whenLoaded: { (midi: IGeneralStructure): void }) =>
        Tls.fetchBinaryFile(url, buf =>
            whenLoaded(DecodeMidi(buf))),

    openByteBuffer: (whenLoaded: (byteBuffer: ArrayBuffer) => void) =>
        Tls.selectFileFromDisc(db64 =>
            whenLoaded(_base64ToArrayBuffer(db64))),

    openMidi: (whenLoaded: { (midi: IGeneralStructure): void }) =>
        Tls.openByteBuffer(byteBuffer =>
            whenLoaded(DecodeMidi(byteBuffer))),

    getAudioBuffer: function(url: string, onOk: { (resp: AudioBuffer): void }): void
    {
        if (!(url in cachedSampleBuffers)) {
            if (awaiting[url]) {
                awaiting[url].push(onOk);
            } else {
                awaiting[url] = [onOk];
                Tls.fetchBinaryFile(url, (resp) => Tls.audioCtx.decodeAudioData(resp, (decoded) => {
                    awaiting[url].forEach(a => a(decoded));
                    awaiting[url] = [];
                    cachedSampleBuffers[url] = decoded;
                }));
            }
        } else {
            onOk(cachedSampleBuffers[url]);
        }
    },

    /** @param chunkSize - count of elements that will be foreached in one iteration
     * @param breakMillis - break duration between iterations */
    forChunk: <Tx>(list: Tx[], breakMillis: number, chunkSize: number, callback: { ($el: Tx): void }) =>
    {
        var interrupted = false;

        var doNext = function(index: number)
        {
            if (index < list.length && !interrupted) {
                for (var i = index; i < Math.min(list.length, index + chunkSize); ++i) {
                    callback(list[i]);
                }
                setTimeout(() => doNext(index + chunkSize), breakMillis);
            }
        };

        doNext(0);

        var interrupt = () => (interrupted = true);

        return interrupt;
    },

    xmlyJson: xmlyJson,

    cbList: (v: {(): void}[]) => S.list(v),
    timeout: (seconds: number) => 1 && {
        set then(cb: () => void) {
            setTimeout(cb, seconds * 1000);
        },
    },

    get channelColors() {
        // firefox fails - TODO: investigate
        var cssReflection: {[selector: string]: {[name: string]: string}};
        try {
            cssReflection =
                <any>toDict(<any>[].concat.apply([], Array.from(document.styleSheets).map(css => Array.from(css.rules)))
                    .map((r: any) => [r.selectorText, toDict(Array.from(r.style)
                        .map((name: string) => <any>[name, r.style[name]]))]));
        } catch (e) {
            console.log('Failed to get CSS reflection', e);
            cssReflection = {};
        }

        return range(0,16).map((ch): [number, number, number] => {
            let selector = '.channelColors [data-channel="' + ch + '"]';
            let colorStr = (cssReflection[selector] || {})['color'] || null;
            return colorStr ? parseRgbCss(colorStr) : <any>range(0,3).map(_ => Math.random() * 256 | 0);
        })
    },

    removeParentheses: function(title: string): [string, string] {
        let letters = [];
        let parenthesesLetters = [];
        let level = 0;

        for (let char of title) {
            if (level > 0) {
                if (char === ')') {
                    --level;
                } else {
                    parenthesesLetters.push(char);
                }
            } else if (char === '(') {
                ++level;
            } else {
                letters.push(char);
            }
        }

        return [letters.join('').trim(), parenthesesLetters.join('').trim()];
    },

    /** @see http://stackoverflow.com/a/1293163/2750743 */
    csvToTuples: function(strData: string, strDelimiter?: string): string[][] {
        strDelimiter = (strDelimiter || ",");

        var objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );

        var result: string[][] = [[]];
        var matches = null;
        while (matches = objPattern.exec( strData )) {
            var strMatchedDelimiter = matches[1];
            if (strMatchedDelimiter.length &&
                strMatchedDelimiter !== strDelimiter
            ) {
                result.push([]);
            }
            var strMatchedValue;
            if (matches[ 2 ]) {
                strMatchedValue = matches[ 2 ].replace(
                    new RegExp( "\"\"", "g" ),
                    "\""
                );
            } else {
                strMatchedValue = matches[ 3 ];
            }
            result[ result.length - 1 ].push( strMatchedValue );
        }
        return(result);
    },

    // here is exactly 128 preset names in correct order
    instrumentNames: ["Acoustic Grand Piano","Bright Acoustic Piano","Electric Grand Piano",
        "Honky-tonk Piano","Electric Piano","6 Electric Piano 2","Harpsichord","Clavinet","Celesta",
        "Glockenspiel","Music Box","Vibraphone","Marimba","Xylophone","Tubular Bells","Dulcimer",
        "Drawbar Organ","Percussive Organ","Rock Organ","Church Organ","Reed Organ","Accordion",
        "Harmonica","Tango Accordion","Acoustic Guitar (nylon)","Acoustic Guitar (steel)",
        "Electric Guitar (jazz)","Electric Guitar (clean)","Electric Guitar (muted)","Overdriven Guitar",
        "Distortion Guitar","Guitar Harmonics","Acoustic Bass","Electric Bass (finger)","Electric Bass (pick)",
        "Fretless Bass","Slap Bass 1","38 Slap Bass 2","Synth Bass 1","40 Synth Bass 2","Violin","Viola",
        "Cello","Contrabass","Tremolo","Pizzicato","Orchestral Harp","Timpani","String Ensemble 1",
        "50 String Ensemble 2","Synth","52 Synth Strings 2","Choir","Voice","55 Synth Choir","Orchestra Hit",
        "Trumpet","Trombone","Tuba","Muted Trumpet","French Horn","Brass Section","63 Synth Brass 1",
        "64 Synth Brass 2","Soprano Sax","Alto Sax","Tenor Sax","Baritone Sax","Oboe","English Horn",
        "Bassoon","Clarinet","Piccolo","Flute","Recorder","Pan Flute","Blown bottle","Shakuhachi","Whistle",
        "Ocarina","Lead 1","sawtooth","calliope","84 Lead 4 chiff","charang","86 Lead 6 (voice)","fifths",
        "88 Lead 8 (bass + lead)","89 Pad 1 (new age)","90 Pad 2 (warm)","polysynth","92 Pad 4 (choir)",
        "93 Pad 5 (bowed)","94 Pad 6 (metallic)","95 Pad 7 (halo)","96 Pad 8 (sweep)","FX",
        "98 FX 2 (soundtrack)","99 FX 3 (crystal)","100 FX 4 (atmosphere)","101 FX 5 (brightness)","goblins",
        "echoes","104 FX 8 (sci-fi)","Sitar","Banjo","Shamisen","Koto","Kalimba","Bagpipe","Fiddle","Shanai",
        "113 Tinkle Bell","Agogo","Steel Drums","Woodblock","Taiko Drum","Melodic Tom","119 Synth Drum",
        "Cymbal","Fret","122 Breath Noise","Seashore","Bird Tweet","Telephone Ring","Helicopter","Applause","Gunshot"],
};

export var Fraction = function(num: number, den: number): IFraction {
    return {
        num: () => num,
        den: () => den,
        float: () => num / den,
        apacheStr: () => num + ' / ' + den,
    };
};

export interface IFraction {
    num: () => number,
    den: () => number,
    float: () => number,
    apacheStr: () => string,
}