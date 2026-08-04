import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      screens: {
        xl: '1280px',
      },
      padding: '15px',
    },
    extend: {
      screens: {
        '3xl': '1600px',
        '4xl': '1920px',
        '5xl': '2250px',
        '6xl': '2560px',
      },
      colors: {
        parchment: {
          DEFAULT: "#F4ECDC",
          light: "#FAF5E9",
          dark: "#E9DCC0"
        },
        ink: {
          DEFAULT: "#1C1912",
          soft: "#3A3327"
        },
        falcon: {
          gold: "#C9A24B",
          light: "#E4C374",
          deep: "#C79E5E",
          bronze: "#8A6A34"
        },
        midnight: {
          DEFAULT: "#12141C",
          soft: "#1D2130"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
        "display-ar": ["var(--font-display-ar)", "serif"],
        "body-ar": ["var(--font-body-ar)", "sans-serif"]
      },
      letterSpacing: {
        widest2: "0.25em"
      },
      backgroundImage: {
        "gold-sheen":
          "linear-gradient(120deg, #F4ECDC 0%, #E9D6AE 35%, #F4ECDC 55%, #D9BD84 75%, #F4ECDC 100%)"
      }
    }
  },
  plugins: []
};

export default config;
