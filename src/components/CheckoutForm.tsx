import getStripe from "../utils/get-stripe";
import { Stripe } from "stripe";
import { FormEvent, useState } from "react";

const CheckoutForm = () => {
	const [loading, setLoading] = useState(false);
	const [input, setInput] = useState({
		amount: 1
	});

	const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
		setInput({
			amount: parseInt(e.target.value)
		});
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Create a Checkout Session
			const checkoutSession: Stripe.Checkout.Session = await fetch(
				"/api/make_payment",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ amount: Math.round(100 * input.amount) })
				}
			).then((res) => res.json());

			if ((checkoutSession as any).statusCode === 500) {
				console.error((checkoutSession as any).message);
				setLoading(false);
				return;
			}

			// Redirect to Checkout
			const stripe = await getStripe();
			const { error } = await stripe!.redirectToCheckout({
				sessionId: checkoutSession.id
			});

			if (error) {
				console.warn(error.message);
			}
		} catch (error) {
			console.error("Payment error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2 className="text-2xl font-bold mb-6 text-slate-900">
				Enter Payment Amount
			</h2>

			<form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
				{/* Amount Input */}
				<div>
					<label
						htmlFor="amount"
						className="block text-sm font-medium text-slate-700 mb-2"
					>
						Amount (USD)
					</label>
					<div className="flex items-center">
						<span className="inline-flex items-center px-4 py-3 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-slate-700 font-medium">
							$
						</span>
						<input
							id="amount"
							className="flex-1 px-4 py-3 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
							type="number"
							name="amount"
							min={1}
							max={1000}
							step={1}
							value={input.amount}
							onChange={handleInputChange}
						/>
						<span className="inline-flex items-center px-4 py-3 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-slate-500">
							.00
						</span>
					</div>
					<p className="mt-2 text-sm text-slate-500">
						Enter an amount between $1 and $1,000
					</p>
				</div>

				{/* Submit Button */}
				<button
					className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
					type="submit"
					disabled={loading}
				>
					{loading ? (
						<span className="flex items-center justify-center">
							<svg
								className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							Processing...
						</span>
					) : (
						"Proceed to Payment"
					)}
				</button>
			</form>
		</div>
	);
};

export default CheckoutForm;
