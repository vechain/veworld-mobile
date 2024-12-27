export const RequestMethods = {
    SIGN_CERTIFICATE: "thor_signCertificate",
    REQUEST_TRANSACTION: "thor_sendTransaction",
    PERSONAL_SIGN: "personal_sign",
    SIGN_TYPED_DATA: "thor_signTypedData",
    CONNECT: "eth_requestAccounts",
    REVOKE_PERMISSION: "wallet_revokePermissions",
}

export enum EventTypes {
    AccountsChanged = "accountsChanged",
}
