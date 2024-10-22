import React from "react";
import type { Writeable } from "zod";

export function useMergeRefs<TRefType extends unknown>(...refs: (React.LegacyRef<TRefType> | React.MutableRefObject<TRefType> | undefined)[]): React.Ref<TRefType> {
    return React.useMemo(() => {
        return (value: TRefType) => {
            for (const ref of refs) {
                if (!ref) continue
                if (typeof ref === 'function') {
                    ref(value)
                } else if (typeof ref === 'string') {
                    throw new Error('Cannot merge string refs; if you are using this, you can implement this functionality yourself.');
                } else {
                    (ref as Writeable<typeof ref>).current = value
                }
            }
        }
    }, [refs])
}
