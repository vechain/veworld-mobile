describe('Example', () => {
    beforeAll(async () => {
        await device.launchApp()
    })

    beforeEach(async () => {
        await device.reloadReactNative()
    })

    it('should have a button with the correct test', async () => {
        await expect(
            element(by.text('Press me to call a native function')),
        ).toBeVisible()
    })

    it('show message from native function on tap', async () => {
        await element(by.id('Button')).tap()
        await expect(element(by.text('Hello Vechain'))).toBeVisible()
    })
})
