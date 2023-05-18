export function getEnv(env: string) {
  return process.env[env];
}

export function getEnvOrElse(env: string, or: string) {
  const result = getEnv(env);

  return result ?? or;
}

export function getEnvOrElseGet(env: string, orElse: () => string) {
  const result = getEnv(env);

  if (result) {
    return result;
  }

  return orElse();
}
