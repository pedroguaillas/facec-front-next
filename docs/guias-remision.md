# Módulo Guías de Remisión

Documentación funcional del listado y formulario de creación/edición de guías
de remisión.
Ubicación del código: `app/(route)/referralguides/`.

```
app/(route)/referralguides/
  page.tsx                          # Listado
  create/page.tsx                   # Creación
  [id]/page.tsx                     # Edición
  components/
    Dropdown.tsx                    # Acciones por fila (firmar/enviar/autorizar/anular, pdf, xml, mail)
    ReferrralGuidesList.tsx         # Tabla del listado
  context/
    ReferralGuidesContext.tsx       # Estado del listado (paginación)
    FormReferralGuideContext.tsx    # Estado del formulario create/edit
  hooks/
    useGeneralInformation.ts        # Handlers de los campos de cabecera
    useListProducts.ts              # Handlers de las líneas de producto
    useSelectPoint.ts               # Autoselección/generación de la serie
  services/
    referralGuidesServices.ts       # getReferralGuides, getCreateReferralGuide, getReferralGuide
  shared/
    GeneralInformation.tsx          # Sección "Datos generales" + "Comprobante sustento"
    ListProducts.tsx / ItemProduct.tsx  # Tabla de mercadería trasladada
    ButtonSubmit.tsx                # Validación y envío (store/update)
```

## Entidad principal

### Cabecera — `ReferralGuideCreateProps` (`types/referral-guide.d.ts:19-34`)

| Campo                    | Tipo      | Notas |
|---------------------------|-----------|-------|
| `serie`                   | `string`  | Formato `000-000-000000000` (punto-establecimiento-número), se autogenera al elegir el punto de emisión. Valor inicial: literal `'Cree un punto de emisión'` (`context/FormReferralGuideContext.tsx:38`) |
| `date_start`               | `string`  | Fecha de inicio del traslado. Default: fecha actual (`getDate()`) |
| `date_end`                 | `string`  | Fecha fin del traslado. Default: fecha actual |
| `carrier_id`               | `number`  | Id del transportista seleccionado |
| `customer_id`               | `number`  | Id del destinatario/cliente |
| `address_from`             | `string`  | Dirección de partida, requerido, máx. 300 |
| `address_to`               | `string`  | Dirección destino, requerido, máx. 300 |
| `reason_transfer`          | `string`  | Motivo del traslado — **texto libre**, requerido, máx. 300 (no hay catálogo de motivos) |
| `branch_destiny?`          | `string`  | Código de establecimiento destino, máx. 3, opcional |
| `customs_doc?`             | `string`  | Documento aduanero, máx. 17, opcional |
| `route?`                   | `string`  | Ruta, máx. 300, opcional |
| `serie_invoice?`           | `string`  | Serie de la factura sustento, máx. 17, opcional — **texto libre**, no se relaciona con un pedido/factura real del sistema |
| `date_invoice?`            | `string`  | Fecha de autorización de la factura sustento, opcional (con `max` = `getMinDate()`) |
| `authorization_invoice?`   | `string`  | N° de autorización de la factura sustento, máx. 49, opcional |

Campos que se agregan sólo en el payload de envío (no forman parte de
`ReferralGuideCreateProps`): `products` (líneas), `point_id` (id del punto de
emisión seleccionado) y `send` (`true` fijo) — ver `shared/ButtonSubmit.tsx:20-25`.

### Línea de producto — `ProductOutput` (`types/order.d.ts:63-75`, reutilizado desde el módulo `orders`)

| Campo         | Tipo                  | Notas |
|---------------|------------------------|-------|
| `id`          | `string`               | Generado con `nanoid()` en el cliente, solo para key/tracking en UI |
| `product_id`  | `number`               | Requerido (`min(1)`), se llena al elegir producto en el modal `SelectProduct` |
| `quantity`    | `number \| string`     | Requerido, `>= 0`. Único campo de línea editable además de `product_id` |
| `price`       | `number \| string`     | Nunca se edita en este formulario; queda en el valor inicial (`0`) |
| `stock`       | `number`               | Valor inicial `1`, no editable en este formulario |
| `discount`    | `number \| string`     | Valor inicial `0`, no editable |
| `iva`         | `number \| undefined`  | Valor inicial `0`, no editable |
| `total_iva`   | `number \| string`     | Valor inicial `0`, no editable |
| `ice`         | `number \| string \| undefined` | No editable |
| `percentage`  | `number`               | Valor inicial `0`, no editable |
| `name?`       | `string`               | Usado solo como `label` visual del selector; nunca se setea en `productOutputs` (ver sección de lógica condicional) |

Valores iniciales en `constants/initialValues.ts:24-34` (`initialProductItem`).

## Carga inicial del formulario

`FormReferralGuideContext.tsx:61-83` decide, según si hay `params.id` en la
ruta, qué endpoint llamar:

- **Creación** (`getCreateReferralGuide` → `GET referralguides/create`):
  responde `EmisionPoint[]` (`types/general.d.ts:13-24`), el catálogo de
  puntos de emisión habilitados para guías de remisión
  (`{ id, branch_id, store, point, recognition, referralguide, ... }`).
  No trae catálogo de transportistas, clientes ni motivos de traslado — esos
  se resuelven con búsqueda modal en vivo (ver abajo).
  Además se inicializa `productOutputs` con **una línea vacía**
  (`{ ...initialProductItem, id: nanoid() }`).

- **Edición** (`getReferralGuide` → `GET referralguides/{id}`): responde
  `{ referralguide, customers: CustomerProps[], carriers: CarrierProps[], referralguide_items: ProductOutput[] }`.
  El código asume que `customers[0]` y `carriers[0]` son el cliente y
  transportista actuales de la guía (`FormReferralGuideContext.tsx:68-70`) y
  castea `item.id` a string para cada línea de producto.

No existe un endpoint separado de "catálogo de motivos de traslado" — el
campo `reason_transfer` es un `<input type="text">` libre
(`shared/GeneralInformation.tsx:59`).

## Lógica condicional importante

### 1. Punto de emisión → generación automática de `serie`

`hooks/useSelectPoint.ts`:

- Si `points.length === 1` (solo un punto de emisión disponible), se
  autoselecciona ese punto y se genera la serie inmediatamente
  (`handlePoints`, líneas 17-30), **sin mostrar el selector**.
- El selector `SelectOption` (`Punto Emisión`) solo se renderiza si
  `points.length > 1` (`shared/GeneralInformation.tsx:25-29`).
- Cada vez que `selectPoint` cambia, `handleSelectPoint` (líneas 7-15)
  reconstruye la serie como:
  ```ts
  const serie = `${selectPoint.store}-${selectPoint.point}-${String(selectPoint.referralguide).padStart(9, '0')}`;
  ```
  usando el contador `referralguide` propio del punto de emisión (secuencial
  de guías de remisión, distinto al de facturas).

| Condición | Comportamiento |
|---|---|
| 1 punto de emisión disponible | Se autoselecciona, selector oculto, `serie` se genera sola |
| >1 puntos de emisión | Se muestra `SelectOption`, usuario elige manualmente, `serie` se regenera con el punto elegido |
| Ningún punto seleccionado | `serie` conserva el placeholder `'Cree un punto de emisión'` y el regex del schema (`^\d{3}-\d{3}-\d{9}$`) lo rechaza en la validación |

### 2. Selección de transportista (`carrier_id`)

- Se elige vía modal `SelectCarrier` (`components/selects/carrier/SelectCarrier.tsx`),
  que busca por identificación o nombre y llama a `selectCarrier` con el
  `CarrierProps` completo.
- `useGeneralInformation.handleSelectCarrier` (`hooks/useGeneralInformation.ts:40-47`)
  guarda `carrier_id` en `referralGuide` y el objeto completo en
  `selectCarrier` (usado solo para mostrar el nombre en el botón).
- **No hay lógica condicional que dependa del transportista elegido**: no se
  piden campos adicionales (placa, licencia, etc.) en el formulario de la
  guía. La placa (`CarrierProps.atts.license_plate`) existe en el tipo del
  transportista pero **no se muestra ni se solicita en ningún componente de
  `referralguides/`** — es un dato que vive únicamente en el registro del
  transportista (módulo `carriers`), no en la guía.
- ⚠️ Bug de copia/pega: el `if` que limpia el error de `carrier_id` compara
  contra la clave equivocada:
  ```ts
  const handleSelectCarrier = (carrier: CarrierProps) => {
      setReferralGuide((prevState) => ({ ...prevState, carrier_id: carrier.id }));
      setSelectCarrier(carrier);

      if ('customer_id' in errors) {          // debería ser 'carrier_id'
          setErrors(prev => ({ ...prev, carrier_id: '' }));
      }
  }
  ```
  (`hooks/useGeneralInformation.ts:40-47`). Si solo `carrier_id` tiene error
  (y no `customer_id`), seleccionar un transportista no limpia el mensaje de
  error visible.

### 3. Relación con productos/mercadería — no hereda de factura

- Los productos se agregan manualmente con `ListProducts` / `ItemProduct`,
  buscando en el modal `SelectProduct` (búsqueda por código/nombre,
  paginada).
- `useListProducts.selectProduct` (`hooks/useListProducts.ts:51-60`) **solo
  asigna `product_id`**:
  ```ts
  const selectProduct = (index: number, product: ProductProps) => {
      setProductOutputs(prevState => {
          const newState = [...prevState];
          newState[index] = { ...newState[index], product_id: product.id };
          return newState;
      });
  };
  ```
  No copia `name`, `price1` ni ningún otro atributo del producto seleccionado
  hacia `productOutputs`. El nombre que se ve en pantalla luego de elegir un
  producto proviene únicamente del estado local `displayValue` dentro de
  `SelectProduct.tsx:20-23` (UI), **no** se refleja en el objeto que se envía
  al backend salvo `product_id`.
- El único campo de línea editable por el usuario es `quantity`
  (`useListProducts.updateItem`, líneas 14-49), que se valida en cada
  cambio con `productOutputSchema.safeParse` y solo actualiza el mensaje de
  error de `quantity` (los demás campos —`price`, `discount`, `iva`,
  `total_iva`, `ice`, `percentage`— quedan siempre en su valor inicial `0`,
  ya que la guía de remisión no transporta valores monetarios).
- **No existe relación con el módulo `orders` (facturas de venta)**: no hay
  ningún fetch, selector ni herencia de datos desde una factura existente
  para precargar transportista, cliente o productos. La sección "Comprobante
  sustento" (`serie_invoice`, `date_invoice`, `authorization_invoice`,
  `shared/GeneralInformation.tsx:76-94`) son tres `<input>` de texto libre
  que el usuario tipea manualmente; no consultan ni enlazan con un registro
  real de `orders`. (Se buscó explícitamente cualquier referencia cruzada
  hacia `app/(route)/orders/` y no existe ninguna.)

### 4. Validación condicional en el schema Zod

`schemas/referral-guide.schema.ts` — **no hay reglas `.refine()` ni
condicionales entre campos** (a diferencia de `product.schema.ts`, que sí
usa `.refine()` para `aux_cod` según `iva`). Todos los campos de
`referralGuideSchema` son validaciones simples e independientes:

```ts
export const referralGuideSchema = z.object({
	serie: z.string().regex(/^\d{3}-\d{3}-\d{9}$/, { message: 'Seleccione el punto de emisión' }),
	date_start: z.string().min(1, { message: 'Escriba una fecha correcta' }),
	date_end: z.string().min(1, { message: 'Escriba una fecha correcta' }),
	carrier_id: z.number().min(1, { message: 'Seleccione el transportista' }),
	customer_id: z.number().min(1, { message: 'Seleccione el destinatario o cliente' }),
	address_from: z.string().min(3, { message: 'Escriba la dirección partida' }),
	address_to: z.string().min(3, { message: 'Escriba la dirección destino' }),
	reason_transfer: z.string().min(3, { message: 'Escriba lo que transporta' }),
	branch_destiny: z.string().optional(),
	customs_doc: z.string().optional(),
	route: z.string().optional(),
	serie_invoice: z.string().optional(),
	date_invoice: z.string().optional(),
	authorization_invoice: z.string().optional(),
	products: z.array(productOutputSchema).min(1, { message: 'Debe agregar al menos un producto' }),
});
```

No hay, por ejemplo, una regla que exija `serie_invoice`/`date_invoice` si se
llenó `authorization_invoice` (o viceversa): los tres campos de "Comprobante
sustento" son completamente independientes y opcionales entre sí.

`productOutputSchema` (líneas 3-14) tampoco tiene condicionales: valida
`id` (string), `product_id` (`min(1)`) y `quantity` (coaccionado a número,
`>= 0`) de forma independiente.

### 5. Flags/condiciones que muestran u ocultan campos

| Condición | Efecto en UI |
|---|---|
| `points.length > 1` | Muestra el selector "Punto Emisión" (`GeneralInformation.tsx:25-29`) |
| `points.length === 1` | Oculta el selector, autoselecciona (ver sección 1) |
| — | El resto de campos de la cabecera y de "Comprobante sustento" **siempre están visibles**; no hay ningún otro `if`/render condicional en `GeneralInformation.tsx` que oculte o muestre campos según el valor de otro campo (p. ej. no hay dependencia con `reason_transfer`, `carrier_id` ni `customer_id`) |

## Envío del formulario (`shared/ButtonSubmit.tsx`)

1. Arma `form = { ...referralGuide, products: productOutputs, point_id: selectPoint?.id, send: true }` (líneas 19-25).
2. Valida con `referralGuideSchema.safeParse(form)`.
   - Si falla: mapea el primer error de cada campo top-level a `errors`
     (`formatted[err.path[0]] = err.message`, líneas 32-36) y además separa
     los errores del array `products` por `id` de línea hacia
     `errorProductOutputs` (líneas 38-53), para que `ItemProduct` pinte el
     error en la fila correcta.
3. Si la validación pasa:
   - **Edición** (`params.id` existe): `axiosAuth.put('/referralguides/{id}', parsed.data)`.
     Como `parsed.data` es la salida de Zod, **no incluye `point_id` ni
     `send`** (no están declarados en `referralGuideSchema`, así que Zod los
     descarta por defecto). Es decir, en edición esos dos campos **no se
     envían al backend**, a diferencia de creación.
   - **Creación**: `axiosAuth.post('/referralguides', form)`, enviando el
     objeto `form` original (sin pasar por Zod), que sí incluye `point_id` y
     `send: true`.
   - Ambos casos verifican `res.status === 200` para redirigir a
     `/referralguides`.
4. Manejo de errores 422: el `catch` (líneas 71-74) solo hace
   `console.log(...)` y `setIsSaving(false)` — **no llama a `setErrors` ni a
   `setErrorProductOutputs`** con los errores devueltos por el backend. A
   diferencia del patrón descrito en `CLAUDE.md`
   (`handleApiRequest`/`ApiResponse<T>` con `errors`), aquí las llamadas de
   guardado se hacen con `axiosAuth.post`/`.put` **directas**, sin pasar por
   `services/referralGuidesServices.ts` ni por `handleApiRequest`. El
   servicio (`referralGuidesServices.ts`) solo expone funciones `GET`
   (`getReferralGuides`, `getCreateReferralGuide`, `getReferralGuide`); no
   existe `storeReferralGuide`/`updateReferralGuide`.

## Resumen de reglas de negocio confirmadas

1. La serie de la guía (`serie`) se genera automáticamente a partir del
   punto de emisión seleccionado y su contador `referralguide`; el usuario
   nunca la escribe a mano.
2. Si la empresa tiene un solo punto de emisión habilitado para guías de
   remisión, se autoselecciona y el selector se oculta.
3. `reason_transfer` (motivo del traslado) es texto libre sin catálogo ni
   validación condicional asociada.
4. El transportista (`carrier_id`) y el cliente/destinatario (`customer_id`)
   se eligen por búsqueda modal; no hay campos adicionales que dependan del
   transportista elegido (placa/licencia se gestionan en el módulo
   `carriers`, no en la guía).
5. Las líneas de producto solo permiten editar cantidad (`quantity`) y
   elegir el producto (`product_id`); precio/descuento/IVA/ICE quedan fijos
   en `0`, consistente con que una guía de remisión no es un documento con
   valores monetarios.
6. No existe integración con el módulo `orders`: los campos de "Comprobante
   sustento" (serie/fecha/autorización de factura) son texto libre
   ingresado manualmente, sin selector ni fetch de una factura real.
7. El schema Zod de la guía no tiene reglas condicionales entre campos (a
   diferencia de, por ejemplo, `product.schema.ts`); todas las validaciones
   son independientes por campo.
8. El envío a backend usa `axiosAuth` directo (no `handleApiRequest`), y el
   payload difiere entre creación (incluye `point_id`, `send`) y edición
   (los pierde por el `safeParse` de Zod).

## ⚠️ Observaciones

- **Bug de error condicional mal referenciado**: en
  `hooks/useGeneralInformation.ts:44`, `handleSelectCarrier` limpia el error
  de `carrier_id` solo si `'customer_id' in errors` es verdadero (debería
  comprobar `'carrier_id' in errors`). Efecto: si el usuario no seleccionó
  transportista y sí seleccionó cliente correctamente, el mensaje de error
  de "Transportista" puede quedar visible después de elegir uno válido.
- **Pérdida de `point_id` y `send` en edición**: `ButtonSubmit.tsx` envía
  `parsed.data` (salida de Zod, sin `point_id` ni `send`) en el `PUT` de
  edición, pero envía `form` completo (con ambos campos) en el `POST` de
  creación. Si el backend espera esos campos también al editar, la edición
  podría no reasignar correctamente el punto de emisión o el flag de envío.
- **`productOutputs.name` nunca se persiste**: `selectProduct` solo setea
  `product_id`; el nombre visible del producto viene del estado interno de
  `SelectProduct.tsx`, no del estado global del formulario. No es un bug
  funcional (el backend probablemente resuelve el nombre por `product_id`),
  pero cualquier lógica futura que dependa de `productOutputs[i].name` en el
  frontend encontrará el campo vacío tras seleccionar un producto nuevo (sí
  llega poblado al editar, porque viene del backend en
  `referralguide_items`).
- **Sin manejo de errores 422 del backend en el submit**: el `catch` de
  `handleSubmit` en `ButtonSubmit.tsx:71-74` no muestra al usuario los
  errores de validación que devuelva Laravel (solo `console.log`), rompiendo
  el patrón estándar del repo (`handleApiRequest` + `ApiResponse.errors`)
  documentado en `CLAUDE.md`. Tampoco existen `storeReferralGuide` /
  `updateReferralGuide` en `services/referralGuidesServices.ts` — las
  llamadas van directas con `axiosAuth.post`/`.put` desde el componente.
- **Verificación de éxito por `status === 200`**: tanto el `POST` (creación)
  como el `PUT` (edición) verifican `res.status === 200`. Si el backend
  respondiera `201 Created` en la creación (convención común de Laravel para
  `store`), la redirección a `/referralguides` no se ejecutaría.
- **Comentario `// !Todo: Check handleSelect function`** dejado en
  `shared/GeneralInformation.tsx:24`, indicando una revisión pendiente sobre
  el selector de punto de emisión que no se completó.
