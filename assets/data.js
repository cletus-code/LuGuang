/* Catalogue and brew guides for Lights Landing Coffee.
   The five coffees on sale, cheapest first. Names, lots, processes, tasting
   notes and farm stories are translated from the roaster's notes for each
   coffee; prices and sizes are the shop's. `image` is the label artwork,
   `bag` a photo of the bag. The roast and the roaster's brew recipes are the
   same for every coffee and live in product.html.

   `processes` lists every process a lot is sold as (the shelf's Process
   filter matches any of them); `process` is how it reads on the page.
   `cup` is the tasting as aroma, palate and finish; a coffee noted in one
   line has `tasting` instead. */

window.LIGHTS = (function () {

  var coffees = [
    {
      id: 'alo-main-station',
      name: 'ALO Main Station',
      origin: 'Ethiopia',
      region: 'Sidamo, Bensa',
      process: 'Zero-fermentation washed',
      processes: ['Washed'],
      variety: '74158',
      notes: 'Orange juice · Buddha’s hand · nectarine · jasmine green tea',
      price: 16,
      size: '100g',
      image: 'uploads/label-alo-main-station.jpg',
      fit: 'contain',   // label art: show it whole; use 'cover' for photos
      bag: 'uploads/bag-alo-main-station.jpg',
      label: {
        en: 'Ethiopia ALO Sidamo Bensa Main Station 74158 Zero Fermentation Washed',
        zh: '埃塞俄比亚 阿洛 西达摩 奔莎 主站 74158 零发酵 水洗'
      },
      blurb: 'A 74158 from ALO’s main station in Bensa, Sidamo, washed with no fermentation: mandarin and lemongrass, then orange juice and nectarine, and a long jasmine green tea finish.',
      specs: { Variety: '74158', Process: 'Zero-fermentation washed', Harvest: '2026', Roast: 'Light' },
      cup: [
        ['Aroma', 'Citrus and mandarin orange, with a light lemongrass.'],
        ['Palate', 'Sweet-tart juiciness like orange juice, Buddha’s hand and nectarine. Clean and delicate.'],
        ['Finish', 'A light jasmine green tea, fine and long.']
      ],
      story: [
        'Every ALO lot we cupped this year was strong. The main station’s mixed washed is the most intense: kumquat wrapped in heavy florals, a complex, shifting juiciness and a long finish. The K72 washed is all rich, smooth yellow fruit. This one, the zero-fermentation washed, is the most delicate: an elegant white-flower aroma, sweetness and acidity like freshly squeezed sweet orange, and the juiciness of white peach.',
        'ALO Coffee is an Ethiopian green-coffee company founded in 2020. In its second year, founder Tamiru Tadesse Tesema led the team to first place in Ethiopia’s Cup of Excellence.',
        'Farmers in the village of Alo had grown coffee for a long time, on land above 2,400 metres. After years of tending, the trees bore very small cherries, and because local traders didn’t want small beans, the farmers never found a buyer. In 2020 Tamiru Tadesse came to Alo, tasted those small beans and saw how much they had to give in flavour and quality.',
        'Within a few years ALO became the name for top-grade Ethiopian coffee, ahead of the rest in both quality and volume.'
      ]
    },
    {
      id: 'bambito-estate',
      name: 'Bambito Estate',
      origin: 'Panama',
      region: 'Volcán',
      process: 'Anaerobic natural',
      processes: ['Natural'],
      variety: 'Yellow Catuai',
      notes: 'Ripe yellow fruit · red grapefruit · redcurrant · cane sugar',
      price: 18,
      size: '100g',
      image: 'uploads/label-bambito-estate.jpg',
      fit: 'contain',   // label art: show it whole; use 'cover' for photos
      bag: 'uploads/bag-bambito-estate.jpg',
      label: {
        en: 'Panama Volcán Bambito Estate Yellow Catuai AN Natural',
        zh: '巴拿马 沃肯 芭比朵庄园 黄卡杜艾 厌氧日晒'
      },
      blurb: 'Yellow Catuai from Bambito Estate in Volcán, Panama, as an anaerobic natural: ripe yellow fruit and dried apple, red grapefruit and redcurrant, and a cane-sugar finish.',
      specs: { Variety: 'Yellow Catuai', Process: 'Anaerobic natural', Altitude: '1,660–1,800 m', Roast: 'Light' },
      cup: [
        ['Aroma', 'Pronounced ripe yellow fruit, with the sweetness of dried apple.'],
        ['Palate', 'Full juiciness like red grapefruit and redcurrant, with plenty of ripe stone-fruit sweet-tartness.'],
        ['Finish', 'Cane-sugar sweetness, layered and heady.']
      ],
      story: [
        'One of Panama’s top estates, Bambito has always been well loved, but it produces very little each year, so few people know it. Both of this year’s Bambito lots are intense: the Geisha with strong florals and full Buddha’s-hand citrus, and this anaerobic natural Yellow Catuai with ripe fruit — heady, shifting and solid, yet still round.',
        'The estate lies between 1,660 and 1,800 metres, running east to west between two ridges, with national forest on both sides. Besides the views, the ridges give Bambito its own microclimate, sheltering the trees from the summer north winds and the extremes of high altitude.',
        'Two natural springs water the trees and keep the whole estate supplied. Bambito also has its own greenhouse, where the coffee is stored, and a cupping lab for quality control.',
        'Bambito has been known in Panama for a long time, shaped by generations of work. The Sittón family’s eldest manager today remembers that her father, Alberto Sittón Rios, took the estate over from the generation before him in 1945, and how he smiled whenever he talked about it. “This is the best of what our family has,” he used to say. “It has to carry on.”'
      ],
      awards: [
        '2023 Best of Panama — 13th, Geisha washed',
        '2022 Best of Panama — 9th, Geisha washed',
        '2021 Best of Panama — 1st, Geisha washed',
        '2021 Best of Panama — 5th, Geisha natural',
        '2021 Best of Panama — 4th, traditional varieties washed',
        '2020 Best of Panama — 3rd, Geisha washed',
        '2019 Best of Panama — 5th, Geisha washed'
      ]
    },
    {
      id: 'finca-la-fresa',
      name: 'Finca La Fresa',
      origin: 'Honduras',
      region: 'Lempira, San Andrés',
      process: 'Washed',
      processes: ['Washed'],
      variety: 'Geisha',
      notes: 'Jasmine · orange · white peach · lychee · honey',
      price: 26,
      size: '100g',
      image: 'uploads/label-finca-la-fresa.jpg',
      fit: 'contain',   // label art: show it whole; use 'cover' for photos
      bag: 'uploads/bag-finca-la-fresa.jpg',
      label: {
        en: 'Honduras Lempira San Andrés Finca La Fresa Geisha Lot #131 Washed',
        zh: '洪都拉斯 伦皮拉省 草莓庄园 瑰夏 Lot#131 水洗'
      },
      blurb: 'Washed Geisha, lot #131, from Finca La Fresa — “the strawberry farm” — in San Andrés, Lempira, Honduras: rich jasmine, orange, white peach, lychee and honey.',
      specs: { Variety: 'Geisha', Process: 'Washed', Lot: '#131', Roast: 'Light' },
      tasting: 'Rich jasmine, orange, white peach, lychee and honey.',
      story: [
        'Both Honduran Geishas we brought in this time have excellent floral and fruit character. They are grown in Lempira, yet taste strongly of Panamanian Geisha: a prominent white-flower aroma, very clean, fine citrus sweet-tart juiciness and a fresh, peach-like sweetness. Geishas this good are rarely this good value.',
        'Honduras sits in northern Central America, with the Caribbean to the north and the Pacific’s Gulf of Fonseca to the south. Most of the country is mountains and plateaus; it is the most mountainous country in Central America, with everything a coffee farm needs. The coastal plains are tropical rainforest and the highlands subtropical forest, mild all year, with plenty of rain and clear dry and wet seasons.',
        'Honduras came to coffee late, but it is now one of the world’s largest arabica producers, with six coffee regions and some 280,000 hectares of farms. Its coffees have the floral, fruity aroma and soft juiciness of Central America, a hint of exotic spice in the aroma and a nutty, chocolate body later on — balanced and layered.'
      ]
    },
    {
      id: 'elida-estate',
      name: 'Elida Estate',
      origin: 'Panama',
      region: 'Boquete, Vuelta',
      process: 'DRD natural',
      processes: ['Natural'],
      variety: 'Geisha',
      notes: 'Jasmine · orange blossom · sweet lemon · Buddha’s hand',
      price: 39,
      size: '75g',
      image: 'uploads/label-elida-estate.jpg',
      fit: 'contain',   // label art: show it whole; use 'cover' for photos
      bag: 'uploads/bag-elida-estate.jpg',
      label: {
        en: 'Panama Boquete Elida Estate Vuelta #0902-250226 Geisha DRD Natural',
        zh: '巴拿马 波奎特 艾利达庄园 Vuelta地块 #0902-250226 瑰夏 暗房干燥日晒'
      },
      blurb: 'Geisha from Elida Estate’s Vuelta plot in Boquete, Panama, a natural dried in a dark room (DRD): jasmine and orange blossom, sweet lemon and Buddha’s hand, and a long, candied finish.',
      specs: { Variety: 'Geisha', Process: 'Dark-room dried natural', Lot: '#0902-250226', Roast: 'Light' },
      cup: [
        ['Aroma', 'Distinct white florals like jasmine and orange blossom, elegant and fine.'],
        ['Palate', 'Fresh sweet lemon and Buddha’s hand, like an orange hard candy. Lively, bright, sweet-tart and round.'],
        ['Finish', 'The sweetness of fruit gummies, delicate and long.']
      ],
      story: [
        'Almost every Elida lot did well in 2026. Most were processed in a cold room or a dark room, which makes them especially delicate and pronounced, with the strong floral and fruit character of Panamanian Geisha.',
        'Elida Estate is in the highlands of Boquete, Panama, run by the Lamastus family — one of the legendary farms of recent Best of Panama competitions. It sits on the edge of Volcán Barú National Park, and the rich volcanic soil, cloud-forest climate and very high altitude give Elida’s coffees clean florals, juiciness and fine layers.'
      ]
    },
    {
      id: 'gato-grande',
      name: 'Gato Grande',
      origin: 'Panama',
      region: 'Tierras Altas, Los Pozos',
      process: 'Cold-fermented yeast natural',
      processes: ['Natural'],
      variety: 'Geisha',
      notes: 'Jasmine · Buddha’s hand · candied lemon · white peach · honey',
      price: 49,
      size: '75g',
      image: 'uploads/label-gato-grande.jpg',
      fit: 'contain',   // label art: show it whole; use 'cover' for photos
      bag: 'uploads/bag-gato-grande.jpg',
      label: {
        en: 'Panama Tierras Altas Los Pozos Gato Grande Coffee Forest Lot #K4 Geisha Cold Fermentation Yeast Natural',
        zh: '巴拿马 蒂埃拉斯阿尔塔斯 洛斯波索斯 Gato Grande庄园 Lot#K4 瑰夏 酵母冷发酵日晒'
      },
      blurb: 'Geisha lot K4 from the Gato Grande Coffee Forest in Los Pozos, Tierras Altas, Panama, a natural cold-fermented with yeast: jasmine and Buddha’s hand, candied lemon and white peach, and a honeyed finish.',
      specs: { Variety: 'Geisha', Process: 'Cold-fermented yeast natural', Lot: 'K4', Roast: 'Light' },
      cup: [
        ['Aroma', 'Rich jasmine and Buddha’s hand, full and generous.'],
        ['Palate', 'The sweet juiciness of candied lemon and white peach, very rich and heady.'],
        ['Finish', 'A honey-like sweetness, delicate, clean and lasting.']
      ],
      story: [
        'Gato Grande Coffee Forest was founded in 2023 in Los Pozos, Tierras Altas — an important area in Best of Panama every year. The very high altitude, low average temperature and wide swing between day and night stretch out the ripening of the cherries, and that slow growth lets the Geisha here build up more sugars and other compounds, for a richer cup.',
        'Yessie Hartman and Jean Paul, who run the farm, both come from well-known Panamanian coffee families: Yessie is the eldest daughter of the owner of the Hartmann estate, and Jean Paul is general manager of Carmen Estate. With deep experience in growing and management, and the support of both estates, Gato Grande has finished its second harvest this year, and all of its Geishas are very-high-quality micro-lots.',
        'This lot has excellent green beans with a high density. At first crack in the roaster you can smell heavy florals and citrus — jasmine, Buddha’s hand, lemon — with a clear sweetness. All that the beans have built up makes the cup heady and layered: very heavy white florals and Buddha’s hand in the dry fragrance; candied lemon and white peach, sweet, juicy, smooth and shifting, on the palate; then a honey-like sweetness and a fine, clean, lasting finish.',
        'Besides its heavy florals, this cold-fermented natural Geisha has a richer, more varied juiciness than a traditional washed: sweet peach and ripe cherry stand out, with a rock-sugar sweetness, solid, fine and long.'
      ]
    }
  ];

  /* Brew guides. The V60 recipe is the design (3c). Espresso and Iced use the
     numbers given on the product page's "Brew it this way" cards. */
  var guides = [
    {
      id: 'v60',
      name: 'V60',
      title: 'Pour-over, V60',
      image: 'uploads/pourover-hero.jpg',
      alt: 'Pouring water over a V60 on the brew bar',
      intro: 'A clean, repeatable recipe for a single cup. Anything in a cone works — the ratio matters more than the brewer.',
      glance: [
        ['Ratio', '1:16'],
        ['Dose', '15 g'],
        ['Water', '240 g at 94 °C'],
        ['Grind', 'medium-fine'],
        ['Total time', '2:45']
      ],
      note: 'Filtered water, 60–100 ppm. Rinse the paper before you start.',
      steps: [
        ['Rinse and dose', 'Rinse the filter with hot water, discard it, then add 15 g of coffee and level the bed.'],
        ['Bloom, 45 g', 'Pour 45 g in a slow spiral and wait 40 seconds. The bed should rise and settle.'],
        ['First pour, to 150 g', 'Pour steadily in circles, keeping the bed level. Avoid the paper wall.'],
        ['Final pour, to 240 g', 'Finish by 1:45. Give the brewer one gentle swirl and let it draw down.'],
        ['Draw down and taste', 'Clear by 2:45. Sour means grind finer; bitter and dry means coarser.']
      ]
    },
    {
      id: 'espresso',
      name: 'Espresso',
      title: 'Espresso',
      image: 'uploads/guide-espresso.jpg',
      alt: 'Espresso running from the portafilter',
      intro: 'A starting point, not a rule. Dial the grind until the shot lands in the window, then taste and move one variable at a time.',
      glance: [
        ['Ratio', '1:2.2'],
        ['Dose', '18 g'],
        ['Yield', '40 g'],
        ['Grind', 'fine'],
        ['Total time', '28 s']
      ],
      note: 'Weigh the shot, every time. Volume in the cup tells you nothing useful.',
      steps: [
        ['Dose 18 g', 'Weigh into a dry basket. Wipe the rim before you lock in.'],
        ['Distribute and tamp', 'Level the bed, then tamp flat and firm. Uneven beds channel and the shot comes out thin.'],
        ['Pull to 40 g', 'First drops by 8–12 seconds, 40 g in the cup around 28 seconds.'],
        ['Taste and adjust', 'Sour and fast means grind finer. Bitter and slow means coarser. Change one thing at a time.'],
        ['For milk', 'Pull a touch shorter, to 36 g, so the shot holds its own against the milk.']
      ]
    },
    {
      id: 'iced',
      name: 'Iced',
      title: 'Iced filter',
      image: 'uploads/guide-iced.jpg',
      alt: 'Iced coffee poured over ice in a tall glass',
      intro: 'Brewed hot straight onto ice. The aromatics get trapped as it chills, so it lands sweeter and more fragrant than cold brew.',
      glance: [
        ['Ratio', '1:12'],
        ['Dose', '20 g'],
        ['Water', '240 g at 94 °C'],
        ['Ice', '120 g in the carafe'],
        ['Grind', 'medium-fine']
      ],
      note: 'The ice is part of the recipe, not a garnish — it is the rest of the water.',
      steps: [
        ['Load the carafe', 'Weigh 120 g of ice into the vessel under the brewer before you start.'],
        ['Dose 20 g', 'Grind a little finer than you would for hot filter. Rinse the paper and level the bed.'],
        ['Bloom, 50 g', 'Pour 50 g and wait 35 seconds.'],
        ['Pour to 240 g', 'Two even pours, finishing by 1:40. It will draw down faster than a hot brew.'],
        ['Swirl and serve', 'Swirl the carafe until the last ice melts, then pour over fresh ice in a cold glass.']
      ]
    }
  ];

  /* Email reservations. The wishlist page posts each signup as JSON to this
     address: a form service's endpoint (e.g. https://formspree.io/f/xxxxxxxx)
     or, later, the site's own /api/reserve. Empty keeps the form hidden, so
     nobody can submit into nothing. See README.md. */
  var reserve = { endpoint: '' };

  return { coffees: coffees, guides: guides, reserve: reserve };
})();
