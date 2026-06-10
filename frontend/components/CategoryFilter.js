export default function CategoryFilter({ categories, selected, onChange }) {
  const allCategories = ['All', ...categories];

  return (
    <div className="home-pill-row">
      {allCategories.map((category) => {
        const isActive = selected === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`filter-pill ${isActive ? 'filter-pill-active' : ''}`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
