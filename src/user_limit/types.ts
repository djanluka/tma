export enum LimitStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  FUTURE = 'FUTURE',
  IN_COOLDOWN = 'IN_COOLDOWN',
}

export enum LimitPeriod {
  CALENDAR_DAY = 'CALENDAR_DAY',
  CALENDAR_WEEK = 'CALENDAR_WEEK',
  CALENDAR_MONTH = 'CALENDAR_MONTH',
  DAY = 'DAY',
  INDEFINITE = 'INDEFINITE',
  INSTANCE = 'INSTANCE',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export enum LimitType {
  BALANCE = 'BALANCE',
  BET = 'BET',
  DEPOSIT = 'DEPOSIT',
  LOSS = 'LOSS',
  SESSION = 'SESSION',
}

export interface UserLimit {
  activeFrom: number;
  activeUntil?: number;
  brandId: string;
  createdAt?: number;
  currencyCode: string;
  nextResetTime?: number;
  period: LimitPeriod;
  previousLimitValue?: string;
  progress?: string;
  status: LimitStatus;
  type: LimitType;
  userId: string;
  userLimitId: string;
  value: string;
}

// Added types
export enum EventType {
  USER_LIMIT_CREATED = 'USER_LIMIT_CREATED',
  USER_LIMIT_PROGRESS_CHANGED = 'USER_LIMIT_PROGRESS_CHANGED',
  USER_LIMIT_RESET = 'USER_LIMIT_RESET',
}

interface BasePayload {
  brandId: string;
  currencyCode: string;
  nextResetTime: number;
  userId: string;
  userLimitId: string;
}

export interface CreatedEventPayload extends BasePayload {
  activeFrom: number;
  period: LimitPeriod;
  status: LimitStatus;
  type: LimitType;
  value: string;
}

export interface ProgressChangedEventPayload extends BasePayload {
  amount: string;
  previousProgress: string;
  remainingAmount: string;
  period: LimitPeriod;
}

export interface ResetEventPayload extends BasePayload {
  resetAmount: string;
  resetPercentage: string;
  type: LimitType;
  unusedAmount: string;
}

interface BaseEvent {
  aggregateId: string,
  context: any,
  createdAt: number,
  eventId: string,
  sequenceNumber: number,
  source: string,
}

export interface UserLimitCreatedEvent extends BaseEvent {
  type: EventType.USER_LIMIT_CREATED,
  payload: CreatedEventPayload,
}
export interface UserLimitProgressChangedEvent extends BaseEvent {
  type: EventType.USER_LIMIT_PROGRESS_CHANGED,
  payload: ProgressChangedEventPayload,
}
export interface UserLimitResetEvent extends BaseEvent {
  type: EventType.USER_LIMIT_RESET,
  payload: ResetEventPayload,
}

export type UserLimitEvent = UserLimitCreatedEvent | UserLimitProgressChangedEvent | UserLimitResetEvent;
