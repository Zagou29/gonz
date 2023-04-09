export const fetchJSON = async (url, options = {}) => {
  const headers = { Accept: "application/json", ...options.headers };
  const r = await fetch(url, { ...options, headers });
  if (!r.ok) throw new Error("Erreur serveur", { cause: r });
  return r.json();
};
