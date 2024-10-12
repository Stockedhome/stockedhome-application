import { View } from "dripsy";
import type { CityResponse, CountryResponse } from "maxmind";
import { Text } from "react-native";

export function Geolocation(geoData: CityResponse) {
    const city = geoData.city;
    const country = geoData.country;
    const continent = geoData.continent;
    const traits = geoData.traits;

    const cityCountryContinent = GeolocationCityCountryContinent(city, country, continent);
    const notableInfo = GeolocationNotableInfo(traits);

    if (!cityCountryContinent && !notableInfo) return <Text>
        We could not find any information about this IP address.
    </Text>

    if (!notableInfo) return cityCountryContinent;

    return <View>
        {cityCountryContinent}
        <View sx={{ height: 8 }} />
        {notableInfo}
    </View>
}

type CityRecord = NonNullable<CityResponse['city']>
type CountryRecord = NonNullable<CityResponse['country']>
type ContinentRecord = NonNullable<CityResponse['continent']>
export function GeolocationCityCountryContinent(city: CityRecord | undefined, country: CountryRecord | undefined, continent: ContinentRecord | undefined): React.ReactElement | null {
    const cityName = (!city || city.confidence !== undefined && city.confidence < 50) ? null : city.names.en;
    const countryName = (!country || country.confidence !== undefined && country.confidence < 50) ? null : country.names.en;
    const continentName = continent ? continent.names.en : null;

    if (!cityName && !countryName && !continentName) return null;

    return <Text>{
        cityName && countryName
            ? `${cityName}, ${countryName} (${continentName})`
            : cityName || countryName
                ? `${cityName || countryName} (${continentName})`
                : continentName
    }</Text>
}

type TraitsRecord = NonNullable<CityResponse['traits']>
export function GeolocationNotableInfo(traits: TraitsRecord | undefined): React.ReactElement | null {
    if (!traits) return null;

    const notableInfo: [key: string, content: string][] = [];
    if (traits.user_type) notableInfo.push(['user_type', GeolocationCustomerType(traits.user_type) + ' IP']);
    if (traits.organization) notableInfo.push(['organization', `Belongs to ${traits.organization}`]);
    if (traits.isp) notableInfo.push(['isp', `ISP: ${traits.isp}`]);
    if (traits.is_anonymous_proxy) notableInfo.push(['is_anonymous_proxy', 'Anonymous Proxy']);
    if (traits.is_anonymous_vpn) notableInfo.push(['is_anonymous_vpn', 'Anonymous VPN']);
    if (traits.is_hosting_provider) notableInfo.push(['is_hosting_provider', 'Web Hosting Provider']);
    if (traits.is_public_proxy) notableInfo.push(['is_public_proxy', 'Public Proxy']);
    if (traits.is_residential_proxy) notableInfo.push(['is_residential_proxy', 'Residential Proxy']);
    if (traits.is_tor_exit_node) notableInfo.push(['is_tor_exit_node', 'Tor Exit Node']);

    if (!notableInfo.length) return null;

    return <Text>
        {notableInfo.map(([key, content]) => `${content}; `)}
    </Text>
}

type CustomerType = NonNullable<TraitsRecord['user_type']>
export function GeolocationCustomerType(customerType: CustomerType): string {

    // For descriptions, see https://support.maxmind.com/hc/en-us/articles/4408208479131-User-Context-Data

    switch (customerType) {
        case 'business': return 'Business'
        case 'cafe': return 'Cafe'
        case 'cellular': return 'Cellular / Mobile'
        case 'college': return 'College / University Campus'
        case 'content_delivery_network': return 'Content Delivery Network (Cloud Hosting)'
        case 'dialup': return 'Dialup (wait, that\'s still a thing?)'
        case 'government': return 'Government Agency'
        case 'hosting': return 'Cloud Hosting (Likely a VPN)'
        case 'library': return 'Library'
        case 'military': return 'Military'
        case 'residential': return 'Residential'
        case 'router': return 'Router (probably a business)'
        case 'school': return 'School / Educational Institution'
        case 'search_engine_spider': return 'Search Engine Web Crawler'
        case 'traveler': return 'Hotel / Airport / Tourism Location'
    }
}
