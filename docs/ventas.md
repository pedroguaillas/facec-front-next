# Módulo Ventas (Invoices / Orders)

Documentación funcional del módulo de facturación de venta. En el código el
módulo se llama **Invoices** internamente, pero la ruta y el feature-folder
son `orders`. Ubicación del código: `app/(route)/orders/`.

Título visible en el listado: "Ventas" (`app/(route)/orders/page.tsx:50`).

## 1. Entidad principal

### `OrderCreateProps` (formulario de creación/edición)

Definida en `types/order.d.ts:21-50`.

| Campo             | Tipo               | Notas |
|--------------------|--------------------|-------|
| `id`               | `string?`          | Solo en edición (`order.id + ''`) |
| `serie`            | `string`           | Formato `000-000-000000000`; se autogenera al elegir punto de emisión (ver §4.6) |
| `date`              | `string`           | Fecha de emisión, se inicializa con `getDate()` (hoy) y se muestra de solo lectura |
| `expiration_days`  | `number`           | Comentado como "Eliminar" en el propio type — no se usa en el formulario visible |
| `no_iva`           | `number`           | Suma de ítems con `iva === 6` ("No objeto de IVA") |
| `base0`…`base15`   | `number`           | Bases imponibles por tarifa (0/5/8/12/15%) |
| `iva5`,`iva8`,`iva`,`iva15` | `number`   | Montos de IVA calculados por tarifa (`iva` = 12%) |
| `ice`              | `number`           | Suma de ICE de todos los ítems |
| `sub_total`        | `number`           | `no_iva + base0 + base5 + base8 + base12 + base15` |
| `discount`         | `string \| number` | Descuento global, editable manualmente en `Totals.tsx` |
| `total`            | `number`           | `sub_total + ice + iva_total - discount` |
| `description`      | `string \| null`   | No tiene input visible en el formulario actual |
| `customer_id`      | `number`           | Requerido, seleccionado vía `SelectCustomer` |
| `received`         | `number`           | Comentado "Ver" — sin uso visible en el formulario |
| `doc_realeted`     | `number`           | Comentado "Ver" — sin uso visible en el formulario |
| `voucher_type`     | `1 \| 4`           | `1` = Factura, `4` = Nota de Crédito |
| `pay_method`       | `number`           | Catálogo `payMethods` |
| `guia`             | `string?`          | Guía de remisión, solo factura, requiere permiso `guia_in_invoice` |
| `date_order`, `serie_order`, `reason` | `string?` | Solo para Nota de Crédito (referencia a la factura original) |
| `plate`            | `string?`          | Placa del vehículo; obligatoria solo si algún ítem es un servicio de transporte (ver §3.10) |

### `ProductOutput` (línea de detalle / ítem)

`types/order.d.ts:63-75`.

| Campo        | Tipo                  | Notas |
|--------------|------------------------|-------|
| `id`         | `string`               | `nanoid()` en frontend |
| `product_id` | `number`               | Seleccionado desde `SelectProduct` |
| `aux_cod`    | `string?`               | Código auxiliar SRI del producto seleccionado (copiado desde `product.atts.aux_cod` en `selectProduct`); usado para detectar servicios de transporte (§3.10) |
| `price`      | `number \| string`     | Precio unitario sin impuestos |
| `quantity`   | `number \| string`     |  |
| `stock`      | `number`                | Se fija en `1` al seleccionar producto (no se valida contra stock real) |
| `discount`   | `number \| string`      | Descuento por línea |
| `iva`        | `number \| undefined`   | Código de tarifa IVA del producto (ver tabla de códigos en §4.1) |
| `total_iva`  | `number \| string`      | Subtotal de la línea (con o sin desglose según `isTaxBreakdown`) |
| `ice`        | `number \| string \| undefined` | Solo definido si el producto tiene ICE |
| `percentage` | `number`                | Porcentaje de IVA del producto (`product.iva.percentage`) |
| `name`       | `string?`               | Nombre para mostrar (solo viene en edición) |

### `Repayment` / `RepaymentTax` (reembolsos)

`types/repayment.d.ts`.

| Campo (Repayment) | Tipo | Notas |
|---|---|---|
| `identification` | `string` | RUC/cédula del proveedor del reembolso, mín. 10 dígitos numéricos |
| `sequential` | `string` | Formato `000-000-000000000` |
| `date` | `string` | Fecha, máx. hoy |
| `authorization` | `string` | Solo números, 10 o 49 dígitos |
| `repaymentTaxes` | `RepaymentTax[]` | Detalle de impuestos del reembolso |

| Campo (RepaymentTax) | Tipo | Notas |
|---|---|---|
| `iva_tax_code` | `'' \| 0 \| 4` | `0` = IVA 0%, `4` = IVA 15% (únicas opciones en el select, `ItemRepaymentTaxes.tsx:36-39`) |
| `base` | `number` | Base imponible |
| `iva` | `number` | Monto de IVA |

### `AditionalInformation`

`types/order.d.ts:57-61`: `{ id, name, description }`. Límite de 13 registros
impuesto en frontend (`AditionalInformation.tsx:15-18`, con `alert()`). El SRI
permite 15 campos de información adicional por comprobante, pero el backend
reserva 2 (RUC Proveedor y Calificación Artesanal), dejando 13 disponibles
para el usuario.

### `OrderProps` (fila del listado)

`types/order.d.ts:3-19`: incluye `atts.state` (`states` de `types/general.d.ts`),
`atts.voucher_type`, `atts.send_mail`, `atts.xml`, y datos mínimos de `customer`.

## 2. Carga inicial del formulario

`FormInvoiceContext.tsx` decide entre creación y edición según `params.id`
(`FormInvoiceContext.tsx:98-138`).

### Creación — `getCreateInvoice` (`GET orders/create`)

Respuesta `ResCreateInvoice` (`services/invoiceServices.ts:6`):

```ts
interface ResCreateInvoice extends ResInvoice {
  pay_method: number;
  tourism: boolean;
  repayment: boolean;
}
// ResInvoice = { points: EmisionPoint[], methodOfPayments: PayMethod[] }
```

- `points`: catálogo de puntos de emisión (`EmisionPoint[]`), con secuenciales
  de factura/nota de crédito (`invoice`, `creditnote`) por punto.
- `methodOfPayments`: catálogo de formas de pago.
- `pay_method`: forma de pago por defecto sugerida por el backend.
- `tourism`: flag booleano — **se guarda en el context pero no se usa en
  ningún componente del formulario** (ver Observaciones).
- `repayment`: flag booleano que habilita/oculta la sección "Reembolsos"
  completa (`Repayments.tsx:13-15`).

Además se inicializa `productOutputs` con una fila vacía
(`initialProductItem`, `FormInvoiceContext.tsx:133`).

### Edición — `getInvoice` (`GET orders/{id}`)

Respuesta `ResUpdateInvoice`: `{ points, methodOfPayments, customers, order,
order_aditionals, order_items }`. Se hidratan `invoice`, `points`,
`payMethods`, `selectCustom` (a partir de `customers[0]`),
`aditionalInformation` y `productOutputs`. `isActiveIce` se activa si algún
`order_item` trae `ice !== undefined` (`FormInvoiceContext.tsx:122`).

> **Nota:** en modo edición no se llega a poblar `repayments` ni el flag
> `repayment` desde el backend (`setRepayments`/`setRepayment` no se llaman
> en esa rama) — ver Observaciones, sección de inconsistencias.

## 3. Lógica condicional importante

### 3.1 Cálculo de totales e impuestos (`useProductOutput.recalculate`, `hooks/useProductOutput.ts:93-146`)

Por cada ítem se acumula según el código de tarifa `iva` del producto:

```ts
no_iva += iva === 6 ? Number(total_iva) : 0;                 // No objeto de IVA
base0  += iva === 0 ? Number(total_iva) : 0;                  // 0%
base5  += iva === 5 ? Number(price) * Number(quantity) - Number(discount) : 0;
base8  += iva === 8 ? Number(price) * Number(quantity) - Number(discount) : 0;
base12 += iva === 2 ? Number(price) * Number(quantity) - Number(discount) : 0;
base15 += iva === 4 ? Number(price) * Number(quantity) - Number(discount) : 0;
```

Tabla de códigos de IVA inferidos del código (no hay catálogo visible en el
frontend de `orders`, se listan solo los usados):

| Código `iva` | Tarifa | Base afectada |
|---|---|---|
| `0` | 0% | `base0` |
| `2` | 12% | `base12` |
| `4` | 15% | `base15` |
| `5` | 5% | `base5` |
| `6` | No objeto de IVA | `no_iva` (no genera impuesto) |
| `8` | 8% | `base8` |

Luego:

```ts
sub_total = no_iva + base0 + base5 + base8 + base12 + base15;
iva5  = base5 * 0.05;
iva8  = base8 * 0.08;
iva   = base12 > 0 ? (base12 + totalIce) * 0.12 : 0;   // "iva" = tarifa 12%
iva15 = base15 > 0 ? (base15 + totalIce) * 0.15 : 0;
total = sub_total + totalIce + (iva5 + iva8 + iva + iva15);
```

- El **ICE se suma a la base de 12% y 15%** antes de calcular el IVA de esas
  tarifas (`(base12 + totalIce) * 0.12`), pero **no** se suma a las bases de
  5% ni 8% (`iva5`/`iva8` se calculan solo sobre `base5`/`base8`, sin ICE).
- `discount` (descuento total) se recalcula como la suma de los descuentos
  por línea (`totalDiscount`) cada vez que cambia un ítem — pero el usuario
  también puede editarlo manualmente y de forma independiente desde
  `Totals.tsx` (ver 3.1.1), lo que puede desincronizar ambos cálculos.
- **`recalculate` NO resta el descuento del `total`**
  (`total = sub_total + totalIce + totalIva`, `useProductOutput.ts:126`). El
  descuento por línea ya viene restado dentro de cada base
  (`price*quantity - discount`), así que `sub_total` y `total` ya lo excluyen;
  el campo `invoice.discount` que se muestra es solo informativo (la suma de
  los descuentos de línea ya aplicados). Esto es coherente **hasta** que se
  edita el descuento manualmente en `Totals.tsx`, donde sí se vuelve a restar
  (ver el bug de doble descuento en §Errores detectados).

#### 3.1.1 Edición manual del descuento global (`Totals.tsx:12-34`)

```ts
const total = Number((invoice.sub_total + invoice.ice + invoice.iva5 + invoice.iva8 + invoice.iva + invoice.iva15 - parsed).toFixed(2));
```

- Al escribir en el input "Descuento", se valida `0 <= parsed < invoice.sub_total`
  (si no, la edición se ignora silenciosamente — `Totals.tsx:25`).
- `total` se recalcula restando el nuevo descuento del subtotal + impuestos,
  **sin** volver a tocar los descuentos por línea de cada producto.

#### 3.1.2 Desglose de IVA por línea (`isTaxBreakdown`, `useProductOutput.breakdown`)

Checkbox "¿Necesitas desglosar el IVA?" en `ListProducts.tsx:26`. Al
activarlo, cada línea recalcula su `total_iva`:

```ts
const base = (price * quantity) - discount;
total_iva = !breakdown ? base : base * (1 + percentage / 100);
```

- Con `isTaxBreakdown = true`: el campo Precio deja de ser editable (se
  muestra solo el número, `ItemProduct.tsx:49-63`) y aparece la columna
  "IVA" (calculada por `ivaCalculation()`) además de que "Subtotal"
  (`total_iva`) pasa a ser editable directamente.
- `ivaCalculation()` (`ItemProduct.tsx:24-34`) **solo calcula IVA si
  `productOutput.iva === 4 || productOutput.iva === 5`** (15% y 5%); para
  ítems con `iva === 2` (12%) u `8` (8%) devuelve `0` — ver Observaciones.
- Si el usuario edita directamente `total_iva` con desglose activo,
  `updateItem` recalcula el precio hacia atrás:
  `price = total_iva / quantity / (1 + percentage/100)` (`useProductOutput.ts:50`).

### 3.2 Reembolsos ("Repayments")

- Se activan/muestran solo si el flag `repayment` (booleano) viene en `true`
  desde `getCreateInvoice` (`Repayments.tsx:13-15`); es una configuración de
  empresa/backend, no depende de ningún campo del formulario.
- Cada reembolso agrupa varios `repaymentTaxes` (impuestos por tarifa: 0% o
  15%). El total de un reembolso es la suma de `base + iva` de sus
  `repaymentTaxes` (mostrado en el `tfoot` de `ItemRepaymentTaxes.tsx:74-91`).
- **Validación cruzada (Zod, `schemas/invoice.schema.ts:60-83`)**: la suma de
  `(base + iva)` de **todos** los `repaymentTaxes` de **todos** los
  `repayments` debe ser igual a `invoice.total` (tolerancia `0.01`). Si no
  hay `repayments`, esta regla no se evalúa.
- **Validación de duplicados**: no se permite repetir `authorization` entre
  distintos reembolsos (`invoice.schema.ts:30-48`), ni repetir
  `iva_tax_code` dentro de los `repaymentTaxes` de un mismo reembolso
  (`schemas/repayment.schema.ts:30-43`).
- La sección de reembolsos **no se renderiza en la página de edición**
  (`orders/[id]/page.tsx` no importa `Repayments`) — ver Observaciones.

### 3.3 Formas de pago (`PayMethods.tsx`)

- El selector de forma de pago **no se muestra si `voucher_type === 4`**
  (Nota de Crédito): `PayMethods.tsx:11` — `if (Number(invoice.voucher_type) === 4) return null;`.
- Regla de negocio (Zod, `invoice.schema.ts:113-119`):

```ts
.refine(
  (data) => !(data.pay_method === 1 && data.total >= 500),
  { path: ['pay_method'], message: 'Monto desde $500, debe seleccionar otro forma de pago' }
);
```

  Es decir, **no se puede pagar en efectivo (`pay_method === 1`) si el total
  es mayor o igual a $500**.
- Valor inicial de `pay_method`: `20` (`FormInvoiceContext.tsx:74`), luego
  sobreescrito por el `pay_method` sugerido por el backend en creación.

### 3.4 Selección de productos (`ItemProduct`, `ListProducts`, `ImportItems`)

`selectProduct` (`useProductOutput.ts:58-83`) al elegir un producto:

```ts
prods[index].price = product.atts.price1;
prods[index].quantity = 1;
prods[index].discount = 0;
prods[index].stock = 1;
prods[index].total_iva = product.atts.price1.toFixed(2);
if (product.atts.ice !== null) {
    prods[index].ice = '';
    setIsActiveIce(true);
}
prods[index].iva = product.iva.code;
prods[index].percentage = product.iva.percentage;
```

- **No hay lógica de código auxiliar SRI (`aux_cod`) ni de categorías SRI
  (`ferreteria`/`transporte`) replicada en el módulo de ventas.** Esa
  información pertenece al producto (`app/(route)/products/`) y ya viene
  resuelta desde el backend; el formulario de ventas solo consume
  `product.iva.code`, `product.iva.percentage`, `product.atts.price1` y
  `product.atts.ice`.
- `product.atts.ice !== null` activa la columna "ICE" para **toda la
  tabla** vía `setIsActiveIce(true)` (estado global del formulario, no por
  línea) — una vez activada, no se detectó código que la desactive si luego
  se elimina ese ítem.
- `selectProduct` fija `total_iva = product.atts.price1.toFixed(2)`
  (`useProductOutput.ts:65`) **sin** considerar si el desglose de IVA está
  activo (`isTaxBreakdown`). Al seleccionar un producto con el desglose
  encendido, el "Subtotal" muestra el precio sin IVA hasta que un
  `recalculate`/toggle lo recomputa (ver §Errores detectados).
- El tipo `ProductProps.atts.ice` está declarado como `null` fijo en
  `types/product.d.ts:9` (`ice: null`), lo cual documenta el contrato del
  tipo como "siempre null" aunque el runtime evidentemente puede traer un
  número (si no, la condición `!== null` nunca activaría ICE) — tipo
  desactualizado respecto al uso real.
- **Importación de productos** (`ImportItems.tsx`, visible solo con permiso
  `import_in_invoice`): permite subir un `.csv` con columnas
  `code;price;quantity` (separadas por `;`, se ignora la primera línea de
  cabecera) y envía todo a `POST products/getmasive`; la respuesta
  `orderItems` reemplaza directamente `productOutputs` (no se hace merge
  con las líneas ya agregadas).
- **Importación masiva de facturas** (`useImportExcel.ts`, distinto de
  `ImportItems`): sube un `.xlsx` completo vía `POST orders/lot` con
  `point_id` fijo en `"1"` (hardcodeado, `useImportExcel.ts:10`) — ver
  Observaciones.

### 3.5 Validaciones condicionales del schema Zod (`schemas/invoice.schema.ts`)

| Condición | Regla | Línea |
|---|---|---|
| `voucher_type === 1` (Factura) | `guia` opcional, pero si viene debe cumplir `000-000-000000000` | `invoice.schema.ts:51-59` |
| `voucher_type === 4` (Nota de Crédito) | `date_order` obligatorio | `invoice.schema.ts:84-92` |
| `voucher_type === 4` | `serie_order` obligatorio con formato `000-000-000000000` | `invoice.schema.ts:94-102` |
| `voucher_type === 4` | `reason` obligatorio, mín. 3 caracteres | `invoice.schema.ts:104-112` |
| `pay_method === 1 && total >= 500` | Rechazado (no efectivo desde $500) | `invoice.schema.ts:113-119` |
| Hay `repayments` | Suma de bases+iva de reembolsos == `total` (tolerancia 0.01) | `invoice.schema.ts:60-83` |
| Hay `repayments` | `authorization` no puede repetirse entre reembolsos | `invoice.schema.ts:30-48` |
| — | `products` debe tener al menos 1 elemento | `invoice.schema.ts:28-29` |

El schema por producto (`schemas/product-output.schema.ts`) valida
`product_id >= 1`, y que `quantity`, `price`, `discount`, `total_iva` sean
numéricos `>= 0`. `ice` es opcional y coercitivo a número, con un `TODO` sin
implementar: *"validar que el ICE si diferente de undefined entonces tenga
un valor mayor a 0"* (`product-output.schema.ts:39`).

### 3.6 Límite de Consumidor Final

`Totals.tsx:112`:

```tsx
{selectCustom?.atts.identication === CONSUMIDOR_FINAL_IDENTICATION && invoice.total > 50 &&
  <p className="text-sm text-red-500 text-right pt-2">Límite $50 si es Consumidor Final</p>}
```

Solo es un **mensaje visual de advertencia** (identifica al cliente genérico
"Consumidor Final" por su identificación fija, constante
`CONSUMIDOR_FINAL_IDENTICATION = '9999999999999'` en `constants/customers.ts`);
no bloquea el envío del formulario ni existe validación equivalente en el
schema Zod ni en `ButtonSubmit.tsx`. La misma constante también bloquea la
edición de ese cliente desde el módulo Clientes (ver `docs/clientes.md`).

### 3.7 Serie / punto de emisión (`useSelectPoint.ts`)

- Si solo hay un punto de emisión disponible (`points.length === 1`), se
  autoselecciona (`handlePoints`, `useSelectPoint.ts:10-14`).
- Al cambiar el punto o el `voucher_type`, se recalcula la serie:

```ts
const nextNumber = Number(voucher_type) === 1 ? selectPoint.invoice : selectPoint.creditnote;
const serie = `${selectPoint.store}-${selectPoint.point}-${String(nextNumber).padStart(9, '0')}`;
```

  Es decir, factura y nota de crédito llevan **secuenciales independientes**
  por punto de emisión (`selectPoint.invoice` vs. `selectPoint.creditnote`).
- El selector de punto de emisión solo se muestra si `points.length > 1 &&
  !params.id` (`GeneralInformation.tsx:68`) — **en edición nunca se muestra
  el selector de punto**, aunque haya varios puntos disponibles (se asume
  que la serie ya quedó fija al crear el documento).

### 3.8 Campos condicionados por tipo de comprobante (`GeneralInformation.tsx`)

| `voucher_type` | Campos visibles |
|---|---|
| `1` (Factura) | `guia` (Guía de Remisión), solo si `session.user.permissions.guia_in_invoice` |
| `4` (Nota de Crédito) | `date_order` (Emisión factura), `serie_order` (Serie factura), `reason` (Motivo) — los tres `required` a nivel de UI y de schema |

### 3.9 Estados del documento (`states`, `types/general.d.ts:1-11`)

```
'' | 'CREADO' | 'FIRMADO' | 'ENVIADO' | 'RECIBIDA' | 'EN_PROCESO' | 'DEVUELTA'
  | 'AUTORIZADO' | 'NO AUTORIZADO' | 'ANULADO'
```

El listado (`InvoicesTable.tsx`) colorea `AUTORIZADO` en verde y
`NO AUTORIZADO`/`EN PROCESO`/`DEVUELTA` en amarillo con tooltip de
`extra_detail`. El menú de acciones (`Dropdown.tsx:18-27`) mapea cada estado
a una acción disponible vía `GET orders/{id}/{endpoint}`:

| Estado actual | Acción mostrada | Endpoint |
|---|---|---|
| `CREADO` | "Procesar" | `orders/{id}/process` |
| `FIRMADO` | "Enviar y procesar" | `orders/{id}/process` |
| `ENVIADO` / `RECIBIDA` / `EN_PROCESO` | "Autorizar" | `orders/{id}/process` |
| `DEVUELTA` | "Volver a procesar" | `orders/{id}/process` |
| `AUTORIZADO` | "Anular" | `orders/{id}/cancel` (con alerta: "para anular... primero debe anularlo en el SRI") |
| `NO_AUTORIZADO` | "Volver a procesar" | `orders/{id}/process` |
| `ANULADO` | (sin acción de proceso, solo Ver/Imprimir/Enviar/Descargar) | — |

Adicional: "Enviar correo" exige `state === 'AUTORIZADO'` y que el cliente
tenga `email` (`Dropdown.tsx:102-110`), validado con `alert()` en el
navegador.

### 3.10 Placa obligatoria para servicios de transporte

Constante `TRANSPORT_AUX_COD_PREFIX = 'H49200'` (`constants/sriCategories.ts`).

- Al seleccionar un producto (`useProductOutput.selectProduct`,
  `hooks/useProductOutput.ts`), se copia `aux_cod: product.atts.aux_cod` al
  `ProductOutput` de la línea.
- `app/(route)/orders/shared/Plate.tsx` renderiza un `TextInput` "Placa"
  (obligatorio) justo antes de `<PayMethods />` (en `create/page.tsx` y
  `[id]/page.tsx`), solo si:
  ```ts
  const hasTransportItem = productOutputs.some(item => item.aux_cod?.startsWith(TRANSPORT_AUX_COD_PREFIX));
  if (!hasTransportItem && !invoice.plate) return null;
  ```
  El `|| invoice.plate` cubre el caso de edición: si la respuesta de
  `getInvoice` no re-envía `aux_cod` en `order_items` pero el pedido ya tiene
  `plate` guardada, el campo se muestra igual para poder verla/editarla.
- Validación (`schemas/invoice.schema.ts`, último `.refine()`): `plate` es
  obligatoria si `data.products.some(p => p.aux_cod?.startsWith(TRANSPORT_AUX_COD_PREFIX))`.
  `schemas/product-output.schema.ts` declara `aux_cod` opcional solo para que
  viaje a través del `.safeParse` (el refine de nivel factura lee `aux_cod`
  desde `data.products`).
- Sin cambios en `ButtonSubmit.tsx`: `plate` viaja automático dentro del
  spread `...invoice` del payload.

## 4. Envío del formulario (`ButtonSubmit.tsx`)

1. Arma `form` combinando `invoice` + `products: productOutputs` +
   `aditionals` (con `name`/`description` recortados con `.trim()`) +
   `point_id: selectPoint?.id` + `repayments`, más el flag `send` (booleano
   según el botón presionado: "Guardar" = `false`, "Guardar y procesar" =
   `true`).
2. Si `voucher_type === 4`, recorta `reason` con `.trim()`.
3. Valida con `invoiceSchema.safeParse(form)`. Si falla:
   - Errores de nivel raíz (`customer_id`, `serie`, `pay_method`, etc.) →
     `setFormErrors`.
   - Errores dentro de `products[i].campo` → mapeados por `id` de línea en
     `errorProductOutputs` (`ButtonSubmit.tsx:54-69`).
   - Errores dentro de `repayments[i].campo` → mapeados por `id` en
     `errorRepayments` (`ButtonSubmit.tsx:71-86`).
   - Errores dentro de `aditionals[i].campo` → mapeados por `id` en
     `errorAditionalInformation` (`ButtonSubmit.tsx:88-103`).
   - Se corta el envío (`return`).
4. Si pasa la validación: `setIsPending(true)` y llama
   `invoiceUpdateServices` (si `params.id`) o `invoiceStoreServices`
   (`POST orders` / `PUT orders/{id}`).
5. Si la respuesta trae `data` → redirige a `/orders`. Si trae `error`
   (error de red o error genérico no-422) → se loguea en consola y se
   reactiva el botón (`setIsPending(false)`).
6. **No se maneja el caso `errors`** (validación 422 de Laravel) — ver
   Observaciones, es el hallazgo más relevante de este documento.

## 5. Resumen de reglas de negocio confirmadas

1. Código de tarifa de IVA (`ProductOutput.iva`): `0`→0%, `2`→12%, `4`→15%,
   `5`→5%, `6`→No objeto de IVA, `8`→8% (`hooks/useProductOutput.ts:103-115`).
2. El ICE se suma a la base de las tarifas 12% y 15% antes de calcular el
   IVA de esas líneas, pero no se suma a las bases de 5%/8%
   (`hooks/useProductOutput.ts:120-123`).
3. No se puede pagar en efectivo (`pay_method === 1`) si el total es mayor o
   igual a $500 (`schemas/invoice.schema.ts:113-119`).
4. El selector de forma de pago se oculta completamente para Notas de
   Crédito (`PayMethods.tsx:11`).
5. Nota de Crédito exige `date_order`, `serie_order` (formato serie) y
   `reason` (mín. 3 caracteres); Factura no los exige y en su lugar puede
   mostrar `guia` (opcional, con formato) si el usuario tiene el permiso
   `guia_in_invoice`.
6. La sección "Reembolsos" solo aparece si el backend indica
   `repayment: true` en la carga de creación; cuando aparece, la suma de
   `base + iva` de todos los `repaymentTaxes` debe igualar el `total` de la
   factura (tolerancia 0.01), y no se permiten `authorization` duplicadas ni
   `iva_tax_code` duplicados dentro de un mismo reembolso.
7. Factura y Nota de Crédito llevan secuenciales independientes por punto de
   emisión (`selectPoint.invoice` vs `selectPoint.creditnote`).
8. El selector de punto de emisión solo se muestra en creación y si hay más
   de un punto disponible; en edición la serie no es editable.
9. Seleccionar un producto con `ice !== null` activa la columna ICE para
   toda la tabla de líneas (estado global, no por línea).
10. El módulo de ventas no replica ni exige la categoría SRI/`aux_cod` del
    producto — esa validación pertenece exclusivamente al módulo de
    productos.
11. "Consumidor Final" (identificación `9999999999999`) con total > $50 solo
    dispara una advertencia visual, no bloquea el envío.
12. El descuento del encabezado (`Totals.tsx`) puede editarse manualmente e
    independiente de los descuentos por línea de producto.
13. Placa obligatoria (`invoice.plate`) si algún ítem tiene `aux_cod` que
    empieza con `TRANSPORT_AUX_COD_PREFIX` (`'H49200'`); campo oculto en
    cualquier otro caso (§3.10).

## ⚠️ Observaciones

- **422 de Laravel no se muestra al usuario (`ButtonSubmit.tsx:111-118`).**
  `handleApiRequest` devuelve `{ errors }` (plural, `Record<string,string>`)
  en un 422 (`helpers/apiHandler.ts:26-35`), pero `ButtonSubmit.tsx` solo
  desestructura `{ data, error }` (singular) de la respuesta. Si el backend
  responde 422, ni `data` ni `error` existen, por lo que no entra a ninguna
  de las dos ramas: no se muestra ningún mensaje al usuario y, más grave,
  `setIsPending(false)` tampoco se ejecuta, dejando el botón "Guardar y
  procesar" bloqueado en estado de carga indefinidamente.

- **La sección de Reembolsos no está disponible en edición.**
  `orders/[id]/page.tsx` no importa ni renderiza `<Repayments />` (a
  diferencia de `orders/create/page.tsx`), y `FormInvoiceContext.tsx` tampoco
  popula `repayments`/`repayment` en la rama de `getInvoice`. Si un
  documento se creó con reembolsos, estos no son visibles ni editables al
  entrar a editarlo.

- **Cálculo de IVA por línea en modo desglose incompleto.**
  `ItemProduct.ivaCalculation()` (`ItemProduct.tsx:24-34`) solo calcula el
  IVA visible cuando `iva === 4` (15%) o `iva === 5` (5%); para líneas con
  `iva === 2` (12%) o `iva === 8` (8%) la función retorna `0`, aunque el
  total sí se calcula correctamente a nivel de factura en
  `useProductOutput.recalculate`. Esto puede mostrar "IVA: 0.00" en la
  columna de desglose para productos de 8% o 12% aun cuando sí generan
  impuesto.

- **Tabla de resultados (`Totals.tsx:44-49`) usa `base12` para la fila "IVA
  8%".**

  ```ts
  const ivaRows = [
      { label: 'IVA 5%', value: invoice.base5 * 0.05 },
      { label: 'IVA 8%', value: invoice.base12 * 0.08 },   // debería ser invoice.base8
      { label: 'IVA 12%', value: invoice.base12 * 0.12 },
      { label: 'IVA 15%', value: invoice.base15 * 0.15 },
  ].filter(item => item.value > 0);
  ```

  El monto real de IVA 8% (`invoice.iva8`, calculado correctamente en
  `useProductOutput.ts` como `base8 * 0.08`) nunca se usa en esta tabla; en
  su lugar se muestra `base12 * 0.08`, un valor sin sentido de negocio que
  además aparecerá simultáneamente con la fila "IVA 12%" cada vez que haya
  productos al 12% (ambas filas se activan con la misma condición
  `base12 > 0`). El total (`invoice.total`, en el `tfoot`) sí es correcto
  porque se calcula aparte en `useProductOutput`; solo el desglose visual de
  esta fila está mal.

- **Flag `tourism` sin uso.** Se obtiene del backend en `getCreateInvoice` y
  se guarda en el context (`FormInvoiceContext.tsx:20,88,131`), pero ningún
  componente lo lee para condicionar el formulario. Coincide con el
  comentario `// TODO Agregar Si es turismo` dejado en
  `hooks/useProductOutput.ts:70` — funcionalidad pendiente/inconclusa.

- **`ProductProps.atts.ice` tipado como `null` fijo.** En
  `types/product.d.ts:9` el campo está declarado literalmente como `ice:
  null`, pero `useProductOutput.selectProduct` depende de que a veces sea
  distinto de `null` (`if (product.atts.ice !== null) { ... }`) para activar
  la columna ICE. El tipo no refleja el contrato real usado en tiempo de
  ejecución.

- **Columna ICE no se desactiva.** `isActiveIce` se activa a `true` en
  cuanto se selecciona un producto con ICE (`useProductOutput.ts:66-69`),
  pero no se encontró código que la reponga a `false` si luego se elimina
  ese ítem (`removeItem`) — la columna ICE queda visible en toda la tabla
  aunque ya no haya ningún producto con ICE en la factura.

- **`point_id` hardcodeado en la importación masiva de facturas.**
  `useImportExcel.ts:10` envía siempre `formData.append("point_id", "1")`
  al importar un lote `.xlsx` vía `POST orders/lot`, sin relacionarlo con el
  punto de emisión seleccionado en el formulario ni con ningún selector en
  la UI (el input de archivo se dispara desde `orders/page.tsx:58` sin pedir
  punto de emisión).

- **Importación de ítems (`ImportItems.tsx`) reemplaza en vez de agregar.**
  `getMasive` hace `setProductOutputs(orderItems)` directamente
  (`ImportItems.tsx:51`), sobrescribiendo cualquier línea de producto que ya
  estuviera cargada manualmente en el formulario, en lugar de añadir los
  productos importados a la lista existente.

- **Campos declarados pero sin input en el formulario.** `expiration_days`
  (marcado "Eliminar" en el propio type), `description`, `received` y
  `doc_realeted` (marcados "Ver") existen en `OrderCreateProps` y viajan en
  el `form` enviado al backend con su valor inicial/heredado, pero no tienen
  ningún campo editable en `GeneralInformation.tsx` ni en el resto del
  formulario.

## Errores detectados

Lista consolidada de bugs. Los marcados con ✳️ ya estaban descritos en
§Observaciones y se resumen aquí para tener un único inventario; el resto se
detectaron en esta auditoría.

1. **Limpieza de errores con clave literal `name`** —
   `GeneralInformation.tsx:40`. `handleChange` hace
   `setFormErrors(prev => ({ ...prev, name: '' }))` usando la cadena literal
   `name` en vez de la clave computada `[name]` (el campo que cambió). Los
   errores de `voucher_type`, `guia`, `date_order`, `serie_order` y `reason`
   nunca se limpian al corregir el campo.
   *Escenario:* Nota de Crédito sin `reason`; al enviar, el schema marca
   "Motivo" en rojo (`formErrors.reason`). El usuario escribe el motivo, pero
   el borde/mensaje de error no desaparece porque se limpió una propiedad
   inexistente `name`; el error solo se recalcula al volver a enviar.

2. **Doble descuento al editar el descuento global** — `Totals.tsx:24-33`
   (`handleDiscountChange`). Las bases `base5/8/12/15` ya restan el descuento
   por línea en `useProductOutput.ts:111-114` (`price*quantity - discount`),
   por lo que `sub_total` y el `total` de `recalculate` **ya lo excluyen**. El
   input "Descuento" se inicializa con `invoice.discount = totalDiscount` (la
   suma de esos mismos descuentos de línea, `useProductOutput.ts:105,138`). Al
   editarlo, `total = sub_total + ice + ivas - parsed` (`Totals.tsx:27`) resta
   el descuento **otra vez** sobre un subtotal que ya lo tenía descontado.
   *Escenario:* una línea con descuento `10` → `sub_total` ya reducido en 10 y
   el campo muestra `"10"`; el usuario lo cambia a `"15"` → el `total` pierde
   15 adicionales (25 en total). Además, cualquier cambio posterior en un ítem
   dispara `recalculate`, que reescribe `discount = totalDiscount` y un `total`
   que ignora el descuento manual, borrando silenciosamente lo que el usuario
   había tecleado.

3. **División por cero al editar el subtotal con desglose** —
   `useProductOutput.ts:50`. Con `isTaxBreakdown` activo, editar `total_iva`
   de una línea cuya `quantity` es `0` (o `''`, que se normaliza a `0` en la
   línea 46) ejecuta `Number(value) / quantity / (1 + percentage/100)` →
   `Infinity`/`NaN`, dejando `price = Infinity`.
   *Escenario:* agregar producto, poner cantidad `0`, activar "Desglose",
   editar la celda "Subtotal" → el precio queda en `Infinity` y los totales
   siguientes se vuelven `NaN`.

4. **Mutación directa del estado en `useProductOutput`** —
   `useProductOutput.ts:18-19` (`updateItem`) y `59-72` (`selectProduct`):
   `const prods = productOutputs; prods[index][field] = value;` muta el array
   de estado en sitio y luego `recalculate` hace `setProductOutputs(prods)`
   con la **misma referencia**. React puede omitir el re-render de
   `productOutputs` (Object.is da `true`); hoy la UI se actualiza únicamente
   porque `setInvoice` crea un objeto nuevo en el mismo `recalculate`.
   *Escenario de riesgo:* cualquier cambio futuro que dependa solo de
   `productOutputs` (sin tocar `invoice`) no se reflejaría en pantalla.

5. **`id` compartido entre información adicional** —
   `AditionalInformation.tsx:12`. `const id = nanoid()` se genera una sola vez
   por render y se reutiliza dentro de `addItem`. Dos ítems agregados en el
   mismo ciclo de render comparten `id`, colisionando en la `key` de React y
   en el mapeo de errores `errorAditionalInformation[aditional.id]` (dos filas
   comparten el mismo cubo de errores). El `id` debería generarse **dentro** de
   `addItem`.

6. **Mutación del array `repaymentTaxes` al eliminar un impuesto** —
   `useItemRepaymentTaxes.ts:48`. `deleteItemRepaymentTax` hace
   `newList[indexRepayment].repaymentTaxes.splice(taxIndex, 1)`, pero el
   shallow copy `[...prev]` no clona ni el objeto `Repayment` ni su array
   `repaymentTaxes`; el `splice` muta la referencia del estado anterior
   directamente (a diferencia de `updateItemRepaymentTax`, que sí clona en
   profundidad).

7. **Error de validación de `repaymentTax` que nunca se muestra** —
   `repayment.schema.ts:4` exige `iva_tax_code: z.number()`, pero al elegir la
   opción "Seleccione..." (`ItemRepaymentTaxes.tsx:36`) el valor queda como
   `''` (string) y `updateItemRepaymentTax` lo conserva así
   (`useItemRepaymentTaxes.ts:39`). El error de Zod tiene path
   `repayments[i].repaymentTaxes[j].iva_tax_code`, pero `ButtonSubmit.tsx:74-84`
   solo mapea `path[2]` como campo del reembolso, así que el error de un
   `repaymentTax` no se asocia a ningún input y queda invisible; el submit
   simplemente no procede sin explicación en esa celda.

8. **`selectProduct` ignora el desglose activo** — `useProductOutput.ts:65`.
   Fija `total_iva = product.atts.price1` sin aplicar `(1 + percentage/100)`
   aunque `isTaxBreakdown` esté en `true`, mostrando un "Subtotal" sin IVA
   hasta el siguiente `recalculate`/toggle.

9. **Estado `EN_PROCESO` nunca recibe estilo en el listado** —
   `InvoicesTable.tsx:60` y `:67`. El tipo `states`
   (`types/general.d.ts:7`) define `'EN_PROCESO'` (con guion bajo) y el
   `Dropdown` usa esa forma, pero la tabla compara contra `"EN PROCESO"` (con
   espacio): `["NO AUTORIZADO", "EN PROCESO", "DEVUELTA"].includes(state)`. Un
   documento en `EN_PROCESO` nunca recibe el badge amarillo ni el tooltip de
   `extra_detail` porque la comparación falla siempre (misma cadena escrita de
   dos maneras distintas en el código).

10. ✳️ **422 de Laravel no se muestra al usuario** — `ButtonSubmit.tsx:111-118`
    desestructura solo `{ data, error }`, pero `handleApiRequest` devuelve
    `{ errors }` (plural) en un 422 (`helpers/apiHandler.ts:26-34`). En un 422
    no se muestra mensaje y `setIsPending(false)` no se ejecuta, dejando el
    botón bloqueado en "cargando" de forma indefinida.

11. ✳️ **Fila "IVA 8%" usa `base12`** — `Totals.tsx:46`
    (`{ label: 'IVA 8%', value: invoice.base12 * 0.08 }`, debería ser
    `invoice.iva8`/`base8`). Solo afecta el desglose visual; el `total` del
    `tfoot` es correcto.

12. ✳️ **`ivaCalculation()` incompleto** — `ItemProduct.tsx:24-34`: solo
    calcula el IVA de la columna de desglose para `iva === 4` (15%) y `iva === 5`
    (5%); para 12% (`iva === 2`) y 8% (`iva === 8`) muestra `0.00`.

13. ✳️ **Reembolsos no disponibles en edición** — `orders/[id]/page.tsx` no
    renderiza `<Repayments />` y `FormInvoiceContext.tsx:104-123` no popula
    `repayments`/`repayment` en la rama de edición.

14. ✳️ **Columna ICE no se desactiva** — `useProductOutput.ts:66-68` activa
    `isActiveIce` pero ningún camino la repone a `false` (ni `removeItem`).

15. ✳️ **`point_id` hardcodeado en import masivo** — `useImportExcel.ts:10`
    (`formData.append("point_id", "1")`).

16. ✳️ **`ImportItems` reemplaza en vez de agregar** — `ImportItems.tsx:51`
    (`setProductOutputs(orderItems)` sobrescribe las líneas ya cargadas).

## Puntos de mejora

1. **Extraer el cálculo de totales/impuestos a un helper puro y testeable.**
   Hoy `recalculate` mezcla cálculo con `setState` dentro del hook, lo que
   impide probar la lógica de IVA/ICE de forma aislada.
2. **Unificar la única fuente de verdad del `total`.** `recalculate` no resta
   el descuento y `Totals.handleDiscountChange` sí; deberían converger en una
   sola función para eliminar la desincronización de raíz (base de los bugs 2).
3. **Inmutabilidad en `updateItem`/`selectProduct`.** Trabajar sobre copias
   (`map`/spread) en lugar de mutar `productOutputs` en sitio.
4. **Tipar `ProductProps.atts.ice` como `number | null`** (`types/product.d.ts:9`
   lo declara como `null` fijo, contradiciendo el uso real en `selectProduct`).
5. **Reemplazar `document.querySelector('input[type="file"]')`** en
   `ImportItems.tsx:12` y `orders/page.tsx:18` por un `useRef`, para no depender
   del primer input del DOM.
6. **Deduplicar el mapeo de errores en `ButtonSubmit.tsx:54-103`** (tres
   bloques casi idénticos para `products`, `repayments` y `aditionals`) con un
   helper `mapArrayErrors(errors, path, items)`.
7. **`point_id` del import masivo debería venir de un selector**, no del
   hardcode `"1"` (`useImportExcel.ts:10`).
8. **Revisar el naming de permisos** `import_in_invoice` (singular, usado en
   `ListProducts`/`ImportItems`) vs `import_in_invoices` (plural, usado en
   `orders/page.tsx:25`): son dos flags distintos y conviene confirmar que la
   diferencia es intencional.
9. **Sustituir los `alert()`** de `Dropdown.tsx` y `AditionalInformation.tsx`
   por el sistema de notificaciones/UI consistente del resto de la app.
10. **Limpiar campos muertos** del type/formulario: `expiration_days`,
    `received`, `doc_realeted`, `description` y el flag `tourism` sin uso.
11. **Reset de `isActiveIce`** al eliminar el último ítem con ICE (relacionado
    con el bug 14).
12. **`ItemProduct` y `Totals` son componentes grandes que mezclan cálculo con
    UI**; extraer hooks/helpers (`ivaCalculation`, formateo de filas) mejoraría
    la testabilidad y reduciría duplicación con `useProductOutput`.
