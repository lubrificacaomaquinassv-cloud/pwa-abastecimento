/**
 * Supabase — sync direto na tabela posto (view abastecimentos.abastecimentos).
 * NAO definir APP_API_BASE_URL como URL do Supabase (nao existe /lancamentos).
 */
window.SUPABASE_URL = "https://azhpxhrwhegfysoeqmft.supabase.co";
window.SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6aHB4aHJ3aGVnZnlzb2VxbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2NzUxODcsImV4cCI6MjA5NDI1MTE4N30.iQU1T1NLaGIQyqScLS6qNaoo1QWcI8Mh-jjN52TU5to";

(function () {
  try {
    var fromLs = localStorage.getItem("APP_API_BASE_URL");
    if (fromLs && String(fromLs).trim()) {
      var url = String(fromLs).trim().replace(/\/$/, "");
      if (url.indexOf("supabase.co") === -1) {
        window.APP_API_BASE_URL = url;
      }
      return;
    }
  } catch (e) {
    /* localStorage indisponivel */
  }
  window.APP_API_BASE_URL = "";
})();

window.SHEETS_SYNC_SECRET = "";
