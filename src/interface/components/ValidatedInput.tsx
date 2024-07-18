'use client';

import { ActivityIndicator, P, Row, View } from "dripsy";
import { FontAwesomeIcon } from "./fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import React from "react";

type OnChangePropRecord<TProps extends Record<any, any>, TValueType = any> = { [TKey in keyof TProps as NonNullable<TProps[TKey]> extends ((value: TValueType) => void) ? TKey : never]: NonNullable<TProps[TKey]> extends ((value: infer TValueType) => void) ? TValueType : never }
type OnChangePropKeys<TProps extends Record<any, any>, TValueType = any> = keyof OnChangePropRecord<TProps, TValueType>
type PropsForComponent<TComponent extends React.ComponentType<any>> = TComponent extends React.ComponentType<infer TProps> ? TProps : never

type ExtraStuffBasedOnProps<TInputType extends React.ComponentType<any>, TOnChangeProp extends string | number | symbol, TValueType extends any, TInvalidityReason extends string> = {
    defaultValue: NonNullable<PropsForComponent<TInputType>['value']>,
    inputProps?: Omit<PropsForComponent<TInputType>, 'ref'|'value'|TOnChangeProp>,
    syncValidator?: (value: TValueType) => TInvalidityReason | null,
    asyncValidator?: (value: TValueType, abortController: AbortController) => Promise<TInvalidityReason | null>,
    renderInvalidityReason: (reason: TInvalidityReason) => React.ReactNode,
}

function StockedhomeValidatedInput<TInputType extends React.ComponentType<{value: TValueType}>, TInvalidityReasonEnum extends Record<string, string> & {UnknownError: any}, TValueType extends any, TOnChangeProp extends OnChangePropKeys<PropsForComponent<TInputType>, TValueType>>({
    invalidityReasonEnum,
    syncValidator,
    asyncValidator,
    title,
    description,
    onChangeProp,
    InputComponent,
    inputProps,
    defaultValue,
    renderInvalidityReason,
}: {
    invalidityReasonEnum: TInvalidityReasonEnum,
    InputComponent: TInputType,
    title?: React.ReactNode,
    description?: React.ReactNode,
    onChangeProp: TOnChangeProp,
} & ExtraStuffBasedOnProps<TInputType, TOnChangeProp, TValueType, TInvalidityReasonEnum[keyof TInvalidityReasonEnum]>, ref: React.Ref<TInputType>) {
    const [invalidityReason, setInvalidReason] = React.useState<TInvalidityReasonEnum[keyof TInvalidityReasonEnum] | null>(null)
    const [isFetching, setIsFetching] = React.useState(false)
    const [value, setValue] = React.useState<TValueType>(defaultValue)

    React.useEffect(() => {
        if (syncValidator) {
            const syncInvalidityReason = syncValidator(value)
            if (syncInvalidityReason) {
                setInvalidReason(syncInvalidityReason)
                return
            }
        }

        if (asyncValidator) {
            setIsFetching(true)
            const abortController = new AbortController()
            asyncValidator(value, abortController).then((asyncInvalidityReason) => {
                if (abortController.signal.aborted) {
                    return
                }
                setInvalidReason(asyncInvalidityReason)
            }).catch((e) => {
                console.error('Failed to validate input', e)
                setInvalidReason(invalidityReasonEnum.UnknownError)
            }).finally(() => {
                setIsFetching(false)
            })

            return () => {
                abortController.abort()
            }
        }
    }, [value])

    // NOTE: After making changes to this file, make sure the types are still valid by removing this `any`!
    const InputComponent_ = InputComponent as any

    return <View sx={{ width: '100%' }}>
        {title}
        <Row sx={{ width: '100%', flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <InputComponent_ {...(inputProps ?? {})} value={value} {...({[onChangeProp]: setValue})} ref={ref} />

            <View sx={{  width: '20%', height: 32, alignItems: 'center', marginTop: -16 }}>
                {
                    isFetching
                        ? <ActivityIndicator size={32} color='highlight' />
                        : invalidityReason
                            ? <FontAwesomeIcon icon={faXmark} color='errorRed' size={32} />
                            : <FontAwesomeIcon icon={faCheck} color='successGreen' size={32} />
                }
            </View>
        </Row>
        { description }
        {
            !invalidityReason
                ? <View sx={{ height: 32 }} />
                : <P sx={{color: 'errorRed' }}>{renderInvalidityReason(invalidityReason)}</P>
        }
    </View>
}

export const ValidatedInput = React.forwardRef(StockedhomeValidatedInput) as any as typeof StockedhomeValidatedInput
