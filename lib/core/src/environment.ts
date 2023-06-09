export function getEnv(env: string) {
  return process.env[env];
}

export function getEnvOrElse(env: string, or: string) {
  const result = getEnv(env);

  return result ?? or;
}

export function getEnvOrElseGet(env: string, orElse: () => string) {
  const result = getEnv(env);

  return result ?? orElse();
}

export function getEnvOrThrow(env: string) {
  const result = getEnv(env);

  if (result === undefined) {
    throw new Error(`Environment variable ${env} is not set`);
  }

  return result;
}
