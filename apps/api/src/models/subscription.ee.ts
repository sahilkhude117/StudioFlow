import Base from "./base";
import User from "./user";
import UsageData from "./usage-data";
import { DateTime } from "luxon";
import { getPlanById } from "../helpers/billing/plans.ee";

class Subscription extends Base {
    static tableName = 'subscriptions';

    static jsonSchema = {
        type: 'object',
        required: [
          'userId',
          'paddleSubscriptionId',
          'paddlePlanId',
          'updateUrl',
          'cancelUrl',
          'status',
          'nextBillAmount',
          'nextBillDate',
        ],
    
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          paddleSubscriptionId: { type: 'string' },
          paddlePlanId: { type: 'string' },
          updateUrl: { type: 'string' },
          cancelUrl: { type: 'string' },
          status: { type: 'string' },
          nextBillAmount: { type: 'string' },
          nextBillDate: { type: 'string' },
          lastBillDate: { type: 'string' },
          cancellationEffectiveDate: { type: 'string' },
          deletedAt: { type: 'string' },
          createdAt: { type: 'string' },
          updatedAt: { type: 'string' },
        },
    };

    static relationMappings = () => ({
        user: {
          relation: Base.BelongsToOneRelation,
          modelClass: User,
          join: {
            from: 'subscription.user_id',
            to: 'users.id',
          },
        },
        usageData: {
          relation: Base.HasManyRelation,
          modelClass: UsageData,
          join: {
            from: 'subscriptions.id',
            to: 'usage_data.subscription_id',
          },
        },
        currentUsageData: {
          relation: Base.HasOneRelation,
          modelClass: UsageData,
          join: {
            from: 'subscriptions.id',
            to: 'usage_data.subscription_id',
          },
        },
    });

    get plan() {
        //@ts-ignore
        return getPlanById(this.paddlePlanId);
    }
    
    get isCancelledAndValid() {
        return (
            //@ts-ignore
          this.status === 'deleted' &&
          //@ts-ignore
          Number(this.cancellationEffectiveDate) >
            DateTime.now().startOf('day').toMillis()
        );
    }
    
    get isValid() {
        //@ts-ignore
        if (this.status === 'active') return true;
        //@ts-ignore
        if (this.status === 'past_due') return true;
        if (this.isCancelledAndValid) return true;
    
        return false;
    }
}

export default Subscription;