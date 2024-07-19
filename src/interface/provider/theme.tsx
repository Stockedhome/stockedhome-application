'use client';

import * as React from 'react';
import { DripsyProvider, makeTheme } from 'dripsy';
import { useFonts } from 'expo-font';
import { Rubik_500Medium, Rubik_500Medium_Italic, Rubik_600SemiBold, Rubik_600SemiBold_Italic, Rubik_900Black, Rubik_900Black_Italic } from '@expo-google-fonts/rubik';
import { Platform, Text as RNText } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export function Fonts({ children }: React.PropsWithChildren<{}>) {

    const [loaded, error] = useFonts({
        Rubik_500Medium,
        Rubik_500Medium_Italic,
        Rubik_600SemiBold,
        Rubik_600SemiBold_Italic,
        Rubik_900Black,
        Rubik_900Black_Italic,
    });

    const [splashScreenState, setSplashScreenState] = React.useState<'loading' | 'hide-in-three-renders' | 'hide-in-two-renders' | 'hide-in-one-render' | 'hidden'>('loading');
    if (splashScreenState === 'hide-in-three-renders') {
        queueMicrotask(() => setSplashScreenState('hide-in-two-renders'));
    } else if (splashScreenState === 'hide-in-two-renders') {
        queueMicrotask(() => setSplashScreenState('hide-in-one-render'));
    } else if (splashScreenState === 'hide-in-one-render') {
        queueMicrotask(() => {
            SplashScreen.hideAsync();
            setSplashScreenState('hidden');
        });
    }

    React.useEffect(() => {
        if (error) {
            console.error('Error loading fonts:', error);
        } else if (!loaded) {
            console.log('Loading fonts...');
        } else {
            console.log('Fonts loaded');
        }
    }, [loaded, error]);

    if (error) {
        SplashScreen.hideAsync();
        console.error('Error loading fonts:', error);
        return <RNText>Error loading fonts: {error.stack || error.message}</RNText>;
    }

    if (loaded) {
        if (splashScreenState === 'loading') setSplashScreenState('hide-in-three-renders');
        return <>{children}</>;
    }


    if (Platform.OS === 'android' || Platform.OS === 'ios') {
        return <RNText>Loading fonts...</RNText>;
    } else {
        return <>{children}</>;
    }
}

const theme = makeTheme({
    types: {
        reactNativeTypesOnly: true,
    },
    colors: {
        gray: "hsl(210, 50%, 60%)",

        accent: '#097eed',
        primary: '#3a8fe0',
        highlight: '#5db0ff',

        background: '#222222',

        text: '#cccccc',
        textBright: '#dddddd',
        textSecondary: '#aaaaaa',
        secondary: '#aaaaaa',
        textMuted: '#666666',
        muted: '#666666',

        errorRed: '#ff6666',
        successGreen: '#66ff66',
    },
    fonts: {
        heading: "inherit",
        monospace: "Menlo, monospace",
        root: 'Rubik_500Medium',
    },
    borders: {
        default: {
            backgroundColor: 'accent',
        }
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
    images: {
        icon: {
            width: 32,
            height: 32,
        }
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
            marginTop: 0,
        },
        bold: {
            fontWeight: 'bold',
        },
        h1: {
            fontSize: 32,
            fontWeight: 'bold',
            color: 'textBright',
            marginBottom: 16,
        },
        h2: {
            fontSize: 26,
            fontWeight: 'bold',
            color: 'textBright',
            marginBottom: 14,
        },
        h3: {
            fontSize: 20,
            fontWeight: 'bold',
            color: 'textBright',
            marginBottom: 12,
        },
        a: {
            color: 'primary',
        },
    },
    forms: {
        input: {
            mb: 16,
            width: '80%',
            padding: 8,
            marginBottom: 10,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: 'gray',
            color: 'text',
            height: 40,
        },
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

type MyTheme = typeof theme

declare module 'dripsy' {
  interface DripsyCustomTheme extends MyTheme {}
}

export function ThemeProvider({ children }: { children: React.ReactNode; }) {
    return <Fonts><DripsyProvider theme={theme} ssr={true}>
            {children}
    </DripsyProvider></Fonts>;
}
