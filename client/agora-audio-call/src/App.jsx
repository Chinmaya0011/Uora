import { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";
import { FaPhoneAlt, FaPhoneSlash, FaUser } from "react-icons/fa";
import "./App.css";

const appId = "b29d0c64188a4498ae36dedad6737555"; // Your Agora App ID
const apiBaseUrl = "https://uora.onrender.com//api"; // Your backend API URL

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

function App() {
    const [channelName, setChannelName] = useState("Chinmaya");
    const [joined, setJoined] = useState(false);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]);

    useEffect(() => {
        client.on("user-published", async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            console.log("New user joined:", user);

            if (mediaType === "audio" && user.audioTrack) {
                console.log("Playing remote user's audio");
                user.audioTrack.play();
                setRemoteUsers((prevUsers) => [...prevUsers, user]);
            }
        });

        client.on("user-left", (user) => {
            console.log("User left:", user);
            setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
        });

        return () => {
            client.removeAllListeners();
        };
    }, []);

    const joinCall = async () => {
        if (!channelName) {
            alert("Please enter a channel name!");
            return;
        }

        try {
            const response = await axios.get(`${apiBaseUrl}/token?channelName=${channelName}`);
            const { token, uid } = response.data;

            await client.join(appId, channelName, token, uid);

            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            setLocalAudioTrack(audioTrack);

            // Publish and play your own audio
            await client.publish([audioTrack]);
            // audioTrack.play();

            setJoined(true);
            console.log(`Joined channel: ${channelName}`);
        } catch (error) {
            console.error("Error joining call:", error);
            alert("Failed to join call. Check console for details.");
        }
    };

    const leaveCall = async () => {
        if (localAudioTrack) {
            localAudioTrack.stop();
            localAudioTrack.close();
        }

        remoteUsers.forEach((user) => {
            user.audioTrack?.stop();
        });

        await client.leave();
        setJoined(false);
        setRemoteUsers([]);
        console.log("Left the channel");
    };

    return (
        <div className="container">
            <h1>Agora Audio Call</h1>
            <div className="input-container">
                <FaUser className="icon" />
                <input
                    type="text"
                    placeholder="Enter Channel Name"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                />
            </div>
            {!joined ? (
                <button className="join-button" onClick={joinCall}>
                    <FaPhoneAlt className="button-icon" /> Join Call
                </button>
            ) : (
                <button className="leave-button" onClick={leaveCall}>
                    <FaPhoneSlash className="button-icon" /> Leave Call
                </button>
            )}
        </div>
    );
}

export default App;
