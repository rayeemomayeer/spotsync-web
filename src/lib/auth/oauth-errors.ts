/** Map Better Auth / OAuth redirect `error` query values to UI copy. */
export function oauthErrorMessage(params: URLSearchParams): string {
  const codes = new Set(params.getAll("error").filter(Boolean));
  if (codes.size === 0) return "";

  if (codes.has("account_not_linked")) {
    return "This Google email already has a SpotSync password account. Sign in with email/password, then try Google again.";
  }
  if (codes.has("session")) {
    return "Signed in with Google but session did not stick. Try again.";
  }
  if (codes.has("state_mismatch") || codes.has("please_restart_the_process")) {
    return "Google sign-in expired. Close the tab and try Continue with Google again.";
  }
  if (codes.has("access_denied")) {
    return "Google sign-in was cancelled.";
  }
  if (codes.has("unable_to_create_user") || codes.has("signup_disabled")) {
    return "Could not create account from Google. Try email signup.";
  }
  return "Google sign-in failed. Try again or use email.";
}
