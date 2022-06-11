// Partial of ./components/CheckoutForm.tsx
// ...
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
		console.log(Math.round(100 * input.amount));
		setLoading(true);
		// Create a Checkout Session.
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
			return;
		}

		// Redirect to Checkout.
		const stripe = await getStripe();
		const { error } = await stripe!.redirectToCheckout({
			// Make the id field from the Checkout Session creation API response
			// available to this file, so you can provide it as parameter here
			// instead of the {{CHECKOUT_SESSION_ID}} placeholder.
			sessionId: checkoutSession.id
		});
		// If `redirectToCheckout` fails due to a browser or network
		// error, display the localized error message to your customer
		// using `error.message`.
		console.warn(error.message);
		setLoading(false);
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className={"input-group mb-3"}>
				<span className="input-group-text">$</span>
				<input
					className={"form-control"}
					type={"number"}
					name={"amount"}
					min={1}
					max={1000}
					step={1}
					value={input.amount}
					onChange={handleInputChange}
				/>
				<span className="input-group-text text-muted">.00</span>
			</div>
			<button className="btn btn-success mb-1" type="submit" disabled={loading}>
				pay
			</button>
		</form>
	);
};

export default CheckoutForm;
