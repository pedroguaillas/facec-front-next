# Módulo Clientes

Documentación funcional del listado y formulario de creación/edición de
clientes. Ubicación del código: `app/(route)/customers/`.

Estructura real encontrada:

```
app/(route)/customers/
  page.tsx                          # Listado
  create/page.tsx                   # Crear
  [id]/page.tsx                     # Editar
  components/
    CustomersFilter.tsx             # Buscador (search)
    CustomersTable.tsx              # Tabla + eliminar
    index.ts
  context/
    CustomersContext.tsx            # Estado del listado (paginación, búsqueda)
  hooks/
    useCustomerForm.ts               # Estado del formulario (create/edit)
  services/
    customersServices.ts             # getCustomers, getCustomer, deleteCustomer
  shared/
    CustomerForm.tsx                 # Formulario (create y edit)
    ButtonSubmit.tsx                 # Botón submit con useFormStatus
```

No existen subcarpetas `hooks/` con más de un hook, ni `context/` para el
formulario (a diferencia de Productos, que usa `ProductFormContext`, Clientes
usa un hook simple `useCustomerForm`). Tampoco hay archivo de constantes
propio del módulo — usa `constants/initialValues.ts` (global) para el valor
inicial del formulario.

El servicio de creación/edición/búsqueda de cliente **no** vive en
`app/(route)/customers/services/` sino en el servicio global
`services/customerServices.ts` (`storeCustomer`, `updateCustomer`,
`findCustomerByIdentification`); el servicio local
`app/(route)/customers/services/customersServices.ts` solo cubre listado
(`getCustomers`), detalle (`getCustomer`) y borrado (`deleteCustomer`).

## Entidad `Customer`

Definida en `types/customer.d.ts:12-20`.

| Campo                 | Tipo                    | Notas                                                                 |
|-----------------------|-------------------------|------------------------------------------------------------------------|
| `id`                  | `string`                 | Vacío en creación; id del backend (casteado a string) en edición       |
| `type_identification` | `'cédula' \| 'ruc' \| 'pasaporte'` | Coincide con las 3 opciones del `<select>` del formulario |
| `identication`        | `string`                 | Sin sufijo "-ion" doble en el nombre del campo (typo original: `identication`, no `identification`), usado tal cual en todo el código |
| `name`                 | `string`                 | Requerido                                                              |
| `address`              | `string?`                | Opcional en el tipo, pero **requerido en el UI** (`required` en `TextInput`, `CustomerForm.tsx:75`) |
| `phone`                | `string?`                | Opcional                                                                |
| `email`                | `string?`                | Opcional                                                                |
| `branch_id`            | `number?`                | No es un campo propio del cliente que se edite; se usa como bandera de respuesta del endpoint `customers/resolve/{identificacion}` para saber si el cliente ya existe en otra sucursal (`Customer.branch_id`, comentario en `types/customer.d.ts:20`: *"Utilizo para recuperar un customer del SRI o base de datos"*) |

Tipo auxiliar para el listado, `CustomerProps` (`types/customer.d.ts:1-10`):
la fila de la tabla llega envuelta en `atts` (`identication`, `name`,
`address`, `phone`, `email`), patrón típico de un resource de Laravel.

## Carga inicial del formulario

No hay endpoint de "create"/"edit" que traiga catálogos (a diferencia de
Productos con `ProductCreateResponse`). El formulario de clientes no consume
catálogos externos; solo tiene un `optionType` **hardcodeado en el propio
componente** (`CustomerForm.tsx:46-50`):

```ts
const optionType = [
    { label: 'Cédula', value: 'cédula' },
    { label: 'RUC', value: 'ruc' },
    { label: 'Pasaporte', value: 'pasaporte' },
]
```

Flujo de carga de datos (`useCustomerForm.ts`):

1. **Modo edición** (`params.id` es string): `useEffect` (líneas 24-37) llama
   `getCustomer(axiosAuth, params.id)` y carga el cliente completo en el
   estado. Al hacerlo, marca `setSkiFetch(true)` — esto desactiva el
   auto-lookup por identificación descrito abajo, para no disparar la
   búsqueda por cédula/RUC mientras se está editando un registro existente.
2. **Modo creación**: no hay fetch inicial; el estado arranca en
   `initialCustomer` (`constants/initialValues.ts:53-58`):
   ```ts
   export const initialCustomer: Customer = {
     id: '',
     type_identification: 'cédula',
     identication: '',
     name: '',
   };
   ```
   `type_identification` inicia siempre en `'cédula'`.

## Lógica condicional importante

### 1. Autocompletado / bloqueo por identificación ya registrada (`useCustomerForm.ts:39-61`)

Cuando el usuario está **creando** un cliente (`skiFetch === false`) y
escribe una identificación cuya longitud coincide con el tipo seleccionado,
se dispara una búsqueda contra `findCustomerByIdentification` (endpoint
`customers/resolve/{identificacion}`, `services/customerServices.ts:5-9`):

```ts
if (!skiFetch && ((customer.type_identification === 'cédula' && identication.length === 10)
                || (customer.type_identification === 'ruc' && identication.length === 13))) {
    handleCustom();
}
```

Dentro de `handleCustom`:

```ts
const { data } = await findCustomerByIdentification(axiosAuth, customer.identication);
if (data) {
    if (data.branch_id !== 0) {
        setErrors({ identication: 'El cliente ya esta registrado' })
        return;
    }
    const { name, address, email, phone } = data
    setCustomer(prev => ({ ...prev, name, address, email, phone }));
}
```

| Condición                                   | Efecto                                                                 |
|----------------------------------------------|--------------------------------------------------------------------------|
| `type_identification === 'cédula'` y 10 dígitos escritos | Dispara `findCustomerByIdentification`                          |
| `type_identification === 'ruc'` y 13 dígitos escritos    | Dispara `findCustomerByIdentification`                          |
| `type_identification === 'pasaporte'` (u otro)           | **Nunca** dispara el lookup, sin importar la longitud (no está en el `if`) |
| Respuesta con `branch_id !== 0`                          | El cliente ya existe en otra sucursal → error en `identication`, no se autocompleta nada |
| Respuesta con `branch_id === 0`                          | Se autocompletan `name`, `address`, `email`, `phone` desde la respuesta (dato existente en SRI/BD pero aún no vinculado a esta sucursal) |
| `skiFetch === true` (estamos en modo edición)             | El efecto no hace nada — se evita sobrescribir el registro que se está editando |

Este efecto se re-ejecuta en cada cambio de `customer.identication` /
`customer.type_identification` mientras las condiciones de longitud se
cumplan (no hay debounce ni bandera de "ya se hizo la búsqueda para este
valor", por lo que en teoría podría repetirse la llamada si el usuario borra
y vuelve a escribir el mismo valor).

### 2. Longitud máxima del input de identificación según tipo (`CustomerForm.tsx:65`)

```tsx
<TextInput ... maxLength={customer.type_identification === 'cédula' ? 10 : 13} ... />
```

| `type_identification` | `maxLength` aplicado |
|------------------------|-----------------------|
| `cédula`                | 10                     |
| `ruc`                   | 13 (por ser el `else`) |
| `pasaporte`              | 13 (cae en el mismo `else`, no tiene un límite propio) |

### 3. Validación Zod condicional por tipo de identificación (`schemas/customer.schema.ts`)

```ts
export const customerSchema = z.object({
    type_identification: z.enum(['cédula', 'ruc', 'pasaporte']),
    identication: z.string().min(1, 'La identificación es requerida'),
    name: z.string().min(3, "Nombre del cliente requerido").max(300, "Máximo 300 caracteres"),
    address: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    phone: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
    email: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
}).superRefine((data, ctx) => {
    if (data.type_identification === 'cédula') {
        if (!/^\d+$/.test(data.identication)) {
            ctx.addIssue({ path: ['identication'], message: 'La cédula debe contener solo números', code: z.ZodIssueCode.custom });
        } else if (data.identication.length !== 10) {
            ctx.addIssue({ path: ['identication'], message: 'La cédula debe tener exactamente 10 dígitos', code: z.ZodIssueCode.custom });
        }
    }
    if (data.type_identification === 'ruc') {
        if (!/^\d+$/.test(data.identication)) {
            ctx.addIssue({ path: ['identication'], message: 'El RUC debe contener solo números', code: z.ZodIssueCode.custom });
        } else if (data.identication.length !== 13) {
            ctx.addIssue({ path: ['identication'], message: 'El RUC debe tener exactamente 13 dígitos', code: z.ZodIssueCode.custom });
        }
    }
    if (data.type_identification === 'pasaporte' && data.identication.length > 13) {
        ctx.addIssue({ path: ['identication'], message: 'El pasaporte debe tener máximo 13 caracteres', code: z.ZodIssueCode.custom });
    }
});
```

| `type_identification` | Regla aplicada |
|------------------------|----------------|
| `cédula`                | Solo dígitos + exactamente 10 |
| `ruc`                   | Solo dígitos + exactamente 13 |
| `pasaporte`              | Alfanumérico permitido (sin regex de dígitos), máximo 13 caracteres, sin mínimo propio |

`'otro'` fue eliminado del enum: no correspondía a ningún caso de negocio real
y no era seleccionable desde el `<select>`. **Consumidor Final** tampoco se
agrega como opción de este formulario — es un contribuyente que se crea una
única vez (flujo aparte, ver botón "Crear consumidor final?" en
`app/(route)/settings/branches/components/ModalFormBranch.tsx:87`) y luego no
se vuelve a crear ni editar desde Clientes, ya que su identificación es un
valor predefinido fijo por el sistema.

`address`, `phone`, `email` usan `emptyStringToNull` como preprocesador:
cualquier string vacío enviado desde el `FormData` se normaliza a `null`
antes de validar, y luego son opcionales/nullable — es decir, a nivel de
Zod ninguno de los tres es obligatorio (la obligatoriedad de `address` que
se ve en el HTML —`required` en `CustomerForm.tsx:75`— es solo una
validación del navegador (HTML5 `required`), no está reforzada en el
schema Zod ni en el tipo `Customer`).

"Consumidor Final" tampoco se agrega como opción del `<select>` de tipo de
identificación de este formulario (se crea una única vez desde otro flujo,
ver más abajo). Pero **sí existe bloqueo de edición** para ese cliente en el
listado (ver §5, "Bloqueo de edición de Consumidor Final").

### 4. Sin flags que muestren/oculten campos dinámicamente

A diferencia de Productos (selector SRI condicional, ICE condicional), el
formulario de Clientes **no tiene campos que aparezcan/desaparezcan** según
otros valores. Todos los campos (`type_identification`, `identication`,
`name`, `address`, `phone`, `email`) están siempre visibles; lo único que
cambia dinámicamente es el `maxLength` del campo `identication` (punto 2) y
el disparo del autocompletado (punto 1).

### 5. Bloqueo de edición de Consumidor Final

Constante `CONSUMIDOR_FINAL_IDENTICATION = '9999999999999'`
(`constants/customers.ts`), compartida con el aviso de límite $50 en Ventas
(`docs/ventas.md` §3.6).

- **Listado** (`CustomersTable.tsx`): el botón/ícono de editar no se
  renderiza para la fila cuyo `customer.atts.identication ===
  CONSUMIDOR_FINAL_IDENTICATION` — solo queda disponible el botón eliminar.
- **Edición directa por URL** (`hooks/useCustomerForm.ts`): al cargar
  `/customers/{id}`, si `getCustomer` devuelve un cliente con esa
  identificación, se hace `redirect('/error?message=...')` (misma página de
  error usada en `products`/`companies`) antes de poblar el formulario —
  evita editar el registro navegando directo a la URL, sin depender de que
  el botón de la lista esté oculto.

## Envío del formulario (`CustomerForm.tsx:20-44`, vía `useActionState`)

1. El formulario usa `useActionState` con `formAction` (Server Action-like,
   pero ejecuta en cliente por `"use client"`), recibe un `FormData`.
2. Convierte el `FormData` a objeto plano, aplicando `.trim()` a cada valor
   string:
   ```ts
   const customer = Object.fromEntries(
       Array.from(queryData.entries()).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
   );
   ```
3. Valida con `customerSchema.safeParse(customer)`. Si falla:
   `setErrors(parseZodErrors(parsed.error))` y corta (no llama al backend).
4. Si pasa, decide **store vs update** según si hay `params.id` (viene de la
   ruta `[id]/page.tsx`):
   ```ts
   const response = params?.id
       ? await updateCustomer(params.id + '', axiosAuth, parsed.data)
       : await storeCustomer(axiosAuth, parsed.data);
   ```
5. Si `response.errors` existe (errores 422 de Laravel, ya aplanados por
   `handleApiRequest` en `helpers/apiHandler.ts`), se cargan en `setErrors` y
   se corta.
6. Si no hay errores, `router.push('/customers')` — redirige al listado.

`ButtonSubmit.tsx` solo consume `useFormStatus()` para deshabilitar/mostrar
loading en el botón "Guardar" (`action='store'` fijo tanto en creación como
en edición, no cambia el label según el modo).

### Listado y borrado

- `CustomersContext.tsx` maneja `search` y `page`, dispara `fetchCustomers`
  en un `useEffect` cada vez que cambian (dependencias del `useCallback`).
  La URL de página incluye `&search=` solo si `search` tiene valor
  (`CustomersContext.tsx:43-45`).
- El borrado (`CustomersTable.tsx`) usa el `axiosAuth` importado directamente
  de `lib/axios.ts` (instancia singleton) en lugar del hook
  `useAxiosAuth()` que sí usa el resto del módulo — inconsistencia menor, ver
  ⚠️ Observaciones.
- Tras confirmar el borrado (`Dialog` de confirmación), se limpia
  `customerDeleteId` y se vuelve a llamar `fetchCustomers()` para refrescar
  la tabla.

## Resumen de reglas de negocio confirmadas

1. `type_identification` admite exactamente 3 valores, alineados entre UI,
   tipo TS y Zod: `cédula`, `ruc`, `pasaporte` (`CustomerForm.tsx:46-50`).
   `Consumidor Final` no es una opción de este formulario — se crea una sola
   vez desde otro flujo (branch settings) y no vuelve a crearse/editarse aquí.
2. Cédula → identificación debe tener exactamente 10 dígitos numéricos
   (validado en input `maxLength=10` y en Zod `superRefine`).
3. RUC → identificación debe tener exactamente 13 dígitos numéricos
   (validado en input `maxLength=13` y en Zod `superRefine`).
4. Pasaporte → permite letras y números (sin regex de solo-dígitos), máximo
   13 caracteres, sin longitud mínima propia.
5. Al crear un cliente (no editar) con cédula completa (10 dígitos) o RUC
   completo (13 dígitos), se dispara automáticamente una búsqueda contra
   `customers/resolve/{identificacion}`:
   - Si el cliente ya está registrado en otra sucursal (`branch_id !== 0`),
     se bloquea el campo `identication` con el error "El cliente ya esta
     registrado".
   - Si no (`branch_id === 0`), se autocompletan `name`, `address`, `email`,
     `phone` con los datos devueltos (SRI o base de datos existente).
6. En modo edición, el autocompletado por identificación nunca se dispara
   (`skiFetch = true` tras cargar el cliente vía `getCustomer`).
7. `address`, `phone`, `email` son opcionales en el tipo y en Zod, aunque
   `address` se marca como `required` a nivel de HTML en el formulario.
8. Envío: `customerSchema.safeParse` primero (bloquea el submit si falla);
   si pasa, `storeCustomer` o `updateCustomer` según exista `params.id`;
   errores 422 del backend se mapean 1 a 1 sobre los mismos campos del
   formulario.
9. El cliente "Consumidor Final" (`identication === '9999999999999'`, ver
   §5) no puede editarse: sin botón en el listado, y bloqueado por
   `redirect` si se navega directo a `/customers/{id}`.

## ⚠️ Observaciones

> Los dos puntos siguientes (tipo incompleto y regex de pasaporte) fueron
> corregidos: `types/customer.d.ts`, `schemas/customer.schema.ts`.

- **Consumidor Final no se crea/edita desde este módulo** (intencional,
  confirmado con negocio): se crea una única vez desde otro flujo (hay un
  botón "Crear consumidor final?" en
  `app/(route)/settings/branches/components/ModalFormBranch.tsx:87`, de
  configuración de sucursales). Lo que sí vive en este módulo desde esta
  auditoría es el **bloqueo de edición** (§5): botón oculto en la lista +
  `redirect` a `/error` si se entra directo a `/customers/{id}`.

- **`axiosAuth` inconsistente en `CustomersTable.tsx`**: importa la
  instancia global `axiosAuth` de `lib/axios.ts` directamente
  (`CustomersTable.tsx:5`) en lugar de usar el hook `useAxiosAuth()` que sí
  usan `CustomersContext.tsx` y `useCustomerForm.ts`. Si el interceptor de
  token depende del hook (p. ej. para refrescar el token en cliente), el
  borrado podría no llevar el mismo tratamiento de autenticación que el
  resto de las peticiones del módulo.

- **Posible refetch repetido en el autocompletado**
  (`useCustomerForm.ts:39-61`): el `useEffect` no lleva ninguna bandera de
  "ya se consultó este valor", por lo que si el usuario borra y vuelve a
  escribir la misma cédula/RUC completos, `findCustomerByIdentification` se
  vuelve a ejecutar. No es necesariamente un bug, pero no hay
  debounce/memoización visible.

- **Nombre de campo con typo consistente**: `identication` (no
  `identification`) se usa igual en `types/customer.d.ts`,
  `schemas/customer.schema.ts`, `CustomerForm.tsx`, `useCustomerForm.ts` y
  los servicios — es consistente en todo el módulo, así que no rompe nada,
  pero es una desviación del inglés correcto que vale la pena tener en
  cuenta si se refactoriza.

- **`ButtonSubmit` no distingue creación de edición**: el label es
  siempre "Guardar" y `action='store'` es fijo
  (`app/(route)/customers/shared/ButtonSubmit.tsx:15`), sin variar entre
  `create` y `edit` como sí podría esperarse por el patrón de otros módulos
  (p. ej. Productos usa `action='store'` también fijo, así que podría ser
  el patrón intencional del proyecto y no un bug propio de Clientes).
