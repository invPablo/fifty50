const EMAIL_VERIFICATION_DAYS = 30;

export function getDaysUntilExpiry(createdAt: string | null | undefined): number {
  if (!createdAt) return EMAIL_VERIFICATION_DAYS;

  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = created.getTime() + EMAIL_VERIFICATION_DAYS * 24 * 60 * 60 * 1000 - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

export function isEmailVerificationExpired(createdAt: string | null | undefined): boolean {
  return getDaysUntilExpiry(createdAt) === 0;
}
