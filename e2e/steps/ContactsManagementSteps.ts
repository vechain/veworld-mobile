import { Given, Then, When } from "@cucumber/cucumber"
import {
    LONG_TIMEOUT,
    EXAMPLE_CONTACTS,
    ContactsScreen,
    HomeFlows,
    ContactsManagementFlows,
    textShouldBeVisible,
    textShouldNotBeVisible,
} from "../helpers"

Given(
    "The user is in the contacts management screen",
    { timeout: -1 },
    async () => {
        if (!(await ContactsScreen.isActive())) {
            await HomeFlows.goToContactsManagement()
        }
    },
)

When(
    "The user adds a new contact name {string} and address {string}",
    { timeout: -1 },
    async (name: string, address: string) => {
        await ContactsManagementFlows.goToAddContactScreen()
        await ContactsManagementFlows.addNewContact(name, address)
    },
)

When(
    "The user edits the contact with name {string} to name {string} and address {string}",
    { timeout: -1 },
    async (name: string, newName: string, newAddress: string) => {
        await ContactsManagementFlows.editContact(name, newName, newAddress)
    },
)

When(
    "The user deletes the contact with name {string}",
    { timeout: -1 },
    async (name: string) => {
        await ContactsManagementFlows.deleteContact(name)
    },
)

When(
    "the user adds {string} contacts",
    { timeout: -1 },
    async (count: string) => {
        for (let i = 0; i < Number(count) && i < EXAMPLE_CONTACTS.length; i++) {
            await ContactsManagementFlows.goToAddContactScreen()
            await ContactsManagementFlows.addNewContact(
                EXAMPLE_CONTACTS[i].name,
                EXAMPLE_CONTACTS[i].address,
            )
        }
    },
)

Then(
    "The user should see contact with name {string} in contacts list",
    { timeout: -1 },
    async (name: string) => {
        await textShouldBeVisible(name, { timeout: LONG_TIMEOUT })
    },
)

Then(
    "The user should not see contact with name {string} in contacts list",
    async (name: string) => {
        await textShouldNotBeVisible(name)
    },
)

Then(
    "The user should see contact with name {string} and address {string} in contacts list",
    { timeout: -1 },
    async (name: string, address: string) => {
        await ContactsManagementFlows.verifyContactExists(name, address)
    },
)

Then("The user should see the address exists error message", async () => {
    await textShouldBeVisible("Address already exists in contacts")
})

Then("The user should see the address invalid error message", async () => {
    await textShouldBeVisible("Please enter a valid Vechain address")
})

Then(
    "the user should be able to scroll to the contact {string}",
    { timeout: -1 },
    async (name: string) => {
        await ContactsManagementFlows.scrollToContact(name)
    },
)
