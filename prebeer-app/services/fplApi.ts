const FPL_API = "https://fantasy.premierleague.com/api";

export async function getBootstrapData() {
  const response = await fetch(`${FPL_API}/bootstrap-static/`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`FPL API Error: ${response.status}`);
  }

  return response.json();
}

export async function getGameweekLive(gameweekId: number) {
  const response = await fetch(
    `${FPL_API}/event/${gameweekId}/live/`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`FPL API Error ${response.status}`);
  }

  return response.json();
}