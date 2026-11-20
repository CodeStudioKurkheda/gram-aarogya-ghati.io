"use client";

import { useState } from "react";
import Script from "next/script";
import { HeartHandshake, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function DonateCard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [receiptId, setReceiptId] = useState("");

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setReceiptId("");

    const orderRes = await fetch(`${apiUrl}/api/donations/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donor_name: donorName,
        donor_phone: donorPhone,
        donor_email: donorEmail.trim() || null,
        amount_inr: Number(amount),
        pan_number: panNumber.trim() || null,
      }),
    });

    if (!orderRes.ok) {
      setLoading(false);
      alert("Could not initiate donation order. Please check your phone number or server keys.");
      return;
    }

    const orderData = await orderRes.json();
    setLoading(false);

    const rzp = new window.Razorpay({
      key: orderData.key_id,
      amount: orderData.amount_paise,
      currency: orderData.currency,
      name: "Gram Arogya Ghati",
      description: "80G Tax-Exempt Community Contribution",
      order_id: orderData.order_id,
      prefill: {
        name: donorName,
        contact: donorPhone,
        ...(donorEmail.trim() ? { email: donorEmail.trim() } : {}),
      },
      theme: { color: "#166534" },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verifyRes = await fetch(`${apiUrl}/api/donations/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });
        if (verifyRes.ok) {
          setReceiptId(response.razorpay_payment_id);
        }
      },
    });

    rzp.open();
  }

  return (
    <div className="rounded-xl border border-green-200 bg-white p-6 text-slate-800 shadow-xs">
      <Script src="https://razorpay.com" strategy="lazyOnload" />

      <div className="flex items-center gap-2 text-green-900">
        <HeartHandshake className="h-5 w-5" />
        <h3 className="text-lg font-bold">Donate Online (UPI / Card / NetBanking)</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Eligible for 50% tax deduction under Section 80G of the Income Tax Act.
      </p>

      {receiptId ? (
        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <p className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-green-700" /> Thank you, {donorName}!
          </p>
          <p className="mt-1 text-xs">
            We will send your thank-you acknowledgment to <strong>{donorPhone}</strong>
            {donorEmail ? ` and ${donorEmail}` : ""}.
          </p>
          <p className="mt-1 text-xs">
            Payment Reference ID: <span className="font-mono">{receiptId}</span>
          </p>
        </div>
      ) : (
        <form onSubmit={handleDonate} className="mt-4 space-y-3">
          <div className="flex gap-2">
            {[500, 1000, 5000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`flex-1 rounded-md border py-1.5 text-xs font-semibold ${
                  amount === preset
                    ? "border-green-800 bg-green-800 text-white"
                    : "border-slate-300 text-slate-700 hover:bg-green-50"
                }`}
              >
                ₹{preset}
              </button>
            ))}
          </div>

          <input
            type="number"
            min={1}
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Custom Amount (INR) *"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              required
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Full Name *"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="tel"
              required
              minLength={10}
              maxLength={15}
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              placeholder="Mobile Number (WhatsApp/SMS) *"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              placeholder="Email Address (Optional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              maxLength={10}
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              placeholder="PAN (Optional, for 80G)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-800 py-2.5 text-sm font-semibold text-white hover:bg-green-900 disabled:opacity-50"
          >
            {loading ? "Preparing Checkout..." : `Contribute ₹${amount}`}
          </button>
        </form>
      )}
    </div>
  );
}
