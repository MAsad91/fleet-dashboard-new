import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-dark rounded-lg shadow-1 p-8">
          <h1 className="text-3xl font-bold text-dark dark:text-white mb-6">
            Privacy Policy
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-body-color dark:text-body-color-dark mb-4">
              This privacy policy explains how we collect, use, and protect your information 
              in the Fleet Management Dashboard.
            </p>
            
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-3">
              Information We Collect
            </h2>
            <p className="text-body-color dark:text-body-color-dark mb-4">
              We collect fleet operational data, user account information, and usage analytics 
              to provide our fleet management services.
            </p>
            
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-3">
              How We Use Your Data
            </h2>
            <p className="text-body-color dark:text-body-color-dark mb-4">
              Your data is used exclusively for fleet management operations, reporting, 
              and system optimization.
            </p>
            
            <h2 className="text-xl font-semibold text-dark dark:text-white mb-3">
              Data Security
            </h2>
            <p className="text-body-color dark:text-body-color-dark mb-6">
              We implement industry-standard security measures to protect your fleet data 
              and ensure confidentiality.
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
