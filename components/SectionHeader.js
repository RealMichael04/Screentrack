import Reveal from "./Reveal";

export default function SectionHeader({ eyebrow, title, children, align = "left" }) {
  return (
    <Reveal className={`section-header section-header--${align}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p className="lead">{children}</p>}
    </Reveal>
  );
}
