import { UserLimit } from '../types.js';

// Repository
export interface UserLimitRepository {
  create(userLimit: UserLimit): Promise<boolean>;
  updateProgress(userLimit: UserLimit): Promise<void>;
  resetProgress(userLimitId: UserLimit): Promise<void>;
  // findById(userLimitId: string): Promise<UserLimit | null>;
}

export class InMemoryUserLimitRepository implements UserLimitRepository {
  private limits: Map<string, any> = new Map();

  async create(userLimit: UserLimit): Promise<boolean> {
    this.limits.set(userLimit.userLimitId, userLimit)
    // if db connection doesn't work, return false
    return Promise.resolve(true)
  }

  async updateProgress(userLimit: UserLimit) {
    // update
  }

  async resetProgress(userLimit: UserLimit) {
    // reset
  }

  // async findById(userLimitId: string): Promise<UserLimit | null> {
  //   return this.limits.get(userLimitId) || null;
  // }
}