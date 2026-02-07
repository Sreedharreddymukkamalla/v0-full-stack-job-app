type WeatherProps = {
  temperature: number;
  weather: string;
  location: string;
};

export const Weather = ({ temperature, weather, location }: WeatherProps) => {
  return (
    <div className="p-3 border rounded bg-white shadow-sm">
      <h3 className="text-lg font-semibold">Current Weather for {location}</h3>
      <p>Condition: {weather}</p>
      <p>Temperature: {temperature}°F</p>
    </div>
  );
};

export default Weather;
