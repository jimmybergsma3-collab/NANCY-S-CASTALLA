export type SupplierImportKind = "europfoods" | "tindale";

export type SupplierImportWarning = {
  sourceRow: string;
  reason: string;
  severity?: "info" | "warning" | "error";
};

export type SupplierImportProduct = {
  supplier: string;
  supplierCode: string;
  ean: string;
  supplierProductName: string;
  brand: string;
  categorySource: string;
  storageType: string;
  packageDescription: string;
  unitsPerCase?: number;
  unitWeightOrVolume?: number;
  casePrice?: number;
  unitPrice?: number;
  priceExVat?: number;
  currency: "EUR";
  sourceFilename: string;
  sourceRow: string;
  sourceBatch: string;
  needsTaxReview: boolean;
  needsCategoryReview: boolean;
  needsPackageReview: boolean;
  needsImageReview: boolean;
  needsTranslationReview: boolean;
};

export type SupplierImportParseResult = {
  supplier: string;
  sourceFilename: string;
  fileType: "pdf" | "xls" | "xlsx" | "csv";
  importBatch: string;
  sourceRowCount: number;
  sectionHeadings: string[];
  products: SupplierImportProduct[];
  warnings: SupplierImportWarning[];
  errors: SupplierImportWarning[];
};

export type SupplierImportConflictSample = {
  incoming: {
    supplier: string;
    supplierCode: string;
    ean: string;
    name: string;
    packageDescription: string;
  };
  matches: Array<{
    type: "active_ean" | "active_supplier_code" | "active_name_package" | "archived_ean" | "archived_supplier_code" | "archived_name_package" | "in_file_duplicate";
    productIds?: string[];
    reason: string;
  }>;
};

export type SupplierImportPreviewReport = SupplierImportParseResult & {
  databaseProductCount: number;
  activeProductCount: number;
  archivedProductCount: number;
  nextProductCode: string;
  parsedProductCount: number;
  duplicateSupplierCodeCount: number;
  duplicateSupplierCodeGroups: Array<{ supplierCode: string; count: number; samples: string[] }>;
  missingEanCount: number;
  unclearPackageCount: number;
  missingPriceCount: number;
  possibleActiveMatches: number;
  possibleArchivedMatches: number;
  possibleInFileDuplicates: number;
  taxReviewRequiredCount: number;
  categoryReviewRequiredCount: number;
  imageReviewRequiredCount: number;
  translationReviewRequiredCount: number;
  conflictSamples: SupplierImportConflictSample[];
};
