import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useI18nContext } from "~i18n"
import ReactNativeBlobUtil, { FetchBlobResponse, StatefulPromise } from "react-native-blob-util"

import { CameraRoll } from "@react-native-camera-roll/camera-roll"
import { AlertUtils, PlatformUtils, debug } from "~Utils"
import { NFTMedia } from "~Model"
import { ERROR_EVENTS } from "~Constants"

export const useSaveMediaToPhotos = (image?: NFTMedia, nftName: string = "VeWorld NFT") => {
    const { LL } = useI18nContext()
    const [progress, setProgress] = useState(0)
    const imageToFlush = useRef<FetchBlobResponse | undefined>()
    const [task, setTask] = useState<StatefulPromise<FetchBlobResponse> | undefined>()

    const LongPressItems = useMemo(
        () => [
            {
                title: LL.SAVE_IMAGE_ON_DEVICE(),
                subtitle: LL.SAVE_IMAGE_ON_DEVICE_SUBTITLE(),
                systemIcon: "square.and.arrow.down", // iOS system icon name
            },
        ],
        [LL],
    )

    const downloadImage = useCallback(async () => {
        if (!image) return

        //TODO(michael): if app crash when app built due to android missing permissions enable it again (also on manifest.xml)
        // if (PlatformUtils.isAndroid() && !(await hasAndroidPermission())) {
        //     return
        // }

        try {
            // download image to device cache
            const _task = ReactNativeBlobUtil.config({
                fileCache: true,
                appendExt: image.mime.split("/")[1],
            })
                .fetch("GET", image.image)
                .progress((received, total) => {
                    // only user progress for video download
                    if (image.mediaType !== "video") return

                    // this is a codegen library error - the types say they are strings but the values come as numbers
                    // https://github.com/RonRadtke/react-native-blob-util/issues/300
                    // @ts-ignore
                    setProgress(received / total)
                })

            setTask(_task)

            const _image = await Promise.resolve(_task)
            imageToFlush.current = _image // save image to flush later (in case of error)

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
            )

            _image.flush()
        } catch (_error) {
            setProgress(0)

            // let er = error as IRCTPromiseRejectBlock

            // if (er?.code === "E_UNABLE_TO_SAVE") {
            AlertUtils.showDefaultAlert(LL.SAVE_MEDIA_ERROR_TITLE(), LL.SAVE_MEDIA_ERROR_SUBTITLE(), LL.COMMON_BTN_OK())
            // }

            imageToFlush.current?.flush()
            imageToFlush.current = undefined
        }
    }, [image, LL, nftName, imageToFlush])

    const onLongPressImage = useCallback(() => {
        downloadImage()
    }, [downloadImage])

    useEffect(() => {
        // cancel download task when component unmount
        return () => {
            if (task) {
                task.cancel(err => debug(ERROR_EVENTS.NFT, err))
            }
        }
    }, [task])

    return {
        LongPressItems,
        onLongPressImage,
        progress,
    }
}
