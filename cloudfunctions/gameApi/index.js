const cloudbase = require("@cloudbase/node-sdk");

const app = cloudbase.init({ env: process.env.TCB_ENV_ID });
const db = app.database();

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

exports.main = async (event) => {
  const { action, ...params } = event;
  try {
    switch (action) {
      case 'room.create': return await createRoom(params);
      case 'room.join': return await joinRoom(params);
      case 'room.list': return await listRooms();
      case 'room.get': return await getRoom(params);
      case 'room.delete': return await deleteRoom(params);
      case 'session.pollP2': return await pollP2Input(params);
      case 'session.writeState': return await writeState(params);
      case 'session.writeP2': return await writeP2Input(params);
      case 'session.p2UseItem': return await p2UseItem(params);
      case 'session.pollUseItem': return await pollUseItem(params);
      case 'session.get': return await getSession(params);
      default: return { error: 'unknown action' };
    }
  } catch (e) {
    return { error: e.message };
  }
};

async function createRoom({ hostname, difficulty }) {
  const id = genCode();
  await db.collection('rooms').doc(id).set({
    hostname, difficulty, state: 'waiting', guestname: '',
    createdAt: Date.now()
  });
  await db.collection('game_sessions').doc(id).set({
    state: {}, p2Input: null
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

async function pollP2Input({ roomId }) {
  const { data } = await db.collection('game_sessions').doc(roomId).get();
  const session = data && data[0];
  if (!session) return { input: null };
  const raw = session.p2Input;
  let input = null;
  if (raw) {
    try { input = JSON.parse(raw); } catch(e) {}
    await db.collection('game_sessions').doc(roomId).update({
      p2Input: null
    });
  }
  return { input };
}

async function writeState({ roomId, state }) {
  await db.collection('game_sessions').doc(roomId).update({
    state
  });
  return { success: true };
}

async function writeP2Input({ roomId, input }) {
  await db.collection('game_sessions').doc(roomId).update({
    p2Input: JSON.stringify(input)
  });
  return { success: true };
}

async function getSession({ roomId }) {
  const { data } = await db.collection('game_sessions').doc(roomId).get();
  const session = data && data[0];
  if (!session) return { state: null };
  return { state: session.state || null };
}

async function p2UseItem({ roomId, item }) {
  await db.collection('game_sessions').doc(roomId).update({
    p2UseItem: item
  });
  return { success: true };
}

async function pollUseItem({ roomId }) {
  const { data } = await db.collection('game_sessions').doc(roomId).get();
  const session = data && data[0];
  if (!session || !session.p2UseItem) return { item: null };
  const item = session.p2UseItem;
  await db.collection('game_sessions').doc(roomId).update({
    p2UseItem: null
  });
  return { item };
}
