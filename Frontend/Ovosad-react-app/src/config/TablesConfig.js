// PAGE: OrchardDetails, TreeDetails
//    DATA: Tree
//    TYPE: Add/Update Form
export const TreeFormConfig = [
  { name: "note", label: "Note", type: "text", required: false },
  { name: "row", label: "Row", type: "number", required: true, step: "1" },
  {
    name: "field",
    label: "Field",
    type: "number",
    required: true,
    step: "1",
  },
  {
    name: "number",
    label: "Number",
    type: "number",
    required: true,
    step: "1",
  },
  {
    name: "genotype_id",
    label: "Genotype ID",
    type: "number",
    required: false,
    step: "1",
  },
  {
    name: "rootstock_id",
    label: "Rootstock ID",
    type: "number",
    required: false,
    step: "1",
  },
  {
    name: "latitude",
    label: "Latitude",
    type: "number",
    required: false,
    step: "any",
  },
  {
    name: "longitude",
    label: "Longitude",
    type: "number",
    required: false,
    step: "any",
  },
  {
    name: "spacing",
    label: "Spacing",
    type: "number",
    required: false,
    step: "any",
  },
  {
    name: "growth_type",
    label: "Growth Type",
    type: "text",
    required: false,
  },
  {
    name: "training_shape",
    label: "Training Shape",
    type: "text",
    required: false,
  },
  {
    name: "planting_date",
    label: "Planting Date",
    type: "date",
    required: false,
  },
  {
    name: "initial_age",
    label: "Initial Age",
    type: "text",
    required: false,
  },
  {
    name: "nursery_tree_type",
    label: "Nursery Tree Type",
    type: "text",
    required: false,
  },
];

// PAGE: TreeDetails
//    DATA: Harvest
//    TYPE: Table Columns
export const harvestColumns = [
  { header: "ID", accessor: "id" },
  { header: "Date & Time", accessor: "datetime", type: "date" },
  // { header: "Note", accessor: "note" },
  { header: "Elapsed Time", accessor: "elapsed_time", type: "number" },
  {
    header: "Fruit < 60mm (Qty)",
    accessor: "fruit_under_60mm_quantity",
    type: "number",
  },
  {
    header: "Fruit < 60mm (kg)",
    accessor: "fruit_under_60mm_weight",
    type: "number",
  },
  {
    header: "Fruit < 70mm (Qty)",
    accessor: "fruit_under_70mm_quantity",
    type: "number",
  },
  {
    header: "Fruit < 70mm (kg)",
    accessor: "fruit_under_70mm_weight",
    type: "number",
  },
  {
    header: "Fruit > 70mm (Qty)",
    accessor: "fruit_over_70mm_quantity",
    type: "number",
  },
  {
    header: "Fruit > 70mm (kg)",
    accessor: "fruit_over_70mm_weight",
    type: "number",
  },
  {
    header: "Avg. Fruit Weight (kg)",
    accessor: "average_fruit_weight",
    type: "number",
  },
  {
    header: "Aphids Damage (Qty)",
    accessor: "aphids_damage_quantity",
    type: "number",
  },
  {
    header: "Aphids Damage (kg)",
    accessor: "aphids_damage_weight",
    type: "number",
  },
  { header: "Damaged (%)", accessor: "damaged_percentage", type: "number" },
];

// PAGE: TreeDetails
//    DATA: Harvest
//    TYPE: Add/Update Form
export const harvestFormConfig = [
  {
    name: "datetime",
    label: "Date & Time",
    type: "datetime-local",
    required: true,
  },
  {
    name: "elapsed_time",
    label: "Elapsed Time (minutes)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "fruit_under_60mm_quantity",
    label: "Fruit < 60mm (Quantity)",
    type: "number",
    required: true,
    step: "1",
  },
  {
    name: "fruit_under_60mm_weight",
    label: "Fruit < 60mm (Weight kg)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "fruit_under_70mm_quantity",
    label: "Fruit < 70mm (Quantity)",
    type: "number",
    required: true,
    step: "1",
  },
  {
    name: "fruit_under_70mm_weight",
    label: "Fruit < 70mm (Weight kg)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "fruit_over_70mm_quantity",
    label: "Fruit > 70mm (Quantity)",
    type: "number",
    required: true,
    step: "1",
  },
  {
    name: "fruit_over_70mm_weight",
    label: "Fruit > 70mm (Weight kg)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "average_fruit_weight",
    label: "Average Fruit Weight (kg)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "aphids_damage_quantity",
    label: "Aphids Damage (Quantity)",
    type: "number",
    required: true,
    step: "1",
  },
  {
    name: "aphids_damage_weight",
    label: "Aphids Damage (Weight kg)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "damaged_percentage",
    label: "Damaged Percentage (%)",
    type: "number",
    required: true,
    step: "any",
    min: "0",
    max: "100",
  },
  { name: "note", label: "Note", type: "textarea", required: false },
];

// PAGE: TreeDetails
//    DATA: Harvest
//    TYPE: Initial Create New Form Data
export const initialHarvestData = (treeId) => ({
  note: "",
  tree_id: treeId,
  datetime: new Date().toISOString().slice(0, 16),
  elapsed_time: 0,
  fruit_under_60mm_quantity: 0,
  fruit_under_60mm_weight: 0,
  fruit_under_70mm_quantity: 0,
  fruit_under_70mm_weight: 0,
  fruit_over_70mm_quantity: 0,
  fruit_over_70mm_weight: 0,
  average_fruit_weight: 0,
  aphids_damage_quantity: 0,
  aphids_damage_weight: 0,
  damaged_percentage: 0,
});

// PAGE: TreeDetails
//    DATA: Tree Data Entry
//    TYPE: Table Columns
export const treeDataColumns = [
  { header: "ID", accessor: "id" },
  { header: "Date & Time", accessor: "datetime", type: "date" },
  { header: "1-Yr Height (cm)", accessor: "one_year_height", type: "number" },
  {
    header: "Fruiting Height (cm)",
    accessor: "fruiting_wood_height",
    type: "number",
  },
  { header: "Total Height (cm)", accessor: "total_height", type: "number" },
  { header: "Trunk Girth (cm)", accessor: "trunk_girth", type: "number" },
  { header: "Suckering", accessor: "suckering", type: "number" },
  {
    header: "Summer Prune Date",
    accessor: "summer_pruning_date",
    type: "date",
  },
  {
    header: "Winter Prune Date",
    accessor: "winter_pruning_date",
    type: "date",
  },
  {
    header: "Summer Prune Note",
    accessor: "summer_pruning_note",
    type: "text",
  },
  {
    header: "Winter Prune Note",
    accessor: "winter_pruning_note",
    type: "text",
  },
];

// PAGE: TreeDetails
//    DATA: Tree Data Entry
//    TYPE: Add/Update Form
export const treeDataFormConfig = [
  {
    name: "datetime",
    label: "Date & Time",
    type: "datetime-local",
    required: true,
  },
  {
    name: "one_year_height",
    label: "One Year Height (cm)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "fruiting_wood_height",
    label: "Fruiting Wood Height (cm)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "total_height",
    label: "Total Height (cm)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "trunk_girth",
    label: "Trunk Girth (cm)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "suckering",
    label: "Suckering",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "summer_pruning_date",
    label: "Summer Pruning Date",
    type: "datetime-local",
    required: false,
  },
  {
    name: "winter_pruning_date",
    label: "Winter Pruning Date",
    type: "datetime-local",
    required: false,
  },
  {
    name: "summer_pruning_note",
    label: "Summer Pruning Note",
    type: "textarea",
    required: false,
  },
  {
    name: "winter_pruning_note",
    label: "Winter Pruning Note",
    type: "textarea",
    required: false,
  },
  { name: "note", label: "Note", type: "textarea", required: false },
];

// PAGE: TreeDetails
//    DATA: Tree Data Entry
//    TYPE: Initial Create New Form Data
export const initialTreeData = (treeId) => ({
  note: "",
  tree_id: treeId,
  datetime: new Date().toISOString().slice(0, 16),
  one_year_height: 0,
  fruiting_wood_height: 0,
  total_height: 0,
  trunk_girth: 0,
  suckering: 0,
  summer_pruning_date: new Date().toISOString().slice(0, 16),
  winter_pruning_date: new Date().toISOString().slice(0, 16),
  summer_pruning_note: "",
  winter_pruning_note: "",
});

// PAGE: TreeDetails
//    DATA: Spraying
//    TYPE: Table Columns
export const sprayingColumns = [
  { header: "ID", accessor: "id" },
  { header: "Date & Time", accessor: "datetime", type: "datetime-local" },
  { header: "Agent Name", accessor: "agent_name", type: "text" },
  { header: "Volume", accessor: "volume", type: "number" },
  { header: "Note", accessor: "note", type: "text" },
];

// PAGE: TreeDetails
//    DATA: Spraying
//    TYPE: Add/Update Form
export const sprayingFormConfig = [
  {
    name: "datetime",
    label: "Date & Time",
    type: "datetime-local",
    required: true,
  },
  {
    name: "agent_id",
    label: "Agent",
    type: "select",
    required: true,
    options: [],
  },
  {
    name: "volume",
    label: "Volume",
    type: "number",
    required: true,
    step: "any",
  },
  { name: "note", label: "Note", type: "textarea", required: false },
];

// PAGE: TreeDetails
//    DATA: Spraying
//    TYPE: Initial Create New Form Data
export const initialSprayingData = (treeId, agents) => ({
  note: "",
  tree_id: treeId,
  //agent_id: agents?.[0]?.id || "",
  agent_id: "",
  datetime: new Date().toISOString().slice(0, 16),
  volume: 0,
});

// PAGE: TreeDetails
//    DATA: Fruit Thinning
//    TYPE: Table Columns
export const fruitThinningColumns = [
  { header: "ID", accessor: "id" },
  { header: "Date & Time", accessor: "datetime", type: "datetime-local" },
  { header: "Spraying ID", accessor: "spraying_id", type: "number" },
  { header: "Mechanical", accessor: "mechanical", type: "boolean" },
  { header: "Cropload 4", accessor: "cropload_for_4", type: "number" },
  { header: "Cropload 3", accessor: "cropload_for_3", type: "number" },
  { header: "Cropload 1", accessor: "cropload_for_1", type: "number" },
  {
    header: "Fruit for Thinning",
    accessor: "fruit_for_thinning",
    type: "number",
  },
  { header: "Thinning Time", accessor: "fruit_thinning_time", type: "number" },
  { header: "Note", accessor: "note", type: "text" },
];

// PAGE: TreeDetails
//    DATA: Fruit Thinning
//    TYPE: Add/Update Form
export const fruitThinningFormConfig = [
  {
    name: "datetime",
    label: "Date & Time",
    type: "datetime-local",
    required: true,
  },
  {
    name: "spraying_id",
    label: "Spraying",
    type: "select",
    required: true,
    options: [],
  },
  {
    name: "mechanical",
    label: "Mechanical Thinning",
    type: "checkbox",
    required: false,
  },
  {
    name: "cropload_for_4",
    label: "Cropload (4cm)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "cropload_for_3",
    label: "Cropload (3cm)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "cropload_for_1",
    label: "Cropload (1cm)",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "fruit_for_thinning",
    label: "Fruit for Thinning",
    type: "number",
    required: true,
    step: "any",
  },
  {
    name: "fruit_thinning_time",
    label: "Fruit Thinning Time",
    type: "number",
    required: true,
    step: "any",
  },
  { name: "note", label: "Note", type: "textarea", required: false },
];

// PAGE: TreeDetails
//    DATA: Fruit Thinning
//    TYPE: Initial Create New Form Data
export const initialFruitThinningData = (treeId, sprayings) => ({
  note: "",
  tree_id: treeId,
  //spraying_id: sprayings?.[0]?.id || "",
  spraying_id: "",
  datetime: new Date().toISOString().slice(0, 16),
  mechanical: false,
  cropload_for_4: 0,
  cropload_for_3: 0,
  cropload_for_1: 0,
  fruit_for_thinning: 0,
  fruit_thinning_time: 0,
});

// PAGE: TreeDetails
//    DATA: Flower Thinning
//    TYPE: Table Columns
export const flowerThinningColumns = [
  { header: "ID", accessor: "id" },
  { header: "Date & Time", accessor: "datetime", type: "datetime-local" },
  { header: "Spraying ID", accessor: "spraying_id", type: "number" },
  { header: "Mechanical", accessor: "mechanical", type: "boolean" },
  {
    header: "Clusters Before",
    accessor: "flower_clusters_before_thinning",
    type: "number",
  },
  {
    header: "Clusters For Thinning",
    accessor: "flower_clusters_for_thinning",
    type: "number",
  },
  {
    header: "Clusters After",
    accessor: "flower_clusters_after_thinning",
    type: "number",
  },
  {
    header: "Clusters Before (1-Yr)",
    accessor: "flower_clusters_before_thinning_one_year",
    type: "number",
  },
  {
    header: "Clusters For Thinning (1-Yr)",
    accessor: "flower_clusters_for_thinning_one_year",
    type: "number",
  },
  {
    header: "Clusters After (1-Yr)",
    accessor: "flower_clusters_after_thinning_one_year",
    type: "number",
  },
  { header: "Note", accessor: "note", type: "text" },
];

// PAGE: TreeDetails
//    DATA: Flower Thinning
//    TYPE: Add/Update Form
export const flowerThinningFormConfig = [
  {
    name: "datetime",
    label: "Date & Time",
    type: "datetime-local",
    required: true,
  },
  {
    name: "spraying_id",
    label: "Spraying",
    type: "select",
    required: true,
    options: [],
  },
  {
    name: "mechanical",
    label: "Mechanical Thinning",
    type: "checkbox",
    required: false,
  },
  {
    name: "flower_clusters_before_thinning",
    label: "Flower Clusters Before Thinning",
    type: "number",
    required: true,
    step: "1",
  },
  {
    name: "flower_clusters_for_thinning",
    label: "Flower Clusters For Thinning",
    type: "number",
    required: true,
    step: "1",
  },
  {
    name: "flower_clusters_after_thinning",
    label: "Flower Clusters After Thinning",
    type: "number",
    required: true,
    step: "1",
  },
  {
    name: "flower_clusters_before_thinning_one_year",
    label: "Flower Clusters Before Thinning (1-Year)",
    type: "number",
    required: true,
    step: "1",
  },
  {
    name: "flower_clusters_for_thinning_one_year",
    label: "Flower Clusters For Thinning (1-Year)",
    type: "number",
    required: true,
    step: "1",
  },
  {
    name: "flower_clusters_after_thinning_one_year",
    label: "Flower Clusters After Thinning (1-Year)",
    type: "number",
    required: true,
    step: "1",
  },
  { name: "note", label: "Note", type: "textarea", required: false },
];

// PAGE: TreeDetails
//    DATA: Flower Thinning
//    TYPE: Initial Create New Form Data
export const initialFlowerThinningData = (treeId, sprayings) => ({
  note: "",
  tree_id: treeId,
  //spraying_id: sprayings?.[0]?.id || "",
  spraying_id: "",
  datetime: new Date().toISOString().slice(0, 16),
  chemical: false,
  hand_thinning: false,
  cropload_before: 0,
  flowers_for_thinning: 0,
  flower_thinning_time: 0,
});

// PAGE: Agents
//    DATA: Agent
//    TYPE: Table Columns
export const agentColumns = [
  { header: "ID", accessor: "id" },
  { header: "Name", accessor: "name", type: "text" },
  { header: "Description", accessor: "description", type: "text" },
  { header: "Note", accessor: "note", type: "text" },
  { header: "Number of Sprayings", accessor: "sprayings", type: "array" },
];

// PAGE: Agents
//    DATA: Agent
//    TYPE: Add/Update Form
export const agentFormConfig = [
  { name: "name", label: "Agent Name", type: "text", required: true },
  {
    name: "description",
    label: "Description",
    type: "text",
    required: true,
  },
  { name: "note", label: "Note", type: "text", required: false },
];

// PAGE: Agents
//    DATA: Agent
//    TYPE: Initial Create New Form Data
export const initialAgentData = () => ({
  name: "",
  description: "",
  note: "",
});

// PAGE: File Batches
//    DATA: File Batch
//    TYPE: Table Columns
export const fileBatchColumns = [
  {
    header: "ID",
    accessor: "id",
  },
  {
    header: "Label",
    accessor: "label",
  },
  {
    header: "Note",
    accessor: "note",
  },
  {
    header: "Number of Files",
    accessor: "files",
  },
];

// PAGE: File Batches
//    DATA: File Batch
//    TYPE: Add/Update Form
export const fileBatchFormConfig = [
  {
    name: "label",
    label: "Label",
    type: "text",
    required: true,
  },
  {
    name: "note",
    label: "Note",
    type: "textarea",
    required: false,
  },
];

// PAGE: File Batches
//    DATA: File Batch
//    TYPE: Initial Create New Form Data
export const initialFileBatchData = () => ({
  label: "",
  note: "",
});
