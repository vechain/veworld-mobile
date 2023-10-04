import { useCallback, useEffect, useMemo, useState } from "react"
import { useI18nContext } from "~i18n"
import ReactNativeBlobUtil, {
    FetchBlobResponse,
    StatefulPromise,
} from "react-native-blob-util"

import { CameraRoll } from "@react-native-camera-roll/camera-roll"
import { PermissionsAndroid, Platform } from "react-native"
import { AlertUtils, PlatformUtils, debug } from "~Utils"
import { NFTMedia } from "~Model"

export const useSaveMediaToPhotos = (
    image?: NFTMedia,
    nftName: string = "VeWorld NFT",
) => {
    const { LL } = useI18nContext()
    const [progress, setProgress] = useState(0)
    const [task, setTask] = useState<
        StatefulPromise<FetchBlobResponse> | undefined
    >()

    const LongPressItems = useMemo(
        () => [
            {
                title: LL.SAVE_IMAGE_ON_DEVICE(),
                subtitle: LL.SAVE_IMAGE_ON_DEVICE_SUBTITLE(),
                systemIcon: "square.and.arrow.down", // iOS system icon name
            },
            {
                title: LL.SHARE_IMAGE(),
                subtitle: LL.SHARE_IMAGE_SUBTITLE(),
                systemIcon: "square.and.arrow.up", // iOS system icon name
            },
        ],
        [LL],
    )

    const hasAndroidPermission = useCallback(async () => {
        const getCheckPermissionPromise = () => {
            // Android always returns number version
            if ((Platform.Version as number) >= 33) {
                return Promise.all([
                    PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    ),
                    PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                    ),
                ]).then(
                    ([
                        hasReadMediaImagesPermission,
                        hasReadMediaVideoPermission,
                    ]) =>
                        hasReadMediaImagesPermission &&
                        hasReadMediaVideoPermission,
                )
            } else {
                return PermissionsAndroid.check(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                )
            }
        }

        const hasPermission = await getCheckPermissionPromise()
        if (hasPermission) {
            return true
        }

        const getRequestPermissionPromise = () => {
            // Android always returns number version
            if ((Platform.Version as number) >= 33) {
                return PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                ]).then(
                    statuses =>
                        statuses[
                            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
                        ] === PermissionsAndroid.RESULTS.GRANTED &&
                        statuses[
                            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
                        ] === PermissionsAndroid.RESULTS.GRANTED,
                )
            } else {
                return PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ).then(status => status === PermissionsAndroid.RESULTS.GRANTED)
            }
        }

        return await getRequestPermissionPromise()
    }, [])

    const downloadImage = useCallback(async () => {
        if (!image) return

        if (PlatformUtils.isAndroid() && !(await hasAndroidPermission())) {
            return
        }

        try {
            // download image to device cache
            const _task = ReactNativeBlobUtil.config({
                fileCache: true,
                appendExt: image.mime.split("/")[1],
            })
                .fetch("GET", image.image)
                .progress((received, total) => {
                    setProgress(received / total)
                })

            setTask(_task)

            const _image = await Promise.resolve(_task)

            // save image to device storage
            if (PlatformUtils.isAndroid()) {
                await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
                    {
                        name: nftName,
                        parentFolder: "",
                        mimeType: image.mime,
                    },
                    "Download", // Media Collection to store the file in
                    _image.path(),
                )
            } else {
                // save image to device gallery on iOS
                await CameraRoll.save(_image.path())
            }

            setProgress(0)

            AlertUtils.showDefaultAlert(
                LL.NFT_ALERT_IMAGE_SAVED_TITLE(),
                LL.NFT_ALERT_IMAGE_SAVED_MSG(),
                LL.COMMON_BTN_OK(),
                () => {
                    // remove image from device cache
                    _image.flush()
                },
            )
        } catch (error) {
            setProgress(0)

            if (
                error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === "E_UNABLE_TO_SAVE"
            ) {
                AlertUtils.showDefaultAlert(
                    LL.SAVE_MEDIA_ERROR_TITLE(),
                    LL.SAVE_MEDIA_ERROR_SUBTITLE(),
                    LL.COMMON_BTN_OK(),
                )
            }
        }
    }, [image, hasAndroidPermission, LL, nftName])

    const onLongPressImage = useCallback(
        async (index: number) => {
            if (LongPressItems[index].title === LL.SAVE_IMAGE_ON_DEVICE()) {
                downloadImage()
            }
        },
        [LL, LongPressItems, downloadImage],
    )

    useEffect(() => {
        // cancel download task when component unmount
        return () => {
            if (task) {
                task.cancel(err => debug(err))
            }
        }
    }, [task])

    return {
        LongPressItems,
        onLongPressImage,
        progress,
    }
}
