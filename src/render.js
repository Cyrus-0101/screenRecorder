//Functionality
const { desktopCapturer, remote } = require('electron');
const { Menu } = remote;

//Buttons

const videoElement = document.querySelector('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');

videoSelectBtn.onclick = getVideoSources;

//Getting available video sources
async function getVideoSources() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );

    videoOptionsMenu.popup();
};

//A media recorder intance that lets you capture live footage
let mediaRecorder;
const recordedChunks = [];

//Selecting the VideoSource for the screen to record
async function selectSource(source) {

    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    }
    //Creating A Stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    //Preview the source in a video
    videoElement.srcObject = stream;
    videoElement.play();

    //Creating a Media Recorder
    const options = { mimeType: 'video/webm: codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);

    //Registering Event Handlers
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
};

//Capturing all Recorded Chunks
function handleDataAvailable(e) {
    console.log("Video Data Available");
    recordedChunks.push(e.data);
};

//Converts data to blob because blob is a data structure to handle raw data such as videos
//Save the video file on stop
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9' 
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
}