import { redis } from "@/lib/redis";
import { getDate } from "@/utils";
import { parse } from "date-fns";

type AnalyticsArgs = {
  retention?: number;
};

type TrackArgs = {
  persist?: boolean;
};

export class Analytics {
  private retention: number = 60 * 60 * 24 * 7;

  constructor(options?: AnalyticsArgs) {
    if (options?.retention) this.retention = options.retention;
  }

  async track(namaspace: string, event: object = {}, options?: TrackArgs) {
    let key = `analytics::${namaspace}`;

    if (!options?.persist) {
      key += `::${getDate()}`;
    }
    await redis.hincrby(key, JSON.stringify(event), 1);
    if (!options?.persist) {
      await redis.expire(key, this.retention);
    }
  }

  async retrieve(namaspace: string, date: string) {
    const res = await redis.hgetall<Record<string, string>>(
      `analytics::${namaspace}::${date}`
    );

    return {
      date,
      events: Object.entries(res ?? []).map(([key, value]) => ({
        [key]: Number(value),
      })),
    };
  }

  async retrieveDays(namespace: string, nDays: number) {
    type AnalyticsPromisesArgs = ReturnType<typeof analytics.retrieve>;
    const promises: AnalyticsPromisesArgs[] = [];

    for (let i = 0; i < nDays; i++) {
      const formattedDate = getDate(i);
      const promise = analytics.retrieve(namespace, formattedDate);
      promises.push(promise);
    }

    const fetched = await Promise.all(promises);

    const data = fetched.sort((a, b) => {
      if (
        parse(a.date, "dd/MM/yyyy", new Date()) >
        parse(b.date, "dd/MM/yyyy", new Date())
      ) {
        return 1;
      } else {
        return -1;
      }
    });

    return data;
  }
}

export const analytics = new Analytics();
