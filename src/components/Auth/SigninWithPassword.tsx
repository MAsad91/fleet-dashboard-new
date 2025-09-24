"use client";
import { EmailIcon, PasswordIcon, CompanyIcon } from "@/assets/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import InputGroup from "../FormElements/InputGroup";
import { ErrorModal } from "../Modals/ErrorModal";

export default function SigninWithPassword() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const [data, setData] = useState({
    companyName: "",
    username: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "testadmin",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "testadmin123",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalError, setModalError] = useState({ title: "", message: "" });
  const [isMounted, setIsMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isMounted && isAuthenticated) {
      router.replace('/fleet');
    }
  }, [isMounted, isAuthenticated, router]);

  // Force re-mount of form inputs after redirect to ensure they're editable
  useEffect(() => {
    if (isMounted && formRef.current) {
      // Small delay to ensure DOM is ready after redirect
      const timer = setTimeout(() => {
        const inputs = formRef.current?.querySelectorAll('input, button');
        inputs?.forEach(element => {
          // Force input to be focusable and editable
          element.removeAttribute('readonly');
          element.removeAttribute('disabled');
          // Ensure the element is properly initialized
          const htmlElement = element as HTMLElement;
          htmlElement.style.pointerEvents = 'auto';
          htmlElement.style.opacity = '1';
          // Force re-enable button
          if (element.tagName === 'BUTTON') {
            (element as HTMLButtonElement).disabled = false;
          }
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
    setShowErrorModal(false); // Close modal when user types
  };

  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Ensure input is editable when clicked
    const input = e.target as HTMLInputElement;
    input.removeAttribute('readonly');
    input.removeAttribute('disabled');
    input.style.pointerEvents = 'auto';
    input.style.opacity = '1';
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Ensure button is clickable when clicked
    const button = e.target as HTMLButtonElement;
    button.removeAttribute('disabled');
    button.style.pointerEvents = 'auto';
    button.style.opacity = '1';
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
        setLoading(false);
        return;
      }
      
      const result = await login(data.username, data.password, data.companyName);
      console.log('🔐 Login result:', result);
      
      if (result.success) {
        console.log('✅ Login successful, redirecting to /fleet');
        // Don't set loading to false here - let the redirect happen
        router.replace('/fleet'); // Use replace instead of push to prevent back button issues
        return; // Exit early to prevent setting loading to false
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

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <form ref={formRef} key={isMounted ? 'mounted' : 'loading'} onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      
      <InputGroup
        type="text"
        label="Company Name"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="oem / joulepoint"
        name="companyName"
        handleChange={handleChange}
        value={data.companyName}
        icon={<CompanyIcon />}
        onClick={handleInputClick}
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
        onClick={handleInputClick}
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
        onClick={handleInputClick}
      />


      <div className="mb-4.5">
        <button
          type="submit"
          disabled={loading}
          onClick={handleButtonClick}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
