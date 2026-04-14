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

function LobbyScreen({myRole,peerId,joinUrl,players,ready,onToggle,onNext,allReady,connError}) {
  const qrRef = useRef(null);
  useEffect(()=>{
    if(myRole!=="host"||!joinUrl||!qrRef.current||!window.QRCode) return;
    window.QRCode.toCanvas(qrRef.current,joinUrl,{width:180,margin:1,color:{dark:"#ffd60a",light:"#111111"}},(err)=>{if(err)console.error(err);});
  },[myRole,joinUrl]);
  const isClient = myRole==="client";
  return (
    <div style={{minHeight:"100vh",background:"#07080f",color:"#dde",fontFamily:"'Courier New',monospace",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{fontSize:36,fontWeight:"bold",color:"#ffd60a",letterSpacing:6,marginBottom:2}}>DUNGEON RIFT</div>
      <div style={{color:"#333",letterSpacing:4,fontSize:11,marginBottom:32}}>MULTIPLAYER TACTICAL ROGUELIKE</div>
      {connError&&<div style={{color:"#e63946",marginBottom:16,fontSize:12}}>⚠ {connError}</div>}
      <div style={{display:"flex",gap:24,flexWrap:"wrap",justifyContent:"center",alignItems:"flex-start"}}>
        {myRole==="host"&&<div style={{background:"#0d0e18",border:"1px solid #1a1a2a",borderRadius:10,padding:20,minWidth:240}}>
          <div style={{fontSize:11,color:"#444",letterSpacing:2,marginBottom:12,textAlign:"center"}}>SCAN TO JOIN</div>
          <div style={{background:"#111",borderRadius:6,padding:10,display:"flex",justifyContent:"center"}}>
            {peerId?<canvas ref={qrRef} style={{borderRadius:4}}/>:<div style={{width:180,height:180,display:"flex",alignItems:"center",justifyContent:"center",color:"#444",fontSize:11}}>Connecting...</div>}
          </div>
          <div style={{fontSize:9,color:"#333",marginTop:10,wordBreak:"break-all",textAlign:"center"}}>{joinUrl||"…"}</div>
        </div>}
        {isClient&&<div style={{background:"#0d0e18",border:"1px solid #1a1a2a",borderRadius:10,padding:20,minWidth:240,textAlign:"center"}}>
          <div style={{fontSize:11,color:"#444",letterSpacing:2,marginBottom:12}}>JOINED AS CLIENT</div>
          <div style={{fontSize:32,marginBottom:10}}>{"\u{1F9D9}"}</div>
          <div style={{fontSize:12,color:"#999"}}>Waiting for host to start the game...</div>
        </div>}
        <div style={{background:"#0d0e18",border:"1px solid #1a1a2a",borderRadius:10,padding:20,minWidth:280}}>
          <div style={{fontSize:11,color:"#444",letterSpacing:2,marginBottom:12}}>PLAYERS ({players.length})</div>
          {players.length===0&&<div style={{fontSize:11,color:"#333",padding:"8px 0"}}>No players yet — scan the QR code to join.</div>}
          {players.map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #111"}}>
              <div>
                <div style={{color:p.isHost?"#ffd60a":"#ccc",fontSize:13}}>{p.isHost?"\u{1F451}":"\u{1F9D9}"} {p.name}</div>
                <div style={{fontSize:10,color:"#444"}}>Skill: {p.skills[0]?p.skills[0].name:"?"}</div>
              </div>
              {myRole==="host"?(
                <button onClick={()=>onToggle(p.id)} style={{background:ready[p.id]?"#06d6a0":"transparent",border:"1px solid "+(ready[p.id]?"#06d6a0":"#333"),color:ready[p.id]?"#000":"#555",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:11,fontFamily:"'Courier New',monospace"}}>{ready[p.id]?"READY ✓":"Not Ready"}</button>
              ):(
                <span style={{fontSize:11,color:ready[p.id]?"#06d6a0":"#555"}}>{ready[p.id]?"READY ✓":"..."}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      {myRole==="host"&&<button onClick={onNext} disabled={!allReady||players.length===0} style={{marginTop:28,background:allReady?"#ffd60a":"#111",border:"none",color:allReady?"#000":"#333",padding:"12px 40px",borderRadius:6,fontSize:16,cursor:allReady&&players.length>0?"pointer":"not-allowed",fontWeight:"bold",fontFamily:"'Courier New',monospace",letterSpacing:3}}>{allReady&&players.length>0?"PROCEED ▶":"Waiting for players..."}</button>}
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
        <div style={{fontSize:28,marginBottom:8}}>{"\u{1F9D9}\u{200D}\u{2642}\u{FE0F}"}</div>
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
                  <div style={{fontSize:11,color:canAfford?"#ffd60a":"#333"}}>{"\u{1F4B0}"}{item.cost}</div>
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

export default function DungeonRift() {
  const [screen, setScreen] = useState("lobby");
  const [myRole, setMyRole] = useState("undecided");
  const [peerId, setPeerId] = useState(null);
  const [hostId, setHostId] = useState(null);
  const [connError, setConnError] = useState(null);
  const peerRef = useRef(null);
  const hostConnRef = useRef(null);
  const connsRef = useRef([]);
  const [players, setPlayers] = useState([]);
  const [ready, setReady] = useState({});
  const [cfg, setCfg] = useState({difficulty:"medium",hostPlay:false,tutorial:false});
  const [fightNum, setFightNum] = useState(0);
  const [enemies, setEnemies] = useState([]);
  const [positions, setPositions] = useState({players:{},enemies:{}});
  const [gs, setGs] = useState(8);
  const [queue, setQueue] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);
  const [selAct, setSelAct] = useState(null);
  const [hlMove, setHlMove] = useState([]);
  const [hlAtk, setHlAtk] = useState([]);
  const [hlAoe, setHlAoe] = useState([]);
  const [hovSkill, setHovSkill] = useState(null);
  const [hitFx, setHitFx] = useState([]);
  const [enemyActing, setEnemyActing] = useState(false);
  const [shopItems, setShopItems] = useState({});
  const [shopMsg, setShopMsg] = useState(SK_LINES[0]);
  const [shopBuyCD, setShopBuyCD] = useState(false);
  const [shopVid, setShopVid] = useState(null);
  const [log, setLog] = useState([]);
  const logRef = useRef(null);
  const [notif, setNotif] = useState(null);

  const enemiesRef = useRef(enemies);
  const playersRef = useRef(players);
  const posRef = useRef(positions);
  const queueRef = useRef(queue);
  const gsRef = useRef(gs);
  const fightRef = useRef(fightNum);
  const qIdxRef = useRef(qIdx);
  const execRemoteActionRef = useRef(null);
  useEffect(()=>{enemiesRef.current=enemies;},[enemies]);
  useEffect(()=>{playersRef.current=players;},[players]);
  useEffect(()=>{posRef.current=positions;},[positions]);
  useEffect(()=>{queueRef.current=queue;},[queue]);
  useEffect(()=>{gsRef.current=gs;},[gs]);
  useEffect(()=>{fightRef.current=fightNum;},[fightNum]);
  useEffect(()=>{qIdxRef.current=qIdx;},[qIdx]);

  const pushLog = useCallback((msg,type)=>{setLog(prev=>[...prev.slice(-60),{msg,type:type||"info",id:uid()}]);},[]);
  const showNotif = useCallback((msg,color)=>{setNotif({msg,color:color||"#ffd60a"});setTimeout(()=>setNotif(null),2200);},[]);
  const spawnFx = useCallback((row,col,label,color)=>{
    const fid=uid();
    setHitFx(prev=>[...prev,{id:fid,row,col,label,color}]);
    setTimeout(()=>setHitFx(prev=>prev.filter(f=>f.id!==fid)),900);
  },[]);

  useEffect(()=>{if(logRef.current)logRef.current.scrollTop=logRef.current.scrollHeight;},[log]);

  const chatterRef = useRef(null);
  const startChatter = useCallback(()=>{
    if(chatterRef.current)clearInterval(chatterRef.current);
    setShopMsg(randPick(SK_LINES));
    chatterRef.current=setInterval(()=>setShopMsg(randPick(SK_LINES)),7000);
  },[]);
  useEffect(()=>()=>{if(chatterRef.current)clearInterval(chatterRef.current);},[]);

  const toggleReady = id=>setReady(prev=>({...prev,[id]:!prev[id]}));
  const allReady = players.length>0&&players.every(p=>ready[p.id]);
  const joinUrl = myRole==="host"&&peerId?(window.location.origin+window.location.pathname+"?room="+peerId):"";

  // Detect role from URL
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if(room){setMyRole("client");setHostId(room);} else setMyRole("host");
  },[]);

  // Setup PeerJS
  useEffect(()=>{
    if(myRole==="undecided"||!window.Peer) return;
    const peer = new window.Peer();
    peerRef.current = peer;
    peer.on("open", id=>{
      setPeerId(id);
      if(myRole==="client"&&hostId){
        const conn = peer.connect(hostId,{reliable:true});
        hostConnRef.current = conn;
        conn.on("open", ()=>{
          conn.send({type:"join",name:"Player "+Math.floor(Math.random()*900+100)});
        });
        conn.on("data", msg=>{
          if(msg.type==="state"){
            if(msg.players) setPlayers(msg.players);
            if(msg.ready) setReady(msg.ready);
            if(msg.screen) setScreen(msg.screen);
            if(msg.enemies) setEnemies(msg.enemies);
            if(msg.positions) setPositions(msg.positions);
            if(msg.gs) setGs(msg.gs);
            if(msg.queue) setQueue(msg.queue);
            if(msg.qIdx!==undefined) setQIdx(msg.qIdx);
            if(msg.fightNum!==undefined) setFightNum(msg.fightNum);
            if(msg.enemyActing!==undefined) setEnemyActing(msg.enemyActing);
            if(msg.log) setLog(msg.log);
            if(msg.shopItems) setShopItems(msg.shopItems);
            if(msg.shopVid) setShopVid(msg.shopVid);
          }
        });
        conn.on("error", e=>setConnError("Connection error: "+(e.message||e)));
      }
    });
    peer.on("error", e=>setConnError(e.type==="peer-unavailable"?"Host not found — is the link still valid?":(e.message||String(e))));
    if(myRole==="host"){
      peer.on("connection", conn=>{
        conn.on("open", ()=>{
          connsRef.current = [...connsRef.current, conn];
          conn.on("data", msg=>{
            if(msg.type==="join"){
              setPlayers(prev=>prev.find(p=>p.id===conn.peer)?prev:[...prev,makePlayer(conn.peer, msg.name||"Player", false)]);
            } else if(msg.type==="ready"){
              setReady(prev=>({...prev,[conn.peer]:!prev[conn.peer]}));
            } else if(msg.type==="action"){
              execRemoteActionRef.current && execRemoteActionRef.current(conn.peer, msg);
            }
          });
          conn.on("close", ()=>{
            connsRef.current = connsRef.current.filter(c=>c!==conn);
            setPlayers(prev=>prev.filter(p=>p.id!==conn.peer));
            setReady(prev=>{const n={...prev};delete n[conn.peer];return n;});
          });
        });
      });
    }
    return ()=>{try{peer.destroy();}catch(e){}};
  },[myRole,hostId]);

  // Auto-create host player entry
  useEffect(()=>{
    if(myRole==="host"&&peerId&&players.length===0){
      setPlayers([makePlayer(peerId,"Host",true)]);
    }
  },[myRole,peerId,players.length]);

  // On client, default the shop view tab to their own character when arriving at shop
  useEffect(()=>{
    if(myRole==="client"&&screen==="shop"&&peerId) setShopVid(peerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[screen,myRole,peerId]);

  // Broadcast state changes from host to clients
  useEffect(()=>{
    if(myRole!=="host") return;
    const payload = {type:"state",screen,players,ready,enemies,positions,gs,queue,qIdx,fightNum,enemyActing,log,shopItems,shopVid};
    connsRef.current.forEach(c=>{try{if(c.open)c.send(payload);}catch(e){}});
  },[myRole,screen,players,ready,enemies,positions,gs,queue,qIdx,fightNum,enemyActing,log,shopItems,shopVid]);

  const goToShop = (pls)=>{
    const items={}; pls.forEach(p=>{items[p.id]=genShopItems(p);});
    setShopItems(items); setShopVid(pls[0]?pls[0].id:null); setFightNum(0); setLog([]); setScreen("shop"); startChatter();
  };

  const startWorld = ()=>{if(cfg.tutorial){setScreen("tutorial");return;}goToShop(players);};

  const _execBuyFor = (pid, itemId)=>{
    const items = (shopItems[pid]||[]);
    const item = items.find(i=>i.id===itemId);
    if(!item) return;
    setPlayers(prev=>prev.map(p=>{
      if(p.id!==pid||p.gold<item.cost) return p;
      let u={...p};
      if(item.category==="relic") u=applyRelic(u,item);
      else if(item.category==="skill") {u.skills=[...u.skills,item];u.gold-=item.cost;}
      else {u.consumables=[...u.consumables,item];u.gold-=item.cost;}
      return u;
    }));
    setShopItems(prev=>({...prev,[pid]:(prev[pid]||[]).filter(i=>i.id!==itemId)}));
    if(!shopBuyCD){setShopBuyCD(true);setShopMsg(randPick(SK_BUY));setTimeout(()=>{setShopBuyCD(false);setShopMsg(randPick(SK_LINES));},3500);}
  };

  const buyItem = (pid,item)=>{
    if(myRole==="client"){
      // Clients can only buy for their own peer id
      if(pid!==peerId) return;
      if(hostConnRef.current&&hostConnRef.current.open) hostConnRef.current.send({type:"action",kind:"buy",pid,itemId:item.id});
      return;
    }
    _execBuyFor(pid, item.id);
  };

  const enterCombat = ()=>{
    if(myRole!=="host") return;
    if(chatterRef.current)clearInterval(chatterRef.current);
    const nf=fightNum+1; setFightNum(nf);
    const isBoss=nf%5===0;
    const dm=cfg.difficulty==="easy"?0.7:cfg.difficulty==="hard"?1.4:1.0;
    let newEnemies;
    if(isBoss){
      const bosses=ENEMY_TYPES.filter(e=>e.isBoss);
      newEnemies=[makeEnemy(bosses[(Math.floor(nf/5)-1)%bosses.length],nf,dm)];
    } else {
      const nonBoss=ENEMY_TYPES.filter(e=>!e.isBoss);
      const cnt=Math.max(1,Math.min(players.length+randInt(-1,2),6));
      const shuffled=[...nonBoss].sort(()=>Math.random()-0.5);
      newEnemies=Array.from({length:cnt},(_,i)=>makeEnemy(shuffled[i%shuffled.length],nf,dm));
    }
    const healed=players.map(p=>({...p,hp:p.maxHp,isAlive:true,buffs:[],debuffs:[],energy:p.maxEnergy}));
    setPlayers(healed);
    const total=healed.length+newEnemies.length;
    const newGs=calcGridSize(total); setGs(newGs);
    const newPos=placeUnits(healed,newEnemies,newGs);
    setPositions(newPos); setEnemies(newEnemies);
    const order=[...healed.map(p=>({id:p.id,isEnemy:false})),...newEnemies.map(e=>({id:e.id,isEnemy:true}))].sort(()=>Math.random()-0.5);
    setQueue(order); setQIdx(0); setHasMoved(false); setSelAct(null);
    setHlMove([]); setHlAtk([]); setHlAoe([]); setHitFx([]); setEnemyActing(false); setLog([]);
    setScreen("combat");
    pushLog("Fight "+nf+" begins!"+(isBoss?" BOSS FIGHT!":""),"system");
  };

  const endFight = useCallback((victory,latestE,latestP)=>{
    setEnemyActing(false);
    if(victory){
      const fn=fightRef.current;
      const isBoss=fn%5===0;
      const updP=latestP.map(p=>{
        if(!p.isAlive) return p;
        const goldGain=randInt(isBoss?90:25,isBoss?110:30);
        const xpGain=randInt(isBoss?70:20,isBoss?80:25);
        let xp=p.xp+xpGain,level=p.level,xpToNext=p.xpToNext,maxHp=p.maxHp,atk=p.atk;
        while(xp>=xpToNext){xp-=xpToNext;level++;xpToNext=Math.round(xpToNext*1.4);maxHp=Math.round(maxHp*1.05);atk=Math.round(atk*1.05);}
        return {...p,gold:p.gold+goldGain,xp,level,xpToNext,maxHp,atk};
      });
      setPlayers(updP);
      showNotif(isBoss?"BOSS DEFEATED!":"Victory!","#06d6a0");
      setTimeout(()=>{
        const items={}; updP.forEach(p=>{items[p.id]=genShopItems(p);});
        setShopItems(items); setShopVid(updP[0]?updP[0].id:null); setScreen("shop"); startChatter();
      },1800);
    } else {
      showNotif("All heroes fell...","#e63946");
      setTimeout(()=>setScreen("gameover"),2000);
    }
  },[showNotif,startChatter]);

  const advanceTurn = useCallback((latestE,latestP)=>{
    const aliveE=latestE.filter(e=>e.isAlive);
    const aliveP=latestP.filter(p=>p.isAlive);
    if(aliveE.length===0){endFight(true,latestE,latestP);return;}
    if(aliveP.length===0){endFight(false,latestE,latestP);return;}
    setHasMoved(false); setSelAct(null); setHlMove([]); setHlAtk([]); setHlAoe([]);
    setQIdx(prev=>{
      const q=queueRef.current;
      let next=(prev+1)%q.length;
      for(let i=0;i<q.length;i++){
        const slot=q[next];
        const alive=slot.isEnemy?(latestE.find(e=>e.id===slot.id)||{}).isAlive:(latestP.find(p=>p.id===slot.id)||{}).isAlive;
        if(alive) break;
        next=(next+1)%q.length;
      }
      return next;
    });
  },[endFight]);

  const doEnemyTurn = useCallback((rawEnemy)=>{
    const latestE=enemiesRef.current, latestP=playersRef.current, latestPos=posRef.current;
    const rawE=latestE.find(e=>e.id===rawEnemy.id)||rawEnemy;
    const wasStunned=rawE.debuffs&&rawE.debuffs.some(d=>d.type==="Stun");
    const ticked=tickUnit(rawE);
    const newEnergy=Math.min(ticked.maxEnergy,ticked.energy+ticked.energyRegen);
    const tickedE={...ticked,energy:newEnergy};
    let updE=latestE.map(e=>e.id===rawEnemy.id?tickedE:e);
    setEnemies(updE);
    if(!tickedE.isAlive){setEnemyActing(false);advanceTurn(updE,latestP);return;}
    if(wasStunned){pushLog(tickedE.name+" is stunned!","debuff");setEnemyActing(false);advanceTurn(updE,latestP);return;}
    const alivePl=latestP.filter(p=>p.isAlive);
    if(!alivePl.length){setEnemyActing(false);advanceTurn(updE,latestP);return;}
    const target=randPick(alivePl);
    const ePos=latestPos.enemies[tickedE.id], tPos=latestPos.players[target.id];
    let newPos={...latestPos};
    if(ePos&&tPos&&manhattan(ePos,tPos)>2){
      const allOcc=[...Object.values(latestPos.players),...Object.values(latestPos.enemies)];
      const slow=tickedE.debuffs.find(d=>d.type==="Slow");
      const mr=Math.max(1,tickedE.moveRange-(slow?slow.val:0));
      const movable=getReachable(ePos,mr,gsRef.current,allOcc.filter(o=>!(o.row===ePos.row&&o.col===ePos.col)));
      if(movable.length>0){
        const best=movable.reduce((a,b)=>manhattan(b,tPos)<manhattan(a,tPos)?b:a);
        newPos={...newPos,enemies:{...newPos.enemies,[tickedE.id]:best}};
        setPositions(newPos);
      }
    }
    const usable=tickedE.skills.map(sid=>SKILLS.find(s=>s.id===sid)).filter(s=>s&&(s.dmgMult>0||s.dispel)&&s.target==="enemy"&&newEnergy>=(s.cost-(tickedE.skillCostReduce||0)));
    const skill=usable.length>0&&Math.random()>.35?randPick(usable):null;

    const resolveAttack=(attacker,sk,tgt,curE,curP,energyPool)=>{
      const tPos2=posRef.current.players[tgt.id];
      if(!tPos2) return [curE,curP];
      let totalDmg=0; let updP2=[...curP], updE2=[...curE];
      if(sk){
        const dmg=calcSkillDmg(attacker,sk,tgt,sk.trueDmg);
        const reaction=sk.status?checkReaction(tgt,sk.status,attacker.atk):null;
        totalDmg=dmg+(reaction?reaction.dmg:0);
        updP2=curP.map(p=>{
          if(p.id!==tgt.id) return p;
          let hp=Math.max(0,p.hp-totalDmg);
          let u={...p,hp};
          if(sk.status&&DEBUFF_TYPES.has(sk.status.type)) u=applyStatus(u,sk.status,attacker.atk);
          if(hp<=0&&u.revive&&!u.hasRevived){hp=Math.round(u.maxHp*.3);u={...u,hp,isAlive:true,hasRevived:true};pushLog(u.name+" revives!","system");}
          else u.isAlive=hp>0;
          return u;
        });
        updE2=curE.map(e=>e.id===attacker.id?{...e,energy:Math.max(0,energyPool-sk.cost)}:e);
        if(tPos2){spawnFx(tPos2.row,tPos2.col,"-"+totalDmg,"#e63946");if(reaction)spawnFx(tPos2.row,Math.max(0,tPos2.col-1),reaction.name,reaction.color);}
        pushLog(attacker.name+" uses "+sk.name+" on "+tgt.name+" for "+totalDmg,"enemy");
      } else {
        totalDmg=calcBasicDmg(attacker,tgt);
        updP2=curP.map(p=>{
          if(p.id!==tgt.id) return p;
          let hp=Math.max(0,p.hp-totalDmg);
          let u={...p,hp};
          if(hp<=0&&u.revive&&!u.hasRevived){hp=Math.round(u.maxHp*.3);u={...u,hp,isAlive:true,hasRevived:true};pushLog(u.name+" revives!","system");}
          else u.isAlive=hp>0;
          return u;
        });
        if(tPos2) spawnFx(tPos2.row,tPos2.col,"-"+totalDmg,"#e63946");
        pushLog(attacker.name+" attacks "+tgt.name+" for "+totalDmg,"enemy");
      }
      return [updE2,updP2];
    };

    setTimeout(()=>{
      const ePosFresh=posRef.current.enemies[tickedE.id], tPosFresh=posRef.current.players[target.id];
      if(!tPosFresh||!ePosFresh){setEnemyActing(false);advanceTurn(enemiesRef.current,playersRef.current);return;}
      let [updE2,updP] = resolveAttack(tickedE,skill,target,enemiesRef.current,playersRef.current,newEnergy);
      setEnemies(updE2); setPlayers(updP);
      if(tickedE.isBoss){
        setTimeout(()=>{
          const latestE2=enemiesRef.current, latestP2=playersRef.current;
          const alivePl2=latestP2.filter(p=>p.isAlive);
          if(!alivePl2.length){setEnemyActing(false);advanceTurn(latestE2,latestP2);return;}
          const target2=randPick(alivePl2);
          const bossE=latestE2.find(e=>e.id===tickedE.id)||tickedE;
          const usable2=bossE.skills.map(sid=>SKILLS.find(s=>s.id===sid)).filter(s=>s&&s.dmgMult>0&&s.target==="enemy"&&bossE.energy>=(s.cost-(bossE.skillCostReduce||0)));
          const skill2=usable2.length>0&&Math.random()>.3?randPick(usable2):null;
          pushLog(bossE.name+" attacks AGAIN!","system");
          const [updE3,updP2] = resolveAttack(bossE,skill2,target2,latestE2,latestP2,bossE.energy);
          setEnemies(updE3); setPlayers(updP2);
          setEnemyActing(false); advanceTurn(updE3,updP2);
        },700);
      } else { setEnemyActing(false); advanceTurn(updE2,updP); }
    },500);
  },[advanceTurn,pushLog,spawnFx]);

  useEffect(()=>{
    if(screen!=="combat"||myRole!=="host") return;
    const slot=queue[qIdx];
    if(!slot||!slot.isEnemy) return;
    const enemy=enemies.find(e=>e.id===slot.id);
    if(!enemy||!enemy.isAlive){advanceTurn(enemies,players);return;}
    setEnemyActing(true);
    const t=setTimeout(()=>doEnemyTurn(enemy),900);
    return ()=>clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[qIdx,screen,myRole]);

  useEffect(()=>{
    if(screen!=="combat"||myRole!=="host") return;
    const slot=queue[qIdx];
    if(!slot||slot.isEnemy) return;
    const player=players.find(p=>p.id===slot.id);
    if(!player) return;
    if(!player.isAlive){advanceTurn(enemies,players);return;}
    const wasStunned=player.debuffs&&player.debuffs.some(d=>d.type==="Stun");
    const ticked=tickUnit(player);
    const newE=Math.min(ticked.maxEnergy,ticked.energy+ticked.energyRegen);
    const updP=players.map(p=>p.id===slot.id?{...ticked,energy:newE}:p);
    setPlayers(updP);
    if(!ticked.isAlive){setTimeout(()=>advanceTurn(enemies,updP),50);return;}
    if(wasStunned){pushLog(ticked.name+" is stunned!","debuff");setTimeout(()=>advanceTurn(enemies,updP),300);}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[qIdx,screen,myRole]);

  const currentSlot = queue[qIdx];
  const currentIsEnemy = currentSlot?currentSlot.isEnemy:false;
  const currentPlayer = !currentIsEnemy?players.find(p=>p.id===(currentSlot?currentSlot.id:null)):null;
  const isMyTurn = !!currentPlayer&&currentPlayer.isAlive&&!enemyActing&&currentPlayer.id===peerId;
  const getOccupied = ()=>[...Object.values(positions.players),...Object.values(positions.enemies)];
  const getSkillRange = (skill)=>skill.range!==undefined?skill.range:3;

  const selectAct = (act)=>{
    if(!isMyTurn) return;
    if(act===selAct){setSelAct(null);setHlMove([]);setHlAtk([]);setHlAoe([]);return;}
    setSelAct(act);
    const pPos=positions.players[currentPlayer.id];
    if(!pPos) return;
    if(act==="move"){
      if(hasMoved){showNotif("Already moved!","#888");setSelAct(null);return;}
      const occ=getOccupied().filter(o=>!(o.row===pPos.row&&o.col===pPos.col));
      const slow=currentPlayer.debuffs.find(d=>d.type==="Slow");
      const mr=Math.max(1,currentPlayer.moveRange-(slow?slow.val:0));
      setHlMove(getReachable(pPos,mr,gs,occ));setHlAtk([]);setHlAoe([]);
    } else if(act==="basic"){
      setHlAtk(getAttackable(pPos,2,gs));setHlMove([]);setHlAoe([]);
    } else {
      const skill=currentPlayer.skills.find(s=>s.id===act);
      if(skill){
        const r=getSkillRange(skill);
        if(skill.aoe&&r===0){setHlAtk([pPos]);setHlMove([]);setHlAoe([]);}
        else {setHlAtk(getAttackable(pPos,r,gs));setHlMove([]);setHlAoe([]);}
      }
    }
  };

  const clearAction = ()=>{setSelAct(null);setHlMove([]);setHlAtk([]);setHlAoe([]);};
  const finishAction = (updE,updP)=>{clearAction();advanceTurn(updE,updP);};

  const handleCellHover = (row,col)=>{
    if(!isMyTurn||!selAct||selAct==="move"||selAct==="basic") return;
    const skill=currentPlayer&&currentPlayer.skills.find(s=>s.id===selAct);
    if(!skill||!skill.aoer||skill.aoer===0) return;
    if(hlAtk.some(c=>c.row===row&&c.col===col)) setHlAoe(getAoeTargets({row,col},skill.aoer,gs));
    else setHlAoe([]);
  };

  const doBasicAtk = (attacker,target)=>{
    const dmg=calcBasicDmg(attacker,target);
    const updE=enemies.map(e=>e.id!==target.id?e:{...e,hp:Math.max(0,e.hp-dmg),isAlive:e.hp-dmg>0});
    setEnemies(updE);
    const ep=positions.enemies[target.id];
    if(ep)spawnFx(ep.row,ep.col,"-"+dmg,"#e05a00");
    pushLog(attacker.name+" attacks "+target.name+" for "+dmg,"combat");
    finishAction(updE,players);
  };

  const doSkillAtk = (attacker,target,skill,cost)=>{
    const dmg=(skill.dmgMult||0)>0?calcSkillDmg(attacker,skill,target,skill.trueDmg):0;
    const reaction=skill.status?checkReaction(target,skill.status,attacker.atk):null;
    const total=dmg+(reaction?reaction.dmg:0);
    const healAmt=skill.lifesteal?Math.round(total*skill.lifesteal):0;
    let updE=enemies.map(e=>{
      if(e.id!==target.id) return e;
      let u={...e,hp:Math.max(0,e.hp-total),isAlive:e.hp-total>0};
      if(skill.status&&DEBUFF_TYPES.has(skill.status.type)) u=applyStatus(u,skill.status,attacker.atk);
      if(skill.dispel) u={...u,buffs:[]};
      return u;
    });
    let updP=players.map(p=>{
      if(p.id!==attacker.id) return p;
      let u={...p,energy:p.energy-cost};
      if(healAmt>0) u.hp=Math.min(p.maxHp,p.hp+healAmt+(p.healBonus?Math.round(p.atk*p.healBonus):0));
      return u;
    });
    setEnemies(updE); setPlayers(updP);
    const ep=positions.enemies[target.id];
    if(ep){spawnFx(ep.row,ep.col,"-"+total,skill.color||"#e05a00");if(reaction)spawnFx(ep.row,Math.max(0,ep.col-1),reaction.name,reaction.color);}
    pushLog(attacker.name+" uses "+skill.name+" on "+target.name+" for "+total+(reaction?" "+reaction.name:"")+(healAmt?" (+"+healAmt+"hp)":""),"combat");
    finishAction(updE,updP);
  };

  const doRadiusAtk = (attacker,skill,cost,center)=>{
    const aoeCells=getAoeTargets(center,skill.aoer,gs);
    let updE=[...enemies]; let hits=0;
    enemies.filter(e=>e.isAlive).forEach(e=>{
      const ep=positions.enemies[e.id];
      if(!ep||!aoeCells.some(c=>c.row===ep.row&&c.col===ep.col)) return;
      const dmg=calcSkillDmg(attacker,skill,e,skill.trueDmg);
      const reaction=skill.status?checkReaction(e,skill.status,attacker.atk):null;
      const total=dmg+(reaction?reaction.dmg:0);
      updE=updE.map(x=>{
        if(x.id!==e.id) return x;
        let u={...x,hp:Math.max(0,x.hp-total),isAlive:x.hp-total>0};
        if(skill.status&&DEBUFF_TYPES.has(skill.status.type)) u=applyStatus(u,skill.status,attacker.atk);
        if(skill.dispel) u={...u,buffs:[]};
        return u;
      });
      spawnFx(ep.row,ep.col,"-"+total,skill.color||"#e05a00");
      if(reaction) spawnFx(ep.row,Math.max(0,ep.col-1),reaction.name,reaction.color);
      hits++;
    });
    const updP=players.map(p=>p.id!==attacker.id?p:{...p,energy:p.energy-cost});
    setEnemies(updE); setPlayers(updP);
    pushLog(attacker.name+" uses "+skill.name+" hitting "+hits+" enem"+(hits===1?"y":"ies"),"combat");
    finishAction(updE,updP);
  };

  const doRadiusDispel = (attacker,skill,cost,center)=>{
    const aoeCells=getAoeTargets(center,skill.aoer,gs);
    let updE=enemies.map(e=>{
      const ep=positions.enemies[e.id];
      if(!ep||!aoeCells.some(c=>c.row===ep.row&&c.col===ep.col)) return e;
      return {...e,buffs:[]};
    });
    const updP=players.map(p=>p.id!==attacker.id?p:{...p,energy:p.energy-cost});
    setEnemies(updE); setPlayers(updP);
    pushLog(attacker.name+" uses "+skill.name+" — strips buffs!","combat");
    finishAction(updE,updP);
  };

  const doAoeBuff = (attacker,skill,cost)=>{
    let updP=players.map(p=>{
      if(!p.isAlive) return p;
      let u={...p};
      if(skill.status) u=applyStatus(u,skill.status,attacker.atk);
      if(p.id===attacker.id) u={...u,energy:u.energy-cost};
      return u;
    });
    setPlayers(updP);
    pushLog(attacker.name+" uses "+skill.name+" on all allies","support");
    finishAction(enemies,updP);
  };

  const doSelf = (attacker,skill,cost)=>{
    let updP=players.map(p=>{
      if(p.id!==attacker.id) return p;
      let u={...p,energy:p.energy-cost};
      if(skill.status) u=applyStatus(u,skill.status,attacker.atk);
      if(skill.cleanse) u={...u,debuffs:[]};
      if(skill.heal){const h=Math.round(attacker.atk*skill.heal+(p.healBonus?Math.round(attacker.atk*p.healBonus):0));u.hp=Math.min(p.maxHp,p.hp+h);}
      return u;
    });
    setPlayers(updP);
    pushLog(attacker.name+" uses "+skill.name,"support");
    finishAction(enemies,updP);
  };

  const doSupport = (attacker,target,skill,cost)=>{
    let updP=players.map(p=>{
      let u={...p};
      if(p.id===attacker.id) u={...u,energy:u.energy-cost};
      if(p.id===target.id){
        if(skill.status) u=applyStatus(u,skill.status,attacker.atk);
        if(skill.cleanse) u={...u,debuffs:[]};
        if(skill.heal){const h=Math.round(attacker.atk*skill.heal+(attacker.healBonus?Math.round(attacker.atk*attacker.healBonus):0));u.hp=Math.min(p.maxHp,p.hp+h);}
      }
      return u;
    });
    setPlayers(updP);
    pushLog(attacker.name+" uses "+skill.name+" on "+target.name,"support");
    finishAction(enemies,updP);
  };

  const handleCell = (row,col)=>{
    if(!isMyTurn||!selAct) return;
    // Local UI validation (both host and client check highlights to avoid bad clicks)
    if(selAct==="move"&&!hlMove.some(c=>c.row===row&&c.col===col)) return;
    if(selAct!=="move"&&!hlAtk.some(c=>c.row===row&&c.col===col)) return;
    if(myRole==="client"){
      if(hostConnRef.current&&hostConnRef.current.open) hostConnRef.current.send({type:"action",kind:"cell",selAct,row,col});
      clearAction();
      return;
    }
    execCellFor(currentPlayer, selAct, row, col);
  };

  // --- Action executors (shared between local host UI and remote client messages) ---
  const execSkipFor = (actor)=>{
    if(!actor||!actor.isAlive) return;
    const ticked=tickUnit(actor);
    const newE=Math.min(ticked.maxEnergy,ticked.energy+20);
    const updP=playersRef.current.map(p=>p.id!==actor.id?p:{...ticked,energy:newE});
    setPlayers(updP);
    pushLog(actor.name+" skips +20E","info");
    clearAction(); advanceTurn(enemiesRef.current,updP);
  };

  const execCellFor = (actor, selActParam, row, col)=>{
    if(!actor||!actor.isAlive||!selActParam) return;
    const posNow=posRef.current, enemiesNow=enemiesRef.current, playersNow=playersRef.current, gsNow=gsRef.current;
    const pPos=posNow.players[actor.id];
    if(!pPos) return;
    if(selActParam==="move"){
      const occ=[...Object.values(posNow.players),...Object.values(posNow.enemies)].filter(o=>!(o.row===pPos.row&&o.col===pPos.col));
      const slow=actor.debuffs.find(d=>d.type==="Slow");
      const mr=Math.max(1,actor.moveRange-(slow?slow.val:0));
      const reachable=getReachable(pPos,mr,gsNow,occ);
      if(!reachable.some(c=>c.row===row&&c.col===col)) return;
      setPositions(prev=>({...prev,players:{...prev.players,[actor.id]:{row,col}}}));
      setHasMoved(true); clearAction();
      pushLog(actor.name+" moves","move");
      return;
    }
    // Attack/skill validation: target must be within range
    const reach=getAttackable(pPos,selActParam==="basic"?2:(actor.skills.find(s=>s.id===selActParam)||{range:3}).range,gsNow);
    if(!reach.some(c=>c.row===row&&c.col===col)&&!(selActParam!=="basic"&&pPos.row===row&&pPos.col===col)) return;
    const enemyAt=enemiesNow.find(e=>{const ep=posNow.enemies[e.id];return ep&&ep.row===row&&ep.col===col&&e.isAlive;});
    const allyAt=playersNow.find(p=>{const pp=posNow.players[p.id];return pp&&pp.row===row&&pp.col===col&&p.id!==actor.id&&p.isAlive;});
    const isSelf=pPos.row===row&&pPos.col===col;
    if(selActParam==="basic"){if(!enemyAt) return; doBasicAtk(actor,enemyAt); return;}
    const skill=actor.skills.find(s=>s.id===selActParam);
    if(!skill) return;
    const cost=Math.max(1,skill.cost-(actor.skillCostReduce||0));
    if(actor.energy<cost){showNotif("Not enough energy!","#e63946");return;}
    if(skill.aoe&&skill.target==="ally"){doAoeBuff(actor,skill,cost);return;}
    if(skill.aoer>0&&skill.target==="enemy"){doRadiusAtk(actor,skill,cost,{row,col});return;}
    if(skill.aoer>0&&skill.dispel){doRadiusDispel(actor,skill,cost,{row,col});return;}
    if(skill.target==="enemy"&&enemyAt){doSkillAtk(actor,enemyAt,skill,cost);return;}
    if(skill.target==="self"&&isSelf){doSelf(actor,skill,cost);return;}
    if(skill.target==="ally"&&allyAt){doSupport(actor,allyAt,skill,cost);return;}
    if(skill.target==="ally"&&isSelf){doSupport(actor,actor,skill,cost);return;}
  };

  const execConsumableFor = (actor, itemId)=>{
    const item = actor.consumables.find(c=>c.id===itemId);
    if(!item) return;
    const updP=playersRef.current.map(p=>{
      if(p.id!==actor.id) return p;
      let u={...p,consumables:p.consumables.filter(c=>c.id!==item.id)};
      if(item.effect.healPct) u.hp=Math.min(p.maxHp,p.hp+Math.round(p.maxHp*item.effect.healPct));
      if(item.effect.healFull) u.hp=p.maxHp;
      if(item.effect.energy) u.energy=Math.min(p.maxEnergy,p.energy+item.effect.energy);
      if(item.effect.cleanse) u.debuffs=[];
      if(item.effect.gold) u.gold=(u.gold||0)+item.effect.gold;
      if(item.effect.atkBuff) u=applyStatus(u,{type:"AttackUp",turns:3,val:40},p.atk);
      if(item.effect.defBuff) u=applyStatus(u,{type:"DefenseUp",turns:2,val:40},p.atk);
      return u;
    });
    setPlayers(updP);
    pushLog(actor.name+" uses "+item.name,"support");
  };

  // Called on host when a client sends an action
  const execRemoteAction = (senderPeerId, msg)=>{
    // Shop buys can happen any time (out of combat). Scope to the sender's own id.
    if(msg.kind==="buy"){
      if(msg.pid!==senderPeerId) return;
      _execBuyFor(senderPeerId, msg.itemId);
      return;
    }
    // Combat actions: sender must be the current acting player
    const q=queueRef.current; const slot=q[qIdxRef.current];
    if(!slot||slot.isEnemy||slot.id!==senderPeerId) return;
    const actor=playersRef.current.find(p=>p.id===senderPeerId);
    if(!actor||!actor.isAlive) return;
    if(msg.kind==="skip") execSkipFor(actor);
    else if(msg.kind==="cell") execCellFor(actor, msg.selAct, msg.row, msg.col);
    else if(msg.kind==="consumable") execConsumableFor(actor, msg.itemId);
  };
  // Keep ref updated so PeerJS onData callback (set up before handler defs) can reach latest version
  execRemoteActionRef.current = execRemoteAction;

  const skipTurn = ()=>{
    if(!isMyTurn) return;
    if(myRole==="client"){
      if(hostConnRef.current&&hostConnRef.current.open) hostConnRef.current.send({type:"action",kind:"skip"});
      clearAction();
      return;
    }
    execSkipFor(currentPlayer);
  };

  const useConsumable = (item)=>{
    if(!isMyTurn) return;
    if(myRole==="client"){
      if(hostConnRef.current&&hostConnRef.current.open) hostConnRef.current.send({type:"action",kind:"consumable",itemId:item.id});
      return;
    }
    execConsumableFor(currentPlayer, item.id);
  };

  const getCellOcc = (row,col)=>{
    const pe=Object.entries(positions.players).find(([,p])=>p.row===row&&p.col===col);
    if(pe){const p=players.find(x=>x.id===pe[0]);return p?{...p,side:"player"}:null;}
    const ee=Object.entries(positions.enemies).find(([,p])=>p.row===row&&p.col===col);
    if(ee){const e=enemies.find(x=>x.id===ee[0]);return e?{...e,side:"enemy"}:null;}
    return null;
  };

  if(screen==="lobby") return <LobbyScreen myRole={myRole} peerId={peerId} joinUrl={joinUrl} players={players} ready={ready} onToggle={toggleReady} onNext={()=>setScreen("worldcreation")} allReady={allReady} connError={connError}/>;
  if(screen==="worldcreation") return <WorldScreen cfg={cfg} onChange={setCfg} onStart={startWorld} players={players}/>;
  if(screen==="tutorial") return <TutorialScreen onFinish={()=>goToShop(players)}/>;
  if(screen==="shop") return <ShopScreen players={players} shopItems={shopItems} shopMsg={shopMsg} fightNum={fightNum} onBuy={buyItem} onEnter={enterCombat} viewId={shopVid} setViewId={setShopVid}/>;
  if(screen==="gameover") return <GameOverScreen fightNum={fightNum} players={players} onRestart={()=>{setPlayers([]);setScreen("lobby");}}/>;

  const currLabel = currentSlot?(currentIsEnemy?(enemies.find(e=>e.id===currentSlot.id)||{}).name:(players.find(p=>p.id===currentSlot.id)||{}).name)||"—":"—";
  const actSkill = selAct&&selAct!=="basic"&&selAct!=="move"&&currentPlayer?currentPlayer.skills.find(s=>s.id===selAct):null;
  const isSupAct = actSkill?actSkill.isSupport:false;

  return (
    <div style={{minHeight:"100vh",background:"#07080f",color:"#dde",fontFamily:"'Courier New',monospace",display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 6px",userSelect:"none"}}>
      <style>{`
        @keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1)}80%{opacity:.8}100%{opacity:0;transform:translateY(-48px) scale(1.15)}}
        @keyframes pulseOp{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes shakeLR{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
        @keyframes glowBdr{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 8px 2px #4cc9f066}}
        .mc:hover{background:rgba(76,201,240,.38)!important;cursor:pointer}
        .ac:hover{background:rgba(224,90,0,.38)!important;cursor:pointer}
        .sc:hover{background:rgba(6,214,160,.38)!important;cursor:pointer}
      `}</style>

      {notif&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:notif.color,color:"#000",padding:"10px 28px",borderRadius:8,fontWeight:"bold",fontSize:17,zIndex:999}}>{notif.msg}</div>}
      {hovSkill&&<div style={{position:"fixed",bottom:14,left:"50%",transform:"translateX(-50%)",background:"#12131e",border:"1px solid "+(hovSkill.color||"#444"),borderRadius:8,padding:"10px 18px",zIndex:998,maxWidth:380,textAlign:"center",pointerEvents:"none"}}>
        <div style={{color:hovSkill.color||"#dde",fontWeight:"bold",fontSize:14,marginBottom:4}}>{hovSkill.name}</div>
        <div style={{color:"#999",fontSize:12}}>{hovSkill.desc}</div>
        {hovSkill.cost&&currentPlayer&&<div style={{color:"#ffd60a",fontSize:11,marginTop:4}}>Energy: {Math.max(1,hovSkill.cost-(currentPlayer.skillCostReduce||0))}</div>}
      </div>}

      <div style={{width:"100%",maxWidth:980}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #1a1a28",paddingBottom:6,marginBottom:8}}>
          <div style={{fontSize:13,color:"#666"}}>Fight {fightNum}{fightNum%5===0&&<span style={{color:"#e63946",marginLeft:6}}>BOSS</span>}</div>
          <div style={{fontSize:14,fontWeight:"bold",color:currentIsEnemy?"#e05a00":"#4cc9f0",animation:enemyActing?"pulseOp 1s infinite":"none"}}>{enemyActing?"AI ":""}{currLabel}'s turn{enemyActing?" — acting...":""}</div>
          <div style={{fontSize:12,color:"#555"}}>Enemies: {enemies.filter(e=>e.isAlive).length}/{enemies.length}</div>
        </div>

        <div style={{display:"flex",gap:8,alignItems:"flex-start",flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:"0 0 auto"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat("+gs+", "+CELL_SIZE+"px)",gap:CELL_GAP}}>
              {Array.from({length:gs},(_,row)=>Array.from({length:gs},(_,col)=>{
                const occ=getCellOcc(row,col);
                const isMove=hlMove.some(c=>c.row===row&&c.col===col);
                const isAtk=hlAtk.some(c=>c.row===row&&c.col===col);
                const isAoePrev=hlAoe.some(c=>c.row===row&&c.col===col);
                const hpPct=occ?occ.hp/occ.maxHp:0;
                const statuses=occ?[...(occ.buffs||[]),...(occ.debuffs||[])]:[];
                const isCurr=occ&&currentSlot&&occ.id===currentSlot.id;
                const cellCls=isMove?"mc":(isAtk&&isSupAct)?"sc":isAtk?"ac":"";
                const aoeHL=isAoePrev&&!isAtk;
                return (
                  <div key={row+"-"+col} className={cellCls}
                    onClick={()=>handleCell(row,col)}
                    onMouseEnter={()=>handleCellHover(row,col)}
                    onMouseLeave={()=>setHlAoe([])}
                    style={{width:CELL_SIZE,height:CELL_SIZE,position:"relative",boxSizing:"border-box",
                      background:isMove?"rgba(76,201,240,.14)":(isAtk&&isSupAct)?"rgba(6,214,160,.14)":isAtk?"rgba(224,90,0,.14)":aoeHL?"rgba(255,200,0,.10)":"#0c0d16",
                      border:isMove?"1px solid #4cc9f060":(isAtk&&isSupAct)?"1px solid #06d6a060":isAtk?"1px solid #e05a0060":aoeHL?"1px solid #ffd60a40":"1px solid #16162a",
                      borderRadius:4,
                      animation:isCurr&&occ&&!occ.isEnemy?"glowBdr 1.5s infinite":"none"}}>
                    {occ&&(
                      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:22,
                        filter:!occ.isAlive?"grayscale(1) opacity(.35)":isCurr?"brightness(1.3)":"none",
                        animation:occ.isAlive&&occ.debuffs&&occ.debuffs.find(d=>d.type==="Stun")?"shakeLR .5s infinite":"none"}}>
                        <div style={{lineHeight:1,marginBottom:1}}>{occ.isHost?"\u{1F451}":occ.isEnemy?occ.emoji:"\u{1F9D9}"}</div>
                        {statuses.length>0&&<div style={{display:"flex",gap:1,flexWrap:"wrap",justifyContent:"center",maxWidth:CELL_SIZE-6}}>
                          {statuses.slice(0,4).map((s,i)=><div key={i} style={{fontSize:8,lineHeight:1}} title={s.type+"("+s.turns+"t)"}>{STATUS_ICONS[s.type]||"?"}</div>)}
                        </div>}
                      </div>
                    )}
                    {occ&&<div style={{position:"absolute",bottom:1,left:2,right:2,height:3,background:"#111",borderRadius:2}}>
                      <div style={{height:3,borderRadius:2,background:hpPct>.6?"#06d6a0":hpPct>.3?"#ffd60a":"#e63946",width:(hpPct*100)+"%"}}/>
                    </div>}
                    {occ&&occ.isEnemy&&<div style={{position:"absolute",top:2,right:2,width:5,height:5,borderRadius:"50%",background:occ.color}}/>}
                  </div>
                );
              }))}
            </div>
            {hitFx.map(fx=>(
              <div key={fx.id} style={{position:"absolute",top:cellPx(fx.row)+2,left:cellPx(fx.col)+2,color:fx.color,fontWeight:"bold",fontSize:12,pointerEvents:"none",zIndex:50,animation:"floatUp .9s forwards",textShadow:"0 1px 4px #000c",whiteSpace:"nowrap"}}>{fx.label}</div>
            ))}
          </div>

          <div style={{flex:1,minWidth:200,display:"flex",flexDirection:"column",gap:8}}>
            {isMyTurn&&currentPlayer&&<div style={{background:"#0d0e1c",border:"1px solid #4cc9f040",borderRadius:8,padding:10}}>
              <div style={{fontSize:12,color:"#4cc9f0",marginBottom:8}}>▶ {currentPlayer.name} — E:{currentPlayer.energy}/{currentPlayer.maxEnergy}</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                <ABtn label={hasMoved?"Moved ✓":"Move"} active={selAct==="move"} color="#4cc9f0" onClick={()=>selectAct("move")} disabled={hasMoved}/>
                <ABtn label="Basic Atk" active={selAct==="basic"} color="#e05a00" onClick={()=>selectAct("basic")}/>
                <ABtn label="Skip Turn +20E" active={false} color="#666" onClick={skipTurn}/>
              </div>
              <div style={{fontSize:11,color:"#555",marginBottom:4}}>SKILLS</div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:currentPlayer.consumables.length>0?8:0}}>
                {currentPlayer.skills.map(sk=>{
                  const cost=Math.max(1,sk.cost-(currentPlayer.skillCostReduce||0));
                  return <ABtn key={sk.id} label={sk.name+" ("+cost+"E)"} active={selAct===sk.id} color={sk.isSupport?"#06d6a0":(sk.color||"#c77dff")} onClick={()=>selectAct(sk.id)} disabled={currentPlayer.energy<cost} onHover={()=>setHovSkill(sk)} onLeave={()=>setHovSkill(null)}/>;
                })}
              </div>
              {currentPlayer.consumables.length>0&&<>
                <div style={{fontSize:11,color:"#555",marginBottom:4,marginTop:4}}>ITEMS</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {currentPlayer.consumables.map((c,i)=><ABtn key={i} label={c.name} active={false} color="#ffd60a" onClick={()=>useConsumable(c)} onHover={()=>setHovSkill(c)} onLeave={()=>setHovSkill(null)}/>)}
                </div>
              </>}
            </div>}
            <div style={{background:"#0d0e1c",border:"1px solid #16162a",borderRadius:8,padding:8}}>
              <div style={{fontSize:10,color:"#444",letterSpacing:2,marginBottom:6}}>HEROES</div>
              {players.map(p=><UnitRow key={p.id} unit={p} isCurrent={currentSlot&&currentSlot.id===p.id&&!currentSlot.isEnemy} isPlayer/>)}
            </div>
            <div style={{background:"#0d0e1c",border:"1px solid #16162a",borderRadius:8,padding:8}}>
              <div style={{fontSize:10,color:"#444",letterSpacing:2,marginBottom:6}}>ENEMIES</div>
              {enemies.map(e=><UnitRow key={e.id} unit={e} isCurrent={currentSlot&&currentSlot.id===e.id&&currentSlot.isEnemy} isPlayer={false}/>)}
            </div>
          </div>
        </div>

        <div ref={logRef} style={{marginTop:8,background:"#070810",border:"1px solid #14142a",borderRadius:6,padding:"6px 10px",height:90,overflowY:"auto",fontSize:11}}>
          {log.map(l=>{
            const color=l.type==="combat"?"#e07030":l.type==="enemy"?"#e63946":l.type==="support"?"#06d6a0":l.type==="move"?"#4cc9f0":l.type==="system"?"#ffd60a":l.type==="debuff"?"#adb5bd":"#555";
            return <div key={l.id} style={{marginBottom:2,color}}>{l.msg}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
