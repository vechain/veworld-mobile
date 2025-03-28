import { IconKey } from "~Model"

export type PaymentMethod = {
    id: string
    icon: IconKey
}

export enum PaymentMethodsIds {
    CreditCard = "credit-card",
    ApplePay = "apple-pay",
    GoolePay = "google-pay",
    BankAccount = "bank",
}

export const PaymentMethodsList: Record<PaymentMethodsIds, PaymentMethod> = {
    [PaymentMethodsIds.CreditCard]: {
        id: PaymentMethodsIds.CreditCard,
        icon: "icon-credit-card",
    },
    [PaymentMethodsIds.BankAccount]: {
        id: PaymentMethodsIds.BankAccount,
        icon: "icon-landmark",
    },
    [PaymentMethodsIds.GoolePay]: {
        id: PaymentMethodsIds.GoolePay,
        icon: "icon-circle", //Just placeholder icon will be overrided since the icon does not exits
    },
    [PaymentMethodsIds.ApplePay]: {
        id: PaymentMethodsIds.ApplePay,
        icon: "icon-circle", //Just placeholder icon will be overrided since the icon does not exits
    },
}
