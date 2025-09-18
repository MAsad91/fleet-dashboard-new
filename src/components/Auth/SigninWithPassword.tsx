"use client";
import { EmailIcon, PasswordIcon, CompanyIcon } from "@/assets/icons";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { ErrorModal } from "../Modals/ErrorModal";

export default function SigninWithPassword() {
  const { login } = useAuth();
  const router = useRouter();
  const [data, setData] = useState({
    companyName: "",
    username: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "testadmin",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "testadmin123",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalError, setModalError] = useState({ title: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
    setShowErrorModal(false); // Close modal when user types
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log('🔐 Attempting login with:', { companyName: data.companyName, username: data.username, password: '***' });
      
      // Validate that company name is provided
      if (!data.companyName || data.companyName.trim() === '') {
        setError('Company name is required');
        return;
      }
      
      const result = await login(data.username, data.password, data.companyName);
      console.log('🔐 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, redirecting to /fleet');
        router.push('/fleet'); // Redirect to fleet dashboard
      } else {
        console.error('❌ Login failed:', result.error);
        
        // Check if it's a company-related error
        const errorMessage = result.error || 'Login failed';
        const lowerErrorMessage = errorMessage.toLowerCase();
        
        if (lowerErrorMessage.includes('company') || 
            lowerErrorMessage.includes('domain') ||
            lowerErrorMessage.includes('not found') ||
            lowerErrorMessage.includes('unable to connect') ||
            lowerErrorMessage.includes('invalid domain')) {
          
          let modalTitle = "Invalid Company";
          let modalMessage = errorMessage;
          
          // Customize messages based on error type
          if (lowerErrorMessage.includes('not found')) {
            modalTitle = "Company Not Found";
            modalMessage = `The company "${data.companyName}" was not found. Please check the company name and try again.`;
          } else if (lowerErrorMessage.includes('unable to connect')) {
            modalTitle = "Connection Failed";
            modalMessage = `Unable to connect to ${data.companyName}'s platform. Please check the company name and try again.`;
          } else if (lowerErrorMessage.includes('invalid domain')) {
            modalTitle = "Invalid Domain";
            modalMessage = `Invalid domain for company "${data.companyName}". Please check the company name and try again.`;
          }
          
          setModalError({
            title: modalTitle,
            message: modalMessage
          });
          setShowErrorModal(true);
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      
      <InputGroup
        type="text"
        label="Company Name"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="e.g., oem, joulepoint, acme"
        name="companyName"
        handleChange={handleChange}
        value={data.companyName}
        icon={<CompanyIcon />}
      />

      <InputGroup
        type="text"
        label="Username"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your username"
        name="username"
        handleChange={handleChange}
        value={data.username}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="Password"
        className="mb-5 [&_input]:py-[15px]"
        placeholder="Enter your password"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <div className="mb-6 flex items-center justify-between gap-2 py-2 font-medium">
        <Checkbox
          label="Remember me"
          name="remember"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e) =>
            setData({
              ...data,
              remember: e.target.checked,
            })
          }
        />

        <Link
          href="/auth/forgot-password"
          className="hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Forgot Password?
        </Link>
      </div>

      <div className="mb-4.5">
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
        >
          Sign In
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
      
      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={modalError.title}
        message={modalError.message}
        buttonText="Try Again"
      />
    </form>
  );
}
