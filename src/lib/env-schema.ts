import z from "zod";

// TODO: Add this all to the docs
// TODO: Integrate this validator into instrumentation.ts
// TODO: [IDEA] Extend the docker-compose.yml to give the ENV vars section a schema

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
    PASSWORD_PEPPER: z.string().refine(s => s.length > 2).describe(`
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
     * The directory where the configuration files are stored. NOT used in the Docker container.
     *
     * For information on how Stockedhome loads configuration, see https://docs.stockedhome.app/hosting/configuration/intro#how-stockhome-loads-configuration
    */
    CONFIG_DIR: z.string().default('./config').describe(`
The directory where the configuration files are stored.

For information on how Stockedhome loads configuration, see https://docs.stockedhome.app/hosting/configuration/intro#how-stockhome-loads-configuration
`.trim()),

    /**
     * A custom name for the configuration file to use.
     *
     * For example, the SAAS servers for Stockedhome would use `config.saas.yaml` as the configuration file.
     *
     * This value is relative to CONFIG_DIR (if set) and should ideally only be a file name.
     * When running under Docker, remember that the Docker container has a different file system than the host machine.
    */
    CONFIG_FILE: z.string().optional().describe(`
A custom name for the configuration file to use.

For example, the SAAS servers for Stockedhome would use \`config.saas.yaml\` as the configuration file.

This value is relative to CONFIG_DIR (if set) and should ideally only be a file name.
When running under Docker, remember that the Docker container has a different file system than the host machine.
`.trim()),

    /**
     * Secret Key provided by your CAPTCHA service of choice.
     *
     * Not needed if the CAPTCHA provider is set to `none`.
     *
     * See the captcha section in the config YAML file for more information.
     */
    CAPTCHA_SECRET_KEY: z.string().optional().describe(`
Secret Key provided by your CAPTCHA service of choice.

Not needed if the CAPTCHA provider is set to \`none\`.

See the captcha section in the config YAML file for more information.
`.trim()),


    /**
     * The Secret Key for Supabase (formerly known as the Service Role Key)
     *
     * This key grants full access to every Supabase service.
     * It should be kept absolutely secret.
     */
    SUPABASE_SECRET_KEY: z.string().refine(s => s.length > 2).describe(`
The Secret Key for Supabase (formerly known as the Service Role Key)

This key grants full access to every Supabase service.
It should be kept absolutely secret.
`.trim()),

    /**
     * The Publishable Key for Supabase (formerly known as the Anon Key)
     *
     * The Publishable Key is a layer of authentication for otherwise-unauthenticated actions on your Supabase project.
     * An access token for unauthenticated users, if that makes sense.
     * It has very few privileges.
     *
     * The Publishable Key is public and should be treated as such.
     */
    SUPABASE_PUBLISHABLE_KEY: z.string().refine(s => s.length > 2).describe(`
The Publishable Key for Supabase (formerly known as the Anon Key)

The Publishable Key is a layer of authentication for otherwise-unauthenticated actions on your Supabase project.
An access token for unauthenticated users, if that makes sense.
It has very few privileges.

The Publishable Key is public and should be treated as such.
`.trim()),


    /**
     * SHA-256 fingerprint(s) of the Android app's signing certificate(s).
     *
     * Required for Android App Links and WebAuthn.
     *
     * If using the default Android app, use the default value.
     * If using a custom Android app, you will need to provide the SHA-256 fingerprint(s) of the signing certificate(s).
     * Do not overwrite the original value or you will be UNABLE to use the default app.
     *
     * This value is comma-separated and ignores whitespace. For example, `AB:CD:...:MN:OP, HI:JK:...:UV:WX` is valid.
    */
    ANDROID_APP_SHA256_CERT_FINGERPRINTS: z.string().transform(s => s.split(',').map(s2 => s2.trim()).filter(s => s.length > 0)).optional().describe(`
The SHA-256 fingerprint of the Android app's signing certificate.

Required for Android App Links and WebAuthn.

If using the default Android app, use the default value.
If using a custom Android app, you will need to provide the SHA-256 fingerprint of the signing certificate.
Do not overwrite the original value or you will be UNABLE to use the default app.

This value is comma-separated and ignores whitespace. For example, \`AB:CD:...:MN:OP, HI:JK:...:UV:WX\` is valid.
`.trim()),


    /**
     * Whether the server is running in a Docker container.
     *
     * Defaults to false.
     */
    IS_DOCKER: z.enum(['true', 'false']).default('false').transform(v => v === 'true').describe(`
Whether the server is running in a Docker container.

Defaults to false.
`.trim()),

    /**
     * Whether the server is running in production mode (built from source),
     * testing mode (testing against source code and/or running E2E tests),
     * or development mode (running the server locally, usually from source code directly).
     */
    NODE_ENV: z.enum(['production', 'testing', 'development']).default('development').describe(`
Whether the server is running in production mode (built from source),
testing mode (testing against source code and/or running E2E tests),
or development mode (running the server locally, usually from source code directly).
`.trim()),


    /**
     * OPTIONAL: Base URL of your web server, used for SEO metadata and the Web App Manifest.
     *
     * For example, "https://stockedhome.app/"
     */
    NEXT_PUBLIC_BASEURL: z.string().url().optional().describe(`
OPTIONAL: Base URL of your web server, used for SEO metadata and the Web App Manifest.

For example, "https://stockedhome.app/"
`.trim()),

}).merge(z.object({}))

type EnvBase = z.infer<typeof envSchema>;

export interface ComputedEnvProps {

}

type EnvWithComputedPropsAndProcessEnv<T extends EnvBase> = T & ComputedEnvProps & typeof process.env

export type Env = EnvWithComputedPropsAndProcessEnv<EnvBase>;

export const env = ('IN_CODEGEN' in process.env && process.env.IN_CODEGEN === 'true' ? process.env : envSchema.parse(process.env)) as Env & typeof process.env;
