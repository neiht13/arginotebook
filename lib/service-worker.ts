export function registerServiceWorker() {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered successfully:", registration.scope)
  
            // Check if there's a waiting service worker
            if (registration.waiting) {
              // New service worker is waiting to activate
              notifyUserAboutUpdate(registration)
            }
  
            // Listen for new service workers
            registration.addEventListener("updatefound", () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener("statechange", () => {
                  if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                    // New service worker is installed but waiting
                    notifyUserAboutUpdate(registration)
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error)
          })
  
        // Listen for controller change to refresh the page
        let refreshing = false
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true
            window.location.reload()
          }
        })
      })
    }
  }
  
  // Function to notify user about service worker update
  function notifyUserAboutUpdate(registration: ServiceWorkerRegistration) {
    // You could show a toast or notification here
    console.log("New version available! Ready to update.")
  
    // For simplicity, we'll automatically update
    if (registration.waiting) {
      // Send message to service worker to skip waiting
      registration.waiting.postMessage({ type: "SKIP_WAITING" })
    }
  }
  
  