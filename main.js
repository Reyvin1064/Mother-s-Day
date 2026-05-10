(() => {
  // Music Control
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const musicStatus = document.getElementById('musicStatus');

  if (musicToggle && bgMusic) {
    // Show iOS hint because iOS requires a user gesture to start audio
    const isiOS = () => {
      return /iP(hone|od|ad)/.test(navigator.platform) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
    };

    if (isiOS() && musicStatus) {
      musicStatus.textContent = 'Tap Play — iOS requires a user gesture to start audio';
    }

    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play();
        musicToggle.textContent = '⏸ Pause Music';
        musicStatus.textContent = '🎵 Now playing...';
      } else {
        bgMusic.pause();
        musicToggle.textContent = '▶ Play Music';
        musicStatus.textContent = '';
      }
    });

    bgMusic.addEventListener('ended', () => {
      // Music will loop, but just in case
      bgMusic.currentTime = 0;
      bgMusic.play();
    });
  }

  // Photo Rotation Logic
  const memoryPhotos = Array.from(document.querySelectorAll(".bg-memories .memory-photo"));
  const photosPerBatch = 4;
  const slideEveryMs = 5500;
  const exitAnimationMs = 650;
  const slotClasses = ["slot-1", "slot-2", "slot-3", "slot-4"];

  let currentStartIndex = 0;
  let intervalId = null;

  if (memoryPhotos.length === 0) {
    return;
  }

  function applyOrientationClass(photo) {
    const image = photo.querySelector("img");

    if (!image) {
      return;
    }

    const updateOrientation = () => {
      photo.classList.toggle("is-landscape", image.naturalWidth > image.naturalHeight);
      photo.classList.toggle("is-portrait", image.naturalHeight >= image.naturalWidth);
    };

    if (image.complete) {
      updateOrientation();
      return;
    }

    image.addEventListener("load", updateOrientation, { once: true });
  }

  memoryPhotos.forEach(applyOrientationClass);

  function getBatch(startIndex) {
    return Array.from({ length: Math.min(photosPerBatch, memoryPhotos.length) }, (_, index) => {
      const photoIndex = (startIndex + index) % memoryPhotos.length;
      return memoryPhotos[photoIndex];
    });
  }

  function clearPhotoState(photo) {
    photo.classList.remove("is-visible", "is-exiting", ...slotClasses);
  }

  function showBatch(startIndex) {
    const nextBatch = getBatch(startIndex);

    memoryPhotos.forEach(clearPhotoState);

    nextBatch.forEach((photo, index) => {
      photo.classList.add(slotClasses[index]);
    });

    requestAnimationFrame(() => {
      nextBatch.forEach((photo) => photo.classList.add("is-visible"));
    });
  }

  function slideToNextBatch() {
    const currentBatch = getBatch(currentStartIndex);
    const nextStartIndex = (currentStartIndex + photosPerBatch) % memoryPhotos.length;

    currentBatch.forEach((photo) => {
      photo.classList.remove("is-visible");
      photo.classList.add("is-exiting");
    });

    window.setTimeout(() => {
      currentBatch.forEach(clearPhotoState);

      const nextBatch = getBatch(nextStartIndex);
      nextBatch.forEach((photo, index) => {
        photo.classList.add(slotClasses[index]);
      });

      requestAnimationFrame(() => {
        nextBatch.forEach((photo) => photo.classList.add("is-visible"));
      });

      currentStartIndex = nextStartIndex;
    }, exitAnimationMs);
  }

  function startRotation() {
    if (memoryPhotos.length <= photosPerBatch || intervalId !== null) {
      return;
    }

    intervalId = window.setInterval(slideToNextBatch, slideEveryMs);
  }

  function stopRotation() {
    if (intervalId === null) {
      return;
    }

    window.clearInterval(intervalId);
    intervalId = null;
  }

  showBatch(currentStartIndex);
  startRotation();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRotation();
      return;
    }

    startRotation();
  });
})();
