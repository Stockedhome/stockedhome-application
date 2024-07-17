'use client';

import * as React from 'react';
import { DripsyProvider, Text, View, makeTheme } from 'dripsy';
import { useFonts } from 'expo-font';
import { Rubik_500Medium, Rubik_500Medium_Italic, Rubik_600SemiBold, Rubik_600SemiBold_Italic, Rubik_900Black, Rubik_900Black_Italic } from '@expo-google-fonts/rubik';
import { TRPCProvider } from './tRPC-provider';
import { Platform } from 'react-native';

export function Fonts({ children }: React.PropsWithChildren<{}>) {

    const [loaded, error] = useFonts({
        Rubik_500Medium,
        Rubik_500Medium_Italic,
        Rubik_600SemiBold,
        Rubik_600SemiBold_Italic,
        Rubik_900Black,
        Rubik_900Black_Italic,
    });

    React.useEffect(() => {
        if (error) {
            console.error('Error loading fonts:', error);
        } else if (!loaded) {
            console.log('Loading fonts...');
        } else {
            console.log('Fonts loaded');
        }
    }, [loaded, error]);

    if (loaded) return <>{children}</>;


    if (Platform.OS === 'android' || Platform.OS === 'ios') {
        return <Text>Loading fonts...</Text>;
    } else {
        return <>{children}</>;
    }
}

const theme = makeTheme({
    types: {
        reactNativeTypesOnly: true,
    },
    colors: {
        purple: "hsl(290, 100%, 80%)",
        gray: "hsl(210, 50%, 60%)",

        primary: '#1d6cb8',
        highlight: '#5db0ff',
        accent: '#184c7d',

        background: '#222222',

        text: '#cccccc',
        textBright: '#dddddd',
        textSecondary: '#aaaaaa',
        secondary: '#aaaaaa',
        textMuted: '#666666',
        muted: '#666666',
    },
    fonts: {
        heading: "inherit",
        monospace: "Menlo, monospace",
        root: 'rubik',
    },
    fontSizes: [
        12,
        14,
        16,
        20,
        24,
        32,
        48,
        64,
        72
    ],
    fontWeights: {
        body: '400',
        heading: '700',
        display: '900'
    },
    lineHeights: {
        body: 1.5,
        heading: 1.25
    },
    text: {
        heading: {
            fontFamily: "heading",
            fontWeight: "heading",
            lineHeight: "heading"
        },
        display: {
            variant: 'text.heading',
            fontSize: [
                5,
                6
            ],
            fontWeight: "display",
            letterSpacing: "-0.03em",
            mt: 3
        },
        p: {
            fontSize: 16,
            color: 'text',
        },
        div: {
            fontSize: 16,
            color: 'text',
        },
        Text: {
            fontSize: 16,
            color: 'text',
        },
        bold: {
            fontWeight: 'bold',
        },
        h1: {
            fontSize: 32,
            fontWeight: 'bold',
            color: 'textBright',
        },
        A: {
            color: 'primary',
        }
    },
    "styles": {
        "Container": {
            "p": 3,
            "maxWidth": 1024
        },
        "root": {
            "fontFamily": "body",
            "lineHeight": "body",
            "fontWeight": "body"
        },
        "h1": {
            "variant": "text.display"
        },
        "h2": {
            "variant": "text.heading",
            "fontSize": 5
        },
        "h3": {
            "variant": "text.heading",
            "fontSize": 4
        },
        "h4": {
            "variant": "text.heading",
            "fontSize": 3
        },
        "h5": {
            "variant": "text.heading",
            "fontSize": 2
        },
        "h6": {
            "variant": "text.heading",
            "fontSize": 1
        },
        "a": {
            "color": "primary",
            "&:hover": {
                "color": "secondary"
            }
        },
        "pre": {
            "variant": "prism",
            "fontFamily": "monospace",
            "fontSize": 1,
            "p": 3,
            "color": "text",
            "bg": "muted",
            "overflow": "auto",
            "code": {
                "color": "inherit"
            }
        },
        "code": {
            "fontFamily": "monospace",
            "color": "secondary",
            "fontSize": 1
        },
        "inlineCode": {
            "fontFamily": "monospace",
            "color": "secondary",
            "bg": "muted"
        },
        "table": {
            "width": "100%",
            "my": 4,
            "borderCollapse": "separate",
            "borderSpacing": 0,
            "th,td": {
                "textAlign": "left",
                "py": "4px",
                "pr": "4px",
                "pl": 0,
                "borderColor": "muted",
                "borderBottomStyle": "solid"
            }
        },
        "th": {
            "verticalAlign": "bottom",
            "borderBottomWidth": "2px"
        },
        "td": {
            "verticalAlign": "top",
            "borderBottomWidth": "1px"
        },
        "hr": {
            "border": 0,
            "borderBottom": "1px solid",
            "borderColor": "muted"
        },
        "img": {
            "maxWidth": "100%"
        }
    },
    "prism": {
        ".comment,.prolog,.doctype,.cdata,.punctuation,.operator,.entity,.url": {
            "color": "gray"
        },
        ".comment": {
            "fontStyle": "italic"
        },
        ".property,.tag,.boolean,.number,.constant,.symbol,.deleted,.function,.class-name,.regex,.important,.variable": {
            "color": "purple"
        },
        ".atrule,.attr-value,.keyword": {
            "color": "primary"
        },
        ".selector,.attr-name,.string,.char,.builtin,.inserted": {
            "color": "secondary"
        }
    },

    customFonts: {
        rubik: {
            400: 'Rubik_500Medium',
            default: 'Rubik_500Medium',
            normal: 'Rubik_500Medium',
            500: 'Rubik_500Medium',
            600: 'Rubik_600SemiBold',
            bold: 'Rubik_600SemiBold',
            700: 'Rubik_600SemiBold',
            800: 'Rubik_900Black',
            900: 'Rubik_900Black',
        },
    },
    // https://www.dripsy.xyz/usage/theming/create
});

export function Dripsy({ children }: { children: React.ReactNode; }) {
    return <DripsyProvider theme={theme} ssr={true}><Fonts><TRPCProvider>
            {children}
    </TRPCProvider></Fonts></DripsyProvider>;
}
