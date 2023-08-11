import _ from "lodash"
import { NftCollection } from "~Model"
import HexUtils from "~Utils/HexUtils"

export type OrderByParam<T> = [keyof T | [keyof T, "asc" | "desc"]]

export const mergeObjects = <T>(
    obj1: T,
    obj2: T,
    ignoredFields: (keyof T)[] = [],
): T => {
    return _.mergeWith({ ...obj1 }, obj2, (objValue, srcValue, key) => {
        if (ignoredFields.includes(key as keyof T)) {
            // If the key is in the ignoredFields list, return the original value without merging.
            return objValue
        }
    })
}

/**
 * Utility function to merge two arrays of objects.
 *
 * @param arr1 - The first array to merge
 * @param arr2 - The second array to merge. Elements from this array will be merged into the first array.
 * @param uniqueKey - The unique key to use to identify objects in the arrays.
 * @param ignoredFields - An array of fields to ignore when merging objects. Default to an empty array.
 * @param orderBy - An array of fields to use to order the merged array. Default to ascending order on the unique key.
 * @returns The merged array.
 */
export const mergeArrays = <T>(
    arr1: T[],
    arr2: T[],
    uniqueKey: keyof T,
    ignoredFields: (keyof T)[] = [],
    orderBy?: OrderByParam<T>,
): T[] => {
    // Merge items from arr1 with their counterparts in arr2
    const fromArr1 = arr1.map(item1 => {
        const matchingObjFromArr2 = arr2.find(
            item2 => item2[uniqueKey] === item1[uniqueKey],
        )
        if (!matchingObjFromArr2) return item1

        return _.mergeWith(
            {},
            item1,
            matchingObjFromArr2,
            (objValue, srcValue, key) => {
                if (ignoredFields.includes(key as keyof T)) {
                    return objValue // Return original value from arr1 for ignored fields
                }
            },
        )
    })

    // Get unique items from arr2 that aren't in arr1
    const fromArr2 = arr2.filter(
        item2 => !arr1.some(item1 => item1[uniqueKey] === item2[uniqueKey]),
    )

    let result = [...fromArr1, ...fromArr2]

    // If orderBy is specified, then sort
    if (orderBy) {
        const orderKeys: (keyof T)[] = orderBy.map(item =>
            Array.isArray(item) ? item[0] : item,
        )
        const orderDirections: ("asc" | "desc")[] = orderBy.map(item =>
            Array.isArray(item) ? item[1] : "asc",
        )

        result = _.orderBy(result, orderKeys, orderDirections)
    }

    return result
}

export const mergeNftCollections = (
    collections1: NftCollection[],
    collections2: NftCollection[],
): NftCollection[] => {
    // Normalize the address field to be able to merge the collections.
    collections1 = collections1.map(collection => ({
        ...collection,
        address: HexUtils.normalize(collection.address),
    }))
    collections2 = collections2.map(collection => ({
        ...collection,
        address: HexUtils.normalize(collection.address),
    }))
    return mergeArrays(collections1, collections2, "address")
}
