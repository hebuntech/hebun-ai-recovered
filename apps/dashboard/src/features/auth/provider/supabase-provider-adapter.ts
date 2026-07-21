import type {
  AuthenticationProvider,
  AuthenticationProviderRequest,
} from "./authentication-provider";

/** Supabase-specific marker without an SDK dependency or implementation. */
export interface SupabaseAuthenticationProvider extends AuthenticationProvider {
  readonly provider: "supabase";
}

export interface SupabaseServerClientFactory<Client> {
  createClient(request: AuthenticationProviderRequest): Client;
}
