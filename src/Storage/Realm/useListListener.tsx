import produce from "immer"
import { useCallback, useEffect, useState } from "react"
import Realm from "realm"

type ListenerCallback = Realm.CollectionChangeCallback<
    Realm.Object<unknown, never>
>

export function useListListener(className: string, database: Realm) {
    const initialList = database.objects(className)
    const [data, setData] = useState([...initialList])
    // const memoizedData = useMemo(() => data, [data])

    useEffect(() => {
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
                setData(
                    produce(draft => {
                        draft.splice(index, 1)
                    }),
                )
            })

            changes.insertions.forEach(index => {
                const newItem = list[index]
                setData(
                    produce(draft => {
                        draft.push(newItem)
                    }),
                )
            })

            changes.newModifications.forEach(index => {
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

    return data
}
