import { waitFor, element } from "detox"
import { LONG_TIMEOUT } from "../constants"
import { ContactsScreen } from "../screens"
import { clickById, clickByText, idShouldBeVisible, idShouldExist, textShouldExist } from "../common"

export const goToAddContactScreen = async () => {
    if (await ContactsScreen.isContactsListEmpty()) {
        await clickByText("Create contact")
    } else {
        await clickById("Add_Contact_Button")
    }
}

export const addNewContact = async (name: string, address: string) => {
    await clickById("Contact-Name-Input")

    await element(by.id("Contact-Name-Input")).replaceText(name)

    await clickById("Contact-Address-Input")

    await element(by.id("Contact-Address-Input")).replaceText(address)

    //Close keyboard
    await element(by.text("Add Contact")).atIndex(0).tap()

    await element(by.id("Add_Contact_Button")).tap()
}

export const deleteContact = async (name: string) => {
    await idShouldBeVisible(`${name}-contact-box`)

    await element(by.id(`${name}-contact-box`)).swipe("left", "slow", 0.4)
    await clickById("DeleteUnderlay_DeleteIcon")
    await clickByText("REMOVE", { timeout: LONG_TIMEOUT })
}

export const editContact = async (name: string, newName: string, newAddress: string) => {
    await clickByText(name)

    await clickById("Contact-Name-Input")

    await element(by.id("Contact-Name-Input")).replaceText(newName)

    //Hide keyboard
    await clickByText("Edit contact")

    await clickById("Contact-Address-Input")

    await element(by.id("Contact-Address-Input")).replaceText(newAddress)

    //Hide keyboard
    await clickByText("Edit contact")

    await clickByText("SAVE")
}

export const verifyContactExists = async (name: string, address: string) => {
    await clickById(`${address}-${name}`, { timeout: LONG_TIMEOUT })

    await textShouldExist(address)
    await clickByText("SAVE")
}

export const isInEditContactScreen = async () => {
    await idShouldExist("contacts-screen-title")
}

export const scrollToContact = async (name: string) => {
    await waitFor(element(by.text(name)))
        .toBeVisible()
        .whileElement(by.id("contacts-list"))
        .scroll(200, "down")
}
