/**************************************************************
 * MK JEWELS
 * EA DELEGATION
 * SERVICE WORKER
 **************************************************************/


const CACHE_NAME =
  "ea-delegation-v2";


const APP_FILES = [

  "./",

  "./index.html",

  "./manifest.json"

];



/**************************************************************
 * INSTALL
 **************************************************************/

self.addEventListener(

  "install",

  event => {

    event.waitUntil(

      caches
        .open(CACHE_NAME)

        .then(cache => {

          return cache.addAll(
            APP_FILES
          );

        })

        .catch(error => {

          console.log(
            "Cache install error:",
            error
          );

        })

    );


    self.skipWaiting();

  }

);



/**************************************************************
 * ACTIVATE
 **************************************************************/

self.addEventListener(

  "activate",

  event => {

    event.waitUntil(

      caches
        .keys()

        .then(cacheNames => {

          return Promise.all(

            cacheNames.map(

              cacheName => {

                if (
                  cacheName !==
                  CACHE_NAME
                ) {

                  return caches.delete(
                    cacheName
                  );

                }

              }

            )

          );

        })

    );


    self.clients.claim();

  }

);



/**************************************************************
 * FETCH
 **************************************************************/

self.addEventListener(

  "fetch",

  event => {


    /*
     * Only handle GET requests.
     */

    if (
      event.request.method !== "GET"
    ) {

      return;

    }



    /*
     * Do NOT interfere with external
     * Google Apps Script requests.
     */

    const requestUrl =
      new URL(
        event.request.url
      );


    if (
      requestUrl.origin !==
      self.location.origin
    ) {

      return;

    }



    /*
     * Network first.
     *
     * If GitHub/network is unavailable,
     * use cached version.
     */

    event.respondWith(

      fetch(
        event.request
      )

      .then(response => {


        if (
          !response ||
          response.status !== 200
        ) {

          return response;

        }


        const responseCopy =
          response.clone();


        caches
          .open(CACHE_NAME)

          .then(cache => {

            cache.put(
              event.request,
              responseCopy
            );

          });


        return response;

      })

      .catch(() => {

        return caches.match(
          event.request
        );

      })

    );

  }

);
