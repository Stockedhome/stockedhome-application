import z from "zod";

console.log('hi')

export enum HostingConfiguration {
    Development = 'dev',
    Local = 'local',
    SoftwareAsAService = 'saas',
}

// TODO: Add this all to the docs
// TODO: Integrate this validator into instrumentation.ts
// TODO: [IDEA] Extend the docker-compose.yml to give the ENV vars section a schema
console.log('hi2')

// Important note: z.object() allows for extra properties
export const envSchema = z.object({

    /**
     * In addition to a randomly-generated, per-password "salt" value, this value will be added to every password before hashing.
     *
     * This helps increase security in the case that the database is compromised but the application itself is not.
     *
     * This value makes no difference unless it is kept secret.
     *
     * Generating a cryptographically-secure random value on different OSes:
     * * On Windows, you can run the PowerShell command `[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(16))`
     * * On Linux or MacOS, you can run the bash command `openssl rand -base64 16`
    */
    PASSWORD_PEPPER: z.string().describe(`
In addition to a randomly-generated, per-password "salt" value, this value will be added to every password before hashing.

This helps increase security in the case that the database is compromised but the application itself is not.

This value makes no difference unless it is kept secret.

Generating a cryptographically-secure random value on different OSes:
* On Windows, you can run the PowerShell command \`[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(16))\`
* On Linux or MacOS, you can run the bash command \`openssl rand -base64 16\`
`.trim()),

    /**
     * URI used to connect to the database. Must use the postgresql:// scheme.
     *
     * Stockedhome uses Prisma as its ORM of choice. Depending on your setup, you may find the following documentation useful as they can help you optimize your database connection URI:
     * * Configuring Connection Pooling: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool
     * * Using PgBounder: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer
     */
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL').startsWith("postgresql://").describe(`
URI used to connect to the database. Must use the postgresql:// scheme.

Stockedhome uses Prisma as its ORM of choice. Depending on your setup, you may find the following documentation useful as they can help you optimize your database connection URI:
* Configuring Connection Pooling: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool
* Using PgBounder: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer
`.trim()),

    /**
     * [OPTIONAL] URI used to connect to the database directly, without the interference of a connection pooler (e.g. PgBouncer). If provided, must use the postgresql:// scheme.
     *
     * This is NOT needed unless you are making changes to the databse schema or running migrations. For more, see the Prisma documentation on direct database connections: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#external-connection-poolers
     */
    DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL').startsWith("postgresql://").optional().describe(`
URI used to connect to the database directly, without the interference of a connection pooler (e.g. PgBouncer).

This is NOT needed unless you are making changes to the databse schema or running migrations. For more, see the Prisma documentation on direct database connections: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#external-connection-poolers
`.trim()),

    /**
     * The directory where the configuration files are stored.
     *
     * For information on how Stockedhome loads configuration, see https://docs.stockedhome.app/hosting/configuration/intro#how-stockhome-loads-configuration
    */
    CONFIG_DIR: z.string().describe(`
The directory where the configuration files are stored.

For information on how Stockedhome loads configuration, see https://docs.stockedhome.app/hosting/configuration/intro#how-stockhome-loads-configuration
`.trim()),

    /**
     * The type of hosting environment that Stockedhome is running in.
     *
     * Valid values are:
     * * "dev" for development
     * * "local" for locally-hosted servers
     * * "saas" for Software as a Service hosting
     *
     * For information on how Stockedhome loads configuration, see https://docs.stockedhome.app/hosting/configuration/intro#how-stockhome-loads-configuration
    */
    HOSTING_CONFIGURATION: z.nativeEnum(HostingConfiguration).describe(`
The type of hosting environment that Stockedhome is running in.

Valid values are:
* "dev" for development
* "local" for locally-hosted servers
* "saas" for Software as a Service hosting

For information on how Stockedhome loads configuration, see https://docs.stockedhome.app/hosting/configuration/intro#how-stockhome-loads-configuration
`.trim()),
}).merge(z.object({}))

console.log('hi3')

type EnvBase = z.infer<typeof envSchema>;

export interface ComputedEnvProps {

}

type EnvWithComputedPropsAndProcessEnv<T extends EnvBase> = T & ComputedEnvProps & typeof process.env

export type Env = EnvWithComputedPropsAndProcessEnv<EnvBase>;

console.log('hi4')

export const env = envSchema.parse(process.env) as Env & typeof process.env;

console.log('hi5')
