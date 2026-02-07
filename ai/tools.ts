import { tool as createTool } from 'ai';
import { z } from 'zod';

export const weatherTool = createTool({
  description: 'Display the weather for a location',
  inputSchema: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async function ({ location }: { location: string }) {
    // Simulate an async fetch
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const weatherOptions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Windy'];
    const temperature = Math.floor(Math.random() * 20) + 50;
    return { weather: weatherOptions[Math.floor(Math.random() * weatherOptions.length)], temperature, location };
  },
});

export const tools = {
  displayWeather: weatherTool,
};
