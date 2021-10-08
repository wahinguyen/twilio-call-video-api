const twilio = require("twilio");

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const twilioAccountSid = process.env.ACCOUNT_SID;
const twilioApiKey = process.env.API_KEY;
const twilioApiSecret = process.env.API_SECRET;
const authToken = process.env.AUTH_TOKEN;

exports.connectRoom = (req, res, next) => {
  try {
    const { roomId, patientId } = req.body;
    const ROOM = roomId;
    const accessToken = generateAccessToken(patientId);
    const accessTokenString = generateAccessTokenString(accessToken, ROOM);

    res.status(200).json({
      status: "success",
      roomId: ROOM,
      token: accessTokenString,
    });
  } catch (err) {
    next(err);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const { roomId, doctorId } = req.body;
    const ROOM = roomId;

    await createOneRoom(ROOM);
    const accessToken = generateAccessToken(doctorId, ROOM);

    res.status(200).json({
      status: "success",
      roomId: ROOM,
      token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

const createOneRoom = async (roomName) => {
  const client = twilio(twilioAccountSid, authToken);
  let room;
  try {
    // Fetch the room by name from the API.
    room = await client.video.rooms(roomName).fetch();
  } catch (error) {
    // If the room can't be found, create a new room.
    try {
      room = await client.video.rooms.create({
        uniqueName: roomName,
        type: "group",
      });
    } catch (error) {
      // If this fails, I'm not sure what went wrong!
      console.error(error);
      next(error);
    }
  }
};

const generateAccessToken = (identity, roomName) => {
  const accessToken = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
    { identity }
  );
  // Create an access token
  // Start with a grant that gives access to just the named room.
  const grant = new VideoGrant({ room: roomName });

  // Add the grant to the access token.
  accessToken.addGrant(grant);

  return accessToken.toJwt();
};

// const generateAccessTokenString = (accessToken, roomName) => {
//   // Create an access token
//   // Start with a grant that gives access to just the named room.
//   const grant = new VideoGrant({ room: roomName });

//   // Add the grant to the access token.
//   accessToken.addGrant(grant);

//   return accessToken.toJwt();
// };
