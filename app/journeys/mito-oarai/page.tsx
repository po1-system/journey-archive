import Link from "next/link";
import JourneyGallery, { getJourneyHero } from "../../components/journey-gallery";

const foods = [
  { shop: "浜っこ食堂 お魚天国", dish: "海鮮丼", price: "¥2,310", image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=86" },
  { shop: "喰処・飲処 てんまさ", dish: "納豆料理とカキフライ", price: "¥2,590", image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=1200&q=86" },
  { shop: "らぁ麺ふじ田 水戸本店", dish: "特製塩らぁ麺", price: "¥1,560", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=86" },
];

export default function MitoOaraiPage() {
  const heroPhoto = getJourneyHero("mito-oarai");
  const heroBase = process.env.GITHUB_ACTIONS === "true" ? "/journey-archive" : "";
  return (
    <main className="story-page">
      <header className="site-header story-header">
        <Link href="/" className="brand">Journey Archive</Link>
        <Link href="/" className="back-link">← All journeys</Link>
      </header>

      <section className="story-hero">
        <div className="story-hero-image" style={heroPhoto ? { backgroundImage: `url("${heroBase}${heroPhoto.src}")` } : undefined} />
        <div className="hero-shade" />
        <div className="story-hero-content">
          <p className="eyebrow">Journey 08 · Ibaraki</p>
          <h1>水戸・大洗</h1>
          <p>2026.07.27 — 07.28 · 1泊2日</p>
        </div>
      </section>

      <JourneyGallery slug="mito-oarai" placement="day" title="旅の時間" />
      <JourneyGallery slug="mito-oarai" placement="place" title="訪れた場所" />

      <section className="story-lead section">
        <p className="section-index">SEA · HISTORY · FOOD</p>
        <div>
          <h2>海と歴史、<br />茨城の食を巡る。</h2>
          <p>
            品川から特急ときわで水戸へ。大洗の海と神社を巡り、
            水戸では弘道館、水戸城、千波湖、偕楽園へ。
            海鮮と納豆料理、塩らぁ麺まで、茨城らしさを味わった一泊二日。
          </p>
        </div>
      </section>

      <section className="chapter section">
        <div className="chapter-title">
          <span>Day 01</span>
          <h2>海へ向かう</h2>
        </div>
        <div className="editorial-grid">
          <figure className="photo photo-tall coast-photo">
            <figcaption>神磯の鳥居 · 大洗</figcaption>
          </figure>
          <div className="editorial-copy">
            <p className="eyebrow">Oarai Coast</p>
            <h3>波の向こうに、<br />鳥居が立つ。</h3>
            <p>
              鹿島臨海鉄道で大洗へ。海鮮丼で旅を始め、
              神磯の鳥居、大洗磯前神社、めんたいパークを巡った。
              海岸では、旅を象徴する写真を残す。
            </p>
            <dl className="micro-data">
              <div><dt>Train</dt><dd>常磐線特急</dd></div>
              <div><dt>Lunch</dt><dd>海鮮丼 · ¥2,310</dd></div>
              <div><dt>Route</dt><dd>品川 → 水戸 → 大洗</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="full-bleed lake-photo">
        <div>
          <p className="eyebrow">Senba Lake · Sunset</p>
          <h2>湖畔で迎えた、<br />静かな夕暮れ。</h2>
          <p>千波湖の夕景は、この旅を象徴する時間になった。</p>
        </div>
      </section>

      <section className="chapter section">
        <div className="chapter-title">
          <span>Day 02</span>
          <h2>庭園と水戸の味</h2>
        </div>
        <div className="editorial-grid reverse">
          <div className="editorial-copy">
            <p className="eyebrow">Kairakuen</p>
            <h3>仕事を終え、<br />緑の中へ。</h3>
            <p>
              二日目は偕楽園へ。好文亭と日本庭園を歩き、旅の最後は特製塩らぁ麺。
              水戸駅で茨城らしい土産を選び、夕方の特急で東京へ戻った。
            </p>
            <dl className="micro-data">
              <div><dt>Garden</dt><dd>偕楽園 · ¥320</dd></div>
              <div><dt>Best food</dt><dd>特製塩らぁ麺</dd></div>
              <div><dt>Return</dt><dd>常磐線特急</dd></div>
            </dl>
          </div>
          <figure className="photo photo-tall garden-photo">
            <figcaption>偕楽園 · 水戸</figcaption>
          </figure>
        </div>
      </section>

      <section className="food section">
        <div className="section-heading">
          <div>
            <p className="section-index">FOOD COLLECTION</p>
            <h2>旅で食べたもの</h2>
          </div>
          <p>Food total · ¥6,460</p>
        </div>
        <div className="food-grid">
          {foods.map((food) => (
            <article className="food-card" key={food.shop}>
              <div className="food-image" style={{ backgroundImage: `url("${food.image}")` }} />
              <div>
                <p>{food.shop}</p>
                <h3>{food.dish}</h3>
                <span>{food.price}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="best section">
        <p className="section-index">EDITOR&apos;S SELECTION</p>
        <div className="best-grid">
          <div><span>Best photo</span><h3>千波湖の<br />夕景セルフィー</h3></div>
          <div><span>Best food</span><h3>ふじ田の<br />特製塩らぁ麺</h3></div>
          <div><span>Best place</span><h3>海に立つ<br />神磯の鳥居</h3></div>
        </div>
      </section>

      <JourneyGallery slug="mito-oarai" placement="food" title="食の記録" />
      <JourneyGallery slug="mito-oarai" placement="best" title="旅の一枚" />
      <JourneyGallery slug="mito-oarai" placement="gallery" />

      <section className="travel-data section">
        <div>
          <p className="section-index">TRAVEL DATA</p>
          <h2>旅の記録</h2>
        </div>
        <dl className="data-list">
          <div><dt>旅程</dt><dd>2026.07.27 — 07.28</dd></div>
          <div><dt>宿泊</dt><dd>水戸駅周辺 · 1泊</dd></div>
          <div><dt>訪問</dt><dd>水戸市・大洗町</dd></div>
          <div><dt>移動</dt><dd>特急ときわ・鹿島臨海鉄道</dd></div>
          <div><dt>総費用</dt><dd>¥31,117</dd></div>
          <div><dt>満足度</dt><dd>5.0 / 5.0</dd></div>
        </dl>
      </section>

      <section className="closing section">
        <p>海、歴史、庭園、食がバランスよく詰まった旅。<br />次は梅の偕楽園と、那珂湊へ。</p>
        <Link href="/">Back to archive →</Link>
      </section>
    </main>
  );
}
