export const isActive = async (): Promise<void> => {
    await waitFor(element(by.text("You're finally one of us!")))
        .toBeVisible()
        .withTimeout(10_000)
}
