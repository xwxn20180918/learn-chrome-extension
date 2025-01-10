(function () {
            (async () => {
                  await import(
                    chrome.runtime.getURL("assets/content-1U-a6k-K.js")
                  );
                })().catch(console.error);
            })();