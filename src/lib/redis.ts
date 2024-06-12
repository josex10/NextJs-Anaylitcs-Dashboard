import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: 'https://worthy-ocelot-48390.upstash.io',
  token: process.env.REDIS_KEY!,
});