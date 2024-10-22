import { GeoIpDbName } from 'geolite2-redist';
import * as geolite2 from 'geolite2-redist';
import maxmind, { type CityResponse } from 'maxmind';
import { z } from "zod";
import 'server-only';

/// <reference types="node" />

// https://www.npmjs.com/package/maxmind

// Quick note on CC-BY-SA 4.0:
// The ShareAlike clause only applies if the material is modified;
// for the purposes of this code, the data is not being modified, so the ShareAlike clause does not apply.
// We must simply attribute MaxMind for the data.


const ipDataPromise = geolite2.open(
    GeoIpDbName.City,
    (path) => maxmind.open<CityResponse>(path)
)

process.addListener('exit', () => {
    ipDataPromise.then(ipData => ipData.close())
});

/**
 * ⚠️ IMPORTANT NOTE ⚠️
 *
 * Using this function requires you to attribute MaxMind's GeoLite2 (see https://dev.maxmind.com/geoip/geolite2-free-geolocation-data?lang=en)
 *
 * ---
 *
 * Get geolocation information for an IP address.
 *
 * This should not be exposed as an API endpoint. It should only be used when an IP address is explicitly provided by the user,
 * such as when a new passkey is requested.
 *
 */
export async function getIpLocationData(ip: string): Promise<CityResponse | null> {
    const ipData = await ipDataPromise
    return ipData.get(ip)
}

/**
 * ⚠️ IMPORTANT NOTE ⚠️
 *
 * Using this data requires you to attribute MaxMind's GeoLite2 (see https://dev.maxmind.com/geoip/geolite2-free-geolocation-data?lang=en)
 */
export const RegisteredCountryRecordSchema = z.object({
    names: z.object({ en: z.string() }),
    geoname_id: z.number(),
    is_in_european_union: z.boolean().optional(),
    iso_code: z.string(),
} satisfies ToZodSchema<NonNullable<CityResponse['registered_country']>>)

/**
 * ⚠️ IMPORTANT NOTE ⚠️
 *
 * Using this data requires you to attribute MaxMind's GeoLite2 (see https://dev.maxmind.com/geoip/geolite2-free-geolocation-data?lang=en)
 */
export const CityResponseSchema = z.object({
    city: z.object({
        names: z.object({ en: z.string() }),
        confidence: z.number().optional(),
        geoname_id: z.number(),
    } satisfies ToZodSchema<NonNullable<CityResponse['city']>>).optional(),

    country: RegisteredCountryRecordSchema.merge(z.object({
        confidence: z.number().optional(),
    })).optional(),

    continent: z.object({
        names: z.object({ en: z.string() }),
        code: z.enum(["AF", "AN", "AS", "EU", "NA", "OC", "SA"]),
        geoname_id: z.number(),
    } satisfies ToZodSchema<NonNullable<CityResponse['continent']>>).optional(),

    traits: z.object({
        user_type: z.enum(["business", "cafe", "cellular", "college", "content_delivery_network", "dialup", "government", "hosting", "library", "military", "residential", "router", "school", "search_engine_spider", "traveler"]).optional(),
        organization: z.string().optional(),
        isp: z.string().optional(),
        is_anonymous_proxy: z.boolean().optional(),
        is_anonymous_vpn: z.boolean().optional(),
        is_hosting_provider: z.boolean().optional(),
        is_public_proxy: z.boolean().optional(),
        is_residential_proxy: z.boolean().optional(),
        is_tor_exit_node: z.boolean().optional(),
        autonomous_system_number: z.number().optional(),
        autonomous_system_organization: z.string().optional(),
        connection_type: z.string().optional(),
        domain: z.string().optional(),
        ip_address: z.string().optional(),
        is_anonymous: z.boolean().optional(),
        is_anycast: z.boolean().optional(),
        is_legitimate_proxy: z.boolean().optional(),
        is_satellite_provider: z.boolean().optional(),
        mobile_country_code: z.string().optional(),
        mobile_network_code: z.string().optional(),
        static_ip_score: z.number().optional(),
        user_count: z.number().optional(),
    } satisfies ToZodSchema<NonNullable<CityResponse['traits']>>).optional(),

    location: z.object({
        accuracy_radius: z.number(),
        average_income: z.number().optional(),
        latitude: z.number(),
        longitude: z.number(),
        metro_code: z.number().optional(),
        population_density: z.number().optional(),
        time_zone: z.string().optional(),
    } satisfies ToZodSchema<NonNullable<CityResponse['location']>>).optional(),

    postal: z.object({
        code: z.string(),
        confidence: z.number().optional(),
    } satisfies ToZodSchema<NonNullable<CityResponse['postal']>>).optional(),

    registered_country: RegisteredCountryRecordSchema.optional(),

    represented_country: RegisteredCountryRecordSchema.merge(z.object({
        type: z.string(),
    })).optional(),

    subdivisions: z.array(z.object({
        names: z.object({ en: z.string() }),
        confidence: z.number().optional(),
        geoname_id: z.number(),
        iso_code: z.string(),
    } satisfies ToZodSchema<NonNullable<CityResponse['subdivisions']>[0]>)).optional(),
} satisfies ToZodSchema<CityResponse>)
