const imageFor = (slug) => `/fruits/${slug}.jpg`;

const baseNutrition = {
  mango: { calories: 60, carbs: 15, fiber: 1.6, sugar: 13.7, protein: 0.8, fat: 0.4, water: 83 },
  banana: { calories: 89, carbs: 22.8, fiber: 2.6, sugar: 12.2, protein: 1.1, fat: 0.3, water: 75 },
  guava: { calories: 68, carbs: 14.3, fiber: 5.4, sugar: 8.9, protein: 2.6, fat: 1, water: 81 },
  pomegranate: { calories: 83, carbs: 18.7, fiber: 4, sugar: 13.7, protein: 1.7, fat: 1.2, water: 78 },
  amla: { calories: 44, carbs: 10.2, fiber: 4.3, sugar: 4.3, protein: 0.9, fat: 0.6, water: 87 },
  jackfruit: { calories: 95, carbs: 23.3, fiber: 1.5, sugar: 19.1, protein: 1.7, fat: 0.6, water: 73 },
  apple: { calories: 52, carbs: 13.8, fiber: 2.4, sugar: 10.4, protein: 0.3, fat: 0.2, water: 86 },
  orange: { calories: 47, carbs: 11.8, fiber: 2.4, sugar: 9.4, protein: 0.9, fat: 0.1, water: 87 },
  grapes: { calories: 69, carbs: 18.1, fiber: 0.9, sugar: 15.5, protein: 0.7, fat: 0.2, water: 81 },
  papaya: { calories: 43, carbs: 10.8, fiber: 1.7, sugar: 7.8, protein: 0.5, fat: 0.3, water: 88 },
  pineapple: { calories: 50, carbs: 13.1, fiber: 1.4, sugar: 9.9, protein: 0.5, fat: 0.1, water: 86 },
  watermelon: { calories: 30, carbs: 7.6, fiber: 0.4, sugar: 6.2, protein: 0.6, fat: 0.2, water: 92 },
  kiwi: { calories: 61, carbs: 14.7, fiber: 3, sugar: 9, protein: 1.1, fat: 0.5, water: 83 },
  blueberry: { calories: 57, carbs: 14.5, fiber: 2.4, sugar: 10, protein: 0.7, fat: 0.3, water: 84 },
  avocado: { calories: 160, carbs: 8.5, fiber: 6.7, sugar: 0.7, protein: 2, fat: 14.7, water: 73 },
  coconut: { calories: 354, carbs: 15.2, fiber: 9, sugar: 6.2, protein: 3.3, fat: 33.5, water: 47 }
};

const commonNutrition = { calories: 58, carbs: 14, fiber: 2.2, sugar: 9.5, protein: 0.9, fat: 0.3, water: 84 };

const fruitSpecs = [
  ["mango", "Mango", "Mangifera indica", "#ffb703", ["Aam", "Ambā"], ["Alphonso", "Kesar", "Dasheri", "Langra", "Chaunsa", "Banganapalli"], ["India", "Indonesia", "China", "Pakistan", "Mexico", "Thailand"], ["India", "Mexico", "Peru", "Thailand"], ["United States", "United Arab Emirates", "Netherlands", "United Kingdom"], "March to July in India"],
  ["banana", "Banana", "Musa spp.", "#ffd166", ["Kela", "Vazha pazham"], ["Robusta", "Nendran", "Rasthali", "Poovan", "Red Banana"], ["India", "China", "Indonesia", "Brazil", "Ecuador", "Philippines"], ["Ecuador", "Philippines", "Costa Rica", "Colombia"], ["United States", "European Union", "Russia", "Japan"], "Year-round"],
  ["grapes", "Grapes", "Vitis vinifera", "#7b2cbf", ["Angoor", "Draksha"], ["Thompson Seedless", "Sonaka", "Sharad Seedless", "Bangalore Blue", "Flame Seedless"], ["India", "China", "Italy", "Spain", "United States", "Turkey"], ["India", "Chile", "Peru", "South Africa"], ["European Union", "United States", "United Kingdom"], "December to April in India"],
  ["guava", "Guava", "Psidium guajava", "#9ee493", ["Amrood", "Peru"], ["Allahabad Safeda", "Lalit", "Taiwan Pink", "Arka Kiran", "Shweta"], ["India", "China", "Thailand", "Mexico", "Brazil"], ["India", "Thailand", "Mexico"], ["United States", "United Arab Emirates", "United Kingdom"], "Rainy and winter crops"],
  ["orange", "Orange", "Citrus sinensis", "#fb8500", ["Santra", "Narangi"], ["Nagpur Mandarin", "Kinnow", "Valencia", "Navel", "Blood Orange"], ["India", "Brazil", "China", "Spain", "Egypt"], ["Spain", "South Africa", "Egypt", "United States"], ["European Union", "Russia", "Middle East"], "November to March in India"],
  ["watermelon", "Watermelon", "Citrullus lanatus", "#ff4d6d", ["Tarbooz", "Kalingad"], ["Sugar Baby", "Kiran", "Arka Jyoti", "Crimson Sweet", "Black Diamond"], ["India", "China", "Turkey", "Iran", "Brazil"], ["Spain", "Mexico", "Morocco"], ["European Union", "United States", "Middle East"], "February to June"],
  ["papaya", "Papaya", "Carica papaya", "#ff9f1c", ["Papita", "Pappali"], ["Red Lady", "Pusa Delicious", "Coorg Honey Dew", "Taiwan 786", "Solo"], ["India", "Brazil", "Indonesia", "Nigeria", "Mexico"], ["Brazil", "Mexico", "India"], ["United States", "European Union", "Middle East"], "Year-round in tropical India"],
  ["pineapple", "Pineapple", "Ananas comosus", "#ffd60a", ["Ananas"], ["Queen", "Kew", "Mauritius", "MD2", "Giant Kew"], ["India", "Thailand", "Philippines", "Costa Rica", "Indonesia"], ["Costa Rica", "Philippines", "Thailand"], ["United States", "European Union", "Japan"], "May to September"],
  ["pomegranate", "Pomegranate", "Punica granatum", "#e63946", ["Anar", "Dalimb"], ["Bhagwa", "Ganesh", "Arakta", "Mridula", "Wonderful"], ["India", "Iran", "Turkey", "Afghanistan", "United States"], ["India", "Turkey", "Peru", "Spain"], ["United Arab Emirates", "European Union", "United States"], "Multiple Indian bahar seasons"],
  ["litchi", "Litchi", "Litchi chinensis", "#ff758f", ["Litchi", "Leechee"], ["Shahi", "China", "Bombai", "Rose Scented", "Early Bedana"], ["India", "China", "Vietnam", "Thailand", "Madagascar"], ["China", "Vietnam", "India"], ["European Union", "Middle East", "United States"], "May to June"],
  ["pear", "Pear", "Pyrus communis", "#d9ed92", ["Nashpati"], ["Bartlett", "Bosc", "Anjou", "Patharnakh", "Punjab Beauty"], ["India", "China", "Italy", "United States", "Argentina"], ["China", "Argentina", "South Africa"], ["European Union", "Russia", "United States"], "July to October"],
  ["plum", "Plum", "Prunus domestica", "#7209b7", ["Aloo Bukhara"], ["Santa Rosa", "Kala Amritsari", "Satluj Purple", "Mariposa", "Damson"], ["India", "China", "Serbia", "Romania", "United States"], ["Chile", "Spain", "South Africa"], ["European Union", "United States", "Middle East"], "May to July"],
  ["peach", "Peach", "Prunus persica", "#ffb4a2", ["Aadu"], ["July Elberta", "Shan-e-Punjab", "Prabhat", "Flordasun", "Nectarine"], ["India", "China", "Spain", "Italy", "United States"], ["Spain", "Chile", "Italy"], ["European Union", "Russia", "Middle East"], "April to July"],
  ["dragon-fruit", "Dragon Fruit", "Selenicereus undatus", "#ff4fd8", ["Kamalam"], ["White Flesh", "Red Flesh", "Yellow Dragon", "Vietnamese White", "American Beauty"], ["India", "Vietnam", "China", "Thailand", "Mexico"], ["Vietnam", "Thailand", "India"], ["China", "United States", "European Union"], "June to November"],
  ["jackfruit", "Jackfruit", "Artocarpus heterophyllus", "#d9ed92", ["Kathal", "Chakka"], ["Varikka", "Koozha", "Singapore Jack", "Muttom Varikka", "Siddu"], ["India", "Bangladesh", "Thailand", "Indonesia", "Sri Lanka"], ["Thailand", "India", "Vietnam"], ["United States", "United Kingdom", "Middle East"], "March to July"],
  ["sapota", "Sapota", "Manilkara zapota", "#bc6c25", ["Chikoo", "Sapota"], ["Kalipatti", "Cricket Ball", "DHS-1", "DHS-2", "Pala"], ["India", "Mexico", "Thailand", "Sri Lanka"], ["India", "Thailand", "Mexico"], ["Middle East", "United Kingdom", "United States"], "Year-round, peak winter"],
  ["custard-apple", "Custard Apple", "Annona squamosa", "#ccd5ae", ["Sitaphal", "Sharifa"], ["Balanagar", "Arka Sahan", "Red Sitaphal", "Washington", "Mammoth"], ["India", "Thailand", "Brazil", "Mexico"], ["India", "Thailand"], ["Middle East", "United Kingdom"], "August to November"],
  ["coconut", "Coconut", "Cocos nucifera", "#f1faee", ["Nariyal", "Thenga"], ["West Coast Tall", "East Coast Tall", "Chowghat Orange Dwarf", "Malayan Green Dwarf", "King Coconut"], ["India", "Indonesia", "Philippines", "Sri Lanka", "Brazil"], ["Indonesia", "Philippines", "India", "Sri Lanka"], ["United States", "European Union", "Middle East"], "Year-round coastal crop"],
  ["kiwi", "Kiwi", "Actinidia deliciosa", "#8fd14f", ["Kiwi"], ["Hayward", "Bruno", "Allison", "Monty", "Golden Kiwi"], ["India", "China", "New Zealand", "Italy", "Greece"], ["New Zealand", "Italy", "Chile"], ["India", "United States", "European Union"], "October to December in Indian hills"],
  ["muskmelon", "Muskmelon", "Cucumis melo", "#ffbe0b", ["Kharbooja"], ["Punjab Sunehri", "Hara Madhu", "Pusa Sharbati", "Cantaloupe", "Honeydew"], ["India", "China", "Turkey", "Iran", "United States"], ["Spain", "Morocco", "Brazil"], ["European Union", "Middle East"], "March to June"],
  ["strawberry", "Strawberry", "Fragaria × ananassa", "#ef233c", ["Strawberry"], ["Sweet Charlie", "Winter Dawn", "Camarosa", "Festival", "Albion"], ["India", "China", "United States", "Mexico", "Spain"], ["Mexico", "Spain", "United States"], ["Canada", "European Union", "Middle East"], "November to March in India"],
  ["amla", "Amla", "Phyllanthus emblica", "#b8f36d", ["Amla", "Indian Gooseberry"], ["NA-7", "Banarasi", "Chakaiya", "Krishna", "Kanchan"], ["India"], ["India"], ["United States", "European Union", "Middle East"], "October to February"],
  ["jamun", "Jamun", "Syzygium cumini", "#3c096c", ["Jamun", "Java Plum"], ["Ra Jamun", "Konkan Bahadoli", "CISH J-37", "Seedless Jamun"], ["India", "Bangladesh", "Sri Lanka", "Thailand"], ["India"], ["Middle East", "United Kingdom"], "May to July"],
  ["fig", "Fig", "Ficus carica", "#a44a3f", ["Anjeer"], ["Poona Fig", "Dinkar", "Brown Turkey", "Kadota", "Black Mission"], ["India", "Turkey", "Egypt", "Morocco", "Iran"], ["Turkey", "Iran", "Morocco"], ["European Union", "United States", "India"], "February to May and August to October"],
  ["ber", "Indian Jujube", "Ziziphus mauritiana", "#a7c957", ["Ber", "Bor"], ["Gola", "Umran", "Seb", "Banarasi Karaka", "Kaithli"], ["India", "Pakistan", "China", "Thailand"], ["India", "Pakistan"], ["Middle East", "United Kingdom"], "December to March"],
  ["wood-apple", "Wood Apple", "Limonia acidissima", "#6c584c", ["Kaitha", "Kavath"], ["Local Hard Shell", "Sweet Pulp", "Sour Pulp"], ["India", "Sri Lanka", "Bangladesh", "Myanmar"], ["India", "Sri Lanka"], ["Specialty Asian markets"], "October to March"],
  ["bael", "Bael", "Aegle marmelos", "#8ac926", ["Bael", "Bilva"], ["Kaghzi", "Mirzapuri", "Pant Aparna", "Local Bael"], ["India", "Nepal", "Sri Lanka", "Bangladesh"], ["India"], ["Ayurvedic markets"], "March to June"],
  ["tamarind", "Tamarind", "Tamarindus indica", "#8d5524", ["Imli", "Puli"], ["PKM-1", "Urigam", "Pratisthan", "Sweet Tamarind"], ["India", "Thailand", "Mexico", "Sudan"], ["India", "Thailand", "Mexico"], ["United States", "European Union", "Middle East"], "January to April"],
  ["starfruit", "Star Fruit", "Averrhoa carambola", "#f9dc5c", ["Kamrakh"], ["Arkin", "Fwang Tung", "Kary", "Golden Star"], ["India", "Malaysia", "Indonesia", "Thailand"], ["Malaysia", "Thailand"], ["European Union", "Middle East"], "September to February"],
  ["rambutan", "Rambutan", "Nephelium lappaceum", "#ef476f", ["Rambutan"], ["Rongrien", "Binjai", "Lebakbooloos", "N18"], ["India", "Thailand", "Indonesia", "Malaysia", "Sri Lanka"], ["Thailand", "Indonesia", "Malaysia"], ["China", "Middle East", "European Union"], "June to September"],
  ["mangosteen", "Mangosteen", "Garcinia mangostana", "#6930c3", ["Mangosteen"], ["Purple Mangosteen", "Mesta", "Local Kerala Type"], ["India", "Thailand", "Indonesia", "Malaysia"], ["Thailand", "Indonesia"], ["China", "United States", "European Union"], "June to October"],
  ["passion-fruit", "Passion Fruit", "Passiflora edulis", "#ff9e00", ["Krishna Phal"], ["Purple Passion", "Yellow Passion", "Kaveri", "Coorg Purple"], ["India", "Brazil", "Colombia", "Kenya"], ["Brazil", "Colombia", "Kenya"], ["European Union", "United States"], "August to December"],
  ["avocado", "Avocado", "Persea americana", "#6a994e", ["Makhanphal"], ["Hass", "Fuerte", "Pinkerton", "Reed", "Pollock"], ["India", "Mexico", "Colombia", "Peru", "Kenya"], ["Mexico", "Peru", "Kenya"], ["United States", "European Union", "India"], "June to September in Indian hills"],
  ["blueberry", "Blueberry", "Vaccinium sect. Cyanococcus", "#5b7cfa", ["Blueberry"], ["Highbush", "Lowbush", "Rabbiteye", "Duke", "Biloxi"], ["United States", "Peru", "Canada", "Chile", "India"], ["Peru", "Chile", "United States"], ["India", "European Union", "China"], "Imported year-round; limited Indian winter trials"],
  ["raspberry", "Raspberry", "Rubus idaeus", "#d0006f", ["Raspberry"], ["Heritage", "Autumn Bliss", "Polka", "Tulameen"], ["India", "Russia", "Mexico", "Serbia", "United States"], ["Mexico", "Serbia", "Spain"], ["European Union", "United States", "India"], "Cool-season hill crop"],
  ["blackberry", "Blackberry", "Rubus fruticosus", "#2b2d42", ["Blackberry"], ["Apache", "Arapaho", "Navaho", "Triple Crown"], ["India", "United States", "Mexico", "Serbia"], ["Mexico", "United States", "Serbia"], ["European Union", "India"], "Cool-season hill crop"],
  ["mulberry", "Mulberry", "Morus alba", "#4a1942", ["Shahtoot"], ["White Mulberry", "Black Mulberry", "Pakistan Mulberry", "Local Shahtoot"], ["India", "China", "Turkey", "Iran"], ["Turkey", "Iran"], ["Specialty markets"], "March to May"],
  ["date", "Date", "Phoenix dactylifera", "#8b5e34", ["Khajoor"], ["Medjool", "Deglet Noor", "Barhee", "Khadrawy", "Halawy"], ["India", "Saudi Arabia", "Egypt", "Iran", "United Arab Emirates"], ["Saudi Arabia", "United Arab Emirates", "Iran"], ["India", "European Union", "United States"], "August to November"],
  ["apricot", "Apricot", "Prunus armeniaca", "#f77f00", ["Khubani", "Jardalu"], ["Halman", "Raktsey Karpo", "Moorpark", "Tilton"], ["India", "Turkey", "Iran", "Uzbekistan"], ["Turkey", "Iran", "Uzbekistan"], ["India", "European Union"], "June to August"],
  ["sweet-lime", "Sweet Lime", "Citrus limetta", "#c7f9cc", ["Mosambi"], ["Mosambi", "Sathgudi", "Malta", "Jaffa"], ["India", "Pakistan", "Egypt", "Mediterranean region"], ["India", "Egypt"], ["Middle East", "European Union"], "August to March"],
  ["lemon", "Lemon", "Citrus limon", "#fff44f", ["Nimbu"], ["Assam Lemon", "Kagzi Lime", "Eureka", "Lisbon", "Meyer"], ["India", "Mexico", "Argentina", "Spain", "Turkey"], ["Mexico", "Argentina", "Spain"], ["United States", "European Union", "Middle East"], "Year-round with seasonal peaks"],
  ["kinnow", "Kinnow", "Citrus nobilis × Citrus deliciosa", "#ff9500", ["Kinnow"], ["Punjab Kinnow", "PAU Kinnow", "Seedless Kinnow"], ["India", "Pakistan"], ["India", "Pakistan"], ["Middle East", "Russia", "Bangladesh"], "December to February"],
  ["persimmon", "Persimmon", "Diospyros kaki", "#f3722c", ["Japani Phal"], ["Fuyu", "Hachiya", "Jiro", "Hyakume"], ["India", "China", "Japan", "South Korea", "Spain"], ["Spain", "Japan", "China"], ["European Union", "United States", "India"], "October to December"],
  ["soursop", "Soursop", "Annona muricata", "#80b918", ["Lakshman Phal"], ["Morada", "Lisa", "Fiberless", "Local Soursop"], ["India", "Brazil", "Mexico", "Caribbean region"], ["Mexico", "Brazil"], ["United States", "European Union"], "June to September"],
  ["longan", "Longan", "Dimocarpus longan", "#d8c99b", ["Longan"], ["Kohala", "Biew Kiew", "Diamond River", "Chompoo"], ["India", "China", "Thailand", "Vietnam"], ["Thailand", "Vietnam", "China"], ["United States", "European Union", "Middle East"], "July to September"],
  ["pomelo", "Pomelo", "Citrus maxima", "#f7ede2", ["Chakotra"], ["Devanahalli Pomelo", "Thong Dee", "Kao Yai", "Honey Pomelo"], ["India", "China", "Thailand", "Vietnam"], ["China", "Thailand", "Vietnam"], ["European Union", "United States", "Middle East"], "November to February"],
  ["rose-apple", "Rose Apple", "Syzygium jambos", "#ffcad4", ["Gulab Jamun Fruit", "Pani Seb"], ["Pink Rose Apple", "White Rose Apple", "Thai Wax Apple"], ["India", "Thailand", "Malaysia", "Indonesia"], ["Thailand", "Malaysia"], ["Specialty Asian markets"], "April to June"],
  ["breadfruit", "Breadfruit", "Artocarpus altilis", "#adc178", ["Breadfruit", "Kadachakka"], ["Maafala", "Ulu Fiti", "Local Kerala Type"], ["India", "Indonesia", "Philippines", "Caribbean region"], ["Philippines", "Caribbean region"], ["United States", "European Union"], "June to September"],
  ["karonda", "Karonda", "Carissa carandas", "#9d0208", ["Karonda", "Karamcha"], ["Pant Manohar", "CHES K-II-7", "Local Karonda"], ["India", "Bangladesh", "Sri Lanka", "Thailand"], ["India"], ["Pickle and specialty markets"], "July to September"],
  ["phalsa", "Phalsa", "Grewia asiatica", "#5a189a", ["Phalsa", "Falsa"], ["Local Purple", "Hisar Selection", "Tall Phalsa"], ["India", "Pakistan", "Bangladesh"], ["India", "Pakistan"], ["Specialty summer beverage markets"], "April to June"],
  ["tadgola", "Ice Apple", "Borassus flabellifer", "#e9ecef", ["Tadgola", "Nungu"], ["Palmyra Ice Apple", "Coastal Local Type"], ["India", "Sri Lanka", "Thailand", "Cambodia"], ["India", "Thailand"], ["Specialty tropical markets"], "April to June"],
  ["mahua", "Mahua", "Madhuca longifolia", "#dda15e", ["Mahua"], ["Local Forest Mahua", "Central Indian Mahua"], ["India", "Nepal", "Sri Lanka"], ["India"], ["Traditional product markets"], "March to May"],
  ["lasora", "Lasora", "Cordia myxa", "#606c38", ["Lasora", "Gunda"], ["Local Lasora", "Rajasthani Gunda"], ["India", "Pakistan", "Middle East"], ["India", "Pakistan"], ["Pickle specialty markets"], "April to June"]
];

const varietyDetail = (fruit, variety, index) => ({
  name: variety,
  howItDiffers: `${variety} is selected for a distinct balance of aroma, sweetness, acidity, shelf behavior, and local market preference within the ${fruit.name} category.`,
  taste: index % 3 === 0 ? "Sweet and aromatic" : index % 3 === 1 ? "Sweet-tart with bright freshness" : "Mild, rounded, and clean",
  texture: index % 3 === 0 ? "Soft and juicy" : index % 3 === 1 ? "Firm with a crisp bite" : "Smooth and tender",
  region: fruit.productionRegions[index % fruit.productionRegions.length],
  season: fruit.seasonality.India,
  nutritionDifference: "Nutrient differences are usually smaller than differences caused by ripeness, portion size, and processing method.",
  appearance: index % 2 === 0 ? "Bright, market-recognizable skin and strong varietal character" : "Region-specific color, size, and aroma profile"
});

const recipeText = (fruit, type) => {
  const base = {
    juice: `Prepare a clean ${fruit.name.toLowerCase()} juice by washing the fruit well, trimming damaged parts, and blending the edible portion with chilled water, mint, and a small squeeze of lime. Strain only if the texture is too thick, because keeping some pulp preserves fiber and mouthfeel. Serve immediately over ice and avoid excess sugar; ripe fruit usually gives enough sweetness. This works best as a summer drink or post-meal refresher.`,
    smoothie: `Blend ${fruit.name.toLowerCase()} with curd or unsweetened yogurt, soaked chia seeds, a few ice cubes, and a pinch of cardamom or cinnamon. The protein and fat from yogurt slow the sweetness and make the drink more filling than plain juice. Use ripe fruit for aroma and add water to adjust thickness. It is a practical breakfast, evening snack, or recovery drink after light exercise.`,
    traditional: `Use ${fruit.name.toLowerCase()} in a traditional Indian preparation by pairing it with roasted cumin, black salt, fresh herbs, and a small amount of jaggery only when needed. The fruit can be sliced, pulped, lightly cooked, or folded into curd depending on texture. This style respects regional eating habits while keeping the fruit recognizable. Serve in small portions with meals so the flavor supports digestion and appetite.`
  };
  return base[type];
};

const recipeSet = (fruit) => [
  {
    id: `${fruit.slug}-juice`,
    fruitSlugs: [fruit.slug],
    category: "Juice",
    title: `${fruit.name} Lime Cooler`,
    image: `/recipes/${fruit.slug}-juice.jpg`,
    diet: ["vegetarian", "hydrating"],
    ingredients: [fruit.name, "lime", "mint", "chilled water", "rock salt"],
    method: recipeText(fruit, "juice"),
    note: "Best served fresh."
  },
  {
    id: `${fruit.slug}-smoothie`,
    fruitSlugs: [fruit.slug],
    category: "Smoothie",
    title: `${fruit.name} Yogurt Smoothie`,
    image: `/recipes/${fruit.slug}-smoothie.jpg`,
    diet: ["vegetarian", "protein paired"],
    ingredients: [fruit.name, "curd or yogurt", "chia seeds", "cardamom", "ice"],
    method: recipeText(fruit, "smoothie"),
    note: "Pairs fruit sweetness with protein."
  },
  {
    id: `${fruit.slug}-traditional`,
    fruitSlugs: [fruit.slug],
    category: "Traditional",
    title: `${fruit.name} Regional Chaat`,
    image: `/recipes/${fruit.slug}-traditional.jpg`,
    diet: ["vegetarian", "traditional"],
    ingredients: [fruit.name, "roasted cumin", "black salt", "fresh herbs", "lime"],
    method: recipeText(fruit, "traditional"),
    note: "Inspired by Indian fruit chaat traditions."
  }
];

const makeFruit = ([slug, name, scientificName, color, regionalNames, varieties, productionRegions, exportRegions, importRegions, season]) => {
  const fruit = {
    slug,
    name,
    scientificName,
    category: ["Indian relevance", "Tropical and regional fruit intelligence"],
    image: imageFor(slug),
    color,
    regionalNames,
    originRegions: productionRegions.slice(0, 2),
    productionRegions,
    exportRegions,
    importRegions,
    climateZones: ["Warm growing season", "Well-drained soil", "Region-specific irrigation and humidity management"],
    seasonality: { India: season, global: "Varies by growing region and hemisphere" },
    shelfLife: "Usually 2 to 7 days at room temperature after ripening, longer under refrigeration or controlled supply-chain storage.",
    glycemicIndex: { value: slug === "amla" ? 25 : slug === "watermelon" ? 72 : slug === "avocado" ? 15 : slug === "guava" ? 24 : 45, category: slug === "watermelon" ? "High GI but low carbohydrate per typical serving" : "Low to medium" },
    nutrition: baseNutrition[slug] || commonNutrition,
    serving: "One moderate serving, usually about 80 to 150g edible portion depending on the fruit.",
    nutrientHighlights: ["Water and natural carbohydrates", "Fruit fiber", "Potassium and antioxidant plant compounds"],
    vitamins: slug === "amla" || slug === "guava" || slug === "orange" || slug === "lemon" ? ["Vitamin C", "Folate", "Carotenoids"] : ["Vitamin C", "B vitamins", "Carotenoids"],
    minerals: ["Potassium", "Magnesium", "Copper"],
    benefits: [
      `${name} contributes hydration, fiber, and naturally occurring plant compounds when eaten as whole fruit.`,
      `Its vitamin and mineral profile can support everyday diet quality when portions are balanced with meals.`,
      `Traditional diets often use ${name.toLowerCase()} seasonally, which improves freshness and flavor.`
    ],
    science: [
      `Whole ${name.toLowerCase()} generally produces a gentler nutrition profile than strained juice because pulp and fiber remain intact.`,
      "Ripeness, cultivar, storage, and processing can change sugar concentration, acidity, aroma, and antioxidant retention."
    ],
    allergies: [`People with a known ${name.toLowerCase()} allergy should avoid it. Oral itching can occur in sensitive individuals.`],
    sideEffects: ["Very large portions may cause bloating, acidity, or unwanted sugar load depending on the fruit and individual tolerance."],
    drugInteractions: ["Food-level portions are usually compatible with normal diets; concentrated extracts or medically restricted diets should be discussed with a clinician."],
    avoidFor: ["Known allergy", "Clinician-advised restriction", "Active digestive sensitivity if the fruit triggers symptoms"],
    timing: "Best eaten earlier in the day, with breakfast, between meals, or after activity depending on personal tolerance.",
    storage: ["Keep unripe fruit at room temperature.", "Refrigerate ripe fruit to slow spoilage.", "Use cut fruit within a day for best flavor and safety."],
    ripeningStages: ["Unripe and firm", "Ripe with characteristic aroma", "Fully ripe and sweet", "Overripe with soft texture"],
    traditionalUses: [`${name} is used in fresh eating, drinks, chutneys, preserves, festive dishes, and regional home remedies depending on the community.`],
    ayurvedaContext: regionalNames.length ? `${name} appears in Indian food culture through seasonal eating, household preparations, and region-specific traditional use.` : "Traditional context varies by region.",
    commonMisconceptions: [
      `A single fruit is not a cure; ${name.toLowerCase()} works best as part of a varied diet.`,
      "Juice is not nutritionally identical to whole fruit because fiber and satiety change."
    ],
    culture: `${name} has practical food value in Indian and global markets through fresh fruit, beverages, preserves, desserts, and seasonal regional dishes.`,
    history: [
      { year: "Traditional era", event: `${name} became part of local food systems through cultivation, foraging, trade, or regional adaptation.` },
      { year: "Modern era", event: `${name} moved through organized markets, cold chains, and export channels.` }
    ]
  };
  fruit.varieties = varieties.map((variety, index) => varietyDetail(fruit, variety, index));
  return fruit;
};

export const fruits = fruitSpecs.map(makeFruit);

export const recipes = fruits.flatMap(recipeSet);

export const sourceNotes = {
  unavailable: "No verified live data available"
};
