import { UserLimit } from '../types.js';

// Repository
export interface UserLimitRepository {
  create(userLimit: UserLimit): Promise<void>;
  updateProgress(userLimit: UserLimit): Promise<void>;
  resetProgress(userLimitId: UserLimit): Promise<void>;
  // findById(userLimitId: string): Promise<UserLimit | null>;
}

export class InMemoryUserLimitRepository implements UserLimitRepository {
  private limits: Map<string, any> = new Map();

  async create(userLimit: UserLimit) {
    // create
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