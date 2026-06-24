/* ============================================================
   BLOG SOURCE — choose where posts come from
   ------------------------------------------------------------
   OPTION 1 (recommended): Google Sheet
     Paste your Apps Script Web App link (ends in /exec) below.
     See google-sheet-blog-guide.md for the 1-time setup.
       window.SHEET_API = "https://script.google.com/macros/s/XXXX/exec";

   OPTION 2: WordPress.com blog
     Paste your blog address, e.g.  jaingroupblog.wordpress.com
       window.WP_SITE = "jaingroupblog.wordpress.com";

   Leave BOTH empty ("") to use the built-in posts in blog-data.js.
   If Sheet is set it is used first; then WordPress; then built-in.
   New posts always appear above the built-in ones.
   ============================================================ */
window.SHEET_API = "https://script.google.com/macros/s/AKfycbwqxgYKy3V_poTa_FNfI4PdrhWU3sXKHy_PVLTHM0P-38Gwq8zy73oMt7UPMh6SIqAzKg/exec";
window.WP_SITE   = "";
