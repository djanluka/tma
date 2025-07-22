import { UserLimitCreatedEvent, UserLimitProgressChangedEvent, UserLimitResetEvent } from '../types.js';

// Repository
export interface UserLimitRepository {
  create(userLimit: UserLimitCreatedEvent): Promise<void>;
  updateProgress(userLimit: UserLimitProgressChangedEvent): Promise<void>;
  resetProgress(userLimitId: UserLimitResetEvent): Promise<void>;
  // findById(userLimitId: string): Promise<UserLimit | null>;
}

export class InMemoryUserLimitRepository implements UserLimitRepository {
  private limits: Map<string, any> = new Map();

  async create(userLimit: UserLimitCreatedEvent) {
    // create
  }

  async updateProgress(userLimit: UserLimitProgressChangedEvent) {
    // update
  }

  async resetProgress(userLimit: UserLimitResetEvent) {
    // reset
  }

  // async findById(userLimitId: string): Promise<UserLimit | null> {
  //   return this.limits.get(userLimitId) || null;
  // }
}