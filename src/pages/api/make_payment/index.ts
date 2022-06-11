import { Stripe } from "stripe";
import { NextApiRequest, NextApiResponse } from "next";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2020-08-27"
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method === "POST") {
		const amount: number = req.body.amount;
		const displayAmount: number = Math.round(amount / 100);
		console.log(amount);
		// TODO: Validate the amount that was passed from the client.
		try {
			const checkoutSession: Stripe.Checkout.Session =
				await stripe.checkout.sessions.create({
					submit_type: "donate",
					payment_method_types: ["card"],
					line_items: [
						{
							name: `${displayAmount} dollar${displayAmount === 1 ? "" : "s"}`,
							amount: amount,
							currency: "usd",
							quantity: 1
						}
					],
					success_url: `${req.headers.origin}/thanks?session_id={CHECKOUT_SESSION_ID}`,
					cancel_url: `${req.headers.origin}/error?session_id={CHECKOUT_SESSION_ID}`
				});
			res.status(200).json(checkoutSession);
		} catch (err) {
			res.status(500).json({
				statusCode: 500,
				message: err instanceof Error ? err.message : ""
			});
		}
	} else {
		res.setHeader("Allow", "POST");
		res.status(405).end("");
	}
}
