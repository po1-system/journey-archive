import Link from "next/link";
import { notFound } from "next/navigation";
import { getJourney, journeys } from "../../data/journeys";
import JourneyGallery from "../../components/journey-gallery";
import JourneyHeroImage from "../../components/journey-hero-image";
import JourneyFoodCollection from "../../components/journey-food-collection";
import CinematicRoute from "../../components/cinematic-route";
import { getCinematicPreset } from "../../data/cinematic-presets";

export function generateStaticParams() {
  return journeys.map(({ slug }) => ({ slug }));
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const journey = getJourney(slug);
  if (!journey) notFound();
  const isPlanned = journey.status === "planned";
  const cinematic = isPlanned ? undefined : getCinematicPreset(journey.slug);
  const locationCount = new Set(journey.days.flatMap((day) => day.items)).size;
  const dayCount = Number(journey.duration.match(/(\d+)日/)?.[1]) || journey.days.length;
  const bestMemory = journey.bestPhoto || journey.bestPlace || journey.tagline;
  return (
    <main className="story-page archive-detail">
      {cinematic && <CinematicRoute stops={cinematic.stops} coordinates={cinematic.coordinates} kind={cinematic.kind} />}
      <header className="site-header story-header">
        <Link href="/" className="brand">Journey Archive</Link>
        <Link href="/#explore" className="back-link">← All journeys</Link>
      </header>

      <section className="story-hero" id={`${journey.slug}-stop-0`}>
        <JourneyHeroImage slug={journey.slug} fallback={journey.image} />
        <div className="hero-shade" />
        <div className="story-hero-content">
          <p className="eyebrow">{isPlanned ? "Planned Journey" : "Journey"} {journey.number} · {journey.prefecture}</p>
          <h1>{journey.title}</h1>
          <p>{journey.date} · {journey.duration}</p>
        </div>
      </section>

      <section className="story-lead section" id={`${journey.slug}-stop-1`}>
        <p className="section-index">{journey.area}</p>
        <div>
          <h2>{journey.tagline}</h2>
          <p>{journey.intro}</p>
        </div>
      </section>

      {isPlanned ? (
        <section className="planned-journey-note section">
          <p className="section-index">THE NEXT CHAPTER</p>
          <div>
            <span>PLANNING</span>
            <h2>写真とともに、旅を完成させる。</h2>
            <p>現時点では日程のみを記録しています。旅のあと、写真を追加すると「旅の時間」「訪れた場所」「食の記録」へ整理されます。</p>
          </div>
        </section>
      ) : (
        <>
          <section className="archive-days section cinematic-chapter" id={`${journey.slug}-stop-2`}>
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

          <div id={`${journey.slug}-stop-3`}>
            <JourneyGallery slug={journey.slug} placement="day" title="旅の時間" />
            <JourneyGallery slug={journey.slug} placement="place" title="訪れた場所" />

            <JourneyFoodCollection
              slug={journey.slug}
              foods={journey.foods.map((food) => ({
                shop: food.name,
                dish: food.dish,
                price: food.price,
              }))}
            />
          </div>

          <JourneyGallery slug={journey.slug} placement="best" title="旅の景色" />
          <JourneyGallery slug={journey.slug} placement="selfie" title="旅先のセルフィー · Best 3" />
          <JourneyGallery slug={journey.slug} placement="gallery" />
        </>
      )}

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
          <div><dt>{isPlanned ? "費用" : "予約費用"}</dt><dd>{journey.price}</dd></div>
        </dl>
      </section>

      {journey.note && <aside className="archive-note section">{journey.note}</aside>}

      <section className="journey-credits" id={`${journey.slug}-stop-4`}>
        <div className="credits-kicker">
          <span>JOURNEY {journey.number}</span>
          <span>{journey.title}</span>
        </div>
          <p className="section-index">{isPlanned ? "JOURNEY AHEAD" : "END CREDITS"}</p>
        <h2>{journey.tagline}</h2>
        <div className="credits-grid">
          <article><strong>{String(dayCount).padStart(2, "0")}</strong><span>Days</span></article>
          <article><strong>{isPlanned ? "—" : String(locationCount).padStart(2, "0")}</strong><span>{isPlanned ? "Places to discover" : "Recorded moments"}</span></article>
          <article><strong>{isPlanned ? "—" : String(journey.foods.length).padStart(2, "0")}</strong><span>{isPlanned ? "Food to discover" : "Food records"}</span></article>
          <article><strong>{isPlanned ? "—" : `¥${journey.totalCost.toLocaleString("ja-JP")}`}</strong><span>{isPlanned ? "Cost to be added" : "Recorded cost"}</span></article>
        </div>
        <div className="credit-memory">
          <span>BEST MEMORY</span>
          <p>{bestMemory}</p>
        </div>
      </section>

      <section className="closing section">
        <p>{journey.tagline}</p>
        <Link href="/#explore">Back to archive →</Link>
      </section>
    </main>
  );
}
