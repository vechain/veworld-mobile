import { IconKey } from "~Model"

export type PaymentMethod = {
    id: string
    icon: IconKey
}

export enum PaymentMethodsIds {
    CreditCard = "credit-card",
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
}
