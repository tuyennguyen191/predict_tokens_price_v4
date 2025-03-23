import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { supabase } from "~/utils/supabase.server";
import { createUserSession } from "~/utils/session.server";

// This route handles the Google OAuth flow
export async function loader({ request }: LoaderFunctionArgs) {
  // Get the URL parameters
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const redirectTo = url.searchParams.get("redirectTo") || "/";

  // If there's an error, redirect to login with the error
  if (error) {
    return redirect(`/login?error=${error}`);
  }

  // If there's no code, redirect to login
  if (!code) {
    return redirect("/login");
  }

  try {
    // Exchange the code for a session
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);

    if (authError || !data.user) {
      console.error("Error exchanging code for session:", authError);
      return redirect(`/login?error=Authentication failed`);
    }

    // Get or create the user in our database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.user.email)
      .single();

    let userId;

    if (userError || !userData) {
      // User doesn't exist in our database, create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            email: data.user.email,
            username: data.user.email.split('@')[0], // Use part of email as username
            password: '', // No password for OAuth users
          }
        ])
        .select()
        .single();

      if (createError || !newUser) {
        console.error("Error creating user:", createError);
        return redirect(`/login?error=Failed to create user account`);
      }

      userId = newUser.id;
    } else {
      userId = userData.id;
    }

    // Create a session for the user
    return createUserSession({
      request,
      userId,
      remember: true, // Always remember OAuth users
      redirectTo: redirectTo as string,
    });
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    return redirect(`/login?error=Authentication failed`);
  }
}

// This action is used to initiate the Google OAuth flow
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const redirectTo = formData.get("redirectTo") || "/";

  try {
    // Generate the Google OAuth URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${new URL(request.url).origin}/auth/google?redirectTo=${redirectTo}`,
      },
    });

    if (error || !data.url) {
      console.error("Error generating Google OAuth URL:", error);
      return redirect(`/login?error=Failed to initiate Google login`);
    }

    // Redirect to the Google OAuth URL
    return redirect(data.url);
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    return redirect(`/login?error=Failed to initiate Google login`);
  }
}
