import { Customer, LinkMeta, Links, Meta, Supplier, Tax, Branch, EmisionPointForm } from "@/types";
import { ProductOutput } from "@/types/order";

export const initialMeta: Meta = {
  current_page: 1,
  last_page: 1,
  path: '',
  from: null,
};

export const initialLinks: Links = {
  first: '',
  prev: null,
  next: null,
  last: '',
};

export const initialLinkMeta: LinkMeta = {
  url: null,
  label: '',
  active: false,
};

export const initialProductItem: ProductOutput = {
  id: '',
  product_id: 0,
  price: 0,
  quantity: 1,
  stock: 1,
  discount: 0,
  iva: 0,
  total_iva: 0,
  ice: undefined,
  percentage: 0,
};

export const initialCustomer: Customer = {
  id: '',
  type_identification: 'cédula',
  identication: '',
  name: '',
};

export const initialSupplier: Supplier = {
  id: '',
  type_identification: 'ruc',
  identication: '',
  name: '',
}

export const initialTax: Tax = {
  id: '',
  code: '',
  tax_code: '',
  base: '',
  porcentage: 0,
  value: 0,
  editable_porcentage: false,
}

export const initialBranch: Branch = {
  id: '',
  store: 1,
  address: '',
  type: 'matriz',
}

export const initialEmisionPoint: EmisionPointForm = {
  point: 1,
  invoice: 1,
  creditnote: 1,
  retention: 1,
  referralguide: 1,
  settlementonpurchase: 1,
}