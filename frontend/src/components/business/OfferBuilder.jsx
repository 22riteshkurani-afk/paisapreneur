// Offer builder component for positioning and product packaging.
function OfferBuilder({ offers }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Offer Builder</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Package your offer so people immediately understand the value.</p>
      </div>

      <div className="space-y-3">
        {offers.map((offer) => (
          <div key={offer.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{offer.title}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{offer.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OfferBuilder;
