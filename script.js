'use strict';

/*
 * SHILU BIRTHDAY STORY — MUSIC + PAGE CONTROLLER
 * Music files are loaded from the exact filenames in the public GitHub repo.
 * Browser policy requires one user gesture before audio can begin.
 */

const REPO_RAW = 'https://raw.githubusercontent.com/SurojitMondal3108/Shilu-s-Birthday/main/';

const TRACKS = [
  'Tum Se Hi - BGM.mp3',
  'Tomake na lekha chithita ❤.mp3',
  'Thik Jeno Love Story _ Only BGM.mp3',
  'Tor Naam Male.mp3',
  'Thik Jeno Love Story.mp3',
  'Raabta.mp3',
  'Kothin.mp3',
  'Kaise Hua.mp3',
  'o-my-love.mp3',
  'Is This Love.mp3'
];

const pages = Array.from(document.querySelectorAll('main > .page'));
const audio = document.getElementById('player');
const progress = document.getElementById('progress');
const pageCounter = document.getElementById('pageCounter');
const soundButton = document.getElementById('soundToggle');
const musicPill = document.getElementById('musicPill');

let currentTrack = -1;
let musicUnlocked = false;
let isMuted = false;
let currentPageIndex = Math.max(0, pages.findIndex(page => page.classList.contains('active')));
let fadeHandle = null;
let pageTransitionLocked = false;

if (!audio) {
  console.error('Music player element #player was not found.');
} else {
  // Prepare the opening song immediately, but wait for a real user gesture
  // before calling play() because browsers block audible autoplay.
  audio.preload = 'auto';
  audio.loop = true;
  audio.volume = 0.62;
  audio.setAttribute('playsinline', '');
}

function getTrackIndex(page) {
  const value = Number.parseInt(page?.dataset.track ?? '0', 10);
  return Number.isInteger(value) && value >= 0 && value < TRACKS.length ? value : 0;
}

function getTrackUrl(trackName) {
  // Encode spaces and Unicode characters in the exact GitHub asset filename.
  return REPO_RAW + encodeURIComponent(trackName).replace(/%2F/gi, '/');
}

// Preload Tum Se Hi on the first page so it is ready when the visitor interacts.
if (audio) {
  audio.src = getTrackUrl(TRACKS[0]);
  audio.load();
}

function setMusicIndicator(playing) {
  if (musicPill) musicPill.classList.toggle('paused', !playing);
  if (soundButton) {
    soundButton.setAttribute('aria-label', isMuted ? 'Turn music on' : 'Mute music');
    soundButton.innerHTML = isMuted ? '♫ <span>Sound off</span>' : '♫ <span>Sound on</span>';
  }
}

function stopFade() {
  if (fadeHandle !== null) {
    window.clearInterval(fadeHandle);
    fadeHandle = null;
  }
}

function fadeVolume(target, duration = 180) {
  if (!audio) return;
  stopFade();
  const start = audio.volume;
  const steps = 9;
  let step = 0;
  fadeHandle = window.setInterval(() => {
    step += 1;
    audio.volume = start + (target - start) * (step / steps);
    if (step >= steps) {
      stopFade();
      audio.volume = target;
    }
  }, duration / steps);
}

function playCurrentTrack({ forceRestart = false } = {}) {
  if (!audio || isMuted) return;

  const page = pages[currentPageIndex];
  const nextTrack = getTrackIndex(page);

  // Keep one uninterrupted track across consecutive pages assigned the same song.
  if (!forceRestart && nextTrack === currentTrack && !audio.paused) {
    return;
  }

  currentTrack = nextTrack;
  const nextUrl = getTrackUrl(TRACKS[nextTrack]);

  // Reset the source only when the page's assigned song actually changes.
  if (audio.src !== nextUrl) {
    audio.pause();
    audio.src = nextUrl;
    audio.load();
  }

  audio.loop = true;
  audio.volume = 0.62;

  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise
      .then(() => setMusicIndicator(true))
      .catch(error => {
        setMusicIndicator(false);
        console.warn('Could not play track:', TRACKS[nextTrack], error);
      });
  }
}

function unlockMusic() {
  if (musicUnlocked || !audio || isMuted) return;
  musicUnlocked = true;
  // This call happens directly inside the first pointer/key interaction.
  // That user gesture is required by Chrome, Safari, and mobile browsers.
  playCurrentTrack({ forceRestart: false });
}

function updateProgress(index) {
  const total = pages.length || 1;
  const current = index + 1;
  if (progress) {
    progress.style.width = `${(current / total) * 100}%`;
    progress.setAttribute('aria-valuenow', String(current));
    progress.setAttribute('aria-valuemax', String(total));
  }
  if (pageCounter) {
    pageCounter.textContent = `${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  }
}

function showPage(pageId, { userInitiated = true } = {}) {
  const target = document.getElementById(pageId);
  if (!target || !target.classList.contains('page')) return;

  const nextIndex = pages.indexOf(target);
  if (nextIndex < 0) return;

  if (pageTransitionLocked || target === pages[currentPageIndex]) return;
  pageTransitionLocked = true;
  const outgoing = pages[currentPageIndex];
  if (outgoing) outgoing.classList.add('page-leaving');
  target.classList.add('active', 'page-entering');
  currentPageIndex = nextIndex;
  updateProgress(nextIndex);
  window.scrollTo({ top: 0, behavior: 'smooth' });

  window.setTimeout(() => {
    if (outgoing) outgoing.classList.remove('active', 'page-leaving');
    target.classList.remove('page-entering');
    pageTransitionLocked = false;
  }, 820);

  if (userInitiated) unlockMusic();

  if (musicUnlocked && !isMuted) {
    const newTrack = getTrackIndex(target);
    if (newTrack !== currentTrack) playCurrentTrack();
  }
}

// Start the opening background song on the visitor's first interaction.
// Audible autoplay on page load is blocked by modern browsers, so this is the
// earliest reliable browser-approved moment to begin playback.
document.addEventListener('pointerdown', event => {
  if (event.target.closest('#soundToggle')) return;
  unlockMusic();
}, { once: true, passive: true });
document.addEventListener('keydown', unlockMusic, { once: true });

// Reliable page navigation: event delegation also supports controls added later.
// Add a working Previous button to every story page after the opening gallery.
pages.forEach((page, index) => {
  if (index === 0 || page.querySelector('[data-prev]')) return;
  const nav = page.querySelector('.page-nav');
  if (!nav) return;
  const previous = document.createElement('button');
  previous.type = 'button';
  previous.className = 'outline-btn';
  previous.dataset.prev = pages[index - 1].id;
  previous.textContent = '← Previous page';
  nav.prepend(previous);
});

document.addEventListener('click', event => {
  const button = event.target.closest('[data-next], [data-prev]');
  if (!button) return;
  event.preventDefault();
  const destination = button.dataset.next || button.dataset.prev;
  if (destination) showPage(destination, { userInitiated: true });
});

// Mute is allowed; there is deliberately no song-selection control.
if (soundButton) {
  soundButton.addEventListener('click', event => {
    event.stopPropagation();
    // The first click starts music; subsequent clicks toggle mute.
    if (!musicUnlocked || isMuted) {
      isMuted = false;
      musicUnlocked = true;
      playCurrentTrack({ forceRestart: false });
      return;
    }

    isMuted = true;
    stopFade();
    audio?.pause();
    setMusicIndicator(false);
  });
}

// Keep an explicit opening-page play button as a reliable fallback. The first
// tap starts Tum Se Hi; it does not restart an already-playing track.
const openingMusicButton = document.getElementById('playOpeningMusic');
if (openingMusicButton) {
  openingMusicButton.addEventListener('click', event => {
    event.stopPropagation();
    isMuted = false;
    musicUnlocked = true;
    openingMusicButton.textContent = 'Starting Tum Se Hi…';
    playCurrentTrack({ forceRestart: false });
  });
}

if (audio) {
  audio.addEventListener('play', () => setMusicIndicator(true));
  audio.addEventListener('pause', () => setMusicIndicator(false));
  audio.addEventListener('ended', () => {
    // Native loop is enabled; this is a defensive fallback.
    if (!isMuted && musicUnlocked) {
      audio.currentTime = 0;
      audio.play().catch(() => setMusicIndicator(false));
    }
  });
  audio.addEventListener('error', () => {
    setMusicIndicator(false);
    const failed = TRACKS[currentTrack < 0 ? 0 : currentTrack] || 'unknown track';
    if (openingMusicButton && currentPageIndex === 0) {
      openingMusicButton.textContent = 'Retry Tum Se Hi ♫';
    }
    console.error('Audio failed to load. Check GitHub filename/path:', failed, audio.error);
  });
}

// Header wordmark also returns to the opening page.
document.querySelector('.wordmark')?.addEventListener('click', event => {
  event.preventDefault();
  showPage('page1', { userInitiated: true });
});

// Restart returns to the first remaining page without exposing song controls.
const restartButton = document.getElementById('restart');
if (restartButton) {
  restartButton.addEventListener('click', () => {
    showPage('page1', { userInitiated: true });
  });
}

// Photo lightbox.
document.querySelectorAll('[data-photo]').forEach(button => {
  button.addEventListener('click', () => {
    const number = String(button.dataset.photo).padStart(2, '0');
    const image = document.getElementById('lightboxImage');
    const lightbox = document.getElementById('lightbox');
    if (image && lightbox) {
      image.src = `images/shilu/photo-${number}.jpg`;
      lightbox.classList.add('open');
    }
  });
});

function closeLightbox() {
  document.getElementById('lightbox')?.classList.remove('open');
}

document.getElementById('closeLightbox')?.addEventListener('click', closeLightbox);
document.getElementById('lightbox')?.addEventListener('click', event => {
  if (event.target?.id === 'lightbox') closeLightbox();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeLightbox();
});

// No story photos, flowers, or falling-petal decorations are added to the background.

// Initialize the visible page state and counter.
updateProgress(currentPageIndex);
setMusicIndicator(false);
