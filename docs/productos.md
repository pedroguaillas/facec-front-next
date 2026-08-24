# Módulo Productos

Documentación funcional del formulario de creación/edición de productos.
Ubicación del código: `app/(route)/products/`.

## Entidad `Product`

Definida en `types/product.d.ts`.

| Campo        | Tipo               | Notas                                                     |
|--------------|---------------------|------------------------------------------------------------|
| `id`         | `string`            | `nanoid()` en creación; en edición se castea el id numérico del backend a string |
| `code`       | `string`            | Requerido, máx. 25 caracteres                              |
| `aux_cod`    | `string?`           | Código de categoría SRI seleccionada (`SriCategory.code`)  |
| `type_product` | `number`          | `1` = Producto, `2` = Servicio (ver `useProductForm.optionType`) |
| `name`       | `string`            | Requerido, mín. 3 / máx. 300 caracteres                    |
| `unity_id`   | `number?`           | No se usa actualmente en el formulario                     |
| `iva`        | `number`            | Código de tarifa IVA (catálogo `ivaTaxes`); `5` = tarifa "IVA 5%" |
| `ice`        | `string?`           | Código ICE, solo si `iceCataloges` trae opciones            |
| `stock`      | `number?`           |                                                              |
| `price1`     | `string \| number`  | Precio sin impuestos                                        |

## Carga inicial del formulario

`ProductFormContext.tsx` obtiene, vía `getCreateProduct` / `getEditProduct`
(`services/productServices.ts`), un `ProductCreateResponse`:

```ts
interface ProductCreateResponse {
  ivaTaxes: [];
  iceCataloges: [];
  sriCategories: SriCategory[];
  transport: boolean;
}
```

- `ivaTaxes`: catálogo de tarifas IVA para el select "Imp. al IVA".
- `iceCataloges`: catálogo ICE; el select "Imp. al ICE" solo se renderiza si
  `iceCataloges.length > 0`.
- `sriCategories`: catálogo de categorías SRI (`{ code, type, description }`),
  ya viene filtrado/habilitado desde el backend según configuración de la
  empresa.
- `transport`: flag booleano de la empresa que indica si tiene habilitado el
  servicio de transporte (no depende del producto puntual, es una
  configuración global recibida del backend).

## Lógica de categorías SRI (`aux_cod`)

Componentes involucrados: `ProductForm.tsx` (visibilidad del selector),
`SelectSriCategory.tsx` (botón + input de búsqueda) y
`SelectModalSriCategory.tsx` (modal con filtro y listado).

### 1. Visibilidad del selector (`ProductForm.tsx`)

El bloque `SelectSriCategory` se muestra si se cumple **alguna** de estas
condiciones:

| Condición                                                                 | Caso de negocio                                              |
|----------------------------------------------------------------------------|----------------------------------------------------------------|
| `transport === true`                                                       | Empresa tiene habilitado transporte (flag global del backend) |
| `product.iva === 5`                                                        | Producto con tarifa IVA 5% (requiere categoría tipo `ferreteria`) |
| `product.type_product === 2 && sriCategories.some(sc => sc.type === 'transporte')` | Producto tipo **Servicio** y el catálogo trae categorías tipo `transporte` |

> La tercera condición fue agregada para cubrir el caso: *"al registrar un
> producto tipo Servicio, si existen `sriCategories` de tipo `transporte`,
> deben poder seleccionarse"*, independientemente del flag `transport` de la
> empresa.

### 2. Filtro dentro del modal (`SelectModalSriCategory.tsx`)

Sobre `sriCategories`, se filtra por texto de búsqueda (código o descripción)
y por tipo, con esta lógica combinada (`matchesType`):

```ts
const matchesType =
  (product.iva === 5 && sriCategory.type === 'ferreteria') ||
  (transport && sriCategory.type === 'transporte') ||
  (product.type_product === 2 && sriCategory.type === 'transporte');
```

Resumen de reglas:

- **Producto + IVA 5%** → solo categorías `type === 'ferreteria'`.
- **Empresa con transporte habilitado (`transport`)** → categorías
  `type === 'transporte'` (sin importar `type_product`).
- **Servicio (`type_product === 2`) con categorías `transporte` disponibles**
  → categorías `type === 'transporte'` (sin importar el flag `transport`).

> Se eliminó la rama `(product.iva === 5 && transport)` que mostraba ambos
> tipos de categoría a la vez. Por regla de negocio `ferreteria` aplica
> exclusivamente a `type_product === 1` (Producto) y `transporte` a
> `type_product === 2` (Servicio); dado que `type_product` es un valor único
> por producto, un mismo registro nunca debe mostrar ambos tipos
> simultáneamente. La rama era código muerto o, en el peor caso, incorrecta
> (podía filtrar categorías `transporte` para un registro tipo Producto solo
> porque la empresa tiene `transport` habilitado como flag global).

### 3. Selección

`SelectSriCategory` abre el modal, al hacer click en una fila llama
`selectSriCategory(sriCategory)` que hace `setProduct({ ...prev, aux_cod: sriCategory.code })`
y muestra la descripción en el input de búsqueda como label.

### ⚠️ Nota de validación pendiente

El schema Zod (`schemas/product.schema.ts`) solo exige `aux_cod` cuando
`iva === 5`:

```ts
.refine(
  (data) => data.iva !== 5 || (data.aux_cod && data.aux_cod.trim() !== ""),
  { path: ['aux_cod'], message: 'Código auxiliar requerido si el IVA es 5%' }
);
```

No existe una regla equivalente que obligue a seleccionar `aux_cod` cuando
`type_product === 2` y aplica transporte. Es decir, el campo se **muestra**
pero no se **exige** en ese escenario — a validar con negocio si debe ser
obligatorio.

## Tipo de producto (`type_product`)

Definido en `useProductForm.ts`:

```ts
const optionType = [
  { value: 1, label: 'Producto' },
  { value: 2, label: 'Servicio' },
];
```

### Exclusión de IVA 5% para Servicio

Regla de negocio: la categoría SRI `ferreteria` (asociada a IVA 5%) es
exclusiva de `type_product === 1` (Producto); un Servicio nunca debe poder
seleccionar tarifa IVA 5%. Implementado en `ProductForm.tsx`:

```ts
const ivaTaxOptions = product.type_product === 2
    ? ivaTaxes.filter((tax: { value: number | string }) => Number(tax.value) !== 5)
    : ivaTaxes;
```

`ivaTaxOptions` reemplaza a `ivaTaxes` como `options` del select "Imp. al
IVA". Adicionalmente, `useProductForm.handleSelect` resetea `iva` a `4`
(15%) si el usuario cambia `type_product` a Servicio mientras `iva === 5`
está seleccionado, para evitar que quede un valor inválido/oculto en el
select.

## Precio y desglose de IVA

- Checkbox "¿Necesitas desglosar el IVA?" (`breakdown`, estado local en
  `useProductForm`) alterna un input adicional "Total" (precio con IVA
  incluido).
- `handleTotal` calcula el precio base a partir del total ingresado:
  `price1 = total / 1.15` (redondeado a 6 decimales), asumiendo IVA del 15%
  fijo para este cálculo — no usa el catálogo `ivaTaxes` seleccionado.
- `price1` siempre es el campo que se envía al backend; `total` es solo un
  input auxiliar de UI, no se persiste en `Product`.

## Envío del formulario (`ButtonSubmit.tsx`)

1. Clona `product` a `form`.
2. Valida con `productSchema.safeParse(form)`; si falla, mapea errores a
   `errorProduct` vía `parseZodErrors` y corta.
3. Si `params.id` existe → `updateProduct`, si no → `storeProduct`.
4. Éxito → redirige a `/products`. Error de validación backend (422) →
   `setErrorProduct(errors)`.

## Catálogos condicionales

- **ICE**: el select solo aparece si `iceCataloges.length > 0` (viene del
  backend ya filtrado según si el producto/empresa aplica ICE).
- **SRI Categoría**: ver sección anterior.

## Resumen de reglas de negocio confirmadas

1. `type_product` producto + `iva === 5` → mostrar y filtrar categorías SRI
   `ferreteria`.
2. `type_product` servicio + existen categorías `transporte` en el catálogo
   → mostrar y filtrar categorías SRI `transporte`.
3. Empresa con `transport` habilitado (flag global) → mostrar y filtrar
   categorías `transporte`, sin importar el tipo de producto.
4. `ferreteria` y `transporte` no deben mostrarse combinadas para un mismo
   producto: son mutuamente excluyentes según `type_product` (1 = Producto
   → ferreteria, 2 = Servicio → transporte).
