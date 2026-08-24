# Módulo Transportistas

Documentación funcional del módulo de transportistas (carriers).
Ubicación del código: `app/(route)/carriers/`.

Estructura real encontrada:

```
app/(route)/carriers/
  page.tsx                          # Listado
  create/page.tsx                   # Creación
  [id]/page.tsx                     # Edición
  components/
    CarriersFilter.tsx              # Buscador del listado
    CarriersTable.tsx                # Tabla + eliminación
    index.ts
  context/
    CarrierFormContext.tsx          # Estado del formulario create/edit
    CarriersContext.tsx             # Estado del listado (paginación/búsqueda)
  services/
    carriersServices.ts             # store/get/update/resolve (feature-scoped)
  shared/
    ButtonSubmit.tsx
    CarrierForm.tsx
    index.ts
```

No existen carpetas `hooks/` propias del módulo (a diferencia de otros
features como `referralguides`); la lógica de resolución de identificación
vive directamente dentro de `CarrierFormContext.tsx`.

Además, el listado y la eliminación usan un servicio **global** distinto:
`services/carrierServices.ts` (`getCarriers`, `deleteCarrier`), consumido
tanto por `CarriersContext.tsx` (listado propio del módulo) como por el
selector reutilizable `components/selects/carrier/` que usa el módulo
`referralguides` (ver sección de relación más abajo).

## Entidad `Carrier`

Definida en `types/carrier.d.ts:14-24`.

| Campo                 | Tipo                     | Notas                                                                 |
|------------------------|---------------------------|------------------------------------------------------------------------|
| `id`                   | `string`                  | `nanoid()` en creación (`CarrierFormContext.tsx:24`); id numérico casteado a string en edición |
| `type_identification`  | `'cédula' \| 'ruc'`       | Solo estos dos valores en el tipo TS y en el `<select>` del formulario. El schema Zod admite un tercer valor `'otro'` que la UI nunca ofrece (ver Observaciones) |
| `identication`         | `string`                  | Requerido, solo dígitos, `maxLength={13}` en el input; longitud exacta depende de `type_identification` (ver Lógica condicional) |
| `name`                 | `string`                  | Requerido, mín. 3 / máx. 300 caracteres                                |
| `address`              | `string?`                 | Opcional; se normaliza `""` → `null` vía `emptyStringToNull` en el schema |
| `license_plate`        | `string`                  | Requerido, mín. 7 caracteres, `maxLength={10}` en el input             |
| `phone`                | `string?`                 | No tiene input propio en `CarrierForm.tsx`; solo se llena vía `resolveCarrier` |
| `email`                | `string?`                 | Opcional, tipo `email` en el input, normalizado igual que `address`    |
| `branch_id`            | `number?`                 | Solo usado como respuesta de `resolveCarrier` para detectar duplicados (no se persiste como input de formulario) |

`CarrierProps` (usado en listados y en el selector de `referralguides`,
`types/carrier.d.ts:1-11`) es la forma "paginada" del recurso:
`{ id: number, atts: { identication, name, address?, license_plate, phone?, email? } }`.

No hay campos de "tipo de vehículo" ni "licencia de conducir" en la entidad;
el único dato del vehículo es `license_plate` (placa).

## Carga inicial del formulario

`CarrierFormContext.tsx` no recibe catálogos externos (no hay endpoint
"getCreateCarrier" con catálogos, a diferencia de productos). El estado
inicial es fijo:

```ts
// CarrierFormContext.tsx:23-29
const initialCarrier: Carrier = {
    id: nanoid(),
    type_identification: 'cédula',
    identication: '',
    name: '',
    license_plate: '',
}
```

En edición (`id` presente), hace `getCarrier(axiosAuth, id)` y reemplaza
`carrier` completo con la respuesta (`CarrierFormContext.tsx:38-51`).

## Lógica condicional importante

### 1. Autocompletado por identificación (`resolveCarrier`)

`CarrierFormContext.tsx:53-75` — un `useEffect` que dispara
`resolveCarrier(axiosAuth, carrier.identication)` (`GET carriers/resolve/{identication}`)
automáticamente mientras el usuario escribe, **solo en modo creación /
mientras no se haya cargado un carrier existente**, y solo cuando la
identificación alcanza la longitud exacta esperada para el tipo elegido:

```ts
// CarrierFormContext.tsx:69-75
const identication = carrier.identication.trim();

if (!skiFetch && (
      (carrier.type_identification === 'cédula' && identication.length === 10) ||
      (carrier.type_identification === 'ruc' && identication.length === 13)
   )) {
    handleResolve();
}
```

Tabla de reglas:

| `type_identification` | Longitud que dispara el resolve |
|------------------------|----------------------------------|
| `cédula`               | exactamente 10 dígitos           |
| `ruc`                  | exactamente 13 dígitos           |
| otro valor / longitud distinta | no dispara nada          |

`skiFetch` (estado booleano, nombre tal cual en el código, con typo) se
pone en `true`:
- Al cargar un carrier existente vía `getCarrier` en modo edición
  (`CarrierFormContext.tsx:44`), para que el resolve automático **nunca**
  se dispare en edición.
- No se resetea a `false` en ningún otro punto del código de este módulo,
  por lo que una vez que ocurre un resolve exitoso (o una carga por `id`),
  el auto-resolve queda deshabilitado por el resto de la sesión del
  formulario aunque el usuario borre y reescriba la identificación.

Dentro de `handleResolve` (`CarrierFormContext.tsx:54-67`):

```ts
const { data } = await resolveCarrier(axiosAuth, carrier.identication);
if (data) {
    if (data.branch_id && data.branch_id !== 0) {
        setErrors({ identication: 'El transportista ya esta registrado' });
        return;
    }
    const { name, address, phone, email } = data;
    setCarrier(prev => ({ ...prev, name, address, phone, email }));
}
```

Reglas:

- Si el backend devuelve `branch_id` distinto de `0`/`null`/`undefined` →
  se interpreta como "ya existe un transportista con esta identificación en
  la sucursal actual" y se bloquea el formulario mostrando error en
  `identication` (no se limpian los demás campos).
- Si no hay `branch_id` (o es `0`) → se asume que el dato viene de una
  fuente externa (SRI o registro previo sin sucursal) y se autocompletan
  `name`, `address`, `phone`, `email`. `license_plate` **nunca** se
  autocompleta desde `resolveCarrier` (el tipo `Carrier` que devuelve el
  resolve no distingue esto explícitamente, pero el destructuring solo
  toma esos 4 campos).

### 2. Validación condicional en el schema Zod (`schemas/carrier.schema.ts`)

```ts
export const carrierSchema = z.object({
    type_identification: z.enum(['cédula', 'ruc', 'otro']),
    identication: z.string().regex(/^\d+$/, 'La identificación debe contener solo números'),
    name: z.string().min(3, "Nombre del transportista requerido").max(300, "Máximo 300 caracteres"),
    address: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    license_plate: z.string().min(7, "Placa vehicular requerido"),
    email: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
}).superRefine((data, ctx) => {
    if (data.type_identification === 'cédula' && data.identication.length !== 10) {
        ctx.addIssue({ path: ['identication'], message: 'La cédula debe tener exactamente 10 dígitos', code: z.ZodIssueCode.custom });
    }
    if (data.type_identification === 'ruc' && data.identication.length !== 13) {
        ctx.addIssue({ path: ['identication'], message: 'El RUC debe tener exactamente 13 dígitos', code: z.ZodIssueCode.custom });
    }
});
```

Tabla de reglas de validación condicional:

| Condición                                   | Regla aplicada                                       |
|-----------------------------------------------|--------------------------------------------------------|
| `type_identification === 'cédula'`            | `identication` debe tener exactamente 10 dígitos       |
| `type_identification === 'ruc'`               | `identication` debe tener exactamente 13 dígitos       |
| `type_identification === 'otro'`              | Sin regla de longitud adicional (solo aplica la regex general de "solo dígitos") — pero la UI nunca permite seleccionar este valor |
| Cualquier `type_identification`               | `identication` siempre debe ser solo dígitos (regex `^\d+$`) |
| `license_plate`                                | Requerido, mín. 7 caracteres, sin dependencia de otro campo |
| No hay validación condicional por "tipo de vehículo" — ese concepto no existe en el módulo |

No hay campo ni lógica de "tipo de vehículo" en ningún archivo del módulo
(`grep` sobre `carriers/` no arroja coincidencias de `vehicle`, `vehiculo`
ni `license` fuera de `license_plate`).

### 3. Relación con Guías de remisión (`referralguides`)

El módulo `referralguides` no reimplementa el CRUD de transportistas: usa
directamente el servicio global `services/carrierServices.ts`
(`getCarriers`) a través de un selector compartido en
`components/selects/carrier/`:

- `components/selects/carrier/SelectCarrier.tsx` — botón + modal de
  búsqueda paginada de transportistas (usa internamente
  `hooks/useModalSelectCarrier.ts`).
- Se usa en `app/(route)/referralguides/shared/GeneralInformation.tsx:36`:
  ```tsx
  <SelectCarrier label={selectCarrier?.atts.name} error={errors.carrier_id} selectCarrier={handleSelectCarrier} />
  ```

Flujo de datos (`app/(route)/referralguides/hooks/useGeneralInformation.ts:40-47`):

```ts
const handleSelectCarrier = (carrier: CarrierProps) => {
    setReferralGuide((prevState) => ({ ...prevState, carrier_id: carrier.id }));
    setSelectCarrier(carrier);
    if ('customer_id' in errors) {          // <- revisa 'customer_id', no 'carrier_id'
        setErrors(prev => ({ ...prev, carrier_id: '' }));
    }
}
```

Es decir: al seleccionar un transportista desde el modal, la guía de
remisión solo guarda `carrier_id` (el `id` numérico del `CarrierProps`);
ningún otro campo del carrier (placa, dirección, teléfono) se copia al
objeto `ReferralGuideCreateProps`. El objeto `selectCarrier` completo se
guarda aparte solo para mostrar el nombre en el input
(`selectCarrier?.atts.name`, `GeneralInformation.tsx:36`).

En modo edición de una guía, `FormReferralGuideContext.tsx:66-71` carga
`selectCarrier` desde `data.carriers[0]` (primer elemento del array
`carriers` devuelto por `getReferralGuide`), asumiendo que el backend
siempre retorna ese array con el transportista asociado a la guía en la
posición 0.

Validación del lado de la guía (`schemas/referralGuide.schema.ts`, dentro
del `referralGuideSchema`):

```ts
carrier_id: z.number().min(1, { message: 'Seleccione el transportista' }),
```

`carrier_id` es obligatorio (`> 0`) para poder enviar la guía de remisión;
no hay lógica condicional adicional sobre el carrier dentro de ese schema.

## Envío del formulario (`ButtonSubmit.tsx`)

`app/(route)/carriers/shared/ButtonSubmit.tsx` delega todo en
`useFormSubmit` (`lib/hooks/useFormSubmit.ts`):

1. `schema.safeParse(data)` con `carrierSchema` sobre el `carrier` actual
   del contexto.
2. Si falla → `parseZodErrors` mapea los issues a
   `Partial<Record<keyof Carrier, string>>` vía `setErrors` y corta (no
   llama al backend).
3. Si pasa → `params?.id ? updateCarrier(...) : storeCarrier(...)`
   (`storeCarrier` → `POST carriers`, `updateCarrier` → `PUT carriers/{id}`).
4. Si la respuesta trae `res.errors` (422 de Laravel, mapeado por
   `handleApiRequest`) → se vuelcan a `setErrors` sin redirigir.
5. Si trae `res.error` (mensaje genérico, no de validación) → se muestra
   en un `<Alert>` sin redirigir.
6. Éxito (sin `errors` ni `error`) → `router.push('/carriers')`.

No hay paso adicional de limpieza/normalización antes de enviar (a
diferencia de productos, que clona el objeto); se envía el resultado
`parsed.data` de Zod directamente (que ya normalizó `address`/`email`
vacíos a `null` vía `emptyStringToNull`).

## Resumen de reglas de negocio confirmadas

1. `type_identification` solo admite `'cédula'` o `'ruc'` desde la UI
   (`CarrierForm.tsx:11-14`); el valor `'otro'` existe en el schema Zod
   pero no es alcanzable desde el formulario.
2. La identificación debe tener exactamente 10 dígitos si es `cédula` o 13
   si es `ruc` (regla de schema, `carrier.schema.ts`, y regla de disparo de
   autocompletado, `CarrierFormContext.tsx`).
3. En modo creación, al completar una identificación con la longitud
   esperada, se consulta `carriers/resolve/{identicacion}` y se
   autocompletan `name`, `address`, `phone`, `email` si el backend no
   marca `branch_id` como ya asignado.
4. Si `resolveCarrier` devuelve `branch_id` distinto de 0, se bloquea el
   campo `identication` con el mensaje "El transportista ya esta
   registrado" y no se autocompleta nada más.
5. El auto-resolve nunca se ejecuta en modo edición (`skiFetch` se marca
   `true` al cargar un carrier por `id`) y, una vez ejecutado con éxito en
   creación, tampoco se repite después.
6. `license_plate` es obligatorio (mín. 7 caracteres) y es el único dato
   de vehículo que existe en el módulo; no hay tipo de vehículo ni datos
   de licencia de conducir.
7. `referralguides` no duplica el CRUD de transportistas: reutiliza el
   servicio global `getCarriers` a través del selector
   `components/selects/carrier/SelectCarrier.tsx` y solo persiste el
   `carrier_id` numérico en la guía de remisión; el resto de datos del
   carrier (placa, dirección, etc.) no viajan al payload de la guía.
8. `carrier_id` es obligatorio (`> 0`) para poder enviar una guía de
   remisión (`referralGuideSchema`).

## ⚠️ Observaciones

- **`type_identification: 'otro'` inalcanzable**: el schema Zod
  (`schemas/carrier.schema.ts`) y el tipo `Carrier` no coinciden
  exactamente — el schema declara `z.enum(['cédula', 'ruc', 'otro'])`
  mientras que `types/carrier.d.ts:16` tipa el campo como
  `'cédula' | 'ruc'` y el `<select>` de `CarrierForm.tsx:11-14` solo ofrece
  esas dos opciones. El valor `'otro'` es código muerto en la práctica (no
  hay forma de que el usuario lo seleccione ni de que quede sin regla de
  longitud aplicada).
- **Componentes duplicados/no usados en `components/selects/carrier/`**:
  existen dos implementaciones equivalentes de modal de selección de
  transportista:
  - `ModalSelectCarrier.tsx` + su lógica en `useModalSelectCarrier.ts`
    (usada, pero solo internamente **desde** `SelectCarrier.tsx`, que la
    reimplementa inline en vez de renderizar `<ModalSelectCarrier />`).
  - El componente `ModalSelectCarrier.tsx` en sí **no se importa desde
    ningún otro archivo del proyecto** (confirmado con grep) — es decir,
    quedó como componente exportado pero huérfano; solo su hook
    (`useModalSelectCarrier`) sigue en uso, consumido directamente por
    `SelectCarrier.tsx`.
  - Adicionalmente, `hooks/useSelectCarrier.ts` (con su propia lógica de
    `search`/`suggestions`/`handleSelect` basada en texto libre en vez de
    modal) **no tiene ningún consumidor** en todo el repo — es código
    muerto completo.
- **Typo consistente `skiFetch`**: la variable en
  `CarrierFormContext.tsx:35` debería llamarse `skipFetch` (falta la "p");
  no afecta funcionalidad pero es inconsistente con el resto del código
  (p. ej. `useSelectCarrier.ts` sí usa `skipFetch` correctamente).
- **Bug de copy/paste en el reseteo de error de `carrier_id`**:
  `useGeneralInformation.ts:44` verifica `'customer_id' in errors` para
  decidir si limpia `errors.carrier_id`, en vez de verificar
  `'carrier_id' in errors`. Efecto práctico: si solo existe un error de
  `carrier_id` (sin error de `customer_id` presente en el objeto), al
  volver a seleccionar un transportista el mensaje de error de
  `carrier_id` no se limpia visualmente hasta que también cambie
  `customer_id` o se reintente el submit.
- **`phone` sin input en el formulario de creación/edición**: el campo
  `phone` de `Carrier` solo se llena automáticamente vía `resolveCarrier`;
  no existe ningún `<TextInput name='phone' .../>` en `CarrierForm.tsx`,
  por lo que un usuario no puede editarlo manualmente ni verlo en pantalla
  aunque se guarde en el backend.
- **Sin catálogos ni endpoint "create"**: a diferencia de otros módulos
  (p. ej. productos), no existe un `getCreateCarrier` que traiga catálogos
  para el formulario; el único fetch adicional es `resolveCarrier`, atado
  a la propia identificación que el usuario escribe.
