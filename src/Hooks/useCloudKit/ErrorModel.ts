/* eslint-disable max-len */

/* -- EXAMPLE ERROR --
export type CKError = {
    code: 401
    domain: "ICLOUD"
    message: "Invalid arguments error"
    nativeStackIOS: [
        "0   VeWorld                             0x000000010533134c RCTJSErrorFromCodeMessageAndNSError + 112",
        "1   VeWorld                             0x00000001052d3b04 __41-[RCTModuleMethod processMethodSignature]_block_invoke_2.73 + 152",
        "2   VeWorld                             0x00000001045a3120 $sSo8NSStringCSgACSo7NSErrorCSgIeyByyy_SSSgAGs5Error_pSgIegggg_TR + 380",
        "3   VeWorld                             0x00000001045a42dc $s7VeWorld15CloudKitManagerC11handleError33_DBA1D0A5685BD4B981F769E5DE08A0B6LL_6reject6domain4code14defaultMessageys0G0_pSg_ySSSg_AlKtXESSSiSStF + 4404",
        "4   VeWorld                             0x00000001045aa798 $s7VeWorld15CloudKitManagerC8saveSalt_4salt8resolver8rejecterySS_SSyypSgcySSSg_AIs5Error_pSgtctFySo8CKRecordCSg_AKtYbcfU_ + 388",
        "5   VeWorld                             0x00000001045a67ec $sSo8CKRecordCSgs5Error_pSgIeghgg_ACSo7NSErrorCSgIeyBhyy_TR + 140",
        "6   CloudKit                            0x0000000186bfd3ec CKIsValidOperationForScope + 9536",
        "7   CloudKit                            0x0000000186c28cc0 CKDPIdentifierReadFrom + 117504",
        "8   CloudKit                            0x0000000186bcd520 CKOperationExecutionStateTransitionToFinished + 21248",
        "9   CloudKit                            0x0000000186bd04f0 CKOperationExecutionStateTransitionToFinished + 33488",
        "10  CoreFoundation                      0x0000000180497750 __invoking___ + 144",
        "11  CoreFoundation                      0x0000000180494ab4 -[NSInvocation invoke] + 276",
        "12  CoreFoundation                      0x0000000180494d4c -[NSInvocation invokeWithTarget:] + 60",
        "13  CloudKit                            0x0000000186b250f4 CKStringFromDeviceCount + 81508",
        "14  libdispatch.dylib                   0x000000018017c418 _dispatch_block_async_invoke2 + 104",
        "15  libdispatch.dylib                   0x000000018016cd3c _dispatch_client_callout + 16",
        "16  libdispatch.dylib                   0x0000000180174e3c _dispatch_lane_serial_drain + 960",
        "17  libdispatch.dylib                   0x00000001801759b4 _dispatch_lane_invoke + 388",
        "18  libdispatch.dylib                   0x0000000180180d40 _dispatch_root_queue_drain_deferred_wlh + 276",
        "19  libdispatch.dylib                   0x000000018018038c _dispatch_workloop_worker_thread + 448",
        "20  libsystem_pthread.dylib             0x000000010accb814 _pthread_wqthread + 284",
        "21  libsystem_pthread.dylib             0x000000010acca5d4 start_wqthread + 8",
    ]
    userInfo: {
        NSLocalizedDescription: "Error saving record <CKRecordID: 0x60000021a760; recordName=SALT_ZONE_0x6d4fa2e34830b11f29009ca42fd0ddf3a75b9121, zoneID=_defaultZone:__defaultOwner__> to server: invalid attempt to update record from type 'VEWORLD_WALLET' to 'SALT'"
    }
}
*/

export type CKError = {
    code: string
    domain: string
    message: string
    nativeStackIOS: string[]
    userInfo: {
        NSLocalizedDescription: string
    }
}

import { ERROR_EVENTS } from "~Constants"
import * as i18n from "~i18n"
import { error } from "~Utils"

export const handleCloudKitErrors = (err: CKError) => {
    const locale = i18n.detectLocale()

    // Service related stuff code - 411
    if (err.code === "411") {
        error(ERROR_EVENTS.CLOUDKIT, err, err.message)
        return i18n.i18n()[locale].CLOUD_ERR_NETWORK()
    }

    // Wallet related stuff code - 122
    if (err.code === "122") {
        error(ERROR_EVENTS.CLOUDKIT, err, err.message)
        return i18n.i18n()[locale].CLOUD_ERR_WALLET_OPERATION()
    }

    // User relate stuff code - 233
    if (err.code === "233") {
        error(ERROR_EVENTS.CLOUDKIT, err, err.message)
        return i18n.i18n()[locale].CLOUD_ERR_USER_STATUS()
    }

    // Rest CloudKit errors code - 001
    if (err.code === "001") {
        error(ERROR_EVENTS.CLOUDKIT, err, err.message)
        return i18n.i18n()[locale].CLOUDKIT_ERROR_GENERIC()
    }

    // Non CloudKit errors code - 000
    if (err.code === "000") {
        error(ERROR_EVENTS.CLOUDKIT, err, err.message)
        return i18n.i18n()[locale].CLOUDKIT_ERROR_GENERIC()
    }

    // Default error message - Generic
    return i18n.i18n()[locale].CLOUDKIT_ERROR_GENERIC()
}
