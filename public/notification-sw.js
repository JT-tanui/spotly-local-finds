
// Notification Service Worker
// This service worker handles push notifications and notification clicks

self.addEventListener('install', (event) => {
  console.log('Notification Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Notification Service Worker activated');
  return self.clients.claim();
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event.notification.tag);
  
  // Close the notification
  event.notification.close();
  
  // Handle different notification actions
  if (event.action === 'reply') {
    // The user clicked on the reply action
    const messageData = event.notification.data;
    
    // Get all windows clients
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clients) => {
      // If we have an open window, focus it and post a message to it
      if (clients.length > 0) {
        clients[0].focus();
        clients[0].postMessage({
          type: 'reply-action',
          data: messageData
        });
      } else {
        // Open a new window to the inbox page
        self.clients.openWindow('/inbox').then((windowClient) => {
          // Wait for the window to load and then post a message
          setTimeout(() => {
            if (windowClient) {
              windowClient.postMessage({
                type: 'reply-action',
                data: messageData
              });
            }
          }, 1000);
        });
      }
    });
  } else if (event.action === 'view') {
    // The user clicked on the view action or the notification itself
    const notificationData = event.notification.data || {};
    let url = '/';
    
    // Determine which page to open based on notification type
    if (notificationData.type === 'message') {
      url = '/inbox';
    } else if (notificationData.type === 'event') {
      url = `/events?id=${notificationData.eventId}`;
    }
    
    // Get all clients
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clients) => {
      // If we have an open window, focus it and navigate
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      
      // If no window is open, open a new one
      self.clients.openWindow(url);
    });
  } else {
    // The user clicked the main notification body
    // Open the inbox or the relevant page
    const notificationData = event.notification.data || {};
    let url = '/';
    
    if (notificationData.type === 'message') {
      url = '/inbox';
    } else if (notificationData.type === 'event') {
      url = `/events`;
    }
    
    self.clients.openWindow(url);
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: data.badge,
        tag: data.tag,
        data: data.data,
        actions: data.actions,
        requireInteraction: data.requireInteraction
      })
    );
  } catch (error) {
    console.error('Error showing push notification:', error);
  }
});
