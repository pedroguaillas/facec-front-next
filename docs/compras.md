# Módulo Compras

Documentación funcional del listado y formulario de creación/edición de
compras (comprobantes de compra: Factura, Nota de Venta, Liquidación en
Compra, Nota de Débito) y su retención asociada.

Ubicación del código: `app/(route)/shops/`. El nombre de carpeta ("shops")
es un remanente histórico mal nombrado — el título que se muestra en
pantalla es **"Compras"**, confirmado en `app/(route)/shops/page.tsx:32`:

```tsx
<Title
    title="Compras"
    subTitle="Lista de todas las compras"
    ...
/>
```

Las rutas de backend consumidas también usan el prefijo `shops` (`shops`,
`shops/create`, `shops/:id`), ver `app/(route)/shops/services/shopsServices.ts`.

## Estructura del módulo

```
shops/
  page.tsx                    # Listado de compras
  create/page.tsx             # Crear compra
  [id]/page.tsx                # Editar compra
  components/                 # ShopsTable, ShopFilters, Dropdown (listado)
  context/
    ShopsContext.tsx          # Estado del listado (paginado + búsqueda)
    FormShopContext.tsx       # Estado del formulario (useReducer)
  hooks/
    useGeneralInformation.ts
    useListProducts.ts
    useSelectPoint.ts
    useTaxes.ts
    useFile.ts                 # Parseo de XML del SRI
  services/shopsServices.ts
  shared/                      # Bloques del formulario
```

## Entidad principal `ShopCreateProps`

Definida en `types/shop.d.ts:26-51`.

| Campo              | Tipo                | Notas                                                                 |
|---------------------|---------------------|------------------------------------------------------------------------|
| `serie`             | `string`             | Formato `NNN-NNN-NNNNNNNNN`; editable a mano salvo en Liquidación (se calcula) |
| `date`               | `string`             | Fecha de emisión; `min` = `getMinDate()`, `max` = hoy                  |
| `authorization`      | `string`             | Requerida (≥10 caracteres) salvo en Liquidación en Compra              |
| `expiration_days`    | `number`             | Presente en el estado inicial, no se renderiza ni se valida en el schema (ver Observaciones) |
| `voucher_type`       | `number`             | 1 Factura, 2 Nota Venta, 3 Liquidación en Compra, 5 Nota Débito (`constants/voucherTypes.ts`) — **flag central** que reconfigura casi todo el formulario |
| `provider_id`        | `number`             | Requerido (`min(1)`); se llena vía `SelectProvider` o importación XML  |
| `no_iva`, `base0`, `base5`, `base12`, `base15` | `number` | Bases imponibles por tarifa                       |
| `iva`, `iva5`, `iva15` | `number`           | Montos de impuesto calculados (12%, 5%, 15% respectivamente)           |
| `sub_total`, `total`, `discount`, `ice` | `number` | Totales; `discount` e `ice` solo se pueblan por XML, no son editables en UI |
| `description`        | `null`               | Presente en el estado inicial, sin uso visible en el formulario (ver Observaciones) |
| `serie_retencion`    | `string?`            | Solo si `applieWithholding`; se calcula desde el punto de emisión      |
| `date_retention`     | `string?`            | Solo si `applieWithholding`; validado contra `date` y la fecha actual  |
| `state_retencion`    | `string?`            | Solo en edición; si es `'AUTORIZADO'` se oculta el botón de envío      |

Entidades relacionadas usadas en el formulario:

- **`ProductOutput`** (`types/order.d.ts:63-75`): ítems de producto/servicio, solo aplican cuando `voucher_type === LIQUIDATION`.
- **`Tax`** (`types/shop.d.ts:60-68`): filas de retención (impuesto retenido).
- **`TaxInput`** (`types/shop.d.ts:53-58`): catálogo de conceptos de retención (`code`, `conception`, `porcentage`, `type: 'iva' | 'renta'`).
- **`EmisionPoint`** (`types/general.d.ts:13-24`): punto de emisión con contadores `retention` y `settlementonpurchase` usados para armar series.

## Carga inicial del formulario

`FormShopContext.tsx:142-183` decide la carga según si hay `params.id`:

- **Edición** (`getShop(axiosAuth, id)` → `shops/:id`): trae `shop`,
  `provider`, `shopretentionitems` (retenciones ya guardadas → alimenta
  `applieWithholding = shopretentionitems.length > 0` y `taxes`),
  `taxes` (catálogo de conceptos → `taxInputs`) y `shop_items` (→
  `productOutputs`, recalculando `total_iva = price * quantity`).
- **Creación** (`getCreateShop(axiosAuth)` → `shops/create`): trae
  únicamente `{ points, taxes }` (`services/shopsServices.ts:10-14`):
  - `points`: catálogo de puntos de emisión (`EmisionPoint[]`).
  - `taxes`: catálogo de conceptos de retención (`TaxInput[]`), usado por
    el modal `ModalSelectRetention`.

**Proveedores y productos NO se precargan.** Se buscan bajo demanda
mediante modales paginados que golpean el backend en cada apertura:

- `SelectProvider` → `useModalSelectProvider.ts:27-42` → `GET providers?page=N` con `params: { search, paginate: 10 }`, solo al abrir el modal (`useEffect` en `isOpen`).
- `SelectProduct` → `useModalSelectProduct.ts:27-45` → `GET products?page=N` con la misma lógica.

## Lógica condicional importante

### 1. Selección de proveedor y cómo afecta el formulario

Dos caminos para fijar `provider_id` / `selectProvider`:

**a) Selección manual** (`GeneralInformation.tsx:52-53` → `SelectProvider`):
al elegir en el modal, `handleSelectProvider` (`hooks/useGeneralInformation.ts:27-33`)
solo setea `shop.provider_id` y limpia el error; no dispara ningún otro
efecto colateral.

**b) Importación de XML** (`shared/ImportXml.tsx`, solo visible cuando
`voucher_type === VoucherType.INVOICE`, ver `GeneralInformation.tsx:66`):

```tsx
{Number(shop.voucher_type) === VoucherType.INVOICE && <ImportXml />}
```

Flujo (`ImportXml.tsx:38-96`):

1. Se lee el XML, se extrae `ruc` (`identificacion del emisor`) y `claveAcceso` (autorización).
2. `resolveSupplier(axiosAuth, ruc)` consulta si el proveedor ya existe.
3. Si `existing.branch_id` es truthy (ya está en la BD local) → se
   autoselecciona el proveedor y se rellenan los campos financieros del
   XML vía `useFile().selectDocXml` — **no se abre ningún modal**.
4. Si no existe localmente (`branch_id === 0`, vino solo del SRI, o no
   existe) → se rellenan igual los campos financieros, pero se abre
   `ModalConfirmSupplier` con los datos sugeridos (RUC, razón social,
   dirección) para que el usuario los confirme/complete y los persista
   con `storeSupplier` antes de asignarlos a `provider_id`.
5. `ModalConfirmSupplier` valida con `supplierSchema` (Zod) antes de
   guardar (`shared/ModalConfirmSupplier.tsx:43-58`).

> El chequeo de que el `codDoc` del XML coincida con el `voucher_type`
> seleccionado está **comentado** (`ImportXml.tsx:53-57`) — ver
> Observaciones.

### 2. Tipo de comprobante (`voucher_type`) — flag central

`VoucherType` (`constants/voucherTypes.ts`): `INVOICE=1`, `SALES_NOTE=2`,
`LIQUIDATION=3`, `DEBIT_NOTE=5`.

| Condición | Efecto |
|---|---|
| `voucher_type === LIQUIDATION` | `GeneralInformation`: serie se muestra de solo lectura (calculada); si `points.length > 1` aparece un select "Punto Emi" (`emision_point_id`) |
| `voucher_type === LIQUIDATION` | `ListProducts` se renderiza (tabla de productos/servicios); en cualquier otro caso retorna `null` (`ListProducts.tsx:14-16`) |
| `voucher_type === LIQUIDATION` | `Totals`: bases (`base0`, `base5`, `base15`) y "No objeto de IVA" se muestran de solo lectura (calculadas desde los productos) |
| `voucher_type !== LIQUIDATION` | `GeneralInformation`: "N° de serie" es un `TextInput` editable (regex `^\d{3}-\d{3}-\d{9}$`) y "Autorización" es requerida |
| `voucher_type !== LIQUIDATION` | `Totals`: bases y "No objeto de IVA" son inputs numéricos editables |
| `voucher_type === INVOICE` | Aparece el botón "Cargar XML" (`ImportXml`) |
| `voucher_type` cambia a `LIQUIDATION` y `productOutputs` está vacío | `useGeneralInformation.ts:35-44` inserta automáticamente una fila inicial de producto |
| `voucher_type !== LIQUIDATION` y cambia `selectPoint` | `useSelectPoint.ts:16-20` vacía `productOutputs` (`setProductOutputs([])`) — ver Observaciones |

Validaciones condicionales en `schemas/shop-schema.ts`:

```ts
// Solo requerido si es LIQUIDATION
.refine((data) => {
  if (data.voucher_type === VoucherType.LIQUIDATION) {
    return data.products && data.products.length > 0;
  }
  return true;
}, { message: 'Agregue al menos un producto', path: ['products'] })

// Si NO es liquidación, authorization es requerida y mínima de 10 caracteres
.refine((data) => {
  if (data.voucher_type !== VoucherType.LIQUIDATION) {
    return data.authorization && data.authorization.length >= 10;
  }
  return true;
}, { message: 'Ingrese un número de autorización válido', path: ['authorization'] })
```

### 3. Cálculo de totales/impuestos

Dos motores de cálculo distintos según `voucher_type`:

**a) Modo Liquidación** (`hooks/useListProducts.ts:47-72`, se dispara al
agregar/editar/borrar un ítem de producto):

```ts
products.forEach(({ iva, total_iva }) => {
    if (iva === 0) base0 += Number(total_iva);
    if (iva === 4) base15 += Number(total_iva);
});
const subTotal = base0 + base15;
const totalIva = Number((base15 * 0.15).toFixed(2));
const total = Number((subTotal + totalIva).toFixed(2));
```

Solo clasifica los códigos de IVA `0` (0%) y `4` (15%); otros códigos de
producto (p.ej. `2`=12%, `5`=5%) no se suman a ninguna base — ver
Observaciones.

> **Ojo con la semántica del campo `iva`.** Este motor guarda el monto del
> 15% en `shop.iva` (`useListProducts.ts:69`, `iva: totalIva`), mientras que
> el motor manual/XML usa `shop.iva` para el 12% y `shop.iva15` para el 15%
> (`Totals.tsx:27,29` / `useFile.ts:44,48`). Es decir, el mismo campo
> `shop.iva` significa cosas distintas según el tipo de comprobante, y en
> Liquidación `shop.iva15` nunca se puebla (queda en 0). Ver *Errores
> detectados*. Además `calculateTotals` solo escribe
> `base0/base15/sub_total/iva/total`: no toca `no_iva`, `base5`, `iva5`,
> `iva15` ni `base12`, por lo que valores previos (de un cambio de tipo o de
> un XML importado antes) quedan como estado muerto pero viajan en el
> payload.

**b) Modo manual (Factura / Nota Venta / Nota Débito)**
(`shared/Totals.tsx:15-35`, se dispara al editar cualquier base):

```ts
form.iva = Number((Number(form.base12) * 0.12).toFixed(2));
form.iva5 = Number((Number(form.base5) * 0.05).toFixed(2));
form.iva15 = Number((Number(form.base15) * 0.15).toFixed(2));
form.sub_total = Number(form.no_iva) + Number(form.base0) + Number(form.base5) + Number(form.base12) + Number(form.base15);
form.total = Number(form.base0) + Number(form.base5) + Number(form.base12) + Number(form.base15) + Number(form.iva) + Number(form.iva5) + Number(form.iva15);
```

La fila "Subtotal 12%"/"IVA 12%" está **comentada en la UI**
(`Totals.tsx:40,46`), pero `base12`/`iva` siguen participando en las
fórmulas — solo alcanzable hoy vía importación de XML (`useFile.ts`,
`codigoPorcentaje === 2`).

**c) Importación de XML** (`hooks/useFile.ts:30-61`): mapea
`codigoPorcentaje` del SRI a los campos del formulario:

| `codigoPorcentaje` | Campo destino |
|---|---|
| `0` | `base0` |
| `2` | `base12` + `iva` |
| `4` | `base15` + `iva15` |
| `5` | `base5` + `iva5` |
| `6` | `no_iva` |
| otro, con `codigo === 3` | `ice` |

### 4. Retenciones (`applieWithholding`)

Checkbox "Aplicar Retención" (`shared/RetentionInformation.tsx:36`)
controla la visibilidad de todo el bloque de retención y de la tabla de
impuestos (`ListTaxes.tsx:13`: `if (!applieWithholding) return null;`).

- Si `points.length > 1` y está activado → select "Punto Emi" para elegir
  el punto que define `serie_retencion`.
- `serie_retencion` se calcula (no es editable a mano) a partir del
  contador `retention` del punto seleccionado, con padding a 9 dígitos
  (`useSelectPoint.ts:22-24` y `:44-49` para autoselección cuando solo hay
  un punto).
- `date_retention` tiene `min = shop.date` y `max = hoy` en el input, y
  además el schema exige que esté dentro de ese rango:

```ts
.refine((data) => {
  if (data.taxes && data.taxes.length > 0) {
    if (!data.date_retention) return false;
    const retentionDate = parseLocalDate(data.date_retention);
    const mainDate = parseLocalDate(data.date);
    const today = new Date(); today.setHours(0,0,0,0);
    return retentionDate >= mainDate && retentionDate <= today;
  }
  return true;
}, { message: '...', path: ['date_retention'] })
```

- El schema también exige `serie_retencion` si `taxes.length > 0`.
- Cada fila de retención (`ItemTax.tsx`): un `select` de impuesto (`2`=IVA,
  `1`=Imp. Renta) habilita el botón `SelectRetention`, que abre
  `ModalSelectRetention` filtrando el catálogo `taxInputs` por
  `type: code === 2 ? 'iva' : 'renta'` y por texto de búsqueda
  (`ModalSelectRetention.tsx:21-25`).
- Al elegir una retención (`useTaxes.ts:55-74`): `tax_code = retention.code`,
  `porcentage = retention.porcentage`, y `editable_porcentage =
  retention.porcentage === null` (si el catálogo no trae porcentaje fijo,
  el usuario puede escribirlo).
- `value` se recalcula automáticamente cuando hay `porcentage` y `base`:
  `value = porcentage * base * 0.01` (`useTaxes.ts:29-33`).
- Pie de tabla "Total retenido" = suma de `tax.value` de todas las filas.
- Si el usuario **desmarca** "Aplicar Retención" justo antes de enviar,
  `SubmitButton.tsx:32-36` fuerza `serie_retencion`/`date_retention` fuera
  del payload y `taxes = []`, sin importar lo que hubiera cargado antes.
- En edición, si `shop.state_retencion === 'AUTORIZADO'` el botón de envío
  se oculta por completo (`SubmitButton.tsx:87-89`) — ya no se puede
  modificar un comprobante con retención autorizada.

### 5. Puntos de emisión

- `points` viene del catálogo `getCreateShop`/`getShop`.
- Si `points.length === 1` se autoselecciona en la carga
  (`useSelectPoint.ts:39-50`) y se precalcula `serie_retencion`.
- Si `points.length > 1`, el usuario elige manualmente tanto para la
  serie principal (solo en Liquidación) como para la serie de retención
  (solo si `applieWithholding`).
- `EmisionPoint.settlementonpurchase` alimenta la serie de Liquidación;
  `EmisionPoint.retention` alimenta la serie de retención — ambos con
  padding a 9 dígitos.

### 6. Otras condiciones de visibilidad

- Fila "Monto ICE" en `Totals` solo se muestra si `shop.ice > 0`
  (`Totals.tsx:103`); `ice` solo se puebla desde XML (código `3`).
- "Descuento" se muestra pero nunca es editable manualmente en el
  formulario (solo llega por XML, `totalDescuento`); hay un `TODO`
  pendiente sobre el formateo (`Totals.tsx:109`).

## Envío del formulario (`shared/SubmitButton.tsx`)

1. Arma el payload:
   ```ts
   const form = {
     ...shop,
     products: productOutputs,
     taxes,
     app_retention: applieWithholding,
     send: send,          // false = "Guardar", true = "Guardar y procesar"
     point_id: selectPoint?.id,
   };
   if (!applieWithholding) {
     delete form.serie_retencion;
     delete form.date_retention;
     form.taxes = [];
   }
   ```
2. Valida con `shopSchema.safeParse(form)`. Si falla:
   - Errores de nivel raíz → `setErrorShop`.
   - Errores anidados en `taxes[i].campo` → se remapean a
     `errorTaxes[taxId][campo]` usando el `id` (nanoid) de cada fila,
     para que `ItemTax` pinte el error en la fila correcta.
   - Corta la ejecución (no llama al backend).
3. Si es válido: `params?.id` presente → `shopUpdateService` (`PUT
   shops/:id`); si no → `shopStoreService` (`POST shops`).
4. Respuesta (`handleApiRequest` → `ApiResponse<T>`):
   - `data` → `router.push('/shops')`.
   - `errors` (422 de Laravel) → `setErrorShop(errors)`.
   - `error` genérico → `alert(error)`.
5. Hay dos botones que solo difieren en el flag `send` enviado al
   backend: "Guardar" (`send: false`) vs "Guardar y procesar" (`send:
   true`, con spinner mientras `isPending`).

## Resumen de reglas de negocio confirmadas

1. El título visible del módulo es "Compras"; el código vive en `shops/`
   por razones históricas.
2. `voucher_type` es el flag que más reconfigura el formulario: determina
   si la serie es editable o calculada, si aparece la tabla de
   productos/servicios, si las bases de `Totals` son editables o
   calculadas, y si es obligatoria la `authorization`.
3. Solo `voucher_type === LIQUIDATION (3)` usa la tabla de
   productos/servicios; para ese caso el schema exige al menos un
   producto.
4. Para cualquier otro `voucher_type`, `authorization` es obligatoria
   (≥10 caracteres).
5. Proveedores y productos se buscan bajo demanda vía modales paginados;
   no hay catálogos precargados de proveedores/productos en la carga
   inicial del formulario (a diferencia de `points` y `taxes`, que sí se
   precargan).
6. La importación de XML (solo visible en Factura) autocompleta montos,
   serie, autorización y proveedor; si el proveedor no existe localmente,
   obliga a confirmarlo/crearlo mediante un modal antes de continuar.
7. La retención es un bloque opcional (`applieWithholding`) que, si está
   activo, exige `serie_retencion`, `date_retention` (dentro de un rango
   válido) y al menos una fila de impuesto retenido válida.
8. Si se desactiva "Aplicar Retención" antes de enviar, los datos de
   retención se descartan del payload sin importar lo que se haya
   ingresado previamente.
9. Un comprobante con retención `AUTORIZADO` ya no puede editarse: el
   botón de envío desaparece por completo.
10. Los puntos de emisión con una sola opción se autoseleccionan; con más
    de una, el usuario debe elegir manualmente (tanto para la serie
    principal en Liquidación como para la serie de retención).

## ⚠️ Observaciones

- **Cálculo de totales incompleto en modo Liquidación**
  (`hooks/useListProducts.ts:47-58`): `calculateTotals` solo suma a
  `base0`/`base15` los productos con `iva === 0` o `iva === 4`. Un
  producto con código de IVA `2` (12%) o `5` (5%) queda con su
  `total_iva` visible en la fila pero **no se refleja** en `sub_total`,
  `iva` ni `total` del comprobante. El modo manual (`Totals.tsx`) sí
  contempla 12% y 5%, por lo que hay una inconsistencia entre ambos
  motores de cálculo.
- **Campos `expiration_days` y `description`** (`types/shop.d.ts:29,44`,
  inicializados en `context/FormShopContext.tsx:70,84`) no se renderizan
  en ningún componente del formulario ni se validan en `shopSchema` —
  parecen campos muertos heredados del estado inicial.
- **Chequeo de tipo de comprobante en XML deshabilitado**
  (`shared/ImportXml.tsx:53-57`): el código que compararía el `codDoc`
  del XML con el `voucher_type` seleccionado está comentado, por lo que
  hoy se puede importar un XML de un tipo de comprobante distinto al
  seleccionado sin ninguna advertencia.
- **Comentario desactualizado en el schema** (`schemas/shop-schema.ts:14`):
  dice `// 1 = Factura, 3 = Liquidación en compra, 4 = Nota de crédito`,
  pero `VoucherType` no define ningún valor `4`; los valores reales son
  `1, 2, 3, 5` (`constants/voucherTypes.ts`). El comentario no coincide
  con el enum vigente.
- **Fila "Subtotal 12%" comentada mantiene datos vivos**
  (`shared/Totals.tsx:40,46`): la UI oculta la edición de `base12`/IVA
  12%, pero el campo sigue en el tipo, el schema y las fórmulas de
  cálculo; solo es alcanzable importando un XML con esa tarifa, lo que
  puede confundir si negocio no espera que ese campo participe.
- **`useSelectPoint.ts:16-20`**: para cualquier `voucher_type` distinto de
  Liquidación, cada cambio de `selectPoint` limpia `productOutputs`
  (`setProductOutputs([])`), aunque esa lista no se usa ni se muestra
  para esos tipos de comprobante (`ListProducts` retorna `null`). No es
  un bug visible, pero es una llamada sin efecto práctico.
- **Prefijos de comprobante duplicados** (`components/ShopsTable.tsx:25-30`):
  el listado define su propio mapa `{1:'FAC',2:'N/V',3:'L/C',5:'N/D'}`
  para las etiquetas de documento, en vez de reutilizar
  `VoucherType`/`invoiceTypes` (`hooks/useGeneralInformation.ts:11-16`).
  Si se agrega o cambia un tipo de comprobante, hay que actualizar ambos
  lugares.
- **Literal mágico en `Dropdown.tsx:189`**: `shop.atts.voucher_type === 3`
  se compara contra el número crudo en vez de `VoucherType.LIQUIDATION`,
  inconsistente con el resto del módulo que sí usa el enum.

## Errores detectados

Hallazgos de auditoría con escenario de falla concreto. Los tres primeros
son bugs de estado que se disparan al **cambiar de tipo de comprobante en
mitad de la carga**; ni `productOutputs` ni los totales se recalculan/limpian
en ese cambio.

1. **Productos "fantasma" en el payload de comprobantes que no son
   Liquidación** (`shared/SubmitButton.tsx:25` + `hooks/useGeneralInformation.ts:35-44`).
   `SubmitButton` siempre arma `products: productOutputs`, sin condicionar al
   `voucher_type`. Nada limpia `productOutputs` al **salir** de Liquidación:
   `useGeneralInformation` solo *agrega* una fila cuando el tipo pasa a
   Liquidación, y `useSelectPoint.ts:19` solo la vacía cuando cambia el punto
   de emisión (no cuando cambia el tipo).
   - **Escenario:** creo una Liquidación, agrego 2 productos, luego cambio el
     "Tipo de comprobante" a Factura y guardo. `ListProducts` deja de
     renderizarse (`ListProducts.tsx:14`), pero las 2 filas siguen en
     `productOutputs` y se envían al backend como `products` de una Factura.
     El schema no lo impide (solo exige productos *si* es Liquidación, no
     prohíbe enviarlos en otros casos).

2. **Totales obsoletos al cambiar `voucher_type`** (`shared/Totals.tsx` +
   `hooks/useListProducts.ts:47`). Los dos motores de cálculo solo se
   disparan por sus propios eventos (editar una base en modo manual, o
   agregar/editar/borrar un producto en modo Liquidación). Cambiar el tipo de
   comprobante no recalcula nada.
   - **Escenario A:** en Factura escribo `base15 = 100` (total pasa a 115).
     Cambio a Liquidación: `Totals` muestra las bases en solo lectura con el
     `100`/`115` heredados del modo manual, aunque no hay ningún producto que
     los respalde. Persisten hasta que edito un producto y recién ahí
     `calculateTotals` los pisa.
   - **Escenario B:** al revés (Liquidación → Factura), las bases calculadas
     desde productos quedan como valores iniciales de inputs editables, y
     `no_iva/base5/iva5/iva15` mantienen lo que hubieran tenido.

3. **`shop.iva` con doble significado según el tipo** (`hooks/useListProducts.ts:69`
   vs `shared/Totals.tsx:27`, `hooks/useFile.ts:44`). En Liquidación el monto
   del **15%** se guarda en `shop.iva`; en modo manual/XML `shop.iva` es el
   **12%** y el 15% va en `shop.iva15`. En Liquidación `shop.iva15` queda
   siempre en 0.
   - **Escenario:** una Liquidación con productos al 15% envía su IVA en el
     campo `iva` y `iva15 = 0`; si el backend interpreta `iva` como tarifa
     12% (como hace el resto del formulario), el impuesto queda mal
     clasificado. Requiere confirmar el mapeo del backend, pero la
     inconsistencia de nombres es real en el frontend.

4. **Cálculo incompleto en Liquidación (5%, 12%, no objeto de IVA)**
   (`hooks/useListProducts.ts:51-58`). `calculateTotals` solo acumula
   `iva === 0` e `iva === 4`. Un producto con IVA 5% (`5`), 12% (`2`) o "no
   objeto" (`6`) muestra su `total_iva` en la fila pero **no** entra en
   `sub_total`/`iva`/`total`.
   - **Escenario:** Liquidación con un producto al 5%; la fila muestra el
     subtotal, pero el TOTAL del comprobante lo ignora → total menor al real.

5. **Comparación de código de IVA sensible a string vs number en edición**
   (`hooks/useListProducts.ts:52,55`). `calculateTotals` compara con `===`
   estricto (`iva === 0`, `iva === 4`). Los ítems recién seleccionados traen
   `iva` numérico (`product.iva.code`, `ProductProps.iva.code: number`), pero
   los ítems cargados en **edición** se arman con `...item` desde
   `data.shop_items` (`context/FormShopContext.tsx:167-171`) sin castear
   `iva`.
   - **Escenario:** si el backend serializa `iva` como string (`"4"`), al
     abrir una Liquidación existente y editar cualquier cantidad/precio,
     `"4" === 4` es `false` → esa línea deja de sumar a `base15` y el total se
     recalcula hacia abajo. (Confianza media: depende del tipo real que
     devuelva el backend.)

6. **Fecha de emisión importada desde XML puede quedar fuera de rango**
   (`hooks/useFile.ts:69` + `schemas/shop-schema.ts:9`). `selectDocXml` setea
   `date` directamente desde el XML, saltándose el `min={getMinDate()}` /
   `max` del input. El schema solo valida `date` no vacía.
   - **Escenario:** importar un XML con `fechaEmision` de hace meses deja una
     `date` anterior a `getMinDate()` que pasa la validación del frontend.

7. **Reimportar el mismo archivo XML no dispara `onChange`**
   (`shared/ImportXml.tsx:20-31`). `handleSelectFile` no resetea
   `input.value` tras leer. El navegador no emite `change` si se elige el
   mismo archivo dos veces seguidas.
   - **Escenario:** importo un XML, el modal de proveedor se cierra sin
     guardar, e intento reimportar el mismo archivo: no pasa nada hasta elegir
     otro archivo distinto.

## Puntos de mejora

- **Extraer la lógica de cálculo a un helper único compartido.** Hoy existen
  tres motores desalineados (`useListProducts.calculateTotals`,
  `Totals.handleChange`, `useFile.selectDocXml`) que clasifican tarifas de
  IVA de forma distinta e incompleta. Unificar en una sola función
  `computeTotals(bases)` eliminaría los bugs 3 y 4 de raíz.
- **Resetear estado al cambiar `voucher_type`.** Un efecto o reducer que, al
  cambiar de tipo, limpie `productOutputs` y recalcule/limpie las bases
  evitaría los bugs 1 y 2.
- **Tipar y castear los códigos de IVA de forma consistente.** `Tax.code`
  está tipado `'' | number` pero `ItemTax` guarda el `value` del `<select>`
  como string; `ProductOutput.iva` es `undefined | number` pero en edición
  llega sin castear. Normalizar con `Number()` en el punto de entrada.
- **Usar el enum `VoucherType` en todas partes.** Persisten literales crudos
  (`Dropdown.tsx:189`, `useFile.ts` `tv === 1`) y el mapa duplicado de
  prefijos en `ShopsTable.tsx:25-30`.
- ~~**Tipar y castear los códigos de IVA de forma consistente.**~~ Corregido:
  `Tax.code` era `'' | number` y viajaba como número al backend cuando venía
  de una compra existente (`data.shopretentionitems` sin castear en
  `FormShopContext.tsx`), causando 422 `"The taxes.0.code field must be a
  string."` al editar. Ahora `Tax.code` es `string` (`types/shop.d.ts`), se
  fuerza `code: String(item.code)` al cargar `shopretentionitems`
  (`FormShopContext.tsx`), y `taxSchema.code` valida `z.string()` en vez de
  `z.coerce.number()` (`schemas/tax.schema.ts`). Las filas nuevas ya
  llegaban como string desde el `<select>` de `ItemTax.tsx`, así que solo
  afectaba compras **editadas** con retenciones ya guardadas.
- **Usar actualizaciones funcionales en `useTaxes`.** `updateItem`,
  `selectRetention` y `deleteItem` leen `taxes` del closure del render en vez
  de `setTaxes(prev => ...)`, lo que abre la puerta a estado obsoleto si se
  encadenan cambios antes de un re-render.
- **Eliminar campos muertos y código comentado.** `expiration_days`,
  `description`, la fila "Subtotal 12%" comentada y el chequeo de `codDoc`
  comentado (`ImportXml.tsx:53-57`) confunden sobre qué participa realmente.
- **Deduplicar la selección de "Punto Emi".** En Liquidación con retención y
  más de un punto se renderizan dos selectores (`GeneralInformation` y
  `RetentionInformation`) que manejan el mismo `selectPoint` con `name` y
  `error` distintos.
- **Unificar con Ventas.** Los patrones de contexto+reducer, modales
  paginados de proveedor/producto, cálculo de totales y bloque de retención
  son casi idénticos a los de `docs/ventas.md`; conviene extraer hooks y
  componentes compartidos (`useTotals`, `useSelectPoint`, `ListTaxes`) a un
  módulo común en vez de mantener dos copias divergentes.
