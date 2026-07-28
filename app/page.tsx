export const metadata = {
  title: "Weekly Accomplishment Report Monitor",
  description: "Online itinerary and accomplishment reporting app for staff monitoring.",
};

export default function Home() {
  return (
    <main className="app-shell">
      <iframe
        title="Weekly Accomplishment Report Monitor"
        src="/weekly-app/index.html"
        className="app-frame"
      />
    </main>
  );
}
