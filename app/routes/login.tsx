import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
import { z } from "zod";

import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUser } from "~/utils/session.server";
import { loginSchema } from "~/utils/validation";
import { FormField } from "~/components/FormField";
import { Button, SocialButton } from "~/components/Button";

export const meta: MetaFunction = () => {
  return [{ title: "Login" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (user) return redirect("/");
  
  // Get any error messages from the URL
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  
  return json({ error });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const rawFormData = Object.fromEntries(formData);
  
  try {
    const { usernameOrEmail, password, redirectTo, remember } = loginSchema.parse({
      usernameOrEmail: formData.get("usernameOrEmail"),
      password: formData.get("password"),
      redirectTo: formData.get("redirectTo") || "/",
      remember: formData.get("remember") === "on",
    });

    // Log the login attempt for debugging
    console.log(`Login attempt for: ${usernameOrEmail}`);
    
    const user = await verifyLogin(usernameOrEmail, password);
    
    if (!user) {
      console.log('Login failed: Invalid credentials');
      return json(
        { errors: { form: "Invalid username/email or password" }, values: rawFormData },
        { status: 400 }
      );
    }

    console.log('Login successful, creating session for user:', user.id);
    return createUserSession({
      request,
      userId: user.id,
      remember,
      redirectTo,
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return json(
        { errors: fieldErrors, values: rawFormData },
        { status: 400 }
      );
    }
    
    return json(
      { errors: { form: "Something went wrong" }, values: rawFormData },
      { status: 500 }
    );
  }
};

export default function Login() {
  const { error } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [formData, setFormData] = useState({
    usernameOrEmail: actionData?.values?.usernameOrEmail || "",
    password: actionData?.values?.password || "",
    remember: actionData?.values?.remember === "on",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        {(actionData?.errors?.form || error) ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{actionData?.errors?.form || error}</span>
          </div>
        ) : null}

        <Form method="post" className="mt-8 space-y-6">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="rounded-md shadow-sm -space-y-px">
            <FormField
              htmlFor="usernameOrEmail"
              label="Username or Email"
              value={formData.usernameOrEmail}
              onChange={handleInputChange}
              error={actionData?.errors?.usernameOrEmail?.[0]}
            />

            <FormField
              htmlFor="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={actionData?.errors?.password?.[0]}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.remember}
                onChange={handleInputChange}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Form action="/auth/google" method="post">
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <SocialButton provider="google" type="submit">
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10-7.584 10-10 0-0.665-0.056-1.311-0.155-1.938h-9.845z"
                      fill="#FFC107"
                    />
                    <path
                      d="M6.909 10.023l-2.927 2.195c0.603 1.82 2.359 3.137 4.43 3.137 1.693 0 3.17-0.864 4.045-2.169l-2.906-2.25c-0.302 0.498-0.858 0.835-1.49 0.835-0.689 0-1.286-0.405-1.564-0.992h-0.088c-0.148-0.246-0.234-0.534-0.234-0.843 0-0.289 0.075-0.562 0.207-0.796h-0.007c0.286-0.544 0.854-0.913 1.509-0.913 0.654 0 1.215 0.367 1.504 0.913h0.007l2.913-2.215c-0.874-1.316-2.351-2.18-4.044-2.18-2.071 0-3.827 1.317-4.43 3.137l2.927 2.195z"
                      fill="#FF3D00"
                    />
                    <path
                      d="M12 5.38v3.307h4.153c-0.187 0.821-0.549 1.561-1.077 2.166v0.001c-0.611 0.701-1.413 1.185-2.332 1.429v0l2.906 2.25c1.969-1.824 3.152-4.457 3.152-7.363 0-0.748-0.085-1.475-0.249-2.167h-6.553v0.377z"
                      fill="#4CAF50"
                    />
                    <path
                      d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10-7.584 10-10 0-0.665-0.056-1.311-0.155-1.938h-9.845z"
                      fill="none"
                    />
                  </svg>
                  Google
                </SocialButton>
              </Form>

              <SocialButton provider="facebook" onClick={() => alert("Facebook login not implemented yet")}>
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
                Facebook
              </SocialButton>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
