import Link from "next/link";
import { journeys } from "./data/journeys";
import ArchiveDashboard from "./components/archive-dashboard";

const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=88",
    label: "海辺に残る、旅の記憶",
  },
  {
    src: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2400&q=88",
    label: "静かな夕暮れを歩く",
  },
  {
    src: "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?auto=format&fit=crop&w=2400&q=88",
    label: "まだ見ぬ景色の先へ",
  },
  {
    src: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=2400&q=88",
    label: "歴史と日常のあいだ",
  },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <Link href="/" className="brand">Journey Archive</Link>
        <nav aria-label="メインナビゲーション">
          <a href="#journeys">Journeys</a>
          <a href="#map">Map</a>
          <a href="#rankings">Best</a>
          <Link href="/journeys/mito-oarai">Featured</Link>
        </nav>
      </header>

      <section className="hero" aria-label="旅の写真スライドショー">
        <div className="hero-slides" aria-hidden="true">
          {heroImages.map((image, index) => (
            <div
              className="hero-slide"
              key={image.src}
              style={{
                backgroundImage: `url("${image.src}")`,
                animationDelay: `${index * 7}s`,
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
          <span>01 — 04</span>
        </div>
        <a className="scroll-cue" href="#intro" aria-label="下へスクロール">Scroll</a>
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
            <h2>水戸・大洗</h2>
          </div>
          <p>海と歴史、茨城の食を巡る旅。</p>
        </div>
        <Link href="/journeys/mito-oarai" className="featured-image">
          <div className="featured-overlay">
            <p>2026.07.27 — 07.28</p>
            <h3>静かな夕暮れが、<br />旅の輪郭をつくる。</h3>
            <span>View the story →</span>
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
