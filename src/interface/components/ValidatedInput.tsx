'use client';

import { ActivityIndicator, P, Row, View, type TextInput, type Sx } from "dripsy";
import { FontAwesomeIcon } from "./FontAwesomeIcon";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { OnChangePropKeys, StockedhomeInput, type DownstreamInputRef } from "./StockedhomeInput";

export const NULL_BUT_DO_NOT_VALIDATE_ASYNC = Symbol('NULL_BUT_DO_NOT_VALIDATE_ASYNC')

type EnumValue<TEnum> = TEnum[keyof TEnum]
type ExtractGenericComponentProps<TComponent> = TComponent extends React.ComponentType<infer TProps> ? TProps : never

const DownstreamInputPasserKey = 'StockedhomeValidatedInput_DownstreamInputPasserKey____this_is_really_long_so_to_be_unique'

function StockedhomeValidatedInput<TInputType extends React.ComponentType<{value: any}>, TValueType extends React.ComponentProps<TInputType>['value'], TInvalidityReasonEnum extends Record<string, string> & {UnknownError: any}, TOnChangeProp extends OnChangePropKeys<React.ComponentProps<TInputType>, TValueType>>({
    onValidationStateChanged,
    emptyValue,
    externalInvalidityReason,
    syncValidator,
    asyncValidator,
    renderInvalidityReason,
    invalidityReasonEnum,

    InputComponent,
    defaultValue,
    description,
    onValueChange,
    ...shInputProps
}: React.ComponentPropsWithoutRef<typeof StockedhomeInput<TInputType, TValueType, TOnChangeProp>> & {
    onValidationStateChanged?: (isValid: boolean) => void,
    emptyValue?: TValueType,
    externalInvalidityReason?: EnumValue<TInvalidityReasonEnum>,
    syncValidator?: (value: TValueType) => EnumValue<TInvalidityReasonEnum> | null | typeof NULL_BUT_DO_NOT_VALIDATE_ASYNC,
    asyncValidator?: (value: TValueType, abortController: AbortController) => Promise<EnumValue<TInvalidityReasonEnum> | null>,
    renderInvalidityReason: (reason: EnumValue<TInvalidityReasonEnum>) => React.ReactNode,
    invalidityReasonEnum: TInvalidityReasonEnum,
} & {ref?: DownstreamInputRef<typeof InputComponent>}, ref: DownstreamInputRef<typeof InputComponent>): React.ReactElement {
    const [invalidityReason, setInvalidReason] = React.useState<TInvalidityReasonEnum[keyof TInvalidityReasonEnum] | null>(null)
    const [isFetching, setIsFetching] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(defaultValue !== emptyValue && defaultValue !== undefined)

    React.useEffect(() => {
        if (onValidationStateChanged) {
            onValidationStateChanged(!invalidityReason && !isFetching && hasValue)
        }
    }, [invalidityReason, isFetching, hasValue])


    const valueChanceCallbackCancelRef = React.useRef<null | (() => void)>(null)

    const valueChangeCallback = React.useCallback((value: TValueType) => {
        valueChanceCallbackCancelRef.current?.()
        onValueChange?.(value)

        setHasValue(value !== emptyValue && value !== undefined)

        if (syncValidator) {

            const syncInvalidityReason = syncValidator(value)
            if (syncInvalidityReason) {
                if (syncInvalidityReason === NULL_BUT_DO_NOT_VALIDATE_ASYNC) {
                    setInvalidReason(null)
                } else {
                    setInvalidReason(syncInvalidityReason)
                }
                if (isFetching) setIsFetching(false)
                return
            }
        }

        if (!asyncValidator) {
            if (isFetching) setIsFetching(false)
            setInvalidReason(null)
        } else {
            if (!isFetching) setIsFetching(true)
            setInvalidReason(null)

            const abortController = new AbortController()
            const debounceTimeout = setTimeout(() => {
                if (abortController.signal.aborted) {
                    return
                }
                asyncValidator(value, abortController).then((asyncInvalidityReason) => {
                    if (abortController.signal.aborted) {
                        return
                    }
                    setInvalidReason(asyncInvalidityReason)
                    setIsFetching(false)
                }).catch((e) => {
                    console.error('Failed to validate input', e)
                    setInvalidReason(invalidityReasonEnum.UnknownError)
                    setIsFetching(false)
                })
            }, 300)

            valueChanceCallbackCancelRef.current = () => {
                clearTimeout(debounceTimeout)
                abortController.abort()
            }
        }
    }, [onValueChange, asyncValidator, invalidityReasonEnum, emptyValue, syncValidator])

    const WrappedInputComponent = React.useCallback((({
        [DownstreamInputPasserKey]: { invalidityReason, isFetching, hasValue }, ...inputProps
    }:
        ExtractGenericComponentProps<typeof InputComponent> & {
            [DownstreamInputPasserKey]: { invalidityReason: TInvalidityReasonEnum[keyof TInvalidityReasonEnum] | null, isFetching: boolean, hasValue: boolean }
        } & {ref?: DownstreamInputRef<typeof InputComponent>}, ref?: DownstreamInputRef<typeof InputComponent>
    ) => {
        return <Row sx={{ width: '100%', flex: 1, flexDirection: 'row', alignItems: 'center', height: 56 }}>
            <InputComponent {...inputProps as any} ref={ref} />
            <View sx={{  width: '20%', height: 32, alignItems: 'center', marginTop: -16 }}>
                { hasValue && (
                    isFetching
                        ? <ActivityIndicator size={32} color='highlight' />
                        : invalidityReason
                            ? <FontAwesomeIcon icon={faXmark} color='errorRed' size={32} />
                            : <FontAwesomeIcon icon={faCheck} color='successGreen' size={32} />
                ) }
            </View>
        </Row>
    }), [InputComponent])

    const WrappedInputComponentForwardedRef = React.useMemo(() => React.forwardRef(WrappedInputComponent as any), [WrappedInputComponent])

    return <StockedhomeInput
        {...shInputProps}
        defaultValue={defaultValue}
        onValueChange={valueChangeCallback}
        ref={ref}
        description={<>
            {description}
            <P sx={{color: 'errorRed' }}>{
                externalInvalidityReason !== null && externalInvalidityReason !== undefined
                    ? renderInvalidityReason(externalInvalidityReason)
                    : (!hasValue || !invalidityReason)
                        ? <>&nbsp;</>
                        : renderInvalidityReason(invalidityReason)}
            </P>
        </>}

        inputProps={React.useMemo(() => ({
            ...shInputProps.inputProps,

            [DownstreamInputPasserKey]: { invalidityReason, isFetching, hasValue }
        } as unknown as Omit<React.ComponentPropsWithoutRef<typeof InputComponent>, 'value'|TOnChangeProp>), [shInputProps.inputProps, invalidityReason, isFetching, hasValue])}

        InputComponent={WrappedInputComponentForwardedRef as unknown as typeof InputComponent}
    />
}

const forwardedRefVersion = React.forwardRef(StockedhomeValidatedInput) as typeof StockedhomeValidatedInput
export { forwardedRefVersion as StockedhomeValidatedInput }
