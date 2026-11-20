export function BankTransferCard() {
  return (
    <div className="rounded-xl border border-green-200 bg-green-50/50 p-6">
      <h3 className="text-lg font-bold text-green-950">Direct Bank Transfer (NEFT / RTGS)</h3>
      <p className="mt-1 text-xs text-slate-600">
        Prefer transferring directly from your bank app? Use our official NGO account below:
      </p>

      <div className="mt-4 space-y-2 rounded-lg border border-green-200 bg-white p-4 text-sm text-slate-800">
        <p><span className="font-semibold text-green-900">Account Name:</span> Gram Arogya Ghati</p>
        <p><span className="font-semibold text-green-900">Bank:</span> State Bank of India, Branch Kurkheda</p>
        <p><span className="font-semibold text-green-900">Account Number:</span> 33745836409</p>
        <p><span className="font-semibold text-green-900">IFSC Code:</span> SBIN0005909</p>
      </div>
    </div>
  );
}
