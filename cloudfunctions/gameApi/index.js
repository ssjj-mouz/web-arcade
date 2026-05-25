const cloudbase = require("@cloudbase/node-sdk");

const app = cloudbase.init({ env: process.env.TCB_ENV_ID });
const db = app.database();
const _ = db.command;

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
      case 'state.write': return await writeState(params);
      case 'guest.input': return await writeGuestInput(params);
      case 'guest.useItem': return await writeGuestItem(params);
      case 'chat.send': return await writeChat(params);
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
