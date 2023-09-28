import DeviceInfo from "react-native-device-info"

export const isSlowDevice = async () => {
    // Returns if the device has low RAM.
    const isLowRamDevice = DeviceInfo.isLowRamDevice()

    /*
        A process can typically not exceed this limit, so it is useful to know if you are experiencing memory issues with react-native. This limit can be increased by setting largeHeap=true in the android manifest.
        https://developer.android.com/reference/android/app/ActivityManager.html#getLargeMemoryClass()
        https://stackoverflow.com/questions/2630158/detect-application-heap-size-in-android
    */
    const getMaxMemory = await DeviceInfo.getMaxMemory()

    /*
        Returns the total amount of RAM installed on the device. On iOS this is the physical amount of memory on the device. On Android this is the physical amount of memory, minus some critical memory reserved for below kernel fixed allocations, like DMA buffers, RAM for the baseband CPU, etc.
        https://developer.apple.com/documentation/foundation/nsprocessinfo/1408211-physicalmemory?language=objc
        https://developer.android.com/reference/android/app/ActivityManager.MemoryInfo.html#totalMem
    */
    const getTotalMemory = await DeviceInfo.getTotalMemory()

    /*
        console.log({
            isLowRamDevice,
            getMaxMemory: bytesToGigabytes(getMaxMemory),
            getTotalMemory: bytesToGigabytes(getTotalMemory),
        })

       {"getMaxMemory": 0.5625, "getTotalMemory": 5.773872375488281, "isLowRamDevice": false}   
    */

    // really low end device specs
    if (isLowRamDevice) return true

    // low VM allocation
    if (bytesToGigabytes(getMaxMemory) < 0.3) return true

    // classify as slow device if it has less the than 6GB of RAM
    if (bytesToGigabytes(getTotalMemory) < 5.5) return true

    return false
}

const bytesToGigabytes = (bytes: number) => {
    if (typeof bytes !== "number") {
        throw new Error("Input must be a number : [bytesToGigabytes]")
    }
    return bytes / Math.pow(1024, 3)
}
