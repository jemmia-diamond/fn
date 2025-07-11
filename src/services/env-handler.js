export async function customizeEnv(env) {
  try {
    env.BEARER_TOKEN_SECRET = await env.BEARER_TOKEN_SECRET.get();
    env.STRINGEE_KEY_SECRET = await env.STRINGEE_KEY_SECRET.get();
    env.STRINGEE_SID_SECRET = await env.STRINGEE_SID_SECRET.get();
  } catch {
    env.BEARER_TOKEN_SECRET = null;
    env.STRINGEE_KEY_SECRET = null;
    env.STRINGEE_SID_SECRET = null;
  }
  return env;
}
