export * from './registration';
import * as registration from './registration';
export type AnyAuthenticationRegistrationStockedhomeErrorClass = typeof registration[keyof typeof registration]
export type AnyAuthenticationRegistrationStockedhomeError = InstanceType<AnyAuthenticationRegistrationStockedhomeErrorClass>

export * from './passkeys'
import * as newKeypair from './passkeys'
export type AnyAuthenticationPasskeysStockedhomeErrorClass = typeof newKeypair[keyof typeof newKeypair]
export type AnyAuthenticationPasskeysStockedhomeError = InstanceType<AnyAuthenticationPasskeysStockedhomeErrorClass>
