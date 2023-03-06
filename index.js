const $$ = document.querySelectorAll.bind(document);
const $ = document.querySelector.bind(document);
const heading = $(".container__heading-desc");
const cdThumb = $(".cd-thumb");
const audio = $("#audio");
const cd = $(".cd");
const playVideo = $(".control__video");
const playMusic = $(".icon-video");
const playPause = $(".icon-pause");
const inputRange = $(".progress");
const nextBtn = $(".control__next");
const backBtn = $(".control__back");
const randomBtn = $(".icon-random");
const reloadBtn = $(".icon-reload");
const playList = $(".play-music");
const volume = $(".volume");
const volumeUp = $(".icon-volume-up");
const volumeMute = $(".icon-volume-mute");

/*1. Render song
  2. Scroll top
  3.Play , pause , seek
  4.CD rotate
  5.Next , prev
  6.Random
  7.Next / Repeat When ended
  8.Active song
  9.Scrool active song into view
  10.Play song when click
*/

const app = {
  isVolume: false,
  isRepeat: false,
  isRandom: false,
  isPlay: false,
  currentIndex: 0,
  songs: [
    {
      name: "Bigcityboi",
      singer: "Binz",
      path: "./music/bigcity.mp3",
      image: "./img/nhung-cau-rap-hay-cua-binz-1.jpg",
    },
    {
      name: "Short Skirt",
      singer: "Niz, Trần Huyền Diệp",
      path: "./music/shortkids.mp3",
      image: "./img/bai2.jpg",
    },
    {
      name: "Vỡ",
      singer: "Đức Phúc",
      path: "./music/ssss.mp3",
      image: "./img/vo.jpg",
    },
    {
      name: "Yêu Thương Ngày Đó",
      singer: "SOOBIN",
      path: "./music/yeuthuongngaydo.mp3",
      image: "./img/yeuthuongngaydo.jpg",
    },
    {
      name: "Lạc Nhau Có Phải Muôn Đời ",
      singer: "ERIK",
      path: "./music/lacnhaucophaimuondoi.mp3",
      image: "./img/lacnhau.jpg",
    },
    {
      name: "Chiều Hôm Âý",
      singer: "Jaykii",
      path: "./music/chieuhomay.mp3",
      image: "./img/chieuhomay.jpg",
    },
    {
      name: "Vỡ Tan",
      singer: "Hiền Hồ, Trịnh Thăng Bình",
      path: "./music/votan.mp3",
      image: "./img/votan.jpg",
    },
  ],

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
      <ul  class="music_list ${
        index === app.currentIndex ? "active" : ""
      }" data-index = ${index}>
      <li class="music_item">
        <img
          src="${song.image}"
          alt=""
          class="music_item-img"
        />
        <div class="group_text">
          <h3 class="music_item-name">${song.name}</h3>
          <p class="music_item-singer">${song.singer}</p>
        </div>
        <div class="music_item-still">
          <i class="icon-still fas fa-ellipsis-h"></i>
        </div>
      </li>
    </ul>`;
    });
    playList.innerHTML = htmls.join(" ");
  },

  defineProperty: function () {
    Object.defineProperty(this, "CurrentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },
  handleEvents: function () {
    // Xử lý CD quay
    const cdRotate = cdThumb.animate(
      [
        {
          transform: "rotate(360deg)",
        },
      ],
      {
        iterations: Infinity,
        duration: 10000,
      }
    );
    cdRotate.pause();

    // Xử lí phóng to / thu nhỏ CD
    const cdWidth = cd.offsetWidth;
    document.onscroll = function () {
      const scroolTop = window.scrollY || document.documentElement.scrollTop;
      const newCd = cdWidth - scroolTop;

      cd.style.width = newCd > 0 ? newCd + "px" : 0;

      cd.style.opacity = newCd / cdWidth;
    };

    // Xử lí khi Click Play
    playVideo.onclick = function () {
      if (app.isPlay) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    audio.onplay = function () {
      playMusic.classList.remove("playing");
      playPause.classList.remove("playing");
      app.isPlay = true;
      cdRotate.play();
    };
    audio.onpause = function () {
      app.isPlay = false;
      playMusic.classList.add("playing");
      playPause.classList.add("playing");
      cdRotate.pause();
    };

    // Khi tiến độ bài hát được thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const inputPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        inputRange.value = inputPercent;
      }
    };

    // Xử lí khi tua
    inputRange.onchange = function (e) {
      const seekTime = (audio.duration / 100) * e.target.value;
      audio.currentTime = seekTime;
    };

    // Xử lí khi Next Bài hát
    nextBtn.onclick = function () {
      if (app.isRandom) {
        app.playRandomSong();
      } else {
        app.nextSong();
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    };

    // Xử lí khi Back Bài hát
    backBtn.onclick = function () {
      if (app.isRandom) {
        app.playRandomSong();
      } else {
        app.backSong();
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    };

    // Xử lí khi random Song
    randomBtn.onclick = function () {
      app.isRandom = !app.isRandom;
      randomBtn.classList.toggle("active", app.isRandom);
    };

    // Xử lí khi phát lại một song
    reloadBtn.onclick = function () {
      app.isRepeat = !app.isRepeat;
      this.classList.toggle("active", app.isRepeat);
    };

    // Xử lí khi song end
    audio.onended = function () {
      if (app.isRepeat) {
        audio.play();
      } else {
        app.nextSong();
        audio.play();
      }
    };

    // Xử lí khi active song
    playList.onclick = function (e) {
      const songElement = e.target.closest(".music_list:not(.active");
      if (songElement || e.target.closest(".music_item-still")) {
        app.currentIndex = Number(songElement.dataset.index);
        app.loadCurrentSong();
        app.render();
        audio.play();
      }
    };
    volume.onclick = function () {
      if (app.isVolume) {
        audio.volume = 0;
        app.isVolume = false;
        volumeUp.classList.add("active");
        volumeMute.classList.add("active");
      } else {
        audio.volume = 1;
        app.isVolume = true;
        volumeMute.classList.remove("active");
        volumeUp.classList.remove("active");
      }
    };
  },

  scrollToActiveSong: function () {
    setTimeout(function () {
      if (app.currentIndex) {
        $(".music_list.active").scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      } else {
        $(".music_list.active").scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 500);
  },

  loadCurrentSong: function () {
    heading.textContent = this.CurrentSong.name;
    cdThumb.style.backgroundImage = `url('${this.CurrentSong.image}')`;
    audio.src = this.CurrentSong.path;
  },
  backSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },
  playRandomSong: function () {
    let newSong;
    do {
      newSong = Math.floor(Math.random() * this.songs.length);
    } while (newSong === this.currentIndex);
    this.currentIndex = newSong;
    this.loadCurrentSong();
  },
  start: function () {
    // Định nghĩa các thuộc tính cho object
    this.defineProperty();

    // Xử lí các sự kiện
    this.handleEvents();

    // Tải thông tin bài hát vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    // Render Playlist
    this.render();
  },
};

app.start();
