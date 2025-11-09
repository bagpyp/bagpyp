import { useUser } from "@auth0/nextjs-auth0/client";
import Layout from "../components/Layout";
import CheckoutForm from "../components/CheckoutForm";
import Link from "next/link";

const PaymentPage = () => {
	const { user, isLoading } = useUser();

	if (isLoading) {
		return (
			<Layout title="Payment | Bagpyp">
				<div className="section">
					<div className="container-custom flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
							<p className="text-slate-600">Loading...</p>
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	if (!user) {
		return (
			<Layout title="Payment | Bagpyp">
				<div className="section">
					<div className="container-custom">
						<div className="max-w-md mx-auto text-center card p-12">
							<svg
								className="w-16 h-16 text-primary-600 mx-auto mb-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
							<h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
							<p className="text-slate-600 mb-8">
								Please sign in to access the payment page.
							</p>
							<Link href="/api/auth/login">
								<button className="btn-primary w-full">Sign In</button>
							</Link>
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout
			title="Payment | Bagpyp"
			description="Support Bagpyp consultancy services"
		>
			<div className="section">
				<div className="container-custom">
					<div className="max-w-2xl mx-auto">
						{/* Welcome message */}
						<div className="text-center mb-12">
							<h1 className="mb-4">Make a Payment</h1>
							<p className="text-xl text-slate-600">
								Thank you for choosing Bagpyp consultancy services
							</p>
						</div>

						{/* Payment form */}
						<div className="card p-8 md:p-12">
							<CheckoutForm />
						</div>

						{/* Info section */}
						<div className="mt-8 card-gradient p-6 text-center">
							<p className="text-sm text-slate-600">
								Payments are securely processed through Stripe. Your payment
								information is never stored on our servers.
							</p>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default PaymentPage;
