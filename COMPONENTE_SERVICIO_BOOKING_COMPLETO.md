# 🎨 Componente: ServiceBookingForm Completo

## 📐 Estructura del Componente

```typescript
interface ServiceBookingFormProps {
  serviceId: string;
  serviceName: string;
  formData: ServiceFormData; // Del formulario anterior
  priceEstimate: PriceEstimate; // Cotización calculada
  onComplete: (bookingData: ServiceBookingData) => void;
}

interface ServiceBookingData {
  // Datos del usuario
  userId?: string;
  isNewUser: boolean;
  personalData?: {
    name: string;
    email: string;
    phone: string;
  };
  
  // Ubicación
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: { lat: number; lng: number };
  };
  
  // Fecha y hora
  scheduledDate: string;
  scheduledTime: string;
  
  // Cupón
  couponCode?: string;
  discount?: number;
  
  // Condiciones aceptadas
  conditionsAccepted: boolean;
  
  // Servicios adicionales
  additionalServices?: string[];
  
  // Precio final
  finalPrice: number;
}
```

## 🎨 Diseño Visual

### Layout Principal:

```
┌─────────────────────────────────────────────────────────────┐
│  ← Volver                                                    │
│                                                              │
│  Instalación de Contactos                                   │
│                                                              │
│  ┌──────────────────────────┐  ┌─────────────────────────┐ │
│  │ Formulario de Reserva    │  │ Resumen del Servicio    │ │
│  │                          │  │                         │ │
│  │ 1. Cuenta                │  │ Precio Base: $800       │ │
│  │ [👥] Nuevo usuario       │  │ Materiales: $450        │ │
│  │ [👥] Ya tengo cuenta     │  │ Descuento: -$100        │ │
│  │                          │  │ ────────────────────    │ │
│  │ 2. Ubicación             │  │ Precio Final: $1,150    │ │
│  │ [📍] Agregar dirección   │  │                         │ │
│  │                          │  │ [Condiciones del        │ │
│  │ 3. Fecha y Hora          │  │  servicio]              │ │
│  │ [📅] Seleccionar día     │  │                         │ │
│  │ [🕐] Seleccionar hora    │  │ [Confirmar Servicio]    │ │
│  │                          │  │                         │ │
│  │ 4. Cupón (opcional)      │  │                         │ │
│  │ [🔍] Código de cupón     │  │                         │ │
│  │                          │  │                         │
│  └──────────────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Implementación de Componentes

### 1. AccountSection Component

```typescript
export function AccountSection({
  isAuthenticated,
  onNewUser,
  onExistingUser,
}: {
  isAuthenticated: boolean;
  onNewUser: () => void;
  onExistingUser: () => void;
}) {
  if (isAuthenticated) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Sesión iniciada</p>
            <p className="text-sm text-gray-600">Tus datos están guardados</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cuenta</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onNewUser}
          className="flex items-center space-x-4 p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faUserPlus} className="text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Agregar datos personales</p>
            <p className="text-sm text-gray-600">Registro rápido</p>
          </div>
        </button>

        <button
          onClick={onExistingUser}
          className="flex items-center space-x-4 p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Ya tengo cuenta</p>
            <p className="text-sm text-gray-600">Iniciar sesión</p>
          </div>
        </button>
      </div>
    </div>
  );
}
```

### 2. LocationSection Component

```typescript
export function LocationSection({
  onAddressSelect,
  initialAddress,
}: {
  onAddressSelect: (address: Address) => void;
  initialAddress?: Address;
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        ¿Dónde quieres tu servicio?
      </h3>
      
      {addresses.length > 0 && (
        <div className="space-y-2">
          {addresses.map((address, index) => (
            <button
              key={index}
              onClick={() => onAddressSelect(address)}
              className="w-full p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-500 text-left"
            >
              <div className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-purple-600 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">{address.street}</p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAddressForm(true)}
        className="w-full p-6 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center justify-center space-x-3"
      >
        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-purple-600" />
        <span className="font-semibold text-gray-900">Agregar una nueva dirección</span>
      </button>

      {showAddressForm && (
        <AddressForm
          onSave={(address) => {
            setAddresses([...addresses, address]);
            onAddressSelect(address);
            setShowAddressForm(false);
          }}
          onCancel={() => setShowAddressForm(false)}
        />
      )}
    </div>
  );
}
```

### 3. DateTimeSelector Component

```typescript
export function DateTimeSelector({
  onDateTimeSelect,
  minDate,
}: {
  onDateTimeSelect: (date: string, time: string) => void;
  minDate?: Date;
}) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Cargar horarios disponibles cuando se selecciona fecha
  useEffect(() => {
    if (selectedDate) {
      loadAvailableTimeSlots(selectedDate).then(setAvailableSlots);
    }
  }, [selectedDate]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Fecha y Hora</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccione un día
          </label>
          <input
            type="date"
            min={minDate?.toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTime(""); // Reset time when date changes
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccione una hora
          </label>
          <select
            value={selectedTime}
            onChange={(e) => {
              setSelectedTime(e.target.value);
              onDateTimeSelect(selectedDate, e.target.value);
            }}
            disabled={!selectedDate}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
          >
            <option value="">Seleccione una hora</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedDate && selectedTime && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            ✓ Servicio programado para {formatDate(selectedDate)} a las {selectedTime}
          </p>
        </div>
      )}
    </div>
  );
}
```

### 4. CouponInput Component

```typescript
export function CouponInput({
  onCouponApplied,
}: {
  onCouponApplied: (discount: number) => void;
}) {
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [discount, setDiscount] = useState(0);

  const validateCoupon = async (code: string) => {
    if (!code.trim()) return;

    setIsValidating(true);
    try {
      const response = await fetch(`/api/coupons/validate?code=${code}`);
      const data = await response.json();

      if (data.valid) {
        setCouponStatus("valid");
        setDiscount(data.discount);
        onCouponApplied(data.discount);
      } else {
        setCouponStatus("invalid");
        setDiscount(0);
      }
    } catch (error) {
      setCouponStatus("invalid");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        ¿Tienes un cupón de descuento?
      </h3>

      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
              setCouponStatus("idle");
            }}
            onBlur={() => validateCoupon(couponCode)}
            placeholder="Introduce el cupón aquí"
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {couponStatus === "valid" && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            ✓ Cupón aplicado: {discount}% de descuento
          </p>
        </div>
      )}

      {couponStatus === "invalid" && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-800">
            ✗ Cupón inválido o expirado
          </p>
        </div>
      )}
    </div>
  );
}
```

### 5. ServiceConditionsModal Component

```typescript
export function ServiceConditionsModal({
  isOpen,
  onClose,
  onAccept,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}) {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Condiciones del servicio base
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              El servicio base solicitado contempla:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-1" />
                <span className="text-gray-700">
                  Visita de un técnico certificado, diagnóstico previo y validación del servicio solicitado.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-1" />
                <span className="text-gray-700">
                  Instalación o reemplazo de la cantidad seleccionada.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-1" />
                <span className="text-gray-700">
                  Herramientas necesarias para realizar el servicio.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-1" />
                <span className="text-gray-700">
                  Insumos incluidos: cinta aislante, tornillos, terminales, conectores, etc.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-1" />
                <span className="text-gray-700">
                  Garantía de 7 días desde la entrega del servicio.
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-600 mt-1" />
                <span className="text-gray-700">
                  La garantía solo es en mano de obra, partes eléctricas no hay garantía.
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nuestro profesional le puede ofrecer los siguientes servicios adicionales:
            </h3>
            <ul className="space-y-2">
              {[
                "Instalación o reemplazo de unidades adicionales",
                "Instalación o reubicación de circuito eléctrico",
                "Materiales o repuestos no incluidos",
                "Entrega a domicilio de repuestos y materiales",
                "Herramientas complementarias si se requieren",
              ].map((service, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <FontAwesomeIcon icon={faPlusCircle} className="text-purple-600 mt-1" />
                  <span className="text-gray-700">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">
                He leído y acepto las{" "}
                <Link href="/terminos" className="text-purple-600 hover:underline">
                  condiciones del servicio
                </Link>
              </span>
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                if (accepted) {
                  onAccept();
                  onClose();
                }
              }}
              disabled={!accepted}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aceptar y Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 6. ServiceSummaryCard Component

```typescript
export function ServiceSummaryCard({
  priceEstimate,
  discount,
  onConfirm,
  onShowConditions,
  conditionsAccepted,
}: {
  priceEstimate: PriceEstimate;
  discount: number;
  onConfirm: () => void;
  onShowConditions: () => void;
  conditionsAccepted: boolean;
}) {
  const subtotal = priceEstimate.totalPrice;
  const discountAmount = (subtotal * discount) / 100;
  const finalPrice = subtotal - discountAmount;

  return (
    <div className="sticky top-4 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Resumen del servicio
      </h3>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-gray-700">
          <span>Mano de obra:</span>
          <span className="font-semibold">${priceEstimate.laborPrice.toLocaleString()}</span>
        </div>

        {priceEstimate.materialsPrice > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Materiales:</span>
            <span className="font-semibold">${priceEstimate.materialsPrice.toLocaleString()}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento ({discount}%):</span>
            <span className="font-semibold">-${discountAmount.toLocaleString()}</span>
          </div>
        )}

        <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-gray-900">
          <span>Precio Final:</span>
          <span className="text-purple-600">${finalPrice.toLocaleString()}</span>
        </div>
      </div>

      <button
        onClick={onShowConditions}
        className="w-full mb-4 text-sm text-purple-600 hover:text-purple-700 underline"
      >
        Ver condiciones del servicio
      </button>

      <button
        onClick={onConfirm}
        disabled={!conditionsAccepted}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        {conditionsAccepted ? "Confirmar Servicio >" : "Acepta las condiciones primero"}
      </button>

      {!conditionsAccepted && (
        <p className="mt-2 text-xs text-red-600 text-center">
          Debes aceptar las condiciones para continuar
        </p>
      )}
    </div>
  );
}
```

## 🔗 Integración con RequestServiceModal

Al confirmar el servicio, se redirige a `RequestServiceModal` con todos los datos prellenados:

```typescript
const handleConfirm = () => {
  const bookingData: ServiceBookingData = {
    // ... todos los datos recopilados
  };

  // Redirigir a dashboard con datos
  router.push(`/dashboard/client?${buildQueryString(bookingData)}`);
};
```

---

*Documento creado el 17 de enero de 2025*
*Versión: 1.0*


