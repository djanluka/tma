import { CreatedEventPayload, ProgressChangedEventPayload, ResetEventPayload, UserLimit } from '../types.js';

class RepositoryResult {
  constructor(
    public readonly success: boolean,
    public readonly error?: string
  ) {}

  // Helper method
  isOk(): boolean {
    return this.success;
  }

  // Static factory methods
  static success(): RepositoryResult {
    return new RepositoryResult(true);
  }

  static fail(error: string): RepositoryResult {
    return new RepositoryResult(false, error);
  }
}


// Repository
export interface UserLimitRepository {
  create(payload: CreatedEventPayload): Promise<RepositoryResult>;
  updateProgress(payload: ProgressChangedEventPayload): Promise<RepositoryResult>;
  resetProgress(payload: ResetEventPayload): Promise<RepositoryResult>;
  // findById(userLimitId: string): Promise<UserLimit | null>;
}

export class InMemoryUserLimitRepository implements UserLimitRepository {
  private limits: Map<string, UserLimit> = new Map();

  async create(payload: CreatedEventPayload): Promise<RepositoryResult> {
    const ul: UserLimit = {
      activeFrom: payload.activeFrom,
      brandId: payload.brandId,
      createdAt: Date.now(),
      currencyCode: payload.currencyCode,
      nextResetTime: payload.nextResetTime,
      period: payload.period,
      progress: "0",
      status: payload.status,
      type: payload.type,
      userId: payload.userId,
      userLimitId: payload.userLimitId,
      value: payload.value
    };
    this.limits.set(ul.userLimitId, ul)

    return Promise.resolve(RepositoryResult.success())
  }

  async updateProgress(payload: ProgressChangedEventPayload): Promise<RepositoryResult> {
    const ul = this.limits.get(payload.userLimitId);
    if (!ul) {
      return Promise.resolve(RepositoryResult.fail(`Not found: ${payload.userLimitId}`));
    }

    // Check progress calculation
    const value = parseFloat(ul.value);
    const previousProgress = parseFloat(payload.previousProgress);
    const amount = parseFloat(payload.amount);
    const remainingAmount = parseFloat(payload.remainingAmount);
    if (value !== previousProgress + amount + remainingAmount) {
      return Promise.resolve(RepositoryResult.fail(`Failed progress calculation for: ${payload.userLimitId}`));
    }

    // Update progress and update UserLimit
    ul.nextResetTime = payload.nextResetTime;
    ul.progress = (previousProgress + amount).toString();
    this.limits.set(ul.userLimitId, ul)

    return Promise.resolve(RepositoryResult.success())
  }

  async resetProgress(payload: ResetEventPayload): Promise<RepositoryResult> {
    const ul = this.limits.get(payload.userLimitId);
    if (!ul) {
      return Promise.resolve(RepositoryResult.fail(`Not found: ${payload.userLimitId}`));
    }

    // Reset progress and update UserLimit
    ul.nextResetTime = payload.nextResetTime;
    ul.progress = "0";
    ul.previousLimitValue = ul.value;
    this.limits.set(ul.userLimitId, ul)

    return Promise.resolve(RepositoryResult.success())
  }

  // async findById(userLimitId: string): Promise<UserLimit | null> {
  //   return this.limits.get(userLimitId) || null;
  // }
}