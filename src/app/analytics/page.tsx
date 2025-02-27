import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { getDate } from "@/utils";
import { analytics } from "@/utils/analytics";

const page = async () => {
  const TRACKING_DAYS = 7;

  const pageviews = await analytics.retrieveDays("pageview", TRACKING_DAYS);
//   const pageviews = await analytics.retrieveDays("export", TRACKING_DAYS);

  const totalPageViews = pageviews.reduce((acc, curr) => {
    return (
      acc +
      curr.events.reduce((acc, curr) => {
        return acc + Object.values(curr)[0]!;
      }, 0)
    );
  }, 0);

  const avgVisitorsPerDay = (totalPageViews / TRACKING_DAYS).toFixed(1);

  const amtVisitorsToday = pageviews
    .filter((ev) => ev.date === getDate())
    .reduce((acc, curr) => {
      return (
        acc +
        curr.events.reduce((acc, curr) => {
          return acc + Object.values(curr)[0]!;
        }, 0)
      );
    }, 0);

  return (
    <div className="min-h-screen w-full py-12 flex justify-center items-center">
      <div className="relative w-full max-w-6xl mx-auto text-white">
        <AnalyticsDashboard avgVisitorsPerDay={avgVisitorsPerDay} amtVisitorsToday={amtVisitorsToday} timeSeriesPageViews={pageviews}/>
      </div>
    </div>
  );
};

export default page;
