/**
 * Work around Safari 14 IndexedDB open bug.
 *
 * Safari has a horrible bug where IDB requests can hang while the browser is starting up. https://bugs.webkit.org/show_bug.cgi?id=226547
 * The only solution is to keep nudging it until it's awake.
 */
export default function idbReady(): Promise<void> {
  const isSafari =
    !navigator.userAgentData &&
    /Safari\//.test(navigator.userAgent) &&
    !/Chrom(e|ium)\//.test(navigator.userAgent);

  // No point putting other browsers or older versions of Safari through this mess.
  if (!isSafari || !indexedDB.databases) return Promise.resolve();

  let intervalId: number;

  const promise = new Promise<void>((resolve) => {
    const resolver = () => resolve();
    const tryIdb = () => indexedDB.databases().then(resolver).catch(resolver);
    intervalId = setInterval(tryIdb, 100);
    tryIdb();
  });

  const ci = () => clearInterval(intervalId);
  return promise.then(ci).catch(ci);
}
