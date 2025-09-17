import Signin from "@/components/Auth/Signin";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignIn() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-4xl">
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="flex flex-wrap items-center">
            <div className="w-full xl:w-1/2">
              <div className="w-full p-6 sm:p-8 xl:p-10">
                <Signin />
              </div>
            </div>

            <div className="hidden w-full p-6 xl:block xl:w-1/2">
              <div className="custom-gradient-1 overflow-hidden rounded-2xl px-8 pt-8 dark:!bg-dark-2 dark:bg-none">
                <Link className="mb-6 inline-block" href="/">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white font-bold text-lg">F</span>
                    </div>
                    <span className="text-2xl font-bold text-dark dark:text-white">Fleet</span>
                  </div>
                </Link>

                <h1 className="mb-3 text-xl font-bold text-dark dark:text-white sm:text-2xl">
                  Welcome Back!
                </h1>

                <p className="w-full max-w-[375px] text-sm font-medium text-dark-4 dark:text-dark-6">
                  Please sign in to your account by completing the necessary
                  fields below
                </p>

                <div className="mt-16">
                  <Image
                    src={"/images/grids/grid-02.svg"}
                    alt="Logo"
                    width={405}
                    height={325}
                    className="mx-auto dark:opacity-30"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
