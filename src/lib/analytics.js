// GoatCounter page views, plus click events on links marked data-goatcounter-click (count.js binds them).
// Only the live domain loads it, so localhost, the build's PDF print and Netlify branch previews send
// nothing. ?nocount skips this one visit; #toggle-goatcounter turns counting off in a browser for good.
if (location.hostname === 'edimaessien.dev' && !new URLSearchParams(location.search).has('nocount')){
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = 'https://edimaessien.goatcounter.com/count';
  document.head.append(s);
}
