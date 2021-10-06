const twilio = require("twilio");

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const twilioAccountSid = process.env.ACCOUNT_SID;
const twilioApiKey = process.env.API_KEY;
const twilioApiSecret = process.env.API_SECRET;
const authToken = process.env.AUTH_TOKEN;

exports.accessToken = (req, res, next) => {
  try {
    const accessToken = new AccessToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret
    );
    res.status(200).json({
      status: "success",
      token: accessToken.toJwt(),
    });
  } catch (err) {
    next(err);
  }
};

exports.createRoom = (req, res, next) => {
  try {
    const { roomId, doctorId } = req.body;
    const ROOM = roomId;

    createOneRoom(ROOM);
    const accessToken = generateAccessToken(doctorId);
    // Create an access token
    // Start with a grant that gives access to just the named room.
    const grant = new VideoGrant({ room: ROOM });
    accessToken.addGrant(grant);
    res.status(200).json({
      status: "success",
      token: accessToken.toJwt(),
    });
  } catch (err) {
    next(err);
  }
};

const generateAccessToken = (id) => {
  const accessToken = new AccessToken(
    twilioAccountSid,
    twilioApiKey,
    twilioApiSecret,
    { id }
  );
  // Add the grant to the access token.
  return accessToken;
};

const createOneRoom = async (roomName) => {
  const client = twilio((twilioAccountSid, authToken));
  let room;
  try {
    // Fetch the room by name from the API.
    room = await client.video.rooms(roomName).fetch();
    console.log(room);
  } catch (error) {
    // If the room can't be found, create a new room.
    try {
      room = await client.video.rooms.create({
        uniqueName: roomName,
        type: "group",
      });
      console.log(room);
    } catch (error) {
      // If this fails, I'm not sure what went wrong!
      console.error(error);
      next(error);
    }
  }
};
