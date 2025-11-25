const { ipcRenderer } = require('electron');

const urlInput = document.getElementById('urlInput');
const goBtn = document.getElementById('goBtn');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const refreshBtn = document.getElementById('refreshBtn');
const homeBtn = document.getElementById('homeBtn');
const welcomeScreen = document.getElementById('welcomeScreen');

let isOnHomePage = true;

function normalizeUrl(url) {
  url = url.trim();
  if (!url) return '';
  
  // If it doesn't have a protocol, add https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  return url;
}

function loadUrl(url) {
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl) return;
  
  urlInput.value = normalizedUrl;
  welcomeScreen.style.display = 'none';
  isOnHomePage = false;
  
  ipcRenderer.send('load-url', normalizedUrl);
}

function goHome() {
  welcomeScreen.style.display = 'flex';
  urlInput.value = '';
  isOnHomePage = true;
  ipcRenderer.send('go-home');
}

// Event listeners
goBtn.addEventListener('click', () => {
  loadUrl(urlInput.value);
});

urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    loadUrl(urlInput.value);
  }
});

backBtn.addEventListener('click', () => {
  ipcRenderer.send('go-back');
});

forwardBtn.addEventListener('click', () => {
  ipcRenderer.send('go-forward');
});

refreshBtn.addEventListener('click', () => {
  ipcRenderer.send('refresh');
});

homeBtn.addEventListener('click', goHome);

// Listen for URL changes from main process
ipcRenderer.on('url-changed', (event, url) => {
  if (!isOnHomePage) {
    urlInput.value = url;
  }
});

// Search functionality
const searchInput = document.getElementById('searchInput');

function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;
  
  // Check if it's a URL
  if (query.includes('.') && !query.includes(' ')) {
    loadUrl(query);
  } else {
    // Use Ghost custom search page
    const searchPath = require('path').join(__dirname, 'search.html');
    ipcRenderer.send('load-search', searchPath, query);
    welcomeScreen.style.display = 'none';
    isOnHomePage = false;
  }
}

function feelingLucky() {
  const query = searchInput.value.trim();
  if (!query) {
    loadUrl('https://www.duckduckgo.com');
    return;
  }
  
  // DuckDuckGo's "I'm Feeling Ducky"
  loadUrl('https://duckduckgo.com/?q=!' + encodeURIComponent(query));
}

// Enter key on search box
if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
}
