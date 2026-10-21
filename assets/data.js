/* Catalogue and brew guides for Lights Landing Coffee.
   The five coffees on sale, cheapest first. Names, origins, varieties,
   processes and lot numbers are transcribed from each bag's label; prices
   and sizes are the shop's. No tasting notes are given until they are
   supplied. Images are the label artwork until bag photos arrive.

   `processes` lists every process a lot is sold as (the shelf's Process
   filter matches any of them); `process` is how it reads on the page. */

window.LIGHTS = (function () {

  var coffees = [
    {
      id: 'alo-main-station',
      name: 'ALO Main Station',
      origin: 'Ethiopia',
      region: 'Sidamo, Bensa',
      process: 'Washed',
      processes: ['Washed'],
      variety: '74158, K72',
      notes: '74158 · K72 · zero-fermentation washed',
      price: 16,
      size: '100g',
      image: 'uploads/label-alo-main-station.jpg',
      fit: 'contain',   // label art: show it whole; use 'cover' for bag photos
      blurb: 'The 2026 lot from ALO’s main station in Bensa, Sidamo: 74158 and K72, washed with zero fermentation.',
      specs: { Variety: '74158, K72, mixed', Process: 'Zero-fermentation washed', Harvest: '2026' },
      story: [
        'ALO Coffee’s main station sits in Bensa, in Ethiopia’s Sidamo region. This lot mixes the 74158 and K72 varieties.',
        'It is washed with zero fermentation: the cherry is pulped and washed without a fermentation stage.'
      ]
    },
    {
      id: 'bambito-estate',
      name: 'Bambito Estate',
      origin: 'Panama',
      region: 'Volcán, Candela',
      process: 'Washed / anaerobic natural',
      processes: ['Washed', 'Natural'],
      variety: 'Geisha, Yellow Catuai',
      notes: 'Geisha · Yellow Catuai',
      price: 18,
      size: '100g',
      image: 'uploads/label-bambito-estate.jpg',
      fit: 'contain',   // label art: show it whole; use 'cover' for bag photos
      blurb: 'Geisha and Yellow Catuai from Bambito Estate in Volcán, Panama, washed or as an anaerobic natural.',
      specs: { Variety: 'Geisha, Yellow Catuai', Process: 'Washed / anaerobic natural', Farm: 'Candela' },
      story: [
        'Bambito Estate grows on the slopes of Volcán in western Panama; this coffee comes from its Candela plot.',
        'It is offered as a washed coffee and as an anaerobic natural, fermented without oxygen and dried in the cherry.'
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
      notes: 'Geisha · lot #161',
      price: 26,
      size: '100g',
      image: 'uploads/label-finca-la-fresa.jpg',
      fit: 'contain',   // label art: show it whole; use 'cover' for bag photos
      blurb: 'Washed Geisha, lot #161, from Finca La Fresa in San Andrés, Lempira, Honduras.',
      specs: { Variety: 'Geisha', Process: 'Washed', Lot: '#161' },
      story: [
        'Finca La Fresa is in San Andrés, in the Lempira department of western Honduras.',
        'Lot #161 is a washed Geisha.'
      ]
    },
    {
      id: 'elida-estate',
      name: 'Elida Estate',
      origin: 'Panama',
      region: 'Boquete, Vuelta',
      process: 'DRD washed',
      processes: ['Washed'],
      variety: 'Geisha',
      notes: 'Geisha · DRD washed',
      price: 39,
      size: '75g',
      image: 'uploads/label-elida-estate.jpg',
      fit: 'contain',   // label art: show it whole; use 'cover' for bag photos
      blurb: 'Geisha from Elida Estate’s Vuelta plot in Boquete, Panama, washed and dried in a dark room (DRD).',
      specs: { Variety: 'Geisha', Process: 'DRD washed', Lot: '#0902-250226' },
      story: [
        'Elida Estate farms the high slopes of Boquete in Panama; this lot comes from its Vuelta plot.',
        'It is washed, then dried slowly in a dark room — the DRD on the label.'
      ]
    },
    {
      id: 'gato-grande',
      name: 'Gato Grande',
      origin: 'Panama',
      region: 'Tierras Altas, Los Pozos',
      process: 'CFY natural',
      processes: ['Natural'],
      variety: 'Geisha',
      notes: 'Geisha · lot K4 · CFY natural',
      price: 49,
      size: '75g',
      image: 'uploads/label-gato-grande.jpg',
      fit: 'contain',   // label art: show it whole; use 'cover' for bag photos
      blurb: 'Geisha lot K4 from the Gato Grande coffee forest in Los Pozos, Tierras Altas, Panama: a natural fermented cold with yeast (CFY).',
      specs: { Variety: 'Geisha', Process: 'CFY natural', Lot: 'K4' },
      story: [
        'Gato Grande is a coffee forest in Los Pozos, in Panama’s Tierras Altas.',
        'Lot K4 is a natural: the cherry is fermented cold with yeast, then dried whole — CFY on the label.'
      ]
    }
  ];

  /* Brew guides. The V60 recipe is the design (3c). Espresso and Iced use the
     numbers given on the product page's "Brew it this way" cards; the French
     press recipe is written here. */
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
      id: 'french-press',
      name: 'French press',
      title: 'French press',
      image: 'uploads/guide-french-press.jpg',
      alt: 'Decanting brewed coffee into a cup',
      intro: 'The least fussy way to brew well. Full immersion, no pouring technique to get wrong — just weight, time, and a careful decant.',
      glance: [
        ['Ratio', '1:15'],
        ['Dose', '30 g'],
        ['Water', '450 g at 94 °C'],
        ['Grind', 'coarse'],
        ['Total time', '9:00']
      ],
      note: 'A three-cup press. Skip the paper filter here — the body is the point.',
      steps: [
        ['Dose and wet', 'Add 30 g of coarse coffee, then pour all 450 g of water in one go. Start the timer.'],
        ['Break the crust, 4:00', 'Stir the floating crust twice with a spoon. Most of it will sink.'],
        ['Skim, 4:30', 'Lift the foam and floating grounds off the top with two spoons and discard them.'],
        ['Rest to 9:00', 'Leave it alone. The fines settle on their own, which is what keeps the cup clean.'],
        ['Press and decant', 'Press the plunger just below the surface and pour the whole thing out. Coffee left on the grounds keeps extracting.']
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

  return { coffees: coffees, guides: guides };
})();
