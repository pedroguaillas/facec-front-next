# Módulo Proveedores

Documentación funcional del formulario de creación/edición de proveedores.
Ubicación del código: `app/(route)/suppliers/`.

Estructura real del módulo:

```
app/(route)/suppliers/
  page.tsx                        # Listado
  create/page.tsx                 # Página de creación
  [id]/page.tsx                   # Página de edición
  components/
    SupplierFilters.tsx           # Buscador (contexto de listado)
    SuppliersTable.tsx            # Tabla + eliminar (Dialog de confirmación)
    index.ts
  context/
    SupplierContext.tsx           # Estado del listado (paginación, búsqueda, delete)
  hooks/
    useSupplierForm.ts            # Estado y lógica del formulario create/edit
  services/
    suppliersServices.ts          # getSuppliers, getSupplier, deleteSupplier
  shared/
    SupplierForm.tsx              # Formulario (campos)
    ButtonSubmit.tsx              # Botón submit con useFormStatus
```

Servicios globales (fuera del feature folder, en `/services/supplierServices.ts`):
`resolveSupplier`, `storeSupplier`, `updateSupplier`.

> Nota: a diferencia de otros módulos (p. ej. `products`), el módulo de
> proveedores **no** usa una Context Provider tipo `FormShopContext` /
> `ProductFormContext` para el formulario de create/edit. Toda la lógica de
> formulario vive directamente en el hook `useSupplierForm.ts`, y
> `SupplierContext.tsx` solo maneja el **listado** (búsqueda, paginación,
> borrado), no el formulario.

## Entidad `Supplier`

Definida en `types/supplier.d.ts:12-20`.

| Campo                 | Tipo                       | Notas                                                                 |
|-----------------------|-----------------------------|------------------------------------------------------------------------|
| `id`                  | `string`                    | En edición se castea el id numérico del backend a string (`useSupplierForm.ts:62`) |
| `type_identification` | `'cédula' \| 'ruc'`          | En el `type` solo admite estos dos valores (ver ⚠️ Observaciones sobre `'otro'` en el schema) |
| `identication`        | `string`                    | Solo dígitos (validado por regex en el schema). *Nota: el campo se llama `identication`, no `identification` (typo consistente en todo el código)* |
| `name`                 | `string`                    | Razón social / nombre del proveedor. Requerido, 3–300 caracteres      |
| `address`              | `string?`                   | Opcional en el tipo/schema, pero **requerido en la UI** (ver ⚠️ Observaciones) |
| `phone`                | `string?`                   | Opcional                                                               |
| `email`                | `string?`                   | Opcional                                                               |
| `branch_id`            | `number?`                   | No es un campo propio del proveedor: se usa para detectar, en la respuesta de `resolveSupplier`, si el proveedor ya existe registrado en la sucursal/empresa (comentario en el propio tipo: *"Utilizo para recuperar un custom del SRI o base de datos"*) |

Tipo auxiliar para el listado, `SupplierProps` (`types/supplier.d.ts:1-10`):

```ts
export interface SupplierProps {
    id: number,
    atts: {
        identication: string;
        name: string;
        address?: string;
        phone?: string;
        email?: string;
    },
}
```

No hay campos relacionados con **agente de retención** ni **retenciones** en
este módulo (tipo, schema, formulario y servicios revisados) — el módulo
maneja únicamente identificación y datos de contacto.

## Carga inicial del formulario

No existe un endpoint de "create" que traiga catálogos (a diferencia de
`products`, que trae `ivaTaxes`, `iceCataloges`, etc.). El único catálogo es
estático y vive hardcodeado en el propio componente `SupplierForm.tsx:9-12`:

```ts
const optionType = [
    { label: 'Cédula', value: 'cédula' },
    { label: 'RUC', value: 'ruc' },
]
```

- **Creación** (`create/page.tsx`): el formulario arranca con
  `initialSupplier` (`constants/initialValues.ts:60-65`):
  ```ts
  export const initialSupplier: Supplier = {
    id: '',
    type_identification: 'ruc',
    identication: '',
    name: '',
  }
  ```
  Es decir, el tipo de identificación por defecto es **RUC**.

- **Edición** (`[id]/page.tsx`): `useSupplierForm.ts:56-68` dispara un
  `useEffect` que llama a `getSupplier(params.id, axiosAuth)`
  (`GET providers/{id}/edit`), llena `supplier` con la respuesta y activa el
  flag `skiFetch = true` para evitar el auto-resuelto (ver siguiente
  sección).

## Lógica condicional importante

### 1. Auto-resolución de datos por identificación (`resolveSupplier`)

Este es el comportamiento condicional más relevante del módulo. En
`useSupplierForm.ts:70-92`:

```ts
useEffect(() => {
    const handleCustom = async () => {
        const { data } = await resolveSupplier(axiosAuth, supplier.identication);
        if (data) {
            if (data.branch_id && data.branch_id !== 0) {
                setErrors({ identication: 'El proveedor ya esta registrado' })
                return;
            }
            const { name, address, email, phone } = data
            setSupplier(prev => ({
                ...prev,
                name, address, email, phone
            }));
        }
    }

    const identication = supplier.identication.trim();

    if (!skiFetch && ((supplier.type_identification === 'cédula' && identication.length === 10) || (supplier.type_identification === 'ruc' && identication.length === 13))) {
        handleCustom();
    }

}, [supplier.type_identification, supplier.identication, skiFetch, axiosAuth])
```

Reglas:

| Condición                                                                 | Efecto                                                                 |
|------------------------------------------------------------------------|--------------------------------------------------------------------------|
| `type_identification === 'cédula'` y `identication` tiene exactamente **10** dígitos, y `skiFetch === false` | Llama `GET providers/resolve/{identication}` |
| `type_identification === 'ruc'` y `identication` tiene exactamente **13** dígitos, y `skiFetch === false`    | Llama `GET providers/resolve/{identication}` |
| Respuesta trae `branch_id` truthy y distinto de `0`                       | El proveedor ya existe → se fuerza `errors = { identication: 'El proveedor ya esta registrado' }` (esto **reemplaza** todo el objeto de errores, no lo mergea) y no se autocompletan los campos |
| Respuesta sin `branch_id` (o `branch_id === 0`)                           | Autocompleta `name`, `address`, `email`, `phone` en el formulario con los datos devueltos por el backend (posiblemente datos del SRI o de un registro previo) |

- `skiFetch` es un flag que solo se pone en `true` una vez, dentro del
  `useEffect` de edición (`useSupplierForm.ts:56-68`), cuando se carga
  exitosamente un proveedor existente vía `getSupplier`. **Nunca vuelve a
  `false`.** Efecto práctico: el auto-resuelto por identificación solo
  ocurre en el flujo de **creación**; en edición queda deshabilitado desde
  que se carga el registro (incluso si el usuario cambia la identificación
  manualmente durante la edición).
- El límite de longitud (`maxLength={13}`) del input `identication`
  (`SupplierForm.tsx:26`) es fijo para ambos tipos de identificación; la
  distinción 10 (cédula) vs 13 (RUC) dígitos solo se aplica en la lógica de
  disparo del `useEffect` y en la validación del schema (siguiente
  sección), no en el `maxLength` del input.

### 2. Validación condicional por tipo de identificación (Zod)

`schemas/supplier.schema.ts:4-27`:

```ts
export const supplierSchema = z.object({
    type_identification: z.enum(['cédula', 'ruc', 'otro']),
    identication: z.string().regex(/^\d+$/, 'La identificación debe contener solo números'),
    name: z.string().min(3, "Nombre del cliente requerido").max(300, "Máximo 300 caracteres"),
    address: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    phone: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    email: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
}).superRefine((data, ctx) => {
    if (data.type_identification === 'cédula' && data.identication.length !== 10) {
        ctx.addIssue({
            path: ['identication'],
            message: 'La cédula debe tener exactamente 10 dígitos',
            code: z.ZodIssueCode.custom,
        });
    }

    if (data.type_identification === 'ruc' && data.identication.length !== 13) {
        ctx.addIssue({
            path: ['identication'],
            message: 'El RUC debe tener exactamente 13 dígitos',
            code: z.ZodIssueCode.custom,
        });
    }
});
```

Reglas de validación condicional:

| `type_identification` | Regla adicional sobre `identication`                    |
|------------------------|-----------------------------------------------------------|
| `'cédula'`             | Debe tener exactamente 10 dígitos                          |
| `'ruc'`                | Debe tener exactamente 13 dígitos                          |
| `'otro'`               | Solo se valida el regex general (`^\d+$`, solo números); **sin restricción de longitud** — ver ⚠️ Observaciones, ya que este valor no es alcanzable desde la UI |

`address`, `phone`, `email` usan `emptyStringToNull` (`schemas/general.schema.ts:1-4`)
como `preprocess`: si el string viene vacío (tras `trim()`), se convierte a
`null` antes de validarse como `string().nullable().optional()` — es decir,
son campos opcionales tanto para crear como para editar, a nivel de schema.

### 3. Campo "requerido" visualmente vs. validación real

No hay flags que muestren/oculten campos dinámicamente en este módulo (no
existe nada equivalente al `transport` / `aux_cod` de `products`); todos los
campos del formulario están siempre visibles. Lo que sí existe es una
discrepancia entre la UI y el schema — documentada en ⚠️ Observaciones.

## Envío del formulario (`useSupplierForm.handleSubmit`)

`useSupplierForm.ts:28-54`, invocado desde `SupplierForm.tsx:15`
(`<form action={handleSubmit}>`, patrón React 19 con `useFormStatus` en
`ButtonSubmit.tsx`):

1. Convierte el `FormData` recibido a un objeto plano, aplicando `trim()`
   a todos los valores string (`useSupplierForm.ts:29-31`).
2. Valida con `supplierSchema.safeParse(supplier)`.
   - Si falla: mapea cada `ZodIssue` a `formatted[err.path[0]] = err.message`
     y hace `setErrors(formatted)`; corta la ejecución (no llama al backend).
3. Si `params?.id !== undefined` (modo edición):
   - `updateSupplier(params.id, axiosAuth, supplier)` → `PUT providers/{id}`.
   - Redirige a `/suppliers` **sin comprobar el resultado** de la llamada
     (no revisa `res.error` / `res.errors`) — ver ⚠️ Observaciones.
4. Si no hay `params.id` (modo creación):
   - `storeSupplier(axiosAuth, supplier)` → `POST providers`.
   - Solo si `res` es truthy (`ApiResponse` siempre es un objeto, por lo que
     esta condición es virtualmente siempre verdadera — ver ⚠️
     Observaciones) redirige a `/suppliers`.
5. Manejo de errores 422: lo hace genéricamente `handleApiRequest`
   (`helpers/apiHandler.ts:26-35`), que aplana `error.response.data.errors`
   a `{ campo: primerMensaje }` y lo retorna como `res.errors`. **Sin
   embargo, `handleSubmit` nunca lee `res.errors` ni lo asigna a
   `setErrors`** — ver ⚠️ Observaciones, los errores 422 del backend no se
   muestran actualmente en el formulario de proveedores.

## Resumen de reglas de negocio confirmadas

1. El tipo de identificación solo puede ser **Cédula** o **RUC** desde la UI
   (`optionType` en `SupplierForm.tsx`); por defecto, al crear, es **RUC**
   (`initialSupplier`).
2. Cédula exige exactamente 10 dígitos; RUC exige exactamente 13 dígitos
   (`supplierSchema.superRefine`).
3. `identication` solo admite dígitos (regex `^\d+$`).
4. Al escribir una identificación completa (10 dígitos + cédula, o 13
   dígitos + RUC) **durante la creación** (`skiFetch === false`), el
   formulario intenta auto-resolver los datos del proveedor contra
   `GET providers/resolve/{identication}` y autocompleta nombre, dirección,
   teléfono y correo.
5. Si esa resolución detecta que el proveedor ya existe (`branch_id` truthy
   y ≠ 0), bloquea el formulario mostrando el error "El proveedor ya esta
   registrado" en el campo `identication`, en vez de autocompletar.
6. En modo edición, la auto-resolución por identificación queda
   deshabilitada permanentemente una vez cargado el registro existente.
7. `name` es obligatorio (3–300 caracteres); `address`, `phone`, `email` son
   opcionales a nivel de schema (aunque no en la UI, ver observaciones).
8. No existe lógica de agente de retención ni de catálogos de retenciones en
   este módulo.

## ⚠️ Observaciones

- **`address` requerido en UI pero opcional en schema/tipo**:
  `SupplierForm.tsx:36` pasa `required` al `TextInput` de "Dirección", y
  `TextInput.tsx:58` traslada esa prop al atributo nativo `required` del
  `<input>`. Como el formulario usa `<form action={handleSubmit}>` (form
  action de React 19), el navegador sí aplica validación nativa HTML antes
  de invocar el `action`, por lo que en la práctica el campo dirección no se
  puede enviar vacío desde la UI — pero tanto `Supplier.address` (tipo) como
  `supplierSchema.address` (Zod) lo tratan como opcional/nullable. Esto es
  una inconsistencia entre la capa de UI y la capa de validación/tipo; si el
  requisito de negocio es que la dirección sea opcional, sobra el `required`
  en `SupplierForm.tsx:36`; si debe ser obligatoria, falta reflejarlo en
  `supplier.schema.ts` y en `types/supplier.d.ts`.

- **Errores 422 del backend no se muestran**: `handleSubmit`
  (`useSupplierForm.ts:44-53`) llama a `updateSupplier`/`storeSupplier` pero
  nunca lee `res.errors` (los errores de validación 422 que sí devuelve
  `handleApiRequest`). A diferencia del patrón documentado en `CLAUDE.md`
  ("errores 422 de Laravel mapeados vía `parseZodErrors`" / mostrados en el
  formulario), aquí simplemente se ignoran. Si el backend rechaza el
  `POST`/`PUT` por una validación propia (p. ej. identificación duplicada
  detectada solo en servidor), el usuario no ve ningún mensaje.

- **Redirección en `updateSupplier` sin comprobar el resultado**:
  `useSupplierForm.ts:44-48` hace `await updateSupplier(...)` y redirige
  incondicionalmente a `/suppliers`, sin comprobar si la respuesta trae
  `error`/`errors`. En el flujo de creación sí se comprueba `if (res)` antes
  de redirigir (aunque, como `ApiResponse<T>` siempre es un objeto — nunca
  `undefined`/`null` — salvo que `storeSupplier` lance una excepción no
  controlada, esa comprobación es efectivamente un no-op: `res` siempre es
  truthy incluso cuando `res.error` o `res.errors` están poblados).

- **`type_identification: 'otro'` en el schema es inalcanzable desde la
  UI**: `supplierSchema` (`schemas/supplier.schema.ts:5`) acepta
  `z.enum(['cédula', 'ruc', 'otro'])`, pero:
  - El tipo `Supplier` (`types/supplier.d.ts:14`) solo declara
    `'cédula' | 'ruc'`.
  - El `optionType` del formulario (`SupplierForm.tsx:9-12`) solo ofrece
    "Cédula" y "RUC".
  - El `useEffect` de auto-resolución (`useSupplierForm.ts:88`) solo
    contempla `'cédula'` y `'ruc'`.
  
  Es decir, `'otro'` es una rama de validación muerta (o preparada para un
  futuro tipo de identificación, p. ej. pasaporte) que no tiene forma de
  activarse desde el formulario actual, y que además — de alcanzarse
  alguna vez — no tendría restricción de longitud de dígitos (solo el
  regex general).

- **Typo consistente `identication`**: el campo se llama `identication` en
  todo el código (tipo, schema, hook, componente, servicios) en vez de
  `identification`. No es un bug funcional (es consistente en frontend), pero
  vale la pena confirmarlo contra el contrato real del backend/Laravel para
  evitar que un cambio futuro de naming rompa la integración.

- **No hay manejo de "no hay identificación completa todavía" en el efecto
  de resolución**: si el usuario borra un dígito de una identificación ya
  resuelta (p. ej. pasa de 13 a 12 dígitos en un RUC), el `useEffect`
  simplemente no vuelve a dispararse, pero los campos ya autocompletados
  (`name`, `address`, etc.) no se limpian — quedan con los datos del
  proveedor previamente resuelto aunque la identificación mostrada en
  pantalla ya no corresponda a esos datos.
