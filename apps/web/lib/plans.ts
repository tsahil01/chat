export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: PlanFeature[];
}

export const plans: Plan[] = [
  {
    id: "pro-plan",
    name: "Pro Plan",
    description: "Unlock unlimited conversations and advanced features",
    price: 9.99,
    features: [
      { name: "Unlimited messages", included: true },
      { name: "Advanced AI models", included: true },
      { name: "Priority support", included: true },
      { name: "File uploads", included: true },
      { name: "Custom integrations", included: true },
      { name: "Export conversations", included: true },
    ],
  },
];

export const getPlanById = (id: string): Plan | undefined => {
  return plans.find((plan) => plan.id === id);
};
