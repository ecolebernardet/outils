const CACHE_NAME = 'speed-dial-v2.9';
const ASSETS = [
  './',
  './index.html',
  './script.js',
  './manifest.json'
];

// --- PARTIE PWA : Gestion du cache ---
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  // On ne met en cache que les requêtes locales (pas les images externes Google etc.)
  if (e.request.url.startsWith(self.location.origin)) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }
});

// --- PARTIE EXTENSION : Anti-doublon (PC uniquement) ---
// On vérifie si l'API 'chrome' ou 'browser' est disponible pour éviter les erreurs sur mobile
if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.onCreated.addListener(async (tab) => {
        try {
            const allTabs = await chrome.tabs.query({ currentWindow: true });
            const extensionUrl = chrome.runtime.getURL("index.html");

            if (tab.url === extensionUrl || tab.pendingUrl === extensionUrl) {
                const duplicateTab = allTabs.find(t => 
                    t.id !== tab.id && 
                    (t.url === extensionUrl || t.url === "about:newtab" || t.pendingUrl === extensionUrl)
                );
                
                if (duplicateTab) {
                    chrome.tabs.remove(tab.id);
                    // Optionnel : on remet le focus sur l'onglet déjà existant
                    chrome.tabs.update(duplicateTab.id, { active: true });
                }
            }
        } catch (e) {
            console.error("Erreur anti-doublon extension:", e);
        }
    });
}