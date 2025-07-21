import { UserLimit } from '../types';

// Repository
export interface UserLimitRepository {
  create(userLimit: Omit<UserLimit, 'createdAt'>): Promise<UserLimit>;
  updateProgress(userLimitId: string, progress: string): Promise<UserLimit | null>;
  resetProgress(userLimitId: string): Promise<UserLimit | null>;
  findById(userLimitId: string): Promise<UserLimit | null>;
}

export class InMemoryUserLimitRepository implements UserLimitRepository {
  private limits: Map<string, UserLimit> = new Map();

  async create(userLimit: Omit<UserLimit, 'createdAt'>): Promise<UserLimit> {
    const now = Date.now();
    const newLimit: UserLimit = {
      ...userLimit,
      createdAt: now,
      progress: userLimit.progress || '0',
    };
    this.limits.set(userLimit.userLimitId, newLimit);
    return newLimit;
  }

  async updateProgress(userLimitId: string, progress: string): Promise<UserLimit | null> {
    const limit = this.limits.get(userLimitId);
    if (!limit) return null;

    const updatedLimit: UserLimit = {
      ...limit,
      progress,
    };
    this.limits.set(userLimitId, updatedLimit);
    return updatedLimit;
  }

  async resetProgress(userLimitId: string): Promise<UserLimit | null> {
    return this.updateProgress(userLimitId, '0');
  }

  async findById(userLimitId: string): Promise<UserLimit | null> {
    return this.limits.get(userLimitId) || null;
  }
}