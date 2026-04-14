import { useState, useEffect, useRef, useCallback } from "react";

// ================================================================
// Dungeon Rift — Multiplayer Tactical Roguelike (v4)
// Single-file React JSX. No build step beyond React.
// Damage scale: x1.875 from original values.
// ================================================================

const SKILLS = [
  { id: "quickstab", name: "Quick Stab", cost: 15, dmgMult: 1.50, range: 2, aoer: 0, target: "enemy",
    desc: "Deal 150% ATK dmg (range 2). Cheapest skill.", color: "#aaa" },
  { id: "shadowstep", name: "Shadow Step", cost: 75, dmgMult: 2.62, range: 3, aoer: 0, target: "enemy",
    desc: "Deal 262% ATK dmg (range 3). Pure assassination.", color: "#9d4edd" },
  { id: "lifedrain", name: "Life Drain", cost: 70, dmgMult: 2.07, range: 2, aoer: 0, target: "enemy",
    lifesteal: 0.5, desc: "Deal 207% ATK dmg (range 2). Heal 50% dealt.", color: "#e63946" },
  { id: "arcaneblast", name: "Arcane Blast", cost: 90, dmgMult: 2.43, range: 5, aoer: 0, target: "enemy",
    trueDmg: true, desc: "Deal 243% ATK dmg (range 5) ignoring defense.", color: "#e040fb" },
  { id: "frostbolt", name: "Frostbolt", cost: 60, dmgMult: 1.41, range: 4, aoer: 0, target: "enemy",
    status: { type: "Chill", turns: 2, val: 2 },
    desc: "Deal 141% ATK dmg (range 4). Chill 2t.", color: "#00b4d8" },
  { id: "venomspray", name: "Venom Spray", cost: 45, dmgMult: 1.12, range: 3, aoer: 0, target: "enemy",
    status: { type: "Poison", turns: 4, val: 0.15 },
    desc: "Deal 112% ATK dmg (range 3). Poison 4t.", color: "#70e000" },
  { id: "fireball", name: "Fireball", cost: 70, dmgMult: 1.59, range: 3, aoer: 0, target: "enemy",
    status: { type: "Burn", turns: 3, val: 0.12 },
    desc: "Deal 159% ATK dmg (range 3). Burn 3t.", color: "#ff6b35" },
  { id: "thunderstrike", name: "Thunder Strike", cost: 80, dmgMult: 1.59, range: 3, aoer: 0, target: "enemy",
    status: { type: "Stun", turns: 1, val: 0 },
    desc: "Deal 159% ATK dmg (range 3). Stun 1t.", color: "#f9c74f" },
  { id: "staticcharge", name: "Static Charge", cost: 60, dmgMult: 1.12, range: 2, aoer: 0, target: "enemy",
    status: { type: "Stun", turns: 1, val: 0 },
    desc: "Deal 112% ATK dmg (range 2). Stun 1t.", color: "#ffe169" },
  { id: "frostlance", name: "Frost Lance", cost: 75, dmgMult: 1.88, range: 4, aoer: 0, target: "enemy",
    status: { type: "Chill", turns: 3, val: 2 },
    desc: "Deal 188% ATK dmg (range 4). Chill 3t.", color: "#90e0ef" },
  { id: "plaguestrike", name: "Plague Strike", cost: 60, dmgMult: 1.22, range: 3, aoer: 0, target: "enemy",
    status: { type: "Poison", turns: 6, val: 0.20 },
    desc: "Deal 122% ATK dmg (range 3). Poison 6t.", color: "#80b918" },
  { id: "infernostrike", name: "Inferno Strike", cost: 70, dmgMult: 1.41, range: 2, aoer: 0, target: "enemy",
    status: { type: "Burn", turns: 4, val: 0.18 },
    desc: "Deal 141% ATK dmg (range 2). Burn 4t.", color: "#dc2f02" },
  { id: "soulrend", name: "Soul Rend", cost: 100, dmgMult: 2.54, range: 3, aoer: 0, target: "enemy",
    status: { type: "Slow", turns: 3, val: 2 },
    desc: "Deal 254% ATK dmg (range 3). Slow 3t.", color: "#7209b7" },
  { id: "soulburst", name: "Soul Burst", cost: 80, dmgMult: 1.59, range: 3, aoer: 1, target: "enemy",
    desc: "Deal 159% ATK dmg in 3x3 (range 3).", color: "#ff4d6d" },
  { id: "massdispel", name: "Mass Dispel", cost: 35, dmgMult: 0, range: 3, aoer: 1, target: "enemy",
    dispel: true, desc: "Strip all buffs in 3x3 (range 3).", color: "#b5179e" },
  { id: "flamewave", name: "Flame Wave", cost: 75, dmgMult: 1.12, range: 3, aoer: 1, target: "enemy",
    status: { type: "Burn", turns: 2, val: 0.10 },
    desc: "Deal 112% ATK dmg in 3x3 (range 3). Burn 2t.", color: "#ff6b35" },
  { id: "earthquake", name: "Earthquake", cost: 80, dmgMult: 1.32, range: 2, aoer: 1, target: "enemy",
    status: { type: "Slow", turns: 2, val: 2 },
    desc: "Deal 132% ATK dmg in 3x3 (range 2). Slow 2t.", color: "#9c6644" },
  { id: "poisoncloud", name: "Poison Cloud", cost: 45, dmgMult: 0.66, range: 3, aoer: 1, target: "enemy",
    status: { type: "Poison", turns: 3, val: 0.10 },
    desc: "Deal 66% ATK dmg in 3x3 (range 3). Poison 3t.", color: "#55a630" },
  { id: "blizzardstorm", name: "Blizzard Storm", cost: 75, dmgMult: 0.90, range: 3, aoer: 2, target: "enemy",
    status: { type: "Chill", turns: 2, val: 2 },
    desc: "Deal 90% ATK dmg in 5x5 (range 3). Chill 2t.", color: "#48cae4" },
  { id: "meteorfall", name: "Meteor Fall", cost: 100, dmgMult: 1.58, range: 4, aoer: 2, target: "enemy",
    status: { type: "Burn", turns: 2, val: 0.15 },
    desc: "Deal 158% ATK dmg in 5x5 (range 4). Burn 2t.", color: "#f48c06" },
  { id: "shieldwall", name: "Shield Wall", cost: 20, dmgMult: 0, range: 0, aoer: 0, target: "self",
    status: { type: "DefenseUp", turns: 3, val: 50 },
    desc: "Defense Up +50% for 3t.", color: "#4cc9f0", isSupport: true },
  { id: "fortify", name: "Fortify", cost: 15, dmgMult: 0, range: 0, aoer: 0, target: "self",
    status: { type: "DefenseUp", turns: 5, val: 25 },
    desc: "Defense Up +25% for 5t.", color: "#4361ee", isSupport: true },
  { id: "icearmor", name: "Ice Armor", cost: 25, dmgMult: 0, range: 0, aoer: 0, target: "self",
    status: { type: "FrostShield", turns: 3, val: 0 },
    desc: "Frost Shield 3t. Blocks Burn.", color: "#ade8f4", isSupport: true },
  { id: "healinglight", name: "Healing Light", cost: 20, dmgMult: 0, range: 2, aoer: 0, target: "ally",
    heal: 0.4, desc: "Heal 40% ATK (range 2).", color: "#a8dadc", isSupport: true },
  { id: "greatheal", name: "Greater Heal", cost: 35, dmgMult: 0, range: 4, aoer: 0, target: "ally",
    heal: 0.7, desc: "Heal 70% ATK (range 4).", color: "#52b788", isSupport: true },
  { id: "rejuvenate", name: "Rejuvenate", cost: 25, dmgMult: 0, range: 3, aoer: 0, target: "ally",
    status: { type: "Regen", turns: 4, val: 0.12 },
    desc: "Regen 12% ATK/t for 4t (range 3).", color: "#06d6a0", isSupport: true },
  { id: "cleanse", name: "Cleanse", cost: 20, dmgMult: 0, range: 3, aoer: 0, target: "ally",
    cleanse: true, desc: "Remove all debuffs (range 3).", color: "#80ffdb", isSupport: true },
  { id: "empower", name: "Empower", cost: 25, dmgMult: 0, range: 3, aoer: 0, target: "ally",
    status: { type: "AttackUp", turns: 3, val: 40 },
    desc: "Attack Up +40% for 3t (range 3). Stacks.", color: "#ffd60a", isSupport: true },
  { id: "dispel", name: "Dispel", cost: 15, dmgMult: 0, range: 3, aoer: 0, target: "enemy",
    dispel: true, desc: "Strip all buffs from 1 enemy (range 3).", color: "#c77dff" },
  { id: "massregen", name: "Mass Rejuvenate", cost: 55, dmgMult: 0, range: 0, aoer: 0, target: "ally", aoe: true,
    status: { type: "Regen", turns: 3, val: 0.10 },
    desc: "Regen 10% ATK/t for 3t to ALL allies.", color: "#40916c", isSupport: true },
  { id: "battlecry", name: "Battle Cry", cost: 60, dmgMult: 0, range: 0, aoer: 0, target: "ally", aoe: true,
    status: { type: "AttackUp", turns: 3, val: 40 },
    desc: "Attack Up +40% for 3t to ALL allies.", color: "#ffd60a", isSupport: true },
  { id: "warcry", name: "War Cry", cost: 50, dmgMult: 0, range: 0, aoer: 0, target: "ally", aoe: true,
    status: { type: "AttackUp", turns: 2, val: 60 },
    desc: "Attack Up +60% for 2t to ALL allies.", color: "#e9c46a", isSupport: true },
];

const RELICS = [
  { id: "bloodstone", name: "Bloodstone", desc: "+20 max HP.", cost: 20, effect: { maxHp: 20 }, tier: "common" },
  { id: "ironheart", name: "Iron Heart", desc: "+15% defense.", cost: 25, effect: { defBonus: 15 }, tier: "common" },
  { id: "copperring", name: "Copper Ring", desc: "+10 HP, +5% ATK.", cost: 18, effect: { maxHp: 10, atkBonus: 5 }, tier: "common" },
  { id: "roughstone", name: "Rough Whetstone", desc: "+8 basic ATK bonus.", cost: 15, effect: { basicAtkBonus: 8 }, tier: "common" },
  { id: "healvial", name: "Healing Vial", desc: "Heals restore +15% ATK extra.", cost: 18, effect: { healBonus: 0.15 }, tier: "common" },
  { id: "swiftboots", name: "Swift Boots", desc: "+2 move range.", cost: 30, effect: { moveRange: 2 }, tier: "uncommon" },
  { id: "energycrystal", name: "Energy Crystal", desc: "+5 energy regen/turn.", cost: 35, effect: { energyRegen: 5 }, tier: "uncommon" },
  { id: "spellbook", name: "Ancient Spellbook", desc: "Skills cost 10 less energy.", cost: 40, effect: { skillCostReduce: 10 }, tier: "uncommon" },
  { id: "assassincrest", name: "Assassin's Crest", desc: "+15 basic ATK bonus.", cost: 45, effect: { basicAtkBonus: 15 }, tier: "uncommon" },
  { id: "healersaura", name: "Healer's Aura", desc: "Heals restore +20% ATK extra.", cost: 40, effect: { healBonus: 0.20 }, tier: "uncommon" },
  { id: "stormband", name: "Stormband", desc: "+15 max energy.", cost: 38, effect: { maxEnergy: 15 }, tier: "uncommon" },
  { id: "wardrums", name: "War Drums", desc: "+20% ATK.", cost: 42, effect: { atkBonus: 20 }, tier: "uncommon" },
  { id: "oakbark", name: "Oakbark Talisman", desc: "+30 HP, +5% def.", cost: 35, effect: { maxHp: 30, defBonus: 5 }, tier: "uncommon" },
  { id: "thornmail", name: "Thornmail Shard", desc: "+20% defense.", cost: 38, effect: { defBonus: 20 }, tier: "uncommon" },
  { id: "berserkerring", name: "Berserker Ring", desc: "+25% ATK, +1 move.", cost: 45, effect: { atkBonus: 25, moveRange: 1 }, tier: "uncommon" },
  { id: "voidring", name: "Void Ring", desc: "+30% ATK.", cost: 50, effect: { atkBonus: 30 }, tier: "rare" },
  { id: "phoenixfeather", name: "Phoenix Feather", desc: "Revive once at 30% HP.", cost: 70, effect: { revive: true }, tier: "rare" },
  { id: "soulstone", name: "Soul Stone", desc: "+10 energy regen/turn.", cost: 65, effect: { energyRegen: 10 }, tier: "rare" },
  { id: "battlelore", name: "Battle Lore", desc: "+35% ATK, +15% def.", cost: 75, effect: { atkBonus: 35, defBonus: 15 }, tier: "rare" },
  { id: "grandspellbook", name: "Grand Spellbook", desc: "Skills cost 20 less energy.", cost: 80, effect: { skillCostReduce: 20 }, tier: "rare" },
  { id: "masterboots", name: "Master Boots", desc: "+3 move, +10% ATK.", cost: 70, effect: { moveRange: 3, atkBonus: 10 }, tier: "rare" },
  { id: "titanshield", name: "Titan's Shield", desc: "+30% def, +25 HP.", cost: 80, effect: { defBonus: 30, maxHp: 25 }, tier: "rare" },
  { id: "godstone", name: "God Stone", desc: "+50 HP, +20% ATK, +20% def.", cost: 100, effect: { maxHp: 50, atkBonus: 20, defBonus: 20 }, tier: "legendary" },
  { id: "heartofchaos", name: "Heart of Chaos", desc: "+60% ATK, -10% def.", cost: 95, effect: { atkBonus: 60, defBonus: -10 }, tier: "legendary" },
  { id: "eternalsoul", name: "Eternal Soul", desc: "+40 HP, +10 regen, revive.", cost: 110, effect: { maxHp: 40, energyRegen: 10, revive: true }, tier: "legendary" },
  { id: "archspellbook", name: "Archmage Tome", desc: "Skills -30 cost, +25% ATK.", cost: 120, effect: { skillCostReduce: 30, atkBonus: 25 }, tier: "legendary" },
];

const CONSUMABLES = [
  { id: "hppotion", name: "HP Potion", desc: "Restore 40% HP.", cost: 5, effect: { healPct: 0.4 } },
  { id: "megapotion", name: "Mega Potion", desc: "Restore 70% HP.", cost: 15, effect: { healPct: 0.7 } },
  { id: "fullpotion", name: "Full Potion", desc: "Full HP restore.", cost: 30, effect: { healFull: true } },
  { id: "energypot", name: "Energy Potion", desc: "Restore 25 energy.", cost: 5, effect: { energy: 25 } },
  { id: "megaenergy", name: "Mega Energy", desc: "Restore 50 energy.", cost: 12, effect: { energy: 50 } },
  { id: "antidote", name: "Antidote", desc: "Cleanse all debuffs.", cost: 8, effect: { cleanse: true } },
  { id: "elixir", name: "Battle Elixir", desc: "ATK Up +40% for 3t.", cost: 12, effect: { atkBuff: true } },
  { id: "smokescreen", name: "Smoke Screen", desc: "Def Up +40% for 2t.", cost: 10, effect: { defBuff: true } },
  { id: "goldennugget", name: "Golden Nugget", desc: "Sell for 20 gold.", cost: 8, effect: { gold: 20 } },
];

const ENEMY_TYPES = [
  { name: "Goblin Scout", emoji: "\u{1F47A}", color: "#70e000", baseHp: 40, baseAtk: 8, skills: ["venomspray"], moveRange: 3 },
  { name: "Orc Warrior", emoji: "\u{1F479}", color: "#9c6644", baseHp: 80, baseAtk: 14, skills: ["shieldwall"], moveRange: 2 },
  { name: "Skeleton", emoji: "\u{1F480}", color: "#adb5bd", baseHp: 55, baseAtk: 10, skills: ["frostbolt"], moveRange: 2 },
  { name: "Dark Mage", emoji: "\u{1F9D9}", color: "#c77dff", baseHp: 45, baseAtk: 20, skills: ["arcaneblast","frostbolt"], moveRange: 2 },
  { name: "Fire Imp", emoji: "\u{1F525}", color: "#ff6b35", baseHp: 38, baseAtk: 12, skills: ["fireball"], moveRange: 4 },
  { name: "Stone Golem", emoji: "\u{1F5FF}", color: "#8d99ae", baseHp: 120, baseAtk: 18, skills: ["earthquake"], moveRange: 1 },
  { name: "Vampire Bat", emoji: "\u{1F987}", color: "#9d4edd", baseHp: 50, baseAtk: 15, skills: ["lifedrain"], moveRange: 3 },
  { name: "Poison Toad", emoji: "\u{1F438}", color: "#55a630", baseHp: 60, baseAtk: 9, skills: ["venomspray","poisoncloud"], moveRange: 2 },
  { name: "Thunder Hawk", emoji: "\u{1F985}", color: "#f9c74f", baseHp: 45, baseAtk: 22, skills: ["thunderstrike"], moveRange: 4 },
  { name: "Wraith", emoji: "\u{1F47B}", color: "#7b8ab8", baseHp: 50, baseAtk: 16, skills: ["dispel","shadowstep"], moveRange: 3 },
  { name: "Ice Witch", emoji: "\u{1F9CA}", color: "#90e0ef", baseHp: 48, baseAtk: 18, skills: ["frostbolt","frostlance"], moveRange: 2 },
  { name: "Plague Bearer", emoji: "\u{1F922}", color: "#80b918", baseHp: 65, baseAtk: 11, skills: ["plaguestrike","venomspray"], moveRange: 2 },
  { name: "Dragon", emoji: "\u{1F409}", color: "#e05a00", baseHp: 200, baseAtk: 30, skills: ["fireball","flamewave","battlecry"], moveRange: 3, isBoss: true },
  { name: "Lich King", emoji: "\u{2620}\u{FE0F}", color: "#6d23b6", baseHp: 250, baseAtk: 35, skills: ["arcaneblast","plaguestrike","massdispel"], moveRange: 2, isBoss: true },
  { name: "Iron Titan", emoji: "\u{2699}\u{FE0F}", color: "#9c6644", baseHp: 320, baseAtk: 40, skills: ["earthquake","shieldwall","soulburst"], moveRange: 2, isBoss: true },
  { name: "Frost Colossus", emoji: "\u{2744}\u{FE0F}", color: "#48cae4", baseHp: 280, baseAtk: 32, skills: ["blizzardstorm","frostlance","shieldwall"], moveRange: 2, isBoss: true },
  { name: "Void Harbinger", emoji: "\u{1F311}", color: "#240046", baseHp: 350, baseAtk: 45, skills: ["soulrend","massdispel","meteorfall"], moveRange: 3, isBoss: true },
];

const SK_LINES = ["Welcome, brave adventurer!","Gold? Yes, I accept gold.","These relics were forged in ancient wars.","Stock up — the boss ahead is nasty!","A fine selection awaits.","Rumor has it a legendary treasure is near...","You look battle-worn!","Every hero needs the right tool."];
const SK_BUY = ["Excellent choice!","A wise purchase!","A popular item — good eye!","Splendid! Come back anytime!"];
const STATUS_COLORS = { Burn:"#ff6b35",Poison:"#70e000",Chill:"#00b4d8",Stun:"#f9c74f",Slow:"#adb5bd",Regen:"#06d6a0",DefenseUp:"#4cc9f0",AttackUp:"#ffd60a",FrostShield:"#ade8f4" };
const STATUS_ICONS = { Burn:"\u{1F525}",Poison:"\u{2620}",Chill:"\u{2744}",Stun:"\u{26A1}",Slow:"\u{1F422}",Regen:"\u{1F49A}",DefenseUp:"\u{1F6E1}",AttackUp:"\u{2694}",FrostShield:"\u{1F9CA}" };
const DEBUFF_TYPES = new Set(["Burn","Poison","Chill","Stun","Slow"]);
const STACKABLE = new Set(["Regen","Poison","Burn","Chill","Slow","Stun","AttackUp"]);
const CELL_SIZE = 50;
const CELL_GAP = 3;

const TUTORIAL_STEPS = [
  { title: "Welcome to Dungeon Rift!", icon: "\u{2694}\u{FE0F}", color: "#ffd60a", content: ["A turn-based tactical roguelike.","Fight through dungeons, grow stronger. Boss every 5 fights."] },
  { title: "The Shop", icon: "\u{1F9D9}\u{200D}\u{2642}\u{FE0F}", color: "#c77dff", content: ["Before every fight visit the shop.","RELICS = permanent stats. SKILLS = combat abilities. ITEMS = one-use consumables."] },
  { title: "Gold & Economy", icon: "\u{1F4B0}", color: "#ffd60a", content: ["Start with 20 gold. Normal fights: 25-30g. Boss fights: 90-110g.","Spend wisely!"] },
  { title: "Energy System", icon: "\u{26A1}", color: "#f9c74f", content: ["Pool: 100. Regen: 15/turn. Skip: +20 bonus.","Skills cost 10-100 energy. Basic attacks are free."] },
  { title: "Combat", icon: "\u{1F5E1}\u{FE0F}", color: "#4cc9f0", content: ["MOVE -> blue cells. BASIC ATK -> orange cells (free). SKILL -> colored cells.","Hover skills for descriptions."] },
  { title: "Skill Range & AOE", icon: "\u{1F4A5}", color: "#ff6b35", content: ["Every skill has a RANGE. AOE skills hit areas:","3x3: target + 1 tile. 5x5: target + 2 tiles."] },
  { title: "Status Effects", icon: "\u{1F525}", color: "#ff6b35", content: ["DEBUFFS: Burn, Poison, Chill, Stun, Slow (all stack).","BUFFS: Regen, DefUp, AtkUp (stacks!), FrostShield.","REACTIONS: Chill+Burn=Melt! Burn+Chill=Steam! Burn+Poison=ToxicBurn!"] },
  { title: "Damage Scaling", icon: "\u{1F4CA}", color: "#06d6a0", content: ["All damage scales with ATK stat.","DoT also scales with ATK. ATK relics benefit everything."] },
  { title: "Levels", icon: "\u{2B50}", color: "#06d6a0", content: ["After fights earn XP. Level up: +5% HP, +5% ATK.","Enemies scale too!"] },
  { title: "Ready!", icon: "\u{1F3C6}", color: "#ffd60a", content: ["Stack DoTs then trigger reactions.","Position for AOE. Dispel enemy buffs. Good luck!"] },
];

function randInt(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function randPick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function uid() { return Math.random().toString(36).slice(2,9); }
function genCode() { return Math.random().toString(36).slice(2,8).toUpperCase(); }
function calcGridSize(n) { return n>=15?10:n>=10?9:8; }
function manhattan(a,b) { return Math.abs(a.row-b.row)+Math.abs(a.col-b.col); }
function cellPx(rc) { return rc*(CELL_SIZE+CELL_GAP); }

function getAoeTargets(center, radius, gs) {
  const cells = [];
  for (let r=0;r<gs;r++) for (let c=0;c<gs;c++)
    if (Math.max(Math.abs(r-center.row),Math.abs(c-center.col))<=radius) cells.push({row:r,col:c});
  return cells;
}

function makePlayer(id, name, isHost) {
  const pool = SKILLS.filter(s=>s.target==="enemy"&&s.dmgMult>0&&!s.aoe);
  const skill = randPick(pool);
  return { id, name, isHost:!!isHost, isEnemy:false, hp:100, maxHp:100, atk:15, level:1, xp:0, xpToNext:30,
    gold:20, skills:[skill], relics:[], consumables:[], buffs:[], debuffs:[],
    energy:100, maxEnergy:100, energyRegen:15, moveRange:4, basicAtkBonus:0, atkBonus:0, defBonus:0,
    skillCostReduce:0, healBonus:0, revive:false, hasRevived:false, isAlive:true };
}

function makeEnemy(type, level, diffMult) {
  const m = 1+level*0.1;
  return { id:uid(), name:type.name, emoji:type.emoji, color:type.color, isEnemy:true, isBoss:!!type.isBoss,
    hp:Math.round(type.baseHp*m*diffMult), maxHp:Math.round(type.baseHp*m*diffMult),
    atk:Math.round(type.baseAtk*m*diffMult), level, skills:[...type.skills],
    buffs:[], debuffs:[], energy:100, maxEnergy:100, energyRegen:type.isBoss?30:20,
    moveRange:type.moveRange||2, atkBonus:0, defBonus:0, basicAtkBonus:0, skillCostReduce:0, isAlive:true };
}

function resolveStatusVal(val, atk) {
  if (typeof val==="number"&&val>0&&val<1) return Math.max(1,Math.round(atk*val));
  return val;
}

function calcSkillDmg(attacker, skill, target, isTrueDmg) {
  if (!skill.dmgMult) return 0;
  const atkUp = attacker.buffs?attacker.buffs.filter(b=>b.type==="AttackUp"):[];
  let atkMult = 1+(attacker.atkBonus||0)/100;
  atkUp.forEach(b=>{atkMult*=1+b.val/100;});
  atkMult *= 1+(attacker.level-1)*0.05;
  const raw = Math.round(attacker.atk*skill.dmgMult*atkMult);
  if (isTrueDmg) return Math.max(1,raw);
  const defUp = target.buffs?target.buffs.find(b=>b.type==="DefenseUp"):null;
  const defMult = Math.max(0.2,(1-(target.defBonus||0)/100)*(defUp?1-defUp.val/100:1));
  return Math.max(1,Math.round(raw*defMult));
}

function calcBasicDmg(attacker, target) {
  const atkUp = attacker.buffs?attacker.buffs.filter(b=>b.type==="AttackUp"):[];
  let atkMult = 1+(attacker.atkBonus||0)/100;
  atkUp.forEach(b=>{atkMult*=1+b.val/100;});
  atkMult *= 1+(attacker.level-1)*0.05;
  const raw = Math.round((attacker.atk+(attacker.basicAtkBonus||0))*atkMult);
  const defUp = target.buffs?target.buffs.find(b=>b.type==="DefenseUp"):null;
  const defMult = Math.max(0.2,(1-(target.defBonus||0)/100)*(defUp?1-defUp.val/100:1));
  return Math.max(1,Math.round(raw*defMult));
}

function checkReaction(target, newStatus, atkForBonus) {
  if (!newStatus||!target.debuffs) return null;
  const hasChill=target.debuffs.find(d=>d.type==="Chill"), hasBurn=target.debuffs.find(d=>d.type==="Burn");
  if (newStatus.type==="Burn"&&hasChill) return {name:"Melt!",dmg:Math.round(atkForBonus*0.50),color:"#ff6b35"};
  if (newStatus.type==="Chill"&&hasBurn) return {name:"Steam!",dmg:Math.round(atkForBonus*0.35),color:"#ade8f4"};
  if (newStatus.type==="Poison"&&hasBurn) return {name:"ToxicBurn!",dmg:Math.round(atkForBonus*0.45),color:"#70e000"};
  if (newStatus.type==="Stun"&&hasChill) return {name:"FrostLock!",dmg:Math.round(atkForBonus*0.25),color:"#00b4d8"};
  return null;
}

function applyStatus(unit, rawStatus, sourceAtk) {
  if (!rawStatus) return unit;
  const status={...rawStatus,val:resolveStatusVal(rawStatus.val,sourceAtk||15)};
  const isDebuff=DEBUFF_TYPES.has(status.type);
  const key=isDebuff?"debuffs":"buffs";
  const list=unit[key];
  if (STACKABLE.has(status.type)) {
    const ex=list.find(s=>s.type===status.type);
    if (ex) return {...unit,[key]:list.map(s=>s.type===status.type?{...s,val:s.val+status.val,turns:Math.max(s.turns,status.turns)}:s)};
  }
  const ex=list.find(s=>s.type===status.type);
  if (ex&&!STACKABLE.has(status.type)) { if (status.turns<=ex.turns) return unit; return {...unit,[key]:list.map(s=>s.type===status.type?{...status}:s)}; }
  return {...unit,[key]:[...list,{...status}]};
}

function tickUnit(unit) {
  let hp=unit.hp;
  unit.buffs.filter(b=>b.type==="Regen").forEach(b=>{hp=Math.min(unit.maxHp,hp+b.val);});
  unit.debuffs.filter(d=>d.type==="Burn"||d.type==="Poison").forEach(d=>{hp=Math.max(0,hp-d.val);});
  const buffs=unit.buffs.map(b=>({...b,turns:b.turns-1})).filter(b=>b.turns>0);
  const debuffs=unit.debuffs.map(d=>({...d,turns:d.turns-1})).filter(d=>d.turns>0);
  return {...unit,hp,buffs,debuffs,isAlive:hp>0};
}

function genShopItems(player) {
  const out=[];
  const relicPool=[...RELICS].sort(()=>Math.random()-0.5).slice(0,randInt(2,4));
  relicPool.forEach(r=>out.push({...r,category:"relic"}));
  const ownIds=new Set(player.skills.map(s=>s.id));
  const skillPool=SKILLS.filter(s=>!ownIds.has(s.id)).sort(()=>Math.random()-0.5).slice(0,randInt(2,3));
  skillPool.forEach(s=>out.push({...s,category:"skill",cost:randInt(15,40)}));
  const conPool=[...CONSUMABLES].sort(()=>Math.random()-0.5).slice(0,randInt(1,3));
  conPool.forEach(c=>out.push({...c,category:"consumable"}));
  return out;
}

function applyRelic(player, relic) {
  const p={...player}; const e=relic.effect;
  if(e.maxHp){p.maxHp+=e.maxHp;p.hp=Math.min(p.hp+e.maxHp,p.maxHp);}
  if(e.defBonus) p.defBonus=(p.defBonus||0)+e.defBonus;
  if(e.atkBonus) p.atkBonus=(p.atkBonus||0)+e.atkBonus;
  if(e.moveRange) p.moveRange+=e.moveRange;
  if(e.energyRegen) p.energyRegen+=e.energyRegen;
  if(e.maxEnergy){p.maxEnergy+=e.maxEnergy;p.energy=Math.min(p.energy+e.maxEnergy,p.maxEnergy);}
  if(e.skillCostReduce) p.skillCostReduce=(p.skillCostReduce||0)+e.skillCostReduce;
  if(e.basicAtkBonus) p.basicAtkBonus=(p.basicAtkBonus||0)+e.basicAtkBonus;
  if(e.healBonus) p.healBonus=(p.healBonus||0)+e.healBonus;
  if(e.revive) p.revive=true;
  p.relics=[...p.relics,relic]; p.gold-=relic.cost;
  return p;
}

function placeUnits(players, enemies, gs) {
  const pos={players:{},enemies:{}};
  players.forEach((p,i)=>{pos.players[p.id]={row:i%gs,col:Math.floor(i/gs)>0?1:0};});
  enemies.forEach((e,i)=>{pos.enemies[e.id]={row:i%gs,col:gs-1-(Math.floor(i/gs)>0?1:0)};});
  return pos;
}

function getReachable(from, range, gs, occupied) {
  const cells=[];
  for(let r=0;r<gs;r++) for(let c=0;c<gs;c++){
    const d=manhattan(from,{row:r,col:c});
    if(d>0&&d<=range&&!occupied.some(o=>o.row===r&&o.col===c)) cells.push({row:r,col:c});
  }
  return cells;
}

function getAttackable(from, range, gs) {
  const cells=[];
  for(let r=0;r<gs;r++) for(let c=0;c<gs;c++){
    const d=manhattan(from,{row:r,col:c});
    if(d>0&&d<=range) cells.push({row:r,col:c});
  }
  return cells;
}

function TutorialScreen({ onFinish }) {
  const [step, setStep] = useState(0);
  const s = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;
  return (
    <div style={{minHeight:"100vh",background:"#07080f",color:"#dde",fontFamily:"'Courier New',monospace",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{display:"flex",gap:6,marginBottom:24}}>
        {TUTORIAL_STEPS.map((_,i)=>(
          <div key={i} onClick={()=>setStep(i)} style={{width:10,height:10,borderRadius:"50%",background:i===step?s.color:i<step?"#444":"#1a1a1a",border:"1px solid "+(i===step?s.color:"#333"),cursor:"pointer"}}/>
        ))}
      </div>
      <div style={{background:"#0d0e18",border:"1px solid "+s.color+"55",borderRadius:12,padding:28,maxWidth:560,width:"100%"}}>
        <div style={{fontSize:36,textAlign:"center",marginBottom:10}}>{s.icon}</div>
        <div style={{fontSize:20,color:s.color,textAlign:"center",letterSpacing:2,marginBottom:20,fontWeight:"bold"}}>{s.title}</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {s.content.map((line,i)=>(<div key={i} style={{fontSize:13,color:"#999",lineHeight:1.6}}>{line}</div>))}
        </div>
      </div>
      <div style={{display:"flex",gap:12,marginTop:24,alignItems:"center"}}>
        {step>0&&<button onClick={()=>setStep(p=>p-1)} style={{background:"transparent",border:"1px solid #333",color:"#666",padding:"10px 24px",borderRadius:6,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13}}>← Back</button>}
        <div style={{fontSize:12,color:"#444"}}>{step+1} / {TUTORIAL_STEPS.length}</div>
        <button onClick={()=>isLast?onFinish():setStep(p=>p+1)} style={{background:isLast?s.color:"transparent",border:"1px solid "+s.color,color:isLast?"#000":s.color,padding:"10px 28px",borderRadius:6,cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:13,fontWeight:"bold"}}>{isLast?"Start Game →":"Next →"}</button>
      </div>
    </div>
  );
}

function ABtn({label,active,color,onClick,disabled,onHover,onLeave}) {
  return <button onMouseEnter={onHover} onMouseLeave={onLeave} onClick={onClick} disabled={disabled} style={{background:active?color+"28":"transparent",border:"1px solid "+(disabled?"#222":color),color:disabled?"#333":active?color:color+"bb",padding:"4px 8px",borderRadius:4,fontSize:11,cursor:disabled?"not-allowed":"pointer",fontFamily:"'Courier New',monospace"}}>{label}</button>;
}

function UnitRow({unit,isCurrent,isPlayer}) {
  const hpPct = Math.round(unit.hp/unit.maxHp*100);
  const statuses = [...(unit.buffs||[]),...(unit.debuffs||[])];
  return (
    <div style={{padding:"4px 0",borderBottom:"1px solid #0e0e1a",opacity:unit.isAlive?1:0.3}}>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <div style={{fontSize:12,color:isCurrent?"#ffd60a":isPlayer?"#4cc9f0":(unit.color||"#e05a00")}}>
          {isCurrent?"▶ ":""}{unit.isHost?"\u{1F451}":unit.isEnemy?unit.emoji:"\u{1F9D9}"} {unit.name}
          <span style={{fontSize:10,color:"#444",marginLeft:4}}>Lv{unit.level}</span>
          {unit.isBoss&&<span style={{fontSize:9,color:"#e63946",marginLeft:4}}>BOSS</span>}
        </div>
        <div style={{fontSize:11,color:"#555"}}>{unit.hp}/{unit.maxHp}</div>
      </div>
      <div style={{background:"#0a0a14",height:3,borderRadius:2,margin:"2px 0"}}>
        <div style={{height:3,borderRadius:2,background:hpPct>60?"#06d6a0":hpPct>30?"#ffd60a":"#e63946",width:hpPct+"%"}}/>
      </div>
      {isPlayer&&<div style={{fontSize:10,color:"#444"}}>E:{unit.energy}/{unit.maxEnergy} ATK:{unit.atk}</div>}
      {statuses.length>0&&<div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:2}}>
        {statuses.map((s,i)=>(<div key={i} style={{fontSize:9,padding:"1px 4px",borderRadius:3,background:(STATUS_COLORS[s.type]||"#555")+"18",color:STATUS_COLORS[s.type]||"#aaa"}}>{STATUS_ICONS[s.type]} {s.type} {s.turns}t</div>))}
      </div>}
    </div>
  );
}

function ToggleRow({label,hint,val,onChange,color}) {
  const c = color||"#ffd60a";
  return (
    <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
      <div onClick={()=>onChange(!val)} style={{width:38,height:20,background:val?c:"#1a1a1a",borderRadius:10,position:"relative",cursor:"pointer",flexShrink:0}}>
        <div style={{position:"absolute",top:3,left:val?20:3,width:14,height:14,background:"#fff",borderRadius:"50%",transition:"left .2s"}}/>
      </div>
      <div>
        <div style={{fontSize:13,color:val?c:"#aaa"}}>{label}</div>
        {hint&&<div style={{fontSize:10,color:"#444"}}>{hint}</div>}
      </div>
    </label>
  );
}

function LobbyScreen({gameCode,players,ready,onAdd,onToggle,onNext,allReady}) {
  return (
    <div style={{minHeight:"100vh",background:"#07080f",color:"#dde",fontFamily:"'Courier New',monospace",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{display:"flex",gap:24,justifyContent:"center",alignItems:"center",marginBottom:20}}>
        <div style={{height:60,padding:"0 20px",background:"#1a1a2a",borderRadius:8,display:"flex",alignItems:"center",color:"#888",fontSize:11}}>WEESWARES</div>
        <div style={{height:60,padding:"0 20px",background:"#1a1a2a",borderRadius:8,display:"flex",alignItems:"center",color:"#888",fontSize:11}}>CREST SECONDARY</div>
      </div>
      <div style={{fontSize:36,fontWeight:"bold",color:"#ffd60a",letterSpacing:6,marginBottom:2}}>DUNGEON RIFT</div>
      <div style={{color:"#333",letterSpacing:4,fontSize:11,marginBottom:32}}>MULTIPLAYER TACTICAL ROGUELIKE</div>
      <div style={{display:"flex",gap:24,flexWrap:"wrap",justifyContent:"center"}}>
        <div style={{background:"#0d0e18",border:"1px solid #1a1a2a",borderRadius:10,padding:20,minWidth:220}}>
          <div style={{fontSize:11,color:"#444",letterSpacing:2,marginBottom:12}}>JOIN CODE</div>
          <div style={{fontSize:38,fontWeight:"bold",color:"#ffd60a",letterSpacing:8,textAlign:"center",marginBottom:16}}>{gameCode}</div>
          <div style={{background:"#111",borderRadius:6,padding:12,textAlign:"center"}}>
            <div style={{fontSize:10,color:"#333",marginBottom:8}}>QR CODE</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(10,9px)",gap:1,margin:"0 auto",width:"fit-content"}}>
              {Array.from({length:100},(_,i)=><div key={i} style={{width:9,height:9,background:Math.random()>.45?"#ffd60a":"#1a1a1a",borderRadius:1}}/>)}
            </div>
          </div>
        </div>
        <div style={{background:"#0d0e18",border:"1px solid #1a1a2a",borderRadius:10,padding:20,minWidth:280}}>
          <div style={{fontSize:11,color:"#444",letterSpacing:2,marginBottom:12}}>PLAYERS ({players.length})</div>
          {players.map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #111"}}>
              <div>
                <div style={{color:p.isHost?"#ffd60a":"#ccc",fontSize:13}}>{p.isHost?"\u{1F451}":"\u{1F9D9}"} {p.name}</div>
                <div style={{fontSize:10,color:"#444"}}>Skill: {p.skills[0]?p.skills[0].name:"?"}</div>
              </div>
              <button onClick={()=>onToggle(p.id)} style={{background:ready[p.id]?"#06d6a0":"transparent",border:"1px solid "+(ready[p.id]?"#06d6a0":"#333"),color:ready[p.id]?"#000":"#555",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:11,fontFamily:"'Courier New',monospace"}}>{ready[p.id]?"READY ✓":"Not Ready"}</button>
            </div>
          ))}
          <button onClick={onAdd} style={{marginTop:12,width:"100%",background:"transparent",border:"1px dashed #2a2a2a",color:"#444",padding:8,borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:"'Courier New',monospace"}}>+ Add Player</button>
        </div>
      </div>
      <button onClick={onNext} disabled={!allReady||players.length===0} style={{marginTop:28,background:allReady?"#ffd60a":"#111",border:"none",color:allReady?"#000":"#333",padding:"12px 40px",borderRadius:6,fontSize:16,cursor:allReady?"pointer":"not-allowed",fontWeight:"bold",fontFamily:"'Courier New',monospace",letterSpacing:3}}>{allReady?"PROCEED ▶":"Waiting..."}</button>
    </div>
  );
}

function WorldScreen({cfg,onChange,onStart,players}) {
  return (
    <div style={{minHeight:"100vh",background:"#07080f",color:"#dde",fontFamily:"'Courier New',monospace",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:22,color:"#ffd60a",letterSpacing:4,marginBottom:4}}>WORLD CREATION</div>
      <div style={{color:"#333",fontSize:11,marginBottom:28}}>Configure your dungeon run</div>
      <div style={{background:"#0d0e18",border:"1px solid #1a1a2a",borderRadius:10,padding:24,width:"100%",maxWidth:460}}>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#444",letterSpacing:2,marginBottom:10}}>DIFFICULTY</div>
          <div style={{display:"flex",gap:8}}>
            {[["easy","#06d6a0","×0.7"],["medium","#ffd60a","×1.0"],["hard","#e63946","×1.4"]].map(([d,c,h])=>(
              <button key={d} onClick={()=>onChange({...cfg,difficulty:d})} style={{background:cfg.difficulty===d?c+"22":"transparent",border:"1px solid "+(cfg.difficulty===d?c:"#2a2a2a"),color:cfg.difficulty===d?c:"#555",padding:"8px 14px",borderRadius:4,cursor:"pointer",fontSize:13,fontFamily:"'Courier New',monospace"}}>{d.toUpperCase()}<div style={{fontSize:9,color:cfg.difficulty===d?c+"aa":"#333"}}>{h}</div></button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#444",letterSpacing:2,marginBottom:10}}>OPTIONS</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <ToggleRow label="Host Plays" hint="Host joins the fight" val={cfg.hostPlay} onChange={v=>onChange({...cfg,hostPlay:v})}/>
            <ToggleRow label="Tutorial" hint="Walk through how to play" val={cfg.tutorial} onChange={v=>onChange({...cfg,tutorial:v})} color="#4cc9f0"/>
          </div>
        </div>
        <div style={{borderTop:"1px solid #111",paddingTop:14,marginTop:4,fontSize:12,color:"#444"}}>Players: {players.length}</div>
        <button onClick={onStart} style={{marginTop:16,width:"100%",background:"#ffd60a",border:"none",color:"#000",padding:12,borderRadius:6,fontSize:15,cursor:"pointer",fontWeight:"bold",fontFamily:"'Courier New',monospace",letterSpacing:2}}>{cfg.tutorial?"START TUTORIAL ▶":"ENTER THE DUNGEON ▶"}</button>
      </div>
    </div>
  );
}

function ShopScreen({players,shopItems,shopMsg,fightNum,onBuy,onEnter,viewId,setViewId}) {
  const isBoss = fightNum>0&&fightNum%5===0;
  const player = players.find(p=>p.id===viewId)||players[0];
  const items = player?(shopItems[player.id]||[]):[];
  if (!player) return null;
  return (
    <div style={{minHeight:"100vh",background:"#07080f",color:"#dde",fontFamily:"'Courier New',monospace",display:"flex",flexDirection:"column",alignItems:"center",padding:24}}>
      <div style={{fontSize:22,color:"#ffd60a",letterSpacing:3,marginBottom:4}}>{isBoss?"⚠️ BOSS APPROACHING — ":""}DUNGEON SHOP</div>
      <div style={{color:"#333",fontSize:11,marginBottom:20}}>Next: Fight {fightNum+1}{(fightNum+1)%5===0?" (BOSS!)":""}</div>
      <div style={{background:"#0d0e18",border:"1px solid #1a1a2a",borderRadius:10,padding:16,marginBottom:20,maxWidth:500,textAlign:"center",width:"100%"}}>
        <div style={{fontSize:28,marginBottom:8}}>\u{1F9D9}\u{200D}\u{2642}\u{FE0F}</div>
        <div style={{fontSize:13,color:"#c9a",fontStyle:"italic"}}>"{shopMsg}"</div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",justifyContent:"center"}}>
        {players.map(p=><button key={p.id} onClick={()=>setViewId(p.id)} style={{background:viewId===p.id?"#ffd60a18":"transparent",border:"1px solid "+(viewId===p.id?"#ffd60a":"#222"),color:viewId===p.id?"#ffd60a":"#555",padding:"6px 14px",borderRadius:4,cursor:"pointer",fontSize:12,fontFamily:"'Courier New',monospace"}}>{p.isHost?"\u{1F451}":"\u{1F9D9}"} {p.name}</button>)}
      </div>
      <div style={{width:"100%",maxWidth:720}}>
        <div style={{background:"#0d0e18",border:"1px solid #161628",borderRadius:8,padding:12,marginBottom:16,display:"flex",gap:20,flexWrap:"wrap"}}>
          {[["GOLD","\u{1F4B0} "+player.gold,"#ffd60a"],["HP",player.hp+"/"+player.maxHp,"#06d6a0"],["ATK",player.atk,"#e05a00"],["LV",player.level,"#c77dff"],["XP",player.xp+"/"+player.xpToNext,"#666"]].map(([l,v,c])=>(
            <div key={l}><div style={{fontSize:10,color:"#333"}}>{l}</div><div style={{fontSize:14,color:c}}>{v}</div></div>
          ))}
        </div>
        <div style={{fontSize:10,color:"#444",letterSpacing:2,marginBottom:12}}>FOR SALE</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:10,marginBottom:24}}>
          {items.map((item,i)=>{
            const canAfford=player.gold>=item.cost;
            const tierColor=item.tier==="legendary"?"#ffd60a":item.tier==="rare"?"#c77dff":item.tier==="uncommon"?"#4cc9f0":"#888";
            const catColor=item.category==="relic"?tierColor:item.category==="skill"?(item.isSupport?"#06d6a0":(item.color||"#c77dff")):"#ffd60a";
            return (
              <div key={i} style={{background:"#0d0e18",border:"1px solid "+(canAfford?catColor+"44":"#111"),borderRadius:8,padding:12,opacity:canAfford?1:0.4}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div style={{fontSize:12,color:catColor}}>{item.category==="relic"?"◆":item.category==="skill"?"✦":"•"} {item.name}</div>
                  <div style={{fontSize:11,color:canAfford?"#ffd60a":"#333"}}>\u{1F4B0}{item.cost}</div>
                </div>
                <div style={{fontSize:10,color:"#444",marginBottom:8}}>{item.desc}</div>
                <button onClick={()=>onBuy(player.id,item)} disabled={!canAfford} style={{width:"100%",background:canAfford?catColor+"12":"transparent",border:"1px solid "+(canAfford?catColor+"44":"#1a1a1a"),color:canAfford?catColor:"#2a2a2a",padding:4,borderRadius:4,cursor:canAfford?"pointer":"not-allowed",fontSize:11,fontFamily:"'Courier New',monospace"}}>BUY</button>
              </div>
            );
          })}
          {items.length===0&&<div style={{color:"#222",fontSize:12,padding:8}}>Sold out!</div>}
        </div>
      </div>
      <button onClick={onEnter} style={{background:isBoss?"#e6394618":"#ffd60a18",border:"2px solid "+(isBoss?"#e63946":"#ffd60a"),color:isBoss?"#e63946":"#ffd60a",padding:"12px 40px",borderRadius:6,fontSize:16,cursor:"pointer",fontWeight:"bold",fontFamily:"'Courier New',monospace",letterSpacing:2}}>{isBoss?"⚠️ ENTER BOSS FIGHT":"ENTER FIGHT ▶"}</button>
    </div>
  );
}

function GameOverScreen({fightNum,players,onRestart}) {
  return (
    <div style={{minHeight:"100vh",background:"#07080f",color:"#dde",fontFamily:"'Courier New',monospace",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:44,color:"#e63946",letterSpacing:5,marginBottom:8}}>DEFEATED</div>
      <div style={{color:"#333",marginBottom:28}}>The dungeon claimed you on fight {fightNum}</div>
      <div style={{background:"#0d0e18",border:"1px solid #1a1a2a",borderRadius:10,padding:20,marginBottom:28,minWidth:300}}>
        {players.map(p=>(
          <div key={p.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #0e0e1a",fontSize:13}}>
            <span style={{color:p.isAlive?"#ccc":"#333"}}>{p.isHost?"\u{1F451}":"\u{1F9D9}"} {p.name}</span>
            <span style={{color:"#444"}}>Lv{p.level} · {p.relics.length} relics · {p.gold}g</span>
          </div>
        ))}
      </div>
      <button onClick={onRestart} style={{background:"#ffd60a",border:"none",color:"#000",padding:"12px 40px",borderRadius:6,fontSize:16,cursor:"pointer",fontWeight:"bold",fontFamily:"'Courier New',monospace",letterSpacing:3}}>PLAY AGAIN</button>
    </div>
  );
}
