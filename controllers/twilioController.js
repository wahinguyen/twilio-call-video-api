const twilio = require("twilio");
const twilioConfig = require("../utils/twilioConfig");
const { body, validationResult } = require("express-validator");

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

exports.validate = (method) => {
  switch (method) {
    case "createRoom": {
      return [
        body("roomId", "roomId does not exists").exists(),
        body("doctorId", "doctorId does not exists").exists(),
      ];
    }
    case "connectRoom": {
      return [
        body("roomId", "roomId does not exists").exists(),
        body("patientId", "patientId does not exists").exists(),
      ];
    }
  }
};

exports.connectRoom = (req, res, next) => {
  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }

    const { roomId, patientId } = req.body;
    const ROOM = roomId;
    const accessToken = generateAccessToken(patientId, ROOM);

    res.status(200).json({
      status: "success",
      roomId: ROOM,
      token: accessToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.createRoom = async (req, res, next) => {
  try {
    const errors = validationResult(req); // Finds the validation errors in this request and wraps them in an object with handy functions

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }

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
  const client = twilio(twilioConfig.twilioAccountSid, twilioConfig.authToken);
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
    twilioConfig.twilioAccountSid,
    twilioConfig.twilioApiKey,
    twilioConfig.twilioApiSecret,
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
