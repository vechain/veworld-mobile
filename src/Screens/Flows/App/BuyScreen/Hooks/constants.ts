export type PaymentMethod = {
    id: string
    icon: string
}

export enum PaymentMethodsIds {
    CreditCard = "credit-card",
    BankAccount = "bank",
}

export const PaymentMethodsList: Record<PaymentMethodsIds, PaymentMethod> = {
    [PaymentMethodsIds.CreditCard]: {
        id: PaymentMethodsIds.CreditCard,
        icon: "credit-card-outline",
    },
    [PaymentMethodsIds.BankAccount]: {
        id: PaymentMethodsIds.BankAccount,
        icon: "bank-outline",
    },
}
