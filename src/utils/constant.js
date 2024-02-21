const MAX_FILE_SIZE = 1.5 * 1024 * 1024 * 1024; // 1.5GB in bytes
const timeOfExpiration = 5;

const vehicle_ids = [
  "29cf8e4a-5d54-4b37-895b-7723bced4d33",
  "3826ea16-2aed-4a6f-89bb-5a1dade1ac9d",
  "41771ee1-18cc-41c9-868f-f1b3f2146048",
  "45933eb6-12e9-47d8-a300-39671aae4ded",
  "9c9f2e63-912c-4cbd-86e5-89253b90a47d",
  "a39d8344-c69c-4297-ac70-f1854898005f",
  "a6c389d2-f6ed-41d2-aa4e-fc3e21a62595",
  "a95f3c20-2fb8-484f-8502-b921b4ac3245",
  "c5c173c7-1f07-41c2-8ae6-931a2dd7ec4f",
  "de75b3c6-ff0f-4a1e-b991-43fa66566ce1",
  "ef980fb7-31d1-49d3-aa57-a794d253eadc",
  "fd87e621-1119-4f3e-b00e-961d36e1cd46",
];

const variantWithId = new Map([
  ["29cf8e4a-5d54-4b37-895b-7723bced4d33", "DOT LIGHT X"],
  ["3826ea16-2aed-4a6f-89bb-5a1dade1ac9d", "ONE BRAZEN X"],
  ["41771ee1-18cc-41c9-868f-f1b3f2146048", "DOT BRAZEN X"],
  ["45933eb6-12e9-47d8-a300-39671aae4ded", "ONE LIGHT X"],
  ["9c9f2e63-912c-4cbd-86e5-89253b90a47d", "ONE GRACE WHITE"],
  ["a39d8344-c69c-4297-ac70-f1854898005f", "DOT NAMMA RED"],
  ["a6c389d2-f6ed-41d2-aa4e-fc3e21a62595", "DOT AZURE BLUE"],
  ["a95f3c20-2fb8-484f-8502-b921b4ac3245", "ONE AZURE BLUE"],
  ["de75b3c6-ff0f-4a1e-b991-43fa66566ce1", "ONE NAMMA RED"],
  ["ef980fb7-31d1-49d3-aa57-a794d253eadc", "DOT BRAZEN BLACK"],
  ["fd87e621-1119-4f3e-b00e-961d36e1cd46", "DOT GRACE WHITE"],
  ["c5c173c7-1f07-41c2-8ae6-931a2dd7ec4f", "ONE BRAZEN BLACK"],
]);

module.exports = {
  MAX_FILE_SIZE,
  timeOfExpiration,
  vehicle_ids,
};
