import MEDIA from './media.js'; //the data file import


const APP = {
  audio: new Audio(), //the Audio Element that will play every track
  currentTrack: 0, //the integer representing the index in the MEDIA array
  init: () => {
    //called when DOMContentLoaded is triggered
    APP.buildPlaylist();
    APP.loadCurrentTrack();
    APP.addListeners();
    APP.audio.addEventListener('error',(ev) => APP.errorHandler(ev));    
    APP.convertTimeDisplay();
    APP.displayTime();

  },
  addListeners: () => {
  //add event listeners for APP.audio 
   document.querySelector(".controls").addEventListener("click", APP.handleClick);
  //add event listeners for interface elements
    APP.audio.addEventListener('timeupdate', APP.updateTime);
    
    document.querySelector(".progress").addEventListener('click', APP.progress);

    APP.audio.addEventListener('canplay', APP.canPlay);
    
    APP.audio.addEventListener('ended', APP.ended);     
    
    document.getElementById('btnShuffle').addEventListener("click", APP.shuffle);
  },
  buildPlaylist: () => {
    const album = document.querySelector(".album_img");
    const ul = document.querySelector("ul");
    ul.innerHTML = MEDIA.map((media, index) => {
      const { artist, title, thumbnail} = media;
      return `
        <li class="track__item">
          <div class="track__thumb">
            <img class="thumbnail" src="img/${thumbnail}" alt="artist album art thumbnail" />
          </div>
          <div class="track__details">
            <p class="track__title">${title}</p>
            <p class="track__artist">${artist}</p>
          </div>
          <div class="track__time">
            <time class="time" datetime="">00:00</time>
          </div>
        </li>
      `;
    }).join("");
    ul.firstElementChild.classList.add("select");
    const firstElementChild = ul.firstElementChild.querySelector(".track__thumb img").getAttribute("src");
    album.src = `${firstElementChild}`;
  },  
  displayTime: () => {
    MEDIA.forEach((media, index) => {
      const {track} = media;
      let tempAudio = new Audio(`media/${track}`);
      tempAudio.addEventListener('durationchange', () => {
        const duration = tempAudio.duration;
        media.duration = duration;
        const timeString = APP.convertTimeDisplay(duration);
        const timeElement = document.querySelectorAll('.track__time time')[index];
        timeElement.innerHTML = timeString;
      })
    })
  },   
  loadCurrentTrack: () => {
    //use the currentTrack value to set the src of the APP.audio element
    APP.audio.src = `media/${MEDIA[APP.currentTrack].track}`;
    const ul = document.querySelector("ul");
    ul.addEventListener("click", (ev) => {
      const li = ev.target.closest(".track__item");
      if (!li) return;
      const index = Array.from(ul.children).indexOf(li);
      APP.currentTrack = index;
      APP.audio.src = `media/${MEDIA[APP.currentTrack].track}`; 
      const selected = document.querySelector(".select");
      if (!li.classList.contains("select")){
        li.classList.add("select");
        if (selected) selected.classList.remove("select");
        const album = document.querySelector(".album_img");
        album.src = `img/${MEDIA[index].large}`;
      }
      APP.play();
    });      
  },
  play: () => {
    //start the track loaded into APP.audio playing
    const playPause = document.querySelector(".play");
    APP.audio.play();
    playPause.textContent = "pause";
    document.querySelector(".album_img").classList.add("shakeIt");
    document.querySelector(".title").classList.add("shakeIt");
    document.body.classList.add("jamaica");
    document.querySelector("header").classList.add("jamaica");
    document.querySelector("footer").classList.add("jamaica");
  },
  pause: () => {
    //pause the track loaded into APP.audio playing
    const playPause = document.querySelector(".play");
    APP.audio.pause();
    playPause.textContent = "play_arrow";
    document.querySelector(".album_img").classList.remove("shakeIt");
    document.querySelector(".title").classList.remove("shakeIt");
    document.body.classList.remove("jamaica");
    document.querySelector("header").classList.remove("jamaica");
    document.querySelector("footer").classList.remove("jamaica");
  },
  next: () => {
    APP.pause();
    APP.currentTrack++;
    if (APP.currentTrack >= MEDIA.length) {
      APP.currentTrack = 0;
    }
    const selected = document.querySelector(".select");
    if (selected) {
      selected.classList.remove("select");
    }
    const ul = document.querySelector('ul');
    const nextLi = ul.children[APP.currentTrack];
    nextLi.classList.add("select");
    const album = document.querySelector(".album_img");
    album.src = `img/${MEDIA[APP.currentTrack].large}`;
    APP.audio.src = `media/${MEDIA[APP.currentTrack].track}`;
    APP.play();
  },
  previous: () => {
    APP.pause();
    APP.currentTrack--;
    if (APP.currentTrack < 0) {
      APP.currentTrack = MEDIA.length - 1;
    }
    const selected = document.querySelector(".select");
    if (selected) {
      selected.classList.remove("select");
    }
    const ul = document.querySelector('ul');
    const nextLi = ul.children[APP.currentTrack];
    nextLi.classList.add("select");
    const album = document.querySelector(".album_img");
    album.src = `img/${MEDIA[APP.currentTrack].large}`;
    APP.audio.src = `media/${MEDIA[APP.currentTrack].track}`;
    APP.play();
  }, 
  shuffle: () => {
    APP.pause();
    const played = document.querySelector(".played");
    played.style.width = `0%`;
    const selected = document.querySelector(".select");
    if (selected) {
      selected.classList.remove("select");
    }
    Array.prototype.shuffle = function () {
      this.forEach(function (item, index, arr) {
      let other = Math.floor(Math.random() * arr.length);
      [arr[other], arr[index]] = [arr[index], arr[other]];
      });
      return this;
      }
    MEDIA.shuffle();
    APP.currentTrack = 0;
    APP.audio.src = `media/${MEDIA[APP.currentTrack].track}`;
    APP.buildPlaylist();
    APP.displayTime();
  },   
  handleClick: (ev) => {
    const playPause = document.querySelector(".play");
    const next = document.querySelector(".next");
    const previous = document.querySelector(".prev");
      if(ev.target === playPause && playPause.textContent === "play_arrow"){
        APP.play();
        
        }else if(ev.target === playPause && playPause.textContent === "pause"){
        APP.pause();
        }else if(ev.target === next){
          APP.next();
        }else if(ev.target === previous){
          APP.previous();
        }
  },
  updateTime: () => {
    const { currentTime, duration } = APP.audio;
      if (currentTime === undefined || isNaN(currentTime) || duration === undefined || isNaN(duration)) {
        return;
        } else {
        const currentTimeDisplay = APP.convertTimeDisplay(currentTime);
        const totalTimeDisplay = APP.convertTimeDisplay(duration);
        document.querySelector(".current-time").innerHTML = currentTimeDisplay;
        document.querySelector(".total-time").innerHTML = totalTimeDisplay;
        const played = document.querySelector(".played");
        const seekBarWidth = (currentTime / duration) * 100;
        played.style.width = `${seekBarWidth}%`;
        }
  },
  progress: (ev) => {
  const progress = document.querySelector(".progress");
  const { clientWidth } = progress;
  const clickX = ev.x - progress.offsetLeft;
  const percentage = (clickX / clientWidth) * 100;
  const newWidth = `${percentage}%`;
  const newTime = (percentage / 100) * APP.audio.duration;

  const played = document.querySelector(".played");
  played.style.width = newWidth;
  APP.audio.currentTime = newTime;
  },
  canPlay: () => {
    const { currentTime, duration } = APP.audio;
      if (currentTime === undefined || isNaN(currentTime) || duration === undefined || isNaN(duration)) {
        return;
        } else {
        const currentTimeDisplay = APP.convertTimeDisplay(currentTime);
        const totalTimeDisplay = APP.convertTimeDisplay(duration);
        document.querySelector(".current-time").innerHTML = currentTimeDisplay;
        document.querySelector(".total-time").innerHTML = totalTimeDisplay;
        }
  },
  ended: () => {
    const { currentTime, duration } = APP.audio;
    if(currentTime === duration){
      APP.next();
    }
  },
  convertTimeDisplay: (seconds) => {
    //convert the seconds parameter to `00:00` style display
    if (seconds === undefined || isNaN(seconds)) {
      return '00:00';
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      const minutesDisplay = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const secondsDisplay = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
      return `${minutesDisplay}:${secondsDisplay}`;
    }
  },
  errorHandler(ev) {
    //do what you want when the audio/video track cannot load
    const playPause = document.querySelector(".play");
    if (ev.type === 'error')
    {
      playPause.textContent = "play_arrow";
      console.log("Audio could not be found")
    }
  }
};

document.addEventListener('DOMContentLoaded', APP.init());



