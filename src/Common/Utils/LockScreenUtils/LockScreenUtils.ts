export const isHideSplash = (
    appLockStatusInactive: boolean,
    isWalletSecurityPassword: boolean,
) => {
    return appLockStatusInactive || isWalletSecurityPassword
}

export const isLockScreenFlow = (
    appLockStatusInactive: boolean,
    isWalletSecurityPassword: boolean,
) => {
    return appLockStatusInactive && isWalletSecurityPassword
}

export const isBiometricLockFlow = (
    appLockStatusInactive: boolean,
    isWalletSecurityBiometrics: boolean,
) => {
    return appLockStatusInactive && isWalletSecurityBiometrics
}

export default {
    isHideSplash,
    isLockScreenFlow,
    isBiometricLockFlow,
}
