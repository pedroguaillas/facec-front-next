import { LinkMeta, Links, Meta } from "@/types";
import { nanoid } from "nanoid";

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

const id = nanoid(); // "V1StGXR8_Z5jdHi6B-myT"

export const initialProductItem: ProductOutput = {
  id,
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
