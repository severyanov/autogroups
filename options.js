const textarea = document.getElementById('hostnames');

document.getElementById('save').addEventListener('click', () => {
   const hostnames = textarea.value.split('\n').filter(s => s);
   chrome.storage.sync.set({ hostnames });
});

chrome.storage.sync.get('hostnames', ({ hostnames }) => {
   if (hostnames) {
      textarea.value = hostnames.join('\n');
   }
});
