import { useCallback, useEffect, useState } from "react"
import produce from "immer"

type ListenerCallback = Realm.CollectionChangeCallback<
    Realm.Object<unknown, never>
>

export const useObjectListener = (
    className: string,
    id: string,
    database: Realm,
) => {
    const initialList = database.objects(className).filtered("_id == $0", id)
    const [data, setData] = useState([...initialList])

    useEffect(() => {
        if (!initialList.isValid()) {
            initialList.removeListener(onChange)
            return
        }

        try {
            initialList.addListener(onChange)
        } catch (error) {
            console.error(
                `An exception was thrown within the change listener: ${error}`,
            )
        }
        return () => {
            initialList.removeListener(onChange)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onChange: ListenerCallback = useCallback((list, changes) => {
        try {
            changes.deletions.forEach(index => {
                console.log("delete")
                setData(
                    produce(draft => {
                        draft.splice(index, 1)
                    }),
                )
            })

            changes.insertions.forEach(index => {
                console.log("insert")
                const newItem = list[index]
                setData(
                    produce(draft => {
                        draft.push(newItem)
                    }),
                )
            })

            changes.newModifications.forEach(index => {
                console.log("delete")
                const modifiedItem = list[index]
                setData(
                    produce(draft => {
                        draft[index] = modifiedItem
                    }),
                )
            })
        } catch (error) {
            console.log(
                `An exception was thrown within the onChange callback: ${error}`,
            )
        }
    }, [])

    return data[0]
}
