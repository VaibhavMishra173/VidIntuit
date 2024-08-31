let lastActiveTabId = null;

// Helper function to check if a URL matches any stored URL, considering wildcards
function matchesUrl(url, storedUrls) {
  return storedUrls.some(storedUrl => {
    if (storedUrl.endsWith('***')) {
      const baseUrl = storedUrl.slice(0, -3); // Remove '***'
      return url.startsWith(baseUrl);
    }
    return url === storedUrl;
  });
}

async function pauseVideosInTab(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => video.pause());
      },
    });
    console.log(`Paused videos in tab ${tabId}`);
  } catch (error) {
    console.error(`Failed to pause videos in tab ${tabId}:`, error);
  }
}

async function playVideosInTab(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => video.play());
      },
    });
    console.log(`Played videos in tab ${tabId}`);
  } catch (error) {
    console.error(`Failed to play videos in tab ${tabId}:`, error);
  }
}

function isWebPage(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

async function handleTabSwitch(activeInfo) {
  const { urls } = await chrome.storage.sync.get('urls');
  const tab = await chrome.tabs.get(activeInfo.tabId);

  if (lastActiveTabId && lastActiveTabId !== activeInfo.tabId) {
    await pauseVideosInTab(lastActiveTabId);
  }

  if (isWebPage(tab.url) && matchesUrl(tab.url, urls)) {
    await playVideosInTab(activeInfo.tabId);
    lastActiveTabId = activeInfo.tabId;
  } else {
    lastActiveTabId = null;
  }
}

chrome.tabs.onActivated.addListener(handleTabSwitch);

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tabId === lastActiveTabId) {
    const { urls } = await chrome.storage.sync.get('urls');
    if (isWebPage(tab.url) && matchesUrl(tab.url, urls)) {
      await playVideosInTab(tabId);
    }
  }
});

console.log('Extension loaded and running');
