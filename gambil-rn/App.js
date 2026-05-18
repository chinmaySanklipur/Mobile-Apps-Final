// ═══════════════════════════════════════════════════════════════════════════
// GAMBIL — No-Stakes Gambling Simulator
// Authors: Vivaan Bhujabal, Sudev Raj, Chinmay Sanklipur
//
// Want to quit gambling? Download Gambil today!
// Gambil is a no-stakes gambling simulator for recovering gambling addicts.
//   • Engage in the most popular forms of gambling for free!
//   • Built-in gambling hotline
//   • Continue your addiction (or even make it worse) without spending a penny!
//   • NEW: FREE REAL LOTTERY THAT GIVES REAL MONEY
//
// App Structure: Widget-style layout using React Native for different
//   types of gambling (Case Opening, Slots, Coin Flip).
//
// 3rd-Party Resources: React Native (Meta), Expo (Expo Inc.)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  TextInput,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';

// ─── Constants ───────────────────────────────────────────────────────────────

const { width: SW } = Dimensions.get('window');

const C = {
  bg:       '#0A0A0F',
  card:     '#13131A',
  border:   '#2A2A3A',
  gold:     '#FFD700',
  green:    '#39FF14',
  pink:     '#FF2D78',
  cyan:     '#00E5FF',
  purple:   '#B347FF',
  text:     '#EEEEF5',
  muted:    '#8888A0',
};

const ITEMS = [
  { id: 1, name: 'Rusty Coin',     rarity: 'common',    color: C.muted,   emoji: '🪙', value: 2    },
  { id: 2, name: 'Lucky Chip',     rarity: 'uncommon',  color: C.green,   emoji: '🃏', value: 15   },
  { id: 3, name: 'Diamond Ring',   rarity: 'rare',      color: C.cyan,    emoji: '💎', value: 80   },
  { id: 4, name: 'Gold Bar',       rarity: 'epic',      color: C.gold,    emoji: '🏅', value: 250  },
  { id: 5, name: 'Jackpot Trophy', rarity: 'legendary', color: C.pink,    emoji: '🏆', value: 1000 },
  { id: 6, name: 'Broken Slot',    rarity: 'common',    color: C.muted,   emoji: '🎰', value: 1    },
  { id: 7, name: 'Poker Ace',      rarity: 'uncommon',  color: C.purple,  emoji: '♠️', value: 20   },
  { id: 8, name: 'Crystal Dice',   rarity: 'rare',      color: C.cyan,    emoji: '🎲', value: 60   },
];

const CASES = [
  { id: 'budget',  name: 'Budget Box', price: 50,   color: C.green,  emoji: '🗃️', tier: 'uncommon'  },
  { id: 'basic',   name: 'Basic Case', price: 100,  color: C.gold,   emoji: '📦', tier: 'common'    },
  { id: 'mystery', name: 'Mystery',    price: 250,  color: C.cyan,   emoji: '🔮', tier: 'rare'      },
  { id: 'pro',     name: 'Pro Case',   price: 500,  color: C.purple, emoji: '🎁', tier: 'epic'      },
  { id: 'elite',   name: 'Elite Case', price: 1500, color: C.pink,   emoji: '👑', tier: 'legendary' },
];

const SLOT_SYMS   = ['🍒', '🍋', '🔔', '⭐', '💎', '7️⃣', '🎰', '🃏'];
const SLOT_VALUES = { '🍒': 2, '🍋': 3, '🔔': 5, '⭐': 8, '💎': 15, '7️⃣': 20, '🎰': 50, '🃏': 3 };

// Weighted drop table — index matches ITEMS array
const WEIGHTS     = [40, 25, 15, 10, 3, 40, 25, 15];
const WEIGHT_SUM  = WEIGHTS.reduce((a, b) => a + b, 0);

// ─── Utilities ────────────────────────────────────────────────────────────────

function weightedPick() {
  let roll = Math.random() * WEIGHT_SUM;
  for (let i = 0; i < WEIGHTS.length; i++) {
    roll -= WEIGHTS[i];
    if (roll <= 0) return i;
  }
  return 0;
}

/** Validate a numeric bet string. Returns {ok, value, error}. */
function validateBet(raw, balance, maxBet = 2000) {
  const n = parseInt(raw, 10);
  if (!raw || isNaN(n))   return { ok: false, error: 'Enter a valid number' };
  if (n <= 0)             return { ok: false, error: 'Bet must be greater than 0' };
  if (n > balance)        return { ok: false, error: `Exceeds balance (${balance.toLocaleString()} G)` };
  if (n > maxBet)         return { ok: false, error: `Max bet is ${maxBet.toLocaleString()} G` };
  return { ok: true, value: n, error: '' };
}

// ─── Custom Hooks ─────────────────────────────────────────────────────────────

function useCountdown(initH = 35, initM = 31, initS = 23) {
  const [time, setTime] = useState({ h: initH, m: initM, s: initS });
  useEffect(() => {
    const id = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = initH; m = initM; s = initS; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const p = n => String(n).padStart(2, '0');
  return `${p(time.h)}:${p(time.m)}:${p(time.s)}`;
}

// ─── Shared Sub-components ────────────────────────────────────────────────────

function ScreenHeader({ title, balance, onBack }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.backTap}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.headerTitle}>{title}</Text>
      <Text style={s.headerBal}>💰 {balance.toLocaleString()}</Text>
    </View>
  );
}

function SectionLabel({ text }) {
  return <Text style={s.sectionLabel}>{text}</Text>;
}

function BetQuickPicks({ values, active, color, onPick }) {
  return (
    <View style={s.quickRow}>
      {values.map(v => (
        <TouchableOpacity
          key={v}
          onPress={() => onPick(String(v))}
          style={[s.quickChip, active === String(v) && { borderColor: color, backgroundColor: color + '22' }]}
        >
          <Text style={{ color, fontSize: 12, fontWeight: 'bold' }}>{v}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function BetInputField({ value, onChange, error }) {
  return (
    <>
      <TextInput
        style={[s.betInput, error ? s.betInputErr : null]}
        value={value}
        onChangeText={t => onChange(t.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
        placeholder="Enter bet amount…"
        placeholderTextColor={C.muted}
        maxLength={6}
        returnKeyType="done"
      />
      {!!error && <Text style={s.errText}>{error}</Text>}
    </>
  );
}

// ─── Screen: Home ────────────────────────────────────────────────────────────

function HomeScreen({ nav, balance, onClaim, claimed, stats }) {
  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* Branding */}
      <Text style={s.welcomeLbl}>Welcome Back!</Text>
      <Text style={s.appName}>GAMBIL</Text>
      <Text style={s.appTag}>no-stakes • real addiction</Text>

      {/* Balance pill */}
      <View style={s.balRow}>
        <Text style={{ fontSize: 20 }}>💰</Text>
        <Text style={s.balNum}>{balance.toLocaleString()}</Text>
        <Text style={s.balLbl}>G-COINS</Text>
      </View>

      {/* Daily lottery */}
      <TouchableOpacity
        onPress={onClaim}
        disabled={claimed}
        style={[s.lotteryBtn, claimed && s.lotteryBtnDone]}
        accessibilityLabel={claimed ? 'Daily lottery already claimed' : 'Claim daily lottery coins'}
        accessibilityRole="button"
      >
        <Text style={s.lotteryEyebrow}>🎰  DAILY LOTTERY</Text>
        <Text style={[s.lotteryMain, claimed && { color: C.muted }]}>
          {claimed ? '✓  Claimed Today!' : 'Claim Free Coins!'}
        </Text>
        {!claimed && <Text style={s.lotteryNote}>100–300 G-Coins • once per session</Text>}
      </TouchableOpacity>

      {/* Open Cases hero */}
      <TouchableOpacity onPress={() => nav('cases')} style={s.heroCta}>
        <Text style={{ fontSize: 46 }}>🎁</Text>
        <Text style={s.heroText}>OPEN CASES!</Text>
        <Text style={{ fontSize: 13, color: C.muted }}>Spin for rewards</Text>
      </TouchableOpacity>

      {/* 2×2 mini-nav */}
      <View style={s.miniGrid}>
        {[
          { key: 'slots',    emoji: '🎰', label: 'Slots',     color: C.pink   },
          { key: 'coinflip', emoji: '🪙', label: 'Coin Flip', color: C.gold   },
          { key: 'inventory',emoji: '🎒', label: 'Inventory', color: C.cyan   },
          { key: 'shop',     emoji: '🛒', label: 'Shop',      color: C.purple },
        ].map(({ key, emoji, label, color }) => (
          <TouchableOpacity
            key={key}
            onPress={() => nav(key)}
            style={[s.miniBtn, { borderColor: color + '44' }]}
            accessibilityLabel={`Go to ${label}`}
          >
            <Text style={{ fontSize: 22 }}>{emoji}</Text>
            <Text style={[s.miniLbl, { color }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats strip */}
      <View style={s.statsStrip}>
        {[
          ['Games', stats.games],
          ['Wins',  stats.wins ],
          ['Items', stats.items],
        ].map(([lbl, val]) => (
          <View key={lbl} style={s.statChip}>
            <Text style={s.statVal}>{val}</Text>
            <Text style={s.statLbl2}>{lbl}</Text>
          </View>
        ))}
      </View>

      <Text style={s.hotline}>⚠️  Gambling Hotline: 1-800-522-4700  •  This app is satire</Text>
    </ScrollView>
  );
}

// ─── Screen: Case Opening ─────────────────────────────────────────────────────

function CasesScreen({ nav, balance, addBalance, addItem, addStat }) {
  const ITEM_W      = 80;
  const REEL        = [...ITEMS, ...ITEMS, ...ITEMS];
  const translateX  = useRef(new Animated.Value(0)).current;

  const [spinning, setSpinning] = useState(false);
  const [picked,   setPicked]   = useState(CASES[0]);
  const [result,   setResult]   = useState(null);

  function spin() {
    if (spinning || balance < picked.price) return;
    addBalance(-picked.price);
    setResult(null);
    setSpinning(true);

    const idx    = weightedPick();
    const center = ITEMS.length + idx;
    const toX    = -(center * ITEM_W - 115);

    translateX.setValue(0);
    Animated.sequence([
      // Snap hard left
      Animated.timing(translateX, {
        toValue: -1800, duration: 80, easing: Easing.linear, useNativeDriver: true,
      }),
      // Ease into winner
      Animated.timing(translateX, {
        toValue: toX, duration: 2400, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
    ]).start(() => {
      const item = ITEMS[idx];
      setResult(item);
      addItem(item);
      addStat({ games: 1, items: 1 });
      setSpinning(false);
    });
  }

  const broke = balance < picked.price;

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <ScreenHeader title="🎁  Case Opening" balance={balance} onBack={() => nav('home')} />

      {/* Case selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
        {CASES.map(c => (
          <TouchableOpacity
            key={c.id}
            onPress={() => { setPicked(c); setResult(null); }}
            style={[s.caseTab, {
              borderColor:     picked.id === c.id ? c.color : 'transparent',
              backgroundColor: picked.id === c.id ? c.color + '22' : C.card,
            }]}
          >
            <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
            <Text style={{ fontSize: 9, color: picked.id === c.id ? c.color : C.muted }}>{c.name}</Text>
            <Text style={{ fontSize: 8, color: C.muted }}>{c.price} G</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Reel box */}
      <View style={[s.reelBox, { borderColor: picked.color + '66' }]}>
        {/* Centre needle */}
        <View style={[s.needle, { backgroundColor: picked.color }]} />
        {/* Winner frame */}
        <View style={[s.winFrame, { borderColor: picked.color }]} />
        <View style={{ overflow: 'hidden', height: 96 }}>
          <Animated.View style={[s.reelTrack, { transform: [{ translateX }] }]}>
            {REEL.map((item, i) => (
              <View key={i} style={s.reelCell}>
                <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                <Text style={{ fontSize: 8, color: item.color, fontWeight: 'bold' }}>
                  {item.rarity.slice(0, 4).toUpperCase()}
                </Text>
              </View>
            ))}
          </Animated.View>
        </View>
      </View>

      {/* Result banner */}
      {result && !spinning && (
        <View style={[s.resultRow, { borderColor: result.color + '88', backgroundColor: result.color + '18' }]}>
          <Text style={{ fontSize: 28 }}>{result.emoji}</Text>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: result.color }}>{result.name}</Text>
            <Text style={{ fontSize: 12, color: C.muted }}>{result.rarity}  •  +{result.value} G-Coins</Text>
          </View>
        </View>
      )}

      {/* Spin button */}
      <TouchableOpacity
        onPress={spin}
        disabled={spinning || broke}
        style={[s.actionBtn, {
          backgroundColor: (spinning || broke) ? C.card : picked.color + 'BB',
          borderColor:      picked.color,
          opacity:          (spinning || broke) ? 0.55 : 1,
        }]}
        accessibilityLabel={`Open ${picked.name} for ${picked.price} G-Coins`}
        accessibilityRole="button"
      >
        <Text style={s.actionBtnText}>
          {spinning ? 'SPINNING…' : `OPEN — ${picked.price.toLocaleString()} G`}
        </Text>
      </TouchableOpacity>

      {broke && <Text style={s.errText}>⚠  Need {(picked.price - balance).toLocaleString()} more G-Coins</Text>}

      {/* Possible drops */}
      <SectionLabel text="Possible Drops" />
      <View style={s.dropsGrid}>
        {ITEMS.map(item => (
          <View key={item.id} style={[s.dropCell, { borderColor: item.color + '44' }]}>
            <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
            <Text style={{ fontSize: 8, color: item.color, fontWeight: 'bold', marginTop: 2 }}>
              {item.rarity.slice(0, 3).toUpperCase()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Screen: Slots ───────────────────────────────────────────────────────────

function SlotsScreen({ nav, balance, addBalance, addStat }) {
  const fadeAnims = [
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
  ];

  const [spinning, setSpinning] = useState(false);
  const [reels,    setReels]    = useState(['🎰', '🎰', '🎰']);
  const [bet,      setBet]      = useState('50');
  const [betErr,   setBetErr]   = useState('');
  const [result,   setResult]   = useState(null);

  function doSpin() {
    const v = validateBet(bet, balance, 1000);
    if (!v.ok) { setBetErr(v.error); return; }
    setBetErr('');
    addBalance(-v.value);
    setSpinning(true);
    setResult(null);

    // Build final symbols (with small chance of matches)
    const final = [
      SLOT_SYMS[Math.floor(Math.random() * SLOT_SYMS.length)],
      SLOT_SYMS[Math.floor(Math.random() * SLOT_SYMS.length)],
      SLOT_SYMS[Math.floor(Math.random() * SLOT_SYMS.length)],
    ];
    if (Math.random() < 0.28) final[1] = final[0];  // 28% chance pair
    if (Math.random() < 0.08) final[2] = final[0];  // 8%  chance triple

    // Animate each reel fading out then in staggered
    fadeAnims.forEach((a, i) => {
      Animated.sequence([
        Animated.timing(a, { toValue: 0.05, duration: 180 + i * 180, useNativeDriver: true }),
        Animated.delay(300 + i * 350),
        Animated.timing(a, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    });

    // Reveal each reel staggered
    setTimeout(() => setReels(r => [final[0], r[1], r[2]]), 480);
    setTimeout(() => setReels(r => [r[0], final[1], r[2]]), 830);
    setTimeout(() => {
      setReels(final);

      // Payout logic
      const [a, b, c] = final;
      let mult = 0, msg = '';
      if (a === b && b === c) {
        mult = SLOT_VALUES[a] * 5;
        msg  = `JACKPOT!  ${a}${b}${c}  ×${mult}`;
      } else if (a === b || b === c || a === c) {
        const m = a === b ? a : (b === c ? b : c);
        mult = SLOT_VALUES[m] * 2;
        msg  = `Pair!  ×${mult}`;
      } else {
        msg = 'No match — try again!';
      }
      const payout = Math.floor(v.value * mult);
      if (payout > 0) addBalance(payout);
      setResult({ msg, payout, win: payout > 0 });
      addStat({ games: 1, wins: payout > 0 ? 1 : 0 });
      setSpinning(false);
    }, 1320);
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <ScreenHeader title="🎰  Slots" balance={balance} onBack={() => nav('home')} />

      {/* Machine */}
      <View style={[s.slotMachine, { borderColor: C.gold + '55' }]}>
        <Text style={s.slotTitle}>GAMBIL  SLOTS</Text>
        <View style={s.reelRow}>
          {reels.map((sym, i) => (
            <Animated.View key={i} style={[s.slotReel, { opacity: fadeAnims[i] }]}>
              <Text style={s.slotSym}>{sym}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Result */}
      {result && (
        <View style={[s.resultRow, {
          borderColor:     (result.win ? C.green : C.pink) + '88',
          backgroundColor: (result.win ? C.green : C.pink) + '15',
        }]}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: 'bold', color: result.win ? C.green : C.pink }}>
              {result.msg}
            </Text>
            {result.win && (
              <Text style={{ color: C.gold, fontSize: 13, marginTop: 3 }}>+{result.payout.toLocaleString()} G-Coins</Text>
            )}
          </View>
        </View>
      )}

      {/* Bet controls */}
      <SectionLabel text="Place Your Bet  (max 1,000 G)" />
      <BetQuickPicks values={[25, 50, 100, 250]} active={bet} color={C.pink} onPick={v => { setBet(v); setBetErr(''); }} />
      <BetInputField value={bet} onChange={v => { setBet(v); setBetErr(''); }} error={betErr} />

      <TouchableOpacity
        onPress={doSpin}
        disabled={spinning}
        style={[s.actionBtn, {
          backgroundColor: spinning ? C.card : C.pink + 'BB',
          borderColor:      C.pink,
          opacity:          spinning ? 0.55 : 1,
        }]}
        accessibilityLabel="Spin the slots"
        accessibilityRole="button"
      >
        <Text style={s.actionBtnText}>{spinning ? 'SPINNING…' : 'SPIN'}</Text>
      </TouchableOpacity>

      {/* Payout table */}
      <SectionLabel text="Payout Table" />
      <View style={s.payTable}>
        {[
          ['7️⃣ 7️⃣ 7️⃣  Triple 7s', '×100',  C.gold  ],
          ['Any 3-of-a-kind',        '×(val×5)', C.green ],
          ['Any 2-of-a-kind',        '×(val×2)', C.cyan  ],
          ['No match',               '×0',       C.muted ],
        ].map(([sym, pay, col]) => (
          <View key={sym} style={s.payRow}>
            <Text style={s.paySym}>{sym}</Text>
            <Text style={[s.payVal, { color: col }]}>{pay}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Screen: Coin Flip ────────────────────────────────────────────────────────

function CoinFlipScreen({ nav, balance, addBalance, addStat }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [flipping, setFlipping] = useState(false);
  const [side,     setSide]     = useState(null);   // 'heads' | 'tails'
  const [sideErr,  setSideErr]  = useState('');
  const [bet,      setBet]      = useState('50');
  const [betErr,   setBetErr]   = useState('');
  const [result,   setResult]   = useState(null);

  function doFlip() {
    if (!side)           { setSideErr('Pick Heads or Tails first!'); return; }
    const v = validateBet(bet, balance, 2000);
    if (!v.ok)           { setBetErr(v.error); return; }
    setSideErr(''); setBetErr('');
    addBalance(-v.value);
    setFlipping(true);
    setResult(null);

    // Coin "pop" animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.4, duration: 180, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.1, duration: 380, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 280, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.0, duration: 180, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
      const won     = outcome === side;
      const payout  = won ? v.value * 2 : 0;
      if (won) addBalance(payout);
      setResult({ outcome, won, payout });
      addStat({ games: 1, wins: won ? 1 : 0 });
      setFlipping(false);
    }, 1040);
  }

  const faceEmoji = flipping ? '🪙' : result ? (result.outcome === 'heads' ? '👑' : '⚓') : '🪙';
  const faceLabel = flipping ? '…'  : result ? result.outcome.toUpperCase()                : 'FLIP ME';

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <ScreenHeader title="🪙  Coin Flip" balance={balance} onBack={() => nav('home')} />

      {/* Coin */}
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <Animated.View style={[s.coin, {
          transform:       [{ scale: scaleAnim }],
          borderColor:     C.gold,
          backgroundColor: result ? (result.outcome === 'heads' ? C.gold + '44' : C.muted + '44') : C.gold + '22',
        }]}>
          <Text style={{ fontSize: 38 }}>{faceEmoji}</Text>
          <Text style={{ fontSize: 12, color: C.gold, fontWeight: 'bold', marginTop: 4 }}>{faceLabel}</Text>
        </Animated.View>
      </View>

      {/* Result */}
      {result && (
        <View style={[s.resultRow, {
          borderColor:     (result.won ? C.green : C.pink) + '88',
          backgroundColor: (result.won ? C.green : C.pink) + '15',
        }]}>
          <Text style={{ fontSize: 17, fontWeight: 'bold', color: result.won ? C.green : C.pink }}>
            {result.won ? '🎉  You Won!' : '😔  You Lost!'}
          </Text>
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>
            {result.outcome === 'heads' ? '👑 Heads' : '⚓ Tails'}
            {'  •  '}
            {result.won ? `+${result.payout.toLocaleString()} G-Coins` : 'Better luck next time'}
          </Text>
        </View>
      )}

      {/* Pick side */}
      <SectionLabel text="Pick Your Side" />
      {!!sideErr && <Text style={s.errText}>{sideErr}</Text>}
      <View style={s.sideRow}>
        {[
          { key: 'heads', emoji: '👑', col: C.gold },
          { key: 'tails', emoji: '⚓', col: C.cyan },
        ].map(({ key, emoji, col }) => (
          <TouchableOpacity
            key={key}
            onPress={() => { setSide(key); setSideErr(''); }}
            style={[s.sideBtn, side === key && { borderColor: col, backgroundColor: col + '22' }]}
            accessibilityLabel={`Choose ${key}`}
            accessibilityRole="radio"
          >
            <Text style={{ fontSize: 26 }}>{emoji}</Text>
            <Text style={[s.sideBtnText, side === key && { color: col }]}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bet */}
      <SectionLabel text="Place Your Bet  (max 2,000 G)" />
      <BetQuickPicks values={[25, 100, 500, 1000]} active={bet} color={C.cyan} onPick={v => { setBet(v); setBetErr(''); }} />
      <BetInputField value={bet} onChange={v => { setBet(v); setBetErr(''); }} error={betErr} />

      <TouchableOpacity
        onPress={doFlip}
        disabled={flipping}
        style={[s.actionBtn, {
          backgroundColor: flipping ? C.card : C.cyan + 'BB',
          borderColor:      C.cyan,
          opacity:          flipping ? 0.55 : 1,
        }]}
        accessibilityLabel="Flip the coin"
        accessibilityRole="button"
      >
        <Text style={s.actionBtnText}>{flipping ? 'FLIPPING…' : 'FLIP COIN'}</Text>
      </TouchableOpacity>

      <View style={s.infoBox}>
        <Text style={{ color: C.muted, fontSize: 11, textAlign: 'center' }}>
          Win = ×2 bet  •  Lose = lose bet  •  50 / 50 odds
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Screen: Inventory ───────────────────────────────────────────────────────

function InventoryScreen({ nav, balance, inventory, onSell }) {
  const [selected, setSelected] = useState(null);

  // Group stacks
  const grouped = inventory.reduce((acc, item) => {
    acc[item.id] = acc[item.id] || { ...item, count: 0 };
    acc[item.id].count++;
    return acc;
  }, {});
  const stacks     = Object.values(grouped);
  const totalValue = stacks.reduce((sum, it) => sum + it.value * it.count, 0);

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <ScreenHeader title="🎒  Inventory" balance={balance} onBack={() => nav('home')} />

      {/* Summary row */}
      <View style={s.summaryRow}>
        {[
          ['Items',  inventory.length,            C.text ],
          ['Unique', stacks.length,               C.cyan ],
          ['Value',  totalValue.toLocaleString() + ' G', C.gold ],
        ].map(([lbl, val, col]) => (
          <View key={lbl} style={s.summaryChip}>
            <Text style={[s.summaryVal, { color: col }]}>{val}</Text>
            <Text style={s.summaryLbl}>{lbl}</Text>
          </View>
        ))}
      </View>

      {stacks.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={{ fontSize: 52 }}>📭</Text>
          <Text style={s.emptyTitle}>Inventory empty</Text>
          <Text style={s.emptyHint}>Open cases to get started!</Text>
        </View>
      ) : (
        <View style={s.itemGrid}>
          {stacks.map(item => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSelected(selected?.id === item.id ? null : item)}
              style={[s.itemCard, {
                borderColor:     selected?.id === item.id ? item.color : C.border,
                backgroundColor: selected?.id === item.id ? item.color + '22' : C.card,
              }]}
              accessibilityLabel={`${item.name}, ${item.rarity}, worth ${item.value} G-Coins. Count: ${item.count}`}
            >
              {item.count > 1 && (
                <View style={s.countBadge}>
                  <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>×{item.count}</Text>
                </View>
              )}
              <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
              <Text style={{ fontSize: 9, color: item.color, fontWeight: 'bold', marginTop: 3 }}>
                {item.rarity.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{item.name}</Text>
              <Text style={{ fontSize: 10, color: C.gold, marginTop: 2 }}>{item.value} G</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Sell bar */}
      {selected && (
        <View style={[s.sellBar, { borderColor: selected.color + '55' }]}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: selected.color }}>{selected.name}</Text>
            <Text style={{ fontSize: 11, color: C.muted }}>×{selected.count}  •  {selected.value} G each</Text>
          </View>
          <TouchableOpacity
            onPress={() => { onSell(selected); setSelected(null); }}
            style={s.sellBtn}
            accessibilityLabel={`Sell one ${selected.name} for ${selected.value} G-Coins`}
            accessibilityRole="button"
          >
            <Text style={s.sellBtnText}>SELL 1</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Screen: Shop ─────────────────────────────────────────────────────────────

function ShopScreen({ nav, balance, onBuy }) {
  const timer = useCountdown();

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <ScreenHeader title="🛒  Shop" balance={balance} onBack={() => nav('home')} />

      {/* Free item timer */}
      <View style={[s.timerCard, { borderColor: C.green + '55' }]}>
        <Text style={s.timerEye}>🎉  FREE ITEM IN</Text>
        <Text style={[s.timerNum, { color: C.green }]}>{timer}</Text>
        <Text style={s.timerNote}>Claim when timer reaches zero</Text>
      </View>

      {/* Cases grid */}
      <SectionLabel text="Available Cases" />
      <View style={s.shopGrid}>
        {CASES.map(c => {
          const afford = balance >= c.price;
          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => afford && onBuy(c)}
              style={[s.shopCard, {
                borderColor: c.color + (afford ? 'AA' : '33'),
                opacity:     afford ? 1 : 0.45,
              }]}
              accessibilityLabel={`${c.name}, ${c.price} G-Coins${afford ? '' : ', insufficient funds'}`}
              accessibilityRole="button"
              disabled={!afford}
            >
              <Text style={{ fontSize: 30, marginBottom: 6 }}>{c.emoji}</Text>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: c.color, marginBottom: 2 }}>{c.name}</Text>
              <Text style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>{c.tier}</Text>
              <View style={[s.priceTag, { borderColor: c.color + '55', backgroundColor: c.color + '22' }]}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: c.color }}>💰 {c.price.toLocaleString()}</Text>
              </View>
              {!afford && (
                <Text style={{ fontSize: 9, color: C.pink, marginTop: 5 }}>
                  Need {(c.price - balance).toLocaleString()} more
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────

const TABS = [
  { key: 'home',      emoji: '🏠', label: 'Home'  },
  { key: 'cases',     emoji: '🎁', label: 'Cases' },
  { key: 'slots',     emoji: '🎰', label: 'Slots' },
  { key: 'coinflip',  emoji: '🪙', label: 'Flip'  },
  { key: 'inventory', emoji: '🎒', label: 'Items' },
  { key: 'shop',      emoji: '🛒', label: 'Shop'  },
];

function TabBar({ active, nav }) {
  return (
    <View style={s.tabBar}>
      {TABS.map(t => {
        const isActive = t.key === active;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => nav(t.key)}
            style={s.tabBtn}
            accessibilityLabel={t.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={{ fontSize: 18 }}>{t.emoji}</Text>
            <Text style={[s.tabLbl, isActive && s.tabLblActive]}>{t.label}</Text>
            {isActive && <View style={s.tabPip} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function App() {
  const [screen,    setScreen]    = useState('home');
  const [balance,   setBalance]   = useState(500);
  const [inventory, setInventory] = useState([]);
  const [claimed,   setClaimed]   = useState(false);
  const [stats,     setStats]     = useState({ games: 0, wins: 0, items: 0 });

  /** Merge partial stat delta */
  function addStat(delta) {
    setStats(prev => ({
      games: prev.games + (delta.games || 0),
      wins:  prev.wins  + (delta.wins  || 0),
      items: prev.items + (delta.items || 0),
    }));
  }

  function addBalance(delta) {
    setBalance(b => Math.max(0, b + delta));
  }

  function addItem(item) {
    setInventory(inv => [...inv, item]);
  }

  function sellItem(item) {
    setInventory(inv => {
      const i = inv.findIndex(x => x.id === item.id);
      if (i === -1) return inv;
      const next = [...inv];
      next.splice(i, 1);
      return next;
    });
    addBalance(item.value);
  }

  function handleClaim() {
    if (claimed) return;
    const reward = Math.floor(Math.random() * 201) + 100;
    addBalance(reward);
    setClaimed(true);
  }

  function handleBuyCase(c) {
    addBalance(-c.price);
    setScreen('cases');
  }

  const shared = { nav: setScreen, balance, addBalance, addStat };

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={{ flex: 1 }}>
        {screen === 'home'      && <HomeScreen      {...shared} onClaim={handleClaim} claimed={claimed} stats={stats} />}
        {screen === 'cases'     && <CasesScreen     {...shared} addItem={addItem} />}
        {screen === 'slots'     && <SlotsScreen     {...shared} />}
        {screen === 'coinflip'  && <CoinFlipScreen  {...shared} />}
        {screen === 'inventory' && <InventoryScreen {...shared} inventory={inventory} onSell={sellItem} />}
        {screen === 'shop'      && <ShopScreen      {...shared} onBuy={handleBuyCase} />}
      </View>
      <TabBar active={screen} nav={setScreen} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Root
  root: { flex: 1, backgroundColor: C.bg },
  screen: { flex: 1, backgroundColor: C.bg },

  // Header
  header:      { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backTap:     { paddingRight: 8 },
  backText:    { color: C.muted, fontSize: 16 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: C.text, textAlign: 'center' },
  headerBal:   { fontSize: 13, color: C.gold, fontWeight: '600' },

  // Home
  welcomeLbl: { color: C.muted, fontSize: 12, letterSpacing: 3, textAlign: 'center', marginBottom: 4 },
  appName:    { color: C.text, fontSize: 32, fontWeight: '900', textAlign: 'center', letterSpacing: 3 },
  appTag:     { color: C.muted, fontSize: 12, textAlign: 'center', marginBottom: 16 },
  balRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#1A1A24', borderRadius: 12, padding: 12, marginBottom: 12,
                borderWidth: 1, borderColor: C.border },
  balNum:     { fontSize: 22, fontWeight: '700', color: C.gold, marginHorizontal: 8 },
  balLbl:     { fontSize: 12, color: C.muted },
  lotteryBtn: { backgroundColor: C.pink + 'AA', borderWidth: 2, borderColor: C.pink,
                borderRadius: 14, padding: 14, marginBottom: 12 },
  lotteryBtnDone: { backgroundColor: '#1A1A24', borderColor: C.border },
  lotteryEyebrow: { fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 2, marginBottom: 3 },
  lotteryMain:    { fontSize: 16, fontWeight: '700', color: '#fff' },
  lotteryNote:    { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  heroCta:    { backgroundColor: '#1E1E2E', borderWidth: 2, borderColor: C.gold,
                borderRadius: 14, padding: 24, alignItems: 'center', marginBottom: 12,
                minHeight: 140, justifyContent: 'center' },
  heroText:   { fontSize: 22, fontWeight: '800', color: C.gold, letterSpacing: 2, marginVertical: 6 },
  miniGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  miniBtn:    { width: '47%', backgroundColor: C.card, borderWidth: 1.5, borderRadius: 12,
                padding: 12, alignItems: 'center' },
  miniLbl:    { fontSize: 12, fontWeight: '600', marginTop: 4 },
  statsStrip: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statChip:   { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
                borderRadius: 10, padding: 10, alignItems: 'center' },
  statVal:    { fontSize: 20, fontWeight: '700', color: C.text },
  statLbl2:   { fontSize: 10, color: C.muted },
  hotline:    { fontSize: 10, color: '#444', textAlign: 'center', lineHeight: 16 },

  // Shared
  sectionLabel: { color: C.muted, fontSize: 10, letterSpacing: 2, marginBottom: 8, marginTop: 8 },
  resultRow:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12,
                  padding: 14, marginBottom: 12 },
  errText:      { color: C.pink, fontSize: 12, marginBottom: 6 },
  actionBtn:    { borderWidth: 2, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 8 },
  actionBtnText:{ color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  betInput:     { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, borderRadius: 10,
                  color: C.text, fontSize: 16, padding: 12, marginBottom: 6 },
  betInputErr:  { borderColor: C.pink },
  quickRow:     { flexDirection: 'row', gap: 8, marginBottom: 8 },
  quickChip:    { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
                  borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  infoBox:      { backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
                  borderRadius: 10, padding: 12 },

  // Cases
  caseTab:   { borderWidth: 1, borderRadius: 8, padding: 8, alignItems: 'center', marginRight: 6, minWidth: 68 },
  reelBox:   { borderWidth: 2, borderRadius: 14, overflow: 'hidden', marginBottom: 12,
               height: 96, position: 'relative' },
  needle:    { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, zIndex: 10 },
  winFrame:  { position: 'absolute', top: 8, bottom: 8, left: '25%', right: '25%',
               borderWidth: 2, borderRadius: 8, zIndex: 5 },
  reelTrack: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20 },
  reelCell:  { width: 80, height: 90, alignItems: 'center', justifyContent: 'center' },
  dropsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dropCell:  { backgroundColor: C.card, borderWidth: 1, borderRadius: 8, padding: 8,
               alignItems: 'center', width: '22%' },

  // Slots
  slotMachine: { backgroundColor: C.card, borderWidth: 2, borderRadius: 16, padding: 20,
                 alignItems: 'center', marginBottom: 16 },
  slotTitle:   { color: C.gold, fontWeight: 'bold', fontSize: 12, letterSpacing: 3, marginBottom: 14 },
  reelRow:     { flexDirection: 'row', gap: 10 },
  slotReel:    { backgroundColor: '#1A1A24', borderWidth: 1.5, borderColor: C.border,
                 borderRadius: 12, width: 80, height: 88, alignItems: 'center', justifyContent: 'center' },
  slotSym:     { fontSize: 34 },
  payTable:    { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12 },
  payRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
                 borderBottomWidth: 1, borderBottomColor: C.border },
  paySym:      { color: C.muted, fontSize: 12 },
  payVal:      { fontSize: 12, fontWeight: 'bold' },

  // Coin Flip
  coin:    { width: 140, height: 140, borderRadius: 70, borderWidth: 3,
             alignItems: 'center', justifyContent: 'center' },
  sideRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  sideBtn: { flex: 1, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
             borderRadius: 12, padding: 16, alignItems: 'center' },
  sideBtnText: { color: C.muted, fontSize: 14, fontWeight: '600', marginTop: 6 },

  // Inventory
  summaryRow:  { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryChip: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
                 borderRadius: 10, padding: 12, alignItems: 'center' },
  summaryVal:  { fontSize: 18, fontWeight: '700' },
  summaryLbl:  { fontSize: 10, color: C.muted, marginTop: 2 },
  emptyState:  { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyTitle:  { color: C.muted, fontSize: 15 },
  emptyHint:   { color: C.muted, fontSize: 12 },
  itemGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  itemCard:    { borderWidth: 1.5, borderRadius: 12, padding: 12, alignItems: 'center', width: '30%', position: 'relative' },
  countBadge:  { position: 'absolute', top: 4, right: 4, backgroundColor: C.pink,
                 borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1 },
  sellBar:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                 backgroundColor: '#1A1A24', borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 8 },
  sellBtn:     { backgroundColor: C.green + '22', borderWidth: 1.5, borderColor: C.green,
                 borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  sellBtnText: { color: C.green, fontSize: 13, fontWeight: '700' },

  // Shop
  timerCard: { backgroundColor: C.card, borderWidth: 2, borderRadius: 14,
               padding: 18, alignItems: 'center', marginBottom: 16 },
  timerEye:  { color: C.muted, fontSize: 11, letterSpacing: 2, marginBottom: 6 },
  timerNum:  { fontSize: 28, fontWeight: '800', letterSpacing: 4 },
  timerNote: { color: C.muted, fontSize: 11, marginTop: 4 },
  shopGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  shopCard:  { backgroundColor: C.card, borderWidth: 2, borderRadius: 14,
               padding: 14, alignItems: 'center', width: '47%' },
  priceTag:  { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },

  // Tab bar
  tabBar:       { flexDirection: 'row', backgroundColor: '#0D0D14',
                  borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, paddingBottom: 10 },
  tabBtn:       { flex: 1, alignItems: 'center', position: 'relative', paddingVertical: 2 },
  tabLbl:       { fontSize: 8, color: C.muted, marginTop: 2 },
  tabLblActive: { color: C.purple, fontWeight: 'bold' },
  tabPip:       { width: 16, height: 2, backgroundColor: C.purple, borderRadius: 1, marginTop: 2 },
});
