import Link from "next/link";
import { getJourney, journeys } from "./data/journeys";
import { featuredJourneySlug, getJourneyImage, homeHeroImages } from "./data/site-images";
import ArchiveDashboard from "./components/archive-dashboard";
import JourneyPassage from "./components/journey-passage";
import { journeyRoute } from "./data/home-passage";

export default function Home() {
  const featuredJourney = getJourney(featuredJourneySlug);
  const featuredImage = getJourneyImage(featuredJourneySlug);
  const activeHeroImages = homeHeroImages.filter((image) => image.src);
  if (!featuredJourney) return null;
  return (
    <main>
      <header className="site-header">
        <Link href="/" className="brand">Journey Archive</Link>
        <nav aria-label="メインナビゲーション">
          <a href="#journeys">Journeys</a>
          <a href="#map">Map</a>
          <a href="#rankings">Best</a>
          <Link href={`/journeys/${featuredJourney.slug}`}>Featured</Link>
        </nav>
      </header>

      <JourneyPassage scenes={journeyRoute} />

      <section className="hero" aria-label="旅の写真スライドショー">
        <div className="hero-slides" aria-hidden="true">
          {activeHeroImages.map((image, index) => (
            <div
              className="hero-slide"
              key={image.src}
              style={{
                backgroundImage: `url("${image.src}")`,
                animationDelay: `${index * 7}s`,
                animationDuration: `${Math.max(activeHeroImages.length, 1) * 7}s`,
              }}
            />
          ))}
        </div>
        <div className="hero-shade" />
        <div className="hero-content">
          <p className="eyebrow">Personal Travel Journal · Since 2025</p>
          <h1>まだ見ぬ景色求めて</h1>
          <p className="hero-sub">Journey Archive</p>
          <p className="hero-intro">
            行き先を集めるためではない。<br />
            心が動いた瞬間を、忘れないための記録。
          </p>
        </div>
        <div className="hero-caption">
          <span>Featured memories</span>
          <span className="line" />
          <span>01 — {String(activeHeroImages.length).padStart(2, "0")}</span>
        </div>
        <a className="scroll-cue" href="#intro" aria-label="旅行一覧へ">Archive</a>
      </section>

      <section className="manifesto section" id="intro">
        <p className="section-index">001 — THE ARCHIVE</p>
        <div>
          <h2>旅を、記憶のままに。</h2>
          <p>
            写真、食、移動、そしてその日に見た光。これは観光地を並べるブログではなく、
            一人旅で出会った景色を編み直す、個人のためのデジタル旅行誌です。
          </p>
        </div>
      </section>

      <section className="featured section" id="journeys">
        <div className="section-heading">
          <div>
            <p className="section-index">002 — FEATURED JOURNEY</p>
            <h2>{featuredJourney.title}</h2>
          </div>
          <p>{featuredJourney.tagline}</p>
        </div>
        <Link
          href={`/journeys/${featuredJourney.slug}`}
          className={`featured-image${featuredImage.src ? "" : " is-placeholder"}`}
          style={featuredImage.src ? { backgroundImage: `linear-gradient(90deg, rgba(0,0,0,.35), transparent), url("${featuredImage.src}")` } : undefined}
        >
          <div className="featured-overlay">
            <p>{featuredJourney.date} · {featuredJourney.duration}</p>
            <h3>{featuredImage.src ? featuredJourney.tagline : "写真を、\nこの旅の記憶へ。"}</h3>
            <span>{featuredImage.src ? "View the story →" : "Photo to be added →"}</span>
          </div>
        </Link>
      </section>

      <ArchiveDashboard journeys={journeys} />

      <footer>
        <p>まだ見ぬ景色求めて — Journey Archive</p>
        <p>Tokyo, Japan · 2025 — ∞</p>
      </footer>
    </main>
  );
}
