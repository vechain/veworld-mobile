import AsyncStorage from "@react-native-async-storage/async-storage"

export async function set(data: string, key: string) {
    try {
        if (typeof data === "string") {
            await AsyncStorage.setItem(key, data as string)
        } else {
            let dataToString = JSON.stringify(data)
            await AsyncStorage.setItem(key, dataToString)
        }
    } catch (e) {
        console.log(e)
    }
}

export async function getFor<T>(key: string) {
    try {
        const value = await AsyncStorage.getItem(key)
        if (value && typeof value === "string") {
            return value
        } else {
            let stringToData = JSON.parse(value!)
            return stringToData as T
        }
    } catch (e) {
        console.log(e)
    }
}

export async function removeFor(key: string) {
    try {
        await AsyncStorage.removeItem(key)
    } catch (e) {
        console.log(e)
    }
}

export async function getAllKeys() {
    try {
        return await AsyncStorage.getAllKeys()
    } catch (e) {
        console.log(e)
    }
}

export const clearAll = async () => {
    try {
        await AsyncStorage.clear()
    } catch (e) {
        console.log(e)
    }
}

export async function multiGet(keys: string[]) {
    try {
        return await AsyncStorage.multiGet(keys)
    } catch (e) {
        console.log(e)
    }
}

// export const multiSet = async (data: [string, string][]) => {
//     try {
//         await AsyncStorage.multiSet(data)
//     } catch (e) {
//         console.log(e)
//     }
// }

// export const multiRemove = async () => {
//     const keys = ["@MyApp_USER_1", "@MyApp_USER_2"]
//     try {
//         await AsyncStorage.multiRemove(keys)
//     } catch (e) {
//         // remove error
//     }

//     console.log("Done")
// }
