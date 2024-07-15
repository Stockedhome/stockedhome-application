'use client';

import * as React from 'react';
import { DripsyProvider, Text, View, makeTheme } from 'dripsy';
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

const theme = makeTheme(Object.assign({
    "colors": {
      "text": "hsl(210, 50%, 96%)",
      "background": "hsl(230, 25%, 18%)",
      "primary": "hsl(260, 100%, 80%)",
      "secondary": "hsl(290, 100%, 80%)",
      "highlight": "hsl(260, 20%, 40%)",
      "purple": "hsl(290, 100%, 80%)",
      "muted": "hsla(230, 20%, 0%, 20%)",
      "gray": "hsl(210, 50%, 60%)"
    },
    "fonts": {
      "body": "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", sans-serif",
      "heading": "inherit",
      "monospace": "Menlo, monospace"
    },
    "fontSizes": [
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
    "fontWeights": {
      "body": 400,
      "heading": 700,
      "display": 900
    },
    "lineHeights": {
      "body": 1.5,
      "heading": 1.25
    },
    "text": {
      "heading": {
        "fontFamily": "heading",
        "fontWeight": "heading",
        "lineHeight": "heading"
      },
      "display": {
        "variant": "text.heading",
        "fontSize": [
          5,
          6
        ],
        "fontWeight": "display",
        "letterSpacing": "-0.03em",
        "mt": 3
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
    }
  } as any, {
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
}));

export function Dripsy({ children }: { children: React.ReactNode; }) {
    return <Fonts><DripsyProvider theme={theme} ssr={true} >
        {children}
    </DripsyProvider></Fonts>
}
