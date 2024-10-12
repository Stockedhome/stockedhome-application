'use client';

import { View, type TextInput } from "dripsy";
import React from "react";

type ExtractGenericComponentProps<TComponent> = TComponent extends React.ComponentType<infer TProps> ? TProps : never
type DownstreamInputRefTarget<TInputType extends React.ComponentType<{value: any}>> = ExtractGenericComponentProps<TInputType> extends {ref?: React.Ref<infer TRefType> | React.LegacyRef<infer TRefType>} ? TRefType : TInputType
export type DownstreamInputRef<TInputType extends React.ComponentType<{value: any}>> = React.Ref<DownstreamInputRefTarget<TInputType>> | React.LegacyRef<DownstreamInputRefTarget<TInputType>>


export type OnChangePropRecord<TProps extends Record<any, any>, TValueType = any> = { [TKey in keyof TProps as NonNullable<TProps[TKey]> extends ((value: NonNullable<TValueType>) => void) ? TKey : never]: NonNullable<TProps[TKey]> extends ((value: infer TValueType) => void) ? TValueType : never }
export type OnChangePropKeys<TProps extends Record<any, any>, TValueType = any> = keyof OnChangePropRecord<TProps, TValueType>

function StockedhomeInput<TInputType extends React.ComponentType<{value: any}>, TValueType extends React.ComponentProps<TInputType>['value'], TOnChangeProp extends OnChangePropKeys<React.ComponentProps<TInputType>, TValueType>>({
    InputComponent,
    onChangeProp,
    defaultValue,
    inputProps,
    title,
    description,
    onValueChange,
    valueRef,
}: {
    InputComponent: TInputType,
    onChangeProp: TOnChangeProp,
    defaultValue: TValueType,
    inputProps?: Omit<React.ComponentPropsWithoutRef<typeof InputComponent>, 'value'|TOnChangeProp>,
    title?: React.ReactNode,
    description?: React.ReactNode,
    onValueChange?: (value: TValueType) => void,
    valueRef?: React.MutableRefObject<TValueType>,
} & {ref?: DownstreamInputRef<typeof InputComponent> }, ref?: DownstreamInputRef<typeof InputComponent>) {
    const [value, setValue] = React.useState<TValueType>(defaultValue)
    console.log('value', {value, valueRef, onValueChange})

    React.useEffect(() => {
        if (onValueChange) {
            onValueChange(value)
        }
    }, [value])

    React.useEffect(() => {
        if (valueRef) {
            valueRef.current = value
        }
    }, [value, valueRef])

    return <View sx={{ width: '100%', justifyContent: 'space-between', height: 'auto' }}>
        {title && <View sx={{ width: '100%', justifyContent: 'flex-start' }}>
            {title}
        </View>}

        <View sx={{ width: '100%', flex: 1, justifyItems: 'center', alignItems: 'center', height: 56 }}>
            <InputComponent {...(inputProps ?? {})} value={value} {...({[onChangeProp]: setValue}) as any} ref={ref} />
        </View>

        <View sx={{ width: '100%', justifyContent: 'flex-start', height: 'auto' }}>
            { description }
        </View>
    </View>
}

const forwardedRefVersion = React.forwardRef(StockedhomeInput) as any as typeof StockedhomeInput
export { forwardedRefVersion as StockedhomeInput }
