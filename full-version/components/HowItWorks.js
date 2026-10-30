import SectionHeader from "./SectionHeader";
import Reveal from "./Reveal";

const steps = [
  { n: "01", title: "Build your taste profile", text: "Answer a quick survey about genres, runtimes, favorite creators and the tone you love." },
  { n: "02", title: "Add what you've watched", text: "Log movies and shows, mark progress episode by episode, and rate as you go." },
  { n: "03", title: "Follow titles & franchises", text: "Follow shows, films, actors and universes to fill your feed and calendar." },
  { n: "04", title: "Discover & stay informed", text: "Get tailored picks, guided franchise watchlists and updates in one place." },
];

export default function HowItWorks() {
  return (
    <section className="section section--tint" id="how-it-works">
      <div className="container">
        <SectionHeader eyebrow="How it works" title="From sign-up to your next obsession in four steps." align="center" />
        <ol className="steps">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 90} className="step">
              <span className="step__num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
