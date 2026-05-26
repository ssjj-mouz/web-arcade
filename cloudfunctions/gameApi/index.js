const cloudbase = require("@cloudbase/node-sdk");

const app = cloudbase.init({ env: process.env.TCB_ENV_ID });
const db = app.database();
const _ = db.command;

const ADMIN_PASSPHRASE = '666';

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function makeToken() {
  return 'tk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

exports.main = async (event) => {
  const { action, ...params } = event;
  try {
    switch (action) {
      case 'auth.verify': return await verifyAuth(params);
      case 'room.create': return await createRoom(params);
      case 'room.join': return await joinRoom(params);
      case 'room.list': return await listRooms();
      case 'room.get': return await getRoom(params);
      case 'room.delete': return await deleteRoom(params);
      case 'state.write': return await writeState(params);
      case 'guest.input': return await writeGuestInput(params);
      case 'guest.useItem': return await writeGuestItem(params);
      case 'chat.send': return await writeChat(params);
      case 'profile.save': return await saveProfile(params);
      case 'profile.list': return await listProfiles();
      case 'profile.delete': return await deleteProfile(params);
      case 'comment.add': return await addComment(params);
      case 'comment.list': return await listComments(params);
      case 'comment.delete': return await deleteComment(params);
      case 'stats.update': return await updateStats(params);
      case 'stats.list': return await listStats();
      default: return { error: 'unknown action' };
    }
  } catch (e) {
    return { error: e.message };
  }
};

async function verifyAuth({ passcode }) {
  if (passcode !== ADMIN_PASSPHRASE) {
    return { error: '暗号错误' };
  }
  return { token: makeToken() };
}

async function createRoom({ hostname, difficulty }) {
  const id = genCode();
  await db.collection('rooms').doc(id).set({
    hostname, difficulty, state: 'waiting', guestname: '',
    createdAt: Date.now()
  });
  await db.collection('game_sessions').doc(id).set({
    state: {},
    stateVer: 0,
    p2Input: { time: 0 },
    p2UseItem: { item: null, time: 0 },
    chatP1: { sender: '', text: '', time: 0 },
    chatP2: { sender: '', text: '', time: 0 }
  });
  return { id };
}

async function joinRoom({ roomId, guestname }) {
  const { data } = await db.collection('rooms').doc(roomId).get();
  const room = data && data[0];
  if (!room || room.state !== 'waiting') {
    return { error: '房间不存在或已满' };
  }
  await db.collection('rooms').doc(roomId).update({
    guestname, state: 'ready'
  });
  return { success: true };
}

async function listRooms() {
  const { data } = await db.collection('rooms')
    .where({ state: 'waiting' })
    .limit(20)
    .get();
  return { rooms: data || [] };
}

async function getRoom({ roomId }) {
  const { data } = await db.collection('rooms').doc(roomId).get();
  return { room: (data && data[0]) || null };
}

async function deleteRoom({ roomId }) {
  await db.collection('rooms').doc(roomId).remove().catch(() => {});
  await db.collection('game_sessions').doc(roomId).remove().catch(() => {});
  return { success: true };
}

async function writeState({ roomId, state, stateVer }) {
  await db.collection('game_sessions').doc(roomId).update({
    state: _.set(state),
    stateVer: _.set(stateVer)
  });
  return { success: true };
}

async function writeGuestInput({ roomId, input }) {
  await db.collection('game_sessions').doc(roomId).update({
    p2Input: _.set({ ...input, time: Date.now() })
  });
  return { success: true };
}

async function writeGuestItem({ roomId, item }) {
  await db.collection('game_sessions').doc(roomId).update({
    p2UseItem: _.set({ item, time: Date.now() })
  });
  return { success: true };
}

async function writeChat({ roomId, field, sender, text, time }) {
  await db.collection('game_sessions').doc(roomId).update({
    [field]: _.set({ sender, text, time })
  });
  return { success: true };
}

// ======================= 用户档案 =======================
async function saveProfile({ username, scores, favorites, theme }) {
  const doc = { scores: scores || {}, favorites: favorites || [], theme: theme || 'neon', updatedAt: Date.now() };
  const { data } = await db.collection('user_data').doc(username).get();
  if (data && data[0]) {
    await db.collection('user_data').doc(username).update(doc);
  } else {
    await db.collection('user_data').doc(username).set({ ...doc, createdAt: Date.now() });
  }
  return { success: true };
}

async function listProfiles() {
  const { data } = await db.collection('user_data').limit(200).get();
  return { profiles: data || [] };
}

async function deleteProfile({ username }) {
  await db.collection('user_data').doc(username).remove().catch(() => {});
  return { success: true };
}

// ======================= 评论 =======================
async function addComment({ gameKey, user, text }) {
  const res = await db.collection('comments').add({ gameKey, user, text, time: Date.now() });
  return { id: res.id };
}

async function listComments({ gameKey }) {
  let query = db.collection('comments');
  if (gameKey) query = query.where({ gameKey });
  const { data } = await query.orderBy('time', 'desc').limit(200).get();
  return { comments: data || [] };
}

async function deleteComment({ commentId }) {
  await db.collection('comments').doc(commentId).remove().catch(() => {});
  return { success: true };
}

// ======================= 游玩统计 =======================
async function updateStats({ gameKey }) {
  const { data } = await db.collection('play_counts').doc(gameKey).get();
  if (data && data[0]) {
    await db.collection('play_counts').doc(gameKey).update({ count: _.inc(1) });
  } else {
    await db.collection('play_counts').doc(gameKey).set({ count: 1 });
  }
  return { success: true };
}

async function listStats() {
  const { data } = await db.collection('play_counts').get();
  return { stats: data || [] };
}
