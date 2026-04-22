export default function InfoCard({ variant = 'alert', icon, title, description }) {
  return (
    <div className="info-card">
      <div className={`info-card__icon info-card__icon--${variant}`}>
        {icon}
      </div>
      <div>
        <div className="info-card__title">{title}</div>
        <p className="info-card__desc">{description}</p>
      </div>
    </div>
  );
}
