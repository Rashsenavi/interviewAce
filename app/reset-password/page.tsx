import { Suspense } from "react";
import ResetPasswordPage from "../(auth)/reset-password";

export default function ResetPasswordRoutePage() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
			<ResetPasswordPage />
		</Suspense>
	);
}
