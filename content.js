function pauseAllVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    if (!video.paused) {
      video.pause();
    }
  });
  console.log(`Paused ${videos.length} video(s)`);
}

function handleMessage(request, sender, sendResponse) {
  console.log('Received message:', request);

  if (request.action === 'pause') {
    pauseAllVideos();
    sendResponse({status: 'Videos paused'});
  } else if (request.action === 'checkForVideos') {
    const hasVideos = document.querySelectorAll('video').length > 0;
    sendResponse({ hasVideos });
  }

  // This line is crucial for asynchronous response
  return true;
}

chrome.runtime.onMessage.addListener(handleMessage);

console.log('VidIntuit content script loaded');