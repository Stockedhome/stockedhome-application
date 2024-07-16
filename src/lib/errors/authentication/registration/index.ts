export * from './password'
import * as password from './password'
export type AnyAuthenticationRegistrationPasswordStockedhomeErrorClass = typeof password[keyof typeof password]
export type AnyAuthenticationRegistrationPasswordStockedhomeError = InstanceType<AnyAuthenticationRegistrationPasswordStockedhomeErrorClass>

export * from './email'
import * as email from './email'
export type AnyAuthenticationRegistrationEmailStockedhomeErrorClass = typeof email[keyof typeof email]
export type AnyAuthenticationRegistrationEmailStockedhomeError = InstanceType<AnyAuthenticationRegistrationEmailStockedhomeErrorClass>

export * from './username'
import * as username from './username'
export type AnyAuthenticationRegistrationUsernameStockedhomeErrorClass = typeof username[keyof typeof username]
export type AnyAuthenticationRegistrationUsernameStockedhomeError = InstanceType<AnyAuthenticationRegistrationUsernameStockedhomeErrorClass>
