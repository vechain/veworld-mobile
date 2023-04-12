export const enrollBiometrics = async (isEnrolled: boolean) => {
    await detox.device.setBiometricEnrollment(isEnrolled)
}
