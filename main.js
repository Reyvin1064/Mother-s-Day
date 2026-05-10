(() => {
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
