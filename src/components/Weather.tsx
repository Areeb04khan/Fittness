import { useEffect, useState } from "react";
import { WEATHER_LOCATION, HOT_DAY_TEMP_C } from "@/lib/plan-data";
import { Droplets, Sun } from "lucide-react";

type WeatherData = { temp: number; code: number; description: string };

const CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Fog",
  51: "Light drizzle",
  61: "Rain",
  63: "Moderate rain",
  65: "Heavy rain",
  80: "Rain showers",
  95: "Thunderstorm",
};

export function Weather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LOCATION.latitude}&longitude=${WEATHER_LOCATION.longitude}&current=temperature_2m,weather_code`;
    fetch(url)
      .then(r => r.json())
      .then(j => {
        const c = j.current;
        setData({ temp: c.temperature_2m, code: c.weather_code, description: CODES[c.weather_code] ?? "Unknown" });
      })
      .catch(() => setError("Weather unavailable"));
  }, []);

  if (error) return <div className="text-sm text-muted-foreground">{error}</div>;
  if (!data) return <div className="text-sm text-muted-foreground">Loading weather…</div>;

  const isHot = data.temp >= HOT_DAY_TEMP_C;

  return (
    <div className="flex items-center gap-3">
      <Sun className="h-6 w-6 text-ember" />
      <div>
        <div className="text-2xl font-display leading-none">{Math.round(data.temp)}°C</div>
        <div className="text-xs text-muted-foreground">{WEATHER_LOCATION.name} · {data.description}</div>
      </div>
      {isHot && (
        <div className="ml-auto flex items-center gap-1.5 rounded-full bg-ember/20 border border-ember/40 px-3 py-1.5 text-xs text-ember">
          <Droplets className="h-3.5 w-3.5" />
          Drink extra water today
        </div>
      )}
    </div>
  );
}
