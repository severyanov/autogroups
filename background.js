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
   const rules = await getRules();
   const groups = new Map(
      (await chrome.tabGroups.query({}))
         .map(({ id, title }) => [title, id])
   );

   tabs.reduce(
      async (groups, tab) => await addTabToGroup(tab, await groups, rules),
      groups
   );
}

async function addTabToGroup(tab, groups, rules) {
   if (!tab.url) {
      return groups;
   }

   const { hostname } = new URL(tab.url);
   const title = getGroupTitle(hostname, rules);

   if (!title) {
      return groups;
   }

   const groupId = groups.get(title);

   if (!groupId) {
      const newGroupId = await chrome.tabs.group({ tabIds: [tab.id] });
      await chrome.tabGroups.update(newGroupId, { title });
      groups.set(title, newGroupId);
   } else if (tab.groupId !== groupId) {
      await chrome.tabs.group({ tabIds: [tab.id], groupId });
   }

   return groups;
}

async function getRules() {
   return new Promise((resolve) => {
      chrome.storage.sync.get('settings', ({ settings }) => {
         try {
            resolve(JSON.parse(settings)?.rules || []);
         } catch {
            resolve([]);
         }
      });
   });
}

function getGroupTitle(hostname, rules) {
   const rule = rules.find(({ sites }) => sites.includes(hostname));
   return rule?.name;
}
