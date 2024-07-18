'use client';

import { ActivityIndicator, P, Row, View, type TextInput } from "dripsy";
import { FontAwesomeIcon } from "./FontAwesomeIcon";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import React, { type RefAttributes } from "react";
import { authRouter } from "lib/trpc/auth";

type OnChangePropRecord<TProps extends Record<any, any>, TValueType = any> = { [TKey in keyof TProps as NonNullable<TProps[TKey]> extends ((value: NonNullable<TValueType>) => void) ? TKey : never]: NonNullable<TProps[TKey]> extends ((value: infer TValueType) => void) ? TValueType : never }
type OnChangePropKeys<TProps extends Record<any, any>, TValueType = any> = keyof OnChangePropRecord<TProps, TValueType>
type PropsForComponent<TComponent extends React.ComponentType<any>> = TComponent extends React.ComponentType<infer TProps> ? TProps : never

type ExtraStuffForValidatedInput<TInputType extends React.ComponentType<any>, TOnChangeProp extends string | number | symbol, TValueType extends any, TInvalidityReason extends string> = {
    defaultValue: TValueType,
    inputProps?: Omit<PropsForComponent<TInputType>, 'ref'|'value'|TOnChangeProp>,
    syncValidator?: (value: TValueType) => TInvalidityReason | null,
    asyncValidator?: (value: TValueType, abortController: AbortController) => Promise<TInvalidityReason | null>,
    renderInvalidityReason: (reason: TInvalidityReason) => React.ReactNode,
    title?: React.ReactNode,
    description?: React.ReactNode,
    onValidationStateChanged?: (isValid: boolean) => void,
    emptyValue?: TValueType,
}

function StockedhomeValidatedInput<TInputType extends React.ComponentType<{value: any}>, TValueType extends PropsForComponent<TInputType>['value'], TInvalidityReasonEnum extends Record<string, string> & {UnknownError: any}, TOnChangeProp extends OnChangePropKeys<PropsForComponent<TInputType>, TValueType>>({
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
    onValidationStateChanged,
    emptyValue,
}: {
    invalidityReasonEnum: TInvalidityReasonEnum,
    InputComponent: TInputType,
    onChangeProp: TOnChangeProp,
} & ExtraStuffForValidatedInput<TInputType, TOnChangeProp, TValueType, TInvalidityReasonEnum[keyof TInvalidityReasonEnum]> & (RefAttributes<PropsForComponent<typeof TextInput> extends {ref?: React.Ref<infer TRefType>} ? TRefType : PropsForComponent<typeof TextInput> extends {ref?: React.Ref<infer TRefType> | React.LegacyRef<infer TRefType>} ? TRefType : TInputType>), ref: React.Ref<TInputType>) {
    const [invalidityReason, setInvalidReason] = React.useState<TInvalidityReasonEnum[keyof TInvalidityReasonEnum] | null>(null)
    const [isFetching, setIsFetching] = React.useState(false)
    const [value, setValue] = React.useState<TValueType>(defaultValue)

    React.useEffect(() => {
        if (onValidationStateChanged) {
            onValidationStateChanged(!invalidityReason && !isFetching && value !== emptyValue && value !== undefined)
        }
    }, [invalidityReason, isFetching])

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

    return <View sx={{ width: '100%', height: 'auto' }}>
        <View>
            {title}
        </View>

        <Row sx={{ width: '100%', flex: 1, flexDirection: 'row', alignItems: 'center', height: 56, }}>
            <InputComponent_ {...(inputProps ?? {})} value={value} {...({[onChangeProp]: setValue})} ref={ref} />

            <View sx={{  width: '20%', height: 32, alignItems: 'center', marginTop: -16 }}>
                { value !== emptyValue && value !== undefined && (
                    isFetching
                        ? <ActivityIndicator size={32} color='highlight' />
                        : invalidityReason
                            ? <FontAwesomeIcon icon={faXmark} color='errorRed' size={32} />
                            : <FontAwesomeIcon icon={faCheck} color='successGreen' size={32} />
                ) }
            </View>
        </Row>


        <View>
            { description }
        </View>
        {
            value === emptyValue || value === undefined || !invalidityReason
                ? <View sx={{ height: 32 }} />
                : <P sx={{color: 'errorRed' }}>{renderInvalidityReason(invalidityReason)}</P>
        }
    </View>
}

export const ValidatedInput = React.forwardRef(StockedhomeValidatedInput) as any as typeof StockedhomeValidatedInput
