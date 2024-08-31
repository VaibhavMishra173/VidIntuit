document.addEventListener('DOMContentLoaded', () => {
  const urlInput = document.getElementById('urlInput');
  const addButton = document.getElementById('addUrl');
  const urlList = document.getElementById('urlList');

  function addUrlToList(url) {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between bg-white p-3 rounded shadow';

    li.innerHTML = `
      <span class="truncate mr-2 flex-grow">${url}</span>
      <button class="edit-url text-yellow-500 hover:text-yellow-600 mr-2">
        <i class="fas fa-edit"></i>
      </button>
      <button class="delete-url bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;

    li.querySelector('.delete-url').addEventListener('click', () => {
      chrome.storage.sync.get('urls', (data) => {
        const urls = data.urls.filter(u => u !== url);
        chrome.storage.sync.set({ urls }, () => {
          li.remove();
        });
      });
    });

    li.querySelector('.edit-url').addEventListener('click', () => {
      urlInput.value = url;
      addButton.textContent = 'Update URL';
      addButton.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
      addButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
      addButton.dataset.editing = url; // Store the URL being edited
    });

    urlList.appendChild(li);
  }

  chrome.storage.sync.get('urls', (data) => {
    if (data.urls) {
      data.urls.forEach(addUrlToList);
    }
  });

  addButton.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
      chrome.storage.sync.get('urls', (data) => {
        const urls = data.urls || [];
        const editingUrl = addButton.dataset.editing;
        if (editingUrl) {
          const index = urls.indexOf(editingUrl);
          if (index !== -1) {
            urls[index] = url;
          }
        } else {
          if (!urls.includes(url)) {
            urls.push(url);
          } else {
            alert('This URL already exists in the list.');
            return;
          }
        }
        chrome.storage.sync.set({ urls }, () => {
          if (editingUrl) {
            const existingLi = Array.from(urlList.children).find(li => li.textContent.includes(editingUrl));
            existingLi.querySelector('span').textContent = url;
            addButton.textContent = 'Add URL';
            addButton.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
            addButton.classList.add('bg-blue-500', 'hover:bg-blue-600');
            delete addButton.dataset.editing;
          } else {
            addUrlToList(url);
          }
          urlInput.value = '';
        });
      });
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    urlInput.value = activeTab.url;
  });
});
