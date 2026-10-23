/* Catalogue and brew guides for Lights Landing Coffee.
   The five coffees on sale, cheapest first. Names, lots, processes, tasting
   notes and farm stories are translated from the roaster's notes for each
   coffee; prices and sizes are the shop's.

   `card` is what the café's printed wall card says: the Chinese and English
   names line by line, and the 风味表现 notes in one line, for when the full
   tasting notes don't fit. The card's corner shows the `process`. `art` is
   that card's marbled colour; `bag` a photo of the bag. The roast and the
   roaster's brew recipes are the same for every coffee and live in
   product.html.

   `zh` holds each coffee's (and each guide's) Chinese: the roaster's own
   words for the tasting and the estate, and translations of the rest.

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
      card: {
        zh: ['埃塞俄比亚 阿洛', '西达摩 奔莎 主站', '74158 零发酵 水洗'],
        en: ['Ethiopia ALO Sidamo', 'Bensa Main Station', '74158 Zero Fermentation Washed'],
        notes: '橙汁 佛手柑 油桃 茉莉绿茶'
      },
      art: 'uploads/card-alo-main-station.jpg',
      bag: 'uploads/bag-alo-main-station.jpg',
      zh: {
        "name": "阿洛 主站",
        "origin": "埃塞俄比亚",
        "region": "西达摩 奔莎",
        "process": "零发酵水洗",
        "variety": "74158",
        "notes": "橙汁 · 佛手柑 · 油桃 · 茉莉绿茶",
        "blurb": "阿洛奔莎主站的74158，零发酵水洗：先是柑橘与柠檬草，再是橙汁与油桃，最后是悠长的茉莉绿茶尾韵。",
        "specs": {
          "Variety": "74158",
          "Process": "零发酵水洗",
          "Harvest": "2026",
          "Roast": "浅烘"
        },
        "cup": [
          [
            "香气",
            "类似柑橘、柳橙以及轻微的柠檬草香气。"
          ],
          [
            "入口",
            "类似于橙汁、佛手柑以及油桃的酸甜果汁口感，干净细腻。"
          ],
          [
            "尾韵",
            "有轻微茉莉绿茶，余韵细长。"
          ]
        ],
        "story": [
          "ALO主站混合水洗有着极强的风味强度，金桔混合着浓郁花香，复合果汁感丰富多变，回味悠长；K72水洗有着超丰富顺滑的黄色水果感，细致多变；本款零发酵水洗则是超细腻优雅的白花香气，酸甜如新鲜甜橙汁，带着水蜜桃果汁感。",
          "Alo Coffee是一家来自埃塞俄比亚的咖啡生豆贸易公司，成立于2020年。其创始人Tamiru Tadesse Tesema在公司成立的第二年，就带领团队在当年的COE大赛上一举夺得埃塞俄比亚冠军。",
          "很早之前，Alo村就有农民种植咖啡，咖啡树都种在海拔2400米以上的地区。经过几年的培育，这些咖啡树结出的咖啡樱桃非常小颗，但当地的咖啡贸易商不喜欢小颗的咖啡豆，因此一直没有找到合适的买家。2020年，Tamiru Tadesse来到Alo村，品尝了这些小颗咖啡豆，觉得它们在风味和品质上拥有巨大潜力。",
          "短短几年，ALO已经成为最高级别埃塞俄比亚咖啡豆的代表，无论品质还是产量，都远超其他品牌。"
        ]
      },
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
      card: {
        zh: ['巴拿马 沃肯', '芭比朵庄园', '黄卡杜艾 厌氧日晒'],
        en: ['Panama Volcán', 'Bambito Estate', 'Yellow Catuai AN Natural'],
        notes: '黄色水果 红柚 红醋栗 蔗糖'
      },
      art: 'uploads/card-bambito-estate.jpg',
      bag: 'uploads/bag-bambito-estate.jpg',
      zh: {
        "name": "芭比朵庄园",
        "origin": "巴拿马",
        "region": "沃肯",
        "process": "厌氧日晒",
        "variety": "黄卡杜艾",
        "notes": "成熟黄色水果 · 红柚 · 红醋栗 · 蔗糖",
        "blurb": "巴拿马沃肯芭比朵庄园的黄卡杜艾，厌氧日晒：成熟黄色水果与苹果干，红柚与红醋栗，蔗糖般的尾韵。",
        "specs": {
          "Variety": "黄卡杜艾",
          "Process": "厌氧日晒",
          "Altitude": "1660–1800 米",
          "Roast": "浅烘"
        },
        "cup": [
          [
            "香气",
            "明显的成熟黄色水果香气，带苹果干的甜香。"
          ],
          [
            "入口",
            "饱满的果汁感，类似红柚、红醋栗，还有很丰富的成熟核果酸甜。"
          ],
          [
            "尾韵",
            "蔗糖甜感，丰富多变且馥郁。"
          ]
        ],
        "story": [
          "作为巴拿马顶级庄园之一，芭比朵庄园一直被大家所喜爱，但每年产量极少，也导致很多人都不熟悉这个庄园。今年拿到的两支芭比朵风味强度都很高：瑰夏是强花香以及饱满的佛手柑橘类酸甜，细腻且丰富；厌氧日晒黄卡杜艾则表现出成熟水果调性，馥郁多变且扎实，但依然很是圆润。",
          "芭比朵庄园地处海拔1660米至1800米之间，由东向西横穿于两座山脊中间，两侧被国家森林包围。两座山脊在形成美丽自然景观的同时，也给芭比朵庄园提供了得天独厚的微气候，保护咖啡树免受夏季北风的侵袭和高海拔地区极端环境的影响，从而培育出十分完美的咖啡风味。",
          "芭比朵庄园有着两个天然的泉眼，泉水灌溉着茁壮生长的咖啡树，也给全庄园提供了源源不断的水源。不仅如此，芭比朵庄园还有自己的温室和杯测室：用温室来储存咖啡，在杯测室进行咖啡质量控制。",
          "芭比朵庄园在巴拿马闻名已久，历经几代人的苦心经营，在匠人精神的传承与时间的沉淀中发展成如今的样子。据现今西顿家族最年长的管理者伊扎·西顿·阿马尔女士回忆，这个庄园是她的父亲阿尔贝托·西顿·里奥斯（Alberto Sittón Rios）在1945年从上一代人手中接过来的。她仍记得父亲每次提起芭比朵庄园时脸上洋溢的幸福笑容，父亲常说：“这是我们家族的传承精华，要一直延续下去。”"
        ],
        "awards": [
          "2023年 BOP 瑰夏水洗组 第十三名",
          "2022年 BOP 瑰夏水洗组 第九名",
          "2021年 BOP 瑰夏水洗组 第一名",
          "2021年 BOP 瑰夏日晒组 第五名",
          "2021年 BOP 传统品种水洗组 第四名",
          "2020年 BOP 瑰夏水洗组 第三名",
          "2019年 BOP 瑰夏水洗组 第五名"
        ]
      },
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
        'One of Panama’s top estates, Bambito has always been well loved, but it produces very little each year, so few people know it. Both of this year’s Bambito lots are intense: the Geisha with strong florals and full Buddha’s-hand citrus, and this anaerobic natural Yellow Catuai with ripe fruit: heady, shifting and solid, yet still round.',
        'The estate lies between 1,660 and 1,800 metres, running east to west between two ridges, with national forest on both sides. Besides the views, the ridges give Bambito its own microclimate, sheltering the trees from the summer north winds and the extremes of high altitude.',
        'Two natural springs water the trees and keep the whole estate supplied. Bambito also has its own greenhouse, where the coffee is stored, and a cupping lab for quality control.',
        'Bambito has been known in Panama for a long time, shaped by generations of work. The Sittón family’s eldest manager today remembers that her father, Alberto Sittón Rios, took the estate over from the generation before him in 1945, and how he smiled whenever he talked about it. “This is the best of what our family has,” he used to say. “It has to carry on.”'
      ],
      awards: [
        '2023 Best of Panama, 13th, Geisha washed',
        '2022 Best of Panama, 9th, Geisha washed',
        '2021 Best of Panama, 1st, Geisha washed',
        '2021 Best of Panama, 5th, Geisha natural',
        '2021 Best of Panama, 4th, traditional varieties washed',
        '2020 Best of Panama, 3rd, Geisha washed',
        '2019 Best of Panama, 5th, Geisha washed'
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
      card: {
        zh: ['洪都拉斯 伦皮拉省', '草莓庄园', '瑰夏 Lot#131 水洗'],
        en: ['Honduras Lempira', 'San Andrés Finca La Fresa', 'Geisha #131 Washed'],
        notes: '茉莉 香橙 水蜜桃 荔枝 蜂蜜'
      },
      art: 'uploads/card-finca-la-fresa.jpg',
      bag: 'uploads/bag-finca-la-fresa.jpg',
      zh: {
        "name": "草莓庄园",
        "origin": "洪都拉斯",
        "region": "伦皮拉省 圣安德烈斯",
        "process": "水洗",
        "variety": "瑰夏",
        "notes": "茉莉 · 香橙 · 水蜜桃 · 荔枝 · 蜂蜜",
        "blurb": "洪都拉斯伦皮拉省草莓庄园的水洗瑰夏，Lot #131：浓郁茉莉、香橙、水蜜桃、荔枝与蜂蜜。",
        "specs": {
          "Variety": "瑰夏",
          "Process": "水洗",
          "Lot": "#131",
          "Roast": "浅烘"
        },
        "tasting": "浓郁茉莉、香橙、水蜜桃、荔枝、蜂蜜。",
        "story": [
          "这次拿到的两支洪都拉斯瑰夏都有着非常优秀的花果表现。它们种植于洪都拉斯伦皮拉产区，却有着非常突出的巴拿马瑰夏风味：突出的白色花朵香气，非常干净细腻的柑橘类酸甜果汁感，还有类似桃子的鲜甜，是很难得的两支性价比突出的瑰夏。",
          "洪都拉斯位于中美洲北部，北临加勒比海，南濒太平洋的丰塞卡湾，地形多为山地和高原。作为中美洲山脉地形最为显著的国家，洪都拉斯具有发展咖啡庄园的所有条件。沿海的平原地区属于热带雨林气候，山地则属亚热带森林气候，全年气候温和，降水充沛，且拥有清晰分明的旱雨两季。",
          "虽然洪都拉斯的咖啡产业起步较晚，但如今已是世界主要的阿拉比卡咖啡生产国之一。洪都拉斯境内有六大咖啡产区，共计约28万公顷的咖啡园。洪都拉斯的咖啡具有中美洲特色的花果香与柔和的果汁调性，香气中能感受到异国香料的元素，后段带有坚果巧克力的醇厚感，整体均衡而有层次。"
        ]
      },
      label: {
        en: 'Honduras Lempira San Andrés Finca La Fresa Geisha Lot #131 Washed',
        zh: '洪都拉斯 伦皮拉省 草莓庄园 瑰夏 Lot#131 水洗'
      },
      blurb: 'Washed Geisha, lot #131, from Finca La Fresa (“the strawberry farm”) in San Andrés, Lempira, Honduras: rich jasmine, orange, white peach, lychee and honey.',
      specs: { Variety: 'Geisha', Process: 'Washed', Lot: '#131', Roast: 'Light' },
      tasting: 'Rich jasmine, orange, white peach, lychee and honey.',
      story: [
        'Both Honduran Geishas we brought in this time have excellent floral and fruit character. They are grown in Lempira, yet taste strongly of Panamanian Geisha: a prominent white-flower aroma, very clean, fine citrus sweet-tart juiciness and a fresh, peach-like sweetness. Geishas this good are rarely this good value.',
        'Honduras sits in northern Central America, with the Caribbean to the north and the Pacific’s Gulf of Fonseca to the south. Most of the country is mountains and plateaus; it is the most mountainous country in Central America, with everything a coffee farm needs. The coastal plains are tropical rainforest and the highlands subtropical forest, mild all year, with plenty of rain and clear dry and wet seasons.',
        'Honduras came to coffee late, but it is now one of the world’s largest arabica producers, with six coffee regions and some 280,000 hectares of farms. Its coffees have the floral, fruity aroma and soft juiciness of Central America, a hint of exotic spice in the aroma and a nutty, chocolate body later on. Balanced and layered.'
      ]
    },
    {
      id: 'elida-estate',
      name: 'Elida Estate',
      origin: 'Panama',
      region: 'Boquete, Vuelta',
      process: 'Dark-room dried natural',
      processes: ['Natural'],
      variety: 'Geisha',
      notes: 'Jasmine · orange blossom · sweet lemon · Buddha’s hand',
      price: 39,
      size: '75g',
      card: {
        zh: ['巴拿马 波奎特', '艾利达庄园 Vuelta地块', '瑰夏 暗房干燥日晒'],
        en: ['Panama Boquete', 'Elida Estate Vuelta', 'Geisha DRD Natural'],
        notes: '茉莉 橙花 甜柠檬 佛手柑'
      },
      art: 'uploads/card-elida-estate.jpg',
      bag: 'uploads/bag-elida-estate.jpg',
      zh: {
        "name": "艾利达庄园",
        "origin": "巴拿马",
        "region": "波奎特 Vuelta地块",
        "process": "暗房干燥日晒",
        "variety": "瑰夏",
        "notes": "茉莉 · 橙花 · 甜柠檬 · 佛手柑",
        "blurb": "巴拿马波奎特艾利达庄园Vuelta地块的瑰夏，暗房干燥日晒：茉莉与橙花，甜柠檬与佛手柑，悠长的软糖甜感。",
        "specs": {
          "Variety": "瑰夏",
          "Process": "暗房干燥日晒",
          "Lot": "#0902-250226",
          "Roast": "浅烘"
        },
        "cup": [
          [
            "香气",
            "明显的白色花香，类似茉莉、橙花，优雅细腻。"
          ],
          [
            "入口",
            "清新的甜柠檬、佛手柑，橘子硬糖感，活泼明亮、酸甜圆润。"
          ],
          [
            "尾韵",
            "水果软糖的甜，细腻悠长。"
          ]
        ],
        "story": [
          "2026年艾利达庄园几乎每一支都有着不错的表现，再加上更多的是冷房或者暗房处理，让整体风味表现尤为细腻且突出，都有着极强的巴拿马瑰夏的花果特性。",
          "艾利达庄园（Elida Estate）位于巴拿马波奎特高海拔山区，由Lamastus家族经营，是近年BOP（Best of Panama）里成绩非常亮眼的传奇庄园之一。庄园坐落在巴鲁火山国家公园边缘，丰富的火山土壤、云雾气候与超高海拔，让艾利达的豆子总是带着非常干净的花香、果汁感和细腻层次。"
        ]
      },
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
        'Elida Estate is in the highlands of Boquete, Panama, and is run by the Lamastus family. It is one of the legendary farms of recent Best of Panama competitions. It sits on the edge of Volcán Barú National Park, and the rich volcanic soil, cloud-forest climate and very high altitude give Elida’s coffees clean florals, juiciness and fine layers.'
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
      card: {
        zh: ['巴拿马 洛斯波索斯', 'Gato Grande 庄园', '瑰夏 酵母冷发酵日晒'],
        en: ['Panama Los Pozos', 'Gato Grande', 'Geisha K4 CFY Natural'],
        notes: '茉莉 佛手柑 糖渍柠檬 水蜜桃'
      },
      art: 'uploads/card-gato-grande.jpg',
      bag: 'uploads/bag-gato-grande.jpg',
      zh: {
        "name": "Gato Grande 庄园",
        "origin": "巴拿马",
        "region": "蒂埃拉斯阿尔塔斯 洛斯波索斯",
        "process": "酵母冷发酵日晒",
        "variety": "瑰夏",
        "notes": "茉莉 · 佛手柑 · 糖渍柠檬 · 水蜜桃 · 花蜜",
        "blurb": "巴拿马洛斯波索斯Gato Grande咖啡森林的瑰夏K4，酵母冷发酵日晒：茉莉与佛手柑，糖渍柠檬与水蜜桃，花蜜般的尾韵。",
        "specs": {
          "Variety": "瑰夏",
          "Process": "酵母冷发酵日晒",
          "Lot": "K4",
          "Roast": "浅烘"
        },
        "cup": [
          [
            "香气",
            "浓郁的茉莉花、佛手柑香气，充盈饱满。"
          ],
          [
            "入口",
            "糖渍柠檬、水蜜桃的香甜果汁感，非常丰富且馥郁。"
          ],
          [
            "尾韵",
            "花蜜般甜感，细腻干净且持久。"
          ]
        ],
        "story": [
          "2023年，Gato Grande Coffee Forest在蒂埃拉斯阿尔塔斯的洛斯波索斯（Tierras Altas Los Pozos）正式建立，这里也是每年“最佳巴拿马”的重要产区。该地区海拔极高，年均气温较低，昼夜温差也更大，使得咖啡果实成熟周期延长，缓慢的生长过程让这里的瑰夏积累了更多糖分和有机物，有了更加丰富的风味表现。",
          "庄园的Yessie Hartman与Jean Paul均来自巴拿马著名的咖啡家族：Yessie Hartman是原哈特曼庄园庄园主的长女，Jean Paul是卡门庄园的总经理。两位都有着丰富的种植和管理经验，在两大庄园的共同协助下，Gato Grande已经完成了今年的第二次采收，现在Gato Grande的瑰夏都是极高品质的超微批次。",
          "这批瑰夏有着非常优秀的豆貌，密度高。烘焙到一爆时，能闻到浓郁的花香和柑橘类香气，类似茉莉、佛手柑、柠檬，甜香突出。豆子本身积累的物质丰富，让这支瑰夏杯测时风味馥郁、层次多变：干香有特别浓郁的白色花香和佛手柑香气；入口是糖渍柠檬、水蜜桃的香甜果汁感，顺滑多变；尾韵是类似花蜜的甜感，非常细腻干净且持久。",
          "这支冷发酵日晒瑰夏除了浓郁的花香，相比传统水洗有着更加丰富多变的果汁感，甜桃、熟樱桃风味十分突出，带着冰糖般的甜感，扎实且细致悠长。"
        ]
      },
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
        'Gato Grande Coffee Forest was founded in 2023 in Los Pozos, Tierras Altas, an important area in Best of Panama every year. The very high altitude, low average temperature and wide swing between day and night stretch out the ripening of the cherries, and that slow growth lets the Geisha here build up more sugars and other compounds, for a richer cup.',
        'Yessie Hartman and Jean Paul, who run the farm, both come from well-known Panamanian coffee families: Yessie is the eldest daughter of the owner of the Hartmann estate, and Jean Paul is general manager of Carmen Estate. With deep experience in growing and management, and the support of both estates, Gato Grande has finished its second harvest this year, and all of its Geishas are very-high-quality micro-lots.',
        'This lot has excellent green beans with a high density. At first crack in the roaster you can smell heavy florals and citrus (jasmine, Buddha’s hand, lemon) and a clear sweetness. All that the beans have built up makes the cup heady and layered: very heavy white florals and Buddha’s hand in the dry fragrance; candied lemon and white peach, sweet, juicy, smooth and shifting, on the palate; then a honey-like sweetness and a fine, clean, lasting finish.',
        'Besides its heavy florals, this cold-fermented natural Geisha has a richer, more varied juiciness than a traditional washed: sweet peach and ripe cherry stand out, with a rock-sugar sweetness, solid, fine and long.'
      ]
    }
  ];

  /* Brew guides. The V60 recipe is the design (3c). Espresso and Iced use the
     numbers given on the product page's "Brew it this way" cards. */
  var guides = [
    {
      id: 'v60',
      zh: {
        "name": "V60",
        "title": "手冲 · V60",
        "alt": "在吧台上往V60里注水",
        "intro": "一杯干净、可重复的配方。任何锥形滤杯都适用，比例比器具更重要。",
        "glance": [
          [
            "粉水比",
            "1:16"
          ],
          [
            "粉量",
            "15 g"
          ],
          [
            "水",
            "240 g，94 °C"
          ],
          [
            "研磨度",
            "中细"
          ],
          [
            "总时间",
            "2:45"
          ]
        ],
        "note": "用过滤水，60–100 ppm。开始前先润湿滤纸。",
        "steps": [
          [
            "润纸、称粉",
            "用热水润湿滤纸并倒掉，再加入15 g咖啡粉，把粉床摊平。"
          ],
          [
            "焖蒸，45 g",
            "以慢速螺旋注水45 g，等待40秒。粉床会先膨胀再回落。"
          ],
          [
            "第一段，注水至150 g",
            "稳定地绕圈注水，保持粉床平整，避开滤纸边缘。"
          ],
          [
            "最后一段，注水至240 g",
            "在1:45前完成。轻轻摇晃一下滤杯，等它滴完。"
          ],
          [
            "滴完后品尝",
            "2:45前滴完。偏酸就磨细一些；偏苦偏涩就磨粗一些。"
          ]
        ]
      },
      name: 'V60',
      title: 'Pour-over, V60',
      image: 'uploads/pourover-hero.jpg',
      alt: 'Pouring water over a V60 on the brew bar',
      intro: 'A clean, repeatable recipe for a single cup. Anything in a cone works. The ratio matters more than the brewer.',
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
      zh: {
        "name": "意式浓缩",
        "title": "意式浓缩",
        "alt": "意式浓缩从手柄中流出",
        "intro": "这是起点而不是规则。调整研磨直到出品落在区间内，再品尝，每次只改一个变量。",
        "glance": [
          [
            "粉液比",
            "1:2.2"
          ],
          [
            "粉量",
            "18 g"
          ],
          [
            "出液",
            "40 g"
          ],
          [
            "研磨度",
            "细"
          ],
          [
            "总时间",
            "28 秒"
          ]
        ],
        "note": "每一杯都要称重。杯中的体积说明不了什么。",
        "steps": [
          [
            "称粉 18 g",
            "称入干燥的粉碗。扣上手柄前先擦净边缘。"
          ],
          [
            "布粉、压粉",
            "先把粉床整平，再平稳用力压实。粉床不平会产生通道，萃取会变得单薄。"
          ],
          [
            "萃取至 40 g",
            "8–12秒出第一滴，约28秒时杯中达到40 g。"
          ],
          [
            "品尝并调整",
            "偏酸且流速快就磨细；偏苦且流速慢就磨粗。每次只改一个变量。"
          ],
          [
            "做奶咖时",
            "稍微短萃一些，到36 g，让浓缩在牛奶里依然立得住。"
          ]
        ]
      },
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
      zh: {
        "name": "冰手冲",
        "title": "冰手冲",
        "alt": "把冰咖啡倒进装满冰块的高杯",
        "intro": "热冲直接落在冰上。香气在冷却时被锁住，所以比冷萃更甜、更香。",
        "glance": [
          [
            "粉水比",
            "1:12"
          ],
          [
            "粉量",
            "20 g"
          ],
          [
            "水",
            "240 g，94 °C"
          ],
          [
            "冰",
            "分享壶内 120 g"
          ],
          [
            "研磨度",
            "中细"
          ]
        ],
        "note": "冰块不是点缀，而是配方的一部分：它就是剩下的那部分水。",
        "steps": [
          [
            "准备分享壶",
            "开始前，先在滤杯下方的容器里称入120 g冰块。"
          ],
          [
            "称粉 20 g",
            "研磨比热手冲稍细。润湿滤纸，摊平粉床。"
          ],
          [
            "焖蒸，50 g",
            "注水50 g，等待35秒。"
          ],
          [
            "注水至 240 g",
            "分两次均匀注水，1:40前完成。它会比热冲滴得更快。"
          ],
          [
            "摇匀出品",
            "摇晃分享壶直到冰块全部融化，再倒进装了新冰块的冷杯。"
          ]
        ]
      },
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
      note: 'The ice is part of the recipe, not a garnish. It is the rest of the water.',
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
