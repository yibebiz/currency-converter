if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("sw.js")
      .then((swRegistrationObject) =>{
        if (!navigator.serviceWorker.controller) {
          //This page is not controlled by this service worker, hence do nothing, just return
          return;
        }
        //Add event listner to listen to change to sw
        var refreshing;
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          function() {
            if (refreshing) return;
            window.location.reload();
            refreshing = true;
          }
        );

        if (swRegistrationObject.waiting) {
          //TODO:Implement the metod showToastMessage to show toast message to the user
          showToastMessage(swRegistrationObject.waiting);
          return;
        }
        if (swRegistrationObject.installing) {
          //Installation is inprogress. We need to track changes and notify user when the sw is in 'installed' state.
          trackInstalling(swRegistrationObject.installing);

          return;
        }
        swRegistrationObject.addEventListener("updatefound", function() {
          trackInstalling(swRegistrationObject.installing);
        });
      })

      .catch(function(error) {
        // registration failed
        console.log("Registration failed with " + error);
      });
  });
}

function trackInstalling(worker) {
  console.log("Status of the Worker is: ", worker.status);
  worker.addEventListener("statechange", function() {
    if (worker.state === "installed") showToastMessage(worker);
  });
}

function showToastMessage(worker) {
  //"TODO: In real apps, show toast message
  worker.postMessage({ action: "skipWaiting" });
}
