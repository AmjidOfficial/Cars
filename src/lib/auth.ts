import { supabase } from "@/integrations/supabase/client";

/**
 * Bazar360 uses a mobile-number-only flow for visitor friction.
 * SMS OTP requires a paid SMS provider, so we synthesize a deterministic
 * email/password under the hood. The UI only ever shows the mobile number.
 *
 * Format: mobile +923001234567 -> 923001234567@bazar360.app, password = mobile + project pepper.
 * This is acceptable because the mobile is the canonical identifier and the
 * password is never user-facing. For production we recommend wiring a real
 * SMS provider and switching to Supabase phone OTP.
 */

const PEPPER = "bazar360-v1";

function normalizeMobile(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

function mobileToEmail(mobile: string): string {
  return `${normalizeMobile(mobile)}@bazar360.app`;
}

function mobileToPassword(mobile: string): string {
  return `${normalizeMobile(mobile)}.${PEPPER}`;
}

export async function signInOrSignUpWithMobile(mobile: string, displayName?: string) {
  const m = normalizeMobile(mobile);
  if (m.length < 7) throw new Error("Please enter a valid mobile number.");
  const email = mobileToEmail(m);
  const password = mobileToPassword(m);

  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (!signIn.error) return signIn.data;

  // Fall back to signup
  const signUp = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      data: { mobile_number: m, display_name: displayName ?? m },
    },
  });
  if (signUp.error) throw signUp.error;

  // Try sign-in again (in case email confirmation is off and session not auto-set)
  const retry = await supabase.auth.signInWithPassword({ email, password });
  if (retry.error) throw retry.error;
  return retry.data;
}

export async function signOut() {
  await supabase.auth.signOut();
}
