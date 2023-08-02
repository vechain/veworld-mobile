import { waitFor, element } from "detox"
import { DEFAULT_TIMEOUT, LONG_TIMEOUT } from "../constants"
import { ContactsScreen } from "../screens"
import { clickById, clickByText } from "../common"

export const goToAddContactScreen = async () => {
    if (await ContactsScreen.isContactsListEmpty()) {
        await element(by.text("Create contact")).tap()
    } else {
        await element(by.id("Add_Contact_Button")).tap()
    }
}

export const addNewContact = async (name: string, address: string) => {
    await waitFor(element(by.id("Contact-Name-Input")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.id("Contact-Name-Input")).tap()

    await element(by.id("Contact-Name-Input")).replaceText(name)

    await waitFor(element(by.id("Contact-Address-Input")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.id("Contact-Address-Input")).tap()

    await element(by.id("Contact-Address-Input")).replaceText(address)

    //Close keyboard
    await element(by.text("Add Contact")).atIndex(0).tap()

    await element(by.id("Add_Contact_Button")).tap()
}

export const deleteContact = async (name: string) => {
    await waitFor(element(by.id(`${name}-contact-box`)))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.id(`${name}-contact-box`)).swipe("left", "slow", 0.4)
    await clickById("DeleteUnderlay_DeleteIcon")
    await waitFor(element(by.text("REMOVE")))
        .toBeVisible()
        .withTimeout(LONG_TIMEOUT)

    await element(by.text("REMOVE")).tap()
}

export const editContact = async (
    name: string,
    newName: string,
    newAddress: string,
) => {
    await waitFor(element(by.text(name)))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.text(name)).tap()

    await waitFor(element(by.id("Contact-Name-Input")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.id("Contact-Name-Input")).tap()

    await element(by.id("Contact-Name-Input")).replaceText(newName)

    //Hide keyboard
    await element(by.text("Edit contact")).tap()

    await waitFor(element(by.id("Contact-Address-Input")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.id("Contact-Address-Input")).tap()

    await element(by.id("Contact-Address-Input")).replaceText(newAddress)

    //Hide keyboard
    await element(by.text("Edit contact")).tap()

    await waitFor(element(by.text("SAVE")))
        .toBeVisible()
        .withTimeout(DEFAULT_TIMEOUT)

    await element(by.text("SAVE")).tap()
}

export const verifyContactExists = async (name: string, address: string) => {
    await waitFor(element(by.id(`${address}-${name}`)))
        .toBeVisible()
        .withTimeout(LONG_TIMEOUT)

    await element(by.id(`${address}-${name}`)).tap()

    await waitFor(element(by.text(address)))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
    await clickByText("SAVE")
}

export const isInEditContactScreen = async () => {
    await waitFor(element(by.id("contacts-screen-title")))
        .toExist()
        .withTimeout(DEFAULT_TIMEOUT)
}

export const scrollToContact = async (name: string) => {
    await waitFor(element(by.text(name)))
        .toBeVisible()
        .whileElement(by.id("contacts-list"))
        .scroll(200, "down")
}
