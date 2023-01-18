import { v4 as uuid } from "uuid"
import { address } from "thor-devkit"
import { AddressUtils, debug, error, info, veWorldErrors, warn } from "~Common"
import { ContactType, Settings } from "~Model"
import { AppThunk, getAccount } from "~Storage/Caches"
import SettingService from "../SettingService"

export const addCachedContact =
    (addr: string): AppThunk<Promise<void>> =>
    async (dispatch, getState) => {
        debug("Adding cached contact")

        try {
            const existingAccount = getAccount(addr)(getState())
            if (existingAccount)
                return info("Cached address is an existing account")

            const addCachedContactUpdate = (settings: Settings) => {
                const existing = settings.contact.addressBook.find(ex =>
                    AddressUtils.compareAddresses(ex.address, addr),
                )

                if (existing)
                    return warn("Cached address is an existing contact")

                settings.contact.addressBook.push({
                    id: uuid(),
                    alias: "",
                    address: address.toChecksumed(addr),
                    type: ContactType.CACHE,
                })
            }

            await dispatch(SettingService.update(addCachedContactUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to add contact",
            })
        }
    }

export const addContact =
    (alias: string, addr: string): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Adding contact")

        try {
            const addContactUpdate = (settings: Settings) => {
                settings.contact.addressBook.push({
                    id: uuid(),
                    alias: alias,
                    address: address.toChecksumed(addr),
                    type: ContactType.KNOWN,
                })
            }

            await dispatch(SettingService.update(addContactUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to add contact",
            })
        }
    }
export const editContact =
    (
        id: string,
        newAddress: string,
        newAlias: string | undefined,
    ): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Editting contact")

        try {
            const editContactUpdate = (settings: Settings) => {
                const indexOfExisting = settings.contact.addressBook.findIndex(
                    existing => existing.id === id,
                )

                if (indexOfExisting < 0) {
                    throw veWorldErrors.rpc.resourceNotFound({
                        message: "contact_not_found",
                    })
                }

                settings.contact.addressBook[indexOfExisting] = {
                    id: settings.contact.addressBook[indexOfExisting].id,
                    alias: newAlias || "",
                    address: address.toChecksumed(newAddress),
                    type: ContactType.KNOWN,
                }
            }

            await dispatch(SettingService.update(editContactUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to edit contact",
            })
        }
    }
export const removeContact =
    (id: string): AppThunk<Promise<void>> =>
    async dispatch => {
        debug("Removing contact")

        try {
            const removeContactUpdate = (settings: Settings) => {
                const indexOfExisting = settings.contact.addressBook.findIndex(
                    existing => existing.id === id,
                )

                if (indexOfExisting < 0) {
                    return warn("No contact found with address: " + address)
                }

                settings.contact.addressBook.splice(indexOfExisting, 1)
            }

            await dispatch(SettingService.update(removeContactUpdate))
        } catch (e) {
            error(e)
            throw veWorldErrors.rpc.internal({
                error: e,
                message: "Failed to remove contact",
            })
        }
    }
