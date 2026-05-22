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
    data: { hostname, difficulty, state: 'waiting', guestname: '' }
  });
  await db.collection('game_sessions').doc(id).set({
    data: { state: {}, p2Input: null }
  });
  return { id };
}

async function joinRoom({ roomId, guestname }) {
  const { data } = await db.collection('rooms').doc(roomId).get();
  if (!data || data.state !== 'waiting') {
    return { error: '房间不存在或已满' };
  }
  await db.collection('rooms').doc(roomId).update({
    data: { guestname, state: 'ready' }
  });
  return { success: true };
}

async function listRooms() {
  const { data } = await db.collection('rooms')
    .where({ state: 'waiting' })
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();
  return { rooms: data || [] };
}

async function getRoom({ roomId }) {
  const { data } = await db.collection('rooms').doc(roomId).get();
  return { room: data || null };
}

async function deleteRoom({ roomId }) {
  await db.collection('rooms').doc(roomId).remove().catch(() => {});
  await db.collection('game_sessions').doc(roomId).remove().catch(() => {});
  return { success: true };
}

async function pollP2Input({ roomId }) {
  const { data } = await db.collection('game_sessions').doc(roomId).get();
  if (!data) return { input: null };
  const input = data.p2Input;
  if (input) {
    await db.collection('game_sessions').doc(roomId).update({
      data: { p2Input: null }
    });
  }
  return { input: input || null };
}

async function writeState({ roomId, state }) {
  await db.collection('game_sessions').doc(roomId).update({
    data: { state }
  });
  return { success: true };
}

async function writeP2Input({ roomId, input }) {
  await db.collection('game_sessions').doc(roomId).update({
    data: { p2Input: input }
  });
  return { success: true };
}

async function getSession({ roomId }) {
  const { data } = await db.collection('game_sessions').doc(roomId).get();
  if (!data) return { state: null };
  return { state: data.state || null };
}
