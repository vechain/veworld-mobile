import { waitFor, element } from "detox"
import { DEFAULT_TIMEOUT, LONG_TIMEOUT } from "../constants"
import { clickById, clickByText, isPresentText } from "../common"

export const goToContactsManagement = async () => {
    await waitFor(element(by.id("settings-tab")))
        .toExist()
        .withTimeout(LONG_TIMEOUT)

    await element(by.id("settings-tab")).tap()

    await waitFor(element(by.text("Contacts")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.text("Contacts")).tap()
}

export const goToTokensManagementScreen = async () => {
    await element(by.id("EditTokensBar_BaseIcon_manageToken")).tap()
}

export const goToSettings = async () => {
    await clickById("settings-tab")
}

export const goToSend = async () => {
    await clickByText("Send")
}

export const isPinRequested = async () => {
    return await isPresentText("Insert your 6-digit PIN")
}
