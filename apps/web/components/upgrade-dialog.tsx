"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { plans } from "@/lib/plans";
import { authClient } from "@/lib/auth-client";
import { User } from "better-auth";
import { useState } from "react";
import { BillingAddress } from "dodopayments/resources/payments.mjs";
import {
  CountrySelect,
  StateSelect,
  CitySelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";

interface UpgradeDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeDialog({
  user,
  open,
  onOpenChange,
}: UpgradeDialogProps) {
  const plan = plans[0]; // Get the Pro plan
  const [billing, setBilling] = useState<BillingAddress | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [showBillingForm, setShowBillingForm] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);

  if (!plan) {
    return null;
  }

  const handleUpgrade = async (planId: string, billing: BillingAddress) => {
    setLoading(true);
    const { data: checkout, error } = await authClient.dodopayments.checkout({
      slug: planId,
      customer: {
        email: user.email,
        name: user.name,
      },
      billing,
      referenceId: `order_${planId}`,
    });

    console.log("checkout", checkout);
    console.log("error", error);

    if (checkout) {
      window.location.href = checkout.url;
    }
    onOpenChange(false);
  };

  const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (billing) {
      handleUpgrade(plan.id, billing);
    }
  };

  const handleBackToFeatures = () => {
    setShowBillingForm(false);
    setBilling(undefined);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl">
              Upgrade to {plan.name}
            </DialogTitle>
            <DialogDescription className="text-base">
              {plan.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Price Display */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Billed monthly, cancel anytime
              </p>
            </div>

            {!showBillingForm ? (
              <>
                {/* Features List */}
                <div className="space-y-4">
                  <h4 className="font-medium">What's included</h4>
                  <div className="grid gap-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-sm leading-relaxed">
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    onClick={() => setShowBillingForm(true)}
                    size="lg"
                    className="w-full"
                  >
                    Upgrade to {plan.name}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="w-full"
                  >
                    Maybe later
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Billing Form */}
                <form onSubmit={handleBillingSubmit} className="space-y-4">
                  <h4 className="font-medium">Billing Information</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={billing?.street || ""}
                        onChange={(e) =>
                          setBilling((prev) =>
                            prev
                              ? { ...prev, street: e.target.value }
                              : {
                                  street: e.target.value,
                                  city: "",
                                  state: "",
                                  zipcode: "",
                                  country: "US",
                                },
                          )
                        }
                        placeholder="123 Main St"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <CountrySelect
                          value={selectedCountry}
                          onChange={(value: any) => {
                            setSelectedCountry(value);
                            setSelectedState(null);
                            setSelectedCity(null);
                            setBilling((prev) =>
                              prev
                                ? { ...prev, country: value?.isoCode || "US" }
                                : {
                                    street: "",
                                    city: "",
                                    state: "",
                                    zipcode: "",
                                    country: value?.isoCode || "US",
                                  },
                            );
                          }}
                          placeHolder="Select Country"
                          containerClassName="w-full h-auto"
                          inputClassName="flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ border: "none", boxShadow: "none" }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>State</Label>
                        <StateSelect
                          countryid={selectedCountry?.id}
                          value={selectedState}
                          onChange={(value: any) => {
                            setSelectedState(value);
                            setSelectedCity(null);
                            setBilling((prev) =>
                              prev
                                ? { ...prev, state: value?.name || "" }
                                : {
                                    street: "",
                                    city: "",
                                    state: value?.name || "",
                                    zipcode: "",
                                    country: selectedCountry?.isoCode || "US",
                                  },
                            );
                          }}
                          placeHolder="Select State"
                          containerClassName="w-full h-auto"
                          inputClassName="flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ border: "none", boxShadow: "none" }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <CitySelect
                          countryid={selectedCountry?.id}
                          stateid={selectedState?.id}
                          value={selectedCity}
                          onChange={(value: any) => {
                            setSelectedCity(value);
                            setBilling((prev) =>
                              prev
                                ? { ...prev, city: value?.name || "" }
                                : {
                                    street: "",
                                    city: value?.name || "",
                                    state: selectedState?.name || "",
                                    zipcode: "",
                                    country: selectedCountry?.isoCode || "US",
                                  },
                            );
                          }}
                          placeHolder="Select City"
                          containerClassName="w-full h-auto"
                          inputClassName="flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ border: "none", boxShadow: "none" }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zipcode">ZIP Code</Label>
                        <Input
                          id="zipcode"
                          value={billing?.zipcode || ""}
                          onChange={(e) =>
                            setBilling((prev) =>
                              prev
                                ? { ...prev, zipcode: e.target.value }
                                : {
                                    street: "",
                                    city: selectedCity?.name || "",
                                    state: selectedState?.name || "",
                                    zipcode: e.target.value,
                                    country: selectedCountry?.isoCode || "US",
                                  },
                            )
                          }
                          placeholder="94103"
                          className="w-full h-auto"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={loading}
                    >
                      {"Complete Upgrade"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleBackToFeatures}
                      className="w-full"
                    >
                      Back to features
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
