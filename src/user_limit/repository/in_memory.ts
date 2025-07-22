import { UserLimit } from '../types.js';

// Repository
export interface UserLimitRepository {
  create(userLimit: UserLimit): Promise<boolean>;
  updateProgress(userLimit: UserLimit): Promise<boolean>;
  resetProgress(userLimitId: UserLimit): Promise<boolean>;
  // findById(userLimitId: string): Promise<UserLimit | null>;
}

export class InMemoryUserLimitRepository implements UserLimitRepository {
  private limits: Map<string, any> = new Map();

  async create(userLimit: UserLimit): Promise<boolean> {
    userLimit.progress = "0";
    this.limits.set(userLimit.userLimitId, userLimit)
    // if db connection doesn't work, return false
    return Promise.resolve(true)
  }

  async updateProgress(userLimit: UserLimit): Promise<boolean> {
    return Promise.resolve(true);
  }

  async resetProgress(userLimit: UserLimit): Promise<boolean> {
    const elem = this.limits.get(userLimit.userLimitId);
    if (!elem) {
      return Promise.resolve(false)
    }
    
    const ul = elem as UserLimit;
    ul.progress = "0";
    ul.nextResetTime = userLimit.nextResetTime;
    this.limits.set(userLimit.userLimitId, ul)
    return Promise.resolve(true)
  }

  // async findById(userLimitId: string): Promise<UserLimit | null> {
  //   return this.limits.get(userLimitId) || null;
  // }
}