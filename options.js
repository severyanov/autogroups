const container = document.getElementById('groups');
const template = document.getElementById('groupTemplate');

document.getElementById('add').addEventListener('click', (e) => {
   e.preventDefault();
   const el = createSection(container);
   el.querySelector('.group-name__value').focus();
});

document.getElementById('save').addEventListener('click', () => {
   const settings = {
      rules: getRules()
   };
   chrome.storage.sync.set({ settings: JSON.stringify(settings) });
});

function createSection(parent) {
   const el = template.cloneNode(true);
   el.querySelector('.group-name__delete').addEventListener('click', () => {
      el.remove();
   });
   el.removeAttribute('id');
   parent.appendChild(el);
   return el;
}

function renderRules(rules) {
   const fragment = document.createDocumentFragment();

   for (const { name, sites } of rules) {
      const el = createSection(fragment);
      el.querySelector('.group-name__value').value = name;
      el.querySelector('.group-sites__value').value = sites.join('\n');
   }

   container.innerHTML = '';
   container.appendChild(fragment);
}

function getRules() {
   let el = container.firstElementChild;
   const rules = [];

   while (el) {
      const name = el.querySelector('.group-name__value').value.trim();

      if (!name) {
         continue;
      }

      const sites = el.querySelector('.group-sites__value').value
         .split('\n')
         .filter(s => s)
         .map(s => s.trim());

      if (!sites.length) {
         continue;
      }

      rules.push({ name, sites });
      el = el.nextElementSibling;
   }

   return rules;
}

chrome.storage.sync.get('settings', ({ settings }) => {
   let rules;

   try {
      rules = JSON.parse(settings).rules;
   } catch (error) {
      rules = [];
   }

   renderRules(rules);
});
