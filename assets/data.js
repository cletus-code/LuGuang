/* Catalogue and brew guides for Lights Coffee.
   Names, origins, processes, tasting notes, prices and pack shots come
   straight from the roadmap (options 2a / 3a / 3b / 3c). Per-lot specs and
   farm notes are written here to fill the 3b template — only Sidama Dusk's
   copy is from the design itself. See README.md. */

window.LIGHTS = (function () {
  var PACK = 'uploads/Juice-Box_Transparant-Thumb_min4000_xlcfyw.webp';

  var coffees = [
    {
      id: 'sidama-dusk',
      name: 'Sidama Dusk',
      origin: 'Ethiopia',
      region: 'Sidama',
      process: 'Washed',
      roast: 'Filter',
      notes: 'Bergamot, apricot, honey',
      price: 21,
      image: PACK,
      fit: 'contain',
      blurb: 'Bergamot, apricot and honey, with a long clean finish. Grown at 2,050 m and dried on raised beds.',
      specs: { Altitude: '2,050 m', Varietal: 'Heirloom', Harvest: 'Nov 2025' },
      story: [
        'This lot comes from 40 smallholders around Bokaso, delivered as ripe cherry to the washing station and floated the same afternoon.',
        'We’ve bought from this station three years running; the 2025 harvest is the cleanest yet.'
      ]
    },
    {
      id: 'narino-night',
      name: 'Nariño Night',
      origin: 'Colombia',
      region: 'Nariño',
      process: 'Honey',
      roast: 'Espresso',
      notes: 'Red plum, panela, cacao',
      price: 19,
      image: 'uploads/IMG_8872.jpg',
      fit: 'cover',
      blurb: 'Red plum and panela over a cacao base. Dense and sweet — the one we pull as espresso on the bar.',
      specs: { Altitude: '1,850 m', Varietal: 'Caturra', Harvest: 'Oct 2025' },
      story: [
        'Grown on steep ground above Buesaco, where the cherry is depulped at the farm and dried with the mucilage left on.',
        'The honey process is what gives this lot its weight; it holds up to milk without going flat.'
      ]
    },
    {
      id: 'nyeri-lamplight',
      name: 'Nyeri Lamplight',
      origin: 'Kenya',
      region: 'Nyeri',
      process: 'Washed',
      roast: 'Filter',
      notes: 'Blackcurrant, grapefruit, cane',
      price: 23,
      image: PACK,
      fit: 'contain',
      blurb: 'Blackcurrant and grapefruit with cane sugar underneath. Bright, structured, and unmistakably Kenyan.',
      specs: { Altitude: '1,750 m', Varietal: 'SL28, SL34', Harvest: 'Dec 2025' },
      story: [
        'A day lot from a factory serving around 600 members on the slopes below Nyeri town, fermented overnight and washed in cold mountain water.',
        'We buy one lot a year here and it always sells out before the next harvest lands.'
      ]
    },
    {
      id: 'llaqta-cold-brew',
      name: 'Llaqta Cold Brew',
      origin: 'Peru',
      region: 'Cajamarca',
      process: 'Washed',
      roast: 'Filter',
      notes: 'Violet, candied orange, lemon',
      price: 24,
      image: 'uploads/IMG_8878.jpg',
      fit: 'cover',
      blurb: 'Violet and candied orange with a lemon lift. Roasted a touch longer for cold brew, and just as good hot.',
      specs: { Altitude: '1,900 m', Varietal: 'Bourbon', Harvest: 'Sep 2025' },
      story: [
        'Bought through a producer group in Jaén that mills and dries collectively, which is the only reason a lot this small gets separated at all.',
        'It was the standout on the cupping table this season — floral without being thin.'
      ]
    },
    {
      id: 'nemba-morning',
      name: 'Nemba Morning',
      origin: 'Burundi',
      region: 'Kayanza',
      process: 'Natural',
      roast: 'Filter',
      notes: 'Dried apricot, honey, white flowers',
      price: 21,
      image: PACK,
      fit: 'contain',
      blurb: 'Dried apricot and honey with white flowers on the finish. A natural that stays clean rather than boozy.',
      specs: { Altitude: '1,800 m', Varietal: 'Red Bourbon', Harvest: 'Jul 2025' },
      story: [
        'Dried whole on raised beds for 21 days and turned by hand through the hottest part of the afternoon.',
        'Naturals from this hill can get heavy; this one was pulled off the beds early and it shows.'
      ]
    },
    {
      id: 'house-daylight',
      name: 'House Daylight',
      origin: 'Blend',
      region: 'Brazil, Colombia',
      process: 'Blend',
      roast: 'Filter',
      notes: 'Cane sugar, almond, orange',
      price: 17,
      image: 'uploads/IMG_8876.jpg',
      fit: 'cover',
      blurb: 'Cane sugar and almond with an orange edge. Our everyday blend — forgiving on the brewer, sweet in milk.',
      specs: { Altitude: '1,100–1,700 m', Varietal: 'Mixed', Harvest: 'Rolling' },
      story: [
        'Two components: a pulped natural from Minas Gerais for body, and a washed Colombian for the citrus on top.',
        'We re-cup and re-balance it every few weeks so the cup stays the same as the harvests move.'
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
      image: 'uploads/IMG_8874.jpg',
      alt: 'Pour-over brewer on a scale',
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
      image: 'uploads/IMG_8873.jpg',
      alt: 'Warm afternoon light on a kitchen counter',
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
      image: 'uploads/IMG_8877.jpg',
      alt: 'Latte in warm afternoon light',
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
        ['For milk', 'Nariño Night and House Daylight take milk best — pull them a touch shorter, to 36 g.']
      ]
    },
    {
      id: 'iced',
      name: 'Iced',
      title: 'Iced filter',
      image: 'uploads/IMG_8878.jpg',
      alt: 'Coffee poured over a large ice cube',
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
