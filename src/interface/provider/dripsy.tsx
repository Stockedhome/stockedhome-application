'use client';

import * as React from 'react';
import { DripsyProvider, makeTheme } from 'dripsy';
import { useFonts } from 'expo-font';
import { Rubik_500Medium, Rubik_500Medium_Italic, Rubik_700Bold, Rubik_700Bold_Italic, Rubik_900Black, Rubik_900Black_Italic } from '@expo-google-fonts/rubik';

export function Fonts({ children }: React.PropsWithChildren<{}>) {

    const [loaded, error] = useFonts({
        Rubik_500Medium,
        Rubik_500Medium_Italic,
        Rubik_700Bold,
        Rubik_700Bold_Italic,
        Rubik_900Black,
        Rubik_900Black_Italic,
    });

    React.useEffect(()=> {
        if (error) {
            console.error('Error loading fonts:', error);
        } else if (!loaded) {
            console.log('Loading fonts...');
        } else {
            console.log('Fonts loaded');
        }
    }, [loaded, error]);

    return <>{children}</>;
}

const theme = makeTheme({
    customFonts: {
      ['rubik']: {
        400: 'Rubik_500Medium',
        default: 'Rubik_500Medium',
        normal: 'Rubik_500Medium',
        500: 'Rubik_500Medium',
        600: 'Rubik_700Bold',
        bold: 'Rubik_700Bold',
        700: 'Rubik_700Bold',
        800: 'Rubik_900Black',
        900: 'Rubik_900Black',
      },
    },
    fonts: {
      root: 'rubik',
    },

    // https://www.dripsy.xyz/usage/theming/create

    text: {
        p: {
            fontSize: 16,
            color: '$text',
        },
        div: {
            fontSize: 16,
            color: '$text',
        },
        Text: {
            fontSize: 16,
            color: '$text',
        },
        bold: {
          fontWeight: 'bold',
        },
        h1: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '$textBright',
        },
        A: {
            color: '$colorPrimary',
        }
    },
    colors: {
        $colorPrimary: '#1d6cb8',
        primary: '#1d6cb8',
        $colorHighlight: '#5db0ff',
        highlight: '#5db0ff',
        $colorAccent: '#184c7d',
        accent: '#184c7d',

        background: '#222',

        $text: '#ccc',
        text: '#ccc',
        $textBright: '#ddd',
        $textSecondary: '#aaa',
        secondary: '#aaa',
        $textMuted: '#666',
        muted: '#666',
    },
});

export function Dripsy({ children }: { children: React.ReactNode; }) {
    return <DripsyProvider theme={theme} ssr={true} >
        <Fonts>
            {children}
        </Fonts>
    </DripsyProvider>
}
