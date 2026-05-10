import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0A0A0F",
  card: "#13131A",
  border: "#2A2A3A",
  gold: "#FFD700",
  neonGreen: "#39FF14",
  hotPink: "#FF2D78",
  cyan: "#00E5FF",
  purple: "#B347FF",
  text: "#EEEEF5",
  muted: "#8888A0",
};

const ITEMS = [
  { id: 1, name: "Rusty Coin", rarity: "common", color: "#8888A0", emoji: "🪙", value: 2 },
  { id: 2, name: "Lucky Chip", rarity: "uncommon", color: "#39FF14", emoji: "🃏", value: 15 },
  { id: 3, name: "Diamond Ring", rarity: "rare", color: "#00E5FF", emoji: "💎", value: 80 },
  { id: 4, name: "Gold Bar", rarity: "epic", color: "#FFD700", emoji: "🏅", value: 250 },
  { id: 5, name: "Jackpot Trophy", rarity: "legendary", color: "#FF2D78", emoji: "🏆", value: 1000 },
  { id: 6, name: "Broken Slot", rarity: "common", color: "#8888A0", emoji: "🎰", value: 1 },
  { id: 7, name: "Poker Ace", rarity: "uncommon", color: "#B347FF", emoji: "♠️", value: 20 },
  { id: 8, name: "Crystal Dice", rarity: "rare", color: "#00E5FF", emoji: "🎲", value: 60 },
];

const SHOP_CASES = [
  { id: "basic", name: "Basic Case", price: 100, color: "#FFD700", emoji: "📦", tier: "common" },
  { id: "pro", name: "Pro Case", price: 500, color: "#B347FF", emoji: "🎁", tier: "epic" },
  { id: "elite", name: "Elite Case", price: 1500, color: "#FF2D78", emoji: "👑", tier: "legendary" },
  { id: "mystery", name: "Mystery", price: 250, color: "#00E5FF", emoji: "🔮", tier: "rare" },
  { id: "budget", name: "Budget Box", price: 50, color: "#39FF14", emoji: "🗃️", tier: "uncommon" },
];

function useCountdown(target) {
  const [time, setTime] = useState({ h: 35, m: 31, s: 23 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 35; m = 31; s = 23; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return `${String(time.h).padStart(2,'0')}:${String(time.m).padStart(2,'0')}:${String(time.s).padStart(2,'0')}`;
}

function pad(n) { return String(n).padStart(2, '0'); }

function HomeScreen({ onNav, balance, onDailyLottery, lotteryDone }) {
  return (
    <div style={{ padding: "24px 20px", height: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 13, color: COLORS.muted, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Welcome Back!</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, fontFamily: "'Black Ops One', monospace" }}>GAMBIL</div>
        <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>no-stakes • real addiction</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#1A1A24", borderRadius: 12, padding: "10px 20px", border: `1px solid ${COLORS.border}` }}>
        <span style={{ fontSize: 18 }}>💰</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.gold, fontFamily: "monospace" }}>{balance.toLocaleString()}</span>
        <span style={{ fontSize: 12, color: COLORS.muted }}>G-COINS</span>
      </div>

      <button
        onClick={onDailyLottery}
        disabled={lotteryDone}
        style={{
          background: lotteryDone ? "#1A1A24" : `linear-gradient(135deg, #FF2D78, #B347FF)`,
          border: `2px solid ${lotteryDone ? COLORS.border : "#FF2D78"}`,
          borderRadius: 14, padding: "14px 20px", cursor: lotteryDone ? "default" : "pointer",
          textAlign: "left", position: "relative", overflow: "hidden"
        }}
      >
        <div style={{ fontSize: 11, color: lotteryDone ? COLORS.muted : "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
          🎰 Daily Lottery
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: lotteryDone ? COLORS.muted : "#fff" }}>
          {lotteryDone ? "✓ Claimed Today!" : "Claim Free Coins!"}
        </div>
        {!lotteryDone && <div style={{ position: "absolute", top: 8, right: 12, fontSize: 24 }}>🎟️</div>}
      </button>

      <button
        onClick={() => onNav("case")}
        style={{
          background: "linear-gradient(135deg, #13131A, #1E1E2E)",
          border: `2px solid ${COLORS.gold}`,
          borderRadius: 14, padding: "20px", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1
        }}
      >
        <div style={{ fontSize: 48 }}>🎁</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.gold, fontFamily: "'Black Ops One', cursive" }}>OPEN CASES!</div>
        <div style={{ fontSize: 13, color: COLORS.muted }}>Spin for rewards</div>
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => onNav("inventory")} style={navBtnStyle(COLORS.cyan)}>
          <span style={{ fontSize: 20 }}>🎒</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.cyan }}>Inventory</span>
        </button>
        <button onClick={() => onNav("shop")} style={navBtnStyle(COLORS.purple)}>
          <span style={{ fontSize: 20 }}>🛒</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.purple }}>Shop</span>
        </button>
      </div>

      <div style={{ fontSize: 10, color: "#444", textAlign: "center", lineHeight: 1.5 }}>
        ⚠️ Gambling Hotline: 1-800-522-4700 • This app is satire
      </div>
    </div>
  );
}

function navBtnStyle(color) {
  return {
    background: "#13131A", border: `1.5px solid ${color}33`,
    borderRadius: 12, padding: "14px 10px", cursor: "pointer",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    transition: "all 0.15s"
  };
}

function CaseScreen({ onNav, balance, onAddBalance, inventory, onAddItem }) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [offset, setOffset] = useState(0);
  const [currentCase, setCurrentCase] = useState(SHOP_CASES[0]);
  const spinRef = useRef(null);

  const REEL_ITEMS = [...ITEMS, ...ITEMS, ...ITEMS];
  const ITEM_W = 90;

  function spinCase() {
    if (spinning || balance < currentCase.price) return;
    onAddBalance(-currentCase.price);
    setResult(null);
    setSpinning(true);

    const winIdx = Math.floor(Math.random() * ITEMS.length);
    const weights = [40, 25, 15, 10, 3, 40, 25, 15];
    const roll = Math.random() * weights.reduce((a,b)=>a+b,0);
    let cum = 0, chosen = 0;
    for (let i = 0; i < weights.length; i++) {
      cum += weights[i];
      if (roll < cum) { chosen = i; break; }
    }

    const targetItem = ITEMS[chosen];
    const centerIdx = ITEMS.length + chosen;
    const targetOffset = -(centerIdx * ITEM_W - 135);
    const spinDistance = targetOffset - (Math.random() * 800 + 1200);

    setOffset(spinDistance);
    setTimeout(() => {
      setOffset(targetOffset);
      setTimeout(() => {
        setSpinning(false);
        setResult(targetItem);
        onAddItem(targetItem);
      }, 2500);
    }, 50);
  }

  return (
    <div style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => onNav("home")} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 18 }}>←</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 700, color: COLORS.text }}>Case Opening</div>
        <div style={{ fontSize: 13, color: COLORS.gold, fontFamily: "monospace", fontWeight: 600 }}>💰 {balance.toLocaleString()}</div>
      </div>

      <div style={{ background: "#13131A", borderRadius: 14, border: `2px solid ${currentCase.color}44`, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 0, overflowX: "auto", padding: "8px 8px 4px" }}>
          {SHOP_CASES.map(c => (
            <button key={c.id} onClick={() => setCurrentCase(c)} style={{
              flexShrink: 0, background: currentCase.id === c.id ? `${c.color}22` : "none",
              border: `1px solid ${currentCase.id === c.id ? c.color : "transparent"}`,
              borderRadius: 8, padding: "6px 10px", cursor: "pointer", textAlign: "center"
            }}>
              <div style={{ fontSize: 18 }}>{c.emoji}</div>
              <div style={{ fontSize: 9, color: currentCase.id === c.id ? c.color : COLORS.muted, whiteSpace: "nowrap" }}>{c.name}</div>
            </button>
          ))}
        </div>

        <div style={{ position: "relative", overflow: "hidden", height: 100, borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 2, background: currentCase.color, zIndex: 10, transform: "translateX(-50%)" }} />
          <div style={{ position: "absolute", top: 8, bottom: 8, left: "50%", width: 92, border: `2px solid ${currentCase.color}`, borderRadius: 8, transform: "translateX(-50%)", zIndex: 5 }} />
          <div style={{
            display: "flex", alignItems: "center", height: "100%", paddingLeft: 20,
            transform: `translateX(${offset}px)`,
            transition: spinning ? `transform ${offset < -500 ? "0.05s" : "2.5s"} cubic-bezier(0.25,0.1,0.1,1)` : "none"
          }}>
            {REEL_ITEMS.map((item, i) => (
              <div key={i} style={{ width: ITEM_W, flexShrink: 0, textAlign: "center", padding: "0 5px" }}>
                <div style={{ fontSize: 28, filter: `drop-shadow(0 0 8px ${item.color})` }}>{item.emoji}</div>
                <div style={{ fontSize: 9, color: item.color, fontWeight: 600, marginTop: 2 }}>{item.rarity.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {result && !spinning && (
        <div style={{ background: `${result.color}15`, border: `1.5px solid ${result.color}66`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, animation: "fadeIn 0.4s ease" }}>
          <div style={{ fontSize: 32 }}>{result.emoji}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: result.color }}>{result.name}</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>{result.rarity} • worth {result.value} G-Coins</div>
          </div>
        </div>
      )}

      <button
        onClick={spinCase}
        disabled={spinning || balance < currentCase.price}
        style={{
          background: spinning || balance < currentCase.price ? "#1A1A24" : `linear-gradient(135deg, ${currentCase.color}CC, ${currentCase.color}88)`,
          border: `2px solid ${currentCase.color}`,
          borderRadius: 14, padding: "16px", cursor: spinning || balance < currentCase.price ? "not-allowed" : "pointer",
          color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: 1
        }}
      >
        {spinning ? "SPINNING..." : `OPEN CASE — ${currentCase.price.toLocaleString()} G`}
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {ITEMS.map(item => (
          <div key={item.id} style={{ background: "#13131A", border: `1px solid ${item.color}33`, borderRadius: 8, padding: "8px 4px", textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>{item.emoji}</div>
            <div style={{ fontSize: 8, color: item.color, marginTop: 2, fontWeight: 600 }}>{item.rarity.slice(0,4).toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => onNav("inventory")} style={navBtnStyle(COLORS.cyan)}>
          <span style={{ fontSize: 16 }}>🎒</span>
          <span style={{ fontSize: 12, color: COLORS.cyan }}>Inventory</span>
        </button>
        <button onClick={() => onNav("shop")} style={navBtnStyle(COLORS.purple)}>
          <span style={{ fontSize: 16 }}>🛒</span>
          <span style={{ fontSize: 12, color: COLORS.purple }}>Shop</span>
        </button>
      </div>
    </div>
  );
}

function InventoryScreen({ onNav, inventory, onSell, balance }) {
  const [selected, setSelected] = useState(null);

  const grouped = inventory.reduce((acc, item) => {
    const key = item.id;
    acc[key] = acc[key] || { ...item, count: 0 };
    acc[key].count++;
    return acc;
  }, {});
  const items = Object.values(grouped);

  return (
    <div style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => onNav("home")} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 18 }}>←</button>
        <div style={{ flex: 1, fontSize: 18, fontWeight: 700, color: COLORS.text }}>Inventory</div>
        <div style={{ fontSize: 13, color: COLORS.gold, fontFamily: "monospace" }}>💰 {balance.toLocaleString()}</div>
      </div>

      {items.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: COLORS.muted }}>
          <div style={{ fontSize: 48 }}>📭</div>
          <div style={{ fontSize: 14 }}>Nothing here yet</div>
          <div style={{ fontSize: 12 }}>Open some cases to get started!</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, flex: 1, alignContent: "start", overflowY: "auto" }}>
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => setSelected(selected?.id === item.id ? null : item)}
              style={{
                background: selected?.id === item.id ? `${item.color}22` : "#13131A",
                border: `1.5px solid ${selected?.id === item.id ? item.color : COLORS.border}`,
                borderRadius: 12, padding: "12px 8px", cursor: "pointer", textAlign: "center",
                position: "relative", transition: "all 0.15s"
              }}
            >
              {item.count > 1 && (
                <div style={{ position: "absolute", top: 4, right: 4, background: COLORS.hotPink, borderRadius: 10, fontSize: 9, fontWeight: 700, color: "#fff", padding: "1px 5px" }}>×{item.count}</div>
              )}
              <div style={{ fontSize: 28, marginBottom: 4 }}>{item.emoji}</div>
              <div style={{ fontSize: 10, color: item.color, fontWeight: 600 }}>{item.rarity.toUpperCase()}</div>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{item.name}</div>
              <div style={{ fontSize: 10, color: COLORS.gold, marginTop: 2 }}>{item.value}G</div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div style={{ background: "#1A1A24", border: `1px solid ${selected.color}55`, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: selected.color }}>{selected.name}</div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>×{selected.count} • {selected.value}G each</div>
          </div>
          <button
            onClick={() => { onSell(selected); setSelected(null); }}
            style={{
              background: "#39FF1422", border: `1.5px solid #39FF14`,
              borderRadius: 10, padding: "8px 16px", cursor: "pointer",
              color: COLORS.neonGreen, fontSize: 13, fontWeight: 700
            }}
          >
            SELL 1
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => onNav("case")} style={navBtnStyle(COLORS.gold)}>
          <span style={{ fontSize: 16 }}>🎁</span>
          <span style={{ fontSize: 12, color: COLORS.gold }}>Open Cases</span>
        </button>
        <button onClick={() => onNav("shop")} style={navBtnStyle(COLORS.purple)}>
          <span style={{ fontSize: 16 }}>🛒</span>
          <span style={{ fontSize: 12, color: COLORS.purple }}>Shop</span>
        </button>
      </div>
    </div>
  );
}

function ShopScreen({ onNav, balance, onBuyCase, onAddBalance }) {
  const countdown = useCountdown();
  const [flash, setFlash] = useState(null);

  function handleBuy(c) {
    if (balance >= c.price) {
      onBuyCase(c);
      setFlash(c.id);
      setTimeout(() => setFlash(null), 600);
    }
  }

  return (
    <div style={{ padding: "20px", height: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => onNav("home")} style={{ background: "none", border: "none", color: COLORS.muted, cursor: "pointer", fontSize: 18 }}>←</button>
        <div style={{ flex: 1, fontSize: 18, fontWeight: 700, color: COLORS.text }}>Shop</div>
        <div style={{ fontSize: 13, color: COLORS.gold, fontFamily: "monospace" }}>💰 {balance.toLocaleString()}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {SHOP_CASES.map(c => (
          <button
            key={c.id}
            onClick={() => handleBuy(c)}
            style={{
              background: flash === c.id ? `${c.color}33` : "#13131A",
              border: `2px solid ${c.color}${balance >= c.price ? "AA" : "33"}`,
              borderRadius: 14, padding: "16px 10px", cursor: balance >= c.price ? "pointer" : "not-allowed",
              textAlign: "center", transition: "all 0.15s",
              opacity: balance >= c.price ? 1 : 0.5
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 6, filter: `drop-shadow(0 0 10px ${c.color}88)` }}>{c.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.name}</div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8 }}>{c.tier}</div>
            <div style={{ background: `${c.color}22`, border: `1px solid ${c.color}55`, borderRadius: 8, padding: "4px 8px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: c.color }}>💰 {c.price.toLocaleString()}</span>
            </div>
          </button>
        ))}
      </div>

      <div style={{
        background: "#13131A", border: `2px solid ${COLORS.neonGreen}55`, borderRadius: 14,
        padding: "16px", textAlign: "center"
      }}>
        <div style={{ fontSize: 12, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>🎉 Free Item</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.neonGreen, fontFamily: "monospace", letterSpacing: 2 }}>
          {countdown}
        </div>
        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>Claim when timer hits zero</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => onNav("case")} style={navBtnStyle(COLORS.gold)}>
          <span style={{ fontSize: 16 }}>🎁</span>
          <span style={{ fontSize: 12, color: COLORS.gold }}>Open Cases</span>
        </button>
        <button onClick={() => onNav("inventory")} style={navBtnStyle(COLORS.cyan)}>
          <span style={{ fontSize: 16 }}>🎒</span>
          <span style={{ fontSize: 12, color: COLORS.cyan }}>Inventory</span>
        </button>
      </div>
    </div>
  );
}

export default function GambilApp() {
  const [screen, setScreen] = useState("home");
  const [balance, setBalance] = useState(500);
  const [inventory, setInventory] = useState([]);
  const [lotteryDone, setLotteryDone] = useState(false);

  function handleDailyLottery() {
    if (lotteryDone) return;
    const reward = Math.floor(Math.random() * 200) + 100;
    setBalance(b => b + reward);
    setLotteryDone(true);
  }

  function handleAddBalance(delta) {
    setBalance(b => Math.max(0, b + delta));
  }

  function handleAddItem(item) {
    setInventory(inv => [...inv, item]);
  }

  function handleSell(item) {
    const idx = inventory.findIndex(i => i.id === item.id);
    if (idx !== -1) {
      setInventory(inv => { const next = [...inv]; next.splice(idx, 1); return next; });
      setBalance(b => b + item.value);
    }
  }

  function handleBuyCase(c) {
    if (balance >= c.price) {
      setBalance(b => b - c.price);
      setScreen("case");
    }
  }

  const screenProps = { onNav: setScreen, balance, onAddBalance: handleAddBalance };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#060608", padding: "20px 0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
      <div style={{
        width: 375, minHeight: 680, maxHeight: 780, background: COLORS.bg,
        borderRadius: 40, border: `2px solid ${COLORS.border}`,
        boxShadow: "0 0 60px rgba(179,71,255,0.15), 0 0 120px rgba(0,0,0,0.8)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        position: "relative"
      }}>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {screen === "home" && <HomeScreen {...screenProps} onDailyLottery={handleDailyLottery} lotteryDone={lotteryDone} />}
          {screen === "case" && <CaseScreen {...screenProps} inventory={inventory} onAddItem={handleAddItem} />}
          {screen === "inventory" && <InventoryScreen {...screenProps} inventory={inventory} onSell={handleSell} />}
          {screen === "shop" && <ShopScreen {...screenProps} onBuyCase={handleBuyCase} />}
        </div>

        <div style={{
          display: "flex", justifyContent: "space-around", padding: "10px 20px 16px",
          borderTop: `1px solid ${COLORS.border}`, background: "#0D0D14"
        }}>
          {[
            { key: "home", emoji: "🏠", label: "Home" },
            { key: "case", emoji: "🎁", label: "Cases" },
            { key: "inventory", emoji: "🎒", label: "Items" },
            { key: "shop", emoji: "🛒", label: "Shop" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setScreen(tab.key)} style={{
              background: "none", border: "none", cursor: "pointer", textAlign: "center", padding: "4px 12px",
              borderRadius: 10, transition: "all 0.15s",
              background: screen === tab.key ? `${COLORS.purple}22` : "none"
            }}>
              <div style={{ fontSize: 20 }}>{tab.emoji}</div>
              <div style={{ fontSize: 9, color: screen === tab.key ? COLORS.purple : COLORS.muted, marginTop: 2, fontWeight: screen === tab.key ? 700 : 400 }}>{tab.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
