// Tracks
const createAudio = (path) => new Audio(path);
const trackList = [
    { name: 'audio.mp3',  audio: 'music/audio.mp3'},
    { name: 'audio2.mp3', audio: 'music/audio2.mp3'},
    { name: 'audio3.mp3', audio: 'music/audio3.mp3'},
];

// === === === PLAYER === === ===
class Player
{
    constructor ()
    {
        this.playAfterSwitch = false;
        this.list = trackList;
        this.current = 0;
        this.volume = 1;
        this.isPlaying = false;
        this.currentAudio = { name: this.list[this.current].name, audio: createAudio(this.list[this.current].audio) };
        // Tools
        this.frequencyArray = null;
        this.analyzer = null;
    }

    updateAudio ()
    {
        this.currentAudio.audio = createAudio(this.list[this.current].audio);
        this.currentAudio.name = this.list[this.current].name;
    }

    init ()
    {
        const context = new AudioContext();
        this.analyzer = context.createAnalyser();
        const source = context.createMediaElementSource(this.currentAudio.audio);

        this.analyzer.fftSize = 256;

        source.connect(this.analyzer);
        this.analyzer.connect(context.destination);
        this.frequencyArray = new Uint8Array(this.analyzer.frequencyBinCount);
    }

    /**
     * @param init { boolean }
     */
    play (init)
    {
        if (!this.currentAudio) return console.warn('Track not found');

        init && this.init();

        this.currentAudio.audio.volume = this.volume;

        this.currentAudio.audio.play()
            .then(() => console.log(`Track: ${this.currentAudio.name} playing... ▶`))
            .catch(() => console.error('Cannot play track'));

        this.isPlaying = true;

        drawDancingLine();
    }

    pause ()
    {
        if (!this.currentAudio) return console.error('Cannot pause unknown track');

        try {
            this.currentAudio.audio.pause();
            console.log(`Track: ${this.currentAudio.name} paused... ⏸`);
            this.isPlaying = false;
        }
        catch (error) {
            console.error('Cannot pause track', error);
        }
    }

    stop ()
    {
        if (!this.currentAudio) return console.error('Cannot stop unknown track');

        try {
            this.currentAudio.audio.pause();
            this.currentAudio.audio.currentTime = 0;
            this.isPlaying = false;
            console.log(`Track: ${this.currentAudio.name} stopped... ⏸`);
        } catch (error) {
            console.error('Cannot stop track', error);
        }
    }

    next ()
    {
        this.stop();

        const nextTrackIndex = this.list.length === this.current + 1 ? 0 : this.current + 1;
        if (!this.list[nextTrackIndex]) return console.error('Cannot find track');

        this.currentAudio = {
            name: this.list[nextTrackIndex].name,
            audio: this.list[nextTrackIndex].audio,
        }

        this.current = nextTrackIndex;

        this.updateAudio()

        this.playAfterSwitch && this.play(true)

        console.log('Switched to next track ⏭')
    }

    previous ()
    {
        this.stop();

        const nextTrackIndex = this.current === 0 ? this.list.length - 1 : this.current - 1;
        if (!this.list[nextTrackIndex]) return console.error('Cannot find track');

        this.currentAudio = {
            name: this.list[nextTrackIndex].name,
            audio: this.list[nextTrackIndex].audio,
        };

        this.current = nextTrackIndex;

        this.updateAudio();

        this.playAfterSwitch && this.play(true)

        console.log('Switched to previous track ⏮')
    }

    setVolume (volume)
    {
        if (!this.currentAudio) return console.error('Cannot change volume in unknown track');

        this.currentAudio.audio.volume = this.volume = volume;
        console.log(`Switched changed volume to ${volume} 🔊`)
    }
}

// Player
const player = new Player();

// Elements
const playPauseBtn   = document.getElementById('play-pause-btn');
const nextBtn        = document.getElementById('next-btn');
const stopBtn        = document.getElementById('stop-btn');
const previousBtn    = document.getElementById('previous-btn');
const switcherBtn    = document.getElementById('switcher');
const volumePlusBtn  = document.getElementById('volume-plus');
const volumeMinusBtn = document.getElementById('volume-minus');

const audioCanvas = document.getElementById('audio-pic');

// Switchers
let switcher = false;

// Handlers
const handleSwitch = () =>
{
    switcher = !switcher;
    switcherBtn.innerText = switcher ? '⚫' : '⚪'
    player.playAfterSwitch = switcher;
    console.log(`Track${!switcher ? ' not' : ''} play when click next or previous`)
}

/**
 * Handle change music volume
 * @param action {'plus' | 'minus'}
 * @returns {function(): void}
 */
const handleChangeVolume = (action) => () => {
    const currentVolume = player.volume * 10; // 0.5 to 5
    const newVolume = action === "plus"
        ? currentVolume >= 9 ? 10 : currentVolume + 1
        : currentVolume <= 1 ? 0 : currentVolume - 1;

    player.setVolume(newVolume/10); // 5 to 0.5
}

// Canvas
audioCanvas.style.width = '500px';
audioCanvas.style.height = '100px';
const ctx = audioCanvas.getContext('2d');

// Events
playPauseBtn.addEventListener('click',   () => player.isPlaying ? player.pause() : player.play());
stopBtn.addEventListener('click',        () => player.stop());
nextBtn.addEventListener('click',        () => player.next());
previousBtn.addEventListener('click',    () => player.previous());

switcherBtn.addEventListener('click',    () => handleSwitch());

volumePlusBtn.addEventListener('click',  handleChangeVolume("plus"));
volumeMinusBtn.addEventListener('click', handleChangeVolume("minus"));

function drawDancingLine () {
    if (!player.analyzer) return;
    player.analyzer.getByteFrequencyData(player.frequencyArray)

    ctx.clearRect(0, 0, 500, 100)
    ctx.beginPath();
    player.frequencyArray.forEach((e, i) => {
        const margin = Math.trunc((500/player.frequencyArray.length)*i);
        const y = 100 - Math.trunc((e / 128.0) * 50);
        i === 0 && ctx.moveTo(margin, y);
        ctx.lineTo(margin, y);
    })
    ctx.stroke();

    requestAnimationFrame(drawDancingLine);
}
