"use client";
import { EmailIcon, PasswordIcon, UserIcon } from "@/assets/icons";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";

export default function SignupWithPassword() {
  const { login } = useAuth();
  const router = useRouter();
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (data.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (!data.agreeToTerms) {
      setError("Please agree to the terms and conditions");
      setLoading(false);
      return;
    }

    try {
      // For now, we'll show a message that signup is not available
      // In a real implementation, you would call an API endpoint
      setError("Sign up is currently not available. Please contact your administrator for account creation.");
      
      // Alternative: Redirect to sign-in with a message
      // router.push('/auth/sign-in?message=signup-not-available');
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">
          Create Account
        </h2>
        <p className="text-sm text-body-color dark:text-body-color-dark">
          Fill in your details to create your fleet management account
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <InputGroup
          type="text"
          label="First Name"
          className="[&_input]:py-[15px]"
          placeholder="Enter your first name"
          name="firstName"
          handleChange={handleChange}
          value={data.firstName}
          icon={<UserIcon />}
        />

        <InputGroup
          type="text"
          label="Last Name"
          className="[&_input]:py-[15px]"
          placeholder="Enter your last name"
          name="lastName"
          handleChange={handleChange}
          value={data.lastName}
          icon={<UserIcon />}
        />
      </div>

      <InputGroup
        type="email"
        label="Email Address"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your email address"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="Password"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Create a password"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <InputGroup
        type="password"
        label="Confirm Password"
        className="mb-5 [&_input]:py-[15px]"
        placeholder="Confirm your password"
        name="confirmPassword"
        handleChange={handleChange}
        value={data.confirmPassword}
        icon={<PasswordIcon />}
      />

      <div className="mb-6 flex items-start gap-2 py-2">
        <Checkbox
          label=""
          name="agreeToTerms"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e) =>
            setData({
              ...data,
              agreeToTerms: e.target.checked,
            })
          }
        />
        <p className="text-sm text-body-color dark:text-body-color-dark">
          I agree to the{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>

      <div className="mb-4.5">
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
        >
          Create Account
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-body-color dark:text-body-color-dark">
          <strong>Note:</strong> Account creation is currently managed by administrators. 
          Please contact your fleet administrator for account setup.
        </p>
      </div>
    </form>
  );
}
