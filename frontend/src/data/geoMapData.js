import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";

export const countryCoordinates = {
  Afghanistan: [33.9391, 67.71],
  Argentina: [-34.6037, -58.3816],
  "Arunachal Pradesh": [28.218, 94.7278],
  Assam: [26.2006, 92.9376],
  Bangladesh: [23.685, 90.3563],
  Bihar: [25.0961, 85.3131],
  Brazil: [-14.235, -51.9253],
  Cambodia: [12.5657, 104.991],
  Canada: [56.1304, -106.3468],
  "Caribbean region": [18.2208, -66.5901],
  "Central Asia": [45.4507, 68.8319],
  Chile: [-35.6751, -71.543],
  China: [35.8617, 104.1954],
  Colombia: [4.5709, -74.2973],
  "Costa Rica": [9.7489, -83.7534],
  Ecuador: [-1.8312, -78.1834],
  Egypt: [26.8206, 30.8025],
  "European Union": [50.8503, 4.3517],
  Gujarat: [22.2587, 71.1924],
  "Himachal Pradesh": [31.1048, 77.1734],
  India: [20.5937, 78.9629],
  Indonesia: [-0.7893, 113.9213],
  Iran: [32.4279, 53.688],
  Italy: [41.8719, 12.5674],
  Japan: [36.2048, 138.2529],
  Karnataka: [15.3173, 75.7139],
  Kashmir: [34.0837, 74.7973],
  Kenya: [-0.0236, 37.9062],
  Kerala: [10.8505, 76.2711],
  Madagascar: [-18.7669, 46.8691],
  Maharashtra: [19.7515, 75.7139],
  Malaysia: [4.2105, 101.9758],
  "Madhya Pradesh": [22.9734, 78.6569],
  "Mediterranean region": [38.0, 18.0],
  Mexico: [23.6345, -102.5528],
  "Middle East": [29.2985, 42.551],
  Morocco: [31.7917, -7.0926],
  Myanmar: [21.9162, 95.956],
  Nepal: [28.3949, 84.124],
  Netherlands: [52.1326, 5.2913],
  Nigeria: [9.082, 8.6753],
  "Northeast India": [26.2, 92.9],
  "Northern India": [28.7041, 77.1025],
  Pakistan: [30.3753, 69.3451],
  Peru: [-9.19, -75.0152],
  Philippines: [12.8797, 121.774],
  "Papua New Guinea": [-6.315, 143.9555],
  Rajasthan: [27.0238, 74.2179],
  Romania: [45.9432, 24.9668],
  Russia: [61.524, 105.3188],
  "Saudi Arabia": [23.8859, 45.0792],
  Serbia: [44.0165, 21.0059],
  "South Africa": [-30.5595, 22.9375],
  "South Asia": [22.0, 80.0],
  Spain: [40.4637, -3.7492],
  "Sri Lanka": [7.8731, 80.7718],
  Sudan: [12.8628, 30.2176],
  "Tamil Nadu": [11.1271, 78.6569],
  Telangana: [18.1124, 79.0193],
  Thailand: [15.87, 100.9925],
  Turkey: [38.9637, 35.2433],
  "United Arab Emirates": [23.4241, 53.8478],
  "United Kingdom": [55.3781, -3.436],
  "United States": [37.0902, -95.7129],
  "Uttar Pradesh": [26.8467, 80.9462],
  Uttarakhand: [30.0668, 79.0193],
  Uzbekistan: [41.3775, 64.5853],
  Vietnam: [14.0583, 108.2772],
  "West Bengal": [22.9868, 87.855],
  "Western Ghats, India": [12.8, 75.6],
  "Ayurvedic markets": [22.0, 78.0],
  "Limited Indian highlands": [30.8, 78.6],
  "Pickle and specialty markets": [24.0, 77.0],
  "Specialty Asian markets": [22.0, 100.0],
  "Specialty summer beverage markets": [27.0, 77.0],
  "Traditional product markets": [22.0, 78.0]
};

export const layerColors = {
  Growing: "#34d399",
  Production: "#34d399",
  Export: "#60a5fa",
  Import: "#fb923c",
  Origin: "#facc15"
};

const indiaRecognizedFeature = {
  type: "Feature",
  id: "IND",
  properties: {
    name: "India"
  },
  geometry: {
    type: "MultiPolygon",
    coordinates: [
      [[
        [68.1, 23.7], [68.2, 21.1], [69.0, 18.6], [70.0, 16.0], [72.0, 12.7],
        [73.5, 10.3], [75.3, 8.2], [77.4, 7.6], [79.6, 8.4], [80.4, 9.8],
        [81.2, 12.9], [82.9, 16.6], [84.6, 19.7], [87.2, 21.7], [89.5, 22.1],
        [91.5, 23.6], [92.8, 25.2], [94.2, 26.3], [97.4, 27.1], [96.9, 29.5],
        [94.9, 29.1], [92.4, 28.2], [90.5, 27.4], [88.7, 27.9], [87.0, 27.9],
        [84.9, 28.7], [82.6, 30.0], [80.2, 31.8], [80.6, 34.8], [79.5, 35.9],
        [77.9, 36.6], [75.1, 36.8], [73.0, 35.8], [71.2, 34.3], [70.2, 31.6],
        [69.4, 28.6], [68.6, 26.2], [68.1, 23.7]
      ]],
      [[
        [92.2, 13.8], [93.0, 13.1], [93.2, 11.8], [92.8, 10.6], [92.3, 11.4],
        [92.0, 12.7], [92.2, 13.8]
      ]],
      [[
        [93.5, 9.4], [94.0, 8.2], [93.7, 7.0], [93.0, 7.9], [92.9, 8.9],
        [93.5, 9.4]
      ]]
    ]
  }
};

const sourceWorldGeo = feature(worldAtlas, worldAtlas.objects.countries);

export const indiaRecognizedWorldGeo = {
  ...sourceWorldGeo,
  features: [
    ...sourceWorldGeo.features.filter((item) => item.id !== "356" && item.id !== 356 && item.properties?.name !== "India"),
    indiaRecognizedFeature
  ]
};

export const mapCountryStyle = {
  color: "rgba(226,232,240,.22)",
  weight: 0.75,
  fillColor: "rgba(15,23,42,.72)",
  fillOpacity: 1
};

export const toFruitMapMarkers = (fruits) =>
  fruits
    .flatMap((fruit) => [
      ...(fruit.productionRegions || []).map((country) => ({ ...fruit, country, layer: "Growing" })),
      ...(fruit.exportRegions || []).map((country) => ({ ...fruit, country, layer: "Export" })),
      ...(fruit.importRegions || []).map((country) => ({ ...fruit, country, layer: "Import" }))
    ])
    .map((item) => ({ ...item, coords: countryCoordinates[item.country] }))
    .filter((item) => item.coords);
