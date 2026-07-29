import Link from "next/link";
import { notFound } from "next/navigation";
import { getJourney, journeys } from "../../data/journeys";
import JourneyGallery from "../../components/journey-gallery";
import JourneyHeroImage from "../../components/journey-hero-image";

export function generateStaticParams() {
  return journeys.map(({ slug }) => ({ slug }));
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journey = getJourney(slug);
  if (!journey) notFound();
  return (
    <main className="story-page archive-detail">
      <header className="site-header story-header">
        <Link href="/" className="brand">Journey Archive</Link>
        <Link href="/#archive" className="back-link">← All journeys</Link>
      </header>

      <section className="story-hero">
        <JourneyHeroImage slug={journey.slug} fallback={journey.image} />
        <div className="hero-shade" />
        <div className="story-hero-content">
          <p className="eyebrow">Journey {journey.number} · {journey.prefecture}</p>
          <h1>{journey.title}</h1>
          <p>{journey.date} · {journey.duration}</p>
        </div>
      </section>

      <section className="story-lead section">
        <p className="section-index">{journey.area}</p>
        <div>
          <h2>{journey.tagline}</h2>
          <p>{journey.intro}</p>
        </div>
      </section>

      <section className="archive-days section">
        <p className="section-index">JOURNEY STORY</p>
        <div className="archive-day-grid">
          {journey.days.map((day) => (
            <article key={day.title}>
              <h2>{day.title}</h2>
              <ol>
                {day.items.map((item, index) => (
                  <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>

      <JourneyGallery slug={journey.slug} placement="day" title="旅の時間" />
      <JourneyGallery slug={journey.slug} placement="place" title="訪れた場所" />

      {journey.foods.length > 0 && (
        <section className="archive-food section">
          <p className="section-index">FOOD COLLECTION</p>
          <h2>旅で食べたもの</h2>
          <div className="archive-food-list">
            {journey.foods.map((food) => (
              <article key={`${food.name}-${food.dish}`}>
                <p>{food.name}</p>
                <h3>{food.dish}</h3>
                <span>{food.price ?? "価格未確認"}</span>
              </article>
            ))}
          </div>
        </section>
      )}

      <JourneyGallery slug={journey.slug} placement="food" title="食の記録" />
      <JourneyGallery slug={journey.slug} placement="best" title="旅の景色" />
      <JourneyGallery slug={journey.slug} placement="selfie" title="旅先のセルフィー · Best 3" />
      <JourneyGallery slug={journey.slug} placement="gallery" />

      <section className="travel-data section">
        <div>
          <p className="section-index">TRAVEL DATA</p>
          <h2>旅の記録</h2>
        </div>
        <dl className="data-list">
          <div><dt>期間</dt><dd>{journey.date}</dd></div>
          <div><dt>日数</dt><dd>{journey.duration}</dd></div>
          <div><dt>訪問エリア</dt><dd>{journey.area}</dd></div>
          {journey.transport.map((item) => <div key={item}><dt>交通</dt><dd>{item}</dd></div>)}
          {journey.hotel.map((item) => <div key={item}><dt>宿泊</dt><dd>{item}</dd></div>)}
          <div><dt>予約費用</dt><dd>{journey.price}</dd></div>
        </dl>
      </section>

      {journey.note && <aside className="archive-note section">{journey.note}</aside>}

      <section className="closing section">
        <p>{journey.tagline}</p>
        <Link href="/#archive">Back to archive →</Link>
      </section>
    </main>
  );
}
