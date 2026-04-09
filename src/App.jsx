import { useState, useRef, useEffect, useCallback } from "react";

// ── palette ──────────────────────────────────────────────────────────
const C = {
  jade:       "#1C5C45",
  jadeMid:    "#2A7A5C",
  jadeLight:  "#3D9970",
  jadePale:   "#E8F5EF",
  jadeFrost:  "#F2FAF6",
  white:      "#FFFFFF",
  offWhite:   "#F7FDFB",
  border:     "#C8E6D8",
  borderMid:  "#A0CCBA",
  gold:       "#C9A84C",
  goldLight:  "#F0E4BB",
  text:       "#0F2D1F",
  muted:      "#5A8070",
  danger:     "#B84040",
};

const catColors = {
  Tops:        "#3D9970",
  Bottoms:     "#2A7A5C",
  Dresses:     "#1C5C45",
  Accessories: "#C9A84C",
  Bags:        "#8FAF50",
  Shoes:       "#4A8FA0",
  Outerwear:   "#2D6B55",
  Swim:        "#5AAAB8",
  Athleisure:  "#6AAF78",
};

const SEASONS = ["Spring", "Summer", "Fall", "Winter", "Year-Round"];
const SIZES   = ["XXS","XS","S","M","L","XL","XXL","0","2","4","6","8","10","12","14","One Size"];
const COLOR_OPTIONS = ["Black","White","Cream","Beige","Brown","Gray","Navy","Blue","Green","Sage","Pink","Blush","Red","Burgundy","Orange","Yellow","Purple","Lavender","Multi","Print","Other"];

const CATEGORIES = {
  Tops:        ["Tanks","Short Sleeve","Short Sleeve Sweaters","Long Sleeve","Long Sleeve Sweaters"],
  Bottoms:     ["Skirts","Shorts","Pants"],
  Dresses:     ["Short","Midi / Long","Formals"],
  Accessories: ["Belts","Hats","Scarves & Wraps","Sunglasses","Nail Polish"],
  Bags:        ["Backpacks","Totes","Crossbody","Clutches","Purses","Travel Bags"],
  Shoes:       ["Flats","Wedges","Sandals","Heels","Boots","Sneakers"],
  Outerwear:   ["Jackets","Vests"],
  Swim:        ["Swimsuits","Cover Ups"],
  Athleisure:  ["Shirts","Tanks","Sports Bras","Skirts","Shorts","Leggings","Dresses","Sweatshirts"],
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const SLOTS = [
  { key: "Tops",        label: "Top",         emoji: "👕", multi: false },
  { key: "Bottoms",     label: "Bottom",      emoji: "👖", multi: false },
  { key: "Dresses",     label: "Dress",       emoji: "👗", multi: false },
  { key: "Outerwear",   label: "Outerwear",   emoji: "🧥", multi: false },
  { key: "Shoes",       label: "Shoes",       emoji: "👟", multi: false },
  { key: "Bags",        label: "Bags",        emoji: "👜", multi: true  },
  { key: "Accessories", label: "Accessories", emoji: "🧣", multi: true  },
  { key: "Swim",        label: "Swim",        emoji: "🩱", multi: false },
  { key: "Athleisure",  label: "Athleisure",  emoji: "🏃", multi: false },
];

let nextId = 1;

// ── tiny helpers ──────────────────────────────────────────────────────
const Label = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 5 }}>{children}</div>
);

const Input = ({ value, onChange, placeholder }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, fontFamily: "inherit", fontSize: 13, color: C.text, boxSizing: "border-box", outline: "none" }} />
);

const Sel = ({ value, onChange, children }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, fontFamily: "inherit", fontSize: 13, color: C.text, boxSizing: "border-box" }}>
    {children}
  </select>
);

const btnPrimary = {
  background: C.jade, color: C.white, border: "none", borderRadius: 10,
  padding: "10px 20px", fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 14, cursor: "pointer", letterSpacing: "0.04em", whiteSpace: "nowrap",
};
const btnSecondary = {
  background: C.white, color: C.jade, border: `1.5px solid ${C.borderMid}`,
  borderRadius: 10, padding: "9px 18px", fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: 14, cursor: "pointer",
};
const btnSm = bg => ({
  background: bg, color: "#fff", border: "none", borderRadius: 7,
  padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
});

function Tag({ label, color = C.jade }) {
  return (
    <span style={{
      background: color + "18", color: color,
      border: `1px solid ${color}44`, borderRadius: 20,
      padding: "2px 9px", fontSize: 11,
      fontFamily: "'Playfair Display', Georgia, serif",
      letterSpacing: "0.03em", whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

function PhotoUpload({ value, onChange }) {
  const ref = useRef();
  return (
    <div onClick={() => ref.current.click()} style={{
      width: "100%", aspectRatio: "3/4", borderRadius: 10,
      border: `2px dashed ${C.borderMid}`, background: C.jadePale,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: "pointer", overflow: "hidden",
    }}>
      {value
        ? <img src={value} alt="item" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <>
            <span style={{ fontSize: 26, color: C.muted }}>📷</span>
            <span style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Add Photo</span>
          </>
      }
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files[0];
          if (!file) return;
          const r = new FileReader();
          r.onload = ev => onChange(ev.target.result);
          r.readAsDataURL(file);
        }} />
    </div>
  );
}

function ItemCard({ item, onEdit, onDelete, onSelect, selected }) {
  const accent = catColors[item.category] || C.jade;
  return (
    <div onClick={() => onSelect?.(item)} style={{
      background: C.white,
      border: selected ? `2px solid ${accent}` : `1.5px solid ${C.border}`,
      borderRadius: 14, overflow: "hidden",
      cursor: onSelect ? "pointer" : "default",
      transition: "box-shadow 0.2s, transform 0.2s",
      boxShadow: selected ? `0 4px 18px ${accent}44` : "0 2px 8px #0C3A2508",
      position: "relative",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px #0C3A2514"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = selected ? `0 4px 18px ${accent}44` : "0 2px 8px #0C3A2508"; }}
    >
      <div style={{ aspectRatio: "3/4", background: C.jadePale, overflow: "hidden", position: "relative" }}>
        {item.photo
          ? <img src={item.photo} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
              {item.category === "Shoes" ? "👟" : item.category === "Bags" ? "👜" : item.category === "Accessories" ? "🧣" : "👗"}
            </div>
        }
        {selected && (
          <div style={{ position: "absolute", top: 8, right: 8, background: accent, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>✓</div>
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: accent + "CC", padding: "3px 8px" }}>
          <span style={{ fontSize: 10, color: "#fff", letterSpacing: "0.07em", textTransform: "uppercase" }}>{item.category}</span>
        </div>
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{item.subcategory}</div>
        {(item.brand || item.price) && (
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, display: "flex", justifyContent: "space-between" }}>
            {item.brand && <span style={{ fontStyle: "italic" }}>{item.brand}</span>}
            {item.price && <span style={{ color: C.jade, fontWeight: 700 }}>${item.price}</span>}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {item.size   && <Tag label={item.size}   color={C.jade} />}
          {item.color  && <Tag label={item.color}  color={accent} />}
          {item.season && <Tag label={item.season} color={C.gold} />}
        </div>
        {!onSelect && (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={e => { e.stopPropagation(); onEdit(item); }} style={btnSm(C.jadeMid)}>Edit</button>
            <button onClick={e => { e.stopPropagation(); onDelete(item.id); }} style={btnSm(C.danger)}>Remove</button>
          </div>
        )}
      </div>
    </div>
  );
}

function WishCard({ item, onEdit, onDelete, onMark }) {
  return (
    <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 50, height: 50, borderRadius: 10, background: C.jadePale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, overflow: "hidden" }}>
        {item.photo ? <img src={item.photo} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} alt="" /> : "✨"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 600, color: C.text }}>{item.name}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{item.category} › {item.subcategory}</div>
          </div>
          {item.priority && <Tag label={item.priority} color={item.priority === "Need" ? C.danger : item.priority === "Want" ? C.jade : C.gold} />}
        </div>
        {item.notes && <div style={{ fontSize: 12, color: C.muted, marginTop: 4, fontStyle: "italic" }}>{item.notes}</div>}
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          {item.size  && <Tag label={item.size}  color={C.jade} />}
          {item.color && <Tag label={item.color} color={C.jadeMid} />}
          <button onClick={() => onMark(item)}      style={btnSm(C.jadeLight)}>✓ Mark Owned</button>
          <button onClick={() => onEdit(item)}      style={btnSm(C.jadeMid)}>Edit</button>
          <button onClick={() => onDelete(item.id)} style={btnSm(C.danger)}>Remove</button>
        </div>
      </div>
    </div>
  );
}

function ItemModal({ item, onSave, onClose, wishlist = false }) {
  const [form, setForm] = useState(item || {
    name: "", category: "Tops", subcategory: "Tanks",
    size: "", color: "", season: "", photo: "", notes: "", priority: "Want", brand: "", price: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0A2E1E99", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px #0A2E1E44", border: `1.5px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: C.jade }}>
            {item ? "Edit Item" : wishlist ? "Add to Wish List" : "Add New Item"}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <Label>Item Name</Label>
            <Input value={form.name} onChange={v => set("name", v)} placeholder="e.g. White Linen Blouse" />
          </div>
          <div>
            <Label>Category</Label>
            <Sel value={form.category} onChange={v => { set("category", v); set("subcategory", CATEGORIES[v][0]); }}>
              {Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
            </Sel>
          </div>
          <div>
            <Label>Subcategory</Label>
            <Sel value={form.subcategory} onChange={v => set("subcategory", v)}>
              {(CATEGORIES[form.category] || []).map(s => <option key={s}>{s}</option>)}
            </Sel>
          </div>
          <div>
            <Label>Size</Label>
            <Sel value={form.size} onChange={v => set("size", v)}>
              <option value="">—</option>
              {SIZES.map(s => <option key={s}>{s}</option>)}
            </Sel>
          </div>
          <div>
            <Label>Color</Label>
            <Sel value={form.color} onChange={v => set("color", v)}>
              <option value="">—</option>
              {COLOR_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </Sel>
          </div>
          <div>
            <Label>Season</Label>
            <Sel value={form.season} onChange={v => set("season", v)}>
              <option value="">—</option>
              {SEASONS.map(s => <option key={s}>{s}</option>)}
            </Sel>
          </div>
          <div>
            <Label>Brand / Designer</Label>
            <Input value={form.brand} onChange={v => set("brand", v)} placeholder="e.g. Zara, Gucci" />
          </div>
          <div>
            <Label>Price Paid ($)</Label>
            <Input value={form.price} onChange={v => set("price", v)} placeholder="e.g. 89.99" />
          </div>
          {wishlist && (
            <div>
              <Label>Priority</Label>
              <Sel value={form.priority} onChange={v => set("priority", v)}>
                {["Need","Want","Someday"].map(p => <option key={p}>{p}</option>)}
              </Sel>
            </div>
          )}
          <div style={{ gridColumn: "1/-1" }}>
            <Label>Notes</Label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Style notes, where to buy, etc." rows={2}
              style={{ width: "100%", padding: "9px 13px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, fontFamily: "inherit", fontSize: 13, color: C.text, resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <Label>Photo</Label>
            <PhotoUpload value={form.photo} onChange={v => set("photo", v)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={() => onSave({ ...form, id: item?.id || nextId++ })} style={{ ...btnPrimary, flex: 1 }}>Save Item</button>
          <button onClick={onClose} style={{ ...btnSecondary, flex: 1 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function FilterBar({ filterCat, setFilterCat, filterSize, setFilterSize, filterColor, setFilterColor, filterSeason, setFilterSeason, search, setSearch, onAdd, addLabel }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
        style={{ flex: "1 1 150px", padding: "8px 14px", borderRadius: 20, border: `1.5px solid ${C.border}`, background: C.white, fontFamily: "inherit", fontSize: 13, color: C.text, outline: "none" }} />
      {[
        { val: filterCat,    set: setFilterCat,    blank: "All Categories", opts: Object.keys(CATEGORIES) },
        { val: filterSize,   set: setFilterSize,   blank: "Any Size",       opts: SIZES },
        { val: filterColor,  set: setFilterColor,  blank: "Any Color",      opts: COLOR_OPTIONS },
        { val: filterSeason, set: setFilterSeason, blank: "Any Season",     opts: SEASONS },
      ].map((f, i) => (
        <select key={i} value={f.val} onChange={e => f.set(e.target.value)}
          style={{ padding: "8px 11px", borderRadius: 20, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 12, fontFamily: "inherit", color: C.text }}>
          <option value="">{f.blank}</option>
          {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ))}
      <button onClick={onAdd} style={{ ...btnPrimary, borderRadius: 20 }}>+ {addLabel}</button>
    </div>
  );
}

function InventoryPage({ items, onAdd, onEdit, onDelete }) {
  const [filterCat,    setFilterCat]    = useState("");
  const [filterSize,   setFilterSize]   = useState("");
  const [filterColor,  setFilterColor]  = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  const filtered = items.filter(it => {
    if (filterCat    && it.category !== filterCat)    return false;
    if (filterSize   && it.size     !== filterSize)   return false;
    if (filterColor  && it.color    !== filterColor)  return false;
    if (filterSeason && it.season   !== filterSeason) return false;
    if (search && !it.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <FilterBar {...{ filterCat, setFilterCat, filterSize, setFilterSize, filterColor, setFilterColor, filterSeason, setFilterSeason, search, setSearch }}
        onAdd={() => setModal("new")} addLabel="Add Item" />
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{filtered.length} item{filtered.length !== 1 ? "s" : ""}</div>
      {filtered.length === 0
        ? <Empty text="No items yet — add your first piece!" />
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 14 }}>
            {filtered.map(it => <ItemCard key={it.id} item={it} onEdit={i => setModal(i)} onDelete={onDelete} />)}
          </div>
      }
      {modal && (
        <ItemModal item={modal === "new" ? null : modal}
          onSave={item => { modal === "new" ? onAdd(item) : onEdit(item); setModal(null); }}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}

function SaveOutfitModal({ outfit, onSave, onClose }) {
  const [name, setName] = useState("");
  const [day,  setDay]  = useState("");
  const [mode, setMode] = useState("name");
  const hasItems = Object.values(outfit).some(v => Array.isArray(v) ? v.length > 0 : Boolean(v));

  const handleSave = () => {
    if (!hasItems) return;
    const label = mode === "day" ? day || "Monday" : name.trim() || "My Outfit";
    onSave({ id: nextId++, label, day: mode === "day" ? (day || "Monday") : null, slots: { ...outfit }, savedAt: Date.now() });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0A2E1E99", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, padding: 28, width: "100%", maxWidth: 400, boxShadow: "0 24px 64px #0A2E1E44", border: `1.5px solid ${C.border}` }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: C.jade, marginBottom: 20 }}>Save This Outfit ✨</div>
        <div style={{ display: "flex", background: C.jadePale, borderRadius: 12, padding: 4, marginBottom: 20, gap: 4 }}>
          {[{ v: "name", l: "Custom Name" }, { v: "day", l: "Day of Week" }].map(m => (
            <button key={m.v} onClick={() => setMode(m.v)} style={{
              flex: 1, padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer",
              background: mode === m.v ? C.jade : "transparent",
              color: mode === m.v ? C.white : C.muted,
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: 13,
              fontWeight: mode === m.v ? 700 : 400, transition: "all 0.2s",
            }}>{m.l}</button>
          ))}
        </div>
        {mode === "name" ? (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>Outfit Name</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sunday Brunch, Date Night…"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontFamily: "inherit", fontSize: 14, color: C.text, boxSizing: "border-box", outline: "none" }} />
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>Assign to a Day</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {DAYS.map(d => (
                <button key={d} onClick={() => setDay(d)} style={{
                  padding: "8px 14px", borderRadius: 20, border: `1.5px solid ${day === d ? C.jade : C.border}`,
                  background: day === d ? C.jade : C.white, color: day === d ? C.white : C.text,
                  fontFamily: "'Playfair Display', Georgia, serif", fontSize: 13, cursor: "pointer",
                  transition: "all 0.15s",
                }}>{d}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button onClick={handleSave} style={{ ...btnPrimary, flex: 1 }}>Save Outfit</button>
          <button onClick={onClose}    style={{ ...btnSecondary, flex: 1 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function SavedOutfitMini({ outfit, onDelete, onLoad }) {
  const previews = Object.values(outfit.slots).flatMap(v => Array.isArray(v) ? v : (v ? [v] : [])).slice(0, 3);
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
        {previews.map((it, i) => (
          <div key={i} style={{ flex: 1, aspectRatio: "1/1", borderRadius: 6, background: C.jadePale, overflow: "hidden" }}>
            {it.photo ? <img src={it.photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👗</div>}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={() => onLoad(outfit)} style={{ ...btnSm(C.jadeMid), flex: 1, fontSize: 10 }}>Load</button>
        <button onClick={() => onDelete(outfit.id)} style={{ ...btnSm(C.danger), fontSize: 10 }}>✕</button>
      </div>
    </div>
  );
}

function SavedOutfitRow({ outfit, onDelete, onLoad }) {
  const previews = Object.values(outfit.slots).flatMap(v => Array.isArray(v) ? v : (v ? [v] : [])).slice(0, 4);
  return (
    <div style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {previews.map((it, i) => (
          <div key={i} style={{ width: 44, height: 52, borderRadius: 8, background: C.jadePale, overflow: "hidden" }}>
            {it.photo ? <img src={it.photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👗</div>}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15, fontWeight: 700, color: C.text }}>{outfit.label}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
          {outfit.day ? `📅 ${outfit.day}` : "✨ Custom"} · {Object.values(outfit.slots).flatMap(v => Array.isArray(v) ? v : (v ? [v] : [])).length} pieces
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={() => onLoad(outfit)}    style={btnSm(C.jadeMid)}>Load</button>
        <button onClick={() => onDelete(outfit.id)} style={btnSm(C.danger)}>Remove</button>
      </div>
    </div>
  );
}

function SavedOutfitsPanel({ saved, onDelete, onLoad }) {
  const [view, setView] = useState("list");
  const byDay = {};
  DAYS.forEach(d => { byDay[d] = saved.filter(o => o.day === d); });

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, color: C.jade }}>Saved Outfits</div>
        <div style={{ display: "flex", background: C.jadePale, borderRadius: 10, padding: 3, gap: 3 }}>
          {[{ v: "list", l: "All" }, { v: "week", l: "Week" }].map(m => (
            <button key={m.v} onClick={() => setView(m.v)} style={{
              padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              background: view === m.v ? C.jade : "transparent",
              color: view === m.v ? C.white : C.muted,
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: 12,
            }}>{m.l}</button>
          ))}
        </div>
      </div>

      {saved.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 20px", color: C.muted, background: C.white, borderRadius: 14, border: `1.5px solid ${C.border}` }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 15 }}>No saved outfits yet</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Build an outfit above and hit Save Outfit ✦</div>
        </div>
      )}

      {saved.length > 0 && view === "week" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
          {DAYS.map(d => (
            <div key={d} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ background: C.jade, padding: "7px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.white, letterSpacing: "0.08em", textTransform: "uppercase" }}>{d.slice(0,3)}</div>
              </div>
              <div style={{ padding: 10 }}>
                {byDay[d].length === 0
                  ? <div style={{ fontSize: 11, color: C.border, textAlign: "center", padding: "10px 0", fontStyle: "italic" }}>empty</div>
                  : byDay[d].map(o => <SavedOutfitMini key={o.id} outfit={o} onDelete={onDelete} onLoad={onLoad} />)
                }
              </div>
            </div>
          ))}
        </div>
      ) : saved.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {saved.map(o => <SavedOutfitRow key={o.id} outfit={o} onDelete={onDelete} onLoad={onLoad} />)}
        </div>
      ) : null}
    </div>
  );
}

function OutfitPage({ items, savedOutfits, onSaveOutfit, onDeleteOutfit }) {
  const [outfit, setOutfit]     = useState({});
  const [picking, setPicking]   = useState(null);
  const [saveModal, setSaveModal] = useState(false);
  const [filterColor,  setFilterColor]  = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const [filterSubcat, setFilterSubcat] = useState("");

  const openPicker = key => { setFilterSubcat(""); setPicking(key); };
  const currentSlot = SLOTS.find(s => s.key === picking);

  const pickItems = picking
    ? items.filter(it => {
        if (it.category !== picking) return false;
        if (filterSubcat && it.subcategory !== filterSubcat) return false;
        if (filterColor  && it.color  !== filterColor)  return false;
        if (filterSeason && it.season !== filterSeason) return false;
        return true;
      })
    : [];

  const isSelected = (slotKey, item) => {
    const val = outfit[slotKey];
    if (!val) return false;
    if (Array.isArray(val)) return val.some(v => v.id === item.id);
    return val.id === item.id;
  };

  const toggleMulti = (slotKey, item) => {
    setOutfit(o => {
      const cur = Array.isArray(o[slotKey]) ? o[slotKey] : [];
      const exists = cur.some(v => v.id === item.id);
      const next = exists ? cur.filter(v => v.id !== item.id) : [...cur, item];
      return { ...o, [slotKey]: next };
    });
  };

  const removeFromMulti = (slotKey, itemId) => {
    setOutfit(o => {
      const cur = Array.isArray(o[slotKey]) ? o[slotKey] : [];
      return { ...o, [slotKey]: cur.filter(v => v.id !== itemId) };
    });
  };

  const totalPieces = Object.values(outfit).reduce((acc, v) => acc + (Array.isArray(v) ? v.length : v ? 1 : 0), 0);
  const hasAny = totalPieces > 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 16, color: C.muted }}>
          Tap a slot to choose pieces from your closet
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setSaveModal(true)} style={{ ...btnPrimary, opacity: hasAny ? 1 : 0.4, cursor: hasAny ? "pointer" : "default" }} disabled={!hasAny}>Save Outfit ✦</button>
          <button onClick={() => setOutfit({})} style={btnSecondary}>Clear</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(138px, 1fr))", gap: 14, marginBottom: 28 }}>
        {SLOTS.map(slot => {
          const val     = outfit[slot.key];
          const isMulti = slot.multi;
          const items_  = isMulti ? (Array.isArray(val) ? val : []) : null;
          const single  = !isMulti ? val : null;
          const hasValue = isMulti ? items_.length > 0 : !!single;
          const accent  = catColors[slot.key] || C.jade;

          return (
            <div key={slot.key} style={{
              borderRadius: 14,
              border: hasValue ? `2px solid ${accent}` : `2px dashed ${C.borderMid}`,
              background: hasValue ? C.white : C.jadePale,
              overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s",
              position: "relative",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px #0A2E1E14"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
            >
              {isMulti && items_.length > 0 ? (
                <div onClick={() => openPicker(slot.key)} style={{ cursor: "pointer", padding: 8, minHeight: 90 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {items_.map(it => (
                      <div key={it.id} style={{ position: "relative", width: 52, height: 62, borderRadius: 8, overflow: "hidden", background: C.jadePale, flexShrink: 0 }}>
                        {it.photo
                          ? <img src={it.photo} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{slot.emoji}</div>
                        }
                        <button onClick={e => { e.stopPropagation(); removeFromMulti(slot.key, it.id); }}
                          style={{ position: "absolute", top: 2, right: 2, background: "#ffffffdd", border: "none", borderRadius: "50%", width: 16, height: 16, cursor: "pointer", fontSize: 10, lineHeight: 1, color: C.jade, padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      </div>
                    ))}
                    <div style={{ width: 52, height: 62, borderRadius: 8, border: `2px dashed ${C.borderMid}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: C.muted, cursor: "pointer", flexShrink: 0 }}>+</div>
                  </div>
                </div>
              ) : (
                <div onClick={() => openPicker(slot.key)} style={{ aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: "pointer" }}>
                  {single?.photo
                    ? <img src={single.photo} alt={single.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 32 }}>{slot.emoji}</span>
                  }
                </div>
              )}

              <div onClick={() => openPicker(slot.key)} style={{ padding: "7px 10px", background: hasValue ? accent : "transparent", textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: hasValue ? "#fff" : C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  {slot.label}{isMulti && items_.length > 0 ? ` (${items_.length})` : ""}
                </div>
                {single && <div style={{ fontSize: 11, color: "#ffffffcc", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{single.name}</div>}
              </div>

              {single && (
                <button onClick={e => { e.stopPropagation(); setOutfit(o => { const n = { ...o }; delete n[slot.key]; return n; }); }}
                  style={{ position: "absolute", top: 7, right: 7, background: "#ffffffcc", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 14, lineHeight: 1, color: C.jade }}>×</button>
              )}
            </div>
          );
        })}
      </div>

      {picking && (
        <div style={{ position: "fixed", inset: 0, background: "#0A2E1E99", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setPicking(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, padding: 22, width: "100%", maxWidth: 560, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px #0A2E1E44", border: `1.5px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, color: C.jade }}>Choose {picking}</div>
              <button onClick={() => setPicking(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: C.muted }}>×</button>
            </div>
            {currentSlot?.multi && (
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, fontStyle: "italic" }}>Tap to add or remove — select as many as you like</div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {picking && CATEGORIES[picking] && CATEGORIES[picking].length > 1 && (
                <select value={filterSubcat} onChange={e => setFilterSubcat(e.target.value)}
                  style={{ flex: "1 1 120px", padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 12, fontFamily: "inherit", color: C.text }}>
                  <option value="">Any Type</option>
                  {CATEGORIES[picking].map(s => <option key={s}>{s}</option>)}
                </select>
              )}
              <select value={filterColor} onChange={e => setFilterColor(e.target.value)}
                style={{ flex: "1 1 100px", padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 12, fontFamily: "inherit", color: C.text }}>
                <option value="">Any Color</option>
                {COLOR_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
              <select value={filterSeason} onChange={e => setFilterSeason(e.target.value)}
                style={{ flex: "1 1 100px", padding: "8px 10px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 12, fontFamily: "inherit", color: C.text }}>
                <option value="">Any Season</option>
                {SEASONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {pickItems.length === 0
                ? <Empty text={`No ${picking} in your closet yet`} />
                : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))", gap: 12 }}>
                    {pickItems.map(it => (
                      <ItemCard key={it.id} item={it}
                        selected={isSelected(picking, it)}
                        onSelect={i => {
                          if (currentSlot?.multi) {
                            toggleMulti(picking, i);
                          } else {
                            setOutfit(o => ({ ...o, [picking]: i }));
                            setPicking(null);
                          }
                        }}
                        onEdit={() => {}} onDelete={() => {}} />
                    ))}
                  </div>
              }
            </div>
            {currentSlot?.multi && (
              <button onClick={() => setPicking(null)} style={{ ...btnPrimary, marginTop: 14 }}>Done</button>
            )}
          </div>
        </div>
      )}

      {saveModal && (
        <SaveOutfitModal
          outfit={outfit}
          onSave={o => { onSaveOutfit(o); setOutfit({}); }}
          onClose={() => setSaveModal(false)}
        />
      )}

      <SavedOutfitsPanel saved={savedOutfits} onDelete={onDeleteOutfit} onLoad={o => setOutfit({ ...o.slots })} />
    </div>
  );
}

function WishlistPage({ items, onAdd, onEdit, onDelete, onMarkOwned }) {
  const [modal, setModal] = useState(null);
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCat, setFilterCat] = useState("All Categories");

  const filtered = items.filter(it => {
    if (filterPriority && it.priority !== filterPriority) return false;
    if (filterCat && filterCat !== "All Categories" && it.category !== filterCat) return false;
    return true;
  });

  const grouped = { Need: [], Want: [], Someday: [] };
  filtered.forEach(it => (grouped[it.priority] || grouped.Want).push(it));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 20, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 12, fontFamily: "inherit", color: C.text }}>
          <option>All Categories</option>
          {Object.keys(CATEGORIES).map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 20, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 12, fontFamily: "inherit", color: C.text }}>
          <option value="">All Priorities</option>
          <option>Need</option><option>Want</option><option>Someday</option>
        </select>
        <button onClick={() => setModal("new")} style={{ ...btnPrimary, borderRadius: 20, marginLeft: "auto" }}>+ Add to Wish List</button>
      </div>

      {filtered.length === 0 && <Empty text="Your wish list is empty!" />}

      {["Need","Want","Someday"].map(p => grouped[p].length > 0 && (
        <div key={p} style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: C.jade }}>{p}</div>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <Tag label={`${grouped[p].length}`} color={p === "Need" ? C.danger : p === "Want" ? C.jade : C.gold} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {grouped[p].map(it => <WishCard key={it.id} item={it} onEdit={i => setModal(i)} onDelete={onDelete} onMark={onMarkOwned} />)}
          </div>
        </div>
      ))}

      {modal && (
        <ItemModal item={modal === "new" ? null : modal} wishlist
          onSave={item => { modal === "new" ? onAdd(item) : onEdit(item); setModal(null); }}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}

function StatsPage({ items }) {
  const [investView, setInvestView] = useState("spend");

  const catCount = {};
  const catSpend = {};
  Object.keys(CATEGORIES).forEach(c => { catCount[c] = 0; catSpend[c] = 0; });
  items.forEach(it => {
    if (catCount[it.category] !== undefined) {
      catCount[it.category]++;
      const p = parseFloat(it.price);
      if (!isNaN(p)) catSpend[it.category] = (catSpend[it.category] || 0) + p;
    }
  });

  const totalSpend = Object.values(catSpend).reduce((a, b) => a + b, 0);
  const pricedItems = items.filter(it => it.price && !isNaN(parseFloat(it.price)));
  const avgPrice = pricedItems.length ? totalSpend / pricedItems.length : 0;

  const colorCount = {};
  items.forEach(it => { if (it.color) colorCount[it.color] = (colorCount[it.color] || 0) + 1; });
  const topColors = Object.entries(colorCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const topBrands = (() => {
    const bc = {};
    items.forEach(it => { if (it.brand) bc[it.brand] = (bc[it.brand] || 0) + 1; });
    return Object.entries(bc).sort((a, b) => b[1] - a[1]).slice(0, 6);
  })();

  const investData = Object.entries(
    investView === "spend" ? catSpend :
    Object.fromEntries(Object.keys(CATEGORIES).map(c => [c, catCount[c] > 0 ? catSpend[c] / catCount[c] : 0]))
  ).filter(([,v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const maxInvest = Math.max(...investData.map(([,v]) => v), 1);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Pieces",   value: items.length,                                               color: C.jade },
          { label: "Total Invested", value: totalSpend > 0 ? `$${totalSpend.toFixed(0)}` : "—",        color: C.gold },
          { label: "Avg per Piece",  value: avgPrice > 0   ? `$${avgPrice.toFixed(0)}`   : "—",        color: C.jadeLight },
          { label: "Categories",     value: Object.keys(catCount).filter(k => catCount[k] > 0).length,  color: C.jadeMid },
        ].map(s => (
          <div key={s.label} style={{ background: C.white, borderRadius: 14, padding: "16px 18px", border: `1.5px solid ${C.border}`, borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.09em", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: C.white, borderRadius: 16, padding: 20, marginBottom: 16, border: `1.5px solid ${C.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: C.jade }}>Investment by Category</div>
          <div style={{ display: "flex", background: C.jadePale, borderRadius: 10, padding: 3, gap: 3 }}>
            {[{ v: "spend", l: "Total" }, { v: "avg", l: "Avg" }].map(m => (
              <button key={m.v} onClick={() => setInvestView(m.v)} style={{
                padding: "4px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: investView === m.v ? C.jade : "transparent",
                color: investView === m.v ? C.white : C.muted,
                fontFamily: "'Playfair Display', Georgia, serif", fontSize: 12,
              }}>{m.l}</button>
            ))}
          </div>
        </div>
        {investData.length === 0
          ? <div style={{ color: C.muted, fontSize: 13, fontStyle: "italic" }}>Add prices to items to see investment breakdown</div>
          : investData.map(([cat, val]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 88, fontSize: 12, color: C.muted, textAlign: "right", flexShrink: 0 }}>{cat}</div>
              <div style={{ flex: 1, height: 14, background: C.jadePale, borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${(val / maxInvest) * 100}%`, height: "100%", background: catColors[cat] || C.jade, borderRadius: 6, transition: "width 0.6s" }} />
              </div>
              <div style={{ width: 56, fontSize: 12, color: C.jade, fontWeight: 700, textAlign: "right" }}>${val.toFixed(0)}</div>
            </div>
          ))
        }
        {totalSpend > 0 && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: C.muted }}>Total wardrobe value</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.jade }}>${totalSpend.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div style={{ background: C.white, borderRadius: 16, padding: 20, marginBottom: 16, border: `1.5px solid ${C.border}` }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: C.jade, marginBottom: 16 }}>Pieces by Category</div>
        {Object.entries(catCount).filter(([,v]) => v > 0).sort((a,b) => b[1]-a[1]).map(([cat, count]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 88, fontSize: 12, color: C.muted, textAlign: "right", flexShrink: 0 }}>{cat}</div>
            <div style={{ flex: 1, height: 10, background: C.jadePale, borderRadius: 6, overflow: "hidden" }}>
              <div style={{ width: `${(count / items.length) * 100}%`, height: "100%", background: catColors[cat] || C.jade, borderRadius: 6, transition: "width 0.6s" }} />
            </div>
            <div style={{ width: 22, fontSize: 12, color: C.jade, fontWeight: 700 }}>{count}</div>
          </div>
        ))}
        {Object.values(catCount).every(v => v === 0) && <div style={{ color: C.muted, fontSize: 13, fontStyle: "italic" }}>No items yet</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: topBrands.length > 0 ? "1fr 1fr" : "1fr", gap: 14 }}>
        {topColors.length > 0 && (
          <div style={{ background: C.white, borderRadius: 16, padding: 20, border: `1.5px solid ${C.border}` }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: C.jade, marginBottom: 14 }}>Top Colors</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {topColors.map(([color, count]) => (
                <div key={color} style={{ background: C.jadePale, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 700, color: C.jade }}>{count}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{color}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {topBrands.length > 0 && (
          <div style={{ background: C.white, borderRadius: 16, padding: 20, border: `1.5px solid ${C.border}` }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: C.jade, marginBottom: 14 }}>Top Brands</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topBrands.map(([brand, count]) => (
                <div key={brand} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: C.text, fontStyle: "italic" }}>{brand}</span>
                  <span style={{ fontSize: 12, color: C.jade, fontWeight: 700 }}>{count} piece{count !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 20px", color: C.muted }}>
      <div style={{ fontSize: 38, marginBottom: 12 }}>✨</div>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17 }}>{text}</div>
    </div>
  );
}

// ── Storage helpers ───────────────────────────────────────────────────
const STORAGE_KEY = "styledandsorted-data";

async function loadFromStorage() {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    if (result && result.value) {
      return JSON.parse(result.value);
    }
  } catch (_) {}
  return null;
}

async function saveToStorage(data) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

// ── SaveBadge ─────────────────────────────────────────────────────────
function SaveBadge({ status }) {
  if (status === "idle") return null;
  const label = status === "saving" ? "Saving…" : "✓ Saved";
  const color = status === "saving" ? C.muted : C.jadeLight;
  return (
    <span style={{
      fontSize: 11, color, letterSpacing: "0.08em",
      transition: "opacity 0.3s", opacity: status === "saved" ? 1 : 0.7,
      fontFamily: "'Playfair Display', Georgia, serif",
    }}>{label}</span>
  );
}

export default function App() {
  const [tab, setTab]             = useState("inventory");
  const [inventory, setInventory] = useState([]);
  const [wishlist,  setWishlist]  = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saveStatus, setSaveStatus] = useState("idle"); // "idle" | "saving" | "saved"
  const saveTimer = useRef(null);
  const initialized = useRef(false);

  // ── Load on mount
  useEffect(() => {
    loadFromStorage().then(data => {
      if (data) {
        if (data.inventory)    setInventory(data.inventory);
        if (data.wishlist)     setWishlist(data.wishlist);
        if (data.savedOutfits) setSavedOutfits(data.savedOutfits);
        // Ensure nextId is above any existing ids
        const allIds = [
          ...(data.inventory    || []),
          ...(data.wishlist     || []),
          ...(data.savedOutfits || []),
        ].map(x => x.id || 0);
        if (allIds.length) nextId = Math.max(...allIds) + 1;
      }
      setLoading(false);
      initialized.current = true;
    });
  }, []);

  // ── Auto-save whenever data changes (debounced 600ms)
  const persist = useCallback((inv, wish, outfits) => {
    if (!initialized.current) return;
    setSaveStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await saveToStorage({ inventory: inv, wishlist: wish, savedOutfits: outfits });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 600);
  }, []);

  // Wrapped setters that also trigger persist
  const setInv = useCallback(fn => {
    setInventory(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      persist(next, wishlist, savedOutfits);
      return next;
    });
  }, [wishlist, savedOutfits, persist]);

  const setWish = useCallback(fn => {
    setWishlist(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      persist(inventory, next, savedOutfits);
      return next;
    });
  }, [inventory, savedOutfits, persist]);

  const setOutfits = useCallback(fn => {
    setSavedOutfits(prev => {
      const next = typeof fn === "function" ? fn(prev) : fn;
      persist(inventory, wishlist, next);
      return next;
    });
  }, [inventory, wishlist, persist]);

  const addItem    = item => setInv(p => [item, ...p]);
  const editItem   = item => setInv(p => p.map(it => it.id === item.id ? item : it));
  const deleteItem = id   => setInv(p => p.filter(it => it.id !== id));

  const addWish    = item => setWish(p => [item, ...p]);
  const editWish   = item => setWish(p => p.map(it => it.id === item.id ? item : it));
  const deleteWish = id   => setWish(p => p.filter(it => it.id !== id));
  const markOwned  = item => {
    const { priority, ...rest } = item;
    addItem({ ...rest, id: nextId++ });
    deleteWish(item.id);
  };

  const saveOutfit   = o  => setOutfits(p => [o, ...p]);
  const deleteOutfit = id => setOutfits(p => p.filter(o => o.id !== id));

  const TABS = [
    { key: "inventory", label: "Closet",    icon: "🪞" },
    { key: "outfit",    label: "Outfit",    icon: "✨" },
    { key: "wishlist",  label: "Wish List", icon: "🌟" },
    { key: "stats",     label: "Stats",     icon: "📊" },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.jadeFrost, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 40 }}>👗</div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, color: C.jade }}>Loading your closet…</div>
        <div style={{ fontSize: 12, color: C.muted }}>Fetching your saved data</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.jadeFrost, fontFamily: "'Playfair Display', Georgia, serif" }}>
      <div style={{ background: C.jade, padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.white, letterSpacing: "0.03em", lineHeight: 1.1 }}>Styled & Sorted</div>
            <div style={{ fontSize: 11, color: "#ffffff88", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 3, display: "flex", alignItems: "center", gap: 10 }}>
              <span>{inventory.length} pieces · {wishlist.length} on wish list · {savedOutfits.length} saved outfit{savedOutfits.length !== 1 ? "s" : ""}</span>
              <SaveBadge status={saveStatus} />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 32, lineHeight: 1 }}>👗</div>
            <div style={{ fontSize: 10, color: C.gold, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 4 }}>✦ curated ✦</div>
          </div>
        </div>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "10px 4px 14px",
              border: "none", borderBottom: tab === t.key ? `3px solid ${C.gold}` : "3px solid transparent",
              background: "none", cursor: "pointer",
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: 13,
              color: tab === t.key ? C.white : "#ffffff77",
              fontWeight: tab === t.key ? 700 : 400,
              transition: "color 0.2s",
            }}>
              <span style={{ display: "block", fontSize: 16, marginBottom: 2 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>
        {tab === "inventory" && <InventoryPage items={inventory} onAdd={addItem}  onEdit={editItem}  onDelete={deleteItem} />}
        {tab === "outfit"    && <OutfitPage    items={inventory} savedOutfits={savedOutfits} onSaveOutfit={saveOutfit} onDeleteOutfit={deleteOutfit} />}
        {tab === "wishlist"  && <WishlistPage  items={wishlist}  onAdd={addWish}   onEdit={editWish}  onDelete={deleteWish} onMarkOwned={markOwned} />}
        {tab === "stats"     && <StatsPage     items={inventory} />}
      </div>
    </div>
  );
}