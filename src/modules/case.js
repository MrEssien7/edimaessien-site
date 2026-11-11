/* ---------- Data Source Assessment: a click anywhere on the card opens or closes its case panel ---------- */
// "Read the case" (the <details> summary) is the keyboard and screen reader control; this only widens the click target.
export function initCase(){
  document.querySelectorAll('.card.case').forEach(card => {
    const details = card.querySelector('.case-more');
    if (!details) return;
    card.addEventListener('click', e => {
      if (e.target.closest('summary, .case-panel, a, button')) return;
      details.open = !details.open;
    });
    details.addEventListener('keydown', e => { if (e.key === 'Escape' && details.open){ details.open = false; details.querySelector('summary').focus(); } });
  });
}
