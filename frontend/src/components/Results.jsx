export default function Results({ result }) {
  const { product, ingredients, claims, nutrition, log } = result;

  return (
    <div className="space-y-6">
      <div className="glass p-6">
        <h2 className="text-xl font-bold mb-1">{product.name}</h2>
        <p className="text-brand-200 text-sm">Brand: {product.brand}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-semibold mb-3">Ingredients</h3>
          {ingredients.length === 0 ? (
            <p className="text-brand-200 text-sm">No ingredients detected.</p>
          ) : (
            <ul className="list-disc list-inside text-brand-50 space-y-1">
              {ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass p-6">
          <h3 className="font-semibold mb-3">Marketing Claims</h3>
          {claims.length === 0 ? (
            <p className="text-brand-200 text-sm">No claims detected.</p>
          ) : (
            <ul className="list-disc list-inside text-brand-50 space-y-1">
              {claims.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {Object.keys(nutrition).length > 0 && (
        <div className="glass p-6">
          <h3 className="font-semibold mb-3">Nutrition (detected)</h3>
          <div className="flex gap-6 text-sm">
            {nutrition.protein && (
              <div>
                <div className="text-brand-200">Protein</div>
                <div className="font-semibold">{nutrition.protein}</div>
              </div>
            )}
            {nutrition.sugar && (
              <div>
                <div className="text-brand-200">Sugar</div>
                <div className="font-semibold">{nutrition.sugar}</div>
              </div>
            )}
            {nutrition.fat && (
              <div>
                <div className="text-brand-200">Fat</div>
                <div className="font-semibold">{nutrition.fat}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="glass p-6">
        <h3 className="font-semibold mb-3">Investigation Log</h3>
        <ul className="text-sm text-brand-100 space-y-1">
          {(log || []).map((line, i) => (
            <li key={i}>• {line}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}