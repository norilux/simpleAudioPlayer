// Tracks
const trackList = [
    { name: 'audio.mp3',  audio: new Audio('music/audio.mp3')  },
    { name: 'audio2.mp3', audio: new Audio('music/audio2.mp3') },
    { name: 'audio3.mp3', audio: new Audio('music/audio3.mp3') },
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
    }

    play ()
    {
        const currentTrack = this.list[this.current];
        if (!currentTrack) return console.warn('Track not found');

        currentTrack.audio.volume = this.volume;
        currentTrack.audio.play()
            .then(() => console.log(`Track: ${currentTrack.name} playing... ▶`))
            .catch(() => console.error('Cannot play track'));
    }

    pause ()
    {
        const currentTrack = this.list[this.current];
        if (!currentTrack) return console.error('Cannot pause unknown track');

        try {
            currentTrack.audio.pause();
            console.log(`Track: ${currentTrack.name} paused... ⏸`);
        }
        catch (error) {
            console.error('Cannot pause track', error);
        }
    }

    stop ()
    {
        const currentTrack = this.list[this.current];
        if (!currentTrack) return console.error('Cannot stop unknown track');

        try {
            currentTrack.audio.pause();
            currentTrack.audio.currentTime = 0;
            console.log(`Track: ${currentTrack.name} stopped... ⏸`);
        } catch (error) {
            console.error('Cannot stop track', error);
        }
    }

    next ()
    {
        this.stop();

        const nextTrackIndex = this.list.length === this.current + 1 ? 0 : this.current + 1;
        const nextTrack = this.list[nextTrackIndex];
        if (!nextTrack) return console.error('Cannot find track');

        this.current = nextTrackIndex;

        this.playAfterSwitch && this.play()

        console.log('Switched to next track ⏭')
    }

    previous ()
    {
        this.stop();

        const nextTrackIndex = this.current === 0 ? this.list.length - 1 : this.current - 1;
        const nextTrack = this.list[nextTrackIndex];
        if (!nextTrack) return console.error('Cannot find track');

        this.current = nextTrackIndex;

        this.playAfterSwitch && this.play()

        console.log('Switched to previous track ⏮')
    }

    setVolume (volume)
    {
        const currentTrack = this.list[this.current];
        if (!currentTrack) return console.error('Cannot change volume in unknown track');

        currentTrack.audio.volume = this.volume = volume;
        console.log(`Switched changed volume to ${volume} 🔊`)
    }
}

// Player
const player = new Player();

// Elements
const playBtn        = document.getElementById('play-btn');
const pauseBtn       = document.getElementById('pause-btn');
const nextBtn        = document.getElementById('next-btn');
const stopBtn        = document.getElementById('stop-btn');
const previousBtn    = document.getElementById('previous-btn');
const switcherBtn    = document.getElementById('switcher');
const volumePlusBtn  = document.getElementById('volume-plus');
const volumeMinusBtn = document.getElementById('volume-minus');

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

// Events
playBtn.addEventListener('click',        () => player.play());
pauseBtn.addEventListener('click',       () => player.pause());
stopBtn.addEventListener('click',        () => player.stop());
nextBtn.addEventListener('click',        () => player.next());
previousBtn.addEventListener('click',    () => player.previous());

switcherBtn.addEventListener('click',    () => handleSwitch());

volumePlusBtn.addEventListener('click',  handleChangeVolume("plus"));
volumeMinusBtn.addEventListener('click', handleChangeVolume("minus"));
