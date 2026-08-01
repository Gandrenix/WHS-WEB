import { signOutAction } from '@/features/auth';

export async function POST() {
  return await signOutAction();
}
