import Subscription from "../../models/subscription.ee";
import Billing from "./index.ee";
//@ts-ignore
const handleSubscriptionCreated = async (request) => {
    //@ts-ignore
    const subscription = await Subscription.query().insertAndFetch(
        //@ts-ignore
      formatSubscription(request)
    );
    await subscription
      .$relatedQuery('usageData')
      .insert(formatUsageData(request));
};
//@ts-ignore
const handleSubscriptionUpdated = async (request) => {
    await Subscription.query()
      .findOne({
        paddle_subscription_id: request.body.subscription_id,
      })//@ts-ignore
      .patch(formatSubscription(request));
};
//@ts-ignore
const handleSubscriptionCancelled = async (request) => {
    const subscription = await Subscription.query().findOne({
      paddle_subscription_id: request.body.subscription_id,
    });
  //@ts-ignore
    await subscription.$query().patchAndFetch(formatSubscription(request));
};
//@ts-ignore
const handleSubscriptionPaymentSucceeded = async (request) => {
    const subscription = await Subscription.query()
      .findOne({
        paddle_subscription_id: request.body.subscription_id,
      })
      .throwIfNotFound();
  
    const remoteSubscription = await Billing.paddleClient.getSubscription(
        //@ts-ignore
      Number(subscription.paddleSubscriptionId)
    );
  
    await subscription.$query().patch({
        //@ts-ignore
      nextBillAmount: remoteSubscription.next_payment.amount.toFixed(2),
      nextBillDate: remoteSubscription.next_payment.date,
      lastBillDate: remoteSubscription.last_payment.date,
    });
  
    await subscription
      .$relatedQuery('usageData')
      .insert(formatUsageData(request));
};
//@ts-ignore
const formatSubscription = (request) => {
    return {
      userId: JSON.parse(request.body.passthrough).id,
      paddleSubscriptionId: request.body.subscription_id,
      paddlePlanId: request.body.subscription_plan_id,
      cancelUrl: request.body.cancel_url,
      updateUrl: request.body.update_url,
      status: request.body.status,
      nextBillDate: request.body.next_bill_date,
      nextBillAmount: request.body.unit_price,
      cancellationEffectiveDate: request.body.cancellation_effective_date,
    };
};//@ts-ignore

const formatUsageData = (request) => {
    return {
      userId: JSON.parse(request.body.passthrough).id,
      consumedTaskCount: 0,
      nextResetAt: request.body.next_bill_date,
    };
};

const webhooks = {
    handleSubscriptionCreated,
    handleSubscriptionUpdated,
    handleSubscriptionCancelled,
    handleSubscriptionPaymentSucceeded,
};
  
export default webhooks;