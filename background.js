chrome.runtime.onInstalled.addListener(async () => {
   addTabsToGroup(await chrome.tabs.query({}));
});

chrome.tabs.onCreated.addListener((tab) => {
   addTabsToGroup([tab]);
});

chrome.tabs.onUpdated.addListener((tabId, { url }, tab) => {
   if (url) {
      addTabsToGroup([tab]);
   }
});

async function addTabsToGroup(tabs) {
   const hosts = await getHosts();

   tabs.reduce(async (groups, tab) => {
      return await addTabToGroup(tab, await groups, hosts);
   }, chrome.tabGroups.query({}));
}

async function addTabToGroup(tab, groups, hosts) {
   if (!tab.url) {
      return groups;
   }

   const { hostname } = new URL(tab.url);

   if (!hosts.has(hostname)) {
      return groups;
   }

   const group = groups.find(({ title }) => title === hostname);

   if (!group) {
      const groupId = await chrome.tabs.group({ tabIds: [tab.id] });
      await chrome.tabGroups.update(groupId, { title: hostname });
      return chrome.tabGroups.query({});
   }

   if (tab.groupId !== group.id) {
      await chrome.tabs.group({
         tabIds: [tab.id],
         groupId: group.id
      });
   }

   return groups;
}

async function getHosts() {
   return new Promise((resolve) => {
      chrome.storage.sync.get('hostnames', ({ hostnames }) => {
         resolve(new Set(hostnames || []));
      });
   });
}
