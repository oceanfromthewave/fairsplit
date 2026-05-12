export function displayName(user: {
  name: string | null;
  email: string;
}): string {
  if (user.name?.trim()) return user.name.trim();
  const [local] = user.email.split("@");
  return local ?? user.email;
}
