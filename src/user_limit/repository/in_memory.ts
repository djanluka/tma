import { CreatedEventPayload, ProgressChangedEventPayload, ResetEventPayload, UserLimit } from '../types.js';

class Result {
  constructor(
    public readonly success: boolean,
    public readonly error?: string
  ) {}

  // Helper method
  isOk(): boolean {
    return this.success;
  }

  // Static factory methods
  static success(): Result {
    return new Result(true);
  }

  static fail(error: string): Result {
    return new Result(false, error);
  }
}


// Repository
export interface UserLimitRepository {
  create(payload: CreatedEventPayload): Promise<Result>;
  updateProgress(payload: ProgressChangedEventPayload): Promise<Result>;
  resetProgress(payload: ResetEventPayload): Promise<Result>;
  // findById(userLimitId: string): Promise<UserLimit | null>;
}

export class InMemoryUserLimitRepository implements UserLimitRepository {
  private limits: Map<string, UserLimit> = new Map();

  async create(payload: CreatedEventPayload): Promise<Result> {
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

    return Promise.resolve(Result.success())
  }

  async updateProgress(payload: ProgressChangedEventPayload): Promise<Result> {
    const ul = this.limits.get(payload.userLimitId);
    if (!ul) {
      return Promise.resolve(Result.fail(`Not found: ${payload.userLimitId}`));
    }

    // Check progress calculation
    const value = parseFloat(ul.value);
    const previousProgress = parseFloat(payload.previousProgress);
    const amount = parseFloat(payload.amount);
    const remainingAmount = parseFloat(payload.remainingAmount);
    if (value !== previousProgress + amount + remainingAmount) {
      return Promise.resolve(Result.fail(`Failed progress calculation for: ${payload.userLimitId}`));
    }

    // Update progress and update UserLimit
    ul.nextResetTime = payload.nextResetTime;
    ul.progress = (previousProgress + amount).toString();
    this.limits.set(ul.userLimitId, ul)

    return Promise.resolve(Result.success())
  }

  async resetProgress(payload: ResetEventPayload): Promise<Result> {
    const ul = this.limits.get(payload.userLimitId);
    if (!ul) {
      return Promise.resolve(Result.fail(`Not found: ${payload.userLimitId}`));
    }

    // Reset progress and update UserLimit
    ul.nextResetTime = payload.nextResetTime;
    ul.progress = "0";
    ul.previousLimitValue = ul.value;
    this.limits.set(ul.userLimitId, ul)

    return Promise.resolve(Result.success())
  }

  // async findById(userLimitId: string): Promise<UserLimit | null> {
  //   return this.limits.get(userLimitId) || null;
  // }
}