const FPL_API = "https://fantasy.premierleague.com/api";

export async function getBootstrapStatic() {
  const response = await fetch(`${FPL_API}/bootstrap-static/`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FPL API Error ${response.status}`);
  }

  return response.json();
}