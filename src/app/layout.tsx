import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Lora, Merriweather, Crimson_Text, EB_Garamond, Nunito, Raleway, Josefin_Sans } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/CartContext'
import FontApplier from '@/components/FontApplier'
import { prisma } from '@/lib/prisma'
import DataLayer from '@/components/DataLayer'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--google-playfair', display: 'swap' })
const lora = Lora({ subsets: ['latin'], variable: '--google-lora', display: 'swap' })
const merriweather = Merriweather({ subsets: ['latin'], weight: ['300','400','700'], variable: '--google-merriweather', display: 'swap' })
const crimson = Crimson_Text({ subsets: ['latin'], weight: ['400','600'], variable: '--google-crimson', display: 'swap' })
const garamond = EB_Garamond({ subsets: ['latin'], variable: '--google-garamond', display: 'swap' })
const nunito = Nunito({ subsets: ['latin'], variable: '--google-nunito', display: 'swap' })
const raleway = Raleway({ subsets: ['latin'], variable: '--google-raleway', display: 'swap' })
const josefin = Josefin_Sans({ subsets: ['latin'], variable: '--google-josefin', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: "Solomon & Sage | Premium Men's & Women's Clothing Brand",
    template: "%s | Solomon & Sage",
  },
  description: "Solomon & Sage is a premium men's and women's clothing brand founded in 2013, based in Lancaster, CA with stores in Miami. Discover modern dresses, tops, jeans, blouses, sweatshirts, cardigans, and outerwear crafted for everyday elegance and effortless style.",
  keywords: [
    "Solomon & Sage", "premium clothing brand", "women's clothing brand",
    "men's clothing brand", "Lancaster CA fashion brand", "Miami clothing store",
    "contemporary fashion brand", "American clothing brand founded 2013",
    "women's dresses", "women's tops", "women's blouses", "women's jeans",
    "women's sweatshirts", "women's cardigans", "women's outerwear",
    "women's button down shirts", "women's casual wear", "women's workwear",
    "men's shirts", "men's casual clothing", "men's tops", "men's outerwear",
    "linen clothing", "oxford shirts", "crewneck sweatshirts", "midi dresses",
    "wrap dresses", "relaxed fit clothing", "everyday fashion", "effortless style",
    "affordable luxury clothing", "premium apparel USA", "modern women's fashion",
    "classic men's fashion", "USA clothing brand", "online fashion store",
    "new arrivals clothing", "best seller clothing", "sale clothing USA",
    "clothing brand", "nordstrom clothing brand",
  ],
  authors: [{ name: "Solomon & Sage" }],
  creator: "Solomon & Sage",
  publisher: "Solomon & Sage Group LLC",
  metadataBase: new URL("https://solomonandsage.com"),
  alternates: { canonical: "https://solomonandsage.com" },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Solomon & Sage | Premium Men's & Women's Clothing Brand",
    description: "Premium men's and women's clothing brand founded in 2013. Based in Lancaster, CA with stores in Miami. Shop at Nordstrom, Macy's, Kohl's, and JCPenney.",
    type: "website",
    url: "https://solomonandsage.com",
    siteName: "Solomon & Sage",
    locale: "en_US",
    images: [{
      url: "https://d3o8u8o2i2q94t.cloudfront.net/products/1775596326876-s-linenwomen-dt-v1.webp",
      width: 1200,
      height: 630,
      alt: "Solomon & Sage Premium Clothing Brand",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solomon & Sage | Premium Men's & Women's Clothing Brand",
    description: "Premium men's and women's clothing brand founded in 2013. Based in Lancaster, CA. Shop at Nordstrom, Macy's, Kohl's, and JCPenney.",
    images: ["https://d3o8u8o2i2q94t.cloudfront.net/products/1775596326876-s-linenwomen-dt-v1.webp"],
    creator: "@solomonandsage",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "",
    yandex: "",
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a1a',
  width: 'device-width',
  initialScale: 1,
}

async function getTrackingTags() {
  try {
    const setting = await prisma.cmsSetting.findUnique({
      where: { key: 'tracking_tags' }
    })
    return (setting?.value as any) ?? {}
  } catch {
    return {}
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tags = await getTrackingTags()

  return (
    <html lang="en" className={`${playfair.variable} ${lora.variable} ${merriweather.variable} ${crimson.variable} ${garamond.variable} ${nunito.variable} ${raleway.variable} ${josefin.variable}`}>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://d3o8u8o2i2q94t.cloudfront.net" />
        <link rel="dns-prefetch" href="https://d3o8u8o2i2q94t.cloudfront.net" />

        {/* Google Tag Manager */}
        {tags.gtmId && (
          <script dangerouslySetInnerHTML={{ __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${tags.gtmId}');
          `}} />
        )}

        {/* Google Analytics 4 — only if no GTM */}
        {tags.ga4Id && !tags.gtmId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${tags.ga4Id}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${tags.ga4Id}', { page_path: window.location.pathname });
            `}} />
          </>
        )}

        {/* Meta Pixel */}
        {tags.metaPixelId && (
          <script dangerouslySetInnerHTML={{ __html: `
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${tags.metaPixelId}');
            fbq('track', 'PageView');
          `}} />
        )}

        {/* TikTok Pixel */}
        {tags.tiktokPixelId && (
          <script dangerouslySetInnerHTML={{ __html: `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tags.tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}} />
        )}

        {/* Custom head scripts */}
        {tags.customHeadScripts && (
          <div dangerouslySetInnerHTML={{ __html: tags.customHeadScripts }} />
        )}

        {/* Font CSS variables */}
        <style>{`
          :root {
            --google-playfair: ${playfair.style.fontFamily};
            --google-lora: ${lora.style.fontFamily};
            --google-merriweather: ${merriweather.style.fontFamily};
            --google-crimson: ${crimson.style.fontFamily};
            --google-garamond: ${garamond.style.fontFamily};
            --google-nunito: ${nunito.style.fontFamily};
            --google-raleway: ${raleway.style.fontFamily};
            --google-josefin: ${josefin.style.fontFamily};
          }
        `}</style>
      </head>
      <body>
        {/* GTM noscript fallback — must be first in body */}
        {tags.gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${tags.gtmId}`}
              height="0" width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}

        {/* Custom body scripts */}
        {tags.customBodyScripts && (
          <div dangerouslySetInnerHTML={{ __html: tags.customBodyScripts }} />
        )}

        <DataLayer />
        <FontApplier />
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}