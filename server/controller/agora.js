const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
require("dotenv").config();

const tokenController = (req, res) => {
    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const channelName = req.query.channelName;

    if (!channelName) {
        return res.status(400).json({ error: "Channel name is required" });
    }

    // Token options
    const uid = 0; // 0 means Agora will assign a unique UID
    const role = RtcRole.PUBLISHER;
    const expireTime = 3600; // Token expiration time (in seconds)

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTimestamp + expireTime;

    // Generate the token
    const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        role,
        privilegeExpireTime
    );

    res.json({ token, uid });
};

const myToken = (req, res) => {
    res.send("Hey Chinmaya");
};

// Proper module export
module.exports = {
    tokenController,
    myToken,
};
