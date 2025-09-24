import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions",
};

export default function TermsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 p-8">
          <h1 className="text-3xl font-bold text-dark dark:text-white mb-6">
            Terms and Conditions
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-body-color dark:text-body-color-dark mb-4">
              Welcome to the Fleet Management Dashboard. By using our service, you agree to these terms.
            </p>
            
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-3">
              Account Management
            </h2>
            <p className="text-body-color dark:text-body-color-dark mb-4">
              Account creation and management is handled by fleet administrators. 
              Please contact your administrator for account-related requests.
            </p>
            
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-3">
              Data Usage
            </h2>
            <p className="text-body-color dark:text-body-color-dark mb-4">
              Your fleet data is used solely for fleet management purposes and is 
              protected according to our privacy policy.
            </p>
            
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-3">
              Contact
            </h2>
            <p className="text-body-color dark:text-body-color-dark mb-6">
              For questions about these terms, please contact your fleet administrator.
            </p>
            
            <Link 
              href="/auth/sign-up" 
              className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition"
            >
              ← Back to Sign Up
            </Link>
          </div>
        </div>
    </div>
  );
}
