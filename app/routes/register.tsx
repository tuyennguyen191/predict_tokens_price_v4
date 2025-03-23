import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { z } from "zod";

import { createUser, getUserByEmail, getUserByUsername } from "~/models/user.server";
import { createUserSession, getUser } from "~/utils/session.server";
import { registerSchema } from "~/utils/validation";
import { FormField } from "~/components/FormField";
import { Button } from "~/components/Button";

export const meta: MetaFunction = () => {
  return [{ title: "Register" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getUser(request);
  if (user) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const rawFormData = Object.fromEntries(formData);
  
  try {
    const { email, username, password, redirectTo } = registerSchema.parse({
      email: formData.get("email"),
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: formData.get("redirectTo") || "/",
    });

    // Check if email is already in use
    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      return json(
        { errors: { email: ["A user already exists with this email"] }, values: rawFormData },
        { status: 400 }
      );
    }

    // Check if username is already in use
    const existingUserByUsername = await getUserByUsername(username);
    if (existingUserByUsername) {
      return json(
        { errors: { username: ["A user already exists with this username"] }, values: rawFormData },
        { status: 400 }
      );
    }

    // Create the user
    console.log('Creating new user:', { email, username });
    const user = await createUser(email, username, password);
    console.log('User created successfully:', user.id);

    // Create user session
    return createUserSession({
      request,
      userId: user.id,
      remember: false,
      redirectTo,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return json(
        { errors: fieldErrors, values: rawFormData },
        { status: 400 }
      );
    }
    
    // Handle database errors or other issues
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return json(
      { errors: { form: errorMessage }, values: rawFormData },
      { status: 500 }
    );
  }
};

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [formData, setFormData] = useState({
    email: actionData?.values?.email || "",
    username: actionData?.values?.username || "",
    password: actionData?.values?.password || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create a new account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {actionData?.errors?.form ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{actionData.errors.form}</span>
          </div>
        ) : null}

        <Form method="post" className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <FormField
              htmlFor="email"
              label="Email address"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={actionData?.errors?.email?.[0]}
            />

            <FormField
              htmlFor="username"
              label="Username"
              value={formData.username}
              onChange={handleInputChange}
              error={actionData?.errors?.username?.[0]}
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

          <div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
