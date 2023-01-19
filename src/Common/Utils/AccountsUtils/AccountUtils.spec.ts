// import { searchForAccount } from "./AccountUtils"

// import {
//     account1D1,
//     account2D1,
//     account1D2,
//     getContact,
// } from "../../../test/helpers/data"
// import { ContactType } from "~Model/Contact/enum"

// describe("searchForAccount - positive tests", () => {
//     test("visible account", () => {
//         expect(
//             searchForAccount(
//                 account1D1.address,
//                 [account1D1, account2D1, account1D2],
//                 [getContact(0, ContactType.KNOWN)],
//                 [getContact(1, ContactType.CACHE)],
//             ),
//         ).toEqual(account1D1)
//     })

//     test("known contact", () => {
//         const knownContact1 = getContact(0, ContactType.KNOWN)
//         const cachedContact1 = getContact(10, ContactType.CACHE)
//         expect(
//             searchForAccount(
//                 knownContact1.address,
//                 [account1D1, account2D1, account1D2],
//                 [knownContact1],
//                 [cachedContact1],
//             ),
//         ).toEqual(knownContact1)
//     })

//     test("cached contact", () => {
//         const knownContact1 = getContact(0, ContactType.KNOWN)
//         const cachedContact1 = getContact(10, ContactType.CACHE)
//         expect(
//             searchForAccount(
//                 cachedContact1.address,
//                 [account1D1, account2D1, account1D2],
//                 [knownContact1],
//                 [cachedContact1],
//             ),
//         ).toEqual(cachedContact1)
//     })

//     test("none", () => {
//         const knownContact1 = getContact(0, ContactType.KNOWN)
//         const cachedContact1 = getContact(10, ContactType.CACHE)
//         expect(
//             searchForAccount(
//                 account1D1.address,
//                 [account2D1, account1D2],
//                 [knownContact1],
//                 [cachedContact1],
//             ),
//         ).not.toBeDefined()
//     })
// })
