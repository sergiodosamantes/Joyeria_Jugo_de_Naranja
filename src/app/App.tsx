import { useState } from "react";
import { ShoppingBag, Plus, Minus, MapPin, Check } from "lucide-react";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import { useCatalog } from "../hooks/useCatalog";
import { useCartStore } from "../store/useCartStore";

export default function App() {
  const { products, loading, error } = useCatalog();
  const { bases, charms, addBase, removeBase, updateBaseQuantity, addCharm, removeCharm, updateCharmQuantity, getTotal } = useCartStore();

  const [letterInput, setLetterInput] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  // Divide products into categories
  const catalogBases = products.filter((p) => p.category === "BASE");
  const regularCharms = products.filter((p) => p.category === "CHARM_REGULAR" || p.category === "CHARM_SPECIAL");

  // Find a product that acts as the "Letter Charm". We assume its name contains "Letra"
  const letterCharmProduct = products.find((p) => p.name.toUpperCase().includes("LETRA"));
  // Exclude letter charms from regular grid if found
  const gridCharms = regularCharms.filter(p => p.id !== letterCharmProduct?.id);

  const total = getTotal();
  const totalItems = bases.reduce((acc, b) => acc + b.quantity, 0) + charms.reduce((acc, c) => acc + c.quantity, 0);

  const getBaseCount = (baseId: string) => {
    const existing = bases.find((b) => b.product.id === baseId);
    return existing ? existing.quantity : 0;
  };

  const handleBaseAdd = (baseId: string) => {
    const product = products.find((p) => p.id === baseId);
    if (!product) return;
    const existing = bases.find((b) => b.product.id === baseId);
    if (existing) updateBaseQuantity(existing.id, existing.quantity + 1);
    else addBase(product);
  };

  const handleBaseRemove = (baseId: string) => {
    const existing = bases.find((b) => b.product.id === baseId);
    if (existing) {
      if (existing.quantity > 1) updateBaseQuantity(existing.id, existing.quantity - 1);
      else removeBase(existing.id);
    }
  };

  const handleCharmAdd = (charmId: string) => {
    const product = products.find((p) => p.id === charmId);
    if (!product) return;

    const existing = charms.find((c) => c.product.id === charmId && !c.specialInstructions);
    if (existing) {
      updateCharmQuantity(existing.id, existing.quantity + 1);
    } else {
      addCharm(product);
    }
  };

  const handleCharmRemove = (charmId: string) => {
    const existing = charms.find((c) => c.product.id === charmId && !c.specialInstructions);
    if (existing) {
      if (existing.quantity > 1) {
        updateCharmQuantity(existing.id, existing.quantity - 1);
      } else {
        removeCharm(existing.id);
      }
    }
  };

  const getCharmCount = (charmId: string) => {
    const existing = charms.find((c) => c.product.id === charmId && !c.specialInstructions);
    return existing ? existing.quantity : 0;
  };

  const handleAddLetter = () => {
    const letter = letterInput.trim().toUpperCase().charAt(0);
    // If no specific letter charm product exists in the catalog, we can't add it.
    // Alternatively, we could mock one if not found. Let's assume it exists according to sheet.
    if (letter && /[A-Z]/.test(letter) && letterCharmProduct) {
      addCharm(letterCharmProduct, letter);
      setLetterInput("");
    }
  };

  const letterCharmsInCart = charms.filter((c) => c.specialInstructions);
  const regularCharmsInCart = charms.filter((c) => !c.specialInstructions);

  const buildWhatsAppMessage = () => {
    let msg = "¡Hola! Quiero hacer un pedido de *Jugo de Naranja* :)\n\n";
    if (bases.length > 0) {
      msg += `*Bases:*\n`;
      bases.forEach((b) => {
        msg += `• ${b.product.name} x${b.quantity} - $${(b.product.price * b.quantity).toFixed(2)}\n`;
      });
    }

    if (regularCharmsInCart.length > 0) {
      msg += `\n*Charms:*\n`;
      regularCharmsInCart.forEach((c) => {
        msg += `• ${c.product.name} x${c.quantity} - $${(c.product.price * c.quantity).toFixed(2)}\n`;
      });
    }

    if (letterCharmsInCart.length > 0) {
      msg += `\n*Charms de letras:*\n`;
      letterCharmsInCart.forEach((c) => {
        msg += `• Letra ${c.specialInstructions} - $${c.product.price.toFixed(2)}\n`;
      });
    }

    msg += `\n*Total: $${total.toFixed(2)}*\n\n\n\n_Nota: Entiendo que la disponibilidad de los charms puede variar. ¿Me confirmas la disponibilidad?`;
    return encodeURIComponent(msg);
  };

  const handleWhatsApp = () => {
    // Vendor's actual number
    const phone = "5213951230054";
    window.open(`https://wa.me/${phone}?text=${buildWhatsAppMessage()}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F5DC", color: "#2C2C2C" }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem" }}>Cargando catálogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center" style={{ backgroundColor: "#F5F5DC", color: "#B91C1C" }}>
        <p>Hubo un error cargando el catálogo: {error}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-28"
      style={{ backgroundColor: "#F5F5DC", fontFamily: "'Inter', sans-serif", color: "#2C2C2C" }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-4 border-b"
        style={{ backgroundColor: "#F5F5DC", borderColor: "#E0DCC8" }}
      >
        <div className="w-8" />
        <h1
          className="text-xl tracking-wide"
          style={{ fontFamily: "'Playfair Display', serif", color: "#2C2C2C" }}
        >
          Jugo de Naranja
        </h1>
        <button className="relative p-1" onClick={() => setCartOpen(!cartOpen)}>
          <ShoppingBag size={22} strokeWidth={1.5} style={{ color: "#2C2C2C" }} />
          {totalItems > 0 && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full text-white"
              style={{ fontSize: "10px", backgroundColor: "#8B6914" }}
            >
              {totalItems}
            </span>
          )}
        </button>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className="relative h-72 w-full overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1771660724436-a497a119a00c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080"
            alt="Jewelry hero"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(245,245,220,0.1) 0%, rgba(245,245,220,0.7) 85%, rgba(245,245,220,1) 100%)",
            }}
          />
        </div>
        <div className="px-6 pt-2 pb-8 text-center">
          <h2
            className="text-3xl mb-2 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: "#2C2C2C" }}
          >
            Elige y diseña tu propio{" "}
            <span style={{ fontStyle: "italic" }}>italian bracelet</span>
          </h2>
          <p className="text-sm mb-6" style={{ color: "#7A7060" }}>
            Combina bases y charms para crear tu pulsera única
          </p>
          <a
            href="#bases"
            className="inline-block px-8 py-3 rounded-full text-sm tracking-widest uppercase transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#2C2C2C", color: "#F5F5DC", letterSpacing: "0.12em" }}
          >
            Armar mi pedido
          </a>
        </div>
      </section>

      {/* ── Bases Section ── */}
      <section id="bases" className="px-5 pt-4 pb-8">
        <SectionTitle>Bases</SectionTitle>
        <p className="text-xs mb-4" style={{ color: "#7A7060" }}>
          Selecciona la base de tu pulsera
        </p>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {catalogBases.map((base) => {
            const count = getBaseCount(base.id);
            const isSelected = count > 0;
            return (
              <div
                key={base.id}
                className={`flex-shrink-0 snap-start rounded-2xl overflow-hidden transition-all ${!base.available ? "opacity-50" : ""}`}
                style={{
                  width: "200px",
                  backgroundColor: isSelected ? "#2C2C2C" : "#EEEAD8",
                  border: isSelected ? "2px solid #2C2C2C" : "2px solid transparent",
                }}
              >
                <div className="h-36 overflow-hidden">
                  <ImageWithFallback
                    src={base.imageUrl}
                    alt={base.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-3">
                  <p
                    className="text-sm mb-0.5 line-clamp-1"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: isSelected ? "#F5F5DC" : "#2C2C2C",
                    }}
                  >
                    {base.name}
                  </p>
                  <p className="text-xs mb-3" style={{ color: isSelected ? "#C8B888" : "#8B6914" }}>
                    ${base.price.toFixed(2)}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between">
                    {!base.available ? (
                      <span className="text-[10px] w-full text-center py-1.5 rounded bg-[#D0CCBA] text-[#7A7060]">Agotado</span>
                    ) : count === 0 ? (
                      <button
                        onClick={() => handleBaseAdd(base.id)}
                        className="w-full flex items-center justify-center h-8 rounded-full transition-opacity hover:opacity-80"
                        style={{ backgroundColor: "#2C2C2C", color: "#F5F5DC" }}
                      >
                        <span className="text-xs">Agregar</span>
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <button
                          onClick={() => handleBaseRemove(base.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-full transition-opacity hover:opacity-80"
                          style={{ backgroundColor: "#D0CCBA" }}
                        >
                          <Minus size={14} strokeWidth={2} style={{ color: "#2C2C2C" }} />
                        </button>
                        <span className="text-sm font-medium" style={{ color: "#F5F5DC" }}>
                          {count}
                        </span>
                        <button
                          onClick={() => handleBaseAdd(base.id)}
                          className="flex items-center justify-center w-8 h-8 rounded-full transition-opacity hover:opacity-80"
                          style={{ backgroundColor: "#D0CCBA" }}
                        >
                          <Plus size={14} strokeWidth={2} style={{ color: "#2C2C2C" }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-5 h-px" style={{ backgroundColor: "#E0DCC8" }} />

      {/* ── Charms Section ── */}
      <section className="px-5 pt-6 pb-8">
        <SectionTitle>Charms</SectionTitle>
        <p className="text-xs mb-4" style={{ color: "#7A7060" }}>
          Agrega los charms que más te gusten
        </p>
        <div className="grid grid-cols-3 gap-3">
          {gridCharms.map((charm) => {
            const count = getCharmCount(charm.id);
            return (
              <div
                key={charm.id}
                className={`rounded-2xl overflow-hidden ${!charm.available ? "opacity-50" : ""}`}
                style={{ backgroundColor: "#EEEAD8" }}
              >
                <div className="aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={charm.imageUrl}
                    alt={charm.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium line-clamp-1" style={{ color: "#7A7060" }} title={charm.name}>
                    {charm.name}
                  </p>
                  <p className="text-xs" style={{ color: "#8B6914" }}>
                    ${charm.price.toFixed(2)}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between">
                    {!charm.available ? (
                      <span className="text-[10px] w-full text-center py-1 rounded bg-[#D0CCBA] text-[#7A7060]">Agotado</span>
                    ) : count === 0 ? (
                      <button
                        onClick={() => handleCharmAdd(charm.id)}
                        className="w-full flex items-center justify-center h-7 rounded-full transition-opacity hover:opacity-80"
                        style={{ backgroundColor: "#2C2C2C" }}
                      >
                        <Plus size={14} strokeWidth={2} style={{ color: "#F5F5DC" }} />
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <button
                          onClick={() => handleCharmRemove(charm.id)}
                          className="flex items-center justify-center w-7 h-7 rounded-full transition-opacity hover:opacity-70"
                          style={{ backgroundColor: "#D0CCBA" }}
                        >
                          <Minus size={12} strokeWidth={2} style={{ color: "#2C2C2C" }} />
                        </button>
                        <span className="text-xs font-medium" style={{ color: "#2C2C2C" }}>
                          {count}
                        </span>
                        <button
                          onClick={() => handleCharmAdd(charm.id)}
                          className="flex items-center justify-center w-7 h-7 rounded-full transition-opacity hover:opacity-80"
                          style={{ backgroundColor: "#2C2C2C" }}
                        >
                          <Plus size={12} strokeWidth={2} style={{ color: "#F5F5DC" }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-5 h-px" style={{ backgroundColor: "#E0DCC8" }} />

      {/* ── Charms de Letras ── */}
      {letterCharmProduct && (
        <section className="px-5 pt-6 pb-8">
          <SectionTitle>Charms de Letras</SectionTitle>
          <p className="text-xs mb-4" style={{ color: "#7A7060" }}>
            Personaliza con tus iniciales · ${letterCharmProduct.price.toFixed(2)} c/u
          </p>

          <div className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: "#EEEAD8" }}>
            <div className="h-32 overflow-hidden bg-[#D0CCBA]">
              <ImageWithFallback
                src={letterCharmProduct.imageUrl || "https://images.unsplash.com/photo-1660246156333-eea5fc75b540?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"}
                alt="Letter charms"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={1}
                  value={letterInput}
                  onChange={(e) => setLetterInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleAddLetter()}
                  placeholder="Ingresa tu letra"
                  disabled={!letterCharmProduct.available}
                  className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none border disabled:opacity-50"
                  style={{
                    backgroundColor: "#F5F5DC",
                    borderColor: "#D0CCBA",
                    color: "#2C2C2C",
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <button
                  onClick={handleAddLetter}
                  disabled={!letterCharmProduct.available || !letterInput}
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-opacity hover:opacity-80 flex-shrink-0 disabled:opacity-50"
                  style={{ backgroundColor: "#2C2C2C" }}
                >
                  <Plus size={18} strokeWidth={2} style={{ color: "#F5F5DC" }} />
                </button>
              </div>

              {/* Selected letters */}
              {letterCharmsInCart.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {letterCharmsInCart.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleRemoveLetter(item.id)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-opacity hover:opacity-70"
                      style={{ backgroundColor: "#2C2C2C", color: "#F5F5DC" }}
                    >
                      {item.specialInstructions}
                      <span className="text-xs opacity-60">×</span>
                    </button>
                  ))}
                </div>
              )}
              {!letterCharmProduct.available && (
                <p className="mt-2 text-xs text-red-600">Este producto está agotado temporalmente.</p>
              )}
            </div>
          </div>

          {letterCharmsInCart.length > 0 && (
            <p className="text-xs text-right" style={{ color: "#8B6914" }}>
              {letterCharmsInCart.length} letra{letterCharmsInCart.length !== 1 ? "s" : ""} · $
              {(letterCharmsInCart.length * letterCharmProduct.price).toFixed(2)}
            </p>
          )}
        </section>
      )}

      {/* ── Order Summary (if items selected) ── */}
      {totalItems > 0 && (
        <section className="mx-5 mb-6 rounded-2xl p-4" style={{ backgroundColor: "#EEEAD8" }}>
          <p
            className="text-sm mb-3"
            style={{ fontFamily: "'Playfair Display', serif", color: "#2C2C2C" }}
          >
            Tu pedido
          </p>
          <div className="space-y-1.5">
            {bases.map((b) => (
              <div key={b.id} className="flex justify-between text-xs" style={{ color: "#2C2C2C" }}>
                <span>{b.product.name} × {b.quantity}</span>
                <span>${(b.product.price * b.quantity).toFixed(2)}</span>
              </div>
            ))}
            {regularCharmsInCart.map((c) => (
              <div key={c.id} className="flex justify-between text-xs" style={{ color: "#2C2C2C" }}>
                <span>
                  {c.product.name} × {c.quantity}
                </span>
                <span>${(c.product.price * c.quantity).toFixed(2)}</span>
              </div>
            ))}
            {letterCharmsInCart.length > 0 && letterCharmProduct && (
              <div className="flex justify-between text-xs" style={{ color: "#2C2C2C" }}>
                <span>Letras: {letterCharmsInCart.map((l) => l.specialInstructions).join(", ")}</span>
                <span>${(letterCharmsInCart.length * letterCharmProduct.price).toFixed(2)}</span>
              </div>
            )}
            <div
              className="pt-2 mt-2 border-t flex justify-between text-sm"
              style={{ borderColor: "#D0CCBA", color: "#2C2C2C" }}
            >
              <span style={{ fontFamily: "'Playfair Display', serif" }}>Total</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Sticky Bottom Bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 px-5 py-4 border-t"
        style={{
          backgroundColor: "#F5F5DC",
          borderColor: "#E0DCC8",
          boxShadow: "0 -4px 24px rgba(44,44,44,0.08)",
        }}
      >
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {/* Total */}
          <div>
            <p className="text-xs" style={{ color: "#7A7060" }}>
              Total
            </p>
            <p
              className="text-lg"
              style={{ fontFamily: "'Playfair Display', serif", color: "#2C2C2C" }}
            >
              ${total.toFixed(2)}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={10} strokeWidth={2} style={{ color: "#8B6914" }} />
              <p className="text-xs" style={{ color: "#8B6914" }}>
                Entrega en ITESO
              </p>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <button
            onClick={handleWhatsApp}
            disabled={total === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-full transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: "#25D366", color: "#fff" }}
          >
            <WhatsAppIcon />
            <span className="text-sm font-medium">Pedir por WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-xl mb-1"
      style={{ fontFamily: "'Playfair Display', serif", color: "#2C2C2C" }}
    >
      {children}
    </h3>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
