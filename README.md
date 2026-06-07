# Mathieu Moens — "Now Boarding" portfolio (Flight MM2026)

Eén doorlopende scroll-website (eindpresentatie). Concept: een boarding-reis door opleiding,
stages en toekomst (luchtvaart + logistiek/supply chain). Gebouwd als snelle, statische site —
**geen installatie nodig**.

## Wat zit erin
```
site/
├─ index.html         ← de volledige website (alle 9 "legs")
├─ favicon.svg        ← het vliegtuig-icoontje in het browsertabblad
├─ css/
│  ├─ tokens.css      ← kleuren, fonts, type-schaal
│  ├─ components.css  ← boarding pass, stempels, meters, container, ...
│  └─ legs.css        ← de secties, de rail, de vluchtlijn, animaties
├─ js/
│  └─ app.js          ← smooth-scroll (Lenis) + scroll-animaties (GSAP) + alle interacties
└─ images/            ← jouw foto's (zie images/README.md voor de exacte namen)
```

## De site lokaal bekijken (op je eigen pc)
1. Open de map `site`.
2. Dubbelklik op **`index.html`** → hij opent in je browser.
   (Je hebt internet nodig: de fonts en de animatie-bibliotheken laden via het web.)

> Tip: gebruik bij voorkeur Chrome of Edge. Werkt een afbeelding niet meteen? Doe **Ctrl + F5**.

## Online zetten (gratis, aanrader: Netlify Drop — geen account-gedoe)
**Optie A — Netlify Drop (snelst):**
1. Ga naar https://app.netlify.com/drop
2. Sleep de **hele map `site`** in het venster.
3. Klaar — je krijgt meteen een live link die je kan delen. (Optioneel gratis account om de naam te kiezen.)

**Optie B — Vercel:**
1. Maak een gratis account op https://vercel.com
2. Klik **Add New → Project → Deploy** en sleep/​upload de map `site` (of koppel een GitHub-repo).
3. Geen build-instellingen nodig: het is een statische site. → Live link.

**Optie C — GitHub Pages:**
1. Zet de inhoud van `site/` in een GitHub-repo.
2. Settings → Pages → branch = main, map = `/root`. → Live link.

## Foto's toevoegen of vervangen
Zie **`images/README.md`**. Kort: zet je foto met de juiste naam in `images/`, ververs de pagina.

## Nog aan te passen (handmatig, 1 regel)
- **LinkedIn-link:** in `index.html`, zoek `href="https://www.linkedin.com/"` en zet je eigen profiel-URL.
- **E-mail:** staat ingesteld op `mathieu.moens290505@gmail.com` (in `index.html`, zoek `mailto:`).

## Toegankelijkheid & prestaties
- Werkt met toetsenbord (Tab), zichtbare amber focus-randen, één `<h1>`, alt-teksten.
- Respecteert "verminderde beweging" (systeeminstelling) → animaties worden dan rustige fades.
- Responsief: rail wordt onderaan een dot-strip op smalle schermen.
- Geen inhoudstafel/menu — navigatie enkel via de 9 dots op de rail (zoals de jury vraagt).
